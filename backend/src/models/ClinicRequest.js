import mongoose from 'mongoose';

const clinicRequestSchema = new mongoose.Schema(
  {
    ambulatorioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, "L'ambulatorio è obbligatorio"]
    },
    veterinarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il veterinario richiedente è obbligatorio']
    },
    gestoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il gestore responsabile è obbligatorio']
    },
    stato: {
      type: String,
      enum: ['IN_ATTESA', 'ACCETTATA', 'RIFIUTATA'],
      default: 'IN_ATTESA'
    },
    messaggio: {
      type: String,
      trim: true,
      default: ''
    },
    noteRisposta: {
      type: String,
      trim: true,
      default: ''
    },
    dataRichiesta: {
      type: Date,
      default: Date.now
    },
    dataRisposta: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const ClinicRequest = mongoose.models.ClinicRequest || mongoose.model('ClinicRequest', clinicRequestSchema);
export default ClinicRequest;
