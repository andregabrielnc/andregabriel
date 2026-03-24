import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle2, Video } from 'lucide-react';

const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-bg-base">

            {/* Background with NO face / just abstract shapes to avoid photo clashing */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 w-full relative z-10 pt-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border mb-6 shadow-sm"
                        >
                            <span className="text-xl">🏆</span>
                            <span className="text-sm font-bold text-text">Bicampeão (1º Lugar) HC-UFG / EBSERH</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text leading-tight mb-4">
                            Aprenda a{' '}
                            <span className="text-primary block mt-1">
                                Linguagem da Banca
                            </span>
                        </h1>

                        <h2 className="text-xl md:text-2xl text-text-muted font-medium mb-6">
                            Mentoria de Estudos & Preparação Estratégica
                        </h2>

                        <p className="text-text-muted leading-relaxed max-w-lg mb-8 text-base md:text-lg">
                            Deixe a teoria inútil para trás. Descubra os métodos de aprovação baseados em milhares de questões que me levaram ao 1º lugar em concursos super concorridos.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-10">
                            <a
                                href="#concursos"
                                className="px-8 py-3.5 rounded-full bg-primary text-white font-bold hover:bg-primary-dark hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-2"
                            >
                                <CheckCircle2 size={20} /> Conhecer a Mentoria
                            </a>
                            <a
                                href="#interview"
                                className="px-8 py-3.5 rounded-full bg-white border border-border text-text font-bold hover:border-primary hover:text-primary transition-all duration-300 shadow-sm flex items-center gap-2"
                            >
                                <Video size={20} /> Ver Entrevista
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: Featured Photo using foto1.jpeg as requested */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex items-center justify-center lg:justify-end relative"
                    >
                        <div className="absolute w-[350px] h-[450px] bg-primary/10 rounded-3xl -z-10 rotate-6 transform translate-x-4 translate-y-4" />

                        <div className="w-[320px] sm:w-[380px] h-[450px] sm:h-[500px] rounded-2xl shadow-2xl overflow-hidden relative border-[12px] border-white bg-white">
                            <img
                                src="/foto1.jpeg"
                                alt="André Gabriel - Aprovado em 1º Lugar"
                                className="w-full h-full object-cover object-top"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pb-4">
                                <p className="text-white text-sm font-bold opacity-90">André Gabriel Carvalho</p>
                                <p className="text-white/80 text-xs font-semibold">Duas Aprovações em 1º Lugar | Mentor</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <ArrowDown size={24} className="text-text-dim hover:text-primary transition-colors cursor-pointer" />
            </motion.div>
        </section>
    );
};

export default Hero;
