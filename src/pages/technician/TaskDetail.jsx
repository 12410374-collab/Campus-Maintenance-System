import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Camera,
  UploadCloud,
  History,
  Sparkles,
  AlertCircle,
  Trash2,
  Tag,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

function createUpdateRecord(authorName, status, notes) {
  const now = new Date();
  const formattedDate = `${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return {
    id: `upd-${Date.now().toString(36)}`,
    timestamp: formattedDate,
    dayString,
    author: `${authorName || 'Rudi Hartono'} (Teknisi)`,
    status,
    notes,
  };
}

export default function TechnicianTaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getTaskById, updateTask } = useTasks();

  const task = getTaskById(id);

  // Form states initialized with task properties
  const [prevId, setPrevId] = useState(task?.id);
  const [status, setStatus] = useState(task?.status || 'In Progress');
  const [repairNotes, setRepairNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(task?.evidencePhoto || null);

  // Form feedback messages (Toast state)
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when viewing a different task ID
  if (task && task.id !== prevId) {
    setPrevId(task.id);
    setStatus(task.status);
    setEvidencePreview(task.evidencePhoto || null);
  }

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (!feedback.message) return;
    const timer = setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  // If task ID is not found
  if (!task) {
    return (
      <div className="space-y-6">
        <Link
          to="/technician/tasks"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tugas</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Laporan Tugas Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Laporan dengan ID <span className="font-mono font-bold text-slate-800">{id}</span> tidak ditemukan atau mungkin telah dipindahkan.
          </p>
          <div className="mt-6">
            <Link
              to="/technician/tasks"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Lihat Daftar Tugas Aktif</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle evidence file selection with type & size validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback({ type: '', message: '' });

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Format file tidak didukung. Silakan gunakan format JPG, PNG, atau WEBP.',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFeedback({
        type: 'error',
        message: 'Ukuran file terlalu besar. Maksimum ukuran file foto bukti adalah 5 MB.',
      });
      return;
    }

    setEvidenceFile(file);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result);
      setFeedback({
        type: 'success',
        message: `Foto bukti "${file.name}" siap diunggah.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEvidence = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    setFeedback({ type: '', message: '' });
  };

  // Submit status update and notes via TaskContext
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!repairNotes.trim()) {
      setFeedback({
        type: 'error',
        message: 'Catatan pekerjaan tidak boleh kosong saat memperbarui progres perbaikan.',
      });
      return;
    }

    if (status === 'Completed' && !evidencePreview) {
      setFeedback({
        type: 'error',
        message: 'Untuk menyelesaikan pekerjaan (Completed), Anda disarankan mengunggah foto bukti hasil perbaikan.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const record = createUpdateRecord(user?.name, status, repairNotes.trim());

      const newUpdate = {
        id: record.id,
        timestamp: record.timestamp,
        author: record.author,
        status: record.status,
        notes: record.notes,
      };

      await updateTask(task.id, {
        status: status,
        repairNotes: repairNotes.trim(),
        evidencePhoto: evidencePreview,
        ...(status === 'Completed'
          ? {
              completedDate: record.timestamp,
              completionDay: record.dayString,
              duration: '1 jam',
            }
          : {}),
        newUpdate,
      });

      setIsSubmitting(false);
      setRepairNotes('');
      setFeedback({
        type: 'success',
        message:
          status === 'Completed'
            ? 'Pekerjaan berhasil diselesaikan! Tugas kini tercatat di Riwayat Perbaikan.'
            : 'Pembaruan tugas berhasil disimpan dan riwayat aktivitas diperbarui.',
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat menyimpan pembaruan tugas. Silakan coba lagi.',
      });
    }
  };

  // Priority Badge Renderer
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Low
          </span>
        );
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (currentStatus) => {
    switch (currentStatus) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'Assigned':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
            Assigned
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification (Pojok Kanan Atas) */}
      {feedback.message && (
        <div
          className={`fixed top-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-2xl border p-4 flex items-start space-x-3 transition-all duration-300 transform translate-y-0 animate-fadeIn ${
            feedback.type === 'error'
              ? 'border-rose-200 border-l-4 border-l-rose-500 bg-rose-50/20'
              : 'border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50/20'
          }`}
          role="alert"
        >
          <div className="shrink-0 mt-0.5">
            {feedback.type === 'error' ? (
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                feedback.type === 'error' ? 'text-rose-800' : 'text-emerald-800'
              }`}
            >
              {feedback.type === 'error' ? 'Pemberitahuan Gagal' : 'Pembaruan Berhasil'}
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {feedback.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <Link
          to="/technician/tasks"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tugas</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Status Tugas:</span>
          {renderStatusBadge(task.status)}
        </div>
      </div>

      {/* Main Title Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                {task.id}
              </span>
              <span className="inline-flex items-center text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                <Tag className="w-3 h-3 mr-1 text-slate-400" />
                {task.category}
              </span>
              {renderPriorityBadge(task.priority)}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {task.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Lokasi Fasilitas: <strong className="text-slate-800">{task.location}</strong></span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 shrink-0 min-w-64">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <User className="w-3.5 h-3.5" />
              <span>Informasi Pelapor</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">{task.reporterName}</p>
            <p className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Dilaporkan pada {task.reportedDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details, Damage Photo, AI Analysis, Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Deskripsi Kerusakan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Deskripsi Laporan Kerusakan</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {task.description}
            </p>
          </div>

          {/* Card: Foto Kerusakan dari Pelapor */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Foto Kerusakan dari Pelapor</span>
              </h2>
              <span className="text-[11px] text-slate-400">Bukti Awal</span>
            </div>

            {task.damagePhoto ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-96 flex items-center justify-center">
                <img
                  src={task.damagePhoto}
                  alt="Foto Kerusakan Fasilitas"
                  className="w-full h-auto max-h-96 object-cover hover:scale-101 transition-transform"
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Tidak ada foto kerusakan yang dilampirkan
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pelapor tidak mengunggah foto awal saat pengajuan laporan. Lakukan inspeksi langsung di lokasi.
                </p>
              </div>
            )}
          </div>

          {/* Card: Rekomendasi Analisis AI (Sesuai Bagian 6 PROJECT_CONTEXT.md) */}
          {task.aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-indigo-100/70">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-indigo-950">
                  Analisis Rekomendasi Awal AI (Gemini)
                </h2>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold ml-auto">
                  Advisory Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-white/80 p-3 rounded-xl border border-indigo-50">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Kategori AI Disarankan
                  </span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                    {task.aiAnalysis.category}
                  </span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-indigo-50">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Tingkat Urgensi AI
                  </span>
                  <span className="font-bold text-indigo-700 text-xs mt-0.5 block">
                    {task.aiAnalysis.urgency} Urgency
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-2">
                <strong>Ringkasan Masalah:</strong> {task.aiAnalysis.summary}
              </p>
              <p className="text-xs text-indigo-900 bg-white/90 p-3 rounded-xl border border-indigo-100">
                <strong>Rekomendasi Pemeliharaan:</strong> {task.aiAnalysis.recommendation}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                *Catatan: Analisis AI bersifat rekomendasi awal. Keputusan prioritas akhir dan instruksi penugasan ditentukan oleh Admin Fasilitas.
              </p>
            </div>
          )}

          {/* Card: Riwayat Aktivitas Pembaruan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Riwayat Aktivitas & Pembaruan</span>
              </h2>
              <span className="text-xs text-slate-400">
                {task.updates?.length || 0} Catatan
              </span>
            </div>

            <div className="space-y-4">
              {task.updates && task.updates.length > 0 ? (
                task.updates.map((upd, idx) => (
                  <div key={upd.id} className="relative pl-6 pb-4 last:pb-0">
                    {/* Vertical timeline line */}
                    {idx !== task.updates.length - 1 && (
                      <span
                        className="absolute left-2.5 top-5 -bottom-2 w-0.5 bg-slate-200"
                        aria-hidden="true"
                      ></span>
                    )}

                    {/* Timeline node */}
                    <span className="absolute left-1 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-600"></span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <span className="font-bold text-slate-900">
                          {upd.author}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {upd.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Status:
                        </span>
                        {renderStatusBadge(upd.status)}
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                        {upd.notes}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada catatan aktivitas pembaruan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Update Form & Evidence Upload */}
        <div className="space-y-6">
          {/* Card: Form Pembaruan Status & Catatan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Perbarui Pekerjaan</span>
            </h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Status Radio / Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ubah Status Perbaikan:
                </label>
                <div className="space-y-2">
                  {[
                    {
                      val: 'Assigned',
                      label: 'Assigned',
                      desc: 'Menunggu pengerjaan di lapangan',
                      icon: ClipboardList,
                    },
                    {
                      val: 'In Progress',
                      label: 'In Progress',
                      desc: 'Sedang dalam pengerjaan teknisi',
                      icon: Clock,
                    },
                    {
                      val: 'Completed',
                      label: 'Completed',
                      desc: 'Perbaikan selesai dan berfungsi baik',
                      icon: CheckCircle2,
                    },
                  ].map((st) => {
                    const isSelected = status === st.val;
                    const Icon = st.icon;
                    return (
                      <label
                        key={st.val}
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={st.val}
                          checked={isSelected}
                          onChange={(e) => setStatus(e.target.value)}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                            <Icon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{st.label}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {st.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Repair Notes Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Pekerjaan Teknisi:
                </label>
                <textarea
                  rows={4}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Jelaskan tindakan teknis yang diambil, suku cadang yang diganti, atau kendala di lapangan..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder-slate-400 bg-slate-50/50 focus:bg-white"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  Catatan akan tercatat pada log riwayat dan dapat dilihat oleh Admin serta pelapor.
                </p>
              </div>

              {/* Upload Foto Bukti Perbaikan */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unggah Bukti Hasil Perbaikan:
                </label>

                {evidencePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={evidencePreview}
                      alt="Preview Bukti Perbaikan"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveEvidence}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                      {evidenceFile ? evidenceFile.name : 'Foto Bukti Siap Diunggah'}
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-indigo-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      Klik untuk memilih foto bukti
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, atau WEBP (Maksimal 5 MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pembaruan Tugas'}
                </span>
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              *Pembaruan tersimpan secara reaktif melalui TaskContext & localStorage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
