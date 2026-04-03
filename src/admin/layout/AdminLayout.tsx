import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Box, Drawer, CircularProgress, CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Toaster } from 'sonner';
import {
  Dashboard as DashboardIcon,
  MenuBook as FlashcardsIcon,
  Assignment as QuestoesIcon,
  People as CadastrosIcon,
} from '@mui/icons-material';
import adminTheme from '../theme/adminTheme';
import { colors, layout } from '../theme/tokens';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import type { MenuItem } from './AdminSidebar';
import DashboardPage from '../pages/DashboardPage';

const Flashcards = lazy(() => import('../../pages/Flashcards'));
const QuestoesEBSERH = lazy(() => import('../../pages/QuestoesEBSERH'));
const CadastrosLayout = lazy(() => import('../cadastros/CadastrosLayout'));

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard',  label: 'Início',         icon: <DashboardIcon /> },
  { id: 'flashcards', label: 'Flashcards',      icon: <FlashcardsIcon /> },
  { id: 'questoes',   label: 'Questões EBSERH', icon: <QuestoesIcon /> },
  { id: 'cadastros',  label: 'Cadastros',       icon: <CadastrosIcon /> },
];

const BREADCRUMBS: Record<string, string[]> = {
  dashboard:  ['Início'],
  flashcards: ['Ferramentas', 'Flashcards'],
  questoes:   ['Ferramentas', 'Questões EBSERH'],
  cadastros:  ['Administração', 'Cadastros'],
};

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface AdminLayoutProps {
  user: User | null;
  onExit: () => void;
}

const PageLoader = (
  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
    <CircularProgress size={28} />
  </Box>
);

export default function AdminLayout({ user, onExit }: AdminLayoutProps) {
  const [active, setActive]         = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(adminTheme.breakpoints.up('lg'));

  const navigate = (id: string) => { setActive(id); setMobileOpen(false); };

  const handleLogout = async () => {
    try { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    onExit();
  };

  const toggleDrawer = () => {
    if (isDesktop) setDrawerOpen(o => !o);
    else setMobileOpen(o => !o);
  };

  useEffect(() => { if (isDesktop) setMobileOpen(false); }, [isDesktop]);

  const breadcrumb = useMemo(() => BREADCRUMBS[active] || ['Área do Aluno'], [active]);

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: colors.bgSurface, overflow: 'hidden' }}>

        {/* Navbar — full width, always on top */}
        <AdminNavbar
          breadcrumb={breadcrumb}
          user={user}
          onToggleSidebar={toggleDrawer}
          onNavigateHome={() => navigate('dashboard')}
          onLogout={handleLogout}
        />

        {/* Body: sidebar + content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Desktop sidebar */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
            <AdminSidebar
              open={drawerOpen}
              active={active}
              menuItems={MENU_ITEMS}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          </Box>

          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': {
                width: layout.sidebarWidth,
                border: 'none',
                top: layout.navbarHeight,
                height: `calc(100% - ${layout.navbarHeight}px)`,
              },
            }}
          >
            <AdminSidebar
              open={true}
              active={active}
              menuItems={MENU_ITEMS}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          </Drawer>

          {/* Main content */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Suspense fallback={PageLoader}>
              {active === 'dashboard'  && <Box sx={{ flex: 1, overflow: 'auto' }}><DashboardPage user={user} /></Box>}
              {active === 'flashcards' && <Box sx={{ flex: 1, overflow: 'auto' }}><Flashcards embedded /></Box>}
              {active === 'questoes'   && <Box sx={{ flex: 1, overflow: 'auto' }}><QuestoesEBSERH embedded /></Box>}
              {active === 'cadastros'  && <CadastrosLayout />}
            </Suspense>
          </Box>

        </Box>

        <Toaster position="top-right" richColors closeButton />
      </Box>
    </ThemeProvider>
  );
}
