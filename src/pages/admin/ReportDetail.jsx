import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Clock,
  ClipboardCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  Check,
  X,
  Info,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_PRIORITY_OPTIONS } from '../../data/mockAdminReports';

const TECH_CATEGORY_LABELS_ID = {
  Electrical: 'Kelistrikan',
  Plumbing: 'Plumbing / Sanitasi',
  Electronics: 'Elektronik',
  Furniture: 'Furniture',
  Infrastructure: 'Infrastruktur / Bangunan',
  Other: 'Lainnya',
};

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

function getPriorityStyle(level, isActive) {
  switch (level) {
    case 'Critical':
      return isActive
        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-950/20'
        : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50';
    case 'High':
      return isActive
        ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-md shadow-amber-950/20'
        : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50';
    case 'Medium':
      return isActive
        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-950/20'
        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50';
    case 'Low':
    default:
      return isActive
        ? 'bg-slate-800 text-white border-slate-800 shadow-md'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50';
  }
}

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getReportById,
    approveReport,
    rejectReport,
    updateReportPriority,
    reanalyzeReportWithAi,
    loading,
  } = useAdmin();

  const report = getReportById(id);

  // Sync local priority selector safely when route parameter changes
  const [trackedId, setTrackedId] = useState(report?.id || null);
  const [selectedPriority, setSelectedPriority] = useState(
    report?.adminPriority || report?.aiUrgency || 'Medium'
  );
  if ((report?.id || null) !== trackedId) {
    setTrackedId(report?.id || null);
    setSelectedPriority(report?.adminPriority || report?.aiUrgency || 'Medium');
  }

  const [feedback, setFeedback] = useState(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  if (loading && !report) {
    return (
      <div className="rounded-3xl bg-white border-[1.5px] border-slate-300 p-12 text-center shadow-sm">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat detail laporan dari server...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-3xl bg-white border-[1.5px] border-slate-300 p-10 text-center space-y-4 shadow-sm animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Laporan Tidak Ditemukan</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          ID Laporan <span className="font-mono font-bold text-slate-800">{id}</span> tidak tersedia dalam daftar laporan saat ini.
        </p>
        <Link
          to="/admin/reports"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Laporan</span>
        </Link>
      </div>
    );
  }

  const isLocked = report.status === 'Completed' || report.status === 'Rejected';
  const isPending = report.status === 'Pending';
  const statusMeta = STATUS_META[report.status] || STATUS_META.Pending;
  const StatusIcon = statusMeta.icon;

  const aiAnalysisData = report.aiAnalysis || {};
  const aiRecommendedCategory =
    aiAnalysisData.adminCategory ||
    TECH_CATEGORY_LABELS_ID[aiAnalysisData.category] ||
    aiAnalysisData.category ||
    report.category;
  const aiSummaryText =
    report.aiSummary || aiAnalysisData.summary || 'Ringkasan analisis AI belum tersedia.';
  const aiUrgencyReason =
    aiAnalysisData.urgencyReason ||
    report.urgencyReason ||
    'Alasan rinci rekomendasi urgensi belum tersedia pada data laporan ini.';
  const aiRecommendationAction =
    aiAnalysisData.recommendation ||
    'Lakukan pemeriksaan awal kondisi fasilitas di lokasi sesuai deskripsi laporan.';
  const isAiInsufficientInfo = Boolean(aiAnalysisData.insufficientInfo);
  const isGeminiSource =
    aiAnalysisData.source === 'gemini' ||
    (Boolean(aiAnalysisData.model) && aiAnalysisData.source !== 'fallback');
  const aiSourceLabel = isGeminiSource
    ? `Gemini AI${aiAnalysisData.model ? ` (${aiAnalysisData.model})` : ''}`
    : 'Fallback Sistem';

  const handleFollowAiRecommendation = () => {
    if (isLocked || !report.aiUrgency) return;
    setSelectedPriority(report.aiUrgency);
  };

  const handleReanalyzeAi = async () => {
    setFeedback(null);
    setIsReanalyzing(true);
    try {
      const result = await reanalyzeReportWithAi(report.id);
      setFeedback({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleApprove = async () => {
    setFeedback(null);
    const result = await approveReport(report.id, selectedPriority, user?.name);
    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleSavePriority = async () => {
    setFeedback(null);
    const result = await updateReportPriority(report.id, selectedPriority, user?.name);
    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleOpenRejectModal = () => {
    setRejectionReason('');
    setRejectionError('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError('Alasan penolakan wajib diisi sebelum mengonfirmasi.');
      return;
    }

    const result = await rejectReport(report.id, rejectionReason, user?.name);
    if (!result.success) {
      setRejectionError(result.message);
      return;
    }

    setShowRejectModal(false);
    setRejectionError('');
    setFeedback({
      type: 'success',
      text: result.message,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. COMMAND TOP HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
        <div
          className="absolute -top-20 -right-12 w-56 h-56 rounded-full bg-[#8B5CF6]/20 blur-[90px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/reports')}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Semua Laporan</span>
              </button>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/35">
                {report.id}
              </span>
              <span
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusMeta.badge}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusMeta.label}</span>
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
              {report.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Action Feedback Banner */}
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
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text} (Tersimpan pada state sesi aktif frontend)</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. TWO-COLUMN DETAIL & COMMAND CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Report Info, Photo, AI Analysis */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata & Deskripsi Kerusakan */}
          <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-3">
              Informasi Laporan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                  <User className="w-3 h-3 text-[#2563EB]" />
                  <span>Pelapor</span>
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  {report.reporterName} ({report.reporterRole})
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Kategori</span>
                </p>
                <p className="font-bold text-slate-900 mt-1">{report.category}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Lokasi Kerusakan</span>
                </p>
                <p className="font-bold text-slate-900 mt-1">{report.location}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-[#06B6D4]" />
                  <span>Tanggal Laporan</span>
                </p>
                <p className="font-bold text-slate-900 mt-1">{report.reportedDate}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">Deskripsi Kerusakan</p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
                {report.description}
              </p>
            </div>

            {report.status === 'Rejected' && report.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border-[1.5px] border-rose-200 space-y-1">
                <p className="text-xs font-extrabold text-rose-800 flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Alasan Penolakan Admin</span>
                </p>
                <p className="text-xs text-rose-700 leading-relaxed">{report.rejectionReason}</p>
              </div>
            )}
          </section>

          {/* Foto Kerusakan */}
          <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                <span>Foto Kerusakan</span>
              </h2>
            </div>

            {report.damagePhoto ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5">
                <img
                  src={report.damagePhoto}
                  alt={`Foto kerusakan ${report.title}`}
                  className="w-full max-h-72 object-cover"
                />
              </div>
            ) : (
              <div className="py-8 px-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-xs text-slate-400">
                Pelapor tidak melampirkan foto kerusakan.
              </div>
            )}
          </section>

          {/* AI Analysis Panel (Midnight Navy Surface) */}
          <section className="rounded-3xl bg-[#101A30] border border-violet-500/35 text-[#F8FAFC] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-violet-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Analisis AI</h2>
                  <p className="text-[10.5px] text-slate-400">
                    Sumber: <span className="font-semibold text-cyan-300">{aiSourceLabel}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                    isGeminiSource
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/35'
                      : 'bg-amber-500/15 text-amber-200 border-amber-400/35'
                  }`}
                >
                  {isGeminiSource ? 'Gemini AI' : 'Fallback'}
                </span>
                <button
                  type="button"
                  onClick={handleReanalyzeAi}
                  disabled={isReanalyzing}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isReanalyzing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-[#06B6D4]" />
                  )}
                  <span>{isReanalyzing ? 'Menganalisis...' : 'Analisis Ulang AI'}</span>
                </button>
              </div>
            </div>

            {isAiInsufficientInfo && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-xs text-amber-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  Informasi laporan belum lengkap. Disarankan konfirmasi atau inspeksi manual di lokasi sebelum penugasan.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#080D1B]/75 border border-white/10">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Kategori Rekomendasi AI
                </p>
                <p className="text-sm font-bold text-white mt-1">{aiRecommendedCategory}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#080D1B]/75 border border-violet-400/30">
                <p className="text-[10px] font-bold uppercase text-violet-300">
                  Rekomendasi Tingkat Urgensi AI
                </p>
                <p className="text-sm font-bold text-white mt-1">
                  {PRIORITY_LABELS[report.aiUrgency] || report.aiUrgency}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#080D1B]/60 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Ringkasan Masalah
                </p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {aiSummaryText}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080D1B]/60 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold uppercase text-violet-300">
                  Alasan Rekomendasi Urgensi
                </p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {aiUrgencyReason}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080D1B]/60 border border-cyan-500/25 space-y-1">
                <p className="text-[10px] font-bold uppercase text-[#06B6D4]">
                  Rekomendasi Tindakan Awal
                </p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {aiRecommendationAction}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#06B6D4] flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>AI hanya memberikan rekomendasi. Keputusan prioritas akhir berada pada Admin.</span>
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN (5 cols): Priority Management & Verification Actions */}
        <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          {/* AI vs Admin Comparison & Priority Management */}
          <section className="rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#06B6D4]" />
                <h2 className="text-sm font-bold text-white">Pengelolaan Prioritas</h2>
              </div>
              {isLocked && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  <Lock className="w-3 h-3" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>

            {/* Separate Display: AI Recommended vs Current Admin Final */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#101A30] border border-violet-400/30">
                <p className="text-[10px] font-bold uppercase text-violet-300 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Rekomendasi Tingkat Urgensi AI</span>
                </p>
                <p className="text-base font-extrabold text-white mt-1">
                  {PRIORITY_LABELS[report.aiUrgency] || report.aiUrgency}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#101A30] border border-[#06B6D4]/35">
                <p className="text-[10px] font-bold uppercase text-[#06B6D4] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Prioritas Akhir Admin</span>
                </p>
                <p className="text-base font-extrabold text-white mt-1">
                  {report.adminPriority
                    ? PRIORITY_LABELS[report.adminPriority] || report.adminPriority
                    : 'Belum Ditetapkan'}
                </p>
              </div>
            </div>

            {/* Selector 4 Tingkat Prioritas */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-300">
                  Tetapkan Prioritas Akhir Admin:
                </p>
                <button
                  type="button"
                  disabled={isLocked || !report.aiUrgency || selectedPriority === report.aiUrgency}
                  onClick={handleFollowAiRecommendation}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-200 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/35 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ikuti Rekomendasi AI</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ADMIN_PRIORITY_OPTIONS.map((level) => {
                  const isActive = selectedPriority === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setSelectedPriority(level)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 ${getPriorityStyle(
                        level,
                        isActive
                      )}`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{PRIORITY_LABELS[level] || level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={isLocked || report.adminPriority === selectedPriority}
              onClick={handleSavePriority}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-blue-950/40"
            >
              Simpan Prioritas Admin ({PRIORITY_LABELS[selectedPriority] || selectedPriority})
            </button>
          </section>

          {/* Report Verification Controls */}
          <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                Verifikasi Laporan
              </h2>
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.badge}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusMeta.label}</span>
              </span>
            </div>

            {isLocked ? (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-start space-x-2.5">
                <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Verifikasi Terkunci</p>
                  <p className="mt-0.5 text-slate-600">
                    Laporan berstatus <strong>{statusMeta.label}</strong> tidak dapat diverifikasi ulang.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isPending ? (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/15 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui Laporan</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center space-x-2">
                      <ClipboardCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {report.assignedTechnician
                          ? `Telah ditugaskan kepada ${report.assignedTechnician} (${statusMeta.label}).`
                          : `Laporan telah disetujui (${statusMeta.label}) dan siap ditugaskan.`}
                      </span>
                    </div>

                    {report.status === 'Approved' && !report.assignedTechnician && (
                      <Link
                        to={`/admin/assignments?reportId=${report.id}`}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-md transition-all"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Tugaskan Teknisi</span>
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenRejectModal}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border-[1.5px] border-rose-300 hover:border-rose-600 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Laporan</span>
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* CONFIRMATION DIALOG MODAL UNTUK REJECT */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowRejectModal(false)}
        >
          <form
            onSubmit={handleConfirmReject}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl border-[1.5px] border-rose-200 shadow-2xl overflow-hidden animate-fadeInUp"
          >
            <div className="bg-gradient-to-r from-[#080D1B] via-[#101A30] to-rose-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4.5 h-4.5 text-rose-400" />
                <h2 className="text-sm font-bold">Konfirmasi Penolakan Laporan</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                Apakah Anda yakin ingin menolak laporan{' '}
                <strong className="font-mono">{report.id}</strong>? Laporan yang ditolak tidak dapat diverifikasi ulang.
              </div>

              <div>
                <label
                  htmlFor="rejection-reason"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Alasan Penolakan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError('');
                  }}
                  placeholder="Tuliskan alasan penolakan yang jelas untuk pelapor..."
                  className={`w-full p-3 text-xs rounded-xl border-[1.5px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                    rejectionError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                      : 'border-slate-300 focus:border-[#2563EB] focus:ring-blue-500/15'
                  }`}
                />
                {rejectionError && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{rejectionError}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
