import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { LoginPage } from './pages/LoginPage';
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

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center', color: 'var(--slate-500)', fontSize: '1rem', fontWeight: '600' }}>
          Caricamento gestionale VetClinic...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
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
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaPage
              onSelectPet={handleOpenPetDetail}
              onNewAppointment={handleOpenNewAppointment}
              onEditAppointment={handleEditAppointment}
            />
          )}

          {currentTab === 'pets' && (
            <PetsPage
              onSelectPet={handleOpenPetDetail}
              onNewVisit={handleOpenNewVisit}
              onNewPet={handleOpenNewPet}
              filterByOwnerId={petFilterOwnerId}
            />
          )}

          {currentTab === 'visits' && (
            <VisitsPage
              onSelectPet={handleOpenPetDetail}
              onNewVisit={handleOpenNewVisit}
              onEditVisit={handleEditVisit}
            />
          )}

          {currentTab === 'therapies' && (
            <TherapiesPage
              onSelectPet={handleOpenPetDetail}
              onNewTherapy={handleOpenNewTherapy}
              onEditTherapy={handleEditTherapy}
            />
          )}

          {currentTab === 'owners' && (
            <OwnersPage
              onAddPetForOwner={handleOpenNewPet}
              onNewOwner={handleOpenNewOwner}
              onEditOwner={handleEditOwner}
              onFilterPetsByOwner={handleFilterPetsByOwner}
            />
          )}

          {currentTab === 'clinics' && (
            <ClinicsPage
              onNewClinic={handleOpenNewClinic}
              onEditClinic={handleEditClinic}
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
        onVisitSaved={() => {}}
      />

      <TherapyFormModal
        isOpen={isTherapyFormOpen}
        onClose={() => setIsTherapyFormOpen(false)}
        defaultPet={therapyDefaultPet}
        initialData={therapyInitialData}
        onTherapySaved={() => {}}
      />

      <OwnerFormModal
        isOpen={isOwnerFormOpen}
        onClose={() => setIsOwnerFormOpen(false)}
        initialData={ownerInitialData}
        onOwnerSaved={() => {}}
      />

      <ClinicFormModal
        isOpen={isClinicFormOpen}
        onClose={() => setIsClinicFormOpen(false)}
        initialData={clinicInitialData}
        onClinicSaved={() => {}}
      />

      <VaccinationFormModal
        isOpen={isVaccinationFormOpen}
        onClose={() => setIsVaccinationFormOpen(false)}
        defaultPet={vaccinationDefaultPet}
        initialData={vaccinationInitialData}
        onVaccinationSaved={() => {
          // If modal for this pet is open, update
          if (selectedPetId) {
            setSelectedPetId(selectedPetId);
          }
        }}
      />

      <AppointmentFormModal
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
        defaultDate={appointmentDefaultDate}
        defaultTime={appointmentDefaultTime}
        defaultPet={appointmentDefaultPet}
        initialData={appointmentInitialData}
        onAppointmentSaved={() => {}}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <MainLayout />
      </ClinicProvider>
    </AuthProvider>
  );
}
