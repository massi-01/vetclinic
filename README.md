# VetClinic Pro - Gestionale Ambulatorio Veterinario

Applicativo gestionale completo e moderno per ambulatori e cliniche veterinarie, progettato con architettura a micro-servizi disaccoppiata (Backend Node.js/MongoDB e Frontend React Mobile-First).

---

## 🏛️ Architettura del Progetto

```
vetclinic/
├── backend/                      # API REST JSON in Node.js + Express + Mongoose
│   ├── src/
│   │   ├── config/               # Connessione DB (supporto nativo MongoDB / Atlas)
│   │   ├── models/               # Schemi Mongoose (User, Clinic, Owner, Pet, Visit, Therapy)
│   │   ├── controllers/          # Logica applicativa clinica e contabile
│   │   ├── routes/               # Endpoint REST protetti da JWT
│   │   ├── middlewares/          # Auth JWT & gestione centralizzata errori
│   │   ├── services/             # DataStore con fallback automatico e seed dimostrativo
│   │   └── server.js             # Entry point Express (porta 5000)
│   ├── .env                      # Variabili d'ambiente e MONGODB_URI
│   └── package.json
│
└── frontend/                     # Web App Mobile-First in React + Vite
    ├── public/
    │   └── manifest.json         # PWA Manifest per installazione su iOS / Android
    ├── src/
    │   ├── components/           # Componenti UI, Modali e Schede cliniche
    │   ├── context/              # AuthContext e ClinicContext (Multi-Ambulatorio)
    │   ├── pages/                # Dashboard, Pazienti, Visite, Terapie, Clienti, Ambulatori
    │   ├── services/             # Client HTTP con Bearer token
    │   ├── styles/               # Design System Vanilla CSS clinico e responsivo
    │   └── App.jsx
    ├── vite.config.js            # Proxy API su http://localhost:5000
    └── package.json
```

---

## 🚀 Avvio Rapido

### 1. Avviare il Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```
Il server si avvierà su `http://localhost:5000`.

### 2. Avviare il Frontend (React)
In un altro terminale:
```bash
cd frontend
npm install
npm run dev
```
L'applicazione sarà accessibile nel browser su `http://localhost:3000`.

---

## 🔑 Credenziali Dimostrative (Precaricate)

- **Email**: `dr.rossi@vetclinic.it`
- **Password**: `Password123!`
- **Accesso Rapido**: Nella schermata di login è presente il pulsante **"Accedi Subito"** che compila e autentica automaticamente il veterinario con un solo click.

---

## 🍃 Configurazione MongoDB

Quando avrai la tua connection string di MongoDB (locale o cloud MongoDB Atlas), inseriscila semplicemente nel file `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<utente>:<password>@cluster.mongodb.net/vetclinic?retryWrites=true&w=majority
JWT_SECRET=vetclinic_jwt_super_secret_key_2026_dev
NODE_ENV=development
```

Il backend riconoscerà automaticamente la stringa e si connetterà a MongoDB. Finché `MONGODB_URI` è vuoto, il server funziona in modalità dimostrativa in-memory con persistenza runtime, garantendo che tu possa testare ogni schermata senza interruzioni!

---

## ✨ Funzionalità Incluse

1. **Gestione Multi-Ambulatorio**:
   - Selettore rapido in testata per passare tra le sedi gestite (es. *Clinica San Francesco* e *Ambulatorio Navigli*).
   - Filtraggio istantaneo di pazienti, visite e terapie per sede o visualizzazione globale.
2. **Cartella Clinica Digitale**:
   - Scheda paziente completa: specie, razza, sesso, data di nascita, numero di microchip ISO, colore mantello, allergie e note cliniche.
   - Storico cronologico delle visite ed esami effettuati.
   - Monitoraggio curva e storico del peso con rilevazione automatica a ogni controllo.
3. **Diario Visite Cliniche**:
   - Registrazione visita con parametri vitali (temperatura, frequenza cardiaca, frequenza respiratoria, peso).
   - Prescrizione contestuale dei farmaci direttamente all'interno della visita.
4. **Terapie & Farmaci**:
   - Controllo posologia, dosaggio, via di somministrazione e conteggio automatico dei giorni di trattamento rimanenti.
5. **Anagrafica Clienti / Proprietari**:
   - Ricerca rapida per nome, recapito telefonico o codice fiscale.
   - Collegamento diretto con chiamata telefonica (`tel:`) o email (`mailto:`).
6. **Esperienza Mobile-First**:
   - Navigazione a barra inferiore (Bottom Nav) pensata per l'uso con una sola mano su smartphone e tablet in corsia.
   - Layout adattivo con sidebar a scomparsa su desktop.
   - Predisposta come PWA installabile e compatibile con wrapper Capacitor/Cordova per iOS e Android.
