import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error(`API Exception intercettata su [${req.method} ${req.originalUrl}]`, err, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?._id?.toString()
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Errore interno del server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

