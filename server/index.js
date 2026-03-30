import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import flashcardsRouter from './routes/flashcards.js';
import authRouter from './routes/auth.js';
import { initDb, pool } from './db.js';

const app = express();
const PORT = 3001;
const PgSession = connectPgSimple(session);

// Necessário para req.secure funcionar corretamente atrás do nginx
app.set('trust proxy', 1);

const ALLOWED_ORIGINS = [
  'https://andregabriel.com.br',
  'https://www.andregabriel.com.br',
  'http://localhost:5173',
];

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ALLOWED_ORIGINS,
  credentials: true,
}));

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: false,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    sameSite: 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: '15mb' }));

app.use('/api', flashcardsRouter);
app.use('/auth', authRouter);

initDb()
  .then(() => app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to initialize database:', err.message); process.exit(1); });
