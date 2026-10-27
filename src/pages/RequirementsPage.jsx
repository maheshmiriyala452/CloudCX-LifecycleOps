import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { almApi } from '../api/client';
import { FileText, Plus, Search, Filter, History, Edit, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RequirementsPage = () => {
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Form State
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [status, setStatus] = useState('Draft');
  const [formError, setFormError] = useState('');

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await almApi.getRequirements(params);
      setRequirements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
    almApi.getProjects().then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) setProjectId(res.data[0].id);
    }).catch(() => {});
  }, [search, priorityFilter, statusFilter]);

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setPriority('High');
    setAcceptanceCriteria('');
    setStatus('Draft');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.createRequirement({
        project_id: projectId,
        title,
        description,
        business_priority: priority,
        acceptance_criteria: acceptanceCriteria,
        owner_name: user?.full_name || 'Product Owner'
      });
      setShowCreateModal(false);
      fetchRequirements();
    } catch (err) {
      setFormError(err.message || 'Creation failed');
    }
  };

  const handleOpenEdit = (req) => {
    setSelectedReq(req);
    setTitle(req.title);
    setDescription(req.description);
    setPriority(req.business_priority);
    setAcceptanceCriteria(req.acceptance_criteria || '');
    setStatus(req.status);
    setFormError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.updateRequirement(selectedReq.id, {
        title,
        description,
        business_priority: priority,
        acceptance_criteria: acceptanceCriteria,
        status
      });
      setShowEditModal(false);
      fetchRequirements();
    } catch (err) {
      setFormError(err.message || 'Update failed');
    }
  };

  const handleViewHistory = async (req) => {
    try {
      const res = await almApi.getRequirement(req.id);
      setSelectedReq(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      alert("Failed to load history: " + err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Requirements & User Stories</h3>
          <p className="text-muted fs-7 mb-0">Business specifications with automated revision bumping and change impact propagation</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/alm/impact" className="btn btn-outline-info text-dark fw-bold d-flex align-items-center gap-1 shadow-sm">
            <Sparkles size={16} />
            <span>Change Impact Explorer</span>
          </Link>
          {hasRole('Developer', 'QA Engineer', 'Administrator', 'Release Manager') && (
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Author Requirement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search requirement key, title, or acceptance criteria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-light" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="In Development">In Development</option>
              <option value="Tested">Tested</option>
              <option value="Released">Released</option>
            </select>
          </div>
          <div className="col-md-2 text-end text-muted fs-8">
            {requirements.length} requirement(s)
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Req Key</th>
                <th>Title & Acceptance Criteria</th>
                <th>Priority</th>
                <th>Version</th>
                <th>Status</th>
                <th>Linked Coverage</th>
                <th>Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : requirements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No requirements found.</td>
                </tr>
              ) : (
                requirements.map(r => (
                  <tr key={r.id}>
                    <td><span className="fw-bold text-primary">{r.req_key}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{r.title}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '320px' }}>
                        {r.acceptance_criteria || r.description}
                      </small>
                    </td>
                    <td>
                      <span className={`badge-status ${
                        r.business_priority === 'Critical' ? 'badge-critical' :
                        r.business_priority === 'High' ? 'badge-high' :
                        r.business_priority === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {r.business_priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border fw-bold fs-8">v{r.version}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'Released' ? 'bg-success' :
                        r.status === 'Tested' ? 'bg-primary' :
                        r.status === 'Approved' ? 'bg-info text-dark' :
                        r.status === 'In Development' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 fs-9">
                        <span className="badge bg-light text-dark border" title="Tasks">{r.tasks_count} tasks</span>
                        <span className="badge bg-light text-dark border" title="Tests">{r.test_cases_count} tests</span>
                        <span className="badge bg-light text-dark border" title="Releases">{r.releases_count} rel</span>
                      </div>
                    </td>
                    <td className="text-muted fs-8">{r.owner_name}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-info text-dark p-1 me-1"
                        onClick={() => navigate(`/alm/impact?id=${r.id}`)}
                        title="Explore Change Impact"
                      >
                        <Sparkles size={14} className="text-primary" />
                      </button>
                      <button
                        className="btn btn-sm btn-light border p-1 me-1"
                        onClick={() => handleViewHistory(r)}
                        title="View Change History"
                      >
                        <History size={14} className="text-muted" />
                      </button>
                      {hasRole('Developer', 'QA Engineer', 'Administrator') && (
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => handleOpenEdit(r)}
                          title="Edit Specification"
                        >
                          <Edit size={14} className="text-muted" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requirement Change History Modal */}
      {showHistoryModal && selectedReq && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Change History: {selectedReq.req_key} (v{selectedReq.version})
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)} />
              </div>
              <div className="modal-body p-4">
                <h6 className="fw-semibold text-dark mb-3">{selectedReq.title}</h6>
                {(!selectedReq.history || selectedReq.history.length === 0) ? (
                  <p className="text-muted fs-8">No revision history found.</p>
                ) : (
                  <div className="timeline position-relative ps-3 border-start">
                    {selectedReq.history.map((h, i) => (
                      <div key={i} className="mb-3 position-relative">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold text-dark fs-8">Version {h.version}</span>
                          <span className="badge bg-secondary fs-9">{h.changed_by_name}</span>
                        </div>
                        <div className="text-muted fs-8 mt-1">{h.change_summary}</div>
                        <small className="text-muted fs-9 d-block mt-1">
                          {new Date(h.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Requirement Modal (Triggers Version Bump) */}
      {showEditModal && selectedReq && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Edit Requirement: {selectedReq.req_key}</h5>
                  <small className="text-warning">Modifying title or acceptance criteria will increment version to v{selectedReq.version + 1} and flag linked tests for rerun.</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Requirement Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Functional Specification / Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Acceptance Criteria</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={acceptanceCriteria}
                      onChange={(e) => setAcceptanceCriteria(e.target.value)}
                      placeholder="Numbered acceptance rules..."
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Business Priority</label>
                      <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Status</label>
                      <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Draft">Draft</option>
                        <option value="In Review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="In Development">In Development</option>
                        <option value="Tested">Tested</option>
                        <option value="Released">Released</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save & Increment Version</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Requirement Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Author New Requirement</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Target Project</label>
                    <select className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.project_name} [{p.project_key}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Requirement Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Skill-Based Inbound Interaction Routing"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Functional Specification</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Detailed business requirements and constraints"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Acceptance Criteria</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="1. Must match required skills against agent competencies&#10;2. Must respect agent concurrency limits"
                      value={acceptanceCriteria}
                      onChange={(e) => setAcceptanceCriteria(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Business Priority</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Author Requirement</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
