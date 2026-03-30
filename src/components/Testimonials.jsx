import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: 'Carlos Eduardo', role: 'Aprovado em 3º Lugar - EBSERH', text: 'O método focado em milhares de questões fez toda a diferença. O André ensina exatamente como a banca pensa, cortando pela metade o meu tempo de preparação.' },
  { name: 'Fernanda Lima', role: 'Aprovada - Tribunal Regional', text: 'O uso correto dos Flashcards e do Anki transformou minhas revisões. Antes eu passava horas decorando PDFs, agora gasto 30 minutos e lembro de tudo na prova.' },
  { name: 'Roberto Almeida', role: 'Aprovado na Polícia Federal', text: 'Eu tinha um bloqueio enorme com Raciocínio Lógico. O André desconstruiu o "matês" e criou um plano focado só no que o Cebraspe cobra. Consegui a nota que precisava.' },
  { name: 'Juliana Marques', role: 'Aprovada Banco do Brasil', text: 'Conciliar os estudos com trabalho de 8 horas não deixava margem para erro. A mentoria me deu o foco exato: resolver questões 90% do tempo. Aprovação certeira!' },
  { name: 'Marcelo Costa', role: 'Analista de TI - TRT', text: 'Como colega de TI, achei que sabia estudar informática, mas concurso é diferente da prática. A visão do 1º colocado da EBSERH me fez entender as pegadinhas teóricas.' },
  { name: 'Patrícia Gomes', role: 'Técnica EBSERH', text: 'Entender que não precisava saber a teoria da faculdade, mas sim as fórmulas repetitivas da banca IBFC, foi minha salvação para o primeiro lugar.' },
  { name: 'Thiago Mendes', role: 'Polícia Civil', text: 'A estratégia para a discursiva me salvou. Nunca tirava mais de 60%. Aprendi a usar estruturas rígidas e os jargões corretos. Fui para 95% de pontuação.' },
  { name: 'Amanda Rocha', role: 'Aprovada Caixa (CEF)', text: 'Passei meses presa no platô de 70%. Na mentoria, aprendi a usar cadernos de erros no Anki de forma inteligente. Três meses depois explodiu para 92%.' },
  { name: 'Ricardo Santana', role: 'Analista TJ', text: 'Mudar o verbo de "ler" PDFs para "agir" em cima de questões não é fácil sozinho. Ter a mentoria para validar o método fez a chave virar. Resultado: nomeação.' },
  { name: 'Sônia Tavares', role: 'Assistente Administrativo - MPU', text: 'Como mãe e trabalhadora, tempo era artigo de luxo. Montamos uma estratégia em cima de resolução ativa. 2h bem direcionadas valem mais que 6h lendo PDF.' },
  { name: 'Felipe Carvalho', role: 'Aprovado PM', text: 'Meu calcanhar de aquiles era Português da FGV. O André me mostrou como há um padrão. Quando pesquei o padrão, errei quase nenhuma questão.' },
  { name: 'Bruna Nogueira', role: 'Técnica Judiciária', text: 'Um mentor que entende a vivência da escola pública. Não houve julgamento, apenas métodos eficientes para igualar e superar o jogo da concorrência.' },
];

const Testimonials = () => {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  };

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-bg border-t border-border overflow-hidden" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Feedback</p>
            <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-1">Alunos Aprovados</h2>
            <p className="text-text-muted text-sm">Dezenas de alunos destravando a aprovação com metodologia focada.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2 shrink-0"
          >
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-text-muted hover:border-primary hover:text-primary transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-text-muted hover:border-primary hover:text-primary transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar"
          ref={scrollRef}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-2.5 pt-3 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-xs font-heading shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-text text-xs">{t.name}</p>
                  <p className="text-text-dim text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
