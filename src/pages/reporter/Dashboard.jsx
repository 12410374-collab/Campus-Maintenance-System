import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
  Zap,
  Droplets,
  Monitor,
  Building2,
  Armchair,
  GraduationCap,
  BookOpen,
  Briefcase,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Mock data laporan pelapor yang konsisten dengan fasilitas kampus Universitas Klabat
const REPORTER_REPORTS = [
  {
    id: 'RPT-2026-0104',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Electrical',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    reportedDate: '13 Nov 2026, 09:15',
    status: 'Dalam Proses',
    priority: 'Tinggi',
  },
  {
    id: 'RPT-2026-0102',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Electrical',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    reportedDate: '13 Nov 2026, 08:00',
    status: 'Menunggu Verifikasi',
    priority: 'Tinggi',
  },
  {
    id: 'RPT-2026-0099',
    title: 'Kran Air Wastafel Patah di Tempat Wudhu',
    category: 'Plumbing',
    location: 'Gedung Pioneer Chapel',
    reportedDate: '12 Nov 2026, 16:45',
    status: 'Menunggu Verifikasi',
    priority: 'Sedang',
  },
  {
    id: 'RPT-2026-0097',
    title: 'Koneksi Proyektor Plafon Sering Terputus',
    category: 'Electronics',
    location: 'GK2 - Lantai 3, Ruang Seminar',
    reportedDate: '12 Nov 2026, 13:10',
    status: 'Dalam Proses',
    priority: 'Sedang',
  },
  {
    id: 'RPT-2026-0095',
    title: 'Stopkontak Meja Dosen Korslet',
    category: 'Electrical',
    location: 'GK2 - Lantai 1, Ruang 102',
    reportedDate: '12 Nov 2026, 10:45',
    status: 'Selesai',
    priority: 'Kritis',
  },
  {
    id: 'RPT-2026-0091',
    title: 'Engsel Pintu Ruang Baca Longgar',
    category: 'Furniture',
    location: 'Perpustakaan Pusat - Lantai 2',
    reportedDate: '11 Nov 2026, 11:30',
    status: 'Selesai',
    priority: 'Sedang',
  },
  {
    id: 'RPT-2026-0089',
    title: 'Kabel LAN Meja Front Desk Putus',
    category: 'Infrastructure',
    location: 'Perpustakaan Pusat - Lantai 1',
    reportedDate: '10 Nov 2026, 09:20',
    status: 'Selesai',
    priority: 'Rendah',
  },
];

export default function ReporterDashboard() {
  const { user, role } = useAuth();
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Role identity badge configuration for Welcome Hero
  const roleMeta = useMemo(() => {
    switch (role) {
      case 'Lecturer':
        return { label: 'Dosen', icon: BookOpen, badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' };
      case 'Staff':
        return { label: 'Staf Kampus', icon: Briefcase, badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30' };
      case 'Student':
      default:
        return { label: 'Mahasiswa', icon: GraduationCap, badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30' };
    }
  }, [role]);

  const RoleIcon = roleMeta.icon;

  // Dynamic statistics calculation
  const stats = useMemo(() => {
    const total = REPORTER_REPORTS.length;
    const pending = REPORTER_REPORTS.filter((r) => r.status === 'Menunggu Verifikasi').length;
    const inProgress = REPORTER_REPORTS.filter((r) => r.status === 'Dalam Proses').length;
    const completed = REPORTER_REPORTS.filter((r) => r.status === 'Selesai').length;
    return { total, pending, inProgress, completed };
  }, []);

  // Filtered recent reports
  const filteredReports = useMemo(() => {
    if (statusFilter === 'Semua') return REPORTER_REPORTS;
    return REPORTER_REPORTS.filter((r) => r.status === statusFilter);
  }, [statusFilter]);

  // Category breakdown for side visual summary
  const categoryBreakdown = useMemo(() => {
    const counts = REPORTER_REPORTS.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Electrical', label: 'Kelistrikan & AC', count: counts.Electrical || 0, color: 'from-blue-500 to-indigo-600' },
      { name: 'Plumbing', label: 'Pipa & Sanitasi', count: counts.Plumbing || 0, color: 'from-sky-400 to-blue-500' },
      { name: 'Electronics', label: 'Perangkat Elektronik', count: counts.Electronics || 0, color: 'from-indigo-500 to-purple-600' },
      { name: 'Infrastructure', label: 'Sarana & Bangunan', count: (counts.Infrastructure || 0) + (counts.Furniture || 0), color: 'from-purple-500 to-violet-600' },
    ];
  }, []);

  // Category icon renderer
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electrical':
        return {
          icon: Zap,
          wrapper: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
        };
      case 'Plumbing':
        return {
          icon: Droplets,
          wrapper: 'bg-sky-50 text-sky-600 border-sky-200/80',
        };
      case 'Electronics':
        return {
          icon: Monitor,
          wrapper: 'bg-purple-50 text-purple-600 border-purple-200/80',
        };
      case 'Furniture':
        return {
          icon: Armchair,
          wrapper: 'bg-violet-50 text-violet-600 border-violet-200/80',
        };
      case 'Infrastructure':
      default:
        return {
          icon: Building2,
          wrapper: 'bg-blue-50 text-blue-600 border-blue-200/80',
        };
    }
  };

  // Colored status badge renderer
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dalam Proses':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/90">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            <span>Dalam Proses</span>
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Selesai</span>
          </span>
        );
      case 'Menunggu Verifikasi':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/90">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Menunggu Verifikasi</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. WELCOME HERO SECTION (Navy-Purple Gradient + Soft Glow + Subtle Pattern + Campus Mini Visual) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080E21] via-[#131842] to-[#261452] p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        {/* Subtle Architectural Grid & Soft Ambient Glows */}
        <div
          className="absolute inset-0 bg-architectural-pattern opacity-70 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-purple-500/25 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Hero Info */}
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${roleMeta.badge}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.label}</span>
              </span>
              <span className="text-xs text-indigo-200/80 font-medium">
                • Universitas Klabat
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Halo, {user?.name || 'Pelapor'}!
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/80">
              Pantau progres perbaikan fasilitas kampus.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                to="/reporter/create"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-950/50 border border-white/15"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Laporan Baru</span>
              </Link>

              <Link
                to="/reporter/reports"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-100 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm transition-all duration-200"
              >
                <span>Laporan Saya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Hero Compact Campus & Maintenance Decoration */}
          <div
            className="hidden md:flex items-center justify-center shrink-0 relative pr-2"
            aria-hidden="true"
          >
            <div className="relative w-44 h-36 animate-float-campus">
              <div className="absolute inset-2 rounded-full bg-purple-500/25 blur-2xl"></div>
              <svg viewBox="0 0 220 170" fill="none" className="relative z-10 w-full h-full drop-shadow-[0_14px_24px_rgba(6,10,20,0.6)]">
                <defs>
                  <linearGradient id="heroPlat" x1="20" y1="90" x2="200" y2="150" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <linearGradient id="heroRoof" x1="65" y1="35" x2="155" y2="35" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                {/* Base Diamond */}
                <polygon points="110,75 195,118 110,160 25,118" fill="url(#heroPlat)" stroke="#818cf8" strokeOpacity="0.45" />
                <polygon points="25,118 110,160 110,167 25,125" fill="#312e81" />
                <polygon points="110,160 195,118 195,125 110,167" fill="#1e1b4b" />
                {/* Building */}
                <polygon points="65,55 110,78 110,130 65,107" fill="#334155" />
                <polygon points="110,78 155,55 155,107 110,130" fill="#1e1b4b" />
                <polygon points="110,32 155,55 110,78 65,55" fill="url(#heroRoof)" stroke="#ddd6fe" strokeOpacity="0.6" />
                {/* Glowing Windows */}
                <polygon points="75,70 86,76 86,86 75,80" fill="#7dd3fc" fillOpacity="0.9" />
                <polygon points="92,79 103,85 103,95 92,89" fill="#93c5fd" fillOpacity="0.85" />
                <polygon points="118,84 129,78 129,88 118,94" fill="#c4b5fd" fillOpacity="0.9" />
                <polygon points="135,75 146,69 146,79 135,85" fill="#a78bfa" fillOpacity="0.85" />
              </svg>
              {/* Floating mini icon chip */}
              <div className="absolute -top-1 right-1 w-8 h-8 rounded-xl bg-indigo-950/90 border border-purple-400/35 flex items-center justify-center text-purple-300 shadow-lg">
                <Wrench className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTIC CARDS (4 Distinct Harmonious Cards with Crisp Borders & Clean Hierarchy) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Laporan */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-indigo-50/85 border-[1.5px] border-indigo-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Laporan
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-indigo-900/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums relative z-10">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Semua pengajuan</p>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/90 border-[1.5px] border-blue-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Menunggu Verifikasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-sm shadow-blue-600/25">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums relative z-10">
            {stats.pending}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Ditinjau Admin</p>
        </div>

        {/* Card 3: Dalam Proses */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-purple-50/90 border-[1.5px] border-purple-200/90 p-5 shadow-sm hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Dalam Proses
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/25">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums relative z-10">
            {stats.inProgress}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Dikerjakan Teknisi</p>
        </div>

        {/* Card 4: Selesai */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50/85 border-[1.5px] border-emerald-200/90 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Selesai
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-emerald-600/25">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums relative z-10">
            {stats.completed}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Perbaikan tuntas</p>
        </div>
      </section>

      {/* 3. MAIN CONTENT GRID: Recent Reports (2 cols) + Category Summary (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Reports Card List */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/75 p-5 sm:p-6 shadow-sm">
          {/* Header & Quick Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900">Laporan Terbaru</h2>

            <div className="flex flex-wrap gap-1.5">
              {['Semua', 'Menunggu Verifikasi', 'Dalam Proses', 'Selesai'].map((tab) => {
                const isActive = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    {tab === 'Menunggu Verifikasi' ? 'Menunggu' : tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Styled Report Cards with Crisp 1.5px Borders & 14px Separation */}
          <div className="space-y-3.5">
            {filteredReports.map((report) => {
              const catStyle = getCategoryIcon(report.category);
              const CategoryIcon = catStyle.icon;

              return (
                <div
                  key={report.id}
                  className="group p-4 rounded-2xl border-[1.5px] border-slate-300/75 bg-[#F7F9FD] hover:bg-white hover:border-indigo-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3.5 min-w-0">
                      {/* Category Icon Box */}
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${catStyle.wrapper}`}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            {report.id}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {report.category}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                          {report.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{report.reportedDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/80 flex justify-end">
            <Link
              to="/reporter/reports"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-purple-700 transition-colors"
            >
              <span>Semua Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side Column: Category Distribution & Quick Access */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          {/* Category Breakdown Panel (Soft Lavender Tint) */}
          <div className="rounded-3xl bg-gradient-to-b from-white to-indigo-50/50 border-[1.5px] border-indigo-200/75 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Kategori Kerusakan</h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70">
                {stats.total}
              </span>
            </div>

            <div className="space-y-3.5">
              {categoryBreakdown.map((cat) => {
                const percent = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat.label}</span>
                      <span className="font-mono font-bold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notification / Action Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#1A1446] text-white p-5 sm:p-6 shadow-md border border-indigo-900/50 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Notifikasi Pembaruan</h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Cek pembaruan status dari Admin & Teknisi.
                </p>
              </div>
              <Link
                to="/reporter/notifications"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-200 hover:text-white transition-colors"
              >
                <span>Buka Notifikasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
