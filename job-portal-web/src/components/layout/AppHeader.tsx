import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import useRole from "../../hooks/useRole";

// Font CSS (bundled via fontsource)
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";

export default function AppHeader() {
  const role = useRole();

  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
        {/* Left: Title */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
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

        {/* Right: Role badge + Clerk user */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={role === "admin" ? "Admin" : "Member"}
            variant="outlined"
            color={role === "admin" ? "secondary" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: { borderRadius: 14 },
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
