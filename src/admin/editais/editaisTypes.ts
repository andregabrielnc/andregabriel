export interface CotaEdital {
  id: string;
  tipo: 'negro' | 'pcd' | 'indigena';
  porcentagem: number;
}

export interface Cargo {
  id: string;
  nome: string;
  nivel: 'superior' | 'medio' | 'tecnico' | 'fundamental';
  vagas_total: number;
  remuneracao: string;
  carga_horaria: string;
  requisitos: string;
}

export interface Anexo {
  id: string;
  nome: string;
  arquivo: string;
  dados: string;
}

export interface SubTopicoBasico {
  id: string;
  titulo: string;
}

export interface TopicoBasico {
  id: string;
  titulo: string;
  subtopicos: SubTopicoBasico[];
}

export interface SubTopico {
  id: string;
  titulo: string;
}

export interface Topico {
  id: string;
  titulo: string;
  subtopicos: SubTopico[];
}

export interface Disciplina {
  id: string;
  nome: string;
  cargos_aplicaveis: string[];
  topicos: Topico[];
}

export interface Edital {
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

export type EditalFormFields = Omit<Edital, 'id' | 'todos_cargos_basicos' | 'cotas' | 'cargos' | 'anexos' | 'conteudos_basicos' | 'conteudos_especificos'>;
