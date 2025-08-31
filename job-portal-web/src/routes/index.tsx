import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Spinner from '../components/feedback/Spinner';

const Home = lazy(()=>import('../pages/home/HomePage'));
const Jobs = lazy(()=>import('../pages/jobs/JobsListPage'));
const UserDash = lazy(()=>import('../pages/dashboard/UserDashboardPage'));
const AdminDash = lazy(()=>import('../pages/dashboard/AdminDashboardPage'));
const Profile = lazy(()=>import('../pages/profile/ProfilePage'));
const NotFound = lazy(()=>import('../pages/errors/NotFoundPage'));
const Forbidden = lazy(()=>import('../pages/errors/ForbiddenPage'));

export default function AppRoutes(){
  return (
    <AppLayout>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/jobs' element={<ProtectedRoute><Jobs/></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><UserDash/></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute><AdminRoute><AdminDash/></AdminRoute></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path='/403' element={<Forbidden/>} />
          <Route path='*' element={<NotFound/>} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
