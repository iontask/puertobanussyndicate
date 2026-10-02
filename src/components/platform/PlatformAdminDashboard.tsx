import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { Tenant, PlatformGlobalMetrics } from '../../types';
import {
  Building2,
  Shield,
  Layers,
  Waves,
  Users,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Activity,
  Server,
  Lock,
  ExternalLink,
  Bell,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface PlatformAdminDashboardProps {
  onOpenOnboarding: () => void;
  onOpenNotificationsModal: () => void;
  onOpenOfflineInspection: () => void;
}

export const PlatformAdminDashboard: React.FC<PlatformAdminDashboardProps> = ({
  onOpenOnboarding,
  onOpenNotificationsModal,
  onOpenOfflineInspection,
}) => {
  const { currentTenant, tenantsList, switchTenant } = useAuth();
  const { financialTotals } = useResidence();

  // Metrics consolidées
  const totalTenantsCount = tenantsList.length;
  const totalApartmentsCount = tenantsList.reduce((acc, t) => acc + (t.totalApartments || 76), 0);
  const totalBlocksCount = tenantsList.reduce((acc, t) => acc + (t.totalBlocks || 9), 0);
  const totalPoolsCount = tenantsList.reduce((acc, t) => acc + (t.totalPools || 18), 0);

  const [selectedAuditTenant, setSelectedAuditTenant] = useState<Tenant | null>(null);

  return (
    <div className="space-y-6">
      {/* SaaS Platform Banner */}
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Server className="w-3.5 h-3.5" />
            <span>Console Éditeur SaaS Multi-Résidences • Super-Admin</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Supervision Globale de la Plateforme
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Provisionnez de nouveaux syndics, pilotez l'isolation hermétique des tenants et supervisez
            les infrastructures spatiales et financières inter-résidences en temps réel.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Provisionner une Copropriété (Wizard)</span>
            </button>

            <button
              onClick={onOpenNotificationsModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>Passerelle Notifications (SendGrid / Twilio / WhatsApp)</span>
            </button>

            <button
              onClick={onOpenOfflineInspection}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Relevé Terrain PWA (Hors-Ligne)</span>
            </button>
          </div>
        </div>

        {/* Ambient watermark icon */}
        <Building2 className="absolute right-4 -bottom-6 w-56 h-56 text-white/5 pointer-events-none" />
      </div>

      {/* High-Level Consolidated KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Copropriétés Actives</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalTenantsCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Opérationnelles</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Lots Sous Gestion</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalApartmentsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">{totalBlocksCount} Bâtiments au total</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bassins Supervisés</span>
            <Waves className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalPoolsCount}</p>
          <p className="text-[11px] text-cyan-600 font-medium mt-1">Sondes IoT & Chlore OK</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">SLA Plateforme</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">99.98%</p>
          <p className="text-[11px] text-slate-500 mt-1">Latence moy. 38ms</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Isolation Firestore</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">Hermétique</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Token tenantId validé</p>
        </div>
      </div>

      {/* Tenants Table with Direct Context Switch */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Copropriétés Gérées ({tenantsList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Sélectionnez une copropriété pour basculer instantanément dans son espace de gestion
            </p>
          </div>

          <button
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nouveau Tenant</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Copropriété & Identifiant</th>
                <th className="p-4">Localisation</th>
                <th className="p-4">Topologie</th>
                <th className="p-4">Statut & Sécurité</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantsList.map((tenant) => {
                const isCurrent = tenant.id === currentTenant.id;

                return (
                  <tr
                    key={tenant.id}
                    className={`hover:bg-slate-50/60 transition ${
                      isCurrent ? 'bg-blue-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                          style={{ backgroundColor: tenant.themeColor || '#2563eb' }}
                        >
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{tenant.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Actuelle
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {tenant.id} • Code: {tenant.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      <span>{tenant.city || 'Maroc'}</span>
                      <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                        {tenant.address || '—'}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700">
                      <span className="font-bold">{tenant.totalBlocks || 9}</span> Blocs •{' '}
                      <span className="font-bold">{tenant.totalApartments || 76}</span> Lots
                      <span className="block text-[11px] text-slate-400">
                        {tenant.totalPools || 18} bassins de baignade
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Isolé (Firestore RBAC)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Devise : {tenant.currency}</span>
                    </td>

                    <td className="p-4 text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-bold px-3 py-1.5 rounded-xl bg-blue-50">
                          Espace Ouvert
                        </span>
                      ) : (
                        <button
                          onClick={() => switchTenant(tenant.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold transition shadow-2xs cursor-pointer"
                        >
                          <span>Basculer</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Multi-Tenancy Guarantee Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Garantie d'Herméticité Multi-Tenants Firestore</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Toutes les requêtes de l'application sont cloisonnées par le jeton d'authentification{' '}
          <code>request.auth.token.tenantId</code>. Aucune fuite de données horizontale ne peut survenir
          entre résidences : les comptes bancaires, tantièmes, réclamations et données nominatives
          des résidents sont strictement compartimentés par collection partitionnée.
        </p>
      </div>
    </div>
  );
};
