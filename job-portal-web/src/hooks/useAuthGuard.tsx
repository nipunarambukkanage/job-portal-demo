import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import React from 'react';

export const RequireSignedIn = ({ children }: { children: React.JSX.Element }) => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return React.createElement(Navigate, { to: '/sign-in', replace: true } as any);
  }

  return children;
};

export default RequireSignedIn;
