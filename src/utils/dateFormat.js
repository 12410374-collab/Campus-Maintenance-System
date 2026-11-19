export const WITA_TIMEZONE = 'Asia/Makassar';

/**
 * Memformat tanggal/waktu ke zona waktu WITA (Asia/Makassar) dengan format seragam:
 * "DD MMM YYYY, HH:mm" (contoh: "17 Nov 2026, 11:58")
 *
 * @param {Date | string | number} [input]
 * @returns {string}
 */
export function formatWitaTimestamp(input = new Date()) {
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) return '';

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: WITA_TIMEZONE,
  }).format(dateObj);

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: WITA_TIMEZONE,
  }).format(dateObj);

  return `${datePart}, ${timePart}`;
}

/**
 * Memformat tanggal saja ke zona waktu WITA:
 * "DD MMM YYYY" (contoh: "17 Nov 2026")
 *
 * @param {Date | string | number} [input]
 * @returns {string}
 */
export function formatWitaDateOnly(input = new Date()) {
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: WITA_TIMEZONE,
  }).format(dateObj);
}

/**
 * Memformat tanggal kalender ISO lokal WITA:
 * "YYYY-MM-DD" (contoh: "2026-11-17")
 *
 * @param {Date | string | number} [input]
 * @returns {string}
 */
export function formatWitaIsoDate(input = new Date()) {
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: WITA_TIMEZONE,
  }).format(dateObj);
}

/**
 * Memformat tanggal lengkap Bahasa Indonesia pada header Dasbor Admin dalam zona waktu WITA.
 *
 * @param {Date | string | number} [input]
 * @returns {string}
 */
export function formatWitaLongDateId(input = new Date()) {
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: WITA_TIMEZONE,
  }).format(dateObj);
}

/**
 * Mengurai string timestamp ("DD MMM YYYY, HH:mm" dalam WITA UTC+8) menjadi milidetik epoch
 * secara konsisten untuk pengurutan kronologis.
 *
 * @param {string} ts
 * @returns {number}
 */
export function parseWitaTimestampMs(ts) {
  if (!ts || typeof ts !== 'string') return 0;
  const trimmed = ts.trim();
  if (!trimmed) return 0;

  // Format standar aplikasi: "17 Nov 2026, 11:58" -> terjemahkan eksplisit sebagai UTC+08:00 (WITA)
  const match = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:,\s*(\d{2}):(\d{2}))?$/);
  if (match) {
    const [, dayStr, monthStr, yearStr, hourStr = '00', minuteStr = '00'] = match;
    const monthIndex = {
      jan: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      may: '05',
      mei: '05',
      jun: '06',
      jul: '07',
      aug: '08',
      agu: '08',
      sep: '09',
      oct: '10',
      okt: '10',
      nov: '11',
      dec: '12',
      des: '12',
    }[monthStr.toLowerCase()];

    if (monthIndex) {
      const isoWita = `${yearStr}-${monthIndex}-${dayStr.padStart(2, '0')}T${hourStr}:${minuteStr}:00+08:00`;
      const ms = Date.parse(isoWita);
      if (!Number.isNaN(ms)) return ms;
    }
  }

  const fallback = Date.parse(trimmed.replace(',', ''));
  return Number.isNaN(fallback) ? 0 : fallback;
}

/**
 * Mengambil timestamp pembuatan laporan (ms) dengan aman dari field createdAt, reportedDate, atau reportedIsoDate.
 * Mengembalikan 0 jika tanggal tidak tersedia atau tidak valid.
 *
 * @param {Object} report
 * @returns {number}
 */
export function getReportCreatedTimestampMs(report) {
  if (!report || typeof report !== 'object') return 0;

  const candidates = [report.createdAt, report.reportedDate, report.reportedIsoDate];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    const ms = parseWitaTimestampMs(candidate);
    if (ms > 0) return ms;
  }

  return 0;
}

/**
 * Pembanding pengurutan laporan terbaru ke terlama (descending).
 * Jika timestamp sama atau tidak tersedia, menggunakan ID laporan secara descending sebagai tie-breaker.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
export function compareReportsNewestFirst(a, b) {
  const timeDiff = getReportCreatedTimestampMs(b) - getReportCreatedTimestampMs(a);
  if (timeDiff !== 0) return timeDiff;

  const idA = typeof a?.id === 'string' ? a.id : String(a?.id ?? '');
  const idB = typeof b?.id === 'string' ? b.id : String(b?.id ?? '');
  return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Mengembalikan salinan daftar laporan terurut dari terbaru ke terlama (tanpa memutasi array asal).
 *
 * @param {Array<Object>} reports
 * @returns {Array<Object>}
 */
export function sortReportsNewestFirst(reports) {
  if (!Array.isArray(reports)) return [];
  return [...reports].sort(compareReportsNewestFirst);
}
