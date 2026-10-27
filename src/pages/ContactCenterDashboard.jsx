import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, interactionsApi } from '../api/client';
import {
  Headphones,
  Users,
  Clock,
  PhoneIncoming,
  Ticket,
  Play,
  CheckCircle,
  RefreshCw,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export const ContactCenterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getContactCenter();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSimulateInbound = async () => {
    try {
      setSimulating(true);
      await interactionsApi.simulate();
      await fetchAnalytics();
    } catch (err) {
      alert("Simulation failed: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const channelData = [
    { channel: 'Voice', volume: data?.channel_distribution?.Voice || 0, fill: '#3b82f6' },
    { channel: 'Chat', volume: data?.channel_distribution?.Chat || 0, fill: '#10b981' },
    { channel: 'Email', volume: data?.channel_distribution?.Email || 0, fill: '#f59e0b' }
  ];

  const agentPieData = [
    { name: 'Available', value: summary.available_agents || 0, color: '#10b981' },
    { name: 'Busy (At Capacity)', value: summary.busy_agents || 0, color: '#ef4444' },
    { name: 'Break / Offline', value: summary.offline_agents || 0, color: '#64748b' }
  ];

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Contact Center Operations Dashboard</h3>
          <p className="text-muted fs-7 mb-0">Real-time simulator metrics &bull; Agent availability, channel traffic, and queue latency</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={handleSimulateInbound}
            disabled={simulating}
          >
            <Sparkles size={16} />
            <span>{simulating ? 'Simulating Traffic...' : 'Simulate Inbound Interactions'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="card-title-muted">Active Agents</div>
            <div className="card-value-display text-primary">{summary.available_agents || 0} <span className="fs-6 text-muted fw-normal">/ {summary.total_agents || 0} total</span></div>
            <div className="mt-2 fs-8 text-muted">
              {summary.busy_agents || 0} busy &bull; {summary.offline_agents || 0} break/offline
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="card-title-muted">Queue Depth</div>
            <div className="card-value-display text-warning">{summary.waiting_interactions || 0}</div>
            <div className="mt-2 fs-8 text-muted">
              {summary.active_interactions || 0} currently routed to agents
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="card-title-muted">Average Waiting Time</div>
            <div className="card-value-display text-dark">{summary.average_wait_seconds || 0}s</div>
            <div className="mt-2 fs-8 text-muted">
              Simulated queue latency threshold: 60s
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="card-title-muted">Resolution Rate</div>
            <div className="card-value-display text-success">{summary.resolution_rate || 0}%</div>
            <div className="mt-2 fs-8 text-muted">
              {summary.resolved_interactions || 0} resolved interactions
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Interaction Volume by Channel */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark mb-1">Interaction Volume by Channel</h5>
            <small className="text-muted mb-3 d-block">Simulated traffic across Voice, Web Chat, and Email</small>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData}>
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Agent Availability Breakdown */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark mb-1">Agent Availability State</h5>
            <small className="text-muted mb-3 d-block">Active capacity distribution across agent pool</small>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {agentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Workload & Concurrency Table */}
      <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: '12px' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Agent Workload & Concurrency Limits</h5>
            <small className="text-muted">Live load balancing and throttling per agent capacity</small>
          </div>
          <Link to="/agents" className="btn btn-sm btn-outline-primary">Manage Agents</Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light">
              <tr>
                <th>Agent Code</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>Active Load</th>
                <th>Capacity Limit</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {(data?.agent_workload || []).map(a => (
                <tr key={a.agent_id}>
                  <td><span className="fw-semibold text-primary">{a.agent_id}</span></td>
                  <td>{a.name}</td>
                  <td>
                    <span className={`badge-status ${
                      a.status === 'Available' ? 'badge-available' :
                      a.status === 'Busy' ? 'badge-busy' :
                      a.status === 'Break' ? 'badge-break' : 'badge-offline'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td><strong>{a.current_load}</strong> interactions</td>
                  <td>{a.max_concurrency} max</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '7px' }}>
                        <div
                          className={`progress-bar ${a.utilization_percent >= 100 ? 'bg-danger' : a.utilization_percent >= 50 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar"
                          style={{ width: `${a.utilization_percent}%` }}
                        />
                      </div>
                      <span className="fs-8 fw-semibold text-muted" style={{ minWidth: '40px' }}>{a.utilization_percent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
