import { Code2, Server, Database, Braces } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="section container">
            <h2 className="section-title">01. {`<AboutMe />`}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                <div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        Olá! Sou o André Gabriel, e gosto de criar sistemas que vivem na internet. Meu interesse por desenvolvimento de software começou quando decidi transformar problemas complexos em <span className="text-accent font-mono">soluções minimalistas e eficientes</span>.
                    </p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        Avançando para hoje, tive o privilégio de trabalhar em diversas áreas da engenharia de software, desde a concepção da arquitetura no backend até a construção de interfaces imersivas no frontend.
                    </p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                        Meu foco principal ultimamente tem sido construir sistemas escaláveis com alto desempenho e código limpo para uma variedade de clientes e projetos.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span className="tech-tag">React</span>
                        <span className="tech-tag">Node.js</span>
                        <span className="tech-tag">TypeScript</span>
                        <span className="tech-tag">C# / .NET</span>
                        <span className="tech-tag">Python</span>
                        <span className="tech-tag">AWS</span>
                        <span className="tech-tag">Docker</span>
                        <span className="tech-tag">SQL / NoSQL</span>
                    </div>
                </div>

                <div className="dev-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                            <Code2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-mono text-accent" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Frontend Engineering</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Desenvolvimento de interfaces de usuário escaláveis com React e arquiteturas State-of-the-Art.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '8px', color: 'var(--accent-secondary)' }}>
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="font-mono" style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Backend Systems</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Criação de APIs RESTful e microsserviços robustos com Node.js, C#/.NET e Python.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(176, 38, 255, 0.1)', borderRadius: '8px', color: 'var(--accent-tertiary)' }}>
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-mono" style={{ color: 'var(--accent-tertiary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Data Architecture</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modelagem de dados complexa utilizando relacionamentos SQL e escalabilidade NoSQL.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
