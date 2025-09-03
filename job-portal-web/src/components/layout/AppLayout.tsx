import { Box, Toolbar, Container } from '@mui/material';
import { useState } from 'react';
import HeaderComponent from './HeaderComponent';
import Footer from './Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex' }}>
      <HeaderComponent onMenu={() => setOpen(true)} />
      <Box component="main" sx={{ flexGrow: 1, mt: 8, mb: 2 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
}
