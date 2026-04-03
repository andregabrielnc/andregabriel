import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Box, Button, TextField, Select, MenuItem, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, DialogContentText,
  Paper, Typography, IconButton, Grid, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Chip, Tooltip,
  FormControl, InputLabel, CircularProgress,
  Switch, FormControlLabel, Autocomplete,
  Accordion, AccordionSummary, AccordionDetails, InputAdornment,
} from '@mui/material';
import {
  Add, Delete, Edit, Save, Close, Upload, Description,
  ArrowBack, ExpandMore, Visibility, Search,
} from '@mui/icons-material';
// DataGrid removed — using simple MUI Table for consistency

// ═════════════════════════════════════════════════════════════════════════════
// Imports from admin modules
// ═════════════════════════════════════════════════════════════════════════════

import { colors } from '../admin/theme/tokens';
import { API_URL, FETCH_OPTS, STATUS_LABELS, STATUS_COLORS } from '../admin/editais/editaisConstants';
import { uid, normalizeDate, formatDateBR, emptyEdital, emptyCargo, emptyAnexo, emptyDisciplina, calcDistribuicao } from '../admin/editais/editaisHelpers';
import type { CotaEdital, Cargo, Anexo, TopicoBasico, Disciplina, Edital, EditalFormFields } from '../admin/editais/editaisTypes';

const PRIMARY = colors.primary;

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

const EditaisPage: React.FC = () => {
  // ── List view state ────────────────────────────────────────────────────────
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Edital | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [listPage, setListPage] = useState(0);

  // ── Form tab & dynamic arrays ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [sideOpen, setSideOpen] = useState(true);
  const [cargoSearch, setCargoSearch] = useState('');
  const [cargoPage, setCargoPage] = useState(0);
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [cotas, setCotas] = useState<CotaEdital[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [conteudosBasicos, setConteudosBasicos] = useState<TopicoBasico[]>([]);
  const [conteudosEspecificos, setConteudosEspecificos] = useState<Disciplina[]>([]);

  // ── Anexo modal ────────────────────────────────────────────────────────────
  const [anexoModal, setAnexoModal] = useState(false);
  const [anexoEdit, setAnexoEdit] = useState<Anexo | null>(null);
  const [anexoForm, setAnexoForm] = useState<Anexo>(emptyAnexo());

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewAnexo, setPreviewAnexo] = useState<Anexo | null>(null);

  // ── Delete confirmation dialogs ────────────────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleteCargoDialog, setDeleteCargoDialog] = useState<{ open: boolean; cargoId?: string }>({ open: false });
  const [deleteAnexoDialog, setDeleteAnexoDialog] = useState<{ open: boolean; anexoId?: string }>({ open: false });
  const [deleteDisciplinaDialog, setDeleteDisciplinaDialog] = useState<{ open: boolean; discId?: string }>({ open: false });

  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<EditalFormFields>({
    defaultValues: emptyEdital(),
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchEditais = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, FETCH_OPTS);
      if (!res.ok) throw new Error('Erro ao carregar editais');
      const data = await res.json();
      setEditais(data);
    } catch {
      toast.error('Erro ao carregar editais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEditais(); }, [fetchEditais]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Open Form (New / Edit)
  // ═══════════════════════════════════════════════════════════════════════════

  const openNew = () => {
    setIsNew(true);
    setEditing({} as Edital);
    reset(emptyEdital());
    setTodosCargosBasicos(true);
    setCotas([]);
    setCargos([]);
    setAnexos([]);
    setConteudosBasicos([]);
    setConteudosEspecificos([]);
    setActiveTab(0);
  };

  const openEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, FETCH_OPTS);
      if (!res.ok) throw new Error('Erro ao carregar edital');
      const data: Edital = await res.json();
      setIsNew(false);
      setEditing(data);
      reset({
        numero: data.numero || '',
        orgao: data.orgao || '',
        banca: data.banca || '',
        link_banca: data.link_banca || '',
        regime: data.regime || 'CLT',
        status: data.status || 'publicado',
        data_publicacao: normalizeDate(data.data_publicacao),
        data_inscricao_inicio: normalizeDate(data.data_inscricao_inicio),
        data_inscricao_fim: normalizeDate(data.data_inscricao_fim),
        data_prova: normalizeDate(data.data_prova),
        validade: data.validade || '',
        data_impugnacao_inicio: normalizeDate(data.data_impugnacao_inicio),
        data_impugnacao_fim: normalizeDate(data.data_impugnacao_fim),
        taxa_inscricao: data.taxa_inscricao || '',
        observacoes: data.observacoes || '',
      });
      setTodosCargosBasicos(data.todos_cargos_basicos !== false);
      setCotas(data.cotas || []);
      setCargos(data.cargos || []);
      setAnexos(data.anexos || []);
      setConteudosBasicos((data.conteudos_basicos || []).map((t: any) => ({ ...t, subtopicos: t.subtopicos || [] })));
      setConteudosEspecificos((data.conteudos_especificos || []).map((d: any) => ({
        ...d,
        cargos_aplicaveis: Array.isArray(d.cargos_aplicaveis) ? d.cargos_aplicaveis : [],
      })));
      setActiveTab(0);
    } catch {
      toast.error('Erro ao carregar edital');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Save (POST / PUT)
  // ═══════════════════════════════════════════════════════════════════════════

  const onSubmit = async (formData: EditalFormFields) => {
    setSaving(true);
    const payload: Edital = {
      ...formData,
      todos_cargos_basicos: todosCargosBasicos,
      cotas,
      cargos,
      anexos,
      conteudos_basicos: conteudosBasicos,
      conteudos_especificos: conteudosEspecificos,
    };

    try {
      const url = isNew ? API_URL : `${API_URL}/${editing!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        ...FETCH_OPTS,
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      const saved = await res.json();
      toast.success('Edital salvo com sucesso!');
      // Stay on the form — update editing with saved data (keeps ID for new editals)
      if (isNew) {
        setIsNew(false);
        setEditing(saved);
      }
      fetchEditais();
    } catch {
      toast.error('Erro ao salvar edital');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Delete Edital
  // ═══════════════════════════════════════════════════════════════════════════

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const res = await fetch(`${API_URL}/${deleteDialog.id}`, { ...FETCH_OPTS, method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      toast.success('Edital excluído com sucesso!');
      fetchEditais();
    } catch {
      toast.error('Erro ao excluir edital');
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Cargo Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addCargo = () => setCargos(prev => [...prev, emptyCargo()]);

  const updateCargo = (id: string, field: keyof Cargo, value: unknown) => {
    setCargos(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCargo = () => {
    if (deleteCargoDialog.cargoId) {
      setCargos(prev => prev.filter(c => c.id !== deleteCargoDialog.cargoId));
    }
    setDeleteCargoDialog({ open: false });
  };

  // ── Cotas do Edital (nível do edital, aplicadas a todos os cargos) ────────
  const addCotaEdital = () =>
    setCotas(prev => [...prev, { id: uid(), tipo: 'negro', porcentagem: 20 }]);

  const updateCotaEdital = (id: string, field: keyof CotaEdital, value: unknown) =>
    setCotas(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const removeCotaEdital = (id: string) =>
    setCotas(prev => prev.filter(c => c.id !== id));

  // ═══════════════════════════════════════════════════════════════════════════
  // Conteúdos Básicos Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const [todosCargosBasicos, setTodosCargosBasicos] = useState(true);

  const addConteudoBasico = () =>
    setConteudosBasicos(prev => [...prev, { id: uid(), titulo: '', subtopicos: [] }]);

  const updateConteudoBasico = (id: string, titulo: string) =>
    setConteudosBasicos(prev => prev.map(c => c.id === id ? { ...c, titulo } : c));

  const removeConteudoBasico = (id: string) =>
    setConteudosBasicos(prev => prev.filter(c => c.id !== id));

  const addSubTopicoBasico = (topicoId: string) =>
    setConteudosBasicos(prev => prev.map(t =>
      t.id === topicoId ? { ...t, subtopicos: [...(t.subtopicos || []), { id: uid(), titulo: '' }] } : t
    ));

  const updateSubTopicoBasico = (topicoId: string, subId: string, titulo: string) =>
    setConteudosBasicos(prev => prev.map(t =>
      t.id === topicoId
        ? { ...t, subtopicos: (t.subtopicos || []).map(s => s.id === subId ? { ...s, titulo } : s) }
        : t
    ));

  const removeSubTopicoBasico = (topicoId: string, subId: string) =>
    setConteudosBasicos(prev => prev.map(t =>
      t.id === topicoId ? { ...t, subtopicos: (t.subtopicos || []).filter(s => s.id !== subId) } : t
    ));

  // ═══════════════════════════════════════════════════════════════════════════
  // Disciplina / Tópico / SubTópico Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addDisciplina = () =>
    setConteudosEspecificos(prev => [...prev, emptyDisciplina()]);

  const updateDisciplina = (id: string, field: keyof Disciplina, value: unknown) =>
    setConteudosEspecificos(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));

  const confirmRemoveDisciplina = () => {
    if (deleteDisciplinaDialog.discId) {
      setConteudosEspecificos(prev => prev.filter(d => d.id !== deleteDisciplinaDialog.discId));
    }
    setDeleteDisciplinaDialog({ open: false });
  };

  const addTopico = (discId: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? { ...d, topicos: [...d.topicos, { id: uid(), titulo: '', subtopicos: [] }] }
        : d
    ));

  const updateTopico = (discId: string, topId: string, titulo: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? { ...d, topicos: d.topicos.map(t => t.id === topId ? { ...t, titulo } : t) }
        : d
    ));

  const removeTopico = (discId: string, topId: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? { ...d, topicos: d.topicos.filter(t => t.id !== topId) }
        : d
    ));

  const addSubTopico = (discId: string, topId: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? {
            ...d,
            topicos: d.topicos.map(t =>
              t.id === topId
                ? { ...t, subtopicos: [...t.subtopicos, { id: uid(), titulo: '' }] }
                : t
            ),
          }
        : d
    ));

  const updateSubTopico = (discId: string, topId: string, subId: string, titulo: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? {
            ...d,
            topicos: d.topicos.map(t =>
              t.id === topId
                ? { ...t, subtopicos: t.subtopicos.map(s => s.id === subId ? { ...s, titulo } : s) }
                : t
            ),
          }
        : d
    ));

  const removeSubTopico = (discId: string, topId: string, subId: string) =>
    setConteudosEspecificos(prev => prev.map(d =>
      d.id === discId
        ? {
            ...d,
            topicos: d.topicos.map(t =>
              t.id === topId
                ? { ...t, subtopicos: t.subtopicos.filter(s => s.id !== subId) }
                : t
            ),
          }
        : d
    ));

  // ═══════════════════════════════════════════════════════════════════════════
  // Anexo Modal Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const openAnexoModal = (a?: Anexo) => {
    if (a) {
      setAnexoEdit(a);
      setAnexoForm({ ...a });
    } else {
      setAnexoEdit(null);
      setAnexoForm(emptyAnexo());
    }
    setAnexoModal(true);
  };

  const saveAnexo = () => {
    if (anexoEdit) {
      setAnexos(prev => prev.map(a => a.id === anexoEdit.id ? { ...anexoForm } : a));
    } else {
      setAnexos(prev => [...prev, { ...anexoForm }]);
    }
    setAnexoModal(false);
  };

  const confirmDeleteAnexo = () => {
    if (deleteAnexoDialog.anexoId) {
      setAnexos(prev => prev.filter(a => a.id !== deleteAnexoDialog.anexoId));
    }
    setDeleteAnexoDialog({ open: false });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  if (!editing) {
    const ROWS_PER_PAGE = 10;
    const q = listSearch.toLowerCase();
    const filtered = editais.filter(e =>
      e.numero.toLowerCase().includes(q) ||
      e.orgao.toLowerCase().includes(q) ||
      e.banca.toLowerCase().includes(q) ||
      (STATUS_LABELS[e.status] || '').toLowerCase().includes(q)
    );
    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    const paged = filtered.slice(listPage * ROWS_PER_PAGE, (listPage + 1) * ROWS_PER_PAGE);

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>Editais</Typography>
            <Typography sx={{ mt: 0.5, color: '#5f6368', fontSize: '0.8125rem' }}>
              {filtered.length} edital{filtered.length !== 1 ? 'is' : ''}{listSearch ? ' encontrado' + (filtered.length !== 1 ? 's' : '') : ' cadastrado' + (filtered.length !== 1 ? 's' : '')}
            </Typography>
          </Box>
          <Button size="small" startIcon={<Add />} onClick={openNew} sx={{ color: PRIMARY, fontWeight: 600 }}>
            Novo Edital
          </Button>
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Buscar por número, órgão, banca ou status..."
          value={listSearch}
          onChange={(e) => { setListSearch(e.target.value); setListPage(0); }}
          sx={{ mb: 2, width: { xs: '100%', sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
              endAdornment: listSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setListSearch(''); setListPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
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
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Número</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Órgão</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Banca</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Publicação</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Inscrições</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 90 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: '#5f6368' }}>
                  {listSearch ? 'Nenhum edital encontrado.' : 'Nenhum edital cadastrado.'}
                </TableCell></TableRow>
              ) : paged.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.numero}</TableCell>
                  <TableCell>{e.orgao}</TableCell>
                  <TableCell>{e.banca || '—'}</TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABELS[e.status] || e.status} color={STATUS_COLORS[e.status] || 'default'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatDateBR(e.data_publicacao) || '—'}</TableCell>
                  <TableCell>
                    {formatDateBR(e.data_inscricao_inicio) || formatDateBR(e.data_inscricao_fim)
                      ? `${formatDateBR(e.data_inscricao_inicio) || '–'} a ${formatDateBR(e.data_inscricao_fim) || '–'}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(e.id!)} sx={{ color: PRIMARY }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: e.id })}>
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
            <Typography variant="caption" color="text.secondary">
              Página {listPage + 1} de {totalPages}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button size="small" disabled={listPage === 0} onClick={() => setListPage(p => p - 1)}>Anterior</Button>
              <Button size="small" disabled={listPage >= totalPages - 1} onClick={() => setListPage(p => p + 1)}>Próxima</Button>
            </Box>
          </Box>
        )}

        {/* Delete Edital Confirmation */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>Tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button>
            <Button color="error" onClick={confirmDelete}>Excluir</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — FORM VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  const SIDE_W = 200;

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* Sidemenu vertical (below navbar) */}
        <Box
          sx={{
            width: sideOpen ? SIDE_W : 0,
            minWidth: sideOpen ? SIDE_W : 0,
            overflow: 'hidden',
            borderRight: 'none',
            borderColor: 'divider',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease',
            py: 1,
          }}
        >
          {/* Início — volta à lista */}
          <Box
            onClick={() => setEditing(null)}
            sx={{
              px: 2, py: 1, cursor: 'pointer', fontSize: '0.8125rem',
              fontWeight: 400, color: '#5f6368', whiteSpace: 'nowrap',
              '&:hover': { color: PRIMARY },
            }}
          >
            Início
          </Box>

          {/* Seções do formulário */}
          {[
            { label: 'Informações do Edital', idx: 0 },
            { label: 'Cargos e Vagas', idx: 1 },
            { label: 'Conteúdo Programático', idx: 2 },
            { label: 'Anexos', idx: 3 },
          ].map((item) => (
            <Box
              key={item.idx}
              onClick={() => setActiveTab(item.idx)}
              sx={{
                px: 2, py: 1, cursor: 'pointer', fontSize: '0.8125rem',
                fontWeight: activeTab === item.idx ? 600 : 400,
                color: activeTab === item.idx ? PRIMARY : '#5f6368',
                whiteSpace: 'nowrap',
                '&:hover': { color: PRIMARY },
              }}
            >
              {item.label}
            </Box>
          ))}
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', p: 3, bgcolor: '#ffffff' }}>

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 1 — Informações do Edital
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Box sx={{ p: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>Informações do Edital</Typography>
            <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.8125rem', minWidth: 0 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
          <Grid container spacing={2}>
            {/* Número do Edital */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="numero"
                control={control}
                rules={{ required: 'Campo obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número do Edital"
                    fullWidth
                    required
                    error={!!errors.numero}
                    helperText={errors.numero?.message}
                  />
                )}
              />
            </Grid>

            {/* Órgão/Entidade */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="orgao"
                control={control}
                rules={{ required: 'Campo obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Órgão/Entidade"
                    fullWidth
                    required
                    error={!!errors.orgao}
                    helperText={errors.orgao?.message}
                  />
                )}
              />
            </Grid>

            {/* Banca Organizadora */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="banca"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Banca Organizadora" fullWidth />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="publicado">Publicado</MenuItem>
                      <MenuItem value="inscricoes_abertas">Inscrições Abertas</MenuItem>
                      <MenuItem value="em_andamento">Em Andamento</MenuItem>
                      <MenuItem value="encerrado">Encerrado</MenuItem>
                      <MenuItem value="homologado">Homologado</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Data de Publicação */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_publicacao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Publicação"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Data da Prova */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_prova"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data da Prova"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Inscrições — Início */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_inscricao_inicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Inscrições — Início"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Inscrições — Fim */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_inscricao_fim"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Inscrições — Fim"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Impugnação — Início */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_impugnacao_inicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Impugnação — Início"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Impugnação — Fim */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="data_impugnacao_fim"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Impugnação — Fim"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>

            {/* Taxa de Inscrição */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="taxa_inscricao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Taxa de Inscrição"
                    fullWidth
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (!digits) { field.onChange(''); return; }
                      const num = (parseInt(digits, 10) / 100).toFixed(2);
                      field.onChange(`R$ ${num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`);
                    }}
                  />
                )}
              />
            </Grid>

            {/* Validade do Concurso */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Validade do Concurso (anos)"
                    fullWidth
                    placeholder="Ex: 2"
                    type="text"
                    inputProps={{ inputMode: 'numeric' }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                      field.onChange(digits);
                    }}
                  />
                )}
              />
            </Grid>

            {/* Link da Banca */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="link_banca"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Link da Banca" type="url" fullWidth />
                )}
              />
            </Grid>

            {/* Regime */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="regime"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Regime</InputLabel>
                    <Select {...field} label="Regime">
                      <MenuItem value="CLT">CLT</MenuItem>
                      <MenuItem value="Estatutário">Estatutário</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Observações Gerais (full width, multiline) */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Observações Gerais" fullWidth multiline rows={3} />
                )}
              />
            </Grid>
          </Grid>

          {/* ── Cotas do Edital ── */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Cotas de Vagas</Typography>
              <Typography variant="body2" color="text.secondary">
                Defina os percentuais de reserva. Serão aplicados automaticamente a todos os cargos.
              </Typography>
            </Box>
            <Button size="small" startIcon={<Add />} onClick={addCotaEdital}>
              Adicionar Cota
            </Button>
          </Box>

          {cotas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nenhuma cota definida. Todas as vagas serão de ampla concorrência.
            </Typography>
          ) : (
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Percentual (%)</strong></TableCell>
                  <TableCell width={60}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cotas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                          value={c.tipo}
                          onChange={(e) => updateCotaEdital(c.id, 'tipo', e.target.value)}
                        >
                          <MenuItem value="negro">Negro</MenuItem>
                          <MenuItem value="pcd">PCD (Pessoa com Deficiência)</MenuItem>
                          <MenuItem value="indigena">Indígena</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={c.porcentagem}
                        onChange={(e) => updateCotaEdital(c.id, 'porcentagem', Number(e.target.value))}
                        sx={{ width: 100 }}
                        slotProps={{ htmlInput: { min: 0, max: 100 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeCotaEdital(c.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 2 — Cargos e Vagas
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (() => {
        const ROWS_PER_PAGE = 5;
        const editCargo = editingCargoId ? cargos.find(c => c.id === editingCargoId) : null;
        const filtered = cargos.filter(c =>
          c.nome.toLowerCase().includes(cargoSearch.toLowerCase()) ||
          c.nivel.toLowerCase().includes(cargoSearch.toLowerCase()) ||
          c.requisitos.toLowerCase().includes(cargoSearch.toLowerCase())
        );
        const paged = filtered.slice(cargoPage * ROWS_PER_PAGE, (cargoPage + 1) * ROWS_PER_PAGE);
        const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

        const nivelLabel = (n: string) => n === 'superior' ? 'Superior' : n === 'medio' ? 'Médio' : n === 'tecnico' ? 'Técnico' : 'Fundamental';

        return (
          <Box>
            {/* ── Accordion: Novo Cargo ── */}
            <Accordion
              expanded={editingCargoId === '__new__'}
              onChange={(_, expanded) => {
                if (expanded) { addCargo(); setEditingCargoId('__new__'); }
                else setEditingCargoId(null);
              }}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add sx={{ fontSize: 18, color: PRIMARY }} />
                  <Typography fontWeight={600} fontSize="0.9rem">Novo Cargo</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {cargos.length > 0 && (() => {
                  const cargo = cargos[cargos.length - 1];
                  return (
                    <>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <TextField label="Nome do Cargo" value={cargo.nome} onChange={(e) => updateCargo(cargo.id, 'nome', e.target.value)} fullWidth size="small" />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Nível</InputLabel>
                            <Select value={cargo.nivel} label="Nível" onChange={(e) => updateCargo(cargo.id, 'nivel', e.target.value)}>
                              <MenuItem value="superior">Superior</MenuItem>
                              <MenuItem value="medio">Médio</MenuItem>
                              <MenuItem value="tecnico">Técnico</MenuItem>
                              <MenuItem value="fundamental">Fundamental</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <TextField label="Vagas" type="number" value={cargo.vagas_total} onChange={(e) => updateCargo(cargo.id, 'vagas_total', Math.max(0, Number(e.target.value)))} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <TextField label="Remuneração" value={cargo.remuneracao} onChange={(e) => updateCargo(cargo.id, 'remuneracao', e.target.value)} fullWidth size="small" placeholder="R$ 5.420,00" />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <TextField label="Carga Horária" value={cargo.carga_horaria} onChange={(e) => updateCargo(cargo.id, 'carga_horaria', e.target.value)} fullWidth size="small" placeholder="40h semanais" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 9 }}>
                          <TextField label="Requisitos" value={cargo.requisitos} onChange={(e) => updateCargo(cargo.id, 'requisitos', e.target.value)} fullWidth size="small" placeholder="Graduação em Enfermagem + COREN ativo" />
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                        <Button size="small" onClick={() => setEditingCargoId(null)} sx={{ color: '#5f6368' }}>Cancelar</Button>
                        <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600 }}>
                          {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </Box>
                    </>
                  );
                })()}
              </AccordionDetails>
            </Accordion>

            {/* ── Tabela de cargos com edição inline ── */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField size="small" placeholder="Buscar cargo..." value={cargoSearch}
                  onChange={(e) => { setCargoSearch(e.target.value); setCargoPage(0); }}
                  sx={{ width: { xs: '100%', sm: 280 } }}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#9aa0a6' }} /></InputAdornment>,
                      endAdornment: cargoSearch ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => { setCargoSearch(''); setCargoPage(0); }}><Close sx={{ fontSize: 16 }} /></IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {filtered.length} cargo{filtered.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Cargo</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Nível</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Vagas</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Remuneração</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>CH</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem' }}>Requisitos</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#5f6368', fontSize: '0.8125rem', width: 90 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.length === 0 ? (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>Nenhum cargo cadastrado.</TableCell></TableRow>
                    ) : paged.map((cargo) => {
                      const isEditing = editingCargoId === cargo.id;
                      return (
                        <TableRow key={cargo.id} hover sx={{ bgcolor: isEditing ? '#e8f0fe' : 'inherit' }}>
                          <TableCell>{isEditing
                            ? <TextField size="small" value={cargo.nome} onChange={(e) => updateCargo(cargo.id, 'nome', e.target.value)} variant="standard" fullWidth />
                            : (cargo.nome || '—')}</TableCell>
                          <TableCell>{isEditing
                            ? <Select size="small" value={cargo.nivel} onChange={(e) => updateCargo(cargo.id, 'nivel', e.target.value)} variant="standard" sx={{ minWidth: 90 }}>
                                <MenuItem value="superior">Superior</MenuItem><MenuItem value="medio">Médio</MenuItem>
                                <MenuItem value="tecnico">Técnico</MenuItem><MenuItem value="fundamental">Fundamental</MenuItem>
                              </Select>
                            : <Chip size="small" label={nivelLabel(cargo.nivel)} color={cargo.nivel === 'superior' ? 'primary' : cargo.nivel === 'medio' ? 'info' : cargo.nivel === 'tecnico' ? 'secondary' : 'default'} variant="outlined" />
                          }</TableCell>
                          <TableCell>{isEditing
                            ? <TextField size="small" type="number" value={cargo.vagas_total} onChange={(e) => updateCargo(cargo.id, 'vagas_total', Math.max(0, Number(e.target.value)))} variant="standard" sx={{ width: 60 }} slotProps={{ htmlInput: { min: 0 } }} />
                            : cargo.vagas_total}</TableCell>
                          <TableCell>{isEditing
                            ? <TextField size="small" value={cargo.remuneracao} onChange={(e) => updateCargo(cargo.id, 'remuneracao', e.target.value)} variant="standard" sx={{ width: 110 }} />
                            : (cargo.remuneracao || '—')}</TableCell>
                          <TableCell>{isEditing
                            ? <TextField size="small" value={cargo.carga_horaria} onChange={(e) => updateCargo(cargo.id, 'carga_horaria', e.target.value)} variant="standard" sx={{ width: 80 }} />
                            : (cargo.carga_horaria || '—')}</TableCell>
                          <TableCell>{isEditing
                            ? <TextField size="small" value={cargo.requisitos} onChange={(e) => updateCargo(cargo.id, 'requisitos', e.target.value)} variant="standard" fullWidth />
                            : <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{cargo.requisitos || '—'}</Typography>}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {isEditing ? (
                                <Tooltip title="Salvar">
                                  <IconButton size="small" onClick={() => { handleSubmit(onSubmit)(); setEditingCargoId(null); }} sx={{ color: PRIMARY }}>
                                    <Save fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Editar">
                                  <IconButton size="small" onClick={() => setEditingCargoId(cargo.id)} sx={{ color: PRIMARY }}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Excluir">
                                <IconButton size="small" color="error" onClick={() => setDeleteCargoDialog({ open: true, cargoId: cargo.id })}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Página {cargoPage + 1} de {totalPages}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" disabled={cargoPage === 0} onClick={() => setCargoPage(p => p - 1)} sx={{ minWidth: 32, textTransform: 'none' }}>Anterior</Button>
                    <Button size="small" disabled={cargoPage >= totalPages - 1} onClick={() => setCargoPage(p => p + 1)} sx={{ minWidth: 32, textTransform: 'none' }}>Próxima</Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 3 — Conteúdo Programático
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Box sx={{ p: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>Conteúdo Programático</Typography>
            <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.8125rem', minWidth: 0 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
          {/* ── Conhecimentos Básicos ── */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Conhecimentos Básicos</Typography>
              <FormControlLabel
                control={<Switch size="small" checked={todosCargosBasicos} onChange={(e) => setTodosCargosBasicos(e.target.checked)} color="primary" />}
                label={<Typography variant="caption" color="text.secondary" noWrap>Aplica-se a todos os cargos</Typography>}
                sx={{ mr: 0 }}
              />
            </Box>

            {conteudosBasicos.map((item, index) => (
              <Box key={item.id} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={index + 1} size="small" sx={{ minWidth: 32 }} />
                  <TextField value={item.titulo} onChange={(e) => updateConteudoBasico(item.id, e.target.value)} sx={{ flex: 1 }} size="small" placeholder="Tópico" />
                  <Tooltip title="Adicionar Sub-tópico"><IconButton size="small" color="primary" onClick={() => addSubTopicoBasico(item.id)}><Add fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Excluir Tópico"><IconButton size="small" color="error" onClick={() => removeConteudoBasico(item.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                </Box>
                {(item.subtopicos || []).map((sub, sIdx) => (
                  <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5, mt: 0.5 }}>
                    <Chip label={`${index + 1}.${sIdx + 1}`} size="small" variant="outlined" sx={{ minWidth: 40 }} />
                    <TextField value={sub.titulo} onChange={(e) => updateSubTopicoBasico(item.id, sub.id, e.target.value)} sx={{ flex: 1 }} size="small" placeholder="Sub-tópico" />
                    <Tooltip title="Excluir Sub-tópico"><IconButton size="small" color="error" onClick={() => removeSubTopicoBasico(item.id, sub.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                ))}
              </Box>
            ))}

            {conteudosBasicos.length === 0 && (
              <Typography variant="body2" color="text.secondary">Nenhum tópico adicionado.</Typography>
            )}

            {/* Footer: Adicionar + Salvar */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button size="small" startIcon={<Add />} onClick={addConteudoBasico} sx={{ textTransform: 'none' }}>
                Adicionar Tópico
              </Button>
              <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600 }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Box>

          {/* ── Conhecimentos Específicos ── */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Conhecimentos Específicos</Typography>

          {conteudosEspecificos.map((disc) => (
            <Box key={disc.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e8eaed' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {disc.nome || 'Disciplina'}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Nome da Disciplina" value={disc.nome} onChange={(e) => updateDisciplina(disc.id, 'nome', e.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple options={cargos} getOptionLabel={(opt) => opt.nome || ''}
                    value={cargos.filter(c => (disc.cargos_aplicaveis || []).includes(c.id))}
                    onChange={(_e, selected) => updateDisciplina(disc.id, 'cargos_aplicaveis', selected.map(c => c.id))}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    renderInput={(params) => <TextField {...params} label="Cargos Aplicáveis" placeholder="Pesquisar cargo..." />}
                    renderTags={(value, getTagProps) => value.map((opt, index) => { const { key, ...rest } = getTagProps({ index }); return <Chip key={key} label={opt.nome} size="small" {...rest} />; })}
                    noOptionsText="Cadastre cargos na aba Cargos e Vagas"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Tópicos</Typography>

              {disc.topicos.map((topico, tIdx) => (
                <Box key={topico.id} sx={{ mb: 2, pl: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={tIdx + 1} size="small" sx={{ minWidth: 32 }} />
                    <TextField value={topico.titulo} onChange={(e) => updateTopico(disc.id, topico.id, e.target.value)} fullWidth size="small" placeholder="Tópico" />
                    <Tooltip title="Adicionar subtópico"><IconButton size="small" onClick={() => addSubTopico(disc.id, topico.id)}><Add fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Excluir tópico"><IconButton size="small" color="error" onClick={() => removeTopico(disc.id, topico.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                  {topico.subtopicos.map((sub, sIdx) => (
                    <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5, mb: 0.5 }}>
                      <Chip label={`${tIdx + 1}.${sIdx + 1}`} size="small" variant="outlined" sx={{ minWidth: 40 }} />
                      <TextField value={sub.titulo} onChange={(e) => updateSubTopico(disc.id, topico.id, sub.id, e.target.value)} fullWidth size="small" placeholder="Subtópico" />
                      <Tooltip title="Excluir subtópico"><IconButton size="small" color="error" onClick={() => removeSubTopico(disc.id, topico.id, sub.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  ))}
                </Box>
              ))}

              {/* Footer: Adicionar Tópico + Salvar + Excluir */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<Add />} onClick={() => addTopico(disc.id)} sx={{ textTransform: 'none' }}>
                  Adicionar Tópico
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600 }}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteDisciplinaDialog({ open: true, discId: disc.id })}>
                    Excluir
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Adicionar Disciplina (dashed, full width) */}
          <Button variant="outlined" startIcon={<Add />} onClick={addDisciplina} fullWidth sx={{ color: PRIMARY, borderColor: PRIMARY, borderStyle: 'dashed', py: 1.5, textTransform: 'none', fontSize: '0.9rem' }}>
            Adicionar Disciplina
          </Button>
        </Box>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 4 — Anexos
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <Box sx={{ p: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>Anexos</Typography>
            <Button size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.8125rem', minWidth: 0 }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Anexo</TableCell>
                  <TableCell>Arquivo</TableCell>
                  <TableCell width={150}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anexos.map((anexo) => (
                  <TableRow key={anexo.id}>
                    <TableCell>{anexo.nome}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description fontSize="small" color="action" />
                        {anexo.arquivo}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {anexo.dados && (
                        <Tooltip title="Visualizar">
                          <IconButton size="small" color="primary" onClick={() => setPreviewAnexo(anexo)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openAnexoModal(anexo)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeleteAnexoDialog({ open: true, anexoId: anexo.id })}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {anexos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        Nenhum anexo adicionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Button size="small" startIcon={<Add />} onClick={() => openAnexoModal()} sx={{ color: PRIMARY }}>
              Adicionar Anexo
            </Button>
          </Box>
        </Box>
      )}

      </Box>{/* end scrollable content */}

      {/* ═════════════════════════════════════════════════════════════════════
          Dialogs
          ═════════════════════════════════════════════════════════════════════ */}

      {/* Anexo Modal */}
      <Dialog open={anexoModal} onClose={() => setAnexoModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{anexoEdit ? 'Editar Anexo' : 'Novo Anexo'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Anexo"
            value={anexoForm.nome}
            onChange={(e) => setAnexoForm(f => ({ ...f, nome: e.target.value }))}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.type !== 'application/pdf') {
                toast.error('Apenas arquivos PDF são aceitos.');
                return;
              }
              const reader = new FileReader();
              reader.onload = (ev) => {
                setAnexoForm(f => ({
                  ...f,
                  arquivo: file.name,
                  dados: ev.target?.result as string,
                }));
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Arquivo (.pdf)"
              value={anexoForm.arquivo}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ whiteSpace: 'nowrap', color: PRIMARY, borderColor: PRIMARY }}
            >
              Selecionar
            </Button>
          </Box>
          {anexoForm.dados && (
            <Box sx={{ mt: 2, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <embed src={anexoForm.dados} type="application/pdf" width="100%" height="300px" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnexoModal(false)} startIcon={<Close />}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={saveAnexo}
            startIcon={<Save />}
            sx={{ bgcolor: PRIMARY }}
            disabled={!anexoForm.nome || !anexoForm.arquivo}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anexo Preview Modal */}
      <Dialog open={!!previewAnexo} onClose={() => setPreviewAnexo(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {previewAnexo?.nome}
            <IconButton onClick={() => setPreviewAnexo(null)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewAnexo?.dados && (
            <embed src={previewAnexo.dados} type="application/pdf" width="100%" height="600px" />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Cargo Confirmation */}
      <Dialog open={deleteCargoDialog.open} onClose={() => setDeleteCargoDialog({ open: false })}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir este cargo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCargoDialog({ open: false })}>Cancelar</Button>
          <Button color="error" onClick={removeCargo}>Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Disciplina Confirmation */}
      <Dialog open={deleteDisciplinaDialog.open} onClose={() => setDeleteDisciplinaDialog({ open: false })}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir esta disciplina e todos os seus tópicos?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDisciplinaDialog({ open: false })}>Cancelar</Button>
          <Button color="error" onClick={confirmRemoveDisciplina}>Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Anexo Confirmation */}
      <Dialog open={deleteAnexoDialog.open} onClose={() => setDeleteAnexoDialog({ open: false })}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir este anexo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAnexoDialog({ open: false })}>Cancelar</Button>
          <Button color="error" onClick={confirmDeleteAnexo}>Excluir</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default EditaisPage;
