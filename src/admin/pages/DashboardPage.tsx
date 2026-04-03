import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  MenuBook as FlashcardsIcon,
  Assignment as QuestoesIcon,
  Description as EditaisIcon,
} from '@mui/icons-material';
import { colors, typography } from '../theme/tokens';

interface DashboardPageProps {
  user: { name?: string } | null;
}

const cards = [
  { icon: <FlashcardsIcon sx={{ fontSize: 28, color: colors.primary }} />, title: 'Flashcards', desc: 'Estude com repetição espaçada usando o algoritmo FSRS.', bg: alpha(colors.primary, 0.08) },
  { icon: <QuestoesIcon sx={{ fontSize: 28, color: '#7c3aed' }} />,  title: 'Questões EBSERH', desc: 'Pratique com questões dos concursos EBSERH.', bg: alpha('#7c3aed', 0.08) },
  { icon: <EditaisIcon sx={{ fontSize: 28, color: '#059669' }} />,   title: 'Editais', desc: 'Gerencie editais de concurso com cargos e conteúdo.',  bg: alpha('#059669', 0.08) },
];

export default function DashboardPage({ user }: DashboardPageProps) {
  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: typography.headingFamily }}>
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
              p: 3, borderRadius: 2, bgcolor: colors.bgSurface, border: `1px solid ${colors.border}`,
              display: 'flex', gap: 2, alignItems: 'flex-start',
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
