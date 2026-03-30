import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PenTool, CheckSquare, Target, BookType } from 'lucide-react';

const pillars = [
  {
    icon: Target,
    title: 'Direto ao Ponto',
    description: 'Sem parágrafos de enrolação. Na prova da IBFC, comece escrevendo a resposta imediatamente. A banca tem um estilo mais descritivo do que dissertativo.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: BookType,
    title: 'Vocabulário Estratégico',
    description: 'Locuções conjuntivas precisas e palavras-chave técnicas que demonstram autoridade e causam ótima impressão aos avaliadores.',
    color: 'text-primary bg-blue-50 border-blue-100',
  },
  {
    icon: CheckSquare,
    title: 'Padrão de Resposta da Banca',
    description: 'Antes da prova, reescreva a última discursiva da banca com suas palavras, simulando fielmente o "espelho de correção" esperado.',
    color: 'text-violet-600 bg-violet-50 border-violet-100',
  },
  {
    icon: PenTool,
    title: 'Cuidado com a Concordância',
    description: 'Escrever de forma limpa, direta e com rigor gramatical básico salva preciosos pontos. Clareza é prioridade — não perca nota por nervosismo.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
];

const Discursivas = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="discursivas" className="py-16 sm:py-24 bg-bg border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">O Segredo da Escrita</p>
            <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-5">
              Como Gabaritar Provas Discursivas
            </h2>

            {/* Highlight box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 font-bold text-sm">
                20 de 20 pontos — nota máxima nas duas discursivas cobradas na EBSERH (banca IBFC).
              </p>
            </div>

            <div className="space-y-4 text-text-muted text-sm leading-relaxed">
              <p>
                Quando passei em 1º lugar para Analista de TI na EBSERH, conquistei <strong className="text-text">nota 10 exata em cada uma das duas provas discursivas</strong> cobradas no certame.
              </p>
              <p>
                As mãos suavam de nervoso, não dominei 100% dos assuntos teóricos profundamente, mas eu conhecia o <strong className="text-text">jogo do examinador</strong>.
              </p>
              <p>
                Nas sessões de mentoria, ensino exatamente as técnicas estruturais que usei: estruturar parágrafos diretos e aplicar conectivos e jargões que transmitem domínio e arrancam a nota máxima.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              Quero Aprender as Técnicas
            </a>
          </motion.div>

          {/* Right: Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-border-dark transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${pillar.color}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-text text-sm font-heading mb-1.5">{pillar.title}</h3>
                  <p className="text-text-muted text-xs leading-relaxed">{pillar.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Discursivas;
