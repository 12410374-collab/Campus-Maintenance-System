import { apiGet } from './apiClient.js';

/**
 * Mengambil seluruh daftar akun pengguna dari JSON Server.
 * @returns {Promise<Array<Object>>}
 */
export async function getAllUsers() {
  const users = await apiGet('/users');
  return Array.isArray(users) ? users : [];
}

/**
 * Mengambil satu pengguna berdasarkan identifier (NIM/NIDN/NIP/ID Teknisi/username).
 * @param {string} identifier
 * @returns {Promise<Object | null>}
 */
export async function getUserByIdentifier(identifier) {
  const cleanId = identifier?.trim();
  if (!cleanId) return null;

  const matched = await apiGet('/users', { identifier: cleanId });
  if (Array.isArray(matched) && matched.length > 0) {
    return matched[0];
  }
  return null;
}

/**
 * Mengambil satu pengguna berdasarkan alamat email.
 * @param {string} email
 * @returns {Promise<Object | null>}
 */
export async function getUserByEmail(email) {
  const cleanEmail = email?.trim();
  if (!cleanEmail) return null;

  const matched = await apiGet('/users', { email: cleanEmail });
  if (Array.isArray(matched) && matched.length > 0) {
    return matched[0];
  }
  return null;
}

/**
 * Mencari akun pengguna berdasarkan identifier atau email (mendukung pencocokan case-insensitive).
 * @param {string} identifierOrEmail
 * @returns {Promise<Object | null>}
 */
export async function findUserByIdentifierOrEmail(identifierOrEmail) {
  const cleanQuery = identifierOrEmail?.trim();
  if (!cleanQuery) return null;

  const byIdentifier = await getUserByIdentifier(cleanQuery);
  if (byIdentifier) return byIdentifier;

  const byEmail = await getUserByEmail(cleanQuery);
  if (byEmail) return byEmail;

  // Fallback case-insensitive agar tetap konsisten apabila kapitalisasi input berbeda
  const allUsers = await getAllUsers();
  const lowerQuery = cleanQuery.toLowerCase();

  return (
    allUsers.find(
      (user) =>
        user.identifier?.toLowerCase() === lowerQuery ||
        user.email?.toLowerCase() === lowerQuery
    ) || null
  );
}
