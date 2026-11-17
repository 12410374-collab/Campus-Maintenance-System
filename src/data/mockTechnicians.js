/**
 * Data simulasi personel teknisi untuk halaman Admin Technician Management.
 * Konsisten dengan akun demo Teknisi pada AuthContext (TECH-001 - Rudi Hartono)
 * dan dataset tugas pada modul Teknisi & Admin.
 */

export const TECHNICIAN_AVAILABILITY_OPTIONS = [
  'Available',
  'On Duty',
  'Unavailable',
];

export const TECHNICIAN_SPECIALIZATION_OPTIONS = [
  'Electrical & AC Specialist',
  'Building & Civil Maintenance',
  'Furniture & General Hardware',
  'Electronics & Networking Hardware',
  'Plumbing & Water System',
  'HVAC & Cooling Specialist',
];

const CATEGORY_SPECIALIZATION_MAP = {
  Kelistrikan: ['Electrical & AC Specialist', 'HVAC & Cooling Specialist'],
  'Plumbing / Sanitasi': ['Plumbing & Water System'],
  Elektronik: ['Electronics & Networking Hardware', 'Electrical & AC Specialist'],
  Furniture: ['Furniture & General Hardware'],
  'Infrastruktur / Bangunan': ['Building & Civil Maintenance'],
  Lainnya: ['Furniture & General Hardware', 'Building & Civil Maintenance'],
};

/**
 * Menentukan apakah spesialisasi teknisi direkomendasikan untuk kategori laporan tertentu
 */
export function isTechnicianRecommended(reportCategory, specialization) {
  if (!reportCategory || !specialization) return false;
  const preferredList = CATEGORY_SPECIALIZATION_MAP[reportCategory] || [];
  return preferredList.includes(specialization);
}

/**
 * Menghitung kategori dan persentase beban kerja berdasarkan jumlah tugas aktif.
 * Skala simulasi kapasitas optimal per teknisi = 3 tugas aktif.
 */
export function getWorkloadMetrics(activeTasks = 0) {
  const safeCount = Math.max(0, Number(activeTasks) || 0);
  const maxCapacity = 3;
  const percent = Math.min(Math.round((safeCount / maxCapacity) * 100), 100);

  if (safeCount >= 3) {
    return {
      level: 'Tinggi',
      percent,
      barClass: 'from-[#F59E0B] to-rose-500',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (safeCount === 2) {
    return {
      level: 'Sedang',
      percent,
      barClass: 'from-[#2563EB] to-[#06B6D4]',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  return {
    level: 'Ringan',
    percent,
    barClass: 'from-emerald-400 to-[#06B6D4]',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

export const MOCK_TECHNICIANS = [
  {
    id: 'TECH-001',
    name: 'Rudi Hartono',
    email: 'rudi.tech@unklab.ac.id',
    phone: '0812-4410-8821',
    specialization: 'Electrical & AC Specialist',
    availability: 'On Duty',
    activeTasks: 2,
    completedTasks: 14,
    avatarColor: 'from-[#2563EB] to-[#8B5CF6]',
    joinedAt: 'Jan 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0109',
        title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
        location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
        date: '15 Nov 2026',
        status: 'In Progress',
      },
      {
        reportId: 'RPT-2026-0106',
        title: 'Lampu Utama Ruang Kuliah 204 Padam',
        location: 'GK1 - Lantai 2, Ruang Kuliah 204',
        date: '14 Nov 2026',
        status: 'Assigned',
      },
      {
        reportId: 'RPT-2026-0103',
        title: 'Lampu Lorong Asrama Putra Lt. 1 Mati',
        location: 'Asrama Crystal - Koridor Lantai 1',
        date: '12 Nov 2026',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TECH-002',
    name: 'Daniel Tendean',
    email: 'daniel.tendean@unklab.ac.id',
    phone: '0813-5529-1044',
    specialization: 'Building & Civil Maintenance',
    availability: 'On Duty',
    activeTasks: 3,
    completedTasks: 11,
    avatarColor: 'from-[#06B6D4] to-[#2563EB]',
    joinedAt: 'Mar 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0108',
        title: 'Plafon Koridor Perpustakaan Merembes Air Hujan',
        location: 'Gedung Perpustakaan - Koridor Sayap Barat',
        date: '15 Nov 2026',
        status: 'In Progress',
      },
      {
        reportId: 'RPT-2026-0104',
        title: 'Sakelar & Stopkontak Meja Dosen Ruang 108 Longgar',
        location: 'GK1 - Lantai 1, Ruang Kuliah 108',
        date: '13 Nov 2026',
        status: 'In Progress',
      },
      {
        reportId: 'RPT-2026-0098',
        title: 'Perbaikan Keramik Tangga Masuk GK1',
        location: 'GK1 - Lobi Utama',
        date: '09 Nov 2026',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TECH-003',
    name: 'Hendrik Kalangi',
    email: 'hendrik.kalangi@unklab.ac.id',
    phone: '0821-8890-3312',
    specialization: 'Furniture & General Hardware',
    availability: 'On Duty',
    activeTasks: 1,
    completedTasks: 9,
    avatarColor: 'from-[#8B5CF6] to-indigo-600',
    joinedAt: 'Jun 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0107',
        title: 'Pintu Darurat Auditorium Macet Saat Dibuka',
        location: 'Pioneer Chapel - Pintu Samping Timur',
        date: '14 Nov 2026',
        status: 'Assigned',
      },
      {
        reportId: 'RPT-2026-0102',
        title: 'Kursi Kuliah Lipat Engsel Patah di R.202',
        location: 'GK1 - Lantai 2, Ruang Kuliah 202',
        date: '11 Nov 2026',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TECH-004',
    name: 'Samuel Rumengan',
    email: 'samuel.rumengan@unklab.ac.id',
    phone: '0852-9914-7720',
    specialization: 'Electronics & Networking Hardware',
    availability: 'Available',
    activeTasks: 0,
    completedTasks: 12,
    avatarColor: 'from-emerald-500 to-[#06B6D4]',
    joinedAt: 'Feb 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0095',
        title: 'Kalibrasi Panel Audio Sistem Ruang Seminar',
        location: 'GK2 - Lantai 1, Ruang Seminar',
        date: '08 Nov 2026',
        status: 'Completed',
      },
      {
        reportId: 'RPT-2026-0089',
        title: 'Penggantian Konektor Proyektor Lab Komputer 1',
        location: 'GK2 - Lantai 2',
        date: '04 Nov 2026',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TECH-005',
    name: 'Kevin Walean',
    email: 'kevin.walean@unklab.ac.id',
    phone: '0812-7731-6509',
    specialization: 'Plumbing & Water System',
    availability: 'Available',
    activeTasks: 0,
    completedTasks: 8,
    avatarColor: 'from-blue-600 to-teal-500',
    joinedAt: 'Sep 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0092',
        title: 'Penggantian Katup Pompa Air Asrama Putri',
        location: 'Asrama Jasmine - Ruang Pompa',
        date: '07 Nov 2026',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'TECH-006',
    name: 'Andre Wowiling',
    email: 'andre.wowiling@unklab.ac.id',
    phone: '0811-4320-9187',
    specialization: 'HVAC & Cooling Specialist',
    availability: 'Unavailable',
    activeTasks: 0,
    completedTasks: 10,
    avatarColor: 'from-slate-600 to-slate-800',
    joinedAt: 'Apr 2024',
    workHistory: [
      {
        reportId: 'RPT-2026-0087',
        title: 'Servis Rutin Chiller Ruang Server Pusat',
        location: 'Gedung Rektorat - Ruang Server',
        date: '03 Nov 2026',
        status: 'Completed',
      },
    ],
  },
];
