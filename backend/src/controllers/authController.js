import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../services/dataStore.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'vetclinic_jwt_super_secret_key_2026_dev';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Inserisci email e password'
      });
    }

    const user = await dataStore.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const token = generateToken(user._id);

    // Recupera i dettagli degli ambulatori associati
    const fullUser = await dataStore.findUserById(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: fullUser._id,
        nome: fullUser.nome,
        cognome: fullUser.cognome,
        email: fullUser.email,
        telefono: fullUser.telefono,
        codiceAlbo: fullUser.codiceAlbo,
        ruolo: fullUser.ruolo,
        avatarUrl: fullUser.avatarUrl,
        ambulatori: fullUser.ambulatori || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante il login',
      error: error.message
    });
  }
};

export const register = async (req, res) => {
  try {
    const { nome, cognome, email, password, telefono, codiceAlbo, ambulatorioNome, ambulatorioCitta } = req.body;

    const userExists = await dataStore.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata nel sistema'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crea prima l'ambulatorio di default se specificato
    let clinicId = null;
    if (ambulatorioNome) {
      const newClinic = await dataStore.createClinic({
        nome: ambulatorioNome,
        indirizzo: 'Da completare',
        citta: ambulatorioCitta || 'Milano',
        telefono: telefono || '00000000',
        email: email
      });
      clinicId = newClinic._id;
    }

    const newUser = await dataStore.createUser({
      nome,
      cognome,
      email,
      password: hashedPassword,
      telefono,
      codiceAlbo,
      ambulatori: clinicId ? [clinicId] : []
    });

    const token = generateToken(newUser._id);
    const fullUser = await dataStore.findUserById(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: fullUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await dataStore.findUserById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message
    });
  }
};
