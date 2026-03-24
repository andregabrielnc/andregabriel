import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      transition: 'all 0.3s ease',
      padding: scrolled ? '1rem 0' : '1.5rem 0',
      background: scrolled ? 'rgba(10, 10, 12, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#" className="font-mono text-accent" style={{ fontSize: '1.2rem', textDecoration: 'none', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--text-main)' }}>~</span>/portfolio<span className="cursor-blink"></span>
        </a>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['About', 'Projects', 'Skills', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="font-mono"
              style={{
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-main)'}
            >
              <span className="text-accent">0{['About', 'Projects', 'Skills', 'Contact'].indexOf(item) + 1}.</span> {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
