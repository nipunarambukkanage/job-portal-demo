import { AppBar as MAppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ReactNode } from 'react';

export default function AppBar({ onMenu }: { onMenu: ()=>void }) {
  return (
    <MAppBar position='fixed' color='inherit'>
      <Toolbar>
        <IconButton edge='start' onClick={onMenu} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' sx={{ flexGrow: 1 }}>Job Portal</Typography>
        <Box />
      </Toolbar>
    </MAppBar>
  );
}
