import React, { useState, useEffect } from 'react';
import { ticketsApi, customersApi } from '../api/client';
import { Ticket, Plus, Search, Filter, History, Edit, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ServiceTicketPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  // Form State
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [priority, setPriority] = useState('Medium');
  const [assignedOwner, setAssignedOwner] = useState('Unassigned');
  const [formError, setFormError] = useState('');

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [changeNotes, setChangeNotes] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await ticketsApi.list(params);
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    customersApi.list().then(res => setCustomers(res.data || [])).catch(() => {});
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setCategory('Technical Support');
    setPriority('Medium');
    setAssignedOwner('Unassigned');
    setCustomerId(customers[0]?.id || '');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await ticketsApi.create({
        customer_id: customerId,
        title,
        description,
        category,
        priority,
        assigned_owner: assignedOwner
      });
      setShowCreateModal(false);
      fetchTickets();
    } catch (err) {
      setFormError(err.message || 'Failed to create ticket');
    }
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setNewStatus(ticket.status);
    setChangeNotes('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await ticketsApi.update(editingTicket.id, {
        status: newStatus,
        change_notes: changeNotes || `Updated status to ${newStatus}`
      });
      setEditingTicket(null);
      fetchTickets();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const handleViewHistory = (ticket) => {
    setSelectedTicket(ticket);
    setShowHistoryModal(true);
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Service Ticket Management</h3>
          <p className="text-muted fs-7 mb-0">Customer service ticketing with complete state change audit trails</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '10px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search ticket title or #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Customer">Pending Customer</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-light" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-md-2 text-end text-muted fs-8">
            {tickets.length} ticket(s)
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-custom">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No service tickets found.</td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t.id}>
                    <td><span className="fw-bold text-primary">{t.ticket_number}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{t.title}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                        {t.description}
                      </small>
                    </td>
                    <td className="text-muted fs-8">{t.customer_name}</td>
                    <td><span className="badge bg-light text-dark border fs-8">{t.category}</span></td>
                    <td>
                      <span className={`badge-status ${
                        t.priority === 'Urgent' ? 'badge-critical' :
                        t.priority === 'High' ? 'badge-high' :
                        t.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        t.status === 'Resolved' || t.status === 'Closed' ? 'bg-success' :
                        t.status === 'In Progress' ? 'bg-primary' :
                        t.status === 'Assigned' ? 'bg-info text-dark' : 'bg-warning text-dark'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="text-muted fs-8">{t.assigned_owner || 'Unassigned'}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-1 py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleViewHistory(t)}
                        title="View Audit Trail"
                      >
                        <History size={13} className="me-1 inline" />
                        <span>History</span>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleOpenEdit(t)}
                        title="Update Status"
                      >
                        <Edit size={13} className="me-1 inline" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket History Modal */}
      {showHistoryModal && selectedTicket && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Ticket History: {selectedTicket.ticket_number}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)} />
              </div>
              <div className="modal-body p-4">
                <h6 className="fw-semibold text-dark mb-3">{selectedTicket.title}</h6>
                {(!selectedTicket.history || selectedTicket.history.length === 0) ? (
                  <p className="text-muted fs-8">No history logged yet.</p>
                ) : (
                  <div className="timeline position-relative ps-3 border-start">
                    {selectedTicket.history.map((h, i) => (
                      <div key={i} className="mb-3 position-relative">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold text-dark fs-8">{h.actor_name}</span>
                          <span className="badge bg-light text-dark border fs-9">{h.new_status}</span>
                        </div>
                        <div className="text-muted fs-8 mt-1">{h.change_notes}</div>
                        <small className="text-muted fs-9 d-block mt-1">
                          {new Date(h.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {editingTicket && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Update Ticket: {editingTicket.ticket_number}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTicket(null)} />
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Status Transition</label>
                    <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Customer">Pending Customer</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Change Summary / Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Reason for state transition or resolution details..."
                      value={changeNotes}
                      onChange={(e) => setChangeNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setEditingTicket(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Save Status</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Create Service Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Customer</label>
                    <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.customer_tier})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Ticket Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Brief problem summary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Detailed customer inquiry or technical support issue"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Category</label>
                      <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing">Billing</option>
                        <option value="Account Management">Account Management</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Priority</label>
                      <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Assigned Owner</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assignedOwner}
                      onChange={(e) => setAssignedOwner(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Create Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
