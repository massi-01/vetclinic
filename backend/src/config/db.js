import mongoose from 'mongoose';

export let isMongoConnected = false;
let cachedPromise = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri || uri.trim() === '') {
    if (isProduction) {
      console.error('❌ [FATAL]: MONGODB_URI non è configurata. In ambiente di produzione il database MongoDB è obbligatorio!');
      process.exit(1);
    }
    console.log('ℹ️ Nessuna MONGODB_URI configurata nel file .env.');
    console.log('⚡ Il backend funzionerà in modalità DEMO/In-Memory con dati clinici dimostrativi.');
    console.log('👉 Quando fornirai la connection string, inseriscila in backend/.env e il server si connetterà a MongoDB.');
    return false;
  }

  // Se già connesso (fondamentale per riuso istanze in serverless/Vercel)
  if (mongoose.connection.readyState >= 1) {
    isMongoConnected = true;
    return true;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      isMongoConnected = mongoose.connection.readyState >= 1;
      return isMongoConnected;
    } catch {
      cachedPromise = null;
    }
  }

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    await cachedPromise;
    isMongoConnected = true;
    console.log('✅ Connesso con successo a MongoDB:', mongoose.connection.host);
    return true;
  } catch (error) {
    if (isProduction) {
      console.error('❌ [FATAL]: Impossibile connettersi a MongoDB in ambiente di produzione:', error.message);
      console.error('🛑 Arresto del server per evitare corruzione o perdita di dati (Fail-Fast).');
      process.exit(1);
    }
    console.error('❌ Errore di connessione a MongoDB:', error.message);
    console.log('⚠️ Avvio in modalità di fallback in-memory per consentire il collaudo locale.');
    return false;
  }
};
