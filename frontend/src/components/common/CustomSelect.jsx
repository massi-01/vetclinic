import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Seleziona un\'opzione...',
  disabled = false,
  searchable = undefined, // default true if > 6 options
  className = '',
  style = {},
  id,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to { value, label, sublabel, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value ?? opt._id ?? '',
      label: opt.label ?? opt.nome ?? opt.name ?? String(opt.value || ''),
      sublabel: opt.sublabel ?? (opt.specie ? `${opt.specie}${opt.razza ? ` • ${opt.razza}` : ''}` : undefined),
      icon: opt.icon,
      badge: opt.badge
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Determine if search is shown
  const isSearchEnabled = searchable !== undefined ? searchable : normalizedOptions.length > 6;

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchLabel = opt.label?.toLowerCase().includes(term);
    const matchSublabel = opt.sublabel?.toLowerCase().includes(term);
    return matchLabel || matchSublabel;
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchEnabled && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchEnabled]);

  const handleSelect = (optVal) => {
    onChange({ target: { name: name || id, value: optVal } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: isOpen ? '1.5px solid var(--primary, #0d9488)' : '1px solid var(--border-color, #cbd5e1)',
          borderRadius: '10px',
          color: selectedOption ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #94a3b8)',
          fontSize: '0.92rem',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(13, 148, 136, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span style={{ fontWeight: 500, color: 'var(--text-main, #0f172a)' }}>
                {selectedOption.label}
              </span>
              {selectedOption.sublabel && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                  ({selectedOption.sublabel})
                </span>
              )}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            marginLeft: '0.5rem'
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #cbd5e1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {isSearchEnabled && (
            <div
              style={{
                padding: '0.5rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Search size={15} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.88rem',
                  width: '100%',
                  color: 'var(--text-main, #0f172a)'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #94a3b8)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '0.85rem',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted, #94a3b8)'
                }}
              >
                Nessuna opzione trovata
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                      color: isSelected ? 'var(--primary, #0d9488)' : 'var(--text-main, #1e293b)',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      {opt.icon}
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div>{opt.label}</div>
                        {opt.sublabel && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 400 }}>
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} style={{ color: 'var(--primary, #0d9488)', flexShrink: 0, marginLeft: '0.5rem' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
