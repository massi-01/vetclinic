import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../services/dataStore.js';
import { getJwtSecret } from '../config/jwt.js';
import { logger } from '../utils/logger.js';
import { validatePasswordSecurity } from '../utils/passwordValidator.js';

const generateToken = (id) => {
  const secret = getJwtSecret();
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
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
      logger.warn(`Tentativo di login fallito per email inesistente: [${email}]`);
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Tentativo di login fallito (password errata) per: [${email}]`);
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const token = generateToken(user._id);

    // Recupera i dettagli degli ambulatori associati
    const fullUser = await dataStore.findUserById(user._id);

    logger.info(`Login effettuato con successo: [${user.email}] (${user.nome} ${user.cognome})`);

    // Audit log per accesso operatore
    await dataStore.logAudit({
      azione: 'LOGIN',
      entita: 'User',
      entitaId: user._id.toString(),
      descrizione: `Accesso operatore veterinario effettuato: ${user.nome} ${user.cognome}`,
      operatoreId: user._id,
      operatoreNome: `${user.nome} ${user.cognome}`,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get ? req.get('user-agent') || '' : ''
    });

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
    logger.error('Errore durante il login operatore', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login',
      error: error.message
    });
  }
};

export const register = async (req, res) => {
  try {
    const { nome, cognome, email, password, telefono, codiceAlbo } = req.body;

    if (!nome || !cognome || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, cognome, email e password sono campi obbligatori'
      });
    }

    // Validazione dei requisiti di sicurezza della password
    const passwordValidation = validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
      logger.warn(`Registrazione rifiutata per password debole da [${email}]: ${passwordValidation.errors.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors.join('. '),
        errors: passwordValidation.errors
      });
    }

    const userExists = await dataStore.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata nel sistema'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await dataStore.createUser({
      nome,
      cognome,
      email,
      password: hashedPassword,
      telefono: telefono || '',
      codiceAlbo: codiceAlbo || '',
      ambulatori: []
    });

    const token = generateToken(newUser._id);
    const fullUser = await dataStore.findUserById(newUser._id);

    logger.info(`Nuovo medico veterinario registrato: [${newUser.email}] (${newUser.nome} ${newUser.cognome})`);

    // Audit log per registrazione utente
    await dataStore.logAudit({
      azione: 'CREATE',
      entita: 'User',
      entitaId: newUser._id.toString(),
      descrizione: `Registrazione nuovo profilo veterinario: ${newUser.nome} ${newUser.cognome} (${newUser.email})`,
      operatoreId: newUser._id,
      operatoreNome: `${newUser.nome} ${newUser.cognome}`,
      dettagli: { email: newUser.email, codiceAlbo: newUser.codiceAlbo },
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get ? req.get('user-agent') || '' : ''
    });

    res.status(201).json({
      success: true,
      token,
      user: fullUser
    });
  } catch (error) {
    logger.error('Errore durante la registrazione del medico veterinario', error);
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
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utente non trovato' });
    }
    const safeUser = {
      _id: user._id,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      telefono: user.telefono,
      codiceAlbo: user.codiceAlbo,
      ruolo: user.ruolo,
      avatarUrl: user.avatarUrl,
      ambulatori: user.ambulatori || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nome, cognome, email, telefono, codiceAlbo, avatarUrl } = req.body;
    const userId = req.user._id;

    if (!nome || !cognome || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome, cognome ed email sono campi obbligatori'
      });
    }

    const currentEmail = req.user.email?.toLowerCase();
    const newEmail = email.toLowerCase().trim();

    if (newEmail !== currentEmail) {
      const existingUser = await dataStore.findUserByEmail(newEmail);
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Questo indirizzo email è già utilizzato da un altro utente'
        });
      }
    }

    const updated = await dataStore.updateUser(userId, {
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: newEmail,
      telefono: telefono !== undefined ? telefono.trim() : req.user.telefono,
      codiceAlbo: codiceAlbo !== undefined ? codiceAlbo.trim() : req.user.codiceAlbo,
      avatarUrl: avatarUrl !== undefined ? avatarUrl.trim() : req.user.avatarUrl
    });

    logger.info(`Profilo aggiornato per l'operatore [${updated.email}] (${updated.nome} ${updated.cognome})`);

    await dataStore.logAudit({
      azione: 'UPDATE',
      entita: 'User',
      entitaId: userId.toString(),
      descrizione: `Aggiornamento anagrafica profilo: ${updated.nome} ${updated.cognome}`,
      operatoreId: userId,
      operatoreNome: `${updated.nome} ${updated.cognome}`,
      dettagli: { email: updated.email, telefono: updated.telefono, codiceAlbo: updated.codiceAlbo },
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get ? req.get('user-agent') || '' : ''
    });

    const safeUser = {
      _id: updated._id,
      nome: updated.nome,
      cognome: updated.cognome,
      email: updated.email,
      telefono: updated.telefono,
      codiceAlbo: updated.codiceAlbo,
      ruolo: updated.ruolo,
      avatarUrl: updated.avatarUrl,
      ambulatori: updated.ambulatori || []
    };

    res.status(200).json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: safeUser
    });
  } catch (error) {
    logger.error("Errore durante l'aggiornamento del profilo operatore", error);
    res.status(500).json({
      success: false,
      message: "Errore durante l'aggiornamento del profilo",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Inserisci sia la password attuale che la nuova password'
      });
    }

    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logger.warn(`Tentativo fallito di cambio password per [${user.email}]: password attuale errata`);
      return res.status(400).json({
        success: false,
        message: 'La password attuale inserita non è corretta'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nuova password deve essere diversa da quella attuale'
      });
    }

    const validation = validatePasswordSecurity(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join('. '),
        errors: validation.errors
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await dataStore.updateUser(userId, { password: hashedPassword });

    logger.info(`Password modificata con successo per l'operatore [${user.email}]`);

    await dataStore.logAudit({
      azione: 'UPDATE',
      entita: 'User',
      entitaId: userId.toString(),
      descrizione: 'Modifica password di sicurezza account',
      operatoreId: userId,
      operatoreNome: `${user.nome} ${user.cognome}`,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get ? req.get('user-agent') || '' : ''
    });

    res.status(200).json({
      success: true,
      message: 'Password aggiornata con successo'
    });
  } catch (error) {
    logger.error('Errore durante la modifica della password operatore', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la modifica della password',
      error: error.message
    });
  }
};
