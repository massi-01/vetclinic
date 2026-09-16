import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Heart,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Filter
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { api } from '../services/api';

const TIME_SLOTS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  '17:30', '18:00', '18:30', '19:00', '19:30'
];

const STATUS_COLORS = {
  'Prenotato': { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary)' },
  'Confermato': { bg: '#e0e7ff', color: '#4338ca', border: '#6366f1' },
  'In Attesa': { bg: 'var(--amber-50)', color: 'var(--amber-500)', border: 'var(--amber-500)' },
  'In Visita': { bg: 'var(--purple-50)', color: 'var(--purple-500)', border: 'var(--purple-500)' },
  'Completato': { bg: 'var(--emerald-50)', color: 'var(--emerald-500)', border: 'var(--emerald-500)' },
  'Annullato': { bg: 'var(--rose-50)', color: 'var(--rose-500)', border: 'var(--rose-500)' }
};

export const AgendaPage = ({ onSelectPet, onNewAppointment, onEditAppointment }) => {
  const { activeClinic } = useClinic();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = { data: selectedDate };
      if (activeClinic?._id) params.clinicId = activeClinic._id;

      const res = await api.appointments.getAll(params);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento appuntamenti agenda:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, activeClinic]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await api.appointments.updateStatus(appointmentId, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, stato: newStatus } : a))
        );
      }
    } catch (err) {
      alert('Errore aggiornamento stato: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vuoi davvero cancellare questo appuntamento?')) return;
    try {
      const res = await api.appointments.delete(id);
      if (res.success) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert('Errore cancellazione: ' + err.message);
    }
  };

  // Helper to extract HH:MM string from appointment
  const getAppointmentTimeStr = (apt) => {
    if (apt.oraInizio) return apt.oraInizio;
    if (!apt.dataOra) return '';
    const d = new Date(apt.dataOra);
    if (isNaN(d)) return '';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  // Group appointments by slot or nearest slot
  const getAppointmentsForSlot = (slot) => {
    return appointments.filter((apt) => {
      if (statusFilter !== 'ALL' && apt.stato !== statusFilter) return false;
      const t = getAppointmentTimeStr(apt);
      // exact match or within 15 min bucket
      return t === slot;
    });
  };

  // Summary counts
  const countInAttesa = appointments.filter((a) => a.stato === 'In Attesa').length;
  const countInVisita = appointments.filter((a) => a.stato === 'In Visita').length;
  const countCompletati = appointments.filter((a) => a.stato === 'Completato').length;

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDateTitle = dateObj.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)', textTransform: 'capitalize' }}>
            {formattedDateTitle}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Agenda Oraria {activeClinic ? `per ${activeClinic.nome}` : ''} • {appointments.length} appuntamenti
          </p>
        </div>

        <button
          id="btn-add-appointment-page"
          className="btn btn-primary"
          onClick={() => onNewAppointment({ date: selectedDate, time: '09:00' })}
        >
          <Plus size={16} /> Nuovo Appuntamento
        </button>
      </div>

      {/* Date Navigation & Filter Controls */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        {/* Day Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            id="btn-prev-day"
            className="btn btn-icon btn-secondary"
            onClick={handlePrevDay}
            title="Giorno precedente"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            id="btn-today"
            className="btn btn-secondary"
            onClick={handleToday}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
          >
            Oggi
          </button>
          <button
            id="btn-next-day"
            className="btn btn-icon btn-secondary"
            onClick={handleNextDay}
            title="Giorno successivo"
          >
            <ChevronRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
            <CalendarIcon size={16} color="var(--slate-400)" />
            <input
              id="input-agenda-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.6rem',
                fontSize: '0.85rem',
                outline: 'none',
                color: 'var(--slate-800)'
              }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--slate-400)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--slate-600)' }}>Stato:</span>
          <select
            id="select-filter-status"
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tutti gli stati</option>
            <option value="Prenotato">Prenotati</option>
            <option value="Confermato">Confermati</option>
            <option value="In Attesa">In Sala d'Attesa</option>
            <option value="In Visita">In Visita</option>
            <option value="Completato">Completati</option>
            <option value="Annullato">Annullati</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Bar */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>Totale Oggi</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)' }}>{appointments.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--amber-50)', color: 'var(--amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>In Sala d'Attesa</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--amber-500)' }}>{countInAttesa}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--purple-50)', color: 'var(--purple-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>In Visita Ora</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--purple-500)' }}>{countInVisita}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--emerald-50)', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>Completati</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--emerald-500)' }}>{countCompletati}</div>
          </div>
        </div>
      </div>

      {/* Interactive Time Schedule / Slot Grid */}
      <div className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--primary)" /> Slot Orari & Prenotazioni (08:30 - 19:30)
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            Fai clic su uno slot libero per prenotare
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
            Caricamento agenda per {formattedDateTitle}...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TIME_SLOTS.map((slot) => {
              const slotAppointments = getAppointmentsForSlot(slot);
              const isOccupied = slotAppointments.length > 0;

              return (
                <div
                  key={slot}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    minHeight: isOccupied ? 'auto' : '44px',
                    transition: 'var(--transition-fast)',
                    backgroundColor: isOccupied ? 'transparent' : '#ffffff'
                  }}
                >
                  {/* Slot Time Label */}
                  <div
                    style={{
                      width: '75px',
                      flexShrink: 0,
                      backgroundColor: 'var(--slate-50)',
                      borderRight: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      color: 'var(--slate-700)',
                      padding: '0.5rem'
                    }}
                  >
                    {slot}
                  </div>

                  {/* Slot Content Area */}
                  <div style={{ flex: 1, padding: '0.35rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                    {isOccupied ? (
                      slotAppointments.map((apt) => {
                        const pet = apt.animaleId;
                        const owner = apt.proprietarioId || pet?.proprietarioId;
                        const styleConfig = STATUS_COLORS[apt.stato] || STATUS_COLORS['Prenotato'];

                        return (
                          <div
                            key={apt._id}
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: styleConfig.bg,
                              borderLeft: `4px solid ${styleConfig.border}`
                            }}
                          >
                            {/* Pet & Owner Details */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px' }}>
                              <div
                                onClick={() => pet && onSelectPet && onSelectPet(pet)}
                                style={{
                                  cursor: pet ? 'pointer' : 'default',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem'
                                }}
                              >
                                <span style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                                  {pet?.nome || 'Paziente'}
                                </span>
                                {pet?.specie && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                    ({pet.specie} {pet.razza ? `• ${pet.razza}` : ''})
                                  </span>
                                )}
                              </div>

                              {owner && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <User size={13} />
                                  <span>{owner.cognome || owner.nome}</span>
                                  {owner.telefono && <span style={{ color: 'var(--slate-400)' }}>({owner.telefono})</span>}
                                </div>
                              )}
                            </div>

                            {/* Procedure & Duration */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  backgroundColor: '#ffffff',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--slate-700)'
                                }}
                              >
                                {apt.motivo}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                {apt.durataMinuti || 30} min
                              </span>
                            </div>

                            {/* Status and Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {/* Quick Status Selector */}
                              <select
                                className="form-select"
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  borderRadius: 'var(--radius-sm)',
                                  color: styleConfig.color,
                                  borderColor: styleConfig.border,
                                  backgroundColor: '#ffffff',
                                  width: 'auto'
                                }}
                                value={apt.stato}
                                onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                              >
                                <option value="Prenotato">📅 Prenotato</option>
                                <option value="Confermato">👍 Confermato</option>
                                <option value="In Attesa">⏳ In Attesa</option>
                                <option value="In Visita">🩺 In Visita</option>
                                <option value="Completato">✅ Completato</option>
                                <option value="Annullato">❌ Annullato</option>
                              </select>

                              {/* Edit / Delete */}
                              <button
                                className="btn btn-icon btn-secondary"
                                style={{ width: '28px', height: '28px', padding: 0 }}
                                onClick={() => onEditAppointment(apt)}
                                title="Modifica Appuntamento"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className="btn btn-icon btn-secondary"
                                style={{ width: '28px', height: '28px', padding: 0, color: 'var(--rose-500)' }}
                                onClick={() => handleDelete(apt._id)}
                                title="Elimina Appuntamento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Empty Slot - Click to Book */
                      <div
                        onClick={() => onNewAppointment({ date: selectedDate, time: slot })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--slate-400)',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--slate-400)';
                        }}
                      >
                        <Plus size={14} />
                        <span>Slot Libero • Fai clic per fissare appuntamento alle {slot}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
