import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSeedData } from './services/dataStore.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import petRoutes from './routes/petRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import therapyRoutes from './routes/therapyRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Header di sicurezza HTTP con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false // Permette rendering di Swagger UI se abilitato
  })
);

// Configurazione CORS restrittiva
const configuredClients = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : [];

const defaultLocalClients = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
const allowedOrigins = [...configuredClients, ...(process.env.NODE_ENV !== 'production' ? defaultLocalClients : [])];

app.use(
  cors({
    origin: (origin, callback) => {
      // In sviluppo permetti chiamate da mobile app/curl/Postman o origini localhost
      if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
        callback(null, true);
      } else {
        callback(new Error(`Origine non autorizzata dalle policy CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Limite dimensione payload JSON per mitigare attacchi DoS
app.use(express.json({ limit: '100kb' }));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    service: 'VetClinic API Backend'
  });
});

// Documentazione interattiva OpenAPI / Swagger (abilitata di default in dev o con flag esplicita)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
  });
}

// Registrazione rotte API
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/therapies', therapyRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stats', statsRoutes);

// Gestione rotte non trovate (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rotta non trovata: ${req.originalUrl}`
  });
});

// Middleware centralizzato gestione errori
app.use(errorHandler);

// Avvio del server e inizializzazione database
const startServer = async () => {
  await connectDB();
  await initSeedData();

  app.listen(PORT, () => {
    console.log(`🚀 VetClinic Backend API in esecuzione sulla porta http://localhost:${PORT}`);
    console.log(`🩺 Ambiente: [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();
