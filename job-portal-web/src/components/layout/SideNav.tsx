import * as React from "react";
import { NavLink } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import StarIcon from "@mui/icons-material/Star";
import InsightsIcon from "@mui/icons-material/Insights";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import useRole from "../../hooks/useRole";
import ROUTES from "../../config/routes"; // routes object exists already
// (ROUTES jobs/applications/ai etc.) :contentReference[oaicite:8]{index=8}

const width = 240;

const LinkItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <ListItem disablePadding>
    <ListItemButton component={NavLink} to={to}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);

export default function SideNav() {
  const role = useRole();

  return (
    <Drawer
      open
      variant="permanent"
      PaperProps={{ sx: { position: "relative", width, borderRight: "1px solid #eee" } }}
    >
      <List sx={{ pt: 2 }}>
        <LinkItem to={ROUTES.search} icon={<SearchIcon />} label="Search Jobs" />
        <LinkItem to={ROUTES.jobs.list} icon={<WorkIcon />} label="All Jobs" />
        <LinkItem to={ROUTES.ai.recommendations} icon={<InsightsIcon />} label="Recommendations" />
        <LinkItem to={ROUTES.applications.list} icon={<DescriptionIcon />} label="My Applications" />
        <LinkItem to={ROUTES.dashboard.user} icon={<BarChartIcon />} label="My Analytics" />
        <LinkItem to="/stars" icon={<StarIcon />} label="Starred Jobs" />
      </List>

      {role === "admin" && (
        <>
          <Divider sx={{ my: 1 }} />
          <List subheader={<li style={{ padding: "8px 16px", fontWeight: 600 }}>Admin</li> as any}>
            <LinkItem to={ROUTES.jobs.create} icon={<AddIcon />} label="Create Job" />
            <LinkItem to={ROUTES.applications.list} icon={<GroupIcon />} label="Applicants" />
            <LinkItem to={ROUTES.dashboard.admin} icon={<BarChartIcon />} label="Admin Analytics" />
          </List>
        </>
      )}
    </Drawer>
  );
}
