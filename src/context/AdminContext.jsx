/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_ACTIVITIES,
} from '../data/mockAdminReports';
import { MOCK_TECHNICIANS } from '../data/mockTechnicians';
import { useTasks } from './TaskContext';

const AdminContext = createContext(null);

const ADMIN_REPORTS_STORAGE_KEY = 'campus_maintenance_admin_reports';
const ADMIN_TECHNICIANS_STORAGE_KEY = 'campus_maintenance_admin_technicians';
const ADMIN_ACTIVITIES_STORAGE_KEY = 'campus_maintenance_admin_activities';
const ADMIN_READ_NOTIFICATIONS_KEY = 'campus_maintenance_admin_read_notifications';

const INITIAL_READ_NOTIFICATION_IDS = [
  'NOTIF-ACT-ACT-205',
  'NOTIF-ACT-ACT-206',
];

export const ADMIN_NOTIFICATION_TYPE_META = {
  incoming: 'Laporan Baru',
  verification_needed: 'Perlu Verifikasi',
  critical_ai: 'Urgensi Kritis',
  verification_result: 'Hasil Verifikasi',
  assigned: 'Penugasan Teknisi',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Perbaikan Selesai',
};

const PRIORITY_LABELS_ID = {
  Critical: 'Kritis',
  High: 'Tinggi',
  Medium: 'Sedang',
  Low: 'Rendah',
};

function parseTimestampMs(ts) {
  if (!ts || typeof ts !== 'string') return 0;
  const normalized = ts.replace(',', '').trim();
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function loadStoredIdArray(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Gagal membaca ${key} dari localStorage:`, err);
  }
  return fallback;
}

function loadStoredJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Gagal membaca ${key} dari localStorage:`, err);
  }
  return fallback;
}

function saveStoredJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Gagal menyimpan ${key} ke localStorage:`, err);
  }
}

function formatActionTimestamp() {
  const now = new Date();
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  return `${datePart}, ${timePart}`;
}

export function AdminProvider({ children }) {
  const { allTasks, assignTaskFromAdmin } = useTasks();

  // Base state untuk data Admin (tidak menyimpan hasil hitungan ganda dari TaskContext)
  const [rawReports, setRawReports] = useState(() =>
    loadStoredJson(ADMIN_REPORTS_STORAGE_KEY, MOCK_ADMIN_REPORTS)
  );
  const [rawTechnicians, setRawTechnicians] = useState(() =>
    loadStoredJson(
      ADMIN_TECHNICIANS_STORAGE_KEY,
      MOCK_TECHNICIANS.map((t) => ({ ...t, status: t.availability }))
    )
  );
  const [rawActivities, setRawActivities] = useState(() =>
    loadStoredJson(ADMIN_ACTIVITIES_STORAGE_KEY, MOCK_ADMIN_ACTIVITIES)
  );
  const [readNotificationIds, setReadNotificationIds] = useState(() =>
    loadStoredIdArray(ADMIN_READ_NOTIFICATIONS_KEY, INITIAL_READ_NOTIFICATION_IDS)
  );

  // Sinkronisasi persistensi sesi lokal Admin
  useEffect(() => {
    saveStoredJson(ADMIN_REPORTS_STORAGE_KEY, rawReports);
  }, [rawReports]);

  useEffect(() => {
    saveStoredJson(ADMIN_TECHNICIANS_STORAGE_KEY, rawTechnicians);
  }, [rawTechnicians]);

  useEffect(() => {
    saveStoredJson(ADMIN_ACTIVITIES_STORAGE_KEY, rawActivities);
  }, [rawActivities]);

  useEffect(() => {
    saveStoredJson(ADMIN_READ_NOTIFICATIONS_KEY, readNotificationIds);
  }, [readNotificationIds]);

  // Indeks tugas yang dibuat melalui penugasan Admin (single source of truth status tugas)
  const adminSyncedTasks = useMemo(() => {
    return (allTasks || []).filter((t) => t.assignedByAdmin === true);
  }, [allTasks]);

  const syncedTaskByReportId = useMemo(() => {
    const map = new Map();
    adminSyncedTasks.forEach((task) => {
      const key = (task.sourceReportId || task.id || '').toUpperCase();
      if (key) map.set(key, task);
    });
    return map;
  }, [adminSyncedTasks]);

  // Derived reports: status & teknisi tertugas selalu mengikuti status aktual dari TaskContext
  const reports = useMemo(() => {
    return rawReports.map((report) => {
      const liveTask = syncedTaskByReportId.get(report.id.toUpperCase());
      if (!liveTask) return report;

      return {
        ...report,
        status: liveTask.status,
        assignedTechnician: liveTask.assignedTechnicianName || report.assignedTechnician,
        assignedTechnicianId: liveTask.assignedTechnicianId || report.assignedTechnicianId,
      };
    });
  }, [rawReports, syncedTaskByReportId]);

  // Derived technicians: beban kerja & ketersediaan dihitung murni dari tugas aktif/selesai aktual (anti double-count)
  const technicians = useMemo(() => {
    return rawTechnicians.map((tech) => {
      const assignedTasks = adminSyncedTasks.filter(
        (t) =>
          t.assignedTechnicianId &&
          t.assignedTechnicianId.toLowerCase() === tech.id.toLowerCase()
      );

      if (assignedTasks.length === 0) {
        return {
          ...tech,
          status: tech.availability,
        };
      }

      const addedActive = assignedTasks.filter((t) => t.status !== 'Completed').length;
      const addedCompleted = assignedTasks.filter((t) => t.status === 'Completed').length;
      const nextActiveTasks = tech.activeTasks + addedActive;
      const nextCompletedTasks = tech.completedTasks + addedCompleted;

      // Perbarui ketersediaan otomatis berdasarkan tugas aktif kecuali diset Tidak Tersedia
      let nextAvailability = tech.availability;
      if (tech.availability !== 'Unavailable') {
        nextAvailability = nextActiveTasks > 0 ? 'On Duty' : 'Available';
      }

      // Gabungkan riwayat pekerjaan dengan status terkini dari TaskContext tanpa duplikasi ID laporan
      const syncedHistoryItems = assignedTasks.map((task) => ({
        reportId: task.id,
        title: task.title,
        location: task.location,
        date:
          task.status === 'Completed' && task.completedDate
            ? task.completedDate.split(',')[0]
            : (task.updates?.[0]?.timestamp || task.reportedDate || '').split(',')[0],
        status: task.status,
      }));

      const syncedIds = new Set(syncedHistoryItems.map((item) => item.reportId.toUpperCase()));
      const baseHistory = (tech.workHistory || []).filter(
        (item) => !syncedIds.has(item.reportId.toUpperCase())
      );

      return {
        ...tech,
        activeTasks: nextActiveTasks,
        completedTasks: nextCompletedTasks,
        availability: nextAvailability,
        status: nextAvailability,
        workHistory: [...syncedHistoryItems, ...baseHistory],
      };
    });
  }, [rawTechnicians, adminSyncedTasks]);

  // Derived activities: sertakan pembaruan status terbaru dari Teknisi secara otomatis
  const activities = useMemo(() => {
    const taskUpdateActivities = [];

    adminSyncedTasks.forEach((task) => {
      (task.updates || []).forEach((upd) => {
        if (upd.status === 'In Progress' || upd.status === 'Completed') {
          taskUpdateActivities.push({
            id: `SYNC-${task.id}-${upd.id}`,
            type: upd.status === 'Completed' ? 'completed' : 'assigned',
            title:
              upd.status === 'Completed'
                ? 'Perbaikan telah selesai'
                : 'Teknisi mulai mengerjakan',
            detail: `${task.title} — ${upd.notes}`,
            reportId: task.id,
            actor: upd.author || task.assignedTechnicianName || 'Teknisi',
            timestamp: upd.timestamp,
          });
        }
      });
    });

    return [...taskUpdateActivities, ...rawActivities];
  }, [adminSyncedTasks, rawActivities]);

  // Derived notifications: sinkron langsung dengan status laporan & aktivitas sistem (Admin + Teknisi)
  const notifications = useMemo(() => {
    const readSet = new Set(readNotificationIds);
    const items = [];

    const classifyActivityType = (act) => {
      if (act.type === 'incoming') return 'incoming';
      if (act.type === 'completed') return 'completed';
      if (act.type === 'approved') return 'verification_result';
      if (act.type === 'priority') {
        const titleLower = (act.title || '').toLowerCase();
        const detailLower = (act.detail || '').toLowerCase();
        if (titleLower.includes('ditolak')) return 'verification_result';
        if (detailLower.includes('critical') || detailLower.includes('kritis')) {
          return 'critical_ai';
        }
        return 'verification_result';
      }
      if (act.type === 'assigned') {
        const titleLower = (act.title || '').toLowerCase();
        if (
          act.id?.startsWith('SYNC-') ||
          titleLower.includes('mulai') ||
          titleLower.includes('menangani')
        ) {
          return 'in_progress';
        }
        return 'assigned';
      }
      return 'incoming';
    };

    // 1. Notifikasi berbasis aktivitas sistem (laporan masuk, verifikasi, penugasan, progres & selesai teknisi)
    activities.forEach((act, idx) => {
      const notifType = classifyActivityType(act);
      items.push({
        id: `NOTIF-ACT-${act.id}`,
        type: notifType,
        typeLabel: ADMIN_NOTIFICATION_TYPE_META[notifType],
        title: act.title,
        description: act.detail,
        reportId: act.reportId || null,
        actor: act.actor || 'Sistem',
        timestamp: act.timestamp,
        sortTime: parseTimestampMs(act.timestamp),
        orderHint: idx,
      });
    });

    // 2. Peringatan laporan menunggu verifikasi & rekomendasi urgensi kritis AI dari state reports
    const assignedActivityReports = new Set(
      items.filter((i) => i.type === 'assigned' && i.reportId).map((i) => i.reportId)
    );

    reports.forEach((report, idx) => {
      if (report.status === 'Pending') {
        items.push({
          id: `NOTIF-VERIFY-${report.id}`,
          type: 'verification_needed',
          typeLabel: ADMIN_NOTIFICATION_TYPE_META.verification_needed,
          title: 'Laporan membutuhkan verifikasi',
          description: `${report.title} (${report.location}) menunggu verifikasi dan penetapan prioritas Admin.`,
          reportId: report.id,
          actor: `${report.reporterName} (${report.reporterRole})`,
          timestamp: report.reportedDate,
          sortTime: parseTimestampMs(report.reportedDate) + 1,
          orderHint: idx,
        });
      }

      if (
        report.aiUrgency === 'Critical' &&
        report.status !== 'Completed' &&
        report.status !== 'Rejected'
      ) {
        items.push({
          id: `NOTIF-CRITICAL-${report.id}`,
          type: 'critical_ai',
          typeLabel: ADMIN_NOTIFICATION_TYPE_META.critical_ai,
          title: 'Rekomendasi urgensi kritis dari AI',
          description: `${report.title} (${report.location}) — ${report.aiSummary}`,
          reportId: report.id,
          actor: 'Analisis Urgensi AI',
          timestamp: report.reportedDate,
          sortTime: parseTimestampMs(report.reportedDate) + 2,
          orderHint: idx,
        });
      }

      if (
        report.status === 'Assigned' &&
        report.assignedTechnician &&
        !assignedActivityReports.has(report.id)
      ) {
        items.push({
          id: `NOTIF-ASSIGNED-${report.id}`,
          type: 'assigned',
          typeLabel: ADMIN_NOTIFICATION_TYPE_META.assigned,
          title: 'Teknisi berhasil ditugaskan',
          description: `${report.title} ditugaskan kepada ${report.assignedTechnician}.`,
          reportId: report.id,
          actor: 'Admin Sarana & Fasilitas',
          timestamp: report.reportedDate,
          sortTime: parseTimestampMs(report.reportedDate),
          orderHint: idx,
        });
      }
    });

    return items
      .sort((a, b) => {
        if (b.sortTime !== a.sortTime) return b.sortTime - a.sortTime;
        return a.orderHint - b.orderHint;
      })
      .map((item) => ({
        ...item,
        isRead: readSet.has(item.id),
      }));
  }, [activities, reports, readNotificationIds]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const markNotificationAsRead = (notificationId) => {
    if (!notificationId) return;
    setReadNotificationIds((prev) =>
      prev.includes(notificationId) ? prev : [...prev, notificationId]
    );
  };

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds((prev) => {
      const merged = new Set(prev);
      notifications.forEach((item) => merged.add(item.id));
      return Array.from(merged);
    });
  };

  const getReportById = (reportId) =>
    reports.find((report) => report.id === reportId) || null;

  /**
   * Menyetujui laporan Pending -> Approved (opsional sekaligus menetapkan prioritas akhir Admin)
   */
  const approveReport = (reportId, nextPriority, adminName = 'Admin Sarana & Fasilitas') => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }
    if (target.status === 'Completed' || target.status === 'Rejected') {
      return {
        success: false,
        message: 'Laporan yang sudah Selesai atau Ditolak tidak dapat diverifikasi ulang.',
      };
    }
    if (target.status !== 'Pending') {
      return {
        success: false,
        message: 'Hanya laporan berstatus Menunggu Verifikasi yang dapat disetujui.',
      };
    }

    const resolvedPriority = nextPriority || target.adminPriority || target.aiUrgency;
    const priorityLabel = PRIORITY_LABELS_ID[resolvedPriority] || resolvedPriority;
    const timestamp = formatActionTimestamp();

    setRawReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'Approved',
              adminPriority: resolvedPriority,
              rejectionReason: null,
            }
          : r
      )
    );

    setRawActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        type: 'approved',
        title: 'Admin menyetujui laporan',
        detail: `${target.title} disetujui dengan prioritas akhir ${priorityLabel}.`,
        reportId,
        actor: adminName,
        timestamp,
      },
      ...prev,
    ]);

    return { success: true, message: `Laporan ${reportId} berhasil disetujui.` };
  };

  /**
   * Menolak laporan dengan alasan wajib
   */
  const rejectReport = (reportId, reason, adminName = 'Admin Sarana & Fasilitas') => {
    const cleanReason = reason?.trim();
    if (!cleanReason) {
      return { success: false, message: 'Alasan penolakan wajib diisi.' };
    }

    const target = reports.find((r) => r.id === reportId);
    if (!target) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }
    if (target.status === 'Completed' || target.status === 'Rejected') {
      return {
        success: false,
        message: 'Laporan yang sudah Selesai atau Ditolak tidak dapat diverifikasi ulang.',
      };
    }

    const timestamp = formatActionTimestamp();

    setRawReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: cleanReason,
            }
          : r
      )
    );

    setRawActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        type: 'priority',
        title: 'Laporan ditolak Admin',
        detail: `${target.title} ditolak. Alasan: ${cleanReason}`,
        reportId,
        actor: adminName,
        timestamp,
      },
      ...prev,
    ]);

    return { success: true, message: `Laporan ${reportId} telah ditolak.` };
  };

  /**
   * Menetapkan atau mengubah prioritas akhir Admin secara terpisah dari rekomendasi AI
   */
  const updateReportPriority = (reportId, newPriority, adminName = 'Admin Sarana & Fasilitas') => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }
    if (target.status === 'Completed' || target.status === 'Rejected') {
      return {
        success: false,
        message: 'Prioritas tidak dapat diubah pada laporan berstatus Selesai atau Ditolak.',
      };
    }

    const priorityLabel = PRIORITY_LABELS_ID[newPriority] || newPriority;
    const aiLabel = PRIORITY_LABELS_ID[target.aiUrgency] || target.aiUrgency;
    const timestamp = formatActionTimestamp();

    setRawReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              adminPriority: newPriority,
            }
          : r
      )
    );

    setRawActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        type: 'priority',
        title: `Prioritas Admin ditetapkan: ${priorityLabel}`,
        detail: `${target.title} (Rekomendasi AI: ${aiLabel} → Keputusan Admin: ${priorityLabel}).`,
        reportId,
        actor: adminName,
        timestamp,
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Prioritas akhir laporan ${reportId} disimpan sebagai ${priorityLabel}.`,
    };
  };

  /**
   * Menambahkan teknisi baru pada daftar sesi lokal
   */
  const addTechnician = (payload) => {
    const newTech = {
      ...payload,
      status: payload.availability,
      activeTasks: 0,
      completedTasks: 0,
      avatarColor: 'from-[#2563EB] to-[#06B6D4]',
      joinedAt: 'Nov 2026',
      workHistory: [],
    };
    setRawTechnicians((prev) => [newTech, ...prev]);
    return newTech;
  };

  /**
   * Memperbarui data teknisi pada sesi lokal (ID teknisi dikunci)
   */
  const updateTechnician = (payload) => {
    setRawTechnicians((prev) =>
      prev.map((tech) =>
        tech.id === payload.id
          ? {
              ...tech,
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              specialization: payload.specialization,
              availability: payload.availability,
              status: payload.availability,
            }
          : tech
      )
    );
  };

  /**
   * Menugaskan laporan Approved yang belum ditugaskan kepada teknisi.
   * Penugasan langsung disimpan di TaskContext sebagai satu sumber kebenaran status & beban kerja.
   */
  const assignReportToTechnician = (
    reportId,
    technicianId,
    adminName = 'Admin Sarana & Fasilitas'
  ) => {
    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }

    if (targetReport.status !== 'Approved' || targetReport.assignedTechnician) {
      return {
        success: false,
        message:
          'Penugasan gagal: Hanya laporan berstatus Disetujui dan belum ditugaskan yang dapat ditugaskan.',
      };
    }

    const targetTech = technicians.find((t) => t.id === technicianId);
    if (!targetTech) {
      return { success: false, message: 'Teknisi yang dipilih tidak ditemukan.' };
    }

    if (targetTech.availability === 'Unavailable') {
      return {
        success: false,
        message: `Teknisi ${targetTech.name} berstatus Tidak Tersedia dan tidak dapat menerima tugas baru.`,
      };
    }

    const timestamp = formatActionTimestamp();
    const effectivePriority =
      targetReport.adminPriority || targetReport.aiUrgency || 'Medium';

    // Simpan penetapan prioritas Admin pada rawReports (status & penugasan bersumber dari TaskContext)
    setRawReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              adminPriority: effectivePriority,
            }
          : r
      )
    );

    setRawActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        type: 'assigned',
        title: 'Teknisi ditugaskan Admin',
        detail: `${targetReport.title} ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
        reportId,
        actor: adminName,
        timestamp,
      },
      ...prev,
    ]);

    // Kirim tugas ke TaskContext (otomatis memperbarui reports & technicians melalui useMemo)
    assignTaskFromAdmin(
      { ...targetReport, adminPriority: effectivePriority },
      targetTech,
      adminName
    );

    return {
      success: true,
      message: `Penugasan berhasil! Laporan ${reportId} telah ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
    };
  };

  const value = {
    reports,
    technicians,
    activities,
    notifications,
    unreadNotificationCount,
    getReportById,
    approveReport,
    rejectReport,
    updateReportPriority,
    addTechnician,
    updateTechnician,
    assignReportToTechnician,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin harus digunakan di dalam AdminProvider.');
  }
  return ctx;
}
