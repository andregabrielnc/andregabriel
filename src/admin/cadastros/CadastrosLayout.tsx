import { useState, Suspense, lazy } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { colors, typography } from '../theme/tokens';

const Cadastros = lazy(() => import('../../pages/Cadastros'));
const Editais = lazy(() => import('../../pages/Editais'));

const Loader = (
  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress size={28} />
  </Box>
);

export default function CadastrosLayout() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: colors.bgSurface, px: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ sx: { height: 2 } }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 400,
              fontSize: typography.sm,
              minHeight: 40,
              color: colors.textSecondary,
              '&.Mui-selected': { fontWeight: 500, color: colors.text },
            },
          }}
        >
          <Tab label="Usuários" />
          <Tab label="Editais" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: tab === 1 ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Suspense fallback={Loader}>
          {tab === 0 && <Cadastros />}
          {tab === 1 && <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Editais /></Box>}
        </Suspense>
      </Box>
    </Box>
  );
}
