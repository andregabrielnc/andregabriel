import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </g>
    </svg>
  );
}

// ─── reCAPTCHA v3 hook ────────────────────────────────────────────────────────

function useRecaptcha() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) { setReady(true); return; }
    if (window.grecaptcha) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => window.grecaptcha.ready(() => setReady(true));
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  const execute = useCallback(async (action) => {
    if (!SITE_KEY || !window.grecaptcha) return null;
    return window.grecaptcha.execute(SITE_KEY, { action });
  }, []);

  return { ready, execute };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhoneInput({ value, onChange, className }) {
  const fmt = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2)  return d;
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };
  return (
    <input
      type="tel"
      value={fmt(value)}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="(00) 00000-0000"
      className={className}
    />
  );
}

function PasswordInput({ value, onChange, placeholder, className }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function PasswordRules({ password }) {
  const rules = [
    { label: 'Mínimo de 6 caracteres', ok: password.length >= 6 },
    { label: 'Mínimo de 1 letra',      ok: /[a-zA-Z]/.test(password) },
    { label: 'Mínimo de 1 número',     ok: /[0-9]/.test(password) },
  ];
  return (
    <ul className="flex flex-col gap-1">
      {rules.map((r, i) => (
        <li key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? 'text-green-600' : 'text-text-muted'}`}>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${r.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
          {r.label}
        </li>
      ))}
    </ul>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {msg}
    </p>
  );
}

function Divider({ label = 'ou' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-white';

// ─── Main component ───────────────────────────────────────────────────────────

export default function Login({ onBack, onSuccess }) {
  // Register
  const [regName,     setRegName]     = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPhone,    setRegPhone]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError,    setRegError]    = useState('');
  const [regLoading,  setRegLoading]  = useState(false);

  // Login
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError,    setLoginError]    = useState('');
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { ready, execute } = useRecaptcha();

  // Erros vindos do callback OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('login_error');
    if (err === 'recaptcha') setLoginError('Verificação de segurança falhou. Tente novamente.');
    else if (err)            setLoginError('Ocorreu um erro. Tente novamente.');
    if (err) window.history.replaceState({}, '', '/');
  }, []);

  // ── Register via form ──────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim())                          return setRegError('Informe seu nome.');
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) return setRegError('E-mail inválido.');
    if (regPhone.length < 10)                     return setRegError('Celular inválido (inclua o DDD).');
    if (regPassword.length < 6)                   return setRegError('Senha deve ter ao menos 6 caracteres.');
    if (!/[a-zA-Z]/.test(regPassword))            return setRegError('Senha deve conter ao menos 1 letra.');
    if (!/[0-9]/.test(regPassword))               return setRegError('Senha deve conter ao menos 1 número.');

    setRegLoading(true);
    try {
      const recaptchaToken = await execute('register');
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) return setRegError(data.error || 'Erro ao cadastrar.');
      onSuccess(data.user);
    } catch {
      setRegError('Erro de conexão. Tente novamente.');
    } finally {
      setRegLoading(false);
    }
  };

  // ── Register/Login via Google ──────────────────────────────────────────────
  const handleGoogle = async (isRegister = false) => {
    isRegister ? setRegLoading(true) : setGoogleLoading(true);
    try {
      const token = await execute('login');
      window.location.href = `/auth/google${token ? `?recaptcha=${token}` : ''}`;
    } catch {
      const msg = 'Erro de segurança. Tente novamente.';
      isRegister ? setRegError(msg) : setLoginError(msg);
      isRegister ? setRegLoading(false) : setGoogleLoading(false);
    }
  };

  // ── Login com email/senha ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) return setLoginError('Informe o e-mail.');
    if (!loginPassword)     return setLoginError('Informe a senha.');

    setLoginLoading(true);
    try {
      const recaptchaToken = await execute('login');
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) return setLoginError(data.error || 'Credenciais incorretas.');
      onSuccess(data.user);
    } catch {
      setLoginError('Erro de conexão. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-border px-6 h-16 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Voltar ao site
        </button>
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm font-heading">
          AG
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-10 px-4 pb-10">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Painel Cadastro ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col gap-4">

            {/* Ícone + título */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-text font-heading leading-tight">
                Cadastre-se para criar sua conta<br />e iniciar seus estudos!
              </h2>
            </div>

            {/* Cadastrar com Google */}
            <button
              onClick={() => handleGoogle(true)}
              disabled={regLoading || !ready}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <GoogleIcon />
              {regLoading && !regError ? 'Aguarde...' : 'Cadastrar com Google'}
            </button>

            <Divider label="ou cadastre com e-mail" />

            {/* Form manual */}
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nome</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">E-mail</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Celular</label>
                <PhoneInput value={regPhone} onChange={setRegPhone} className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Senha cadastro</label>
                <PasswordInput
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="••••••"
                  className={inputCls}
                />
              </div>

              {regPassword && <PasswordRules password={regPassword} />}

              <ErrorBox msg={regError} />

              <button
                type="submit"
                disabled={regLoading || !ready}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 mt-1"
              >
                {regLoading ? 'Aguarde...' : 'Cadastrar'}
              </button>
            </form>
          </div>

          {/* ── Painel Login ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col gap-4">

            {/* Ícone + título */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-text font-heading leading-tight">
                Entre na sua conta para<br />continuar seus estudos!
              </h2>
            </div>

            {/* Form email/senha */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-text mb-1">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Senha</label>
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="••••••"
                  className={inputCls}
                />
              </div>

              <ErrorBox msg={loginError} />

              <button
                type="submit"
                disabled={loginLoading || !ready}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 mt-1"
              >
                {loginLoading ? 'Aguarde...' : 'Entrar'}
              </button>
            </form>

            <Divider />

            {/* Entrar com Google */}
            <button
              onClick={() => handleGoogle(false)}
              disabled={googleLoading || !ready}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? 'Aguarde...' : 'Entrar com Google'}
            </button>

            <p className="text-xs text-center text-text-muted">
              Contas Google só funcionam se o e-mail estiver cadastrado.
            </p>

            {SITE_KEY && (
              <p className="text-[10px] text-center text-text-muted">
                Protegido por reCAPTCHA —{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Privacidade</a>
                {' & '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">Termos</a>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
