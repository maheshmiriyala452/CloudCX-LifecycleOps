import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, 
  Key, Edit, Lock, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { adminApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function UserAdminPage() {
  const { user: currentUser, hasRole } = useAuth();
  const isAdmin = hasRole('Administrator');

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State - Create
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState('');

  // Form State - Edit
  const [editFullName, setEditFullName] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uRes, rRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRoles()
      ]);
      setUsers(uRes.data || []);
      setRoles(rRes.data || []);
      if (rRes.data && rRes.data.length > 0 && !newRoleId) {
        setNewRoleId(rRes.data[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await adminApi.createUser({
        username: newUsername,
        email: newEmail,
        full_name: newFullName,
        password: newPassword,
        role_id: parseInt(newRoleId)
      });
      setSuccessMsg(res.message || 'User created successfully');
      setShowCreateModal(false);
      // Reset form
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      fetchUsersAndRoles();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditFullName(u.full_name);
    setEditRoleId(u.role_id ? u.role_id.toString() : '');
    setEditIsActive(u.is_active);
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        full_name: editFullName,
        role_id: parseInt(editRoleId),
        is_active: editIsActive
      };
      if (editPassword && editPassword.length >= 6) {
        payload.password = editPassword;
      }
      const res = await adminApi.updateUser(editingUser.id, payload);
      setSuccessMsg(res.message || 'User updated successfully');
      setShowEditModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'Administrator':
        return <span className="badge bg-danger"><Shield size={12} className="me-1 inline" /> Administrator</span>;
      case 'Contact Center Supervisor':
        return <span className="badge bg-info text-dark">Supervisor</span>;
      case 'Developer':
        return <span className="badge bg-primary">Developer</span>;
      case 'QA Engineer':
        return <span className="badge bg-warning text-dark">QA Engineer</span>;
      case 'Release Manager':
        return <span className="badge bg-success">Release Manager</span>;
      default:
        return <span className="badge bg-secondary">{roleName}</span>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="container-fluid p-0">
        <div className="card shadow-sm border-0 text-center py-5">
          <div className="card-body">
            <Lock size={48} className="text-danger mb-3" />
            <h4 className="fw-bold text-dark">Administrator Authorization Required</h4>
            <p className="text-muted small">
              You are currently signed in as <strong>{currentUser?.role || 'Guest'}</strong>. 
              Only users with the <strong>Administrator</strong> role can access user and role configuration.
            </p>
            <p className="extra-small text-muted">
              Use the top-right persona switcher to switch to Administrator (<code>admin</code>).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Users className="text-primary" size={24} />
            User & Role Administration
          </h2>
          <p className="text-muted small mb-0">
            Enterprise RBAC governance, persona provisioning, credentials, and privileged role assignment.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={16} /> Provision User
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchUsersAndRoles} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin me-1' : 'me-1'} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <AlertTriangle size={18} className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <CheckCircle2 size={18} className="me-2" />
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {/* Role Definitions Card */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body py-3">
          <h6 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Configured Enterprise Roles & Authorization Boundaries
          </h6>
          <div className="row g-2">
            {roles.map(r => (
              <div key={r.id} className="col-md-4 col-sm-6">
                <div className="bg-white p-2 rounded border small">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark">{r.name}</span>
                    <span className="badge bg-secondary-subtle text-secondary extra-small">ID #{r.id}</span>
                  </div>
                  <div className="text-muted extra-small">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold mb-0 text-dark">Enterprise User Directory</h5>
          <span className="badge bg-secondary">{users.length} Active Accounts</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <RefreshCw size={20} className="spin mb-2" />
                    <p>Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="fw-bold text-dark">{u.full_name}</div>
                      <div className="text-muted extra-small">@{u.username}</div>
                    </td>
                    <td className="small">{u.email}</td>
                    <td>{getRoleBadge(u.role?.name || u.role)}</td>
                    <td>
                      {u.is_active ? (
                        <span className="badge bg-success-subtle text-success">
                          <CheckCircle2 size={12} className="me-1 inline" /> Active
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger">
                          <XCircle size={12} className="me-1 inline" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="small text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button 
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <UserPlus size={18} /> Provision New Enterprise User
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. jdoe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Corporate Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. jdoe@cloudcx.local"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Assign Enterprise Role</label>
                    <select 
                      className="form-select"
                      value={newRoleId}
                      onChange={(e) => setNewRoleId(e.target.value)}
                      required
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Creating...' : 'Provision User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Edit size={18} className="text-primary" /> Modify User @{editingUser.username}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Assign Role</label>
                    <select 
                      className="form-select"
                      value={editRoleId}
                      onChange={(e) => setEditRoleId(e.target.value)}
                      required
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editIsActiveSwitch"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="editIsActiveSwitch">
                      Account Active & Enabled
                    </label>
                  </div>
                  <div className="mb-3 border-top pt-3">
                    <label className="form-label small fw-semibold text-muted">
                      <Key size={14} className="me-1 inline" /> Reset Password (leave blank to keep current)
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="New password (optional)"
                      minLength="6"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
