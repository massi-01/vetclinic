import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSeedData } from './services/dataStore.js';
import { errorHandler } from './middlewares/errorHandler.js';

import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import petRoutes from './routes/petRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import therapyRoutes from './routes/therapyRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import systemLogRoutes from './routes/systemLogRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import { logger, requestLogger } from './utils/logger.js';
import { isMongoConnected } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Abilita trust proxy per corretta identificazione IP dietro proxy (Vercel, Nginx, Cloudflare)
app.set('trust proxy', 1);


// Header di sicurezza HTTP con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false // Permette rendering di Swagger UI se abilitato
  })
);

// Configurazione CORS (supporto Vercel, localhost e origini configurate)
const configuredClients = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
  : [];

const defaultLocalClients = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Chiamate senza origin (mobile app, curl, server-to-server, Postman)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');

      // 2. Se CLIENT_URL è '*' consenti tutto
      if (configuredClients.includes('*')) {
        return callback(null, true);
      }

      // 3. Origini localhost (sviluppo locale)
      if (
        cleanOrigin.startsWith('http://localhost:') ||
        cleanOrigin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      // 4. Domini Vercel (*.vercel.app, inclusi Swagger UI backend e frontend Vercel)
      try {
        const parsed = new URL(origin);
        if (parsed.hostname === 'vercel.app' || parsed.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        if (cleanOrigin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      }

      // 5. Origini esplicitamente consentite da CLIENT_URL o default locali
      if (configuredClients.includes(cleanOrigin) || defaultLocalClients.includes(cleanOrigin)) {
        return callback(null, true);
      }

      logger.warn(`Richiesta bloccata da policy CORS per origine: ${origin}`);
      callback(new Error(`Origine non autorizzata dalle policy CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Limite dimensione payload configurato a 15MB per supportare allegati PDF referti, esami diagnostici e foto cliniche
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Logging strutturato di tutte le richieste HTTP (Observability)
app.use(requestLogger);

// Rate Limiter globale per tutte le API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Troppe richieste inviate da questo indirizzo IP. Riprova più tardi.'
  }
});

// Rate Limiter restrittivo per gli endpoint di autenticazione (prevenzione brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Troppi tentativi di autenticazione o registrazione. Riprova tra 15 minuti.'
  }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Reindirizzamento automatico della root alla documentazione interattiva Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Health check endpoint strutturato con enterprise observability
app.get('/api/health', (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const mem = process.memoryUsage();

  const healthData = {
    status: mongoReady || process.env.NODE_ENV !== 'production' ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    service: 'VetClinic API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: mongoReady ? 'mongodb' : 'in-memory-fallback',
      connected: mongoReady,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'local-memory',
      name: mongoose.connection.name || 'vetclinic'
    },
    memory: {
      rssMB: (mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2)
    },
    system: {
      node: process.version,
      platform: process.platform
    }
  };

  const statusCode = healthData.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// Documentazione interattiva OpenAPI / Swagger (abilitata di default tranne se DISABLE_SWAGGER=true)
if (process.env.DISABLE_SWAGGER !== 'true') {
  // 1. Specifiche OpenAPI JSON
  app.get(['/api-docs.json', '/api/docs.json'], (req, res) => {
    res.json(swaggerDocument);
  });

  // 2. Swagger UI standalone caricato da CDN (pienamente compatibile con Vercel Serverless)
  const renderSwaggerUi = (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>VetClinic Pro API - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 26px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerDocument)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`);
  };

  // Supporta sia /api-docs che /api/docs che /docs
  app.get('/api-docs', renderSwaggerUi);
  app.get('/api-docs/*', renderSwaggerUi);
  app.get('/api/docs', renderSwaggerUi);
  app.get('/docs', renderSwaggerUi);

  // Fallback con swaggerUi standard
  app.use('/api-docs-raw', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Middleware di resilienza database per serverless e container idle
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    await connectDB().catch((err) => {
      logger.error('Errore durante la riconnessione al database:', err.message);
    });
  }
  next();
});

// Registrazione rotte API
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/therapies', therapyRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/system/logs', systemLogRoutes);

// Gestione rotte non trovate (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rotta non trovata: ${req.originalUrl}`
  });
});

// Middleware centralizzato gestione errori
app.use(errorHandler);

// Global Error Catchers (Prevenzione crash non gestiti)
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection intercettata a livello di processo', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception critica intercettata a livello di processo', err);
});

// Avvio del server e inizializzazione database
const startServer = async () => {
  await connectDB();
  await initSeedData();

  app.listen(PORT, () => {
    logger.info(`🚀 VetClinic Backend API avviata su http://localhost:${PORT}`);
    logger.info(`🩺 Ambiente di esecuzione: [${process.env.NODE_ENV || 'development'}]`);
  });
};

// Avvia il server solo in ambiente non-serverless (in locale, Docker o VPS)
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;

