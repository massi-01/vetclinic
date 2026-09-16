import { dataStore } from '../services/dataStore.js';

export const getClinics = async (req, res) => {
  try {
    const clinics = await dataStore.getClinics(req.user._id);
    res.json({
      success: true,
      data: clinics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli ambulatori',
      error: error.message
    });
  }
};

export const getClinicById = async (req, res) => {
  try {
    const clinic = await dataStore.getClinicById(req.params.id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Ambulatorio non trovato'
      });
    }
    res.json({
      success: true,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore nel recupero dell'ambulatorio",
      error: error.message
    });
  }
};

export const createClinic = async (req, res) => {
  try {
    const { nome, indirizzo, citta, cap, telefono, email, partitaIva, codiceFiscale, orariApertura, prontoSoccorso24h, coloreTema } = req.body;

    if (!nome || !indirizzo || !citta || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'Nome, indirizzo, città e telefono sono campi obbligatori'
      });
    }

    const clinic = await dataStore.createClinic(
      {
        nome,
        indirizzo,
        citta,
        cap,
        telefono,
        email,
        partitaIva,
        codiceFiscale,
        orariApertura,
        prontoSoccorso24h: !!prontoSoccorso24h,
        coloreTema: coloreTema || '#0d9488'
      },
      req.user._id
    );

    res.status(201).json({
      success: true,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante la creazione dell'ambulatorio",
      error: error.message
    });
  }
};

export const updateClinic = async (req, res) => {
  try {
    const clinic = await dataStore.updateClinic(req.params.id, req.body);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Ambulatorio non trovato'
      });
    }
    res.json({
      success: true,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento dell'ambulatorio",
      error: error.message
    });
  }
};

export const getAvailableClinics = async (req, res) => {
  try {
    const { search } = req.query;
    const clinics = await dataStore.getAvailableClinics(req.user._id, search);
    res.json({
      success: true,
      data: clinics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli ambulatori disponibili',
      error: error.message
    });
  }
};

export const createClinicRequest = async (req, res) => {
  try {
    const { ambulatorioId, messaggio } = req.body;
    if (!ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: "L'identificativo dell'ambulatorio è obbligatorio"
      });
    }

    const request = await dataStore.createClinicRequest(req.user._id, { ambulatorioId, messaggio });
    res.status(201).json({
      success: true,
      data: request,
      message: "Richiesta d'accesso inviata con successo al gestore della struttura"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Errore durante l'invio della richiesta d'accesso"
    });
  }
};

export const getSentClinicRequests = async (req, res) => {
  try {
    const requests = await dataStore.getMySentRequests(req.user._id);
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste inviate',
      error: error.message
    });
  }
};

export const getReceivedClinicRequests = async (req, res) => {
  try {
    const requests = await dataStore.getReceivedRequests(req.user._id);
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste ricevute',
      error: error.message
    });
  }
};

export const respondClinicRequest = async (req, res) => {
  try {
    const { action, note } = req.body;
    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Azione non valida. Deve essere 'APPROVE' o 'REJECT'"
      });
    }

    const request = await dataStore.respondToClinicRequest(req.params.id, req.user._id, action, note);
    res.json({
      success: true,
      data: request,
      message: action === 'APPROVE' ? 'Richiesta accettata con successo' : 'Richiesta rifiutata'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Errore nella gestione della richiesta'
    });
  }
};
