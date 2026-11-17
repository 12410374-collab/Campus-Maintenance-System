import 'dotenv/config';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import express from 'express';
import cors from 'cors';
import {
  analyzeReportWithGemini,
  getConfiguredModel,
  isGeminiConfigured,
} from './geminiAnalyzer.js';

const DEFAULT_PORT = 3002;
const REQUEST_BODY_LIMIT = '32kb';
const DEFAULT_ANALYZE_TIMEOUT_MS = 15000;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function getAllowedOrigins() {
  const customOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...customOrigins]);
}

export function validateAnalyzeReportInput(body) {
  const fieldErrors = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      message: 'Body permintaan harus berupa objek JSON yang valid.',
      fieldErrors: { body: 'Payload JSON tidak valid.' },
    };
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const urgency = typeof body.urgency === 'string' ? body.urgency.trim() : '';

  if (!title) {
    fieldErrors.title = 'Judul laporan wajib diisi untuk analisis AI.';
  } else if (title.length > 200) {
    fieldErrors.title = 'Judul laporan maksimal 200 karakter.';
  }

  if (!description) {
    fieldErrors.description = 'Deskripsi kerusakan wajib diisi untuk analisis AI.';
  } else if (description.length > 3000) {
    fieldErrors.description = 'Deskripsi kerusakan maksimal 3000 karakter.';
  }

  if (body.location !== undefined && body.location !== null && typeof body.location !== 'string') {
    fieldErrors.location = 'Lokasi harus berupa teks.';
  } else if (location.length > 200) {
    fieldErrors.location = 'Lokasi maksimal 200 karakter.';
  }

  if (body.category !== undefined && body.category !== null && typeof body.category !== 'string') {
    fieldErrors.category = 'Kategori harus berupa teks.';
  } else if (category.length > 100) {
    fieldErrors.category = 'Kategori maksimal 100 karakter.';
  }

  if (body.urgency !== undefined && body.urgency !== null && typeof body.urgency !== 'string') {
    fieldErrors.urgency = 'Tingkat urgensi harus berupa teks.';
  } else if (urgency.length > 50) {
    fieldErrors.urgency = 'Tingkat urgensi maksimal 50 karakter.';
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;
  if (hasErrors) {
    return {
      isValid: false,
      message: 'Data masukan analisis laporan tidak valid atau masih kosong.',
      fieldErrors,
    };
  }

  return {
    isValid: true,
    data: {
      title,
      description,
      location,
      category,
      urgency,
    },
  };
}

export function createAiApp({ analyzer = analyzeReportWithGemini, timeoutMs } = {}) {
  const app = express();
  const allowedOrigins = getAllowedOrigins();
  const port = Number(process.env.AI_SERVER_PORT) || DEFAULT_PORT;
  const analyzeTimeoutMs =
    Number(timeoutMs) > 0
      ? Number(timeoutMs)
      : Number(process.env.AI_REQUEST_TIMEOUT_MS) || DEFAULT_ANALYZE_TIMEOUT_MS;

  app.disable('x-powered-by');

  const corsOptions = {
    origin(origin, callback) {
      // Izinkan request non-browser/lokal tanpa Origin (curl, health check, unit test)
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      const corsErr = new Error('Origin tidak diizinkan oleh kebijakan CORS AI Proxy Server.');
      corsErr.statusCode = 403;
      corsErr.code = 'CORS_NOT_ALLOWED';
      callback(corsErr);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options('/{*splat}', cors(corsOptions));

  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));

  app.get('/api/ai/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'campus-maintenance-ai-proxy',
      port,
      geminiConfigured: isGeminiConfigured(),
      model: getConfiguredModel(),
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/ai/analyze-report', async (req, res, next) => {
    const validation = validateAnalyzeReportInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: validation.message,
        fieldErrors: validation.fieldErrors,
      });
      return;
    }

    res.setTimeout(analyzeTimeoutMs + 2000);

    try {
      const analysis = await analyzer(validation.data, {
        timeoutMs: analyzeTimeoutMs,
      });

      res.status(200).json({
        ok: true,
        analysis,
      });
    } catch (err) {
      next(err);
    }
  });

  app.use((_req, res) => {
    res.status(404).json({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Endpoint AI tidak ditemukan.',
    });
  });

  // Error handler terpusat: ukuran payload berlebih, JSON rusak, CORS, timeout, & error Gemini
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') {
      res.status(413).json({
        ok: false,
        code: 'PAYLOAD_TOO_LARGE',
        message: `Ukuran payload melebihi batas maksimal (${REQUEST_BODY_LIMIT}).`,
      });
      return;
    }

    if (err instanceof SyntaxError && err?.status === 400 && 'body' in err) {
      res.status(400).json({
        ok: false,
        code: 'INVALID_JSON',
        message: 'Format JSON pada body permintaan tidak valid.',
      });
      return;
    }

    const statusCode = Number(err?.statusCode || err?.status) || 500;
    const code = err?.code || 'AI_SERVER_ERROR';
    const message =
      err?.message || 'Terjadi kesalahan internal pada backend AI proxy server.';

    if (statusCode >= 500) {
      console.error(`[AI Proxy] ${code} (${statusCode}):`, message);
    }

    res.status(statusCode).json({
      ok: false,
      code,
      message,
    });
  });

  return app;
}

export function startAiServer(customPort) {
  const port = Number(customPort || process.env.AI_SERVER_PORT) || DEFAULT_PORT;
  const app = createAiApp();
  const server = app.listen(port, () => {
    console.log(
      `[AI Proxy] Server berjalan pada http://localhost:${port} (Gemini configured: ${isGeminiConfigured()})`
    );
  });
  server.requestTimeout = 20000;
  return server;
}

const isMainModule =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startAiServer();
}
