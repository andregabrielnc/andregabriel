import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import flashcardsRouter from './routes/flashcards.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import editaisRouter from './routes/editais.js';
import conteudosRouter from './routes/conteudos.js';
import { initDb, pool } from './db.js';

const app = express();
const PORT = 3001;
const PgSession = connectPgSimple(session);

// ── Trust proxy (behind nginx / Traefik) ────────────────────────────────────
app.set('trust proxy', 1);

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // SPA handles its own CSP
  crossOriginEmbedderPolicy: false,
}));

// ── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://andregabriel.com.br',
  'https://www.andregabriel.com.br',
  'http://localhost:5173',
];

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ALLOWED_ORIGINS,
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'development' ? 100 : 30,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  message: { error: 'Limite de requisições excedido.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: false,
    pruneSessionInterval: 60 * 15, // clean expired sessions every 15 min
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    sameSite: 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  pool.query('SELECT 1').then(() => res.json({ ok: true })).catch(() => res.status(503).json({ ok: false }));
});

// ── Routes ───────────────────────────────────────────────────────────────────
// Polling de verificação usa apiLimiter (120/min) para não bloquear o check a cada 3s
app.post('/auth/check-verification', apiLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.json({ verified: false });
  try {
    const { rows } = await pool.query(
      'SELECT email_verified FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    res.json({ verified: rows[0]?.email_verified === true });
  } catch {
    res.json({ verified: false });
  }
});
app.use('/auth', authLimiter, authRouter);
app.use('/api/users', apiLimiter, usersRouter);
app.use('/api/editais', apiLimiter, editaisRouter);
app.use('/api/conteudos', apiLimiter, conteudosRouter);
app.use('/api', apiLimiter, flashcardsRouter);

// ── Start ────────────────────────────────────────────────────────────────────
initDb()
  .then(() => app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to initialize database:', err.message); process.exit(1); });
