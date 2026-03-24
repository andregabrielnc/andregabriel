import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const About = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="about" className="py-24 relative bg-bg-base">
            <div className="max-w-6xl mx-auto px-6" ref={ref}>
                <div className="grid lg:grid-cols-5 gap-16 items-start">

                    {/* Left: Bio */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-3"
                    >
                        <span className="font-semibold text-primary tracking-wider uppercase text-sm">A Minha História</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2 mb-8">Da Escola Pública ao 1º Lugar</h2>

                        <div className="space-y-5 text-text-muted leading-relaxed">
                            <p>
                                Olá! Tenho 38 anos, sou de Goiânia-GO. Quem estudou a vida toda em escola pública sabe o tamanho da defasagem que encaramos. Eu não gostava de matemática, raciocínio lógico e português. Tinha a crença limitante de que "não levava jeito" para exatas.
                            </p>
                            <p>
                                A virada de chave aconteceu quando entendi que <strong>não preciso revisar todo o ensino médio</strong> para passar. Eu só precisava descobrir o que a banca examinadora cobrava e qual era o estilo dela.
                            </p>
                            <p>
                                Conciliando a rotina autônoma, eu não tinha horários fixos. Estudava no café da manhã, passeando com os cachorros à noite, ou em qualquer brecha. Meu material de ouro? Milhares de questões da banca, marcações cirúrgicas e <em>flashcards digitais (Anki)</em>.
                            </p>
                            <p>
                                <strong>O resultado prático da metodologia:</strong> Fui aprovado no concurso da <strong>EBSERH / HC-UFG em 1º lugar (2016)</strong> e, anos depois, <strong>novamente em 1º lugar (2023/24)</strong>. Hoje me dedico a encurtar o caminho de quem também partiu do zero, desmistificando o aprendizado e ensinando a vencer o jogo dos concursos.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Key Stats / Traits */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {[
                            { title: "Bicampeão EBSERH", desc: "Aprovado em 1º Lugar em 2016 e 2024 (HC-UFG)" },
                            { title: "Mais de 2.000 Questões", desc: "Analisei e resolvi o estilo das principais bancas" },
                            { title: "Especialista IBFC", desc: "Domínio completo sobre como a banca cobra TI e conhecimentos gerais" },
                            { title: "Flashcards e Anki", desc: "Metodologia ativa de retenção que substitui resumos lentos" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                            >
                                <h4 className="text-lg font-bold text-text mb-1">{item.title}</h4>
                                <p className="text-sm text-text-muted">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
