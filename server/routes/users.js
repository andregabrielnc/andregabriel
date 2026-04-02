import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const ROLES = ['administrador', 'aluno', 'temporario'];

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado.' });
  if (req.user.role !== 'administrador') return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  next();
}

// GET /api/users?search=&page=&limit=
router.get('/', requireAdmin, async (req, res) => {
  const search = req.query.search?.trim() || '';
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;

  try {
    const where  = search
      ? `WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`
      : '';
    const params = search ? [`%${search}%`] : [];

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT id, name, email, phone, role, picture, created_at
         FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM users ${where}`, params),
    ]);

    res.json({ users: rows, total: countRows[0].total, page, limit });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users — cadastro manual
router.post('/', requireAdmin, async (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'Perfil inválido.' });
  const phoneClean = (phone || '').replace(/\D/g, '');

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, role, email_verified)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING id, name, email, phone, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), phoneClean, role || 'aluno']
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado.' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/users/:id
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'Perfil inválido.' });
  const phoneClean = (phone || '').replace(/\D/g, '');

  try {
    const { rows } = await pool.query(
      `UPDATE users SET name=$1, email=$2, phone=$3, role=$4
       WHERE id=$5 RETURNING id, name, email, phone, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), phoneClean, role || 'aluno', req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado.' });
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
