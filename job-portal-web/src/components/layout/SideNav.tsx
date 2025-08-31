import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

const items = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Jobs', to: ROUTES.jobs },
  { label: 'Dashboard', to: ROUTES.dashboard },
  { label: 'AI', to: ROUTES.ai },
  { label: 'Profile', to: ROUTES.profile }
];

export default function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: ()=>void }) {
  const location = useLocation();

  const list = (
    <>
      <Toolbar />
      <List>
        {items.map((it) => (
          <ListItemButton key={it.to} component={Link} to={it.to} selected={location.pathname === it.to} onClick={onClose}>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      <Drawer variant='temporary' open={mobileOpen} onClose={onClose} sx={{ display: { xs: 'block', md: 'none' } }}>
        {list}
      </Drawer>
      <Drawer variant='permanent' sx={{ width: { md: 260 }, display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 260 } }} open>
        {list}
      </Drawer>
    </>
  );
}
