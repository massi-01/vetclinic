export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VetClinic Pro API',
    version: '1.0.0',
    description: 'Documentazione interattiva OpenAPI / Swagger per il backend del gestionale veterinario VetClinic Pro. Permette di testare tutti gli endpoint REST JSON.',
    contact: {
      name: 'VetClinic Support',
      email: 'support@vetclinic.it'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Server locale di sviluppo'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Inserisci il token JWT restituito dalla chiamata POST /api/auth/login'
      }
    },
    schemas: {
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'dr.rossi@vetclinic.it' },
          password: { type: 'string', example: 'Password123!' }
        }
      },
      UserRegister: {
        type: 'object',
        required: ['nome', 'cognome', 'email', 'password'],
        properties: {
          nome: { type: 'string', example: 'Marco' },
          cognome: { type: 'string', example: 'Rossi' },
          email: { type: 'string', example: 'dr.rossi@vetclinic.it' },
          password: { type: 'string', example: 'Password123!' },
          telefono: { type: 'string', example: '+39 347 1234567' },
          codiceAlbo: { type: 'string', example: 'MI-8492' },
          ambulatorioNome: { type: 'string', example: 'Clinica San Francesco' }
        }
      },
      Clinic: {
        type: 'object',
        required: ['nome', 'indirizzo', 'citta', 'telefono'],
        properties: {
          nome: { type: 'string', example: 'Clinica Veterinaria San Francesco' },
          indirizzo: { type: 'string', example: 'Via Roma 45' },
          citta: { type: 'string', example: 'Milano' },
          cap: { type: 'string', example: '20121' },
          telefono: { type: 'string', example: '02 89401234' },
          email: { type: 'string', example: 'info@clinicasanfrancesco.it' },
          partitaIva: { type: 'string', example: 'IT09876543210' },
          codiceFiscale: { type: 'string', example: '09876543210' },
          orariApertura: { type: 'string', example: 'Lun - Ven: 08:30 - 20:00' },
          prontoSoccorso24h: { type: 'boolean', example: true },
          coloreTema: { type: 'string', example: '#0d9488' }
        }
      },
      Owner: {
        type: 'object',
        required: ['nome', 'cognome', 'telefono', 'ambulatorioId'],
        properties: {
          nome: { type: 'string', example: 'Mario' },
          cognome: { type: 'string', example: 'Bianchi' },
          codiceFiscale: { type: 'string', example: 'BNCMR080A01F205Z' },
          telefono: { type: 'string', example: '+39 333 9876543' },
          email: { type: 'string', example: 'mario.bianchi@email.it' },
          indirizzo: { type: 'string', example: 'Corso Buenos Aires 22' },
          citta: { type: 'string', example: 'Milano' },
          note: { type: 'string', example: 'Reperibile nel pomeriggio' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      },
      Pet: {
        type: 'object',
        required: ['nome', 'specie', 'proprietarioId', 'ambulatorioId'],
        properties: {
          nome: { type: 'string', example: 'Thor' },
          specie: { type: 'string', enum: ['Cane', 'Gatto', 'Coniglio', 'Volatile', 'Rettile', 'Altro'], example: 'Cane' },
          razza: { type: 'string', example: 'Golden Retriever' },
          sesso: { type: 'string', enum: ['Maschio', 'Femmina', 'Maschio Castrato', 'Femmina Sterilizzata'], example: 'Maschio' },
          dataNascita: { type: 'string', format: 'date', example: '2021-04-10' },
          microchip: { type: 'string', example: '380260043210987' },
          pesoAttuale: { type: 'number', example: 32.5 },
          coloreMantello: { type: 'string', example: 'Miele dorato' },
          allergie: { type: 'array', items: { type: 'string' }, example: ['Pollo'] },
          noteCliniche: { type: 'string', example: 'Soggetto docile' },
          proprietarioId: { type: 'string', example: '6aaa45629d1acc0825e169b5' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      },
      Visit: {
        type: 'object',
        required: ['motivo', 'animaleId', 'ambulatorioId'],
        properties: {
          data: { type: 'string', format: 'date', example: '2026-09-16' },
          ora: { type: 'string', example: '10:30' },
          tipoVisita: { type: 'string', enum: ['Controllo Generale', 'Vaccinazione', 'Pronto Soccorso', 'Chirurgia', 'Visita Specialistica', 'Altro'], example: 'Controllo Generale' },
          motivo: { type: 'string', example: 'Richiamo vaccino e controllo generale' },
          anamnesi: { type: 'string', example: 'Paziente vigile e attivo' },
          esameObiettivo: { type: 'string', example: 'Mucose rosee, addome trattabile' },
          diagnosi: { type: 'string', example: 'Ottimo stato nutrizionale e di salute' },
          parametriVitali: {
            type: 'object',
            properties: {
              temperatura: { type: 'number', example: 38.5 },
              frequenzaCardiaca: { type: 'number', example: 90 },
              frequenzaRespiratoria: { type: 'number', example: 22 },
              pesoRilevato: { type: 'number', example: 32.5 }
            }
          },
          note: { type: 'string', example: 'Prossimo richiamo tra 12 mesi' },
          stato: { type: 'string', enum: ['Prenotata', 'In corso', 'Completata', 'Annullata'], example: 'Completata' },
          animaleId: { type: 'string', example: '6aaa45629d1acc0825e169b8' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      },
      Therapy: {
        type: 'object',
        required: ['nomeFarmaco', 'dosaggio', 'posologia', 'animaleId', 'ambulatorioId'],
        properties: {
          nomeFarmaco: { type: 'string', example: 'Synulox 250mg' },
          principioAttivo: { type: 'string', example: 'Amoxicillina + Acido clavulanico' },
          dosaggio: { type: 'string', example: '1 compressa' },
          viaSomministrazione: { type: 'string', enum: ['Orale', 'Sottocutanea', 'Intramuscolare', 'Topica', 'Oftalmica', 'Endovenosa', 'Altro'], example: 'Orale' },
          posologia: { type: 'string', example: 'Ogni 12 ore dopo i pasti' },
          dataInizio: { type: 'string', format: 'date', example: '2026-09-16' },
          durataGiorni: { type: 'number', example: 7 },
          istruzioni: { type: 'string', example: 'Completare l\'intero ciclo prescritto' },
          attiva: { type: 'boolean', example: true },
          animaleId: { type: 'string', example: '6aaa45629d1acc0825e169b8' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      },
      Vaccination: {
        type: 'object',
        required: ['nomeVaccino', 'dataRichiamo', 'animaleId', 'ambulatorioId'],
        properties: {
          nomeVaccino: { type: 'string', example: 'Nobivac DHPPi + Lepto' },
          categoria: { type: 'string', enum: ['Core / Polivalente', 'Richiamo Annuale', 'Antirabbica', 'Leishmaniosi', 'Altro'], example: 'Core / Polivalente' },
          numeroLotto: { type: 'string', example: 'B982A01' },
          dataSomministrazione: { type: 'string', format: 'date', example: '2026-03-10' },
          dataRichiamo: { type: 'string', format: 'date', example: '2027-03-10' },
          note: { type: 'string', example: 'Nessuna reazione avversa' },
          animaleId: { type: 'string', example: '6aaa45629d1acc0825e169b8' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      },
      Appointment: {
        type: 'object',
        required: ['data', 'oraInizio', 'motivo', 'animaleId', 'ambulatorioId'],
        properties: {
          data: { type: 'string', format: 'date', example: '2026-09-16' },
          oraInizio: { type: 'string', example: '10:00' },
          oraFine: { type: 'string', example: '10:30' },
          durataMinuti: { type: 'number', example: 30 },
          tipoPrestazione: { type: 'string', enum: ['Visita Generale', 'Vaccinazione', 'Controllo Post-Operatorio', 'Chirurgia', 'Ecografia/Diagnostica', 'Altro'], example: 'Visita Generale' },
          motivo: { type: 'string', example: 'Controllo andatura zampa anteriore' },
          stato: { type: 'string', enum: ['Prenotato', 'In Attesa', 'In Visita', 'Completato', 'Annullato'], example: 'Prenotato' },
          note: { type: 'string', example: 'Cliente accompagnato dal figlio' },
          animaleId: { type: 'string', example: '6aaa45629d1acc0825e169b8' },
          proprietarioId: { type: 'string', example: '6aaa45629d1acc0825e169b5' },
          ambulatorioId: { type: 'string', example: '6aaa45629d1acc0825e169b2' }
        }
      }
    }
  },
  tags: [
    { name: 'Autenticazione', description: 'Login, registrazione e profilo del veterinario' },
    { name: 'Ambulatori', description: 'Gestione delle strutture e sedi veterinarie' },
    { name: 'Proprietari', description: 'Anagrafica clienti e contatti' },
    { name: 'Pazienti', description: 'Cartella clinica e dati anagrafici degli animali' },
    { name: 'Visite', description: 'Diario visite, esami obiettivi e parametri vitali' },
    { name: 'Terapie', description: 'Prescrizione farmaci e posologia' },
    { name: 'Vaccinazioni', description: 'Piano vaccinale, scadenze e allerta richiami periodici' },
    { name: 'Agenda / Appuntamenti', description: 'Pianificazione appuntamenti su slot orari' },
    { name: 'Statistiche', description: 'Indicatori KPI per la dashboard clinica' }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Autenticazione'],
        summary: 'Login veterinario con email e password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserLogin' } } }
        },
        responses: {
          200: { description: 'Login effettuato con successo (restituisce JWT token)' },
          401: { description: 'Credenziali non valide' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Autenticazione'],
        summary: 'Registrazione nuovo veterinario e ambulatorio',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRegister' } } }
        },
        responses: {
          201: { description: 'Veterinario registrato con successo' },
          400: { description: 'Dati mancanti o email già presente' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Autenticazione'],
        summary: 'Recupera il profilo del veterinario autenticato',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Dati profilo utente' },
          401: { description: 'Token mancante o non valido' }
        }
      }
    },

    '/api/clinics': {
      get: {
        tags: ['Ambulatori'],
        summary: 'Recupera tutti gli ambulatori associati al veterinario',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Elenco ambulatori' } }
      },
      post: {
        tags: ['Ambulatori'],
        summary: 'Crea una nuova sede o ambulatorio',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Clinic' } } }
        },
        responses: { 201: { description: 'Ambulatorio creato con successo' } }
      }
    },
    '/api/clinics/{id}': {
      get: {
        tags: ['Ambulatori'],
        summary: 'Dettagli singolo ambulatorio per ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Dettaglio ambulatorio' }, 404: { description: 'Non trovato' } }
      },
      put: {
        tags: ['Ambulatori'],
        summary: 'Aggiorna dettagli ambulatorio',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Clinic' } } }
        },
        responses: { 200: { description: 'Ambulatorio aggiornato' } }
      }
    },

    '/api/owners': {
      get: {
        tags: ['Proprietari'],
        summary: 'Elenco proprietari (filtrabili per ambulatorio o ricerca testuale)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' }, description: 'Filtra per ID ambulatorio' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cerca per nome, cognome, telefono o C.F.' }
        ],
        responses: { 200: { description: 'Elenco clienti' } }
      },
      post: {
        tags: ['Proprietari'],
        summary: 'Registra un nuovo proprietario / cliente',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Owner' } } }
        },
        responses: { 201: { description: 'Proprietario creato' } }
      }
    },
    '/api/owners/{id}': {
      get: {
        tags: ['Proprietari'],
        summary: 'Dettagli proprietario con lista dei suoi animali collegati',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Dettagli proprietario' } }
      },
      put: {
        tags: ['Proprietari'],
        summary: 'Modifica dati proprietario',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Owner' } } }
        },
        responses: { 200: { description: 'Proprietario aggiornato' } }
      },
      delete: {
        tags: ['Proprietari'],
        summary: 'Elimina proprietario',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Proprietario eliminato' } }
      }
    },

    '/api/pets': {
      get: {
        tags: ['Pazienti'],
        summary: 'Elenco pazienti (animali)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' } },
          { name: 'specie', in: 'query', schema: { type: 'string', enum: ['Cane', 'Gatto', 'Coniglio', 'Volatile', 'Rettile', 'Altro'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cerca per nome animale, razza o microchip' }
        ],
        responses: { 200: { description: 'Elenco pazienti' } }
      },
      post: {
        tags: ['Pazienti'],
        summary: 'Crea una nuova cartella clinica animale',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } }
        },
        responses: { 201: { description: 'Paziente registrato' } }
      }
    },
    '/api/pets/{id}': {
      get: {
        tags: ['Pazienti'],
        summary: 'Cartella clinica completa con visite, terapie e storico peso',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cartella clinica recuperata' } }
      },
      put: {
        tags: ['Pazienti'],
        summary: 'Aggiorna dati cartella clinica',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } }
        },
        responses: { 200: { description: 'Paziente aggiornato' } }
      },
      delete: {
        tags: ['Pazienti'],
        summary: 'Rimuovi cartella clinica',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Paziente eliminato' } }
      }
    },

    '/api/visits': {
      get: {
        tags: ['Visite'],
        summary: 'Elenco visite cliniche registrate',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' } },
          { name: 'petId', in: 'query', schema: { type: 'string' } },
          { name: 'data', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Elenco visite' } }
      },
      post: {
        tags: ['Visite'],
        summary: 'Registra una nuova visita clinica (con opzione di terapia contestuale)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Visit' } } }
        },
        responses: { 201: { description: 'Visita registrata con successo' } }
      }
    },
    '/api/visits/{id}': {
      get: {
        tags: ['Visite'],
        summary: 'Dettagli singolo referto di visita',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Dettaglio visita' } }
      },
      put: {
        tags: ['Visite'],
        summary: 'Modifica referto visita',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Visit' } } }
        },
        responses: { 200: { description: 'Visita modificata' } }
      },
      delete: {
        tags: ['Visite'],
        summary: 'Elimina visita',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Visita eliminata' } }
      }
    },

    '/api/therapies': {
      get: {
        tags: ['Terapie'],
        summary: 'Elenco terapie e prescrizioni farmacologiche',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' } },
          { name: 'petId', in: 'query', schema: { type: 'string' } },
          { name: 'attiva', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: { 200: { description: 'Elenco terapie' } }
      },
      post: {
        tags: ['Terapie'],
        summary: 'Prescrivi nuova terapia o farmaco',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Therapy' } } }
        },
        responses: { 201: { description: 'Terapia prescritta' } }
      }
    },
    '/api/therapies/{id}': {
      put: {
        tags: ['Terapie'],
        summary: 'Aggiorna o concludi terapia',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Therapy' } } }
        },
        responses: { 200: { description: 'Terapia aggiornata' } }
      },
      delete: {
        tags: ['Terapie'],
        summary: 'Elimina terapia',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Terapia eliminata' } }
      }
    },

    '/api/vaccinations': {
      get: {
        tags: ['Vaccinazioni'],
        summary: 'Elenco vaccinazioni con stato di scadenza richiamo calcolato',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' } },
          { name: 'petId', in: 'query', schema: { type: 'string' } },
          { name: 'warningOnly', in: 'query', schema: { type: 'boolean' }, description: 'Mostra solo vaccini scaduti o in scadenza entro 30 giorni' }
        ],
        responses: { 200: { description: 'Elenco vaccinazioni' } }
      },
      post: {
        tags: ['Vaccinazioni'],
        summary: 'Registra nuova vaccinazione',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Vaccination' } } }
        },
        responses: { 201: { description: 'Vaccinazione registrata con successo' } }
      }
    },
    '/api/vaccinations/{id}': {
      get: {
        tags: ['Vaccinazioni'],
        summary: 'Dettagli vaccinazione',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Dettaglio' } }
      },
      put: {
        tags: ['Vaccinazioni'],
        summary: 'Modifica vaccinazione',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Vaccination' } } }
        },
        responses: { 200: { description: 'Aggiornata' } }
      },
      delete: {
        tags: ['Vaccinazioni'],
        summary: 'Rimuovi vaccinazione',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Eliminata' } }
      }
    },

    '/api/appointments': {
      get: {
        tags: ['Agenda / Appuntamenti'],
        summary: 'Elenco appuntamenti (filtrabili per giorno o paziente)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' } },
          { name: 'data', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filtra per giorno (YYYY-MM-DD)' },
          { name: 'petId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Elenco appuntamenti' } }
      },
      post: {
        tags: ['Agenda / Appuntamenti'],
        summary: 'Prenota un appuntamento nello slot orario desiderato',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Appointment' } } }
        },
        responses: { 201: { description: 'Appuntamento creato con successo' } }
      }
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Agenda / Appuntamenti'],
        summary: 'Dettagli appuntamento',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Dettagli' } }
      },
      put: {
        tags: ['Agenda / Appuntamenti'],
        summary: 'Aggiorna appuntamento o stato (Prenotato, In Attesa, In Visita, Completato)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Appointment' } } }
        },
        responses: { 200: { description: 'Aggiornato' } }
      },
      delete: {
        tags: ['Agenda / Appuntamenti'],
        summary: 'Elimina o disdici appuntamento',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Eliminato' } }
      }
    },

    '/api/stats/dashboard': {
      get: {
        tags: ['Statistiche'],
        summary: 'Recupera metriche e indicatori per la dashboard',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'clinicId', in: 'query', schema: { type: 'string' }, description: 'Filtra statistiche per ambulatorio' }
        ],
        responses: { 200: { description: 'Dati di riepilogo dashboard' } }
      }
    }
  }
};
