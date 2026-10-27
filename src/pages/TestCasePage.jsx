import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { almApi } from '../api/client';
import { CheckSquare, Plus, Search, Filter, Play, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TestCasePage = () => {
  const { hasRole, user } = useAuth();
  const [testCases, setTestCases] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [needsRerunFilter, setNeedsRerunFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [executingTc, setExecutingTc] = useState(null);

  // Create Form State
  const [projectId, setProjectId] = useState('');
  const [linkedReqId, setLinkedReqId] = useState('');
  const [title, setTitle] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [testSteps, setTestSteps] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [testType, setTestType] = useState('Functional');
  const [priority, setPriority] = useState('High');
  const [formError, setFormError] = useState('');

  // Execute Form State
  const [executionStatus, setExecutionStatus] = useState('Pass');
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.test_type = typeFilter;
      if (needsRerunFilter) params.needs_rerun = needsRerunFilter;
      const res = await almApi.getTestCases(params);
      let list = res.data || [];
      if (search) {
        list = list.filter(tc =>
          tc.title.toLowerCase().includes(search.toLowerCase()) ||
          tc.test_key.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTestCases(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
    almApi.getRequirements().then(res => setRequirements(res.data || [])).catch(() => {});
    almApi.getProjects().then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) setProjectId(res.data[0].id);
    }).catch(() => {});
  }, [search, typeFilter, needsRerunFilter]);

  const handleOpenExecute = (tc) => {
    setExecutingTc(tc);
    setExecutionStatus('Pass');
    setActualResult(tc.expected_result);
    setNotes('');
  };

  const handleExecuteSubmit = async (e) => {
    e.preventDefault();
    try {
      await almApi.executeTestRun({
        test_case_id: executingTc.id,
        execution_status: executionStatus,
        actual_result: actualResult,
        notes
      });
      setExecutingTc(null);
      fetchTestCases();
    } catch (err) {
      alert("Execution recording failed: " + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.createTestCase({
        project_id: projectId,
        linked_requirement_id: linkedReqId ? parseInt(linkedReqId) : null,
        title,
        preconditions,
        test_steps: testSteps,
        expected_result: expectedResult,
        test_type: testType,
        priority
      });
      setShowCreateModal(false);
      fetchTestCases();
    } catch (err) {
      setFormError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Test Case Management</h3>
          <p className="text-muted fs-7 mb-0">Test case specifications, automated rerun flags, and verification execution</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/alm/test-runs" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <Clock size={16} />
            <span>Execution History</span>
          </Link>
          {hasRole('QA Engineer', 'Administrator') && (
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              <span>Author Test Case</span>
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
                placeholder="Search test key, title, or steps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-light" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Test Types</option>
              <option value="Functional">Functional</option>
              <option value="Integration">Integration</option>
              <option value="Regression">Regression</option>
              <option value="Performance">Performance</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm bg-light" value={needsRerunFilter} onChange={(e) => setNeedsRerunFilter(e.target.value)}>
              <option value="">Rerun Status (All)</option>
              <option value="true">Needs Rerun (Flagged)</option>
              <option value="false">Verified (Up to date)</option>
            </select>
          </div>
          <div className="col-md-2 text-end text-muted fs-8">
            {testCases.length} test case(s)
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Test Key</th>
                <th>Title & Expected Result</th>
                <th>Linked Requirement</th>
                <th>Type / Priority</th>
                <th>Verification State</th>
                <th>Latest Result</th>
                <th className="text-end">Run Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : testCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No test cases found.</td>
                </tr>
              ) : (
                testCases.map(tc => (
                  <tr key={tc.id}>
                    <td><span className="fw-bold text-primary">{tc.test_key}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{tc.title}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '300px' }}>
                        <strong>Expected:</strong> {tc.expected_result}
                      </small>
                    </td>
                    <td>
                      {tc.requirement_key ? (
                        <div className="badge bg-light text-primary border text-start d-block" style={{ maxWidth: '180px' }}>
                          <span className="fw-bold">{tc.requirement_key}</span>: {tc.requirement_title}
                        </div>
                      ) : (
                        <span className="text-muted fs-8">Unlinked</span>
                      )}
                    </td>
                    <td>
                      <div className="fs-8">
                        <span className="badge bg-light text-dark border me-1">{tc.test_type}</span>
                        <span className={`badge-status ${
                          tc.priority === 'Critical' ? 'badge-critical' :
                          tc.priority === 'High' ? 'badge-high' :
                          tc.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {tc.priority}
                        </span>
                      </div>
                    </td>
                    <td>
                      {tc.needs_rerun ? (
                        <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1" title={tc.rerun_reason}>
                          <AlertCircle size={12} />
                          <span>Needs Rerun</span>
                        </span>
                      ) : (
                        <span className="badge bg-light text-success border d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} />
                          <span>Current</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status ${
                        tc.latest_result === 'Pass' ? 'badge-pass' :
                        tc.latest_result === 'Fail' ? 'badge-fail' :
                        tc.latest_result === 'Blocked' ? 'badge-blocked' : 'badge-notrun'
                      }`}>
                        {tc.latest_result}
                      </span>
                    </td>
                    <td className="text-end">
                      {hasRole('QA Engineer', 'Developer', 'Administrator') && (
                        <button
                          className="btn btn-sm btn-primary py-1 px-2 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => handleOpenExecute(tc)}
                        >
                          <Play size={12} />
                          <span>Execute</span>
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

      {/* Execute Test Run Modal */}
      {executingTc && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Execute Test Run: {executingTc.test_key}
                </h5>
                <button type="button" className="btn-close" onClick={() => setExecutingTc(null)} />
              </div>
              <form onSubmit={handleExecuteSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-2">
                    <span className="fw-semibold text-dark fs-7">{executingTc.title}</span>
                  </div>
                  <div className="p-2 bg-light rounded border mb-3 fs-8 text-muted">
                    <strong>Steps:</strong> {executingTc.test_steps}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Execution Outcome</label>
                    <select
                      className="form-select"
                      value={executionStatus}
                      onChange={(e) => setExecutionStatus(e.target.value)}
                    >
                      <option value="Pass">Pass (Assertions Verified)</option>
                      <option value="Fail">Fail (Discrepancy / Assertion Error)</option>
                      <option value="Blocked">Blocked (Environment / Prerequisite Issue)</option>
                      <option value="Not Run">Not Run</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Actual Result Logged</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={actualResult}
                      onChange={(e) => setActualResult(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Execution Notes & Environment Telemetry</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Verified on Staging build cluster; latency 22ms."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setExecutingTc(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Test Run</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Test Case Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Author Test Case</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Test Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Verify Skill Matching with Multi-Skill Voice Interaction"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

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
                      <label className="form-label fw-semibold text-muted fs-8">Linked Requirement</label>
                      <select className="form-select" value={linkedReqId} onChange={(e) => setLinkedReqId(e.target.value)}>
                        <option value="">-- No Linked Requirement --</option>
                        {requirements.map(r => (
                          <option key={r.id} value={r.id}>{r.req_key}: {r.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Preconditions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Agent with required skill is in Available state"
                      value={preconditions}
                      onChange={(e) => setPreconditions(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Test Steps</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="1. Queue interaction requiring [voice, billing]&#10;2. Trigger routing engine&#10;3. Verify assigned agent"
                      value={testSteps}
                      onChange={(e) => setTestSteps(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Expected Result</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Interaction assigned to agent possessing both voice and billing competencies"
                      value={expectedResult}
                      onChange={(e) => setExpectedResult(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Test Type</label>
                      <select className="form-select" value={testType} onChange={(e) => setTestType(e.target.value)}>
                        <option value="Functional">Functional</option>
                        <option value="Integration">Integration</option>
                        <option value="Regression">Regression</option>
                        <option value="Performance">Performance</option>
                        <option value="Security">Security</option>
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
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Test Case</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
