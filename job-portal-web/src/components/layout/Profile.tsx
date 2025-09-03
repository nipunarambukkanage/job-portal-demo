import { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ButtonBase,
  Chip,
} from '@mui/material';
import {
  Person as ProfileIcon,
  ExitToApp as SignOutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useUser, useClerk } from '@clerk/clerk-react';

export default function Profile() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);

  const handleOpenMenu = () => {
    setAnchorEl(profileRef.current);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    openUserProfile();
    handleCloseMenu();
  };

  const handleSignOut = () => {
    signOut();
    handleCloseMenu();
  };

  if (!user) return null;

  console.log('User profile*********************:', user);

  const userRole = (user.organizationMemberships[0]?.roleName as string) || 'User';
  const userName = user.fullName || 'Job Portal User';
  const userInitials =
    user.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <>
      <ButtonBase
        ref={profileRef}
        onClick={handleOpenMenu}
        sx={{
          display: 'flex',
          alignItems: 'left',
          gap: 1,
          pt: 0.5,
          pb: 0.5,
          pl: 1,
          pr: 3,
          borderRadius: 10,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
          }}
          src={user.imageUrl}
        >
          {userInitials}
        </Avatar>
        <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
            {userName}
          </Typography>
          <Chip
            label={userRole === 'Admin' ? 'Admin' : 'Member'}
            variant="outlined"
            color={userRole === 'Admin' ? 'secondary' : 'default'}
            size="small"
            sx={{ mt: 0.5, p: -1, fontWeight: 400, fontSize: '0.55rem' }}
          />
        </Box>
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
