/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { saveEvidenceImage, getAllEvidenceImages } from '../utils/imageStorage';

const CATEGORY_TO_TECH_MAP = {
  Kelistrikan: 'Electrical',
  'Plumbing / Sanitasi': 'Plumbing',
  Elektronik: 'Electronics',
  Furniture: 'Furniture',
  'Infrastruktur / Bangunan': 'Infrastructure',
  Lainnya: 'Other',
};

// Unified 12 tasks master dataset matching Dashboard, Tasks, TaskDetail, and History
export const INITIAL_TASKS = [
  {
    id: 'RPT-2026-0104',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Electrical',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    priority: 'Critical',
    aiPriority: 'High',
    status: 'In Progress',
    reportedDate: '13 Nov 2026, 09:15',
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Bryan Sompotan (Mahasiswa - 105021234)',
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
        timestamp: '13 Nov 2026, 09:30',
        author: 'Admin Sarana & Fasilitas',
        status: 'Assigned',
        notes:
          'Laporan diverifikasi, prioritas dinaikkan menjadi Critical karena risiko terhadap server lab. Ditugaskan ke Rudi Hartono.',
      },
      {
        id: 'upd-2',
        timestamp: '13 Nov 2026, 10:15',
        author: 'Rudi Hartono (Teknisi)',
        status: 'In Progress',
        notes:
          'Mulai inspeksi unit indoor. Pipa pembuangan tersumbat debu tebal, sedang dilakukan flushing saluran kondensasi.',
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
    completedDate: null,
    completionDay: null,
    duration: '',
    reporterName: 'Dr. Jerry Rogi (Dosen - 091234567)',
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

function loadStoredTasks() {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data dari localStorage:', err);
  }
  return INITIAL_TASKS;
}

export function TaskProvider({ children }) {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState(loadStoredTasks);

  // Hydrate evidence photos from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    async function hydratePhotos() {
      try {
        const idbPhotos = await getAllEvidenceImages();
        if (!isMounted || !idbPhotos || Object.keys(idbPhotos).length === 0) return;

        setTasks((prevTasks) =>
          prevTasks.map((t) => {
            const directKey = `photo_${t.id}`;
            if (idbPhotos[directKey]) {
              return { ...t, evidencePhoto: idbPhotos[directKey] };
            }
            if (t.evidencePhoto && typeof t.evidencePhoto === 'string' && t.evidencePhoto.startsWith('idb:')) {
              const photoKey = t.evidencePhoto.replace('idb:', '');
              if (idbPhotos[photoKey]) {
                return { ...t, evidencePhoto: idbPhotos[photoKey] };
              }
            }
            return t;
          })
        );
      } catch (err) {
        console.warn('Gagal memuat foto dari IndexedDB:', err);
      }
    }

    hydratePhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update task details (status, notes, evidence photo, timeline update)
  const updateTask = async (taskId, updates) => {
    let evidencePhotoValue = updates.evidencePhoto;

    // Save base64 image to IndexedDB to keep localStorage footprint lightweight
    if (
      evidencePhotoValue &&
      typeof evidencePhotoValue === 'string' &&
      evidencePhotoValue.startsWith('data:image/')
    ) {
      const photoKey = `photo_${taskId}`;
      await saveEvidenceImage(photoKey, evidencePhotoValue);
    }

    setTasks((prevTasks) => {
      const updated = prevTasks.map((task) => {
        if (task.id.toLowerCase() !== taskId.toLowerCase()) return task;

        const newStatus = updates.status || task.status;
        const isNowCompleted = newStatus === 'Completed';

        const now = new Date();
        const defaultCompletedDate = `${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const defaultCompletionDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const updatedTimeline = updates.newUpdate
          ? [updates.newUpdate, ...(task.updates || [])]
          : updates.updates || task.updates || [];

        return {
          ...task,
          ...updates,
          status: newStatus,
          repairNotes:
            updates.repairNotes !== undefined ? updates.repairNotes : task.repairNotes,
          evidencePhoto:
            evidencePhotoValue !== undefined ? evidencePhotoValue : task.evidencePhoto,
          completedDate: isNowCompleted
            ? updates.completedDate || task.completedDate || defaultCompletedDate
            : updates.completedDate !== undefined
            ? updates.completedDate
            : task.completedDate,
          completionDay: isNowCompleted
            ? updates.completionDay || task.completionDay || defaultCompletionDay
            : updates.completionDay !== undefined
            ? updates.completionDay
            : task.completionDay,
          duration:
            updates.duration ||
            task.duration ||
            (isNowCompleted ? '1 jam' : task.duration),
          updates: updatedTimeline,
        };
      });

      // Synchronize with localStorage safely (replacing large data URLs with IDB pointers)
      try {
        const payloadToStore = updated.map((t) => {
          if (
            t.evidencePhoto &&
            typeof t.evidencePhoto === 'string' &&
            t.evidencePhoto.startsWith('data:image/')
          ) {
            return {
              ...t,
              evidencePhoto: `idb:photo_${t.id}`,
            };
          }
          return t;
        });
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payloadToStore));
      } catch (err) {
        console.warn('Gagal menyimpan tugas ke localStorage:', err);
      }

      return updated;
    });
  };

  // Tambahkan tugas baru hasil penugasan Admin agar langsung tampil pada modul Teknisi
  const assignTaskFromAdmin = (report, technician, adminName = 'Admin Sarana & Fasilitas') => {
    if (!report || !technician) return;

    const now = new Date();
    const formattedDate = `${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const techCategory = CATEGORY_TO_TECH_MAP[report.category] || report.category || 'Infrastructure';
    const finalPriority = report.adminPriority || report.aiUrgency || 'Medium';

    const newTask = {
      id: report.id,
      title: report.title,
      category: techCategory,
      location: report.location,
      priority: finalPriority,
      aiPriority: report.aiUrgency || 'Medium',
      status: 'Assigned',
      reportedDate: report.reportedDate,
      completedDate: null,
      completionDay: null,
      duration: '',
      reporterName: `${report.reporterName} (${report.reporterRole})`,
      description: report.description,
      urgencyReason: report.aiSummary || 'Memerlukan penanganan teknisi fasilitas.',
      damagePhoto: report.damagePhoto || null,
      evidencePhoto: null,
      repairNotes: '',
      assignedByAdmin: true,
      sourceReportId: report.id,
      assignedTechnicianId: technician.id,
      assignedTechnicianName: technician.name,
      aiAnalysis: {
        category: techCategory,
        urgency: report.aiUrgency || 'Medium',
        summary: report.aiSummary || report.description,
        recommendation: `Lakukan pemeriksaan di ${report.location} untuk laporan ${report.id}.`,
      },
      updates: [
        {
          id: `upd-${Date.now()}`,
          timestamp: formattedDate,
          author: adminName,
          status: 'Assigned',
          notes: `Laporan diverifikasi dan ditugaskan kepada ${technician.name} (${technician.id}) dengan prioritas ${finalPriority}.`,
        },
      ],
    };

    setTasks((prevTasks) => {
      const exists = prevTasks.some((t) => t.id.toLowerCase() === report.id.toLowerCase());
      const nextTasks = exists
        ? prevTasks.map((t) =>
            t.id.toLowerCase() === report.id.toLowerCase()
              ? t.assignedByAdmin
                ? {
                    ...t,
                    status: 'Assigned',
                    priority: finalPriority,
                    assignedByAdmin: true,
                    sourceReportId: report.id,
                    assignedTechnicianId: technician.id,
                    assignedTechnicianName: technician.name,
                    updates: [newTask.updates[0], ...(t.updates || [])],
                  }
                : newTask
              : t
          )
        : [newTask, ...prevTasks];

      try {
        const payloadToStore = nextTasks.map((t) => {
          if (
            t.evidencePhoto &&
            typeof t.evidencePhoto === 'string' &&
            t.evidencePhoto.startsWith('data:image/')
          ) {
            return { ...t, evidencePhoto: `idb:photo_${t.id}` };
          }
          return t;
        });
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payloadToStore));
      } catch (err) {
        console.warn('Gagal menyimpan penugasan ke localStorage:', err);
      }

      return nextTasks;
    });
  };

  // Filter tugas sesuai akun teknisi yang login (tugas bawaan tanpa assignedTechnicianId milik TECH-001)
  const visibleTasks = useMemo(() => {
    if (role !== 'Technician' || !user?.identifier) {
      return tasks;
    }
    return tasks.filter((t) =>
      t.assignedTechnicianId
        ? t.assignedTechnicianId.toLowerCase() === user.identifier.toLowerCase()
        : user.identifier === 'TECH-001'
    );
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
  };

  const value = {
    tasks: visibleTasks,
    allTasks: tasks,
    activeTasks,
    completedTasks,
    getTaskById,
    updateTask,
    assignTaskFromAdmin,
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

