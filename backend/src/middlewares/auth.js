import jwt from 'jsonwebtoken';
import { dataStore } from '../services/dataStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accesso non autorizzato. Token mancante.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'vetclinic_jwt_super_secret_key_2026_dev';
    const decoded = jwt.verify(token, secret);
    const user = await dataStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utente non trovato o token non valido.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sessione scaduta o token non valido.',
      error: error.message
    });
  }
};
