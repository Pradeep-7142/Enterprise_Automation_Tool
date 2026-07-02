import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { PageLoader } from '../hooks/useFetch';
import MainLayout from './layouts/MainLayout';
import { AppProvider, useApp } from './context/AppContext';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import CalendarPage from './pages/CalendarPage';
import CreateRequestPage from './pages/CreateRequestPage';
import DashboardPage from './pages/DashboardPage';
import DepartmentsPage from './pages/DepartmentsPage';
import EmployeesPage from './pages/EmployeesPage';
import FilesPage from './pages/FilesPage';
import HelpPage from './pages/HelpPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import RequestsPage from './pages/RequestsPage';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/TasksPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

function AppRoutes() {
  const { isAuth, authLoading } = useApp();
  if (authLoading) return <PageLoader message="Restoring session..." />;

  return (
    <Routes>
      {isAuth ? (
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/new" element={<CreateRequestPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/workflows" element={<WorkflowBuilderPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

