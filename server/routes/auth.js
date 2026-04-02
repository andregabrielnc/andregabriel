import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../db.js';
import { sendVerificationEmail, sendResetEmail, sendWelcomeEmail } from '../mail.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function verifyRecaptcha(token, action) {
  if (!process.env.RECAPTCHA_SECRET) return true; // skip em dev
  if (!token) return false;
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    { method: 'POST' }
  );
  const data = await res.json();
  return data.success && data.score >= 0.5 && data.action === action;
}

function userPayload(u) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    picture: u.picture, role: u.role, needsPhone: !u.phone || u.phone === '',
  };
}

// ── Google Strategy ───────────────────────────────────────────────────────────
// Upsert: cria conta se e-mail não existir, vincula google_id se existir.
// Sempre marca email_verified=TRUE (Google já verificou o email).
// Contas novas ficam com role='temporario' até completar o perfil (telefone).
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    const email    = profile.emails?.[0]?.value;
    const picture  = profile.photos?.[0]?.value;
    const googleId = profile.id;
    const name     = profile.displayName;

    try {
      // Google prova identidade do email — seguro marcar como verificado.
      // Se conta já existe, vincula google_id e promove para 'aluno' se ainda era 'temporario'.
      const { rows } = await pool.query(`
        INSERT INTO users (name, email, google_id, picture, email_verified, role)
        VALUES ($1, $2, $3, $4, TRUE, 'temporario')
        ON CONFLICT (email) DO UPDATE
          SET google_id            = COALESCE(users.google_id, EXCLUDED.google_id),
              picture              = EXCLUDED.picture,
              email_verified       = TRUE,
              verification_token   = NULL,
              verification_expires = NULL,
              role                 = CASE WHEN users.role = 'temporario' THEN 'aluno' ELSE users.role END
        RETURNING *
      `, [name, email, googleId, picture]);

      return done(null, userPayload(rows[0]));
    } catch (e) {
      return done(e);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const router = Router();

// ── CADASTRO MANUAL (email + senha) ──────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { name, email, phone, password, recaptchaToken } = req.body;

  if (!name?.trim() || !email?.trim() || !phone || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const phoneClean = String(phone).replace(/\D/g, '');
  if (phoneClean.length < 10)
    return res.status(400).json({ error: 'Celular inválido (inclua o DDD).' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' });
  if (!/[a-zA-Z]/.test(password))
    return res.status(400).json({ error: 'Senha deve conter ao menos 1 letra.' });
  if (!/[0-9]/.test(password))
    return res.status(400).json({ error: 'Senha deve conter ao menos 1 número.' });

  const ok = await verifyRecaptcha(recaptchaToken, 'register').catch(() => false);
  if (!ok) return res.status(400).json({ error: 'Verificação de segurança falhou. Tente novamente.' });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await pool.query(`
      INSERT INTO users (name, email, phone, password_hash, verification_token, verification_expires)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [name.trim(), email.trim().toLowerCase(), phoneClean, passwordHash, token, expires]);

    try {
      await sendVerificationEmail(email.trim().toLowerCase(), name.trim(), token);
    } catch (mailErr) {
      console.error('Mail error:', mailErr.message);
      return res.json({ ok: true, pending: true, mailError: true });
    }

    res.json({ ok: true, pending: true });
  } catch (e) {
    if (e.code === '23505') {
      // Verifica se o cadastro existe mas não foi verificado
      const { rows } = await pool.query(
        'SELECT email_verified FROM users WHERE email = $1',
        [email.trim().toLowerCase()]
      );
      if (rows[0] && !rows[0].email_verified) {
        return res.status(409).json({ error: 'pending_verification', email: email.trim().toLowerCase() });
      }
      return res.status(400).json({ error: 'E-mail já cadastrado. Tente entrar.' });
    }
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// ── LOGIN COM EMAIL/SENHA ─────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  if (!email?.trim() || !password)
    return res.status(400).json({ error: 'Preencha e-mail e senha.' });

  const ok = await verifyRecaptcha(recaptchaToken, 'login').catch(() => false);
  if (!ok) return res.status(400).json({ error: 'Verificação de segurança falhou. Tente novamente.' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const u = rows[0];

    if (!u) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    if (!u.password_hash) return res.status(401).json({ error: 'Esta conta usa login com Google. Clique em "Entrar com Google".' });
    if (!u.email_verified) return res.status(403).json({ error: 'E-mail ainda não confirmado. Verifique sua caixa de entrada.' });

    const match = await bcrypt.compare(password, u.password_hash);
    if (!match) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const user = userPayload(u);
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao autenticar.' });
      req.session.save(() => res.json({ ok: true, user }));
    });
  } catch {
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// ── GOOGLE OAuth ──────────────────────────────────────────────────────────────

router.get('/google', async (req, res, next) => {
  const token = req.query.recaptcha;
  const ok = await verifyRecaptcha(token, 'login').catch(() => false);
  if (!ok) return res.redirect(`${process.env.FRONTEND_URL}/?login_error=recaptcha`);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const msg = info?.message || 'error';
      return res.redirect(`${base}/?login_error=${msg}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.session.save(() => {
        // Se o telefone está vazio, redireciona para completar perfil
        if (user.needsPhone) {
          return res.redirect(`${base}/?complete_profile=1`);
        }
        res.redirect(`${base}/?aluno=1`);
      });
    });
  })(req, res, next);
});

// ── VERIFICAÇÃO DE E-MAIL ─────────────────────────────────────────────────

router.get('/verify/:token', async (req, res) => {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    // Tenta verificar o email
    const { rows } = await pool.query(
      `UPDATE users
         SET email_verified = TRUE,
             verification_token = NULL,
             verification_expires = NULL,
             role = 'aluno'
       WHERE verification_token = $1 AND verification_expires > NOW() AND email_verified = FALSE
       RETURNING *`,
      [req.params.token]
    );

    if (rows[0]) {
      sendWelcomeEmail(rows[0].email, rows[0].name).catch(() => {});
      return res.redirect(`${base}/?verified=1`);
    }

    // UPDATE não afetou nenhuma linha — verifica o motivo
    const { rows: check } = await pool.query(
      'SELECT email_verified, verification_expires FROM users WHERE verification_token = $1',
      [req.params.token]
    );

    if (!check[0]) {
      // Token não existe — provavelmente já foi verificado e limpo
      // Redireciona para sucesso (idempotente)
      return res.redirect(`${base}/?verified=1`);
    }

    if (check[0].email_verified) {
      // Já verificado — redireciona para sucesso
      return res.redirect(`${base}/?verified=1`);
    }

    // Token existe mas expirou
    return res.redirect(`${base}/?verify_error=expired`);
  } catch {
    res.redirect(`${base}/?verify_error=server`);
  }
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Informe o e-mail.' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const u = rows[0];

    if (!u || u.email_verified || !u.password_hash)
      return res.json({ ok: true }); // não revelar se existe

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await pool.query(
      'UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3',
      [token, expires, u.id]
    );

    await sendVerificationEmail(u.email, u.name, token);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erro ao reenviar. Tente novamente.' });
  }
});

// ── ESQUECEU A SENHA ──────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Informe o e-mail.' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const u = rows[0];

    // Não revelar se o email existe
    if (!u || !u.password_hash) return res.json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [token, expires, u.id]
    );

    await sendResetEmail(u.email, u.name, token);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Dados inválidos.' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' });
  if (!/[a-zA-Z]/.test(password)) return res.status(400).json({ error: 'Senha deve conter ao menos 1 letra.' });
  if (!/[0-9]/.test(password)) return res.status(400).json({ error: 'Senha deve conter ao menos 1 número.' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );
    const u = rows[0];
    if (!u) return res.status(400).json({ error: 'Link expirado ou inválido. Solicite novamente.' });

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL, email_verified = TRUE WHERE id = $2',
      [passwordHash, u.id]
    );

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// ── COMPLETAR PERFIL (telefone obrigatório após Google signup) ────────────────

router.post('/complete-profile', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });

  const { phone } = req.body;
  const phoneClean = String(phone || '').replace(/\D/g, '');
  if (phoneClean.length < 10)
    return res.status(400).json({ error: 'Celular inválido (inclua o DDD).' });

  try {
    const { rows } = await pool.query(
      `UPDATE users SET phone = $1, role = 'aluno' WHERE id = $2 RETURNING *`,
      [phoneClean, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const user = userPayload(rows[0]);
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar sessão.' });
      req.session.save(() => {
        // Envia email de boas-vindas (não bloqueia)
        sendWelcomeEmail(rows[0].email, rows[0].name).catch(() => {});
        res.json({ ok: true, user });
      });
    });
  } catch {
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// ── ME / LOGOUT ───────────────────────────────────────────────────────────────

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    // Recalcula needsPhone a partir da sessão
    const user = { ...req.user, needsPhone: !req.user.phone || req.user.phone === '' };
    res.json({ user });
  } else {
    res.status(401).json({ user: null });
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

export default router;
