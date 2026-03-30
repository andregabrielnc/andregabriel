import { useState } from 'react';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Blog from './components/Blog';
import HowItHelps from './components/HowItHelps';
import Concursos from './components/Concursos';
import Discursivas from './components/Discursivas';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import QuestoesEBSERH from './pages/QuestoesEBSERH';
import Flashcards from './pages/Flashcards';

function App() {
  const [page, setPage] = useState('home');

  return (
    <>
      <Navbar page={page} setPage={setPage} />

      {page === 'questoes' ? (
        <div className="pt-16">
          <QuestoesEBSERH />
        </div>
      ) : page === 'flashcards' ? (
        <div className="pt-16">
          <Flashcards />
        </div>
      ) : (
        <>
          <main>
            <Hero />
            <Blog />
            <HowItHelps />
            <Concursos />
            <Discursivas />
            <Experience />
            <Testimonials />
            <FAQ />
            <Contact />
          </main>
          <Footer />
        </>
      )}

      <WhatsAppButton />
      <CookieBanner />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
