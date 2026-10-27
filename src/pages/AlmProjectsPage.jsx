import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { almApi } from '../api/client';
import { FolderGit2, Plus, Calendar, User, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AlmProjectsPage = () => {
  const { hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [formError, setFormError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await almApi.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.createProject({
        project_name: projectName,
        project_key: projectKey.toUpperCase().trim(),
        description,
        owner_name: ownerName
      });
      setShowModal(false);
      setProjectName('');
      setProjectKey('');
      setDescription('');
      setOwnerName('');
      fetchProjects();
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">ALM Projects</h3>
          <p className="text-muted fs-7 mb-0">Project portfolio management &bull; Requirements, tasks, and test traceability scopes</p>
        </div>
        {hasRole('Administrator', 'Developer', 'Release Manager') && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Create ALM Project</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-5 text-center text-muted">
          No ALM projects configured. Click "Create ALM Project" to begin.
        </div>
      ) : (
        <div className="row g-4">
          {projects.map(p => (
            <div key={p.id} className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm p-4 h-100 bg-white d-flex flex-column justify-content-between" style={{ borderRadius: '12px' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary px-2 py-1 fs-8">{p.project_key}</span>
                    <span className="badge bg-light text-success border border-success border-opacity-25 fs-8">
                      {p.status}
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{p.project_name}</h5>
                  <p className="text-muted fs-8 mb-3" style={{ minHeight: '40px', lineHeight: '1.5' }}>
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="row g-2 text-center py-2 mb-3 bg-light rounded-2 border">
                    <div className="col-3">
                      <div className="fw-bold text-dark fs-7">{p.requirements_count}</div>
                      <small className="text-muted fs-9 text-uppercase">Reqs</small>
                    </div>
                    <div className="col-3 border-start">
                      <div className="fw-bold text-dark fs-7">{p.tasks_count}</div>
                      <small className="text-muted fs-9 text-uppercase">Tasks</small>
                    </div>
                    <div className="col-3 border-start">
                      <div className="fw-bold text-dark fs-7">{p.test_cases_count}</div>
                      <small className="text-muted fs-9 text-uppercase">Tests</small>
                    </div>
                    <div className="col-3 border-start">
                      <div className="fw-bold text-danger fs-7">{p.defects_count}</div>
                      <small className="text-muted fs-9 text-uppercase">Bugs</small>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1 text-muted fs-8">
                    <User size={13} />
                    <span>{p.owner_name}</span>
                  </div>
                  <Link to={`/alm/projects/${p.id}`} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2" style={{ fontSize: '0.78rem' }}>
                    <span>Project Hub</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Create ALM Project</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Project Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cloud Contact Center Modernization"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Unique Project Key (2-5 Uppercase Letters)</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. CCX"
                      maxLength={8}
                      value={projectKey}
                      onChange={(e) => setProjectKey(e.target.value)}
                      required
                    />
                    <small className="text-muted fs-8">Prefix for all project requirements, tasks, and test keys</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Project scope, business goals, and architecture notes"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Project Lead / Owner</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. David Zhang"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
