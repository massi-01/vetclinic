import mongoose from 'mongoose';

const therapySchema = new mongoose.Schema(
  {
    nomeFarmaco: {
      type: String,
      required: [true, 'Il nome del farmaco è obbligatorio'],
      trim: true
    },
    principioAttivo: {
      type: String,
      default: '',
      trim: true
    },
    dosaggio: {
      type: String,
      required: [true, 'Il dosaggio è obbligatorio'],
      trim: true
    },
    viaSomministrazione: {
      type: String,
      enum: ['Orale', 'Sottocutanea', 'Intramuscolare', 'Topica', 'Oftalmica', 'Endovenosa', 'Altro'],
      default: 'Orale'
    },
    posologia: {
      type: String,
      required: [true, 'La posologia/frequenza è obbligatoria'],
      trim: true
    },
    dataInizio: {
      type: Date,
      default: Date.now
    },
    dataFine: {
      type: Date
    },
    durataGiorni: {
      type: Number,
      default: 7
    },
    istruzioni: {
      type: String,
      default: ''
    },
    attiva: {
      type: Boolean,
      default: true
    },
    animaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, "L'animale associato è obbligatorio"]
    },
    visitaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit'
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

const Therapy = mongoose.models.Therapy || mongoose.model('Therapy', therapySchema);
export default Therapy;
