import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from '../theme';
import SnackbarProvider from '../components/feedback/SnackbarProvider';
import ErrorBoundary from '../components/feedback/ErrorBoundary';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signedIn, signedOut } from '../store/slices/authSlice';
import { useEffect } from 'react';
import { clerkPublishableKey } from '../config/clerk';
import { useApiBridge } from '../hooks/useApi';
import { useSignalR } from '../hooks/useSignalR';

function SyncAuthToRedux() {
  const { isSignedIn, user } = useUser();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (isSignedIn && user) {
      const role = (user.publicMetadata?.role as any) || 'user';
      dispatch(
        signedIn({
          role,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || '',
        }),
      );
    } else {
      dispatch(signedOut());
    }
  }, [isSignedIn, user, dispatch]);
  return null;
}

function Theming({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.ui.theme);
  return (
    <ThemeProvider theme={buildTheme(mode)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function AppGuards({ children }: { children: React.ReactNode }) {
  useApiBridge();
  useSignalR();
  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <Provider store={store}>
        <Theming>
          <SnackbarProvider>
            <ErrorBoundary>
              <SyncAuthToRedux />
              <SignedIn>
                <AppGuards>{children}</AppGuards>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </ErrorBoundary>
          </SnackbarProvider>
        </Theming>
      </Provider>
    </ClerkProvider>
  );
}
