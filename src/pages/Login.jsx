import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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

function PhoneInput({ value, onChange }) {
  const format = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2)  return d;
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    return v;
  };
  return (
    <input
      type="tel"
      value={format(value)}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="(00) 00000-0000"
      className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
    />
  );
}

export default function Login({ onBack }) {
  const [regName,  setRegName]  = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [loginError, setLoginError] = useState('');

  // Lê erros vindos do callback OAuth na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('login_error');
    if (err === 'not_registered') setLoginError('Este e-mail não está cadastrado. Crie uma conta primeiro.');
    if (err === 'email_mismatch') setRegError('O e-mail do Google deve ser o mesmo digitado no cadastro.');
    if (err === 'error')          setLoginError('Ocorreu um erro. Tente novamente.');
    if (err) window.history.replaceState({}, '', '/');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim())        return setRegError('Informe seu nome.');
    if (!regEmail.trim())       return setRegError('Informe seu e-mail.');
    if (!/\S+@\S+\.\S+/.test(regEmail)) return setRegError('E-mail inválido.');
    if (regPhone.length < 10)   return setRegError('Celular inválido.');

    setRegLoading(true);
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone }),
      });
      const data = await res.json();
      if (!res.ok) return setRegError(data.error || 'Erro ao cadastrar.');
      window.location.href = data.redirect;
    } catch {
      setRegError('Erro de conexão. Tente novamente.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-border px-6 h-16 flex items-center justify-between">
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

      {/* Conteúdo */}
      <div className="flex-1 flex items-start justify-center pt-10 px-4 pb-10">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Painel Cadastro ── */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col gap-5">
            {/* Ícone */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text font-heading leading-tight">
                  Cadastre-se para criar sua conta<br />e iniciar seus estudos!
                </h2>
              </div>
            </div>

            {/* Botão Google Cadastro */}
            <button
              type="button"
              onClick={handleRegister}
              disabled={regLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors"
              style={{ display: 'none' }}
            >
              <GoogleIcon />
              Cadastrar com Google
            </button>

            {/* Formulário */}
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nome</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">E-mail</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Celular</label>
                <PhoneInput value={regPhone} onChange={setRegPhone} />
              </div>

              {regError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {regError}
                </p>
              )}

              <ul className="text-xs text-text-muted space-y-0.5 list-disc list-inside">
                <li>Use o e-mail Google com o qual deseja entrar</li>
                <li>O celular deve ter DDD + número</li>
              </ul>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-border rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                {regLoading ? 'Aguarde...' : 'Cadastrar com Google'}
              </button>
            </form>
          </div>

          {/* ── Painel Login ── */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col gap-5">
            {/* Ícone */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bg border border-border flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  <path d="M9 11l-4 4 4 4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text font-heading leading-tight">
                  Entre na sua conta para<br />continuar seus estudos!
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {loginError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {loginError}
                </p>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-border rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors"
              >
                <GoogleIcon />
                Entrar com Google
              </button>

              <p className="text-xs text-center text-text-muted">
                Apenas e-mails cadastrados podem entrar.<br />
                Se ainda não tem conta, cadastre-se ao lado.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
