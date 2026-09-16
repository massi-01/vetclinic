import React, { useState, useEffect } from 'react';
import {
  X,
  Dog,
  Phone,
  Mail,
  Calendar,
  Weight,
  AlertCircle,
  FileText,
  Pill,
  ClipboardList,
  TrendingUp,
  Edit2,
  PlusCircle,
  Clock,
  User,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';

export const PetDetailModal = ({
  isOpen,
  onClose,
  petId,
  onEditPet,
  onNewVisit,
  onNewTherapy
}) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('anagrafica'); // 'anagrafica', 'visite', 'terapie', 'peso'
  const [error, setError] = useState('');

  const loadPetDetails = async () => {
    if (!petId) return;
    try {
      setLoading(true);
      const res = await api.pets.getById(petId);
      if (res.success) {
        setPet(res.data);
      }
    } catch (err) {
      setError(err.message || 'Errore nel caricamento cartella clinica');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && petId) {
      loadPetDetails();
      setActiveTab('anagrafica');
    }
  }, [isOpen, petId]);

  if (!isOpen) return null;

  const owner = pet?.proprietarioId;
  const visits = pet?.visite || [];
  const therapies = pet?.terapie || [];
  const weightHistory = pet?.storicoPeso || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem'
              }}
            >
              🐾
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{pet?.nome || 'Cartella Clinica'}</h2>
                <span className="badge badge-status-active">{pet?.specie}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                {pet?.razza} • {pet?.sesso} {pet?.microchip && `• Chip: ${pet.microchip}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {pet && (
              <button
                id="btn-edit-pet-details"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  onEditPet(pet);
                }}
              >
                <Edit2 size={14} /> Modifica
              </button>
            )}
            <button className="btn btn-icon btn-secondary" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ padding: '0.75rem 1.5rem 0 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
          <div className="tabs-header" style={{ marginBottom: 0 }}>
            <button
              id="tab-btn-anagrafica"
              className={`tab-btn ${activeTab === 'anagrafica' ? 'active' : ''}`}
              onClick={() => setActiveTab('anagrafica')}
            >
              <FileText size={15} style={{ display: 'inline', marginRight: '5px' }} />
              Dati & Proprietario
            </button>
            <button
              id="tab-btn-visite"
              className={`tab-btn ${activeTab === 'visite' ? 'active' : ''}`}
              onClick={() => setActiveTab('visite')}
            >
              <ClipboardList size={15} style={{ display: 'inline', marginRight: '5px' }} />
              Visite ({visits.length})
            </button>
            <button
              id="tab-btn-terapie"
              className={`tab-btn ${activeTab === 'terapie' ? 'active' : ''}`}
              onClick={() => setActiveTab('terapie')}
            >
              <Pill size={15} style={{ display: 'inline', marginRight: '5px' }} />
              Terapie ({therapies.length})
            </button>
            <button
              id="tab-btn-peso"
              className={`tab-btn ${activeTab === 'peso' ? 'active' : ''}`}
              onClick={() => setActiveTab('peso')}
            >
              <TrendingUp size={15} style={{ display: 'inline', marginRight: '5px' }} />
              Curva Peso ({weightHistory.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ minHeight: '320px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
              Caricamento cartella clinica...
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', backgroundColor: 'var(--rose-50)', color: 'var(--rose-500)', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          ) : (
            <>
              {/* TAB 1: Anagrafica & Proprietario */}
              {activeTab === 'anagrafica' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Proprietario Box */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, var(--slate-50) 0%, #ffffff 100%)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.15rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Proprietario Referente
                    </div>
                    {owner ? (
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                          {owner.cognome} {owner.nome}
                        </div>
                        {owner.codiceFiscale && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                            C.F.: {owner.codiceFiscale}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <a
                            href={`tel:${owner.telefono}`}
                            className="btn btn-sm btn-secondary"
                            style={{ textDecoration: 'none' }}
                          >
                            <Phone size={14} color="var(--primary)" /> {owner.telefono}
                          </a>
                          {owner.email && (
                            <a
                              href={`mailto:${owner.email}`}
                              className="btn btn-sm btn-secondary"
                              style={{ textDecoration: 'none' }}
                            >
                              <Mail size={14} color="var(--primary)" /> {owner.email}
                            </a>
                          )}
                          {owner.indirizzo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--slate-600)', alignSelf: 'center' }}>
                              <MapPin size={14} color="var(--slate-400)" /> {owner.indirizzo}, {owner.citta}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Nessun proprietario collegato</div>
                    )}
                  </div>

                  {/* Informazioni Cliniche Paziente */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <div className="card" style={{ padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: '600' }}>DATA DI NASCITA</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)', marginTop: '2px' }}>
                        {pet?.dataNascita ? new Date(pet.dataNascita).toLocaleDateString('it-IT') : 'Non specificata'}
                      </div>
                    </div>

                    <div className="card" style={{ padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: '600' }}>PESO ATTUALE</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)', marginTop: '2px' }}>
                        {pet?.pesoAttuale ? `${pet.pesoAttuale} kg` : 'N/D'}
                      </div>
                    </div>

                    <div className="card" style={{ padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: '600' }}>COLORE / MANTELLO</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)', marginTop: '2px' }}>
                        {pet?.coloreMantello || 'Non specificato'}
                      </div>
                    </div>
                  </div>

                  {/* Allergie */}
                  {pet?.allergie && pet.allergie.length > 0 && (
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--rose-50)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-500)', fontWeight: '700', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} /> ALLERGIE & INTOLLERANZE SEGNALATE
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                        {pet.allergie.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Note cliniche */}
                  <div className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Anamnesi Remota & Note Cliniche
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--slate-700)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {pet?.noteCliniche || 'Nessuna nota clinica registrata per questo paziente.'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Storico Visite Cliniche */}
              {activeTab === 'visite' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                      Cronologia Visite ed Esami
                    </h3>
                    <button
                      id="btn-add-visit-from-details"
                      className="btn btn-sm btn-primary"
                      onClick={() => onNewVisit(pet)}
                    >
                      <PlusCircle size={14} /> Registra Nuova Visita
                    </button>
                  </div>

                  {visits.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--slate-400)', background: 'var(--slate-50)', borderRadius: 'var(--radius-lg)' }}>
                      Nessuna visita registrata per questo animale.
                    </div>
                  ) : (
                    visits.map((visit) => (
                      <div
                        key={visit._id}
                        className="card"
                        style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                                {new Date(visit.data).toLocaleDateString('it-IT')}
                              </span>
                              <span className="badge badge-status-completed">{visit.tipoVisita}</span>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--slate-800)', marginTop: '4px' }}>
                              {visit.motivo}
                            </h4>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Ore {visit.ora}</span>
                        </div>

                        {visit.diagnosi && (
                          <div style={{ marginTop: '0.65rem', padding: '0.6rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                            <strong>Diagnosi: </strong> {visit.diagnosi}
                          </div>
                        )}

                        {visit.parametriVitali && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                            {visit.parametriVitali.temperatura && <span>Temp: <strong>{visit.parametriVitali.temperatura}°C</strong></span>}
                            {visit.parametriVitali.frequenzaCardiaca && <span>FC: <strong>{visit.parametriVitali.frequenzaCardiaca} bpm</strong></span>}
                            {visit.parametriVitali.pesoRilevato && <span>Peso: <strong>{visit.parametriVitali.pesoRilevato} kg</strong></span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Terapie & Farmaci */}
              {activeTab === 'terapie' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                      Trattamenti Farmacologici
                    </h3>
                    <button
                      id="btn-add-therapy-from-details"
                      className="btn btn-sm btn-primary"
                      onClick={() => onNewTherapy(pet)}
                    >
                      <PlusCircle size={14} /> Prescrivi Farmaco
                    </button>
                  </div>

                  {therapies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--slate-400)', background: 'var(--slate-50)', borderRadius: 'var(--radius-lg)' }}>
                      Nessuna terapia farmacologica assegnata.
                    </div>
                  ) : (
                    therapies.map((therapy) => (
                      <div
                        key={therapy._id}
                        className="card"
                        style={{
                          padding: '1rem',
                          borderLeft: therapy.attiva ? '4px solid var(--emerald-500)' : '4px solid var(--slate-300)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Pill size={18} color={therapy.attiva ? 'var(--emerald-500)' : 'var(--slate-400)'} />
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                              {therapy.nomeFarmaco}
                            </h4>
                            <span className={`badge ${therapy.attiva ? 'badge-status-active' : 'badge-other'}`}>
                              {therapy.attiva ? 'In Corso' : 'Conclusa'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                            Dal {new Date(therapy.dataInizio).toLocaleDateString('it-IT')} ({therapy.durataGiorni} giorni)
                          </span>
                        </div>

                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                          <div><strong>Dosaggio & Posologia: </strong>{therapy.dosaggio} • {therapy.posologia}</div>
                          <div><strong>Via di Somministrazione: </strong>{therapy.viaSomministrazione}</div>
                          {therapy.istruzioni && (
                            <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--slate-500)' }}>
                              "{therapy.istruzioni}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Curva del Peso */}
              {activeTab === 'peso' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                        Storico Pesate
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                        Il peso viene salvato automaticamente ad ogni visita o controllo
                      </p>
                    </div>
                  </div>

                  {weightHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--slate-400)', background: 'var(--slate-50)', borderRadius: 'var(--radius-lg)' }}>
                      Nessuna pesata registrata.
                    </div>
                  ) : (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Data</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Peso (kg)</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Note Rilevazione</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weightHistory.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-700)' }}>
                                {item.data ? new Date(item.data).toLocaleDateString('it-IT') : '-'}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                                {item.peso} kg
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-500)' }}>
                                {item.note || 'Controllo'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Chiudi
          </button>
          <button
            id="btn-quick-new-visit"
            className="btn btn-primary"
            onClick={() => onNewVisit(pet)}
          >
            <PlusCircle size={15} /> Nuova Visita
          </button>
        </div>
      </div>
    </div>
  );
};
