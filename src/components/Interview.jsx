import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PlayCircle } from 'lucide-react';

const Interview = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="interview" className="py-24 relative bg-bg-base border-t border-border">
            <div className="max-w-5xl mx-auto px-6" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border mb-4 shadow-sm text-primary font-bold text-sm">
                        <PlayCircle size={18} />
                        <span>Conheça a História Completa</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2 mb-4">
                        A Entrevista no Estratégia
                    </h2>
                    <p className="text-text-muted max-w-2xl mx-auto">
                        De consertador de computadores autônomo ao 1º Lugar Nacional na EBSERH. Assista à minha entrevista contando os detalhes da jornada, a metodologia e os desafios na preparação.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                >
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/WZb7VyqIiHU?autoplay=0&rel=0"
                        title="Entrevista Estratégia Concursos"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </motion.div>
            </div>
        </section>
    );
};

export default Interview;
