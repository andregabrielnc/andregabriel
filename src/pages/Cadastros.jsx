import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, IconButton, Tooltip, Chip, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, InputAdornment, Alert,
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, PersonAdd } from '@mui/icons-material';
import { colors, typography } from '../admin/theme/tokens';
import PhoneInput from '../admin/shared/PhoneInput';

const ROLES = [
  { value: 'administrador', label: 'Administrador', color: 'secondary' },
  { value: 'aluno',         label: 'Aluno',         color: 'primary' },
  { value: 'temporario',    label: 'Temporário',    color: 'warning' },
];

function formatPhone(p) {
  if (!p) return '—';
  return `(${p.slice(0,2)}) ${p.slice(2,7)}-${p.slice(7)}`;
}

// ── User Form Dialog ─────────────────────────────────────────────────────────

function UserFormDialog({ open, title, initial, onSubmit, onClose, loading, error }) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role,  setRole]  = useState('aluno');

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setEmail(initial?.email || '');
      setPhone((initial?.phone || '').replace(/\D/g, ''));
      setRole(initial?.role || 'aluno');
    }
  }, [open, initial]);

  const handle = (e) => { e.preventDefault(); onSubmit({ name, email, phone, role }); };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>{title}</DialogTitle>
      <form onSubmit={handle}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} required fullWidth size="small" />
          <TextField label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth size="small" />
          <PhoneInput value={phone} onChange={setPhone} />
          <FormControl fullWidth size="small">
            <InputLabel>Perfil</InputLabel>
            <Select value={role} label="Perfil" onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
          {error && <Alert severity="error" sx={{ fontSize: typography.sm }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ color: colors.textSecondary }}>Cancelar</Button>
          <Button type="submit" disabled={loading} sx={{ color: colors.primary, fontWeight: 600 }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Cadastros() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);
  const [formError,  setFormError]  = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const searchTimer = useRef(null);

  const load = useCallback(async (s = search, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: s, page: p, limit: LIMIT });
      const res = await fetch(`/api/users?${params}`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [page]);

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); load(v, 1); }, 300);
  };

  const handleCreate = async (body) => {
    setFormError(''); setFormLoading(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || 'Erro ao cadastrar.');
      setShowCreate(false); load(search, 1); setPage(1);
    } catch { setFormError('Erro de conexão.'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (body) => {
    setFormError(''); setFormLoading(true);
    try {
      const res = await fetch(`/api/users/${editing.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || 'Erro ao salvar.');
      setEditing(null); load();
    } catch { setFormError('Erro de conexão.'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/users/${deleting.id}`, { method: 'DELETE', credentials: 'include' });
      setDeleting(null);
      load(search, page > 1 && users.length === 1 ? page - 1 : page);
      if (page > 1 && users.length === 1) setPage(p => p - 1);
    } catch { /* silent */ }
  };

  const COL = { fontWeight: 600, color: colors.textSecondary, fontSize: typography.sm };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>Usuários</Typography>
          <Typography sx={{ mt: 0.5, color: colors.textSecondary, fontSize: typography.sm }}>
            {total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button size="small" startIcon={<PersonAdd />} onClick={() => { setFormError(''); setShowCreate(true); }}
          sx={{ color: colors.primary, fontWeight: 600 }}>
          Novo usuário
        </Button>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Buscar por nome, e-mail ou celular..."
        value={search}
        onChange={e => handleSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 360 } }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: colors.textDim }} /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleSearch('')}><Close sx={{ fontSize: 16 }} /></IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={COL}>Nome</TableCell>
              <TableCell sx={{ ...COL, display: { xs: 'none', md: 'table-cell' } }}>E-mail</TableCell>
              <TableCell sx={{ ...COL, display: { xs: 'none', lg: 'table-cell' } }}>Celular</TableCell>
              <TableCell sx={COL}>Perfil</TableCell>
              <TableCell sx={{ ...COL, width: 90 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: colors.textSecondary }}>Nenhum usuário encontrado.</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={u.picture} alt={u.name} sx={{ width: 28, height: 28, fontSize: 12, bgcolor: colors.primary }} imgProps={{ referrerPolicy: 'no-referrer' }}>
                      {u.name?.[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 150 }}>{u.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: colors.textSecondary }}>{u.email}</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, color: colors.textSecondary }}>{formatPhone(u.phone)}</TableCell>
                <TableCell>
                  <Chip label={(ROLES.find(r => r.value === u.role) || ROLES[2]).label}
                    color={(ROLES.find(r => r.value === u.role) || ROLES[2]).color}
                    size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => { setFormError(''); setEditing(u); }} sx={{ color: colors.primary }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleting(u)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Página {page} de {totalPages}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
            <Button size="small" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</Button>
          </Box>
        </Box>
      )}

      {/* Create Dialog */}
      <UserFormDialog open={showCreate} title="Novo usuário" onSubmit={handleCreate} onClose={() => setShowCreate(false)} loading={formLoading} error={formError} />

      {/* Edit Dialog */}
      <UserFormDialog open={!!editing} title="Editar usuário" initial={editing} onSubmit={handleEdit} onClose={() => setEditing(null)} loading={formLoading} error={formError} />

      {/* Delete Confirmation */}
      <Dialog open={!!deleting} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>Remover usuário</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja remover <strong>{deleting?.name}</strong>?</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleting(null)} sx={{ color: colors.textSecondary }}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>Remover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
