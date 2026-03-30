import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const Interview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="interview" className="py-16 sm:py-24 bg-bg border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-3">
            A Entrevista no Estratégia
          </h2>
          <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base">
            Passei em 1º Lugar em 2016 para Técnico em Informática, em 2019 2º Lugar para Analista de TI e em 2024 1º Lugar em Analista de TI novamente. Assim como eu você também vai passar no concurso dos seus sonhos!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-border"
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/WZb7VyqIiHU?autoplay=0&rel=0"
            title="Entrevista Estratégia Concursos"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Interview;
