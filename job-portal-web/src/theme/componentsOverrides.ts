import { Components } from '@mui/material/styles';

export const componentsOverrides: Components = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 12, textTransform: 'none', boxShadow: 'none' }
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: { boxShadow: 'none', borderBottom: '1px solid #eaeff4' }
    }
  },
  MuiPaper: {
    styleOverrides: { root: { borderRadius: 16 } }
  }
};
