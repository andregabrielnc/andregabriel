import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Interview from './components/Interview';
import About from './components/About';
import Concursos from './components/Concursos';
import Discursivas from './components/Discursivas';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Interview />
        <About />
        <Concursos />
        <Discursivas />
        <Experience />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
