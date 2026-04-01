import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Close,
  Upload,
  ExpandMore,
  Description,
  ArrowBack,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// ============================================================
// TypeScript Interfaces
// ============================================================

interface Cota {
  id: string;
  tipo: 'negro' | 'pcd' | 'indigena';
  porcentagem: number;
  observacoes: string;
}

interface Vaga {
  id: string;
  cargo: string;
  quantidade: number;
  regime: 'CLT' | 'RJU';
  cotas: Cota[];
}

interface Anexo {
  id: string;
  nome: string;
  arquivo: string;
}

interface ConteudoBasico {
  id: string;
  titulo: string;
}

interface Sessao {
  id: string;
  titulo: string;
  subSessoes: { id: string; titulo: string }[];
}

interface GrupoEspecifico {
  id: string;
  nome: string;
  sessoes: Sessao[];
}

interface Edital {
  id?: number;
  numero: string;
  orgao: string;
  data_publicacao: string;
  data_inscricao_inicio: string;
  data_inscricao_fim: string;
  link_banca: string;
  validade: string;
  data_impugnacao_inicio: string;
  data_impugnacao_fim: string;
  vagas: Vaga[];
  anexos: Anexo[];
  conteudos_basicos: ConteudoBasico[];
  grupos_especificos: GrupoEspecifico[];
}

type EditalFormFields = Omit<Edital, 'vagas' | 'anexos' | 'conteudos_basicos' | 'grupos_especificos' | 'id'>;

interface SnackState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

// ============================================================
// Default empty edital (used for "new" mode)
// ============================================================

const emptyEdital: Edital = {
  numero: '',
  orgao: '',
  data_publicacao: '',
  data_inscricao_inicio: '',
  data_inscricao_fim: '',
  link_banca: '',
  validade: '',
  data_impugnacao_inicio: '',
  data_impugnacao_fim: '',
  vagas: [],
  anexos: [],
  conteudos_basicos: [],
  grupos_especificos: [],
};

const PRIMARY = '#1a73e8';

// ============================================================
// EditEditalForm Component
// ============================================================

interface EditEditalFormProps {
  edital: Edital;
  onSave: (data: Edital) => void;
  onCancel: () => void;
}

function EditEditalForm({ edital, onSave, onCancel }: EditEditalFormProps) {
  const [tabIndex, setTabIndex] = useState(0);

  // --- react-hook-form for basic fields ---
  const { control, handleSubmit } = useForm<EditalFormFields>({
    defaultValues: {
      numero: edital.numero,
      orgao: edital.orgao,
      data_publicacao: edital.data_publicacao,
      data_inscricao_inicio: edital.data_inscricao_inicio,
      data_inscricao_fim: edital.data_inscricao_fim,
      link_banca: edital.link_banca,
      validade: edital.validade,
      data_impugnacao_inicio: edital.data_impugnacao_inicio,
      data_impugnacao_fim: edital.data_impugnacao_fim,
    },
  });

  // --- Dynamic arrays managed with useState ---
  const [vagas, setVagas] = useState<Vaga[]>(edital.vagas ?? []);
  const [anexos, setAnexos] = useState<Anexo[]>(edital.anexos ?? []);
  const [conteudosBasicos, setConteudosBasicos] = useState<ConteudoBasico[]>(edital.conteudos_basicos ?? []);
  const [gruposEspecificos, setGruposEspecificos] = useState<GrupoEspecifico[]>(edital.grupos_especificos ?? []);

  // --- Anexo edit modal state ---
  const [anexoModalOpen, setAnexoModalOpen] = useState(false);
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null);
  const [anexoModalNome, setAnexoModalNome] = useState('');
  const [anexoModalArquivo, setAnexoModalArquivo] = useState('');

  // --- Delete confirmation dialog ---
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; onConfirm: () => void }>({
    open: false,
    type: '',
    onConfirm: () => {},
  });

  // ============================================================
  // Submit handler: merge form fields + dynamic arrays
  // ============================================================
  const onSubmit = (formData: EditalFormFields) => {
    const full: Edital = {
      ...formData,
      id: edital.id,
      vagas,
      anexos,
      conteudos_basicos: conteudosBasicos,
      grupos_especificos: gruposEspecificos,
    };
    onSave(full);
  };

  // ============================================================
  // Vagas helpers
  // ============================================================

  /** Add a new empty vaga */
  const addVaga = () => {
    setVagas((prev) => [
      ...prev,
      { id: crypto.randomUUID(), cargo: '', quantidade: 1, regime: 'CLT', cotas: [] },
    ]);
  };

  /** Remove a vaga by id */
  const removeVaga = (vagaId: string) => {
    setDeleteDialog({
      open: true,
      type: 'vaga',
      onConfirm: () => {
        setVagas((prev) => prev.filter((v) => v.id !== vagaId));
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  /** Update a field on a vaga */
  const updateVaga = (vagaId: string, field: keyof Omit<Vaga, 'id' | 'cotas'>, value: string | number) => {
    setVagas((prev) =>
      prev.map((v) => (v.id === vagaId ? { ...v, [field]: value } : v))
    );
  };

  /** Add a cota to a specific vaga */
  const addCota = (vagaId: string) => {
    setVagas((prev) =>
      prev.map((v) =>
        v.id === vagaId
          ? {
              ...v,
              cotas: [
                ...v.cotas,
                { id: crypto.randomUUID(), tipo: 'negro', porcentagem: 0, observacoes: '' },
              ],
            }
          : v
      )
    );
  };

  /** Remove a cota from a vaga */
  const removeCota = (vagaId: string, cotaId: string) => {
    setVagas((prev) =>
      prev.map((v) =>
        v.id === vagaId
          ? { ...v, cotas: v.cotas.filter((c) => c.id !== cotaId) }
          : v
      )
    );
  };

  /** Update a field on a cota */
  const updateCota = (
    vagaId: string,
    cotaId: string,
    field: keyof Omit<Cota, 'id'>,
    value: string | number
  ) => {
    setVagas((prev) =>
      prev.map((v) =>
        v.id === vagaId
          ? {
              ...v,
              cotas: v.cotas.map((c) =>
                c.id === cotaId ? { ...c, [field]: value } : c
              ),
            }
          : v
      )
    );
  };

  // ============================================================
  // Anexos helpers
  // ============================================================

  /** Add a new anexo */
  const addAnexo = () => {
    setEditingAnexo(null);
    setAnexoModalNome('');
    setAnexoModalArquivo('');
    setAnexoModalOpen(true);
  };

  /** Open edit modal for an existing anexo */
  const editAnexo = (anexo: Anexo) => {
    setEditingAnexo(anexo);
    setAnexoModalNome(anexo.nome);
    setAnexoModalArquivo(anexo.arquivo);
    setAnexoModalOpen(true);
  };

  /** Save the anexo from modal (create or update) */
  const saveAnexoModal = () => {
    if (editingAnexo) {
      // Update existing
      setAnexos((prev) =>
        prev.map((a) =>
          a.id === editingAnexo.id
            ? { ...a, nome: anexoModalNome, arquivo: anexoModalArquivo }
            : a
        )
      );
    } else {
      // Create new
      setAnexos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), nome: anexoModalNome, arquivo: anexoModalArquivo },
      ]);
    }
    setAnexoModalOpen(false);
  };

  /** Remove an anexo with confirmation */
  const removeAnexo = (anexoId: string) => {
    setDeleteDialog({
      open: true,
      type: 'anexo',
      onConfirm: () => {
        setAnexos((prev) => prev.filter((a) => a.id !== anexoId));
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  // ============================================================
  // Conteúdos Básicos helpers
  // ============================================================

  /** Add a new conteúdo básico */
  const addConteudoBasico = () => {
    setConteudosBasicos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), titulo: '' },
    ]);
  };

  /** Remove a conteúdo básico */
  const removeConteudoBasico = (id: string) => {
    setConteudosBasicos((prev) => prev.filter((c) => c.id !== id));
  };

  /** Update a conteúdo básico title */
  const updateConteudoBasico = (id: string, titulo: string) => {
    setConteudosBasicos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, titulo } : c))
    );
  };

  // ============================================================
  // Grupos Especificos helpers
  // ============================================================

  /** Add a new grupo */
  const addGrupo = () => {
    setGruposEspecificos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: '', sessoes: [] },
    ]);
  };

  /** Remove a grupo */
  const removeGrupo = (grupoId: string) => {
    setDeleteDialog({
      open: true,
      type: 'grupo',
      onConfirm: () => {
        setGruposEspecificos((prev) => prev.filter((g) => g.id !== grupoId));
        setDeleteDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  /** Update grupo name */
  const updateGrupoNome = (grupoId: string, nome: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) => (g.id === grupoId ? { ...g, nome } : g))
    );
  };

  /** Add a sessao to a grupo */
  const addSessao = (grupoId: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              sessoes: [
                ...g.sessoes,
                { id: crypto.randomUUID(), titulo: '', subSessoes: [] },
              ],
            }
          : g
      )
    );
  };

  /** Remove a sessao */
  const removeSessao = (grupoId: string, sessaoId: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? { ...g, sessoes: g.sessoes.filter((s) => s.id !== sessaoId) }
          : g
      )
    );
  };

  /** Update sessao title */
  const updateSessaoTitulo = (grupoId: string, sessaoId: string, titulo: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              sessoes: g.sessoes.map((s) =>
                s.id === sessaoId ? { ...s, titulo } : s
              ),
            }
          : g
      )
    );
  };

  /** Add a sub-sessao to a sessao */
  const addSubSessao = (grupoId: string, sessaoId: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              sessoes: g.sessoes.map((s) =>
                s.id === sessaoId
                  ? {
                      ...s,
                      subSessoes: [
                        ...s.subSessoes,
                        { id: crypto.randomUUID(), titulo: '' },
                      ],
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  /** Remove a sub-sessao */
  const removeSubSessao = (grupoId: string, sessaoId: string, subId: string) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              sessoes: g.sessoes.map((s) =>
                s.id === sessaoId
                  ? { ...s, subSessoes: s.subSessoes.filter((ss) => ss.id !== subId) }
                  : s
              ),
            }
          : g
      )
    );
  };

  /** Update sub-sessao title */
  const updateSubSessaoTitulo = (
    grupoId: string,
    sessaoId: string,
    subId: string,
    titulo: string
  ) => {
    setGruposEspecificos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? {
              ...g,
              sessoes: g.sessoes.map((s) =>
                s.id === sessaoId
                  ? {
                      ...s,
                      subSessoes: s.subSessoes.map((ss) =>
                        ss.id === subId ? { ...ss, titulo } : ss
                      ),
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  // ============================================================
  // Render: Tab 1 - Cabeçalho e Inscrições
  // ============================================================
  const renderTabCabecalho = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Cabeçalho e Inscrições
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="numero"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Número do Edital" fullWidth required />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="orgao"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Órgão" fullWidth required />
            )}
          />
        </Grid>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="validade"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Validade" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="data_inscricao_inicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Início Inscrições"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="data_inscricao_fim"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fim Inscrições"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="link_banca"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Link da Banca (URL)" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="data_impugnacao_inicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Início Impugnação"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="data_impugnacao_fim"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fim Impugnação"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================
  // Render: Tab 2 - Vagas e Cotas
  // ============================================================
  const renderTabVagas = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Vagas e Cotas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={addVaga} sx={{ bgcolor: PRIMARY }}>
          Adicionar Vaga
        </Button>
      </Box>

      {vagas.map((vaga, vIndex) => (
        <Paper key={vaga.id} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }} elevation={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Vaga {vIndex + 1}
            </Typography>
            <Tooltip title="Remover Vaga">
              <IconButton color="error" onClick={() => removeVaga(vaga.id)} size="small">
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Cargo"
                value={vaga.cargo}
                onChange={(e) => updateVaga(vaga.id, 'cargo', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="Quantidade"
                type="number"
                value={vaga.quantidade}
                onChange={(e) => updateVaga(vaga.id, 'quantidade', parseInt(e.target.value) || 0)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Regime</InputLabel>
                <Select
                  value={vaga.regime}
                  label="Regime"
                  onChange={(e) => updateVaga(vaga.id, 'regime', e.target.value)}
                >
                  <MenuItem value="CLT">CLT</MenuItem>
                  <MenuItem value="RJU">RJU</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Cotas sub-list */}
          <Box sx={{ pl: 2, borderLeft: '3px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Cotas
              </Typography>
              <Button size="small" startIcon={<Add />} onClick={() => addCota(vaga.id)}>
                + Cota
              </Button>
            </Box>

            {vaga.cotas.map((cota) => (
              <Box key={cota.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={cota.tipo}
                    label="Tipo"
                    onChange={(e) => updateCota(vaga.id, cota.id, 'tipo', e.target.value)}
                  >
                    <MenuItem value="negro">Negro</MenuItem>
                    <MenuItem value="pcd">PCD</MenuItem>
                    <MenuItem value="indigena">Indígena</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="% "
                  type="number"
                  size="small"
                  value={cota.porcentagem}
                  onChange={(e) =>
                    updateCota(vaga.id, cota.id, 'porcentagem', parseFloat(e.target.value) || 0)
                  }
                  sx={{ width: 90 }}
                />
                <TextField
                  label="Observações"
                  size="small"
                  value={cota.observacoes}
                  onChange={(e) => updateCota(vaga.id, cota.id, 'observacoes', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Remover Cota">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeCota(vaga.id, cota.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}

            {vaga.cotas.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Nenhuma cota adicionada.
              </Typography>
            )}
          </Box>
        </Paper>
      ))}

      {vagas.length === 0 && (
        <Typography color="text.secondary">Nenhuma vaga adicionada.</Typography>
      )}
    </Box>
  );

  // ============================================================
  // Render: Tab 3 - Anexos
  // ============================================================
  const renderTabAnexos = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Anexos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={addAnexo} sx={{ bgcolor: PRIMARY }}>
          Adicionar Anexo
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Nome do Anexo</strong></TableCell>
            <TableCell><strong>Arquivo (.pdf)</strong></TableCell>
            <TableCell align="right"><strong>Ações</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {anexos.map((anexo) => (
            <TableRow key={anexo.id}>
              <TableCell>{anexo.nome}</TableCell>
              <TableCell>
                <Chip icon={<Description />} label={anexo.arquivo || 'Sem arquivo'} size="small" />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => editAnexo(anexo)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton size="small" color="error" onClick={() => removeAnexo(anexo.id)}>
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

      {/* Anexo Edit/Create Modal */}
      <Dialog open={anexoModalOpen} onClose={() => setAnexoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAnexo ? 'Editar Anexo' : 'Novo Anexo'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Nome do Anexo"
            value={anexoModalNome}
            onChange={(e) => setAnexoModalNome(e.target.value)}
            fullWidth
          />
          <TextField
            label="Arquivo (nome do arquivo .pdf)"
            value={anexoModalArquivo}
            onChange={(e) => setAnexoModalArquivo(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <Tooltip title="Upload simulado">
                    <IconButton size="small">
                      <Upload />
                    </IconButton>
                  </Tooltip>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnexoModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveAnexoModal} sx={{ bgcolor: PRIMARY }}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ============================================================
  // Render: Tab 4 - Conteúdos Programáticos
  // ============================================================
  const renderTabConteudos = () => (
    <Box sx={{ p: 2 }}>
      {/* --- Basicos --- */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Conteúdos Básicos</Typography>
          <Button size="small" startIcon={<Add />} onClick={addConteudoBasico}>
            Adicionar
          </Button>
        </Box>

        {conteudosBasicos.map((cb, idx) => (
          <Box key={cb.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip label={idx + 1} size="small" sx={{ fontWeight: 'bold', minWidth: 32 }} />
            <TextField
              value={cb.titulo}
              onChange={(e) => updateConteudoBasico(cb.id, e.target.value)}
              size="small"
              fullWidth
              placeholder="Título do conteúdo"
            />
            <Tooltip title="Remover">
              <IconButton size="small" color="error" onClick={() => removeConteudoBasico(cb.id)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {conteudosBasicos.length === 0 && (
          <Typography color="text.secondary">Nenhum conteúdo básico.</Typography>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* --- Especificos --- */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Conteúdos Específicos</Typography>
          <Button size="small" startIcon={<Add />} onClick={addGrupo}>
            Adicionar Grupo
          </Button>
        </Box>

        {gruposEspecificos.map((grupo) => (
          <Paper
            key={grupo.id}
            sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}
            elevation={1}
          >
            {/* Grupo header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ExpandMore color="action" />
              <TextField
                label="Nome do Grupo"
                value={grupo.nome}
                onChange={(e) => updateGrupoNome(grupo.id, e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button size="small" startIcon={<Add />} onClick={() => addSessao(grupo.id)}>
                Sessão
              </Button>
              <Tooltip title="Remover Grupo">
                <IconButton size="small" color="error" onClick={() => removeGrupo(grupo.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Sessoes */}
            {grupo.sessoes.map((sessao, sIdx) => (
              <Paper
                key={sessao.id}
                sx={{ p: 1.5, mb: 1.5, ml: 3, bgcolor: '#fafafa', border: '1px solid #eee' }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={sIdx + 1} size="small" color="primary" />
                  <TextField
                    value={sessao.titulo}
                    onChange={(e) => updateSessaoTitulo(grupo.id, sessao.id, e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    placeholder="Título da Sessão"
                  />
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addSubSessao(grupo.id, sessao.id)}
                  >
                    Sub
                  </Button>
                  <Tooltip title="Remover Sessão">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeSessao(grupo.id, sessao.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Sub-sessoes */}
                {sessao.subSessoes.map((sub, subIdx) => (
                  <Box
                    key={sub.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4, mb: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 36, fontWeight: 'bold', color: '#666' }}>
                      {sIdx + 1}.{subIdx + 1}
                    </Typography>
                    <TextField
                      value={sub.titulo}
                      onChange={(e) =>
                        updateSubSessaoTitulo(grupo.id, sessao.id, sub.id, e.target.value)
                      }
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="Título da Sub-sessão"
                    />
                    <Tooltip title="Remover Sub-sessão">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeSubSessao(grupo.id, sessao.id, sub.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Paper>
            ))}

            {grupo.sessoes.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                Nenhuma sessão neste grupo.
              </Typography>
            )}
          </Paper>
        ))}

        {gruposEspecificos.length === 0 && (
          <Typography color="text.secondary">Nenhum grupo adicionado.</Typography>
        )}
      </Box>
    </Box>
  );

  // ============================================================
  // Main form render
  // ============================================================
  return (
    <Box sx={{ minHeight: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_e, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label="Cabeçalho e Inscrições" />
          <Tab label="Vagas e Cotas" />
          <Tab label="Anexos" />
          <Tab label="Conteúdos Programáticos" />
        </Tabs>

        <Box>
          {tabIndex === 0 && renderTabCabecalho()}
          {tabIndex === 1 && renderTabVagas()}
          {tabIndex === 2 && renderTabAnexos()}
          {tabIndex === 3 && renderTabConteudos()}
        </Box>
      </Paper>

      {/* Save / Cancel buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" startIcon={<Close />} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit(onSubmit)}
          sx={{ bgcolor: PRIMARY }}
        >
          Salvar
        </Button>
      </Box>

      {/* Generic delete confirmation dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente remover este item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={deleteDialog.onConfirm}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================
// EditaisPage - Main component (default export)
// ============================================================

function EditaisPage() {
  const [mode, setMode] = useState<'list' | 'edit' | 'new'>('list');
  const [editais, setEditais] = useState<Edital[]>([]);
  const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [snack, setSnack] = useState<SnackState>({ open: false, message: '', severity: 'success' });

  const showSnack = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnack({ open: true, message, severity });
  };

  // ============================================================
  // Fetch all editais from API
  // ============================================================
  const fetchEditais = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/editais', { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao buscar editais');
      const data = await res.json();
      setEditais(data);
    } catch (err: any) {
      showSnack(err.message || 'Erro ao carregar editais', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEditais();
  }, [fetchEditais]);

  // ============================================================
  // Load a single edital by ID for editing
  // ============================================================
  /** Normaliza string de data do PostgreSQL para YYYY-MM-DD (input type=date) */
  const normDate = (v: string | null | undefined): string => {
    if (!v) return '';
    return v.slice(0, 10); // "2025-03-15T00:00:00.000Z" → "2025-03-15"
  };

  const loadEditalForEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/editais/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao buscar edital');
      const data: Edital = await res.json();
      // Normaliza datas para formato do input type=date
      data.data_publicacao = normDate(data.data_publicacao);
      data.data_inscricao_inicio = normDate(data.data_inscricao_inicio);
      data.data_inscricao_fim = normDate(data.data_inscricao_fim);
      data.data_impugnacao_inicio = normDate(data.data_impugnacao_inicio);
      data.data_impugnacao_fim = normDate(data.data_impugnacao_fim);
      setEditingEdital(data);
      setMode('edit');
    } catch (err: any) {
      showSnack(err.message || 'Erro ao carregar edital', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Save (create or update)
  // ============================================================
  const handleSave = async (data: Edital) => {
    setLoading(true);
    try {
      const isNew = mode === 'new';
      const url = isNew ? '/api/editais' : `/api/editais/${data.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erro ao salvar edital');

      showSnack(isNew ? 'Edital criado com sucesso!' : 'Edital atualizado com sucesso!');
      setMode('list');
      setEditingEdital(null);
      fetchEditais();
    } catch (err: any) {
      showSnack(err.message || 'Erro ao salvar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Delete an edital
  // ============================================================
  const handleDelete = async () => {
    if (deletingId === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/editais/${deletingId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao excluir edital');
      showSnack('Edital excluído com sucesso!');
      fetchEditais();
    } catch (err: any) {
      showSnack(err.message || 'Erro ao excluir', 'error');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  // ============================================================
  // DataGrid columns
  // ============================================================
  /** Converte YYYY-MM-DD ou ISO string para DD/MM/YYYY */
  const fmtDate = (v: string | null | undefined): string => {
    if (!v) return '-';
    const d = new Date(v + 'T00:00:00'); // force local timezone
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('pt-BR');
  };

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Número', flex: 1, minWidth: 120 },
    { field: 'orgao', headerName: 'Órgão', flex: 1, minWidth: 150 },
    {
      field: 'data_publicacao',
      headerName: 'Data Publicação',
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => fmtDate(params.value as string),
    },
    {
      field: 'inscricoes',
      headerName: 'Inscrições',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Edital;
        return `${fmtDate(row.data_inscricao_inicio)} a ${fmtDate(row.data_inscricao_fim)}`;
      },
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Edital;
        return (
          <Box>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => loadEditalForEdit(row.id!)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setDeletingId(row.id!);
                  setDeleteDialogOpen(true);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // ============================================================
  // Render
  // ============================================================
  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ===== LIST MODE ===== */}
      {mode === 'list' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Editais de Concurso
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingEdital({ ...emptyEdital });
                setMode('new');
              }}
              sx={{ bgcolor: PRIMARY }}
            >
              Novo Edital
            </Button>
          </Box>

          <Paper sx={{ flex: 1, minHeight: 400 }}>
            <DataGrid
              rows={editais}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-columnHeader': { bgcolor: '#f5f5f5', fontWeight: 'bold' },
              }}
            />
          </Paper>

          {/* Delete confirmation */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              <Typography>Deseja realmente excluir este edital? Esta ação não pode ser desfeita.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Excluir
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {/* ===== EDIT / NEW MODE ===== */}
      {(mode === 'edit' || mode === 'new') && editingEdital && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Tooltip title="Voltar">
              <IconButton
                onClick={() => {
                  setMode('list');
                  setEditingEdital(null);
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Typography variant="h5" fontWeight="bold">
              {mode === 'new' ? 'Novo Edital' : `Editar Edital - ${editingEdital.numero}`}
            </Typography>
          </Box>

          <EditEditalForm
            key={editingEdital.id ?? 'new'}
            edital={editingEdital}
            onSave={handleSave}
            onCancel={() => {
              setMode('list');
              setEditingEdital(null);
            }}
          />
        </>
      )}
    </Box>
  );
}

export default EditaisPage;
