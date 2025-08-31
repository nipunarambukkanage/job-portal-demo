import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import React from 'react';

export default function RequireAuth({ children }: { children: React.JSX.Element }) {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return <RedirectToSignIn />;
  return children;
}