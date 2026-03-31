import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

router.use(requireAuth);

// GET /api/editais
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, numero, orgao, data_publicacao, data_inscricao_inicio, data_inscricao_fim, validade, created_at FROM editais ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/editais/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM editais WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Edital não encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/editais
router.post('/', async (req, res) => {
  const { numero, orgao, data_publicacao, data_inscricao_inicio, data_inscricao_fim,
          link_banca, validade, data_impugnacao_inicio, data_impugnacao_fim,
          vagas, anexos, conteudos_basicos, grupos_especificos } = req.body;
  if (!numero || !orgao) return res.status(400).json({ error: 'Número e Órgão são obrigatórios.' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO editais (numero, orgao, data_publicacao, data_inscricao_inicio, data_inscricao_fim,
        link_banca, validade, data_impugnacao_inicio, data_impugnacao_fim,
        vagas, anexos, conteudos_basicos, grupos_especificos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [numero, orgao, data_publicacao || null, data_inscricao_inicio || null, data_inscricao_fim || null,
       link_banca || '', validade || '', data_impugnacao_inicio || null, data_impugnacao_fim || null,
       JSON.stringify(vagas || []), JSON.stringify(anexos || []),
       JSON.stringify(conteudos_basicos || []), JSON.stringify(grupos_especificos || [])]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/editais/:id
router.put('/:id', async (req, res) => {
  const { numero, orgao, data_publicacao, data_inscricao_inicio, data_inscricao_fim,
          link_banca, validade, data_impugnacao_inicio, data_impugnacao_fim,
          vagas, anexos, conteudos_basicos, grupos_especificos } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE editais SET numero=$1, orgao=$2, data_publicacao=$3, data_inscricao_inicio=$4,
        data_inscricao_fim=$5, link_banca=$6, validade=$7, data_impugnacao_inicio=$8,
        data_impugnacao_fim=$9, vagas=$10, anexos=$11, conteudos_basicos=$12,
        grupos_especificos=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [numero, orgao, data_publicacao || null, data_inscricao_inicio || null, data_inscricao_fim || null,
       link_banca || '', validade || '', data_impugnacao_inicio || null, data_impugnacao_fim || null,
       JSON.stringify(vagas || []), JSON.stringify(anexos || []),
       JSON.stringify(conteudos_basicos || []), JSON.stringify(grupos_especificos || []),
       req.params.id]
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
