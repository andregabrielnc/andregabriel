import { MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-16 bg-white">
      {/* Top banner */}
      <div className="bg-primary text-white text-center py-2.5 text-sm font-medium">
        Vagas limitadas por ciclo — <a href="#contact" className="underline font-bold hover:no-underline">Garanta sua vaga agora</a>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text + CTAs */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text leading-tight mb-5 font-heading">
              Seja Aprovado na{' '}
              <span>
                <span style={{ color: '#737373' }}>EBSER</span><span style={{ color: '#79AF33' }}>H</span>
                <span style={{ color: '#d1d5db' }}> - </span>
                <span style={{ color: '#33A348' }}>HU</span><span style={{ color: '#1A479E' }}>Brasil</span>
              </span>
            </h1>

            <p className="text-text-muted text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Aprenda com quem foi aprovado <strong>2 vezes em 1º lugar</strong> na EBSERH e tirou <strong>nota máxima 2 vezes na discursiva</strong>. O método certo encurta anos de estudo.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-white font-bold rounded-lg hover:bg-accent-dark transition-colors text-sm sm:text-base"
              >
                <MessageCircle size={18} />
                Quero Minha Aprovação
              </a>
            </div>
          </div>

          {/* Right: Interview */}
          <div id="interview">
            <h2 className="text-lg sm:text-xl font-black text-text font-heading mb-4">
              A Entrevista no Estratégia
            </h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/WZb7VyqIiHU?autoplay=0&rel=0"
                title="Entrevista Estratégia Concursos"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
