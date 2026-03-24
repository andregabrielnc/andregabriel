import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy } from 'lucide-react';

const experiences = [
    {
        role: 'Analista de Tecnologia da Informação',
        company: 'HC-UFG / EBSERH',
        period: 'Concurso 2023/2024 (1º LUGAR)',
        description: 'Após anos no cargo de técnico, decidi estudar focado durante 4 meses diretos. Analisei os PDFs do Estratégia e foquei nas disciplinas de maior dificuldade matemática e nas discursivas (onde tirei nota máxima, 20 pontos). Nova aprovação no topo da lista.',
        tags: ['Nota Máxima na Discursiva', 'IBFC', 'Foco em TI'],
    },
    {
        role: 'Técnico em Informática',
        company: 'HC-UFG / EBSERH',
        period: 'Concurso 2016 (1º LUGAR)',
        description: 'Primeira aprovação em primeiro lugar. Estudei conciliando o trabalho autônomo com o tempo livre, utilizando a metodologia de milhares de questões focadas na linguagem da banca examinadora.',
        tags: ['Primeiro Grande Desafio', 'AOCP', 'Criação da Metodologia'],
    },
    {
        role: 'A Base: Superação na Escola Pública',
        company: 'Goiânia - GO',
        period: 'Estágio Inicial',
        description: 'O início da jornada. O entendimento de que uma base fraca em Matemática e Português devido ao ensino público não define o destino. A aceitação do desafio e o uso da mentalidade estratégica para concorrer de igual para igual.',
        tags: ['Resiliência', 'Desconstrução do "Matês"'],
    },
];

const skills = [
    { name: 'Táticas de Prova IBFC / Cebraspe', level: 95 },
    { name: 'Linguagem da Banca (Questões)', level: 100 },
    { name: 'Redação Discursiva de TI', level: 100 },
    { name: 'Raciocínio Lógico Simplificado', level: 90 },
    { name: 'Técnicas com Flashcards (Anki)', level: 95 },
];

const Experience = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="experience" className="py-24 relative bg-white border-t border-border">
            <div className="max-w-6xl mx-auto px-6" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="font-semibold text-primary tracking-wider uppercase text-sm">Linha do Tempo</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2">A Jornada da Aprovação</h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Timeline */}
                    <div className="space-y-8">
                        {experiences.map((exp, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 * i }}
                                className="relative pl-8 border-l-2 border-border hover:border-primary transition-colors duration-300 group"
                            >
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-border group-hover:border-primary group-hover:bg-primary/20 transition-all duration-300" />
                                <span className="font-mono font-semibold text-primary text-xs bg-primary/10 px-2 py-1 rounded">{exp.period}</span>
                                <h3 className="text-lg font-bold text-text mt-3">{exp.role}</h3>
                                <p className="text-text-muted text-sm mb-3 flex items-center gap-1.5 font-medium">
                                    <Trophy size={14} className="text-amber-500" /> {exp.company}
                                </p>
                                <p className="text-text-muted text-sm leading-relaxed mb-4">{exp.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {exp.tags.map((tag, j) => (
                                        <span key={j} className="px-2.5 py-1 rounded bg-bg-base text-text-muted text-xs font-semibold border border-border">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Core Methodologies / Skills */}
                    <div>
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl font-bold mb-8 text-text"
                        >
                            Domínio da Metodologia
                        </motion.h3>
                        <div className="space-y-6">
                            {skills.map((skill, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-bold text-text">{skill.name}</span>
                                        <span className="text-xs font-mono font-bold text-primary">{skill.level}%</span>
                                    </div>
                                    <div className="h-2.5 bg-bg-base border border-border rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
