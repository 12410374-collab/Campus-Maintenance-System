/**
 * Data simulasi sementara untuk Admin Dashboard (modul Administrator).
 * Dipisahkan dari komponen UI agar mudah diganti dengan API backend / JSON Server nantinya.
 */

export const ADMIN_REPORT_STATUSES = [
  'Pending',
  'Approved',
  'Assigned',
  'In Progress',
  'Completed',
  'Rejected',
];

export const ADMIN_PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];

export const ADMIN_CATEGORY_OPTIONS = [
  'Kelistrikan',
  'Plumbing / Sanitasi',
  'Elektronik',
  'Furniture',
  'Infrastruktur / Bangunan',
  'Lainnya',
];

export const MOCK_ADMIN_REPORTS = [
  {
    id: 'RPT-2026-0112',
    title: 'Panel MCB Lantai 2 Berbau Hangus & Sering Trip',
    category: 'Kelistrikan',
    location: 'GK2 - Ruang Panel Lantai 2',
    reporterName: 'Dr. Jerry Rogi',
    reporterRole: 'Dosen',
    reportedDate: '16 Nov 2026, 09:40',
    reportedIsoDate: '2026-11-16',
    status: 'Pending',
    aiUrgency: 'Critical',
    adminPriority: null, // Menunggu penetapan akhir Admin
    assignedTechnician: null,
    rejectionReason: null,
    damagePhoto:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    aiSummary:
      'Potensi bahaya kelistrikan tinggi; disarankan inspeksi panel segera dan penutupan jalur sementara.',
    description:
      'Panel distribusi listrik di lorong lantai 2 mengeluarkan bau terbakar ringan dan MCB utama turun dua kali pagi ini.',
  },
  {
    id: 'RPT-2026-0111',
    title: 'Kebocoran Pipa Utama Toilet Wanita Lantai 1',
    category: 'Plumbing / Sanitasi',
    location: 'GK1 - Toilet Wanita Lantai 1',
    reporterName: 'Maria Pangkey',
    reporterRole: 'Staf',
    reportedDate: '16 Nov 2026, 08:55',
    reportedIsoDate: '2026-11-16',
    status: 'Pending',
    aiUrgency: 'High',
    adminPriority: null,
    assignedTechnician: null,
    rejectionReason: null,
    damagePhoto:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    aiSummary:
      'Kebocoran pipa bertekanan dapat menggenangi koridor dan merusak lantai jika dibiarkan.',
    description:
      'Sambungan pipa di bawah wastafel utama merembes cukup deras sejak jam 08:30 dan membuat lantai koridor licin.',
  },
  {
    id: 'RPT-2026-0110',
    title: 'Proyektor LCD Ruang Kuliah 301 Tidak Menampilkan Gambar',
    category: 'Elektronik',
    location: 'GK1 - Lantai 3, Ruang Kuliah 301',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '16 Nov 2026, 08:10',
    reportedIsoDate: '2026-11-16',
    status: 'Pending',
    aiUrgency: 'Medium',
    adminPriority: null,
    assignedTechnician: null,
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Gangguan perangkat presentasi kelas; cek kabel HDMI, port input, serta lampu proyektor.',
    description:
      'Lampu indikator proyektor menyala hijau namun layar proyeksi tetap biru meski laptop sudah terhubung.',
  },
  {
    id: 'RPT-2026-0109',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Kelistrikan',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '15 Nov 2026, 14:20',
    reportedIsoDate: '2026-11-15',
    status: 'In Progress',
    aiUrgency: 'High',
    adminPriority: 'Critical',
    assignedTechnician: 'Rudi Hartono',
    rejectionReason: null,
    damagePhoto:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    aiSummary:
      'Kebocoran kondensasi AC berisiko mengenai perangkat praktikum dan menaikkan suhu ruang server.',
    description:
      'Unit AC split meneteskan air ke meja praktikum dan kompresor terdengar bekerja berat.',
  },
  {
    id: 'RPT-2026-0108',
    title: 'Plafon Koridor Perpustakaan Merembes Air Hujan',
    category: 'Infrastruktur / Bangunan',
    location: 'Gedung Perpustakaan - Koridor Sayap Barat',
    reporterName: 'Maria Pangkey',
    reporterRole: 'Staf',
    reportedDate: '15 Nov 2026, 11:30',
    reportedIsoDate: '2026-11-15',
    status: 'In Progress',
    aiUrgency: 'High',
    adminPriority: 'High',
    assignedTechnician: 'Daniel Tendean',
    rejectionReason: null,
    damagePhoto:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    aiSummary:
      'Rembesan atap berisiko menjatuhkan gypsum dan membasahi area rak buku.',
    description:
      'Dua panel gypsum koridor barat tampak basah dan sedikit melengkung setelah hujan deras tadi malam.',
  },
  {
    id: 'RPT-2026-0107',
    title: 'Pintu Darurat Auditorium Macet Saat Dibuka',
    category: 'Infrastruktur / Bangunan',
    location: 'Pioneer Chapel - Pintu Samping Timur',
    reporterName: 'Dr. Jerry Rogi',
    reporterRole: 'Dosen',
    reportedDate: '14 Nov 2026, 16:05',
    reportedIsoDate: '2026-11-14',
    status: 'Assigned',
    aiUrgency: 'High',
    adminPriority: 'Critical',
    assignedTechnician: 'Hendrik Kalangi',
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Akses evakuasi harus selalu berfungsi lancar; dinaikkan ke prioritas Critical oleh Admin.',
    description:
      'Engsel bawah pintu darurat timur tersangkut dan panic bar terasa macet saat ditekan.',
  },
  {
    id: 'RPT-2026-0106',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Kelistrikan',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    reporterName: 'Dr. Jerry Rogi',
    reporterRole: 'Dosen',
    reportedDate: '14 Nov 2026, 09:50',
    reportedIsoDate: '2026-11-14',
    status: 'Assigned',
    aiUrgency: 'Medium',
    adminPriority: 'High',
    assignedTechnician: 'Rudi Hartono',
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Ruangan dijadwalkan untuk kelas siang sehingga Admin menaikkan prioritas menjadi High.',
    description:
      'Tiga lampu LED utama di ruang kuliah 204 mati total saat sakelar utama dinyalakan.',
  },
  {
    id: 'RPT-2026-0105',
    title: 'Port HDMI Dinding Lab Multimedia Longgar',
    category: 'Elektronik',
    location: 'GK2 - Lantai 3, Lab Multimedia',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '14 Nov 2026, 08:25',
    reportedIsoDate: '2026-11-14',
    status: 'Approved',
    aiUrgency: 'Medium',
    adminPriority: 'Medium',
    assignedTechnician: null,
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Konektor panel dinding perlu penggantian modul soket agar sinyal proyektor stabil.',
    description:
      'Kabel HDMI harus ditahan agar tampilan ke proyektor tidak berkedip selama praktikum.',
  },
  {
    id: 'RPT-2026-0104',
    title: 'Sakelar & Stopkontak Meja Dosen Ruang 108 Longgar',
    category: 'Kelistrikan',
    location: 'GK1 - Lantai 1, Ruang Kuliah 108',
    reporterName: 'Dr. Jerry Rogi',
    reporterRole: 'Dosen',
    reportedDate: '13 Nov 2026, 15:10',
    reportedIsoDate: '2026-11-13',
    status: 'In Progress',
    aiUrgency: 'Medium',
    adminPriority: 'Medium',
    assignedTechnician: 'Daniel Tendean',
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Perlu pengencangan rumah stopkontak tanam dan pengecekan terminal kabel fasa/netral.',
    description:
      'Stopkontak pada meja dosen goyang dan kadang memutus daya adaptor laptop.',
  },
  {
    id: 'RPT-2026-0103',
    title: 'Lampu Lorong Asrama Putra Lt. 1 Mati',
    category: 'Kelistrikan',
    location: 'Asrama Crystal - Koridor Lantai 1',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '12 Nov 2026, 19:30',
    reportedIsoDate: '2026-11-12',
    status: 'Completed',
    aiUrgency: 'High',
    adminPriority: 'High',
    assignedTechnician: 'Rudi Hartono',
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Penerangan koridor asrama krusial untuk keamanan malam hari; telah selesai ditangani.',
    description:
      'Dua titik lampu koridor utama padam sejak sore hari sehingga area tangga gelap.',
  },
  {
    id: 'RPT-2026-0102',
    title: 'Kursi Kuliah Lipat Engsel Patah di R.202',
    category: 'Furniture',
    location: 'GK1 - Lantai 2, Ruang Kuliah 202',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '11 Nov 2026, 13:45',
    reportedIsoDate: '2026-11-11',
    status: 'Completed',
    aiUrgency: 'Low',
    adminPriority: 'Low',
    assignedTechnician: 'Hendrik Kalangi',
    rejectionReason: null,
    damagePhoto: null,
    aiSummary:
      'Penggantian baut penyangga meja lipat pada 2 unit kursi mahasiswa telah selesai.',
    description:
      'Meja lipat pada dua kursi di baris tengah miring karena baut engsel terlepas.',
  },
  {
    id: 'RPT-2026-0101',
    title: 'Permintaan Cat Ulang Dinding Ruang Organisasi Mahasiswa',
    category: 'Lainnya',
    location: 'Student Center - Ruang BEM',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Mahasiswa',
    reportedDate: '10 Nov 2026, 10:15',
    reportedIsoDate: '2026-11-10',
    status: 'Rejected',
    aiUrgency: 'Low',
    adminPriority: 'Low',
    assignedTechnician: null,
    rejectionReason:
      'Permintaan pengecatan estetika tidak termasuk kerusakan fasilitas mendesak dan dialihkan ke agenda pemeliharaan rutin semester.',
    damagePhoto: null,
    aiSummary:
      'Termasuk pembaruan estetika non-darurat; dialihkan ke jadwal pemeliharaan semester.',
    description:
      'Mengajukan pengecatan ulang seluruh dinding ruang BEM dengan warna baru menjelang acara.',
  },
];

export const MOCK_ADMIN_TECHNICIANS = [
  {
    id: 'TECH-001',
    name: 'Rudi Hartono',
    specialization: 'Electrical & AC Specialist',
    status: 'On Duty',
    activeTasks: 2,
    completedTasks: 14,
  },
  {
    id: 'TECH-002',
    name: 'Daniel Tendean',
    specialization: 'Building & Civil Maintenance',
    status: 'On Duty',
    activeTasks: 2,
    completedTasks: 11,
  },
  {
    id: 'TECH-003',
    name: 'Hendrik Kalangi',
    specialization: 'Furniture & General Hardware',
    status: 'On Duty',
    activeTasks: 1,
    completedTasks: 9,
  },
  {
    id: 'TECH-004',
    name: 'Samuel Rumengan',
    specialization: 'Electronics & Networking Hardware',
    status: 'Available',
    activeTasks: 0,
    completedTasks: 12,
  },
  {
    id: 'TECH-005',
    name: 'Kevin Walean',
    specialization: 'Plumbing & Water System',
    status: 'Available',
    activeTasks: 0,
    completedTasks: 8,
  },
];

// Tren aktivitas pemeliharaan 7 hari terakhir (konsisten dengan tanggal laporan 10-16 Nov 2026)
export const MOCK_MAINTENANCE_ACTIVITY = [
  { day: '10 Nov', label: 'Sel', incoming: 1, resolved: 0, inProgress: 0 },
  { day: '11 Nov', label: 'Rab', incoming: 1, resolved: 1, inProgress: 0 },
  { day: '12 Nov', label: 'Kam', incoming: 1, resolved: 1, inProgress: 1 },
  { day: '13 Nov', label: 'Jum', incoming: 1, resolved: 0, inProgress: 2 },
  { day: '14 Nov', label: 'Sab', incoming: 3, resolved: 0, inProgress: 2 },
  { day: '15 Nov', label: 'Min', incoming: 2, resolved: 0, inProgress: 3 },
  { day: '16 Nov', label: 'Sen', incoming: 3, resolved: 0, inProgress: 3 },
];

// Operational Activity Feed untuk Admin Command Center
export const MOCK_ADMIN_ACTIVITIES = [
  {
    id: 'ACT-201',
    type: 'incoming',
    title: 'Laporan baru diterima',
    detail: 'Panel MCB Lantai 2 Berbau Hangus & Sering Trip (GK2) — AI menandai Critical.',
    reportId: 'RPT-2026-0112',
    actor: 'Dr. Jerry Rogi (Dosen)',
    timestamp: '16 Nov 2026, 09:40',
  },
  {
    id: 'ACT-202',
    type: 'incoming',
    title: 'Laporan baru diterima',
    detail: 'Kebocoran Pipa Utama Toilet Wanita Lantai 1 membutuhkan verifikasi.',
    reportId: 'RPT-2026-0111',
    actor: 'Maria Pangkey (Staf)',
    timestamp: '16 Nov 2026, 08:55',
  },
  {
    id: 'ACT-203',
    type: 'assigned',
    title: 'Teknisi menangani perbaikan',
    detail: 'Rudi Hartono memperbarui progres flushing kondensasi AC Lab Jaringan.',
    reportId: 'RPT-2026-0109',
    actor: 'Rudi Hartono (TECH-001)',
    timestamp: '15 Nov 2026, 15:10',
  },
  {
    id: 'ACT-204',
    type: 'priority',
    title: 'Prioritas akhir dinaikkan Admin',
    detail: 'Pintu Darurat Auditorium Macet dinaikkan dari High (AI) menjadi Critical.',
    reportId: 'RPT-2026-0107',
    actor: 'Admin Sarana & Fasilitas',
    timestamp: '14 Nov 2026, 16:20',
  },
  {
    id: 'ACT-205',
    type: 'approved',
    title: 'Admin menyetujui laporan',
    detail: 'Port HDMI Dinding Lab Multimedia Longgar disetujui & masuk antrean teknisi.',
    reportId: 'RPT-2026-0105',
    actor: 'Admin Sarana & Fasilitas',
    timestamp: '14 Nov 2026, 09:05',
  },
  {
    id: 'ACT-206',
    type: 'completed',
    title: 'Perbaikan telah selesai',
    detail: 'Lampu Lorong Asrama Putra Lt. 1 Mati tuntas diperbaiki & diverifikasi.',
    reportId: 'RPT-2026-0103',
    actor: 'Rudi Hartono (TECH-001)',
    timestamp: '13 Nov 2026, 11:20',
  },
];

