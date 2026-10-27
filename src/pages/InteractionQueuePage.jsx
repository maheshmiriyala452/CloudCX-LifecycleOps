import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interactionsApi } from '../api/client';
import {
  PhoneCall,
  Play,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Phone,
  MessageSquare,
  Mail,
  UserCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InteractionQueuePage = () => {
  const { hasRole } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [routingAll, setRoutingAll] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Resolve Modal
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (channelFilter) params.channel = channelFilter;
      const res = await interactionsApi.list(params);
      setInteractions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
    const interval = setInterval(fetchInteractions, 8000);
    return () => clearInterval(interval);
  }, [statusFilter, channelFilter]);

  const handleRouteAll = async () => {
    try {
      setRoutingAll(true);
      setBannerMessage(null);
      const res = await interactionsApi.routeAll();
      setBannerMessage({
        type: 'success',
        text: `Routing Engine Processed: Routed ${res.data.routed_count} of ${res.data.processed_count} waiting interactions.`
      });
      await fetchInteractions();
    } catch (err) {
      setBannerMessage({ type: 'danger', text: err.message || 'Routing failed' });
    } finally {
      setRoutingAll(false);
    }
  };

  const handleRouteSingle = async (id) => {
    try {
      const res = await interactionsApi.routeSingle(id);
      setBannerMessage({
        type: 'success',
        text: `Assigned interaction to agent ${res.data.agent_name} (${res.data.agent_id}). Capacity remaining: ${res.data.agent_max_concurrency - res.data.agent_current_load}`
      });
      fetchInteractions();
    } catch (err) {
      setBannerMessage({ type: 'warning', text: err.message });
    }
  };

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      await interactionsApi.simulate();
      setBannerMessage({ type: 'info', text: 'Simulated 3 inbound interactions (Voice, Chat, Email) with randomized skill requirements.' });
      await fetchInteractions();
    } catch (err) {
      setBannerMessage({ type: 'danger', text: err.message });
    } finally {
      setSimulating(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await interactionsApi.resolve(resolvingId, resolutionNotes || 'Inquiry successfully resolved');
      setResolvingId(null);
      setResolutionNotes('');
      fetchInteractions();
    } catch (err) {
      alert("Resolve failed: " + err.message);
    }
  };

  const waitingCount = interactions.filter(i => i.status === 'Waiting').length;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Interaction Queue & Routing</h3>
          <p className="text-muted fs-7 mb-0">Multi-channel routing engine &bull; Concurrency limits & customer tier prioritization</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
            onClick={handleSimulate}
            disabled={simulating}
          >
            <Sparkles size={16} />
            <span>{simulating ? 'Injecting Calls...' : 'Simulate 3 Inbound Calls/Chats'}</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={handleRouteAll}
            disabled={routingAll || waitingCount === 0}
          >
            <Play size={16} />
            <span>{routingAll ? 'Executing Routing Rules...' : `Route All in Queue (${waitingCount})`}</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className={`alert alert-${bannerMessage.type} alert-dismissible fade show fs-7 py-2 rounded-3 mb-4`} role="alert">
          {bannerMessage.text}
          <button type="button" className="btn-close py-2" onClick={() => setBannerMessage(null)} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Waiting">Waiting (Unassigned)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="">All Channels</option>
              <option value="Voice">Voice</option>
              <option value="Chat">Chat</option>
              <option value="Email">Email</option>
            </select>
          </div>
          <div className="col-md-4 text-end text-muted fs-8">
            Queue Depth: <strong>{waitingCount}</strong> waiting &bull; Total: {interactions.length}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Interaction ID</th>
                <th>Customer / Tier</th>
                <th>Channel</th>
                <th>Priority</th>
                <th>Required Skills</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Wait Time</th>
                <th className="text-end">Routing Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : interactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">Queue is currently clear. Use "Simulate 3 Inbound Calls/Chats" to test routing.</td>
                </tr>
              ) : (
                interactions.map(i => (
                  <tr key={i.id}>
                    <td>
                      <Link to={`/interactions/${i.id}`} className="fw-bold text-primary text-decoration-none">
                        {i.interaction_id}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{i.customer_name}</div>
                      <span className={`badge-status ${
                        i.customer_tier === 'Enterprise' ? 'badge-enterprise' :
                        i.customer_tier === 'Premium' ? 'badge-premium' : 'badge-standard'
                      }`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                        {i.customer_tier}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                        {i.channel === 'Voice' ? <Phone size={12} className="text-primary" /> :
                         i.channel === 'Chat' ? <MessageSquare size={12} className="text-success" /> :
                         <Mail size={12} className="text-warning" />}
                        <span>{i.channel}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        i.priority === 'Urgent' ? 'bg-danger' :
                        i.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`}>
                        {i.priority}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {i.required_skills && i.required_skills.length > 0 ? (
                          i.required_skills.map((s, idx) => (
                            <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted fs-8">Any Agent</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        i.status === 'Waiting' ? 'bg-warning text-dark' :
                        i.status === 'Assigned' ? 'bg-info text-dark' :
                        i.status === 'In Progress' ? 'bg-primary' :
                        i.status === 'Resolved' ? 'bg-success' : 'bg-secondary'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td>
                      {i.assigned_agent_name ? (
                        <div>
                          <div className="fw-semibold text-dark fs-8">{i.assigned_agent_name}</div>
                          <small className="text-muted">{i.assigned_agent_code}</small>
                        </div>
                      ) : (
                        <span className="text-muted fst-italic fs-8">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-muted fs-8">
                        <Clock size={12} />
                        <span>{i.wait_duration_seconds}s</span>
                      </div>
                    </td>
                    <td className="text-end">
                      {i.status === 'Waiting' ? (
                        <button
                          className="btn btn-sm btn-primary py-1 px-2"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => handleRouteSingle(i.id)}
                        >
                          Route
                        </button>
                      ) : i.status === 'Assigned' || i.status === 'In Progress' ? (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => {
                            setResolvingId(i.id);
                            setResolutionNotes('');
                          }}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-success fs-8 fw-semibold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={14} />
                          <span>Resolved</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolvingId && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Resolve Interaction</h5>
                <button type="button" className="btn-close" onClick={() => setResolvingId(null)} />
              </div>
              <form onSubmit={handleResolveSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Resolution Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Document call resolution, action taken, or customer outcome..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      required
                    />
                    <small className="text-muted fs-8 mt-1 d-block">
                      Resolving releases agent concurrency slot back to Available capacity pool.
                    </small>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setResolvingId(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success fw-semibold">Confirm Resolution</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
