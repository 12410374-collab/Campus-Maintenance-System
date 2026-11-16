/**
 * Data contoh sementara notifikasi untuk modul Pelapor (Reporter).
 * Dipisahkan per reporterId agar siap dihubungkan dengan endpoint backend / JSON Server
 * (misal: GET /notifications?reporterId=<identifier>).
 *
 * Jenis notifikasi:
 * - submitted: Laporan berhasil dikirim
 * - pending_verification: Laporan sedang menunggu verifikasi Admin
 * - approved: Laporan telah disetujui
 * - assigned: Teknisi telah ditugaskan
 * - in_progress: Perbaikan sedang dikerjakan
 * - completed: Perbaikan telah selesai
 * - rejected: Laporan ditolak oleh Admin (disertai alasan)
 */

export const MOCK_REPORTER_NOTIFICATIONS = [
  // === NOTIFIKASI MAHASISWA (Student - Bryan Sompotan / 105021234) ===
  {
    id: 'NTF-101',
    reporterId: '105021234',
    type: 'in_progress',
    title: 'Perbaikan Sedang Dikerjakan',
    message:
      'Teknisi Rudi Hartono sedang membersihkan saluran kondensasi dan memeriksa kompresor AC di Lab Jaringan Komputer.',
    reportId: 'RPT-2026-0104',
    timestamp: '16 Nov 2026, 09:30',
    isRead: false,
  },
  {
    id: 'NTF-102',
    reporterId: '105021234',
    type: 'pending_verification',
    title: 'Menunggu Verifikasi Admin',
    message:
      'Laporan kerusakan Kran Wastafel Toilet Mahasiswa Lantai 2 sedang ditinjau oleh Admin Sarana & Prasarana.',
    reportId: 'RPT-2026-0106',
    timestamp: '15 Nov 2026, 10:25',
    isRead: false,
  },
  {
    id: 'NTF-103',
    reporterId: '105021234',
    type: 'approved',
    title: 'Laporan Telah Disetujui',
    message:
      'Laporan Port HDMI Dinding Lab Multimedia Longgar telah disetujui Admin dan masuk antrean penjadwalan teknisi.',
    reportId: 'RPT-2026-0105',
    timestamp: '14 Nov 2026, 13:15',
    isRead: false,
  },
  {
    id: 'NTF-104',
    reporterId: '105021234',
    type: 'assigned',
    title: 'Teknisi Telah Ditugaskan',
    message:
      'Teknisi pemeliharaan furnitur telah ditugaskan untuk memperbaiki Kursi Kuliah Lipat Engsel Patah di R.202.',
    reportId: 'RPT-2026-0103',
    timestamp: '13 Nov 2026, 08:45',
    isRead: true,
  },
  {
    id: 'NTF-105',
    reporterId: '105021234',
    type: 'submitted',
    title: 'Laporan Berhasil Dikirim',
    message:
      'Laporan baru mengenai Kran Wastafel Toilet Mahasiswa Lantai 2 Rusak telah diterima oleh sistem.',
    reportId: 'RPT-2026-0106',
    timestamp: '15 Nov 2026, 10:20',
    isRead: true,
  },
  {
    id: 'NTF-106',
    reporterId: '105021234',
    type: 'completed',
    title: 'Perbaikan Telah Selesai',
    message:
      'Perbaikan Lampu Lorong Asrama Putra Lt. 1 Mati telah selesai dikerjakan. Unit ballast dan lampu LED telah diganti.',
    reportId: 'RPT-2026-0094',
    timestamp: '11 Nov 2026, 15:40',
    isRead: true,
  },
  {
    id: 'NTF-107',
    reporterId: '105021234',
    type: 'rejected',
    title: 'Laporan Ditolak oleh Admin',
    message:
      'Laporan Permintaan Pemasangan Karpet di Gazebo Taman ditolak. Alasan: Area gazebo bersifat terbuka dan rawan hujan sehingga tidak sesuai standar pemeliharaan.',
    reportId: 'RPT-2026-0090',
    timestamp: '10 Nov 2026, 11:05',
    isRead: true,
  },

  // === NOTIFIKASI DOSEN (Lecturer - Dr. Jerry Rogi / 091234567) ===
  {
    id: 'NTF-201',
    reporterId: '091234567',
    type: 'in_progress',
    title: 'Perbaikan Sedang Dikerjakan',
    message:
      'Teknisi sedang memeriksa konektor HDMI extender di plafon Ruang Seminar untuk mengatasi sinyal proyektor putus-putus.',
    reportId: 'RPT-2026-0097',
    timestamp: '16 Nov 2026, 08:50',
    isRead: false,
  },
  {
    id: 'NTF-202',
    reporterId: '091234567',
    type: 'assigned',
    title: 'Teknisi Telah Ditugaskan',
    message:
      'Teknisi kelistrikan telah ditugaskan menangani Lampu Utama Ruang Kuliah 204 Padam dengan prioritas Tinggi.',
    reportId: 'RPT-2026-0102',
    timestamp: '15 Nov 2026, 14:10',
    isRead: false,
  },
  {
    id: 'NTF-203',
    reporterId: '091234567',
    type: 'pending_verification',
    title: 'Menunggu Verifikasi Admin',
    message:
      'Laporan Engsel Pintu Ruang Dosen FIK Berderit & Macet sedang menunggu verifikasi dari Admin Sarana.',
    reportId: 'RPT-2026-0107',
    timestamp: '15 Nov 2026, 09:45',
    isRead: true,
  },
  {
    id: 'NTF-204',
    reporterId: '091234567',
    type: 'submitted',
    title: 'Laporan Berhasil Dikirim',
    message:
      'Pengajuan laporan Engsel Pintu Ruang Dosen FIK telah berhasil masuk ke antrean sistem.',
    reportId: 'RPT-2026-0107',
    timestamp: '15 Nov 2026, 09:40',
    isRead: true,
  },
  {
    id: 'NTF-205',
    reporterId: '091234567',
    type: 'completed',
    title: 'Perbaikan Telah Selesai',
    message:
      'Engsel Pintu Ruang Baca Perpustakaan telah diperkuat dan kembali berfungsi normal tanpa bergesekan.',
    reportId: 'RPT-2026-0091',
    timestamp: '11 Nov 2026, 13:20',
    isRead: true,
  },

  // === NOTIFIKASI STAF (Staff - Maria Pangkey / 19850412) ===
  {
    id: 'NTF-301',
    reporterId: '19850412',
    type: 'in_progress',
    title: 'Perbaikan Sedang Dikerjakan',
    message:
      'Teknisi telah melepas pipa lama dan sedang memasang sambungan P-trap PVC baru di toilet Asrama Crystal Lt. 1.',
    reportId: 'RPT-2026-0098',
    timestamp: '16 Nov 2026, 10:05',
    isRead: false,
  },
  {
    id: 'NTF-302',
    reporterId: '19850412',
    type: 'approved',
    title: 'Laporan Telah Disetujui',
    message:
      'Laporan Scanner & Terminal Listrik Meja Front Office Mati disetujui Admin dan diteruskan ke tim teknisi elektro.',
    reportId: 'RPT-2026-0101',
    timestamp: '14 Nov 2026, 11:20',
    isRead: false,
  },
  {
    id: 'NTF-303',
    reporterId: '19850412',
    type: 'submitted',
    title: 'Laporan Berhasil Dikirim',
    message:
      'Laporan Scanner & Terminal Listrik Meja Front Office Mati berhasil tercatat di sistem.',
    reportId: 'RPT-2026-0101',
    timestamp: '14 Nov 2026, 08:30',
    isRead: true,
  },
  {
    id: 'NTF-304',
    reporterId: '19850412',
    type: 'completed',
    title: 'Perbaikan Telah Selesai',
    message:
      'Stopkontak Meja Administrasi GK2 R.102 telah diganti unit standar SNI baru dan diuji aman.',
    reportId: 'RPT-2026-0095',
    timestamp: '12 Nov 2026, 12:50',
    isRead: true,
  },
  {
    id: 'NTF-305',
    reporterId: '19850412',
    type: 'rejected',
    title: 'Laporan Ditolak oleh Admin',
    message:
      'Laporan Penggantian Warna Cat Ruangan Arsip ditolak. Alasan: Bukan kerusakan darurat; dijadwalkan ulang pada program renovasi semester berikutnya.',
    reportId: 'RPT-2026-0088',
    timestamp: '09 Nov 2026, 10:15',
    isRead: true,
  },
];

/**
 * Mengambil notifikasi khusus milik pengguna yang sedang login.
 */
export function filterNotificationsByReporter(notifications, user) {
  if (!user) return [];
  const userId = (user.identifier || '').toLowerCase();
  return notifications.filter(
    (item) => item.reporterId && item.reporterId.toLowerCase() === userId
  );
}
