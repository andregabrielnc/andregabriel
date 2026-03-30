import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db.js';

// Estratégia única — comportamento definido por req.session.authAction
passport.use(new GoogleStrategy(
  {
    clientID:          process.env.GOOGLE_CLIENT_ID,
    clientSecret:      process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:       process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  },
  async (req, _accessToken, _refreshToken, profile, done) => {
    const email    = profile.emails?.[0]?.value;
    const picture  = profile.photos?.[0]?.value;
    const googleId = profile.id;
    const action   = req.session.authAction || 'login';

    try {
      if (action === 'register') {
        const pending = req.session.pendingRegistration;
        if (!pending) return done(null, false, { message: 'no_pending' });
        if (email !== pending.email) return done(null, false, { message: 'email_mismatch' });

        const { rows } = await pool.query(`
          INSERT INTO users (name, email, phone, google_id, picture)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO UPDATE
            SET google_id = EXCLUDED.google_id,
                picture   = EXCLUDED.picture
          RETURNING *
        `, [pending.name, email, pending.phone, googleId, picture]);

        delete req.session.pendingRegistration;
        delete req.session.authAction;
        const u = rows[0];
        return done(null, { id: u.id, name: u.name, email: u.email, phone: u.phone, picture });

      } else {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!rows[0]) return done(null, false, { message: 'not_registered' });

        await pool.query('UPDATE users SET google_id=$1, picture=$2 WHERE email=$3', [googleId, picture, email]);
        const u = rows[0];
        return done(null, { id: u.id, name: u.name, email: u.email, phone: u.phone, picture });
      }
    } catch (e) {
      return done(e);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const router = Router();

// ── CADASTRO ──────────────────────────────────────────────────────────────────

router.post('/register', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: 'Preencha todos os campos.' });
  const phoneClean = phone.replace(/\D/g, '');
  if (phoneClean.length < 10) return res.status(400).json({ error: 'Celular inválido.' });

  req.session.authAction = 'register';
  req.session.pendingRegistration = { name: name.trim(), email: email.trim().toLowerCase(), phone: phoneClean };
  req.session.save(() => res.json({ ok: true, redirect: '/auth/google' }));
});

// ── INICIA OAUTH ──────────────────────────────────────────────────────────────

router.get('/google', (req, res, next) => {
  if (!req.session.authAction) req.session.authAction = 'login';
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// ── CALLBACK ──────────────────────────────────────────────────────────────────

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
