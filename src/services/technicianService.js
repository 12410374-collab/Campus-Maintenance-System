import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient.js';

/**
 * Mengambil seluruh daftar teknisi dari collection technicians.
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {Promise<Array<Object>>}
 */
export async function getAllTechnicians(params) {
  const technicians = await apiGet('/technicians', params);
  return Array.isArray(technicians) ? technicians : [];
}

/**
 * Mengambil detail satu teknisi berdasarkan ID (misal: TECH-001).
 * @param {string} technicianId
 * @returns {Promise<Object>}
 */
export async function getTechnicianById(technicianId) {
  if (!technicianId) {
    throw new Error('ID teknisi wajib diisi untuk mengambil data teknisi.');
  }
  return apiGet(`/technicians/${encodeURIComponent(technicianId)}`);
}

/**
 * Menambahkan teknisi baru ke collection technicians.
 * @param {Object} technicianData
 * @returns {Promise<Object>}
 */
export async function createTechnician(technicianData) {
  if (!technicianData || typeof technicianData !== 'object') {
    throw new Error('Data teknisi tidak valid.');
  }
  return apiPost('/technicians', technicianData);
}

/**
 * Memperbarui profil, ketersediaan, atau beban kerja teknisi via PATCH.
 * @param {string} technicianId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateTechnician(technicianId, updates) {
  if (!technicianId) {
    throw new Error('ID teknisi wajib diisi untuk memperbarui data teknisi.');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('Data pembaruan teknisi tidak valid.');
  }
  return apiPatch(`/technicians/${encodeURIComponent(technicianId)}`, updates);
}

/**
 * Menghapus data teknisi berdasarkan ID via DELETE.
 * @param {string} technicianId
 * @returns {Promise<Object | null>}
 */
export async function deleteTechnician(technicianId) {
  if (!technicianId) {
    throw new Error('ID teknisi wajib diisi untuk menghapus data teknisi.');
  }
  return apiDelete(`/technicians/${encodeURIComponent(technicianId)}`);
}
