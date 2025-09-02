import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

const mainItems = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Jobs', to: ROUTES.jobs.list },
  { label: 'Applications', to: ROUTES.applications.list },
  // { label: "Organizations", to: ROUTES.orgs.list },
  { label: 'Dashboard', to: ROUTES.dashboard.user },
  { label: 'Search', to: ROUTES.search },
  { label: 'Profile', to: ROUTES.profile },
  { label: 'Recommendations (AI)', to: ROUTES.ai.recommendations },
  { label: 'Resume Insights (AI)', to: ROUTES.ai.resume },
  { label: 'Analytics (AI)', to: ROUTES.ai.analytics },
];

export default function SideNav({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  const list = (
    <>
      <Toolbar />
      <List>
        {mainItems.map((it) => (
          <ListItemButton
            key={it.to}
            component={Link}
            to={it.to as string}
            selected={location.pathname === it.to}
            onClick={onClose}
          >
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{ display: { xs: 'block', md: 'none', top: 70 } }}
      >
        {list}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          width: { md: 260, top: 70 },
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: 260, top: 70 },
        }}
        open
      >
        {list}
      </Drawer>
    </>
  );
}
