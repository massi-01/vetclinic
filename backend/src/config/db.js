import mongoose from 'mongoose';

export let isMongoConnected = false;
let cachedPromise = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri || uri.trim() === '') {
    if (isProduction && process.env.VERCEL !== '1') {
      console.error('❌ [FATAL]: MONGODB_URI non è configurata. In ambiente di produzione il database MongoDB è obbligatorio!');
      process.exit(1);
    }
    console.log('ℹ️ Nessuna MONGODB_URI configurata nel file .env / Vercel.');
    console.log('⚡ Il backend funzionerà in modalità DEMO/In-Memory con dati clinici dimostrativi.');
    console.log('👉 Per connetterti a MongoDB Atlas, imposta la variabile d\'ambiente MONGODB_URI nel pannello Vercel.');
    return false;
  }

  // 1. Se già connesso attivamente
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return true;
  }

  // 2. Se disconnesso o interrotto (readyState 0 o 3), resetta la promise memorizzata
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cachedPromise = null;
  }

  // 3. Se c'è una promise di connessione in corso, attendila
  if (cachedPromise) {
    try {
      await cachedPromise;
      if (mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        return true;
      }
    } catch {
      cachedPromise = null;
    }
  }

  // 4. Avvia una nuova connessione a MongoDB
  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000
    });
    await cachedPromise;
    isMongoConnected = true;
    console.log('✅ Connesso con successo a MongoDB:', mongoose.connection.host);
    return true;
  } catch (error) {
    cachedPromise = null;
    if (isProduction && process.env.VERCEL !== '1') {
      console.error('❌ [FATAL]: Impossibile connettersi a MongoDB in ambiente di produzione:', error.message);
      console.error('🛑 Arresto del server per evitare corruzione o perdita di dati (Fail-Fast).');
      process.exit(1);
    }
    console.error('❌ Errore di connessione a MongoDB:', error.message);
    console.log('⚠️ Avvio in modalità di fallback in-memory per consentire il collaudo.');
    return false;
  }
};
