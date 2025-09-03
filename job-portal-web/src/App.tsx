import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import AppProviders from './providers/AppProviders';
import RouteProgress from './components/common/RouteProgress';
import MainShell from './components/layout/MainShell';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-sans/400.css';

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
        <SignedOut>
          <AppRoutes />
        </SignedOut>
      </AppProviders>
    </BrowserRouter>
  );
}
