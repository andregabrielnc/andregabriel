export const API_URL = '/api/editais';
export const FETCH_OPTS: RequestInit = { credentials: 'include' };

export const STATUS_LABELS: Record<string, string> = {
  publicado: 'Publicado',
  inscricoes_abertas: 'Inscrições Abertas',
  em_andamento: 'Em Andamento',
  encerrado: 'Encerrado',
  homologado: 'Homologado',
};

export const STATUS_COLORS: Record<string, 'success' | 'info' | 'default' | 'secondary'> = {
  publicado: 'info',
  inscricoes_abertas: 'success',
  em_andamento: 'info',
  encerrado: 'default',
  homologado: 'secondary',
};
