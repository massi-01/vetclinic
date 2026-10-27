import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Owner from '../models/Owner.js';
import Pet from '../models/Pet.js';
import Appointment from '../models/Appointment.js';
import Visit from '../models/Visit.js';
import Vaccination from '../models/Vaccination.js';
import Therapy from '../models/Therapy.js';
import ClinicRequest from '../models/ClinicRequest.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERRORE: MONGODB_URI non è configurata in .env');
  process.exit(1);
}

const clinicDefinitions = [
  {
    nome: 'Clinica Veterinaria San Francesco',
    indirizzo: 'Via Roma 45',
    citta: 'Milano',
    cap: '20121',
    telefono: '02 89401234',
    email: 'info@clinicasanfrancesco.it',
    partitaIva: 'IT09876543210',
    codiceFiscale: '09876543210',
    orariApertura: 'H24 - 7 giorni su 7',
    prontoSoccorso24h: true,
    coloreTema: '#0d9488'
  },
  {
    nome: 'Ambulatorio Veterinario Navigli',
    indirizzo: 'Ripa di Porta Ticinese 12',
    citta: 'Milano',
    cap: '20143',
    telefono: '02 58109876',
    email: 'contatti@ambulatorionavigli.it',
    partitaIva: 'IT01234567890',
    codiceFiscale: '01234567890',
    orariApertura: 'Lun - Ven: 09:00 - 19:30 | Sab: 09:00 - 13:00',
    prontoSoccorso24h: false,
    coloreTema: '#0284c7'
  },
  {
    nome: 'Ospedale Veterinario Roma Capitale',
    indirizzo: 'Viale Trastevere 110',
    citta: 'Roma',
    cap: '00153',
    telefono: '06 58901234',
    email: 'emergenze@ospedaleromacapitale.it',
    partitaIva: 'IT05432198765',
    codiceFiscale: '05432198765',
    orariApertura: 'H24 - Sempre Aperti con Triage Continuo',
    prontoSoccorso24h: true,
    coloreTema: '#059669'
  },
  {
    nome: 'Centro Veterinario Torinese',
    indirizzo: 'Corso Francia 88',
    citta: 'Torino',
    cap: '10138',
    telefono: '011 4329876',
    email: 'info@centrovettorinese.it',
    partitaIva: 'IT03456789012',
    codiceFiscale: '03456789012',
    orariApertura: 'Lun - Sab: 08:30 - 20:00',
    prontoSoccorso24h: false,
    coloreTema: '#4f46e5'
  },
  {
    nome: 'Clinica Veterinaria Felsinea',
    indirizzo: "Via dell'Indipendenza 54",
    citta: 'Bologna',
    cap: '40121',
    telefono: '051 2345678',
    email: 'segreteria@clinicafelsinea.it',
    partitaIva: 'IT04567890123',
    codiceFiscale: '04567890123',
    orariApertura: 'H24 - Chirurgia e Diagnostica Avanzata',
    prontoSoccorso24h: true,
    coloreTema: '#7c3aed'
  },
  {
    nome: 'Ambulatorio Rinascimento',
    indirizzo: 'Borgo San Frediano 29',
    citta: 'Firenze',
    cap: '50124',
    telefono: '055 2109876',
    email: 'cura@ambulatoriorinascimento.it',
    partitaIva: 'IT06789012345',
    codiceFiscale: '06789012345',
    orariApertura: 'Lun - Ven: 09:00 - 19:00 | Sab: 09:00 - 13:00',
    prontoSoccorso24h: false,
    coloreTema: '#d97706'
  },
  {
    nome: 'Pronto Soccorso Veterinario Vesuvio',
    indirizzo: 'Corso Umberto I 140',
    citta: 'Napoli',
    cap: '80138',
    telefono: '081 5543210',
    email: 'info@soccorsovesuvio.it',
    partitaIva: 'IT07890123456',
    codiceFiscale: '07890123456',
    orariApertura: 'H24 - Terapia Intensiva e Ricovero',
    prontoSoccorso24h: true,
    coloreTema: '#e11d48'
  },
  {
    nome: 'Clinica Veterinaria San Marco',
    indirizzo: 'Stradone San Fermo 18',
    citta: 'Verona',
    cap: '37121',
    telefono: '045 8001234',
    email: 'reception@sanmarcovet.it',
    partitaIva: 'IT08901234567',
    codiceFiscale: '08901234567',
    orariApertura: 'Lun - Sab: 08:30 - 19:30',
    prontoSoccorso24h: false,
    coloreTema: '#0891b2'
  },
  {
    nome: 'Centro Medico Veterinario Lanterna',
    indirizzo: 'Via XX Settembre 32',
    citta: 'Genova',
    cap: '16121',
    telefono: '010 5678901',
    email: 'info@lanternavet.it',
    partitaIva: 'IT09012345678',
    codiceFiscale: '09012345678',
    orariApertura: 'Lun - Ven: 09:00 - 19:00 | Sab: 09:00 - 12:30',
    prontoSoccorso24h: false,
    coloreTema: '#2563eb'
  },
  {
    nome: 'Clinica Veterinaria Panormus',
    indirizzo: 'Via Libertà 95',
    citta: 'Palermo',
    cap: '90143',
    telefono: '091 6254321',
    email: 'assistenza@panormusvet.it',
    partitaIva: 'IT09123456789',
    codiceFiscale: '09123456789',
    orariApertura: 'H24 - Degenza e Pronto Intervento',
    prontoSoccorso24h: true,
    coloreTema: '#ea580c'
  }
];

// Almeno due veterinari specifici per ogni struttura + Dr. Rossi + Massi Gatta
const vetPerClinicData = [
  // 0: Milano San Francesco
  [
    { nome: 'Elena', cognome: 'Bianchi', email: 'elena.bianchi@vetclinic.it', albo: 'MI-7102', tel: '+39 347 2233441', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Luca', cognome: 'Moretti', email: 'luca.moretti@vetclinic.it', albo: 'MI-8940', tel: '+39 348 3344552', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' }
  ],
  // 1: Milano Navigli
  [
    { nome: 'Matteo', cognome: 'Villa', email: 'matteo.villa@vetclinic.it', albo: 'MI-6520', tel: '+39 349 4455663', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Chiara', cognome: 'Colombo', email: 'chiara.colombo@vetclinic.it', albo: 'MI-9104', tel: '+39 333 5566774', avatar: 'https://images.unsplash.com/photo-1594824813590-482a8bf327b7?w=150&auto=format&fit=crop&q=80' }
  ],
  // 2: Roma Capitale
  [
    { nome: 'Valerio', cognome: 'De Angelis', email: 'valerio.deangelis@vetclinic.it', albo: 'RM-5421', tel: '+39 340 6677885', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Flavia', cognome: 'Mancini', email: 'flavia.mancini@vetclinic.it', albo: 'RM-6632', tel: '+39 338 7788996', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
  ],
  // 3: Torino
  [
    { nome: 'Andrea', cognome: 'Leone', email: 'andrea.leone@vetclinic.it', albo: 'TO-4819', tel: '+39 345 8899007', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Simona', cognome: 'Rinaldi', email: 'simona.rinaldi@vetclinic.it', albo: 'TO-5930', tel: '+39 339 9900118', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80' }
  ],
  // 4: Bologna
  [
    { nome: 'Filippo', cognome: 'Galli', email: 'filippo.galli@vetclinic.it', albo: 'BO-7741', tel: '+39 331 1122339', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Martina', cognome: 'Ferri', email: 'martina.ferri@vetclinic.it', albo: 'BO-8852', tel: '+39 334 2233440', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
  ],
  // 5: Firenze
  [
    { nome: 'Lorenzo', cognome: 'Neri', email: 'lorenzo.neri@vetclinic.it', albo: 'FI-3315', tel: '+39 347 3344551', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Beatrice', cognome: 'Ricci', email: 'beatrice.ricci@vetclinic.it', albo: 'FI-4426', tel: '+39 348 4455662', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }
  ],
  // 6: Napoli
  [
    { nome: 'Salvatore', cognome: 'Esposito', email: 'salvatore.esposito@vetclinic.it', albo: 'NA-9021', tel: '+39 349 5566773', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Carmela', cognome: 'Russo', email: 'carmela.russo@vetclinic.it', albo: 'NA-9132', tel: '+39 333 6677884', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80' }
  ],
  // 7: Verona
  [
    { nome: 'Alberto', cognome: 'Tommasi', email: 'alberto.tommasi@vetclinic.it', albo: 'VR-2145', tel: '+39 340 7788995', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Silvia', cognome: 'Ferrari', email: 'silvia.ferrari@vetclinic.it', albo: 'VR-3256', tel: '+39 338 8899006', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80' }
  ],
  // 8: Genova
  [
    { nome: 'Paolo', cognome: 'Parodi', email: 'paolo.parodi@vetclinic.it', albo: 'GE-4367', tel: '+39 345 9900117', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Francesca', cognome: 'Costa', email: 'francesca.costa@vetclinic.it', albo: 'GE-5478', tel: '+39 339 1122338', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80' }
  ],
  // 9: Palermo
  [
    { nome: 'Giuseppe', cognome: 'Caruso', email: 'giuseppe.caruso@vetclinic.it', albo: 'PA-6589', tel: '+39 331 2233449', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { nome: 'Valentina', cognome: 'Romano', email: 'valentina.romano@vetclinic.it', albo: 'PA-7690', tel: '+39 334 3344550', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
  ]
];

// Template proprietari
const ownerTemplates = [
  { nome: 'Mario', cognome: 'Rossi', cf: 'RSSMRA75C10F205A', tel: '+39 333 1122331', email: 'mario.rossi75@gmail.com', indirizzo: 'Via Garibaldi 14', note: 'Proprietario disponibile al mattino' },
  { nome: 'Laura', cognome: 'Bianchi', cf: 'BNCLRA82E45H501Z', tel: '+39 335 2233442', email: 'laura.bianchi@virgilio.it', indirizzo: 'Corso Umberto 25', note: 'Preferisce contatti telefonici diretti' },
  { nome: 'Giovanni', cognome: 'Verdi', cf: 'VRDGVN68H15L219K', tel: '+39 347 3344553', email: 'g.verdi@libero.it', indirizzo: 'Via Mazzini 8', note: 'Puntuale con i richiami vaccinali' },
  { nome: 'Federica', cognome: 'Conti', cf: 'CNTFDC90A41D612T', tel: '+39 349 4455664', email: 'fede.conti90@hotmail.it', indirizzo: 'Piazza Dante 3', note: 'Molto apprensiva per ogni sintomo' },
  { nome: 'Simone', cognome: 'Galli', cf: 'GLLSMN88L22A944J', tel: '+39 338 5566775', email: 'simone.galli@fastwebnet.it', indirizzo: 'Via Roma 102', note: 'Disponibile per controlli serali' },
  { nome: 'Serena', cognome: 'Martini', cf: 'MRTSRN93M55F839W', tel: '+39 340 6677886', email: 'serena.martini@outlook.com', indirizzo: 'Viale dei Mille 47', note: 'Richiede sempre referti in PDF via email' },
  { nome: 'Roberto', cognome: 'De Luca', cf: 'DLCRRT79P18H703B', tel: '+39 331 7788997', email: 'roberto.deluca@tiscali.it', indirizzo: 'Via Cavour 19', note: 'Pagamenti sempre immediati con carta' },
  { nome: 'Elena', cognome: 'Santoro', cf: 'SNTLNE85B62L736P', tel: '+39 334 8899008', email: 'elena.santoro@yahoo.it', indirizzo: 'Corso Vittorio Emanuele 88', note: 'Ha due animali in famiglia' }
];

// Template animali (11 animali per clinica = 110 animali)
const petTemplates = [
  {
    nome: 'Thor',
    specie: 'Cane',
    razza: 'Golden Retriever',
    sesso: 'Maschio',
    anniFa: 3,
    peso: 33.2,
    colore: 'Miele dorato',
    segni: 'Macchia chiara sul petto',
    allergie: ['Pollo'],
    note: 'Soggetto socievole e docile. Nessuna patologia cronica accertata.',
    fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Luna',
    specie: 'Gatto',
    razza: 'Certosino',
    sesso: 'Femmina Sterilizzata',
    anniFa: 2,
    peso: 4.1,
    colore: 'Grigio fumo uniforme',
    segni: 'Occhi ambrati luminosi',
    allergie: [],
    note: 'Tendenza a cistite idiopatica in condizioni di stress.',
    fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Biscotto',
    specie: 'Coniglio',
    razza: 'Ariete Nano',
    sesso: 'Maschio Castrato',
    anniFa: 1.5,
    peso: 1.8,
    colore: 'Marrone e fulvo',
    segni: 'Orecchie lunghe cascanti',
    allergie: [],
    note: 'Dieta ricca di fieno timothy, controllo periodico dentatura.',
    fotoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Simba',
    specie: 'Gatto',
    razza: 'Europeo Tigrato',
    sesso: 'Maschio Castrato',
    anniFa: 4,
    peso: 5.3,
    colore: 'Tigrato grigio e nero',
    segni: 'Piccolo taglio sull orecchio destro',
    allergie: ['Cereali'],
    note: 'Gatto molto vivace, vive parzialmente in giardino.',
    fotoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Maya',
    specie: 'Cane',
    razza: 'Border Collie',
    sesso: 'Femmina',
    anniFa: 2.5,
    peso: 19.4,
    colore: 'Bianco e nero',
    segni: 'Collare a pettorina verde fluo',
    allergie: [],
    note: 'Attività sportiva agility dog, cuore e muscoli in perfetto stato.',
    fotoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Rocky',
    specie: 'Cane',
    razza: 'Bulldog Francese',
    sesso: 'Maschio',
    anniFa: 3.5,
    peso: 12.8,
    colore: 'Fulvo con maschera nera',
    segni: 'Coda corta a cavatappi',
    allergie: ['Graminacee'],
    note: 'Sindrome brachicefalica di grado lieve; evitare sforzi nelle ore calde.',
    fotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Oliver',
    specie: 'Gatto',
    razza: 'Maine Coon',
    sesso: 'Maschio Castrato',
    anniFa: 5,
    peso: 8.4,
    colore: 'Tabby rosso brillante',
    segni: 'Pelo lungo folto e ciuffi sulle orecchie',
    allergie: [],
    note: 'Screening ecocardiografico per HCM eseguito con esito negativo.',
    fotoUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Kira',
    specie: 'Cane',
    razza: 'Pastore Tedesco',
    sesso: 'Femmina Sterilizzata',
    anniFa: 6,
    peso: 29.5,
    colore: 'Nero focato',
    segni: 'Mantello compatto lucido',
    allergie: [],
    note: 'Integrazione con condroprotettori per prevenzione articolare.',
    fotoUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Milo',
    specie: 'Cane',
    razza: 'Barboncino Toy',
    sesso: 'Maschio',
    anniFa: 1.8,
    peso: 3.6,
    colore: 'Albicocca',
    segni: 'Taglio a leoncino curato',
    allergie: ['Carne di manzo'],
    note: 'Soggetto socievole, dentatura da latte caduta regolarmente.',
    fotoUrl: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Zoe',
    specie: 'Gatto',
    razza: 'Siamese',
    sesso: 'Femmina',
    anniFa: 2,
    peso: 3.7,
    colore: 'Seal Point',
    segni: 'Occhi azzurri zaffiro profondi',
    allergie: [],
    note: 'Molto vocale e attiva. Esame FIV/FeLV negativo.',
    fotoUrl: 'https://images.unsplash.com/photo-1513360309081-36f20ca480d0?w=400&auto=format&fit=crop&q=80'
  },
  {
    nome: 'Igor',
    specie: 'Rettile',
    razza: 'Drago Barbuto (Pogona Vitticeps)',
    sesso: 'Maschio',
    anniFa: 2,
    peso: 0.42,
    colore: 'Arancione sfumato',
    segni: 'Barba espandibile scura',
    allergie: [],
    note: 'Terrario riscaldato a 38C basking spot. Appetito vorace con grilli e verdure.',
    fotoUrl: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=400&auto=format&fit=crop&q=80'
  }
];

export async function runSeed() {
  console.log('🔄 Connessione a MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connesso a MongoDB!');

  console.log('🧹 Pulizia delle collezioni cliniche per ricostruzione completa...');
  await Clinic.deleteMany({});
  await Owner.deleteMany({});
  await Pet.deleteMany({});
  await Appointment.deleteMany({});
  await Visit.deleteMany({});
  await Vaccination.deleteMany({});
  await Therapy.deleteMany({});
  await ClinicRequest.deleteMany({});
  // Rimuovi utenti veterinari generati automaticamente precedentemente
  await User.deleteMany({ email: { $nin: ['dr.rossi@vetclinic.it', 'massi.gatta@gmail.com'] } });

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Assicurati che Dr. Marco Rossi esista
  let drRossi = await User.findOne({ email: 'dr.rossi@vetclinic.it' });
  if (!drRossi) {
    drRossi = new User({
      nome: 'Marco',
      cognome: 'Rossi',
      email: 'dr.rossi@vetclinic.it',
      password: hashedPassword,
      telefono: '+39 347 1234567',
      codiceAlbo: 'MI-8492',
      ruolo: 'veterinario',
      ambulatori: [],
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
    });
    await drRossi.save();
  }

  // 2. Assicurati che Massimiliano Gatta esista come Amministratore / Veterinario
  let massiUser = await User.findOne({ email: 'massi.gatta@gmail.com' });
  if (!massiUser) {
    massiUser = new User({
      nome: 'Massimiliano Nunzio',
      cognome: 'Gatta',
      email: 'massi.gatta@gmail.com',
      password: hashedPassword,
      telefono: '+39 333 4455667',
      codiceAlbo: 'MI-9901',
      ruolo: 'amministratore',
      ambulatori: [],
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
    });
    await massiUser.save();
  }

  console.log(`👨‍⚕️ Veterinario Primario: Dr. ${drRossi.nome} ${drRossi.cognome} (${drRossi.email})`);

  // Creiamo tutti i veterinari dedicati
  const createdVetsByClinic = [];
  for (let cIdx = 0; cIdx < clinicDefinitions.length; cIdx++) {
    const vetsForThisClinic = [];
    const vetDefs = vetPerClinicData[cIdx];
    for (const vDef of vetDefs) {
      let vet = await User.findOne({ email: vDef.email });
      if (!vet) {
        vet = new User({
          nome: vDef.nome,
          cognome: vDef.cognome,
          email: vDef.email,
          password: hashedPassword,
          telefono: vDef.tel,
          codiceAlbo: vDef.albo,
          ruolo: 'veterinario',
          ambulatori: [],
          avatarUrl: vDef.avatar
        });
        await vet.save();
      }
      vetsForThisClinic.push(vet);
    }
    createdVetsByClinic.push(vetsForThisClinic);
  }

  // Creiamo le 10 Strutture Cliniche
  const createdClinics = [];
  const allClinicIds = [];

  for (let i = 0; i < clinicDefinitions.length; i++) {
    const cDef = clinicDefinitions[i];
    const dedicatedVets = createdVetsByClinic[i];
    // Includiamo sempre i 2 veterinari dedicati + Dr. Rossi (così Dr. Rossi ha accesso a tutte le strutture)
    const vetIds = [
      ...dedicatedVets.map(v => v._id),
      drRossi._id
    ];

    const clinic = new Clinic({
      ...cDef,
      veterinari: vetIds,
      creatoreId: drRossi._id
    });
    await clinic.save();
    createdClinics.push(clinic);
    allClinicIds.push(clinic._id);

    // Assegna la clinica ai veterinari dedicati
    for (const v of dedicatedVets) {
      if (!v.ambulatori.includes(clinic._id)) {
        v.ambulatori.push(clinic._id);
        await v.save();
      }
    }
  }

  // Aggiorna Dr. Rossi e Massi con tutte le 10 cliniche
  drRossi.ambulatori = allClinicIds;
  await drRossi.save();

  massiUser.ambulatori = allClinicIds;
  await massiUser.save();

  console.log(`🏥 Create con successo ${createdClinics.length} strutture veterinarie.`);

  // Date per oggi e storico
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  const getPastDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const getFutureDateStr = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  let totalOwners = 0;
  let totalPets = 0;
  let totalAppointments = 0;
  let totalVisits = 0;
  let totalVaccinations = 0;
  let totalTherapies = 0;

  // Popolamento per ogni clinica:
  // - 8 proprietari
  // - 11 animali
  // - per ogni animale appuntamenti passati completati con visita clinica, appuntamenti oggi/futuri, vaccini e terapie
  for (let cIdx = 0; cIdx < createdClinics.length; cIdx++) {
    const clinic = createdClinics[cIdx];
    const dedicatedVets = createdVetsByClinic[cIdx];
    const primaryVet = dedicatedVets[0] || drRossi;
    const secondaryVet = dedicatedVets[1] || drRossi;

    console.log(`📍 Popolamento [${clinic.nome}] (${clinic.citta})...`);

    // 8 Proprietari per clinica
    const clinicOwners = [];
    for (let oIdx = 0; oIdx < ownerTemplates.length; oIdx++) {
      const oTpl = ownerTemplates[oIdx];
      const owner = new Owner({
        nome: oTpl.nome,
        cognome: oTpl.cognome,
        codiceFiscale: oTpl.cf.slice(0, 11) + String(cIdx).padStart(2, '0') + oTpl.cf.slice(13),
        telefono: oTpl.tel,
        email: `${oTpl.nome.toLowerCase()}.${oTpl.cognome.toLowerCase()}_c${cIdx + 1}@email.it`,
        indirizzo: oTpl.indirizzo,
        citta: clinic.citta,
        note: oTpl.note,
        ambulatorioId: clinic._id
      });
      await owner.save();
      clinicOwners.push(owner);
      totalOwners++;
    }

    // 11 Animali per clinica (almeno 10 animali per struttura garantiti)
    const clinicPets = [];
    for (let pIdx = 0; pIdx < petTemplates.length; pIdx++) {
      const pTpl = petTemplates[pIdx];
      const owner = clinicOwners[pIdx % clinicOwners.length];

      // Data di nascita calcolata
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - Math.round(pTpl.anniFa * 12));

      // Storico pesi evolutivo (2-3 pesate storiche)
      const storicoPeso = [
        {
          data: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          peso: Number((pTpl.peso * 0.95).toFixed(1)),
          note: 'Controllo semestrale'
        },
        {
          data: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          peso: Number((pTpl.peso * 0.98).toFixed(1)),
          note: 'Visita periodica di controllo'
        },
        {
          data: new Date(),
          peso: pTpl.peso,
          note: 'Peso rilevato di recente'
        }
      ];

      const microchip = `380260${String(cIdx + 1).padStart(2, '0')}${String(pIdx + 1).padStart(3, '0')}${Math.floor(1000 + Math.random() * 9000)}`;

      const pet = new Pet({
        nome: pTpl.nome,
        specie: pTpl.specie,
        razza: pTpl.razza,
        sesso: pTpl.sesso,
        dataNascita: birthDate,
        microchip: microchip,
        pesoAttuale: pTpl.peso,
        storicoPeso: storicoPeso,
        coloreMantello: pTpl.colore,
        segniParticolari: pTpl.segni,
        allergie: pTpl.allergie,
        noteCliniche: pTpl.note,
        fotoUrl: pTpl.fotoUrl,
        proprietarioId: owner._id,
        ambulatorioId: clinic._id,
        stato: 'Attivo'
      });
      await pet.save();
      clinicPets.push(pet);
      totalPets++;

      // ==========================================
      // STORICO: 2 Appuntamenti Passati + 2 Visite Cliniche Complete per ogni animale
      // ==========================================
      const assignedVet = (pIdx % 2 === 0) ? primaryVet : secondaryVet;

      // 1° Appuntamento e Visita nel passato (~45 giorni fa)
      const pastDate1 = getPastDateStr(45 + (pIdx % 10));
      const pastApp1 = new Appointment({
        data: pastDate1,
        oraInizio: '10:00',
        oraFine: '10:30',
        durataMinuti: 30,
        tipoPrestazione: 'Visita Generale',
        motivo: 'Visita semestrale di controllo e check-up generale',
        stato: 'Completato',
        note: 'Paziente in buono stato di nutrizione e salute.',
        animaleId: pet._id,
        proprietarioId: owner._id,
        veterinarioId: assignedVet._id,
        ambulatorioId: clinic._id
      });
      await pastApp1.save();
      totalAppointments++;

      const visit1 = new Visit({
        data: new Date(pastDate1),
        ora: '10:00',
        tipoVisita: 'Controllo Generale',
        motivo: 'Visita semestrale di controllo e check-up generale',
        anamnesi: 'Nessun sintomo patologico riferito dal proprietario. Appetito e livelli di energia ottimali.',
        esameObiettivo: 'Mucose rosee, idratazione conservata, linfonodi esplorabili nella norma. Auscultazione cardiorespiratoria priva di reperti stetoacustici patologici.',
        diagnosi: 'Soggetto sano in ottimo stato di salute e accrescimento.',
        parametriVitali: {
          temperatura: 38.4,
          frequenzaCardiaca: pTpl.specie === 'Gatto' ? 140 : 92,
          frequenzaRespiratoria: 24,
          pesoRilevato: Number((pTpl.peso * 0.98).toFixed(1))
        },
        note: 'Prossimo richiamo fissato secondo calendario profilattico.',
        stato: 'Completata',
        animaleId: pet._id,
        veterinarioId: assignedVet._id,
        ambulatorioId: clinic._id,
        appuntamentoId: pastApp1._id
      });
      await visit1.save();
      pastApp1.visitaId = visit1._id;
      await pastApp1.save();
      totalVisits++;

      // 2° Appuntamento e Visita nel passato (~15 giorni fa)
      const pastDate2 = getPastDateStr(15 + (pIdx % 7));
      const pastApp2 = new Appointment({
        data: pastDate2,
        oraInizio: '15:30',
        oraFine: '16:00',
        durataMinuti: 30,
        tipoPrestazione: pIdx % 3 === 0 ? 'Vaccinazione' : 'Controllo Post-Operatorio',
        motivo: pIdx % 3 === 0 ? 'Richiamo vaccino annuale profilattico' : 'Controllo dermatologico e pulizia condotti auricolari',
        stato: 'Completato',
        note: 'Trattamento eseguito regolarmente senza complicazioni.',
        animaleId: pet._id,
        proprietarioId: owner._id,
        veterinarioId: assignedVet._id,
        ambulatorioId: clinic._id
      });
      await pastApp2.save();
      totalAppointments++;

      const visit2 = new Visit({
        data: new Date(pastDate2),
        ora: '15:30',
        tipoVisita: pIdx % 3 === 0 ? 'Vaccinazione' : 'Visita Specialistica',
        motivo: pIdx % 3 === 0 ? 'Richiamo vaccino annuale profilattico' : 'Controllo dermatologico e condotti auricolari',
        anamnesi: 'Lieve prurito auricolare riferito negli ultimi 4 giorni.',
        esameObiettivo: 'Otoscopia: lieve iperemia bilaterale con modesto accumulo ceruminoso. Membrana timpanica integra.',
        diagnosi: pIdx % 3 === 0 ? 'Profilassi vaccinale completata' : 'Otite ceruminosa lieve bilaterale',
        parametriVitali: {
          temperatura: 38.6,
          frequenzaCardiaca: pTpl.specie === 'Gatto' ? 145 : 96,
          frequenzaRespiratoria: 22,
          pesoRilevato: pTpl.peso
        },
        note: 'Istruito il proprietario sulla corretta detersione auricolare.',
        stato: 'Completata',
        animaleId: pet._id,
        veterinarioId: assignedVet._id,
        ambulatorioId: clinic._id,
        appuntamentoId: pastApp2._id
      });
      await visit2.save();
      pastApp2.visitaId = visit2._id;
      await pastApp2.save();
      totalVisits++;

      // ==========================================
      // VACCINAZIONE
      // ==========================================
      const isExpired = pIdx === 1 || pIdx === 5; // Qualche vaccino scaduto per allerta visiva
      const isUpcoming = pIdx === 2 || pIdx === 7; // Qualche vaccino in scadenza a breve
      const somministrazione = new Date(Date.now() - (isExpired ? 400 : isUpcoming ? 350 : 180) * 24 * 60 * 60 * 1000);
      const richiamo = new Date(somministrazione);
      richiamo.setFullYear(richiamo.getFullYear() + 1);

      const vaccination = new Vaccination({
        nomeVaccino: pet.specie === 'Cane' ? 'Nobivac DHPPi + Lepto 4' : pet.specie === 'Gatto' ? 'Purevax RCP FeLV' : 'Cunivak Myxo-RHD',
        categoria: pIdx % 2 === 0 ? 'Core / Polivalente' : 'Richiamo Annuale',
        numeroLotto: `LT${Math.floor(10000 + Math.random() * 90000)}`,
        dataSomministrazione: somministrazione,
        dataRichiamo: richiamo,
        note: isExpired ? 'Richiamo scaduto da oltre 30 giorni: sollecitare il proprietario.' : 'Somministrazione regolare sottocutanea, nessuna reazione avversa.',
        animaleId: pet._id,
        veterinarioId: assignedVet._id,
        ambulatorioId: clinic._id
      });
      await vaccination.save();
      totalVaccinations++;

      // ==========================================
      // TERAPIA (per alcuni animali, es. 4 per clinica)
      // ==========================================
      if (pIdx < 4) {
        const therapy = new Therapy({
          nomeFarmaco: pIdx === 0 ? 'Synulox (Amoxicillina + Acido Clavulanico)' : pIdx === 1 ? 'Onsior (Robenacoxib)' : pIdx === 2 ? 'Surolan Gocce Auricolari' : 'Apoquel (Oclacitinib)',
          principioAttivo: pIdx === 0 ? 'Amoxicillina triidrato' : pIdx === 1 ? 'Robenacoxib' : pIdx === 2 ? 'Miconazolo + Prednisolone' : 'Oclacitinib maleato',
          dosaggio: pIdx === 0 ? '250 mg' : pIdx === 1 ? '10 mg' : pIdx === 2 ? '5 gocce per orecchio' : '5.4 mg',
          viaSomministrazione: pIdx === 2 ? 'Topica' : 'Orale',
          posologia: pIdx === 2 ? 'Due volte al giorno dopo pulizia' : '1 compressa ogni 12 ore a stomaco pieno',
          dataInizio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          dataFine: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          durataGiorni: 8,
          istruzioni: 'Continuare la terapia fino al termine prescritto anche in assenza di sintomi.',
          attiva: true,
          animaleId: pet._id,
          visitaId: visit2._id,
          veterinarioId: assignedVet._id,
          ambulatorioId: clinic._id
        });
        await therapy.save();
        totalTherapies++;
      }
    }

    // ==========================================
    // APPUNTAMENTI PER OGGI (2026-09-25) su questa clinica
    // Mostriamo slot orari realistici per dare vita all'Agenda del giorno corrente!
    // ==========================================
    const todaySlots = [
      { oraInizio: '09:00', oraFine: '09:30', tipo: 'Visita Generale', stato: 'In Visita', motivo: 'Sospetta allergia alimentare e dermopatia', petIdx: 0 },
      { oraInizio: '10:30', oraFine: '11:00', tipo: 'Vaccinazione', stato: 'In Attesa', motivo: 'Richiamo vaccinale annuale polivalente', petIdx: 1 },
      { oraInizio: '11:30', oraFine: '12:15', tipo: 'Controllo Post-Operatorio', stato: 'Confermato', motivo: 'Controllo ferita chirurgica e rimozione punti', petIdx: 2 },
      { oraInizio: '15:00', oraFine: '15:45', tipo: 'Ecografia/Diagnostica', stato: 'Prenotato', motivo: 'Ecografia addominale di controllo', petIdx: 3 },
      { oraInizio: '17:00', oraFine: '17:30', tipo: 'Visita Generale', stato: 'Prenotato', motivo: 'Controllo zoppia zampa posteriore sinistra', petIdx: 4 }
    ];

    for (const slot of todaySlots) {
      const pet = clinicPets[slot.petIdx];
      const app = new Appointment({
        data: todayStr,
        oraInizio: slot.oraInizio,
        oraFine: slot.oraFine,
        durataMinuti: 30,
        tipoPrestazione: slot.tipo,
        motivo: slot.motivo,
        stato: slot.stato,
        note: `Appuntamento registrato in agenda per oggi (${clinic.nome}).`,
        animaleId: pet._id,
        proprietarioId: pet.proprietarioId,
        veterinarioId: primaryVet._id,
        ambulatorioId: clinic._id
      });
      await app.save();
      totalAppointments++;
    }

    // ==========================================
    // APPUNTAMENTI FUTURI (Prossimi giorni)
    // ==========================================
    const futureSlots = [
      { daysAhead: 1, oraInizio: '09:30', oraFine: '10:00', tipo: 'Visita Generale', stato: 'Confermato', motivo: 'Visita controllo cucciolo', petIdx: 5 },
      { daysAhead: 2, oraInizio: '11:00', oraFine: '11:30', tipo: 'Vaccinazione', stato: 'Prenotato', motivo: 'Vaccino antirabbico per espatrio', petIdx: 6 },
      { daysAhead: 4, oraInizio: '16:00', oraFine: '16:45', tipo: 'Controllo Post-Operatorio', stato: 'Prenotato', motivo: 'Rivalutazione dermatologica', petIdx: 7 },
      { daysAhead: 7, oraInizio: '14:30', oraFine: '15:15', tipo: 'Chirurgia', stato: 'Confermato', motivo: 'Detartrasi ed estrazione dentale programmata', petIdx: 8 }
    ];

    for (const slot of futureSlots) {
      const pet = clinicPets[slot.petIdx];
      const futureDate = getFutureDateStr(slot.daysAhead);
      const app = new Appointment({
        data: futureDate,
        oraInizio: slot.oraInizio,
        oraFine: slot.oraFine,
        durataMinuti: 45,
        tipoPrestazione: slot.tipo,
        motivo: slot.motivo,
        stato: slot.stato,
        note: `Visita programmata per il ${futureDate}.`,
        animaleId: pet._id,
        proprietarioId: pet.proprietarioId,
        veterinarioId: secondaryVet._id,
        ambulatorioId: clinic._id
      });
      await app.save();
      totalAppointments++;
    }
  }

  console.log('\n======================================================');
  console.log('🎉 POPOLAMENTO DEL DATABASE COMPLETATO CON SUCCESSO!');
  console.log('======================================================');
  console.log(`🏥 Strutture Cliniche:     ${createdClinics.length}`);
  console.log(`👨‍⚕️ Medici Veterinari:      ${await User.countDocuments({ ruolo: 'veterinario' })}`);
  console.log(`👥 Proprietari Clienti:     ${totalOwners}`);
  console.log(`🐾 Animali Pazienti:        ${totalPets} (almeno 11 per struttura)`);
  console.log(`📅 Appuntamenti Agenda:     ${totalAppointments} (storico, oggi e futuri)`);
  console.log(`🩺 Visite Cliniche:         ${totalVisits} (referti con diagnosi e parametri)`);
  console.log(`💉 Vaccinazioni:            ${totalVaccinations}`);
  console.log(`💊 Terapie Farmacologiche:  ${totalTherapies}`);
  console.log('======================================================');

  await mongoose.disconnect();
  console.log('🔌 Disconnessione da MongoDB avvenuta correttamente.');
}

// Se invocato direttamente da riga di comando
if (process.argv[1]?.endsWith('seedFullDatabase.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ ERRORE DURANTE IL SEED:', err);
      process.exit(1);
    });
}
