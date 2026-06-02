import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MockAppProvider } from './lib/MockAppContext';
import { AppLayout } from './components/layout/AppLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { LandingPage } from './pages/customer/LandingPage';
import { DashboardHome } from './pages/customer/DashboardHome';
import { CustomerOrderPage } from './pages/customer/OrderPage';
import { StaffDashboardPage } from './pages/staff/DashboardPage';
import { AdminPage } from './pages/admin/AdminPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OpeningAnimation } from './pages/auth/OpeningAnimation';
import { PendingPage } from './pages/auth/PendingPage';
import { RejectedPage } from './pages/auth/RejectedPage';
import { DeletedPage } from './pages/auth/DeletedPage';
import { ProfilePage } from './pages/auth/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicPlacementView } from './pages/customer/PublicPlacementView';
import { RecipeListPage } from './pages/customer/RecipeListPage';
import { AnnouncementsPage } from './pages/customer/AnnouncementsPage';
import { DataMaintenancePage } from './pages/admin/DataMaintenancePage';
import { MemberManagerPage } from './pages/admin/MemberManagerPage';

import { GuestHomePage } from './pages/customer/GuestHomePage';
import { GuestCastsPage } from './pages/customer/GuestCastsPage';
import { GuestMenuPage } from './pages/customer/GuestMenuPage';
import { GuestLotteryPage } from './pages/customer/GuestLotteryPage';
import { GuestPointPage } from './pages/customer/GuestPointPage';
import { GuestGamePage } from './pages/customer/GuestGamePage';

import { GuestLoginPage } from './pages/auth/GuestLoginPage';
import { GuestRegisterPage } from './pages/auth/GuestRegisterPage';
import { AttendanceRequestPage } from './pages/staff/AttendanceRequestPage';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <MockAppProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/guest-login" element={<GuestLoginPage />} />
          <Route path="/guest-register" element={<GuestRegisterPage />} />
          <Route path="/opening" element={<OpeningAnimation />} />
          
          <Route path="/guest" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<GuestHomePage />} />
            <Route path="casts" element={<GuestCastsPage />} />
            <Route path="menu" element={<GuestMenuPage />} />
            <Route path="order" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><CustomerOrderPage /></ProtectedRoute>} />
            <Route path="lottery" element={<GuestLotteryPage />} />
            <Route path="game" element={<GuestGamePage />} />
            <Route path="point" element={<GuestPointPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><DashboardHome /></ProtectedRoute>} />
            <Route path="order" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><CustomerOrderPage /></ProtectedRoute>} />
            <Route path="announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
            <Route path="maintenance" element={<ProtectedRoute allowedRoles={['admin']}><DataMaintenancePage /></ProtectedRoute>} />
            <Route path="placement" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><PublicPlacementView /></ProtectedRoute>} />
            <Route path="recipes" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><RecipeListPage /></ProtectedRoute>} />
            <Route path="members" element={<ProtectedRoute allowedRoles={['admin']}><MemberManagerPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="pending" element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />
            <Route path="rejected" element={<ProtectedRoute><RejectedPage /></ProtectedRoute>} />
            <Route path="deleted" element={<ProtectedRoute><DeletedPage /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'cast']}><AttendanceRequestPage /></ProtectedRoute>} />
            <Route path="staff" element={<ProtectedRoute allowedRoles={['staff', 'cast', 'admin']}><StaffDashboardPage /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </MockAppProvider>
    </ErrorBoundary>
  );
}
