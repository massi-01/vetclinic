import React from 'react';
import { Pill, Calendar, Clock, CheckCircle2, AlertCircle, Edit2, Trash2 } from 'lucide-react';

export const TherapyCard = ({ therapy, onSelectPet, onToggleStatus, onEdit, onDelete }) => {
  const pet = therapy.animaleId;
  const start = new Date(therapy.dataInizio);
  const days = therapy.durataGiorni || 7;
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const diffTime = end - today;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = remainingDays <= 0;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        borderLeft: therapy.attiva
          ? isExpired
            ? '4px solid var(--amber-500)'
            : '4px solid var(--emerald-500)'
          : '4px solid var(--slate-300)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: therapy.attiva ? 'var(--emerald-50)' : 'var(--slate-100)',
              color: therapy.attiva ? 'var(--emerald-500)' : 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Pill size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                {therapy.nomeFarmaco}
              </h4>
              <span className={`badge ${therapy.attiva ? (isExpired ? 'badge-status-pending' : 'badge-status-active') : 'badge-other'}`}>
                {therapy.attiva ? (isExpired ? 'In Scadenza' : 'Attiva') : 'Conclusa'}
              </span>
            </div>
            {therapy.principioAttivo && (
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Principio: {therapy.principioAttivo}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {onEdit && (
            <button className="btn btn-sm btn-secondary btn-icon" onClick={() => onEdit(therapy)}>
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-danger btn-icon" onClick={() => onDelete(therapy._id)}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Target Pet */}
      {pet && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
          onClick={() => onSelectPet && onSelectPet(pet)}
        >
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{pet.nome}</span>
            <span style={{ color: 'var(--slate-500)', marginLeft: '6px' }}>({pet.specie} - {pet.razza})</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Apri scheda ➔</span>
        </div>
      )}

      {/* Posology & Administration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
        <div>
          <strong>Dosaggio: </strong>{therapy.dosaggio} ({therapy.viaSomministrazione})
        </div>
        <div>
          <strong>Posologia: </strong>{therapy.posologia}
        </div>
        {therapy.istruzioni && (
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontStyle: 'italic', marginTop: '2px' }}>
            "{therapy.istruzioni}"
          </div>
        )}
      </div>

      {/* Dates and Countdown */}
      <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.65rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <div style={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} /> Inizio: {start.toLocaleDateString('it-IT')} ({therapy.durataGiorni} gg)
        </div>

        {therapy.attiva && (
          <div style={{ fontWeight: '700', color: isExpired ? 'var(--amber-500)' : 'var(--emerald-500)' }}>
            {isExpired ? 'Termine superato' : `Ancora ${remainingDays} gg`}
          </div>
        )}
      </div>
    </div>
  );
};
