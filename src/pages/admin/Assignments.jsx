import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Search,
  X,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  Users,
  AlertCircle,
  Star,
  ClipboardCheck,
  RotateCcw,
  Clock,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import {
  ADMIN_CATEGORY_OPTIONS,
  ADMIN_PRIORITY_OPTIONS,
} from '../../data/mockAdminReports';
import {
  getWorkloadMetrics,
  isTechnicianRecommended,
} from '../../data/mockTechnicians';

const STATUS_LABELS = {
  Pending: 'Menunggu Verifikasi',
  Approved: 'Disetujui',
  Assigned: 'Ditugaskan',
  'In Progress': 'Sedang Dikerjakan',
  Completed: 'Selesai',
  Rejected: 'Ditolak',
};

const PRIORITY_LABELS = {
  Critical: 'Kritis',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

const AVAILABILITY_LABELS = {
  Available: 'Tersedia',
  'On Duty': 'Sedang Bertugas',
  Unavailable: 'Tidak Tersedia',
};

function getPriorityStyle(level) {
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

function isReportEligibleForAssignment(report) {
  return (
    Boolean(report) &&
    report.status === 'Approved' &&
    !report.assignedTechnicianId &&
    !report.assignedTechnician
  );
}

export default function AdminAssignments() {
  const { user } = useAuth();
  const { reports, technicians, assignReportToTechnician } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentPanelRef = useRef(null);

  const queryReportId = searchParams.get('reportId');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('READY');

  const [trackedQueryId, setTrackedQueryId] = useState(queryReportId);
  const [userSelectedReportId, setUserSelectedReportId] = useState(null);

  if (queryReportId !== trackedQueryId) {
    setTrackedQueryId(queryReportId);
    setUserSelectedReportId(null);
  }

  const effectiveSelectedReportId = useMemo(() => {
    if (userSelectedReportId) {
      const picked = reports.find((r) => r.id === userSelectedReportId);
      if (isReportEligibleForAssignment(picked)) {
        return picked.id;
      }
    }

    if (queryReportId) {
      const target = reports.find(
        (r) => r.id.toLowerCase() === queryReportId.toLowerCase()
      );
      if (isReportEligibleForAssignment(target)) {
        return target.id;
      }
    }

    const firstReady = reports.find((r) => isReportEligibleForAssignment(r));
    return firstReady?.id || null;
  }, [reports, userSelectedReportId, queryReportId]);

  const [selectedTechId, setSelectedTechId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Ringkasan 3 metrik utama halaman Penugasan Teknisi
  const overviewStats = useMemo(() => {
    const readyCount = reports.filter((r) => isReportEligibleForAssignment(r)).length;
    const assignedCount = reports.filter(
      (r) => r.status === 'Assigned' || r.status === 'In Progress'
    ).length;
    const availableTechCount = technicians.filter(
      (t) => t.availability === 'Available'
    ).length;

    return { readyCount, assignedCount, availableTechCount };
  }, [reports, technicians]);

  // Daftar laporan tersaring
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return reports.filter((r) => {
      const matchesQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

      const finalPriority = r.adminPriority || r.aiUrgency;
      const matchesPriority = priorityFilter === 'ALL' || finalPriority === priorityFilter;

      const isReady = isReportEligibleForAssignment(r);
      const isAlreadyAssigned = Boolean(r.assignedTechnicianId || r.assignedTechnician);
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'READY'
          ? isReady
          : isAlreadyAssigned;

      return matchesQuery && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [reports, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const selectedReport = useMemo(() => {
    if (!effectiveSelectedReportId) return null;
    const found = reports.find((r) => r.id === effectiveSelectedReportId);
    return isReportEligibleForAssignment(found) ? found : null;
  }, [reports, effectiveSelectedReportId]);

  // Urutkan teknisi: Tersedia/Bertugas > Direkomendasikan > Tugas Aktif tersedikit > Tidak Tersedia terakhir
  const sortedTechnicians = useMemo(() => {
    if (!selectedReport) return [];

    return technicians
      .map((tech) => ({
        ...tech,
        isRecommended: isTechnicianRecommended(selectedReport.category, tech.specialization),
        isUnavailable: tech.availability === 'Unavailable',
        workload: getWorkloadMetrics(tech.activeTasks),
      }))
      .sort((a, b) => {
        if (a.isUnavailable !== b.isUnavailable) return a.isUnavailable ? 1 : -1;
        if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
        return a.activeTasks - b.activeTasks;
      });
  }, [technicians, selectedReport]);

  const selectedTechnician = useMemo(() => {
    if (!selectedTechId) return null;
    const found = sortedTechnicians.find((t) => t.id === selectedTechId);
    if (!found || found.isUnavailable) return null;
    return found;
  }, [sortedTechnicians, selectedTechId]);

  const hasActiveFilter =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    statusFilter !== 'READY';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setStatusFilter('READY');
  };

  const handleSelectReport = (report) => {
    if (isAssigning || !isReportEligibleForAssignment(report)) return;
    setUserSelectedReportId(report.id);
    setSelectedTechId(null);
    setFeedback(null);
    if (queryReportId && queryReportId.toLowerCase() !== report.id.toLowerCase()) {
      setSearchParams({}, { replace: true });
    }
    if (assignmentPanelRef.current) {
      assignmentPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedReport || !selectedTechnician || isAssigning) return;

    setIsAssigning(true);
    setFeedback(null);

    try {
      const result = await assignReportToTechnician(
        selectedReport.id,
        selectedTechnician.id,
        user?.name
      );

      if (result?.success) {
        setFeedback({
          type: 'success',
          text: `${result.message} Penugasan telah tersimpan ke server backend dan siap dikerjakan pada akun ${selectedTechnician.name} (${selectedTechnician.id}).`,
        });
        setSelectedTechId(null);
        setUserSelectedReportId(null);
        if (queryReportId) {
          setSearchParams({}, { replace: true });
        }
      } else {
        setFeedback({
          type: 'error',
          text:
            result?.message ||
            'Gagal menyimpan penugasan teknisi ke server backend. Silakan coba lagi.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err?.message ||
          'Terjadi kesalahan saat menyimpan penugasan ke server backend. Pastikan JSON Server berjalan.',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. COMMAND HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
        <div
          className="absolute -top-20 -right-14 w-60 h-60 rounded-full bg-[#8B5CF6]/20 blur-[95px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-[#06B6D4]">
              <Wrench className="w-3.5 h-3.5" />
              <span>OPERASIONAL ADMIN • PENUGASAN TEKNISI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Penugasan Teknisi
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/admin/reports"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Semua Laporan</span>
            </Link>
            <Link
              to="/admin/technicians"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Manajemen Teknisi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW TELEMETRY (3 Metrik Penugasan) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#2563EB]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Laporan Siap Ditugaskan
              </p>
              <p className="text-3xl font-extrabold text-white mt-2 tabular-nums">
                {overviewStats.readyCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#8B5CF6]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#2563EB]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                Laporan Sudah Ditugaskan
              </p>
              <p className="text-3xl font-extrabold text-white mt-2 tabular-nums">
                {overviewStats.assignedCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-violet-300 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-emerald-500/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-[#06B6D4]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Teknisi Tersedia
              </p>
              <p className="text-3xl font-extrabold text-white mt-2 tabular-nums">
                {overviewStats.availableTechCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-2xl border-[1.5px] flex items-center justify-between gap-3 text-xs font-semibold animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. SEARCH & FILTER BAR */}
      <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID laporan, judul kerusakan, atau lokasi..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border-[1.5px] border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-[#2563EB] font-medium"
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

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Saring status penugasan"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="READY">Siap Ditugaskan (Disetujui)</option>
              <option value="ASSIGNED">Sudah Ditugaskan</option>
              <option value="ALL">Semua Status Laporan</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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

          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Saring prioritas"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Prioritas</option>
              {ADMIN_PRIORITY_OPTIONS.map((pr) => (
                <option key={pr} value={pr}>
                  Prioritas {PRIORITY_LABELS[pr] || pr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredReports.length}</strong> laporan
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Atur Ulang</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. TABEL LAPORAN PENUGASAN (Full-Width Desktop Table + Responsive Cards) */}
      <section className="rounded-3xl bg-white border-[1.5px] border-slate-300/90 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-2.5">
            <ClipboardCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900">
              Tidak Ada Laporan yang Memenuhi Kriteria
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {statusFilter === 'READY'
                ? 'Seluruh laporan Disetujui sudah ditugaskan, atau setujui laporan Menunggu Verifikasi terlebih dahulu.'
                : 'Ubah kata kunci pencarian atau penyaringan status, kategori, dan prioritas.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full min-w-[1020px] table-fixed text-left border-collapse">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[21%]" />
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[10%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#080D1B] text-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-3 whitespace-nowrap">ID Laporan</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Judul Kerusakan</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Kategori</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Lokasi</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Prioritas Admin</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Tanggal</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-3 whitespace-nowrap text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1.5px] divide-slate-200/80 text-xs">
                  {filteredReports.map((report) => {
                    const isEligible = isReportEligibleForAssignment(report);
                    const isSelected = selectedReport?.id === report.id;

                    return (
                      <tr
                        key={report.id}
                        onClick={() => handleSelectReport(report)}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80'
                            : isEligible
                            ? 'hover:bg-[#F8FAFC] cursor-pointer'
                            : 'bg-slate-50/70 opacity-75'
                        }`}
                      >
                        <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-[#101A30] whitespace-nowrap">
                          {report.id}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-slate-900 truncate" title={report.title}>
                            {report.title}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          <p className="truncate text-[11.5px]" title={report.category}>
                            {report.category}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <p className="truncate text-[11.5px]" title={report.location}>
                            {report.location}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold border ${getPriorityStyle(
                              report.adminPriority
                            )}`}
                          >
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>
                              {report.adminPriority
                                ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                                : 'Belum'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                          {report.reportedDate}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                              isEligible
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : report.assignedTechnicianId || report.assignedTechnician
                                ? 'bg-violet-50 text-violet-800 border-violet-200'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {STATUS_LABELS[report.status] || report.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          {isEligible ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectReport(report);
                              }}
                              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2563EB] text-white'
                                  : 'bg-[#101A30] text-white hover:bg-[#2563EB]'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{isSelected ? 'Dipilih' : 'Pilih'}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10.5px] font-semibold text-slate-400">
                              <Lock className="w-3 h-3" />
                              <span>Terkunci</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Cards */}
            <div className="xl:hidden p-4 space-y-3 bg-[#eef2f9]/55">
              {filteredReports.map((report) => {
                const isEligible = isReportEligibleForAssignment(report);
                const isSelected = selectedReport?.id === report.id;

                return (
                  <article
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className={`p-4 rounded-2xl border-[1.5px] space-y-2.5 bg-white transition-all ${
                      isSelected
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
                        : isEligible
                        ? 'border-slate-300 cursor-pointer'
                        : 'border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#101A30] bg-slate-200/75 px-2 py-0.5 rounded">
                        {report.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                          isEligible
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500">
                      {report.category} • {report.location} • {report.reportedDate}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold border ${getPriorityStyle(
                          report.adminPriority
                        )}`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>
                          Admin:{' '}
                          {report.adminPriority
                            ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                            : 'Belum'}
                        </span>
                      </span>

                      {isEligible ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectReport(report);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                            isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#101A30] text-white'
                          }`}
                        >
                          {isSelected ? 'Dipilih' : 'Pilih'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3" />
                          <span>Terkunci</span>
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* 5. PANEL PEMILIHAN TEKNISI & KONFIRMASI PENUGASAN */}
      <section ref={assignmentPanelRef}>
        {!selectedReport ? (
          <div className="rounded-3xl bg-[#101A30] border border-cyan-500/25 text-[#F8FAFC] p-6 text-center space-y-2 shadow-xl">
            <UserCheck className="w-7 h-7 text-[#06B6D4] mx-auto" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Pilih Laporan Berstatus Disetujui
            </h2>
            <p className="text-xs text-slate-300">
              Klik baris laporan berstatus <strong className="text-[#06B6D4]">Disetujui</strong> pada tabel di atas untuk memilih teknisi pelaksana.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Detail Laporan Terpilih (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/35">
                  {selectedReport.id}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {selectedReport.category}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-white leading-snug">
                {selectedReport.title}
              </h2>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                  <span>{selectedReport.location}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                  <span>{selectedReport.reportedDate}</span>
                </p>
              </div>

              {/* Perbandingan Terpisah AI vs Admin */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#101A30] border border-violet-400/30">
                  <p className="text-[10px] font-bold uppercase text-violet-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Rekomendasi AI</span>
                  </p>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {PRIORITY_LABELS[selectedReport.aiUrgency] || selectedReport.aiUrgency}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#101A30] border border-[#06B6D4]/35">
                  <p className="text-[10px] font-bold uppercase text-[#06B6D4] flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Prioritas Akhir Admin</span>
                  </p>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {selectedReport.adminPriority
                      ? PRIORITY_LABELS[selectedReport.adminPriority] ||
                        selectedReport.adminPriority
                      : PRIORITY_LABELS[selectedReport.aiUrgency] || selectedReport.aiUrgency}
                  </p>
                </div>
              </div>

              {selectedTechnician && (
                <div className="p-4 rounded-2xl bg-[#101A30] border border-[#06B6D4]/45 space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
                    Ringkasan Penugasan
                  </p>
                  <p className="text-slate-200">
                    Laporan <strong className="font-mono text-white">{selectedReport.id}</strong> →{' '}
                    <strong className="text-white">{selectedTechnician.name}</strong> (
                    {selectedTechnician.id})
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Tugas aktif: {selectedTechnician.activeTasks} →{' '}
                    {selectedTechnician.activeTasks + 1}
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedTechnician || isAssigning}
                onClick={handleConfirmAssignment}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-950/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Penugasan...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Konfirmasi Penugasan</span>
                  </>
                )}
              </button>
            </div>

            {/* Daftar Pemilihan Teknisi (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#101A30] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Daftar Pemilihan Teknisi
                </h2>
                <span className="text-[11px] font-semibold text-[#06B6D4]">
                  Rekomendasi spesialisasi {selectedReport.category}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#080D1B]/80 border border-cyan-500/25 text-[11px] text-cyan-100/90 flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                <span>
                  Untuk pengujian login halaman Teknisi, akun demo yang tersedia adalah{' '}
                  <strong className="text-white">Rudi Hartono (TECH-001)</strong>. Pilih kartu teknisi lalu tekan{' '}
                  <strong className="text-white">Konfirmasi Penugasan</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedTechnicians.map((tech) => {
                  const isPicked = selectedTechnician?.id === tech.id;
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      disabled={tech.isUnavailable || isAssigning}
                      onClick={() => setSelectedTechId(tech.id)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        tech.isUnavailable
                          ? 'bg-[#080D1B]/45 border-white/5 opacity-45 cursor-not-allowed'
                          : isPicked
                          ? 'bg-[#2563EB]/25 border-[#06B6D4] ring-2 ring-[#06B6D4]/35 cursor-pointer'
                          : 'bg-[#080D1B]/85 border-white/10 hover:border-white/30 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-cyan-300 bg-[#101A30] px-1.5 py-0.5 rounded border border-cyan-500/30">
                              {tech.id}
                            </span>
                            {tech.isRecommended && !tech.isUnavailable && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B5CF6]/25 text-violet-200 border border-violet-400/40">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Direkomendasikan</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-white mt-1.5 truncate">
                            {tech.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {tech.specialization}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tech.availability === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                              : tech.availability === 'On Duty'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/35'
                          }`}
                        >
                          {AVAILABILITY_LABELS[tech.availability] || tech.availability}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-300">
                            Tugas Aktif: <strong className="text-white">{tech.activeTasks}</strong>
                          </span>
                          <span className="text-slate-300">
                            Beban: <strong className="text-white">{tech.workload.level}</strong> ({tech.workload.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            style={{ width: `${Math.max(tech.workload.percent, 8)}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${tech.workload.barClass}`}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
