import app from '../src/server.js';
import { connectDB } from '../src/config/db.js';
import { initSeedData } from '../src/services/dataStore.js';

let initialized = false;

// Handler serverless compatibile con Vercel Functions
export default async function handler(req, res) {
  if (!initialized) {
    try {
      await connectDB();
      await initSeedData();
    } catch (err) {
      console.error('Errore durante inizializzazione serverless:', err);
    }
    initialized = true;
  }
  return app(req, res);
}

