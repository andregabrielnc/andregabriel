import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem, Breadcrumbs,
  Link as MuiLink, CircularProgress, Tooltip, useMediaQuery, CssBaseline,
} from '@mui/material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  MenuBook as FlashcardsIcon,
  Assignment as QuestoesIcon,
  Description as EditaisIcon,
  People as CadastrosIcon,
  Logout as LogoutIcon,
  NavigateNext as NavNextIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════════════════════
// Lazy-loaded pages
// ═══════════════════════════════════════════════════════════════════════════════

const Flashcards = lazy(() => import('./Flashcards'));
const QuestoesEBSERH = lazy(() => import('./QuestoesEBSERH'));
const Cadastros = lazy(() => import('./Cadastros'));
const Editais = lazy(() => import('./Editais'));

// ═══════════════════════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════════════════════

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface AreaDoAlunoProps {
  user: User | null;
  onExit: () => void;
}

interface MenuItemDef {
  id: string;
  label: string;
  icon: React.ReactElement;
  breadcrumb?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const DRAWER_WIDTH = 260;
const DRAWER_MINI  = 64;
const PRIMARY      = '#1a73e8';
const SIDEBAR_BG   = '#1b2536';
const SIDEBAR_DARK = '#151d2b';

const MENU_ITEMS: MenuItemDef[] = [
  { id: 'dashboard',  label: 'Início',             icon: <DashboardIcon />,  breadcrumb: ['Início'] },
  { id: 'flashcards', label: 'Flashcards',          icon: <FlashcardsIcon />, breadcrumb: ['Ferramentas', 'Flashcards'] },
  { id: 'questoes',   label: 'Questões EBSERH',     icon: <QuestoesIcon />,   breadcrumb: ['Ferramentas', 'Questões EBSERH'] },
  { id: 'editais',    label: 'Editais de Concurso',  icon: <EditaisIcon />,    breadcrumb: ['Gestão', 'Editais de Concurso'] },
  { id: 'cadastros',  label: 'Cadastros',           icon: <CadastrosIcon />,  breadcrumb: ['Administração', 'Cadastros'] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Theme
// ═══════════════════════════════════════════════════════════════════════════════

const theme = createTheme({
  palette: {
    primary:    { main: PRIMARY },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text:       { primary: '#1e293b', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h6: { fontWeight: 700, fontSize: '0.95rem' },
  },
  shape: { borderRadius: 10 },
  transitions: {
    duration: { enteringScreen: 250, leavingScreen: 200 },
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// Styled components
// ═══════════════════════════════════════════════════════════════════════════════

/** Main content area — shifts when drawer opens */
const Main = styled('main')(() => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
}));

/** Glassmorphism AppBar */
const GlassAppBar = styled(AppBar)(({ theme: t }) => ({
  backgroundColor: alpha('#ffffff', 0.72),
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  boxShadow: 'none',
  color: t.palette.text.primary,
  zIndex: t.zIndex.drawer + 1,
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard page
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardPage({ user }: { user: User | null }) {
  const cards = [
    { icon: <FlashcardsIcon sx={{ fontSize: 28, color: PRIMARY }} />, title: 'Flashcards', desc: 'Estude com repetição espaçada usando o algoritmo FSRS.', bg: alpha(PRIMARY, 0.08) },
    { icon: <QuestoesIcon sx={{ fontSize: 28, color: '#7c3aed' }} />,  title: 'Questões EBSERH', desc: 'Pratique com questões dos concursos EBSERH.', bg: alpha('#7c3aed', 0.08) },
    { icon: <EditaisIcon sx={{ fontSize: 28, color: '#059669' }} />,   title: 'Editais', desc: 'Gerencie editais de concurso com cargos e conteúdo.',  bg: alpha('#059669', 0.08) },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Selecione uma ferramenta no menu lateral para começar.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        {cards.map((c) => (
          <Box
            key={c.title}
            sx={{
              p: 3, borderRadius: 2.5, bgcolor: 'background.paper', border: '1px solid',
              borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'flex-start',
              transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
            }}
          >
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.icon}
            </Box>
            <Box>
              <Typography fontWeight={700} variant="subtitle1">{c.title}</Typography>
              <Typography variant="body2" color="text.secondary">{c.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Drawer Content (shared between permanent and temporary)
// ═══════════════════════════════════════════════════════════════════════════════

interface DrawerContentProps {
  open: boolean;
  active: string;
  user: User | null;
  onNavigate: (id: string) => void;
  onToggle: () => void;
  onLogout: () => void;
}

function DrawerContent({ open, active, user, onNavigate, onToggle, onLogout }: DrawerContentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG, color: '#fff', overflow: 'hidden' }}>

      {/* ── Logo + collapse toggle ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: open ? 2.5 : 0, height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              AG
            </Box>
            <Typography variant="h6" noWrap sx={{ color: '#fff', fontSize: '0.85rem' }}>
              Área do Aluno
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
            AG
          </Box>
        )}
        <IconButton onClick={onToggle} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' }, display: { xs: 'none', lg: 'flex' }, ml: open ? 0 : 'auto', mr: open ? 0 : 'auto' }}>
          <ChevronLeftIcon sx={{ transform: open ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </IconButton>
      </Box>

      {/* ── User profile (expanded only) ── */}
      {open && user && (
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Avatar src={user.picture} alt={user.name} sx={{ width: 36, height: 36, bgcolor: alpha(PRIMARY, 0.5), fontSize: 14 }}>
            {user.name?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#fff', fontSize: '0.8rem' }}>{user.name}</Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.35)', display: 'block' }}>{user.email}</Typography>
          </Box>
        </Box>
      )}

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5 }}>
        {open && (
          <Typography variant="overline" sx={{ px: 2.5, mb: 0.5, display: 'block', color: 'rgba(255,255,255,0.25)', fontSize: '0.6rem', letterSpacing: 2 }}>
            Menu
          </Typography>
        )}
        <List sx={{ px: 1 }}>
          {MENU_ITEMS.map(({ id, label, icon }) => {
            const isActive = active === id;
            return (
              <Tooltip key={id} title={open ? '' : label} placement="right" arrow>
                <ListItemButton
                  onClick={() => onNavigate(id)}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2,
                    mb: 0.3,
                    px: open ? 2 : 0,
                    justifyContent: open ? 'initial' : 'center',
                    position: 'relative',
                    bgcolor: isActive ? alpha(PRIMARY, 0.15) : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    '&:hover': {
                      bgcolor: isActive ? alpha(PRIMARY, 0.2) : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                    },
                    // Active indicator bar
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 3,
                      borderRadius: 4,
                      bgcolor: PRIMARY,
                    } : {},
                  }}
                >
                  <ListItemIcon sx={{ minWidth: open ? 40 : 0, justifyContent: 'center', color: isActive ? PRIMARY : 'rgba(255,255,255,0.45)' }}>
                    {icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, noWrap: true }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* ── Logout ── */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', p: 1, flexShrink: 0 }}>
        <Tooltip title={open ? '' : 'Sair'} placement="right" arrow>
          <ListItemButton
            onClick={onLogout}
            sx={{
              minHeight: 44,
              borderRadius: 2,
              px: open ? 2 : 0,
              justifyContent: open ? 'initial' : 'center',
              color: 'rgba(255,255,255,0.4)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#ef4444' },
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 0, justifyContent: 'center', color: 'inherit' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {open && <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: '0.82rem' }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Layout Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function AreaDoAluno({ user, onExit }: AreaDoAlunoProps) {
  const [active, setActive]         = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Profile dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(anchorEl);

  const navigate = (id: string) => { setActive(id); setMobileOpen(false); };

  const handleLogout = async () => {
    setAnchorEl(null);
    try { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    onExit();
  };

  const toggleDrawer = () => {
    if (isDesktop) setDrawerOpen(o => !o);
    else setMobileOpen(o => !o);
  };

  // Auto-close mobile drawer on resize to desktop
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  // Current breadcrumb
  const breadcrumb = useMemo(() => {
    const item = MENU_ITEMS.find(m => m.id === active);
    return item?.breadcrumb || ['Área do Aluno'];
  }, [active]);

  const currentDrawerWidth = drawerOpen ? DRAWER_WIDTH : DRAWER_MINI;

  // Loader
  const PageLoader = (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
      <CircularProgress size={32} />
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>

        {/* ═══════════════════════════════════════════════════════════════════
            Desktop Drawer (persistent mini-variant)
            ═══════════════════════════════════════════════════════════════════ */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: currentDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
              bgcolor: SIDEBAR_BG,
            },
          }}
        >
          <DrawerContent
            open={drawerOpen}
            active={active}
            user={user}
            onNavigate={navigate}
            onToggle={() => setDrawerOpen(o => !o)}
            onLogout={handleLogout}
          />
        </Drawer>

        {/* ═══════════════════════════════════════════════════════════════════
            Mobile Drawer (temporary overlay)
            ═══════════════════════════════════════════════════════════════════ */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              bgcolor: SIDEBAR_BG,
            },
          }}
        >
          <DrawerContent
            open={true}
            active={active}
            user={user}
            onNavigate={navigate}
            onToggle={() => setMobileOpen(false)}
            onLogout={handleLogout}
          />
        </Drawer>

        {/* ═══════════════════════════════════════════════════════════════════
            Main Content Area
            ═══════════════════════════════════════════════════════════════════ */}
        <Main>

          {/* ── Glass AppBar ── */}
          <GlassAppBar position="sticky">
            <Toolbar sx={{ minHeight: '64px !important', gap: 1 }}>
              {/* Hamburger */}
              <IconButton
                onClick={toggleDrawer}
                edge="start"
                sx={{ color: 'text.secondary', mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>

              {/* Breadcrumb */}
              <Breadcrumbs
                separator={<NavNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
                sx={{ flex: 1, display: { xs: 'none', sm: 'flex' } }}
              >
                <MuiLink
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.82rem', cursor: 'pointer' }}
                  onClick={() => navigate('dashboard')}
                >
                  <SchoolIcon sx={{ fontSize: 16 }} />
                  Área do Aluno
                </MuiLink>
                {breadcrumb.map((crumb, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{
                      color: i === breadcrumb.length - 1 ? 'text.primary' : 'text.secondary',
                      fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                      fontSize: '0.82rem',
                    }}
                  >
                    {crumb}
                  </Typography>
                ))}
              </Breadcrumbs>

              {/* Mobile: show page title */}
              <Typography variant="h6" noWrap sx={{ flex: 1, display: { xs: 'block', sm: 'none' }, fontSize: '0.85rem' }}>
                {MENU_ITEMS.find(m => m.id === active)?.label || 'Área do Aluno'}
              </Typography>

              {/* ── Profile section ── */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.75,
                  borderRadius: 3, cursor: 'pointer',
                  '&:hover': { bgcolor: alpha('#000', 0.04) },
                  transition: 'background-color 0.15s',
                }}
              >
                <Avatar
                  src={user?.picture}
                  alt={user?.name}
                  sx={{ width: 34, height: 34, bgcolor: PRIMARY, fontSize: 14 }}
                  imgProps={{ referrerPolicy: 'no-referrer' }}
                >
                  {user?.name?.[0]}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' }, lineHeight: 1.3 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem', maxWidth: 140 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 140 }}>
                    {user?.email}
                  </Typography>
                </Box>
                <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled', display: { xs: 'none', md: 'block' } }} />
              </Box>

              {/* Profile dropdown menu */}
              <Menu
                anchorEl={anchorEl}
                open={profileOpen}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <MenuItem onClick={handleLogout} sx={{ mt: 0.5, color: '#ef4444', gap: 1.5, fontSize: '0.85rem' }}>
                  <LogoutIcon fontSize="small" />
                  Sair
                </MenuItem>
              </Menu>
            </Toolbar>
          </GlassAppBar>

          {/* ── Page content ── */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Suspense fallback={PageLoader}>
              {active === 'dashboard'  && <DashboardPage user={user} />}
              {active === 'flashcards' && <Flashcards embedded />}
              {active === 'questoes'   && <QuestoesEBSERH embedded />}
              {active === 'editais'    && <Editais />}
              {active === 'cadastros'  && <Cadastros />}
            </Suspense>
          </Box>
        </Main>
      </Box>
    </ThemeProvider>
  );
}
