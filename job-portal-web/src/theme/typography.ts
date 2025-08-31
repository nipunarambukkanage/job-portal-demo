import { TypographyOptions } from '@mui/material/styles';

export const typography: TypographyOptions = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Helvetica Neue',
    'sans-serif'
  ].join(','),
  h1: { fontSize: '2.2rem', fontWeight: 700 },
  h2: { fontSize: '1.8rem', fontWeight: 700 },
  h3: { fontSize: '1.5rem', fontWeight: 700 }
};
