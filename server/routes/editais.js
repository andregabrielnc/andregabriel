import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

router.use(requireAuth);

const FIELDS = `numero, orgao, banca, link_banca, status, data_publicacao,
  data_inscricao_inicio, data_inscricao_fim, data_prova, validade,
  data_impugnacao_inicio, data_impugnacao_fim, taxa_inscricao, observacoes,
  cotas, cargos, anexos, conteudos_basicos, conteudos_especificos`;

function extract(body) {
  const { numero, orgao, banca, link_banca, status, data_publicacao,
          data_inscricao_inicio, data_inscricao_fim, data_prova, validade,
          data_impugnacao_inicio, data_impugnacao_fim, taxa_inscricao, observacoes,
          cotas, cargos, anexos, conteudos_basicos, conteudos_especificos } = body;
  return [
    numero, orgao, banca || '', link_banca || '', status || 'publicado',
    data_publicacao || null, data_inscricao_inicio || null, data_inscricao_fim || null,
    data_prova || null, validade || '', data_impugnacao_inicio || null, data_impugnacao_fim || null,
    taxa_inscricao || '', observacoes || '',
    JSON.stringify(cotas || []), JSON.stringify(cargos || []), JSON.stringify(anexos || []),
    JSON.stringify(conteudos_basicos || []), JSON.stringify(conteudos_especificos || []),
  ];
}

// GET /api/editais — lista resumida
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, numero, orgao, banca, status, data_publicacao,
              data_inscricao_inicio, data_inscricao_fim, data_prova, created_at
       FROM editais ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/editais/:id — edital completo
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM editais WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Edital não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/editais
router.post('/', async (req, res) => {
  if (!req.body.numero || !req.body.orgao)
    return res.status(400).json({ error: 'Número e Órgão são obrigatórios.' });
  try {
    const vals = extract(req.body);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await pool.query(
      `INSERT INTO editais (${FIELDS}) VALUES (${placeholders}) RETURNING *`, vals
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/editais/:id
router.put('/:id', async (req, res) => {
  try {
    const vals = extract(req.body);
    const sets = FIELDS.split(',').map((f, i) => `${f.trim()}=$${i + 1}`).join(',');
    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE editais SET ${sets}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals
    );
    if (!rows[0]) return res.status(404).json({ error: 'Edital não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/editais/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM editais WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
