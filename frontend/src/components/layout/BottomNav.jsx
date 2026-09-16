import React from 'react';
import { LayoutDashboard, Dog, ClipboardList, Pill, Users, Building2 } from 'lucide-react';

export const BottomNav = ({ currentTab, onTabChange }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'pets', label: 'Pazienti', icon: Dog },
    { id: 'visits', label: 'Visite', icon: ClipboardList },
    { id: 'therapies', label: 'Terapie', icon: Pill },
    { id: 'owners', label: 'Clienti', icon: Users },
    { id: 'clinics', label: 'Cliniche', icon: Building2 }
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
