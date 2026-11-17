const API_BASE_URL = 'http://localhost:3001';

/**
 * Membangun URL lengkap beserta query string yang ter-encode dengan aman.
 * @param {string} endpoint
 * @param {Record<string, string | number | boolean | null | undefined>} [params]
 * @returns {string}
 */
export function buildUrl(endpoint, params) {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  if (!params || typeof params !== 'object') {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Eksekutor HTTP request berbasis Fetch API bawaan browser.
 * Menangani network error maupun HTTP error status secara konsisten.
 */
async function request(endpoint, { method = 'GET', body, params, headers = {} } = {}) {
  const url = buildUrl(endpoint, params);
  const config = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    const error = new Error(
      `Gagal terhubung ke server backend (${API_BASE_URL}). Pastikan JSON Server sedang berjalan.`
    );
    error.cause = networkErr;
    error.isNetworkError = true;
    throw error;
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
        : response.statusText || 'Terjadi kesalahan pada server';

    const error = new Error(
      `Permintaan ${method} ${endpoint} gagal (HTTP ${response.status}): ${serverMessage}`
    );
    error.status = response.status;
    error.data = parsedData;
    throw error;
  }

  return parsedData;
}

export async function apiGet(endpoint, params) {
  return request(endpoint, { method: 'GET', params });
}

export async function apiPost(endpoint, body) {
  return request(endpoint, { method: 'POST', body });
}

export async function apiPatch(endpoint, body) {
  return request(endpoint, { method: 'PATCH', body });
}

export async function apiDelete(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

export { API_BASE_URL };
