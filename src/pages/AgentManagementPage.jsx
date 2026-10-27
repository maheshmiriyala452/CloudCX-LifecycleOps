import React, { useState, useEffect } from 'react';
import { agentsApi } from '../api/client';
import { UserCheck, Plus, Search, Filter, Edit, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AgentManagementPage = () => {
  const { hasRole } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [maxConcurrency, setMaxConcurrency] = useState(3);
  const [skillsStr, setSkillsStr] = useState('voice, billing');
  const [formError, setFormError] = useState('');

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await agentsApi.list(params);
      setAgents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [search, statusFilter]);

  const handleOpenModal = (agent = null) => {
    setEditingAgent(agent);
    setFormError('');
    if (agent) {
      setFullName(agent.full_name);
      setEmail(agent.email);
      setMaxConcurrency(agent.max_concurrency);
      setSkillsStr(agent.skills.map(s => s.skill_name).join(', '));
    } else {
      setFullName('');
      setEmail('');
      setMaxConcurrency(3);
      setSkillsStr('voice, billing');
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    const skills = skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    try {
      if (editingAgent) {
        await agentsApi.update(editingAgent.id, {
          full_name: fullName,
          email,
          max_concurrency: maxConcurrency,
          skills
        });
      } else {
        await agentsApi.create({
          full_name: fullName,
          email,
          max_concurrency: maxConcurrency,
          skills
        });
      }
      setShowModal(false);
      fetchAgents();
    } catch (err) {
      setFormError(err.message || 'Failed to save agent');
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      await agentsApi.updateStatus(agentId, newStatus);
      fetchAgents();
    } catch (err) {
      alert("Status change failed: " + err.message);
    }
  };

  const handleDelete = async (agentId, code) => {
    if (!window.confirm(`Are you sure you want to delete agent ${code}?`)) return;
    try {
      await agentsApi.delete(agentId);
      fetchAgents();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Agent Management</h3>
          <p className="text-muted fs-7 mb-0">Roster management, multi-skill matrix, and concurrency caps</p>
        </div>
        {hasRole('Contact Center Supervisor', 'Administrator') && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => handleOpenModal()}
          >
            <Plus size={16} />
            <span>Provision Agent</span>
          </button>
        )}
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
                placeholder="Search by agent code, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Availability Statuses</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Break">Break</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          <div className="col-md-3 text-end text-muted fs-8">
            Showing {agents.length} agent(s)
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Agent Code</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Skills Matrix</th>
                <th>Status (Quick Toggle)</th>
                <th>Load / Concurrency</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No agents match criteria.
                  </td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.id}>
                    <td><span className="fw-bold text-primary">{agent.agent_id}</span></td>
                    <td className="fw-semibold text-dark">{agent.full_name}</td>
                    <td className="text-muted fs-8">{agent.email}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {agent.skills.map((s, idx) => (
                          <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {hasRole('Contact Center Supervisor', 'Administrator') ? (
                        <select
                          className={`form-select form-select-sm fw-semibold ${
                            agent.availability_status === 'Available' ? 'text-success' :
                            agent.availability_status === 'Busy' ? 'text-danger' :
                            agent.availability_status === 'Break' ? 'text-warning' : 'text-secondary'
                          }`}
                          style={{ width: '130px', fontSize: '0.78rem' }}
                          value={agent.availability_status}
                          onChange={(e) => handleStatusChange(agent.id, e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Busy">Busy</option>
                          <option value="Break">Break</option>
                          <option value="Offline">Offline</option>
                        </select>
                      ) : (
                        <span className={`badge-status ${
                          agent.availability_status === 'Available' ? 'badge-available' :
                          agent.availability_status === 'Busy' ? 'badge-busy' :
                          agent.availability_status === 'Break' ? 'badge-break' : 'badge-offline'
                        }`}>
                          {agent.availability_status}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold">{agent.current_interactions_count}</span> / {agent.max_concurrency} max
                    </td>
                    <td className="text-end">
                      {hasRole('Contact Center Supervisor', 'Administrator') && (
                        <button
                          className="btn btn-sm btn-light border p-1 me-1"
                          onClick={() => handleOpenModal(agent)}
                          title="Edit Agent"
                        >
                          <Edit size={14} className="text-muted" />
                        </button>
                      )}
                      {hasRole('Administrator') && (
                        <button
                          className="btn btn-sm btn-light border p-1 text-danger"
                          onClick={() => handleDelete(agent.id, agent.agent_id)}
                          title="Delete Agent"
                        >
                          <Trash2 size={14} />
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

      {/* Provision / Edit Agent Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editingAgent ? `Edit Agent: ${editingAgent.agent_id}` : 'Provision New Agent'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Maximum Concurrent Interactions</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      value={maxConcurrency}
                      onChange={(e) => setMaxConcurrency(e.target.value)}
                      required
                    />
                    <small className="text-muted fs-8">Agent concurrency throttling cap (e.g. 3)</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Skills (Comma-Separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. voice, billing, technical, chat"
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                    />
                    <small className="text-muted fs-8">Used by Skill-Based Routing Engine to match interactions</small>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Agent</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
