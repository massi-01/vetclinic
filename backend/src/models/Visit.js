import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    data: {
      type: Date,
      default: Date.now,
      required: true
    },
    ora: {
      type: String,
      default: '09:00'
    },
    tipoVisita: {
      type: String,
      enum: ['Controllo Generale', 'Vaccinazione', 'Pronto Soccorso', 'Chirurgia', 'Visita Specialistica', 'Altro'],
      default: 'Controllo Generale'
    },
    motivo: {
      type: String,
      required: [true, 'Il motivo della visita è obbligatorio'],
      trim: true
    },
    anamnesi: {
      type: String,
      default: ''
    },
    esameObiettivo: {
      type: String,
      default: ''
    },
    diagnosi: {
      type: String,
      default: ''
    },
    parametriVitali: {
      temperatura: { type: Number }, // es. 38.5
      frequenzaCardiaca: { type: Number }, // bpm
      frequenzaRespiratoria: { type: Number }, // atti/min
      pesoRilevato: { type: Number } // kg al momento della visita
    },
    note: {
      type: String,
      default: ''
    },
    stato: {
      type: String,
      enum: ['Prenotata', 'In corso', 'Completata', 'Annullata'],
      default: 'Completata'
    },
    animaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, "L'animale associato è obbligatorio"]
    },
    veterinarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ambulatorioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Visit = mongoose.models.Visit || mongoose.model('Visit', visitSchema);
export default Visit;
