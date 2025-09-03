import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import useRole from '../../hooks/useRole';
import MenuIcon from '@mui/icons-material/Menu';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-sans/400.css';
import Profile from './Profile';

export default function HeaderComponent({ onMenu }: { onMenu: () => void }) {
  const role = useRole();

  console.log('Role in header***************:', role);

  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Toolbar>
        <IconButton edge='start' onClick={onMenu} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        {/* Left: Title */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}
          >
            Job Portal
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: "'DM Sans', sans-serif", opacity: 0.8 }}
          >
            by Nipuna Rambukkanage
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <SignedIn>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
              <IconButton disabled sx={{ color: 'text.secondary', mx: 0.5 }}>
                <MailOutlineIcon fontSize="small" />
              </IconButton>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, height: 24, alignSelf: 'center' }}
              />

              <IconButton disabled sx={{ color: 'text.secondary', mx: 0.5 }}>
                <NotificationsNoneIcon fontSize="small" />
              </IconButton>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, height: 24, alignSelf: 'center' }}
              />

              <IconButton disabled sx={{ color: 'text.secondary', mx: 0.5 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Chip
              label={role === 'org:admin' ? 'Admin' : 'Member'}
              variant="outlined"
              color={role === 'org:admin' ? 'secondary' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Profile />
            </Box>
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
