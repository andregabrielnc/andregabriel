import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { label: 'Início', href: '#home' },
    { label: 'A Entrevista', href: '#interview' },
    { label: 'Mentoria & Aulas', href: '#concursos' },
    { label: 'Discursivas', href: '#discursivas' },
    { label: 'Minha Jornada', href: '#experience' },
    { label: 'Depoimentos', href: '#testimonials' },
    { label: 'Contato', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:concursos@andregabriel.com', label: 'Email' },
  ];

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs font-heading">AG</div>
              <span className="font-bold text-text font-heading">André Gabriel</span>
            </div>
            <p className="text-text-muted text-xs max-w-xs">
              Mentoria para concursos públicos. Bicampeão EBSERH em 1º lugar. Especialista em IBFC, Cebraspe e FCC.
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-muted text-xs hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex gap-2">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-text-dim text-xs">
          <p>© {new Date().getFullYear()} André Gabriel. Todos os direitos reservados.</p>
          <p>Feito com foco e milhares de questões.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
