import { apiGet, apiPost, apiPatch } from './apiClient.js';

/**
 * Mengambil seluruh log aktivitas operasional dari collection activities.
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllActivities(params) {
  const activities = await apiGet('/activities', params);
  return Array.isArray(activities) ? activities : [];
}

/**
 * Mencatat aktivitas sistem baru ke collection activities.
 * @param {Object} activityData
 * @returns {Promise<Object>}
 */
export async function createActivity(activityData) {
  if (!activityData || typeof activityData !== 'object') {
    throw new Error('Data aktivitas tidak valid.');
  }
  return apiPost('/activities', activityData);
}

/**
 * Mengambil daftar notifikasi berdasarkan recipientId pengguna penerima
 * (contoh: 'admin', '105021234', '091234567', '19850412').
 * @param {string} recipientId
 * @returns {Promise<Array<Object>>}
 */
export async function getNotificationsByRecipientId(recipientId) {
  if (!recipientId) return [];
  const notifications = await apiGet('/notifications', { recipientId });
  return Array.isArray(notifications) ? notifications : [];
}

/**
 * Mengambil seluruh data notifikasi (opsional dengan filter query tambahan).
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllNotifications(params) {
  const notifications = await apiGet('/notifications', params);
  return Array.isArray(notifications) ? notifications : [];
}

/**
 * Membuat notifikasi baru di collection notifications.
 * @param {Object} notificationData
 * @returns {Promise<Object>}
 */
export async function createNotification(notificationData) {
  if (!notificationData || typeof notificationData !== 'object') {
    throw new Error('Data notifikasi tidak valid.');
  }
  return apiPost('/notifications', notificationData);
}

/**
 * Memperbarui field notifikasi (termasuk status isRead) via PATCH.
 * @param {string} notificationId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateNotification(notificationId, updates) {
  if (!notificationId) {
    throw new Error('ID notifikasi wajib diisi untuk memperbarui notifikasi.');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('Data pembaruan notifikasi tidak valid.');
  }
  return apiPatch(`/notifications/${encodeURIComponent(notificationId)}`, updates);
}

/**
 * Menandai satu notifikasi sebagai sudah dibaca (isRead: true).
 * @param {string} notificationId
 * @returns {Promise<Object>}
 */
export async function markNotificationAsRead(notificationId) {
  return updateNotification(notificationId, { isRead: true });
}
