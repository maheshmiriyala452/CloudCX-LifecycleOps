import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { interactionsApi } from '../api/client';
import { PhoneCall, UserCheck, Clock, CheckCircle, ArrowLeft, Ticket, Shield } from 'lucide-react';

export const InteractionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interaction, setInteraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await interactionsApi.get(id);
      setInteraction(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution notes.");
      return;
    }
    try {
      await interactionsApi.resolve(id, resolutionNotes);
      fetchDetail();
    } catch (err) {
      alert("Resolution failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!interaction) {
    return (
      <div className="alert alert-warning">
        Interaction not found. <Link to="/interactions">Return to queue</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-3">
        <Link to="/interactions" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          <ArrowLeft size={14} />
          <span>Back to Queue</span>
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: '12px' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-3 mb-4 gap-2">
          <div>
            <h4 className="fw-bold text-dark mb-1">{interaction.interaction_id}</h4>
            <span className="badge bg-primary me-2">{interaction.channel} Channel</span>
            <span className={`badge ${
              interaction.status === 'Waiting' ? 'bg-warning text-dark' :
              interaction.status === 'Resolved' ? 'bg-success' : 'bg-info text-dark'
            }`}>
              {interaction.status}
            </span>
          </div>
          <div>
            {interaction.status !== 'Resolved' && (
              <button
                className="btn btn-success btn-sm px-3 fw-semibold"
                onClick={() => handleResolve()}
              >
                Resolve Interaction
              </button>
            )}
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <label className="text-muted fs-8 text-uppercase fw-bold d-block">Customer</label>
            <div className="fw-bold text-dark fs-6 mt-1">{interaction.customer_name}</div>
            <span className={`badge-status ${
              interaction.customer_tier === 'Enterprise' ? 'badge-enterprise' :
              interaction.customer_tier === 'Premium' ? 'badge-premium' : 'badge-standard'
            } mt-1`} style={{ fontSize: '0.7rem' }}>
              {interaction.customer_tier} Tier
            </span>
          </div>

          <div className="col-md-4">
            <label className="text-muted fs-8 text-uppercase fw-bold d-block">Assigned Agent</label>
            <div className="fw-bold text-dark fs-6 mt-1">
              {interaction.assigned_agent_name || <span className="text-muted fst-italic">Waiting in routing queue</span>}
            </div>
            {interaction.assigned_agent_code && (
              <small className="text-muted">Agent Code: {interaction.assigned_agent_code}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="text-muted fs-8 text-uppercase fw-bold d-block">Wait Duration</label>
            <div className="fw-bold text-dark fs-6 mt-1 d-flex align-items-center gap-1">
              <Clock size={16} className="text-muted" />
              <span>{interaction.wait_duration_seconds} seconds</span>
            </div>
            <small className="text-muted">Logged at queue arrival</small>
          </div>

          <div className="col-12">
            <label className="text-muted fs-8 text-uppercase fw-bold d-block mb-1">Required Skills Matrix</label>
            <div className="d-flex flex-wrap gap-1">
              {interaction.required_skills && interaction.required_skills.length > 0 ? (
                interaction.required_skills.map((s, i) => (
                  <span key={i} className="badge bg-light text-dark border px-2 py-1 fs-8">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-muted fs-8">No special skills demanded</span>
              )}
            </div>
          </div>

          {interaction.resolution_notes && (
            <div className="col-12">
              <label className="text-muted fs-8 text-uppercase fw-bold d-block mb-1">Resolution Summary</label>
              <div className="p-3 bg-light rounded-3 border text-dark fs-8">
                {interaction.resolution_notes}
              </div>
            </div>
          )}

          {interaction.status !== 'Resolved' && (
            <div className="col-12">
              <label className="text-muted fs-8 text-uppercase fw-bold d-block mb-1">Update Resolution Notes</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Enter customer resolution notes prior to closing..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
