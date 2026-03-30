import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

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
    const { rows } = await pool.query(`
      INSERT INTO users (name, email, phone, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name.trim(), email.trim().toLowerCase(), phoneClean, passwordHash]);

    const user = userPayload(rows[0]);
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao autenticar.' });
      req.session.save(() => res.json({ ok: true, user }));
    });
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
