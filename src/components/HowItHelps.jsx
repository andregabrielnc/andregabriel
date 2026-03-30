import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, BookOpen, LineChart, ArrowRight } from 'lucide-react';

const strategies = [
  {
    icon: Clock,
    title: 'Quero tempo para estudar',
    description: 'Administrar todas as responsabilidades e ainda estudar é desafiador. Aqui você aprende a otimizar cada minuto disponível, transformando brechas no dia em sessões de alto rendimento.',
    color: 'text-primary bg-blue-50 border-blue-100',
  },
  {
    icon: BookOpen,
    title: 'Quero saber o que preciso estudar',
    description: 'Para uma preparação de qualidade, é preciso conhecer a fundo o edital. Aqui você aprende a identificar exatamente o que cai na sua banca e priorizar o que traz mais pontos.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: LineChart,
    title: 'Quero saber se estou indo bem',
    description: 'Ao longo da jornada é importante monitorar desempenho e planejar revisões. Aprenda a criar cadernos de erro, praticar simulados e observar sua evolução de forma objetiva.',
    color: 'text-violet-600 bg-violet-50 border-violet-100',
  },
];

const HowItHelps = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-helps" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Apoio Estratégico</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading">Como eu vou te ajudar?</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {strategies.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="bg-bg border border-border rounded-xl p-6 flex flex-col hover:shadow-md hover:border-border-dark transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${s.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-text text-base font-heading mb-2">{s.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-grow mb-5">{s.description}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all"
                >
                  Começar agora
                  <ArrowRight size={15} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItHelps;
