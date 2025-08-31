import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import React from 'react';

export default function RequireRole({ role, children }: { role: 'admin'|'user'; children: React.JSX.Element }) {
  const { user } = useUser();
  const current = (user?.publicMetadata?.role as 'admin'|'user'|undefined) || 'user';
  if (current !== role) return <Navigate to='/403' replace />;
  return children;
}