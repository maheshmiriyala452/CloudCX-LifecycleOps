import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, auditApi } from '../api/client';
import {
  Headphones,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  GitBranch,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const OverviewDashboard = () => {
  const [ccData, setCcData] = useState(null);
  const [almData, setAlmData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [ccRes, almRes, auditRes] = await Promise.all([
          analyticsApi.getContactCenter(),
          analyticsApi.getAlm(),
          auditApi.getLogs({ limit: 6 })
        ]);
        setCcData(ccRes.data);
        setAlmData(almRes.data);
        setRecentLogs(auditRes.data || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Overview...</span>
        </div>
      </div>
    );
  }

  const ccSummary = ccData?.summary || {};
  const almReqs = almData?.requirements || {};
  const almTests = almData?.test_execution || {};
  const almDefects = almData?.defects || {};
  const almReleases = almData?.releases || {};

  return (
    <div className="container-fluid p-0">
      {/* Platform Banner */}
      <div className="card border-0 text-white p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '14px' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="badge bg-primary px-3 py-1 mb-2 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
              Dual-Domain Integration Engine
            </div>
            <h2 className="fw-bold mb-2 text-white">CloudCX LifecycleOps</h2>
            <p className="text-light mb-3 fs-6" style={{ opacity: 0.9, maxWidth: '680px' }}>
              Bridging Cloud Contact Center Operations with Application Lifecycle Management. Trace requirements through development tasks, automated test runs, readiness gates, and deployment simulations.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/alm/impact" className="btn btn-sm btn-info text-dark fw-bold px-3 py-2 rounded-2 d-flex align-items-center gap-1 shadow-sm">
                <Sparkles size={16} />
                <span>Change Impact Explorer</span>
              </Link>
              <Link to="/releases/readiness" className="btn btn-sm btn-warning text-dark fw-bold px-3 py-2 rounded-2 d-flex align-items-center gap-1 shadow-sm">
                <ShieldCheck size={16} />
                <span>Release Readiness Gate</span>
              </Link>
              <Link to="/interactions" className="btn btn-sm btn-outline-light px-3 py-2 rounded-2 d-flex align-items-center gap-1">
                <Headphones size={16} />
                <span>Interaction Queue</span>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 d-none d-lg-block text-end">
            <div className="p-3 bg-white bg-opacity-10 rounded-3 text-start d-inline-block border border-white border-opacity-10 shadow-sm" style={{ minWidth: '220px' }}>
              <div className="text-white-50 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>System Health Status</div>
              <div className="fs-5 fw-bold text-success mt-1 d-flex align-items-center gap-2">
                <span className="badge bg-success rounded-circle p-1"></span>
                <span>Operational (MySQL 8.0)</span>
              </div>
              <small className="text-light d-block mt-1" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                RBAC Enforced &bull; 100% Traceability
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Domain KPI Metrics Grid */}
      <div className="row g-3 mb-4">
        {/* Metric 1: Agents */}
        <div className="col-sm-6 col-xl-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="card-title-muted">Contact Center Agents</div>
                <div className="card-value-display">{ccSummary.available_agents || 0} <span className="fs-6 text-muted fw-normal">/ {ccSummary.total_agents || 0}</span></div>
                <div className="text-success fs-8 mt-2 fw-medium">
                  {ccSummary.available_agents || 0} Available for Routing
                </div>
              </div>
              <div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
                <Headphones size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Interaction Queue */}
        <div className="col-sm-6 col-xl-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="card-title-muted">Active / Waiting Queue</div>
                <div className="card-value-display text-warning">{ccSummary.waiting_interactions || 0} <span className="fs-6 text-muted fw-normal">waiting</span></div>
                <div className="text-muted fs-8 mt-2">
                  Avg wait time: <strong>{ccSummary.average_wait_seconds || 0}s</strong>
                </div>
              </div>
              <div className="p-2 rounded bg-warning bg-opacity-10 text-warning">
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: ALM Verification Pass Rate */}
        <div className="col-sm-6 col-xl-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="card-title-muted">Test Execution Verification</div>
                <div className="card-value-display text-success">{almTests.pass_rate || 0}%</div>
                <div className="text-muted fs-8 mt-2">
                  {almTests.passed || 0} passed &bull; {almTests.failed || 0} failed
                </div>
              </div>
              <div className="p-2 rounded bg-success bg-opacity-10 text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Release & Governance */}
        <div className="col-sm-6 col-xl-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="card-title-muted">Releases & Deployments</div>
                <div className="card-value-display text-info">{almReleases.deployed || 0} <span className="fs-6 text-muted fw-normal">deployed</span></div>
                <div className="text-muted fs-8 mt-2">
                  Total releases: {almReleases.total || 0}
                </div>
              </div>
              <div className="p-2 rounded bg-info bg-opacity-10 text-info">
                <Rocket size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End Change Traceability Pipeline View */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <GitBranch size={20} className="text-primary" />
              <span>End-to-End Change Traceability Pipeline</span>
            </h5>
            <small className="text-muted">Direct correlation from business requirement to operational release deployment</small>
          </div>
          <Link to="/alm/traceability" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
            <span>View Full RTM</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="row g-2 text-center py-2">
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">1. Requirements</div>
              <div className="fs-4 fw-bold text-dark mt-1">{almReqs.total || 0}</div>
              <small className="text-primary fw-medium">Business Specs</small>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">2. Tasks</div>
              <div className="fs-4 fw-bold text-dark mt-1">{almData?.tasks?.total || 0}</div>
              <small className="text-info fw-medium">Kanban Work</small>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">3. Verification</div>
              <div className="fs-4 fw-bold text-success mt-1">{almTests.total_tests || 0}</div>
              <small className="text-success fw-medium">Test Cases</small>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">4. Defects</div>
              <div className="fs-4 fw-bold text-danger mt-1">{almDefects.open_critical_count || 0}</div>
              <small className="text-danger fw-medium">Critical Open</small>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">5. Gate</div>
              <div className="fs-4 fw-bold text-warning mt-1">Active</div>
              <small className="text-warning fw-medium">Deterministic Rules</small>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted text-uppercase fw-bold fs-8">6. Release</div>
              <div className="fs-4 fw-bold text-primary mt-1">{almReleases.deployed || 0}</div>
              <small className="text-primary fw-medium">Simulated Rollout</small>
            </div>
          </div>
        </div>
      </div>

      {/* Split Row: Real Recent Operational Audit Trail & Quick Links */}
      <div className="row g-4">
        {/* Left Column: Recent Audit Trail */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0">Live Audit & Governance Trail</h5>
              <Link to="/audit-logs" className="btn btn-sm btn-link text-decoration-none">View All Logs</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">No audit records available</td>
                    </tr>
                  ) : (
                    recentLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <div className="fw-semibold text-dark">{log.actor_name}</div>
                          <small className="text-muted">{log.actor_role}</small>
                        </td>
                        <td>
                          <span className={`badge ${
                            log.action === 'APPROVE' ? 'bg-success' :
                            log.action === 'DEPLOY' ? 'bg-info text-dark' :
                            log.action === 'ROUTE' ? 'bg-primary' :
                            log.action === 'CREATE' ? 'bg-secondary' : 'bg-dark'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{log.entity_type}: {log.entity_id}</span>
                        </td>
                        <td className="text-muted text-truncate" style={{ maxWidth: '280px' }} title={log.change_summary}>
                          {log.change_summary}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Key Navigation Hub */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark mb-3">Quick Navigation Hub</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/contact-center" className="p-3 rounded-3 bg-light text-decoration-none d-flex align-items-center justify-content-between border hover-shadow transition">
                <div>
                  <div className="fw-bold text-dark fs-7">Contact Center Simulator</div>
                  <small className="text-muted">Agent availability, concurrency & queue metrics</small>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>

              <Link to="/alm/kanban" className="p-3 rounded-3 bg-light text-decoration-none d-flex align-items-center justify-content-between border hover-shadow transition">
                <div>
                  <div className="fw-bold text-dark fs-7">Kanban Task Board</div>
                  <small className="text-muted">Sprint execution & status workflow transitions</small>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>

              <Link to="/alm/impact" className="p-3 rounded-3 bg-light text-decoration-none d-flex align-items-center justify-content-between border hover-shadow transition">
                <div>
                  <div className="fw-bold text-dark fs-7">Change Impact Explorer</div>
                  <small className="text-muted">Multi-layer requirement change propagation</small>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>

              <Link to="/deployments" className="p-3 rounded-3 bg-light text-decoration-none d-flex align-items-center justify-content-between border hover-shadow transition">
                <div>
                  <div className="fw-bold text-dark fs-7">Deployment Simulator</div>
                  <small className="text-muted">Simulated multi-stage container & schema deployment</small>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
