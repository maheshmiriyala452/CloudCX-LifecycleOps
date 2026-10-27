import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading CloudCX...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
