import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <WhatsAppButton />

      <footer style={{ padding: '2rem 0', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '4rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.9rem' }}>
          Concebido & Desenvolvido por <span style={{ color: 'var(--accent)' }}>André Gabriel</span>
        </p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.5 }}>
          {new Date().getFullYear()} © Sistema v1.0.0
        </p>
      </footer>
    </div>
  );
}

export default App;
