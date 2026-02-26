// ============================================
// FILE: src/App.jsx
// ============================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Users
import UsersManagement from './pages/users/UsersManagement';
import UserDetail from './pages/users/UserDetail';

// Orders
import OrdersManagement from './pages/orders/OrdersManagement';
import OrderDetail from './pages/orders/OrderDetail';
import AssignPartner from './pages/orders/AssignPartner';

// Inventory
import InventoryManagement from './pages/inventory/InventoryManagement';
import AdminRegister from './pages/inventory/AdminRegister';

// Services
import Services from './pages/services/Services';

// Vouchers
import Vouchers from './pages/vouchers/Vouchers';

// Settings
import Settings from './pages/settings/Settings';

import AdminProfile from './pages/profile/AdminProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ✅ ஒரே ஒரு ToastContainer — எல்லா pages-லும் work ஆகும் */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            {/* Users Routes */}
            <Route path="users" element={<UsersManagement />} />
            <Route path="users/:id" element={<UserDetail />} />

            {/* Orders Routes */}
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="orders/assign/:id" element={<AssignPartner />} />
            <Route path="orders/:id" element={<OrderDetail />} />

            {/* Inventory Routes */}
            <Route path="inventory" element={<InventoryManagement />} />

            {/* Admin Register */}
            <Route path="admin/register" element={<AdminRegister />} />

            {/* Services Routes */}
            <Route path="services" element={<Services />} />

            {/* Voucher Routes */}
            <Route path="vouchers" element={<Vouchers />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            <Route path="profile" element={<AdminProfile />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 