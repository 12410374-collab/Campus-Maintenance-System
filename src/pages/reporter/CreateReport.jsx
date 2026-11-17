import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Camera,
  UploadCloud,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Check,
  MapPin,
  FileText,
  Zap,
  Droplets,
  Monitor,
  Armchair,
  Building2,
  Wrench,
  GraduationCap,
  BookOpen,
  Briefcase,
  User,
  ChevronRight,
  Image as ImageIcon,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useAdmin } from '../../context/AdminContext';
import { saveEvidenceImage } from '../../utils/imageStorage';
import { formatWitaTimestamp, formatWitaIsoDate } from '../../utils/dateFormat';
import { analyzeMaintenanceReport } from '../../services/aiService';
import { getAllReports, createReport } from '../../services/reportService';
import {
  createActivity,
  createNotification,
} from '../../services/activityNotificationService';

const URGENCY_TO_PRIORITY_MAP = {
  Rendah: 'Low',
  Sedang: 'Medium',
  Tinggi: 'High',
  Kritis: 'Critical',
};

const PRIORITY_TO_URGENCY_MAP = {
  Low: 'Rendah',
  Medium: 'Sedang',
  High: 'Tinggi',
  Critical: 'Kritis',
};

const CATEGORY_TO_TECH_MAP = {
  Kelistrikan: 'Electrical',
  'Plumbing / Sanitasi': 'Plumbing',
  Elektronik: 'Electronics',
  Furniture: 'Furniture',
  'Infrastruktur / Bangunan': 'Infrastructure',
  Lainnya: 'Other',
};

const CATEGORIES = [
  { id: 'Kelistrikan', label: 'Kelistrikan', icon: Zap, tint: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Plumbing / Sanitasi', label: 'Plumbing / Sanitasi', icon: Droplets, tint: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'Elektronik', label: 'Elektronik', icon: Monitor, tint: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Furniture', label: 'Furniture', icon: Armchair, tint: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'Infrastruktur / Bangunan', label: 'Infrastruktur / Bangunan', icon: Building2, tint: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Lainnya', label: 'Lainnya', icon: Wrench, tint: 'text-slate-600 bg-slate-100 border-slate-200' },
];

const URGENCY_LEVELS = [
  {
    id: 'Rendah',
    label: 'Rendah',
    desc: 'Tidak mengganggu aktivitas utama',
    activeClass: 'border-slate-500 bg-slate-50 text-slate-900 ring-2 ring-slate-400/20',
    dotClass: 'bg-slate-500',
  },
  {
    id: 'Sedang',
    label: 'Sedang',
    desc: 'Perlu penanganan terjadwal',
    activeClass: 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20',
    dotClass: 'bg-blue-600',
  },
  {
    id: 'Tinggi',
    label: 'Tinggi',
    desc: 'Mengganggu kegiatan perkuliahan/kerja',
    activeClass: 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-purple-500/20',
    dotClass: 'bg-indigo-600',
  },
  {
    id: 'Kritis',
    label: 'Kritis',
    desc: 'Berbahaya / butuh penanganan darurat',
    activeClass: 'border-rose-600 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/20',
    dotClass: 'bg-rose-600',
  },
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function generateNextReportId(existingReports = []) {
  const year = new Date().getFullYear();
  let maxNum = 112;
  existingReports.forEach((item) => {
    const match = typeof item?.id === 'string' && item.id.match(/^RPT-\d{4}-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return `RPT-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export default function CreateReport() {
  const { user, role } = useAuth();
  const { refreshTasks } = useTasks();
  const { refreshAdminData } = useAdmin();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Sedang');

  // Photo upload states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');

  // Validation & submission states
  const [fieldErrors, setFieldErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPreview, setSubmittedPreview] = useState(null);

  // AI advisory analysis states
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiPreviewResult, setAiPreviewResult] = useState(null);
  const [aiPreviewKey, setAiPreviewKey] = useState('');
  const [aiPreviewError, setAiPreviewError] = useState('');

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

  // Live step progress calculation for form-centric UX
  const stepStates = useMemo(() => {
    const step1Done = title.trim().length >= 5 && Boolean(category);
    const step2Done = location.trim().length > 0;
    const step3Done = description.trim().length >= 10 && Boolean(urgency);
    const step4Done = Boolean(photoPreview);

    const requiredCompleted = [step1Done, step2Done, step3Done].filter(Boolean).length;
    const progressPercent = Math.round(
      ((requiredCompleted + (step4Done ? 0.5 : 0)) / 3.5) * 100
    );

    return {
      steps: [
        { num: 1, label: 'Informasi Laporan', done: step1Done, optional: false },
        { num: 2, label: 'Lokasi Kerusakan', done: step2Done, optional: false },
        { num: 3, label: 'Deskripsi & Urgensi', done: step3Done, optional: false },
        { num: 4, label: 'Lampiran Foto', done: step4Done, optional: true },
      ],
      requiredCompleted,
      progressPercent,
    };
  }, [title, category, location, description, urgency, photoPreview]);

  // Clear single field error on change
  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (formAlert) setFormAlert('');
  };

  // Handle photo upload validation & preview
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError('Format file tidak didukung. Gunakan gambar berformat JPG, PNG, atau WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setPhotoError('Ukuran gambar melebihi batas maksimal 5 MB.');
      e.target.value = '';
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate required inputs
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Judul laporan wajib diisi.';
    } else if (title.trim().length < 5) {
      errors.title = 'Judul laporan terlalu singkat (minimal 5 karakter).';
    }

    if (!category) {
      errors.category = 'Silakan pilih kategori kerusakan.';
    }

    if (!location.trim()) {
      errors.location = 'Lokasi kerusakan wajib diisi.';
    }

    if (!description.trim()) {
      errors.description = 'Deskripsi kerusakan wajib diisi.';
    } else if (description.trim().length < 10) {
      errors.description = 'Berikan deskripsi minimal 10 karakter agar mudah ditindaklanjuti.';
    }

    if (!urgency) {
      errors.urgency = 'Silakan pilih tingkat urgensi.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildAiInputKey = (rawTitle, rawLocation, rawDescription) =>
    `${String(rawTitle || '').trim()}::${String(rawLocation || '').trim()}::${String(rawDescription || '').trim()}`;

  const currentAiInputKey = buildAiInputKey(title, location, description);
  const activeAiPreview =
    aiPreviewResult && aiPreviewKey === currentAiInputKey ? aiPreviewResult : null;

  // Analisis opsional dengan Gemini AI sebelum laporan dikirim (advisory only)
  const handleAnalyzeWithAi = async () => {
    setAiPreviewError('');

    const cleanTitle = title.trim();
    const cleanLocation = location.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 5 || cleanDescription.length < 10) {
      setAiPreviewError(
        'Isi judul (minimal 5 karakter) dan deskripsi kerusakan (minimal 10 karakter) terlebih dahulu untuk menjalankan analisis AI.'
      );
      return;
    }

    setIsAnalyzingAi(true);
    try {
      const result = await analyzeMaintenanceReport({
        title: cleanTitle,
        description: cleanDescription,
        location: cleanLocation,
        category,
        urgency,
      });

      setAiPreviewResult(result);
      setAiPreviewKey(buildAiInputKey(cleanTitle, cleanLocation, cleanDescription));
    } catch (err) {
      console.warn('Analisis AI pratinjau gagal (pengajuan laporan biasa tetap tersedia):', err);
      setAiPreviewError(
        err?.message ||
          'Layanan AI sedang tidak tersedia. Anda tetap dapat mengirim laporan seperti biasa.'
      );
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Terapkan saran kategori & urgensi AI ke form atas persetujuan pelapor
  const handleApplyAiSuggestion = () => {
    if (!activeAiPreview) return;

    const matchedCategory = CATEGORIES.find((c) => c.id === activeAiPreview.adminCategory);
    if (matchedCategory) {
      setCategory(matchedCategory.id);
      clearFieldError('category');
    }

    const mappedUrgencyId = PRIORITY_TO_URGENCY_MAP[activeAiPreview.urgency];
    if (mappedUrgencyId) {
      setUrgency(mappedUrgencyId);
      clearFieldError('urgency');
    }
  };

  // Submit handler terhubung ke POST /reports + sinkronisasi lintas Context
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormAlert('');

    if (!validateForm()) {
      setFormAlert('Mohon lengkapi seluruh kolom wajib yang ditandai sebelum mengirim laporan.');
      return;
    }

    if (!user?.identifier) {
      setFormAlert('Sesi pengguna tidak ditemukan. Silakan masuk ulang terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingReports = await getAllReports();
      const reportId = generateNextReportId(existingReports);

      const now = new Date();
      const reportedDate = formatWitaTimestamp(now);
      const reportedIsoDate = formatWitaIsoDate(now);
      const mappedPriority = URGENCY_TO_PRIORITY_MAP[urgency] || 'Medium';
      const mappedTechCategory = CATEGORY_TO_TECH_MAP[category] || 'Other';

      // Simpan foto kerusakan di IndexedDB terlebih dahulu agar tidak mengirim base64 besar ke db.json
      let persistedDamagePhoto = null;
      if (photoPreview && typeof photoPreview === 'string' && photoPreview.startsWith('data:image/')) {
        const damageKey = `damage_${reportId}`;
        const savedImage = await saveEvidenceImage(damageKey, photoPreview);
        if (!savedImage) {
          throw new Error('Gagal menyimpan foto kerusakan ke penyimpanan lokal browser.');
        }
        persistedDamagePhoto = `idb:${damageKey}`;
      }

      const cleanTitle = title.trim();
      const cleanLocation = location.trim();
      const cleanDescription = description.trim();
      const submitAiKey = buildAiInputKey(cleanTitle, cleanLocation, cleanDescription);

      // Jalankan analisis AI secara non-blocking terhadap keberhasilan kirim laporan:
      // bila AI gagal atau proxy mati, fallback ke ringkasan standar agar pelapor tetap bisa mengirim laporan.
      let geminiAnalysis =
        aiPreviewResult && aiPreviewKey === submitAiKey ? aiPreviewResult : null;

      if (!geminiAnalysis) {
        try {
          geminiAnalysis = await analyzeMaintenanceReport({
            title: cleanTitle,
            description: cleanDescription,
            location: cleanLocation,
            category,
            urgency,
          });
        } catch (aiErr) {
          console.warn(
            'Analisis AI gagal saat submit, melanjutkan pengiriman laporan dengan mode fallback:',
            aiErr
          );
          geminiAnalysis = null;
        }
      }

      const usedFallbackAi = !geminiAnalysis;
      const fallbackSummary = `Laporan baru kategori ${category} dengan tingkat urgensi ${urgency} di ${cleanLocation}.`;
      const fallbackUrgencyReason = `Mengacu pada tingkat urgensi awal ${urgency} yang dipilih pelapor untuk kategori ${category}.`;
      const resolvedAiUrgency = geminiAnalysis?.urgency || mappedPriority;
      const resolvedAiSummary = geminiAnalysis?.summary || fallbackSummary;
      const resolvedAiAnalysis = geminiAnalysis
        ? {
            category: geminiAnalysis.category,
            adminCategory: geminiAnalysis.adminCategory,
            urgency: geminiAnalysis.urgency,
            urgencyReason: geminiAnalysis.urgencyReason || fallbackUrgencyReason,
            summary: geminiAnalysis.summary,
            recommendation: geminiAnalysis.recommendation,
            insufficientInfo: Boolean(geminiAnalysis.insufficientInfo),
            advisoryOnly: true,
            model: geminiAnalysis.model,
            source: 'gemini',
          }
        : {
            category: mappedTechCategory,
            adminCategory: category,
            urgency: mappedPriority,
            urgencyReason: fallbackUrgencyReason,
            summary: fallbackSummary,
            recommendation: `Tinjau laporan ${reportId} di ${cleanLocation} dan lakukan pemeriksaan awal.`,
            insufficientInfo: false,
            advisoryOnly: true,
            source: 'fallback',
          };

      const reportPayload = {
        id: reportId,
        title: cleanTitle,
        category,
        techCategory: mappedTechCategory,
        location: cleanLocation,
        reporterId: user.identifier,
        reporterName: user.name || 'Pelapor Kampus',
        reporterRole: roleMeta.label,
        reportedDate,
        reportedIsoDate,
        status: 'Pending',
        aiUrgency: resolvedAiUrgency,
        adminPriority: null,
        priority: mappedPriority,
        urgency,
        assignedTechnicianId: null,
        assignedTechnician: null,
        assignedByAdmin: false,
        rejectionReason: null,
        statusNote: 'Laporan telah diterima sistem dan sedang menunggu verifikasi Admin Fasilitas.',
        damagePhoto: persistedDamagePhoto,
        evidencePhoto: null,
        aiSummary: resolvedAiSummary,
        aiAnalysis: resolvedAiAnalysis,
        description: cleanDescription,
        repairNotes: '',
        completedDate: null,
        completionDay: null,
        duration: '',
        updates: [
          {
            id: `upd-${Date.now()}`,
            timestamp: reportedDate,
            author: `${user.name || 'Pelapor'} (${roleMeta.label})`,
            status: 'Pending',
            notes: 'Laporan kerusakan dikirim oleh pelapor dan menunggu verifikasi Admin.',
          },
        ],
      };

      // Kirim ke JSON Server — jangan tampilkan berhasil jika POST gagal
      const createdReport = await createReport(reportPayload);

      // Catat aktivitas masuk & notifikasi Admin + Pelapor secara non-blocking
      const stamp = Date.now();
      const isCriticalNotice =
        resolvedAiUrgency === 'Critical' || mappedPriority === 'Critical';
      await Promise.allSettled([
        createActivity({
          id: `ACT-${stamp}`,
          type: 'incoming',
          title: 'Laporan baru diterima',
          detail: `${cleanTitle} (${cleanLocation}) menunggu verifikasi Admin.`,
          reportId: createdReport.id,
          actor: `${user.name} (${roleMeta.label})`,
          timestamp: reportedDate,
        }),
        createNotification({
          id: `NTF-ADM-${stamp}`,
          recipientId: 'admin',
          targetRole: 'Admin',
          type: isCriticalNotice ? 'critical_ai' : 'incoming',
          title: isCriticalNotice
            ? 'Laporan baru dengan urgensi kritis'
            : 'Laporan baru diterima',
          message: `${cleanTitle} (${cleanLocation}) diajukan oleh ${user.name}.`,
          reportId: createdReport.id,
          actor: `${user.name} (${roleMeta.label})`,
          timestamp: reportedDate,
          isRead: false,
        }),
        createNotification({
          id: `NTF-RPT-${stamp + 1}`,
          recipientId: user.identifier,
          targetRole: 'Reporter',
          type: 'submitted',
          title: 'Laporan Berhasil Dikirim',
          message: `Laporan "${cleanTitle}" telah diterima sistem dengan status Pending menunggu verifikasi Admin.`,
          reportId: createdReport.id,
          actor: user.name || 'Pelapor',
          timestamp: reportedDate,
          isRead: false,
        }),
      ]);

      // Sinkronkan TaskContext & AdminContext dari sumber tunggal db.json tanpa duplikasi
      await Promise.allSettled([refreshTasks(), refreshAdminData()]);

      setSubmittedPreview({
        referenceCode: createdReport.id,
        submittedAt: createdReport.reportedDate || reportedDate,
        reporterName: createdReport.reporterName,
        reporterId: createdReport.reporterId,
        reporterRole: roleMeta.label,
        title: createdReport.title,
        category: createdReport.category,
        location: createdReport.location,
        description: createdReport.description,
        urgency,
        aiSummary: resolvedAiSummary,
        aiRecommendation: resolvedAiAnalysis.recommendation,
        aiUrgencyLabel: PRIORITY_TO_URGENCY_MAP[resolvedAiUrgency] || urgency,
        usedFallbackAi,
        hasPhoto: Boolean(photoPreview),
        photoName: photoFile?.name || null,
        photoPreview,
      });
    } catch (err) {
      console.error('Gagal mengirim laporan ke backend:', err);
      setFormAlert(
        err?.message ||
          'Gagal mengirim laporan ke server backend. Pastikan JSON Server sedang berjalan dan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setCategory('');
    setLocation('');
    setDescription('');
    setUrgency('Sedang');
    handleRemovePhoto();
    setFieldErrors({});
    setFormAlert('');
    setSubmittedPreview(null);
    setIsAnalyzingAi(false);
    setAiPreviewResult(null);
    setAiPreviewKey('');
    setAiPreviewError('');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Compact Form-Centric Page Header (Tanpa Hero Banner Besar) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b-[1.5px] border-indigo-200/75">
        <div>
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5" aria-label="Breadcrumb">
            <Link to="/reporter" className="hover:text-indigo-600 font-medium transition-colors">
              Dashboard Pelapor
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-700">Buat Laporan</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Buat Laporan Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Laporkan kerusakan fasilitas kampus untuk segera ditindaklanjuti.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/reporter')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-indigo-50/70 hover:text-indigo-700 border-[1.5px] border-indigo-200/80 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Konfirmasi Setelah Pengiriman Berhasil */}
      {submittedPreview ? (
        <section className="bg-white/95 rounded-3xl border border-emerald-200/90 p-6 sm:p-8 shadow-sm animate-fadeInUp">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Laporan Berhasil Dikirim
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Laporan kerusakan Anda telah tersimpan di sistem dengan status Pending dan siap diverifikasi oleh Admin Sarana &amp; Prasarana.
              </p>
            </div>

            {/* Ringkasan Laporan Terkirim */}
            <div className="text-left rounded-2xl bg-[#F8FAFE] border border-indigo-100 p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {submittedPreview.referenceCode}
                </span>
                <span className="text-slate-500">{submittedPreview.submittedAt}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Judul Laporan</p>
                  <p className="font-bold text-slate-900 mt-0.5">{submittedPreview.title}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Kategori & Urgensi</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {submittedPreview.category} • Urgensi {submittedPreview.urgency}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Lokasi Fasilitas</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{submittedPreview.location}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Pelapor</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {submittedPreview.reporterName} ({submittedPreview.reporterRole})
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400">Deskripsi Kerusakan</p>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{submittedPreview.description}</p>
              </div>

              {submittedPreview.aiSummary && (
                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-3 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-indigo-800">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {submittedPreview.usedFallbackAi
                          ? 'Ringkasan Sistem (Cadangan Non-AI)'
                          : 'Ringkasan Analisis AI (Advisory)'}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                      Urgensi AI: {submittedPreview.aiUrgencyLabel}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-700 leading-relaxed">
                    {submittedPreview.aiSummary}
                  </p>
                  {submittedPreview.aiRecommendation && (
                    <p className="text-[11px] text-indigo-900/90 leading-relaxed">
                      <strong>Tindakan Awal:</strong> {submittedPreview.aiRecommendation}
                    </p>
                  )}
                </div>
              )}

              {submittedPreview.photoPreview && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Lampiran Foto ({submittedPreview.photoName})
                  </p>
                  <img
                    src={submittedPreview.photoPreview}
                    alt="Lampiran laporan kerusakan"
                    className="h-32 w-auto rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Buat Laporan Lain</span>
              </button>

              <Link
                to="/reporter"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Dashboard</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Interactive Step Progress Indicator */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-[1.5px] border-indigo-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-bold text-slate-800">Progres Formulir</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
                {stepStates.requiredCompleted}/3 Wajib
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
              <div
                style={{ width: `${stepStates.progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {stepStates.steps.map((st) => (
                <div
                  key={st.num}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border-[1.5px] text-xs transition-colors ${
                    st.done
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-[#F8FAFE] border-slate-200/90 text-slate-500'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      st.done
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st.done ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                  </span>
                  <span className="truncate text-[11px]">
                    {st.label}
                    {st.optional && <span className="text-[10px] opacity-65"> (Ops)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Workspace Grid: Left Grouped Sections (8 cols) + Right Live Summary Panel (4 cols) */}
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              {formAlert && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-rose-50 border-[1.5px] border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{formAlert}</p>
                </div>
              )}

              {/* BAGIAN 1: Informasi Laporan */}
              <section className="bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200/80">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0B132B] to-indigo-700 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">Informasi Laporan</h2>
                </div>

                <div>
                  <label htmlFor="report-title" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Judul Laporan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="report-title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      clearFieldError('title');
                    }}
                    placeholder="Contoh: AC Ruang Kuliah 204 Bocor & Tidak Dingin"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-[#F8FAFE] focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium ${
                      fieldErrors.title
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-purple-600 focus:ring-purple-500/15'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Kategori Kerusakan <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategory(cat.id);
                            clearFieldError('category');
                          }}
                          aria-pressed={isSelected}
                          className={`flex items-center space-x-2.5 p-3 rounded-2xl border-[1.5px] text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-purple-500/20 text-indigo-950 shadow-xs'
                              : 'border-slate-200/90 bg-[#F8FAFE] hover:bg-white hover:border-indigo-300 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-transparent'
                                : cat.tint
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-snug">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.category && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1.5">{fieldErrors.category}</p>
                  )}
                </div>
              </section>

              {/* BAGIAN 2: Lokasi Kerusakan */}
              <section className="bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200/80">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">Lokasi Kerusakan</h2>
                </div>

                <div>
                  <label htmlFor="report-location" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Lokasi <span className="text-rose-500">*</span>
                  </label>
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="report-location"
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        clearFieldError('location');
                      }}
                      placeholder="Contoh: GK2 - Lantai 2, Lab Jaringan Komputer"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-[#F8FAFE] focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium ${
                        fieldErrors.location
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                          : 'border-slate-200 focus:border-purple-600 focus:ring-purple-500/15'
                      }`}
                    />
                  </div>
                  {fieldErrors.location && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.location}</p>
                  )}
                </div>
              </section>

              {/* BAGIAN 3: Deskripsi Kerusakan & Urgensi */}
              <section className="bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200/80">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">Deskripsi & Urgensi</h2>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="report-description" className="block text-xs font-bold text-slate-800">
                      Deskripsi Kerusakan <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{description.length} karakter</span>
                  </div>
                  <textarea
                    id="report-description"
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearFieldError('description');
                    }}
                    placeholder="Jelaskan kondisi kerusakan secara spesifik agar teknisi dapat menyiapkan penanganan yang tepat..."
                    className={`w-full p-3.5 text-xs sm:text-sm rounded-xl border bg-[#F8FAFE] focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium ${
                      fieldErrors.description
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-purple-600 focus:ring-purple-500/15'
                    }`}
                  />
                  {fieldErrors.description && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.description}</p>
                  )}

                  {/* Asisten Analisis AI (Advisory Only — tidak mengubah alur wajib laporan) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>
                          Dapatkan saran kategori, urgensi, dan ringkasan awal otomatis dari AI.
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={handleAnalyzeWithAi}
                        disabled={isAnalyzingAi || isSubmitting}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isAnalyzingAi ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span>{isAnalyzingAi ? 'Menganalisis...' : 'Analisis dengan AI'}</span>
                      </button>
                    </div>

                    {aiPreviewError && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{aiPreviewError}</span>
                      </div>
                    )}

                    {activeAiPreview && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white border border-indigo-200/80 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center space-x-1.5 font-bold text-indigo-900">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Rekomendasi Awal AI (Advisory)</span>
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-white text-indigo-700 border border-indigo-200">
                              {activeAiPreview.adminCategory}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Urgensi: {activeAiPreview.urgencyLabelId}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11.5px] text-slate-700 leading-relaxed">
                          {activeAiPreview.summary}
                        </p>

                        <p className="text-[11px] text-indigo-900/90 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                          <strong>Saran Tindakan Awal:</strong> {activeAiPreview.recommendation}
                        </p>

                        {activeAiPreview.insufficientInfo && (
                          <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
                            Informasi laporan masih terbatas; disarankan melengkapi detail kerusakan atau dilakukan inspeksi manual.
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[10.5px] text-slate-500">
                            Keputusan akhir prioritas tetap ditetapkan oleh Admin.
                          </span>
                          <button
                            type="button"
                            onClick={handleApplyAiSuggestion}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Terapkan ke Form</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      Tingkat Urgensi <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {URGENCY_LEVELS.map((lvl) => {
                      const isSelected = urgency === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            setUrgency(lvl.id);
                            clearFieldError('urgency');
                          }}
                          aria-pressed={isSelected}
                          className={`flex items-start space-x-2.5 p-3 rounded-2xl border-[1.5px] text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? lvl.activeClass
                              : 'border-slate-200/90 bg-[#F8FAFE] hover:bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${lvl.dotClass}`} />
                          <div>
                            <p className="text-xs font-bold leading-tight">{lvl.label}</p>
                            <p className="text-[11px] opacity-75 mt-0.5">{lvl.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.urgency && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.urgency}</p>
                  )}
                </div>
              </section>

              {/* BAGIAN 4: Lampiran Foto Kerusakan */}
              <section className="bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Lampiran Foto</h2>
                      <p className="text-[11px] text-slate-400">Opsional • JPG, PNG, WEBP (Maks. 5 MB)</p>
                    </div>
                  </div>
                  <Camera className="w-4 h-4 text-purple-500" />
                </div>

                {photoError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.2" />
                    <span>{photoError}</span>
                  </div>
                )}

                {photoPreview ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3.5 rounded-2xl bg-[#F8FAFE] border border-indigo-200/80">
                    <div className="sm:col-span-5 rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5">
                      <img
                        src={photoPreview}
                        alt="Preview kerusakan fasilitas"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{photoFile?.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {photoFile ? `${(photoFile.size / 1024 / 1024).toFixed(2)} MB` : ''} • Siap dilampirkan
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Ganti Foto</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="group flex flex-col items-center justify-center py-7 px-6 rounded-2xl border-2 border-dashed border-indigo-300/80 hover:border-purple-500 bg-gradient-to-b from-[#F8FAFE] to-indigo-50/35 hover:from-indigo-50/40 hover:to-purple-50/45 transition-all cursor-pointer text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200/80 shadow-xs text-indigo-600 group-hover:text-purple-600 group-hover:scale-105 transition-all flex items-center justify-center mb-2.5">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      Pilih Foto Kerusakan
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, atau WEBP (Maks. 5 MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </section>
            </div>

            {/* Kolom Kanan (4 cols sticky): Panel Ringkasan Pengajuan & Identitas Pelapor */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="rounded-3xl bg-white/95 backdrop-blur-sm border-[1.5px] border-indigo-200/80 shadow-sm overflow-hidden">
                {/* Dark Navy Summary Header */}
                <div className="bg-gradient-to-br from-[#080E21] via-[#131842] to-[#261452] p-5 text-white relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-200">
                        <ClipboardList className="w-4 h-4 text-purple-300" />
                        <span>Ringkasan Pengajuan</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/15">
                        Live Preview
                      </span>
                    </div>

                    {/* Identitas Pelapor Otomatis */}
                    <div className="rounded-2xl bg-white/[0.08] border border-white/15 p-3 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 flex items-center space-x-1">
                          <User className="w-2.5 h-2.5" />
                          <span>Pelapor</span>
                        </p>
                        <p className="text-xs font-bold text-white truncate">
                          {user?.name || 'Pengguna'}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-indigo-200">
                            {user?.identifier || '-'}
                          </span>
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleMeta.badge}`}
                          >
                            <RoleIcon className="w-2.5 h-2.5" />
                            <span>{roleMeta.label}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Summary Body */}
                <div className="p-5 space-y-3.5 text-xs">
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFE] border-[1.5px] border-slate-200/90">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Judul Laporan</p>
                      <p className="font-semibold text-slate-800 mt-0.5 truncate">
                        {title.trim() || 'Belum diisi'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-[#F8FAFE] border-[1.5px] border-slate-200/90">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Kategori</p>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">
                          {category || 'Belum dipilih'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F8FAFE] border-[1.5px] border-slate-200/90">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Urgensi</p>
                        <p className="font-semibold text-indigo-700 mt-0.5 truncate">{urgency}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFE] border-[1.5px] border-slate-200/90">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Lokasi</p>
                      <p className="font-semibold text-slate-800 mt-0.5 truncate">
                        {location.trim() || 'Belum diisi'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFE] border-[1.5px] border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Lampiran Foto</span>
                      <span className={`font-semibold ${photoPreview ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {photoPreview ? '1 Foto Terlampir' : 'Belum ada'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2.5 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0B132B] via-indigo-900 to-purple-900 hover:from-indigo-800 hover:via-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-200 shadow-lg shadow-indigo-950/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-indigo-200" />
                      <span>{isSubmitting ? 'Menganalisis & Mengirim...' : 'Kirim Laporan'}</span>
                    </button>

                    <Link
                      to="/reporter"
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Dashboard</span>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </>
      )}
    </div>
  );
}
