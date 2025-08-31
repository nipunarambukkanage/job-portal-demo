import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { componentsOverrides } from './componentsOverrides';

export const buildTheme = (mode: 'light' | 'dark' = 'light') =>
  createTheme({
    palette: { ...palette, mode },
    typography,
    components: componentsOverrides
  });
