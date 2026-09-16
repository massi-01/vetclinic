import { dataStore } from '../services/dataStore.js';

export const getTherapies = async (req, res) => {
  try {
    const { clinicId, petId, attiva } = req.query;
    const therapies = await dataStore.getTherapies(clinicId, { petId, attiva });
    res.json({
      success: true,
      data: therapies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle terapie',
      error: error.message
    });
  }
};

export const createTherapy = async (req, res) => {
  try {
    const {
      nomeFarmaco,
      principioAttivo,
      dosaggio,
      viaSomministrazione,
      posologia,
      dataInizio,
      durataGiorni,
      istruzioni,
      animaleId,
      visitaId,
      ambulatorioId
    } = req.body;

    if (!nomeFarmaco || !dosaggio || !posologia || !animaleId || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Farmaco, dosaggio, posologia, animale e ambulatorio sono obbligatori'
      });
    }

    const startDate = dataInizio ? new Date(dataInizio) : new Date();
    const days = Number(durataGiorni) || 7;
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const therapy = await dataStore.createTherapy({
      nomeFarmaco,
      principioAttivo: principioAttivo || '',
      dosaggio,
      viaSomministrazione: viaSomministrazione || 'Orale',
      posologia,
      dataInizio: startDate.toISOString().split('T')[0],
      dataFine: endDate.toISOString().split('T')[0],
      durataGiorni: days,
      istruzioni: istruzioni || '',
      attiva: true,
      animaleId,
      visitaId: visitaId || null,
      veterinarioId: req.user._id,
      ambulatorioId
    });

    res.status(201).json({
      success: true,
      data: therapy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la prescrizione della terapia',
      error: error.message
    });
  }
};

export const updateTherapy = async (req, res) => {
  try {
    const therapy = await dataStore.updateTherapy(req.params.id, req.body);
    if (!therapy) {
      return res.status(404).json({
        success: false,
        message: 'Terapia non trovata'
      });
    }
    res.json({
      success: true,
      data: therapy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento della terapia",
      error: error.message
    });
  }
};

export const deleteTherapy = async (req, res) => {
  try {
    const therapy = await dataStore.deleteTherapy(req.params.id);
    if (!therapy) {
      return res.status(404).json({
        success: false,
        message: 'Terapia non trovata'
      });
    }
    res.json({
      success: true,
      message: 'Terapia eliminata con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione della terapia",
      error: error.message
    });
  }
};
