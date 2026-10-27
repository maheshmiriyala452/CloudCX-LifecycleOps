import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auditApi } from '../api/client';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const TopNavbar = () => {
  const { user, logout, switchPersona } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await auditApi.getNotifications();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await auditApi.markAllRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Overview Dashboard';
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' / ');
  };

  const personas = [
    { username: 'admin', label: 'Administrator', role: 'Full Governance' },
    { username: 'supervisor', label: 'Sarah Connor', role: 'Contact Center Supervisor' },
    { username: 'developer', label: 'David Zhang', role: 'Developer' },
    { username: 'qa_engineer', label: 'Elena Rostova', role: 'QA Engineer' },
    { username: 'release_mgr', label: 'Marcus Vance', role: 'Release Manager' }
  ];

  return (
    <header className="top-navbar">
      {/* Breadcrumb path */}
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted fs-6 fw-medium">CloudCX</span>
        <span className="text-muted">/</span>
        <span className="text-dark fs-6 fw-semibold">{getBreadcrumbs()}</span>
      </div>

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Persona Switcher Dropdown (Crucial for demonstrating custom role-based workflows) */}
        <div className="position-relative">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 py-1 px-2 border"
            style={{ fontSize: '0.8rem', background: '#f8fafc' }}
            onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
            title="Switch demo persona account"
          >
            <Shield size={14} className="text-primary" />
            <span className="d-none d-md-inline fw-semibold">Switch Persona:</span>
            <span className="badge bg-primary text-white">{user?.role_name || 'Role'}</span>
            <ChevronDown size={14} />
          </button>

          {showPersonaDropdown && (
            <div
              className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg border"
              style={{ width: '260px', zIndex: 1050 }}
            >
              <div className="px-3 py-1 text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                Quick Persona Switcher
              </div>
              {personas.map(p => (
                <button
                  key={p.username}
                  className="dropdown-item px-3 py-2 d-flex flex-column"
                  onClick={async () => {
                    await switchPersona(p.username);
                    setShowPersonaDropdown(false);
                  }}
                >
                  <div className="fw-semibold text-dark d-flex align-items-center justify-content-between">
                    <span>{p.label}</span>
                    {user?.username === p.username && <CheckCircle size={14} className="text-success" />}
                  </div>
                  <small className="text-muted">{p.role}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="position-relative">
          <button
            className="btn btn-sm btn-light position-relative p-2 rounded-circle border"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications"
          >
            <Bell size={18} className="text-muted" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border overflow-hidden"
              style={{ width: '340px', zIndex: 1050 }}
            >
              <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-light border-bottom">
                <span className="fw-bold fs-7">Notifications ({unreadCount} unread)</span>
                <button className="btn btn-link btn-sm p-0 text-decoration-none" style={{ fontSize: '0.75rem' }} onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`p-2 border-bottom ${n.is_read ? '' : 'bg-light'}`} style={{ fontSize: '0.82rem' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-semibold text-dark">{n.title}</span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>{n.category}</span>
                      </div>
                      <div className="text-muted mt-1">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center bg-light border-top">
                <button
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate('/notifications');
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="position-relative">
          <button
            className="btn btn-sm btn-light d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '28px', height: '28px', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="text-start d-none d-lg-block pe-1">
              <div className="fw-semibold text-dark" style={{ fontSize: '0.82rem', lineHeight: '1.2' }}>{user?.full_name || 'User'}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user?.role_name}</div>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {showUserDropdown && (
            <div
              className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg border"
              style={{ width: '200px', zIndex: 1050 }}
            >
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold fs-7">{user?.full_name}</div>
                <div className="text-muted fs-8">{user?.email}</div>
              </div>
              <button
                className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 text-danger"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
