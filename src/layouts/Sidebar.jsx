import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Headphones,
  Users,
  UserCheck,
  PhoneCall,
  Ticket,
  FolderGit2,
  FileText,
  Kanban,
  Bug,
  CheckSquare,
  History,
  GitMerge,
  Network,
  Rocket,
  ShieldCheck,
  Server,
  Bell,
  UserCog,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
            <Headphones size={20} />
          </div>
          {!collapsed && (
            <div>
              <div className="fw-bold fs-6 text-white text-nowrap">CloudCX</div>
              <div className="text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>LIFECYCLEOPS</div>
            </div>
          )}
        </div>
        <button
          className="btn btn-sm text-muted p-1 border-0"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Core & Contact Center */}
        {!collapsed && <div className="nav-section-title">Contact Center Operations</div>}

        <NavLink to="/" end className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Overview">
          <LayoutDashboard size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Overview Dashboard</span>}
        </NavLink>

        <NavLink to="/contact-center" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="CC Operations">
          <Headphones size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Contact Center Dashboard</span>}
        </NavLink>

        <NavLink to="/agents" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Agents">
          <UserCheck size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Agent Management</span>}
        </NavLink>

        <NavLink to="/customers" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Customers">
          <Users size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Customer Directory</span>}
        </NavLink>

        <NavLink to="/interactions" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Interactions">
          <PhoneCall size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Interaction Queue</span>}
        </NavLink>

        <NavLink to="/tickets" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Tickets">
          <Ticket size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Service Tickets</span>}
        </NavLink>

        {/* ALM Domain */}
        {!collapsed && <div className="nav-section-title mt-3">Application Lifecycle</div>}

        <NavLink to="/alm/projects" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Projects">
          <FolderGit2 size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>ALM Projects</span>}
        </NavLink>

        <NavLink to="/alm/requirements" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Requirements">
          <FileText size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Requirements & Stories</span>}
        </NavLink>

        <NavLink to="/alm/kanban" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Tasks">
          <Kanban size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Kanban Task Board</span>}
        </NavLink>

        <NavLink to="/alm/defects" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Defects">
          <Bug size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Defect Tracker</span>}
        </NavLink>

        <NavLink to="/alm/test-cases" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Test Cases">
          <CheckSquare size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Test Case Management</span>}
        </NavLink>

        <NavLink to="/alm/test-runs" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Test History">
          <History size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Test Execution History</span>}
        </NavLink>

        <NavLink to="/alm/traceability" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Traceability">
          <FileSpreadsheet size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Traceability Matrix</span>}
        </NavLink>

        <NavLink to="/alm/impact" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Impact Explorer">
          <Network size={18} className="me-2 flex-shrink-0 text-info" />
          {!collapsed && <span className="text-info fw-semibold">Change Impact Explorer</span>}
        </NavLink>

        {/* Release & DevOps */}
        {!collapsed && <div className="nav-section-title mt-3">Release & Governance</div>}

        <NavLink to="/releases" end className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Releases">
          <Rocket size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Release Management</span>}
        </NavLink>

        <NavLink to="/releases/readiness" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Readiness Gate">
          <ShieldCheck size={18} className="me-2 flex-shrink-0 text-warning" />
          {!collapsed && <span>Readiness Gate</span>}
        </NavLink>

        <NavLink to="/deployments" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Deployments">
          <Server size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Deployment Logs</span>}
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Notifications">
          <Bell size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Administration">
          <UserCog size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>User Administration</span>}
        </NavLink>

        <NavLink to="/audit-logs" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="Audit Logs">
          <History size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>Audit Logs</span>}
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`} title="System Settings">
          <Settings size={18} className="me-2 flex-shrink-0" />
          {!collapsed && <span>System Diagnostics</span>}
        </NavLink>
      </nav>
    </aside>
  );
};
