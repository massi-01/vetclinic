import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ClinicContext = createContext();

export const ClinicProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [activeClinic, setActiveClinic] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClinics = async () => {
    if (!token) {
      setClinics([]);
      setActiveClinic(null);
      return;
    }

    try {
      setLoading(true);
      const res = await api.clinics.getAll();
      if (res.success && Array.isArray(res.data)) {
        setClinics(res.data);
        
        const savedId = localStorage.getItem('active_clinic_id');
        const found = res.data.find((c) => c._id === savedId);
        
        if (found) {
          setActiveClinic(found);
        } else if (res.data.length > 0) {
          setActiveClinic(res.data[0]);
          localStorage.setItem('active_clinic_id', res.data[0]._id);
        } else {
          setActiveClinic(null);
          localStorage.removeItem('active_clinic_id');
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento delle cliniche:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [user, token]);

  const switchClinic = (clinicOrId) => {
    if (!clinicOrId) {
      // Se nullo, vista cumulativa
      setActiveClinic(null);
      localStorage.removeItem('active_clinic_id');
      return;
    }
    const target = typeof clinicOrId === 'string' ? clinics.find((c) => c._id === clinicOrId) : clinicOrId;
    if (target) {
      setActiveClinic(target);
      localStorage.setItem('active_clinic_id', target._id);
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        activeClinic,
        loading,
        switchClinic,
        refreshClinics: fetchClinics
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => useContext(ClinicContext);
