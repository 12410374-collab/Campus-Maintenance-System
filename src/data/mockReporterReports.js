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
    id: 'RPT-2026-0109',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'AC Bocor & Tidak Dingin di Lab Jaringan',
    category: 'Kelistrikan',
    location: 'GK2 - Lantai 2, Lab Jaringan Komputer',
    reportedDate: '15 Nov 2026, 14:20',
    urgency: 'Tinggi',
    status: 'In Progress',
    description:
      'Unit AC split meneteskan air ke meja praktikum dan kompresor terdengar bekerja berat.',
    statusNote: 'Teknisi sedang melakukan pembersihan saluran kondensasi dan pengecekan kompresor.',
  },
  {
    id: 'RPT-2026-0110',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Proyektor LCD Ruang Kuliah 301 Tidak Menampilkan Gambar',
    category: 'Elektronik',
    location: 'GK1 - Lantai 3, Ruang Kuliah 301',
    reportedDate: '16 Nov 2026, 08:10',
    urgency: 'Sedang',
    status: 'Pending',
    description:
      'Lampu indikator proyektor menyala hijau namun layar proyeksi tetap biru meski laptop sudah terhubung.',
    statusNote: 'Laporan telah diterima sistem dan sedang menunggu verifikasi Admin Fasilitas.',
  },
  {
    id: 'RPT-2026-0102',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Kursi Kuliah Lipat Engsel Patah di R.202',
    category: 'Furniture',
    location: 'GK1 - Lantai 2, Ruang Kuliah 202',
    reportedDate: '11 Nov 2026, 13:45',
    urgency: 'Rendah',
    status: 'Completed',
    description:
      'Meja lipat pada dua kursi di baris tengah miring karena baut engsel terlepas.',
    statusNote: 'Penggantian baut penyangga meja lipat pada 2 unit kursi mahasiswa telah selesai.',
  },
  {
    id: 'RPT-2026-0105',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Port HDMI Dinding Lab Multimedia Longgar',
    category: 'Elektronik',
    location: 'GK2 - Lantai 3, Lab Multimedia',
    reportedDate: '14 Nov 2026, 08:25',
    urgency: 'Sedang',
    status: 'Approved',
    description:
      'Kabel HDMI harus ditahan agar tampilan ke proyektor tidak berkedip selama praktikum.',
    statusNote: 'Telah diverifikasi Admin, menunggu penjadwalan teknisi elektronik.',
  },
  {
    id: 'RPT-2026-0103',
    reporterId: '105021234',
    reporterName: 'Bryan Sompotan',
    reporterRole: 'Student',
    title: 'Lampu Lorong Asrama Putra Lt. 1 Mati',
    category: 'Kelistrikan',
    location: 'Asrama Crystal - Koridor Lantai 1',
    reportedDate: '12 Nov 2026, 19:30',
    urgency: 'Tinggi',
    status: 'Completed',
    description:
      'Dua titik lampu koridor utama padam sejak sore hari sehingga area tangga gelap.',
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
    id: 'RPT-2026-0106',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Lampu Utama Ruang Kuliah 204 Padam',
    category: 'Kelistrikan',
    location: 'GK1 - Lantai 2, Ruang Kuliah 204',
    reportedDate: '14 Nov 2026, 09:50',
    urgency: 'Tinggi',
    status: 'Assigned',
    description:
      'Tiga lampu LED utama di ruang kuliah 204 mati total saat sakelar utama dinyalakan.',
    statusNote: 'Prioritas High. Sudah ditugaskan ke teknisi kelistrikan Rudi Hartono.',
  },
  {
    id: 'RPT-2026-0097',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Koneksi Proyektor Plafon Sering Mati Mendadak',
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
    id: 'RPT-2026-0112',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Panel MCB Lantai 2 Berbau Hangus & Sering Trip',
    category: 'Kelistrikan',
    location: 'GK2 - Ruang Panel Lantai 2',
    reportedDate: '16 Nov 2026, 09:40',
    urgency: 'Kritis',
    status: 'Pending',
    description:
      'Panel distribusi listrik di lorong lantai 2 mengeluarkan bau terbakar ringan dan MCB utama turun dua kali pagi ini.',
    statusNote: 'Menunggu verifikasi Admin Sarana & Prasarana.',
  },
  {
    id: 'RPT-2026-0091',
    reporterId: '091234567',
    reporterName: 'Dr. Jerry Rogi, S.Kom., M.T.',
    reporterRole: 'Lecturer',
    title: 'Pintu Ruang Baca Engsel Longgar & Rusak',
    category: 'Furniture',
    location: 'Perpustakaan Pusat - Lantai 2',
    reportedDate: '11 Nov 2026, 11:30',
    urgency: 'Sedang',
    status: 'Completed',
    description:
      'Engsel atas kendor sehingga daun pintu menggesek lantai parquet.',
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
    id: 'RPT-2026-0111',
    reporterId: '19850412',
    reporterName: 'Maria Pangkey, S.E.',
    reporterRole: 'Staff',
    title: 'Kebocoran Pipa Utama Toilet Wanita Lantai 1',
    category: 'Plumbing / Sanitasi',
    location: 'GK1 - Toilet Wanita Lantai 1',
    reportedDate: '16 Nov 2026, 08:55',
    urgency: 'Tinggi',
    status: 'Pending',
    description:
      'Sambungan pipa di bawah wastafel utama merembes cukup deras sejak jam 08:30 dan membuat lantai koridor licin.',
    statusNote: 'Menunggu verifikasi Admin Sarana & Prasarana.',
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
