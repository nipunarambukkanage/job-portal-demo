import * as React from 'react';
import Box from '@mui/material/Box';
import SideNav from './SideNav';

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', width: '85%', marginLeft: '15%',}}>
      <SideNav />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ p: 2, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
