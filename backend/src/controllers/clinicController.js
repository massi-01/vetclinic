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
