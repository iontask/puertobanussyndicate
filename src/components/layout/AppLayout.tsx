import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { ViewKey, Complaint, ComplaintStatus, BlockCode } from '../../types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RoleSwitcherBar } from '../dev/RoleSwitcherBar';
import { NewComplaintModal } from '../modals/NewComplaintModal';

// Views
import { DashboardView } from '../views/DashboardView';
import { BlocksView } from '../views/BlocksView';
import { PoolsView } from '../views/PoolsView';
import { FinancesView } from '../views/FinancesView';
import { ComplaintsView } from '../views/ComplaintsView';
import { ServicesView } from '../views/ServicesView';
import { AuditView } from '../views/AuditView';
import { ResidentApartmentView } from '../views/ResidentApartmentView';
import { GovernanceView } from '../governance/GovernanceView';
import { AnnouncementsView } from '../announcements/AnnouncementsView';
import { ReportsView } from '../reports/ReportsView';
import { PlatformAdminDashboard } from '../platform/PlatformAdminDashboard';
import { TenantOnboardingWizard } from '../onboarding/TenantOnboardingWizard';
import { NotificationPreferencesModal } from '../notifications/NotificationPreferencesModal';
import { OfflineInspectionModal } from '../offline/OfflineInspectionModal';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { ProvisionedTenantResult } from '../../services/tenant/tenantProvisioning';

export const AppLayout: React.FC = () => {
  const { currentUser, isSuperAdmin, addTenant, switchTenant } = useAuth();
  const { complaints, addComplaint, updateComplaintStatus } = useResidence();

  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [selectedBlockCode, setSelectedBlockCode] = useState<BlockCode>('H');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isOfflineInspectionOpen, setIsOfflineInspectionOpen] = useState(false);

  // Reset view upon switching roles
  useEffect(() => {
    if (currentUser.role === 'super_admin') {
      setCurrentView('platform');
    } else {
      setCurrentView('dashboard');
    }
    if (currentUser.role === 'block_rep') {
      setSelectedBlockCode('H');
    }
  }, [currentUser.role]);

  const handleSelectBlockFromDashboard = (code: string) => {
    setSelectedBlockCode(code as BlockCode);
    setCurrentView('blocks');
  };

  const handleOnboardingComplete = (result: ProvisionedTenantResult, switchImmediately: boolean) => {
    addTenant(result.tenant);
    if (switchImmediately) {
      switchTenant(result.tenant.id);
      setCurrentView('dashboard');
    } else {
      setCurrentView('platform');
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'platform':
        return (
          <PlatformAdminDashboard
            onOpenOnboarding={() => setCurrentView('onboarding')}
            onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
            onOpenOfflineInspection={() => setIsOfflineInspectionOpen(true)}
          />
        );

      case 'onboarding':
        return (
          <TenantOnboardingWizard
            onComplete={handleOnboardingComplete}
            onCancel={() => setCurrentView(isSuperAdmin ? 'platform' : 'dashboard')}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            onSelectBlock={handleSelectBlockFromDashboard}
          />
        );

      case 'blocks':
      case 'my_block':
        return <BlocksView initialBlockCode={selectedBlockCode} />;

      case 'pools':
      case 'my_facilities':
        return <PoolsView />;

      case 'finances':
      case 'my_finances':
        return <FinancesView />;

      case 'complaints':
        return (
          <ComplaintsView
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            complaintsList={complaints}
            onUpdateComplaintStatus={updateComplaintStatus}
          />
        );

      case 'my_apartment':
        return (
          <ResidentApartmentView
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
          />
        );

      case 'governance':
        return <GovernanceView />;

      case 'announcements':
        return <AnnouncementsView />;

      case 'services':
        return <ServicesView />;

      case 'audit':
        return <AuditView />;

      case 'reports':
      case 'my_documents':
        return <ReportsView />;

      default:
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            onSelectBlock={handleSelectBlockFromDashboard}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans">
      {/* 1. Barre supérieure de simulation & Bascule de Rôle (Lot 1) */}
      <RoleSwitcherBar />

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Sidebar adaptative selon le rôle */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
        />

        {/* 3. Conteneur principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Topbar avec profil, tenant et notifications */}
          <Topbar
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            onNavigateToView={(view) => setCurrentView(view)}
            onOpenNotificationPreferences={() => setIsNotificationsModalOpen(true)}
            onOpenOfflineInspection={() => setIsOfflineInspectionOpen(true)}
          />

          {/* Corps de la page */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>

          {/* Footer sobre B2B */}
          <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
            <span>
              Syndikal Residence Management • Lot 7 Architecture SaaS Multi-Résidences, Onboarding & Terrain PWA • Puerto Banús
            </span>
          </footer>
        </div>
      </div>

      {/* 4. Modal de signalement d'incident */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSuccess={(ticket) => addComplaint(ticket)}
      />

      {/* 5. Modal des préférences et passerelle de notifications multicanales */}
      <NotificationPreferencesModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      {/* 6. Modal de relevé terrain / ronde d'inspection hors-ligne PWA */}
      <OfflineInspectionModal
        isOpen={isOfflineInspectionOpen}
        onClose={() => setIsOfflineInspectionOpen(false)}
      />

      {/* 7. Indicateur d'état réseau et synchronisation Offline */}
      <OfflineIndicator />
    </div>
  );
};
