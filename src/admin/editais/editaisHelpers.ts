import type { EditalFormFields, Cargo, Anexo, Disciplina, CotaEdital } from './editaisTypes';

export const uid = () => crypto.randomUUID();

export const normalizeDate = (d: string | undefined | null): string =>
  d ? d.slice(0, 10) : '';

export const formatDateBR = (d: string | undefined | null): string => {
  if (!d) return '';
  const clean = String(d).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '';
  const [y, m, day] = clean.split('-');
  return `${day}/${m}/${y}`;
};

export const emptyEdital = (): EditalFormFields => ({
  numero: '', orgao: '', banca: '', link_banca: '', regime: 'CLT',
  status: 'publicado', data_publicacao: '', data_inscricao_inicio: '',
  data_inscricao_fim: '', data_prova: '', validade: '',
  data_impugnacao_inicio: '', data_impugnacao_fim: '',
  taxa_inscricao: '', observacoes: '',
});

export const emptyCargo = (): Cargo => ({
  id: uid(), nome: '', nivel: 'superior', vagas_total: 0,
  remuneracao: '', carga_horaria: '', requisitos: '',
});

export const emptyAnexo = (): Anexo => ({
  id: uid(), nome: '', arquivo: '', dados: '',
});

export const emptyDisciplina = (): Disciplina => ({
  id: uid(), nome: '', cargos_aplicaveis: [], topicos: [],
});

export function calcDistribuicao(vagas_total: number, cotas: CotaEdital[]) {
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
