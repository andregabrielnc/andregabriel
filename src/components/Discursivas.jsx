import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PenTool, CheckSquare, Target, BookType } from 'lucide-react';

const pillars = [
    {
        icon: Target,
        title: 'Direto ao Ponto',
        description: 'Sem parágrafos de enrolação. Na prova da IBFC, fui cirúrgico e comecei escrevendo a resposta imediatamente. A banca tem um estilo mais descritivo do que dissertativo.',
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-700',
    },
    {
        icon: BookType,
        title: 'Vocabulário Estratégico',
        description: 'Usei locuções conjuntivas precisas e algumas palavras-chave técnicas que demonstravam autoridade, causando uma ótima impressão aos avaliadores.',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-700',
    },
    {
        icon: CheckSquare,
        title: 'Padrão de Resposta da Banca',
        description: 'Antes da prova, reescrevi a última discursiva da banca com as minhas palavras simulando fielmente o "espelho de correção" que eles esperam ver.',
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-700',
    },
    {
        icon: PenTool,
        title: 'Cuidado com a Concordância',
        description: 'Escrever de forma limpa, direta e com rigor gramatical básico salva preciosos pontos. O foco deve ser a clareza para não perder nota por nervosismo.',
        bgColor: 'bg-amber-100',
        iconColor: 'text-amber-700',
    },
];

const Discursivas = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="discursivas" className="py-24 relative bg-bg-base border-t border-border">
            <div className="max-w-6xl mx-auto px-6" ref={ref}>
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Layout: Text block */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="font-semibold text-primary tracking-wider uppercase text-sm">O Segredo da Escrita</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2 mb-6">
                            Como Gabaritar <br /> Provas Discursivas
                        </h2>

                        <div className="space-y-5 text-text-muted leading-relaxed">
                            <p>
                                Quando passei em 1º lugar para Analista de TI na EBSERH, eu fui surpreendido com o resultado final: <strong>conquistei 20 pontos de 20 possíveis! Tirei nota 10 exata em casa uma das duas provas discursivas</strong> cobradas no certame (banca IBFC).
                            </p>
                            <p>
                                As mãos suavam de nervoso, não dominei 100% dos assuntos teóricos profundamente na hora, mas eu conhecia o <strong>jogo do examinador</strong>.
                            </p>
                            <p>
                                Nas sessões de mentoria para discursivas, vou te ensinar exatamente as técnicas estruturais que usei: transpor rascunhos sem perder espaço, estruturar parágrafos diretos e aplicar conectivos e jargões que transmitem pleno domínio e arrancam a nota máxima de quem corrige.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Layout: The 4 pillars */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid sm:grid-cols-2 gap-6"
                    >
                        {pillars.map((pillar, i) => {
                            const Icon = pillar.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                    className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${pillar.bgColor} ${pillar.iconColor}`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-text mb-2">{pillar.title}</h3>
                                    <p className="text-sm text-text-muted leading-relaxed">{pillar.description}</p>
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
