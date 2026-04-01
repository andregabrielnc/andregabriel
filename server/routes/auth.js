import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../db.js';
import { sendVerificationEmail, sendResetEmail } from '../mail.js';

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
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, picture: u.picture, role: u.role };
}

// ── Google Strategy ───────────────────────────────────────────────────────────
// Auto-upsert: cria conta se e-mail não existir, atualiza google_id/picture se existir.
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
      const { rows } = await pool.query(`
        INSERT INTO users (name, email, google_id, picture)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE
          SET google_id = EXCLUDED.google_id,
              picture   = EXCLUDED.picture
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
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

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
    if (e.code === '23505') return res.status(400).json({ error: 'E-mail já cadastrado. Tente entrar.' });
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
  passport.authenticate('google', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const msg = info?.message || 'error';
      return res.redirect(`${process.env.FRONTEND_URL}/?login_error=${msg}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.session.save(() => res.redirect(`${process.env.FRONTEND_URL}/?aluno=1`));
    });
  })(req, res, next);
});

// ── VERIFICAÇÃO DE E-MAIL ─────────────────────────────────────────────────

router.get('/verify/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users
         SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL
       WHERE verification_token = $1 AND verification_expires > NOW() AND email_verified = FALSE
       RETURNING *`,
      [req.params.token]
    );

    if (!rows[0]) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verify_error=expired`);
    }

    const user = userPayload(rows[0]);
    req.logIn(user, (err) => {
      if (err) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verify_error=auth`);
      req.session.save(() =>
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=1`)
      );
    });
  } catch {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verify_error=server`);
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
    const expires = new Date(Date.now() + 30 * 60 * 1000);

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

// ── ME / LOGOUT ───────────────────────────────────────────────────────────────

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
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
