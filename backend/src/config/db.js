import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('ℹ️ Nessuna MONGODB_URI configurata nel file .env.');
    console.log('⚡ Il backend funzionerà in modalità DEMO/In-Memory con dati clinici dimostrativi.');
    console.log('👉 Quando fornirai la connection string, inseriscila in backend/.env e il server si connetterà a MongoDB.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log('✅ Connesso con successo a MongoDB:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('❌ Errore di connessione a MongoDB:', error.message);
    console.log('⚠️ Avvio in modalità di fallback in-memory per consentire il collaudo.');
    return false;
  }
};
