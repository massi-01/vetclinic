import React from 'react';
import { Dog, Cat, Eye, Calendar, Phone, Weight, User, AlertTriangle, PlusCircle } from 'lucide-react';

const getSpeciesBadge = (specie) => {
  switch (specie) {
    case 'Cane':
      return { className: 'badge-dog', icon: '🐶', label: 'Cane' };
    case 'Gatto':
      return { className: 'badge-cat', icon: '🐱', label: 'Gatto' };
    case 'Coniglio':
      return { className: 'badge-rabbit', icon: '🐰', label: 'Coniglio' };
    case 'Volatile':
      return { className: 'badge-bird', icon: '🦜', label: 'Volatile' };
    case 'Rettile':
      return { className: 'badge-reptile', icon: '🦎', label: 'Rettile' };
    default:
      return { className: 'badge-other', icon: '🐾', label: specie || 'Altro' };
  }
};

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (diffMonths < 12) {
    return `${Math.max(1, diffMonths)} mesi`;
  }
  const years = Math.floor(diffMonths / 12);
  const remMonths = diffMonths % 12;
  return remMonths > 0 ? `${years} anni e ${remMonths} m.` : `${years} anni`;
};

export const PetCard = ({ pet, onSelect, onNewVisit }) => {
  const badgeInfo = getSpeciesBadge(pet.specie);
  const age = calculateAge(pet.dataNascita);
  const owner = pet.proprietarioId;

  return (
    <div className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {pet.fotoUrl ? (
              <img src={pet.fotoUrl} alt={pet.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              badgeInfo.icon
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--slate-900)' }}>{pet.nome}</h3>
              <span className={`badge ${badgeInfo.className}`}>{badgeInfo.label}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '500' }}>
              {pet.razza} • {pet.sesso}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals & Quick Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          backgroundColor: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          fontSize: '0.8rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)' }}>
          <Weight size={14} color="var(--primary)" />
          <span><strong>{pet.pesoAttuale ? `${pet.pesoAttuale} kg` : 'N/D'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{age || 'Età non specificata'}</span>
        </div>
      </div>

      {/* Microchip & Allergies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
        {pet.microchip ? (
          <div>
            <span style={{ color: 'var(--slate-400)', fontWeight: '600' }}>Chip: </span>
            <code style={{ background: 'var(--slate-100)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>
              {pet.microchip}
            </code>
          </div>
        ) : (
          <div style={{ color: 'var(--slate-400)' }}>Nessun microchip registrato</div>
        )}

        {pet.allergie && pet.allergie.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--rose-500)', fontWeight: '600' }}>
            <AlertTriangle size={13} />
            <span>Allergie: {pet.allergie.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Owner Info & Actions */}
      <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {owner ? (
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={13} color="var(--slate-400)" />
            <span style={{ fontWeight: '600', color: 'var(--slate-700)' }}>
              {owner.cognome} {owner.nome}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Proprietario sconosciuto</div>
        )}

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            id={`btn-new-visit-pet-${pet._id}`}
            className="btn btn-sm btn-secondary"
            title="Nuova Visita"
            onClick={(e) => {
              e.stopPropagation();
              onNewVisit(pet);
            }}
          >
            <PlusCircle size={14} color="var(--primary)" />
          </button>
          <button
            id={`btn-view-pet-${pet._id}`}
            className="btn btn-sm btn-primary"
            onClick={() => onSelect(pet)}
          >
            <Eye size={14} /> Cartella
          </button>
        </div>
      </div>
    </div>
  );
};
