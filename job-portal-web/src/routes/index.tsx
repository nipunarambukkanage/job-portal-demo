import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Spinner from "../components/feedback/Spinner";
import AnalyticsInsightsPage from "../pages/ai/AnalyticsInsightsPage";
import UserDashboardPage from "../pages/dashboard/UserDashboardPage";

const Home = lazy(() => import("../pages/home/HomePage"));
const Jobs = lazy(() => import("../pages/jobs/JobsListPage"));
const JobCreate = lazy(() => import("../pages/jobs/JobCreatePage"));
const JobDetail = lazy(() => import("../pages/jobs/JobDetailPage"));
const JobEdit = lazy(() => import("../pages/jobs/JobEditPage"));

const AppsList = lazy(() => import("../pages/applications/ApplicationsListPage"));
const AppDetail = lazy(() => import("../pages/applications/ApplicationDetailPage"));
const AppStatus = lazy(() => import("../pages/applications/ApplicationStatusPage"));

const Orgs = lazy(() => import("../pages/orgs/OrgsListPage"));
const OrgCreate = lazy(() => import("../pages/orgs/OrgCreatePage"));
const OrgDetail = lazy(() => import("../pages/orgs/OrgDetailPage"));
const OrgEdit = lazy(() => import("../pages/orgs/OrgEditPage"));

const UserDash = lazy(() => import("../pages/dashboard/UserDashboardPage"));
const AdminDash = lazy(() => import("../pages/dashboard/AdminDashboardPage"));
const Profile = lazy(() => import("../pages/profile/ProfilePage"));
const NotFound = lazy(() => import("../pages/errors/NotFoundPage"));
const Forbidden = lazy(() => import("../pages/errors/ForbiddenPage"));

const AIRecs = lazy(() => import("../pages/ai/RecommendationsPage"));
const AIResume = lazy(() => import("../pages/ai/ResumeInsightsPage"));
const AIAnalytics = lazy(() => import("../pages/ai/AnalyticsInsightsPage"));

const Search = lazy(() => import("../pages/search/SearchPage"));

export default function AppRoutes() {
  return (
    <AppLayout>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<UserDashboardPage />} />

          {/* Jobs */}
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/create" element={<ProtectedRoute><AdminRoute><JobCreate /></AdminRoute></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/jobs/:id/edit" element={<ProtectedRoute><AdminRoute><JobEdit /></AdminRoute></ProtectedRoute>} />

          {/* Applications */}
          <Route path="/applications" element={<ProtectedRoute><AppsList /></ProtectedRoute>} />
          <Route path="/applications/:id" element={<ProtectedRoute><AppDetail /></ProtectedRoute>} />
          <Route path="/applications/:id/status" element={<ProtectedRoute><AdminRoute><AppStatus /></AdminRoute></ProtectedRoute>} />

          {/* Organizations */}
          <Route path="/orgs" element={<ProtectedRoute><Orgs /></ProtectedRoute>} />
          <Route path="/orgs/create" element={<ProtectedRoute><AdminRoute><OrgCreate /></AdminRoute></ProtectedRoute>} />
          <Route path="/orgs/:id" element={<ProtectedRoute><OrgDetail /></ProtectedRoute>} />
          <Route path="/orgs/:id/edit" element={<ProtectedRoute><AdminRoute><OrgEdit /></AdminRoute></ProtectedRoute>} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDash /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDash /></AdminRoute></ProtectedRoute>} />

          {/* AI */}
          <Route path="/ai/recommendations" element={<ProtectedRoute><AIRecs /></ProtectedRoute>} />
          <Route path="/ai/resume" element={<ProtectedRoute><AIResume /></ProtectedRoute>} />
          <Route path="/ai/analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} />

          {/* Search */}
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />

          {/* Misc */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
