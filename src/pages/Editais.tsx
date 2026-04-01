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
} from '@mui/material';
import {
  Add, Delete, Edit, Save, Close, Upload, Description,
  ArrowBack, ExpandMore, Visibility,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ═════════════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════════════

const PRIMARY = '#1a73e8';
const API_URL = '/api/editais';
const FETCH_OPTS: RequestInit = { credentials: 'include' };

const STATUS_LABELS: Record<string, string> = {
  publicado: 'Publicado',
  inscricoes_abertas: 'Inscrições Abertas',
  em_andamento: 'Em Andamento',
  encerrado: 'Encerrado',
  homologado: 'Homologado',
};

const STATUS_COLORS: Record<string, 'success' | 'info' | 'default' | 'secondary'> = {
  publicado: 'info',
  inscricoes_abertas: 'success',
  em_andamento: 'info',
  encerrado: 'default',
  homologado: 'secondary',
};

// ═════════════════════════════════════════════════════════════════════════════
// TypeScript Interfaces
// ═════════════════════════════════════════════════════════════════════════════

interface CotaEdital {
  id: string;
  tipo: 'negro' | 'pcd' | 'indigena';
  porcentagem: number;  // ex: 20 = 20%
}

interface Cargo {
  id: string;
  nome: string;
  nivel: 'superior' | 'medio' | 'tecnico' | 'fundamental';
  vagas_total: number;
  remuneracao: string;
  carga_horaria: string;
  requisitos: string;
}

/** Calcula distribuição de vagas de um cargo a partir das cotas do edital */
function calcDistribuicao(vagas_total: number, cotas: CotaEdital[]) {
  const dist: { tipo: string; label: string; vagas: number }[] = [];
  let reservadas = 0;
  for (const c of cotas) {
    const v = Math.max(0, Math.round(vagas_total * c.porcentagem / 100));
    const label = c.tipo === 'negro' ? 'Negro' : c.tipo === 'pcd' ? 'PCD' : 'Indígena';
    dist.push({ tipo: c.tipo, label, vagas: v });
    reservadas += v;
  }
  dist.unshift({ tipo: 'ampla', label: 'Ampla Concorrência', vagas: Math.max(0, vagas_total - reservadas) });
  return dist;
}

interface Anexo {
  id: string;
  nome: string;
  arquivo: string;   // filename
  dados: string;     // base64 data URL
}

interface SubTopicoBasico {
  id: string;
  titulo: string;
}

interface TopicoBasico {
  id: string;
  titulo: string;
  subtopicos: SubTopicoBasico[];
}

interface SubTopico {
  id: string;
  titulo: string;
}

interface Topico {
  id: string;
  titulo: string;
  subtopicos: SubTopico[];
}

interface Disciplina {
  id: string;
  nome: string;
  cargos_aplicaveis: string[];  // IDs dos cargos
  topicos: Topico[];
}

interface Edital {
  id?: number;
  numero: string;
  orgao: string;
  banca: string;
  link_banca: string;
  regime: 'CLT' | 'Estatutário';
  status: 'publicado' | 'inscricoes_abertas' | 'em_andamento' | 'encerrado' | 'homologado';
  data_publicacao: string;
  data_inscricao_inicio: string;
  data_inscricao_fim: string;
  data_prova: string;
  validade: string;
  data_impugnacao_inicio: string;
  data_impugnacao_fim: string;
  taxa_inscricao: string;
  observacoes: string;
  todos_cargos_basicos: boolean;
  cotas: CotaEdital[];
  cargos: Cargo[];
  anexos: Anexo[];
  conteudos_basicos: TopicoBasico[];
  conteudos_especificos: Disciplina[];
}

// Fields managed by react-hook-form (excludes arrays managed via useState)
type EditalFormFields = Omit<Edital, 'id' | 'todos_cargos_basicos' | 'cotas' | 'cargos' | 'anexos' | 'conteudos_basicos' | 'conteudos_especificos'>;

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

const uid = () => crypto.randomUUID();

const normalizeDate = (d: string | undefined | null): string =>
  d ? d.slice(0, 10) : '';

const formatDateBR = (d: string | undefined | null): string => {
  if (!d) return '';
  const clean = String(d).slice(0, 10); // "2025-03-15T00:00:00.000Z" → "2025-03-15"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '';
  const [y, m, day] = clean.split('-');
  return `${day}/${m}/${y}`;
};

const emptyEdital = (): EditalFormFields => ({
  numero: '',
  orgao: '',
  banca: '',
  link_banca: '',
  regime: 'CLT',
  status: 'publicado',
  data_publicacao: '',
  data_inscricao_inicio: '',
  data_inscricao_fim: '',
  data_prova: '',
  validade: '',
  data_impugnacao_inicio: '',
  data_impugnacao_fim: '',
  taxa_inscricao: '',
  observacoes: '',
});

const emptyCargo = (): Cargo => ({
  id: uid(),
  nome: '',
  nivel: 'superior',
  vagas_total: 0,
  remuneracao: '',
  carga_horaria: '',
  requisitos: '',
});

const emptyAnexo = (): Anexo => ({
  id: uid(),
  nome: '',
  arquivo: '',
  dados: '',
});

const emptyDisciplina = (): Disciplina => ({
  id: uid(),
  nome: '',
  cargos_aplicaveis: [],
  topicos: [],
});

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

const EditaisPage: React.FC = () => {
  // ── List view state ────────────────────────────────────────────────────────
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Edital | null>(null);
  const [isNew, setIsNew] = useState(false);

  // ── Form tab & dynamic arrays ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
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

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditalFormFields>({
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
  // DataGrid Columns
  // ═══════════════════════════════════════════════════════════════════════════

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Número', flex: 1 },
    { field: 'orgao', headerName: 'Órgão', flex: 1.5 },
    { field: 'banca', headerName: 'Banca', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={STATUS_LABELS[params.value] || params.value}
          color={STATUS_COLORS[params.value] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'data_publicacao',
      headerName: 'Publicação',
      flex: 1,
      renderCell: (params) => formatDateBR(params.value),
    },
    {
      field: 'inscricoes',
      headerName: 'Inscrições',
      flex: 1.2,
      sortable: false,
      renderCell: (params) => {
        const r = params.row;
        const ini = formatDateBR(r.data_inscricao_inicio);
        const fim = formatDateBR(r.data_inscricao_fim);
        return ini || fim ? `${ini || '–'} a ${fim || '–'}` : '';
      },
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openEdit(params.row.id)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: params.row.id })}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════

  if (!editing) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">Editais de Concurso</Typography>
          <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: PRIMARY }} onClick={openNew}>
            Novo Edital
          </Button>
        </Box>

        <Paper sx={{ height: 500 }}>
          <DataGrid
            rows={editais}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </Paper>

        {/* Delete Edital Confirmation */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita.
            </DialogContentText>
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

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => setEditing(null)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {isNew ? 'Novo Edital' : 'Editar Edital'}
        </Typography>
      </Box>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Informações do Edital" />
        <Tab label="Cargos e Vagas" />
        <Tab label="Conteúdo Programático" />
        <Tab label="Anexos" />
      </Tabs>

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 1 — Informações do Edital
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Informações do Edital</Typography>
            <Tooltip title="Salvar">
              <IconButton onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#1557b0' }, width: 36, height: 36 }}>
                {saving ? <CircularProgress size={18} color="inherit" /> : <Save fontSize="small" />}
              </IconButton>
            </Tooltip>
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
                  <TextField {...field} label="Taxa de Inscrição" fullWidth />
                )}
              />
            </Grid>

            {/* Validade do Concurso */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validade"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Validade do Concurso" fullWidth />
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
        </Paper>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 2 — Cargos e Vagas
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addCargo}
            sx={{ mb: 2, color: PRIMARY, borderColor: PRIMARY }}
          >
            Adicionar Cargo
          </Button>

          {cargos.map((cargo, cIdx) => (
            <Paper key={cargo.id} sx={{ p: 3, mb: 2 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Cargo {cIdx + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Salvar">
                    <IconButton size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#1557b0' }, width: 32, height: 32 }}>
                      {saving ? <CircularProgress size={16} color="inherit" /> : <Save sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir Cargo">
                    <IconButton size="small" color="error" onClick={() => setDeleteCargoDialog({ open: true, cargoId: cargo.id })}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Row 1: Nome do Cargo + Nível */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nome do Cargo"
                    value={cargo.nome}
                    onChange={(e) => updateCargo(cargo.id, 'nome', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Nível</InputLabel>
                    <Select
                      value={cargo.nivel}
                      label="Nível"
                      onChange={(e) => updateCargo(cargo.id, 'nivel', e.target.value)}
                    >
                      <MenuItem value="superior">Superior</MenuItem>
                      <MenuItem value="medio">Médio</MenuItem>
                      <MenuItem value="tecnico">Técnico</MenuItem>
                      <MenuItem value="fundamental">Fundamental</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    label="Total de Vagas"
                    type="number"
                    value={cargo.vagas_total}
                    onChange={(e) => updateCargo(cargo.id, 'vagas_total', Math.max(0, Number(e.target.value)))}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
              </Grid>

              {/* Row 2: Remuneração, Carga Horária */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Remuneração"
                    value={cargo.remuneracao}
                    onChange={(e) => updateCargo(cargo.id, 'remuneracao', e.target.value)}
                    fullWidth
                    placeholder="R$ 5.420,00"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Carga Horária"
                    value={cargo.carga_horaria}
                    onChange={(e) => updateCargo(cargo.id, 'carga_horaria', e.target.value)}
                    fullWidth
                    placeholder="40h semanais"
                  />
                </Grid>
              </Grid>

              {/* Row 3: Requisitos */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Requisitos"
                  value={cargo.requisitos}
                  onChange={(e) => updateCargo(cargo.id, 'requisitos', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Graduação em Enfermagem + COREN ativo"
                />
              </Box>

              {/* Distribuição de Vagas (calculada automaticamente) */}
              {cargo.vagas_total > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Distribuição de Vagas ({cargo.vagas_total} total)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {calcDistribuicao(cargo.vagas_total, cotas).map((d) => (
                      <Chip
                        key={d.tipo}
                        label={`${d.label}: ${d.vagas}`}
                        size="small"
                        color={d.tipo === 'ampla' ? 'primary' : d.tipo === 'negro' ? 'warning' : d.tipo === 'pcd' ? 'info' : 'success'}
                        variant={d.tipo === 'ampla' ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          ))}

          {cargos.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhum cargo adicionado. Clique em "Adicionar Cargo" para começar.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 3 — Conteúdo Programático
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Box>
          {/* Conhecimentos Básicos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Conhecimentos Básicos</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={todosCargosBasicos}
                      onChange={(e) => setTodosCargosBasicos(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="caption" color="text.secondary" noWrap>Aplica-se a todos os cargos</Typography>}
                  sx={{ mr: 0 }}
                />
                <Button size="small" startIcon={<Add />} onClick={addConteudoBasico}>
                  Adicionar Tópico
                </Button>
                <Tooltip title="Salvar">
                  <IconButton size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#1557b0' }, width: 32, height: 32 }}>
                    {saving ? <CircularProgress size={16} color="inherit" /> : <Save sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {conteudosBasicos.map((item, index) => (
              <Box key={item.id} sx={{ mb: 1.5 }}>
                {/* Tópico principal */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={index + 1} size="small" sx={{ minWidth: 32 }} />
                  <TextField
                    value={item.titulo}
                    onChange={(e) => updateConteudoBasico(item.id, e.target.value)}
                    sx={{ flex: 1 }}
                    size="small"
                    placeholder="Tópico"
                  />
                  <Tooltip title="Adicionar Sub-tópico">
                    <IconButton size="small" color="primary" onClick={() => addSubTopicoBasico(item.id)}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir Tópico">
                    <IconButton size="small" color="error" onClick={() => removeConteudoBasico(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                {/* Sub-tópicos */}
                {(item.subtopicos || []).map((sub, sIdx) => (
                  <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5, mt: 0.5 }}>
                    <Chip label={`${index + 1}.${sIdx + 1}`} size="small" variant="outlined" sx={{ minWidth: 40 }} />
                    <TextField
                      value={sub.titulo}
                      onChange={(e) => updateSubTopicoBasico(item.id, sub.id, e.target.value)}
                      sx={{ flex: 1 }}
                      size="small"
                      placeholder="Sub-tópico"
                    />
                    <Tooltip title="Excluir Sub-tópico">
                      <IconButton size="small" color="error" onClick={() => removeSubTopicoBasico(item.id, sub.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            ))}

            {conteudosBasicos.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhum tópico adicionado.
              </Typography>
            )}
          </Paper>

          {/* Conhecimentos Específicos */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Conhecimentos Específicos</Typography>
            <Button size="small" startIcon={<Add />} onClick={addDisciplina}>
              Adicionar Disciplina
            </Button>
          </Box>

          {conteudosEspecificos.map((disc) => (
            <Paper key={disc.id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Disciplina</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Salvar">
                    <IconButton size="small" onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#1557b0' }, width: 32, height: 32 }}>
                      {saving ? <CircularProgress size={16} color="inherit" /> : <Save sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir Disciplina">
                    <IconButton size="small" color="error" onClick={() => setDeleteDisciplinaDialog({ open: true, discId: disc.id })}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nome da Disciplina"
                    value={disc.nome}
                    onChange={(e) => updateDisciplina(disc.id, 'nome', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    options={cargos}
                    getOptionLabel={(opt) => opt.nome || ''}
                    value={cargos.filter(c => (disc.cargos_aplicaveis || []).includes(c.id))}
                    onChange={(_e, selected) => updateDisciplina(disc.id, 'cargos_aplicaveis', selected.map(c => c.id))}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Cargos Aplicáveis" placeholder="Pesquisar cargo..." />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((opt, index) => {
                        const { key, ...rest } = getTagProps({ index });
                        return <Chip key={key} label={opt.nome} size="small" {...rest} />;
                      })
                    }
                    noOptionsText="Cadastre cargos na aba Cargos e Vagas"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Tópicos
              </Typography>

              {disc.topicos.map((topico, tIdx) => (
                <Box key={topico.id} sx={{ mb: 2, pl: 1 }}>
                  {/* Tópico row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={tIdx + 1} size="small" sx={{ minWidth: 32 }} />
                    <TextField
                      value={topico.titulo}
                      onChange={(e) => updateTopico(disc.id, topico.id, e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Tópico"
                    />
                    <Tooltip title="Adicionar subtópico">
                      <IconButton size="small" onClick={() => addSubTopico(disc.id, topico.id)}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" color="error" onClick={() => removeTopico(disc.id, topico.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Subtópicos */}
                  {topico.subtopicos.map((sub, sIdx) => (
                    <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5, mb: 0.5 }}>
                      <Chip
                        label={`${tIdx + 1}.${sIdx + 1}`}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 40 }}
                      />
                      <TextField
                        value={sub.titulo}
                        onChange={(e) => updateSubTopico(disc.id, topico.id, sub.id, e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="Subtópico"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeSubTopico(disc.id, topico.id, sub.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ))}

              <Box sx={{ mt: 1 }}>
                <Button size="small" startIcon={<Add />} onClick={() => addTopico(disc.id)}>
                  Adicionar Tópico
                </Button>
              </Box>
            </Paper>
          ))}

          {conteudosEspecificos.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhuma disciplina adicionada.</Typography>
            </Paper>
          )}

        </Box>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 4 — Anexos
          ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => openAnexoModal()}
              sx={{ color: PRIMARY, borderColor: PRIMARY }}
            >
              Adicionar Anexo
            </Button>
            <Tooltip title="Salvar">
              <IconButton onClick={handleSubmit(onSubmit)} disabled={saving} sx={{ bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#1557b0' }, width: 36, height: 36 }}>
                {saving ? <CircularProgress size={18} color="inherit" /> : <Save fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          <TableContainer component={Paper}>
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteAnexoDialog({ open: true, anexoId: anexo.id })}
                        >
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

        </Box>
      )}

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
