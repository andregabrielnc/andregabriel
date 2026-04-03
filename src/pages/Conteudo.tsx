import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Box, Button, TextField, Typography, IconButton, Chip, Tooltip,
  Divider, CircularProgress, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, InputAdornment, Collapse,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  useMediaQuery, useTheme, Tabs, Tab, Select, MenuItem,
} from '@mui/material';
import { Add, Remove, Delete, Edit, Save, Close, Search } from '@mui/icons-material';
import { colors } from '../admin/theme/tokens';

const PRIMARY = colors.primary;
const API_BASE = '/api/conteudos';
const FETCH_OPTS: RequestInit = { credentials: 'include' };

// Inline edit field — looks like text, becomes editable on focus (for table editing)
const inlineInput = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: '1px solid #e8eaed' },
    '&.Mui-focused fieldset': { border: `1px solid ${colors.primary}` },
  },
  '& .MuiOutlinedInput-input': { py: 0.5, px: 0.75 },
};

// Compact input — subtle border always visible (for form cards)
const compactInput = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.8125rem',
    '& fieldset': { borderColor: '#e8eaed' },
    '&:hover fieldset': { borderColor: '#dadce0' },
    '&.Mui-focused fieldset': { borderColor: colors.primary },
  },
  '& .MuiOutlinedInput-input': { py: 0.5, px: 0.75 },
};

const uid = () => crypto.randomUUID();

// Mobile-safe touch targets (min 44px)
const touchBtn = { p: { xs: 1, sm: 0.5 }, minWidth: { xs: 36, sm: 'auto' }, minHeight: { xs: 36, sm: 'auto' } };
const touchBtnSm = { p: { xs: 0.75, sm: 0.5 }, minWidth: { xs: 32, sm: 'auto' }, minHeight: { xs: 32, sm: 'auto' } };
const iconSz = { fontSize: { xs: 20, sm: 20 } };
const iconSzSm = { fontSize: { xs: 18, sm: 18 } };

// ═════════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════════

interface SubTopico { id: string; titulo: string }

interface SavedBasico { id: number; numero: number; titulo: string; subtopicos: { numero: string; titulo: string }[] }

interface SavedEspecifico { id: number; numero: number; titulo: string; subtopicos: { numero: string; titulo: string }[] }

interface Banca { id: number; nome: string }
interface Orgao { id: number; nome: string }
interface Cargo { id: number; nome: string; nivel: string }

type Section = 'basicos' | 'especificos' | 'bancas' | 'orgaos' | 'cargos';

const MENU_ITEMS: { key: Section; label: string }[] = [
  { key: 'basicos', label: 'Básicos' },
  { key: 'especificos', label: 'Específicos' },
  { key: 'bancas', label: 'Bancas' },
  { key: 'orgaos', label: 'Órgãos' },
  { key: 'cargos', label: 'Cargos' },
];

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

const ConteudoPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('basicos');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Básicos state ──────────────────────────────────────────────────────────
  // Form card (single topic being created)
  const [newBasicoTitulo, setNewBasicoTitulo] = useState('');
  const [newBasicoSubs, setNewBasicoSubs] = useState<SubTopico[]>([]);
  // Table state
  const [savedBasicos, setSavedBasicos] = useState<SavedBasico[]>([]);
  const [basicosSearch, setBasicosSearch] = useState('');
  const [basicosPage, setBasicosPage] = useState(0);
  const [expandedBasicoIds, setExpandedBasicoIds] = useState<Set<number>>(new Set());
  const [editingBasicoId, setEditingBasicoId] = useState<number | null>(null);
  const [editingBasicoData, setEditingBasicoData] = useState<{ titulo: string; subtopicos: SubTopico[] }>({ titulo: '', subtopicos: [] });
  const [deleteBasicoDialog, setDeleteBasicoDialog] = useState<{ open: boolean; id?: number }>({ open: false });

  // ── Específicos state (same structure as Básicos) ───────────────────────
  const [newEspTitulo, setNewEspTitulo] = useState('');
  const [newEspSubs, setNewEspSubs] = useState<SubTopico[]>([]);
  const [savedEspecificos, setSavedEspecificos] = useState<SavedEspecifico[]>([]);
  const [espSearch, setEspSearch] = useState('');
  const [espPage, setEspPage] = useState(0);
  const [expandedEspIds, setExpandedEspIds] = useState<Set<number>>(new Set());
  const [editingEspId, setEditingEspId] = useState<number | null>(null);
  const [editingEspData, setEditingEspData] = useState<{ titulo: string; subtopicos: SubTopico[] }>({ titulo: '', subtopicos: [] });
  const [deleteEspDialog, setDeleteEspDialog] = useState<{ open: boolean; id?: number }>({ open: false });

  // ── Bancas state ───────────────────────────────────────────────────────────
  const [bancas, setBancas] = useState<Banca[]>([]);
  const [bancaInput, setBancaInput] = useState('');
  const [editingBancaId, setEditingBancaId] = useState<number | null>(null);
  const [editingBancaNome, setEditingBancaNome] = useState('');
  const [bancasSearch, setBancasSearch] = useState('');
  const [bancasPage, setBancasPage] = useState(0);
  const [deleteBancaDialog, setDeleteBancaDialog] = useState<{ open: boolean; id?: number }>({ open: false });

  // ── Órgãos state ──────────────────────────────────────────────────────────
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [orgaoInput, setOrgaoInput] = useState('');
  const [editingOrgaoId, setEditingOrgaoId] = useState<number | null>(null);
  const [editingOrgaoNome, setEditingOrgaoNome] = useState('');
  const [orgaosSearch, setOrgaosSearch] = useState('');
  const [orgaosPage, setOrgaosPage] = useState(0);
  const [deleteOrgaoDialog, setDeleteOrgaoDialog] = useState<{ open: boolean; id?: number }>({ open: false });

  // ── Cargos state ──────────────────────────────────────────────────────────
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoNome, setCargoNome] = useState('');
  const [cargoNivel, setCargoNivel] = useState('');
  const [editingCargoId, setEditingCargoId] = useState<number | null>(null);
  const [editingCargoNome, setEditingCargoNome] = useState('');
  const [editingCargoNivel, setEditingCargoNivel] = useState('');
  const [cargosSearch, setCargosSearch] = useState('');
  const [cargosPage, setCargosPage] = useState(0);
  const [deleteCargoDialog, setDeleteCargoDialog] = useState<{ open: boolean; id?: number }>({ open: false });

  // ═══════════════════════════════════════════════════════════════════════════
  // Fetch
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchBasicos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/basicos`, FETCH_OPTS);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSavedBasicos(data.map((r: any) => ({
        id: r.id,
        numero: r.numero || 0,
        titulo: r.titulo || '',
        subtopicos: r.subtopicos || [],
      })));
    } catch { toast.error('Erro ao carregar conteúdos básicos'); }
  }, []);

  const fetchEspecificos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/especificos`, FETCH_OPTS);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSavedEspecificos(data.map((r: any) => ({
        id: r.id,
        numero: r.numero || 0,
        titulo: r.titulo || '',
        subtopicos: r.subtopicos || [],
      })));
    } catch { toast.error('Erro ao carregar conteúdos específicos'); }
  }, []);

  const fetchBancas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bancas`, FETCH_OPTS);
      if (!res.ok) throw new Error();
      setBancas(await res.json());
    } catch { toast.error('Erro ao carregar bancas'); }
  }, []);

  const fetchOrgaos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orgaos`, FETCH_OPTS);
      if (!res.ok) throw new Error();
      setOrgaos(await res.json());
    } catch { toast.error('Erro ao carregar órgãos'); }
  }, []);

  const fetchCargos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cargos`, FETCH_OPTS);
      if (!res.ok) throw new Error();
      setCargos(await res.json());
    } catch { toast.error('Erro ao carregar cargos'); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBasicos(), fetchEspecificos(), fetchBancas(), fetchOrgaos(), fetchCargos()])
      .finally(() => setLoading(false));
  }, [fetchBasicos, fetchEspecificos, fetchBancas, fetchOrgaos, fetchCargos]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Básicos — form card helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addNewBasicoSub = () =>
    setNewBasicoSubs(prev => [...prev, { id: uid(), titulo: '' }]);

  const updateNewBasicoSub = (subId: string, titulo: string) =>
    setNewBasicoSubs(prev => prev.map(s => s.id === subId ? { ...s, titulo } : s));

  const removeNewBasicoSub = (subId: string) =>
    setNewBasicoSubs(prev => prev.filter(s => s.id !== subId));

  const saveNewBasico = async () => {
    if (!newBasicoTitulo.trim()) { toast.error('Título do tópico é obrigatório'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/basicos`, {
        ...FETCH_OPTS, method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newBasicoTitulo.trim(), subtopicos: newBasicoSubs.map(s => ({ titulo: s.titulo })) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tópico cadastrado!');
      setNewBasicoTitulo('');
      setNewBasicoSubs([]);
      await fetchBasicos();
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Básicos — table helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const startEditBasico = (b: SavedBasico) => {
    setEditingBasicoId(b.id);
    setEditingBasicoData({
      titulo: b.titulo,
      subtopicos: (b.subtopicos || []).map(s => ({ id: uid(), titulo: s.titulo })),
    });
    setExpandedBasicoIds(prev => new Set(prev).add(b.id));
  };

  const addEditBasicoSub = () =>
    setEditingBasicoData(prev => ({ ...prev, subtopicos: [...prev.subtopicos, { id: uid(), titulo: '' }] }));

  const updateEditBasicoSub = (subId: string, titulo: string) =>
    setEditingBasicoData(prev => ({ ...prev, subtopicos: prev.subtopicos.map(s => s.id === subId ? { ...s, titulo } : s) }));

  const removeEditBasicoSub = (subId: string) =>
    setEditingBasicoData(prev => ({ ...prev, subtopicos: prev.subtopicos.filter(s => s.id !== subId) }));

  const saveEditBasico = async (id: number) => {
    if (!editingBasicoData.titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/basicos/${id}`, {
        ...FETCH_OPTS, method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editingBasicoData.titulo.trim(), subtopicos: editingBasicoData.subtopicos.map(s => ({ titulo: s.titulo })) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tópico atualizado!');
      await fetchBasicos();
    } catch { toast.error('Erro ao atualizar'); }
    finally { setSaving(false); }
  };

  const confirmDeleteBasico = async () => {
    if (!deleteBasicoDialog.id) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/basicos/${deleteBasicoDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      toast.success('Tópico excluído!');
      await fetchBasicos();
    } catch { toast.error('Erro ao excluir'); }
    finally { setSaving(false); setDeleteBasicoDialog({ open: false }); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Específicos — form card helpers (mirrors Básicos)
  // ═══════════════════════════════════════════════════════════════════════════

  const addNewEspSub = () =>
    setNewEspSubs(prev => [...prev, { id: uid(), titulo: '' }]);

  const updateNewEspSub = (subId: string, titulo: string) =>
    setNewEspSubs(prev => prev.map(s => s.id === subId ? { ...s, titulo } : s));

  const removeNewEspSub = (subId: string) =>
    setNewEspSubs(prev => prev.filter(s => s.id !== subId));

  const saveNewEspecifico = async () => {
    if (!newEspTitulo.trim()) { toast.error('Título do tópico é obrigatório'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/especificos`, {
        ...FETCH_OPTS, method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newEspTitulo.trim(), subtopicos: newEspSubs.map(s => ({ titulo: s.titulo })) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tópico cadastrado!');
      setNewEspTitulo('');
      setNewEspSubs([]);
      await fetchEspecificos();
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Específicos — table helpers (mirrors Básicos)
  // ═══════════════════════════════════════════════════════════════════════════

  const startEditEsp = (b: SavedEspecifico) => {
    setEditingEspId(b.id);
    setEditingEspData({
      titulo: b.titulo,
      subtopicos: (b.subtopicos || []).map(s => ({ id: uid(), titulo: s.titulo })),
    });
    setExpandedEspIds(prev => new Set(prev).add(b.id));
  };

  const addEditEspSub = () =>
    setEditingEspData(prev => ({ ...prev, subtopicos: [...prev.subtopicos, { id: uid(), titulo: '' }] }));

  const updateEditEspSub = (subId: string, titulo: string) =>
    setEditingEspData(prev => ({ ...prev, subtopicos: prev.subtopicos.map(s => s.id === subId ? { ...s, titulo } : s) }));

  const removeEditEspSub = (subId: string) =>
    setEditingEspData(prev => ({ ...prev, subtopicos: prev.subtopicos.filter(s => s.id !== subId) }));

  const saveEditEsp = async (id: number) => {
    if (!editingEspData.titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/especificos/${id}`, {
        ...FETCH_OPTS, method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editingEspData.titulo.trim(), subtopicos: editingEspData.subtopicos.map(s => ({ titulo: s.titulo })) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tópico atualizado!');
      await fetchEspecificos();
    } catch { toast.error('Erro ao atualizar'); }
    finally { setSaving(false); }
  };

  const confirmDeleteEsp = async () => {
    if (!deleteEspDialog.id) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/especificos/${deleteEspDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      toast.success('Tópico excluído!');
      await fetchEspecificos();
    } catch { toast.error('Erro ao excluir'); }
    finally { setSaving(false); setDeleteEspDialog({ open: false }); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Bancas helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addBanca = async () => {
    if (!bancaInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/bancas`, {
        ...FETCH_OPTS, method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: bancaInput.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Banca adicionada!');
      setBancaInput('');
      await fetchBancas();
    } catch { toast.error('Erro ao adicionar banca'); }
    finally { setSaving(false); }
  };

  const saveBanca = async (id: number) => {
    if (!editingBancaNome.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/bancas/${id}`, {
        ...FETCH_OPTS, method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editingBancaNome.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Banca atualizada!');
      setEditingBancaId(null);
      await fetchBancas();
    } catch { toast.error('Erro ao atualizar banca'); }
    finally { setSaving(false); }
  };

  const confirmDeleteBanca = async () => {
    if (!deleteBancaDialog.id) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/bancas/${deleteBancaDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      toast.success('Banca excluída!');
      await fetchBancas();
    } catch { toast.error('Erro ao excluir banca'); }
    finally { setSaving(false); setDeleteBancaDialog({ open: false }); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Órgãos helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addOrgao = async () => {
    if (!orgaoInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/orgaos`, {
        ...FETCH_OPTS, method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: orgaoInput.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Órgão adicionado!');
      setOrgaoInput('');
      await fetchOrgaos();
    } catch { toast.error('Erro ao adicionar órgão'); }
    finally { setSaving(false); }
  };

  const saveOrgao = async (id: number) => {
    if (!editingOrgaoNome.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/orgaos/${id}`, {
        ...FETCH_OPTS, method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editingOrgaoNome.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Órgão atualizado!');
      setEditingOrgaoId(null);
      await fetchOrgaos();
    } catch { toast.error('Erro ao atualizar órgão'); }
    finally { setSaving(false); }
  };

  const confirmDeleteOrgao = async () => {
    if (!deleteOrgaoDialog.id) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/orgaos/${deleteOrgaoDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      toast.success('Órgão excluído!');
      await fetchOrgaos();
    } catch { toast.error('Erro ao excluir órgão'); }
    finally { setSaving(false); setDeleteOrgaoDialog({ open: false }); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Cargos helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addCargo = async () => {
    if (!cargoNome.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/cargos`, {
        ...FETCH_OPTS, method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: cargoNome.trim(), nivel: cargoNivel }),
      });
      if (!res.ok) throw new Error();
      toast.success('Cargo adicionado!');
      setCargoNome('');
      setCargoNivel('');
      await fetchCargos();
    } catch { toast.error('Erro ao adicionar cargo'); }
    finally { setSaving(false); }
  };

  const saveCargo = async (id: number) => {
    if (!editingCargoNome.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/cargos/${id}`, {
        ...FETCH_OPTS, method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editingCargoNome.trim(), nivel: editingCargoNivel }),
      });
      if (!res.ok) throw new Error();
      toast.success('Cargo atualizado!');
      setEditingCargoId(null);
      await fetchCargos();
    } catch { toast.error('Erro ao atualizar cargo'); }
    finally { setSaving(false); }
  };

  const confirmDeleteCargo = async () => {
    if (!deleteCargoDialog.id) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/cargos/${deleteCargoDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      toast.success('Cargo excluído!');
      await fetchCargos();
    } catch { toast.error('Erro ao excluir cargo'); }
    finally { setSaving(false); setDeleteCargoDialog({ open: false }); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Responsive
  // ═══════════════════════════════════════════════════════════════════════════

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════
  const SIDE_W = 200;

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', overflow: 'hidden' }}>
      {/* Side menu (desktop) / Tabs (mobile) */}
      {isMobile ? (
        <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e8eaed' }}>
          <Tabs
            value={MENU_ITEMS.findIndex(m => m.key === activeSection)}
            onChange={(_, v) => setActiveSection(MENU_ITEMS[v].key)}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ sx: { height: 2 } }}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                textTransform: 'none', fontWeight: 400, fontSize: '0.8125rem',
                minHeight: 36, px: 1.5, minWidth: 'auto',
                color: '#5f6368',
                '&.Mui-selected': { fontWeight: 600, color: PRIMARY },
              },
            }}
          >
            {MENU_ITEMS.map(({ label }) => <Tab key={label} label={label} />)}
          </Tabs>
        </Box>
      ) : (
        <Box sx={{
          width: SIDE_W, minWidth: SIDE_W, bgcolor: '#ffffff',
          display: 'flex', flexDirection: 'column', py: 1,
        }}>
          {MENU_ITEMS.map(({ key, label }) => (
            <Box
              key={key}
              onClick={() => setActiveSection(key)}
              sx={{
                px: 2, py: 1, cursor: 'pointer', fontSize: '0.8125rem',
                fontWeight: activeSection === key ? 600 : 400,
                color: activeSection === key ? PRIMARY : '#5f6368',
                whiteSpace: 'nowrap',
                '&:hover': { color: PRIMARY },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', p: { xs: 2, sm: 3 }, bgcolor: '#ffffff' }}>

        {/* ── Básicos ── */}
        {activeSection === 'basicos' && (
          <Box>
            {/* ── Card de cadastro ── */}
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124', mb: 2 }}>
              Conhecimentos Básicos
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField value={newBasicoTitulo} onChange={(e) => setNewBasicoTitulo(e.target.value)}
                  sx={{ flex: 1, maxWidth: { sm: 340 }, ...compactInput }} size="small" placeholder="Nome do tópico"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !newBasicoSubs.length) saveNewBasico(); }} />
                <IconButton size="small" color="primary" onClick={addNewBasicoSub} sx={touchBtnSm}>
                  <Add sx={iconSz} />
                </IconButton>
              </Box>
              {newBasicoSubs.map((sub, sIdx) => (
                <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: { xs: 1.5, sm: 4 }, mt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.8125rem', minWidth: 28, color: '#5f6368', flexShrink: 0 }}>{sIdx + 1}</Typography>
                  <TextField value={sub.titulo} onChange={(e) => updateNewBasicoSub(sub.id, e.target.value)}
                    sx={{ flex: 1, ...compactInput }} size="small" placeholder="Sub-tópico" />
                  <IconButton size="small" color="error" onClick={() => removeNewBasicoSub(sub.id)} sx={touchBtnSm}>
                    <Delete sx={iconSzSm} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button variant="contained" size="small" onClick={saveNewBasico} disabled={saving || !newBasicoTitulo.trim()}
              sx={{ bgcolor: PRIMARY, textTransform: 'none', mb: 1 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>

            {/* ── Tabela de cadastrados ── */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem' }}>
                {savedBasicos.length} tópico{savedBasicos.length !== 1 ? 's' : ''} cadastrado{savedBasicos.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Buscar por tópico ou subtópico..."
              value={basicosSearch}
              onChange={(e) => { setBasicosSearch(e.target.value); setBasicosPage(0); }}
              sx={{ mb: 2, width: { xs: '100%', sm: 360 }, ...compactInput }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                  endAdornment: basicosSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setBasicosSearch(''); setBasicosPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {(() => {
              const ROWS_PER_PAGE = 10;
              const q = basicosSearch.toLowerCase();
              const filtered = savedBasicos.filter(b =>
                b.titulo.toLowerCase().includes(q) ||
                (b.subtopicos || []).some(s => s.titulo.toLowerCase().includes(q))
              );
              const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
              const paged = filtered.slice(basicosPage * ROWS_PER_PAGE, (basicosPage + 1) * ROWS_PER_PAGE);

              return (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 36, px: 0.5 }} />
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 40, display: { xs: 'none', sm: 'table-cell' } }}>Nº</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Tópico</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 80, sm: 120 } }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paged.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#5f6368' }}>
                            {basicosSearch ? 'Nenhum tópico encontrado.' : 'Nenhum tópico cadastrado.'}
                          </TableCell></TableRow>
                        ) : paged.map((b) => {
                          const isEditing = editingBasicoId === b.id;
                          const isExpanded = expandedBasicoIds.has(b.id);
                          const toggleExpand = () => setExpandedBasicoIds(prev => {
                            const next = new Set(prev);
                            if (next.has(b.id)) next.delete(b.id); else next.add(b.id);
                            return next;
                          });
                          return (
                            <React.Fragment key={b.id}>
                              <TableRow hover>
                                <TableCell sx={{ px: 0.5 }}>
                                  <IconButton size="small" onClick={toggleExpand} sx={touchBtnSm} aria-label={isExpanded ? 'Ocultar' : 'Expandir'}>
                                    {isExpanded ? <Remove sx={iconSz} /> : <Add sx={iconSz} />}
                                  </IconButton>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#202124', display: { xs: 'none', sm: 'table-cell' } }}>
                                  {b.numero}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8125rem' }}>
                                  {isEditing ? (
                                    <TextField value={editingBasicoData.titulo}
                                      onChange={(e) => setEditingBasicoData(prev => ({ ...prev, titulo: e.target.value }))}
                                      size="small" fullWidth autoFocus sx={inlineInput} />
                                  ) : (
                                    <>
                                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, fontWeight: 600, mr: 0.5 }}>{b.numero}.</Box>
                                      {b.titulo}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {isEditing ? (
                                    <>
                                      <IconButton size="small" color="primary" onClick={() => saveEditBasico(b.id)} sx={touchBtn} aria-label="Salvar"><Save sx={iconSz} /></IconButton>
                                      <IconButton size="small" onClick={() => setEditingBasicoId(null)} sx={touchBtn} aria-label="Cancelar"><Close sx={iconSz} /></IconButton>
                                    </>
                                  ) : (
                                    <>
                                      <IconButton size="small" onClick={() => startEditBasico(b)} sx={touchBtn} aria-label="Editar"><Edit sx={iconSz} /></IconButton>
                                      <IconButton size="small" color="error" onClick={() => setDeleteBasicoDialog({ open: true, id: b.id })} sx={touchBtn} aria-label="Excluir"><Delete sx={iconSz} /></IconButton>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={4} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ pl: { xs: 2, sm: 6 }, py: 1 }}>
                                      {isEditing ? (
                                        <>
                                          {editingBasicoData.subtopicos.map((sub, sIdx) => (
                                            <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: 0.25 }}>
                                              <Typography sx={{ fontSize: '0.8125rem', minWidth: 30, color: '#5f6368', flexShrink: 0 }}>{b.numero}.{sIdx + 1}</Typography>
                                              <TextField value={sub.titulo} onChange={(e) => updateEditBasicoSub(sub.id, e.target.value)}
                                                size="small" sx={{ flex: 1, ...inlineInput }} placeholder="Sub-tópico" />
                                              <IconButton size="small" color="primary" onClick={() => saveEditBasico(b.id)} sx={touchBtnSm}>
                                                <Save sx={iconSzSm} />
                                              </IconButton>
                                              <IconButton size="small" color="error" onClick={() => removeEditBasicoSub(sub.id)} sx={touchBtnSm}>
                                                <Delete sx={iconSzSm} />
                                              </IconButton>
                                            </Box>
                                          ))}
                                          <Button size="small" startIcon={<Add />} onClick={addEditBasicoSub}
                                            sx={{ textTransform: 'none', mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
                                            Adicionar Sub-tópico
                                          </Button>
                                        </>
                                      ) : (
                                        (b.subtopicos || []).length > 0 ? (b.subtopicos || []).map((sub, sIdx) => (
                                          <Typography key={sIdx} sx={{ fontSize: '0.8125rem', color: '#5f6368', py: 0.25 }}>
                                            {sub.numero || `${b.numero}.${sIdx + 1}`} — {sub.titulo}
                                          </Typography>
                                        )) : (
                                          <Typography sx={{ fontSize: '0.8125rem', color: '#9aa0a6', py: 0.25 }}>
                                            Nenhum sub-tópico
                                          </Typography>
                                        )
                                      )}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Página {basicosPage + 1} de {totalPages}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" disabled={basicosPage === 0} onClick={() => setBasicosPage(p => p - 1)}>Anterior</Button>
                        <Button size="small" disabled={basicosPage >= totalPages - 1} onClick={() => setBasicosPage(p => p + 1)}>Próxima</Button>
                      </Box>
                    </Box>
                  )}
                </>
              );
            })()}

            {/* Delete confirmation */}
            <Dialog open={deleteBasicoDialog.open} onClose={() => setDeleteBasicoDialog({ open: false })}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent>
                <DialogContentText>Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteBasicoDialog({ open: false })}>Cancelar</Button>
                <Button color="error" onClick={confirmDeleteBasico}>Excluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* ── Específicos ── */}
        {activeSection === 'especificos' && (
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124', mb: 2 }}>
              Conhecimentos Específicos
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField value={newEspTitulo} onChange={(e) => setNewEspTitulo(e.target.value)}
                  sx={{ flex: 1, maxWidth: { sm: 340 }, ...compactInput }} size="small" placeholder="Nome do tópico"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !newEspSubs.length) saveNewEspecifico(); }} />
                <IconButton size="small" color="primary" onClick={addNewEspSub} sx={touchBtnSm}>
                  <Add sx={iconSz} />
                </IconButton>
              </Box>
              {newEspSubs.map((sub, sIdx) => (
                <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: { xs: 1.5, sm: 4 }, mt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.8125rem', minWidth: 28, color: '#5f6368', flexShrink: 0 }}>{sIdx + 1}</Typography>
                  <TextField value={sub.titulo} onChange={(e) => updateNewEspSub(sub.id, e.target.value)}
                    sx={{ flex: 1, ...compactInput }} size="small" placeholder="Sub-tópico" />
                  <IconButton size="small" color="error" onClick={() => removeNewEspSub(sub.id)} sx={touchBtnSm}>
                    <Delete sx={iconSzSm} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button variant="contained" size="small" onClick={saveNewEspecifico} disabled={saving || !newEspTitulo.trim()}
              sx={{ bgcolor: PRIMARY, textTransform: 'none', mb: 1 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>

            <Divider sx={{ my: 2 }} />
            <Typography sx={{ color: '#5f6368', fontSize: '0.8125rem', mb: 2 }}>
              {savedEspecificos.length} tópico{savedEspecificos.length !== 1 ? 's' : ''} cadastrado{savedEspecificos.length !== 1 ? 's' : ''}
            </Typography>

            <TextField
              size="small" placeholder="Buscar por tópico ou subtópico..."
              value={espSearch}
              onChange={(e) => { setEspSearch(e.target.value); setEspPage(0); }}
              sx={{ mb: 2, width: { xs: '100%', sm: 360 }, ...compactInput }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                  endAdornment: espSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setEspSearch(''); setEspPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {(() => {
              const ROWS_PER_PAGE = 10;
              const q = espSearch.toLowerCase();
              const filtered = savedEspecificos.filter(b =>
                b.titulo.toLowerCase().includes(q) ||
                (b.subtopicos || []).some(s => s.titulo.toLowerCase().includes(q))
              );
              const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
              const paged = filtered.slice(espPage * ROWS_PER_PAGE, (espPage + 1) * ROWS_PER_PAGE);

              return (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 36, px: 0.5 }} />
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 40, display: { xs: 'none', sm: 'table-cell' } }}>Nº</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Tópico</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 80, sm: 120 } }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paged.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#5f6368' }}>
                            {espSearch ? 'Nenhum tópico encontrado.' : 'Nenhum tópico cadastrado.'}
                          </TableCell></TableRow>
                        ) : paged.map((b) => {
                          const isEditing = editingEspId === b.id;
                          const isExpanded = expandedEspIds.has(b.id);
                          const toggleExpand = () => setExpandedEspIds(prev => {
                            const next = new Set(prev);
                            if (next.has(b.id)) next.delete(b.id); else next.add(b.id);
                            return next;
                          });
                          return (
                            <React.Fragment key={b.id}>
                              <TableRow hover>
                                <TableCell sx={{ px: 0.5 }}>
                                  <IconButton size="small" onClick={toggleExpand} sx={touchBtnSm} aria-label={isExpanded ? 'Ocultar' : 'Expandir'}>
                                    {isExpanded ? <Remove sx={iconSz} /> : <Add sx={iconSz} />}
                                  </IconButton>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#202124', display: { xs: 'none', sm: 'table-cell' } }}>
                                  {b.numero}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8125rem' }}>
                                  {isEditing ? (
                                    <TextField value={editingEspData.titulo}
                                      onChange={(e) => setEditingEspData(prev => ({ ...prev, titulo: e.target.value }))}
                                      size="small" fullWidth autoFocus sx={inlineInput} />
                                  ) : (
                                    <>
                                      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, fontWeight: 600, mr: 0.5 }}>{b.numero}.</Box>
                                      {b.titulo}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {isEditing ? (
                                    <>
                                      <IconButton size="small" color="primary" onClick={() => saveEditEsp(b.id)} sx={touchBtn} aria-label="Salvar"><Save sx={iconSz} /></IconButton>
                                      <IconButton size="small" onClick={() => setEditingEspId(null)} sx={touchBtn} aria-label="Cancelar"><Close sx={iconSz} /></IconButton>
                                    </>
                                  ) : (
                                    <>
                                      <IconButton size="small" onClick={() => startEditEsp(b)} sx={touchBtn} aria-label="Editar"><Edit sx={iconSz} /></IconButton>
                                      <IconButton size="small" color="error" onClick={() => setDeleteEspDialog({ open: true, id: b.id })} sx={touchBtn} aria-label="Excluir"><Delete sx={iconSz} /></IconButton>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={4} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ pl: { xs: 2, sm: 6 }, py: 1 }}>
                                      {isEditing ? (
                                        <>
                                          {editingEspData.subtopicos.map((sub, sIdx) => (
                                            <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: 0.25 }}>
                                              <Typography sx={{ fontSize: '0.8125rem', minWidth: 30, color: '#5f6368', flexShrink: 0 }}>{b.numero}.{sIdx + 1}</Typography>
                                              <TextField value={sub.titulo} onChange={(e) => updateEditEspSub(sub.id, e.target.value)}
                                                size="small" sx={{ flex: 1, ...inlineInput }} placeholder="Sub-tópico" />
                                              <IconButton size="small" color="primary" onClick={() => saveEditEsp(b.id)} sx={touchBtnSm}>
                                                <Save sx={iconSzSm} />
                                              </IconButton>
                                              <IconButton size="small" color="error" onClick={() => removeEditEspSub(sub.id)} sx={touchBtnSm}>
                                                <Delete sx={iconSzSm} />
                                              </IconButton>
                                            </Box>
                                          ))}
                                          <Button size="small" startIcon={<Add />} onClick={addEditEspSub}
                                            sx={{ textTransform: 'none', mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
                                            Adicionar Sub-tópico
                                          </Button>
                                        </>
                                      ) : (
                                        (b.subtopicos || []).length > 0 ? (b.subtopicos || []).map((sub, sIdx) => (
                                          <Typography key={sIdx} sx={{ fontSize: '0.8125rem', color: '#5f6368', py: 0.25 }}>
                                            {sub.numero || `${b.numero}.${sIdx + 1}`} — {sub.titulo}
                                          </Typography>
                                        )) : (
                                          <Typography sx={{ fontSize: '0.8125rem', color: '#9aa0a6', py: 0.25 }}>
                                            Nenhum sub-tópico
                                          </Typography>
                                        )
                                      )}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Página {espPage + 1} de {totalPages}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" disabled={espPage === 0} onClick={() => setEspPage(p => p - 1)}>Anterior</Button>
                        <Button size="small" disabled={espPage >= totalPages - 1} onClick={() => setEspPage(p => p + 1)}>Próxima</Button>
                      </Box>
                    </Box>
                  )}
                </>
              );
            })()}

            <Dialog open={deleteEspDialog.open} onClose={() => setDeleteEspDialog({ open: false })}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent>
                <DialogContentText>Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteEspDialog({ open: false })}>Cancelar</Button>
                <Button color="error" onClick={confirmDeleteEsp}>Excluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* ── Bancas ── */}
        {activeSection === 'bancas' && (
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124', mb: 2 }}>Bancas</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <TextField value={bancaInput} onChange={(e) => setBancaInput(e.target.value)}
                size="small" placeholder="Nome da banca" sx={{ flex: 1, maxWidth: { sm: 340 }, ...compactInput }}
                onKeyDown={(e) => { if (e.key === 'Enter') addBanca(); }} />
              <Button variant="contained" size="small" onClick={addBanca} disabled={saving || !bancaInput.trim()}
                sx={{ bgcolor: PRIMARY, textTransform: 'none', whiteSpace: 'nowrap' }}>Adicionar</Button>
            </Box>
            <TextField size="small" placeholder="Buscar banca..." value={bancasSearch}
              onChange={(e) => { setBancasSearch(e.target.value); setBancasPage(0); }}
              sx={{ mb: 2, width: { xs: '100%', sm: 360 }, ...compactInput }}
              slotProps={{ input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                endAdornment: bancasSearch ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setBancasSearch(''); setBancasPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton></InputAdornment> : null,
              } }} />
            {(() => {
              const ROWS = 10; const q = bancasSearch.toLowerCase();
              const filtered = bancas.filter(b => b.nome.toLowerCase().includes(q));
              const pages = Math.ceil(filtered.length / ROWS);
              const paged = filtered.slice(bancasPage * ROWS, (bancasPage + 1) * ROWS);
              return (<>
                <TableContainer><Table size="small"><TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 70, sm: 100 } }}>Ações</TableCell>
                </TableRow></TableHead><TableBody>
                  {paged.length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: '#5f6368' }}>
                      {bancasSearch ? 'Nenhuma banca encontrada.' : 'Nenhuma banca cadastrada.'}
                    </TableCell></TableRow>
                  ) : paged.map((b) => (
                    <TableRow key={b.id} hover><TableCell sx={{ fontSize: '0.8125rem' }}>
                      {editingBancaId === b.id ? (
                        <TextField value={editingBancaNome} onChange={(e) => setEditingBancaNome(e.target.value)}
                          size="small" fullWidth autoFocus sx={inlineInput}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveBanca(b.id); if (e.key === 'Escape') setEditingBancaId(null); }} />
                      ) : b.nome}
                    </TableCell><TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {editingBancaId === b.id ? (<>
                        <IconButton size="small" color="primary" onClick={() => saveBanca(b.id)} sx={touchBtn} aria-label="Salvar"><Save sx={iconSz} /></IconButton>
                        <IconButton size="small" onClick={() => setEditingBancaId(null)} sx={touchBtn} aria-label="Cancelar"><Close sx={iconSz} /></IconButton>
                      </>) : (<>
                        <IconButton size="small" onClick={() => { setEditingBancaId(b.id); setEditingBancaNome(b.nome); }} sx={touchBtn} aria-label="Editar"><Edit sx={iconSz} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteBancaDialog({ open: true, id: b.id })} sx={touchBtn} aria-label="Excluir"><Delete sx={iconSz} /></IconButton>
                      </>)}
                    </TableCell></TableRow>
                  ))}
                </TableBody></Table></TableContainer>
                {pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Página {bancasPage + 1} de {pages}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" disabled={bancasPage === 0} onClick={() => setBancasPage(p => p - 1)}>Anterior</Button>
                      <Button size="small" disabled={bancasPage >= pages - 1} onClick={() => setBancasPage(p => p + 1)}>Próxima</Button>
                    </Box>
                  </Box>
                )}
              </>);
            })()}
            <Dialog open={deleteBancaDialog.open} onClose={() => setDeleteBancaDialog({ open: false })}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent><DialogContentText>Tem certeza que deseja excluir esta banca?</DialogContentText></DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteBancaDialog({ open: false })}>Cancelar</Button>
                <Button color="error" onClick={confirmDeleteBanca}>Excluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* ── Órgãos ── */}
        {activeSection === 'orgaos' && (
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124', mb: 2 }}>Órgãos</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <TextField value={orgaoInput} onChange={(e) => setOrgaoInput(e.target.value)}
                size="small" placeholder="Nome do órgão" sx={{ flex: 1, maxWidth: { sm: 340 }, ...compactInput }}
                onKeyDown={(e) => { if (e.key === 'Enter') addOrgao(); }} />
              <Button variant="contained" size="small" onClick={addOrgao} disabled={saving || !orgaoInput.trim()}
                sx={{ bgcolor: PRIMARY, textTransform: 'none', whiteSpace: 'nowrap' }}>Adicionar</Button>
            </Box>
            <TextField size="small" placeholder="Buscar órgão..." value={orgaosSearch}
              onChange={(e) => { setOrgaosSearch(e.target.value); setOrgaosPage(0); }}
              sx={{ mb: 2, width: { xs: '100%', sm: 360 }, ...compactInput }}
              slotProps={{ input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                endAdornment: orgaosSearch ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setOrgaosSearch(''); setOrgaosPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton></InputAdornment> : null,
              } }} />
            {(() => {
              const ROWS = 10; const q = orgaosSearch.toLowerCase();
              const filtered = orgaos.filter(o => o.nome.toLowerCase().includes(q));
              const pages = Math.ceil(filtered.length / ROWS);
              const paged = filtered.slice(orgaosPage * ROWS, (orgaosPage + 1) * ROWS);
              return (<>
                <TableContainer><Table size="small"><TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 70, sm: 100 } }}>Ações</TableCell>
                </TableRow></TableHead><TableBody>
                  {paged.length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: '#5f6368' }}>
                      {orgaosSearch ? 'Nenhum órgão encontrado.' : 'Nenhum órgão cadastrado.'}
                    </TableCell></TableRow>
                  ) : paged.map((o) => (
                    <TableRow key={o.id} hover><TableCell sx={{ fontSize: '0.8125rem' }}>
                      {editingOrgaoId === o.id ? (
                        <TextField value={editingOrgaoNome} onChange={(e) => setEditingOrgaoNome(e.target.value)}
                          size="small" fullWidth autoFocus sx={inlineInput}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveOrgao(o.id); if (e.key === 'Escape') setEditingOrgaoId(null); }} />
                      ) : o.nome}
                    </TableCell><TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {editingOrgaoId === o.id ? (<>
                        <IconButton size="small" color="primary" onClick={() => saveOrgao(o.id)} sx={touchBtn} aria-label="Salvar"><Save sx={iconSz} /></IconButton>
                        <IconButton size="small" onClick={() => setEditingOrgaoId(null)} sx={touchBtn} aria-label="Cancelar"><Close sx={iconSz} /></IconButton>
                      </>) : (<>
                        <IconButton size="small" onClick={() => { setEditingOrgaoId(o.id); setEditingOrgaoNome(o.nome); }} sx={touchBtn} aria-label="Editar"><Edit sx={iconSz} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteOrgaoDialog({ open: true, id: o.id })} sx={touchBtn} aria-label="Excluir"><Delete sx={iconSz} /></IconButton>
                      </>)}
                    </TableCell></TableRow>
                  ))}
                </TableBody></Table></TableContainer>
                {pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Página {orgaosPage + 1} de {pages}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" disabled={orgaosPage === 0} onClick={() => setOrgaosPage(p => p - 1)}>Anterior</Button>
                      <Button size="small" disabled={orgaosPage >= pages - 1} onClick={() => setOrgaosPage(p => p + 1)}>Próxima</Button>
                    </Box>
                  </Box>
                )}
              </>);
            })()}
            <Dialog open={deleteOrgaoDialog.open} onClose={() => setDeleteOrgaoDialog({ open: false })}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent><DialogContentText>Tem certeza que deseja excluir este órgão?</DialogContentText></DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteOrgaoDialog({ open: false })}>Cancelar</Button>
                <Button color="error" onClick={confirmDeleteOrgao}>Excluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* ── Cargos ── */}
        {activeSection === 'cargos' && (
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124', mb: 2 }}>
              Cargos
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <TextField value={cargoNome} onChange={(e) => setCargoNome(e.target.value)}
                size="small" placeholder="Nome do cargo" sx={{ flex: 1, minWidth: 150, ...compactInput }}
                onKeyDown={(e) => { if (e.key === 'Enter') addCargo(); }} />
              <Select value={cargoNivel} onChange={(e) => setCargoNivel(e.target.value)}
                size="small" displayEmpty sx={{
                  width: { xs: '100%', sm: 150 },
                  fontSize: '0.8125rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e8eaed' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#dadce0' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '& .MuiSelect-select': { py: 0.5, px: 0.75 },
                }}>
                <MenuItem value="" disabled><em>Nível</em></MenuItem>
                <MenuItem value="superior">Superior</MenuItem>
                <MenuItem value="médio">Médio</MenuItem>
              </Select>
              <Button variant="contained" size="small" onClick={addCargo} disabled={saving || !cargoNome.trim() || !cargoNivel}
                sx={{ bgcolor: PRIMARY, textTransform: 'none', whiteSpace: 'nowrap' }}>
                Adicionar
              </Button>
            </Box>

            <TextField
              size="small" placeholder="Buscar por cargo ou nível..."
              value={cargosSearch}
              onChange={(e) => { setCargosSearch(e.target.value); setCargosPage(0); }}
              sx={{ mb: 2, width: { xs: '100%', sm: 360 }, ...compactInput }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                  endAdornment: cargosSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setCargosSearch(''); setCargosPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {(() => {
              const ROWS_PER_PAGE = 10;
              const q = cargosSearch.toLowerCase();
              const filtered = cargos.filter(c => c.nome.toLowerCase().includes(q) || c.nivel.toLowerCase().includes(q));
              const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
              const paged = filtered.slice(cargosPage * ROWS_PER_PAGE, (cargosPage + 1) * ROWS_PER_PAGE);

              return (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Cargo</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 80, sm: 120 } }}>Nível</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: { xs: 70, sm: 100 } }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paged.length === 0 ? (
                          <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#5f6368' }}>
                            {cargosSearch ? 'Nenhum cargo encontrado.' : 'Nenhum cargo cadastrado.'}
                          </TableCell></TableRow>
                        ) : paged.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell sx={{ fontSize: '0.8125rem' }}>
                              {editingCargoId === c.id ? (
                                <TextField value={editingCargoNome} onChange={(e) => setEditingCargoNome(e.target.value)}
                                  size="small" fullWidth sx={inlineInput} autoFocus />
                              ) : c.nome}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8125rem' }}>
                              {editingCargoId === c.id ? (
                                <Select value={editingCargoNivel} onChange={(e) => setEditingCargoNivel(e.target.value)}
                                  size="small" fullWidth sx={{
                                    fontSize: '0.8125rem',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid #e8eaed' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: `1px solid ${colors.primary}` },
                                    '& .MuiSelect-select': { py: 0.5, px: 0.75 },
                                  }}>
                                  <MenuItem value="superior">Superior</MenuItem>
                                  <MenuItem value="médio">Médio</MenuItem>
                                </Select>
                              ) : c.nivel || '—'}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {editingCargoId === c.id ? (
                                <>
                                  <IconButton size="small" color="primary" onClick={() => saveCargo(c.id)} sx={touchBtn} aria-label="Salvar"><Save sx={iconSz} /></IconButton>
                                  <IconButton size="small" onClick={() => setEditingCargoId(null)} sx={touchBtn} aria-label="Cancelar"><Close sx={iconSz} /></IconButton>
                                </>
                              ) : (
                                <>
                                  <IconButton size="small" onClick={() => { setEditingCargoId(c.id); setEditingCargoNome(c.nome); setEditingCargoNivel(c.nivel); }} sx={touchBtn} aria-label="Editar"><Edit sx={iconSz} /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => setDeleteCargoDialog({ open: true, id: c.id })} sx={touchBtn} aria-label="Excluir"><Delete sx={iconSz} /></IconButton>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Página {cargosPage + 1} de {totalPages}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" disabled={cargosPage === 0} onClick={() => setCargosPage(p => p - 1)}>Anterior</Button>
                        <Button size="small" disabled={cargosPage >= totalPages - 1} onClick={() => setCargosPage(p => p + 1)}>Próxima</Button>
                      </Box>
                    </Box>
                  )}
                </>
              );
            })()}

            <Dialog open={deleteCargoDialog.open} onClose={() => setDeleteCargoDialog({ open: false })}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent>
                <DialogContentText>Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteCargoDialog({ open: false })}>Cancelar</Button>
                <Button color="error" onClick={confirmDeleteCargo}>Excluir</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ConteudoPage;
