import { useState } from 'react';
import {
  Box, IconButton, Typography, Breadcrumbs, Avatar, Menu as MuiMenu, MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NavigateNext as NavNextIcon,
  School as SchoolIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { colors, layout, typography } from '../theme/tokens';

interface AdminNavbarProps {
  breadcrumb: string[];
  user: { name?: string; email?: string; picture?: string } | null;
  onToggleSidebar: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export default function AdminNavbar({ breadcrumb, user, onToggleSidebar, onNavigateHome, onLogout }: AdminNavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        height: layout.navbarHeight,
        bgcolor: colors.bgSurface,
        flexShrink: 0,
      }}
    >
      {/* Hamburger */}
      <IconButton onClick={onToggleSidebar} edge="start" sx={{ color: colors.textSecondary, mr: 0.5 }}>
        <MenuIcon />
      </IconButton>

      {/* Breadcrumb */}
      <Breadcrumbs
        separator={<NavNextIcon fontSize="small" sx={{ color: colors.textDim }} />}
        sx={{ flex: 1, display: { xs: 'none', sm: 'flex' } }}
      >
        <Typography
          variant="body2"
          onClick={onNavigateHome}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.textSecondary, fontSize: typography.sm, cursor: 'pointer', '&:hover': { color: colors.primary } }}
        >
          <SchoolIcon sx={{ fontSize: 16 }} />
          Área do Aluno
        </Typography>
        {breadcrumb.map((crumb, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              color: i === breadcrumb.length - 1 ? colors.text : colors.textSecondary,
              fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
              fontSize: typography.sm,
            }}
          >
            {crumb}
          </Typography>
        ))}
      </Breadcrumbs>

      {/* Mobile title */}
      <Typography variant="h6" noWrap sx={{ flex: 1, display: { xs: 'block', sm: 'none' }, fontSize: typography.sm }}>
        {breadcrumb[breadcrumb.length - 1] || 'Área do Aluno'}
      </Typography>

      {/* Profile */}
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.5,
          borderRadius: 2, cursor: 'pointer',
          '&:hover': { bgcolor: colors.bgAlt },
        }}
      >
        <Avatar
          src={user?.picture}
          alt={user?.name}
          sx={{ width: 32, height: 32, bgcolor: colors.primary, fontSize: 13 }}
          imgProps={{ referrerPolicy: 'no-referrer' }}
        >
          {user?.name?.[0]}
        </Avatar>
        <Box sx={{ display: { xs: 'none', md: 'block' }, lineHeight: 1.3 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: typography.xs, maxWidth: 130 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 130, color: colors.textSecondary }}>
            {user?.email}
          </Typography>
        </Box>
        <ExpandMoreIcon sx={{ fontSize: 16, color: colors.textDim, display: { xs: 'none', md: 'block' } }} />
      </Box>

      {/* Dropdown */}
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>{user?.email}</Typography>
        </Box>
        <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }} sx={{ mt: 0.5, color: colors.danger, gap: 1.5, fontSize: typography.sm }}>
          <LogoutIcon fontSize="small" />
          Sair
        </MenuItem>
      </MuiMenu>
    </Box>
  );
}
