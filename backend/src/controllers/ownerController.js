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

    const clinicId = owner.ambulatorioId?._id || owner.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, clinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad accedere all\'anagrafica di questo cliente'
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

    if (!nome || !cognome || !telefono || !ambulatorioId || !codiceFiscale) {
      return res.status(400).json({
        success: false,
        message: 'Nome, cognome, codice fiscale, telefono e ambulatorio sono obbligatori'
      });
    }

    const cleanCf = codiceFiscale.trim().toUpperCase();
    if (cleanCf.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'Il codice fiscale deve essere composto da 16 caratteri alfanumerici'
      });
    }

    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, ambulatorioId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per creare anagrafiche in questo ambulatorio'
      });
    }

    const owner = await dataStore.createOwner({
      nome,
      cognome,
      codiceFiscale: cleanCf,
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
    const existing = await dataStore.getOwnerById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Proprietario non trovato'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questo cliente'
      });
    }

    if (req.body.codiceFiscale !== undefined) {
      const cleanCf = req.body.codiceFiscale.trim().toUpperCase();
      if (!cleanCf || cleanCf.length !== 16) {
        return res.status(400).json({
          success: false,
          message: 'Il codice fiscale è obbligatorio e deve essere composto da 16 caratteri'
        });
      }
      req.body.codiceFiscale = cleanCf;
    }

    const owner = await dataStore.updateOwner(req.params.id, req.body);
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
    const existing = await dataStore.getOwnerById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Proprietario non trovato'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad eliminare questo cliente'
      });
    }

    await dataStore.deleteOwner(req.params.id);
    res.json({
      success: true,
      message: 'Proprietario eliminato con successo'
    });
  } catch (error) {
    const isConstraintError = error.message && error.message.includes('Impossibile eliminare');
    res.status(isConstraintError ? 400 : 500).json({
      success: false,
      message: error.message || "Errore durante l'eliminazione del proprietario"
    });
  }
};
