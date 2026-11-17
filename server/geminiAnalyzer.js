import process from 'node:process';
import { GoogleGenAI, Type } from '@google/genai';

export const ALLOWED_TECH_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Electronics',
  'Furniture',
  'Infrastructure',
  'Other',
];

export const TECH_TO_ADMIN_CATEGORY = {
  Electrical: 'Kelistrikan',
  Plumbing: 'Plumbing / Sanitasi',
  Electronics: 'Elektronik',
  Furniture: 'Furniture',
  Infrastructure: 'Infrastruktur / Bangunan',
  Other: 'Lainnya',
};

export const ADMIN_TO_TECH_CATEGORY = {
  Kelistrikan: 'Electrical',
  'Plumbing / Sanitasi': 'Plumbing',
  Elektronik: 'Electronics',
  Furniture: 'Furniture',
  'Infrastruktur / Bangunan': 'Infrastructure',
  Lainnya: 'Other',
};

export const ALLOWED_URGENCIES = ['Low', 'Medium', 'High', 'Critical'];

export const URGENCY_LABELS_ID = {
  Low: 'Rendah',
  Medium: 'Sedang',
  High: 'Tinggi',
  Critical: 'Kritis',
};

const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
const DEFAULT_TIMEOUT_MS = 15000;

const MANUAL_INSPECTION_NOTE =
  'Informasi laporan masih terbatas. Lakukan inspeksi manual langsung di lokasi untuk memastikan sumber kerusakan dan kebutuhan perbaikan.';

const SYSTEM_INSTRUCTION = `Anda adalah asisten analisis awal laporan kerusakan fasilitas kampus Universitas Klabat (UNKLAB).
Tugas Anda HANYA memberikan rekomendasi awal (advisory only) berdasarkan data laporan yang tersedia. Admin Fasilitas tetap memegang keputusan akhir persetujuan dan prioritas.

Aturan KETAT yang wajib dipatuhi:
1. DILARANG mengarang, menebak, atau menambahkan fakta, komponen, nomor ruangan, penyebab teknis, atau detail yang TIDAK tertulis pada judul, lokasi, atau deskripsi laporan.
2. Klasifikasikan "category" HANYA dengan salah satu nilai persis berikut:
   - "Electrical" (kelistrikan, panel MCB, sakelar, stopkontak, instalasi daya, lampu listrik, AC/kelistrikan unit)
   - "Plumbing" (pipa, keran, wastafel, toilet, kebocoran air, saluran pembuangan)
   - "Electronics" (proyektor LCD, komputer, monitor, perangkat audio/printer, perangkat elektronik kelas)
   - "Furniture" (meja, kursi, lemari, papan tulis, pintu/jendela kayu/engsel mebel)
   - "Infrastructure" (atap, plafon, dinding, lantai, koridor, struktur bangunan)
   - "Other" (jika tidak masuk kategori di atas atau informasi terlalu minim)
3. Rekomendasikan "urgency" HANYA dengan salah satu nilai persis berikut:
   - "Critical": bahaya keselamatan langsung (bau terbakar/korsleting, risiko sengatan listrik, banjir/genangan parah, ancaman kerusakan aset server/perangkat vital)
   - "High": mengganggu perkuliahan/operasional utama atau berpotensi meluas jika ditunda
   - "Medium": mengganggu sebagian aktivitas namun aman ditangani terjadwal
   - "Low": kerusakan minor yang tidak mengganggu keselamatan maupun aktivitas utama
4. "summary": tulis 1-2 kalimat ringkasan masalah dalam Bahasa Indonesia berdasarkan fakta laporan saja.
5. "urgencyReason": tulis 1 kalimat alasan singkat mengapa tingkat "urgency" tersebut direkomendasikan, HANYA merujuk pada gejala/dampak yang tertulis pada laporan (dilarang menambah fakta di luar laporan).
6. "recommendation": tulis saran tindakan awal teknisi/pemeriksaan awal dalam Bahasa Indonesia yang aman dan realistis.
7. "insufficientInfo": set true jika deskripsi/judul terlalu singkat, ambigu, atau tidak menjelaskan gejala kerusakan secara memadai. Jika "insufficientInfo" bernilai true, "recommendation" WAJIB merekomendasikan inspeksi manual di lokasi dan jangan berasumsi penyebab spesifik.`;

const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ALLOWED_TECH_CATEGORIES,
    },
    urgency: {
      type: Type.STRING,
      enum: ALLOWED_URGENCIES,
    },
    urgencyReason: {
      type: Type.STRING,
    },
    summary: {
      type: Type.STRING,
    },
    recommendation: {
      type: Type.STRING,
    },
    insufficientInfo: {
      type: Type.BOOLEAN,
    },
  },
  required: [
    'category',
    'urgency',
    'urgencyReason',
    'summary',
    'recommendation',
    'insufficientInfo',
  ],
};

export function createAiError(message, { statusCode = 500, code = 'AI_INTERNAL_ERROR', cause } = {}) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause !== undefined) {
    err.cause = cause;
  }
  return err;
}

export function getConfiguredModel() {
  return (process.env.GEMINI_MODEL || '').trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured() {
  return Boolean((process.env.GEMINI_API_KEY || '').trim());
}

function normalizeCategory(rawCategory) {
  if (typeof rawCategory !== 'string') return 'Other';
  const cleaned = rawCategory.trim();

  const exactTech = ALLOWED_TECH_CATEGORIES.find(
    (item) => item.toLowerCase() === cleaned.toLowerCase()
  );
  if (exactTech) return exactTech;

  const matchedAdminEntry = Object.entries(ADMIN_TO_TECH_CATEGORY).find(
    ([label]) => label.toLowerCase() === cleaned.toLowerCase()
  );
  if (matchedAdminEntry) return matchedAdminEntry[1];

  return 'Other';
}

function normalizeUrgency(rawUrgency) {
  if (typeof rawUrgency !== 'string') return 'Medium';
  const cleaned = rawUrgency.trim().toLowerCase();

  const exact = ALLOWED_URGENCIES.find((item) => item.toLowerCase() === cleaned);
  if (exact) return exact;

  const idMap = {
    rendah: 'Low',
    sedang: 'Medium',
    tinggi: 'High',
    kritis: 'Critical',
  };
  return idMap[cleaned] || 'Medium';
}

function normalizeSummary(rawSummary, reportInput) {
  const cleaned = typeof rawSummary === 'string' ? rawSummary.trim() : '';
  if (cleaned) return cleaned;

  const locSuffix = reportInput.location ? ` di ${reportInput.location}` : '';
  return `Laporan "${reportInput.title}"${locSuffix} memerlukan peninjauan awal.`;
}

function normalizeRecommendation(rawRecommendation, insufficientInfo) {
  let cleaned = typeof rawRecommendation === 'string' ? rawRecommendation.trim() : '';

  if (insufficientInfo) {
    const mentionsManualInspection = /inspeksi\s+manual|pemeriksaan\s+langsung|cek\s+langsung/i.test(
      cleaned
    );
    if (!cleaned) {
      return MANUAL_INSPECTION_NOTE;
    }
    if (!mentionsManualInspection) {
      return `${cleaned} ${MANUAL_INSPECTION_NOTE}`;
    }
    return cleaned;
  }

  return (
    cleaned ||
    'Lakukan pemeriksaan awal kondisi fasilitas di lokasi sesuai laporan yang masuk.'
  );
}

function normalizeUrgencyReason(rawUrgencyReason, urgency, insufficientInfo) {
  const cleaned = typeof rawUrgencyReason === 'string' ? rawUrgencyReason.trim() : '';
  if (cleaned) return cleaned;

  if (insufficientInfo) {
    return 'Informasi pada deskripsi laporan masih terbatas sehingga tingkat urgensi perlu dikonfirmasi melalui inspeksi langsung.';
  }

  const label = URGENCY_LABELS_ID[urgency] || 'Sedang';
  return `Direkomendasikan tingkat urgensi ${label} berdasarkan keterangan gejala kerusakan yang dilaporkan.`;
}

export function normalizeAnalysisResult(rawResult, reportInput, modelName) {
  const category = normalizeCategory(rawResult?.category);
  const urgency = normalizeUrgency(rawResult?.urgency);
  const insufficientInfo = Boolean(rawResult?.insufficientInfo);
  const urgencyReason = normalizeUrgencyReason(
    rawResult?.urgencyReason,
    urgency,
    insufficientInfo
  );
  const summary = normalizeSummary(rawResult?.summary, reportInput);
  const recommendation = normalizeRecommendation(
    rawResult?.recommendation,
    insufficientInfo
  );

  return {
    category,
    adminCategory: TECH_TO_ADMIN_CATEGORY[category] || 'Lainnya',
    urgency,
    urgencyLabelId: URGENCY_LABELS_ID[urgency] || 'Sedang',
    urgencyReason,
    summary,
    recommendation,
    insufficientInfo,
    advisoryOnly: true,
    model: modelName,
  };
}

function buildUserPrompt({ title, description, location, category, urgency }) {
  const lines = [
    `Judul Laporan: ${title}`,
    `Lokasi: ${location || 'Tidak disebutkan'}`,
    `Deskripsi Kerusakan: ${description}`,
  ];

  if (category) {
    lines.push(`Kategori pilihan awal pelapor (opsional referensi): ${category}`);
  }
  if (urgency) {
    lines.push(`Urgensi pilihan awal pelapor (opsional referensi): ${urgency}`);
  }

  lines.push(
    '',
    'Berikan hasil analisis JSON sesuai skema. Jangan mengarang fakta yang tidak ada pada laporan.'
  );

  return lines.join('\n');
}

function parseGeminiJsonText(response) {
  const rawText = typeof response?.text === 'string' ? response.text.trim() : '';
  if (!rawText) {
    throw createAiError('Respons Gemini AI kosong.', {
      statusCode: 502,
      code: 'GEMINI_EMPTY_RESPONSE',
    });
  }

  const strippedText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(strippedText);
  } catch (parseErr) {
    throw createAiError('Format JSON hasil analisis Gemini AI tidak valid.', {
      statusCode: 502,
      code: 'GEMINI_INVALID_JSON',
      cause: parseErr,
    });
  }
}

/**
 * Menganalisis laporan kerusakan fasilitas menggunakan Google Gemini SDK resmi (@google/genai).
 * Hanya menghasilkan rekomendasi advisory (Admin tetap menentukan keputusan akhir).
 *
 * @param {Object} reportInput
 * @param {string} reportInput.title
 * @param {string} reportInput.description
 * @param {string} [reportInput.location]
 * @param {string} [reportInput.category]
 * @param {string} [reportInput.urgency]
 * @param {Object} [options]
 * @param {number} [options.timeoutMs]
 * @param {Object} [options.client] - Optional injected client untuk keperluan pengujian terisolasi
 * @returns {Promise<Object>}
 */
export async function analyzeReportWithGemini(reportInput, options = {}) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const hasInjectedClient = Boolean(options.client);

  if (!apiKey && !hasInjectedClient) {
    throw createAiError(
      'GEMINI_API_KEY belum dikonfigurasi pada backend AI proxy server.',
      {
        statusCode: 503,
        code: 'GEMINI_API_KEY_MISSING',
      }
    );
  }

  const normalizedInput = {
    title: String(reportInput?.title || '').trim(),
    description: String(reportInput?.description || '').trim(),
    location: String(reportInput?.location || '').trim(),
    category: String(reportInput?.category || '').trim(),
    urgency: String(reportInput?.urgency || '').trim(),
  };

  const modelName = getConfiguredModel();
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : DEFAULT_TIMEOUT_MS;
  const aiClient = options.client || new GoogleGenAI({ apiKey });

  const abortController = new AbortController();
  let timeoutId = null;

  try {
    const generationPromise = aiClient.models.generateContent({
      model: modelName,
      contents: buildUserPrompt(normalizedInput),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
        abortSignal: abortController.signal,
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        abortController.abort();
        reject(
          createAiError(
            `Permintaan analisis ke Gemini AI melebihi batas waktu (${timeoutMs} ms).`,
            {
              statusCode: 504,
              code: 'GEMINI_TIMEOUT',
            }
          )
        );
      }, timeoutMs);
    });

    const response = await Promise.race([generationPromise, timeoutPromise]);
    const parsedJson = parseGeminiJsonText(response);

    return normalizeAnalysisResult(parsedJson, normalizedInput, modelName);
  } catch (err) {
    if (err?.statusCode && err?.code) {
      throw err;
    }

    if (err?.name === 'AbortError' || abortController.signal.aborted) {
      throw createAiError(
        `Permintaan analisis ke Gemini AI melebihi batas waktu (${timeoutMs} ms).`,
        {
          statusCode: 504,
          code: 'GEMINI_TIMEOUT',
          cause: err,
        }
      );
    }

    const upstreamStatus = Number(err?.status || err?.statusCode);
    if (upstreamStatus === 429) {
      throw createAiError(
        'Batas permintaan Gemini AI sedang tercapai. Silakan coba beberapa saat lagi.',
        {
          statusCode: 429,
          code: 'GEMINI_RATE_LIMITED',
          cause: err,
        }
      );
    }

    throw createAiError(
      err?.message || 'Terjadi kesalahan saat memanggil layanan Gemini AI.',
      {
        statusCode: 502,
        code: 'GEMINI_UPSTREAM_ERROR',
        cause: err,
      }
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
