import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { BuildingListPage } from '../pages/buildings/BuildingListPage';
import { RoomListPage } from '../pages/rooms/RoomListPage';
import { TenantListPage } from '../pages/tenants/TenantListPage';
import { ContractListPage } from '../pages/contracts/ContractListPage';
import { MeterReadingListPage } from '../pages/meter-readings/MeterReadingListPage';
import { ServiceListPage } from '../pages/services/ServiceListPage';
import { InvoiceListPage } from '../pages/invoices/InvoiceListPage';
import { PaymentListPage } from '../pages/payments/PaymentListPage';
import { UserListPage } from '../pages/users/UserListPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AdminLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Buildings: Admin & Staff */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
            <Route path="/buildings" element={<BuildingListPage />} />
          </Route>

          {/* Rooms: Admin & Staff */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
            <Route path="/rooms" element={<RoomListPage />} />
          </Route>

          {/* Tenants: Admin & Staff */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
            <Route path="/tenants" element={<TenantListPage />} />
          </Route>

          {/* Contracts: All */}
          <Route path="/contracts" element={<ContractListPage />} />

          {/* Meter Readings: Admin & Staff */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
            <Route path="/meter-readings" element={<MeterReadingListPage />} />
          </Route>

          {/* Services: Admin & Staff */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']} />}>
            <Route path="/services" element={<ServiceListPage />} />
          </Route>

          {/* Invoices: All */}
          <Route path="/invoices" element={<InvoiceListPage />} />

          {/* Payments: All */}
          <Route path="/payments" element={<PaymentListPage />} />

          {/* Users: Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/users" element={<UserListPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
