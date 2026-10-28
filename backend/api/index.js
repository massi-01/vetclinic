import app from '../src/server.js';
import { connectDB } from '../src/config/db.js';
import { initSeedData } from '../src/services/dataStore.js';

let seedInitialized = false;

// Handler serverless compatibile con Vercel Functions
export default async function handler(req, res) {
  // Garantisce connessione attiva al database su ogni invocazione serverless
  await connectDB();

  if (!seedInitialized) {
    await initSeedData().catch((err) => {
      console.warn('Avviso inizializzazione seed:', err.message);
    });
    seedInitialized = true;
  }

  return app(req, res);
}

