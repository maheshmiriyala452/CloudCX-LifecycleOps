import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { releasesApi } from '../api/client';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Server,
  ArrowRight,
  UserCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReleaseReadinessReportPage = () => {
  const { hasRole, user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [releases, setReleases] = useState([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await releasesApi.list();
        const list = res.data || [];
        setReleases(list);
        if (list.length > 0) {
          const initId = queryId || list[0].id;
          setSelectedReleaseId(initId);
          await loadReadiness(initId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [queryId]);

  const loadReadiness = async (relId) => {
    try {
      setLoading(true);
      const res = await releasesApi.getReadiness(relId);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRelease = (e) => {
    const newId = e.target.value;
    setSelectedReleaseId(newId);
    setBanner(null);
    loadReadiness(newId);
  };

  const handleDecision = async (decision) => {
    try {
      setActionLoading(true);
      setBanner(null);
      await releasesApi.approve(selectedReleaseId, decision, decisionNotes);
      setBanner({
        type: decision === 'Approved' ? 'success' : 'warning',
        text: `Release decision recorded: Release was ${decision.toLowerCase()} by ${user?.full_name}.`
      });
      setDecisionNotes('');
      await loadReadiness(selectedReleaseId);
      // Refresh releases list
      const listRes = await releasesApi.list();
      setReleases(listRes.data || []);
    } catch (err) {
      setBanner({ type: 'danger', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const isReady = report?.is_ready;
  const metrics = report?.metrics || {};

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold text-dark mb-1">Intelligent Release Readiness Gate</h3>
            <span className="badge bg-warning text-dark fw-bold">Deterministic Quality Gates</span>
          </div>
          <p className="text-muted fs-7 mb-0">Automated pre-deployment governance &bull; Blocks unauthorized releases and unverified changes</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/releases" className="btn btn-outline-secondary btn-sm">Release Roster</Link>
          <Link to={`/deployments?id=${selectedReleaseId}`} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <Server size={14} />
            <span>Deployment Simulator</span>
          </Link>
        </div>
      </div>

      {banner && (
        <div className={`alert alert-${banner.type} alert-dismissible fade show fs-7 py-2 rounded-3 mb-4`} role="alert">
          {banner.text}
          <button type="button" className="btn-close py-2" onClick={() => setBanner(null)} />
        </div>
      )}

      {/* Release Selector */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <label className="form-label fw-bold text-dark fs-8 mb-0">Select Release Candidate to Evaluate:</label>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={selectedReleaseId}
              onChange={handleSelectRelease}
            >
              {releases.map(rel => (
                <option key={rel.id} value={rel.id}>
                  {rel.release_key} (v{rel.version_number} &bull; {rel.target_environment} &bull; Status: {rel.status})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-end text-muted fs-8">
            Target: <strong>{report?.target_environment || 'N/A'}</strong> &bull; Status: <strong>{report?.status}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : !report ? (
        <div className="alert alert-warning">No report data found.</div>
      ) : (
        <>
          {/* Readiness Status Banner */}
          <div className={`card border-0 shadow-sm p-4 mb-4 text-white ${isReady ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '14px' }}>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-2 mb-2">
                  {isReady ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                  <h3 className="fw-bold mb-0">
                    {isReady ? 'Release Gate Passed: Ready for Deployment' : 'Release Gate Blocked: Deployment Prohibited'}
                  </h3>
                </div>
                <p className="mb-0 text-light fs-7" style={{ opacity: 0.9 }}>
                  {isReady
                    ? `Release ${report.release_key} (v${report.version_number}) has satisfied all automated quality gates. Zero critical defects detected; all linked tests verified.`
                    : `Release ${report.release_key} failed deterministic readiness validation. Blocking issues must be addressed before approval.`
                  }
                </p>
              </div>
              <div className="col-lg-4 text-end mt-3 mt-lg-0">
                <div className="d-inline-block bg-white bg-opacity-20 p-3 rounded-3 text-start">
                  <div className="text-uppercase fw-bold fs-9" style={{ letterSpacing: '0.06em' }}>Readiness Score</div>
                  <div className="fs-2 fw-bold">{report.readiness_score}%</div>
                  <small className="fs-9 text-light">{isReady ? '100% Policy Compliance' : `${report.blocking_issues.length} Blocking Issue(s)`}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Counters */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="metric-card p-3">
                <div className="card-title-muted">Included Reqs</div>
                <div className="fs-4 fw-bold text-dark">{metrics.total_requirements || 0}</div>
                <small className="text-muted fs-9">Scope count</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="metric-card p-3">
                <div className="card-title-muted">Test Verification</div>
                <div className="fs-4 fw-bold text-success">{metrics.passed_tests || 0} / {metrics.total_test_cases || 0}</div>
                <small className="text-muted fs-9">Passed / Total</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="metric-card p-3">
                <div className="card-title-muted">Critical Defects</div>
                <div className={`fs-4 fw-bold ${metrics.critical_defects > 0 ? 'text-danger' : 'text-success'}`}>
                  {metrics.critical_defects || 0}
                </div>
                <small className="text-muted fs-9">Unresolved blockers</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="metric-card p-3">
                <div className="card-title-muted">Governance Approvals</div>
                <div className="fs-4 fw-bold text-primary">{metrics.approvals_count || 0}</div>
                <small className="text-muted fs-9">Signed records</small>
              </div>
            </div>
          </div>

          {/* Breakdown Split: Checks Checklist vs Blocking Issues & Actions */}
          <div className="row g-4 mb-4">
            {/* Passed Checks */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <CheckCircle2 size={20} className="text-success" />
                  <span>Passed Quality Checks ({report.passed_checks.length})</span>
                </h5>
                {report.passed_checks.length === 0 ? (
                  <p className="text-muted fs-8">No checks have passed yet.</p>
                ) : (
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    {report.passed_checks.map((chk, i) => (
                      <li key={i} className="p-2 rounded bg-light border border-success border-opacity-25 d-flex align-items-center gap-2 fs-8 text-dark">
                        <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Blocking Issues & Recommended Actions */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <AlertTriangle size={20} className="text-danger" />
                  <span>Blocking Issues ({report.blocking_issues.length})</span>
                </h5>
                {report.blocking_issues.length === 0 ? (
                  <div className="p-3 bg-light text-success rounded border border-success border-opacity-25 fs-8 d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>Zero blocking issues detected. Release meets all deterministic readiness criteria.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {report.blocking_issues.map((issue, i) => (
                      <div key={i} className="p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 d-flex align-items-start gap-2 fs-8 text-danger">
                        <XCircle size={16} className="text-danger mt-1 flex-shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}

                {report.recommended_actions.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold text-dark fs-8 text-uppercase mb-2">Recommended Corrective Actions</h6>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                      {report.recommended_actions.map((act, i) => (
                        <li key={i} className="fs-8 text-muted d-flex align-items-center gap-2">
                          <ArrowRight size={13} className="text-primary flex-shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formal Approval Workflow Action Box */}
          <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark mb-1">Formal Governance Sign-Off</h5>
            <small className="text-muted mb-3 d-block">
              Enforced Role: <strong>Release Manager</strong> or <strong>Administrator</strong>. Approvals are saved in the immutable audit trail.
            </small>

            <div className="mb-3">
              <label className="form-label fw-semibold text-muted fs-8">Decision Notes / Justification</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Document approval sign-off reason or rejection explanation..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-success fw-bold px-4 py-2 d-flex align-items-center gap-2"
                onClick={() => handleDecision('Approved')}
                disabled={actionLoading || !isReady || !hasRole('Release Manager', 'Administrator')}
                title={!isReady ? "Cannot approve: Release Readiness Gate check failed" : "Approve release"}
              >
                <CheckCircle2 size={16} />
                <span>{actionLoading ? 'Recording...' : 'Formal Sign-Off (Approve)'}</span>
              </button>

              <button
                className="btn btn-outline-danger fw-semibold px-3 py-2"
                onClick={() => handleDecision('Rejected')}
                disabled={actionLoading || !hasRole('Release Manager', 'Administrator')}
              >
                Reject Release
              </button>

              {!hasRole('Release Manager', 'Administrator') && (
                <div className="text-danger fs-8 d-flex align-items-center gap-1 ms-2">
                  <ShieldAlert size={15} />
                  <span>Only Release Managers or Administrators can approve releases. Switch persona in the top navigation to test sign-off.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
