import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Como funciona a mentoria e as aulas particulares?',
    answer: 'A mentoria foca em identificar falhas de base e mudar a mentalidade de estudo. Foco 100% na resolução direcionada de questões da banca, criação de cadernos de erro e revisão ativa com flashcards (Anki). Não ensino teoria inútil; ensino como a banca pensa e o que ela cobra.',
  },
  {
    question: 'Para quais bancas e cargos é o foco das aulas?',
    answer: 'Tenho especialidade nas bancas IBFC (EBSERH), FGV, Cebraspe e FCC. O foco abrange Informática, Raciocínio Lógico e Português, atendendo de carreiras administrativas gerais até cargos de nível superior e Analista de TI.',
  },
  {
    question: 'Sou muito ruim em Matemática/Exatas. A mentoria serve para mim?',
    answer: 'Com certeza. Eu mesmo comecei do zero com enorme defasagem do ensino público. A mentoria desconstrói o pavor das exatas traduzindo o "matês" para a linguagem simples que as questões de concurso exigem. Você não precisa amar matemática, só precisa marcar o X no lugar certo.',
  },
  {
    question: 'Tenho pouco tempo para estudar (trabalho e/ou filhos). É possível passar?',
    answer: 'Sim! Na minha jornada até o 1º lugar, era autônomo, não tinha rotina fixa e estudava em brechas (no almoço, no ônibus, passeando com os cachorros). O segredo não é ter 8 horas livres, mas usar as 2 horas disponíveis resolvendo as questões corretas de forma estratégica.',
  },
];

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [openIndex, setIndex] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Perguntas Frequentes</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading">Dúvidas Comuns</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className={`border rounded-xl overflow-hidden transition-colors duration-200 ${openIndex === i ? 'border-primary' : 'border-border hover:border-border-dark'}`}
            >
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left bg-white focus:outline-none"
                onClick={() => setIndex(openIndex === i ? -1 : i)}
              >
                <span className={`font-semibold text-sm transition-colors ${openIndex === i ? 'text-primary' : 'text-text'}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 ml-3 transition-transform duration-200 ${openIndex === i ? 'rotate-180 text-primary' : 'text-text-muted'}`}
                />
              </button>

              <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out bg-white ${openIndex === i ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-1 border-t border-border text-text-muted text-sm leading-relaxed pt-3">
                  {faq.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
