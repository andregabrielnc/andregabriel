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
        answer: 'Tenho especialidade aguda nas bancas IBFC (EBSERH), FGV, Cebraspe e FCC. O foco das mentorias abrange Informática, Raciocínio Lógico e Português, atendendo de carreiras administrativas gerais até cargos de nível superior e Analista de TI.',
    },
    {
        question: 'Sou muito ruim em Matemática/Exatas. A mentoria serve para mim?',
        answer: 'Com certeza. Eu mesmo comecei do zero com uma enorme defasagem do ensino público. A mentoria desconstrói o pavor das exatas traduzindo o "matês" para a linguagem simples que as questões de concurso exigem. Você não precisa amar matemática, só precisa saber marcar o X no lugar certo.',
    },
    {
        question: 'Tenho pouco tempo para estudar (trabalho e/ou filhos). É possível passar?',
        answer: 'Sim! Na minha jornada até o 1º lugar, eu era autônomo, não tinha rotina fixa e estudava em brechas (no almoço, no ônibus, passeando com os cachorros). O segredo não é ter 8 horas livres, mas sim usar as 2 horas que você tem resolvendo as questões corretas de forma estratégica.',
    },
];

const FAQ = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [openIndex, setIndex] = useState(0);

    return (
        <section id="faq" className="py-24 relative bg-bg-base">
            <div className="max-w-4xl mx-auto px-6" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="font-semibold text-primary tracking-wider uppercase text-sm">Perguntas Frequentes</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2">Dúvidas Comuns</h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'
                                }`}
                        >
                            <button
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none bg-transparent"
                                onClick={() => setIndex(openIndex === index ? -1 : index)}
                            >
                                <span className={`font-bold text-base transition-colors ${openIndex === index ? 'text-primary' : 'text-text'}`}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    size={20}
                                    className={`text-text-muted transition-transform duration-300 min-w-5 ${openIndex === index ? 'rotate-180 text-primary' : ''}`}
                                />
                            </button>

                            <div
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="pt-2 border-t border-border/50 text-text-muted text-sm leading-relaxed">
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
