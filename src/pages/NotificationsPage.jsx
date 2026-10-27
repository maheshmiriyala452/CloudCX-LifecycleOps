import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, CheckCircle2, AlertTriangle, ShieldAlert, 
  Rocket, Bug, CheckSquare, Filter, RefreshCw
} from 'lucide-react';
import { auditApi } from '../api/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await auditApi.getNotifications({ unread: unreadOnly ? 'true' : 'false' });
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unread_count || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await auditApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await auditApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Failed to mark all as read');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CRITICAL_DEFECT':
        return <Bug className="text-danger" size={20} />;
      case 'TEST_FAILURE':
        return <AlertTriangle className="text-warning" size={20} />;
      case 'RELEASE_APPROVAL':
        return <ShieldAlert className="text-primary" size={20} />;
      case 'RELEASE_BLOCKED':
        return <ShieldAlert className="text-danger" size={20} />;
      case 'DEPLOYMENT_FAILED':
        return <Rocket className="text-danger" size={20} />;
      case 'TASK_ASSIGNMENT':
        return <CheckSquare className="text-info" size={20} />;
      default:
        return <Bell className="text-secondary" size={20} />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'CRITICAL_DEFECT':
        return <span className="badge bg-danger">Critical Defect</span>;
      case 'TEST_FAILURE':
        return <span className="badge bg-warning text-dark">Test Failure</span>;
      case 'RELEASE_APPROVAL':
        return <span className="badge bg-primary">Approval Required</span>;
      case 'RELEASE_BLOCKED':
        return <span className="badge bg-danger">Release Blocked</span>;
      case 'DEPLOYMENT_FAILED':
        return <span className="badge bg-danger">Deployment Alert</span>;
      case 'TASK_ASSIGNMENT':
        return <span className="badge bg-info text-dark">Task Assigned</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Bell className="text-primary" size={24} />
            In-App Notifications & Alerts
          </h2>
          <p className="text-muted small mb-0">
            Real-time automated quality gates, test results, task assignments, and release lifecycle signals.
          </p>
        </div>
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={handleMarkAllRead}>
              <CheckCheck size={16} /> Mark All as Read ({unreadCount})
            </button>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin me-1' : 'me-1'} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 py-2">
          {error}
        </div>
      )}

      {/* Filter Tabs & Unread Toggle */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted small fw-semibold me-1 d-flex align-items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            {[
              { label: 'All Events', val: 'ALL' },
              { label: 'Critical Defects', val: 'CRITICAL_DEFECT' },
              { label: 'Test Failures', val: 'TEST_FAILURE' },
              { label: 'Release Approvals', val: 'RELEASE_APPROVAL' },
              { label: 'Deployment Alerts', val: 'DEPLOYMENT_FAILED' },
              { label: 'Tasks', val: 'TASK_ASSIGNMENT' }
            ].map(tab => (
              <button
                key={tab.val}
                className={`btn btn-sm ${filterType === tab.val ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterType(tab.val)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="unreadOnlySwitch"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            <label className="form-check-label small fw-semibold" htmlFor="unreadOnlySwitch">
              Show Unread Only
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <RefreshCw size={24} className="spin mb-2" />
              <p>Loading notification feed...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CheckCircle2 size={40} className="text-success mb-2 opacity-50" />
              <h5 className="fw-bold">No Notifications Found</h5>
              <p className="small text-muted mb-0">
                {unreadOnly ? 'You have caught up with all unread signals!' : 'No lifecycle alerts matching your filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredNotifications.map(item => (
                <div 
                  key={item.id} 
                  className={`list-group-item p-3 d-flex align-items-start gap-3 transition-all ${!item.is_read ? 'bg-light border-start border-primary border-4' : ''}`}
                >
                  <div className="p-2 rounded bg-white shadow-sm flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-bold mb-0 text-dark">{item.title}</h6>
                        {getTypeBadge(item.type)}
                        {!item.is_read && (
                          <span className="badge bg-primary-subtle text-primary extra-small">NEW</span>
                        )}
                      </div>
                      <span className="text-muted extra-small">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted small mb-1">{item.message}</p>
                    {item.link_url && (
                      <a href={item.link_url} className="extra-small text-decoration-none fw-semibold text-primary">
                        View Details &rarr;
                      </a>
                    )}
                  </div>
                  {!item.is_read && (
                    <button 
                      className="btn btn-outline-secondary btn-sm flex-shrink-0"
                      title="Mark as Read"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
