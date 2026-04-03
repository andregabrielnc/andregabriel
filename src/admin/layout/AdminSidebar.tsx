import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { colors, layout, typography } from '../theme/tokens';
import SidebarNavItem from './SidebarNavItem';
import type { ReactElement } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactElement;
}

interface AdminSidebarProps {
  open: boolean;
  active: string;
  menuItems: MenuItem[];
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ open, active, menuItems, onNavigate, onLogout }: AdminSidebarProps) {
  const w = open ? layout.sidebarWidth : layout.sidebarCollapsed;

  return (
    <Box
      sx={{
        width: w,
        minWidth: w,
        bgcolor: colors.bgSurface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center', px: open ? 2 : 0, height: layout.navbarHeight, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff', flexShrink: 0 }}>
            AG
          </Box>
          {open && (
            <Typography noWrap sx={{ color: colors.text, fontSize: typography.sm, fontWeight: 700 }}>
              Área do Aluno
            </Typography>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {open && (
          <Typography variant="overline" sx={{ px: 2, mb: 0.5, display: 'block', color: colors.textDim, fontSize: '0.6rem', letterSpacing: 2 }}>
            Menu
          </Typography>
        )}
        <List sx={{ px: 0.75 }}>
          {menuItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              active={active === item.id}
              open={open}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ borderTop: `1px solid ${colors.border}`, p: 0.75, flexShrink: 0 }}>
        <Tooltip title={open ? '' : 'Sair'} placement="right" arrow>
          <ListItemButton
            onClick={onLogout}
            sx={{
              minHeight: 40,
              borderRadius: 1.5,
              px: open ? 1.5 : 0,
              justifyContent: open ? 'initial' : 'center',
              color: colors.textSecondary,
              '&:hover': { bgcolor: colors.dangerBg, color: colors.danger },
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 36 : 0, justifyContent: 'center', color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 20 } }}>
              <LogoutIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: typography.sm }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
