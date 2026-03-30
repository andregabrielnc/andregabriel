import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const homeLinks = [
  { label: 'Início',           href: '#home' },
  { label: 'Mentoria & Aulas', href: '#concursos' },
  { label: 'Discursivas',      href: '#discursivas' },
  { label: 'Minha Jornada',    href: '#experience' },
  { label: 'Depoimentos',      href: '#testimonials' },
  { label: 'Contato',          href: '#contact' },
];

const Navbar = ({ page, setPage }) => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const goHome = () => { setPage('home'); setMobileOpen(false); };

  const goAluno = () => {
    setPage('aluno');
    setMobileOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-md border-b border-border' : 'border-b border-border'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm font-heading">
            AG
          </div>
          <span className="font-bold text-text font-heading text-base hidden sm:block">
            André Gabriel
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {homeLinks.map((link) =>
            link.label === 'Contato' ? (
              <a
                key={link.href}
                href={link.href}
                className="ml-2 px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:bg-accent-dark transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg"
              >
                {link.label}
              </a>
            )
          )}

          <button
            onClick={goAluno}
            className="ml-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-primary text-primary hover:bg-blue-50"
          >
            Área do Aluno
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-text hover:text-primary transition-colors rounded-lg hover:bg-bg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-t border-border shadow-xl z-40">
          <div className="flex flex-col py-4">
            {homeLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={
                  link.label === 'Contato'
                    ? 'mx-4 mt-2 py-3 px-5 bg-accent text-white rounded-lg font-bold text-sm text-center'
                    : 'px-6 py-3 text-sm font-medium text-text-muted hover:text-primary hover:bg-bg transition-colors'
                }
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={goAluno}
              className="mx-4 mt-2 py-3 px-5 rounded-lg font-bold text-sm text-center border border-primary text-primary"
            >
              Área do Aluno
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
