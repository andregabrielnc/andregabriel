import { createTheme } from '@mui/material/styles';
import { colors, typography } from './tokens';

const adminTheme = createTheme({
  palette: {
    primary:    { main: colors.primary, dark: colors.primaryDark, light: colors.primaryLight },
    background: { default: colors.bgDefault, paper: colors.bgSurface },
    text:       { primary: colors.text, secondary: colors.textSecondary },
    error:      { main: colors.danger },
    success:    { main: colors.success },
    warning:    { main: colors.warning },
    divider:    colors.border,
  },
  typography: {
    fontFamily: typography.fontFamily,
    h6:   { fontFamily: typography.headingFamily, fontWeight: 700 },
    body2: { fontSize: typography.base },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 500, fontSize: typography.sm },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' as const, variant: 'outlined' as const },
    },
    MuiSelect: {
      defaultProps: { size: 'small' as const },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: 'none', border: `1px solid ${colors.border}` },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
  },
});

export default adminTheme;
