import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import useRole from '../../hooks/useRole';
import MenuIcon from '@mui/icons-material/Menu';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-sans/400.css';
import Profile from './Profile';

type Props = {
  onMenu: () => void;
};

export default function HeaderComponent({ onMenu }: Props) {
  const role = useRole();

  return (
    <AppBar position="fixed" color="inherit">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <IconButton
            edge="start"
            onClick={onMenu}
            aria-label="Open menu"
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h5"
            sx={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}
          >
            Job Portal
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: "'DM Sans', sans-serif", opacity: 0.8, ml: 1 }}
          >
            by Nipuna Rambukkanage
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1} alignItems="center">
          <SignedIn>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1 }}>
              <IconButton aria-label="Mail" disabled sx={{ color: 'text.secondary' }}>
                <MailOutlineIcon fontSize="small" />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ height: 24 }} />

              <IconButton aria-label="Notifications" disabled sx={{ color: 'text.secondary' }}>
                <NotificationsNoneIcon fontSize="small" />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ height: 24 }} />

              <IconButton aria-label="Help" disabled sx={{ color: 'text.secondary' }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
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
