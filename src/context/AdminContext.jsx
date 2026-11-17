/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_ACTIVITIES,
} from '../data/mockAdminReports';
import { MOCK_TECHNICIANS } from '../data/mockTechnicians';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';
import { getAllEvidenceImages } from '../utils/imageStorage';
import {
  formatWitaDateOnly,
  formatWitaTimestamp,
  parseWitaTimestampMs,
} from '../utils/dateFormat';
import {
  getAllReports,
  updateReport as patchReportInApi,
} from '../services/reportService';
import { analyzeMaintenanceReport } from '../services/aiService';
import {
  getAllTechnicians,
  createTechnician as createTechnicianInApi,
  updateTechnician as patchTechnicianInApi,
} from '../services/technicianService';
import {
  getAllActivities,
  createActivity as createActivityInApi,
  getNotificationsByRecipientId,
  createNotification as createNotificationInApi,
  markNotificationAsRead as markNotificationAsReadInApi,
} from '../services/activityNotificationService';

const AdminContext = createContext(null);

const ADMIN_REPORTS_STORAGE_KEY = 'campus_maintenance_admin_reports';
const ADMIN_TECHNICIANS_STORAGE_KEY = 'campus_maintenance_admin_technicians';
const ADMIN_ACTIVITIES_STORAGE_KEY = 'campus_maintenance_admin_activities';
const ADMIN_NOTIFICATIONS_STORAGE_KEY = 'campus_maintenance_admin_notifications';
const ADMIN_READ_NOTIFICATIONS_KEY = 'campus_maintenance_admin_read_notifications';

const INITIAL_READ_NOTIFICATION_IDS = [
  'NTF-ADM-08',
  'NTF-ADM-09',
  'NTF-ADM-10',
  'NOTIF-ACT-ACT-205',
  'NOTIF-ACT-ACT-206',
];

const TECHNICIAN_TASK_STATUSES = new Set(['Assigned', 'In Progress', 'Completed']);

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

function loadStoredArrayAllowEmpty(key, fallback) {
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

function saveStoredJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Gagal menyimpan ${key} ke localStorage:`, err);
  }
}

function resolveStoredPhoto(photoValue, idbPhotos = {}) {
  if (typeof photoValue === 'string' && photoValue.startsWith('idb:')) {
    const key = photoValue.replace('idb:', '');
    return idbPhotos[key] || photoValue;
  }
  return photoValue ?? null;
}

function toStoredPhotoPointer(photoValue, prefix) {
  if (typeof photoValue === 'string' && photoValue.startsWith('data:image/')) {
    return `idb:${prefix}`;
  }
  return photoValue ?? null;
}

function normalizeAdminReport(report, idbPhotos = {}) {
  if (!report) return null;
  return {
    ...report,
    category: report.adminCategory || report.category || 'Lainnya',
    aiUrgency: report.aiUrgency || report.aiPriority || 'Medium',
    adminPriority:
      report.adminPriority !== undefined ? report.adminPriority : null,
    assignedTechnician:
      report.assignedTechnician || report.assignedTechnicianName || null,
    assignedTechnicianId: report.assignedTechnicianId || null,
    damagePhoto: resolveStoredPhoto(report.damagePhoto, idbPhotos),
    evidencePhoto: resolveStoredPhoto(report.evidencePhoto, idbPhotos),
    updates: Array.isArray(report.updates) ? report.updates : [],
  };
}

function shouldOverlayLiveTask(rawReport, liveTask) {
  if (!liveTask || !TECHNICIAN_TASK_STATUSES.has(liveTask.status)) {
    return false;
  }
  // Jika Admin telah mengunci laporan sebagai Rejected, pertahankan status Rejected
  if (rawReport.status === 'Rejected') {
    return false;
  }
  const rawUpdatesCount = Array.isArray(rawReport.updates) ? rawReport.updates.length : 0;
  const liveUpdatesCount = Array.isArray(liveTask.updates) ? liveTask.updates.length : 0;

  if (liveUpdatesCount > rawUpdatesCount) {
    return true;
  }
  if (liveTask.status !== rawReport.status) {
    if (liveTask.status === 'Completed' || liveTask.status === 'In Progress') {
      return true;
    }
    if (liveTask.assignedByAdmin && liveTask.status === 'Assigned' && rawReport.status === 'Approved') {
      return true;
    }
  }
  return false;
}

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const {
    allTasks,
    isUsingFallback: tasksUsingFallback,
    assignTaskFromAdmin,
  } = useTasks();

  // Mulai dari state kosong; JSON Server menjadi sumber utama, cache/mock hanya untuk fallback offline
  const [rawReports, setRawReports] = useState([]);
  const [rawTechnicians, setRawTechnicians] = useState([]);
  const [rawActivities, setRawActivities] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [error, setError] = useState('');

  const refreshAdminData = useCallback(async () => {
    let idbPhotos = {};
    try {
      idbPhotos = await getAllEvidenceImages();
    } catch (photoErr) {
      console.warn('Gagal memuat foto IndexedDB untuk Admin:', photoErr);
    }

    try {
      const [reportsData, techniciansData, activitiesData, adminNotifsData] =
        await Promise.all([
          getAllReports(),
          getAllTechnicians(),
          getAllActivities(),
          getNotificationsByRecipientId('admin'),
        ]);

      const normalizedReports = reportsData
        .map((r) => normalizeAdminReport(r, idbPhotos))
        .filter(Boolean);

      const normalizedTechnicians = techniciansData.map((t) => ({
        ...t,
        status: t.availability || t.status || 'Available',
      }));

      const sortedActivities = [...activitiesData].sort(
        (a, b) => parseWitaTimestampMs(b.timestamp) - parseWitaTimestampMs(a.timestamp)
      );

      const serverReadIds = adminNotifsData
        .filter((n) => n.isRead)
        .map((n) => n.id);

      setRawReports(normalizedReports);
      setRawTechnicians(normalizedTechnicians);
      setRawActivities(sortedActivities);
      setBackendNotifications(adminNotifsData);
      setReadNotificationIds(serverReadIds);
      setIsUsingFallback(false);
      setHasHydrated(true);
      setError('');

      // Perbarui cache lokal langsung dengan data backend terbaru (mencegah cache lama bertahan)
      const lightweightReports = normalizedReports.map((r) => ({
        ...r,
        damagePhoto: toStoredPhotoPointer(r.damagePhoto, `damage_${r.id}`),
        evidencePhoto: toStoredPhotoPointer(r.evidencePhoto, `photo_${r.id}`),
      }));
      saveStoredJson(ADMIN_REPORTS_STORAGE_KEY, lightweightReports);
      saveStoredJson(ADMIN_TECHNICIANS_STORAGE_KEY, normalizedTechnicians);
      saveStoredJson(ADMIN_ACTIVITIES_STORAGE_KEY, sortedActivities);
      saveStoredJson(ADMIN_NOTIFICATIONS_STORAGE_KEY, adminNotifsData);
      saveStoredJson(ADMIN_READ_NOTIFICATIONS_KEY, serverReadIds);

      return { success: true };
    } catch (err) {
      console.warn('Gagal memuat data Admin dari JSON Server, menggunakan fallback lokal:', err);
      const fallbackReports = loadStoredJson(
        ADMIN_REPORTS_STORAGE_KEY,
        MOCK_ADMIN_REPORTS
      ).map((r) => normalizeAdminReport(r, idbPhotos));
      const fallbackTechnicians = loadStoredJson(
        ADMIN_TECHNICIANS_STORAGE_KEY,
        MOCK_TECHNICIANS.map((t) => ({ ...t, status: t.availability }))
      );
      const fallbackActivities = loadStoredJson(
        ADMIN_ACTIVITIES_STORAGE_KEY,
        MOCK_ADMIN_ACTIVITIES
      );
      const fallbackNotifs = loadStoredArrayAllowEmpty(
        ADMIN_NOTIFICATIONS_STORAGE_KEY,
        []
      );
      const fallbackReadIds = loadStoredArrayAllowEmpty(
        ADMIN_READ_NOTIFICATIONS_KEY,
        INITIAL_READ_NOTIFICATION_IDS
      );

      setRawReports(fallbackReports);
      setRawTechnicians(fallbackTechnicians);
      setRawActivities(fallbackActivities);
      setBackendNotifications(fallbackNotifs);
      setReadNotificationIds(fallbackReadIds);
      setIsUsingFallback(true);
      setHasHydrated(true);

      const errMsg =
        err?.message ||
        'Gagal terhubung ke JSON Server. Menampilkan data cache lokal.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang seluruh koleksi Admin setiap sesi akun berubah (tanpa duplikasi data)
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) refreshAdminData();
    });
    return () => {
      active = false;
    };
  }, [user?.identifier, refreshAdminData]);

  // Persistensi cache lokal hanya setelah hidrasi selesai
  useEffect(() => {
    if (!hasHydrated) return;
    const lightweightReports = rawReports.map((r) => ({
      ...r,
      damagePhoto: toStoredPhotoPointer(r.damagePhoto, `damage_${r.id}`),
      evidencePhoto: toStoredPhotoPointer(r.evidencePhoto, `photo_${r.id}`),
    }));
    saveStoredJson(ADMIN_REPORTS_STORAGE_KEY, lightweightReports);
  }, [hasHydrated, rawReports]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveStoredJson(ADMIN_TECHNICIANS_STORAGE_KEY, rawTechnicians);
  }, [hasHydrated, rawTechnicians]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveStoredJson(ADMIN_ACTIVITIES_STORAGE_KEY, rawActivities);
  }, [hasHydrated, rawActivities]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveStoredJson(ADMIN_NOTIFICATIONS_STORAGE_KEY, backendNotifications);
  }, [hasHydrated, backendNotifications]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveStoredJson(ADMIN_READ_NOTIFICATIONS_KEY, readNotificationIds);
  }, [hasHydrated, readNotificationIds]);

  // Indeks tugas hidup dari TaskContext (termasuk pembaruan status real-time Technician)
  const taskByReportId = useMemo(() => {
    const map = new Map();
    (allTasks || []).forEach((task) => {
      const key = (task.sourceReportId || task.id || '').toUpperCase();
      if (key) map.set(key, task);
    });
    return map;
  }, [allTasks]);

  // Derived reports: gabungkan rawReports dengan liveTask hanya bila TaskContext bukan fallback offline saat Admin online
  const reports = useMemo(() => {
    const allowTaskOverlay = !tasksUsingFallback || isUsingFallback;

    return rawReports.map((report) => {
      if (!allowTaskOverlay) return report;
      const liveTask = taskByReportId.get(report.id.toUpperCase());
      if (!shouldOverlayLiveTask(report, liveTask)) {
        return report;
      }

      return {
        ...report,
        status: liveTask.status,
        assignedTechnician:
          liveTask.assignedTechnicianName ||
          liveTask.assignedTechnician ||
          report.assignedTechnician,
        assignedTechnicianId:
          liveTask.assignedTechnicianId || report.assignedTechnicianId,
        repairNotes:
          liveTask.repairNotes !== undefined ? liveTask.repairNotes : report.repairNotes,
        evidencePhoto:
          liveTask.evidencePhoto !== undefined
            ? liveTask.evidencePhoto
            : report.evidencePhoto,
        completedDate:
          liveTask.completedDate !== undefined
            ? liveTask.completedDate
            : report.completedDate,
        completionDay:
          liveTask.completionDay !== undefined
            ? liveTask.completionDay
            : report.completionDay,
        duration:
          liveTask.duration !== undefined ? liveTask.duration : report.duration,
        updates: Array.isArray(liveTask.updates) ? liveTask.updates : report.updates,
      };
    });
  }, [rawReports, taskByReportId, tasksUsingFallback, isUsingFallback]);

  // Derived technicians: activeTasks, completedTasks & workHistory dihitung murni dari koleksi reports (anti double-counting)
  const technicians = useMemo(() => {
    return rawTechnicians.map((tech) => {
      const assignedReports = reports.filter(
        (r) =>
          r.assignedTechnicianId &&
          r.assignedTechnicianId.toLowerCase() === tech.id.toLowerCase()
      );

      const computedActiveTasks = assignedReports.filter(
        (r) => r.status === 'Assigned' || r.status === 'In Progress'
      ).length;

      const computedCompletedTasks = assignedReports.filter(
        (r) => r.status === 'Completed'
      ).length;

      let nextAvailability = tech.availability;
      if (tech.availability !== 'Unavailable') {
        nextAvailability = computedActiveTasks > 0 ? 'On Duty' : 'Available';
      }

      const workHistory = assignedReports
        .map((r) => ({
          reportId: r.id,
          title: r.title,
          location: r.location,
          date:
            r.status === 'Completed' && r.completedDate
              ? r.completedDate.split(',')[0]
              : (r.updates?.[0]?.timestamp || r.reportedDate || '').split(',')[0],
          status: r.status,
          sortTime: parseWitaTimestampMs(
            r.completedDate || r.updates?.[0]?.timestamp || r.reportedDate
          ),
        }))
        .sort((a, b) => b.sortTime - a.sortTime)
        .map((item) => ({
          reportId: item.reportId,
          title: item.title,
          location: item.location,
          date: item.date,
          status: item.status,
        }));

      return {
        ...tech,
        activeTasks: computedActiveTasks,
        completedTasks: computedCompletedTasks,
        availability: nextAvailability,
        status: nextAvailability,
        workHistory,
      };
    });
  }, [rawTechnicians, reports]);

  // Derived activities: gabungkan pembaruan terbaru Technician pada reports dengan rawActivities dari backend
  const activities = useMemo(() => {
    const taskUpdateActivities = [];

    reports.forEach((report) => {
      if (!TECHNICIAN_TASK_STATUSES.has(report.status)) return;
      (report.updates || []).forEach((upd) => {
        if (upd.status === 'In Progress' || upd.status === 'Completed') {
          const alreadyLogged = rawActivities.some(
            (act) =>
              act.reportId === report.id &&
              ((upd.status === 'Completed' && act.type === 'completed') ||
                (upd.status === 'In Progress' && act.type === 'assigned' && act.timestamp === upd.timestamp))
          );
          if (!alreadyLogged) {
            taskUpdateActivities.push({
              id: `SYNC-${report.id}-${upd.id}`,
              type: upd.status === 'Completed' ? 'completed' : 'assigned',
              title:
                upd.status === 'Completed'
                  ? 'Perbaikan telah selesai'
                  : 'Teknisi mulai mengerjakan',
              detail: `${report.title} — ${upd.notes}`,
              reportId: report.id,
              actor: upd.author || report.assignedTechnician || 'Teknisi',
              timestamp: upd.timestamp,
            });
          }
        }
      });
    });

    return [...taskUpdateActivities, ...rawActivities].sort(
      (a, b) => parseWitaTimestampMs(b.timestamp) - parseWitaTimestampMs(a.timestamp)
    );
  }, [reports, rawActivities]);

  // Derived notifications: sinkron dengan backend /notifications + aktivitas Technician/Admin langsung
  const notifications = useMemo(() => {
    const readSet = new Set(readNotificationIds);
    const items = [];
    const trackedKeys = new Set();

    // 1. Notifikasi Admin persisten dari GET /notifications?recipientId=admin
    backendNotifications.forEach((notif, idx) => {
      const notifType = ADMIN_NOTIFICATION_TYPE_META[notif.type]
        ? notif.type
        : 'incoming';
      items.push({
        id: notif.id,
        type: notifType,
        typeLabel: ADMIN_NOTIFICATION_TYPE_META[notifType],
        title: notif.title,
        description: notif.message || notif.description || '',
        reportId: notif.reportId || null,
        actor: notif.actor || 'Sistem',
        timestamp: notif.timestamp,
        sortTime: parseWitaTimestampMs(notif.timestamp),
        orderHint: idx,
        persistedOnServer: true,
        serverIsRead: Boolean(notif.isRead),
      });
      if (notif.reportId) {
        trackedKeys.add(`${notifType}::${notif.reportId}`);
      }
    });

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

    // 2. Aktivitas terbaru dari Technician / Admin yang belum ada di backendNotifications
    activities.forEach((act, idx) => {
      const notifType = classifyActivityType(act);
      const syntheticId = `NOTIF-ACT-${act.id}`;
      const dedupKey = act.reportId ? `${notifType}::${act.reportId}` : null;

      if (items.some((i) => i.id === syntheticId)) return;
      if (dedupKey && trackedKeys.has(dedupKey) && !act.id?.startsWith('SYNC-')) {
        return;
      }
      if (
        act.id?.startsWith('SYNC-') &&
        backendNotifications.some(
          (n) =>
            n.reportId === act.reportId &&
            n.type === notifType &&
            n.timestamp === act.timestamp
        )
      ) {
        return;
      }

      items.push({
        id: syntheticId,
        type: notifType,
        typeLabel: ADMIN_NOTIFICATION_TYPE_META[notifType],
        title: act.title,
        description: act.detail,
        reportId: act.reportId || null,
        actor: act.actor || 'Sistem',
        timestamp: act.timestamp,
        sortTime: parseWitaTimestampMs(act.timestamp),
        orderHint: idx + 100,
        persistedOnServer: false,
        serverIsRead: false,
      });

      if (dedupKey) trackedKeys.add(dedupKey);
    });

    // 3. Peringatan langsung dari status reports (menunggu verifikasi & kritis AI)
    reports.forEach((report, idx) => {
      if (report.status === 'Pending' && !trackedKeys.has(`verification_needed::${report.id}`)) {
        items.push({
          id: `NOTIF-VERIFY-${report.id}`,
          type: 'verification_needed',
          typeLabel: ADMIN_NOTIFICATION_TYPE_META.verification_needed,
          title: 'Laporan membutuhkan verifikasi',
          description: `${report.title} (${report.location}) menunggu verifikasi dan penetapan prioritas Admin.`,
          reportId: report.id,
          actor: `${report.reporterName} (${report.reporterRole})`,
          timestamp: report.reportedDate,
          sortTime: parseWitaTimestampMs(report.reportedDate) + 1,
          orderHint: idx + 200,
          persistedOnServer: false,
          serverIsRead: false,
        });
      }

      if (
        report.aiUrgency === 'Critical' &&
        report.status !== 'Completed' &&
        report.status !== 'Rejected' &&
        !trackedKeys.has(`critical_ai::${report.id}`)
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
          sortTime: parseWitaTimestampMs(report.reportedDate) + 2,
          orderHint: idx + 300,
          persistedOnServer: false,
          serverIsRead: false,
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
        isRead: Boolean(item.serverIsRead || readSet.has(item.id)),
      }));
  }, [backendNotifications, activities, reports, readNotificationIds]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const getReportById = (reportId) =>
    reports.find((report) => report.id === reportId) || null;

  // Helper internal: simpan log aktivitas ke POST /activities
  const recordActivity = async (activityPayload) => {
    try {
      const savedActivity = await createActivityInApi(activityPayload);
      setRawActivities((prev) => [savedActivity, ...prev]);
    } catch (err) {
      console.warn('Gagal mencatat aktivitas ke JSON Server:', err);
      setRawActivities((prev) => [activityPayload, ...prev]);
    }
  };

  // Helper internal: simpan notifikasi baru ke POST /notifications
  const recordNotifications = async (notifPayloads) => {
    for (const payload of notifPayloads) {
      try {
        const saved = await createNotificationInApi(payload);
        if (payload.recipientId === 'admin') {
          setBackendNotifications((prev) => [saved, ...prev]);
        }
      } catch (err) {
        console.warn('Gagal membuat notifikasi di JSON Server:', err);
        if (payload.recipientId === 'admin') {
          setBackendNotifications((prev) => [payload, ...prev]);
        }
      }
    }
  };

  /**
   * Menyetujui laporan Pending -> Approved via PATCH /reports/:id
   */
  const approveReport = async (
    reportId,
    nextPriority,
    adminName = 'Admin Sarana & Fasilitas'
  ) => {
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
    const timestamp = formatWitaTimestamp();
    const statusNote = `Disetujui Admin dengan prioritas akhir ${priorityLabel}, menunggu penugasan teknisi.`;

    const patchPayload = {
      status: 'Approved',
      adminPriority: resolvedPriority,
      priority: resolvedPriority,
      rejectionReason: null,
      statusNote,
    };

    try {
      const updatedReport = await patchReportInApi(reportId, patchPayload);
      const normalized = normalizeAdminReport({ ...target, ...updatedReport, ...patchPayload });

      setRawReports((prev) =>
        prev.map((r) => (r.id === reportId ? normalized : r))
      );

      await recordActivity({
        id: `ACT-${Date.now()}`,
        type: 'approved',
        title: 'Admin menyetujui laporan',
        detail: `${target.title} disetujui dengan prioritas akhir ${priorityLabel}.`,
        reportId,
        actor: adminName,
        timestamp,
      });

      const notifBatch = [
        {
          id: `NTF-ADM-${Date.now()}`,
          recipientId: 'admin',
          targetRole: 'Admin',
          type: 'verification_result',
          title: 'Admin menyetujui laporan',
          message: `${target.title} disetujui dengan prioritas akhir ${priorityLabel}.`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        },
      ];

      if (target.reporterId) {
        notifBatch.push({
          id: `NTF-RPT-${Date.now() + 1}`,
          recipientId: target.reporterId,
          targetRole: 'Reporter',
          type: 'approved',
          title: 'Laporan Telah Disetujui',
          message: `Laporan "${target.title}" telah disetujui Admin dengan prioritas ${priorityLabel}.`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        });
      }

      await recordNotifications(notifBatch);
      setError('');

      return { success: true, message: `Laporan ${reportId} berhasil disetujui.` };
    } catch (err) {
      const msg =
        err?.message || 'Gagal menyetujui laporan ke server backend. Silakan coba lagi.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menolak laporan dengan alasan wajib via PATCH /reports/:id
   */
  const rejectReport = async (
    reportId,
    reason,
    adminName = 'Admin Sarana & Fasilitas'
  ) => {
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

    const timestamp = formatWitaTimestamp();
    const patchPayload = {
      status: 'Rejected',
      rejectionReason: cleanReason,
      statusNote: `Ditolak: ${cleanReason}`,
    };

    try {
      const updatedReport = await patchReportInApi(reportId, patchPayload);
      const normalized = normalizeAdminReport({ ...target, ...updatedReport, ...patchPayload });

      setRawReports((prev) =>
        prev.map((r) => (r.id === reportId ? normalized : r))
      );

      await recordActivity({
        id: `ACT-${Date.now()}`,
        type: 'priority',
        title: 'Laporan ditolak Admin',
        detail: `${target.title} ditolak. Alasan: ${cleanReason}`,
        reportId,
        actor: adminName,
        timestamp,
      });

      const notifBatch = [
        {
          id: `NTF-ADM-${Date.now()}`,
          recipientId: 'admin',
          targetRole: 'Admin',
          type: 'verification_result',
          title: 'Laporan ditolak Admin',
          message: `${target.title} ditolak. Alasan: ${cleanReason}`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        },
      ];

      if (target.reporterId) {
        notifBatch.push({
          id: `NTF-RPT-${Date.now() + 1}`,
          recipientId: target.reporterId,
          targetRole: 'Reporter',
          type: 'rejected',
          title: 'Laporan Ditolak oleh Admin',
          message: `Laporan "${target.title}" ditolak. Alasan: ${cleanReason}`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        });
      }

      await recordNotifications(notifBatch);
      setError('');

      return { success: true, message: `Laporan ${reportId} telah ditolak.` };
    } catch (err) {
      const msg =
        err?.message || 'Gagal menolak laporan ke server backend. Silakan coba lagi.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menetapkan atau mengubah prioritas akhir Admin via PATCH /reports/:id
   */
  const updateReportPriority = async (
    reportId,
    newPriority,
    adminName = 'Admin Sarana & Fasilitas'
  ) => {
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
    const timestamp = formatWitaTimestamp();

    const patchPayload = {
      adminPriority: newPriority,
      priority: newPriority,
    };

    try {
      const updatedReport = await patchReportInApi(reportId, patchPayload);
      const normalized = normalizeAdminReport({ ...target, ...updatedReport, ...patchPayload });

      setRawReports((prev) =>
        prev.map((r) => (r.id === reportId ? normalized : r))
      );

      await recordActivity({
        id: `ACT-${Date.now()}`,
        type: 'priority',
        title: `Prioritas Admin ditetapkan: ${priorityLabel}`,
        detail: `${target.title} (Rekomendasi AI: ${aiLabel} → Keputusan Admin: ${priorityLabel}).`,
        reportId,
        actor: adminName,
        timestamp,
      });

      setError('');

      return {
        success: true,
        message: `Prioritas akhir laporan ${reportId} disimpan sebagai ${priorityLabel}.`,
      };
    } catch (err) {
      const msg =
        err?.message || 'Gagal memperbarui prioritas ke server backend. Silakan coba lagi.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menganalisis ulang laporan dengan Gemini AI tanpa mengubah status maupun adminPriority
   */
  const reanalyzeReportWithAi = async (reportId) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }

    try {
      const analysis = await analyzeMaintenanceReport({
        title: target.title,
        description: target.description || target.title,
        location: target.location || '',
        category: target.category || '',
        urgency: target.urgency || '',
      });

      const nextAiAnalysis = {
        category: analysis.category,
        adminCategory: analysis.adminCategory,
        urgency: analysis.urgency,
        urgencyReason: analysis.urgencyReason,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        insufficientInfo: Boolean(analysis.insufficientInfo),
        advisoryOnly: true,
        model: analysis.model,
        source: 'gemini',
      };

      // Hanya perbarui field rekomendasi AI; status dan adminPriority tetap utuh
      const patchPayload = {
        aiUrgency: analysis.urgency,
        aiSummary: analysis.summary,
        aiAnalysis: nextAiAnalysis,
      };

      const updatedReport = await patchReportInApi(reportId, patchPayload);
      const normalized = normalizeAdminReport({
        ...target,
        ...updatedReport,
        ...patchPayload,
      });

      setRawReports((prev) =>
        prev.map((r) => (r.id === reportId ? normalized : r))
      );
      setError('');

      return {
        success: true,
        analysis: nextAiAnalysis,
        message: `Analisis AI untuk laporan ${reportId} berhasil diperbarui.`,
      };
    } catch (err) {
      const msg =
        err?.message ||
        'Gagal menganalisis ulang laporan dengan AI. Status dan prioritas laporan tetap aman.';
      return { success: false, message: msg };
    }
  };

  /**
   * Menambahkan teknisi baru via POST /technicians
   */
  const addTechnician = async (payload) => {
    const newTech = {
      ...payload,
      userId: null,
      status: payload.availability,
      activeTasks: 0,
      completedTasks: 0,
      avatarColor: 'from-[#2563EB] to-[#06B6D4]',
      joinedAt: formatWitaDateOnly(new Date()).replace(/^\d{2}\s+/, ''),
      workHistory: [],
    };

    try {
      const createdTech = await createTechnicianInApi(newTech);
      setRawTechnicians((prev) => [createdTech, ...prev]);
      setError('');
      return {
        success: true,
        technician: createdTech,
        message: `Teknisi ${createdTech.name} (${createdTech.id}) berhasil ditambahkan.`,
      };
    } catch (err) {
      const msg =
        err?.message || 'Gagal menambahkan teknisi ke server backend.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Memperbarui data teknisi via PATCH /technicians/:id (ID teknisi dikunci)
   */
  const updateTechnician = async (payload) => {
    const existingTech = technicians.find((t) => t.id === payload.id);
    const derivedAvailability =
      payload.availability === 'Unavailable'
        ? 'Unavailable'
        : existingTech && existingTech.activeTasks > 0
        ? 'On Duty'
        : payload.availability;

    const patchPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      specialization: payload.specialization,
      availability: payload.availability,
      status: derivedAvailability,
    };

    try {
      const updatedTech = await patchTechnicianInApi(payload.id, patchPayload);
      setRawTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === payload.id ? { ...tech, ...updatedTech } : tech
        )
      );
      setError('');
      return {
        success: true,
        technician: updatedTech,
        message: `Data teknisi ${payload.name} (${payload.id}) berhasil diperbarui.`,
      };
    } catch (err) {
      const msg =
        err?.message || 'Gagal memperbarui data teknisi ke server backend.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menugaskan laporan Approved kepada teknisi via PATCH /reports/:id dan menyinkronkan ke TaskContext
   */
  const assignReportToTechnician = async (
    reportId,
    technicianId,
    adminName = 'Admin Sarana & Fasilitas'
  ) => {
    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) {
      return { success: false, message: 'Laporan tidak ditemukan.' };
    }

    if (
      targetReport.status !== 'Approved' ||
      targetReport.assignedTechnicianId ||
      targetReport.assignedTechnician
    ) {
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

    const timestamp = formatWitaTimestamp();
    const effectivePriority =
      targetReport.adminPriority || targetReport.aiUrgency || 'Medium';

    const assignmentUpdate = {
      id: `upd-${Date.now()}`,
      timestamp,
      author: adminName,
      status: 'Assigned',
      notes: `Laporan diverifikasi dan ditugaskan kepada ${targetTech.name} (${targetTech.id}) dengan prioritas ${effectivePriority}.`,
    };

    const nextUpdates = [assignmentUpdate, ...(targetReport.updates || [])];

    const patchPayload = {
      status: 'Assigned',
      adminPriority: effectivePriority,
      priority: effectivePriority,
      assignedByAdmin: true,
      assignedTechnicianId: targetTech.id,
      assignedTechnician: targetTech.name,
      statusNote: `Ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
      updates: nextUpdates,
    };

    try {
      const updatedReport = await patchReportInApi(reportId, patchPayload);
      const normalized = normalizeAdminReport({
        ...targetReport,
        ...updatedReport,
        ...patchPayload,
      });

      setRawReports((prev) =>
        prev.map((r) => (r.id === reportId ? normalized : r))
      );

      // Sinkronkan juga ke TaskContext in-memory agar akun Teknisi langsung menerimanya
      assignTaskFromAdmin(
        { ...targetReport, adminPriority: effectivePriority },
        targetTech,
        adminName
      );

      // Perbarui metadata teknisi di backend jika bukan Unavailable
      const nextActiveCount = targetTech.activeTasks + 1;
      try {
        await patchTechnicianInApi(targetTech.id, {
          activeTasks: nextActiveCount,
          availability: 'On Duty',
          status: 'On Duty',
        });
      } catch (techErr) {
        console.warn('Gagal memperbarui ringkasan teknisi di JSON Server:', techErr);
      }

      await recordActivity({
        id: `ACT-${Date.now()}`,
        type: 'assigned',
        title: 'Teknisi ditugaskan Admin',
        detail: `${targetReport.title} ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
        reportId,
        actor: adminName,
        timestamp,
      });

      const notifBatch = [
        {
          id: `NTF-ADM-${Date.now()}`,
          recipientId: 'admin',
          targetRole: 'Admin',
          type: 'assigned',
          title: 'Teknisi berhasil ditugaskan',
          message: `${targetReport.title} ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        },
      ];

      if (targetReport.reporterId) {
        notifBatch.push({
          id: `NTF-RPT-${Date.now() + 1}`,
          recipientId: targetReport.reporterId,
          targetRole: 'Reporter',
          type: 'assigned',
          title: 'Teknisi Telah Ditugaskan',
          message: `Teknisi ${targetTech.name} telah ditugaskan menangani "${targetReport.title}".`,
          reportId,
          actor: adminName,
          timestamp,
          isRead: false,
        });
      }

      await recordNotifications(notifBatch);
      setError('');

      return {
        success: true,
        message: `Penugasan berhasil! Laporan ${reportId} telah ditugaskan kepada ${targetTech.name} (${targetTech.id}).`,
      };
    } catch (err) {
      const msg =
        err?.message || 'Gagal menyimpan penugasan teknisi ke server backend.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menandai satu notifikasi sebagai sudah dibaca (PATCH /notifications/:id atau POST /notifications)
   */
  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return { success: false };

    const targetNotif = notifications.find((n) => n.id === notificationId);
    if (!targetNotif || targetNotif.isRead) return { success: true };

    try {
      if (targetNotif.persistedOnServer) {
        await markNotificationAsReadInApi(notificationId);
        setBackendNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item
          )
        );
      } else {
        const createdPayload = {
          id: notificationId,
          recipientId: 'admin',
          targetRole: 'Admin',
          type: targetNotif.type,
          title: targetNotif.title,
          message: targetNotif.description,
          reportId: targetNotif.reportId || null,
          actor: targetNotif.actor || 'Sistem',
          timestamp: targetNotif.timestamp,
          isRead: true,
        };
        try {
          const saved = await createNotificationInApi(createdPayload);
          setBackendNotifications((prev) => [saved, ...prev]);
        } catch (createErr) {
          if (createErr?.status === 409 || createErr?.status === 500) {
            await markNotificationAsReadInApi(notificationId);
          } else {
            throw createErr;
          }
        }
      }

      setReadNotificationIds((prev) =>
        prev.includes(notificationId) ? prev : [...prev, notificationId]
      );
      setError('');
      return { success: true };
    } catch (err) {
      const msg =
        err?.message || 'Gagal memperbarui status baca notifikasi di server.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Menandai seluruh notifikasi Admin sebagai sudah dibaca
   */
  const markAllNotificationsAsRead = async () => {
    const unreadItems = notifications.filter((item) => !item.isRead);
    if (unreadItems.length === 0) return { success: true };

    try {
      await Promise.all(
        unreadItems.map(async (item) => {
          if (item.persistedOnServer) {
            await markNotificationAsReadInApi(item.id);
          } else {
            const payload = {
              id: item.id,
              recipientId: 'admin',
              targetRole: 'Admin',
              type: item.type,
              title: item.title,
              message: item.description,
              reportId: item.reportId || null,
              actor: item.actor || 'Sistem',
              timestamp: item.timestamp,
              isRead: true,
            };
            try {
              const saved = await createNotificationInApi(payload);
              setBackendNotifications((prev) =>
                prev.some((n) => n.id === saved.id) ? prev : [saved, ...prev]
              );
            } catch (createErr) {
              if (createErr?.status === 409 || createErr?.status === 500) {
                await markNotificationAsReadInApi(item.id);
              } else {
                throw createErr;
              }
            }
          }
        })
      );

      setBackendNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );

      setReadNotificationIds((prev) => {
        const merged = new Set(prev);
        unreadItems.forEach((item) => merged.add(item.id));
        return Array.from(merged);
      });

      setError('');
      return { success: true };
    } catch (err) {
      const msg =
        err?.message || 'Gagal menandai seluruh notifikasi sebagai dibaca.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    reports,
    technicians,
    activities,
    notifications,
    unreadNotificationCount,
    loading,
    error,
    getReportById,
    approveReport,
    rejectReport,
    updateReportPriority,
    reanalyzeReportWithAi,
    addTechnician,
    updateTechnician,
    assignReportToTechnician,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshAdminData,
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
