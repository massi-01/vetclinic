import { dataStore } from '../services/dataStore.js';

export const getStats = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const stats = await dataStore.getDashboardStats(clinicId, req.user?._id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche di riepilogo',
      error: error.message
    });
  }
};
