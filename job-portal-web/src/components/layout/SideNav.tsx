import { Drawer, List, ListItemButton, ListItemText, Toolbar, ListSubheader } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const mainItems = [
  { label: "Home", to: ROUTES.home },
  { label: "Jobs", to: ROUTES.jobs.list },
  { label: "Applications", to: ROUTES.applications.list },
  { label: "Organizations", to: ROUTES.orgs.list },
  { label: "Dashboard", to: ROUTES.dashboard.user },
  { label: "Search", to: ROUTES.search },
  { label: "Profile", to: ROUTES.profile },
];

const aiItems = [
  { label: "Recommendations", to: ROUTES.ai.recommendations },
  { label: "Resume Insights", to: ROUTES.ai.resume },
  { label: "Analytics", to: ROUTES.ai.analytics },
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
      <List subheader={<ListSubheader>Main</ListSubheader>}>
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

      <List subheader={<ListSubheader>AI</ListSubheader>}>
        {aiItems.map((it) => (
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
        sx={{ display: { xs: "block", md: "none", top: 70 } }}
      >
        {list}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          width: { md: 260, top: 70 },
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: 260, top: 70 },
        }}
        open
      >
        {list}
      </Drawer>
    </>
  );
}
