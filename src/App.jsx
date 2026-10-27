import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

// Contact Center & Auth Pages (named exports)
import { LoginPage } from './pages/LoginPage';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ContactCenterDashboard } from './pages/ContactCenterDashboard';
import { AgentManagementPage } from './pages/AgentManagementPage';
import { CustomerDirectoryPage } from './pages/CustomerDirectoryPage';
import { InteractionQueuePage } from './pages/InteractionQueuePage';
import { InteractionDetailPage } from './pages/InteractionDetailPage';
import { ServiceTicketPage } from './pages/ServiceTicketPage';

// ALM Pages (named exports)
import { AlmProjectsPage } from './pages/AlmProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { DefectTrackerPage } from './pages/DefectTrackerPage';
import { TestCasePage } from './pages/TestCasePage';
import { TestExecutionHistoryPage } from './pages/TestExecutionHistoryPage';
import { TraceabilityMatrixPage } from './pages/TraceabilityMatrixPage';
import { ChangeImpactExplorerPage } from './pages/ChangeImpactExplorerPage';

// Release & Governance Pages (named & default exports)
import { ReleaseManagementPage } from './pages/ReleaseManagementPage';
import { ReleaseReadinessReportPage } from './pages/ReleaseReadinessReportPage';
import DeploymentSimulatorPage from './pages/DeploymentSimulatorPage';
import NotificationsPage from './pages/NotificationsPage';
import UserAdminPage from './pages/UserAdminPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Application Layout & Protected Routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Overview & Contact Center */}
            <Route index element={<OverviewDashboard />} />
            <Route path="contact-center" element={<ContactCenterDashboard />} />
            <Route path="agents" element={<AgentManagementPage />} />
            <Route path="customers" element={<CustomerDirectoryPage />} />
            <Route path="interactions" element={<InteractionQueuePage />} />
            <Route path="interactions/:id" element={<InteractionDetailPage />} />
            <Route path="tickets" element={<ServiceTicketPage />} />

            {/* Application Lifecycle Management (ALM) */}
            <Route path="alm/projects" element={<AlmProjectsPage />} />
            <Route path="alm/projects/:id" element={<ProjectDetailPage />} />
            <Route path="alm/requirements" element={<RequirementsPage />} />
            <Route path="alm/kanban" element={<KanbanBoardPage />} />
            <Route path="alm/defects" element={<DefectTrackerPage />} />
            <Route path="alm/test-cases" element={<TestCasePage />} />
            <Route path="alm/test-runs" element={<TestExecutionHistoryPage />} />
            <Route path="alm/traceability" element={<TraceabilityMatrixPage />} />
            <Route path="alm/impact" element={<ChangeImpactExplorerPage />} />

            {/* Release, Deployment & Administration */}
            <Route path="releases" element={<ReleaseManagementPage />} />
            <Route path="releases/readiness" element={<ReleaseReadinessReportPage />} />
            <Route path="deployments" element={<DeploymentSimulatorPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="admin/users" element={<UserAdminPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
