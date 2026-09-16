import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    data: {
      type: String, // formato 'YYYY-MM-DD' per indicizzazione e query dirette per giorno
      required: [true, 'La data dell\'appuntamento è obbligatoria']
    },
    oraInizio: {
      type: String, // formato 'HH:mm', es. '09:30'
      required: [true, "L'orario di inizio è obbligatorio"]
    },
    oraFine: {
      type: String, // formato 'HH:mm', es. '10:00'
      default: '10:00'
    },
    durataMinuti: {
      type: Number,
      default: 30
    },
    tipoPrestazione: {
      type: String,
      enum: ['Visita Generale', 'Vaccinazione', 'Controllo Post-Operatorio', 'Chirurgia', 'Ecografia/Diagnostica', 'Altro'],
      default: 'Visita Generale'
    },
    motivo: {
      type: String,
      required: [true, 'Il motivo dell\'appuntamento è obbligatorio'],
      trim: true
    },
    stato: {
      type: String,
      enum: ['Prenotato', 'Confermato', 'In Attesa', 'In Visita', 'Completato', 'Annullato'],
      default: 'Prenotato'
    },
    note: {
      type: String,
      default: ''
    },
    animaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    proprietarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
    },
    veterinarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
