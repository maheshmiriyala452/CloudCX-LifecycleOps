import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { almApi } from '../api/client';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const TraceabilityMatrixPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, MISSING_TESTS, FAILED_TESTS, CRITICAL_DEFECTS, DEPLOYED

  const fetchTraceability = async () => {
    try {
      setLoading(true);
      const res = await almApi.getTraceability();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraceability();
  }, []);

  if (loading && !data) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const summary = data?.summary || {};
  let matrix = data?.matrix || [];

  // Filter matrix based on user selection
  if (filterType === 'MISSING_TESTS') {
    matrix = matrix.filter(m => !m.indicators.has_tests);
  } else if (filterType === 'FAILED_TESTS') {
    matrix = matrix.filter(m => m.indicators.has_failed_test);
  } else if (filterType === 'CRITICAL_DEFECTS') {
    matrix = matrix.filter(m => m.indicators.has_critical_defect);
  } else if (filterType === 'DEPLOYED') {
    matrix = matrix.filter(m => m.indicators.is_released);
  }

  if (search) {
    matrix = matrix.filter(m =>
      m.requirement.req_key.toLowerCase().includes(search.toLowerCase()) ||
      m.requirement.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Requirement Traceability Matrix (RTM)</h3>
          <p className="text-muted fs-7 mb-0">End-to-end auditability &bull; Requirements &rarr; Tasks &rarr; Tests &rarr; Defects &rarr; Releases &rarr; Deployments</p>
        </div>
        <Link to="/alm/impact" className="btn btn-outline-info text-dark fw-bold d-flex align-items-center gap-1 shadow-sm">
          <Sparkles size={16} />
          <span>Change Impact Explorer</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Total Reqs</div>
            <div className="fs-4 fw-bold text-dark">{summary.total_requirements || 0}</div>
            <div className="text-muted fs-9">Active ALM scope</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Fully Traced</div>
            <div className="fs-4 fw-bold text-success">{summary.fully_traced_count || 0}</div>
            <div className="text-muted fs-9">Has tasks & tests</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Missing Tests</div>
            <div className="fs-4 fw-bold text-warning">{summary.missing_tests_count || 0}</div>
            <div className="text-muted fs-9">Needs test cases</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Failed Tests</div>
            <div className="fs-4 fw-bold text-danger">{summary.failed_tests_count || 0}</div>
            <div className="text-muted fs-9">Verification issues</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Critical Bugs</div>
            <div className="fs-4 fw-bold text-danger">{summary.critical_defects_count || 0}</div>
            <div className="text-muted fs-9">Gate blockers</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="metric-card p-3">
            <div className="card-title-muted">Deployed</div>
            <div className="fs-4 fw-bold text-info">{summary.deployed_count || 0}</div>
            <div className="text-muted fs-9">Live in environment</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search requirement key or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7 d-flex justify-content-md-end gap-1 flex-wrap">
            <button
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setFilterType('ALL')}
            >
              All Requirements
            </button>
            <button
              className={`btn btn-sm ${filterType === 'FAILED_TESTS' ? 'btn-danger' : 'btn-light border'}`}
              onClick={() => setFilterType('FAILED_TESTS')}
            >
              Failed Tests
            </button>
            <button
              className={`btn btn-sm ${filterType === 'CRITICAL_DEFECTS' ? 'btn-danger' : 'btn-light border'}`}
              onClick={() => setFilterType('CRITICAL_DEFECTS')}
            >
              Critical Bugs
            </button>
            <button
              className={`btn btn-sm ${filterType === 'MISSING_TESTS' ? 'btn-warning' : 'btn-light border'}`}
              onClick={() => setFilterType('MISSING_TESTS')}
            >
              Missing Tests
            </button>
            <button
              className={`btn btn-sm ${filterType === 'DEPLOYED' ? 'btn-success' : 'btn-light border'}`}
              onClick={() => setFilterType('DEPLOYED')}
            >
              Deployed
            </button>
          </div>
        </div>
      </div>

      {/* Traceability Matrix Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Requirement</th>
                <th style={{ width: '18%' }}>Implementation Tasks</th>
                <th style={{ width: '22%' }}>Test Verification & Results</th>
                <th style={{ width: '16%' }}>Defects</th>
                <th style={{ width: '14%' }}>Release & Deploy Status</th>
                <th style={{ width: '8%' }} className="text-end">Trace Health</th>
              </tr>
            </thead>
            <tbody>
              {matrix.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No requirement records match current RTM filter.
                  </td>
                </tr>
              ) : (
                matrix.map((row, idx) => {
                  const req = row.requirement;
                  const ind = row.indicators;
                  return (
                    <tr key={idx} className={ind.has_critical_defect ? 'table-danger table-opacity-10' : ''}>
                      {/* 1. Requirement Column */}
                      <td>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-bold text-primary fs-8">{req.req_key}</span>
                          <span className="badge bg-light text-dark border fs-9">v{req.version}</span>
                          <span className={`badge-status ${
                            req.business_priority === 'Critical' ? 'badge-critical' :
                            req.business_priority === 'High' ? 'badge-high' : 'badge-medium'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {req.business_priority}
                          </span>
                        </div>
                        <div className="fw-semibold text-dark fs-8">{req.title}</div>
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>
                          {req.acceptance_criteria || req.description}
                        </small>
                      </td>

                      {/* 2. Tasks Column */}
                      <td>
                        {row.tasks.length === 0 ? (
                          <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1 fs-9">
                            <AlertTriangle size={11} />
                            <span>No Tasks</span>
                          </span>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {row.tasks.map(t => (
                              <div key={t.id} className="d-flex align-items-center justify-content-between p-1 bg-light rounded border fs-9">
                                <span className="fw-bold text-primary">{t.task_key}</span>
                                <span className={`badge ${t.status === 'Done' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.62rem' }}>
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 3. Test Cases Column */}
                      <td>
                        {row.test_cases.length === 0 ? (
                          <span className="badge bg-danger d-inline-flex align-items-center gap-1 fs-9">
                            <XCircle size={11} />
                            <span>No Tests</span>
                          </span>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {row.test_cases.map(tc => (
                              <div key={tc.id} className="d-flex align-items-center justify-content-between p-1 bg-light rounded border fs-9">
                                <div className="text-truncate me-1" style={{ maxWidth: '140px' }}>
                                  <span className="fw-bold text-dark">{tc.test_key}:</span> {tc.title}
                                </div>
                                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                  {tc.needs_rerun && (
                                    <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>Rerun!</span>
                                  )}
                                  <span className={`badge-status ${
                                    tc.latest_result === 'Pass' ? 'badge-pass' :
                                    tc.latest_result === 'Fail' ? 'badge-fail' :
                                    tc.latest_result === 'Blocked' ? 'badge-blocked' : 'badge-notrun'
                                  }`} style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                                    {tc.latest_result}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 4. Defects Column */}
                      <td>
                        {row.defects.length === 0 ? (
                          <span className="text-muted fs-8">Zero defects</span>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {row.defects.map(d => (
                              <div key={d.id} className="p-1 bg-light rounded border fs-9">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span className="fw-bold text-danger">{d.defect_key}</span>
                                  <span className={`badge ${d.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '0.6rem' }}>
                                    {d.severity}
                                  </span>
                                </div>
                                <div className="text-truncate text-muted" style={{ maxWidth: '150px' }}>
                                  {d.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 5. Release & Deployment Column */}
                      <td>
                        {row.releases.length === 0 ? (
                          <span className="badge bg-light text-muted border fs-9">Unpackaged</span>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {row.releases.map(rel => (
                              <div key={rel.id} className="p-1 bg-light rounded border fs-9">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span className="fw-bold text-dark">{rel.release_key}</span>
                                  <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>v{rel.version_number}</span>
                                </div>
                                <div className="mt-1">
                                  <span className={`badge ${rel.status === 'Deployed' ? 'bg-success' : 'bg-info text-dark'}`} style={{ fontSize: '0.62rem' }}>
                                    {rel.status} ({rel.target_environment})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 6. Trace Health */}
                      <td className="text-end">
                        <span className={`badge ${
                          ind.trace_status === 'Healthy' ? 'bg-success' :
                          ind.trace_status === 'Critical Blocker' ? 'bg-danger' :
                          ind.trace_status === 'Test Issues' ? 'bg-warning text-dark' : 'bg-secondary'
                        }`} style={{ fontSize: '0.72rem' }}>
                          {ind.trace_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
