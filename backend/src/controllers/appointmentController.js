import { dataStore } from '../services/dataStore.js';

export const getAppointments = async (req, res) => {
  try {
    const { clinicId, data, petId, proprietarioId } = req.query;
    const appointments = await dataStore.getAppointments(clinicId, { data, petId, proprietarioId }, req.user?._id);
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
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
      veterinarioId: req.user._id,
      ambulatorioId
    });

    res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    if (error.message && error.message.includes('CONFLITTO_ORARIO')) {
      return res.status(409).json({
        success: false,
        message: error.message.replace('CONFLITTO_ORARIO: ', '')
      });
    }
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
    if (error.message && error.message.includes('CONFLITTO_ORARIO')) {
      return res.status(409).json({
        success: false,
        message: error.message.replace('CONFLITTO_ORARIO: ', '')
      });
    }
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento dell'appuntamento",
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
