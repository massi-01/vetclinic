import express from 'express';
import cors from 'cors';
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
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurazione CORS per frontend Web, App Mobile e PWA
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VetClinic API Backend'
  });
});

// Documentazione interattiva OpenAPI / Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Registrazione rotte API
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/therapies', therapyRoutes);
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
    console.log(`🩺 Endpoint pronti per interrogazioni JSON da web app e dispositivi mobile`);
  });
};

startServer();
