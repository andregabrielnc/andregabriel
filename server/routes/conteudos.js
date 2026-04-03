import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

router.use(requireAuth);

// ══════════════════════════════════════════════════════════════════════════════
// Conteúdos Básicos
// ══════════════════════════════════════════════════════════════════════════════

// Number subtopics with parent numero prefix (e.g. 2.1, 2.2)
function numberSubtopicos(numero, subtopicos) {
  return (subtopicos || []).map((s, i) => ({
    ...s,
    numero: `${numero}.${i + 1}`,
  }));
}

router.get('/basicos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM conteudos_basicos ORDER BY numero, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/basicos', async (req, res) => {
  const { titulo, subtopicos } = req.body;
  try {
    // Auto-assign next numero
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(numero), 0) AS max_num FROM conteudos_basicos');
    const nextNum = maxRows[0].max_num + 1;
    const numberedSubs = numberSubtopicos(nextNum, subtopicos);
    const { rows } = await pool.query(
      `INSERT INTO conteudos_basicos (numero, titulo, subtopicos) VALUES ($1, $2, $3) RETURNING *`,
      [nextNum, titulo || '', JSON.stringify(numberedSubs)]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/basicos/:id', async (req, res) => {
  const { titulo, subtopicos } = req.body;
  try {
    // Keep existing numero, renumber subtopics
    const { rows: existing } = await pool.query('SELECT numero FROM conteudos_basicos WHERE id=$1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Não encontrado.' });
    const num = existing[0].numero;
    const numberedSubs = numberSubtopicos(num, subtopicos);
    const { rows } = await pool.query(
      `UPDATE conteudos_basicos SET titulo=$1, subtopicos=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [titulo || '', JSON.stringify(numberedSubs), req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/basicos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM conteudos_basicos WHERE id=$1', [req.params.id]);
    // Renumber remaining items sequentially
    const { rows } = await pool.query('SELECT id, subtopicos FROM conteudos_basicos ORDER BY numero, id');
    for (let i = 0; i < rows.length; i++) {
      const num = i + 1;
      const numberedSubs = numberSubtopicos(num, rows[i].subtopicos);
      await pool.query('UPDATE conteudos_basicos SET numero=$1, subtopicos=$2 WHERE id=$3', [num, JSON.stringify(numberedSubs), rows[i].id]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// Conteúdos Específicos
// ══════════════════════════════════════════════════════════════════════════════

router.get('/especificos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM conteudos_especificos ORDER BY numero, id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/especificos', async (req, res) => {
  const { titulo, subtopicos } = req.body;
  try {
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(numero), 0) AS max_num FROM conteudos_especificos');
    const nextNum = maxRows[0].max_num + 1;
    const numberedSubs = numberSubtopicos(nextNum, subtopicos);
    const { rows } = await pool.query(
      `INSERT INTO conteudos_especificos (numero, titulo, subtopicos) VALUES ($1, $2, $3) RETURNING *`,
      [nextNum, titulo || '', JSON.stringify(numberedSubs)]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/especificos/:id', async (req, res) => {
  const { titulo, subtopicos } = req.body;
  try {
    const { rows: existing } = await pool.query('SELECT numero FROM conteudos_especificos WHERE id=$1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Não encontrado.' });
    const num = existing[0].numero;
    const numberedSubs = numberSubtopicos(num, subtopicos);
    const { rows } = await pool.query(
      `UPDATE conteudos_especificos SET titulo=$1, subtopicos=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [titulo || '', JSON.stringify(numberedSubs), req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/especificos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM conteudos_especificos WHERE id=$1', [req.params.id]);
    const { rows } = await pool.query('SELECT id, subtopicos FROM conteudos_especificos ORDER BY numero, id');
    for (let i = 0; i < rows.length; i++) {
      const num = i + 1;
      const numberedSubs = numberSubtopicos(num, rows[i].subtopicos);
      await pool.query('UPDATE conteudos_especificos SET numero=$1, subtopicos=$2 WHERE id=$3', [num, JSON.stringify(numberedSubs), rows[i].id]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// Bancas
// ══════════════════════════════════════════════════════════════════════════════

router.get('/bancas', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bancas ORDER BY nome');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bancas', async (req, res) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('INSERT INTO bancas (nome) VALUES ($1) RETURNING *', [nome.trim()]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/bancas/:id', async (req, res) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('UPDATE bancas SET nome=$1 WHERE id=$2 RETURNING *', [nome.trim(), req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/bancas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bancas WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// Órgãos
// ══════════════════════════════════════════════════════════════════════════════

router.get('/orgaos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orgaos ORDER BY nome');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/orgaos', async (req, res) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('INSERT INTO orgaos (nome) VALUES ($1) RETURNING *', [nome.trim()]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/orgaos/:id', async (req, res) => {
  const { nome } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('UPDATE orgaos SET nome=$1 WHERE id=$2 RETURNING *', [nome.trim(), req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/orgaos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orgaos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// Cargos
// ══════════════════════════════════════════════════════════════════════════════

router.get('/cargos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cargos ORDER BY nome');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/cargos', async (req, res) => {
  const { nome, nivel } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('INSERT INTO cargos (nome, nivel) VALUES ($1, $2) RETURNING *', [nome.trim(), nivel || '']);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/cargos/:id', async (req, res) => {
  const { nome, nivel } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const { rows } = await pool.query('UPDATE cargos SET nome=$1, nivel=$2 WHERE id=$3 RETURNING *', [nome.trim(), nivel || '', req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cargos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cargos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
