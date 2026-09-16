import { dataStore } from '../services/dataStore.js';

export const getPets = async (req, res) => {
  try {
    const { clinicId, search, specie, proprietarioId } = req.query;
    const pets = await dataStore.getPets(clinicId, { search, specie, proprietarioId });
    res.json({
      success: true,
      data: pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei pazienti',
      error: error.message
    });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await dataStore.getPetById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Animale non trovato'
      });
    }

    // Carica anche le visite storiche e le terapie del paziente
    const visits = await dataStore.getVisits(null, { petId: pet._id });
    const therapies = await dataStore.getTherapies(null, { petId: pet._id });

    res.json({
      success: true,
      data: {
        ...pet,
        visite: visits,
        terapie: therapies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della cartella clinica',
      error: error.message
    });
  }
};

export const createPet = async (req, res) => {
  try {
    const {
      nome,
      specie,
      razza,
      sesso,
      dataNascita,
      microchip,
      pesoAttuale,
      coloreMantello,
      segniParticolari,
      allergie,
      noteCliniche,
      proprietarioId,
      ambulatorioId,
      fotoUrl
    } = req.body;

    if (!nome || !specie || !proprietarioId || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Nome, specie, proprietario e ambulatorio sono obbligatori'
      });
    }

    const pet = await dataStore.createPet({
      nome,
      specie,
      razza: razza || 'Meticcio / Non specificata',
      sesso: sesso || 'Maschio',
      dataNascita,
      microchip,
      pesoAttuale: Number(pesoAttuale) || 0,
      coloreMantello,
      segniParticolari,
      allergie: Array.isArray(allergie) ? allergie : (allergie ? [allergie] : []),
      noteCliniche,
      proprietarioId,
      ambulatorioId,
      fotoUrl
    });

    res.status(201).json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione del paziente',
      error: error.message
    });
  }
};

export const updatePet = async (req, res) => {
  try {
    const pet = await dataStore.updatePet(req.params.id, req.body);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Animale non trovato'
      });
    }
    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento della cartella clinica",
      error: error.message
    });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await dataStore.deletePet(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Animale non trovato'
      });
    }
    res.json({
      success: true,
      message: 'Cartella clinica rimossa con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione dell'animale",
      error: error.message
    });
  }
};
