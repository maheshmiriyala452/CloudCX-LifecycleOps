import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { releasesApi, almApi } from '../api/client';
import { Rocket, Plus, ShieldCheck, Server, Search, Filter, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReleaseManagementPage = () => {
  const { hasRole, user } = useAuth();
  const [releases, setReleases] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // Create Form State
  const [projectId, setProjectId] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [description, setDescription] = useState('');
  const [targetEnv, setTargetEnv] = useState('Staging');
  const [selectedReqIds, setSelectedReqIds] = useState([]);
  const [formError, setFormError] = useState('');

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (envFilter) params.environment = envFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await releasesApi.list(params);
      setReleases(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
    almApi.getRequirements().then(res => setRequirements(res.data || [])).catch(() => {});
    almApi.getProjects().then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) setProjectId(res.data[0].id);
    }).catch(() => {});
  }, [envFilter, statusFilter]);

  const handleOpenCreate = () => {
    setVersionNumber('');
    setDescription('');
    setTargetEnv('Staging');
    setSelectedReqIds([]);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await releasesApi.create({
        project_id: projectId,
        version_number: versionNumber.trim(),
        description,
        target_environment: targetEnv,
        requirement_ids: selectedReqIds
      });
      setShowCreateModal(false);
      fetchReleases();
    } catch (err) {
      setFormError(err.message || 'Release creation failed');
    }
  };

  const handleOpenLinkModal = (rel) => {
    setSelectedRelease(rel);
    setSelectedReqIds((rel.requirements || []).map(r => r.id));
    setShowLinkModal(true);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      await releasesApi.linkRequirements(selectedRelease.id, selectedReqIds);
      setShowLinkModal(false);
      fetchReleases();
    } catch (err) {
      alert("Linking failed: " + err.message);
    }
  };

  const toggleReqSelection = (id) => {
    setSelectedReqIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Release Management</h3>
          <p className="text-muted fs-7 mb-0">Release governance, scope packaging, and deployment orchestration</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/releases/readiness" className="btn btn-outline-warning text-dark fw-bold d-flex align-items-center gap-1 shadow-sm">
            <ShieldCheck size={16} />
            <span>Readiness Gate</span>
          </Link>
          <Link to="/deployments" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <Server size={16} />
            <span>Deployment Simulator</span>
          </Link>
          {hasRole('Release Manager', 'Administrator') && (
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Package New Release</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <select className="form-select form-select-sm bg-light" value={envFilter} onChange={(e) => setEnvFilter(e.target.value)}>
              <option value="">All Environments</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
              <option value="Staging">Staging</option>
              <option value="Production">Production</option>
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select form-select-sm bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Blocked">Blocked</option>
              <option value="Approved">Approved</option>
              <option value="Deploying">Deploying</option>
              <option value="Deployed">Deployed</option>
              <option value="Failed">Failed</option>
              <option value="Rolled Back">Rolled Back</option>
            </select>
          </div>
          <div className="col-md-4 text-end text-muted fs-8">
            Showing {releases.length} release package(s)
          </div>
        </div>
      </div>

      {/* Releases Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Release Identifier</th>
                <th>Version</th>
                <th>Target Environment</th>
                <th>Status</th>
                <th>Packaged Scope</th>
                <th>Owner / Approvals</th>
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
              ) : releases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No releases created.</td>
                </tr>
              ) : (
                releases.map(rel => (
                  <tr key={rel.id}>
                    <td>
                      <span className="fw-bold text-primary">{rel.release_key}</span>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>
                        {rel.description || 'No description'}
                      </small>
                    </td>
                    <td><span className="badge bg-light text-dark border fw-bold fs-8">v{rel.version_number}</span></td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {rel.target_environment}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        rel.status === 'Deployed' ? 'bg-success' :
                        rel.status === 'Approved' ? 'bg-primary' :
                        rel.status === 'Blocked' ? 'bg-danger' :
                        rel.status === 'Deploying' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`}>
                        {rel.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <span className="badge bg-light text-primary border">{rel.requirements_count} requirement(s)</span>
                        {hasRole('Release Manager', 'Administrator') && (
                          <button
                            className="btn btn-sm btn-link p-0 text-decoration-none"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => handleOpenLinkModal(rel)}
                          >
                            Edit Scope
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="fs-8 text-dark fw-semibold">{rel.release_owner_name}</div>
                      <small className="text-muted">
                        {rel.approvals?.length > 0 ? `${rel.approvals.length} approval record(s)` : 'Awaiting review'}
                      </small>
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/releases/readiness?id=${rel.id}`}
                        className="btn btn-sm btn-outline-warning text-dark py-1 px-2 me-1 fw-semibold"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <ShieldCheck size={13} className="me-1 inline" />
                        <span>Readiness</span>
                      </Link>
                      <Link
                        to={`/deployments?id=${rel.id}`}
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Server size={13} className="me-1 inline" />
                        <span>Deploy</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Release Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Package Release Candidate</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Target Project</label>
                      <select className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.project_name} [{p.project_key}]</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Version Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1.2.0"
                        value={versionNumber}
                        onChange={(e) => setVersionNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Target Environment</label>
                    <select className="form-select" value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)}>
                      <option value="Development">Development (Local test cluster)</option>
                      <option value="Testing">Testing (QA test harness)</option>
                      <option value="Staging">Staging (Pre-production replica)</option>
                      <option value="Production">Production (Live customer routing)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Release Description / Manifest</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Release scope and release notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Select Included Requirements</label>
                    <div className="border rounded p-2 bg-light" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {requirements.map(r => (
                        <div key={r.id} className="form-check py-1 border-bottom">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`req-check-${r.id}`}
                            checked={selectedReqIds.includes(r.id)}
                            onChange={() => toggleReqSelection(r.id)}
                          />
                          <label className="form-check-label fs-8 text-dark" htmlFor={`req-check-${r.id}`}>
                            <strong>{r.req_key}</strong>: {r.title} <span className="badge bg-secondary ms-1 fs-9">{r.status}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Package Release</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Requirements Scope Modal */}
      {showLinkModal && selectedRelease && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Edit Release Scope: {selectedRelease.release_key}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowLinkModal(false)} />
              </div>
              <form onSubmit={handleLinkSubmit}>
                <div className="modal-body p-4">
                  <p className="text-muted fs-8 mb-3">
                    Select the requirements bundled in this release. The Release Readiness Gate will evaluate test cases, defects, and approvals based on this scope.
                  </p>
                  <div className="border rounded p-2 bg-light" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {requirements.map(r => (
                      <div key={r.id} className="form-check py-1 border-bottom">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`link-req-${r.id}`}
                          checked={selectedReqIds.includes(r.id)}
                          onChange={() => toggleReqSelection(r.id)}
                        />
                        <label className="form-check-label fs-8 text-dark" htmlFor={`link-req-${r.id}`}>
                          <strong>{r.req_key}</strong>: {r.title} <span className="badge bg-secondary ms-1 fs-9">{r.status}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowLinkModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Update Scope</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
