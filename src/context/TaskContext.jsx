/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import { saveEvidenceImage, getAllEvidenceImages } from '../utils/imageStorage';
import {
  formatWitaTimestamp,
  formatWitaIsoDate,
  sortReportsNewestFirst,
} from '../utils/dateFormat';
import {
  getAllReports,
  updateReport as patchReportInApi,
  createReport as createReportInApi,
} from '../services/reportService';
import {
  createNotification as createNotificationInApi,
  getNotificationsByRecipientId,
} from '../services/activityNotificationService';

const CATEGORY_TO_TECH_MAP = {
  Kelistrikan: 'Electrical',
  'Plumbing / Sanitasi': 'Plumbing',
  Elektronik: 'Electronics',
  Furniture: 'Furniture',
  'Infrastruktur / Bangunan': 'Infrastructure',
  Lainnya: 'Other',
};

const TECH_TO_CATEGORY_MAP = {
  Electrical: 'Kelistrikan',
  Plumbing: 'Plumbing / Sanitasi',
  Electronics: 'Elektronik',
  Furniture: 'Furniture',
  Infrastructure: 'Infrastruktur / Bangunan',
  Other: 'Lainnya',
};

const TECHNICIAN_TASK_STATUSES = new Set(['Assigned', 'In Progress', 'Completed']);

// Unified 12 tasks master dataset matching Dashboard, Tasks, TaskDetail, and History
export const INITIAL_TASKS = [
  {
    id: 'RPT-2026-0109',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Electrical',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    priority: 'Critical',
    aiPriority: 'High',
    status: 'In Progress',
    reportedDate: '15 Nov 2026, 14:20',
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan (Mahasiswa - 105021234)',
    assignedByAdmin: true,
    assignedTechnicianId: 'TECH-001',
    assignedTechnicianName: 'Rudi Hartono',
    description:
      'Unit AC split meneteskan air ke meja praktikum dan kipas mengeluarkan suara berisik. Suhu ruangan meningkat drastis sehingga server lab berisiko overheat.',
    urgencyReason: 'Suhu lab tinggi, berisiko merusak server praktikum.',
    damagePhoto:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    repairNotes: '',
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'High',
      summary:
        'Kebocoran sistem pendingin AC berpotensi merusak perangkat lab komputer jika tidak ditangani segera.',
      recommendation:
        'Lakukan pembersihan filter, cek pembuangan kondensasi pipa, dan isi ulang refrigeran freon jika kompresor bekerja berat.',
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '15 Nov 2026, 14:35',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes:
          'Laporan diverifikasi, prioritas dinaikkan menjadi Critical karena risiko terhadap server lab. Ditugaskan ke Rudi Hartono.',
      },
      {
        id: 'upd-2',
        timestamp: '15 Nov 2026, 15:10',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes:
          'Mulai inspeksi unit indoor. Pipa pembuangan tersumbat debu tebal, sedang dilakukan flushing saluran kondensasi.',
      },
    ],
  },
  {
    id: 'RPT-2026-0106',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Electrical',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    priority: 'High',
    aiPriority: 'Medium',
    status: 'Assigned',
    reportedDate: '14 Nov 2026, 09:50',
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi (Dosen - 091234567)',
    assignedByAdmin: true,
    assignedTechnicianId: 'TECH-001',
    assignedTechnicianName: 'Rudi Hartono',
    description:
      'Lampu tabung LED utama tidak menyala sama sekali saat sakelar dinyalakan. Ruangan gelap untuk sesi perkuliahan teori jam 10:00.',
    urgencyReason: 'Ruangan digunakan untuk perkuliahan siang.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Staf Prodi Sistem Informasi',
    description:
      'Kipas angin dinding tidak bisa berputar osilasi dan mengeluarkan bunyi gesekan bearing kasar.',
    urgencyReason: 'Kenyamanan ruang kuliah terganggu bunyi derit.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Rendy (Mahasiswa)',
    description:
      'Handle kran patah saat diputar, air menetes terus menerus sehingga valve utama sementara ditutup.',
    urgencyReason: 'Tempat wudhu tidak dapat digunakan optimal.',
    damagePhoto:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Maria Pangkey (Staf - 19850412)',
    description:
      'P-trap saluran pembuangan di bawah wastafel retak, air cucian langsung mengalir ke lantai lorong asrama.',
    urgencyReason: 'Air meluap ke koridor asrama.',
    damagePhoto:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Dosen FIK',
    description:
      'Kabel HDMI extender di plafon longgar atau kabel power intermittent, display proyektor sering hilang sinyal saat presentasi.',
    urgencyReason: 'Ruang seminar sering digunakan untuk sidang skripsi.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Koordinator Lab',
    description:
      'Silinder kunci pintu masuk macet dari luar, anak kunci tidak bisa diputar 360 derajat.',
    urgencyReason: 'Aset lab hardware harus diamankan saat di luar jam kerja.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes: '',
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
    completedDate: '12 Nov 2026, 12:45',
    completionDay: '2026-11-12',
    duration: '2 jam',
    reporterName: 'Staf Administrasi FIK',
    description:
      'Terjadi korsleting saat laptop dihubungkan ke colokan. Stopkontak terbakar dan tercium bau plastik hangus.',
    urgencyReason: 'Bahaya percikan listrik telah ditangani.',
    damagePhoto:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    evidencePhoto:
      'https://images.unsplash.com/photo-1529111316-da2e2a1e625d?auto=format&fit=crop&w=800&q=80',
    repairNotes:
      'Stopkontak baru standar SNI telah terpasang rapi, pengkabelan diganti dengan kabel tembaga 2.5mm, tes beban 220V normal dan aman.',
    aiAnalysis: {
      category: 'Electrical',
      urgency: 'Critical',
      summary: 'Korsleting listrik bertegangan tinggi berpotensi memicu kebakaran.',
      recommendation:
        'Putuskan MCB jalur terkait, isolasi kabel terbakar, ganti housing stopkontak in-bow.',
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
    completedDate: '11 Nov 2026, 17:30',
    completionDay: '2026-11-11',
    duration: '2 jam',
    reporterName: 'BEM UNKLAB',
    description:
      'Driver LED lampu sorot barat laut mati, sudah diganti ballast dan driver cadangan.',
    urgencyReason: 'Lampu sorot telah kembali menyala untuk kegiatan mahasiswa.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes:
      'Driver LED lampu sorot barat laut mati akibat lonjakan arus, sudah diganti dengan unit ballast driver 150W cadangan.',
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
    completedDate: '11 Nov 2026, 14:00',
    completionDay: '2026-11-11',
    duration: '1 jam',
    reporterName: 'Dosen FEB',
    description:
      'Pipa pembuangan AC berlumut, telah dilakukan flushing pipa dengan pompa tekanan tinggi.',
    urgencyReason: 'Flushing pipa AC telah tuntas dan saluran air lancar.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes:
      'Pipa pembuangan AC berlumut tebal, dilakukan flushing pipa dengan pompa air tekanan tinggi dan pemberian cairan anti-lumut.',
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
    completedDate: '11 Nov 2026, 13:00',
    completionDay: '2026-11-11',
    duration: '1.5 jam',
    reporterName: 'Petugas Perpustakaan',
    description:
      'Engsel atas kendor sehingga daun pintu menggesek lantai parquet. Sudah disekrup ulang dan diberi pelumas.',
    urgencyReason: 'Pintu telah diperbaiki dan dapat dikunci normal.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes:
      'Engsel atas kusen kayu diperbaiki dengan fischer baru dan sekrup baja galvanis lebih panjang. Pintu dapat ditutup tanpa bergesekan.',
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
    completedDate: '10 Nov 2026, 10:15',
    completionDay: '2026-11-10',
    duration: '55 menit',
    reporterName: 'Staf Perpustakaan',
    description:
      'Kabel patch cord UTP terjepit laci meja. Sudah dilakukan crimping ulang konektor RJ-45 baru.',
    urgencyReason: 'Konektivitas jaringan front desk normal kembali.',
    damagePhoto: null,
    evidencePhoto: null,
    repairNotes:
      'Kabel patch cord UTP terjepit laci meja. Dilakukan pemotongan bagian rusak dan crimping ulang konektor RJ-45 Cat6 baru.',
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

const LOCAL_STORAGE_KEY = 'campus_maintenance_tasks';

export const TaskContext = createContext(null);

function resolveTechCategory(report) {
  return (
    report?.techCategory ||
    CATEGORY_TO_TECH_MAP[report?.category] ||
    report?.category ||
    'Infrastructure'
  );
}

function resolveAdminCategory(report) {
  if (report?.category && CATEGORY_TO_TECH_MAP[report.category]) {
    return report.category;
  }
  return TECH_TO_CATEGORY_MAP[report?.category] || report?.category || 'Lainnya';
}

function hydrateEvidencePhoto(evidencePhoto, reportId, idbPhotos = {}) {
  if (typeof evidencePhoto === 'string' && evidencePhoto.startsWith('idb:')) {
    const photoKey = evidencePhoto.replace('idb:', '');
    return idbPhotos[photoKey] || evidencePhoto;
  }
  if (evidencePhoto === undefined && idbPhotos[`photo_${reportId}`]) {
    return idbPhotos[`photo_${reportId}`];
  }
  return evidencePhoto ?? null;
}

function toPersistedEvidencePointer(evidencePhoto, taskId) {
  if (typeof evidencePhoto === 'string' && evidencePhoto.startsWith('data:image/')) {
    return `idb:photo_${taskId}`;
  }
  return evidencePhoto ?? null;
}

export function normalizeReportToTask(report, idbPhotos = {}) {
  if (!report) return null;
  const resolvedCategory = resolveTechCategory(report);
  const resolvedReporterName =
    report.reporterRole &&
    report.reporterName &&
    !report.reporterName.includes(`(${report.reporterRole})`)
      ? `${report.reporterName} (${report.reporterRole})`
      : report.reporterName || 'Pelapor Kampus';

  return {
    ...report,
    id: report.id,
    title: report.title,
    category: resolvedCategory,
    adminCategory: resolveAdminCategory(report),
    location: report.location,
    priority: report.priority || report.adminPriority || report.aiUrgency || 'Medium',
    aiPriority: report.aiPriority || report.aiUrgency || 'Medium',
    status: report.status || 'Pending',
    reportedDate: report.reportedDate || '',
    completedDate: report.completedDate ?? null,
    completionDay: report.completionDay ?? null,
    duration: report.duration || '',
    reporterId: report.reporterId || null,
    reporterName: resolvedReporterName,
    description: report.description || '',
    urgencyReason:
      report.urgencyReason ||
      report.aiAnalysis?.urgencyReason ||
      report.aiSummary ||
      'Memerlukan penanganan teknisi fasilitas.',
    damagePhoto: hydrateEvidencePhoto(report.damagePhoto, report.id, idbPhotos),
    evidencePhoto: hydrateEvidencePhoto(report.evidencePhoto, report.id, idbPhotos),
    repairNotes: report.repairNotes || '',
    assignedByAdmin: Boolean(report.assignedByAdmin),
    sourceReportId: report.sourceReportId || report.id,
    assignedTechnicianId: report.assignedTechnicianId || null,
    assignedTechnicianName:
      report.assignedTechnicianName || report.assignedTechnician || null,
    aiAnalysis: report.aiAnalysis || {
      category: resolvedCategory,
      urgency: report.aiUrgency || report.aiPriority || 'Medium',
      summary: report.aiSummary || report.description || '',
      recommendation: `Lakukan pemeriksaan di ${report.location || 'lokasi terkait'} untuk laporan ${report.id}.`,
    },
    updates: Array.isArray(report.updates) ? report.updates : [],
  };
}

function loadStoredTasks() {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeReportToTask(item));
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data dari localStorage:', err);
  }
  return INITIAL_TASKS;
}

function toPersistedDamagePointer(damagePhoto, taskId) {
  if (typeof damagePhoto === 'string' && damagePhoto.startsWith('data:image/')) {
    return `idb:damage_${taskId}`;
  }
  return damagePhoto ?? null;
}

function persistTasksToLocalStorage(taskList) {
  if (typeof window === 'undefined') return;
  try {
    const payloadToStore = taskList.map((t) => ({
      ...t,
      damagePhoto: toPersistedDamagePointer(t.damagePhoto, t.id),
      evidencePhoto: toPersistedEvidencePointer(t.evidencePhoto, t.id),
    }));
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payloadToStore));
  } catch (err) {
    console.warn('Gagal menyimpan tugas ke localStorage:', err);
  }
}

export function buildReporterStatusNotification({
  previousStatus,
  newStatus,
  report,
  actorName,
  notes,
  timestamp,
}) {
  if (!report?.id || !report?.reporterId) return null;
  if (previousStatus === newStatus) return null;
  if (newStatus !== 'In Progress' && newStatus !== 'Completed') return null;

  const notifType = newStatus === 'Completed' ? 'completed' : 'in_progress';
  const cleanActor = actorName || report.assignedTechnicianName || 'Teknisi';
  const cleanNotes = typeof notes === 'string' && notes.trim() ? ` Catatan: ${notes.trim()}` : '';

  return {
    id: `NTF-RPT-${report.id}-${notifType}`,
    recipientId: report.reporterId,
    targetRole: 'Reporter',
    type: notifType,
    title:
      newStatus === 'Completed'
        ? 'Perbaikan Telah Selesai'
        : 'Perbaikan Sedang Dikerjakan',
    message:
      newStatus === 'Completed'
        ? `Perbaikan untuk laporan "${report.title}" telah diselesaikan oleh teknisi ${cleanActor}.${cleanNotes}`
        : `Teknisi ${cleanActor} mulai mengerjakan perbaikan "${report.title}".${cleanNotes}`,
    reportId: report.id,
    actor: cleanActor,
    timestamp,
    isRead: false,
  };
}

export function TaskProvider({ children }) {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [error, setError] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const inFlightNotificationKeysRef = useRef(new Set());

  const refreshTasks = useCallback(async () => {
    let idbPhotos = {};

    try {
      idbPhotos = await getAllEvidenceImages();
    } catch (err) {
      console.warn('Gagal memuat foto dari IndexedDB:', err);
    }

    try {
      const backendReports = await getAllReports();
      const normalizedTasks = sortReportsNewestFirst(
        backendReports
          .map((report) => normalizeReportToTask(report, idbPhotos))
          .filter(Boolean)
      );

      setTasks(normalizedTasks);
      setIsUsingFallback(false);
      persistTasksToLocalStorage(normalizedTasks);
      setError('');
      return { success: true, data: normalizedTasks };
    } catch (err) {
      console.warn('Gagal memuat laporan dari JSON Server, menggunakan fallback cache lokal:', err);
      const errMsg =
        err?.message ||
        'Gagal memuat daftar tugas dari server. Menampilkan data cache lokal.';
      setError(errMsg);

      const fallbackTasks = sortReportsNewestFirst(
        loadStoredTasks().map((t) => ({
          ...t,
          damagePhoto: hydrateEvidencePhoto(t.damagePhoto, t.id, idbPhotos),
          evidencePhoto: hydrateEvidencePhoto(t.evidencePhoto, t.id, idbPhotos),
        }))
      );
      setTasks(fallbackTasks);
      setIsUsingFallback(true);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang daftar laporan setiap sesi akun berubah (Student/Admin/Technician)
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) refreshTasks();
    });
    return () => {
      active = false;
    };
  }, [user?.identifier, refreshTasks]);

  // Kirim notifikasi Reporter setelah PATCH /reports/:id sukses (anti-duplikasi & retry aman)
  const dispatchReporterNotification = useCallback(async (payload) => {
    if (!payload) return { sent: false, skipped: true };

    const transitionKey = `${payload.recipientId}::${payload.reportId}::${payload.type}`;
    if (inFlightNotificationKeysRef.current.has(transitionKey)) {
      return { sent: false, skipped: true, reason: 'duplicate_in_flight' };
    }

    inFlightNotificationKeysRef.current.add(transitionKey);

    try {
      const existing = await getNotificationsByRecipientId(payload.recipientId);
      const alreadyExists = existing.some(
        (n) =>
          n.id === payload.id ||
          (n.reportId?.toLowerCase() === payload.reportId.toLowerCase() &&
            n.type === payload.type &&
            (n.targetRole === 'Reporter' || !n.targetRole))
      );

      if (alreadyExists) {
        return { sent: false, skipped: true, reason: 'already_exists' };
      }

      try {
        await createNotificationInApi(payload);
      } catch {
        // Coba ulang satu kali untuk gangguan sementara
        await createNotificationInApi(payload);
      }

      setNotificationError('');
      setPendingNotifications((prev) =>
        prev.filter((item) => item.id !== payload.id)
      );
      return { sent: true };
    } catch (notifErr) {
      const errMsg =
        notifErr?.message || 'Gagal mengirim notifikasi status ke Pelapor.';
      console.error(
        '[TaskContext] Pembaruan status laporan tersimpan, namun pengiriman notifikasi Reporter gagal:',
        notifErr
      );
      setNotificationError(errMsg);
      setPendingNotifications((prev) =>
        prev.some((item) => item.id === payload.id) ? prev : [...prev, payload]
      );
      return { sent: false, error: errMsg };
    } finally {
      inFlightNotificationKeysRef.current.delete(transitionKey);
    }
  }, []);

  const retryPendingNotifications = useCallback(async () => {
    if (pendingNotifications.length === 0) return { retried: 0, remaining: 0 };
    let sentCount = 0;

    for (const item of pendingNotifications) {
      const res = await dispatchReporterNotification(item);
      if (res.sent || res.skipped) sentCount += 1;
    }

    return {
      retried: sentCount,
      remaining: Math.max(0, pendingNotifications.length - sentCount),
    };
  }, [pendingNotifications, dispatchReporterNotification]);

  // Update task details (status, notes, evidence photo, timeline update) via PATCH /reports/:id
  const updateTask = async (taskId, updates) => {
    const currentTask = tasks.find((t) => t.id.toLowerCase() === taskId.toLowerCase());
    if (!currentTask) {
      throw new Error(`Tugas dengan ID "${taskId}" tidak ditemukan.`);
    }

    const previousStatus = currentTask.status;
    let evidencePhotoValue = updates.evidencePhoto;

    // Simpan foto base64 ke IndexedDB agar ukuran db.json dan localStorage tetap ringan
    if (
      evidencePhotoValue &&
      typeof evidencePhotoValue === 'string' &&
      evidencePhotoValue.startsWith('data:image/')
    ) {
      const photoKey = `photo_${currentTask.id}`;
      const savedToIdb = await saveEvidenceImage(photoKey, evidencePhotoValue);
      if (!savedToIdb) {
        throw new Error('Gagal menyimpan foto bukti ke penyimpanan lokal browser (IndexedDB).');
      }
    }

    const newStatus = updates.status || currentTask.status;
    const isNowCompleted = newStatus === 'Completed';

    const now = new Date();
    const formattedTimestamp = formatWitaTimestamp(now);
    const defaultCompletedDate = formattedTimestamp;
    const defaultCompletionDay = formatWitaIsoDate(now);

    const resolvedRepairNotes =
      updates.repairNotes !== undefined ? updates.repairNotes : currentTask.repairNotes;

    const resolvedCompletedDate = isNowCompleted
      ? updates.completedDate || currentTask.completedDate || defaultCompletedDate
      : null;

    const resolvedCompletionDay = isNowCompleted
      ? updates.completionDay || currentTask.completionDay || defaultCompletionDay
      : null;

    const resolvedDuration = isNowCompleted
      ? updates.duration || currentTask.duration || '1 jam'
      : '';

    const updatedTimeline = updates.newUpdate
      ? [updates.newUpdate, ...(currentTask.updates || [])]
      : updates.updates || currentTask.updates || [];

    const persistedEvidencePhoto =
      evidencePhotoValue !== undefined
        ? toPersistedEvidencePointer(evidencePhotoValue, currentTask.id)
        : toPersistedEvidencePointer(currentTask.evidencePhoto, currentTask.id);

    const patchPayload = {
      status: newStatus,
      repairNotes: resolvedRepairNotes,
      evidencePhoto: persistedEvidencePhoto,
      completedDate: resolvedCompletedDate,
      completionDay: resolvedCompletionDay,
      duration: resolvedDuration,
      updates: updatedTimeline,
      statusNote:
        updates.newUpdate?.notes || resolvedRepairNotes || currentTask.statusNote || '',
    };

    let mergedTask;
    try {
      // Kirim perubahan ke JSON Server terlebih dahulu sebelum mengonfirmasi pembaruan UI
      const patchedReport = await patchReportInApi(currentTask.id, patchPayload);
      const idbPhotos =
        typeof evidencePhotoValue === 'string' && evidencePhotoValue.startsWith('data:image/')
          ? { [`photo_${currentTask.id}`]: evidencePhotoValue }
          : typeof currentTask.evidencePhoto === 'string' &&
            currentTask.evidencePhoto.startsWith('data:image/') &&
            evidencePhotoValue === undefined
          ? { [`photo_${currentTask.id}`]: currentTask.evidencePhoto }
          : {};

      mergedTask = normalizeReportToTask(
        {
          ...currentTask,
          ...patchedReport,
          ...patchPayload,
        },
        idbPhotos
      );

      setTasks((prevTasks) => {
        const nextTasks = prevTasks.map((task) =>
          task.id.toLowerCase() === currentTask.id.toLowerCase() ? mergedTask : task
        );
        persistTasksToLocalStorage(nextTasks);
        return nextTasks;
      });
      setError('');
    } catch (err) {
      const errorMessage =
        err?.message || 'Gagal menyimpan pembaruan tugas ke server backend.';
      setError(errorMessage);
      throw err;
    }

    // Buat notifikasi Reporter HANYA jika PATCH berhasil & status benar-benar berubah ke In Progress / Completed
    const notifPayload = buildReporterStatusNotification({
      previousStatus,
      newStatus,
      report: mergedTask,
      actorName: user?.name || mergedTask.assignedTechnicianName,
      notes: updates.newUpdate?.notes || resolvedRepairNotes,
      timestamp: updates.newUpdate?.timestamp || formattedTimestamp,
    });

    if (notifPayload) {
      await dispatchReporterNotification(notifPayload);
    }

    return mergedTask;
  };

  // Tambahkan atau perbarui tugas hasil penugasan Admin dan sinkronkan ke JSON Server
  const assignTaskFromAdmin = (
    report,
    technician,
    adminName = 'Admin Sarana & Fasilitas',
    options = {}
  ) => {
    if (!report || !technician) return;

    const {
      skipApiSync = false,
      assignmentUpdate: providedUpdate = null,
      nextUpdates: providedUpdates = null,
    } = options;

    const formattedDate = formatWitaTimestamp(new Date());
    const techCategory = CATEGORY_TO_TECH_MAP[report.category] || report.category || 'Infrastructure';
    const finalPriority = report.adminPriority || report.aiUrgency || 'Medium';

    const assignmentUpdate = providedUpdate || {
      id: `upd-${Date.now()}`,
      timestamp: formattedDate,
      author: adminName,
      status: 'Assigned',
      notes: `Laporan diverifikasi dan ditugaskan kepada ${technician.name} (${technician.id}) dengan prioritas ${finalPriority}.`,
    };

    const existingTask = tasks.find(
      (t) => t.id.toLowerCase() === report.id.toLowerCase()
    );

    const priorUpdates = Array.isArray(existingTask?.updates)
      ? existingTask.updates
      : Array.isArray(report.updates)
      ? report.updates
      : [];

    const nextUpdates = Array.isArray(providedUpdates)
      ? providedUpdates
      : [assignmentUpdate, ...priorUpdates];

    const resolvedAiAnalysis = report.aiAnalysis ||
      existingTask?.aiAnalysis || {
        category: techCategory,
        urgency: report.aiUrgency || 'Medium',
        summary: report.aiSummary || report.description,
        recommendation: `Lakukan pemeriksaan di ${report.location} untuk laporan ${report.id}.`,
      };

    const updatedTaskRecord = normalizeReportToTask({
      ...(existingTask || {}),
      ...report,
      id: report.id,
      title: report.title,
      category: report.category || existingTask?.adminCategory || techCategory,
      techCategory,
      location: report.location,
      adminPriority: finalPriority,
      priority: finalPriority,
      aiPriority: report.aiUrgency || existingTask?.aiPriority || 'Medium',
      status: 'Assigned',
      reportedDate: report.reportedDate || existingTask?.reportedDate || formattedDate,
      completedDate: null,
      completionDay: null,
      duration: '',
      assignedByAdmin: true,
      sourceReportId: report.id,
      assignedTechnicianId: technician.id,
      assignedTechnician: technician.name,
      assignedTechnicianName: technician.name,
      statusNote: assignmentUpdate.notes,
      aiAnalysis: resolvedAiAnalysis,
      updates: nextUpdates,
    });

    setTasks((prevTasks) => {
      const exists = prevTasks.some((t) => t.id.toLowerCase() === report.id.toLowerCase());
      const nextTasks = sortReportsNewestFirst(
        exists
          ? prevTasks.map((t) =>
              t.id.toLowerCase() === report.id.toLowerCase() ? updatedTaskRecord : t
            )
          : [updatedTaskRecord, ...prevTasks]
      );

      persistTasksToLocalStorage(nextTasks);
      return nextTasks;
    });

    if (skipApiSync) {
      return;
    }

    // Persist assignment ke backend collection reports jika belum dipersist oleh pemanggil
    const assignmentPatch = {
      status: 'Assigned',
      adminPriority: finalPriority,
      priority: finalPriority,
      assignedByAdmin: true,
      assignedTechnicianId: technician.id,
      assignedTechnician: technician.name,
      statusNote: assignmentUpdate.notes,
      updates: nextUpdates,
    };

    patchReportInApi(report.id, assignmentPatch).catch(async (patchErr) => {
      if (patchErr?.status === 404) {
        try {
          await createReportInApi({
            ...report,
            techCategory,
            ...assignmentPatch,
          });
          return;
        } catch (createErr) {
          console.warn('Gagal membuat penugasan di JSON Server:', createErr);
        }
      } else {
        console.warn('Gagal menyinkronkan penugasan ke JSON Server:', patchErr);
      }
    });
  };

  // Filter tugas sesuai akun teknisi yang login (hanya status Assigned/In Progress/Completed milik teknisi bersangkutan)
  const visibleTasks = useMemo(() => {
    const sorted = sortReportsNewestFirst(tasks);
    if (role !== 'Technician' || !user?.identifier) {
      return sorted;
    }

    const userTechId = user.identifier.trim().toLowerCase();
    const userTechName = (user.name || '').trim().toLowerCase();

    return sorted.filter((t) => {
      if (!TECHNICIAN_TASK_STATUSES.has(t.status)) return false;

      const assignedId =
        typeof t.assignedTechnicianId === 'string'
          ? t.assignedTechnicianId.trim().toLowerCase()
          : '';

      if (assignedId) {
        return assignedId === userTechId;
      }

      // Kompatibilitas data lama jika hanya nama teknisi yang tersimpan (laporan belum ditugaskan tidak pernah ditampilkan)
      const assignedName =
        typeof (t.assignedTechnicianName || t.assignedTechnician) === 'string'
          ? (t.assignedTechnicianName || t.assignedTechnician).trim().toLowerCase()
          : '';

      return Boolean(assignedName && userTechName && assignedName === userTechName);
    });
  }, [tasks, role, user]);

  // Helper to fetch task by ID
  const getTaskById = (taskId) => {
    if (!taskId) return null;
    return visibleTasks.find((t) => t.id.toLowerCase() === taskId.toLowerCase()) || null;
  };

  // Derived collections
  const activeTasks = useMemo(() => {
    return visibleTasks.filter((t) => t.status !== 'Completed');
  }, [visibleTasks]);

  const completedTasks = useMemo(() => {
    return visibleTasks.filter((t) => t.status === 'Completed');
  }, [visibleTasks]);

  // Reset to initial mock dataset if needed
  const resetTasks = () => {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.warn(err);
    }
    setTasks(INITIAL_TASKS);
    setError('');
  };

  const value = {
    tasks: visibleTasks,
    allTasks: tasks,
    activeTasks,
    completedTasks,
    loading,
    isUsingFallback,
    error,
    notificationError,
    pendingNotifications,
    getTaskById,
    updateTask,
    assignTaskFromAdmin,
    refreshTasks,
    retryPendingNotifications,
    resetTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

