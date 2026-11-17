import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCheck,
  Check,
  Search,
  X,
  ArrowLeft,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  Inbox,
  Filter,
  RotateCcw,
  ExternalLink,
  MailOpen,
} from 'lucide-react';
import {
  useAdmin,
  ADMIN_NOTIFICATION_TYPE_META,
} from '../../context/AdminContext';

const TYPE_STYLE_META = {
  incoming: {
    label: ADMIN_NOTIFICATION_TYPE_META.incoming,
    icon: Inbox,
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBox: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25',
  },
  verification_needed: {
    label: ADMIN_NOTIFICATION_TYPE_META.verification_needed,
    icon: Clock,
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBox: 'bg-[#F59E0B]/15 text-amber-700 border-amber-300/60',
  },
  critical_ai: {
    label: ADMIN_NOTIFICATION_TYPE_META.critical_ai,
    icon: AlertTriangle,
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBox: 'bg-rose-500/10 text-rose-600 border-rose-300/60',
  },
  verification_result: {
    label: ADMIN_NOTIFICATION_TYPE_META.verification_result,
    icon: ClipboardCheck,
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    iconBox: 'bg-[#8B5CF6]/10 text-[#7C3AED] border-violet-300/60',
  },
  assigned: {
    label: ADMIN_NOTIFICATION_TYPE_META.assigned,
    icon: UserCheck,
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBox: 'bg-indigo-500/10 text-indigo-600 border-indigo-300/60',
  },
  in_progress: {
    label: ADMIN_NOTIFICATION_TYPE_META.in_progress,
    icon: Wrench,
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    iconBox: 'bg-[#06B6D4]/15 text-cyan-700 border-cyan-300/60',
  },
  completed: {
    label: ADMIN_NOTIFICATION_TYPE_META.completed,
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBox: 'bg-emerald-500/10 text-emerald-600 border-emerald-300/60',
  },
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');

  // Statistik ringkas notifikasi
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = unreadNotificationCount;
    const read = Math.max(0, total - unread);
    const critical = notifications.filter((n) => n.type === 'critical_ai').length;
    return { total, unread, read, critical };
  }, [notifications, unreadNotificationCount]);

  // Penyaringan berdasarkan status baca, jenis, dan pencarian
  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesRead =
        readFilter === 'ALL' ||
        (readFilter === 'UNREAD' && !item.isRead) ||
        (readFilter === 'READ' && item.isRead);

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.reportId || '').toLowerCase().includes(q) ||
        (item.actor || '').toLowerCase().includes(q) ||
        (item.typeLabel || '').toLowerCase().includes(q);

      return matchesRead && matchesType && matchesSearch;
    });
  }, [notifications, readFilter, typeFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || typeFilter !== 'ALL' || readFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setReadFilter('ALL');
  };

  const handleMarkOneRead = async (e, notifId) => {
    e.stopPropagation();
    const result = await markNotificationAsRead(notifId);
    if (result?.success !== false) {
      setFeedback('Notifikasi ditandai sudah dibaca.');
    } else if (result?.message) {
      setFeedback(result.message);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadNotificationCount === 0) return;
    const result = await markAllNotificationsAsRead();
    if (result?.success !== false) {
      setFeedback('Seluruh notifikasi telah ditandai sudah dibaca.');
    } else if (result?.message) {
      setFeedback(result.message);
    }
  };

  const handleOpenNotification = (notif) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.reportId) {
      navigate(`/admin/reports/${notif.reportId}`);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. COMMAND HEADER BAR */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#06B6D4]/20 blur-[95px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-[#06B6D4]">
              <BellRing className="w-3.5 h-3.5" />
              <span>PUSAT NOTIFIKASI • PEMANTAUAN OPERASIONAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Notifikasi Admin
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Pantau laporan masuk, rekomendasi urgensi kritis AI, verifikasi, penugasan, serta progres perbaikan teknisi secara terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Dasbor Admin</span>
            </Link>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadNotificationCount === 0}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                unreadNotificationCount > 0
                  ? 'text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-950/40 cursor-pointer'
                  : 'text-slate-400 bg-white/5 border border-white/10 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Sudah Dibaca</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 border-[1.5px] border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. NOTIFICATION OVERVIEW CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'total',
            label: 'Total Notifikasi',
            count: stats.total,
            icon: Bell,
            bar: 'from-[#2563EB] to-[#06B6D4]',
            border: 'border-[#2563EB]/40',
            iconBox: 'bg-[#2563EB]/20 border-[#2563EB]/40 text-[#60A5FA]',
            labelColor: 'text-blue-300',
            isActive: readFilter === 'ALL' && typeFilter === 'ALL',
            onClick: handleResetFilters,
          },
          {
            id: 'unread',
            label: 'Belum Dibaca',
            count: stats.unread,
            icon: BellRing,
            bar: 'from-[#06B6D4] to-[#2563EB]',
            border: 'border-[#06B6D4]/40',
            iconBox: 'bg-[#06B6D4]/20 border-[#06B6D4]/40 text-[#06B6D4]',
            labelColor: 'text-cyan-300',
            isActive: readFilter === 'UNREAD',
            onClick: () => {
              setReadFilter('UNREAD');
              setTypeFilter('ALL');
            },
          },
          {
            id: 'read',
            label: 'Sudah Dibaca',
            count: stats.read,
            icon: MailOpen,
            bar: 'from-emerald-400 to-teal-500',
            border: 'border-emerald-500/40',
            iconBox: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
            labelColor: 'text-emerald-300',
            isActive: readFilter === 'READ',
            onClick: () => {
              setReadFilter('READ');
              setTypeFilter('ALL');
            },
          },
          {
            id: 'critical',
            label: 'Urgensi Kritis',
            count: stats.critical,
            icon: AlertTriangle,
            bar: 'from-[#F59E0B] to-rose-500',
            border: 'border-rose-500/40',
            iconBox: 'bg-rose-500/20 border-rose-400/40 text-rose-300',
            labelColor: 'text-rose-300',
            isActive: typeFilter === 'critical_ai',
            onClick: () => {
              setTypeFilter('critical_ai');
              setReadFilter('ALL');
            },
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={card.onClick}
              className={`relative overflow-hidden text-left rounded-2xl bg-[#101A30] border p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15 transition-all cursor-pointer ${
                card.isActive
                  ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/30 -translate-y-0.5'
                  : `${card.border} hover:border-white/30`
              }`}
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.bar}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${card.labelColor}`}>
                    {card.label}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-white mt-1.5 tabular-nums">
                    {card.count}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBox}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <section className="rounded-2xl bg-white border-[1.5px] border-slate-300/90 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, ID laporan, teknisi, atau keterangan..."
              aria-label="Cari notifikasi"
              className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="md:col-span-4 relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Saring berdasarkan jenis notifikasi"
              className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Jenis Notifikasi</option>
              {Object.entries(ADMIN_NOTIFICATION_TYPE_META).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Read Status Segmented Filter */}
          <div className="md:col-span-3 flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'UNREAD', label: 'Belum Dibaca' },
              { key: 'READ', label: 'Dibaca' },
            ].map((tab) => {
              const active = readFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setReadFilter(tab.key)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#080D1B] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredNotifications.length}</strong> dari{' '}
            <strong className="text-slate-900">{notifications.length}</strong> notifikasi
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Atur Ulang</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. NOTIFICATION LIST */}
      <section className="rounded-3xl bg-white border-[1.5px] border-slate-300/90 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Tidak Ada Notifikasi yang Ditemukan
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Belum ada notifikasi yang sesuai dengan pencarian atau filter yang dipilih.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] cursor-pointer"
              >
                Tampilkan Semua Notifikasi
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200/85">
            {filteredNotifications.map((notif) => {
              const typeMeta = TYPE_STYLE_META[notif.type] || TYPE_STYLE_META.incoming;
              const TypeIcon = typeMeta.icon;
              const isClickable = Boolean(notif.reportId);

              return (
                <li
                  key={notif.id}
                  onClick={() => isClickable && handleOpenNotification(notif)}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleOpenNotification(notif);
                    }
                  }}
                  tabIndex={isClickable ? 0 : undefined}
                  role={isClickable ? 'button' : undefined}
                  className={`relative px-4 sm:px-6 py-4 transition-colors ${
                    !notif.isRead
                      ? 'bg-blue-50/45 border-l-4 border-l-[#2563EB]'
                      : 'bg-white border-l-4 border-l-transparent'
                  } ${isClickable ? 'hover:bg-slate-50/90 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Type Icon + Content */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${typeMeta.iconBox}`}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${typeMeta.badge}`}
                          >
                            {typeMeta.label}
                          </span>

                          {!notif.isRead ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2563EB] text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                              Belum Dibaca
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Sudah Dibaca
                            </span>
                          )}

                          {notif.reportId && (
                            <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
                              {notif.reportId}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-sm leading-snug ${
                            !notif.isRead
                              ? 'font-extrabold text-slate-900'
                              : 'font-semibold text-slate-800'
                          }`}
                        >
                          {notif.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{notif.timestamp}</span>
                          </span>
                          {notif.actor && (
                            <span>
                              Oleh: <strong className="text-slate-700 font-semibold">{notif.actor}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Row Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 sm:self-center">
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkOneRead(e, notif.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Tandai Dibaca</span>
                        </button>
                      )}

                      {notif.reportId && (
                        <Link
                          to={`/admin/reports/${notif.reportId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!notif.isRead) {
                              markNotificationAsRead(notif.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                        >
                          <span>Lihat Laporan</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
