import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import flashcardsRouter from './routes/flashcards.js';
import { initDb } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));

app.use('/api', flashcardsRouter);

initDb()
  .then(() => app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to initialize database:', err.message); process.exit(1); });
