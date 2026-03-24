import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, BrainCircuit, Monitor, GraduationCap, Users } from 'lucide-react';

const courses = [
    {
        icon: GraduationCap,
        title: 'Aulas Particulares para EBSERH',
        description: 'Mentoria direcionada para os concursos da EBSERH. Planejamento de estudos, análise do edital (principalmente IBFC) e resolução intensiva focada no estilo da banca.',
        color: 'bg-emerald-100 text-emerald-700',
    },
    {
        icon: BookOpen,
        title: 'Português Direto ao Ponto',
        description: 'Aprenda gramática e interpretação de textos da forma como a banca cobra. O que mais cai, sem enrolação.',
        color: 'bg-blue-100 text-blue-700',
    },
    {
        icon: BrainCircuit,
        title: 'Raciocínio Lógico',
        description: 'Destrave em exatas! Do básico ao avançado, aprenda a traduzir o "matês" para a linguagem das questões com métodos simples.',
        color: 'bg-purple-100 text-purple-700',
    },
    {
        icon: Monitor,
        title: 'Informática para Concursos',
        description: 'Gabaritando Noções de Informática e matérias específicas de TI. Foco em arquitetura, segurança e redes para Analistas.',
        color: 'bg-amber-100 text-amber-700',
    },
];

const Concursos = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="concursos" className="py-24 relative bg-white">
            <div className="max-w-6xl mx-auto px-6" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="font-semibold text-primary tracking-wider uppercase text-sm">Mentoria & Aulas</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2">Área do Concurseiro</h2>
                    <p className="text-text-muted mt-4 max-w-2xl mx-auto">
                        Aprenda a linguagem das bancas. Com duas aprovações em 1º lugar, ofereço aulas particulares focadas em produtividade, milhares de questões e resultados reais.
                    </p>
                </motion.div>

                {/* Regular Course Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {courses.map((course, i) => {
                        const Icon = course.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                                className="bg-bg-base border border-border rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center mb-5`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-text mb-3">{course.title}</h3>
                                <p className="text-text-muted text-sm leading-relaxed">{course.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Highlighted CTA Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-primary text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    {/* Decorative graphic */}
                    <div className="absolute -right-10 -top-10 opacity-10">
                        <Users size={200} />
                    </div>

                    <div className="relative z-10 md:w-2/3">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                            ✨ Decisão Estratégica
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            Junte-se ao Grupo dos Aprovados
                        </h3>
                        <p className="text-white/90 text-lg leading-relaxed">
                            Você é o 1% que faz a diferença. Abandone os métodos ineficientes, venha dominar o "estilo" da sua banca resolvendo as questões certas e acelere a sua nomeação.
                        </p>
                    </div>
                    <div className="relative z-10 md:w-1/3 flex justify-center md:justify-end w-full">
                        <a
                            href="#contact"
                            className="px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:bg-bg-base hover:scale-105 transition-all duration-300 shadow-lg w-full md:w-auto text-center"
                        >
                            Começar Agora
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Concursos;
