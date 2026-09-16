import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Owner from '../models/Owner.js';
import Pet from '../models/Pet.js';
import Visit from '../models/Visit.js';
import Therapy from '../models/Therapy.js';
import Vaccination from '../models/Vaccination.js';
import Appointment from '../models/Appointment.js';
import ClinicRequest from '../models/ClinicRequest.js';
import { isMongoConnected } from '../config/db.js';

// In-Memory Database di fallback
let memoryData = {
  users: [],
  clinics: [],
  owners: [],
  pets: [],
  visits: [],
  therapies: [],
  vaccinations: [],
  appointments: [],
  clinicRequests: []
};

// Generatore ID univoci per il fallback in-memory (compatibili con stringhe ObjectId)
const generateId = () => new mongoose.Types.ObjectId().toString();

// Dati dimostrativi iniziali (Seed Data)
export const initSeedData = async () => {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const clinic1Id = generateId();
  const clinic2Id = generateId();
  const vetId = generateId();
  const owner1Id = generateId();
  const owner2Id = generateId();
  const owner3Id = generateId();
  const pet1Id = generateId();
  const pet2Id = generateId();
  const pet3Id = generateId();
  const visit1Id = generateId();
  const visit2Id = generateId();
  const therapy1Id = generateId();
  const therapy2Id = generateId();

  const clinics = [
    {
      _id: clinic1Id,
      nome: 'Clinica Veterinaria San Francesco',
      indirizzo: 'Via Roma 45',
      citta: 'Milano',
      cap: '20121',
      telefono: '02 89401234',
      email: 'info@clinicasanfrancesco.it',
      partitaIva: 'IT09876543210',
      codiceFiscale: '09876543210',
      orariApertura: 'Lun - Ven: 08:30 - 20:00 | Sab: 09:00 - 18:00',
      prontoSoccorso24h: true,
      coloreTema: '#0d9488',
      veterinari: [vetId],
      creatoreId: vetId,
      createdAt: new Date().toISOString()
    },
    {
      _id: clinic2Id,
      nome: 'Ambulatorio Veterinario Navigli',
      indirizzo: 'Ripa di Porta Ticinese 12',
      citta: 'Milano',
      cap: '20143',
      telefono: '02 58109876',
      email: 'contatti@ambulatorionavigli.it',
      partitaIva: 'IT01234567890',
      codiceFiscale: '01234567890',
      orariApertura: 'Lun - Ven: 09:00 - 19:00 | Sab: Chiuso',
      prontoSoccorso24h: false,
      coloreTema: '#0284c7',
      veterinari: [vetId],
      creatoreId: vetId,
      createdAt: new Date().toISOString()
    }
  ];

  const users = [
    {
      _id: vetId,
      nome: 'Marco',
      cognome: 'Rossi',
      email: 'dr.rossi@vetclinic.it',
      password: hashedPassword,
      telefono: '+39 347 1234567',
      codiceAlbo: 'MI-8492',
      ruolo: 'veterinario',
      ambulatori: [clinic1Id, clinic2Id],
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    }
  ];

  const owners = [
    {
      _id: owner1Id,
      nome: 'Mario',
      cognome: 'Bianchi',
      codiceFiscale: 'BNCMR080A01F205Z',
      telefono: '+39 333 9876543',
      email: 'mario.bianchi@email.it',
      indirizzo: 'Corso Buenos Aires 22',
      citta: 'Milano',
      note: 'Proprietario molto attento e puntuale.',
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: owner2Id,
      nome: 'Laura',
      cognome: 'Verdi',
      codiceFiscale: 'VRDLRA85M45F205X',
      telefono: '+39 338 1122334',
      email: 'laura.verdi@email.it',
      indirizzo: 'Via Tortona 18',
      citta: 'Milano',
      note: 'Preferisce comunicazioni via WhatsApp.',
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: owner3Id,
      nome: 'Alessandro',
      cognome: 'Ferri',
      codiceFiscale: 'FRRLSN92C12F205W',
      telefono: '+39 340 5566778',
      email: 'alessandro.ferri@email.it',
      indirizzo: 'Via Solari 5',
      citta: 'Milano',
      note: 'Paziente esotico.',
      ambulatorioId: clinic2Id,
      createdAt: new Date().toISOString()
    }
  ];

  const pets = [
    {
      _id: pet1Id,
      nome: 'Thor',
      specie: 'Cane',
      razza: 'Golden Retriever',
      sesso: 'Maschio',
      dataNascita: '2021-04-10',
      microchip: '380260043210987',
      pesoAttuale: 32.5,
      storicoPeso: [
        { data: '2023-10-15', peso: 31.0, note: 'Controllo annuale' },
        { data: '2024-04-20', peso: 32.0, note: 'Vaccinazione' },
        { data: '2024-09-01', peso: 32.5, note: 'Visita recente' }
      ],
      coloreMantello: 'Miele dorato',
      segniParticolari: 'Macchia bianca sul petto',
      allergie: ['Pollo'],
      noteCliniche: 'Soggetto docile, leggera displasia dell\'anca sinistra sotto monitoraggio.',
      fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80',
      proprietarioId: owner1Id,
      ambulatorioId: clinic1Id,
      stato: 'Attivo',
      createdAt: new Date().toISOString()
    },
    {
      _id: pet2Id,
      nome: 'Luna',
      specie: 'Gatto',
      razza: 'Certosino',
      sesso: 'Femmina Sterilizzata',
      dataNascita: '2022-06-15',
      microchip: '380260012345678',
      pesoAttuale: 4.3,
      storicoPeso: [
        { data: '2024-01-10', peso: 4.1, note: 'Controllo' },
        { data: '2024-08-14', peso: 4.3, note: 'Peso stabile' }
      ],
      coloreMantello: 'Grigio fumo',
      segniParticolari: 'Occhi ambrati intensi',
      allergie: [],
      noteCliniche: 'Episodi ricorrenti di cistite idiopatica nei periodi di stress.',
      fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
      proprietarioId: owner2Id,
      ambulatorioId: clinic1Id,
      stato: 'Attivo',
      createdAt: new Date().toISOString()
    },
    {
      _id: pet3Id,
      nome: 'Biscotto',
      specie: 'Coniglio',
      razza: 'Ariete Nano',
      sesso: 'Maschio Castrato',
      dataNascita: '2023-01-20',
      microchip: '380260098765432',
      pesoAttuale: 1.85,
      storicoPeso: [
        { data: '2024-03-05', peso: 1.75, note: 'Prima pesata' },
        { data: '2024-07-22', peso: 1.85, note: 'Ottimo stato di nutrizione' }
      ],
      coloreMantello: 'Marrone e bianco',
      segniParticolari: 'Orecchie lunghe cascanti',
      allergie: [],
      noteCliniche: 'Controllo usura denti molari regolare.',
      fotoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&auto=format&fit=crop&q=80',
      proprietarioId: owner3Id,
      ambulatorioId: clinic2Id,
      stato: 'Attivo',
      createdAt: new Date().toISOString()
    }
  ];

  const visits = [
    {
      _id: visit1Id,
      data: new Date().toISOString().split('T')[0],
      ora: '10:30',
      tipoVisita: 'Controllo Generale',
      motivo: 'Visita periodica di controllo e richiamo vaccino Nobivac DHPPi',
      anamnesi: 'Il cane sta bene, appetito normale, feci e urine nella norma.',
      esameObiettivo: 'Mucose rosee, sensorio vigile, linfonodi esplorabili nella norma, auscultazione cardiopolmonare esente da rumori patologici.',
      diagnosi: 'Soggetto in eccellente stato di salute generale.',
      parametriVitali: {
        temperatura: 38.4,
        frequenzaCardiaca: 88,
        frequenzaRespiratoria: 24,
        pesoRilevato: 32.5
      },
      note: 'Eseguito richiamo vaccinale annuale. Prossimo richiamo tra 12 mesi.',
      stato: 'Completata',
      animaleId: pet1Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: visit2Id,
      data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ora: '16:00',
      tipoVisita: 'Visita Specialistica',
      motivo: 'Episodi di vomito e disoressia da 24 ore',
      anamnesi: 'La gatta ha manifestato due episodi di vomito alimentare e rifiuta il cibo umido.',
      esameObiettivo: 'Addome palpabile, lieve dolorabilità in sede epigastrica, idratazione conservata.',
      diagnosi: 'Gastroenterite acuta lieve, probabile indiscrezione alimentare.',
      parametriVitali: {
        temperatura: 38.8,
        frequenzaCardiaca: 140,
        frequenzaRespiratoria: 30,
        pesoRilevato: 4.3
      },
      note: 'Prescritta terapia con protettore gastrico e dieta gastrointestinale per 5 giorni.',
      stato: 'Completata',
      animaleId: pet2Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    }
  ];

  const therapies = [
    {
      _id: therapy1Id,
      nomeFarmaco: 'Maropitant (Cerenia)',
      principioAttivo: 'Maropitant citrato',
      dosaggio: '16 mg',
      viaSomministrazione: 'Orale',
      posologia: '1 compressa una volta al giorno prima del pasto',
      dataInizio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataFine: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durataGiorni: 5,
      istruzioni: 'Somministrare a digiuno con un bocconcino leggero per prevenire il vomito.',
      attiva: true,
      animaleId: pet2Id,
      visitaId: visit2Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: therapy2Id,
      nomeFarmaco: 'NexGard Spectra',
      principioAttivo: 'Afoxolaner + Milbemicina ossima',
      dosaggio: 'Compresse per cani 30-60 kg',
      viaSomministrazione: 'Orale',
      posologia: '1 compressa masticabile mensile',
      dataInizio: new Date().toISOString().split('T')[0],
      dataFine: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durataGiorni: 30,
      istruzioni: 'Profilassi antiparassitaria completa contro pulci, zecche e filariosi.',
      attiva: true,
      animaleId: pet1Id,
      visitaId: visit1Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    }
  ];

  const vac1Id = generateId();
  const vac2Id = generateId();
  const vac3Id = generateId();

  const vaccinations = [
    {
      _id: vac1Id,
      nomeVaccino: 'Nobivac DHPPi + Lepto',
      categoria: 'Core / Polivalente',
      numeroLotto: 'B982A01',
      dataSomministrazione: '2026-03-10',
      dataRichiamo: '2027-03-10',
      note: 'Buona tollerabilità, nessuna reazione avversa registrata.',
      animaleId: pet1Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: vac2Id,
      nomeVaccino: 'Nobivac Tricat Trio',
      categoria: 'Richiamo Annuale',
      numeroLotto: 'C44109',
      dataSomministrazione: '2025-08-15',
      dataRichiamo: '2026-08-15',
      note: 'Richiamo vaccinale annuale SCADUTO. Necessaria nuova somministrazione.',
      animaleId: pet2Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: vac3Id,
      nomeVaccino: 'Cunivak RHD+Myxo',
      categoria: 'Altro',
      numeroLotto: 'R9910',
      dataSomministrazione: '2025-09-28',
      dataRichiamo: '2026-09-28',
      note: 'Richiamo periodico imminente tra pochi giorni.',
      animaleId: pet3Id,
      veterinarioId: vetId,
      ambulatorioId: clinic2Id,
      createdAt: new Date().toISOString()
    }
  ];

  const app1Id = generateId();
  const app2Id = generateId();
  const app3Id = generateId();

  const appointments = [
    {
      _id: app1Id,
      data: new Date().toISOString().split('T')[0],
      oraInizio: '10:00',
      oraFine: '10:30',
      durataMinuti: 30,
      tipoPrestazione: 'Visita Generale',
      motivo: 'Controllo andatura e postura zampa anteriore',
      stato: 'Confermato',
      note: 'Il cane zoppica leggermente a freddo.',
      animaleId: pet1Id,
      proprietarioId: owner1Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: app2Id,
      data: new Date().toISOString().split('T')[0],
      oraInizio: '11:30',
      oraFine: '12:00',
      durataMinuti: 30,
      tipoPrestazione: 'Vaccinazione',
      motivo: 'Richiamo vaccino annuale scaduto',
      stato: 'In Attesa',
      note: 'Cliente arrivato in sala d\'aspetto con trasportino.',
      animaleId: pet2Id,
      proprietarioId: owner2Id,
      veterinarioId: vetId,
      ambulatorioId: clinic1Id,
      createdAt: new Date().toISOString()
    },
    {
      _id: app3Id,
      data: new Date().toISOString().split('T')[0],
      oraInizio: '16:00',
      oraFine: '16:45',
      durataMinuti: 45,
      tipoPrestazione: 'Controllo Post-Operatorio',
      motivo: 'Ispezione usura dentale e pesata',
      stato: 'Prenotato',
      note: 'Controllo periodico coniglietto.',
      animaleId: pet3Id,
      proprietarioId: owner3Id,
      veterinarioId: vetId,
      ambulatorioId: clinic2Id,
      createdAt: new Date().toISOString()
    }
  ];

  // Inizializza memoria
  memoryData = {
    users,
    clinics,
    owners,
    pets,
    visits,
    therapies,
    vaccinations,
    appointments
  };

  // Se MongoDB è connesso, verifichiamo e popoliamo se il database è vuoto
  if (mongoose.connection.readyState === 1) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Popolamento iniziale di MongoDB con dati dimostrativi...');
        await Clinic.insertMany(clinics);
        await User.insertMany(users);
        await Owner.insertMany(owners);
        await Pet.insertMany(pets);
        await Visit.insertMany(visits);
        await Therapy.insertMany(therapies);
        await Vaccination.insertMany(vaccinations);
        await Appointment.insertMany(appointments);
        console.log('✅ MongoDB popolato con successo!');
      } else {
        // Assicurati che le cliniche esistenti abbiano creatoreId impostato
        const dbVet = await User.findOne({ email: 'dr.rossi@vetclinic.it' });
        if (dbVet) {
          await Clinic.updateMany(
            { $or: [{ creatoreId: { $exists: false } }, { creatoreId: null }] },
            { $set: { creatoreId: dbVet._id } }
          );
        }

        const vacCount = await Vaccination.countDocuments();
        const appCount = await Appointment.countDocuments();
        if (vacCount === 0 || appCount === 0) {
          const dbPets = await Pet.find();
          const dbVet = await User.findOne();
          if (dbPets.length > 0 && dbVet) {
            if (vacCount === 0) {
              const realVaccinations = dbPets.slice(0, 3).map((p, idx) => ({
                nomeVaccino: idx === 0 ? 'Nobivac DHPPi + Lepto' : idx === 1 ? 'Nobivac Tricat Trio' : 'Cunivak RHD+Myxo',
                categoria: idx === 0 ? 'Core / Polivalente' : idx === 1 ? 'Richiamo Annuale' : 'Altro',
                numeroLotto: `LOT-${1000 + idx}`,
                dataSomministrazione: idx === 1 ? '2025-08-15' : idx === 2 ? '2025-09-28' : '2026-03-10',
                dataRichiamo: idx === 1 ? '2026-08-15' : idx === 2 ? '2026-09-28' : '2027-03-10',
                note: idx === 1 ? 'Richiamo vaccinale scaduto da oltre 30 giorni.' : 'Controllo periodico.',
                animaleId: p._id,
                veterinarioId: dbVet._id,
                ambulatorioId: p.ambulatorioId
              }));
              await Vaccination.insertMany(realVaccinations);
            }
            if (appCount === 0) {
              const realAppointments = dbPets.slice(0, 3).map((p, idx) => ({
                data: new Date().toISOString().split('T')[0],
                oraInizio: idx === 0 ? '10:00' : idx === 1 ? '11:30' : '16:00',
                oraFine: idx === 0 ? '10:30' : idx === 1 ? '12:00' : '16:45',
                durataMinuti: idx === 2 ? 45 : 30,
                tipoPrestazione: idx === 0 ? 'Visita Generale' : idx === 1 ? 'Vaccinazione' : 'Controllo Post-Operatorio',
                motivo: idx === 0 ? 'Controllo andatura zampa' : idx === 1 ? 'Richiamo vaccino annuale' : 'Controllo peso e dentatura',
                stato: idx === 0 ? 'Confermato' : idx === 1 ? 'In Attesa' : 'Prenotato',
                animaleId: p._id,
                proprietarioId: p.proprietarioId,
                veterinarioId: dbVet._id,
                ambulatorioId: p.ambulatorioId
              }));
              await Appointment.insertMany(realAppointments);
            }
            console.log('✅ Vaccinazioni e Appuntamenti agganciati e sincronizzati con successo su MongoDB!');
          }
        }
      }
    } catch (err) {
      console.error('⚠️ Errore nel popolamento seed di MongoDB:', err.message);
    }
  }
};

// HELPER: Verifica se Mongo è attivo
const shouldUseMongo = () => mongoose.connection.readyState === 1;

// DATA ACCESS LAYER
export const dataStore = {
  // === UTENTI / VETERINARI ===
  async findUserByEmail(email) {
    if (shouldUseMongo()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memoryData.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (shouldUseMongo()) {
      return await User.findById(id).populate('ambulatori');
    }
    const user = memoryData.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const populatedClinics = memoryData.clinics.filter((c) =>
      user.ambulatori?.map((aid) => aid.toString()).includes(c._id.toString())
    );
    return { ...user, ambulatori: populatedClinics };
  },

  async createUser(userData) {
    if (shouldUseMongo()) {
      const user = new User(userData);
      return await user.save();
    }
    const newUser = {
      _id: generateId(),
      ...userData,
      ambulatori: userData.ambulatori || [],
      createdAt: new Date().toISOString()
    };
    memoryData.users.push(newUser);
    return newUser;
  },

  // Helper per ottenere gli ID degli ambulatori a cui l'utente ha accesso
  async getUserClinicIds(vetId) {
    if (!vetId) return [];
    const vetIdStr = vetId.toString();
    if (shouldUseMongo()) {
      const user = await User.findById(vetId);
      const userAmbs = (user?.ambulatori || []).map((id) => id.toString());
      const clinics = await Clinic.find({
        $or: [
          { creatoreId: vetId },
          { veterinari: vetId },
          { _id: { $in: userAmbs } }
        ]
      });
      return clinics.map((c) => c._id.toString());
    }
    const user = memoryData.users.find((u) => u._id.toString() === vetIdStr);
    const userAmbs = (user?.ambulatori || []).map((a) => (a._id || a).toString());
    return memoryData.clinics
      .filter(
        (c) =>
          c.creatoreId?.toString() === vetIdStr ||
          (c.veterinari || []).map((v) => v.toString()).includes(vetIdStr) ||
          userAmbs.includes(c._id.toString())
      )
      .map((c) => c._id.toString());
  },

  // Risolve gli ID ambulatorio autorizzati per filtrare i dati
  async resolveClinicFilter(clinicId = null, vetId = null) {
    if (!vetId) {
      return clinicId ? [clinicId.toString()] : null;
    }
    const allowed = await this.getUserClinicIds(vetId);
    if (allowed.length === 0) {
      // Utente senza ambulatori: isolamento completo, nessun dato visibile
      return [];
    }
    if (clinicId) {
      const clinicStr = clinicId.toString();
      return allowed.includes(clinicStr) ? [clinicStr] : [];
    }
    return allowed;
  },

  // === AMBULATORI / CLINICHE ===
  async getClinics(vetId = null) {
    if (!vetId) {
      if (shouldUseMongo()) return await Clinic.find();
      return [...memoryData.clinics];
    }
    const allowedIds = await this.getUserClinicIds(vetId);
    if (allowedIds.length === 0) return [];
    if (shouldUseMongo()) {
      return await Clinic.find({ _id: { $in: allowedIds } });
    }
    return memoryData.clinics.filter((c) => allowedIds.includes(c._id.toString()));
  },

  async getClinicById(id) {
    if (shouldUseMongo()) {
      return await Clinic.findById(id);
    }
    return memoryData.clinics.find((c) => c._id.toString() === id.toString()) || null;
  },

  async createClinic(clinicData, vetId) {
    if (shouldUseMongo()) {
      const clinic = new Clinic({
        ...clinicData,
        creatoreId: vetId || null,
        veterinari: vetId ? [vetId] : []
      });
      const saved = await clinic.save();
      if (vetId) {
        await User.findByIdAndUpdate(vetId, { $addToSet: { ambulatori: saved._id } });
      }
      return saved;
    }
    const newClinic = {
      _id: generateId(),
      ...clinicData,
      creatoreId: vetId ? vetId.toString() : null,
      veterinari: vetId ? [vetId.toString()] : [],
      createdAt: new Date().toISOString()
    };
    memoryData.clinics.push(newClinic);
    if (vetId) {
      const user = memoryData.users.find((u) => u._id.toString() === vetId.toString());
      if (user) {
        user.ambulatori = user.ambulatori || [];
        if (!user.ambulatori.includes(newClinic._id)) {
          user.ambulatori.push(newClinic._id);
        }
      }
    }
    return newClinic;
  },

  async updateClinic(id, updateData) {
    if (shouldUseMongo()) {
      return await Clinic.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = memoryData.clinics.findIndex((c) => c._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.clinics[index] = { ...memoryData.clinics[index], ...updateData };
    return memoryData.clinics[index];
  },

  // === RICHIESTE DI ACCESSO A SEDI ESISTENTI (CLINIC REQUESTS) ===
  async getAvailableClinics(vetId, search = '') {
    const userClinicIds = await this.getUserClinicIds(vetId);
    let clinics = [];
    if (shouldUseMongo()) {
      const query = {};
      if (search) {
        query.$or = [
          { nome: { $regex: search, $options: 'i' } },
          { citta: { $regex: search, $options: 'i' } },
          { indirizzo: { $regex: search, $options: 'i' } }
        ];
      }
      clinics = await Clinic.find(query)
        .populate('creatoreId', 'nome cognome email')
        .sort({ nome: 1 });
    } else {
      clinics = [...(memoryData.clinics || [])];
      if (search) {
        const s = search.toLowerCase();
        clinics = clinics.filter(
          (c) =>
            c.nome?.toLowerCase().includes(s) ||
            c.citta?.toLowerCase().includes(s) ||
            c.indirizzo?.toLowerCase().includes(s)
        );
      }
      clinics.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      clinics = clinics.map((c) => {
        const creatore = memoryData.users.find((u) => u._id.toString() === c.creatoreId?.toString());
        return {
          ...c,
          creatoreId: creatore ? { nome: creatore.nome, cognome: creatore.cognome, email: creatore.email } : null
        };
      });
    }

    // Aggiungi informazione su richieste già inviate dall'utente per ciascuna clinica
    const userRequests = await this.getMySentRequests(vetId);

    return clinics.map((c) => {
      const obj = c.toObject ? c.toObject() : { ...c };
      const clinicIdStr = obj._id.toString();
      const isAlreadyMember = userClinicIds.includes(clinicIdStr);
      const reqForThisClinic = userRequests.find(
        (r) => (r.ambulatorioId?._id || r.ambulatorioId)?.toString() === clinicIdStr
      );
      return {
        ...obj,
        giaAssociata: isAlreadyMember,
        richiestaEsistente: reqForThisClinic
          ? {
              _id: reqForThisClinic._id,
              stato: reqForThisClinic.stato,
              dataRichiesta: reqForThisClinic.dataRichiesta
            }
          : null
      };
    });
  },

  async createClinicRequest(vetId, { ambulatorioId, messaggio = '' }) {
    if (!ambulatorioId) {
      throw new Error("L'ID dell'ambulatorio è obbligatorio");
    }

    const clinic = await this.getClinicById(ambulatorioId);
    if (!clinic) {
      throw new Error('Ambulatorio non trovato');
    }

    const userClinicIds = await this.getUserClinicIds(vetId);
    if (userClinicIds.includes(ambulatorioId.toString())) {
      throw new Error('Fai già parte di questo ambulatorio');
    }

    if (shouldUseMongo()) {
      const existing = await ClinicRequest.findOne({
        ambulatorioId,
        veterinarioId: vetId,
        stato: 'IN_ATTESA'
      });
      if (existing) {
        throw new Error('Hai già una richiesta di accesso in attesa per questo ambulatorio');
      }

      let gestoreId = clinic.creatoreId?._id || clinic.creatoreId;
      if (!gestoreId && clinic.veterinari && clinic.veterinari.length > 0) {
        gestoreId = clinic.veterinari[0]._id || clinic.veterinari[0];
      }
      if (!gestoreId) {
        gestoreId = vetId;
      }

      const reqDoc = new ClinicRequest({
        ambulatorioId,
        veterinarioId: vetId,
        gestoreId,
        stato: 'IN_ATTESA',
        messaggio: messaggio ? messaggio.trim() : '',
        dataRichiesta: new Date()
      });

      const saved = await reqDoc.save();
      return await ClinicRequest.findById(saved._id)
        .populate('ambulatorioId')
        .populate('gestoreId', 'nome cognome email');
    }

    memoryData.clinicRequests = memoryData.clinicRequests || [];
    const existing = memoryData.clinicRequests.find(
      (r) =>
        r.ambulatorioId?.toString() === ambulatorioId.toString() &&
        r.veterinarioId?.toString() === vetId.toString() &&
        r.stato === 'IN_ATTESA'
    );
    if (existing) {
      throw new Error('Hai già una richiesta di accesso in attesa per questo ambulatorio');
    }

    let gestoreId = clinic.creatoreId || (clinic.veterinari && clinic.veterinari[0]) || vetId;
    const newReq = {
      _id: generateId(),
      ambulatorioId,
      veterinarioId: vetId,
      gestoreId,
      stato: 'IN_ATTESA',
      messaggio: messaggio ? messaggio.trim() : '',
      dataRichiesta: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    memoryData.clinicRequests.push(newReq);
    return { ...newReq, ambulatorioId: clinic };
  },

  async getMySentRequests(vetId) {
    if (shouldUseMongo()) {
      return await ClinicRequest.find({ veterinarioId: vetId })
        .populate('ambulatorioId')
        .populate('gestoreId', 'nome cognome email telefono')
        .sort({ createdAt: -1 });
    }
    memoryData.clinicRequests = memoryData.clinicRequests || [];
    const list = memoryData.clinicRequests.filter((r) => r.veterinarioId?.toString() === vetId.toString());
    return list
      .map((r) => {
        const clinic = memoryData.clinics.find((c) => c._id.toString() === r.ambulatorioId?.toString());
        const gestore = memoryData.users.find((u) => u._id.toString() === r.gestoreId?.toString());
        return {
          ...r,
          ambulatorioId: clinic || r.ambulatorioId,
          gestoreId: gestore ? { nome: gestore.nome, cognome: gestore.cognome, email: gestore.email } : r.gestoreId
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getReceivedRequests(vetId) {
    if (shouldUseMongo()) {
      const myClinics = await Clinic.find({
        $or: [{ creatoreId: vetId }, { veterinari: vetId }]
      }).select('_id');
      const myClinicIds = myClinics.map((c) => c._id);

      return await ClinicRequest.find({
        $or: [{ gestoreId: vetId }, { ambulatorioId: { $in: myClinicIds } }]
      })
        .populate('veterinarioId', 'nome cognome email telefono codiceAlbo')
        .populate('ambulatorioId')
        .sort({ createdAt: -1 });
    }

    memoryData.clinicRequests = memoryData.clinicRequests || [];
    const myClinicIds = (memoryData.clinics || [])
      .filter((c) => c.creatoreId?.toString() === vetId.toString() || (c.veterinari || []).includes(vetId.toString()))
      .map((c) => c._id.toString());

    const list = memoryData.clinicRequests.filter(
      (r) => r.gestoreId?.toString() === vetId.toString() || myClinicIds.includes(r.ambulatorioId?.toString())
    );

    return list
      .map((r) => {
        const clinic = memoryData.clinics.find((c) => c._id.toString() === r.ambulatorioId?.toString());
        const vet = memoryData.users.find((u) => u._id.toString() === r.veterinarioId?.toString());
        return {
          ...r,
          ambulatorioId: clinic || r.ambulatorioId,
          veterinarioId: vet
            ? {
                _id: vet._id,
                nome: vet.nome,
                cognome: vet.cognome,
                email: vet.email,
                telefono: vet.telefono,
                codiceAlbo: vet.codiceAlbo
              }
            : r.veterinarioId
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async respondToClinicRequest(requestId, gestoreId, action, note = '') {
    if (!['APPROVE', 'REJECT'].includes(action)) {
      throw new Error("Azione non valida. Usa 'APPROVE' o 'REJECT'");
    }

    const newStatus = action === 'APPROVE' ? 'ACCETTATA' : 'RIFIUTATA';

    if (shouldUseMongo()) {
      const request = await ClinicRequest.findById(requestId);
      if (!request) {
        throw new Error('Richiesta non trovata');
      }

      const clinic = await Clinic.findById(request.ambulatorioId);
      const isAuthorized =
        request.gestoreId?.toString() === gestoreId.toString() ||
        clinic?.creatoreId?.toString() === gestoreId.toString() ||
        (clinic?.veterinari || []).some((v) => v.toString() === gestoreId.toString());

      if (!isAuthorized) {
        throw new Error('Non sei autorizzato a gestire questa richiesta di accesso');
      }

      request.stato = newStatus;
      request.noteRisposta = note ? note.trim() : '';
      request.dataRisposta = new Date();
      await request.save();

      if (action === 'APPROVE') {
        const clinicId = clinic._id;
        const vetId = request.veterinarioId;

        // Aggiungi il veterinario alla clinica
        await Clinic.findByIdAndUpdate(clinicId, {
          $addToSet: { veterinari: vetId }
        });

        // Aggiungi la clinica al profilo del veterinario
        await User.findByIdAndUpdate(vetId, {
          $addToSet: { ambulatori: clinicId }
        });
      }

      return await ClinicRequest.findById(requestId)
        .populate('ambulatorioId')
        .populate('veterinarioId', 'nome cognome email telefono codiceAlbo');
    }

    memoryData.clinicRequests = memoryData.clinicRequests || [];
    const index = memoryData.clinicRequests.findIndex((r) => r._id.toString() === requestId.toString());
    if (index === -1) {
      throw new Error('Richiesta non trovata');
    }

    const request = memoryData.clinicRequests[index];
    const clinic = memoryData.clinics.find((c) => c._id.toString() === request.ambulatorioId?.toString());

    request.stato = newStatus;
    request.noteRisposta = note ? note.trim() : '';
    request.dataRisposta = new Date().toISOString();

    if (action === 'APPROVE' && clinic) {
      clinic.veterinari = clinic.veterinari || [];
      const vetIdStr = request.veterinarioId.toString();
      if (!clinic.veterinari.includes(vetIdStr)) {
        clinic.veterinari.push(vetIdStr);
      }
      const user = memoryData.users.find((u) => u._id.toString() === vetIdStr);
      if (user) {
        user.ambulatori = user.ambulatori || [];
        const clinicIdStr = clinic._id.toString();
        if (!user.ambulatori.includes(clinicIdStr)) {
          user.ambulatori.push(clinicIdStr);
        }
      }
    }

    return request;
  },

  // === PROPRIETARI (OWNERS) ===
  async getOwners(clinicId = null, search = '', vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nome: regex }, { cognome: regex }, { telefono: regex }, { codiceFiscale: regex }];
      }
      return await Owner.find(query).sort({ cognome: 1, nome: 1 });
    }
    let list = [...memoryData.owners];
    if (clinicIds) {
      list = list.filter((o) => clinicIds.includes(o.ambulatorioId.toString()));
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.nome.toLowerCase().includes(term) ||
          o.cognome.toLowerCase().includes(term) ||
          o.telefono.includes(term) ||
          (o.codiceFiscale && o.codiceFiscale.toLowerCase().includes(term))
      );
    }
    return list.sort((a, b) => a.cognome.localeCompare(b.cognome));
  },

  async getOwnerById(id) {
    if (shouldUseMongo()) {
      return await Owner.findById(id);
    }
    return memoryData.owners.find((o) => o._id.toString() === id.toString()) || null;
  },

  async createOwner(ownerData) {
    if (shouldUseMongo()) {
      const owner = new Owner(ownerData);
      return await owner.save();
    }
    const newOwner = {
      _id: generateId(),
      ...ownerData,
      createdAt: new Date().toISOString()
    };
    memoryData.owners.push(newOwner);
    return newOwner;
  },

  async updateOwner(id, updateData) {
    if (shouldUseMongo()) {
      return await Owner.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = memoryData.owners.findIndex((o) => o._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.owners[index] = { ...memoryData.owners[index], ...updateData };
    return memoryData.owners[index];
  },

  async deleteOwner(id) {
    if (shouldUseMongo()) {
      return await Owner.findByIdAndDelete(id);
    }
    const index = memoryData.owners.findIndex((o) => o._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.owners.splice(index, 1)[0];
  },

  // === ANIMALI / PAZIENTI (PETS) ===
  async getPets(clinicId = null, filters = {}, vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    const { search, specie, proprietarioId } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (proprietarioId) query.proprietarioId = proprietarioId;
      if (specie) query.specie = specie;
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nome: regex }, { microchip: regex }, { razza: regex }];
      }
      return await Pet.find(query).populate('proprietarioId').populate('ambulatorioId').sort({ createdAt: -1 });
    }

    let list = [...memoryData.pets];
    if (clinicIds) {
      list = list.filter((p) => clinicIds.includes(p.ambulatorioId.toString()));
    }
    if (proprietarioId) {
      list = list.filter((p) => p.proprietarioId.toString() === proprietarioId.toString());
    }
    if (specie) {
      list = list.filter((p) => p.specie === specie);
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.razza.toLowerCase().includes(term) ||
          (p.microchip && p.microchip.toLowerCase().includes(term))
      );
    }

    return list.map((p) => {
      const owner = memoryData.owners.find((o) => o._id.toString() === p.proprietarioId?.toString());
      const clinic = memoryData.clinics.find((c) => c._id.toString() === p.ambulatorioId?.toString());
      return {
        ...p,
        proprietarioId: owner || p.proprietarioId,
        ambulatorioId: clinic || p.ambulatorioId
      };
    });
  },

  async getPetById(id) {
    if (shouldUseMongo()) {
      return await Pet.findById(id).populate('proprietarioId').populate('ambulatorioId');
    }
    const pet = memoryData.pets.find((p) => p._id.toString() === id.toString());
    if (!pet) return null;
    const owner = memoryData.owners.find((o) => o._id.toString() === pet.proprietarioId?.toString());
    const clinic = memoryData.clinics.find((c) => c._id.toString() === pet.ambulatorioId?.toString());
    return {
      ...pet,
      proprietarioId: owner || pet.proprietarioId,
      ambulatorioId: clinic || pet.ambulatorioId
    };
  },

  async createPet(petData) {
    if (shouldUseMongo()) {
      const pet = new Pet(petData);
      if (petData.pesoAttuale && (!petData.storicoPeso || petData.storicoPeso.length === 0)) {
        pet.storicoPeso = [{ data: new Date(), peso: Number(petData.pesoAttuale), note: 'Peso iniziale' }];
      }
      return await (await pet.save()).populate('proprietarioId');
    }
    const storico = petData.storicoPeso || [];
    if (petData.pesoAttuale && storico.length === 0) {
      storico.push({
        data: new Date().toISOString(),
        peso: Number(petData.pesoAttuale),
        note: 'Peso iniziale'
      });
    }
    const newPet = {
      _id: generateId(),
      ...petData,
      pesoAttuale: Number(petData.pesoAttuale) || 0,
      storicoPeso: storico,
      createdAt: new Date().toISOString()
    };
    memoryData.pets.push(newPet);
    const owner = memoryData.owners.find((o) => o._id.toString() === newPet.proprietarioId?.toString());
    return { ...newPet, proprietarioId: owner || newPet.proprietarioId };
  },

  async updatePet(id, updateData) {
    if (shouldUseMongo()) {
      const pet = await Pet.findById(id);
      if (!pet) return null;
      if (updateData.pesoAttuale && Number(updateData.pesoAttuale) !== pet.pesoAttuale) {
        pet.storicoPeso.push({
          data: new Date(),
          peso: Number(updateData.pesoAttuale),
          note: updateData.pesoNote || 'Aggiornamento peso'
        });
      }
      Object.assign(pet, updateData);
      return await (await pet.save()).populate('proprietarioId');
    }

    const index = memoryData.pets.findIndex((p) => p._id.toString() === id.toString());
    if (index === -1) return null;
    const pet = memoryData.pets[index];

    if (updateData.pesoAttuale && Number(updateData.pesoAttuale) !== pet.pesoAttuale) {
      pet.storicoPeso = pet.storicoPeso || [];
      pet.storicoPeso.push({
        data: new Date().toISOString(),
        peso: Number(updateData.pesoAttuale),
        note: updateData.pesoNote || 'Aggiornamento peso'
      });
    }

    memoryData.pets[index] = { ...pet, ...updateData };
    const owner = memoryData.owners.find(
      (o) => o._id.toString() === memoryData.pets[index].proprietarioId?.toString()
    );
    return { ...memoryData.pets[index], proprietarioId: owner || memoryData.pets[index].proprietarioId };
  },

  async deletePet(id) {
    if (shouldUseMongo()) {
      return await Pet.findByIdAndDelete(id);
    }
    const index = memoryData.pets.findIndex((p) => p._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.pets.splice(index, 1)[0];
  },

  // === VISITE (VISITS) ===
  async getVisits(clinicId = null, filters = {}, vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    const { petId, data, limit } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (petId) query.animaleId = petId;
      if (data) query.data = data;
      let q = Visit.find(query).populate('animaleId').populate('veterinarioId').populate('ambulatorioId').sort({ data: -1, createdAt: -1 });
      if (limit) q = q.limit(Number(limit));
      return await q;
    }

    let list = [...memoryData.visits];
    if (clinicIds) {
      list = list.filter((v) => clinicIds.includes(v.ambulatorioId.toString()));
    }
    if (petId) {
      list = list.filter((v) => v.animaleId?.toString() === petId.toString());
    }
    if (data) {
      list = list.filter((v) => v.data === data);
    }
    list.sort((a, b) => new Date(b.data) - new Date(a.data));
    if (limit) list = list.slice(0, Number(limit));

    return list.map((v) => {
      const pet = memoryData.pets.find((p) => p._id.toString() === v.animaleId?.toString());
      const vet = memoryData.users.find((u) => u._id.toString() === v.veterinarioId?.toString());
      const clinic = memoryData.clinics.find((c) => c._id.toString() === v.ambulatorioId?.toString());
      return {
        ...v,
        animaleId: pet || v.animaleId,
        veterinarioId: vet ? { _id: vet._id, nome: vet.nome, cognome: vet.cognome } : v.veterinarioId,
        ambulatorioId: clinic || v.ambulatorioId
      };
    });
  },

  async getVisitById(id) {
    if (shouldUseMongo()) {
      return await Visit.findById(id).populate('animaleId').populate('veterinarioId').populate('ambulatorioId');
    }
    const visit = memoryData.visits.find((v) => v._id.toString() === id.toString());
    if (!visit) return null;
    const pet = memoryData.pets.find((p) => p._id.toString() === visit.animaleId?.toString());
    const vet = memoryData.users.find((u) => u._id.toString() === visit.veterinarioId?.toString());
    const clinic = memoryData.clinics.find((c) => c._id.toString() === visit.ambulatorioId?.toString());
    return {
      ...visit,
      animaleId: pet || visit.animaleId,
      veterinarioId: vet ? { _id: vet._id, nome: vet.nome, cognome: vet.cognome } : visit.veterinarioId,
      ambulatorioId: clinic || visit.ambulatorioId
    };
  },

  async createVisit(visitData) {
    if (shouldUseMongo()) {
      const visit = new Visit(visitData);
      const saved = await visit.save();
      // Se è stato registrato un peso, aggiorna lo storico dell'animale
      if (visitData.parametriVitali?.pesoRilevato) {
        await Pet.findByIdAndUpdate(visitData.animaleId, {
          pesoAttuale: visitData.parametriVitali.pesoRilevato,
          $push: {
            storicoPeso: {
              data: visitData.data || new Date(),
              peso: visitData.parametriVitali.pesoRilevato,
              note: `Rilevato in visita: ${visitData.tipoVisita}`
            }
          }
        });
      }
      return await saved.populate('animaleId');
    }

    const newVisit = {
      _id: generateId(),
      ...visitData,
      createdAt: new Date().toISOString()
    };
    memoryData.visits.push(newVisit);

    // Se è stato rilevato un peso, aggiorna lo storico peso dell'animale
    if (visitData.parametriVitali?.pesoRilevato) {
      const pet = memoryData.pets.find((p) => p._id.toString() === visitData.animaleId.toString());
      if (pet) {
        pet.pesoAttuale = Number(visitData.parametriVitali.pesoRilevato);
        pet.storicoPeso = pet.storicoPeso || [];
        pet.storicoPeso.push({
          data: visitData.data || new Date().toISOString().split('T')[0],
          peso: Number(visitData.parametriVitali.pesoRilevato),
          note: `Rilevato in visita: ${visitData.tipoVisita}`
        });
      }
    }

    const pet = memoryData.pets.find((p) => p._id.toString() === newVisit.animaleId?.toString());
    return { ...newVisit, animaleId: pet || newVisit.animaleId };
  },

  async updateVisit(id, updateData) {
    if (shouldUseMongo()) {
      return await Visit.findByIdAndUpdate(id, updateData, { new: true }).populate('animaleId');
    }
    const index = memoryData.visits.findIndex((v) => v._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.visits[index] = { ...memoryData.visits[index], ...updateData };
    const pet = memoryData.pets.find((p) => p._id.toString() === memoryData.visits[index].animaleId?.toString());
    return { ...memoryData.visits[index], animaleId: pet || memoryData.visits[index].animaleId };
  },

  async deleteVisit(id) {
    if (shouldUseMongo()) {
      return await Visit.findByIdAndDelete(id);
    }
    const index = memoryData.visits.findIndex((v) => v._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.visits.splice(index, 1)[0];
  },

  // === TERAPIE E FARMACI (THERAPIES) ===
  async getTherapies(clinicId = null, filters = {}, vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    const { petId, attiva } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (petId) query.animaleId = petId;
      if (attiva !== undefined) query.attiva = attiva === 'true' || attiva === true;
      return await Therapy.find(query).populate('animaleId').populate('visitaId').populate('ambulatorioId').sort({ dataInizio: -1 });
    }

    let list = [...memoryData.therapies];
    if (clinicIds) {
      list = list.filter((t) => clinicIds.includes(t.ambulatorioId.toString()));
    }
    if (petId) {
      list = list.filter((t) => t.animaleId?.toString() === petId.toString());
    }
    if (attiva !== undefined) {
      const isAttiva = attiva === 'true' || attiva === true;
      list = list.filter((t) => t.attiva === isAttiva);
    }

    return list.map((t) => {
      const pet = memoryData.pets.find((p) => p._id.toString() === t.animaleId?.toString());
      const clinic = memoryData.clinics.find((c) => c._id.toString() === t.ambulatorioId?.toString());
      return {
        ...t,
        animaleId: pet || t.animaleId,
        ambulatorioId: clinic || t.ambulatorioId
      };
    });
  },

  async createTherapy(therapyData) {
    if (shouldUseMongo()) {
      const therapy = new Therapy(therapyData);
      return await (await therapy.save()).populate('animaleId');
    }
    const newTherapy = {
      _id: generateId(),
      attiva: true,
      ...therapyData,
      createdAt: new Date().toISOString()
    };
    memoryData.therapies.push(newTherapy);
    const pet = memoryData.pets.find((p) => p._id.toString() === newTherapy.animaleId?.toString());
    return { ...newTherapy, animaleId: pet || newTherapy.animaleId };
  },

  async updateTherapy(id, updateData) {
    if (shouldUseMongo()) {
      return await Therapy.findByIdAndUpdate(id, updateData, { new: true }).populate('animaleId');
    }
    const index = memoryData.therapies.findIndex((t) => t._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.therapies[index] = { ...memoryData.therapies[index], ...updateData };
    const pet = memoryData.pets.find((p) => p._id.toString() === memoryData.therapies[index].animaleId?.toString());
    return { ...memoryData.therapies[index], animaleId: pet || memoryData.therapies[index].animaleId };
  },

  async deleteTherapy(id) {
    if (shouldUseMongo()) {
      return await Therapy.findByIdAndDelete(id);
    }
    const index = memoryData.therapies.findIndex((t) => t._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.therapies.splice(index, 1)[0];
  },

  // Helper calcolo stato richiamo vaccinale
  computeVaccineWarning(dataRichiamo) {
    if (!dataRichiamo) return { statoWarning: 'REGOLARE', giorniAlRichiamo: null };
    const target = new Date(dataRichiamo);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { statoWarning: 'SCADUTO', giorniAlRichiamo: diffDays, scadutoDaGiorni: Math.abs(diffDays) };
    } else if (diffDays <= 30) {
      return { statoWarning: 'IN_SCADENZA', giorniAlRichiamo: diffDays };
    } else {
      return { statoWarning: 'REGOLARE', giorniAlRichiamo: diffDays };
    }
  },

  // === PIANO VACCINALE (VACCINATIONS) ===
  async getVaccinations(clinicId = null, filters = {}, vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    const { petId, warningOnly } = filters;
    let list = [];

    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (petId) query.animaleId = petId;
      const docs = await Vaccination.find(query).populate('animaleId').populate('veterinarioId').populate('ambulatorioId').sort({ dataRichiamo: 1 });
      list = docs.map((d) => {
        const obj = d.toObject();
        const warning = this.computeVaccineWarning(obj.dataRichiamo);
        return { ...obj, ...warning };
      });
    } else {
      let filtered = [...memoryData.vaccinations];
      if (clinicIds) {
        filtered = filtered.filter((v) => clinicIds.includes(v.ambulatorioId.toString()));
      }
      if (petId) {
        filtered = filtered.filter((v) => v.animaleId?.toString() === petId.toString());
      }
      filtered.sort((a, b) => new Date(a.dataRichiamo) - new Date(b.dataRichiamo));
      list = filtered.map((v) => {
        const pet = memoryData.pets.find((p) => p._id.toString() === v.animaleId?.toString());
        const vet = memoryData.users.find((u) => u._id.toString() === v.veterinarioId?.toString());
        const clinic = memoryData.clinics.find((c) => c._id.toString() === v.ambulatorioId?.toString());
        const warning = this.computeVaccineWarning(v.dataRichiamo);
        return {
          ...v,
          animaleId: pet || v.animaleId,
          veterinarioId: vet ? { _id: vet._id, nome: vet.nome, cognome: vet.cognome } : v.veterinarioId,
          ambulatorioId: clinic || v.ambulatorioId,
          ...warning
        };
      });
    }

    if (warningOnly === 'true' || warningOnly === true) {
      return list.filter((v) => v.statoWarning === 'SCADUTO' || v.statoWarning === 'IN_SCADENZA');
    }
    return list;
  },

  async getVaccinationById(id) {
    if (shouldUseMongo()) {
      const doc = await Vaccination.findById(id).populate('animaleId').populate('veterinarioId').populate('ambulatorioId');
      if (!doc) return null;
      const obj = doc.toObject();
      return { ...obj, ...this.computeVaccineWarning(obj.dataRichiamo) };
    }
    const vac = memoryData.vaccinations.find((v) => v._id.toString() === id.toString());
    if (!vac) return null;
    const pet = memoryData.pets.find((p) => p._id.toString() === vac.animaleId?.toString());
    const warning = this.computeVaccineWarning(vac.dataRichiamo);
    return { ...vac, animaleId: pet || vac.animaleId, ...warning };
  },

  async createVaccination(vacData) {
    if (shouldUseMongo()) {
      const vac = new Vaccination(vacData);
      const saved = await (await vac.save()).populate('animaleId');
      const obj = saved.toObject();
      return { ...obj, ...this.computeVaccineWarning(obj.dataRichiamo) };
    }
    const newVac = {
      _id: generateId(),
      ...vacData,
      createdAt: new Date().toISOString()
    };
    memoryData.vaccinations.push(newVac);
    const pet = memoryData.pets.find((p) => p._id.toString() === newVac.animaleId?.toString());
    const warning = this.computeVaccineWarning(newVac.dataRichiamo);
    return { ...newVac, animaleId: pet || newVac.animaleId, ...warning };
  },

  async updateVaccination(id, updateData) {
    if (shouldUseMongo()) {
      const updated = await Vaccination.findByIdAndUpdate(id, updateData, { new: true }).populate('animaleId');
      if (!updated) return null;
      const obj = updated.toObject();
      return { ...obj, ...this.computeVaccineWarning(obj.dataRichiamo) };
    }
    const index = memoryData.vaccinations.findIndex((v) => v._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.vaccinations[index] = { ...memoryData.vaccinations[index], ...updateData };
    const pet = memoryData.pets.find((p) => p._id.toString() === memoryData.vaccinations[index].animaleId?.toString());
    const warning = this.computeVaccineWarning(memoryData.vaccinations[index].dataRichiamo);
    return { ...memoryData.vaccinations[index], animaleId: pet || memoryData.vaccinations[index].animaleId, ...warning };
  },

  async deleteVaccination(id) {
    if (shouldUseMongo()) {
      return await Vaccination.findByIdAndDelete(id);
    }
    const index = memoryData.vaccinations.findIndex((v) => v._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.vaccinations.splice(index, 1)[0];
  },

  // === AGENDA E APPUNTAMENTI (APPOINTMENTS) ===
  async getAppointments(clinicId = null, filters = {}, vetId = null) {
    const clinicIds = await this.resolveClinicFilter(clinicId, vetId);
    if (clinicIds !== null && clinicIds.length === 0) return [];

    const { data, petId, proprietarioId } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicIds) query.ambulatorioId = { $in: clinicIds };
      if (data) query.data = data;
      if (petId) query.animaleId = petId;
      if (proprietarioId) query.proprietarioId = proprietarioId;

      return await Appointment.find(query)
        .populate('animaleId')
        .populate('proprietarioId')
        .populate('ambulatorioId')
        .sort({ data: 1, oraInizio: 1 });
    }

    let list = [...memoryData.appointments];
    if (clinicIds) {
      list = list.filter((a) => clinicIds.includes(a.ambulatorioId?.toString()));
    }
    if (data) {
      list = list.filter((a) => a.data === data);
    }
    if (petId) {
      list = list.filter((a) => a.animaleId?.toString() === petId.toString());
    }
    if (proprietarioId) {
      list = list.filter((a) => a.proprietarioId?.toString() === proprietarioId.toString());
    }
    list.sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      return a.oraInizio.localeCompare(b.oraInizio);
    });

    return list.map((a) => {
      const pet = memoryData.pets.find((p) => p._id.toString() === a.animaleId?.toString());
      const owner = memoryData.owners.find((o) => o._id.toString() === a.proprietarioId?.toString());
      const clinic = memoryData.clinics.find((c) => c._id.toString() === a.ambulatorioId?.toString());
      return {
        ...a,
        animaleId: pet || a.animaleId,
        proprietarioId: owner || a.proprietarioId,
        ambulatorioId: clinic || a.ambulatorioId
      };
    });
  },

  async getAppointmentById(id) {
    if (shouldUseMongo()) {
      return await Appointment.findById(id).populate('animaleId').populate('proprietarioId').populate('ambulatorioId');
    }
    const app = memoryData.appointments.find((a) => a._id.toString() === id.toString());
    if (!app) return null;
    const pet = memoryData.pets.find((p) => p._id.toString() === app.animaleId?.toString());
    const owner = memoryData.owners.find((o) => o._id.toString() === app.proprietarioId?.toString());
    const clinic = memoryData.clinics.find((c) => c._id.toString() === app.ambulatorioId?.toString());
    return {
      ...app,
      animaleId: pet || app.animaleId,
      proprietarioId: owner || app.proprietarioId,
      ambulatorioId: clinic || app.ambulatorioId
    };
  },

  async createAppointment(appData) {
    if (shouldUseMongo()) {
      const app = new Appointment(appData);
      return await (await app.save()).populate('animaleId');
    }
    const newApp = {
      _id: generateId(),
      stato: 'Prenotato',
      ...appData,
      createdAt: new Date().toISOString()
    };
    memoryData.appointments.push(newApp);
    const pet = memoryData.pets.find((p) => p._id.toString() === newApp.animaleId?.toString());
    const owner = memoryData.owners.find((o) => o._id.toString() === newApp.proprietarioId?.toString());
    return { ...newApp, animaleId: pet || newApp.animaleId, proprietarioId: owner || newApp.proprietarioId };
  },

  async updateAppointment(id, updateData) {
    if (shouldUseMongo()) {
      return await Appointment.findByIdAndUpdate(id, updateData, { new: true }).populate('animaleId');
    }
    const index = memoryData.appointments.findIndex((a) => a._id.toString() === id.toString());
    if (index === -1) return null;
    memoryData.appointments[index] = { ...memoryData.appointments[index], ...updateData };
    const pet = memoryData.pets.find((p) => p._id.toString() === memoryData.appointments[index].animaleId?.toString());
    const owner = memoryData.owners.find((o) => o._id.toString() === memoryData.appointments[index].proprietarioId?.toString());
    return { ...memoryData.appointments[index], animaleId: pet || memoryData.appointments[index].animaleId, proprietarioId: owner || memoryData.appointments[index].proprietarioId };
  },

  async deleteAppointment(id) {
    if (shouldUseMongo()) {
      return await Appointment.findByIdAndDelete(id);
    }
    const index = memoryData.appointments.findIndex((a) => a._id.toString() === id.toString());
    if (index === -1) return null;
    return memoryData.appointments.splice(index, 1)[0];
  },

  // === STATISTICHE DASHBOARD ===
  async getDashboardStats(clinicId = null, vetId = null) {
    if (vetId) {
      const allowedIds = await this.getUserClinicIds(vetId);
      if (allowedIds.length === 0) {
        return {
          totalePazienti: 0,
          totaleProprietari: 0,
          visiteOggi: 0,
          terapieAttive: 0,
          appuntamentiOggiCount: 0,
          vacciniWarningCount: 0,
          ultimeVisite: [],
          terapieInScadenza: [],
          vacciniInScadenza: [],
          appuntamentiOggi: []
        };
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const pets = await this.getPets(clinicId, {}, vetId);
    const owners = await this.getOwners(clinicId, null, vetId);
    const visits = await this.getVisits(clinicId, {}, vetId);
    const therapies = await this.getTherapies(clinicId, { attiva: true }, vetId);
    const vaccinations = await this.getVaccinations(clinicId, {}, vetId);
    const appointments = await this.getAppointments(clinicId, { data: today }, vetId);

    const visitsToday = visits.filter((v) => {
      const vDate = typeof v.data === 'string' ? v.data.split('T')[0] : v.data?.toISOString().split('T')[0];
      return vDate === today;
    });

    const vaccineWarnings = vaccinations.filter(
      (v) => v.statoWarning === 'SCADUTO' || v.statoWarning === 'IN_SCADENZA'
    );

    return {
      totalePazienti: pets.length,
      totaleProprietari: owners.length,
      visiteOggi: visitsToday.length,
      terapieAttive: therapies.length,
      appuntamentiOggiCount: appointments.length,
      vacciniWarningCount: vaccineWarnings.length,
      ultimeVisite: visits.slice(0, 5),
      terapieInScadenza: therapies.slice(0, 5),
      vacciniInScadenza: vaccineWarnings.slice(0, 6),
      appuntamentiOggi: appointments
    };
  }
};
