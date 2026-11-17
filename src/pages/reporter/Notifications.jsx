import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Inbox,
  CheckCheck,
  Check,
  Send,
  Clock,
  ClipboardCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Briefcase,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  formatWitaDateOnly,
  parseWitaTimestampMs,
} from '../../utils/dateFormat';
import {
  getNotificationsByRecipientId,
  markNotificationAsRead as markNotificationAsReadInApi,
} from '../../services/activityNotificationService';
import {
  MOCK_REPORTER_NOTIFICATIONS,
  filterNotificationsByReporter,
} from '../../data/mockReporterNotifications';

function groupNotificationsByTime(list) {
  const now = new Date();
  const todayPrefix = formatWitaDateOnly(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayPrefix = formatWitaDateOnly(yesterdayDate);

  const groups = {
    'Hari Ini': [],
    Kemarin: [],
    Sebelumnya: [],
  };

  list.forEach((item) => {
    const ts = item.timestamp || '';
    if (ts.startsWith(todayPrefix)) {
      groups['Hari Ini'].push(item);
    } else if (ts.startsWith(yesterdayPrefix)) {
      groups.Kemarin.push(item);
    } else {
      groups.Sebelumnya.push(item);
    }
  });

  return [
    { title: 'Hari Ini', items: groups['Hari Ini'] },
    { title: 'Kemarin', items: groups.Kemarin },
    { title: 'Sebelumnya', items: groups.Sebelumnya },
  ].filter((group) => group.items.length > 0);
}

export default function Notifications() {
  const { user, role } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      if (!user?.identifier) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setActiveFilter('ALL');

      try {
        const apiNotifs = await getNotificationsByRecipientId(user.identifier);
        if (!isMounted) return;

        const userId = user.identifier.toLowerCase();
        const ownedNotifs = apiNotifs
          .filter((item) => {
            const targetId = (item.recipientId || item.reporterId || '').toLowerCase();
            return targetId === userId;
          })
          .sort(
            (a, b) =>
              parseWitaTimestampMs(b.timestamp) - parseWitaTimestampMs(a.timestamp)
          );

        setNotifications(ownedNotifs);
        setError('');
      } catch (err) {
        console.warn('Gagal memuat notifikasi Pelapor dari JSON Server, menggunakan fallback:', err);
        if (!isMounted) return;

        setNotifications(filterNotificationsByReporter(MOCK_REPORTER_NOTIFICATIONS, user));
        setError(
          err?.message ||
            'Tidak dapat terhubung ke server backend. Menampilkan data cache lokal.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Metadata identitas role
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

  // Statistik dinamis (Total, Belum Dibaca, Sudah Dibaca)
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = notifications.filter((n) => n.isRead).length;
    return { total, unread, read };
  }, [notifications]);

  // Daftar notifikasi terfilter
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'UNREAD') {
      return notifications.filter((n) => !n.isRead);
    }
    if (activeFilter === 'READ') {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Pengelompokan berdasarkan waktu (Hari Ini, Kemarin, Sebelumnya)
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(filteredNotifications);
  }, [filteredNotifications]);

  // Aksi: Tandai satu notifikasi sudah dibaca via PATCH /notifications/:id
  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsReadInApi(notifId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notifId ? { ...item, isRead: true } : item))
      );
      setError('');
    } catch (err) {
      setError(
        err?.message ||
          'Gagal memperbarui status baca notifikasi ke server backend.'
      );
    }
  };

  // Aksi: Tandai seluruh notifikasi sudah dibaca via PATCH /notifications/:id
  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((item) => !item.isRead);
    if (unreadItems.length === 0) return;

    try {
      await Promise.all(
        unreadItems.map((item) => markNotificationAsReadInApi(item.id))
      );
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setError('');
    } catch (err) {
      setError(
        err?.message ||
          'Gagal menandai seluruh notifikasi sebagai dibaca di server backend.'
      );
    }
  };

  // Konfigurasi ikon & aksen warna untuk 7 jenis notifikasi
  const getNotificationTypeMeta = (type) => {
    switch (type) {
      case 'submitted':
        return {
          icon: Send,
          iconBox: 'bg-blue-50 text-blue-600 border-blue-200/80',
          typeLabel: 'Terkirim',
          typeBadge: 'bg-blue-50 text-blue-700 border-blue-200/80',
        };
      case 'pending_verification':
        return {
          icon: Clock,
          iconBox: 'bg-amber-50 text-amber-600 border-amber-200/80',
          typeLabel: 'Menunggu Verifikasi',
          typeBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
        };
      case 'approved':
        return {
          icon: ClipboardCheck,
          iconBox: 'bg-sky-50 text-sky-600 border-sky-200/80',
          typeLabel: 'Disetujui',
          typeBadge: 'bg-sky-50 text-sky-700 border-sky-200/80',
        };
      case 'assigned':
        return {
          icon: UserCheck,
          iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
          typeLabel: 'Teknisi Ditugaskan',
          typeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        };
      case 'in_progress':
        return {
          icon: Wrench,
          iconBox: 'bg-purple-50 text-purple-600 border-purple-200/80',
          typeLabel: 'Dalam Pengerjaan',
          typeBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
          typeLabel: 'Selesai',
          typeBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconBox: 'bg-rose-50 text-rose-600 border-rose-200/80',
          typeLabel: 'Ditolak',
          typeBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
        };
      default:
        return {
          icon: Bell,
          iconBox: 'bg-slate-100 text-slate-600 border-slate-200',
          typeLabel: 'Informasi',
          typeBadge: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Compact Inbox Page Header (Tanpa Hero Banner Besar) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-1" aria-label="Breadcrumb">
            <Link to="/reporter" className="hover:text-indigo-600 font-medium transition-colors">
              Dashboard Pelapor
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-indigo-700">Notifikasi</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pemberitahuan status laporan dari Admin & Teknisi.
          </p>
        </div>

        {/* Identitas Pengguna Aktif Ringkas */}
        <div className="flex items-center space-x-2.5 px-3 py-2 rounded-2xl bg-white/95 border-[1.5px] border-indigo-200/80 shadow-2xs self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0B132B] to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'Pengguna'}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-slate-500">{user?.identifier || '-'}</span>
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

      {/* Unified Communication Center / Notification Inbox Shell */}
      <section className="bg-white/95 backdrop-blur-sm rounded-3xl border-[1.5px] border-indigo-200/80 shadow-sm overflow-hidden">
        {/* Inbox Top Bar (Dark Navy Accent Header + Integrated Statistics) */}
        <div className="bg-gradient-to-r from-[#080E21] via-[#12173F] to-[#201447] px-5 py-4 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Kotak Masuk</h2>
                {stats.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                    {stats.unread} Baru
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-200/80">
                Total {stats.total} • Belum Dibaca {stats.unread} • Sudah Dibaca {stats.read}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-indigo-200" />
            <span>Tandai Semua Dibaca</span>
          </button>
        </div>

        {/* Inbox Filter Tabs & Compact Stat Badges */}
        <div className="px-5 py-3 bg-[#F8FAFE] border-b-[1.5px] border-indigo-200/75 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'Semua', count: stats.total },
              { key: 'UNREAD', label: 'Belum Dibaca', count: stats.unread },
              { key: 'READ', label: 'Sudah Dibaca', count: stats.read },
            ].map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border-[1.5px] border-slate-200/90'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            Menampilkan {filteredNotifications.length} pesan
          </span>
        </div>

        {/* Feedback error jaringan / server */}
        {error && (
          <div
            role="alert"
            className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grouped Inbox Message List */}
        {loading ? (
          <div className="py-14 px-6 text-center text-xs text-slate-500">
            Memuat notifikasi dari server...
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State inside Inbox */
          <div className="py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <BellOff className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeFilter === 'UNREAD'
                ? 'Semua Notifikasi Telah Dibaca'
                : activeFilter === 'READ'
                ? 'Belum Ada Notifikasi yang Dibaca'
                : 'Kotak Masuk Kosong'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {activeFilter === 'UNREAD'
                ? 'Tidak ada pemberitahuan baru yang menunggu untuk dibaca.'
                : 'Tidak ada data pemberitahuan pada filter yang dipilih.'}
            </p>
            {activeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <span>Lihat Semua Notifikasi</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {groupedNotifications.map((group, groupIdx) => (
              <div key={group.title}>
                {/* Time Group Section Header (Hari Ini / Kemarin / Sebelumnya) */}
                <div
                  className={`px-5 py-2.5 bg-white border-b-[1.5px] border-slate-200/80 flex items-center justify-between ${
                    groupIdx > 0 ? 'border-t-[1.5px]' : ''
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/75">
                    {group.title}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {group.items.length} pesan
                  </span>
                </div>

                {/* Separated Notification Cards (14px gap, crisp 1.5px borders) */}
                <div className="p-4 sm:p-5 space-y-3.5 bg-[#F4F7FC]/75">
                  {group.items.map((notif) => {
                    const typeMeta = getNotificationTypeMeta(notif.type);
                    const TypeIcon = typeMeta.icon;
                    const isUnread = !notif.isRead;

                    return (
                      <article
                        key={notif.id}
                        className={`rounded-2xl p-4 transition-all duration-200 border-[1.5px] ${
                          isUnread
                            ? 'border-indigo-300 border-l-4 border-l-purple-600 bg-white shadow-xs hover:border-purple-400 hover:shadow-md'
                            : 'border-slate-300/80 bg-white/85 hover:bg-white hover:border-indigo-300 opacity-90'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Kiri: Indikator Titik + Ikon Jenis + Isi Pesan */}
                          <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                            {/* Category/Type Icon */}
                            <div className="relative shrink-0 mt-0.5">
                              <div
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${typeMeta.iconBox}`}
                              >
                                <TypeIcon className="w-4.5 h-4.5" />
                              </div>
                              {isUnread && (
                                <span
                                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-white"
                                  title="Belum dibaca"
                                />
                              )}
                            </div>

                            <div className="min-w-0 space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`text-sm ${
                                    isUnread
                                      ? 'font-extrabold text-slate-950'
                                      : 'font-semibold text-slate-700'
                                  }`}
                                >
                                  {notif.title}
                                </h3>

                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeMeta.typeBadge}`}
                                >
                                  {typeMeta.typeLabel}
                                </span>

                                {notif.reportId && (
                                  <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
                                    {notif.reportId}
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs sm:text-sm leading-relaxed ${
                                  isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
                                }`}
                              >
                                {notif.message}
                              </p>

                              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                                <span className="inline-flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{notif.timestamp}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Kanan: Aksi Pesan */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xs transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Tandai Dibaca</span>
                              </button>
                            )}

                            {notif.reportId && (
                              <Link
                                to="/reporter/reports"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 transition-colors"
                              >
                                <span>Lihat Laporan</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info sinkronisasi server */}
      <div className="rounded-2xl bg-white/85 border-[1.5px] border-indigo-200/75 px-4 py-3 text-[11px] text-slate-500 flex items-center space-x-2">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          Status notifikasi disinkronkan dengan database sistem pemeliharaan kampus.
        </span>
      </div>
    </div>
  );
}
