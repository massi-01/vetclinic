import { dataStore } from '../services/dataStore.js';

export const getPets = async (req, res) => {
  try {
    const { clinicId, search, specie, proprietarioId } = req.query;
    const pets = await dataStore.getPets(clinicId, { search, specie, proprietarioId }, req.user?._id);
    const allVaccinations = await dataStore.getVaccinations(clinicId, {}, req.user?._id);

    // Collega l'eventuale warning vaccinale per ciascun animale
    const petsWithVaccineAlert = pets.map((p) => {
      const petIdStr = (p._id || '').toString();
      const petVacs = allVaccinations.filter((v) => (v.animaleId?._id || v.animaleId)?.toString() === petIdStr);
      const expiredVac = petVacs.find((v) => v.statoWarning === 'SCADUTO');
      const expiringVac = petVacs.find((v) => v.statoWarning === 'IN_SCADENZA');

      let vaccineWarning = null;
      if (expiredVac) {
        vaccineWarning = {
          stato: 'SCADUTO',
          nomeVaccino: expiredVac.nomeVaccino,
          giorni: expiredVac.scadutoDaGiorni || Math.abs(expiredVac.giorniAlRichiamo || 0)
        };
      } else if (expiringVac) {
        vaccineWarning = {
          stato: 'IN_SCADENZA',
          nomeVaccino: expiringVac.nomeVaccino,
          giorni: expiringVac.giorniAlRichiamo
        };
      }

      return {
        ...(p.toObject ? p.toObject() : p),
        vaccineWarning
      };
    });

    res.json({
      success: true,
      data: petsWithVaccineAlert
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

    // Carica visite, terapie e vaccinazioni del paziente
    const visits = await dataStore.getVisits(null, { petId: pet._id });
    const therapies = await dataStore.getTherapies(null, { petId: pet._id });
    const vaccinations = await dataStore.getVaccinations(null, { petId: pet._id });

    const petObj = pet.toObject ? pet.toObject() : pet;

    res.json({
      success: true,
      data: {
        ...petObj,
        visite: visits,
        terapie: therapies,
        vaccinazioni: vaccinations
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
