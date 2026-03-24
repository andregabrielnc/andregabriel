import { ExternalLink, Github, FolderGit2 } from 'lucide-react';

const Projects = () => {
    const projects = [
        {
            title: "Apollo System Nexus",
            description: "Uma plataforma de gerenciamento de microsserviços de próxima geração que permite monitorar, implantar e dimensionar clusters em tempo real. Arquitetura altamente disponível com metrics tracking.",
            techs: ["React", "Go", "Docker", "Kubernetes", "Prometheus"],
            github: "#",
            demo: "#"
        },
        {
            title: "Quantum Trading Engine",
            description: "Motor de negociação de alta frequência desenvolvido em C++ e integrado com um painel React em tempo real. Latência inferior a 2ms com websockets otimizados.",
            techs: ["C++", "React", "WebSockets", "Redis", "PostgreSQL"],
            github: "#",
            demo: "#"
        },
        {
            title: "Nova AI Framework",
            description: "Um framework open-source projetado para integrar facilmente modelos de linguagem LLM a aplicações empresariais sem sacrificar privacidade e compliance de dados.",
            techs: ["Python", "PyTorch", "FastAPI", "Next.js"],
            github: "#",
            demo: "#"
        },
        {
            title: "DevSecOps Pipeline",
            description: "Conjunto de ferramentas CI/CD que integra automaticamente verificação de segurança de código, análise estática e relatórios de vulnerabilidades em cada pull request.",
            techs: ["GitHub Actions", "Shell", "Terraform", "AWS"],
            github: "#",
            demo: "#"
        }
    ];

    return (
        <section id="projects" className="section container">
            <h2 className="section-title">02. {`[Projetos_em_Destaque]`}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {projects.map((project, index) => (
                    <div key={index} className="dev-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <FolderGit2 size={40} className="text-accent glow-effect" />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a href={project.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                                    <Github size={20} />
                                </a>
                                <a href={project.demo} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>

                        <h3 className="font-mono text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                            {project.title}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                            {project.description}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {project.techs.map((tech, i) => (
                                <span key={i} className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary">
                    ver_arquivo_completo()
                </a>
            </div>
        </section>
    );
};

export default Projects;
