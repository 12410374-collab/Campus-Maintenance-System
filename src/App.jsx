import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './pages/auth/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute, { getRoleHomePath } from './routes/ProtectedRoute';
import TechnicianDashboard from './pages/technician/Dashboard';
import Tasks from './pages/technician/Tasks';
import TaskDetail from './pages/technician/TaskDetail';
import TechnicianHistory from './pages/technician/History';

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

/**
 * Clean placeholder component for routes waiting for their respective development stages
 */
function PlaceholderPage({ module, title, subtitle }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Modul {module}
              </span>
              <span className="text-xs text-slate-400">• Rute Aktif</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 sm:text-right">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Akses Pengguna</p>
            <p className="font-bold text-slate-800">{user?.name} ({user?.role})</p>
            <p className="font-mono text-slate-500 text-[11px]">{user?.identifier}</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
          <p className="font-semibold">Proteksi Rute Terverifikasi:</p>
          <p className="mt-0.5 text-indigo-700">
            Halaman ini berada di bawah perlindungan <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-800">ProtectedRoute</code> untuk peran <strong>{user?.role}</strong>. Konten spesifik modul akan diimplementasikan pada tahap selanjutnya sesuai jobdesk tim.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
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
              <Route
                path="/reporter"
                element={
                  <PlaceholderPage
                    module="Reporter"
                    title="Dashboard Pelapor"
                    subtitle="Halaman utama pelapor untuk memantau status laporan kerusakan fasilitas."
                  />
                }
              />
              <Route
                path="/reporter/create"
                element={
                  <PlaceholderPage
                    module="Reporter"
                    title="Buat Laporan Baru"
                    subtitle="Formulir pengajuan laporan kerusakan fasilitas kampus UNKLAB."
                  />
                }
              />
              <Route
                path="/reporter/reports"
                element={
                  <PlaceholderPage
                    module="Reporter"
                    title="Laporan Saya"
                    subtitle="Daftar riwayat laporan kerusakan fasilitas yang telah dikirim."
                  />
                }
              />
              <Route
                path="/reporter/notifications"
                element={
                  <PlaceholderPage
                    module="Reporter"
                    title="Notifikasi Pelapor"
                    subtitle="Daftar notifikasi status perbaikan dan tindak lanjut laporan."
                  />
                }
              />
            </Route>

            {/* Admin Routes (Member 3 - Admin Developer) */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route
                path="/admin"
                element={
                  <PlaceholderPage
                    module="Admin"
                    title="Dashboard Admin"
                    subtitle="Statistik laporan, verifikasi, prioritas AI, dan pemantauan perbaikan."
                  />
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PlaceholderPage
                    module="Admin"
                    title="Semua Laporan Fasilitas"
                    subtitle="Daftar seluruh laporan kerusakan fasilitas dari sivitas akademika UNKLAB."
                  />
                }
              />
              <Route
                path="/admin/technicians"
                element={
                  <PlaceholderPage
                    module="Admin"
                    title="Manajemen Teknisi"
                    subtitle="Pengelolaan staf teknisi dan penugasan perbaikan fasilitas."
                  />
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <PlaceholderPage
                    module="Admin"
                    title="Notifikasi Admin"
                    subtitle="Notifikasi verifikasi laporan baru dan progres perbaikan."
                  />
                }
              />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
