import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, BrainCircuit, Monitor, GraduationCap, ArrowRight } from 'lucide-react';

const courses = [
  {
    icon: GraduationCap,
    title: 'Aulas Particulares para EBSERH',
    description: 'Mentoria direcionada para os concursos da EBSERH. Planejamento de estudos, análise do edital (principalmente IBFC) e resolução intensiva focada no estilo da banca.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: BookOpen,
    title: 'Português Direto ao Ponto',
    description: 'Aprenda gramática e interpretação de textos da forma como a banca cobra. O que mais cai, sem enrolação.',
    color: 'text-primary bg-blue-50 border-blue-100',
  },
  {
    icon: BrainCircuit,
    title: 'Raciocínio Lógico',
    description: 'Destrave em exatas! Do básico ao avançado, aprenda a traduzir o "matês" para a linguagem das questões com métodos simples.',
    color: 'text-violet-600 bg-violet-50 border-violet-100',
  },
  {
    icon: Monitor,
    title: 'Informática para Concursos',
    description: 'Gabaritando Noções de Informática e matérias específicas de TI. Foco em arquitetura, segurança e redes para Analistas.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
];

const Concursos = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="concursos" className="py-16 sm:py-24 bg-bg border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Mentoria & Aulas</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-3">Área do Concurseiro</h2>
          <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base">
            Com duas aprovações em 1º lugar, ofereço aulas particulares focadas em produtividade, milhares de questões e resultados reais.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {courses.map((course, i) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-border-dark transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${course.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-text text-sm mb-2 font-heading">{course.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{course.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-primary rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="text-white">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Decisão Estratégica</p>
            <h3 className="text-xl sm:text-2xl font-black font-heading mb-2">Junte-se ao Grupo dos Aprovados</h3>
            <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
              Abandone os métodos ineficientes. Domine o estilo da sua banca resolvendo as questões certas e acelere sua nomeação.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
          >
            Começar Agora
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Concursos;
