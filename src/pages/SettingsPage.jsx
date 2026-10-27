import React, { useState, useEffect } from 'react';
import { 
  Settings, Server, Database, ShieldCheck, Cpu, 
  Sliders, Info, BookOpen, ExternalLink, RefreshCw, CheckCircle2
} from 'lucide-react';
import { adminApi } from '../api/client';

export default function SettingsPage() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSystemInfo();
      setSystemInfo(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load system diagnostics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Settings className="text-primary" size={24} />
            System Diagnostics & Engine Settings
          </h2>
          <p className="text-muted small mb-0">
            Runtime configurations, contact center routing parameters, release gate criteria, and environment health.
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchInfo} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin me-1' : 'me-1'} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 py-2">
          {error}
        </div>
      )}

      {/* Grid of Settings & Diagnostics */}
      <div className="row g-4 mb-4">
        {/* Runtime Diagnostics */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
              <Server className="text-primary" size={18} />
              <h5 className="card-title fw-bold mb-0 text-dark">Platform Runtime Diagnostics</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4 text-muted">
                  <RefreshCw size={20} className="spin mb-2" />
                  <p>Querying runtime metrics...</p>
                </div>
              ) : (
                <table className="table table-sm table-borderless align-middle mb-0 small">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '40%' }}>Application:</td>
                      <td className="fw-bold">{systemInfo?.application_name || 'CloudCX LifecycleOps'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Platform Build:</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {systemInfo?.platform_version || '1.0.0-PROD-CANDIDATE'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Python Core:</td>
                      <td><code>Python {systemInfo?.python_version}</code></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Database Engine:</td>
                      <td>
                        <span className="badge bg-dark me-1">{systemInfo?.database_dialect || 'mysql'}</span>
                        <code className="extra-small text-muted">{systemInfo?.database_endpoint}</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Simulator Adapter:</td>
                      <td>
                        <span className="badge bg-success-subtle text-success">
                          <CheckCircle2 size={12} className="me-1 inline" /> {systemInfo?.simulator_mode}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">RBAC Authorization:</td>
                      <td>
                        <span className="badge bg-info-subtle text-info">Enforced (5 Roles)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Contact Center Routing Algorithm Parameters */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
              <Sliders className="text-primary" size={18} />
              <h5 className="card-title fw-bold mb-0 text-dark">Contact Center Simulator Parameters</h5>
            </div>
            <div className="card-body small">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold text-dark">Multi-Skill Matching Strategy</span>
                  <span className="badge bg-primary">Subset Match (Strict)</span>
                </div>
                <div className="text-muted extra-small">
                  Agent must possess all required interaction skills before being placed in eligible pool.
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold text-dark">Customer Tier Priority Scoring</span>
                  <span className="badge bg-warning text-dark">+25 Enterprise / +15 Premium</span>
                </div>
                <div className="text-muted extra-small">
                  Weighted sorting boosts enterprise caller queues above standard inquiries during burst loads.
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold text-dark">Agent Concurrency Cap</span>
                  <span className="badge bg-info text-dark">Max Concurrent Interactions Enforced</span>
                </div>
                <div className="text-muted extra-small">
                  Agents reaching active capacity are locked until pending interactions are resolved.
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold text-dark">Transaction Boundary</span>
                  <span className="badge bg-secondary">ACID DB Transactions</span>
                </div>
                <div className="text-muted extra-small">
                  Atomic row-locking prevents double assignment of interactions to multiple concurrent agents.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Release Quality Gate Engine & Documentation Hub */}
      <div className="row g-4">
        {/* Release Quality Gate Rules */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
              <ShieldCheck className="text-success" size={18} />
              <h5 className="card-title fw-bold mb-0 text-dark">Intelligent Release Readiness Gate Rules</h5>
            </div>
            <div className="card-body small">
              <p className="text-muted mb-3">
                Deterministic policy evaluation applied before candidate releases can proceed to deployment:
              </p>
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark">Zero Open Critical Defects</span>
                    <div className="text-muted extra-small">Any defect with severity Critical in OPEN/IN_PROGRESS blocks release.</div>
                  </div>
                  <span className="badge bg-danger">BLOCKING</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark">Zero Test Regressions & Failures</span>
                    <div className="text-muted extra-small">100% of executed test runs for included requirements must be PASS.</div>
                  </div>
                  <span className="badge bg-danger">BLOCKING</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark">Zero Tests Pending Re-Execution</span>
                    <div className="text-muted extra-small">Requirements modified via Change Impact Explorer require test re-run.</div>
                  </div>
                  <span className="badge bg-danger">BLOCKING</span>
                </div>
                <div className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark">Production Approval Sign-Off</span>
                    <div className="text-muted extra-small">Releases targeting Production require explicit sign-off from Release Manager.</div>
                  </div>
                  <span className="badge bg-danger">BLOCKING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Hub */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
              <BookOpen className="text-primary" size={18} />
              <h5 className="card-title fw-bold mb-0 text-dark">System Documentation & Specifications</h5>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Enterprise architecture, REST API documentation, database schema diagrams, and deployment guides:
              </p>
              <div className="d-flex flex-column gap-2">
                <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold small text-dark">Architecture & System Design</div>
                    <div className="text-muted extra-small">docs/architecture.md</div>
                  </div>
                  <span className="badge bg-secondary">System Blueprint</span>
                </div>
                <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold small text-dark">RESTful API Reference</div>
                    <div className="text-muted extra-small">docs/api.md</div>
                  </div>
                  <span className="badge bg-secondary">Endpoints</span>
                </div>
                <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold small text-dark">Database Schema & ER Model</div>
                    <div className="text-muted extra-small">docs/database.md</div>
                  </div>
                  <span className="badge bg-secondary">MySQL Schema</span>
                </div>
                <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold small text-dark">DevOps & CI/CD Deployment</div>
                    <div className="text-muted extra-small">docs/deployment.md</div>
                  </div>
                  <span className="badge bg-secondary">Docker / CI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
