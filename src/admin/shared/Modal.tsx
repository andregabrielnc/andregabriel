import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { colors } from '../theme/tokens';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function Modal({ open, title, onClose, children, footer, maxWidth = 'sm' }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 600 }}>
        {title}
        <IconButton size="small" onClick={onClose} sx={{ color: colors.textSecondary }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>{children}</Box>
      </DialogContent>
      {footer && <DialogActions sx={{ px: 3, pb: 2 }}>{footer}</DialogActions>}
    </Dialog>
  );
}
