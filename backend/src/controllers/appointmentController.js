import { dataStore } from '../services/dataStore.js';
import { logger } from '../utils/logger.js';

export const getAppointments = async (req, res) => {
  try {
    const { clinicId, data, petId, proprietarioId } = req.query;
    const appointments = await dataStore.getAppointments(clinicId, { data, petId, proprietarioId }, req.user?._id);
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    logger.error('Errore nel recupero degli appuntamenti', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli appuntamenti',
      error: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const app = await dataStore.getAppointmentById(req.params.id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Appuntamento non trovato'
      });
    }

    const clinicId = app.ambulatorioId?._id || app.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, clinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad accedere a questo appuntamento'
      });
    }

    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    logger.error("Errore nel recupero dell'appuntamento", error);
    res.status(500).json({
      success: false,
      message: "Errore nel recupero dell'appuntamento",
      error: error.message
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const {
      data,
      oraInizio,
      oraFine,
      durataMinuti,
      tipoPrestazione,
      motivo,
      stato,
      note,
      animaleId,
      proprietarioId,
      veterinarioId,
      ambulatorioId
    } = req.body;

    if (!data || !oraInizio || !motivo || !animaleId || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Data, ora inizio, motivo, animale e ambulatorio sono obbligatori'
      });
    }

    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, ambulatorioId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per fissare appuntamenti in questo ambulatorio'
      });
    }

    // Calcolo automatico oraFine se non specificata
    let calculatedFine = oraFine;
    const duration = Number(durataMinuti) || 30;
    if (!calculatedFine && oraInizio) {
      const [h, m] = oraInizio.split(':').map(Number);
      const totalMinutes = h * 60 + m + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      calculatedFine = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }

    const assignedVetId = veterinarioId || req.user._id;

    const app = await dataStore.createAppointment({
      data,
      oraInizio,
      oraFine: calculatedFine,
      durataMinuti: duration,
      tipoPrestazione: tipoPrestazione || 'Visita Generale',
      motivo,
      stato: stato || 'Prenotato',
      note: note || '',
      animaleId,
      proprietarioId,
      veterinarioId: assignedVetId,
      ambulatorioId
    });

    res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    logger.error("Errore durante la creazione dell'appuntamento", error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione dell\'appuntamento',
      error: error.message
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const existing = await dataStore.getAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Appuntamento non trovato'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questo appuntamento'
      });
    }

    const app = await dataStore.updateAppointment(req.params.id, req.body);
    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    logger.error("Errore durante l'aggiornamento dell'appuntamento", error);
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento dell'appuntamento",
      error: error.message
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { stato } = req.body;
    if (!stato) {
      return res.status(400).json({
        success: false,
        message: 'Lo stato è obbligatorio'
      });
    }

    const validStates = ['Prenotato', 'Confermato', 'In Attesa', 'In Visita', 'Completato', 'Annullato'];
    if (!validStates.includes(stato)) {
      return res.status(400).json({
        success: false,
        message: `Stato non valido. Valori ammessi: ${validStates.join(', ')}`
      });
    }

    const existing = await dataStore.getAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Appuntamento non trovato'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questo appuntamento'
      });
    }

    const app = await dataStore.updateAppointment(req.params.id, { stato });
    res.json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento dello stato dell'appuntamento",
      error: error.message
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const existing = await dataStore.getAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Appuntamento non trovato'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad eliminare questo appuntamento'
      });
    }

    await dataStore.deleteAppointment(req.params.id);
    res.json({
      success: true,
      message: 'Appuntamento eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione dell'appuntamento",
      error: error.message
    });
  }
};
