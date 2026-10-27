import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Rocket, RotateCcw, AlertTriangle, CheckCircle2, XCircle, 
  Clock, ShieldAlert, Terminal, Play, RefreshCw, Eye, Info
} from 'lucide-react';
import { deploymentsApi, releasesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DeploymentSimulatorPage() {
  const [searchParams] = useSearchParams();
  const initialReleaseId = searchParams.get('release_id');

  const { hasRole } = useAuth();
  const canDeploy = hasRole(['Release Manager', 'Administrator']);

  const [deployments, setDeployments] = useState([]);
  const [releases, setReleases] = useState([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState(initialReleaseId || '');
  const [forceFailure, setForceFailure] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Rollback Modal State
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [targetDeploymentForRollback, setTargetDeploymentForRollback] = useState(null);
  const [rollbackReason, setRollbackReason] = useState('Post-deployment anomaly detected during automated health probes.');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [depRes, relRes] = await Promise.all([
        deploymentsApi.list(),
        releasesApi.list()
      ]);
      setDeployments(depRes.data || []);
      setReleases(relRes.data || []);

      if (initialReleaseId && relRes.data) {
        setSelectedReleaseId(initialReleaseId);
      } else if (relRes.data && relRes.data.length > 0 && !selectedReleaseId) {
        setSelectedReleaseId(relRes.data[0].id.toString());
      }

      if (depRes.data && depRes.data.length > 0) {
        setActiveDeployment(depRes.data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch deployment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!selectedReleaseId) return;

    try {
      setSimulating(true);
      setError(null);
      setSuccessMsg(null);

      const res = await deploymentsApi.simulate(parseInt(selectedReleaseId), forceFailure);
      setSuccessMsg(res.message || 'Deployment simulation completed.');
      
      // Refresh list
      const depRes = await deploymentsApi.list();
      setDeployments(depRes.data || []);
      if (res.data?.deployment) {
        setActiveDeployment(res.data.deployment);
      }
    } catch (err) {
      setError(err.message || 'Deployment simulation failed.');
      // Refresh list even on failure to view the failed deployment record
      const depRes = await deploymentsApi.list();
      setDeployments(depRes.data || []);
      if (depRes.data && depRes.data.length > 0) {
        setActiveDeployment(depRes.data[0]);
      }
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenRollback = (dep) => {
    setTargetDeploymentForRollback(dep);
    setShowRollbackModal(true);
  };

  const handleConfirmRollback = async () => {
    if (!targetDeploymentForRollback) return;
    try {
      setRollingBack(true);
      setError(null);
      setSuccessMsg(null);

      const res = await deploymentsApi.rollback(targetDeploymentForRollback.id, rollbackReason);
      setSuccessMsg(res.message || 'Rollback simulation completed successfully.');
      setShowRollbackModal(false);

      // Refresh
      const depRes = await deploymentsApi.list();
      setDeployments(depRes.data || []);
      if (res.data?.deployment) {
        setActiveDeployment(res.data.deployment);
      }
    } catch (err) {
      setError(err.message || 'Rollback simulation failed.');
    } finally {
      setRollingBack(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="badge bg-success"><CheckCircle2 size={13} className="me-1 inline" /> SUCCESS</span>;
      case 'FAILED':
        return <span className="badge bg-danger"><XCircle size={13} className="me-1 inline" /> FAILED</span>;
      case 'ROLLED_BACK':
        return <span className="badge bg-warning text-dark"><RotateCcw size={13} className="me-1 inline" /> ROLLED BACK</span>;
      case 'IN_PROGRESS':
        return <span className="badge bg-primary"><RefreshCw size={13} className="me-1 inline spin" /> IN PROGRESS</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const selectedRelObj = releases.find(r => r.id.toString() === selectedReleaseId?.toString());

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Rocket className="text-primary" size={24} />
            Deployment & Rollback Simulator
          </h2>
          <p className="text-muted small mb-0">
            Safe, sandboxed multi-stage deployment simulation for contact center cloud microservices and adapters.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-info-subtle text-info border border-info px-3 py-2">
            <Info size={14} className="me-1" /> Isolated Simulator Mode Active
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchInitialData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin me-1' : 'me-1'} /> Refresh
          </button>
        </div>
      </div>

      {/* Simulator Notice Alert */}
      <div className="alert alert-primary bg-primary-subtle border-primary text-dark py-2 px-3 mb-4 d-flex align-items-center gap-2">
        <ShieldAlert size={20} className="text-primary flex-shrink-0" />
        <div className="small">
          <strong>Production Safety Boundary:</strong> Real cloud telephony engines require separate authorized infrastructure pipelines. 
          This simulator evaluates release readiness gates, runs verifiable canary deployment phases, logs telemetry steps, and allows testing rollback recovery scenarios.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <AlertTriangle size={18} className="me-2" />
          <strong>Simulation Error:</strong> {error}
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

      {/* Top Controls Grid: Simulator Runner + Selected Deployment Status */}
      <div className="row g-4 mb-4">
        {/* Simulator Control Panel */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <Play size={18} className="text-primary" />
                Trigger Simulated Deployment
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSimulate}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Select Target Release</label>
                  <select 
                    className="form-select"
                    value={selectedReleaseId}
                    onChange={(e) => setSelectedReleaseId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Candidate Release --</option>
                    {releases.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.version_number} ({r.target_environment}) - [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRelObj && (
                  <div className="bg-light p-3 rounded mb-3 border small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Target Environment:</span>
                      <span className="badge bg-dark">{selectedRelObj.target_environment}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Release Status:</span>
                      <span className="fw-semibold">{selectedRelObj.status}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Packaged Requirements:</span>
                      <span className="badge bg-secondary">{selectedRelObj.requirements_count || 0} items</span>
                    </div>
                    {selectedRelObj.target_environment === 'Production' && (
                      <div className="mt-2 text-danger fw-semibold d-flex align-items-center gap-1">
                        <ShieldAlert size={14} /> Production releases require APPROVED status & Release Manager role.
                      </div>
                    )}
                  </div>
                )}

                <div className="form-check form-switch mb-4 p-2 bg-light rounded border">
                  <input
                    className="form-check-input ms-0 me-2"
                    type="checkbox"
                    id="forceFailureSwitch"
                    checked={forceFailure}
                    onChange={(e) => setForceFailure(e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold text-danger" htmlFor="forceFailureSwitch">
                    Force Deployment Failure (Test Error Traps & Rollback)
                  </label>
                  <div className="text-muted extra-small ms-4">
                    Injects a simulated contact center adapter handshake timeout on step 4 to verify error boundaries.
                  </div>
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2"
                    disabled={simulating || !selectedReleaseId || !canDeploy}
                  >
                    {simulating ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        Executing Simulation Pipeline...
                      </>
                    ) : (
                      <>
                        <Rocket size={16} />
                        Execute Deployment Simulation
                      </>
                    )}
                  </button>
                  {!canDeploy && (
                    <div className="text-center text-muted extra-small mt-2">
                      Role restricted: Only Release Manager or Administrator can trigger deployments.
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Active Deployment Telemetry & Step Logs */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Terminal size={18} className="text-success" />
                <h5 className="card-title fw-bold mb-0 text-white">Execution Console & Step Logs</h5>
              </div>
              {activeDeployment && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary small">{activeDeployment.environment}</span>
                  {getStatusBadge(activeDeployment.status)}
                </div>
              )}
            </div>

            <div className="card-body bg-dark text-light p-3 font-monospace" style={{ minHeight: '320px', maxHeight: '420px', overflowY: 'auto' }}>
              {activeDeployment ? (
                <div>
                  <div className="text-muted extra-small border-bottom border-secondary pb-2 mb-3">
                    [DEPLOYMENT ID #{activeDeployment.id}] Release: {activeDeployment.release?.version_number} | 
                    Initiated By: {activeDeployment.initiated_by_name} | 
                    Timestamp: {new Date(activeDeployment.started_at).toLocaleString()}
                  </div>

                  {activeDeployment.logs && activeDeployment.logs.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {activeDeployment.logs.map((log, idx) => (
                        <div key={idx} className="p-2 rounded bg-black bg-opacity-50 border border-secondary border-opacity-25 small">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-info fw-bold">
                              &gt; {log.log_step || log.step_name || `Step ${idx + 1}`}
                            </span>
                            <span className={
                              (log.level === 'SUCCESS' || log.status === 'SUCCESS') ? 'badge bg-success-subtle text-success' :
                              (log.level === 'ERROR' || log.status === 'FAILED') ? 'badge bg-danger-subtle text-danger' : 
                              log.level === 'WARN' ? 'badge bg-warning-subtle text-warning' : 'badge bg-secondary'
                            }>
                              {log.level || log.status || 'INFO'}
                            </span>
                          </div>
                          <div className="text-light text-opacity-75 ps-2">
                            {log.message}
                          </div>
                          <div className="text-muted extra-small ps-2 mt-1">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted">No step logs recorded for this deployment execution.</div>
                  )}

                  {/* Rollback Action Bar for Active Deployment */}
                  {activeDeployment.status !== 'ROLLED_BACK' && canDeploy && (
                    <div className="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                      <span className="text-warning small d-flex align-items-center gap-1">
                        <AlertTriangle size={15} /> Incident or anomaly recovery available:
                      </span>
                      <button 
                        className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleOpenRollback(activeDeployment)}
                      >
                        <RotateCcw size={14} /> Simulate Safe Rollback
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <Terminal size={36} className="mb-2 text-secondary opacity-50" />
                  <p>Select a deployment from history or run a new simulation to view live step logs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <Clock size={18} className="text-secondary" />
            Deployment Execution History
          </h5>
          <span className="badge bg-secondary">{deployments.length} Runs Recorded</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Release Version</th>
                <th>Environment</th>
                <th>Initiated By</th>
                <th>Started At</th>
                <th>Completed At</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No deployment simulations recorded yet. Use the control panel above to trigger one.
                  </td>
                </tr>
              ) : (
                deployments.map(dep => (
                  <tr key={dep.id} className={activeDeployment?.id === dep.id ? 'table-active' : ''}>
                    <td className="fw-bold">#{dep.id}</td>
                    <td>
                      <span className="fw-semibold text-primary">
                        {dep.release?.version_number || `Rel #${dep.release_id}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{dep.environment}</span>
                    </td>
                    <td>{dep.initiated_by_name}</td>
                    <td className="small text-muted">{new Date(dep.started_at).toLocaleString()}</td>
                    <td className="small text-muted">
                      {dep.completed_at ? new Date(dep.completed_at).toLocaleString() : 'In Progress'}
                    </td>
                    <td>{getStatusBadge(dep.status)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-secondary" 
                          title="Inspect Telemetry Logs"
                          onClick={() => setActiveDeployment(dep)}
                        >
                          <Eye size={14} className="me-1 inline" /> Logs
                        </button>
                        {dep.status !== 'ROLLED_BACK' && canDeploy && (
                          <button 
                            className="btn btn-outline-warning" 
                            title="Simulate Rollback"
                            onClick={() => handleOpenRollback(dep)}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <RotateCcw size={18} />
                  Simulate Deployment Rollback
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRollbackModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small mb-3">
                  This will simulate an automated zero-downtime rollback for deployment <strong>#{targetDeploymentForRollback?.id}</strong> (Release <strong>{targetDeploymentForRollback?.release?.version_number}</strong>).
                </p>
                <div className="alert alert-warning py-2 px-3 small mb-3">
                  <AlertTriangle size={15} className="me-1 inline" /> 
                  Rollback steps include routing traffic away from canary containers, restoring database migration checkpoints, and reverting the release state to ROLLED_BACK.
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Rollback Justification / Root Cause Reason</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={rollbackReason}
                    onChange={(e) => setRollbackReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRollbackModal(false)} disabled={rollingBack}>
                  Cancel
                </button>
                <button type="button" className="btn btn-warning fw-semibold" onClick={handleConfirmRollback} disabled={rollingBack}>
                  {rollingBack ? (
                    <>
                      <RefreshCw size={14} className="spin me-1" /> Executing Rollback...
                    </>
                  ) : (
                    'Confirm & Execute Rollback'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
