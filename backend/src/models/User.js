import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      trim: true
    },
    cognome: {
      type: String,
      required: [true, 'Il cognome è obbligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La password è obbligatoria'],
      minlength: 6
    },
    telefono: {
      type: String,
      trim: true
    },
    codiceAlbo: {
      type: String,
      trim: true,
      default: ''
    },
    ruolo: {
      type: String,
      enum: ['veterinario', 'amministratore'],
      default: 'veterinario'
    },
    ambulatori: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
      }
    ],
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
