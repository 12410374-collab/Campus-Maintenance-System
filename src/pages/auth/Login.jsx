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
  Check,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { getRoleHomePath } from '../../routes/ProtectedRoute';
import CampusIllustration from '../../components/auth/CampusIllustration';

export default function Login() {
  const { user, login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [selectedRole, setSelectedRole] = useState('Technician');
  const [identifier, setIdentifier] = useState('TECH-001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 5 Pilihan Peran Wajib (Nama internal konsisten untuk routing & session)
  const roleConfigs = [
    {
      role: 'Student',
      label: 'Mahasiswa',
      subtitle: 'Pelapor',
      icon: GraduationCap,
    },
    {
      role: 'Lecturer',
      label: 'Dosen',
      subtitle: 'Pelapor',
      icon: BookOpen,
    },
    {
      role: 'Staff',
      label: 'Staf',
      subtitle: 'Pelapor',
      icon: Briefcase,
    },
    {
      role: 'Admin',
      label: 'Admin',
      subtitle: 'Pengelola',
      icon: ShieldCheck,
    },
    {
      role: 'Technician',
      label: 'Teknisi',
      subtitle: 'Perbaikan',
      icon: Wrench,
    },
  ];

  // Helper mendapatkan label bahasa Indonesia untuk peran aktif
  const currentRoleLabel =
    roleConfigs.find((r) => r.role === selectedRole)?.label || selectedRole;

  // Memilih peran dan otomatis mengisi data akun demo yang bersangkutan
  const handleRoleChange = (roleName) => {
    setSelectedRole(roleName);
    setErrorMessage('');
    setSuccessMessage('');
    const demo = DEMO_ACCOUNTS.find((acc) => acc.role === roleName);
    if (demo) {
      setIdentifier(demo.identifier);
      setPassword('password123');
    }
  };

  // Submit Handler dengan validasi ketat
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedRole) {
      setErrorMessage('Silakan pilih salah satu peran terlebih dahulu.');
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage('Nama pengguna atau ID tidak boleh kosong.');
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
      setErrorMessage(result.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
    } else {
      setSuccessMessage(result.message || 'Login berhasil!');
      navigate(getRoleHomePath(result.user.role), { replace: true });
    }
  };

  // Placeholder dinamis sesuai peran yang dipilih
  const getIdentifierPlaceholder = () => {
    switch (selectedRole) {
      case 'Student':
        return 'NIM mahasiswa (contoh: 105021234)';
      case 'Lecturer':
        return 'NIDN dosen (contoh: 091234567)';
      case 'Staff':
        return 'NIP staf (contoh: 19850412)';
      case 'Admin':
        return 'Username admin (contoh: admin)';
      case 'Technician':
        return 'ID teknisi (contoh: TECH-001)';
      default:
        return 'Nama pengguna atau ID';
    }
  };

  // Jika pengguna sudah terotentikasi, alihkan langsung ke dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen login-animated-bg relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Latar Belakang: Architectural Grid Pattern & Ambient Mesh Orbs (Di belakang konten) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-architectural-pattern [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_35%,transparent_100%)]"></div>
        <div className="absolute -top-28 -left-24 w-[440px] h-[440px] bg-blue-600/15 rounded-full blur-[130px] animate-orb-slow"></div>
        <div className="absolute -bottom-28 -right-24 w-[460px] h-[460px] bg-purple-600/18 rounded-full blur-[135px] animate-orb-reverse"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* SISI KIRI: Identitas Minimalis + Visual Utama Ilustrasi Kampus 3D */}
          <div className="lg:col-span-5 text-white space-y-5 text-center lg:text-left animate-fadeIn">
            {/* Logo & Identitas Universitas Klabat */}
            <div className="inline-flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 border border-white/15 transition-transform duration-300 hover:scale-105">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                  Universitas Klabat
                </span>
              </div>
            </div>

            {/* Nama Produk & Satu Tagline Pendek */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Campus Maintenance
              </h1>
              <p className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 tracking-wide">
                Report. Track. Maintain.
              </p>
            </div>

            {/* Focal Point: Ilustrasi 3D Isometric Kampus & 4 Floating Elements */}
            <div className="pt-1">
              <CampusIllustration />
            </div>
          </div>

          {/* SISI KANAN: Kartu Login Bersih & Modern (Fade-In + Slide-Up) */}
          <div className="lg:col-span-7 w-full animate-fadeInUp">
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 border border-slate-200/90 p-6 sm:p-8 transition-shadow duration-300 hover:shadow-indigo-950/30">

              {/* Header Kartu Login */}
              <div className="mb-5 pb-3 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Selamat Datang</span>
                  <span className="inline-block text-xl">👋</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Silakan pilih peran Anda dan masukkan kredensial akun untuk masuk.
                </p>
              </div>

              {/* 5 Kartu Pemilihan Peran Interaktif */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Pilih Peran Anda:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {roleConfigs.map((cfg) => {
                    const IconComponent = cfg.icon;
                    const isSelected = selectedRole === cfg.role;

                    return (
                      <button
                        key={cfg.role}
                        type="button"
                        onClick={() => handleRoleChange(cfg.role)}
                        className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-sm ring-2 ring-purple-500/20 font-bold -translate-y-0.5'
                            : 'border-slate-200/90 bg-white hover:border-indigo-300/80 hover:bg-slate-50/90 hover:-translate-y-0.5 hover:shadow-sm text-slate-600'
                          }`}
                        aria-pressed={isSelected}
                      >
                        {/* Indikator Centang Aktif */}
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-fadeIn">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        )}

                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-200 ${isSelected
                              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm scale-105'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                            }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <span className="text-xs font-bold leading-tight block">
                          {cfg.label}
                        </span>
                        <span
                          className={`text-[10px] leading-none mt-0.5 transition-colors duration-200 ${isSelected ? 'text-indigo-700 font-semibold' : 'text-slate-400'
                            }`}
                        >
                          {cfg.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notifikasi Pesan Kesalahan / Berhasil */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-medium">{successMessage}</p>
                </div>
              )}

              {/* Formulir Login */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Input Nama Pengguna / ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengguna / ID Pengguna ({currentRoleLabel})
                  </label>
                  <div className="group relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 transition-colors duration-200 group-focus-within:text-purple-600">
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
                      className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600 transition-all duration-200 font-medium"
                    />
                  </div>
                </div>

                {/* Input Kata Sandi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi
                  </label>
                  <div className="group relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 transition-colors duration-200 group-focus-within:text-purple-600">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Masukkan kata sandi"
                      className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600 transition-all duration-200 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition-colors duration-200 cursor-pointer"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Tombol Masuk */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-950 hover:via-purple-950 hover:to-indigo-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-950/25 active:translate-y-0 active:scale-[0.985] transition-all duration-200 shadow-md shadow-slate-900/20 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-indigo-300 transition-colors duration-200 group-hover:text-purple-200" />
                    <span>{loading ? 'Memverifikasi...' : `Masuk Sebagai ${currentRoleLabel}`}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-purple-200" />
                  </button>
                </div>
              </form>

              {/* Bagian Akun Demo (Collapsible - Bersih & Rapi) */}
              <div className="mt-4 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-indigo-600 font-medium py-1 cursor-pointer transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Informasi Akun Demo (5 Peran)</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDemoAccounts ? 'rotate-180 text-indigo-600' : ''
                      }`}
                  />
                </button>

                {showDemoAccounts && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fadeIn text-xs">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Klik salah satu akun di bawah untuk memilih peran dan mengisi kredensial otomatis:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {DEMO_ACCOUNTS.map((acc) => {
                        const isCurrent = selectedRole === acc.role;
                        const roleLabel =
                          roleConfigs.find((r) => r.role === acc.role)?.label || acc.role;
                        return (
                          <button
                            key={acc.role}
                            type="button"
                            onClick={() => handleRoleChange(acc.role)}
                            className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${isCurrent
                                ? 'bg-indigo-50/90 border-indigo-400 text-indigo-900 font-semibold'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs truncate font-bold">{roleLabel}</p>
                              <p className="text-[10px] text-slate-400 truncate">{acc.name}</p>
                            </div>
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 text-indigo-700 font-semibold">
                              {acc.identifier}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      Kata sandi bawaan seluruh akun demo: <code className="font-mono font-bold text-slate-600">password123</code>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Hak Cipta & Keamanan */}
            <p className="text-center text-[11px] text-slate-500 mt-4">
              &copy; 2026 Universitas Klabat — Campus Maintenance Request System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
