import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy } from 'lucide-react';

const experiences = [
  {
    role: 'Analista de Tecnologia da Informação',
    company: 'HC-UFG / EBSERH',
    period: 'Concurso 2023/2024 — 1º LUGAR',
    description: 'Após anos no cargo de técnico, estudei focado durante 4 meses diretos. Foco nas discursivas (nota máxima, 20 pontos) e nas disciplinas de maior dificuldade matemática. Nova aprovação no topo da lista.',
    tags: ['Nota Máxima na Discursiva', 'IBFC', 'Foco em TI'],
    accent: 'border-primary',
    dot: 'bg-primary',
  },
  {
    role: 'Técnico em Informática',
    company: 'HC-UFG / EBSERH',
    period: 'Concurso 2016 — 1º LUGAR',
    description: 'Primeira aprovação em primeiro lugar. Estudei conciliando o trabalho autônomo com o tempo livre, utilizando a metodologia de milhares de questões focadas na linguagem da banca examinadora.',
    tags: ['Primeiro Grande Desafio', 'AOCP', 'Criação da Metodologia'],
    accent: 'border-amber-400',
    dot: 'bg-amber-400',
  },
  {
    role: 'A Base: Superação na Escola Pública',
    company: 'Goiânia - GO',
    period: 'Estágio Inicial',
    description: 'O início da jornada. Uma base fraca em Matemática e Português não define o destino. A mentalidade estratégica para concorrer de igual para igual.',
    tags: ['Resiliência', 'Desconstrução do "Matês"'],
    accent: 'border-border',
    dot: 'bg-border-dark',
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
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="experience" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Linha do Tempo</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading">A Jornada da Aprovação</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Timeline */}
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className={`relative pl-6 border-l-2 ${exp.accent}`}
              >
                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${exp.dot}`} />
                <span className="inline-block text-xs font-bold text-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mb-2">
                  {exp.period}
                </span>
                <h3 className="font-bold text-text text-sm font-heading">{exp.role}</h3>
                <p className="text-text-muted text-xs mb-2 flex items-center gap-1 font-medium">
                  <Trophy size={12} className="text-amber-500" /> {exp.company}
                </p>
                <p className="text-text-muted text-xs leading-relaxed mb-3">{exp.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-bg border border-border rounded text-xs font-semibold text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-bold text-text text-base font-heading mb-6"
            >
              Domínio da Metodologia
            </motion.h3>
            <div className="space-y-5">
              {skills.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                >
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-text">{skill.name}</span>
                    <span className="text-xs font-bold text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-bg-alt rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                      transition={{ duration: 0.9, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
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
