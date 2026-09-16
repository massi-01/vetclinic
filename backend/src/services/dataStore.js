import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Owner from '../models/Owner.js';
import Pet from '../models/Pet.js';
import Visit from '../models/Visit.js';
import Therapy from '../models/Therapy.js';
import { isMongoConnected } from '../config/db.js';

// In-Memory Database di fallback
let memoryData = {
  users: [],
  clinics: [],
  owners: [],
  pets: [],
  visits: [],
  therapies: []
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

  // Inizializza memoria
  memoryData = {
    users,
    clinics,
    owners,
    pets,
    visits,
    therapies
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
        console.log('✅ MongoDB popolato con successo!');
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

  // === AMBULATORI / CLINICHE ===
  async getClinics(vetId = null) {
    if (shouldUseMongo()) {
      const query = vetId ? { veterinari: vetId } : {};
      return await Clinic.find(query);
    }
    if (vetId) {
      return memoryData.clinics.filter((c) =>
        c.veterinari?.map((v) => v.toString()).includes(vetId.toString())
      );
    }
    return [...memoryData.clinics];
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

  // === PROPRIETARI (OWNERS) ===
  async getOwners(clinicId = null, search = '') {
    if (shouldUseMongo()) {
      const query = {};
      if (clinicId) query.ambulatorioId = clinicId;
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nome: regex }, { cognome: regex }, { telefono: regex }, { codiceFiscale: regex }];
      }
      return await Owner.find(query).sort({ cognome: 1, nome: 1 });
    }
    let list = [...memoryData.owners];
    if (clinicId) {
      list = list.filter((o) => o.ambulatorioId.toString() === clinicId.toString());
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
  async getPets(clinicId = null, filters = {}) {
    const { search, specie, proprietarioId } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicId) query.ambulatorioId = clinicId;
      if (proprietarioId) query.proprietarioId = proprietarioId;
      if (specie) query.specie = specie;
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ nome: regex }, { microchip: regex }, { razza: regex }];
      }
      return await Pet.find(query).populate('proprietarioId').populate('ambulatorioId').sort({ createdAt: -1 });
    }

    let list = [...memoryData.pets];
    if (clinicId) {
      list = list.filter((p) => p.ambulatorioId.toString() === clinicId.toString());
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
  async getVisits(clinicId = null, filters = {}) {
    const { petId, data, limit } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicId) query.ambulatorioId = clinicId;
      if (petId) query.animaleId = petId;
      if (data) query.data = data;
      let q = Visit.find(query).populate('animaleId').populate('veterinarioId').populate('ambulatorioId').sort({ data: -1, createdAt: -1 });
      if (limit) q = q.limit(Number(limit));
      return await q;
    }

    let list = [...memoryData.visits];
    if (clinicId) {
      list = list.filter((v) => v.ambulatorioId.toString() === clinicId.toString());
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
  async getTherapies(clinicId = null, filters = {}) {
    const { petId, attiva } = filters;
    if (shouldUseMongo()) {
      const query = {};
      if (clinicId) query.ambulatorioId = clinicId;
      if (petId) query.animaleId = petId;
      if (attiva !== undefined) query.attiva = attiva === 'true' || attiva === true;
      return await Therapy.find(query).populate('animaleId').populate('visitaId').populate('ambulatorioId').sort({ dataInizio: -1 });
    }

    let list = [...memoryData.therapies];
    if (clinicId) {
      list = list.filter((t) => t.ambulatorioId.toString() === clinicId.toString());
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

  // === STATISTICHE DASHBOARD ===
  async getDashboardStats(clinicId = null) {
    const today = new Date().toISOString().split('T')[0];
    const pets = await this.getPets(clinicId);
    const owners = await this.getOwners(clinicId);
    const visits = await this.getVisits(clinicId);
    const therapies = await this.getTherapies(clinicId, { attiva: true });

    const visitsToday = visits.filter((v) => {
      const vDate = typeof v.data === 'string' ? v.data.split('T')[0] : v.data?.toISOString().split('T')[0];
      return vDate === today;
    });

    return {
      totalePazienti: pets.length,
      totaleProprietari: owners.length,
      visiteOggi: visitsToday.length,
      terapieAttive: therapies.length,
      ultimeVisite: visits.slice(0, 5),
      terapieInScadenza: therapies.slice(0, 5)
    };
  }
};
