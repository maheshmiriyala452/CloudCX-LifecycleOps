import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, RefreshCw, Calendar, 
  ShieldCheck, ArrowRight, Download, UserCheck, Eye
} from 'lucide-react';
import { auditApi } from '../api/client';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Selected Log Modal
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [entityType, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (entityType) params.entity_type = entityType;
      if (actionFilter) params.action = actionFilter;
      if (search.trim()) params.search = search.trim();

      const res = await auditApi.getLogs(params);
      setLogs(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setEntityType('');
    setActionFilter('');
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <span className="badge bg-success">CREATE</span>;
      case 'UPDATE':
        return <span className="badge bg-primary">UPDATE</span>;
      case 'DELETE':
        return <span className="badge bg-danger">DELETE</span>;
      case 'ROUTE':
        return <span className="badge bg-info text-dark">ROUTE</span>;
      case 'APPROVE':
        return <span className="badge bg-success-subtle text-success border border-success">APPROVE</span>;
      case 'REJECT':
        return <span className="badge bg-danger-subtle text-danger border border-danger">REJECT</span>;
      case 'SIMULATE':
        return <span className="badge bg-purple text-dark" style={{ backgroundColor: '#e9d5ff' }}>SIMULATE</span>;
      case 'ROLLBACK':
        return <span className="badge bg-warning text-dark">ROLLBACK</span>;
      default:
        return <span className="badge bg-secondary">{action}</span>;
    }
  };

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Entity ID', 'Summary'];
    const rows = logs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.actor_name}"`,
      `"${l.actor_role}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id}"`,
      `"${l.change_summary.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FileText className="text-primary" size={24} />
            Enterprise Audit Logs & Compliance Trail
          </h2>
          <p className="text-muted small mb-0">
            Immutable chronicle of configuration adjustments, routing executions, requirement revisions, and release approvals.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={exportCsv} disabled={logs.length === 0}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin me-1' : 'me-1'} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 py-2">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Search size={14} /></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search summary, actor, or entity..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
              >
                <option value="">All Entity Types</option>
                <option value="AGENT">AGENT</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="INTERACTION">INTERACTION</option>
                <option value="TICKET">TICKET</option>
                <option value="REQUIREMENT">REQUIREMENT</option>
                <option value="TASK">TASK</option>
                <option value="DEFECT">DEFECT</option>
                <option value="TEST_RUN">TEST_RUN</option>
                <option value="RELEASE">RELEASE</option>
                <option value="DEPLOYMENT">DEPLOYMENT</option>
                <option value="USER">USER</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="ROUTE">ROUTE</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
                <option value="SIMULATE">SIMULATE</option>
                <option value="ROLLBACK">ROLLBACK</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm flex-grow-1">Filter</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>Reset</button>
            </div>
          </form>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold mb-0 text-dark">Chronological Event Stream</h5>
          <span className="badge bg-secondary">{logs.length} Recorded Events</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 font-monospace small">
            <thead className="table-light">
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Change Summary</th>
                <th className="text-end">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <RefreshCw size={24} className="spin mb-2" />
                    <p>Loading audit ledger...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <FileText size={36} className="mb-2 text-secondary opacity-50" />
                    <p>No audit log entries matching your current filters.</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-muted extra-small text-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark font-sans">{log.actor_name}</div>
                      <div className="text-muted extra-small font-sans">{log.actor_role}</div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                      </span>
                    </td>
                    <td className="font-sans text-truncate" style={{ maxWidth: '420px' }} title={log.change_summary}>
                      {log.change_summary}
                    </td>
                    <td className="text-end font-sans">
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedLog(log)}
                        title="View Full Audit Record"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" />
                  Audit Record #{selectedLog.id}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLog(null)}></button>
              </div>
              <div className="modal-body small">
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="text-muted extra-small">Actor:</div>
                    <div className="fw-bold">{selectedLog.actor_name} ({selectedLog.actor_role})</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted extra-small">Action Type:</div>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted extra-small">Entity:</div>
                    <div className="fw-semibold">{selectedLog.entity_type} ({selectedLog.entity_id})</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted extra-small">Timestamp:</div>
                    <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-muted extra-small fw-semibold">Change Summary</label>
                  <div className="p-2 bg-light rounded border text-dark font-sans">
                    {selectedLog.change_summary}
                  </div>
                </div>

                <div className="text-muted extra-small">
                  IP / Origin: {selectedLog.ip_address || '127.0.0.1 (Local Session)'}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
