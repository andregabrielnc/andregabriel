import { useState, useEffect } from 'react';
import { Terminal, Github, Linkedin, Mail } from 'lucide-react';

const Hero = () => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const fullText = "Desenvolvedor de Sistemas.";

    useEffect(() => {
        if (text.length < fullText.length) {
            const timeout = setTimeout(() => {
                setText(fullText.slice(0, text.length + 1));
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [text, fullText]);

    return (
        <section id="home" className="section container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
            <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Terminal size={24} className="text-accent glow-effect" />
                    <p className="font-mono text-accent" style={{ fontSize: '1.1rem' }}>Olá, mundo. Eu sou</p>
                </div>

                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', margin: '0 0 1rem -4px' }}>
                    André Gabriel.
                </h1>

                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {text}
                    {isTyping && <span className="cursor-blink"></span>}
                    {!isTyping && <span className="cursor-blink" style={{ display: 'inline-block', width: '10px', height: '1.2em', backgroundColor: 'var(--accent-primary)', verticalAlign: 'middle', marginLeft: '4px' }}></span>}
                </h2>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.8' }}>
                    Sou um desenvolvedor apaixonado por criar arquiteturas robustas e interfaces dinâmicas. Especialista em construir soluções digitais de alto desempenho que combinam design moderno (Dev Theme) com código limpo e escalável.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <a href="#projects" className="btn btn-primary">
                        ver_projetos()
                    </a>
                    <a href="#contact" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={18} /> btn_contato
                    </a>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                        <Github size={24} />
                    </a>
                    <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                        <Linkedin size={24} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
