import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { almApi } from '../api/client';
import { History, Search, Filter, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const TestExecutionHistoryPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.execution_status = statusFilter;
      const res = await almApi.getTestRuns(params);
      setRuns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [statusFilter]);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Test Execution History</h3>
          <p className="text-muted fs-7 mb-0">Immutable historical audit records of manual and automated test runs</p>
        </div>
        <Link to="/alm/test-cases" className="btn btn-outline-secondary d-flex align-items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Test Cases</span>
        </Link>
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <select className="form-select form-select-sm bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Execution Statuses</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Blocked">Blocked</option>
              <option value="Not Run">Not Run</option>
            </select>
          </div>
          <div className="col-md-8 text-end text-muted fs-8">
            Showing {runs.length} test execution run(s)
          </div>
        </div>
      </div>

      {/* Runs Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Run Key</th>
                <th>Test Case</th>
                <th>Result</th>
                <th>Actual Result / Telemetry</th>
                <th>Notes</th>
                <th>Tester</th>
                <th>Executed Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No test execution records found.</td>
                </tr>
              ) : (
                runs.map(r => (
                  <tr key={r.id}>
                    <td><span className="fw-bold text-primary">{r.run_key}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{r.test_case_key}</div>
                      <small className="text-muted">{r.test_case_title}</small>
                    </td>
                    <td>
                      <span className={`badge-status ${
                        r.execution_status === 'Pass' ? 'badge-pass' :
                        r.execution_status === 'Fail' ? 'badge-fail' :
                        r.execution_status === 'Blocked' ? 'badge-blocked' : 'badge-notrun'
                      }`}>
                        {r.execution_status}
                      </span>
                    </td>
                    <td className="text-muted fs-8 text-truncate" style={{ maxWidth: '280px' }}>
                      {r.actual_result || '-'}
                    </td>
                    <td className="text-muted fs-8">{r.notes || '-'}</td>
                    <td className="text-muted fs-8">{r.tester_name}</td>
                    <td className="text-muted fs-8">
                      {new Date(r.executed_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
