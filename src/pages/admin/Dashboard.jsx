import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Radio,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Users,
  MapPin,
  Calendar,
  Eye,
  ArrowRight,
  ClipboardCheck,
  UserCheck,
  X,
  Info,
  Activity,
  BarChart3,
  Layers,
  Gauge,
  BellRing,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import {
  formatWitaLongDateId,
  compareReportsNewestFirst,
} from '../../utils/dateFormat';
import {
  ADMIN_REPORT_STATUSES,
  MOCK_MAINTENANCE_ACTIVITY,
} from '../../data/mockAdminReports';

const COMMAND_CENTER_DATE = formatWitaLongDateId(new Date());

const STATUS_META = {
  Pending: {
    label: 'Menunggu Verifikasi',
    stroke: '#F59E0B',
    dot: 'bg-[#F59E0B]',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  Approved: {
    label: 'Disetujui',
    stroke: '#2563EB',
    dot: 'bg-[#2563EB]',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: ClipboardCheck,
  },
  Assigned: {
    label: 'Ditugaskan',
    stroke: '#8B5CF6',
    dot: 'bg-[#8B5CF6]',
    badge: 'bg-violet-50 text-violet-800 border-violet-200',
    icon: UserCheck,
  },
  'In Progress': {
    label: 'Sedang Dikerjakan',
    stroke: '#06B6D4',
    dot: 'bg-[#06B6D4]',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    icon: Wrench,
  },
  Completed: {
    label: 'Selesai',
    stroke: '#10B981',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Ditolak',
    stroke: '#F43F5E',
    dot: 'bg-rose-500',
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

const PRIORITY_STYLE = {
  Critical: {
    chip: 'bg-rose-500/15 text-rose-700 border-rose-300',
    darkChip: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
    rail: 'border-l-4 border-l-rose-500 bg-rose-50/45',
  },
  High: {
    chip: 'bg-amber-500/15 text-amber-800 border-amber-300',
    darkChip: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    rail: 'border-l-4 border-l-[#F59E0B] bg-amber-50/35',
  },
  Medium: {
    chip: 'bg-blue-500/10 text-blue-700 border-blue-200',
    darkChip: 'bg-blue-500/20 text-blue-200 border-blue-400/35',
    rail: 'border-l-4 border-l-[#2563EB] bg-[#F8FAFC]',
  },
  Low: {
    chip: 'bg-slate-100 text-slate-700 border-slate-300',
    darkChip: 'bg-slate-700/60 text-slate-200 border-slate-500/40',
    rail: 'border-l-4 border-l-slate-400 bg-[#F8FAFC]',
  },
};

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function getCategoryAccent(index) {
  const palette = [
    'from-[#2563EB] to-[#06B6D4]',
    'from-[#8B5CF6] to-[#2563EB]',
    'from-[#06B6D4] to-teal-400',
    'from-[#F59E0B] to-orange-500',
    'from-indigo-500 to-[#8B5CF6]',
    'from-slate-500 to-slate-600',
  ];
  return palette[index % palette.length];
}

function getActivityMeta(type) {
  switch (type) {
    case 'incoming':
      return {
        icon: BellRing,
        badge: 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30',
        label: 'Masuk',
      };
    case 'priority':
      return {
        icon: AlertTriangle,
        badge: 'bg-[#F59E0B]/15 text-amber-700 border-amber-300',
        label: 'Prioritas',
      };
    case 'approved':
      return {
        icon: ClipboardCheck,
        badge: 'bg-[#8B5CF6]/15 text-[#7C3AED] border-violet-300',
        label: 'Disetujui',
      };
    case 'assigned':
      return {
        icon: Wrench,
        badge: 'bg-[#06B6D4]/15 text-cyan-700 border-cyan-300',
        label: 'Penugasan',
      };
    case 'completed':
    default:
      return {
        icon: CheckCircle2,
        badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
        label: 'Selesai',
      };
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { reports, technicians, activities } = useAdmin();
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(MOCK_MAINTENANCE_ACTIVITY.length - 1);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);

  // 1. KPI Metrics konsisten 100% dengan AdminContext reports
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'Pending').length;
    const inProgress = reports.filter((r) => r.status === 'In Progress').length;
    const completed = reports.filter((r) => r.status === 'Completed').length;
    const activeCriticalHigh = reports.filter((r) => {
      const eff = r.adminPriority || r.aiUrgency;
      return (eff === 'Critical' || eff === 'High') && r.status !== 'Completed' && r.status !== 'Rejected';
    }).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      activeCriticalHigh,
      pendingRate: total ? Math.round((pending / total) * 100) : 0,
      inProgressRate: total ? Math.round((inProgress / total) * 100) : 0,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [reports]);

  // 2. Status Distribution untuk Radial Donut Chart
  const statusDistribution = useMemo(() => {
    const total = reports.length || 1;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;

    return ADMIN_REPORT_STATUSES.reduce(
      (acc, statusKey) => {
        const count = reports.filter((r) => r.status === statusKey).length;
        const percent = Math.round((count / total) * 100);
        const segmentLength = (count / total) * circumference;

        acc.items.push({
          key: statusKey,
          count,
          percent,
          segmentLength,
          dashOffset: -acc.offset,
          meta: STATUS_META[statusKey],
        });

        acc.offset += segmentLength;
        return acc;
      },
      { items: [], offset: 0, circumference, radius }
    );
  }, [reports]);

  // 3. Reports by Category (computed dynamically dari reports)
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    const total = reports.length || 1;

    return Object.entries(counts)
      .map(([name, count], idx) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
        gradient: getCategoryAccent(idx),
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // 4. SVG Coordinates untuk Maintenance Activity Chart (7 hari terakhir)
  const activityChart = useMemo(() => {
    const maxVal = Math.max(
      ...MOCK_MAINTENANCE_ACTIVITY.map((d) => Math.max(d.incoming, d.inProgress, d.resolved)),
      3
    );
    const width = 460;
    const height = 148;
    const padX = 24;
    const padY = 18;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const points = MOCK_MAINTENANCE_ACTIVITY.map((d, idx) => {
      const x = padX + (idx / Math.max(MOCK_MAINTENANCE_ACTIVITY.length - 1, 1)) * plotW;
      const yIncoming = padY + plotH - (d.incoming / maxVal) * plotH;
      const yActive = padY + plotH - (d.inProgress / maxVal) * plotH;
      return { ...d, x, yIncoming, yActive, barHeight: (d.incoming / maxVal) * plotH };
    });

    const lineIncoming = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yIncoming}`).join(' ');
    const areaIncoming = `${lineIncoming} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
    const lineActive = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yActive}`).join(' ');

    return { width, height, padY, plotH, points, lineIncoming, areaIncoming, lineActive, maxVal };
  }, []);

  // 5. Priority Control Center list (sorted by effective priority, filterable)
  const priorityControlList = useMemo(() => {
    const enriched = reports.map((r) => ({
      ...r,
      effectivePriority: r.adminPriority || r.aiUrgency,
    })).sort((a, b) => {
      const rankDiff =
        (PRIORITY_RANK[a.effectivePriority] ?? 9) - (PRIORITY_RANK[b.effectivePriority] ?? 9);
      if (rankDiff !== 0) return rankDiff;
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (b.status === 'Pending' && a.status !== 'Pending') return 1;
      return compareReportsNewestFirst(a, b);
    });

    if (priorityFilter === 'ALL') return enriched;
    if (priorityFilter === 'UNASSIGNED_PRIORITY') {
      return enriched.filter((r) => !r.adminPriority);
    }
    return enriched.filter((r) => r.effectivePriority === priorityFilter);
  }, [priorityFilter, reports]);

  const priorityCounts = useMemo(() => {
    const getEff = (r) => r.adminPriority || r.aiUrgency;
    return {
      ALL: reports.length,
      Critical: reports.filter((r) => getEff(r) === 'Critical').length,
      High: reports.filter((r) => getEff(r) === 'High').length,
      Medium: reports.filter((r) => getEff(r) === 'Medium').length,
      Low: reports.filter((r) => getEff(r) === 'Low').length,
      UNASSIGNED_PRIORITY: reports.filter((r) => !r.adminPriority).length,
    };
  }, [reports]);

  // 6. Technician Workload Metrics
  const technicianStats = useMemo(() => {
    const total = technicians.length;
    const available = technicians.filter((t) => t.status === 'Available').length;
    const onDuty = technicians.filter((t) => t.status === 'On Duty').length;
    return { total, available, onDuty };
  }, [technicians]);

  const renderStatusBadge = (status) => {
    const meta = STATUS_META[status] || {
      label: status,
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: FileText,
    };
    const Icon = meta.icon;

    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.badge}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{meta.label}</span>
      </span>
    );
  };

  const activeDay = MOCK_MAINTENANCE_ACTIVITY[activeDayIndex] || MOCK_MAINTENANCE_ACTIVITY[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. COMMAND CENTER HEADER (Midnight Navy Operational HUD) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-6 sm:p-7 shadow-2xl shadow-slate-950/30">
        {/* Subtle Tactical Grid & Atmospheric Gradient Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(37, 99, 235, 0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#2563EB]/25 blur-[110px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-[#8B5CF6]/20 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#06B6D4]/15 blur-[95px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          {/* Left HUD: Operations Title & Admin Greeting */}
          <div className="xl:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#101A30] border border-[#06B6D4]/40 text-[#06B6D4] text-[11px] font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                <span>PUSAT OPERASIONAL KAMPUS</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-300 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>{COMMAND_CENTER_DATE}</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
                Pusat Kendali Pemeliharaan Fasilitas
              </h1>
              <p className="text-sm text-indigo-200/90 mt-1.5 font-medium">
                Selamat bertugas, <span className="text-white font-bold">{user?.name || 'Admin Sarana & Fasilitas'}</span>
              </p>
            </div>
          </div>

          {/* Right HUD: System Telemetry Readouts & Command Links */}
          <div className="xl:col-span-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#101A30]/90 backdrop-blur-md border border-cyan-500/25 p-3.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>STATUS SISTEM</span>
                  <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
                </div>
                <p className="text-sm font-extrabold text-[#F8FAFC] mt-1 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>BEROPERASI</span>
                </p>
                <p className="text-[11px] text-[#06B6D4] mt-0.5 font-medium">
                  Analisis AI Aktif
                </p>
              </div>

              <div className="rounded-2xl bg-[#101A30]/90 backdrop-blur-md border border-violet-500/25 p-3.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>AKTIVITAS LAPORAN</span>
                  <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                <p className="text-sm font-extrabold text-[#F8FAFC] mt-1">
                  {MOCK_MAINTENANCE_ACTIVITY[MOCK_MAINTENANCE_ACTIVITY.length - 1].incoming} Masuk Hari Ini
                </p>
                <p className="text-[11px] text-amber-300 mt-0.5 font-medium">
                  {stats.pending} Menunggu • {stats.activeCriticalHigh} Prioritas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/reports"
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-950/50 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Semua Laporan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/admin/technicians"
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Manajemen Teknisi</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI TELEMETRY STRIP (Minimal & High-Contrast Numerals) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Laporan */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#2563EB]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Total Laporan
              </p>
              <div className="mt-2 flex items-baseline space-x-2.5">
                <p className="text-3xl font-extrabold text-white tabular-nums">{stats.total}</p>
                <span className="text-[11px] font-mono font-bold text-[#06B6D4]">100%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#60A5FA] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#F59E0B]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#F59E0B] to-orange-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Menunggu Verifikasi
              </p>
              <div className="mt-2 flex items-baseline space-x-2.5">
                <p className="text-3xl font-extrabold text-white tabular-nums">{stats.pending}</p>
                <span className="text-[11px] font-mono font-bold text-[#F59E0B]">{stats.pendingRate}%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Sedang Dikerjakan */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#06B6D4]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#06B6D4] to-[#2563EB]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Sedang Dikerjakan
              </p>
              <div className="mt-2 flex items-baseline space-x-2.5">
                <p className="text-3xl font-extrabold text-white tabular-nums">{stats.inProgress}</p>
                <span className="text-[11px] font-mono font-bold text-[#06B6D4]">{stats.inProgressRate}%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Selesai */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101A30] border border-[#8B5CF6]/40 p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-emerald-400" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                Selesai
              </p>
              <div className="mt-2 flex items-baseline space-x-2.5">
                <p className="text-3xl font-extrabold text-white tabular-nums">{stats.completed}</p>
                <span className="text-[11px] font-mono font-bold text-emerald-400">{stats.completionRate}%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-violet-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONAL ANALYTICS (Two-Column Composition) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Analytics Column (7 cols): Maintenance Activity + Reports by Category */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Maintenance Activity Chart (Dark Midnight Telemetry Card) */}
          <div className="rounded-3xl bg-[#080D1B] border border-slate-700/80 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#06B6D4] flex items-center justify-center">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">Aktivitas Pemeliharaan</h2>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center space-x-1.5 text-cyan-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                  <span>Masuk</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 text-violet-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                  <span>Aktif Dikerjakan</span>
                </span>
              </div>
            </div>

            {/* SVG Multi-Series Chart */}
            <div className="rounded-2xl bg-[#101A30]/80 border border-white/10 p-3 sm:p-4">
              <svg
                viewBox={`0 0 ${activityChart.width} ${activityChart.height}`}
                className="w-full h-40 overflow-visible"
                role="img"
                aria-label="Grafik aktivitas pemeliharaan 7 hari"
              >
                <defs>
                  <linearGradient id="cmdIncomingArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 1, 2, 3].map((lvl) => {
                  const y = activityChart.padY + (lvl / 3) * activityChart.plotH;
                  return (
                    <line
                      key={lvl}
                      x1="20"
                      y1={y}
                      x2={activityChart.width - 20}
                      y2={y}
                      stroke="rgba(148,163,184,0.16)"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Background Bars for Daily Incoming Volume */}
                {activityChart.points.map((p, idx) => (
                  <rect
                    key={p.day}
                    x={p.x - 10}
                    y={activityChart.height - activityChart.padY - p.barHeight}
                    width="20"
                    height={p.barHeight}
                    rx="5"
                    fill={activeDayIndex === idx ? 'rgba(37, 99, 235, 0.45)' : 'rgba(37, 99, 235, 0.2)'}
                    className="transition-colors cursor-pointer"
                    onMouseEnter={() => setActiveDayIndex(idx)}
                  />
                ))}

                {/* Area & Lines */}
                <path d={activityChart.areaIncoming} fill="url(#cmdIncomingArea)" />
                <path
                  d={activityChart.lineIncoming}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={activityChart.lineActive}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                />

                {/* Interactive Data Nodes + Day Labels */}
                {activityChart.points.map((p, idx) => {
                  const isActive = activeDayIndex === idx;
                  return (
                    <g
                      key={p.day}
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveDayIndex(idx)}
                      onClick={() => setActiveDayIndex(idx)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.yIncoming}
                        r={isActive ? '5.5' : '3.8'}
                        fill="#080D1B"
                        stroke="#06B6D4"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={p.x}
                        cy={p.yActive}
                        r={isActive ? '4.5' : '3'}
                        fill="#8B5CF6"
                      />
                      <text
                        x={p.x}
                        y={activityChart.height - 2}
                        textAnchor="middle"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        {p.day}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Active Day Telemetry Readout */}
              <div className="mt-2 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-slate-300">
                  {activeDay.day} ({activeDay.label})
                </span>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span className="text-[#06B6D4]">Masuk: <strong>{activeDay.incoming}</strong></span>
                  <span className="text-violet-300">Aktif: <strong>{activeDay.inProgress}</strong></span>
                  <span className="text-emerald-400">Selesai: <strong>{activeDay.resolved}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports by Category (Soft White Analytical Surface) */}
          <div className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/85 p-5 sm:p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#101A30] text-[#06B6D4] flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Laporan per Kategori</h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#101A30] bg-slate-200/70 px-2.5 py-1 rounded-lg">
                {categoryBreakdown.length} Kategori
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{cat.name}</span>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {cat.count} <span className="text-[11px] font-normal text-slate-400">({cat.percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200/90 overflow-hidden">
                    <div
                      style={{ width: `${cat.percent}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Analytics Column (5 cols): Report Status Distribution */}
        <div className="lg:col-span-5 rounded-3xl bg-[#101A30] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-violet-300 flex items-center justify-center">
                  <Gauge className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">Distribusi Status Laporan</h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#06B6D4] bg-[#080D1B] px-2.5 py-1 rounded-lg border border-cyan-500/25">
                {stats.total} Laporan
              </span>
            </div>

            {/* Interactive SVG Donut Gauge */}
            <div className="flex justify-center my-2">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 156 156" className="w-full h-full -rotate-90">
                  <circle
                    cx="78"
                    cy="78"
                    r={statusDistribution.radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="18"
                  />
                  {statusDistribution.items.map((item) => {
                    const isDimmed = hoveredStatus && hoveredStatus !== item.key;
                    return (
                      <circle
                        key={item.key}
                        cx="78"
                        cy="78"
                        r={statusDistribution.radius}
                        fill="transparent"
                        stroke={item.meta.stroke}
                        strokeWidth={hoveredStatus === item.key ? '22' : '18'}
                        strokeDasharray={`${item.segmentLength} ${statusDistribution.circumference}`}
                        strokeDashoffset={item.dashOffset}
                        className="transition-all duration-200 cursor-pointer"
                        style={{ opacity: isDimmed ? 0.35 : 1 }}
                        onMouseEnter={() => setHoveredStatus(item.key)}
                        onMouseLeave={() => setHoveredStatus(null)}
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-white tabular-nums">
                    {hoveredStatus
                      ? statusDistribution.items.find((i) => i.key === hoveredStatus)?.count ?? 0
                      : stats.total}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300 mt-0.5">
                    {hoveredStatus ? STATUS_META[hoveredStatus]?.label || hoveredStatus : 'Semua Status'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Status Legend Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {statusDistribution.items.map((item) => {
              const isHighlighted = hoveredStatus === item.key;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredStatus(item.key)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-default ${
                    isHighlighted
                      ? 'bg-white/10 border-[#06B6D4]/50'
                      : 'bg-[#080D1B]/75 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center space-x-1.5 font-semibold text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.meta.dot}`} />
                      <span>{item.meta.label}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{item.percent}%</span>
                  </div>
                  <p className="text-lg font-extrabold text-white mt-1 font-mono tabular-nums">
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRIORITY CONTROL CENTER (Focal Triage Matrix: AI Urgency vs Final Admin Priority) */}
      <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 shadow-lg overflow-hidden">
        {/* Dark Midnight Command Header Strip */}
        <div className="bg-gradient-to-r from-[#080D1B] via-[#101A30] to-[#1A1446] px-5 sm:px-6 py-4 text-[#F8FAFC] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/35 text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Laporan Mendesak &amp; Pengelolaan Prioritas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/35">
                AI &amp; Admin
              </span>
            </div>
          </div>

          {/* Priority Filter Console Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'Critical', label: 'Kritis' },
              { key: 'High', label: 'Tinggi' },
              { key: 'Medium', label: 'Sedang' },
              { key: 'Low', label: 'Rendah' },
              { key: 'UNASSIGNED_PRIORITY', label: 'Belum Ditetapkan' },
            ].map((tab) => {
              const isActive = priorityFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPriorityFilter(tab.key)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white shadow-sm'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono opacity-80">({priorityCounts[tab.key]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column Legend Header (Desktop) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-5">Laporan</div>
          <div className="col-span-2">Rekomendasi Tingkat Urgensi AI</div>
          <div className="col-span-2">Prioritas Akhir Admin</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Tindakan</div>
        </div>

        {/* Priority Rows */}
        <div className="p-4 sm:p-5 space-y-3 bg-[#eef2f9]/55">
          {priorityControlList.map((report) => {
            const pStyle = PRIORITY_STYLE[report.effectivePriority] || PRIORITY_STYLE.Low;
            const aiChip = (PRIORITY_STYLE[report.aiUrgency] || PRIORITY_STYLE.Low).chip;
            const adminChip = report.adminPriority
              ? (PRIORITY_STYLE[report.adminPriority] || PRIORITY_STYLE.Low).chip
              : 'bg-amber-50 text-amber-800 border-dashed border-amber-300';
            const isOverridden =
              report.adminPriority && report.adminPriority !== report.aiUrgency;
            const isCritical = report.effectivePriority === 'Critical';

            return (
              <article
                key={report.id}
                className={`rounded-2xl border-[1.5px] border-slate-300/85 hover:border-[#2563EB] p-4 shadow-2xs hover:shadow-md transition-all duration-200 bg-white ${pStyle.rail}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
                  {/* Report ID + Title + Location */}
                  <div className="lg:col-span-5 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#101A30] bg-slate-200/75 px-2 py-0.5 rounded-md">
                        {report.id}
                      </span>
                      {isCritical && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>KRITIS</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </p>
                  </div>

                  {/* AI Recommended Urgency */}
                  <div className="lg:col-span-2 flex lg:block items-center justify-between gap-2">
                    <span className="lg:hidden text-[11px] font-semibold text-slate-500">
                      Rekomendasi AI:
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${aiChip}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                      <span>{PRIORITY_LABELS[report.aiUrgency] || report.aiUrgency}</span>
                    </span>
                  </div>

                  {/* Final Admin Priority */}
                  <div className="lg:col-span-2 flex lg:block items-center justify-between gap-2">
                    <span className="lg:hidden text-[11px] font-semibold text-slate-500">
                      Prioritas Admin:
                    </span>
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${adminChip}`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {report.adminPriority
                            ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                            : 'Belum Ditetapkan'}
                        </span>
                      </span>
                      {isOverridden && (
                        <span className="text-[10px] font-bold text-[#8B5CF6] bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                          Disesuaikan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="lg:col-span-2 flex lg:block items-center justify-between gap-2">
                    <span className="lg:hidden text-[11px] font-semibold text-slate-500">
                      Status:
                    </span>
                    {renderStatusBadge(report.status)}
                  </div>

                  {/* Action */}
                  <div className="lg:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. BOTTOM SPLIT GRID: Technician Workload (6 cols) + Recent Activity Feed (6 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Technician Workload (Midnight Navy Panel) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#101A30] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/35 text-[#06B6D4] flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Beban Kerja Teknisi</h2>
                  <p className="text-[11px] text-slate-400">
                    {technicianStats.available} Tersedia • {technicianStats.onDuty} Sedang Bertugas
                  </p>
                </div>
              </div>

              <Link
                to="/admin/technicians"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {technicians.map((tech) => {
                // Skala kapasitas maksimal simulasi = 3 tugas aktif
                const loadPercent = Math.min(Math.round((tech.activeTasks / 3) * 100), 100);
                const workloadMeta =
                  tech.activeTasks >= 2
                    ? {
                        label: 'Beban Tinggi',
                        badge: 'bg-[#F59E0B]/20 text-amber-300 border-[#F59E0B]/40',
                        bar: 'from-[#F59E0B] to-rose-500',
                      }
                    : tech.activeTasks === 1
                    ? {
                        label: 'Sedang',
                        badge: 'bg-[#2563EB]/25 text-blue-200 border-[#2563EB]/45',
                        bar: 'from-[#2563EB] to-[#06B6D4]',
                      }
                    : {
                        label: 'Tersedia',
                        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35',
                        bar: 'from-emerald-400 to-[#06B6D4]',
                      };

                return (
                  <div
                    key={tech.id}
                    className="p-3.5 rounded-2xl bg-[#080D1B]/85 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {tech.name}
                      </p>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-300">
                          {tech.activeTasks} Aktif
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${workloadMeta.badge}`}
                        >
                          {workloadMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(loadPercent, 8)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${workloadMeta.bar} transition-all duration-500`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 w-9 text-right shrink-0">
                        {loadPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed (Soft White Telemetry Log) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#080D1B] text-[#8B5CF6] flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Aktivitas Terbaru</h2>
              </div>

              <Link
                to="/admin/notifications"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#2563EB] hover:text-[#8B5CF6] transition-colors"
              >
                <span>Notifikasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((act) => {
                const meta = getActivityMeta(act.type);
                const ActIcon = meta.icon;

                return (
                  <div
                    key={act.id}
                    className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border-[1.5px] border-slate-200/90 hover:border-[#2563EB]/50 transition-all"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.badge}`}
                    >
                      <ActIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                          <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            {act.reportId}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {act.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">{act.actor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DETAIL LAPORAN (Command Preview) */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl border-[1.5px] border-slate-300 shadow-2xl overflow-hidden animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#080D1B] via-[#101A30] to-[#1A1446] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold bg-[#06B6D4]/20 text-[#06B6D4] px-2.5 py-1 rounded-lg border border-[#06B6D4]/35">
                  {selectedReport.id}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  Detail Laporan
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

            <div className="p-6 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">{selectedReport.category}</span>
                {renderStatusBadge(selectedReport.status)}
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {selectedReport.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Lokasi</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal Masuk</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.reportedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pelapor</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedReport.reporterName} ({selectedReport.reporterRole})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Teknisi Tertugas</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedReport.assignedTechnician || 'Belum ditugaskan'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-violet-50/60 border border-violet-200">
                  <p className="text-[10px] font-bold uppercase text-[#8B5CF6] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Rekomendasi AI</span>
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {PRIORITY_LABELS[selectedReport.aiUrgency] || selectedReport.aiUrgency}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <p className="text-[10px] font-bold uppercase text-[#2563EB] flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Prioritas Akhir Admin</span>
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {selectedReport.adminPriority
                      ? PRIORITY_LABELS[selectedReport.adminPriority] || selectedReport.adminPriority
                      : 'Belum Ditetapkan'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Deskripsi Kerusakan:</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Analisis Rekomendasi AI:</p>
                <p className="text-slate-800 bg-cyan-50/60 p-3 rounded-xl border border-cyan-200 leading-relaxed">
                  {selectedReport.aiSummary}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.2" />
                <span>
                  Verifikasi penuh, penyesuaian prioritas, dan penugasan teknisi tersedia pada halaman Semua Laporan.
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <Link
                to={`/admin/reports/${selectedReport.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Verifikasi & Detail Penuh
              </Link>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#080D1B] hover:bg-[#101A30] transition-colors cursor-pointer"
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
