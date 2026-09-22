import React from 'react';
import {
  Stethoscope,
  Calendar,
  FileText,
  Syringe,
  Users,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle2,
  ChevronRight,
  Award,
  Zap,
  HeartPulse
} from 'lucide-react';

export const LandingPage = ({ onNavigateToLogin, onQuickDemo }) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* Navigation Bar */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Stethoscope size={22} strokeWidth={2.5} />
            </div>
            <span>VetClinic <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Pro</span></span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary)',
                border: '1px solid rgba(13, 148, 136, 0.2)'
              }}
            >
              Cloud 2026
            </span>
          </div>

          <nav className="landing-nav-links">
            <span className="landing-nav-link" onClick={() => scrollToSection('features')}>
              Funzionalità
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('preview')}>
              Anteprima
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('workflow')}>
              Come Funziona
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('testimonials')}>
              Testimonianze
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('security')}>
              Sicurezza
            </span>
          </nav>

          <div className="landing-nav-actions">
            {onQuickDemo && (
              <button
                id="btn-nav-demo"
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onQuickDemo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Sparkles size={14} color="var(--primary)" />
                <span className="hide-mobile">Demo Rapida</span>
              </button>
            )}
            <button
              id="btn-nav-login"
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onNavigateToLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Accedi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">
          <Sparkles size={15} color="var(--primary)" />
          <span>La piattaforma gestionale cloud per medici veterinari e cliniche moderne</span>
        </div>

        <h1 className="landing-title">
          Gestisci la tua clinica con <br />
          <span className="landing-title-gradient">precisione, eleganza e velocità</span>
        </h1>

        <p className="landing-subtitle">
          Dalla cartella clinica digitale e richiami vaccinali automatici all'agenda appuntamenti oraria
          in tempo reale senza overbooking. Tutto in un ambiente clinico sicuro, intuitivo e sempre accessibile.
        </p>

        <div className="landing-hero-ctas">
          <button
            id="btn-hero-login"
            type="button"
            className="btn btn-primary"
            onClick={onNavigateToLogin}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <span>Accedi al Gestionale</span>
            <ArrowRight size={18} />
          </button>

          {onQuickDemo ? (
            <button
              id="btn-hero-demo"
              type="button"
              className="btn btn-secondary"
              onClick={onQuickDemo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <Sparkles size={18} color="var(--primary)" />
              <span>Prova la Demo Live</span>
            </button>
          ) : (
            <button
              id="btn-hero-demo-nav"
              type="button"
              className="btn btn-secondary"
              onClick={onNavigateToLogin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <Sparkles size={18} color="var(--primary)" />
              <span>Inizia Subito</span>
            </button>
          )}

          <button
            id="btn-hero-features"
            type="button"
            className="btn btn-ghost"
            onClick={() => scrollToSection('features')}
          >
            Esplora le Funzionalità ↓
          </button>
        </div>

        {/* Live Interface Preview Mockup */}
        <div id="preview" className="landing-preview-container">
          <div className="landing-preview-glow" />
          <div className="landing-preview-card">
            {/* Top Window Bar */}
            <div className="landing-preview-bar">
              <div className="landing-preview-dots">
                <div className="landing-preview-dot" style={{ backgroundColor: '#ef4444' }} />
                <div className="landing-preview-dot" style={{ backgroundColor: '#f59e0b' }} />
                <div className="landing-preview-dot" style={{ backgroundColor: '#10b981' }} />
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--slate-500)',
                  backgroundColor: '#ffffff',
                  padding: '0.2rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--slate-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                vetclinic.app/dashboard • Ambulatorio San Francesco
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '600' }}>
                Dr. Marco Rossi
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="landing-preview-body">
              {/* Mini KPI row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>Appuntamenti Oggi</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '2px' }}>
                    8 <span style={{ fontSize: '0.75rem', color: 'var(--emerald-500)', fontWeight: '700' }}>• 5 Confermati</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>Pazienti Registrati</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
                    142 <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '500' }}>cani & gatti</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>Richiami Vaccinali</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--amber-500)', marginTop: '2px' }}>
                    3 <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '500' }}>nei prossimi 7 gg</span>
                  </div>
                </div>
              </div>

              {/* Agenda & Patient snapshot */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem'
                }}
              >
                {/* Agenda Box */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: '#ffffff',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} color="var(--primary)" />
                      Orario Ambulatorio di Oggi
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', backgroundColor: 'var(--primary-50)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      Slot 30 min
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--slate-900)' }}>09:00 - Luna (Golden Retriever)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-600)' }}>Visita ortopedica di controllo</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Confermato</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--amber-500)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--slate-900)' }}>10:00 - Milo (Gatto Europeo)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-600)' }}>Richiamo vaccinale trivalente</div>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Prenotato</span>
                    </div>
                  </div>
                </div>

                {/* Patient Profile Card */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: '#ffffff',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={15} color="var(--primary)" />
                      Cartella Paziente in Evidenza
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: '600' }}>
                      ID #38026
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      🐕
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--slate-900)' }}>Luna</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Cane • Golden Retriever • 3 anni (28.4 kg)</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-app)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--slate-700)' }}>
                    <strong>Ultima Diagnosi:</strong> Lieve zoppia arto anteriore dx risolta. Terapia FANS completata.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">Moduli Funzionali Completi</span>
          <h2 className="landing-section-title">Tutto quello che serve al tuo ambulatorio, in un unico posto</h2>
          <p className="landing-section-desc">
            Sviluppato per velocizzare il lavoro del veterinario: schede cliniche chiare,
            gestione visite, richiami e agenda sincronizzata.
          </p>
        </div>

        <div className="landing-grid-3">
          {/* Feature 1 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <FileText size={24} />
            </div>
            <h3 className="landing-feature-title">Cartella Clinica Digitale</h3>
            <p className="landing-feature-text">
              Anamnesi prossima e remota, rilievo parametri vitali, peso con storico evolutivo e diagnosi complete.
              Ogni animale ha una cartella organizzata e consultabile in pochi secondi.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Calendar size={24} />
            </div>
            <h3 className="landing-feature-title">Agenda & Anti-Overbooking</h3>
            <p className="landing-feature-text">
              Calendario a slot orari con aggiornamento reattivo immediato. Cambio rapido dello stato
              (Prenotato, Confermato, In Corso, Completato, Cancellato) e filtri veloci per una gestione senza stress.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Syringe size={24} />
            </div>
            <h3 className="landing-feature-title">Vaccini & Piani Terapeutici</h3>
            <p className="landing-feature-text">
              Registrazione vaccini con calcolo automatico della data di scadenza e richiamo.
              Prescrizione terapie farmacologiche con indicazione posologia e durata del trattamento.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Users size={24} />
            </div>
            <h3 className="landing-feature-title">Anagrafica Pazienti & Proprietari</h3>
            <p className="landing-feature-text">
              Ricerca rapida per nome animale, proprietario, specie o numero di microchip.
              Gestione multi-pet per proprietario con storico unificato di tutte le prestazioni.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Building2 size={24} />
            </div>
            <h3 className="landing-feature-title">Gestione Multi-Sede & Staff</h3>
            <p className="landing-feature-text">
              Operi in più ambulatori o cliniche? Passa da una struttura all'altra con un click.
              Invita colleghi veterinari e approva o rifiuta le richieste di accesso al team.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <ShieldCheck size={24} />
            </div>
            <h3 className="landing-feature-title">Sicurezza & Isolamento Dati</h3>
            <p className="landing-feature-text">
              Autenticazione basata su JWT con controlli avanzati anti-BOLA/IDOR per garantire
              che ogni clinica acceda esclusivamente ai propri dati sanitari e anagrafici.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="workflow" className="landing-section" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)', margin: '2rem auto' }}>
        <div className="landing-section-header">
          <span className="landing-section-tag">Flusso Operativo</span>
          <h2 className="landing-section-title">Inizia a lavorare in 3 semplici passaggi</h2>
          <p className="landing-section-desc">
            Nessuna configurazione complessa: VetClinic Pro è pronto all'uso dal primo accesso.
          </p>
        </div>

        <div className="landing-steps-container">
          <div className="landing-step-card">
            <div className="landing-step-number">1</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
              Accedi o Registrati
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
              Crea il tuo profilo di medico veterinario con iscrizione all'albo oppure accedi subito all'ambiente dimostrativo precaricato.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">2</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
              Associa la tua Clinica
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
              Inserisci i dati della tua struttura veterinaria o invia una richiesta di adesione a una clinica partner già registrata.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">3</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
              Gestisci l'Ambulatorio
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
              Registra pazienti, compila cartelle cliniche, pianifica visite in agenda ed emetti terapie con la massima velocità.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">Testimonianze dei Medici</span>
          <h2 className="landing-section-title">Cosa dicono i colleghi veterinari</h2>
          <p className="landing-section-desc">
            Ambulatori e cliniche che hanno semplificato la loro routine medica quotidiana.
          </p>
        </div>

        <div className="landing-testimonials-grid">
          <div className="landing-testimonial-card">
            <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: '1.6', fontStyle: 'italic' }}>
              "La reattività dell'agenda con il cambio stato in tempo reale e il sistema di richiami vaccinali
              hanno azzerato le sovrapposizioni e migliorato la fidelizzazione dei nostri clienti."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                EB
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                  Dott.ssa Elena Bianchi
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Direttore Sanitario • Clinica Veterinaria San Carlo
                </div>
              </div>
            </div>
          </div>

          <div className="landing-testimonial-card">
            <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)', lineHeight: '1.6', fontStyle: 'italic' }}>
              "Un gestionale finalmente moderno, leggero e utilizzabile anche da smartphone e tablet durante
              le visite ambulatoriali. L'isolamento per clinica e la protezione dei dati garantiscono massima tranquillità."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--blue-50)', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                MF
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                  Dott. Marco Ferri
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Medico Veterinario Chirurgo • Ambulatorio Pegaso
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Highlights */}
      <section id="security" className="landing-section" style={{ paddingTop: '1rem' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem'
          }}
        >
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>Standard di Sicurezza Clinica Elevati</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              Dati sanitari protetti e conformi alle normative
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.55' }}>
              Tutti i dati sanitari dei pazienti e le anagrafiche dei clienti sono crittografati e protetti
              da rigide policy di autorizzazione a livello di tenant (multi-clinica).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="var(--emerald-500)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-700)' }}>Conforme GDPR Sanità</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="var(--emerald-500)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-700)' }}>Protezione Anti-BOLA/IDOR</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="var(--emerald-500)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-700)' }}>Crittografia JWT & HTTPS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Box */}
      <section className="landing-section" style={{ paddingBottom: '2rem' }}>
        <div className="landing-cta-box">
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.3rem)', fontWeight: '800', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            Pronto a trasformare la gestione della tua clinica?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem auto', position: 'relative', zIndex: 1 }}>
            Accedi ora al gestionale o prova l'ambiente demo per scoprire quanto tempo puoi risparmiare ogni giorno.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <button
              id="btn-landing-cta-login"
              type="button"
              className="btn btn-primary"
              onClick={onNavigateToLogin}
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--slate-900)',
                fontWeight: '800',
                padding: '0.9rem 2rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
              }}
            >
              Accedi Subito a VetClinic Pro →
            </button>
            {onQuickDemo && (
              <button
                id="btn-landing-cta-demo"
                type="button"
                className="btn btn-secondary"
                onClick={onQuickDemo}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  padding: '0.9rem 1.75rem'
                }}
              >
                Accesso Dimostrativo Rapido
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="landing-logo-icon" style={{ width: '32px', height: '32px' }}>
              <Stethoscope size={18} />
            </div>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--slate-900)' }}>
              VetClinic Pro
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              © 2026 Tutti i diritti riservati
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Sistemi Cloud Operativi (99.9% Uptime)</span>
            </div>
            <span>Privacy & GDPR</span>
            <span>Supporto Medico</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
