// src/pages/profile/ProfilePage.tsx
import { UserProfile } from '@clerk/clerk-react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkIcon from '@mui/icons-material/Link';

export default function ProfilePage() {
  return (
    <UserProfile routing="path" path="/profile">
      <UserProfile.Page
        label="Profile"
        url="profile"
        labelIcon={<AccountCircleIcon fontSize="small" />}
      />
      <UserProfile.Page
        label="Email addresses"
        url="email-addresses"
        labelIcon={<AlternateEmailIcon fontSize="small" />}
      />
      <UserProfile.Page
        label="Connected accounts"
        url="connected-accounts"
        labelIcon={<LinkIcon fontSize="small" />}
      />
    </UserProfile>
  );
}
