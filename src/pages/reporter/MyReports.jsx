import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  UserCheck,
  MapPin,
  Calendar,
  Eye,
  PlusCircle,
  X,
  ChevronRight,
  Tag,
  Zap,
  Droplets,
  Monitor,
  Armchair,
  Building2,
  GraduationCap,
  BookOpen,
  Briefcase,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  MOCK_REPORTER_REPORTS,
  REPORT_STATUS_OPTIONS,
  REPORT_CATEGORY_OPTIONS,
  filterReportsByReporter,
} from '../../data/mockReporterReports';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'handling', label: 'Assigned / In Progress' },
  { key: 'completed', label: 'Completed' },
];

function getProgressStepIndex(status) {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Approved':
      return 1;
    case 'Assigned':
    case 'In Progress':
      return 2;
    case 'Completed':
      return 3;
    default:
      return -1;
  }
}

export default function MyReports() {
  const { user, role } = useAuth();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);

  // Role identity badge meta
  const roleMeta = useMemo(() => {
    switch (role) {
      case 'Lecturer':
        return { label: 'Dosen', icon: BookOpen, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'Staff':
        return { label: 'Staf', icon: Briefcase, badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'Student':
      default:
        return { label: 'Mahasiswa', icon: GraduationCap, badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  }, [role]);

  const RoleIcon = roleMeta.icon;

  // Pemisahan data: hanya menampilkan laporan milik pengguna yang sedang login
  const myReports = useMemo(() => {
    return filterReportsByReporter(MOCK_REPORTER_REPORTS, user);
  }, [user]);

  // Statistik ringkas laporan milik pengguna aktif
  const stats = useMemo(() => {
    return {
      total: myReports.length,
      pending: myReports.filter((r) => r.status === 'Pending').length,
      inProgress: myReports.filter((r) =>
        ['Approved', 'Assigned', 'In Progress'].includes(r.status)
      ).length,
      completed: myReports.filter((r) => r.status === 'Completed').length,
    };
  }, [myReports]);

  // Pencarian & filter dinamis berdasarkan judul/ID, status, dan kategori
  const filteredReports = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return myReports.filter((report) => {
      const matchesSearch =
        !query ||
        report.id.toLowerCase().includes(query) ||
        report.title.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === 'ALL' || report.status === selectedStatus;

      const matchesCategory =
        selectedCategory === 'ALL' || report.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [myReports, searchQuery, selectedStatus, selectedCategory]);

  const isFiltered =
    searchQuery.trim() !== '' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
  };

  // Helper ikon kategori kerusakan
  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Kelistrikan':
        return { icon: Zap, style: 'bg-indigo-50 text-indigo-600 border-indigo-200/80' };
      case 'Plumbing / Sanitasi':
        return { icon: Droplets, style: 'bg-sky-50 text-sky-600 border-sky-200/80' };
      case 'Elektronik':
        return { icon: Monitor, style: 'bg-purple-50 text-purple-600 border-purple-200/80' };
      case 'Furniture':
        return { icon: Armchair, style: 'bg-violet-50 text-violet-600 border-violet-200/80' };
      case 'Infrastruktur / Bangunan':
        return { icon: Building2, style: 'bg-blue-50 text-blue-600 border-blue-200/80' };
      case 'Lainnya':
      default:
        return { icon: Wrench, style: 'bg-slate-100 text-slate-600 border-slate-200/80' };
    }
  };

  // Helper badge status berwarna jelas untuk seluruh 6 status wajib
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <ClipboardCheck className="w-3 h-3 text-sky-600" />
            <span>Approved</span>
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <UserCheck className="w-3 h-3 text-indigo-600" />
            <span>Assigned</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Wrench className="w-3 h-3 text-purple-600" />
            <span>In Progress</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Compact Data-Centric Header & Inline Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b-[1.5px] border-indigo-200/75">
        <div>
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5" aria-label="Breadcrumb">
            <Link to="/reporter" className="hover:text-indigo-600 font-medium transition-colors">
              Dashboard Pelapor
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-700">Laporan Saya</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar laporan kerusakan fasilitas yang telah Anda ajukan.
          </p>
        </div>

        {/* Inline Reporter Identity + Create CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-2xl bg-white/95 border-[1.5px] border-indigo-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0B132B] to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Pengguna'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-slate-500">{user?.identifier || '-'}</span>
                <span
                  className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleMeta.badge}`}
                >
                  <RoleIcon className="w-2.5 h-2.5" />
                  <span>{roleMeta.label}</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/reporter/create"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0B132B] via-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-200" />
            <span>Buat Laporan</span>
          </Link>
        </div>
      </div>

      {/* Ringkasan Statistik Ringkas (Compact Horizontal Strip, Tidak Mendominasi Halaman) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/95 border-[1.5px] border-slate-300/80 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
            <span className="text-xs font-semibold text-slate-600">Total Laporan</span>
          </div>
          <span className="text-base font-extrabold text-slate-900 tabular-nums">{stats.total}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/95 border-[1.5px] border-amber-300/80 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-slate-600">Menunggu Verifikasi</span>
          </div>
          <span className="text-base font-extrabold text-amber-700 tabular-nums">{stats.pending}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/95 border-[1.5px] border-purple-300/80 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-xs font-semibold text-slate-600">Dalam Proses</span>
          </div>
          <span className="text-base font-extrabold text-purple-700 tabular-nums">{stats.inProgress}</span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/95 border-[1.5px] border-emerald-300/80 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">Selesai</span>
          </div>
          <span className="text-base font-extrabold text-emerald-700 tabular-nums">{stats.completed}</span>
        </div>
      </div>

      {/* Toolbar Pencarian & Filter yang Menonjol (Tracking Command Bar) */}
      <section className="bg-white rounded-2xl border-2 border-indigo-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Pencarian Judul atau ID Laporan */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-500 group-focus-within:text-purple-600 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau ID laporan (contoh: RPT-2026-0104)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border-[1.5px] border-slate-200 bg-[#F8FAFE] focus:bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Filter Kategori */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter berdasarkan kategori"
                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-indigo-100 bg-[#F8FAFE] focus:bg-white font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600 cursor-pointer transition-all"
              >
                <option value="ALL">Semua Kategori</option>
                {REPORT_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
              Status:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              Semua ({myReports.length})
            </button>
            {REPORT_STATUS_OPTIONS.map((st) => {
              const isSelected = selectedStatus === st;
              const count = myReports.filter((r) => r.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500">
            Menampilkan <strong>{filteredReports.length}</strong> dari <strong>{myReports.length}</strong>
          </span>
        </div>
      </section>

      {/* Daftar Laporan Terstruktur dengan Visualisasi Progres Status */}
      <section className="space-y-4">
        {myReports.length === 0 ? (
          /* Empty State: Pengguna belum pernah mengajukan laporan */
          <div className="bg-white/95 rounded-3xl border-[1.5px] border-dashed border-indigo-300/80 py-14 px-4 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Belum Ada Laporan</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Belum ada pengajuan laporan pada akun ini.
            </p>
            <Link
              to="/reporter/create"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Laporan Baru</span>
            </Link>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty State: Hasil filter/pencarian kosong */
          <div className="bg-white/95 rounded-3xl border-[1.5px] border-dashed border-slate-300 py-12 px-4 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
              <Filter className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Laporan Tidak Ditemukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Tidak ada laporan yang cocok dengan kata kunci atau filter yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
            >
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const catMeta = getCategoryMeta(report.category);
            const CategoryIcon = catMeta.icon;
            const currentStepIdx = getProgressStepIndex(report.status);
            const isRejected = report.status === 'Rejected';

            return (
              <article
                key={report.id}
                className="group bg-white rounded-2xl border-[1.5px] border-slate-300/85 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all duration-200"
              >
                {/* Row 1: Structured Metadata + Title + Status + Detail Button */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${catMeta.style}`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/80">
                          {report.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {report.category}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          Urgensi: <strong className="text-slate-600">{report.urgency}</strong>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {report.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{report.location}</span>
                        </span>
                        <span className="inline-flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{report.reportedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                    {renderStatusBadge(report.status)}

                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white border border-indigo-200/90 hover:border-transparent transition-all duration-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Visualisasi Progres / Timeline Status */}
                <div className="mt-4 pt-3.5 border-t-[1.5px] border-slate-200/80">
                  {isRejected ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50/75 border-[1.5px] border-rose-200/90 text-xs">
                      <div className="flex items-center space-x-2 text-rose-800 font-semibold">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Ditolak Admin</span>
                      </div>
                      {report.statusNote && (
                        <span className="text-[11px] text-rose-700 truncate">{report.statusNote}</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {TRACKING_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div key={step.key} className="space-y-1.5">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                    isCompleted
                                      ? report.status === 'Completed'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                                </span>
                                <span
                                  className={`text-[10px] sm:text-[11px] truncate ${
                                    isCurrent
                                      ? 'font-bold text-indigo-900'
                                      : isCompleted
                                      ? 'font-semibold text-slate-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {step.key === 'handling' && (report.status === 'Assigned' || report.status === 'In Progress')
                                    ? report.status
                                    : step.label}
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isCompleted
                                      ? report.status === 'Completed'
                                        ? 'w-full bg-emerald-500'
                                        : 'w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600'
                                      : 'w-0'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Modal Detail / Placeholder Pratinjau Laporan */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl border-[1.5px] border-indigo-200/80 shadow-2xl overflow-hidden animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#080E21] via-[#131842] to-[#261452] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold bg-white/15 px-2.5 py-1 rounded-lg border border-white/15">
                  {selectedReport.id}
                </span>
                <span className="text-xs font-semibold text-indigo-200">
                  Ringkasan Detail Laporan
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">{selectedReport.category}</span>
                {renderStatusBadge(selectedReport.status)}
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {selectedReport.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F8FAFE] border border-slate-200/80">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Lokasi</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal Pengajuan</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.reportedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pelapor</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedReport.reporterName} ({roleMeta.label})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tingkat Urgensi</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.urgency}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Deskripsi Kerusakan:</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.statusNote && (
                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Catatan Status Terkini:</p>
                  <p className="text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 leading-relaxed">
                    {selectedReport.statusNote}
                  </p>
                </div>
              )}

              {/* Placeholder info notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.2" />
                <span>
                  Pratinjau data contoh frontend. Riwayat lengkap akan terhubung setelah integrasi backend/API.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-950 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
