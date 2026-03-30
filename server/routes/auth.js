import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  (_accessToken, _refreshToken, profile, done) => {
    done(null, {
      id:      profile.id,
      name:    profile.displayName,
      email:   profile.emails?.[0]?.value,
      picture: profile.photos?.[0]?.value,
    });
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const router = Router();

// Inicia o fluxo OAuth com o Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redireciona aqui após o usuário autorizar
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Garante que a sessão seja persistida no banco ANTES do redirect
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/?aluno=1`);
    });
  }
);

// Verifica se há sessão ativa
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout
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
