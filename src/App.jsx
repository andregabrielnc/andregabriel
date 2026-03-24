import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />

      <footer style={{ padding: '2rem 0', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '4rem' }}>
        <p className="font-mono text-muted" style={{ fontSize: '0.9rem' }}>
          Concebido & Desenvolvido por <span className="text-secondary text-accent">André Gabriel</span>
        </p>
        <p className="font-mono text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.5 }}>
          {new Date().getFullYear()} © Sistema v1.0.0
        </p>
      </footer>
    </div>
  );
}

export default App;
