import { Box } from '@mui/material';
import { colors, layout, typography } from '../theme/tokens';

interface CadastrosSubNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const ITEMS = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'editais',  label: 'Editais' },
];

export default function CadastrosSubNav({ active, onNavigate }: CadastrosSubNavProps) {
  return (
    <Box
      sx={{
        width: layout.subNavWidth,
        minWidth: layout.subNavWidth,
        bgcolor: colors.bgSurface,
        borderRight: `1px solid ${colors.border}`,
        py: 1.5,
        flexShrink: 0,
      }}
    >
      {ITEMS.map((item) => (
        <Box
          key={item.id}
          onClick={() => onNavigate(item.id)}
          sx={{
            px: 2,
            py: 1,
            cursor: 'pointer',
            fontSize: typography.sm,
            fontWeight: active === item.id ? 600 : 400,
            color: active === item.id ? colors.primary : colors.textSecondary,
            '&:hover': { color: colors.primary },
          }}
        >
          {item.label}
        </Box>
      ))}
    </Box>
  );
}
