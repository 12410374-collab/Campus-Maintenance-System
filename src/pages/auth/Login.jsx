import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { getRoleHomePath } from '../../routes/ProtectedRoute';

export default function Login() {
  const { user, login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [selectedRole, setSelectedRole] = useState('Technician');
  const [identifier, setIdentifier] = useState('TECH-001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role metadata for UI
  const roleConfigs = [
    {
      role: 'Student',
      label: 'Student',
      subtitle: 'Mahasiswa',
      icon: GraduationCap,
      color: 'blue',
      badge: 'Pelapor',
    },
    {
      role: 'Lecturer',
      label: 'Lecturer',
      subtitle: 'Dosen',
      icon: BookOpen,
      color: 'emerald',
      badge: 'Pelapor',
    },
    {
      role: 'Staff',
      label: 'Staff',
      subtitle: 'Karyawan',
      icon: Briefcase,
      color: 'amber',
      badge: 'Pelapor',
    },
    {
      role: 'Admin',
      label: 'Admin',
      subtitle: 'Pengelola',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Manajemen',
    },
    {
      role: 'Technician',
      label: 'Technician',
      subtitle: 'Teknisi',
      icon: Wrench,
      color: 'indigo',
      badge: 'Perbaikan',
    },
  ];

  // Quick select role and auto-fill corresponding demo credentials
  const handleRoleChange = (roleName) => {
    setSelectedRole(roleName);
    setErrorMessage('');
    const demo = DEMO_ACCOUNTS.find((acc) => acc.role === roleName);
    if (demo) {
      setIdentifier(demo.identifier);
      setPassword('password123');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Input validation
    if (!selectedRole) {
      setErrorMessage('Silakan pilih salah satu peran (role).');
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage('NIM / NIDN / NIP / Username tidak boleh kosong.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Kata sandi tidak boleh kosong.');
      return;
    }

    const result = await login({
      identifier: identifier.trim(),
      password: password.trim(),
      role: selectedRole,
    });

    if (!result.success) {
      setErrorMessage(result.message || 'Gagal masuk. Periksa kembali data Anda.');
    } else {
      setSuccessMessage(result.message || 'Login berhasil!');
      navigate(getRoleHomePath(result.user.role), { replace: true });
    }
  };

  // Get dynamic placeholder text based on selected role
  const getIdentifierPlaceholder = () => {
    switch (selectedRole) {
      case 'Student':
        return 'Masukkan NIM (contoh: 105021234)';
      case 'Lecturer':
        return 'Masukkan NIDN (contoh: 091234567)';
      case 'Staff':
        return 'Masukkan NIP / ID Staf (contoh: 19850412)';
      case 'Admin':
        return 'Masukkan Username Admin (contoh: admin)';
      case 'Technician':
        return 'Masukkan ID Teknisi (contoh: TECH-001)';
      default:
        return 'Masukkan identitas pengguna';
    }
  };

  // If user is currently authenticated, redirect directly to their authorized home dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Campus Maintenance
        </h1>
        <p className="text-sm text-indigo-200/80 mt-1">
          Universitas Klabat — Sistem Pengelolaan Kerusakan Fasilitas
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pilih Peran Pengguna (Role):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {roleConfigs.map((cfg) => {
                const IconComponent = cfg.icon;
                const isSelected = selectedRole === cfg.role;
                return (
                  <button
                    key={cfg.role}
                    type="button"
                    onClick={() => handleRoleChange(cfg.role)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 ring-2 ring-indigo-500 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 mb-1 ${
                        isSelected ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold leading-tight">{cfg.label}</span>
                    <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                      {cfg.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-6 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
              <span className="truncate">
                Akun Demo: <strong className="text-slate-800">{DEMO_ACCOUNTS.find(a => a.role === selectedRole)?.name}</strong>
              </span>
            </div>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600 shrink-0 text-[11px]">
              {DEMO_ACCOUNTS.find(a => a.role === selectedRole)?.identifier}
            </span>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validasi Gagal</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NIM / NIDN / NIP / Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={getIdentifierPlaceholder()}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan kata sandi akun"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memproses Masuk...' : `Masuk Sebagai ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>

          {/* Quick preset chips for rapid role switching */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Pintasan Akun Uji Coba:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleRoleChange(acc.role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedRole === acc.role
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {acc.role} ({acc.identifier})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-indigo-300/60 mt-6">
          &copy; 2026 Universitas Klabat — Campus Maintenance Request System
        </p>
      </div>
    </div>
  );
}

