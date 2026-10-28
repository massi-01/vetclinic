import assert from 'node:assert';
import mongoose from 'mongoose';
import Pet from './src/models/Pet.js';
import Owner from './src/models/Owner.js';
import Appointment from './src/models/Appointment.js';
import Visit from './src/models/Visit.js';
import Vaccination from './src/models/Vaccination.js';
import Therapy from './src/models/Therapy.js';
import { dataStore, initSeedData } from './src/services/dataStore.js';
import { validatePasswordSecurity } from './src/utils/passwordValidator.js';
import { register, login, updateProfile, changePassword } from './src/controllers/authController.js';

async function runTests() {
  console.log('🧪 Avvio suite di test di verifica P1...\n');

  // Inizializza memoria per test
  await initSeedData();

  // Test 1: Verifica indici Mongoose
  console.log('1. Verifica indici Mongoose...');
  const petIndexes = Pet.schema.indexes();
  assert(petIndexes.some(idx => idx[0].ambulatorioId === 1 && idx[0].createdAt === -1), 'Indice Pet ambulatorioId + createdAt mancante');
  assert(petIndexes.some(idx => idx[0].proprietarioId === 1), 'Indice Pet proprietarioId mancante');
  assert(petIndexes.some(idx => idx[0].microchip === 1), 'Indice Pet microchip mancante');

  const appIndexes = Appointment.schema.indexes();
  assert(appIndexes.some(idx => idx[0].ambulatorioId === 1 && idx[0].data === 1 && idx[0].oraInizio === 1), 'Indice Appointment ambulatorioId + data + oraInizio mancante');

  const ownerIndexes = Owner.schema.indexes();
  assert(ownerIndexes.some(idx => idx[0].ambulatorioId === 1 && idx[0].cognome === 1), 'Indice Owner ambulatorioId + cognome mancante');
  console.log('   ✅ Tutti gli indici sono correttamente dichiarati negli schemi Mongoose.\n');

  // Test 2: Verifica autorizzazione clinic (BOLA / IDOR)
  console.log('2. Verifica autorizzazione e isolamento ambulatori (BOLA/IDOR)...');
  const clinics = await dataStore.getClinics();
  assert(clinics.length >= 2, 'Servono almeno 2 cliniche nel seed');
  const clinic1 = clinics[0];
  const clinic2 = clinics[1];

  // Crea un nuovo utente non associato alla clinica 2
  const fakeVet = await dataStore.createUser({
    nome: 'Dottor',
    cognome: 'Esterno',
    email: 'esterno@test.it',
    password: 'hash',
    ambulatori: [clinic1._id]
  });

  const auth1 = await dataStore.isUserAuthorizedForClinic(fakeVet._id, clinic1._id);
  const auth2 = await dataStore.isUserAuthorizedForClinic(fakeVet._id, clinic2._id);
  assert.strictEqual(auth1, true, 'Utente autorizzato per clinic1');
  assert.strictEqual(auth2, false, 'Utente NON deve essere autorizzato per clinic2');
  console.log('   ✅ Accesso incrociato correttamente negato (isUserAuthorizedForClinic = false).\n');

  // Test 3: Verifica supporto visite e appuntamenti paralleli nello stesso slot orario
  console.log('3. Verifica supporto visite parallele / slot orario multiplo...');
  const testDate = '2026-11-20';
  const newApp1 = await dataStore.createAppointment({
    data: testDate,
    oraInizio: '14:00',
    oraFine: '14:30',
    motivo: 'Visita 1 - Controllo Generale',
    animaleId: 'pet-123',
    proprietarioId: 'owner-123',
    veterinarioId: fakeVet._id,
    ambulatorioId: clinic1._id
  });
  assert(newApp1._id, 'Primo appuntamento creato');

  const newApp2 = await dataStore.createAppointment({
    data: testDate,
    oraInizio: '14:00',
    oraFine: '14:30',
    motivo: 'Visita 2 parallela nello stesso orario',
    animaleId: 'pet-456',
    proprietarioId: 'owner-456',
    veterinarioId: fakeVet._id,
    ambulatorioId: clinic1._id
  });
  assert(newApp2._id, 'Secondo appuntamento parallelo creato con successo');

  const parallelApps = await dataStore.getAppointments(clinic1._id, { data: testDate });
  const slotApps = parallelApps.filter(a => a.oraInizio === '14:00');
  assert(slotApps.length >= 2, 'Lo slot deve contenere almeno 2 visite in contemporanea');
  assert(slotApps.some(a => a.motivo === 'Visita 1 - Controllo Generale'), 'Visita 1 presente');
  assert(slotApps.some(a => a.motivo === 'Visita 2 parallela nello stesso orario'), 'Visita 2 presente');
  console.log('   ✅ Visite parallele nello stesso slot orario supportate e salvate con successo.\n');

  // Test 4: Verifica integrità referenziale cancellazione Proprietario con animali
  console.log('4. Verifica integrità referenziale cancellazione Proprietario...');
  const owners = await dataStore.getOwners();
  const ownerWithPets = owners[0];
  let ownerDeleteBlocked = false;
  try {
    await dataStore.deleteOwner(ownerWithPets._id);
  } catch (err) {
    if (err.message.includes('Impossibile eliminare il proprietario')) {
      ownerDeleteBlocked = true;
    }
  }
  assert.strictEqual(ownerDeleteBlocked, true, 'Cancellazione proprietario con animali deve essere bloccata');
  console.log('   ✅ Cancellazione cliente con animali associati bloccata con successo.\n');

  // Test 5: Verifica cascade delete su Animale
  console.log('5. Verifica cascade delete su eliminazione Animale...');
  const testPet = await dataStore.createPet({
    nome: 'Fido Cascade',
    specie: 'Cane',
    proprietarioId: ownerWithPets._id,
    ambulatorioId: clinic1._id
  });

  const testVisit = await dataStore.createVisit({
    data: testDate,
    motivo: 'Visita cascade',
    animaleId: testPet._id,
    ambulatorioId: clinic1._id
  });

  const testVac = await dataStore.createVaccination({
    nomeVaccino: 'TestVac',
    dataRichiamo: '2027-01-01',
    animaleId: testPet._id,
    ambulatorioId: clinic1._id
  });

  // Elimina l'animale
  await dataStore.deletePet(testPet._id);

  const visitsAfter = await dataStore.getVisits(null, { petId: testPet._id });
  const vacsAfter = await dataStore.getVaccinations(null, { petId: testPet._id });
  assert.strictEqual(visitsAfter.length, 0, 'Le visite dell\'animale devono essere cancellate');
  assert.strictEqual(vacsAfter.length, 0, 'I vaccini dell\'animale devono essere cancellati');
  console.log('   ✅ Record clinici orfani eliminati a cascata con successo.\n');

  // Test 6: Verifica aggiornamento stato appuntamento
  console.log('6. Verifica aggiornamento stato appuntamento...');
  const allPets = await dataStore.getPets(clinic1._id);
  const samplePet = allPets[0];
  const appToUpdate = await dataStore.createAppointment({
    data: '2026-11-21',
    oraInizio: '10:00',
    oraFine: '10:30',
    motivo: 'Controllo stato',
    animaleId: samplePet._id,
    ambulatorioId: clinic1._id,
    stato: 'Prenotato'
  });
  assert.strictEqual(appToUpdate.stato, 'Prenotato');

  const updatedApp = await dataStore.updateAppointment(appToUpdate._id, { stato: 'In Visita' });
  assert.strictEqual(updatedApp.stato, 'In Visita', 'Lo stato deve essere aggiornato a In Visita');

  const cancelledApp = await dataStore.updateAppointment(appToUpdate._id, { stato: 'Annullato' });
  assert.strictEqual(cancelledApp.stato, 'Annullato', 'Lo stato deve essere aggiornato ad Annullato');
  console.log('   ✅ Cambio di stato appuntamento gestito correttamente senza conflitti.\n');

  // Test 7: Sincronizzazione automatica Visite Cliniche ➔ Calendario Appuntamenti
  console.log('7. Verifica sincronizzazione Visita Clinica -> Calendario Appuntamenti...');
  const visitSyncDate = '2026-11-25';
  const newVisitSync = await dataStore.createVisit({
    data: visitSyncDate,
    ora: '11:00',
    tipoVisita: 'Controllo Generale',
    motivo: 'Visita dermatologica per prurito',
    stato: 'Completata',
    animaleId: samplePet._id,
    ambulatorioId: clinic1._id
  });

  assert(newVisitSync._id, 'Visita creata con successo');
  assert(newVisitSync.appuntamento, 'La visita deve generare un appuntamento collegato');
  assert.strictEqual(newVisitSync.appuntamento.stato, 'Completato', 'Lo stato della visita Completata deve essere mappato a Completato');
  assert.strictEqual(newVisitSync.appuntamento.oraInizio, '11:00', 'L\'orario dell\'appuntamento deve corrispondere a quello della visita');

  // Verifica che getAppointments per quel giorno trovi l'appuntamento
  const appsForDate = await dataStore.getAppointments(clinic1._id, { data: visitSyncDate });
  const matchedApp = appsForDate.find(a => (a.visitaId?._id || a.visitaId)?.toString() === newVisitSync._id.toString());
  assert(matchedApp, 'L\'appuntamento generato dalla visita deve comparire in getAppointments');
  assert.strictEqual(matchedApp.motivo, 'Visita dermatologica per prurito');

  // Modifica visita
  await dataStore.updateVisit(newVisitSync._id, { motivo: 'Visita dermatologica aggiornata', stato: 'In corso' });
  const updatedAppsForDate = await dataStore.getAppointments(clinic1._id, { data: visitSyncDate });
  const updatedMatchedApp = updatedAppsForDate.find(a => (a.visitaId?._id || a.visitaId)?.toString() === newVisitSync._id.toString());
  assert.strictEqual(updatedMatchedApp.motivo, 'Visita dermatologica aggiornata');
  assert.strictEqual(updatedMatchedApp.stato, 'In Visita');

  // Cancellazione visita -> appuntamento rimosso dal calendario
  await dataStore.deleteVisit(newVisitSync._id);
  const appsAfterDelete = await dataStore.getAppointments(clinic1._id, { data: visitSyncDate });
  const deletedMatchedApp = appsAfterDelete.find(a => (a.visitaId?._id || a.visitaId)?.toString() === newVisitSync._id.toString());
  assert.strictEqual(deletedMatchedApp, undefined, 'L\'appuntamento deve essere rimosso dal calendario quando la visita viene eliminata');
  // Test 8: Verifica tracciamento Audit Log Medico-Legale
  console.log('8. Verifica tracciamento Audit Log Medico-Legale...');
  const auditLogs = await dataStore.getAuditLogs({ ambulatorioId: clinic1._id });
  assert(auditLogs.length > 0, 'Il registro audit deve contenere le azioni registrate');
  const appointmentLogs = auditLogs.filter(l => l.entita === 'Appointment');
  assert(appointmentLogs.length > 0, 'Devono essere presenti audit log per gli appuntamenti');
  assert(appointmentLogs.some(l => l.azione === 'CREATE'), 'Audit log CREATE presente');
  console.log(`   ✅ Registro audit medico-legale verificato con successo (${auditLogs.length} eventi tracciati).\n`);

  // Test 9: Verifica Sicurezza Password in Registrazione
  console.log('9. Verifica policy di sicurezza password (lunghezza min, maiuscole, speciali)...');
  
  // Caso 1: Troppo corta (< 8)
  const shortRes = validatePasswordSecurity('Ab1!');
  assert.strictEqual(shortRes.isValid, false, 'Password corta deve fallire');
  assert(shortRes.errors.some(e => e.includes('almeno 8 caratteri')), 'Errore lunghezza minima atteso');

  // Caso 2: Senza maiuscola
  const noUpperRes = validatePasswordSecurity('password123!');
  assert.strictEqual(noUpperRes.isValid, false, 'Password senza maiuscola deve fallire');
  assert(noUpperRes.errors.some(e => e.includes('lettera maiuscola')), 'Errore maiuscola atteso');

  // Caso 3: Senza minuscola
  const noLowerRes = validatePasswordSecurity('PASSWORD123!');
  assert.strictEqual(noLowerRes.isValid, false, 'Password senza minuscola deve fallire');
  assert(noLowerRes.errors.some(e => e.includes('lettera minuscola')), 'Errore minuscola atteso');

  // Caso 4: Senza numero
  const noNumRes = validatePasswordSecurity('Password!');
  assert.strictEqual(noNumRes.isValid, false, 'Password senza numero deve fallire');
  assert(noNumRes.errors.some(e => e.includes('numero')), 'Errore numero atteso');

  // Caso 5: Senza caratteri speciali
  const noSpecialRes = validatePasswordSecurity('Password123');
  assert.strictEqual(noSpecialRes.isValid, false, 'Password senza carattere speciale deve fallire');
  assert(noSpecialRes.errors.some(e => e.includes('carattere speciale')), 'Errore speciale atteso');

  // Caso 6: Password valida (conferma validità Password123!)
  const validRes = validatePasswordSecurity('Password123!');
  assert.strictEqual(validRes.isValid, true, 'Password123! deve superare tutti i criteri');
  assert.strictEqual(validRes.errors.length, 0, 'Nessun errore atteso per password valida');

  // Caso 7: Test controller register con mock req/res
  let mockStatusCode = 0;
  let mockJsonData = null;
  const mockRes = {
    status(code) {
      mockStatusCode = code;
      return this;
    },
    json(data) {
      if (!mockStatusCode) mockStatusCode = 200;
      mockJsonData = data;
      return this;
    }
  };

  // Chiamata con password debole (manca speciale)
  await register({
    body: {
      nome: 'Giulia',
      cognome: 'Bianchi',
      email: 'giulia.weak@test.it',
      password: 'Password123'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 400, 'Registrazione con password debole deve restituire 400');
  assert.strictEqual(mockJsonData.success, false);
  assert(mockJsonData.message.includes('carattere speciale'), 'Il messaggio deve segnalare la mancanza di carattere speciale');

  // Chiamata con password sicura valida
  await register({
    body: {
      nome: 'Giulia',
      cognome: 'Bianchi',
      email: 'giulia.secure@test.it',
      password: 'SecurePassword2026!'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 201, 'Registrazione con password conforme deve restituire 201');
  assert.strictEqual(mockJsonData.success, true);
  assert(mockJsonData.token, 'Token JWT deve essere generato');
  assert.strictEqual(mockJsonData.user.email, 'giulia.secure@test.it');

  console.log('   ✅ Validazione password e policy di registrazione verificate con successo (7/7 scenari).\n');

  // Test 10: Modifica Dettagli Profilo e Cambio Password
  console.log('10. Verifica modifica dettagli profilo e cambio password...');
  const userToUpdate = mockJsonData.user;
  
  // Test updateProfile
  mockStatusCode = 0;
  mockJsonData = null;
  await updateProfile({
    user: userToUpdate,
    body: {
      nome: 'Giulia Maria',
      cognome: 'Bianchi Rossi',
      email: 'giulia.updated@test.it',
      telefono: '+39 349 9988776',
      codiceAlbo: 'TO-9999',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 200, 'Aggiornamento profilo deve restituire 200');
  assert.strictEqual(mockJsonData.success, true);
  assert.strictEqual(mockJsonData.user.nome, 'Giulia Maria');
  assert.strictEqual(mockJsonData.user.email, 'giulia.updated@test.it');
  assert.strictEqual(mockJsonData.user.codiceAlbo, 'TO-9999');
  assert.strictEqual(mockJsonData.user.avatarUrl, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2');

  // Test changePassword: con password attuale errata
  mockStatusCode = 0;
  mockJsonData = null;
  await changePassword({
    user: { _id: userToUpdate._id },
    body: {
      currentPassword: 'WrongPassword1!',
      newPassword: 'BrandNewPassword2026!'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 400);
  assert(mockJsonData.message.includes('non è corretta'));

  // Test changePassword: con nuova password debole
  mockStatusCode = 0;
  mockJsonData = null;
  await changePassword({
    user: { _id: userToUpdate._id },
    body: {
      currentPassword: 'SecurePassword2026!',
      newPassword: 'short'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 400);
  assert(mockJsonData.message.includes('almeno 8 caratteri'));

  // Test changePassword: con nuova password valida
  mockStatusCode = 0;
  mockJsonData = null;
  await changePassword({
    user: { _id: userToUpdate._id },
    body: {
      currentPassword: 'SecurePassword2026!',
      newPassword: 'SuperNewPassword2026!'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 200);
  assert.strictEqual(mockJsonData.success, true);

  // Verifica che il login funzioni con la nuova password
  mockStatusCode = 0;
  mockJsonData = null;
  await login({
    body: {
      email: 'giulia.updated@test.it',
      password: 'SuperNewPassword2026!'
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 200);
  assert.strictEqual(mockJsonData.success, true);
  assert(mockJsonData.token, 'Token generato al login con nuova password');
  console.log('   ✅ Modifica anagrafica profilo e aggiornamento sicuro password verificati con successo.\n');

  // Test 11: Verifica obbligatorietà e validazione Codice Fiscale Proprietario
  console.log('11. Verifica obbligatorietà e formato Codice Fiscale Proprietario...');
  const { createOwner } = await import('./src/controllers/ownerController.js');

  // Test senza codice fiscale
  mockStatusCode = 0;
  mockJsonData = null;
  await createOwner({
    user: { _id: fakeVet._id },
    body: {
      nome: 'Giuseppe',
      cognome: 'Verdi',
      telefono: '3331122334',
      ambulatorioId: clinic1._id
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 400, 'Creazione proprietario senza CF deve restituire 400');
  assert(mockJsonData.message.includes('codice fiscale'), 'Messaggio deve segnalare CF mancante');

  // Test con codice fiscale di lunghezza non valida (< 16)
  mockStatusCode = 0;
  mockJsonData = null;
  await createOwner({
    user: { _id: fakeVet._id },
    body: {
      nome: 'Giuseppe',
      cognome: 'Verdi',
      codiceFiscale: 'VRDGPP80A01',
      telefono: '3331122334',
      ambulatorioId: clinic1._id
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 400, 'CF non di 16 caratteri deve restituire 400');

  // Test con codice fiscale valido
  mockStatusCode = 0;
  mockJsonData = null;
  await createOwner({
    user: { _id: fakeVet._id },
    body: {
      nome: 'Giuseppe',
      cognome: 'Verdi',
      codiceFiscale: 'vrdgpp80a01f205x', // minuscolo, deve diventare maiuscolo
      telefono: '3331122334',
      ambulatorioId: clinic1._id
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 201, 'Proprietario con CF valido deve essere creato');
  assert.strictEqual(mockJsonData.data.codiceFiscale, 'VRDGPP80A01F205X', 'CF deve essere convertito in maiuscolo');
  console.log('   ✅ Validazione Codice Fiscale (obbligatorio, 16 char, uppercase) verificata con successo.\n');

  // Test 12: Verifica Esami/Test Specialistici su Visita (Interno / Esterno / PDF)
  console.log('12. Verifica Esami e Prestazioni Specialistiche su Visita...');
  const { createVisit, getVisits } = await import('./src/controllers/visitController.js');

  const testExams = [
    {
      nome: 'Emocromo Completo',
      tipologia: 'Interno',
      stato: 'Pronto',
      esito: 'Valori ematici nella norma',
      fileAllegato: 'data:application/pdf;base64,JVBERi0xLjQK...',
      nomeFile: 'emocromo.pdf',
      dimensioneFile: 1024
    },
    {
      nome: 'Biopsia Linfonodale',
      tipologia: 'Esterno',
      laboratorio: 'IDEXX Laboratories',
      stato: 'In lavorazione',
      esito: 'In attesa di refertazione istologica'
    }
  ];

  mockStatusCode = 0;
  mockJsonData = null;
  await createVisit({
    user: { _id: fakeVet._id },
    body: {
      data: '2026-11-25',
      ora: '15:30',
      tipoVisita: 'Visita Specialistica',
      motivo: 'Controllo oncologico e prelievo',
      animaleId: 'pet-123',
      ambulatorioId: clinic1._id,
      esami: testExams
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 201, 'Creazione visita con esami deve restituire 201');
  assert(Array.isArray(mockJsonData.data.esami), 'Esami deve essere un array');
  assert.strictEqual(mockJsonData.data.esami.length, 2, 'Devono essere presenti 2 esami');
  assert.strictEqual(mockJsonData.data.esami[0].tipologia, 'Interno');
  assert.strictEqual(mockJsonData.data.esami[1].tipologia, 'Esterno');
  assert.strictEqual(mockJsonData.data.esami[1].laboratorio, 'IDEXX Laboratories');
  assert.strictEqual(mockJsonData.data.esami[1].stato, 'In lavorazione');
  console.log('   ✅ Salvataggio e persistenza esami interni ed esterni verificati con successo.\n');

  // Test 13: Verifica Paziente Deceduto e Data Decesso
  console.log('13. Verifica Paziente Deceduto (dataDecesso) ed eliminazione paziente...');
  const newDeceasedPet = await dataStore.createPet({
    nome: 'Fido Senior',
    specie: 'Cane',
    razza: 'Pastore Tedesco',
    sesso: 'Maschio',
    proprietarioId: mockJsonData.data._id,
    ambulatorioId: clinic1._id,
    stato: 'Deceduto',
    dataDecesso: '2026-10-15'
  });
  assert.strictEqual(newDeceasedPet.stato, 'Deceduto');
  assert(newDeceasedPet.dataDecesso, 'Data decesso deve essere salvata');

  // Verifica cancellazione dell'animale
  await dataStore.deletePet(newDeceasedPet._id);
  const deletedPetCheck = await dataStore.getPetById(newDeceasedPet._id);
  assert.strictEqual(deletedPetCheck, null, 'Paziente deve essere eliminato');
  console.log('   ✅ Stato Deceduto, dataDecesso ed eliminazione paziente verificati con successo.\n');

  // Test 14: Verifica Medico Esecutore Visita e Filtro per Medico
  console.log('14. Verifica Assegnazione Medico e Filtro Ricerca per Medico...');
  mockStatusCode = 0;
  mockJsonData = null;
  await createVisit({
    user: { _id: fakeVet._id },
    body: {
      data: '2026-11-26',
      ora: '11:00',
      tipoVisita: 'Controllo Generale',
      motivo: 'Visita eseguita dal Dottor Esterno',
      animaleId: 'pet-123',
      ambulatorioId: clinic1._id,
      veterinarioId: fakeVet._id
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 201);

  // Filtra visite per veterinarioId
  mockStatusCode = 0;
  mockJsonData = null;
  await getVisits({
    user: { _id: fakeVet._id },
    query: {
      clinicId: clinic1._id.toString(),
      veterinarioId: fakeVet._id.toString()
    }
  }, mockRes);
  assert.strictEqual(mockStatusCode, 200);
  assert(mockJsonData.data.length >= 1, 'Devono esserci visite filtrate per questo medico');
  assert(mockJsonData.data.every(v => (v.veterinarioId?._id || v.veterinarioId)?.toString() === fakeVet._id.toString()), 'Tutte le visite devono appartenere al medico filtrato');
  console.log('   ✅ Medico esecutore e filtro visite per medico verificati con successo.\n');

  console.log('🎉 TUTTI I TEST P1, P2 E NUOVE FUNZIONALITÀ SONO STATI SUPERATI CON SUCCESSO!');
}

runTests().catch(err => {
  console.error('❌ Errore durante i test:', err);
  process.exit(1);
});

