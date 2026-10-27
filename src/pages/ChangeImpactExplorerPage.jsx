import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { impactApi, almApi } from '../api/client';
import {
  Network,
  Sparkles,
  AlertCircle,
  FileText,
  Kanban,
  CheckSquare,
  Bug,
  Rocket,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChangeImpactExplorerPage = () => {
  const { hasRole, user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [requirements, setRequirements] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState('');
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flaggingRerun, setFlaggingRerun] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [showRerunModal, setShowRerunModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await almApi.getRequirements();
        const list = res.data || [];
        setRequirements(list);
        if (list.length > 0) {
          const initialId = queryId || list[0].id;
          setSelectedReqId(initialId);
          await loadImpact(initialId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [queryId]);

  const loadImpact = async (reqId) => {
    try {
      setLoading(true);
      const res = await impactApi.getImpact(reqId);
      setImpactData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequirement = (e) => {
    const newId = e.target.value;
    setSelectedReqId(newId);
    setSuccessBanner('');
    loadImpact(newId);
  };

  const handleTriggerRerun = async (e) => {
    e.preventDefault();
    try {
      setFlaggingRerun(true);
      const res = await impactApi.flagRerun(
        selectedReqId,
        changeReason || 'Requirement specifications altered. Automated verification rerun mandated.'
      );
      setShowRerunModal(false);
      setChangeReason('');
      setSuccessBanner(`Change impact successfully propagated! ${res.data.impact_summary.tests_needing_rerun} test case(s) marked as 'Needs Rerun'. Release Readiness Gate will enforce these verifications.`);
      await loadImpact(selectedReqId);
    } catch (err) {
      alert("Failed to propagate rerun: " + err.message);
    } finally {
      setFlaggingRerun(false);
    }
  };

  const req = impactData?.requirement;
  const summary = impactData?.impact_summary || {};
  const tasks = impactData?.connected_tasks || [];
  const tests = impactData?.connected_tests || [];
  const defects = impactData?.connected_defects || [];
  const releases = impactData?.connected_releases || [];
  const graph = impactData?.graph || { nodes: [], edges: [] };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold text-dark mb-1">Change Impact Explorer</h3>
            <span className="badge bg-info text-dark fw-bold">Proprietary Trace Engine</span>
          </div>
          <p className="text-muted fs-7 mb-0">
            Real-time change impact analysis &bull; Visualizes dependent tasks, test cases, defects, and candidate releases
          </p>
        </div>
        {hasRole('Developer', 'QA Engineer', 'Administrator', 'Release Manager') && (
          <button
            className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowRerunModal(true)}
            disabled={loading || !selectedReqId}
          >
            <Sparkles size={16} />
            <span>Propagate Change & Flag Tests for Rerun</span>
          </button>
        )}
      </div>

      {successBanner && (
        <div className="alert alert-success alert-dismissible fade show fs-7 py-2 rounded-3 mb-4" role="alert">
          <CheckCircle2 size={16} className="me-2 inline" />
          <span>{successBanner}</span>
          <button type="button" className="btn-close py-2" onClick={() => setSuccessBanner('')} />
        </div>
      )}

      {/* Requirement Selector Card */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <label className="form-label fw-bold text-dark fs-8 mb-0">Select Root Requirement to Analyze:</label>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm"
              value={selectedReqId}
              onChange={handleSelectRequirement}
            >
              {requirements.map(r => (
                <option key={r.id} value={r.id}>
                  {r.req_key}: {r.title} (v{r.version} &bull; {r.status})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-end text-muted fs-8">
            Impact Radius: <strong>{summary.total_connected_entities || 0}</strong> linked artifacts
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          {/* Visual Interactive Dependency Graph View */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '14px', background: '#0f172a', color: '#f8fafc' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary pb-3">
              <div>
                <h5 className="fw-bold mb-1 text-white d-flex align-items-center gap-2">
                  <Network size={20} className="text-info" />
                  <span>Interactive Dependency Topology Map</span>
                </h5>
                <small className="text-slate-400">
                  Relational traversal across requirements, implementation tasks, test verifications, defects, and release bundles
                </small>
              </div>
              <span className="badge bg-secondary text-white fs-8">
                {graph.nodes.length} Nodes &bull; {graph.edges.length} Dependencies
              </span>
            </div>

            {/* Central Graph Visual Canvas */}
            <div className="p-3" style={{ overflowX: 'auto' }}>
              <div className="d-flex flex-column align-items-center gap-4 py-2" style={{ minWidth: '700px' }}>
                {/* Level 1: Root Requirement Node */}
                <div className="node-box req-node text-center p-3" style={{ width: '360px', border: '2px solid #38bdf8' }}>
                  <div className="badge bg-primary mb-1">{req?.req_key} (v{req?.version})</div>
                  <div className="fw-bold fs-7 text-white">{req?.title}</div>
                  <div className="text-light opacity-75 fs-9 mt-1">{req?.acceptance_criteria?.slice(0, 70)}...</div>
                  <div className="mt-2 pt-2 border-top border-secondary d-flex justify-content-between fs-9 text-slate-300">
                    <span>Priority: <strong>{req?.business_priority}</strong></span>
                    <span>Status: <strong>{req?.status}</strong></span>
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="text-slate-400 fs-8 d-flex align-items-center gap-2">
                  <span className="badge bg-dark border text-info">Bidirectional Impact Traceability</span>
                </div>

                {/* Level 2: Radiating Dependent Categories */}
                <div className="row g-3 w-100 justify-content-center">
                  {/* Column A: Tasks */}
                  <div className="col-md-3">
                    <div className="p-2 rounded bg-slate-900 border border-slate-700 h-100" style={{ background: '#1e293b' }}>
                      <div className="fw-bold fs-8 text-uppercase text-info mb-2 d-flex align-items-center justify-content-between">
                        <span>Tasks ({tasks.length})</span>
                        <Kanban size={14} />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {tasks.map(t => (
                          <div key={t.id} className="p-2 rounded bg-dark border border-secondary fs-9">
                            <div className="fw-bold text-primary">{t.task_key}</div>
                            <div className="text-white text-truncate">{t.title}</div>
                            <span className="badge bg-secondary mt-1" style={{ fontSize: '0.62rem' }}>{t.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column B: Tests */}
                  <div className="col-md-3">
                    <div className="p-2 rounded bg-slate-900 border border-slate-700 h-100" style={{ background: '#1e293b' }}>
                      <div className="fw-bold fs-8 text-uppercase text-success mb-2 d-flex align-items-center justify-content-between">
                        <span>Tests ({tests.length})</span>
                        <CheckSquare size={14} />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {tests.map(tc => (
                          <div key={tc.id} className={`p-2 rounded bg-dark border ${tc.needs_rerun ? 'border-warning' : 'border-secondary'} fs-9`}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="fw-bold text-success">{tc.test_key}</span>
                              {tc.needs_rerun && <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>RERUN!</span>}
                            </div>
                            <div className="text-white text-truncate">{tc.title}</div>
                            <span className="badge bg-light text-dark mt-1" style={{ fontSize: '0.62rem' }}>{tc.latest_result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column C: Defects */}
                  <div className="col-md-3">
                    <div className="p-2 rounded bg-slate-900 border border-slate-700 h-100" style={{ background: '#1e293b' }}>
                      <div className="fw-bold fs-8 text-uppercase text-danger mb-2 d-flex align-items-center justify-content-between">
                        <span>Defects ({defects.length})</span>
                        <Bug size={14} />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {defects.length === 0 ? (
                          <div className="text-muted fs-9 p-2">Zero defects linked</div>
                        ) : (
                          defects.map(d => (
                            <div key={d.id} className="p-2 rounded bg-dark border border-danger fs-9">
                              <div className="fw-bold text-danger">{d.defect_key}</div>
                              <div className="text-white text-truncate">{d.title}</div>
                              <span className="badge bg-danger mt-1" style={{ fontSize: '0.62rem' }}>{d.severity}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column D: Candidate Releases */}
                  <div className="col-md-3">
                    <div className="p-2 rounded bg-slate-900 border border-slate-700 h-100" style={{ background: '#1e293b' }}>
                      <div className="fw-bold fs-8 text-uppercase text-warning mb-2 d-flex align-items-center justify-content-between">
                        <span>Releases ({releases.length})</span>
                        <Rocket size={14} />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {releases.map(rel => (
                          <div key={rel.id} className="p-2 rounded bg-dark border border-secondary fs-9">
                            <div className="fw-bold text-warning">{rel.release_key}</div>
                            <div className="text-white">v{rel.version_number} &bull; {rel.target_environment}</div>
                            <span className="badge bg-info text-dark mt-1" style={{ fontSize: '0.62rem' }}>{rel.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documented Change Impact Rationale Breakdown */}
          <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark mb-1">Impact Analysis & Linkage Rationale</h5>
            <small className="text-muted mb-4 d-block">
              Explicit database relationships explaining why this requirement is linked to each downstream asset
            </small>

            <div className="row g-4">
              {/* Linked Tasks Rationale */}
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <Kanban size={16} className="text-primary" />
                    <span>Affected Implementation Tasks ({tasks.length})</span>
                  </h6>
                  {tasks.length === 0 ? (
                    <p className="text-muted fs-8">No tasks linked.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {tasks.map(t => (
                        <div key={t.id} className="p-2 bg-light rounded border fs-8">
                          <div className="fw-semibold text-dark">{t.task_key}: {t.title}</div>
                          <div className="text-muted fs-9 mt-1 fst-italic">{t.impact_rationale}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Tests Rationale */}
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <CheckSquare size={16} className="text-success" />
                    <span>Impacted Test Verifications ({tests.length})</span>
                  </h6>
                  {tests.length === 0 ? (
                    <p className="text-muted fs-8">No test cases linked.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {tests.map(tc => (
                        <div key={tc.id} className={`p-2 bg-light rounded border ${tc.needs_rerun ? 'border-warning' : ''} fs-8`}>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-dark">{tc.test_key}: {tc.title}</span>
                            {tc.needs_rerun && (
                              <span className="badge bg-warning text-dark fs-9">Rerun Mandated</span>
                            )}
                          </div>
                          <div className="text-muted fs-9 mt-1 fst-italic">{tc.impact_rationale}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Defects Rationale */}
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <Bug size={16} className="text-danger" />
                    <span>Correlated Defects ({defects.length})</span>
                  </h6>
                  {defects.length === 0 ? (
                    <p className="text-muted fs-8">No defects connected.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {defects.map(d => (
                        <div key={d.id} className="p-2 bg-light rounded border fs-8">
                          <div className="fw-semibold text-danger">{d.defect_key}: {d.title}</div>
                          <div className="text-muted fs-9 mt-1 fst-italic">{d.impact_rationale}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Releases Rationale */}
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <Rocket size={16} className="text-warning" />
                    <span>Impacted Candidate Releases ({releases.length})</span>
                  </h6>
                  {releases.length === 0 ? (
                    <p className="text-muted fs-8">Not included in any candidate release.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {releases.map(rel => (
                        <div key={rel.id} className="p-2 bg-light rounded border fs-8">
                          <div className="fw-semibold text-dark">{rel.release_key} (v{rel.version_number})</div>
                          <div className="text-muted fs-9 mt-1 fst-italic">{rel.impact_rationale}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Propagate Rerun Modal */}
      {showRerunModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Propagate Change & Flag Tests for Rerun
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRerunModal(false)} />
              </div>
              <form onSubmit={handleTriggerRerun}>
                <div className="modal-body p-4">
                  <p className="text-muted fs-8 mb-3">
                    Flagging affected tests updates every linked test case with <code className="text-danger">needs_rerun = True</code> and records the rationale in the system audit trail. The Release Readiness Gate will automatically block approval until these test cases are re-executed.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Change Rationale / Engineering Reason</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="e.g. Skill matching weight modified to incorporate wait-time priority decay."
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowRerunModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={flaggingRerun}>
                    {flaggingRerun ? 'Propagating...' : 'Propagate & Mandate Rerun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
