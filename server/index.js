import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import flashcardsRouter from './routes/flashcards.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '15mb' }));

app.use('/api', flashcardsRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
