import { TextField } from '@mui/material';
import type { SxProps } from '@mui/material';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  sx?: SxProps;
  error?: boolean;
  helperText?: string;
}

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return d;
  if (d.length <= 7)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function PhoneInput({ value, onChange, label = 'Celular', sx, error, helperText }: PhoneInputProps) {
  return (
    <TextField
      type="tel"
      label={label}
      value={formatPhone(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="(00) 00000-0000"
      fullWidth
      size="small"
      sx={sx}
      error={error}
      helperText={helperText}
    />
  );
}
