import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { almApi } from '../api/client';
import { FolderGit2, ArrowLeft, FileText, Kanban, Bug, CheckSquare, Rocket, ArrowRight } from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('requirements');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await almApi.getProject(id);
        setProject(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="alert alert-warning">
        Project not found. <Link to="/alm/projects">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-3">
        <Link to="/alm/projects" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} />
          <span>All Projects</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: '12px' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary fs-7">{project.project_key}</span>
              <h4 className="fw-bold text-dark mb-0">{project.project_name}</h4>
            </div>
            <p className="text-muted fs-8 mb-0">{project.description}</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/alm/traceability" className="btn btn-sm btn-outline-primary">Traceability Matrix</Link>
            <Link to="/alm/kanban" className="btn btn-sm btn-primary">Task Board</Link>
          </div>
        </div>

        <div className="row g-3 fs-8 text-muted">
          <div className="col-md-3"><strong>Owner:</strong> {project.owner_name}</div>
          <div className="col-md-3"><strong>Status:</strong> <span className="badge bg-success">{project.status}</span></div>
          <div className="col-md-3"><strong>Start:</strong> {project.start_date || 'N/A'}</div>
          <div className="col-md-3"><strong>Target:</strong> {project.target_date || 'N/A'}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-pills mb-3 border-bottom pb-2">
        <li className="nav-item">
          <button
            className={`nav-link py-2 px-3 fw-semibold ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            Requirements ({project.requirements?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link py-2 px-3 fw-semibold ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks ({project.tasks?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link py-2 px-3 fw-semibold ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Test Cases ({project.test_cases?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link py-2 px-3 fw-semibold ${activeTab === 'defects' ? 'active' : ''}`}
            onClick={() => setActiveTab('defects')}
          >
            Defects ({project.defects?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link py-2 px-3 fw-semibold ${activeTab === 'releases' ? 'active' : ''}`}
            onClick={() => setActiveTab('releases')}
          >
            Releases ({project.releases?.length || 0})
          </button>
        </li>
      </ul>

      {/* Tab Contents */}
      <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '12px' }}>
        {activeTab === 'requirements' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-8">
              <thead className="table-light">
                <tr>
                  <th>Req Key</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!project.requirements || project.requirements.length === 0) ? (
                  <tr><td colSpan="5" className="text-center py-3 text-muted">No requirements found.</td></tr>
                ) : (
                  project.requirements.map(r => (
                    <tr key={r.id}>
                      <td className="fw-bold text-primary">{r.req_key}</td>
                      <td>{r.title}</td>
                      <td><span className="badge bg-light text-dark border">{r.business_priority}</span></td>
                      <td><span className="badge bg-secondary">v{r.version}</span></td>
                      <td><span className="badge bg-info text-dark">{r.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-8">
              <thead className="table-light">
                <tr>
                  <th>Task Key</th>
                  <th>Title</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!project.tasks || project.tasks.length === 0) ? (
                  <tr><td colSpan="5" className="text-center py-3 text-muted">No tasks found.</td></tr>
                ) : (
                  project.tasks.map(t => (
                    <tr key={t.id}>
                      <td className="fw-bold text-primary">{t.task_key}</td>
                      <td>{t.title}</td>
                      <td>{t.assignee_name || 'Unassigned'}</td>
                      <td><span className="badge bg-light text-dark border">{t.priority}</span></td>
                      <td><span className="badge bg-primary">{t.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-8">
              <thead className="table-light">
                <tr>
                  <th>Test Key</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Latest Result</th>
                </tr>
              </thead>
              <tbody>
                {(!project.test_cases || project.test_cases.length === 0) ? (
                  <tr><td colSpan="5" className="text-center py-3 text-muted">No test cases found.</td></tr>
                ) : (
                  project.test_cases.map(tc => (
                    <tr key={tc.id}>
                      <td className="fw-bold text-primary">{tc.test_key}</td>
                      <td>{tc.title}</td>
                      <td>{tc.test_type}</td>
                      <td><span className="badge bg-light text-dark border">{tc.priority}</span></td>
                      <td>
                        <span className={`badge-status ${
                          tc.latest_result === 'Pass' ? 'badge-pass' :
                          tc.latest_result === 'Fail' ? 'badge-fail' :
                          tc.latest_result === 'Blocked' ? 'badge-blocked' : 'badge-notrun'
                        }`}>
                          {tc.latest_result}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'defects' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-8">
              <thead className="table-light">
                <tr>
                  <th>Defect Key</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!project.defects || project.defects.length === 0) ? (
                  <tr><td colSpan="5" className="text-center py-3 text-muted">No defects reported.</td></tr>
                ) : (
                  project.defects.map(d => (
                    <tr key={d.id}>
                      <td className="fw-bold text-danger">{d.defect_key}</td>
                      <td>{d.title}</td>
                      <td><span className="badge bg-danger">{d.severity}</span></td>
                      <td><span className="badge bg-light text-dark border">{d.priority}</span></td>
                      <td><span className="badge bg-secondary">{d.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'releases' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 fs-8">
              <thead className="table-light">
                <tr>
                  <th>Release Key</th>
                  <th>Version</th>
                  <th>Target Env</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!project.releases || project.releases.length === 0) ? (
                  <tr><td colSpan="4" className="text-center py-3 text-muted">No releases created.</td></tr>
                ) : (
                  project.releases.map(rel => (
                    <tr key={rel.id}>
                      <td className="fw-bold text-primary">{rel.release_key}</td>
                      <td>v{rel.version_number}</td>
                      <td><span className="badge bg-light text-dark border">{rel.target_environment}</span></td>
                      <td><span className="badge bg-info text-dark">{rel.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
