import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  History,
  PlusCircle,
  FileText,
  FileSpreadsheet,
  Users,
  Bell,
  Wrench,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();

  // Navigation menu configurations per role
  const getNavItems = () => {
    switch (role) {
      case 'Technician':
        return [
          {
            label: 'Dashboard',
            path: '/technician',
            icon: LayoutDashboard,
            badge: null,
            end: true,
          },
          {
            label: 'Daftar Tugas',
            path: '/technician/tasks',
            icon: ClipboardList,
            badge: 'Tugas',
          },
          {
            label: 'Riwayat Perbaikan',
            path: '/technician/history',
            icon: History,
            badge: null,
          },
        ];

      case 'Admin':
        return [
          {
            label: 'Dashboard Admin',
            path: '/admin',
            icon: LayoutDashboard,
            badge: null,
            end: true,
          },
          {
            label: 'Semua Laporan',
            path: '/admin/reports',
            icon: FileSpreadsheet,
            badge: null,
          },
          {
            label: 'Kelola Teknisi',
            path: '/admin/technicians',
            icon: Users,
            badge: null,
          },
          {
            label: 'Notifikasi',
            path: '/admin/notifications',
            icon: Bell,
            badge: null,
          },
        ];

      case 'Student':
      case 'Lecturer':
      case 'Staff':
      default:
        // Reporter role shared across Student, Lecturer, and Staff
        return [
          {
            label: 'Dashboard Pelapor',
            path: '/reporter',
            icon: LayoutDashboard,
            badge: null,
            end: true,
          },
          {
            label: 'Buat Laporan',
            path: '/reporter/create',
            icon: PlusCircle,
            badge: 'Baru',
          },
          {
            label: 'Laporan Saya',
            path: '/reporter/reports',
            icon: FileText,
            badge: null,
          },
          {
            label: 'Notifikasi',
            path: '/reporter/notifications',
            icon: Bell,
            badge: null,
          },
        ];
    }
  };

  const navItems = getNavItems();

  // Visual helper for role badge on dark navy surface
  const getRoleBadgeStyle = () => {
    switch (role) {
      case 'Technician':
        return {
          bg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200',
          iconColor: 'text-indigo-300',
          icon: Wrench,
          label: 'Teknisi',
        };
      case 'Admin':
        return {
          bg: 'bg-purple-500/15 border-purple-400/30 text-purple-200',
          iconColor: 'text-purple-300',
          icon: ShieldCheck,
          label: 'Admin',
        };
      case 'Lecturer':
        return {
          bg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
          iconColor: 'text-emerald-300',
          icon: BookOpen,
          label: 'Dosen',
        };
      case 'Staff':
        return {
          bg: 'bg-amber-500/15 border-amber-400/30 text-amber-200',
          iconColor: 'text-amber-300',
          icon: Briefcase,
          label: 'Staf',
        };
      case 'Student':
      default:
        return {
          bg: 'bg-blue-500/15 border-blue-400/30 text-blue-200',
          iconColor: 'text-blue-300',
          icon: GraduationCap,
          label: 'Mahasiswa',
        };
    }
  };

  const roleBadge = getRoleBadgeStyle();
  const RoleIcon = roleBadge.icon;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Dark Navy Premium Sidebar Container (Full 100dvh fixed sidebar on desktop + drawer on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-dvh bg-gradient-to-b from-[#070C1B] via-[#0B1228] to-[#101032] border-r border-white/10 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Subtle decorative ambient glow inside sidebar */}
        <div
          className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 -right-16 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Brand Header */}
        <div className="relative z-10 h-18 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-white/15">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-white tracking-tight">
                Campus Maintenance
              </h1>
              <p className="text-[11px] text-indigo-300 font-semibold">
                Universitas Klabat
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer transition-colors"
            aria-label="Tutup navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Role Indicator */}
        <div className="relative z-10 px-5 py-3.5 border-b border-white/10 bg-white/[0.02] shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
            Peran Aktif
          </p>
          <div
            className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${roleBadge.bg}`}
          >
            <RoleIcon className={`w-3.5 h-3.5 ${roleBadge.iconColor}`} />
            <span>{roleBadge.label}</span>
            <span className="text-[10px] opacity-65 font-normal">
              ({role || 'Pengguna'})
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="relative z-10 flex-1 min-h-0 px-3.5 py-5 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400/80 mb-2.5">
            Menu Navigasi
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.end)}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/90 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/60 border border-white/15'
                      : 'text-slate-300/85 hover:text-white hover:bg-white/[0.07] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-white scale-105'
                            : 'text-slate-400 group-hover:text-indigo-300 group-hover:scale-105'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-500/20 text-purple-200 border border-purple-400/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Elegant Menu Divider */}
          <div className="pt-4 mt-4 border-t border-white/10 px-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Campus Portal • v1.0
            </p>
          </div>
        </nav>

        {/* User Card & Logout Button pinned cleanly to bottom */}
        <div className="relative z-10 mt-auto p-4 border-t border-white/10 bg-[#060A17]/60 backdrop-blur-md shrink-0">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-900/40 border border-white/15">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Pengguna'}
                </p>
                <p className="text-[11px] text-indigo-300/80 font-mono truncate">
                  {user?.identifier || user?.email || '-'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 hover:text-white border border-rose-400/25 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
