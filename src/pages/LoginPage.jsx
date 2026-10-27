import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Headphones, Shield, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, switchPersona } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaLogin = async (personaUsername) => {
    setError('');
    setLoading(true);
    try {
      await switchPersona(personaUsername);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Persona switch failed');
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    { username: 'admin', label: 'Administrator', desc: 'Full governance, audit & release control', color: 'bg-dark text-white' },
    { username: 'supervisor', label: 'Contact Center Supervisor', desc: 'Queue monitoring & agent routing', color: 'bg-primary text-white' },
    { username: 'developer', label: 'David Zhang (Developer)', desc: 'Tasks, requirements & Kanban board', color: 'bg-info text-white' },
    { username: 'qa_engineer', label: 'Elena Rostova (QA Engineer)', desc: 'Test cases, runs & defect logging', color: 'bg-success text-white' },
    { username: 'release_mgr', label: 'Marcus Vance (Release Manager)', desc: 'Readiness gate sign-off & deployments', color: 'bg-warning text-dark' }
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="row g-4 w-100 justify-content-center" style={{ maxWidth: '1050px' }}>
        {/* Left Card: Brand & One-Click Persona Login */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-lg p-4 p-md-5 h-100" style={{ background: '#0f172a', color: '#f8fafc', borderRadius: '16px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="p-3 rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow">
                <Headphones size={28} />
              </div>
              <div>
                <h3 className="fw-bold mb-0 text-white">CloudCX</h3>
                <span className="text-info fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                  LIFECYCLEOPS PLATFORM
                </span>
              </div>
            </div>

            <p className="text-slate-300 fs-6 mb-4" style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              Integrated Cloud Contact Center Operations and Application Lifecycle Management with end-to-end change traceability.
            </p>

            <div className="mb-3">
              <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                Instant Persona Sign-In (Demo Access)
              </h6>
              <div className="d-flex flex-column gap-2">
                {personas.map(p => (
                  <button
                    key={p.username}
                    type="button"
                    className="btn btn-outline-light text-start p-2 px-3 border border-secondary rounded-3 d-flex align-items-center justify-content-between transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                    onClick={() => handlePersonaLogin(p.username)}
                    disabled={loading}
                  >
                    <div>
                      <div className="fw-semibold text-white fs-7">{p.label}</div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{p.desc}</small>
                    </div>
                    <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '0.7rem' }}>Login</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Manual Credential Login */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-lg p-4 p-md-5 h-100 bg-white" style={{ borderRadius: '16px' }}>
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1">Sign In</h4>
              <p className="text-muted fs-7">Access your authenticated enterprise workspace</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 fs-7 rounded-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted fs-8">Username or Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <User size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted fs-8">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-light border-start-0"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                  Demo password for all personas: <code className="text-primary">Password123!</code>
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                <CheckCircle2 size={14} className="text-success me-1 inline" />
                <span>MySQL 8.0 &bull; JWT Auth &bull; RBAC Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
