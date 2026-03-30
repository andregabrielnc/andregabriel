import { useState } from 'react';
import {
  Search, ChevronDown, Filter, RotateCcw, Bookmark, Share2, Flag,
  GraduationCap, MessageSquare, PlayCircle, BarChart2, BookCopy,
  FileEdit, AlertTriangle, X, Check, Plus, Lock, ThumbsUp,
  Zap, SlidersHorizontal, LineChart, Star, List, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─── Mock Questions ────────────────────────────────────────────────────────
const questions = [
  {
    id: 1,
    ano: '2023', banca: 'IBFC', orgao: 'EBSERH', cargo: 'Analista de TI',
    disciplina: 'Informática', assunto: 'Segurança da Informação', dificuldade: 'Médio',
    breadcrumb: 'Informática / Segurança da Informação / Autenticação',
    enunciado: 'No contexto de segurança da informação, assinale a alternativa que define corretamente o conceito de "autenticação multifator" (MFA).',
    alternativas: {
      A: 'É um método de controle de acesso que requer que o usuário forneça apenas uma senha forte para se autenticar no sistema.',
      B: 'É um processo de segurança que requer que os usuários forneçam dois ou mais fatores de verificação para obter acesso a um recurso.',
      C: 'É um protocolo de criptografia usado exclusivamente para proteger dados em trânsito em redes públicas.',
      D: 'É uma técnica de backup que armazena cópias redundantes dos dados em servidores geograficamente distribuídos.',
      E: 'É um sistema de firewall que analisa pacotes de rede em tempo real para identificar e bloquear ameaças.',
    },
    gabarito: 'B',
    gabarito_comentado: 'A autenticação multifator (MFA) exige que o usuário comprove sua identidade usando dois ou mais fatores distintos: algo que você sabe (senha), algo que você tem (token/celular) e algo que você é (biometria). A alternativa B está correta pois define esse conceito com precisão.',
  },
  {
    id: 2,
    ano: '2016', banca: 'AOCP', orgao: 'EBSERH', cargo: 'Técnico em Informática',
    disciplina: 'Língua Portuguesa', assunto: 'Interpretação de Texto', dificuldade: 'Fácil',
    breadcrumb: 'Língua Portuguesa / Interpretação de Texto / Inferência',
    enunciado: '"A comunicação clara e objetiva é fundamental no ambiente hospitalar. A transmissão incorreta de informações pode comprometer a segurança do paciente e gerar falhas no atendimento clínico."\n\nDe acordo com o texto, assinale a alternativa correta:',
    alternativas: {
      A: 'A comunicação hospitalar é dispensável quando os profissionais têm experiência suficiente.',
      B: 'Apenas médicos precisam se comunicar de forma clara no ambiente hospitalar.',
      C: 'A comunicação clara e objetiva é essencial para a segurança do paciente no ambiente hospitalar.',
      D: 'A transmissão de informações não interfere no atendimento clínico aos pacientes.',
      E: 'O texto trata exclusivamente da comunicação entre médicos e enfermeiros.',
    },
    gabarito: 'C',
    gabarito_comentado: 'O texto afirma que "a comunicação clara e objetiva é fundamental" e que sua falha pode "comprometer a segurança do paciente". A alternativa C reproduz fielmente essa ideia central.',
  },
  {
    id: 3,
    ano: '2024', banca: 'IBFC', orgao: 'EBSERH', cargo: 'Analista de TI',
    disciplina: 'Raciocínio Lógico', assunto: 'Proposições e Conectivos', dificuldade: 'Difícil',
    breadcrumb: 'Raciocínio Lógico / Proposições / Contra-positiva',
    enunciado: 'Considere a seguinte proposição lógica: "Se o sistema está atualizado, então a vulnerabilidade está corrigida." Sabendo que a vulnerabilidade NÃO está corrigida, qual é a conclusão lógica correta?',
    alternativas: {
      A: 'O sistema está atualizado.',
      B: 'O sistema pode ou não estar atualizado.',
      C: 'O sistema não está atualizado.',
      D: 'A vulnerabilidade será corrigida em breve.',
      E: 'Não é possível concluir nada sobre o sistema.',
    },
    gabarito: 'C',
    gabarito_comentado: 'Usando a contra-positiva: se P → Q, então ¬Q → ¬P. "Sistema atualizado → vulnerabilidade corrigida". Como a vulnerabilidade não está corrigida, concluímos que o sistema não está atualizado. Alternativa C.',
  },
  {
    id: 4,
    ano: '2023', banca: 'IBFC', orgao: 'EBSERH', cargo: 'Analista de TI',
    disciplina: 'Informática', assunto: 'Redes de Computadores', dificuldade: 'Médio',
    breadcrumb: 'Informática / Redes de Computadores / Protocolos',
    enunciado: 'Em relação aos protocolos de comunicação utilizados na internet, assinale a alternativa correta sobre o protocolo HTTPS:',
    alternativas: {
      A: 'O HTTPS opera na camada de aplicação e utiliza criptografia SSL/TLS para proteger os dados transmitidos.',
      B: 'O HTTPS é um protocolo exclusivo para transferência de arquivos entre servidores FTP.',
      C: 'O HTTPS substitui completamente o protocolo TCP/IP nas comunicações seguras.',
      D: 'O HTTPS funciona apenas em redes privadas (intranets) e não é compatível com a internet pública.',
      E: 'O HTTPS utiliza a porta padrão 21 para estabelecer conexões seguras.',
    },
    gabarito: 'A',
    gabarito_comentado: 'O HTTPS (HyperText Transfer Protocol Secure) opera na camada de aplicação do modelo OSI e utiliza criptografia SSL/TLS para proteger os dados em trânsito, garantindo confidencialidade e integridade. A porta padrão é 443, não 21 (que é FTP).',
  },
];

// ─── Tab Content Components ───────────────────────────────────────────────
const TabGabarito = ({ q, answered }) => (
  <div className="p-5">
    {answered ? (
      <>
        <p className="font-bold text-text text-sm mb-3">Gabarito: <span className="text-emerald-600">{q.gabarito}</span></p>
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-text-muted text-sm leading-relaxed">{q.gabarito_comentado}</p>
        </div>
      </>
    ) : (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center mb-3">
          <GraduationCap size={20} className="text-text-dim" />
        </div>
        <p className="font-bold text-text text-sm mb-1">Pedir comentário de professor</p>
        <p className="text-text-muted text-xs max-w-xs mb-4">Você gostaria que um professor comentasse essa questão? Seu pedido será analisado e você será avisado por e-mail.</p>
        <button className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors">Pedir Comentário</button>
      </div>
    )}
  </div>
);

const TabComentarios = () => (
  <div className="p-5">
    <div className="flex gap-5 border-b border-border mb-4 text-xs font-semibold">
      <button className="pb-2 text-text-muted">Data</button>
      <button className="pb-2 text-accent border-b-2 border-accent">Mais curtidos</button>
      <span className="ml-auto text-text-muted cursor-pointer hover:text-primary">Acompanhar comentários</span>
    </div>
    {[{ user: 'strong 70', time: '27 Mar 2026 às 16:28', text: 'Questão bem elaborada, típica do estilo IBFC.', likes: 3 },
      { user: 'Felipe Morais', time: '27 Mar 2026 às 16:30', text: 'Concordo! A banca sempre cobra a definição exata dos conceitos.', likes: 1 }
    ].map((c, i) => (
      <div key={i} className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">{c.user.charAt(0).toUpperCase()}</div>
        <div className="flex-1">
          <p className="text-xs text-text-muted mb-1">{c.time}</p>
          <div className="bg-white border border-border rounded-xl p-3">
            <p className="text-xs text-text">{c.text}</p>
            <div className="flex items-center justify-between mt-2">
              <button className="flex items-center gap-1 text-xs text-emerald-600"><ThumbsUp size={11} /> Gostei ({c.likes})</button>
              <button className="text-xs text-red-400">Reportar abuso</button>
            </div>
          </div>
        </div>
      </div>
    ))}
    <div className="flex gap-3 mt-3">
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs shrink-0">AG</div>
      <div className="flex-1 border border-border rounded-xl p-3 bg-white">
        <textarea className="w-full text-xs text-text-muted bg-transparent outline-none resize-none" rows={2} placeholder="Escreva o seu comentário" />
        <div className="flex justify-end"><button className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-lg">Responder</button></div>
      </div>
    </div>
  </div>
);

const TabAulas = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center p-5">
    <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center mb-3">
      <PlayCircle size={20} className="text-text-dim" />
    </div>
    <p className="font-bold text-text text-sm mb-1">Não encontramos aulas para essa questão</p>
    <p className="text-text-muted text-xs mb-4">Você sabia que temos mais de 8000 aulas pra você?</p>
    <button className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors">Ir para aulas</button>
  </div>
);

const TabEstatisticas = ({ selected, gabarito }) => {
  const circum = 2 * Math.PI * 40;
  return (
    <div className="p-5">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-xs font-bold text-text text-center mb-3">Percentual de Rendimento</p>
          <div className="flex items-center justify-center gap-4">
            <svg width="90" height="90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e8eaed" strokeWidth="16" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#4ade80" strokeWidth="16"
                strokeDasharray={`${circum * 0.62} ${circum * 0.38}`} strokeDashoffset={circum / 4} strokeLinecap="round" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f87171" strokeWidth="16"
                strokeDasharray={`${circum * 0.38} ${circum * 0.62}`} strokeDashoffset={-(circum * 0.62 - circum / 4)} strokeLinecap="round" />
            </svg>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Acertos 62%</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Erros 38%</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-xs font-bold text-text text-center mb-3">Alternativas mais respondidas</p>
          <div className="flex items-end justify-center gap-2 h-16">
            {[{ l: 'A', h: 70 }, { l: 'B', h: 35 }, { l: 'C', h: 15 }, { l: 'D', h: 30 }, { l: 'E', h: 8 }].map(b => (
              <div key={b.l} className="flex flex-col items-center gap-0.5">
                <div className="w-7 rounded-t" style={{ height: b.h * 0.6, background: b.l === gabarito ? '#4ade80' : b.l === selected ? '#f87171' : '#93c5fd' }} />
                <span className="text-xs text-text-muted">{b.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-white border border-border rounded-lg text-xs">
          <span className="text-text-muted">Em 27/03/26, você respondeu a opção {selected || '–'}.</span>
          {selected === gabarito
            ? <span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={12} />Você acertou!</span>
            : <span className="text-red-500 font-bold flex items-center gap-1"><X size={12} />Você errou!</span>}
        </div>
      </div>
      <div className="flex justify-center mt-3">
        <button className="px-4 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark">Conferir mais estatísticas</button>
      </div>
    </div>
  );
};

const TabCadernos = () => (
  <div className="p-5">
    <button className="flex items-center gap-1.5 text-accent text-xs font-semibold mb-4 hover:text-accent-dark"><Plus size={14} /> Criar novo caderno</button>
    <div className="border-t border-border pt-4">
      <p className="text-xs text-text-muted mb-2">Escolha o caderno para adicionar a questão</p>
      <div className="flex gap-2">
        <div className="relative">
          <select className="appearance-none pl-3 pr-7 py-2 border border-border rounded-lg text-xs text-text bg-white outline-none">
            <option>Cadernos</option><option>Erros</option><option>Revisar</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <button className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors">Salvar</button>
      </div>
    </div>
  </div>
);

const TabAnotacoes = () => (
  <div className="p-5">
    <div className="flex items-start gap-2 mb-3"><Lock size={13} className="text-text-muted mt-0.5" /><p className="text-xs text-text-muted">Suas anotações são privadas, e só você pode ver.</p></div>
    <button className="flex items-center gap-1.5 text-accent text-xs font-semibold hover:text-accent-dark"><Plus size={14} /> Adicionar nota</button>
  </div>
);

const TabNotificar = () => {
  const [sel, setSel] = useState(null);
  return (
    <div className="p-5">
      <p className="font-bold text-text text-sm mb-3">Qual o tipo do erro encontrado?</p>
      <div className="border-t border-border pt-3 flex flex-wrap gap-2">
        {['Enunciado/alternativa errada', 'Gabarito errado', 'Disciplina ou assunto errado', 'Questão anulada', 'Questão desatualizada', 'Questão duplicada'].map(t => (
          <button key={t} onClick={() => setSel(t)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${sel === t ? 'bg-accent border-accent text-white' : 'border-border text-text-muted hover:border-accent hover:text-accent'}`}>
            {t}
          </button>
        ))}
      </div>
      {sel && <button className="mt-4 px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors">Enviar notificação</button>}
    </div>
  );
};

const TABS = [
  { id: 'gabarito', label: 'Gabarito Comentado', icon: GraduationCap },
  { id: 'comentarios', label: 'Comentários (2)', icon: MessageSquare },
  { id: 'aulas', label: 'Aulas', icon: PlayCircle },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart2 },
  { id: 'cadernos', label: 'Cadernos', icon: BookCopy },
  { id: 'anotacoes', label: 'Criar anotações', icon: FileEdit },
  { id: 'notificar', label: 'Notificar Erro', icon: Flag },
];

// ─── Question Item (always fully visible) ────────────────────────────────
const QuestionItem = ({ q, index, total }) => {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [activeTab, setActiveTab] = useState('gabarito');
  const [tabOpen, setTabOpen] = useState(true);

  const correct = q.gabarito;
  const isCorrect = selected === correct;

  const handleAnswer = () => {
    if (!selected) return;
    setAnswered(true);
    setActiveTab('gabarito');
  };

  const altBorder = (key) => {
    if (!answered) return selected === key ? 'border-accent bg-orange-50' : 'border-border hover:border-accent hover:bg-orange-50 cursor-pointer';
    if (key === correct) return 'border-emerald-500 bg-emerald-50';
    if (key === selected) return 'border-red-400 bg-red-50';
    return 'border-border';
  };

  const circleStyle = (key) => {
    if (!answered) return selected === key ? 'bg-accent text-white border-accent' : 'border-border text-text-muted';
    if (key === correct) return 'bg-emerald-500 text-white border-emerald-500';
    if (key === selected) return 'bg-red-400 text-white border-red-400';
    return 'border-border text-text-muted';
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Question header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg border-b border-border">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="font-bold text-text">Q{index + 1}</span>
          <span className="text-border-dark">|</span>
          <span className="text-text-dim">{q.breadcrumb}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-text-dim hover:text-amber-500 transition-colors" title="Favoritar"><Star size={15} /></button>
          <button className="p-1 text-text-dim hover:text-primary transition-colors" title="Salvar"><Bookmark size={15} /></button>
          <button className="p-1 text-text-dim hover:text-primary transition-colors" title="Compartilhar"><Share2 size={15} /></button>
          <button className="p-1 text-text-dim hover:text-red-500 transition-colors" title="Notificar erro"><AlertTriangle size={15} /></button>
        </div>
      </div>

      {/* Meta info */}
      <div className="px-4 py-2 border-b border-border flex flex-wrap gap-x-4 gap-y-1">
        {[
          { key: 'Ano', value: q.ano },
          { key: 'Banca', value: q.banca },
          { key: 'Órgão', value: q.orgao },
          { key: 'Disciplina', value: q.disciplina },
          { key: 'Dificuldade', value: q.dificuldade },
          { key: 'Cargo', value: q.cargo },
        ].map(t => (
          <span key={t.key} className="text-xs text-text-muted">
            <strong className="text-text">{t.key}:</strong> {t.value}
          </span>
        ))}
      </div>

      {/* Question body */}
      <div className="px-4 sm:px-6 py-5">
        <p className="text-text text-sm leading-relaxed whitespace-pre-line mb-5">{q.enunciado}</p>

        {/* Alternatives */}
        <div className="space-y-2.5 mb-5">
          {Object.entries(q.alternativas).map(([key, text]) => (
            <button
              key={key}
              disabled={answered}
              onClick={() => !answered && setSelected(key)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${altBorder(key)}`}
            >
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${circleStyle(key)}`}>
                {answered && key === correct ? <Check size={12} /> : answered && key === selected && key !== correct ? <X size={12} /> : key}
              </span>
              <span className="text-sm text-text">{text}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {answered && (
          <div className={`rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center gap-2 text-sm font-bold ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {isCorrect
              ? <><Check size={16} /> Parabéns! Você acertou! Este enunciado está correto.</>
              : <><X size={16} /> Você errou! A resposta correta é a alternativa <strong>{correct}</strong>. Não desanime, foco com dúvidas!</>}
          </div>
        )}

        {!answered && (
          <button
            onClick={handleAnswer}
            disabled={!selected}
            className="px-7 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Responder
          </button>
        )}
      </div>

      {/* Tabs */}
      {tabOpen && (
        <div className="border-t border-border">
          <div className="flex overflow-x-auto border-b border-border hide-scrollbar bg-white">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text'}`}>
                  <Icon size={13} />{tab.label}
                </button>
              );
            })}
            <button onClick={() => setTabOpen(false)} className="ml-auto px-3 text-text-muted hover:text-text shrink-0 border-b-2 border-transparent">
              <X size={14} />
            </button>
          </div>
          <div className="bg-bg-alt">
            {activeTab === 'gabarito' && <TabGabarito q={q} answered={answered} />}
            {activeTab === 'comentarios' && <TabComentarios />}
            {activeTab === 'aulas' && <TabAulas />}
            {activeTab === 'estatisticas' && <TabEstatisticas selected={selected} gabarito={q.gabarito} />}
            {activeTab === 'cadernos' && <TabCadernos />}
            {activeTab === 'anotacoes' && <TabAnotacoes />}
            {activeTab === 'notificar' && <TabNotificar />}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Questions Header Bar ─────────────────────────────────────────────────
const QuestoesHeader = ({ total }) => {
  const [perPage, setPerPage] = useState('10');
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / parseInt(perPage));

  return (
    <div className="bg-white border border-border rounded-xl px-4 py-2.5 mb-4 flex flex-wrap items-center gap-3">
      {/* Left: action links */}
      <div className="flex items-center gap-1 divide-x divide-border">
        <button className="flex items-center gap-1.5 pr-3 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
          <Zap size={14} className="text-accent" /> Gerar Simulado
        </button>
        <button className="flex items-center gap-1.5 px-3 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
          <SlidersHorizontal size={14} /> Meus Filtros
        </button>
        <button className="flex items-center gap-1.5 pl-3 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
          <LineChart size={14} /> Minhas Estatísticas
        </button>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1 ml-auto">
        <button className="p-1.5 text-text-dim hover:text-amber-500 transition-colors" title="Favoritos"><Star size={15} /></button>
        <button className="p-1.5 text-text-dim hover:text-primary transition-colors" title="Salvar"><Bookmark size={15} /></button>
        <button className="p-1.5 text-text-dim hover:text-primary transition-colors" title="Lista"><List size={15} /></button>
        <button className="p-1.5 text-text-dim hover:text-primary transition-colors" title="Compartilhar"><Share2 size={15} /></button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-border hidden sm:block" />

      {/* Pagination info */}
      <span className="text-xs text-text-muted whitespace-nowrap">
        <strong className="text-text">{(page - 1) * parseInt(perPage) + 1}–{Math.min(page * parseInt(perPage), total)}</strong> de <strong className="text-text">{total}</strong> questões
      </span>

      {/* Per page */}
      <div className="relative">
        <select value={perPage} onChange={e => { setPerPage(e.target.value); setPage(1); }}
          className="appearance-none pl-2 pr-6 py-1 border border-border rounded-lg text-xs text-text bg-white outline-none focus:border-primary">
          <option value="10">Por página: 10</option>
          <option value="20">Por página: 20</option>
          <option value="50">Por página: 50</option>
        </select>
        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
      </div>

      {/* Ordenar */}
      <div className="relative">
        <select className="appearance-none pl-2 pr-6 py-1 border border-border rounded-lg text-xs text-text bg-white outline-none focus:border-primary">
          <option>Ordenar por</option>
          <option>Mais recentes</option>
          <option>Mais cobradas</option>
          <option>Dificuldade</option>
        </select>
        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
      </div>

      {/* Page nav */}
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="p-1 rounded border border-border text-text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-40">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-text px-1">{page}/{totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          className="p-1 rounded border border-border text-text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-40">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Filter Panel ─────────────────────────────────────────────────────────
const FilterPanel = ({ onFilter, onClose }) => {
  const [tipo, setTipo] = useState('objetivas');
  const [minhas, setMinhas] = useState('todas');
  const [excluir, setExcluir] = useState({});
  const [comQuestoes, setComQuestoes] = useState({});

  const toggleCheck = (group, key) => {
    if (group === 'excluir') setExcluir(p => ({ ...p, [key]: !p[key] }));
    else setComQuestoes(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="font-black text-text text-lg font-heading">
          Questões de <span className="text-accent">Concursos</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={onFilter} className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark transition-colors">
            Aplicar último filtro usado
          </button>
          <button onClick={onClose} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark transition-colors">
            Fechar Filtro <ChevronDown size={13} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden">
          {['objetivas', 'discursivas'].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`py-3 text-sm font-bold transition-colors ${tipo === t ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-bg'}`}>
              Questões {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* My questions */}
        <div>
          <p className="text-sm font-bold text-text mb-2">Minhas Questões</p>
          <div className="flex flex-wrap gap-2">
            {['todas', 'resolvidas', 'não resolvidas', 'acertei', 'errei'].map(f => (
              <button key={f} onClick={() => setMinhas(f)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${minhas === f ? 'bg-primary border-primary text-white' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <input className="flex-1 text-xs outline-none text-text placeholder:text-text-dim bg-transparent" placeholder="Palavra Chave" />
            <Search size={13} className="text-primary shrink-0" />
          </div>
          {['Disciplina', 'Assunto', 'Banca', 'Instituição', 'Ano'].map(f => (
            <div key={f} className="relative">
              <select className="w-full appearance-none pl-3 pr-7 py-2 border border-border rounded-lg text-xs text-text-muted bg-white outline-none focus:border-primary">
                <option>{f}</option>
                {f === 'Banca' && <><option>IBFC</option><option>AOCP</option><option>Cebraspe</option></>}
                {f === 'Disciplina' && <><option>Informática</option><option>Língua Portuguesa</option><option>Raciocínio Lógico</option></>}
                {f === 'Ano' && <><option>2024</option><option>2023</option><option>2016</option></>}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Search row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {['Cargo', 'Nível', 'Área de Formação', 'Área de Atuação', 'Modalidade', 'Dificuldade'].map(f => (
            <div key={f} className="relative">
              <select className="w-full appearance-none pl-3 pr-7 py-2 border border-border rounded-lg text-xs text-text-muted bg-white outline-none focus:border-primary">
                <option>{f}</option>
                {f === 'Dificuldade' && <><option>Fácil</option><option>Médio</option><option>Difícil</option></>}
                {f === 'Cargo' && <><option>Analista de TI</option><option>Técnico em Informática</option></>}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Excluir questões */}
        <div>
          <p className="text-sm font-bold text-text mb-2">Excluir questões</p>
          <div className="flex flex-wrap gap-4">
            {['Dos meus cadernos', 'Dos meus simulados', 'Inéditas', 'Anuladas', 'Desatualizadas'].map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!excluir[f]} onChange={() => toggleCheck('excluir', f)} className="w-4 h-4 accent-primary rounded" />
                <span className="text-xs text-text-muted">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Questões com */}
        <div>
          <p className="text-sm font-bold text-text mb-2">Questões com</p>
          <div className="flex flex-wrap gap-4">
            {['Gabarito Comentado', 'Comentários', 'Meus Comentários', 'Aulas', 'Minhas Anotações'].map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!comQuestoes[f]} onChange={() => toggleCheck('com', f)} className="w-4 h-4 accent-primary rounded" />
                <span className="text-xs text-text-muted">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
          <p className="text-xs text-primary font-semibold">
            Filtrar por: <span className="text-text-dim font-normal">Os seus filtros aparecerão aqui.</span>
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark transition-colors">
              <Bookmark size={12} className="text-accent" /> Salvar Filtros
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark transition-colors">
              <RotateCcw size={12} /> Limpar
            </button>
            <button onClick={onFilter} className="px-6 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors">
              Filtrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const QuestoesEBSERH = () => {
  const [filterOpen, setFilterOpen] = useState(true);
  const [filtered, setFiltered] = useState(false);

  const handleFilter = () => {
    setFiltered(true);
    setFilterOpen(false);
  };

  return (
    <div className="bg-bg min-h-full">
      <div className="px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
          <span className="text-primary">Área do Aluno</span>
          <span>/</span>
          <span>Questões EBSERH</span>
        </nav>

        {/* Filter toggle when closed */}
        {!filterOpen && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-black text-text text-xl font-heading">
              Questões de <span className="text-accent">Concursos</span>
            </h1>
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-white rounded-lg text-xs font-semibold text-text-muted hover:border-border-dark transition-colors">
              <Filter size={13} /> Abrir Filtro <ChevronDown size={13} />
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {filterOpen && <FilterPanel onFilter={handleFilter} onClose={() => { setFilterOpen(false); }} />}

        {/* Questions */}
        {filtered && (
          <>
            <QuestoesHeader total={questions.length} />
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionItem key={q.id} q={q} index={i} total={questions.length} />
              ))}
            </div>
          </>
        )}

        {!filtered && !filterOpen && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Filter size={30} className="text-text-dim mb-3" />
            <p className="text-text font-semibold mb-1">Configure os filtros para buscar questões</p>
            <p className="text-text-muted text-sm">Use o painel de filtros acima para encontrar as questões.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestoesEBSERH;
