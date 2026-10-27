import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Stethoscope,
  Building2,
  Camera,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  Sparkles,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useClinic } from '../context/ClinicContext';

// Preset di avatar professionali medici veterinari
const PRESET_AVATARS = [
  {
    id: 'vet-1',
    label: 'Dottore 1',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'vet-2',
    label: 'Dottoressa 1',
    url: 'https://images.unsplash.com/photo-1594824813589-9e8790bb4663?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'vet-3',
    label: 'Dottoressa 2',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'vet-4',
    label: 'Dottore 2',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'vet-5',
    label: 'Dottore Senior',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=256&auto=format&fit=crop&q=80'
  },
  {
    id: 'vet-6',
    label: 'Dottoressa Chirurgo',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=256&auto=format&fit=crop&q=80'
  }
];

export const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();
  const { clinics } = useClinic();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'avatar' | 'security' | 'clinics'

  // Stato Dati Personali
  const [nome, setNome] = useState(user?.nome || '');
  const [cognome, setCognome] = useState(user?.cognome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [codiceAlbo, setCodiceAlbo] = useState(user?.codiceAlbo || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Stato Caricamento File e Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileDetails, setUploadedFileDetails] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Stato Modifica Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stato Caricamento ed Errori
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Sincronizza stato locale se l'utente cambia
  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setCognome(user.cognome || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
      setCodiceAlbo(user.codiceAlbo || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Elaborazione del file immagine caricato dall'utente
  const processImageFile = (file) => {
    if (!file) return;
    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('Il file selezionato non è un\'immagine valida (sono supportati JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('L\'immagine originale supera il limite massimo di 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensionamento su Canvas a 400x400 px con ritaglio quadrato centrato
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        const width = img.width;
        const height = img.height;

        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = maxDim;
        canvas.height = maxDim;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxDim, maxDim);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        setAvatarUrl(dataUrl);
        setUploadedFileDetails({
          name: file.name,
          originalSizeKb: Math.round(file.size / 1024),
          optimizedSizeKb: sizeKb,
          originalDimensions: `${width}×${height} px`
        });
      };
      img.onerror = () => {
        setUploadError('Impossibile elaborare l\'immagine selezionata. Riprova con un altro file.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setUploadError('Errore durante la lettura del file dal dispositivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Validazione dinamica sicurezza nuova password
  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword)
  };

  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordSecure = passedCount === 5;
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const getStrengthInfo = () => {
    if (!newPassword) return { label: 'Non inserita', percent: 0, color: 'var(--slate-300)' };
    if (passedCount <= 1) return { label: 'Molto debole', percent: 20, color: 'var(--rose-500)' };
    if (passedCount === 2) return { label: 'Debole', percent: 40, color: '#f97316' };
    if (passedCount === 3) return { label: 'Media', percent: 60, color: '#eab308' };
    if (passedCount === 4) return { label: 'Buona', percent: 80, color: 'var(--blue-500)' };
    return { label: 'Sicura e Conforme', percent: 100, color: 'var(--emerald-500)' };
  };

  const strengthInfo = getStrengthInfo();

  // Salva Modifiche Profilo
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!nome.trim() || !cognome.trim() || !email.trim()) {
      setProfileError('Nome, cognome ed email sono campi obbligatori');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError('');
      await updateProfile({
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        codiceAlbo: codiceAlbo.trim(),
        avatarUrl: avatarUrl.trim()
      });
      toast.success('Dati del profilo e foto aggiornati con successo', 'Profilo Salvato');
      setUploadedFileDetails(null);
    } catch (err) {
      setProfileError(err.message || 'Errore durante il salvataggio del profilo');
      toast.error(err.message || 'Errore durante il salvataggio del profilo');
    } finally {
      setSavingProfile(false);
    }
  };

  // Salva Nuova Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tutti i campi password sono obbligatori');
      return;
    }

    if (!isPasswordSecure) {
      setPasswordError('La nuova password deve soddisfare tutti i requisiti di complessità');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La nuova password e la conferma non coincidono');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('La nuova password deve essere diversa da quella attuale');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      await changePassword({ currentPassword, newPassword });
      toast.success('Password aggiornata con successo! Usa le nuove credenziali al prossimo accesso.', 'Password Modificata');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Errore durante la modifica della password');
      toast.error(err.message || 'Errore durante la modifica della password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Input File Nascosto per Upload */}
      <input
        id="profile-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Hero Header Profilo */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          color: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar Grande con Pulsante Upload Rapido */}
          <div style={{ position: 'relative' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.nome}
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  border: '3px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                👨‍⚕️
              </div>
            )}
            <button
              id="hero-btn-change-avatar"
              type="button"
              onClick={() => {
                setActiveTab('avatar');
                fileInputRef.current?.click();
              }}
              title="Carica o Cambia Foto Profilo"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#ffffff',
                color: 'var(--primary)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Dati Intestazione */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Dott. {user?.nome} {user?.cognome}
              </h1>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {user?.ruolo === 'amministratore' ? '🛡️ Amministratore' : '🩺 Medico Veterinario'}
              </span>
            </div>

            <p style={{ margin: '0.35rem 0 0.75rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
              {user?.email} • {user?.telefono || 'Nessun telefono registrato'}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                Albo: {user?.codiceAlbo || 'Non specificato'}
              </span>
              <span
                style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                Sedi Abilitate: {user?.ambulatori?.length || clinics.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs di Navigazione Interna */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          id="profile-tab-personal"
          type="button"
          onClick={() => setActiveTab('personal')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'personal' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'personal' ? 'var(--primary)' : 'var(--slate-500)',
            fontWeight: activeTab === 'personal' ? '700' : '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <User size={18} />
          <span>Dati Personali & Albo</span>
        </button>

        <button
          id="profile-tab-avatar"
          type="button"
          onClick={() => setActiveTab('avatar')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'avatar' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'avatar' ? 'var(--primary)' : 'var(--slate-500)',
            fontWeight: activeTab === 'avatar' ? '700' : '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Camera size={18} />
          <span>Immagine & Foto Profilo</span>
        </button>

        <button
          id="profile-tab-security"
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'security' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'security' ? 'var(--primary)' : 'var(--slate-500)',
            fontWeight: activeTab === 'security' ? '700' : '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Lock size={18} />
          <span>Sicurezza & Password</span>
        </button>

        <button
          id="profile-tab-clinics"
          type="button"
          onClick={() => setActiveTab('clinics')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clinics' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'clinics' ? 'var(--primary)' : 'var(--slate-500)',
            fontWeight: activeTab === 'clinics' ? '700' : '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '-2px',
            whiteSpace: 'nowrap'
          }}
        >
          <Building2 size={18} />
          <span>Ambulatori Collegati</span>
        </button>
      </div>

      {/* CONTENUTO TAB 1: DATI PERSONALI */}
      {activeTab === 'personal' && (
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)', margin: 0 }}>
              Informazioni Anagrafiche e Professionali
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Modifica i tuoi dettagli operatore e recapiti visibili nelle visite e nei documenti clinici.
            </p>
          </div>

          {profileError && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-500)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
                  id="profile-input-nome"
                  type="text"
                  className="form-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Marco"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cognome *</label>
                <input
                  id="profile-input-cognome"
                  type="text"
                  className="form-input"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  placeholder="Rossi"
                  required
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Email di Accesso e Notifiche *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="profile-input-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="veterinario@clinica.it"
                    required
                  />
                  <Mail
                    size={16}
                    color="var(--slate-400)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Telefono di Reperibilità</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="profile-input-telefono"
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+39 333 1234567"
                  />
                  <Phone
                    size={16}
                    color="var(--slate-400)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Iscrizione Ordine dei Medici Veterinari</label>
                <input
                  id="profile-input-codiceAlbo"
                  type="text"
                  className="form-input"
                  value={codiceAlbo}
                  onChange={(e) => setCodiceAlbo(e.target.value)}
                  placeholder="Es. MI-8492"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ruolo Utente</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.ruolo === 'amministratore' ? 'Amministratore di Sistema' : 'Medico Veterinario Autorizzato'}
                  disabled
                  style={{ backgroundColor: 'var(--slate-100)', cursor: 'not-allowed', color: 'var(--slate-600)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                id="btn-save-profile"
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ minWidth: '160px' }}
              >
                <Save size={16} />
                <span>{savingProfile ? 'Salvataggio in corso...' : 'Salva Modifiche'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENUTO TAB 2: IMMAGINE PROFILO & UPLOAD FOTO PERSONALIZZATA */}
      {activeTab === 'avatar' && (
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)', margin: 0 }}>
              Carica o Modifica la Foto del Profilo
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Carica la tua fotografia professionale dal tuo computer o smartphone, seleziona un avatar pronto oppure specifica un URL esterno.
            </p>
          </div>

          {uploadError && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-500)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Sezione Dropzone Upload File */}
          <div
            id="avatar-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--slate-300)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--primary-50)' : 'var(--slate-50)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.75rem'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: isDragging ? 'var(--primary-light)' : 'rgba(13, 148, 136, 0.1)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}
            >
              <Upload size={28} />
            </div>

            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
              Trascina qui la tua foto personalizzata oppure clicca per sfogliare
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto 1rem auto' }}>
              Formati supportati: JPG, PNG, WEBP, GIF (fino a 10MB). L'immagine verrà ritagliata e ottimizzata automaticamente a 400×400 px per una nitidezza perfetta.
            </div>

            <button
              id="btn-browse-photo"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageIcon size={15} /> Sfoglia File dal Dispositivo
            </button>
          </div>

          {/* Anteprima e Dettagli Foto Attuale / Caricata */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginBottom: '1.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  flexShrink: 0
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Anteprima Foto Profilo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={38} color="var(--slate-400)" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                  {uploadedFileDetails ? 'Nuova foto pronta per il salvataggio' : (avatarUrl ? 'Foto profilo attualmente impostata' : 'Nessuna foto impostata')}
                </div>
                {uploadedFileDetails ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>📁 File: <strong>{uploadedFileDetails.name}</strong></span>
                    <span>📐 Risoluzione originale: {uploadedFileDetails.originalDimensions} • Ottimizzata a 400×400 px</span>
                    <span style={{ color: 'var(--emerald-600)', fontWeight: '600' }}>⚡ Peso ottimizzato: {uploadedFileDetails.optimizedSizeKb} KB</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                    {avatarUrl ? 'La foto è visibile nella barra di navigazione e nei documenti delle visite' : 'Verrà mostrata l\'icona standard con le iniziali'}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {user?.avatarUrl && avatarUrl !== user.avatarUrl && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setAvatarUrl(user.avatarUrl);
                    setUploadedFileDetails(null);
                  }}
                  title="Ripristina la foto precedentemente salvata"
                >
                  <RotateCcw size={14} /> Ripristina
                </button>
              )}

              {avatarUrl && (
                <button
                  id="btn-remove-avatar"
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setAvatarUrl('');
                    setUploadedFileDetails(null);
                  }}
                  style={{ color: 'var(--rose-500)' }}
                  title="Rimuovi la foto profilo"
                >
                  <Trash2 size={14} /> Rimuovi Foto
                </button>
              )}
            </div>
          </div>

          {/* Galleria Avatar Medici Predefiniti */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
              Oppure seleziona un avatar medico predefinito:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatarUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setUploadedFileDetails(null);
                    }}
                    style={{
                      padding: '0.85rem',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--slate-200)'}`,
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-50)' : '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        margin: '0 auto 0.5rem auto',
                        display: 'block'
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? '700' : '600', color: isSelected ? 'var(--primary)' : 'var(--slate-700)' }}>
                      {preset.label}
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <Check size={12} strokeWidth={3} /> Selezionato
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inserimento Facoltativo URL Esterno */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div className="form-group" style={{ maxWidth: '600px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Oppure inserisci un URL web diretto:</label>
              <input
                id="profile-input-avatarUrl"
                type="url"
                className="form-input"
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setUploadedFileDetails(null);
                }}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              id="btn-save-avatar"
              type="button"
              className="btn btn-primary"
              disabled={savingProfile}
              onClick={handleSaveProfile}
              style={{ minWidth: '170px' }}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Salvataggio in corso...' : 'Salva Nuova Foto'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENUTO TAB 3: SICUREZZA & PASSWORD */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)', margin: 0 }}>
              Modifica Password di Accesso
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Per garantire la massima sicurezza del gestionale e dei dati sanitari, la password deve rispettare i criteri di complessità previsti.
            </p>
          </div>

          {passwordError && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-500)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword}>
            {/* Password Attuale */}
            <div className="form-group" style={{ maxWidth: '460px' }}>
              <label className="form-label">Password Attuale *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-input-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Inserisci la password corrente"
                  required
                />
                <Lock
                  size={16}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    color: 'var(--slate-400)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showCurrentPassword ? 'Nascondi' : 'Mostra'}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nuova Password */}
            <div className="form-group" style={{ maxWidth: '460px' }}>
              <label className="form-label">Nuova Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-input-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.4rem',
                    paddingRight: '2.4rem',
                    borderColor: newPassword
                      ? (isPasswordSecure ? 'var(--emerald-500)' : 'var(--amber-500)')
                      : undefined
                  }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimo 8 caratteri con maiuscola e speciali"
                  required
                />
                <KeyRound
                  size={16}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    color: 'var(--slate-400)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showNewPassword ? 'Nascondi' : 'Mostra'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Box Criteri di Sicurezza Nuova Password */}
              {newPassword.length > 0 && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.75rem',
                    backgroundColor: isPasswordSecure ? 'var(--emerald-50)' : 'var(--slate-50)',
                    border: `1px solid ${isPasswordSecure ? 'rgba(16, 185, 129, 0.35)' : 'var(--slate-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--slate-600)' }}>
                      Grado di Sicurezza:
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: strengthInfo.color }}>
                      {strengthInfo.label}
                    </span>
                  </div>

                  <div
                    style={{
                      height: '5px',
                      backgroundColor: 'var(--slate-200)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      marginBottom: '0.65rem'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${strengthInfo.percent}%`,
                        backgroundColor: strengthInfo.color,
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: passwordChecks.minLength ? 'var(--emerald-600)' : 'var(--slate-500)',
                        fontWeight: passwordChecks.minLength ? '600' : '400'
                      }}
                    >
                      {passwordChecks.minLength ? (
                        <Check size={13} color="var(--emerald-500)" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--slate-300)' }} />
                      )}
                      <span>Lunghezza minima di 8 caratteri</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: passwordChecks.hasUppercase ? 'var(--emerald-600)' : 'var(--slate-500)',
                        fontWeight: passwordChecks.hasUppercase ? '600' : '400'
                      }}
                    >
                      {passwordChecks.hasUppercase ? (
                        <Check size={13} color="var(--emerald-500)" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--slate-300)' }} />
                      )}
                      <span>Almeno una lettera maiuscola (A-Z)</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: passwordChecks.hasLowercase ? 'var(--emerald-600)' : 'var(--slate-500)',
                        fontWeight: passwordChecks.hasLowercase ? '600' : '400'
                      }}
                    >
                      {passwordChecks.hasLowercase ? (
                        <Check size={13} color="var(--emerald-500)" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--slate-300)' }} />
                      )}
                      <span>Almeno una lettera minuscola (a-z)</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: passwordChecks.hasNumber ? 'var(--emerald-600)' : 'var(--slate-500)',
                        fontWeight: passwordChecks.hasNumber ? '600' : '400'
                      }}
                    >
                      {passwordChecks.hasNumber ? (
                        <Check size={13} color="var(--emerald-500)" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--slate-300)' }} />
                      )}
                      <span>Almeno un numero (0-9)</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        color: passwordChecks.hasSpecial ? 'var(--emerald-600)' : 'var(--slate-500)',
                        fontWeight: passwordChecks.hasSpecial ? '600' : '400'
                      }}
                    >
                      {passwordChecks.hasSpecial ? (
                        <Check size={13} color="var(--emerald-500)" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--slate-300)' }} />
                      )}
                      <span>Almeno un carattere speciale (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conferma Nuova Password */}
            <div className="form-group" style={{ maxWidth: '460px' }}>
              <label className="form-label">Conferma Nuova Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.4rem',
                    paddingRight: '2.4rem',
                    borderColor: confirmPassword
                      ? (passwordsMatch ? 'var(--emerald-500)' : 'var(--rose-500)')
                      : undefined
                  }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ripeti la nuova password"
                  required
                />
                <Lock
                  size={16}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    color: 'var(--slate-400)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showConfirmPassword ? 'Nascondi' : 'Mostra'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
                  {passwordsMatch ? (
                    <span style={{ color: 'var(--emerald-600)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={13} strokeWidth={3} /> Le nuove password coincidono
                    </span>
                  ) : (
                    <span style={{ color: 'var(--rose-500)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <X size={13} strokeWidth={3} /> Le password non coincidono
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.5rem' }}>
              <button
                id="btn-submit-change-password"
                type="submit"
                className="btn btn-primary"
                disabled={savingPassword}
                style={{ minWidth: '180px' }}
              >
                <KeyRound size={16} />
                <span>{savingPassword ? 'Salvataggio...' : 'Aggiorna Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENUTO TAB 4: AMBULATORI COLLEGATI */}
      {activeTab === 'clinics' && (
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)', margin: 0 }}>
              Sedi Cliniche e Strutture Associate
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Ambulatori veterinari a cui il tuo profilo ha accesso per visite, appuntamenti e cartelle cliniche.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {clinics.map((clinic) => (
              <div
                key={clinic._id}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--slate-50)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: clinic.coloreTema || 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700'
                    }}
                  >
                    🏥
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                      {clinic.nome}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {clinic.citta} ({clinic.cap || 'CAP'})
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <div>📍 {clinic.indirizzo}</div>
                  <div>📞 {clinic.telefono}</div>
                  {clinic.email && <div>✉️ {clinic.email}</div>}
                  {clinic.partitaIva && <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>P.IVA: {clinic.partitaIva}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
