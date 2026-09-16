import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, User, ShieldCheck, Building2, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('dr.rossi@vetclinic.it');
  const [password, setPassword] = useState('Password123!');
  
  // Campi extra per la registrazione
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codiceAlbo, setCodiceAlbo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!nome || !cognome || !email || !password) {
      setError('Tutti i campi contrassegnati con asterisco sono obbligatori');
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
          maxWidth: '460px',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          background: '#ffffff'
        }}
      >
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

        {/* Demo Fast Login Banner */}
        {!isRegistering && (
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
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {isRegistering ? (
          /* Form di Registrazione */
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
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="veterinario@clinica.it"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Almeno 6 caratteri"
                required
              />
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
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
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
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo veterinario? Registrati'}
          </button>
        </div>
      </div>
    </div>
  );
};
