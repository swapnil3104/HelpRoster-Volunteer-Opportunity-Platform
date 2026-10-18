import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Opportunities from '../pages/Opportunities';
import OpportunityDetail from '../pages/OpportunityDetail';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import ManageOpportunities from '../pages/ManageOpportunities';
import MyApplications from '../pages/MyApplications';
import OrganizationApplicants from '../pages/OrganizationApplicants';
import Dashboard from '../pages/Dashboard';
import VolunteerHours from '../pages/VolunteerHours';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import AdminPortal from '../pages/AdminPortal';
import AdminUsers from '../pages/AdminUsers';
import AdminOrganizations from '../pages/AdminOrganizations';
import AdminOpportunities from '../pages/AdminOpportunities';
import AdminSupport from '../pages/AdminSupport';
import AdminAuditLogs from '../pages/AdminAuditLogs';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/:idOrSlug" element={<OpportunityDetail />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="organizations/:id" element={<OrganizationDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="hours"
          element={
            <ProtectedRoute allowedRoles={['volunteer', 'organization', 'admin']}>
              <VolunteerHours />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage/hours"
          element={
            <ProtectedRoute allowedRoles={['organization', 'admin']}>
              <VolunteerHours />
            </ProtectedRoute>
          }
        />
        <Route
          path="applications"
          element={
            <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-applications"
          element={
            <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="applicants"
          element={
            <ProtectedRoute allowedRoles={['organization', 'admin']}>
              <OrganizationApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage/applications"
          element={
            <ProtectedRoute allowedRoles={['organization', 'admin']}>
              <OrganizationApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage/opportunities"
          element={
            <ProtectedRoute allowedRoles={['organization', 'admin']}>
              <ManageOpportunities />
            </ProtectedRoute>
          }
        />
        {/* Administrator Workspace Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/organizations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrganizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/opportunities"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOpportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/support"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAuditLogs />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
