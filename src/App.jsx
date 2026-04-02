import { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
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

// Code-split: only loaded when user accesses these pages
const AreaDoAluno = lazy(() => import('./pages/AreaDoAluno'));
const Login = lazy(() => import('./pages/Login'));

function WelcomeModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-5"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center bg-primary/10 shrink-0">
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <span className="text-3xl font-bold text-primary">{user?.name?.[0]}</span>
          }
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text font-heading">
            Bem-vindo{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-sm text-text-muted mt-1">Sua área de estudos está pronta.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Começar a estudar
        </button>
      </motion.div>
    </div>
  );
}

function EmailConfirmedPage({ onGoLogin }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-white border-b border-border px-6 h-16 flex items-center justify-end shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm font-heading">AG</div>
      </header>
      <div className="flex-1 flex items-start justify-center pt-16 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl border border-border p-10 shadow-sm max-w-sm w-full flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text font-heading">E-mail confirmado!</h2>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Sua conta foi ativada com sucesso. Agora você pode fazer login e acessar todos os recursos da plataforma.
          </p>
          <button
            onClick={onGoLogin}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Ir para o Login
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage]           = useState('home');
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser]           = useState(null);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [resetToken, setResetToken]   = useState('');

  useEffect(() => {
    const params        = new URLSearchParams(window.location.search);
    const wantsAluno    = params.get('aluno') === '1';
    const loginError    = params.get('login_error');
    const verified      = params.get('verified') === '1';
    const verifyErr     = params.get('verify_error');
    const resetParam    = params.get('reset');
    const completeParam = params.get('complete_profile') === '1';

    if (wantsAluno || verified || verifyErr || resetParam || completeParam) {
      window.history.replaceState({}, '', '/');
    }

    // Email confirmado — mostra página dedicada (sem login automático)
    if (verified) {
      setAuthChecked(true);
      setPage('email-confirmed');
      return;
    }

    if (resetParam) {
      setResetToken(resetParam);
      setAuthChecked(true);
      setPage('login');
      return;
    }

    if (loginError) {
      setAuthChecked(true);
      setPage('login');
      return;
    }

    if (verifyErr) {
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

          // Google signup sem telefone — pede para completar perfil
          if (data.user.needsPhone || completeParam) {
            setPage('complete-profile');
          } else if (wantsAluno) {
            setWelcomeUser(data.user);
            setPage('welcome');
          } else if (savedPage === 'aluno') {
            setPage('aluno');
          }
        } else if (completeParam) {
          // Sessão expirou — volta pro login
          setPage('login');
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

  const PageLoader = () => (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (page === 'email-confirmed') {
    return (
      <>
        <EmailConfirmedPage onGoLogin={() => setPage('login')} />
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  if (page === 'complete-profile') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Login
          mode="complete-profile"
          user={user}
          onBack={() => { setPage('home'); }}
          onSuccess={(u) => { setUser(u); setWelcomeUser(u); setPage('welcome'); }}
          resetToken=""
        />
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
    );
  }

  if (page === 'aluno') {
    return (
      <Suspense fallback={<PageLoader />}>
        <AreaDoAluno user={user} onExit={exitAluno} />
      </Suspense>
    );
  }

  if (page === 'welcome' && welcomeUser) {
    return (
      <>
        <div className="min-h-screen bg-bg" />
        <WelcomeModal user={welcomeUser} onClose={() => { setWelcomeUser(null); goAluno(); }} />
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  if (page === 'login') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Login
          onBack={() => { setPage('home'); setResetToken(''); }}
          onSuccess={(u) => {
            setUser(u);
            // Se precisa completar telefone, vai pra complete-profile
            if (u.needsPhone) { setPage('complete-profile'); return; }
            setWelcomeUser(u);
            setPage('welcome');
            setResetToken('');
          }}
          resetToken={resetToken}
        />
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
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
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
