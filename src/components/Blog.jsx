import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Building2, Users, Star, FileText } from 'lucide-react';

const posts = [
  {
    icon: Building2,
    color: 'text-primary bg-blue-50 border-blue-100',
    tag: 'Institucional',
    title: 'Afinal, o que é a EBSERH? Por que mudou de nome para HUBrasil?',
    excerpt: 'A EBSERH (Empresa Brasileira de Serviços Hospitalares) é uma empresa pública federal vinculada ao MEC que administra os Hospitais Universitários Federais. Em 2024, passou por rebranding e adotou a marca HUBrasil, modernizando sua identidade mantendo a mesma estrutura jurídica e missão de saúde e ensino.',
  },
  {
    icon: FileText,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    tag: 'Estrutura',
    title: 'Quais hospitais são gerenciados? Quantos empregados e quais cargos são mais convocados?',
    excerpt: 'A EBSERH gerencia mais de 50 Hospitais Universitários Federais em todo o Brasil. São aproximadamente 50 mil empregados públicos. Os cargos mais convocados são Técnico em Informática, Analista de TI, Técnico em Enfermagem, Assistente Administrativo e Analista Administrativo.',
  },
  {
    icon: Star,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    tag: 'Carreira',
    title: 'É bom trabalhar na EBSERH? Quais são os benefícios?',
    excerpt: 'Trabalhar na EBSERH oferece estabilidade de empregado público, salários competitivos acima da média do mercado, plano de saúde, auxílio-alimentação, 30 dias de férias, 13º salário e possibilidade de progressão na carreira. A qualidade de vida e o equilíbrio entre trabalho e vida pessoal são pontos muito valorizados pelos servidores.',
  },
  {
    icon: Users,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    tag: 'Concurso',
    title: 'Como se preparar para o concurso da EBSERH / HUBrasil?',
    excerpt: 'O segredo está em dominar o estilo da banca examinadora (principalmente IBFC) e focar em resolução intensiva de questões anteriores. Português, Raciocínio Lógico e Informática são as matérias mais cobradas. Quem estuda de forma estratégica, com método e foco na banca, reduz drasticamente o tempo até a aprovação.',
  },
];

const Blog = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="blog" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Blog</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading">
            Tudo sobre a EBSERH / HUBrasil
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post, i) => {
            const Icon = post.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className="bg-bg border border-border rounded-xl p-5 flex flex-col hover:shadow-md hover:border-border-dark transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 shrink-0 ${post.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">{post.tag}</span>
                <h3 className="font-bold text-text text-sm font-heading leading-snug mb-3">{post.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed flex-grow mb-4">{post.excerpt}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:gap-2.5 transition-all mt-auto"
                >
                  Saiba mais
                  <ArrowRight size={13} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Blog;
