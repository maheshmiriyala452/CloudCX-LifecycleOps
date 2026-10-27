import React, { useState, useEffect } from 'react';
import { almApi } from '../api/client';
import { Kanban, Plus, ChevronLeft, ChevronRight, Clock, User, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const KanbanBoardPage = () => {
  const { hasRole, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [linkedReqId, setLinkedReqId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [effort, setEffort] = useState(4);
  const [formError, setFormError] = useState('');

  const columns = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await almApi.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    almApi.getRequirements().then(res => setRequirements(res.data || [])).catch(() => {});
    almApi.getProjects().then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) setProjectId(res.data[0].id);
    }).catch(() => {});
  }, []);

  const handleMoveStatus = async (task, direction) => {
    const currentIndex = columns.indexOf(task.status);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const targetStatus = columns[newIndex];
    try {
      await almApi.updateTask(task.id, { status: targetStatus });
      fetchTasks();
    } catch (err) {
      alert("Transition failed: " + err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await almApi.createTask({
        project_id: projectId,
        linked_requirement_id: linkedReqId ? parseInt(linkedReqId) : null,
        title,
        description,
        assignee_name: assignee || user?.full_name || 'David Zhang',
        priority,
        estimated_effort_hours: parseFloat(effort),
        status: 'To Do'
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      setFormError(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Kanban Task Board</h3>
          <p className="text-muted fs-7 mb-0">Development task execution &bull; Linked requirements and workflow transitions</p>
        </div>
        {hasRole('Developer', 'Administrator') && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="kanban-board">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="kanban-column">
                <div className="kanban-header">
                  <span className="text-dark">{col}</span>
                  <span className="badge bg-secondary rounded-pill">{colTasks.length}</span>
                </div>

                <div className="kanban-list">
                  {colTasks.length === 0 ? (
                    <div className="p-3 text-center text-muted fs-8 border border-dashed rounded bg-white">
                      No tasks in {col}
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div key={task.id} className="kanban-card">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold text-primary fs-8">{task.task_key}</span>
                          <span className={`badge-status ${
                            task.priority === 'Critical' ? 'badge-critical' :
                            task.priority === 'High' ? 'badge-high' :
                            task.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="fw-semibold text-dark fs-7 mb-2" style={{ lineHeight: '1.4' }}>
                          {task.title}
                        </div>

                        {task.requirement_key && (
                          <div className="d-flex align-items-center gap-1 text-muted fs-9 mb-2 bg-light p-1 rounded border">
                            <LinkIcon size={11} className="text-primary" />
                            <span className="fw-semibold text-primary">{task.requirement_key}:</span>
                            <span className="text-truncate" style={{ maxWidth: '160px' }}>{task.requirement_title}</span>
                          </div>
                        )}

                        <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-2 fs-8 text-muted">
                          <div className="d-flex align-items-center gap-1">
                            <User size={12} />
                            <span>{task.assignee_name || 'Unassigned'}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Clock size={12} />
                            <span>{task.estimated_effort_hours}h</span>
                          </div>
                        </div>

                        {/* Move Buttons */}
                        <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                          <button
                            className="btn btn-sm btn-light border py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            disabled={col === 'Backlog'}
                            onClick={() => handleMoveStatus(task, -1)}
                            title="Move left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border py-0 px-2"
                            style={{ fontSize: '0.7rem' }}
                            disabled={col === 'Done'}
                            onClick={() => handleMoveStatus(task, 1)}
                            title="Move right"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Create Development Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body p-4">
                  {formError && <div className="alert alert-danger py-2 fs-7">{formError}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Task Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Implement Multi-Skill Query in Routing Engine"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Linked Requirement (Traceability Link)</label>
                    <select
                      className="form-select"
                      value={linkedReqId}
                      onChange={(e) => setLinkedReqId(e.target.value)}
                    >
                      <option value="">-- No Linked Requirement --</option>
                      {requirements.map(r => (
                        <option key={r.id} value={r.id}>{r.req_key}: {r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Assignee</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. David Zhang"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Priority</label>
                      <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted fs-8">Est. Hours</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="form-control"
                        value={effort}
                        onChange={(e) => setEffort(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted fs-8">Task Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
