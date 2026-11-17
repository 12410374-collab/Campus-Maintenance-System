import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  UserCheck,
  Search,
  X,
  Filter,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  ADMIN_REPORT_STATUSES,
  ADMIN_CATEGORY_OPTIONS,
  ADMIN_PRIORITY_OPTIONS,
} from '../../data/mockAdminReports';

const PAGE_SIZE = 6;

const STATUS_META = {
  Pending: {
    label: 'Menunggu Verifikasi',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  Approved: {
    label: 'Disetujui',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: ClipboardCheck,
  },
  Assigned: {
    label: 'Ditugaskan',
    badge: 'bg-violet-50 text-violet-800 border-violet-200',
    icon: UserCheck,
  },
  'In Progress': {
    label: 'Sedang Dikerjakan',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    icon: Wrench,
  },
  Completed: {
    label: 'Selesai',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Ditolak',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
};

const PRIORITY_LABELS = {
  Critical: 'Kritis',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

function getPriorityChipStyle(level) {
  switch (level) {
    case 'Critical':
      return 'bg-rose-500/15 text-rose-700 border-rose-300';
    case 'High':
      return 'bg-amber-500/15 text-amber-800 border-amber-300';
    case 'Medium':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'Low':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-amber-50 text-amber-800 border-dashed border-amber-300';
  }
}

export default function AdminReports() {
  const { reports } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Ringkasan 6 metrik status
  const summaryCards = useMemo(() => {
    return [
      {
        key: 'ALL',
        label: 'Total Laporan',
        count: reports.length,
        accent: 'border-[#2563EB]/45 text-blue-300',
        bar: 'from-[#2563EB] to-[#06B6D4]',
      },
      {
        key: 'Pending',
        label: 'Menunggu Verifikasi',
        count: reports.filter((r) => r.status === 'Pending').length,
        accent: 'border-[#F59E0B]/45 text-amber-300',
        bar: 'from-[#F59E0B] to-orange-500',
      },
      {
        key: 'Approved',
        label: 'Disetujui',
        count: reports.filter((r) => r.status === 'Approved').length,
        accent: 'border-[#2563EB]/45 text-sky-300',
        bar: 'from-blue-500 to-indigo-500',
      },
      {
        key: 'In Progress',
        label: 'Sedang Dikerjakan',
        count: reports.filter((r) => r.status === 'In Progress').length,
        accent: 'border-[#06B6D4]/45 text-cyan-300',
        bar: 'from-[#06B6D4] to-teal-400',
      },
      {
        key: 'Completed',
        label: 'Selesai',
        count: reports.filter((r) => r.status === 'Completed').length,
        accent: 'border-emerald-500/45 text-emerald-300',
        bar: 'from-emerald-400 to-teal-500',
      },
      {
        key: 'Rejected',
        label: 'Ditolak',
        count: reports.filter((r) => r.status === 'Rejected').length,
        accent: 'border-rose-500/45 text-rose-300',
        bar: 'from-rose-500 to-pink-500',
      },
    ];
  }, [reports]);

  // Filtering
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return reports.filter((r) => {
      const matchesQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

      const effectivePriority = r.adminPriority || r.aiUrgency;
      const matchesPriority =
        priorityFilter === 'ALL'
          ? true
          : priorityFilter === 'UNSET'
          ? !r.adminPriority
          : effectivePriority === priorityFilter;

      const matchesDate = !dateFilter || r.reportedIsoDate === dateFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesDate
      );
    });
  }, [reports, searchQuery, statusFilter, categoryFilter, priorityFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, safePage]);

  const hasActiveFilter =
    Boolean(searchQuery.trim()) ||
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    Boolean(dateFilter);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setDateFilter('');
    setCurrentPage(1);
  };

  const renderStatusBadge = (status) => {
    const meta = STATUS_META[status] || {
      label: status,
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${meta.badge}`}
      >
        {meta.label}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. COMMAND HEADER BAR */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#2563EB]/20 blur-[90px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-[#06B6D4]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OPERASIONAL ADMIN • VERIFIKASI LAPORAN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Semua Laporan
            </h1>
            <p className="text-xs text-slate-400">
              Verifikasi laporan masuk, tetapkan prioritas akhir Admin, dan pantau progres lapangan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/admin/assignments"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-950/40 transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>
                Penugasan Teknisi (
                {reports.filter((r) => r.status === 'Approved' && !r.assignedTechnician).length})
              </span>
            </Link>

            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Dasbor Admin</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. RINGKASAN JUMLAH LAPORAN (6 Telemetry Cards, klik untuk filter cepat) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((card) => {
          const isSelected = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setStatusFilter(card.key);
                setCurrentPage(1);
              }}
              className={`relative overflow-hidden text-left rounded-2xl bg-[#101A30] border p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/30 -translate-y-0.5'
                  : `${card.accent} hover:border-white/30`
              }`}
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.bar}`} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {card.label}
              </p>
              <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">{card.count}</p>
            </button>
          );
        })}
      </section>

      {/* 3. SEARCH & FILTER CONSOLE */}
      <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari ID laporan, judul, atau nama pelapor..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border-[1.5px] border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-[#2563EB] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Saring status"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              {ADMIN_REPORT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Category */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Saring kategori"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {ADMIN_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Priority */}
          <div className="md:col-span-3 flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Saring prioritas"
              className="flex-1 px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Prioritas</option>
              {ADMIN_PRIORITY_OPTIONS.map((pr) => (
                <option key={pr} value={pr}>
                  Prioritas {PRIORITY_LABELS[pr] || pr}
                </option>
              ))}
              <option value="UNSET">Belum Ditetapkan Admin</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Active Result Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="report-date-filter" className="inline-flex items-center space-x-1.5 font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Tanggal:</span>
            </label>
            <input
              id="report-date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-mono text-slate-700 focus:outline-none focus:border-[#2563EB]"
            />

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Atur Ulang</span>
              </button>
            )}
          </div>

          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredReports.length}</strong> dari{' '}
            <strong className="text-slate-900">{reports.length}</strong> laporan
          </span>
        </div>
      </section>

      {/* 4. REPORT TABLE & RESPONSIVE LIST */}
      <section className="rounded-3xl bg-white border-[1.5px] border-slate-300/90 shadow-sm overflow-hidden">
        {paginatedReports.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Tidak Ada Laporan yang Ditemukan</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ubah kata kunci pencarian atau penyaringan status, kategori, prioritas, dan tanggal.
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors cursor-pointer"
              >
                <span>Atur Ulang Semua Penyaringan</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table (selaras dengan gaya tabel Manajemen Teknisi) */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full min-w-[1240px] table-fixed text-left border-collapse">
                <colgroup>
                  <col className="w-[9%]" />
                  <col className="w-[15.5%]" />
                  <col className="w-[9.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[11.5%]" />
                  <col className="w-[9.5%]" />
                  <col className="w-[7%]" />
                  <col className="w-[9.5%]" />
                  <col className="w-[11%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#080D1B] text-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-2.5 whitespace-nowrap">ID Laporan</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Judul Laporan</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Pelapor</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Kategori</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Lokasi</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Tanggal</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Urgensi AI</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Prioritas Admin</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-3 whitespace-nowrap text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1.5px] divide-slate-200/80 text-xs bg-white">
                  {paginatedReports.map((report) => {
                    const isOverridden =
                      report.adminPriority && report.adminPriority !== report.aiUrgency;

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="py-3.5 px-2.5 font-mono text-[11px] font-bold text-[#101A30] whitespace-nowrap">
                          {report.id}
                        </td>
                        <td className="py-3.5 px-2.5">
                          <p
                            className="font-bold text-slate-900 truncate"
                            title={report.title}
                          >
                            {report.title}
                          </p>
                        </td>
                        <td className="py-3.5 px-2.5">
                          <p className="font-bold text-slate-900 truncate" title={report.reporterName}>
                            {report.reporterName}
                          </p>
                          <p className="text-[10.5px] text-slate-400 truncate">{report.reporterRole}</p>
                        </td>
                        <td className="py-3.5 px-2 text-slate-700 font-medium">
                          <p className="truncate text-[11.5px]" title={report.category}>
                            {report.category}
                          </p>
                        </td>
                        <td className="py-3.5 px-2.5 text-slate-600">
                          <p className="truncate text-[11.5px]" title={report.location}>
                            {report.location}
                          </p>
                        </td>
                        <td className="py-3.5 px-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {report.reportedDate}
                        </td>
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${getPriorityChipStyle(
                              report.aiUrgency
                            )}`}
                          >
                            {PRIORITY_LABELS[report.aiUrgency] || report.aiUrgency}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${getPriorityChipStyle(
                                report.adminPriority
                              )}`}
                            >
                              {report.adminPriority
                                ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                                : 'Belum Diatur'}
                            </span>
                            {isOverridden && (
                              <span className="text-[10px] font-bold text-[#8B5CF6]" title="Disesuaikan Admin">
                                *
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-2.5 whitespace-nowrap">
                          {renderStatusBadge(report.status)}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/reports/${report.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Detail</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tablet & Mobile Cards */}
            <div className="xl:hidden p-4 space-y-3.5 bg-[#eef2f9]/55">
              {paginatedReports.map((report) => (
                <article
                  key={report.id}
                  className="p-4 rounded-2xl bg-white border-[1.5px] border-slate-300/85 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-[#101A30] bg-slate-200/75 px-2 py-0.5 rounded-md">
                        {report.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {report.category}
                      </span>
                    </div>
                    {renderStatusBadge(report.status)}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {report.location} • {report.reporterName} ({report.reporterRole})
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {report.reportedDate}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${getPriorityChipStyle(
                          report.aiUrgency
                        )}`}
                      >
                        <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                        <span>AI: {PRIORITY_LABELS[report.aiUrgency] || report.aiUrgency}</span>
                      </span>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${getPriorityChipStyle(
                          report.adminPriority
                        )}`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>
                          Admin:{' '}
                          {report.adminPriority
                            ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                            : 'Belum Ditetapkan'}
                        </span>
                      </span>
                    </div>

                    <Link
                      to={`/admin/reports/${report.id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* 5. PAGINATION FOOTER */}
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-t-[1.5px] border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Halaman <strong className="text-slate-900">{safePage}</strong> dari{' '}
                <strong className="text-slate-900">{totalPages}</strong> ({filteredReports.length} laporan)
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-mono font-bold transition-colors cursor-pointer ${
                      safePage === pageNum
                        ? 'bg-[#101A30] text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
