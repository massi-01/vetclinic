import { dataStore } from '../services/dataStore.js';
import { logger } from '../utils/logger.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { clinicId, entita, entitaId, limit } = req.query;

    if (clinicId) {
      const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, clinicId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Non sei autorizzato a consultare il registro audit di questo ambulatorio'
        });
      }
    }

    const logs = await dataStore.getAuditLogs(
      {
        ambulatorioId: clinicId,
        entita,
        entitaId,
        limit: limit ? parseInt(limit, 10) : 100
      },
      req.user?._id
    );

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Errore nel recupero degli audit log', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del registro di tracciamento clinico',
      error: error.message
    });
  }
};
