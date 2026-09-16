import React from 'react';
import { User, Phone, Mail, MapPin, Dog, PlusCircle, Edit2, Trash2 } from 'lucide-react';

export const OwnerCard = ({ owner, onAddPet, onEdit, onDelete, onFilterPetsByOwner }) => {
  return (
    <div className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--blue-50)',
              color: 'var(--blue-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.1rem'
            }}
          >
            {owner.nome.charAt(0)}{owner.cognome.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              {owner.cognome} {owner.nome}
            </h3>
            {owner.codiceFiscale && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontFamily: 'monospace' }}>
                {owner.codiceFiscale}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {onEdit && (
            <button className="btn btn-sm btn-secondary btn-icon" onClick={() => onEdit(owner)}>
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-danger btn-icon" onClick={() => onDelete(owner._id)}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
        <a
          href={`tel:${owner.telefono}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
        >
          <Phone size={14} /> {owner.telefono}
        </a>

        {owner.email && (
          <a
            href={`mailto:${owner.email}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-600)', textDecoration: 'none' }}
          >
            <Mail size={14} /> {owner.email}
          </a>
        )}

        {owner.citta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.8rem' }}>
            <MapPin size={14} /> {owner.indirizzo ? `${owner.indirizzo}, ` : ''}{owner.citta}
          </div>
        )}
      </div>

      {owner.note && (
        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', backgroundColor: 'var(--slate-50)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
          {owner.note}
        </div>
      )}

      {/* Footer Quick Actions */}
      <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onFilterPetsByOwner && onFilterPetsByOwner(owner)}
          style={{ fontSize: '0.75rem' }}
        >
          <Dog size={13} /> Visualizza Animali
        </button>

        <button
          className="btn btn-sm btn-primary"
          onClick={() => onAddPet(owner)}
          style={{ fontSize: '0.75rem' }}
        >
          <PlusCircle size={13} /> Aggiungi Animale
        </button>
      </div>
    </div>
  );
};
