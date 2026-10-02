import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { useI18n } from '../../i18n/I18nContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ViewKey } from '../../types';
import {
  Bell,
  Building,
  Menu,
  PlusCircle,
  Shield,
  CreditCard,
  UserCheck,
  Home,
  CheckCheck,
  AlertTriangle,
  Wrench,
  Sparkles,
  X,
  Clock,
  ClipboardCheck,
  Sliders,
  ChevronDown,
  Building2,
  Server,
} from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenNewComplaint: () => void;
  onNavigateToView?: (view: ViewKey) => void;
  onOpenNotificationPreferences?: () => void;
  onOpenOfflineInspection?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onOpenNewComplaint,
  onNavigateToView,
  onOpenNotificationPreferences,
  onOpenOfflineInspection,
}) => {
  const {
    currentUser,
    currentTenant,
    tenantsList,
    switchTenant,
    switchRole,
    availableRoles,
    isBlockScoped,
    isResidentScoped,
    isSuperAdmin,
  } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useResidence();
  const { t, isRTL } = useI18n();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const tenantMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(e.target as Node)) {
        setShowTenantMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications relevant to current role
  const relevantNotifications = notifications.filter((notif) => {
    if (notif.targetRole && notif.targetRole !== currentUser.role) {
      return false;
    }
    if (isBlockScoped && notif.targetBlockId && notif.targetBlockId !== 'block-h') {
      return false;
    }
    if (isResidentScoped && notif.targetBlockId && notif.targetBlockId !== 'block-h') {
      return false;
    }
    return true;
  });

  const unreadCount = relevantNotifications.filter((n) => !n.read && !n.isRead).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'president':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Shield className="w-3 h-3" />
            Président Syndic
          </span>
        );
      case 'treasurer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CreditCard className="w-3 h-3" />
            Trésorière
          </span>
        );
      case 'block_rep':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Building className="w-3 h-3" />
            Représentant Bloc H
          </span>
        );
      case 'resident':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Home className="w-3 h-3" />
            Résident H-12
          </span>
        );
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Server className="w-3 h-3" />
            Super-Admin SaaS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <UserCheck className="w-3 h-3" />
            Utilisateur
          </span>
        );
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'service':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'pool':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          id="btn-open-sidebar-mobile"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tenant Switcher Dropdown */}
        <div className="relative" ref={tenantMenuRef}>
          <button
            onClick={() => setShowTenantMenu(!showTenantMenu)}
            className="flex items-center gap-2.5 p-1 -ml-1 rounded-xl hover:bg-slate-100 transition text-left cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
              style={{ backgroundColor: currentTenant.themeColor || '#2563eb' }}
            >
              {currentTenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-slate-900 text-sm leading-tight max-w-[200px] sm:max-w-xs truncate">
                  {currentTenant.name}
                </h2>
                {tenantsList.length > 1 && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {currentTenant.totalBlocks || 9} Blocs • {currentTenant.totalPools || 18} Bassins • {currentTenant.currency}
              </p>
            </div>
          </button>

          {showTenantMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Copropriétés Actives ({tenantsList.length})
              </div>
              {tenantsList.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => {
                    switchTenant(tenant.id);
                    setShowTenantMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                    tenant.id === currentTenant.id
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: tenant.themeColor || '#2563eb' }}
                    >
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs truncate">{tenant.name}</span>
                  </div>
                  {tenant.id === currentTenant.id && (
                    <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                      Actif
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Offline Round Button */}
        {onOpenOfflineInspection && (
          <button
            onClick={onOpenOfflineInspection}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            title="Relevé terrain hors-ligne PWA"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Ronde PWA</span>
          </button>
        )}

        {/* Quick action button for complaints */}
        <button
          id="topbar-btn-report-issue"
          onClick={onOpenNewComplaint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition active:scale-98"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Signaler un problème</span>
          <span className="sm:hidden">Signaler</span>
        </button>

        {/* Internationalization Language Switcher */}
        <LanguageSwitcher />

        {/* Role Selector dropdown in topbar */}
        <div className="relative">
          <select
            id="topbar-select-role"
            value={currentUser.role}
            onChange={(e) => {
              const matched = availableRoles.find((r) => r.role === e.target.value);
              if (matched) switchRole(matched.key);
            }}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium cursor-pointer focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
            aria-label="Changer de rôle actif"
          >
            {availableRoles.map((r) => (
              <option key={r.key} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationDropdownRef}>
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
              <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications & Alertes
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tout marquer lu</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {relevantNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Aucune notification pour le moment.
                  </div>
                ) : (
                  relevantNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (onNavigateToView) {
                          if (notif.type === 'status_change' || notif.type === 'new_ticket' || notif.type === 'complaint') {
                            onNavigateToView('complaints');
                          } else if (notif.type === 'service_validation' || notif.type === 'service') {
                            onNavigateToView('services');
                          } else if (notif.type === 'urgent_alert' || notif.type === 'pool') {
                            onNavigateToView('pools');
                          }
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 text-xs ${
                        !notif.read && !notif.isRead ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 shrink-0 h-fit">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs">{notif.title}</h5>
                          {!notif.read && !notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {onOpenNotificationPreferences && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onOpenNotificationPreferences();
                      setShowNotifications(false);
                    }}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Canaux de notification (SMS / WhatsApp / Email)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)}
          </div>
          <div className="hidden xl:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name}
              </span>
            </div>
            <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
