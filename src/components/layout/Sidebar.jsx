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

  // Navigation menu configurations per role as specified in PROJECT_CONTEXT.md
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

  // Visual helper for role badge
  const getRoleBadgeStyle = () => {
    switch (role) {
      case 'Technician':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          icon: Wrench,
          label: 'Teknisi',
        };
      case 'Admin':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
          icon: ShieldCheck,
          label: 'Admin',
        };
      case 'Lecturer':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: BookOpen,
          label: 'Dosen',
        };
      case 'Staff':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          icon: Briefcase,
          label: 'Staf',
        };
      case 'Student':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Campus Maintenance
              </h1>
              <p className="text-[11px] text-indigo-600 font-semibold">
                Universitas Klabat
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Tutup navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Indicator */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
            Peran Aktif
          </p>
          <div
            className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleBadge.bg}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{role || 'Pengguna'}</span>
            <span className="text-[10px] opacity-75 font-normal">
              ({roleBadge.label})
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
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
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3 truncate">
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 text-indigo-700'
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
        </nav>

        {/* User Card & Logout Button in Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Pengguna'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {user?.identifier || user?.email || '-'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}

