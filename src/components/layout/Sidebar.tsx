import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { ViewKey } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Waves,
  Coins,
  AlertOctagon,
  Wrench,
  FileCheck2,
  Home,
  SlidersHorizontal,
  PlusCircle,
  Building,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  ScrollText,
  FileSpreadsheet,
  Server,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNewComplaint: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  onOpenNewComplaint,
}) => {
  const { currentUser, currentTenant } = useAuth();
  const { unreadAnnouncementsCountForUser, decisions } = useResidence();

  const unreadAnnouncements = unreadAnnouncementsCountForUser(
    currentUser.role,
    currentUser.assignedBlockId,
    currentUser.assignedBlockCode
  );

  const pendingDecisionsCount = decisions.filter(
    (d) => d.status === 'to_do' || d.status === 'in_progress'
  ).length;

  // Définition des éléments de navigation selon le rôle actif
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'president':
      case 'treasurer':
        return [
          {
            id: 'dashboard' as ViewKey,
            label: 'Dashboard global',
            icon: LayoutDashboard,
            badge: undefined,
          },
          {
            id: 'governance' as ViewKey,
            label: 'Gouvernance & PV',
            icon: ScrollText,
            badge: pendingDecisionsCount > 0 ? `${pendingDecisionsCount} act.` : undefined,
            badgeVariant: 'warning',
          },
          {
            id: 'announcements' as ViewKey,
            label: 'Communications & Annonces',
            icon: Megaphone,
            badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined,
            badgeVariant: 'danger',
          },
          {
            id: 'blocks' as ViewKey,
            label: 'Blocs (A - I)',
            icon: Building2,
            badge: '9',
          },
          {
            id: 'pools' as ViewKey,
            label: '18 Piscines',
            icon: Waves,
            badge: '2 alertes',
            badgeVariant: 'warning',
          },
          {
            id: 'finances' as ViewKey,
            label: 'Finances & Cotisations',
            icon: Coins,
            badge: 'T3/T4',
          },
          {
            id: 'complaints' as ViewKey,
            label: 'Réclamations',
            icon: AlertOctagon,
            badge: '3',
            badgeVariant: 'danger',
          },
          {
            id: 'services' as ViewKey,
            label: 'Services & Prestataires',
            icon: Wrench,
            badge: undefined,
          },
          {
            id: 'audit' as ViewKey,
            label: 'Registre & Audit',
            icon: FileCheck2,
            badge: undefined,
          },
          {
            id: 'reports' as ViewKey,
            label: 'Rapports & Exports',
            icon: FileSpreadsheet,
            badge: 'PDF/CSV',
            badgeVariant: 'default',
          },
        ];

      case 'block_rep':
        return [
          {
            id: 'dashboard' as ViewKey,
            label: 'Dashboard Bloc H',
            icon: LayoutDashboard,
            badge: undefined,
          },
          {
            id: 'governance' as ViewKey,
            label: 'Gouvernance & Actions',
            icon: ScrollText,
            badge: undefined,
          },
          {
            id: 'announcements' as ViewKey,
            label: 'Annonces & Alertes',
            icon: Megaphone,
            badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined,
            badgeVariant: 'danger',
          },
          {
            id: 'my_block' as ViewKey,
            label: 'Mon Bloc H (76 Lots)',
            icon: Building,
            badge: '76',
          },
          {
            id: 'pools' as ViewKey,
            label: 'Piscines Bloc H',
            icon: Waves,
            badge: '1 défaut',
            badgeVariant: 'warning',
          },
          {
            id: 'complaints' as ViewKey,
            label: 'Réclamations du Bloc',
            icon: AlertOctagon,
            badge: '2',
            badgeVariant: 'danger',
          },
          {
            id: 'reports' as ViewKey,
            label: 'Rapports & Synthèse',
            icon: FileSpreadsheet,
            badge: undefined,
          },
        ];

      case 'resident':
        return [
          {
            id: 'dashboard' as ViewKey,
            label: 'Mon Foyer (Portail)',
            icon: LayoutDashboard,
            badge: undefined,
          },
          {
            id: 'announcements' as ViewKey,
            label: 'Annonces & Bâtiment',
            icon: Megaphone,
            badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined,
            badgeVariant: 'danger',
          },
          {
            id: 'governance' as ViewKey,
            label: 'PV d’AG & Décisions',
            icon: ScrollText,
            badge: undefined,
          },
          {
            id: 'my_apartment' as ViewKey,
            label: 'Mon Appartement (H-12)',
            icon: Home,
            badge: undefined,
          },
          {
            id: 'my_finances' as ViewKey,
            label: 'Mes Finances & Charges',
            icon: Coins,
            badge: 'À jour',
            badgeVariant: 'success',
          },
          {
            id: 'my_facilities' as ViewKey,
            label: 'État de mon bloc & piscine',
            icon: Waves,
            badge: 'Info',
          },
          {
            id: 'reports' as ViewKey,
            label: 'Rapports & Documents',
            icon: FileSpreadsheet,
            badge: undefined,
          },
        ];

      case 'super_admin':
        return [
          {
            id: 'platform' as ViewKey,
            label: 'Console Multi-Tenants',
            icon: Server,
            badge: 'SaaS',
            badgeVariant: 'warning',
          },
          {
            id: 'onboarding' as ViewKey,
            label: 'Wizard Onboarding',
            icon: PlusCircle,
            badge: 'Nouveau',
            badgeVariant: 'default',
          },
          {
            id: 'dashboard' as ViewKey,
            label: 'Vue Résidence Active',
            icon: LayoutDashboard,
            badge: undefined,
          },
          {
            id: 'blocks' as ViewKey,
            label: 'Blocs & Bâtiments',
            icon: Building2,
            badge: undefined,
          },
          {
            id: 'pools' as ViewKey,
            label: 'Bassins de Baignade',
            icon: Waves,
            badge: undefined,
          },
          {
            id: 'finances' as ViewKey,
            label: 'Grand Livre & Finances',
            icon: Coins,
            badge: undefined,
          },
          {
            id: 'complaints' as ViewKey,
            label: 'Réclamations & SAV',
            icon: AlertOctagon,
            badge: undefined,
          },
          {
            id: 'services' as ViewKey,
            label: 'Services & Prestataires',
            icon: Wrench,
            badge: undefined,
          },
          {
            id: 'governance' as ViewKey,
            label: 'Gouvernance & AG',
            icon: ScrollText,
            badge: undefined,
          },
          {
            id: 'reports' as ViewKey,
            label: 'Rapports & Sécurité',
            icon: FileSpreadsheet,
            badge: 'Audit',
            badgeVariant: 'default',
          },
        ];

      default:
        return [
          {
            id: 'dashboard' as ViewKey,
            label: 'Tableau de bord',
            icon: LayoutDashboard,
            badge: undefined,
          },
        ];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (viewId: ViewKey) => {
    onSelectView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wide text-base">SYNDIKAL</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SAAS LOT 7
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Residence Management</p>
            </div>
          </div>
        </div>

        {/* Tenant Scope Card */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Résidence Active
          </div>
          <div className="text-xs font-semibold text-slate-100 truncate">{currentTenant.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
            <span>
              {currentTenant.totalBlocks || 9} Blocs • {currentTenant.totalPools || 18} Piscines
            </span>
            <span className="text-emerald-400 font-medium">En ligne</span>
          </div>
        </div>

        {/* Priority Action for Resident & Block Rep */}
        {currentUser.role === 'resident' && (
          <div className="p-4 border-b border-slate-800 bg-blue-950/40">
            <button
              id="sidebar-btn-priority-complaint"
              onClick={() => {
                onOpenNewComplaint();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Signaler un problème</span>
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menu {currentUser.role === 'resident' ? 'Résident' : currentUser.role === 'block_rep' ? 'Représentant' : 'Administration'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.badgeVariant === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.badgeVariant === 'danger'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.badgeVariant === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/70 border border-slate-750">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.title || currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
