import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    nomeVaccino: {
      type: String,
      required: [true, 'Il nome del vaccino è obbligatorio'],
      trim: true
    },
    categoria: {
      type: String,
      enum: ['Core / Polivalente', 'Richiamo Annuale', 'Antirabbica', 'Leishmaniosi', 'Altro'],
      default: 'Richiamo Annuale'
    },
    numeroLotto: {
      type: String,
      trim: true,
      default: ''
    },
    dataSomministrazione: {
      type: Date,
      default: Date.now,
      required: true
    },
    dataRichiamo: {
      type: Date,
      required: [true, 'La data del prossimo richiamo è obbligatoria']
    },
    note: {
      type: String,
      default: ''
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

const Vaccination = mongoose.models.Vaccination || mongoose.model('Vaccination', vaccinationSchema);
export default Vaccination;
