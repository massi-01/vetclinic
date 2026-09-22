import assert from 'node:assert';
import mongoose from 'mongoose';
import Pet from './src/models/Pet.js';
import Owner from './src/models/Owner.js';
import Appointment from './src/models/Appointment.js';
import Visit from './src/models/Visit.js';
import Vaccination from './src/models/Vaccination.js';
import Therapy from './src/models/Therapy.js';
import { dataStore, initSeedData } from './src/services/dataStore.js';

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

  // Test 3: Verifica prevenzione Overbooking Appuntamenti
  console.log('3. Verifica prevenzione Overbooking / Conflitti orari appuntamenti...');
  const testDate = '2026-11-20';
  const newApp1 = await dataStore.createAppointment({
    data: testDate,
    oraInizio: '14:00',
    oraFine: '14:30',
    motivo: 'Visita 1',
    animaleId: 'pet-123',
    proprietarioId: 'owner-123',
    ambulatorioId: clinic1._id
  });
  assert(newApp1._id, 'Primo appuntamento creato');

  let conflictCaught = false;
  try {
    await dataStore.createAppointment({
      data: testDate,
      oraInizio: '14:00',
      oraFine: '14:30',
      motivo: 'Visita sovrapposta (conflitto)',
      animaleId: 'pet-456',
      proprietarioId: 'owner-456',
      ambulatorioId: clinic1._id
    });
  } catch (err) {
    if (err.message.includes('CONFLITTO_ORARIO')) {
      conflictCaught = true;
    }
  }
  assert.strictEqual(conflictCaught, true, 'La creazione di un secondo appuntamento nello stesso slot deve generare CONFLITTO_ORARIO');
  console.log('   ✅ Overbooking intercettato e bloccato correttamente (CONFLITTO_ORARIO).\n');

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

  console.log('🎉 TUTTI I TEST P1 SONO STATI SUPERATI CON SUCCESSO!');
}

runTests().catch(err => {
  console.error('❌ Errore durante i test:', err);
  process.exit(1);
});
