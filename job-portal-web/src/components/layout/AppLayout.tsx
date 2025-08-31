import { Box, Toolbar, Container } from '@mui/material';
import { useState } from 'react';
import AppBar from './AppBar';
import SideNav from './SideNav';
import Footer from './Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar onMenu={() => setOpen(true)} />
      <SideNav mobileOpen={open} onClose={() => setOpen(false)} />
      <Box component='main' sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth='xl' sx={{ py: 3 }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
}
