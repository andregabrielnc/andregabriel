import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db.js';

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    const email   = profile.emails?.[0]?.value;
    const picture = profile.photos?.[0]?.value;
    const googleId = profile.id;

    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];

      if (!user) {
        // Email não cadastrado — rejeita login
        return done(null, false, { message: 'not_registered' });
      }

      // Atualiza google_id e picture se ainda não tiver
      await pool.query(
        'UPDATE users SET google_id=$1, picture=$2 WHERE email=$3',
        [googleId, picture, email]
      );

      return done(null, { id: user.id, name: user.name, email: user.email, phone: user.phone, picture });
    } catch (e) {
      return done(e);
    }
  }
));

// Estratégia separada para o fluxo de CADASTRO (sem checar se já existe)
passport.use('google-register', new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.GOOGLE_CALLBACK_URL}?action=register`,
    passReqToCallback: true,
  },
  async (req, _accessToken, _refreshToken, profile, done) => {
    const email    = profile.emails?.[0]?.value;
    const picture  = profile.photos?.[0]?.value;
    const googleId = profile.id;
    const pending  = req.session.pendingRegistration;

    if (!pending) return done(null, false, { message: 'no_pending' });

    // Email do Google deve bater com o digitado no formulário
    if (email !== pending.email) {
      return done(null, false, { message: 'email_mismatch' });
    }

    try {
      // Upsert: se já existe apenas atualiza google_id/picture
      const { rows } = await pool.query(`
        INSERT INTO users (name, email, phone, google_id, picture)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE
          SET google_id = EXCLUDED.google_id,
              picture   = EXCLUDED.picture
        RETURNING *
      `, [pending.name, email, pending.phone, googleId, picture]);

      delete req.session.pendingRegistration;
      return done(null, { id: rows[0].id, name: rows[0].name, email: rows[0].email, phone: rows[0].phone, picture });
    } catch (e) {
      return done(e);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const router = Router();

// ── CADASTRO ──────────────────────────────────────────────────────────────────

// POST /auth/register — salva dados na sessão e inicia OAuth de cadastro
router.post('/register', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: 'Preencha todos os campos.' });

  const phoneClean = phone.replace(/\D/g, '');
  if (phoneClean.length < 10) return res.status(400).json({ error: 'Celular inválido.' });

  req.session.pendingRegistration = { name: name.trim(), email: email.trim().toLowerCase(), phone: phoneClean };
  req.session.save(() => res.json({ ok: true, redirect: '/auth/google/register' }));
});

// GET /auth/google/register — inicia OAuth com estratégia de cadastro
router.get('/google/register',
  passport.authenticate('google-register', { scope: ['profile', 'email'] })
);

// ── LOGIN ─────────────────────────────────────────────────────────────────────

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ── CALLBACK COMPARTILHADO ────────────────────────────────────────────────────

router.get('/google/callback', (req, res, next) => {
  const action = req.query.action;
  const strategy = action === 'register' ? 'google-register' : 'google';

  passport.authenticate(strategy, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const msg = info?.message || 'error';
      if (msg === 'not_registered') return res.redirect(`${process.env.FRONTEND_URL}/?login_error=not_registered`);
      if (msg === 'email_mismatch') return res.redirect(`${process.env.FRONTEND_URL}/?login_error=email_mismatch`);
      return res.redirect(`${process.env.FRONTEND_URL}/?login_error=error`);
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
