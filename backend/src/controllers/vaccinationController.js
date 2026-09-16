import { dataStore } from '../services/dataStore.js';

export const getVaccinations = async (req, res) => {
  try {
    const { clinicId, petId, warningOnly } = req.query;
    const vaccinations = await dataStore.getVaccinations(clinicId, { petId, warningOnly }, req.user?._id);
    res.json({
      success: true,
      data: vaccinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle vaccinazioni',
      error: error.message
    });
  }
};

export const getVaccinationById = async (req, res) => {
  try {
    const vac = await dataStore.getVaccinationById(req.params.id);
    if (!vac) {
      return res.status(404).json({
        success: false,
        message: 'Vaccinazione non trovata'
      });
    }
    res.json({
      success: true,
      data: vac
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della vaccinazione',
      error: error.message
    });
  }
};

export const createVaccination = async (req, res) => {
  try {
    const {
      nomeVaccino,
      categoria,
      numeroLotto,
      dataSomministrazione,
      dataRichiamo,
      note,
      animaleId,
      ambulatorioId
    } = req.body;

    if (!nomeVaccino || !dataRichiamo || !animaleId || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Nome vaccino, data richiamo, animale e ambulatorio sono obbligatori'
      });
    }

    const vac = await dataStore.createVaccination({
      nomeVaccino,
      categoria: categoria || 'Richiamo Annuale',
      numeroLotto: numeroLotto || '',
      dataSomministrazione: dataSomministrazione || new Date().toISOString().split('T')[0],
      dataRichiamo,
      note: note || '',
      animaleId,
      veterinarioId: req.user._id,
      ambulatorioId
    });

    res.status(201).json({
      success: true,
      data: vac
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione del vaccino',
      error: error.message
    });
  }
};

export const updateVaccination = async (req, res) => {
  try {
    const vac = await dataStore.updateVaccination(req.params.id, req.body);
    if (!vac) {
      return res.status(404).json({
        success: false,
        message: 'Vaccinazione non trovata'
      });
    }
    res.json({
      success: true,
      data: vac
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del vaccino",
      error: error.message
    });
  }
};

export const deleteVaccination = async (req, res) => {
  try {
    const vac = await dataStore.deleteVaccination(req.params.id);
    if (!vac) {
      return res.status(404).json({
        success: false,
        message: 'Vaccinazione non trovata'
      });
    }
    res.json({
      success: true,
      message: 'Vaccinazione rimossa con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione del vaccino",
      error: error.message
    });
  }
};
