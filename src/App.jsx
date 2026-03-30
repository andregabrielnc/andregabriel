import { useState, useEffect } from 'react';
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
import AreaDoAluno from './pages/AreaDoAluno';
import Login from './pages/Login';

function App() {
  const [page, setPage]           = useState('home');
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser]           = useState(null);

  useEffect(() => {
    const params     = new URLSearchParams(window.location.search);
    const wantsAluno = params.get('aluno') === '1';
    const loginError = params.get('login_error');

    if (wantsAluno || loginError) {
      window.history.replaceState({}, '', '/');
    }

    if (loginError) {
      // Vai para a página de login já com o erro na URL (o componente Login lê o param)
      window.history.pushState({}, '', `/?login_error=${loginError}`);
      setAuthChecked(true);
      setPage('login');
      return;
    }

    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          const savedPage = sessionStorage.getItem('lastPage');
          if (wantsAluno || savedPage === 'aluno') setPage('aluno');
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const goAluno = () => {
    sessionStorage.setItem('lastPage', 'aluno');
    setPage('aluno');
  };

  const goLogin = () => setPage('login');

  const exitAluno = () => {
    sessionStorage.removeItem('lastPage');
    setUser(null);
    setPage('home');
  };

  if (!authChecked) return null;

  if (page === 'aluno') {
    return (
      <>
        <AreaDoAluno user={user} onExit={exitAluno} />
        <Toaster position="bottom-right" richColors closeButton />
      </>
    );
  }

  if (page === 'login') {
    return (
      <>
        <Login
          onBack={() => setPage('home')}
          onSuccess={(u) => { setUser(u); goAluno(); }}
        />
        <Toaster position="bottom-right" richColors closeButton />
      </>
    );
  }

  return (
    <>
      <Navbar page={page} setPage={setPage} goAluno={goLogin} />
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
      <WhatsAppButton />
      <CookieBanner />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
