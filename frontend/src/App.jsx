import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ErrorPage } from './pages/ErrorPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PetsPage } from './pages/PetsPage';
import { VisitsPage } from './pages/VisitsPage';
import { TherapiesPage } from './pages/TherapiesPage';
import { OwnersPage } from './pages/OwnersPage';
import { ClinicsPage } from './pages/ClinicsPage';
import { AgendaPage } from './pages/AgendaPage';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

import { PetFormModal } from './components/pets/PetFormModal';
import { PetDetailModal } from './components/pets/PetDetailModal';
import { VisitFormModal } from './components/visits/VisitFormModal';
import { TherapyFormModal } from './components/therapies/TherapyFormModal';
import { OwnerFormModal } from './components/owners/OwnerFormModal';
import { ClinicFormModal } from './components/clinics/ClinicFormModal';
import { VaccinationFormModal } from './components/vaccinations/VaccinationFormModal';
import { AppointmentFormModal } from './components/appointments/AppointmentFormModal';

import { Plus } from 'lucide-react';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const MainLayout = () => {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'login'

  // Ogni volta che l'utente non è autenticato o effettua il logout, mostra la pagina di presentazione
  useEffect(() => {
    if (!user) {
      setPublicView('landing');
    }
  }, [user]);

  // Monitoraggio connessione di rete in tempo reale
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Connessione a Internet ripristinata con successo', 'Di nuovo online');
    };
    const handleOffline = () => {
      toast.warning('Connessione assente. Alcune funzionalità potrebbero non rispondere.', 'Dispositivo Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Modal States
  const [isPetFormOpen, setIsPetFormOpen] = useState(false);
  const [petFormInitialData, setPetFormInitialData] = useState(null);
  const [petFormDefaultOwnerId, setPetFormDefaultOwnerId] = useState(null);

  const [isPetDetailOpen, setIsPetDetailOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);

  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [visitDefaultPet, setVisitDefaultPet] = useState(null);
  const [visitInitialData, setVisitInitialData] = useState(null);

  const [isTherapyFormOpen, setIsTherapyFormOpen] = useState(false);
  const [therapyDefaultPet, setTherapyDefaultPet] = useState(null);
  const [therapyInitialData, setTherapyInitialData] = useState(null);

  const [isOwnerFormOpen, setIsOwnerFormOpen] = useState(false);
  const [ownerInitialData, setOwnerInitialData] = useState(null);

  const [isClinicFormOpen, setIsClinicFormOpen] = useState(false);
  const [clinicInitialData, setClinicInitialData] = useState(null);

  const [isVaccinationFormOpen, setIsVaccinationFormOpen] = useState(false);
  const [vaccinationDefaultPet, setVaccinationDefaultPet] = useState(null);
  const [vaccinationInitialData, setVaccinationInitialData] = useState(null);

  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [appointmentDefaultDate, setAppointmentDefaultDate] = useState(null);
  const [appointmentDefaultTime, setAppointmentDefaultTime] = useState(null);
  const [appointmentDefaultPet, setAppointmentDefaultPet] = useState(null);
  const [appointmentInitialData, setAppointmentInitialData] = useState(null);

  const [petFilterOwnerId, setPetFilterOwnerId] = useState(null);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);
  const [lastSavedAppointment, setLastSavedAppointment] = useState(null);

  const triggerDataRefresh = () => {
    setDataRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', gap: '1rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)', fontSize: '1.8rem' }}>
          🩺
        </div>
        <LoadingSpinner size="md" message="Inizializzazione gestionale VetClinic..." />
      </div>
    );
  }

  if (!user) {
    if (publicView === 'login') {
      return <LoginPage onBackToLanding={() => setPublicView('landing')} />;
    }
    return (
      <LandingPage
        onNavigateToLogin={() => setPublicView('login')}
        onQuickDemo={
          import.meta.env.DEV
            ? async () => {
                try {
                  await login('dr.rossi@vetclinic.it', 'Password123!');
                } catch (err) {
                  setPublicView('login');
                }
              }
            : null
        }
      />
    );
  }

  // Handlers
  const handleOpenNewPet = (defaultOwner = null) => {
    setPetFormInitialData(null);
    setPetFormDefaultOwnerId(defaultOwner?._id || null);
    setIsPetFormOpen(true);
  };

  const handleEditPet = (pet) => {
    setPetFormInitialData(pet);
    setIsPetFormOpen(true);
  };

  const handleOpenPetDetail = (pet) => {
    setSelectedPetId(pet._id);
    setIsPetDetailOpen(true);
  };

  const handleOpenNewVisit = (pet = null) => {
    setVisitInitialData(null);
    setVisitDefaultPet(pet);
    setIsVisitFormOpen(true);
  };

  const handleEditVisit = (visit) => {
    setVisitInitialData(visit);
    setVisitDefaultPet(visit.animaleId);
    setIsVisitFormOpen(true);
  };

  const handleOpenNewTherapy = (pet = null) => {
    setTherapyInitialData(null);
    setTherapyDefaultPet(pet);
    setIsTherapyFormOpen(true);
  };

  const handleEditTherapy = (therapy) => {
    setTherapyInitialData(therapy);
    setTherapyDefaultPet(therapy.animaleId);
    setIsTherapyFormOpen(true);
  };

  const handleOpenNewOwner = () => {
    setOwnerInitialData(null);
    setIsOwnerFormOpen(true);
  };

  const handleEditOwner = (owner) => {
    setOwnerInitialData(owner);
    setIsOwnerFormOpen(true);
  };

  const handleOpenNewClinic = () => {
    setClinicInitialData(null);
    setIsClinicFormOpen(true);
  };

  const handleEditClinic = (clinic) => {
    setClinicInitialData(clinic);
    setIsClinicFormOpen(true);
  };

  const handleOpenNewVaccination = (pet = null) => {
    setVaccinationInitialData(null);
    setVaccinationDefaultPet(pet);
    setIsVaccinationFormOpen(true);
  };

  const handleEditVaccination = (vac) => {
    setVaccinationInitialData(vac);
    setVaccinationDefaultPet(vac.animaleId);
    setIsVaccinationFormOpen(true);
  };

  const handleOpenNewAppointment = (options = {}) => {
    setAppointmentInitialData(null);
    setAppointmentDefaultDate(options?.date || null);
    setAppointmentDefaultTime(options?.time || null);
    setAppointmentDefaultPet(options?.pet || null);
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (apt) => {
    setAppointmentInitialData(apt);
    setAppointmentDefaultDate(apt.data || null);
    setAppointmentDefaultTime(apt.oraInizio || null);
    setAppointmentDefaultPet(apt.animaleId || null);
    setIsAppointmentFormOpen(true);
  };

  const handleFilterPetsByOwner = (owner) => {
    setPetFilterOwnerId(owner._id);
    setCurrentTab('pets');
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setPetFilterOwnerId(null);
          setCurrentTab(tab);
        }}
        onNewVisit={() => handleOpenNewVisit()}
        onNewPet={() => handleOpenNewPet()}
      />

      {/* Main Column */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <Navbar onOpenNewClinic={handleOpenNewClinic} />

        {/* Page Content Rendering */}
        <main>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => {
                setPetFilterOwnerId(null);
                setCurrentTab(tab);
              }}
              onNewVisit={handleOpenNewVisit}
              onNewPet={handleOpenNewPet}
              onNewOwner={handleOpenNewOwner}
              onNewTherapy={handleOpenNewTherapy}
              onNewAppointment={handleOpenNewAppointment}
              onNewVaccination={handleOpenNewVaccination}
              onSelectPet={handleOpenPetDetail}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaPage
              onSelectPet={handleOpenPetDetail}
              onNewAppointment={handleOpenNewAppointment}
              onEditAppointment={handleEditAppointment}
              refreshTrigger={dataRefreshTrigger}
              lastSavedAppointment={lastSavedAppointment}
              onStatusChange={triggerDataRefresh}
            />
          )}

          {currentTab === 'pets' && (
            <PetsPage
              onSelectPet={handleOpenPetDetail}
              onNewVisit={handleOpenNewVisit}
              onNewPet={handleOpenNewPet}
              filterByOwnerId={petFilterOwnerId}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {currentTab === 'visits' && (
            <VisitsPage
              onSelectPet={handleOpenPetDetail}
              onNewVisit={handleOpenNewVisit}
              onEditVisit={handleEditVisit}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {currentTab === 'therapies' && (
            <TherapiesPage
              onSelectPet={handleOpenPetDetail}
              onNewTherapy={handleOpenNewTherapy}
              onEditTherapy={handleEditTherapy}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {currentTab === 'owners' && (
            <OwnersPage
              onAddPetForOwner={handleOpenNewPet}
              onNewOwner={handleOpenNewOwner}
              onEditOwner={handleEditOwner}
              onFilterPetsByOwner={handleFilterPetsByOwner}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {currentTab === 'clinics' && (
            <ClinicsPage
              onNewClinic={handleOpenNewClinic}
              onEditClinic={handleEditClinic}
            />
          )}

          {currentTab === 'error-404' && (
            <ErrorPage
              code="404"
              onNavigateTab={setCurrentTab}
              showSwitcher={true}
            />
          )}

          {currentTab === 'error-403' && (
            <ErrorPage
              code="403"
              onNavigateTab={setCurrentTab}
              showSwitcher={true}
            />
          )}

          {currentTab === 'error-500' && (
            <ErrorPage
              code="500"
              onNavigateTab={setCurrentTab}
              showSwitcher={true}
            />
          )}

          {currentTab === 'error-offline' && (
            <ErrorPage
              code="offline"
              onNavigateTab={setCurrentTab}
              showSwitcher={true}
            />
          )}

          {currentTab === 'error-preview' && (
            <ErrorPage
              code="404"
              onNavigateTab={setCurrentTab}
              showSwitcher={true}
            />
          )}

          {![
            'dashboard',
            'agenda',
            'pets',
            'visits',
            'therapies',
            'owners',
            'clinics',
            'error-404',
            'error-403',
            'error-500',
            'error-offline',
            'error-preview'
          ].includes(currentTab) && (
            <ErrorPage
              code="404"
              title="Sezione Non Trovata"
              description={`La scheda o sezione "${currentTab}" richiesta non esiste nel gestionale.`}
              onNavigateTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) for fast visit creation */}
      <button
        id="mobile-fab-new-visit"
        className="fab"
        title="Nuova Visita Rapida"
        onClick={() => handleOpenNewVisit()}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setPetFilterOwnerId(null);
          setCurrentTab(tab);
        }}
      />

      {/* Modals */}
      <PetFormModal
        isOpen={isPetFormOpen}
        onClose={() => setIsPetFormOpen(false)}
        initialData={petFormInitialData}
        defaultOwnerId={petFormDefaultOwnerId}
        onPetSaved={(savedPet) => {
          if (selectedPetId === savedPet._id) {
            setSelectedPetId(savedPet._id);
          }
          toast.success('Dati paziente salvati con successo');
          triggerDataRefresh();
        }}
      />

      <PetDetailModal
        isOpen={isPetDetailOpen}
        onClose={() => setIsPetDetailOpen(false)}
        petId={selectedPetId}
        onEditPet={handleEditPet}
        onNewVisit={handleOpenNewVisit}
        onNewTherapy={handleOpenNewTherapy}
        onNewVaccination={handleOpenNewVaccination}
      />

      <VisitFormModal
        isOpen={isVisitFormOpen}
        onClose={() => setIsVisitFormOpen(false)}
        defaultPet={visitDefaultPet}
        initialData={visitInitialData}
        onVisitSaved={(savedVisit) => {
          if (savedVisit?.appuntamento) {
            setLastSavedAppointment(savedVisit.appuntamento);
          }
          toast.success('Visita clinica registrata e sincronizzata in agenda');
          triggerDataRefresh();
        }}
      />

      <TherapyFormModal
        isOpen={isTherapyFormOpen}
        onClose={() => setIsTherapyFormOpen(false)}
        defaultPet={therapyDefaultPet}
        initialData={therapyInitialData}
        onTherapySaved={() => {
          toast.success('Prescrizione terapeutica salvata con successo');
          triggerDataRefresh();
        }}
      />

      <OwnerFormModal
        isOpen={isOwnerFormOpen}
        onClose={() => setIsOwnerFormOpen(false)}
        initialData={ownerInitialData}
        onOwnerSaved={() => {
          toast.success('Anagrafica proprietario salvata con successo');
          triggerDataRefresh();
        }}
      />

      <ClinicFormModal
        isOpen={isClinicFormOpen}
        onClose={() => setIsClinicFormOpen(false)}
        initialData={clinicInitialData}
        onClinicSaved={() => {
          toast.success('Dati ambulatorio aggiornati con successo');
          triggerDataRefresh();
        }}
      />

      <VaccinationFormModal
        isOpen={isVaccinationFormOpen}
        onClose={() => setIsVaccinationFormOpen(false)}
        defaultPet={vaccinationDefaultPet}
        initialData={vaccinationInitialData}
        onVaccinationSaved={() => {
          if (selectedPetId) {
            setSelectedPetId(selectedPetId);
          }
          toast.success('Vaccino registrato nel libretto sanitario');
          triggerDataRefresh();
        }}
      />

      <AppointmentFormModal
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
        defaultDate={appointmentDefaultDate}
        defaultTime={appointmentDefaultTime}
        defaultPet={appointmentDefaultPet}
        initialData={appointmentInitialData}
        onAppointmentSaved={(savedApt) => {
          setLastSavedAppointment(savedApt);
          toast.success('Appuntamento confermato e inserito in agenda');
          triggerDataRefresh();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ClinicProvider>
            <MainLayout />
            <ToastContainer />
          </ClinicProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
