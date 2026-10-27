import React, { useState } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onBackToLanding }) => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Campi extra per la registrazione
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codiceAlbo, setCodiceAlbo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validazione dinamica dei criteri di sicurezza della password
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)
  };

  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordSecure = passedCount === 5;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const getStrengthInfo = () => {
    if (!password) return { label: 'Non inserita', percent: 0, color: 'var(--slate-300)' };
    if (passedCount <= 1) return { label: 'Molto debole', percent: 20, color: 'var(--rose-500)' };
    if (passedCount === 2) return { label: 'Debole', percent: 40, color: '#f97316' };
    if (passedCount === 3) return { label: 'Media', percent: 60, color: '#eab308' };
    if (passedCount === 4) return { label: 'Buona', percent: 80, color: 'var(--blue-500)' };
    return { label: 'Sicura e Conforme', percent: 100, color: 'var(--emerald-500)' };
  };

  const strengthInfo = getStrengthInfo();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Credenziali non corrette');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !cognome || !email || !password || !confirmPassword) {
      setError('Tutti i campi contrassegnati con asterisco sono obbligatori');
      return;
    }

    if (!isPasswordSecure) {
      setError('La password deve soddisfare tutti i criteri di sicurezza (lunghezza, maiuscola, minuscola, numero e speciale)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password inserite non coincidono. Controlla il campo di conferma');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        nome,
        cognome,
        email,
        password,
        telefono,
        codiceAlbo
      });
    } catch (err) {
      setError(err.message || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('dr.rossi@vetclinic.it');
    setPassword('Password123!');
    try {
      setLoading(true);
      setError('');
      await login('dr.rossi@vetclinic.it', 'Password123!');
    } catch (err) {
      setError(err.message || 'Errore di accesso rapido');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordFocused(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #f0fdfa 0%, #f8fafc 50%, #e2e8f0 100%)',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: isRegistering ? '500px' : '460px',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          background: '#ffffff',
          transition: 'all 0.3s ease'
        }}
      >
        {onBackToLanding && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              id="btn-back-to-landing"
              type="button"
              onClick={onBackToLanding}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: 'var(--slate-500)',
                fontSize: '0.825rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--slate-500)'; }}
            >
              <ArrowLeft size={16} />
              <span>Torna alla presentazione</span>
            </button>
          </div>
        )}

        {/* Header Icon and Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(13, 148, 136, 0.3)',
              marginBottom: '1rem'
            }}
          >
            <Stethoscope size={30} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            VetClinic Pro
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            {isRegistering ? 'Crea il tuo profilo di medico veterinario' : 'Accesso riservato al medico veterinario'}
          </p>
        </div>

        {/* Demo Fast Login Banner (esposto unicamente in ambiente di sviluppo) */}
        {!isRegistering && import.meta.env.DEV && (
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Accesso Dimostrativo Rapido
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>
                  Dott. Marco Rossi (2 ambulatori precaricati)
                </div>
              </div>
              <button
                id="btn-quick-demo-login"
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleQuickDemo}
                disabled={loading}
              >
                Accedi Subito
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-500)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {isRegistering ? (
          /* Form di Registrazione con Regole di Sicurezza Password */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
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
                  type="text"
                  className="form-input"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  placeholder="Rossi"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Professionale *</label>
              <div style={{ position: 'relative' }}>
                <input
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

            {/* Input Password con Toggle Visibilità e Checklist Requisiti */}
            <div className="form-group">
              <label className="form-label">Password di Accesso *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-input-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.4rem',
                    paddingRight: '2.4rem',
                    borderColor: password
                      ? (isPasswordSecure ? 'var(--emerald-500)' : 'var(--amber-500)')
                      : undefined
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  placeholder="Minimo 8 caratteri con maiuscola e speciali"
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
                  onClick={() => setShowPassword(!showPassword)}
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
                  title={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Indicatore visivo e Checklist dei Criteri di Sicurezza */}
              {(isPasswordFocused || password.length > 0) && (
                <div
                  style={{
                    marginTop: '0.6rem',
                    padding: '0.75rem',
                    backgroundColor: isPasswordSecure ? 'var(--emerald-50)' : 'var(--slate-50)',
                    border: `1px solid ${isPasswordSecure ? 'rgba(16, 185, 129, 0.35)' : 'var(--slate-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Strength Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--slate-600)' }}>
                      Sicurezza Password:
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

                  {/* Checklist dei Requisiti */}
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

            {/* Input Conferma Password */}
            <div className="form-group">
              <label className="form-label">Conferma Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-input-confirm-password"
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
                  placeholder="Ripeti la password"
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
                  title={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {passwordsMatch ? (
                    <span style={{ color: 'var(--emerald-600)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={13} strokeWidth={3} /> Le password coincidono
                    </span>
                  ) : (
                    <span style={{ color: 'var(--rose-500)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <X size={13} strokeWidth={3} /> Le password non coincidono
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Iscrizione Albo Vet.</label>
                <input
                  type="text"
                  className="form-input"
                  value={codiceAlbo}
                  onChange={(e) => setCodiceAlbo(e.target.value)}
                  placeholder="Es. MI-1234"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+39 333..."
                />
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Creazione in corso...' : 'Registrati e Accedi'}
            </button>
          </form>
        ) : (
          /* Form di Login */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Indirizzo Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-input-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.rossi@vetclinic.it"
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
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-input-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  onClick={() => setShowPassword(!showPassword)}
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
                  title={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Autenticazione in corso...' : 'Accedi al Gestionale'}
            </button>
          </form>
        )}

        {/* Toggle Register / Login */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          <button
            id="btn-toggle-auth-mode"
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
            onClick={toggleAuthMode}
          >
            {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo veterinario? Registrati'}
          </button>
        </div>
      </div>
    </div>
  );
};
