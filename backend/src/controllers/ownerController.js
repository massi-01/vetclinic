import { dataStore } from '../services/dataStore.js';

export const getOwners = async (req, res) => {
  try {
    const { clinicId, search } = req.query;
    const owners = await dataStore.getOwners(clinicId, search, req.user?._id);
    res.json({
      success: true,
      data: owners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei proprietari',
      error: error.message
    });
  }
};

export const getOwnerById = async (req, res) => {
  try {
    const owner = await dataStore.getOwnerById(req.params.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Proprietario non trovato'
      });
    }
    // Recupera anche gli animali di questo proprietario
    const pets = await dataStore.getPets(null, { proprietarioId: owner._id }, req.user?._id);
    res.json({
      success: true,
      data: {
        ...owner,
        animali: pets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del proprietario',
      error: error.message
    });
  }
};

export const createOwner = async (req, res) => {
  try {
    const { nome, cognome, codiceFiscale, telefono, email, indirizzo, citta, note, ambulatorioId } = req.body;

    if (!nome || !cognome || !telefono || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Nome, cognome, telefono e ambulatorio sono obbligatori'
      });
    }

    const owner = await dataStore.createOwner({
      nome,
      cognome,
      codiceFiscale,
      telefono,
      email,
      indirizzo,
      citta,
      note,
      ambulatorioId
    });

    res.status(201).json({
      success: true,
      data: owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione del proprietario',
      error: error.message
    });
  }
};

export const updateOwner = async (req, res) => {
  try {
    const owner = await dataStore.updateOwner(req.params.id, req.body);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Proprietario non trovato'
      });
    }
    res.json({
      success: true,
      data: owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del proprietario",
      error: error.message
    });
  }
};

export const deleteOwner = async (req, res) => {
  try {
    const owner = await dataStore.deleteOwner(req.params.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Proprietario non trovato'
      });
    }
    res.json({
      success: true,
      message: 'Proprietario eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione del proprietario",
      error: error.message
    });
  }
};
