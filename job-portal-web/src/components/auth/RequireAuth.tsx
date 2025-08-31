import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
export default function RequireAuth({ children }:{ children: JSX.Element }){
  const { isSignedIn } = useUser();
  if (!isSignedIn) return <RedirectToSignIn />;
  return children;
}
