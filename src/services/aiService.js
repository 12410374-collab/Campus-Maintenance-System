const DEFAULT_AI_API_BASE_URL = 'http://localhost:3002';
const DEFAULT_REQUEST_TIMEOUT_MS = 18000;

export const AI_API_BASE_URL =
  (import.meta.env?.VITE_AI_API_URL || '').trim().replace(/\/+$/, '') ||
  DEFAULT_AI_API_BASE_URL;

/**
 * Mengirim permintaan HTTP ke AI Proxy Server lokal (bukan ke Gemini API langsung).
 * @param {string} endpoint
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
async function requestAiProxy(endpoint, { method = 'GET', body, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = {}) {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${AI_API_BASE_URL}${normalizedPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const config = {
    method,
    headers: {
      Accept: 'application/json',
    },
    signal: controller.signal,
  };

  if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    if (err?.name === 'AbortError') {
      const timeoutError = new Error(
        'Permintaan analisis AI melebihi batas waktu. Silakan coba beberapa saat lagi.'
      );
      timeoutError.code = 'AI_CLIENT_TIMEOUT';
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    const networkError = new Error(
      `Gagal terhubung ke AI Proxy Server (${AI_API_BASE_URL}). Pastikan server AI sedang berjalan.`
    );
    networkError.cause = err;
    networkError.code = 'AI_NETWORK_ERROR';
    networkError.isNetworkError = true;
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }

  const rawText = await response.text();
  let parsedData = null;

  if (rawText) {
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = rawText;
    }
  }

  if (!response.ok) {
    const serverMessage =
      parsedData && typeof parsedData === 'object' && parsedData.message
        ? parsedData.message
        : response.statusText || 'Terjadi kesalahan pada AI Proxy Server.';

    const error = new Error(serverMessage);
    error.status = response.status;
    error.code =
      parsedData && typeof parsedData === 'object' ? parsedData.code : 'AI_HTTP_ERROR';
    error.data = parsedData;
    throw error;
  }

  return parsedData;
}

/**
 * Memeriksa status kesehatan AI Proxy Server.
 * @returns {Promise<Object>}
 */
export async function checkAiHealth() {
  return requestAiProxy('/api/ai/health', {
    method: 'GET',
    timeoutMs: 5000,
  });
}

/**
 * Menganalisis laporan kerusakan fasilitas melalui AI Proxy Server.
 * Hasil bersifat advisory/rekomendasi; keputusan akhir persetujuan dan prioritas tetap berada pada Admin.
 *
 * @param {Object} reportInput
 * @param {string} reportInput.title
 * @param {string} reportInput.description
 * @param {string} [reportInput.location]
 * @param {string} [reportInput.category]
 * @param {string} [reportInput.urgency]
 * @param {Object} [options]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<Object>}
 */
export async function analyzeMaintenanceReport(reportInput, options = {}) {
  const title = typeof reportInput?.title === 'string' ? reportInput.title.trim() : '';
  const description =
    typeof reportInput?.description === 'string' ? reportInput.description.trim() : '';

  if (!title) {
    const error = new Error('Judul laporan wajib diisi sebelum melakukan analisis AI.');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!description) {
    const error = new Error('Deskripsi kerusakan wajib diisi sebelum melakukan analisis AI.');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const payload = {
    title,
    description,
    location: typeof reportInput?.location === 'string' ? reportInput.location.trim() : '',
    category: typeof reportInput?.category === 'string' ? reportInput.category.trim() : '',
    urgency: typeof reportInput?.urgency === 'string' ? reportInput.urgency.trim() : '',
  };

  const result = await requestAiProxy('/api/ai/analyze-report', {
    method: 'POST',
    body: payload,
    timeoutMs: options.timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
  });

  if (!result || typeof result !== 'object' || !result.analysis) {
    const invalidError = new Error('Respons analisis dari AI Proxy Server tidak valid.');
    invalidError.code = 'AI_INVALID_RESPONSE';
    throw invalidError;
  }

  return result.analysis;
}
