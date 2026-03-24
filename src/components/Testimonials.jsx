import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    { name: "Carlos Eduardo", role: "Aprovado em 3º Lugar - EBSERH", text: "O método focado em milhares de questões fez toda a diferença. O André ensina exatamente como a banca pensa, cortando pela metade o meu tempo de preparação. As aulas de informática saíram do zero para o gabarito!", bgColor: "bg-emerald-50" },
    { name: "Fernanda Lima", role: "Aprovada - Tribunal Regional", text: "O uso correto dos Flashcards e do Anki transformou minhas revisões. Antes eu passava horas decorando PDFs, agora gasto 30 minutos e lembro de absolutamente tudo na hora da prova. O André mudou minha visão sobre estudos.", bgColor: "bg-blue-50" },
    { name: "Roberto Almeida", role: "Aprovado na Polícia Federal", text: "Eu tinha um bloqueio enorme com Raciocínio Lógico. O André teve a paciência de desconstruir o 'matês' e criar um plano focado só no que a banca Cebraspe cobra. Consegui a nota que precisava para entrar na corporação.", bgColor: "bg-emerald-50" },
    { name: "Juliana Marques", role: "Aprovada Banco do Brasil", text: "Conciliar os estudos com trabalho de 8 horas não deixava margem para erro. A mentoria me deu o foco exato: ler teoria apenas nas falhas e focar 90% do tempo no portal de questões. Aprovação certeira!", bgColor: "bg-purple-50" },
    { name: "Marcelo Costa", role: "Analista de TI - TRT", text: "Como colega de TI, achei que sabia estudar informática, mas concurso é diferente da prática. A visão do 1º colocado da EBSERH me fez entender as pegadinhas teóricas de Bancas como a FCC.", bgColor: "bg-blue-50" },
    { name: "Patrícia Gomes", role: "Técnica EBSERH", text: "Eu chorava tentando aprender probabilidade e arranjos. Entender que não precisava saber a fundo a teoria da faculdade, mas sim as fórmulas repetitivas da banca IBFC, foi minha salvação para o primeiro lugar.", bgColor: "bg-emerald-50" },
    { name: "Thiago Mendes", role: "Polícia Civil", text: "A estratégia para a discursiva me salvou. Nunca tirava mais de 60%. Aprendi a usar estruturas rígidas e os jargões corretos. Fui para a casa dos 95% de pontuação. Só agradeço ao André!", bgColor: "bg-amber-50" },
    { name: "Amanda Rocha", role: "Aprovada Caixa (CEF)", text: "Passei meses presa no platô de 70% de acertos. Na mentoria, aprendi a usar cadernos de erros no Anki de forma inteligente. Três meses depois meu desempenho nas simulações explodiu para 92%.", bgColor: "bg-sky-50" },
    { name: "Ricardo Santana", role: "Analista TJ", text: "Mudar o verbo de 'ler' PDFs intermináveis para 'agir' em cima de milhares de questões não é fácil sozinho, dá medo. Ter a mentoria para validar o método fez a chave virar na minha cabeça. Resultado: nomeação.", bgColor: "bg-emerald-50" },
    { name: "Sônia Tavares", role: "Assistente Administrativo - MPU", text: "Como mãe e trabalhadora, tempo era artigo de luxo. Montamos uma estratégia em cima de resolução ativa e métodos flash. Descobri que 2h bem direcionadas valem mais que 6h lendo PDF passivamente.", bgColor: "bg-indigo-50" },
    { name: "Felipe Carvalho", role: "Aprovado PM", text: "Meu calcanhar de aquiles era Português da FGV. O André me mostrou como inferência e compreensão de texto da FGV são como matemática; há um padrão. Quando pesquei o padrão, errei quase nenhuma.", bgColor: "bg-blue-50" },
    { name: "Bruna Nogueira", role: "Técnica Judiciária", text: "Um mentor que entende a vivência da escola pública e os déficits atrelados. Não houve julgamento, apenas métodos eficientes para igualar (e superar) o jogo de concorrência.", bgColor: "bg-emerald-50" },
    { name: "Leandro Silva", role: "Auditor Fiscal", text: "Eu precisava ajustar a reta final faltando 1 mês pra prova. Direcionamento total nos assuntos Satélite. Parecia que o André previu o que iria cair. Simplesmente implacável.", bgColor: "bg-orange-50" },
];

const Testimonials = () => {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
    };

    return (
        <section id="testimonials" className="py-24 relative bg-bg-base border-t border-border overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 overflow-visible" ref={sectionRef}>

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="font-semibold text-primary tracking-wider uppercase text-sm">Feedback</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2">Alunos Aprovados</h2>
                        <p className="text-text-muted mt-3 max-w-xl">
                            Dezenas de alunos destravando a aprovação através da metodologia de foco extremo na linguagem da banca.
                        </p>
                    </motion.div>

                    {/* Slider Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex gap-3"
                    >
                        <button
                            onClick={scrollLeft}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-white text-text hover:border-primary hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-border bg-white text-text hover:border-primary hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </motion.div>
                </div>

                {/* Slider Container */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
                    ref={scrollRef}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {testimonials.map((test, i) => (
                        <div
                            key={i}
                            className={`min-w-[320px] sm:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start relative ${test.bgColor} border border-border rounded-2xl p-8 hover:shadow-md transition-shadow duration-300 shadow-sm`}
                        >
                            <Quote size={40} className="text-text-dim opacity-20 absolute top-6 right-6" />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-primary font-bold shadow-sm text-lg">
                                    {test.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-text text-base">{test.name}</h4>
                                    <p className="text-xs font-semibold text-text-muted">{test.role}</p>
                                </div>
                            </div>

                            <p className="text-text-muted text-sm leading-relaxed italic relative z-10 font-medium">
                                "{test.text}"
                            </p>
                        </div>
                    ))}
                </motion.div>

            </div>

            {/* Inline styles to hide webkit scrollbar specifically for the slider */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
        </section>
    );
};

export default Testimonials;
