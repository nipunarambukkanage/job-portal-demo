import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import AppProviders from "./providers/AppProviders";
import RouteProgress from "./components/common/RouteProgress";
import MainShell from "./components/layout/MainShell";
import { SignedIn } from "@clerk/clerk-react";

// Import fonts once (bundled)
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <RouteProgress />
        <SignedIn>
          <MainShell>
            <AppRoutes />
          </MainShell>
        </SignedIn>
        {/* When signed out, AppRoutes should include /sign-in route; guards already exist */}
        <SignedIn fallback={<AppRoutes />} />
      </AppProviders>
    </BrowserRouter>
  );
}
