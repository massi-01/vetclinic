import { dataStore } from '../services/dataStore.js';

export const getVisits = async (req, res) => {
  try {
    const { clinicId, petId, data, limit } = req.query;
    const visits = await dataStore.getVisits(clinicId, { petId, data, limit }, req.user?._id);
    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle visite',
      error: error.message
    });
  }
};

export const getVisitById = async (req, res) => {
  try {
    const visit = await dataStore.getVisitById(req.params.id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visita non trovata'
      });
    }

    const clinicId = visit.ambulatorioId?._id || visit.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, clinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad accedere a questa cartella di visita'
      });
    }

    // Recupera anche le terapie prescritte in questa visita
    const therapies = await dataStore.getTherapies(null, { petId: visit.animaleId?._id || visit.animaleId }, req.user?._id);
    const visitIdStr = visit._id.toString();
    const visitTherapies = therapies.filter((t) => {
      const vId = (t.visitaId?._id || t.visitaId)?.toString();
      return vId === visitIdStr;
    });

    // Converti Mongoose doc in plain object prima dello spread per preservare tutte le proprietà
    const visitObj = typeof visit.toObject === 'function' ? visit.toObject() : (visit._doc ? { ...visit._doc } : { ...visit });

    res.json({
      success: true,
      data: {
        ...visitObj,
        terapiePrescritte: visitTherapies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della visita',
      error: error.message
    });
  }
};

export const createVisit = async (req, res) => {
  try {
    const {
      data,
      ora,
      tipoVisita,
      motivo,
      anamnesi,
      esameObiettivo,
      diagnosi,
      parametriVitali,
      note,
      stato,
      animaleId,
      ambulatorioId,
      terapia // opzionale: farmaco prescritto contestualmente alla visita
    } = req.body;

    if (!motivo || !animaleId || !ambulatorioId) {
      return res.status(400).json({
        success: false,
        message: 'Motivo, animale e ambulatorio sono obbligatori'
      });
    }

    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, ambulatorioId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per registrare visite in questo ambulatorio'
      });
    }

    const visit = await dataStore.createVisit({
      data: data || new Date().toISOString().split('T')[0],
      ora: ora || '10:00',
      tipoVisita: tipoVisita || 'Controllo Generale',
      motivo,
      anamnesi: anamnesi || '',
      esameObiettivo: esameObiettivo || '',
      diagnosi: diagnosi || '',
      parametriVitali: parametriVitali || {},
      note: note || '',
      stato: stato || 'Completata',
      animaleId,
      veterinarioId: req.user._id,
      ambulatorioId
    });

    // Se è stata allegata una prescrizione terapeutica contestuale, creiamola
    let createdTherapy = null;
    if (terapia && terapia.nomeFarmaco) {
      createdTherapy = await dataStore.createTherapy({
        nomeFarmaco: terapia.nomeFarmaco,
        principioAttivo: terapia.principioAttivo || '',
        dosaggio: terapia.dosaggio || 'Standard',
        viaSomministrazione: terapia.viaSomministrazione || 'Orale',
        posologia: terapia.posologia,
        dataInizio: terapia.dataInizio || visit.data,
        durataGiorni: Number(terapia.durataGiorni) || 7,
        istruzioni: terapia.istruzioni || '',
        attiva: true,
        animaleId,
        visitaId: visit._id,
        veterinarioId: req.user._id,
        ambulatorioId
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...visit,
        terapia: createdTherapy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione della visita',
      error: error.message
    });
  }
};

export const updateVisit = async (req, res) => {
  try {
    const existing = await dataStore.getVisitById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Visita non trovata'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questa visita'
      });
    }

    const visit = await dataStore.updateVisit(req.params.id, req.body);
    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento della visita",
      error: error.message
    });
  }
};

export const deleteVisit = async (req, res) => {
  try {
    const existing = await dataStore.getVisitById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Visita non trovata'
      });
    }

    const currentClinicId = existing.ambulatorioId?._id || existing.ambulatorioId;
    const hasAccess = await dataStore.isUserAuthorizedForClinic(req.user._id, currentClinicId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato ad eliminare questa visita'
      });
    }

    await dataStore.deleteVisit(req.params.id);
    res.json({
      success: true,
      message: 'Visita eliminata con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione della visita",
      error: error.message
    });
  }
};
