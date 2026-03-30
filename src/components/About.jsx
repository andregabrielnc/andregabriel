import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy, BookOpen, Brain, Layers } from 'lucide-react';

const stats = [
  { icon: Trophy, title: 'Bicampeão EBSERH', desc: 'Aprovado em 1º Lugar em 2016 e 2024 (HC-UFG)', color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { icon: BookOpen, title: 'Mais de 2.000 Questões', desc: 'Analisei e resolvi o estilo das principais bancas', color: 'text-primary bg-blue-50 border-blue-100' },
  { icon: Brain, title: 'Especialista IBFC', desc: 'Domínio completo sobre como a banca cobra TI e conhecimentos gerais', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { icon: Layers, title: 'Flashcards e Anki', desc: 'Metodologia ativa de retenção que substitui resumos lentos', color: 'text-violet-600 bg-violet-50 border-violet-100' },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">

          {/* Left: Bio */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">A Minha História</p>
            <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-6">
              Da Escola Pública ao 1º Lugar
            </h2>

            <div className="space-y-4 text-text-muted text-sm sm:text-base leading-relaxed">
              <p>
                Olá! Tenho 38 anos, sou de Goiânia-GO. Quem estudou a vida toda em escola pública sabe o tamanho da defasagem que encaramos. Eu não gostava de matemática, raciocínio lógico e português. Tinha a crença limitante de que "não levava jeito" para exatas.
              </p>
              <p>
                A virada de chave aconteceu quando entendi que <strong className="text-text">não preciso revisar todo o ensino médio</strong> para passar. Só precisava descobrir o que a banca examinadora cobrava e qual era o estilo dela.
              </p>
              <p>
                Estudava no café da manhã, passeando com os cachorros à noite, em qualquer brecha. Meu material de ouro? Milhares de questões da banca, marcações cirúrgicas e <em>flashcards digitais (Anki)</em>.
              </p>
              <p>
                <strong className="text-text">O resultado:</strong> Aprovado na <strong className="text-text">EBSERH / HC-UFG em 1º lugar (2016)</strong> e, anos depois, <strong className="text-text">novamente em 1º lugar (2023/24)</strong>. Hoje me dedico a encurtar o caminho de quem partiu do zero.
              </p>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-1 gap-4"
          >
            {stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${item.color}`}
                >
                  <div className="shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm">{item.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
