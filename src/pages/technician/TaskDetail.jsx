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

// Comprehensive mock tasks database consistent with Tasks.jsx and Dashboard.jsx
const TASKS_DATABASE = [
  {
    id: 'RPT-2026-0104',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Electrical',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    priority: 'Critical',
    aiPriority: 'High',
    status: 'In Progress',
    reportedDate: '13 Nov 2026, 09:15',
    reporterName: 'Bryan Sompotan (Mahasiswa - 105021234)',
    description:
      'Unit AC split meneteskan air ke meja praktikum dan kipas mengeluarkan suara berisik. Suhu ruangan meningkat drastis sehingga server lab berisiko overheat.',
    damagePhoto:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'High',
      summary: 'Kebocoran sistem pendingin AC berpotensi merusak perangkat lab komputer jika tidak ditangani segera.',
      recommendation: 'Lakukan pembersihan filter, cek pembuangan kondensasi pipa, dan isi ulang refrigeran freon jika kompresor bekerja berat.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '13 Nov 2026, 09:30',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Laporan diverifikasi, prioritas dinaikkan menjadi Critical karena risiko terhadap server lab. Ditugaskan ke Rudi Hartono.',
      },
      {
        id: 'upd-2',
        timestamp: '13 Nov 2026, 10:15',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes: 'Mulai inspeksi unit indoor. Pipa pembuangan tersumbat debu tebal, sedang dilakukan flushing saluran kondensasi.',
      },
    ],
  },
  {
    id: 'RPT-2026-0102',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Electrical',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    priority: 'High',
    aiPriority: 'Medium',
    status: 'Assigned',
    reportedDate: '13 Nov 2026, 08:00',
    reporterName: 'Dr. Jerry Rogi (Dosen - 091234567)',
    description:
      'Lampu tabung LED utama tidak menyala sama sekali saat sakelar dinyalakan. Ruangan gelap untuk sesi perkuliahan teori jam 10:00.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'Medium',
      summary: 'Kegagalan pencahayaan ruang kuliah mengganggu proses pembelajaran.',
      recommendation: 'Periksa ballast, starter LED, serta terminal sakelar dinding.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '13 Nov 2026, 08:15',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Laporan disetujui. Prioritas High karena jadwal kuliah mendesak.',
      },
    ],
  },
  {
    id: 'RPT-2026-0100',
    title: 'Kipas Angin Dinding Berderit Kencang & Macet',
    category: 'Electrical',
    location: 'GK1 - Lantai 1, Ruang 105',
    priority: 'Low',
    aiPriority: 'Low',
    status: 'Assigned',
    reportedDate: '13 Nov 2026, 07:30',
    reporterName: 'Staf Prodi Sistem Informasi',
    description:
      'Kipas angin dinding tidak bisa berputar osilasi dan mengeluarkan bunyi gesekan bearing kasar.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'Low',
      summary: 'Gangguan mekanis bearing kipas dinding.',
      recommendation: 'Pelumasan bearing motor kipas atau penggantian gigi osilasi.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '13 Nov 2026, 07:50',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Tugas dimasukkan antrean penanganan pemeliharaan berkala.',
      },
    ],
  },
  {
    id: 'RPT-2026-0099',
    title: 'Kran Air Wastafel Patah di Musholla Kampus',
    category: 'Plumbing',
    location: 'Gedung Pioneer Chapel - Tempat Wudhu',
    priority: 'Medium',
    aiPriority: 'Medium',
    status: 'Assigned',
    reportedDate: '12 Nov 2026, 16:45',
    reporterName: 'Rendy (Mahasiswa)',
    description:
      'Handle kran patah saat diputar, air menetes terus menerus sehingga valve utama sementara ditutup.',
    damagePhoto:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Plumbing',
      urgency: 'Medium',
      summary: 'Kerusakan keran air mengakibatkan pemborosan air jika valve terbuka.',
      recommendation: 'Penggantian bibcock keran kuningan 1/2 inch tipe putar.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '12 Nov 2026, 17:00',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Valve utama dimatikan sementara, teknisi ditugaskan untuk penggantian unit.',
      },
    ],
  },
  {
    id: 'RPT-2026-0098',
    title: 'Pipa Wastafel Bocor Menggenangi Lantai',
    category: 'Plumbing',
    location: 'Asrama Crystal - Toilet Lantai 1',
    priority: 'High',
    aiPriority: 'High',
    status: 'In Progress',
    reportedDate: '12 Nov 2026, 14:20',
    reporterName: 'Maria Pangkey (Staf - 19850412)',
    description:
      'P-trap saluran pembuangan di bawah wastafel retak, air cucian langsung mengalir ke lantai lorong asrama.',
    damagePhoto:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Plumbing',
      urgency: 'High',
      summary: 'Kebocoran limbah air wastafel berisiko menimbulkan bau dan licin di lorong asrama.',
      recommendation: 'Ganti P-trap fleksibel PVC dan lapisi sambungan ulir dengan seal tape.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '12 Nov 2026, 14:40',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Penugasan darurat untuk teknisi pipa.',
      },
      {
        id: 'upd-2',
        timestamp: '12 Nov 2026, 15:30',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes: 'Pipa lama dilepas, sedang memasang P-trap PVC baru dan pengolesan lem pipa.',
      },
    ],
  },
  {
    id: 'RPT-2026-0097',
    title: 'Koneksi Proyektor Plafon Sering Mati Mendadak',
    category: 'Electronics',
    location: 'GK2 - Lantai 3, Ruang Seminar',
    priority: 'Medium',
    aiPriority: 'Medium',
    status: 'In Progress',
    reportedDate: '12 Nov 2026, 13:10',
    reporterName: 'Dosen FIK',
    description:
      'Kabel HDMI extender di plafon longgar atau kabel power intermittent, display proyektor sering hilang sinyal saat presentasi.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Electronics',
      urgency: 'Medium',
      summary: 'Intermittent signal connection pada kabel display proyektor.',
      recommendation: 'Cek port HDMI projector ceiling bracket dan uji kabel HDMI 15 meter.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '12 Nov 2026, 13:30',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Diteruskan ke teknisi elektro untuk pengecekan kabel tangga plafon.',
      },
      {
        id: 'upd-2',
        timestamp: '12 Nov 2026, 16:00',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes: 'Tangga kerja dipasang, konektor HDMI dibersihkan dengan contact cleaner.',
      },
    ],
  },
  {
    id: 'RPT-2026-0096',
    title: 'Kunci Pintu Laboratorium Hardware Rusak',
    category: 'Infrastructure',
    location: 'GK2 - Lantai 1, Lab Hardware',
    priority: 'Medium',
    aiPriority: 'Medium',
    status: 'In Progress',
    reportedDate: '12 Nov 2026, 11:50',
    reporterName: 'Koordinator Lab',
    description:
      'Silinder kunci pintu masuk macet dari luar, anak kunci tidak bisa diputar 360 derajat.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Infrastructure',
      urgency: 'Medium',
      summary: 'Kerusakan silinder kunci mekanis mengancam keamanan aset lab hardware.',
      recommendation: 'Ganti silinder kunci pintu aluminium dengan kunci tipe master key.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '12 Nov 2026, 12:15',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Disetujui untuk penggantian silinder kunci.',
      },
      {
        id: 'upd-2',
        timestamp: '12 Nov 2026, 14:00',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes: 'Silinder lama dilepas, sedang menyesuaikan rumah kunci pintu aluminium.',
      },
    ],
  },
  {
    id: 'RPT-2026-0095',
    title: 'Stopkontak Meja Dosen Korslet & Berbau Hangus',
    category: 'Electrical',
    location: 'GK2 - Lantai 1, Ruang 102',
    priority: 'Critical',
    aiPriority: 'Critical',
    status: 'Completed',
    reportedDate: '12 Nov 2026, 10:45',
    reporterName: 'Staf Administrasi FIK',
    description:
      'Terjadi korsleting saat laptop dihubungkan ke colokan. Stopkontak terbakar dan tercium bau plastik hangus.',
    damagePhoto:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    evidencePhoto:
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'Critical',
      summary: 'Korsleting listrik bertegangan tinggi berpotensi memicu kebakaran.',
      recommendation: 'Putuskan MCB jalur terkait, isolasi kabel terbakar, ganti housing stopkontak in-bow.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '12 Nov 2026, 10:55',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'MCB jalur 102 dimatikan sementara dari panel lantai 1.',
      },
      {
        id: 'upd-2',
        timestamp: '12 Nov 2026, 11:20',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes: 'Kabel fase dan netral yang meleleh dipotong dan disambung ulang dengan konektor wago.',
      },
      {
        id: 'upd-3',
        timestamp: '12 Nov 2026, 12:45',
        author: 'Rudi Hartono (Teknisi)',
        status: 'Completed',
        notes: 'Stopkontak baru standar SNI telah terpasang rapi, tes beban 220V normal dan aman.',
      },
    ],
  },
  {
    id: 'RPT-2026-0093',
    title: 'Lampu Sorot Lapangan Basket UNKLAB Mati',
    category: 'Electrical',
    location: 'Sport Hall UNKLAB',
    priority: 'Medium',
    aiPriority: 'Low',
    status: 'Completed',
    reportedDate: '11 Nov 2026, 15:30',
    reporterName: 'BEM UNKLAB',
    description:
      'Driver LED lampu sorot barat laut mati, sudah diganti ballast dan driver cadangan.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'Low',
      summary: 'Lampu sorot outdoor padam satu titik.',
      recommendation: 'Penggantian modul driver switching 150 Watt.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '11 Nov 2026, 16:00',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes: 'Disetujui untuk perbaikan sebelum latihan basket malam.',
      },
      {
        id: 'upd-2',
        timestamp: '11 Nov 2026, 17:30',
        author: 'Rudi Hartono (Teknisi)',
        status: 'Completed',
        notes: 'Penggantian driver LED selesai, penerangan lapangan normal.',
      },
    ],
  },
  {
    id: 'RPT-2026-0092',
    title: 'Saluran Air Pembuangan AC Tersumbat',
    category: 'Plumbing',
    location: 'GK1 - Ruang Dosen Lt. 3',
    priority: 'Low',
    aiPriority: 'Low',
    status: 'Completed',
    reportedDate: '11 Nov 2026, 13:00',
    reporterName: 'Dosen FEB',
    description:
      'Pipa pembuangan AC berlumut, telah dilakukan flushing pipa dengan pompa tekanan tinggi.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Plumbing',
      urgency: 'Low',
      summary: 'Sumbatan lendir lumut pada pipa PVC pembuangan AC.',
      recommendation: 'Flushing kimia ringan atau penyemprotan air bertekanan.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '11 Nov 2026, 14:00',
        author: 'Rudi Hartono (Teknisi)',
        status: 'Completed',
        notes: 'Saluran bersih, aliran air lancar ke luar gedung.',
      },
    ],
  },
  {
    id: 'RPT-2026-0091',
    title: 'Pintu Ruang Baca Engsel Longgar & Rusak',
    category: 'Furniture',
    location: 'Perpustakaan Pusat - Lantai 2',
    priority: 'Medium',
    aiPriority: 'Medium',
    status: 'Completed',
    reportedDate: '11 Nov 2026, 11:30',
    reporterName: 'Petugas Perpustakaan',
    description:
      'Engsel atas kendor sehingga daun pintu menggesek lantai parquet. Sudah disekrup ulang dan diberi pelumas.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Furniture',
      urgency: 'Medium',
      summary: 'Kelemahan sekrup pada kusen kayu ruang baca.',
      recommendation: 'Pemasangan fischer kayu baru dan sekrup lebih panjang.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '11 Nov 2026, 13:00',
        author: 'Rudi Hartono (Teknisi)',
        status: 'Completed',
        notes: 'Pintu kembali presisi dan dapat ditutup tanpa bergesekan.',
      },
    ],
  },
  {
    id: 'RPT-2026-0089',
    title: 'Kabel LAN Meja Front Desk Perpustakaan Putus',
    category: 'Infrastructure',
    location: 'Perpustakaan Pusat - Lantai 1',
    priority: 'Low',
    aiPriority: 'Low',
    status: 'Completed',
    reportedDate: '10 Nov 2026, 09:20',
    reporterName: 'Staf Perpustakaan',
    description:
      'Kabel patch cord UTP terjepit laci meja. Sudah dilakukan crimping ulang konektor RJ-45 baru.',
    damagePhoto: null,
    evidencePhoto: null,
    aiAnalysis: {
      category: 'Infrastructure',
      urgency: 'Low',
      summary: 'Konektor RJ45 patah akibat terjepit.',
      recommendation: 'Crimping ulang dengan konektor Cat6 baru dan tes LAN cable tester.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '10 Nov 2026, 10:15',
        author: 'Rudi Hartono (Teknisi)',
        status: 'Completed',
        notes: 'Crimping selesai, kecepatan jaringan terdeteksi 1 Gbps normal.',
      },
    ],
  },
];

export default function TechnicianTaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  // Find task from mock database
  const initialTask = TASKS_DATABASE.find(
    (t) => t.id.toLowerCase() === id?.toLowerCase()
  );

  // Local state for interactive technician updates (simulated in-memory)
  const [task, setTask] = useState(initialTask || null);
  const [status, setStatus] = useState(initialTask?.status || 'In Progress');
  const [repairNotes, setRepairNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(
    initialTask?.evidencePhoto || null
  );

  // Form feedback messages (Toast state)
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Submit status update and notes
  const handleUpdateSubmit = (e) => {
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

    // Simulate update operation in memory
    setTimeout(() => {
      const now = new Date();
      const formattedDate = `${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newUpdate = {
        id: `upd-${Date.now().toString(36)}`,
        timestamp: formattedDate,
        author: `${user?.name || 'Rudi Hartono'} (Teknisi)`,
        status: status,
        notes: repairNotes.trim(),
      };

      setTask((prev) => ({
        ...prev,
        status: status,
        evidencePhoto: evidencePreview,
        updates: [newUpdate, ...(prev.updates || [])],
      }));

      setIsSubmitting(false);
      setRepairNotes('');
      setFeedback({
        type: 'success',
        message: `Status berhasil diperbarui menjadi "${status}" dan catatan perbaikan telah disimpan (simulasi local state).`,
      });
    }, 400);
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
              *Pembaruan disimpan dalam sesi lokal aktif (prototipe).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
