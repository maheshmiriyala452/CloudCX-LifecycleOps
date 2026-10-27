import React, { useState, useEffect } from 'react';
import { customersApi } from '../api/client';
import { Users, Plus, Search, Filter, Phone, Mail, MessageSquare, History, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerDirectoryPage = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Standard');
  const [channel, setChannel] = useState('Voice');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (tierFilter) params.tier = tierFilter;
      const res = await customersApi.list(params);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, tierFilter]);

  const handleOpenDetail = async (customerId) => {
    try {
      const res = await customersApi.get(customerId);
      setSelectedCustomer(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Failed to load customer profile: " + err.message);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await customersApi.create({
        name,
        email,
        phone,
        customer_tier: tier,
        preferred_channel: channel,
        notes
      });
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      fetchCustomers();
    } catch (err) {
      setFormError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Customer Directory</h3>
          <p className="text-muted fs-7 mb-0">Customer accounts, SLA tier entitlements, and preferred contact channels</p>
        </div>
        {hasRole('Contact Center Supervisor', 'Administrator') && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        )}
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
                placeholder="Search by customer ID, name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="">All Customer Tiers</option>
              <option value="Enterprise">Enterprise (24/7 SLA + Queue Preemption)</option>
              <option value="Premium">Premium (Priority Routing)</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
          <div className="col-md-3 text-end text-muted fs-8">
            Showing {customers.length} customer(s)
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name / Entity</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service Tier</th>
                <th>Preferred Channel</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No customers found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id}>
                    <td><span className="fw-bold text-primary">{c.customer_id}</span></td>
                    <td className="fw-semibold text-dark">{c.name}</td>
                    <td className="text-muted fs-8">{c.email}</td>
                    <td className="text-muted fs-8">{c.phone || '-'}</td>
                    <td>
                      <span className={`badge-status ${
                        c.customer_tier === 'Enterprise' ? 'badge-enterprise' :
                        c.customer_tier === 'Premium' ? 'badge-premium' : 'badge-standard'
                      }`}>
                        {c.customer_tier}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                        {c.preferred_channel === 'Voice' ? <Phone size={12} className="text-primary" /> :
                         c.preferred_channel === 'Chat' ? <MessageSquare size={12} className="text-success" /> :
                         <Mail size={12} className="text-warning" />}
                        <span>{c.preferred_channel}</span>
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleOpenDetail(c.id)}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & History Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold text-dark">{selectedCustomer.name}</h5>
                  <span className="badge bg-primary me-2">{selectedCustomer.customer_id}</span>
                  <span className={`badge-status ${
                    selectedCustomer.customer_tier === 'Enterprise' ? 'badge-enterprise' :
                    selectedCustomer.customer_tier === 'Premium' ? 'badge-premium' : 'badge-standard'
                  }`}>
                    {selectedCustomer.customer_tier} Tier
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <small className="text-muted d-block fs-8">Email</small>
                    <span className="fw-semibold">{selectedCustomer.email}</span>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block fs-8">Phone</small>
                    <span className="fw-semibold">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block fs-8">Preferred Channel</small>
                    <span className="fw-semibold">{selectedCustomer.preferred_channel}</span>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="col-12">
                      <small className="text-muted d-block fs-8">Account Profile Notes</small>
                      <p className="mb-0 text-dark bg-light p-2 rounded fs-8">{selectedCustomer.notes}</p>
                    </div>
                  )}
                </div>

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Interaction History</h6>
                {(!selectedCustomer.interactions || selectedCustomer.interactions.length === 0) ? (
                  <p className="text-muted fs-8">No interaction records found.</p>
                ) : (
                  <div className="table-responsive mb-4">
                    <table className="table table-sm align-middle fs-8">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Channel</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned Agent</th>
                          <th>Resolution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.interactions.map(i => (
                          <tr key={i.id}>
                            <td className="fw-bold text-primary">{i.interaction_id}</td>
                            <td>{i.channel}</td>
                            <td><span className="badge bg-light text-dark border">{i.priority}</span></td>
                            <td><span className="badge bg-secondary">{i.status}</span></td>
                            <td>{i.assigned_agent_name || 'Unassigned'}</td>
                            <td className="text-truncate" style={{ maxWidth: '180px' }}>{i.resolution_notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Service Tickets</h6>
                {(!selectedCustomer.tickets || selectedCustomer.tickets.length === 0) ? (
                  <p className="text-muted fs-8">No service tickets linked to this customer.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle fs-8">
                      <thead className="table-light">
                        <tr>
                          <th>Ticket #</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.tickets.map(t => (
                          <tr key={t.id}>
                            <td className="fw-bold text-primary">{t.ticket_number}</td>
                            <td>{t.title}</td>
                            <td>{t.category}</td>
                            <td><span className="badge bg-light text-dark border">{t.priority}</span></td>
                            <td><span className="badge bg-info text-dark">{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Add New Customer Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateCustomer}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Customer / Organization Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    <label className="form-label fw-semibold text-muted fs-8">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-800-555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Customer Tier</label>
                      <select className="form-select" value={tier} onChange={(e) => setTier(e.target.value)}>
                        <option value="Enterprise">Enterprise (+25 Queue Priority)</option>
                        <option value="Premium">Premium (+15 Queue Priority)</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Preferred Channel</label>
                      <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <option value="Voice">Voice</option>
                        <option value="Chat">Chat</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Notes / SLA Contract Terms</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Customer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
