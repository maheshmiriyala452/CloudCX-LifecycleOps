import React, { useState, useEffect } from 'react';
import { almApi } from '../api/client';
import { Bug, Plus, Search, Filter, ShieldAlert, CheckCircle, Edit, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DefectTrackerPage = () => {
  const { hasRole, user } = useAuth();
  const [defects, setDefects] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [linkedReqId, setLinkedReqId] = useState('');
  const [linkedTcId, setLinkedTcId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [formError, setFormError] = useState('');

  // Update State
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');

  const fetchDefects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await almApi.getDefects(params);
      setDefects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
    almApi.getRequirements().then(res => setRequirements(res.data || [])).catch(() => {});
    almApi.getTestCases().then(res => setTestCases(res.data || [])).catch(() => {});
    almApi.getProjects().then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) setProjectId(res.data[0].id);
    }).catch(() => {});
  }, [search, severityFilter, statusFilter]);

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setSeverity('High');
    setPriority('High');
    setAssignee('');
    setLinkedReqId('');
    setLinkedTcId('');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.createDefect({
        project_id: projectId,
        linked_requirement_id: linkedReqId ? parseInt(linkedReqId) : null,
        linked_test_case_id: linkedTcId ? parseInt(linkedTcId) : null,
        title,
        description,
        severity,
        priority,
        reporter_name: user?.full_name || 'Elena Rostova',
        assignee_name: assignee || 'Unassigned'
      });
      setShowCreateModal(false);
      fetchDefects();
    } catch (err) {
      setFormError(err.message || 'Defect creation failed');
    }
  };

  const handleOpenEdit = (defect) => {
    setEditingDefect(defect);
    setNewStatus(defect.status);
    setResolution(defect.resolution || '');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await almApi.updateDefect(editingDefect.id, {
        status: newStatus,
        resolution
      });
      setEditingDefect(null);
      fetchDefects();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const criticalOpenCount = defects.filter(d => d.severity === 'Critical' && !['Closed', 'Fixed'].includes(d.status)).length;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Defect Tracker</h3>
          <p className="text-muted fs-7 mb-0">Bug tracking with automated release readiness gating</p>
        </div>
        {hasRole('QA Engineer', 'Developer', 'Administrator') && (
          <button className="btn btn-danger d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Report Defect</span>
          </button>
        )}
      </div>

      {/* Critical Defect Gate Warning */}
      {criticalOpenCount > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-3 p-3 rounded-3 shadow-sm mb-4">
          <ShieldAlert size={26} className="flex-shrink-0" />
          <div>
            <div className="fw-bold">Release Gate Blocker Active ({criticalOpenCount} Critical Defect)</div>
            <div className="fs-8">
              Under Release Readiness Gate rules, no release can be approved or deployed to Staging/Production while unresolved Critical defects remain open.
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search defect key or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-light" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="">All Severities</option>
              <option value="Critical">Critical (Gate Blocker)</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Retest">Retest</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="col-md-2 text-end text-muted fs-8">
            {defects.length} defect(s)
          </div>
        </div>
      </div>

      {/* Defects Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Defect Key</th>
                <th>Title & Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Linked Requirement / Test</th>
                <th>Reporter / Assignee</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : defects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No defects found.</td>
                </tr>
              ) : (
                defects.map(d => (
                  <tr key={d.id}>
                    <td><span className="fw-bold text-danger">{d.defect_key}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{d.title}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '300px' }}>
                        {d.description}
                      </small>
                      {d.resolution && (
                        <small className="text-success d-block mt-1">
                          <strong>Resolution:</strong> {d.resolution}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status ${
                        d.severity === 'Critical' ? 'badge-critical' :
                        d.severity === 'High' ? 'badge-high' :
                        d.severity === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        d.status === 'Closed' ? 'bg-success' :
                        d.status === 'Fixed' ? 'bg-info text-dark' :
                        d.status === 'In Progress' ? 'bg-primary' : 'bg-danger'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div>
                        {d.requirement_key && (
                          <div className="badge bg-light text-primary border mb-1 d-block text-start">
                            {d.requirement_key}
                          </div>
                        )}
                        {d.test_case_key && (
                          <div className="badge bg-light text-secondary border d-block text-start">
                            {d.test_case_key}
                          </div>
                        )}
                        {!d.requirement_key && !d.test_case_key && <span className="text-muted fs-8">-</span>}
                      </div>
                    </td>
                    <td className="text-muted fs-8">
                      <div>Rep: {d.reporter_name}</div>
                      <div>Ass: {d.assignee_name || 'Unassigned'}</div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleOpenEdit(d)}
                      >
                        <Edit size={13} className="me-1 inline" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {editingDefect && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Update Defect: {editingDefect.defect_key}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingDefect(null)} />
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Defect Status</label>
                    <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Retest">Retest</option>
                      <option value="Closed">Closed</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Resolution Details</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Root cause diagnosis, code patch summary, or fix verification..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setEditingDefect(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Status</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Defect Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Report Defect</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Defect Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Concise defect summary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Description & Steps to Reproduce</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Expected vs Actual behavior..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Linked Requirement</label>
                      <select className="form-select" value={linkedReqId} onChange={(e) => setLinkedReqId(e.target.value)}>
                        <option value="">-- No Linked Requirement --</option>
                        {requirements.map(r => (
                          <option key={r.id} value={r.id}>{r.req_key}: {r.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Linked Test Case</label>
                      <select className="form-select" value={linkedTcId} onChange={(e) => setLinkedTcId(e.target.value)}>
                        <option value="">-- No Linked Test Case --</option>
                        {testCases.map(tc => (
                          <option key={tc.id} value={tc.id}>{tc.test_key}: {tc.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Severity</label>
                      <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="Critical">Critical (Blocks Release Readiness)</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Priority</label>
                      <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Assignee</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. David Zhang"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger fw-semibold">Log Defect</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
