import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Il nome dell'animale è obbligatorio"],
      trim: true
    },
    specie: {
      type: String,
      required: [true, 'La specie è obbligatoria'],
      enum: ['Cane', 'Gatto', 'Coniglio', 'Volatile', 'Rettile', 'Altro'],
      default: 'Cane'
    },
    razza: {
      type: String,
      default: 'Meticcio / Non specificata',
      trim: true
    },
    sesso: {
      type: String,
      enum: ['Maschio', 'Femmina', 'Maschio Castrato', 'Femmina Sterilizzata'],
      default: 'Maschio'
    },
    dataNascita: {
      type: Date
    },
    microchip: {
      type: String,
      trim: true,
      default: ''
    },
    pesoAttuale: {
      type: Number, // in kg
      default: 0
    },
    storicoPeso: [
      {
        data: {
          type: Date,
          default: Date.now
        },
        peso: {
          type: Number,
          required: true
        },
        note: String
      }
    ],
    coloreMantello: {
      type: String,
      default: ''
    },
    segniParticolari: {
      type: String,
      default: ''
    },
    allergie: {
      type: [String],
      default: []
    },
    noteCliniche: {
      type: String,
      default: ''
    },
    fotoUrl: {
      type: String,
      default: ''
    },
    proprietarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: [true, 'Il proprietario di riferimento è obbligatorio']
    },
    ambulatorioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true
    },
    stato: {
      type: String,
      enum: ['Attivo', 'Deceduto', 'Trasferito'],
      default: 'Attivo'
    }
  },
  {
    timestamps: true
  }
);

const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema);
export default Pet;
