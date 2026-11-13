import {
  Menu,
  Bell,
  LogOut,
  Building2,
  Wrench,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuToggle }) {
  const { user, role, logout } = useAuth();

  // Role badge configuration
  const getRoleBadge = () => {
    switch (role) {
      case 'Technician':
        return {
          bg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          icon: Wrench,
          label: 'Teknisi',
        };
      case 'Admin':
        return {
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: ShieldCheck,
          label: 'Admin',
        };
      case 'Lecturer':
        return {
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: BookOpen,
          label: 'Dosen',
        };
      case 'Staff':
        return {
          bg: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Briefcase,
          label: 'Staf',
        };
      case 'Student':
      default:
        return {
          bg: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: GraduationCap,
          label: 'Mahasiswa',
        };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & System Label */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Universitas Klabat</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-bold">Campus Maintenance Request</span>
        </div>
      </div>

      {/* Right: Notifications, User Profile & Logout */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* In-app Notification Bell (Scope: Section 8 in PROJECT_CONTEXT.md) */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifikasi Masuk"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-2.5 pl-1 sm:pl-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'Pengguna'}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleBadge.bg}`}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                <span>{roleBadge.label}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.identifier}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Keluar dari sistem"
          className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

