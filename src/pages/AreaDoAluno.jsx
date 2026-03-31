import { useState, useEffect, Suspense, lazy } from 'react';
import {
  LayoutDashboard, BookOpen, ClipboardList, ChevronLeft,
  ChevronRight, Menu, LogOut, GraduationCap, Users, FileText
} from 'lucide-react';

const Flashcards = lazy(() => import('./Flashcards'));
const QuestoesEBSERH = lazy(() => import('./QuestoesEBSERH'));
const Cadastros = lazy(() => import('./Cadastros'));
const Editais = lazy(() => import('./Editais'));

const menuItems = [
  { id: 'dashboard',  label: 'Início',              icon: LayoutDashboard },
  { id: 'flashcards', label: 'Flashcards',           icon: BookOpen },
  { id: 'questoes',   label: 'Questões EBSERH',      icon: ClipboardList },
  { id: 'editais',    label: 'Editais de Concurso',   icon: FileText },
  { id: 'cadastros',  label: 'Cadastros',            icon: Users },
];

function Dashboard({ user }) {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-text font-heading mb-1">
        Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
      </h1>
      <p className="text-text-muted mb-8">Selecione uma ferramenta no menu lateral para começar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-text font-heading mb-1">Flashcards</h3>
            <p className="text-sm text-text-muted">Estude com repetição espaçada usando o algoritmo FSRS. Crie baralhos e acompanhe seu progresso.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <ClipboardList size={22} className="text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-text font-heading mb-1">Questões EBSERH</h3>
            <p className="text-sm text-text-muted">Pratique com questões dos concursos EBSERH e acompanhe seu desempenho.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AreaDoAluno({ user, onExit }) {
  const [active, setActive]         = useState('dashboard');
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (id) => { setActive(id); setMobileOpen(false); };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    onExit();
  };

  const sidebarW = collapsed ? 'w-16' : 'w-64';

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40
          flex flex-col bg-[#1e2a3a] text-white
          transition-all duration-300 ease-in-out h-full
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs font-heading shrink-0">
                AG
              </div>
              <span className="font-bold text-sm font-heading whitespace-nowrap">Área do Aluno</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs font-heading mx-auto">
              AG
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Perfil do usuário */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            {user.picture
              ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
              : <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center text-xs font-bold shrink-0">{user.name?.[0]}</div>
            }
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {!collapsed && (
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Menu
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => navigate(id)}
                  title={collapsed ? label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active === id ? 'bg-primary text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sair */}
        <div className="border-t border-white/10 p-2 shrink-0">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-white/50 hover:bg-white/10 hover:text-white transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center px-4 gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-primary hover:bg-bg transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span className="font-bold text-text font-heading text-sm">
              {menuItems.find(m => m.id === active)?.label ?? 'Área do Aluno'}
            </span>
          </div>

          {/* Usuário logado */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border">
              {user?.picture
                ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {user?.name?.[0]}
                  </div>
              }
              <div className="leading-tight">
                <p className="text-sm font-semibold text-text">{user?.name}</p>
                <p className="text-xs text-text-muted truncate max-w-[160px]">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-text-muted border border-border hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Página ativa */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20"><div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            {active === 'dashboard'  && <Dashboard user={user} />}
            {active === 'flashcards' && <Flashcards embedded />}
            {active === 'questoes'   && <QuestoesEBSERH embedded />}
            {active === 'editais'    && <Editais />}
            {active === 'cadastros'  && <Cadastros />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
