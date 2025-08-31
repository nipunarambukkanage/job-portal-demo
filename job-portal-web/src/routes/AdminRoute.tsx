import RequireRole from '../components/auth/RequireRole';
export default function AdminRoute({ children }:{ children: JSX.Element }){ return <RequireRole role='admin'>{children}</RequireRole>; }
