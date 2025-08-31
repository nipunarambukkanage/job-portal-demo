import RequireRole from '../components/auth/RequireRole';
import React from 'react';

export default function AdminRoute({ children }: { children: React.JSX.Element }) {
  return <RequireRole role='admin'>{children}</RequireRole>;
}