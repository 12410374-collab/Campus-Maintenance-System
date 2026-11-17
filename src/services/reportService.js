import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient.js';

/**
 * Mengambil seluruh data laporan kerusakan (opsional dengan parameter query tambahan).
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllReports(params) {
  const reports = await apiGet('/reports', params);
  return Array.isArray(reports) ? reports : [];
}

/**
 * Mengambil detail satu laporan berdasarkan ID laporan.
 * @param {string} reportId
 * @returns {Promise<Object>}
 */
export async function getReportById(reportId) {
  if (!reportId) {
    throw new Error('ID laporan wajib diisi untuk mengambil detail laporan.');
  }
  return apiGet(`/reports/${encodeURIComponent(reportId)}`);
}

/**
 * Mengambil daftar laporan milik pelapor tertentu berdasarkan reporterId.
 * @param {string} reporterId
 * @returns {Promise<Array<Object>>}
 */
export async function getReportsByReporterId(reporterId) {
  if (!reporterId) return [];
  const reports = await apiGet('/reports', { reporterId });
  return Array.isArray(reports) ? reports : [];
}

/**
 * Mengambil daftar laporan berdasarkan status internal
 * ('Pending' | 'Approved' | 'Assigned' | 'In Progress' | 'Completed' | 'Rejected').
 * @param {string} status
 * @returns {Promise<Array<Object>>}
 */
export async function getReportsByStatus(status) {
  if (!status) return [];
  const reports = await apiGet('/reports', { status });
  return Array.isArray(reports) ? reports : [];
}

/**
 * Mengambil daftar laporan/tugas yang ditugaskan kepada teknisi tertentu.
 * @param {string} assignedTechnicianId
 * @returns {Promise<Array<Object>>}
 */
export async function getReportsByAssignedTechnicianId(assignedTechnicianId) {
  if (!assignedTechnicianId) return [];
  const reports = await apiGet('/reports', { assignedTechnicianId });
  return Array.isArray(reports) ? reports : [];
}

/**
 * Membuat laporan kerusakan baru ke collection reports.
 * @param {Object} reportData
 * @returns {Promise<Object>}
 */
export async function createReport(reportData) {
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('Data laporan tidak valid.');
  }
  return apiPost('/reports', reportData);
}

/**
 * Memperbarui sebagian field laporan (verifikasi Admin, penugasan, atau progres Teknisi) via PATCH.
 * @param {string} reportId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateReport(reportId, updates) {
  if (!reportId) {
    throw new Error('ID laporan wajib diisi untuk memperbarui laporan.');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('Data pembaruan laporan tidak valid.');
  }
  return apiPatch(`/reports/${encodeURIComponent(reportId)}`, updates);
}

/**
 * Menghapus laporan berdasarkan ID via DELETE.
 * @param {string} reportId
 * @returns {Promise<Object | null>}
 */
export async function deleteReport(reportId) {
  if (!reportId) {
    throw new Error('ID laporan wajib diisi untuk menghapus laporan.');
  }
  return apiDelete(`/reports/${encodeURIComponent(reportId)}`);
}
