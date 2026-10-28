import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Il nome del proprietario è obbligatorio'],
      trim: true
    },
    cognome: {
      type: String,
      required: [true, 'Il cognome del proprietario è obbligatorio'],
      trim: true
    },
    codiceFiscale: {
      type: String,
      required: [true, 'Il codice fiscale del cliente è obbligatorio'],
      trim: true,
      uppercase: true
    },
    telefono: {
      type: String,
      required: [true, 'Il recapito telefonico è obbligatorio'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    indirizzo: {
      type: String,
      trim: true
    },
    citta: {
      type: String,
      trim: true
    },
    note: {
      type: String,
      default: ''
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

ownerSchema.index({ ambulatorioId: 1, cognome: 1, nome: 1 });
ownerSchema.index({ codiceFiscale: 1 });
ownerSchema.index({ telefono: 1 });

const Owner = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);
export default Owner;
