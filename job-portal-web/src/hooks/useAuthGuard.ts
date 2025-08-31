import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export const RequireSignedIn = ({ children }: { children: JSX.Element }) => {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return <Navigate to='/sign-in' replace />;
  return children;
};
