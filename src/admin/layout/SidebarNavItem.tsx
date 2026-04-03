import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { colors, typography } from '../theme/tokens';
import type { ReactElement } from 'react';

interface SidebarNavItemProps {
  id: string;
  label: string;
  icon: ReactElement;
  active: boolean;
  open: boolean;
  onClick: () => void;
}

export default function SidebarNavItem({ label, icon, active, open, onClick }: SidebarNavItemProps) {
  return (
    <Tooltip title={open ? '' : label} placement="right" arrow>
      <ListItemButton
        onClick={onClick}
        sx={{
          minHeight: 40,
          borderRadius: 1.5,
          mb: 0.25,
          px: open ? 1.5 : 0,
          justifyContent: open ? 'initial' : 'center',
          color: active ? colors.primary : colors.textSecondary,
          bgcolor: 'transparent',
          '&:hover': { bgcolor: colors.bgAlt },
        }}
      >
        <ListItemIcon sx={{ minWidth: open ? 36 : 0, justifyContent: 'center', color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 20 } }}>
          {icon}
        </ListItemIcon>
        {open && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: typography.sm,
              fontWeight: active ? 600 : 400,
              noWrap: true,
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
}
