// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AddReferee from './pages/AddReferee';
import UpdateReferee from './pages/UpdateReferee';
import RefereeDetails from './pages/RefereeDetails';
import StatisticsPage from './pages/StatisticsPage';
import FileManagement from './pages/FileManagement';
import SessionManagement from './pages/SessionManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MonitoredUsers from './pages/MonitoredUsers';
import UserLogs from './pages/UserLogs';
import NotFound from './pages/NotFound';
import { connectWebSocket } from './websocket/websocketClient';
import { isAuthenticated, isAdmin } from './services/authService';

// Protected route component for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// Admin route component for admin users only
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() && isAdmin() ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Only connect to websocket if authenticated
    if (isAuthenticated()) {
      connectWebSocket();
    }
  }, []);

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected main layout routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="add" element={<AddReferee />} />
        <Route path="update/:id" element={<UpdateReferee />} />
        <Route path="referee/:id" element={<RefereeDetails />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="files" element={<FileManagement />} />
        <Route path="sessions" element={<SessionManagement />} />

        {/* Admin only routes */}
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/monitored-users" element={<AdminRoute><MonitoredUsers /></AdminRoute>} />
        <Route path="admin/logs/:userId" element={<AdminRoute><UserLogs /></AdminRoute>} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
