import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import React from 'react';

export default function RequireRole({ role, children }: { role: 'org:admin'|'org:member'; children: React.JSX.Element }) {
  const { user } = useUser();
  const current = (user?.organizationMemberships[0]?.role as 'org:admin'|'org:member'|undefined) || 'org:member';
  if (current !== role) return <Navigate to='/403' replace />;
  return children;
}