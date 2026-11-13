/**
 * IndexedDB helper for persisting large repair evidence photos safely
 * without exceeding the browser's ~5MB localStorage quota limit.
 */

const DB_NAME = 'CampusMaintenanceDB';
const DB_VERSION = 1;
const STORE_NAME = 'evidence_photos';

function openDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('Gagal membuka IndexedDB:', event.target.error);
      resolve(null);
    };
  });
}

/**
 * Save image dataURL or Blob into IndexedDB
 * @param {string} key
 * @param {string} dataUrl
 */
export async function saveEvidenceImage(key, dataUrl) {
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(dataUrl, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Gagal menyimpan foto ke IndexedDB:', err);
    return false;
  }
}

/**
 * Retrieve image from IndexedDB
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getEvidenceImage(key) {
  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Gagal mengambil foto dari IndexedDB:', err);
    return null;
  }
}

/**
 * Get all photos stored in IndexedDB as a key-value dictionary
 * @returns {Promise<Record<string, string>>}
 */
export async function getAllEvidenceImages() {
  try {
    const db = await openDB();
    if (!db) return {};

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const photos = {};

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          photos[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          resolve(photos);
        }
      };

      request.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('Gagal memuat seluruh foto dari IndexedDB:', err);
    return {};
  }
}
