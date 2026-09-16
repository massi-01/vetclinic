import React from 'react';
import { Calendar, Clock, Stethoscope, HeartPulse, User, Pill, Edit2, Trash2 } from 'lucide-react';

export const VisitCard = ({ visit, onSelectPet, onEdit, onDelete }) => {
  const pet = visit.animaleId;
  const vet = visit.veterinarioId;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--slate-900)' }}>
              {new Date(visit.data).toLocaleDateString('it-IT')}
            </span>
            <span className="badge badge-status-completed">{visit.tipoVisita}</span>
            <span className="badge badge-other" style={{ fontSize: '0.7rem' }}>
              <Clock size={11} style={{ marginRight: '3px' }} /> {visit.ora}
            </span>
          </div>

          {pet && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', cursor: 'pointer' }}
              onClick={() => onSelectPet && onSelectPet(pet)}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)' }}>
                {pet.nome}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                ({pet.specie} - {pet.razza})
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {onEdit && (
            <button
              className="btn btn-sm btn-secondary btn-icon"
              title="Modifica"
              onClick={() => onEdit(visit)}
            >
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-danger btn-icon"
              title="Elimina"
              onClick={() => onDelete(visit._id)}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Motivo & Diagnosi */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--slate-800)' }}>
          {visit.motivo}
        </div>
        {visit.diagnosi && (
          <div style={{ marginTop: '0.4rem', padding: '0.55rem 0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--slate-700)' }}>
            <strong>Diagnosi: </strong>{visit.diagnosi}
          </div>
        )}
      </div>

      {/* Parametri Vitali */}
      {visit.parametriVitali && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
          {visit.parametriVitali.temperatura && (
            <span style={{ background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px' }}>
              T: <strong>{visit.parametriVitali.temperatura}°C</strong>
            </span>
          )}
          {visit.parametriVitali.frequenzaCardiaca && (
            <span style={{ background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px' }}>
              FC: <strong>{visit.parametriVitali.frequenzaCardiaca} bpm</strong>
            </span>
          )}
          {visit.parametriVitali.pesoRilevato && (
            <span style={{ background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px' }}>
              Peso: <strong>{visit.parametriVitali.pesoRilevato} kg</strong>
            </span>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.65rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
        <div>
          {vet && <span>Dott. {vet.nome} {vet.cognome}</span>}
        </div>
        <div>
          {visit.ambulatorioId?.nome && <span>{visit.ambulatorioId.nome}</span>}
        </div>
      </div>
    </div>
  );
};
