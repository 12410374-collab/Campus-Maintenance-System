/**
 * Data contoh sementara laporan fasilitas untuk modul Pelapor (Reporter).
 * Dipisahkan dari komponen UI agar mudah diganti dengan fetch API / JSON Server:
 * contoh endpoint nantinya: GET /reports?reporterId=<identifier>
 */

export const REPORT_STATUS_OPTIONS = [
  'Pending',
  'Approved',
  'Assigned',
  'In Progress',
  'Completed',
  'Rejected',
];

export const REPORT_CATEGORY_OPTIONS = [
  'Kelistrikan',
  'Plumbing / Sanitasi',
  'Elektronik',
  'Furniture',
  'Infrastruktur / Bangunan',
  'Lainnya',
];

export const MOCK_REPORTER_REPORTS = [
  // === LAPORAN MAHASISWA (Student - Bryan Sompotan / 105021234) ===
  {
    id: 'RPT-2026-0104',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Kelistrikan',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    reportedDate: '13 Nov 2026, 09:15',
    urgency: 'Tinggi',
    status: 'In Progress',
    description:
      'Unit AC split meneteskan air ke meja praktikum dan mengeluarkan suara berisik saat jam praktikum berlangsung.',
    statusNote: 'Teknisi sedang melakukan pembersihan saluran kondensasi dan pengecekan kompresor.',
  },
  {
    id: 'RPT-2026-0106',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Kran Wastafel Toilet Mahasiswa Lantai 2 Rusak',
    category: 'Plumbing / Sanitasi',
    location: 'GK2 - Toilet Pria Lantai 2',
    reportedDate: '15 Nov 2026, 10:20',
    urgency: 'Sedang',
    status: 'Pending',
    description:
      'Tuas kran air lepas sehingga air tidak dapat mengalir saat digunakan mahasiswa.',
    statusNote: 'Laporan telah diterima sistem dan sedang menunggu verifikasi Admin Fasilitas.',
  },
  {
    id: 'RPT-2026-0103',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Kursi Kuliah Lipat Engsel Patah di R.202',
    category: 'Furniture',
    location: 'GK1 - Lantai 2, Ruang Kuliah 202',
    reportedDate: '12 Nov 2026, 14:10',
    urgency: 'Sedang',
    status: 'Assigned',
    description:
      'Dua unit meja lipat pada kursi kuliah baris tengah patah baut penyangganya.',
    statusNote: 'Laporan telah disetujui dan ditugaskan kepada teknisi pemeliharaan furnitur.',
  },
  {
    id: 'RPT-2026-0105',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Port HDMI Dinding Lab Multimedia Longgar',
    category: 'Elektronik',
    location: 'GK2 - Lantai 3, Lab Multimedia',
    reportedDate: '14 Nov 2026, 11:05',
    urgency: 'Sedang',
    status: 'Approved',
    description:
      'Soket dinding HDMI tidak terkunci rapat sehingga tampilan layar proyektor sering berkedip.',
    statusNote: 'Telah diverifikasi Admin, menunggu penjadwalan teknisi elektronik.',
  },
  {
    id: 'RPT-2026-0094',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Lampu Lorong Asrama Putra Lt. 1 Mati',
    category: 'Kelistrikan',
    location: 'Asrama Crystal - Koridor Lantai 1',
    reportedDate: '10 Nov 2026, 19:30',
    urgency: 'Tinggi',
    status: 'Completed',
    description:
      'Dua titik lampu koridor utama padam total sejak sore hari sehingga lorong gelap.',
    statusNote: 'Unit ballast dan bohlam LED telah diganti. Penerangan normal kembali.',
  },
  {
    id: 'RPT-2026-0090',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Permintaan Pemasangan Karpet di Gazebo Taman',
    category: 'Lainnya',
    location: 'Taman Depan Fakultas Ilmu Komputer',
    reportedDate: '09 Nov 2026, 13:00',
    urgency: 'Rendah',
    status: 'Rejected',
    description:
      'Mengusulkan pemasangan karpet permanen di area gazebo diskusi luar ruangan.',
    statusNote: 'Ditolak: Area gazebo bersifat terbuka dan rawan hujan sehingga tidak sesuai standar pemeliharaan.',
  },

  // === LAPORAN DOSEN (Lecturer - Dr. Jerry Rogi / 091234567) ===
  {
    id: 'RPT-2026-0102',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Kelistrikan',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    reportedDate: '13 Nov 2026, 08:00',
    urgency: 'Tinggi',
    status: 'Assigned',
    description:
      'Lampu tabung LED utama tidak menyala saat sakelar ditekan menjelang perkuliahan pagi.',
    statusNote: 'Prioritas Tinggi. Sudah ditugaskan ke teknisi kelistrikan untuk pemeriksaan hari ini.',
  },
  {
    id: 'RPT-2026-0097',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Koneksi Proyektor Plafon Ruang Seminar Putus-Putus',
    category: 'Elektronik',
    location: 'GK2 - Lantai 3, Ruang Seminar',
    reportedDate: '12 Nov 2026, 13:10',
    urgency: 'Sedang',
    status: 'In Progress',
    description:
      'Sinyal tampilan proyektor sering hilang mendadak di tengah presentasi mahasiswa.',
    statusNote: 'Teknisi sedang memeriksa konektor HDMI extender di plafon.',
  },
  {
    id: 'RPT-2026-0107',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Engsel Pintu Ruang Dosen FIK Berderit & Macet',
    category: 'Infrastruktur / Bangunan',
    location: 'GK2 - Lantai 2, Ruang Dosen FIK',
    reportedDate: '15 Nov 2026, 09:40',
    urgency: 'Rendah',
    status: 'Pending',
    description:
      'Pintu masuk ruang dosen sulit ditutup rapat karena engsel atas sedikit turun.',
    statusNote: 'Menunggu verifikasi Admin Sarana & Prasarana.',
  },
  {
    id: 'RPT-2026-0091',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Pintu Ruang Baca Perpustakaan Longgar',
    category: 'Furniture',
    location: 'Perpustakaan Pusat - Lantai 2',
    reportedDate: '11 Nov 2026, 11:30',
    urgency: 'Sedang',
    status: 'Completed',
    description:
      'Sekrup engsel atas kendor sehingga daun pintu menggesek lantai.',
    statusNote: 'Engsel sudah diperkuat dengan fischer dan sekrup baru. Berfungsi normal.',
  },

  // === LAPORAN STAF (Staff - Maria Pangkey / 19850412) ===
  {
    id: 'RPT-2026-0098',
    reporterId: '19850412',
    reporterName: 'Maria Pangkey, S.E.',
    reporterRole: 'Staff',
    title: 'Pipa Wastafel Bocor Menggenangi Lantai',
    category: 'Plumbing / Sanitasi',
    location: 'Asrama Crystal - Toilet Lantai 1',
    reportedDate: '12 Nov 2026, 14:20',
    urgency: 'Tinggi',
    status: 'In Progress',
    description:
      'Saluran P-trap di bawah wastafel retak sehingga air mengalir langsung ke koridor.',
    statusNote: 'Pipa lama sudah dilepas, teknisi sedang memasang sambungan PVC baru.',
  },
  {
    id: 'RPT-2026-0101',
    reporterId: '19850412',
    reporterName: 'Maria Pangkey, S.E.',
    reporterRole: 'Staff',
    title: 'Scanner & Terminal Listrik Meja Front Office Mati',
    category: 'Elektronik',
    location: 'Gedung Administrasi - Biro Akademik Lt. 1',
    reportedDate: '14 Nov 2026, 08:30',
    urgency: 'Tinggi',
    status: 'Approved',
    description:
      'Stopkontak ekstensi dan unit UPS meja layanan akademik mengeluarkan bunyi bip panjang dan mati.',
    statusNote: 'Laporan disetujui Admin, sedang diteruskan ke teknisi elektro.',
  },
  {
    id: 'RPT-2026-0095',
    reporterId: '19850412',
    reporterName: 'Maria Pangkey, S.E.',
    reporterRole: 'Staff',
    title: 'Stopkontak Meja Administrasi Korslet & Hangus',
    category: 'Kelistrikan',
    location: 'GK2 - Lantai 1, Ruang 102',
    reportedDate: '12 Nov 2026, 10:45',
    urgency: 'Kritis',
    status: 'Completed',
    description:
      'Tercium bau hangus dari stopkontak dinding saat perangkat kantor dinyalakan.',
    statusNote: 'Stopkontak diganti baru standar SNI dan tegangan listrik telah diuji aman.',
  },
  {
    id: 'RPT-2026-0088',
    reporterId: '19850412',
    reporterName: 'Maria Pangkey, S.E.',
    reporterRole: 'Staff',
    title: 'Penggantian Warna Cat Ruangan Arsip',
    category: 'Infrastruktur / Bangunan',
    location: 'Gedung Administrasi - Ruang Arsip',
    reportedDate: '08 Nov 2026, 15:00',
    urgency: 'Rendah',
    status: 'Rejected',
    description:
      'Permintaan pengecatan ulang seluruh dinding ruang arsip dengan warna biru muda.',
    statusNote: 'Ditolak: Bukan kerusakan darurat; dijadwalkan ulang pada program renovasi semester berikutnya.',
  },
];

/**
 * Mengambil daftar laporan khusus milik pengguna yang sedang login.
 * Membandingkan reporterId atau email pengguna secara case-insensitive.
 */
export function filterReportsByReporter(reports, user) {
  if (!user) return [];
  const userId = (user.identifier || '').toLowerCase();
  const userName = (user.name || '').toLowerCase();

  return reports.filter((item) => {
    const matchId = item.reporterId && item.reporterId.toLowerCase() === userId;
    const matchName = item.reporterName && item.reporterName.toLowerCase() === userName;
    return matchId || matchName;
  });
}
