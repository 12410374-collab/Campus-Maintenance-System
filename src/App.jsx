import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { AdminProvider } from './context/AdminContext';
import Login from './pages/auth/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute, { getRoleHomePath } from './routes/ProtectedRoute';
import TechnicianDashboard from './pages/technician/Dashboard';
import Tasks from './pages/technician/Tasks';
import TaskDetail from './pages/technician/TaskDetail';
import TechnicianHistory from './pages/technician/History';
import ReporterDashboard from './pages/reporter/Dashboard';
import CreateReport from './pages/reporter/CreateReport';
import MyReports from './pages/reporter/MyReports';
import ReporterNotifications from './pages/reporter/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';
import AdminReportDetail from './pages/admin/ReportDetail';
import AdminTechnicians from './pages/admin/Technicians';
import AdminAssignments from './pages/admin/Assignments';
import AdminNotifications from './pages/admin/Notifications';

/**
 * Root redirector: redirects to the user's role dashboard if authenticated,
 * or to /login if not authenticated.
 */
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AdminProvider>
            <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes wrapped in shared DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Technician Routes (Member 1 - Technician Developer) */}
            <Route element={<ProtectedRoute allowedRoles={['Technician']} />}>
              <Route path="/technician" element={<TechnicianDashboard />} />
              <Route path="/technician/tasks" element={<Tasks />} />
              <Route path="/technician/tasks/:id" element={<TaskDetail />} />
              <Route path="/technician/history" element={<TechnicianHistory />} />
            </Route>

            {/* Reporter Routes (Member 2 - Student, Lecturer, Staff) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['Student', 'Lecturer', 'Staff']} />
              }
            >
              <Route path="/reporter" element={<ReporterDashboard />} />
              <Route path="/reporter/create" element={<CreateReport />} />
              <Route path="/reporter/reports" element={<MyReports />} />
              <Route path="/reporter/notifications" element={<ReporterNotifications />} />
            </Route>

            {/* Admin Routes (Member 3 - Admin Developer) */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/reports/:id" element={<AdminReportDetail />} />
              <Route path="/admin/technicians" element={<AdminTechnicians />} />
              <Route path="/admin/assignments" element={<AdminAssignments />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AdminProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
