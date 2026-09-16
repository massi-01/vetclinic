import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Il nome della clinica è obbligatorio'],
      trim: true
    },
    indirizzo: {
      type: String,
      required: [true, "L'indirizzo è obbligatorio"],
      trim: true
    },
    citta: {
      type: String,
      required: [true, 'La città è obbligatoria'],
      trim: true
    },
    cap: {
      type: String,
      trim: true
    },
    telefono: {
      type: String,
      required: [true, 'Il numero di telefono è obbligatorio'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    partitaIva: {
      type: String,
      trim: true
    },
    codiceFiscale: {
      type: String,
      trim: true
    },
    orariApertura: {
      type: String,
      default: 'Lun - Ven: 09:00 - 19:00 | Sab: 09:00 - 13:00'
    },
    prontoSoccorso24h: {
      type: Boolean,
      default: false
    },
    coloreTema: {
      type: String,
      default: '#0d9488'
    },
    veterinari: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Clinic = mongoose.models.Clinic || mongoose.model('Clinic', clinicSchema);
export default Clinic;
