import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { ViewKey } from '../../types';
import {
  Building2,
  Waves,
  Coins,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertOctagon,
  ExternalLink,
} from 'lucide-react';

interface PresidentDashboardProps {
  onNavigate: (view: ViewKey) => void;
  onSelectBlock?: (blockCode: string) => void;
}

export const PresidentDashboard: React.FC<PresidentDashboardProps> = ({
  onNavigate,
  onSelectBlock,
}) => {
  const { currentTenant } = useAuth();
  const {
    totalBlocksCount,
    totalApartmentsCount,
    totalPoolsCount,
    operationalPoolsCount,
    maintenancePoolsCount,
    closedPoolsCount,
    operationalRatePercent,
    defectivePoolLightingCount,
    defectiveCommonLightingCount,
    totalActiveAlertsCount,
    openComplaintsCount,
    urgentComplaintsCount,
    blocksSummaries,
  } = useResidence();

  const handleBlockClick = (blockCode: string) => {
    if (onSelectBlock) {
      onSelectBlock(blockCode);
    }
    onNavigate('blocks');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Administration Générale • {currentTenant.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de Bord Exécutif de la Résidence
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Supervision consolidée du patrimoine : {totalBlocksCount} Bâtiments (A à I), {totalPoolsCount} Bassins & Éclairages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('blocks')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              Voir les 9 Blocs
            </button>
            <button
              onClick={() => onNavigate('pools')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Waves className="w-4 h-4" />
              <span>Matrice 18 Piscines</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartes KPI consolidées calculées dynamiquement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 : Blocs */}
        <div
          onClick={() => onNavigate('blocks')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Patrimoine Bâti
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900">{totalBlocksCount} Blocs</div>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong>{totalApartmentsCount}</strong> Lots privatifs
            </p>
          </div>
        </div>

        {/* KPI 2 : Taux Opérationnalité Piscines */}
        <div
          onClick={() => onNavigate('pools')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-cyan-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              18 Piscines & Bassins
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-emerald-600">
              {operationalRatePercent} %
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
              <span className="text-emerald-700 font-semibold">{operationalPoolsCount} OK</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{maintenancePoolsCount} Maint.</span>
              <span>•</span>
              <span className="text-rose-700 font-semibold">{closedPoolsCount} Arrêt</span>
            </p>
          </div>
        </div>

        {/* KPI 3 : Alertes Équipements / Éclairage */}
        <div
          onClick={() => onNavigate('pools')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Alertes Équipements
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-amber-600">
              {totalActiveAlertsCount} Alerte{totalActiveAlertsCount > 1 ? 's' : ''}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {defectivePoolLightingCount + defectiveCommonLightingCount} Défauts éclairage
            </p>
          </div>
        </div>

        {/* KPI 4 : Réclamations en cours */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-rose-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Réclamations
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900">
              {openComplaintsCount} Ouverte{openComplaintsCount > 1 ? 's' : ''}
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-0.5">
              {urgentComplaintsCount > 0 ? `${urgentComplaintsCount} urgence signalée` : 'Aucune urgence'}
            </p>
          </div>
        </div>

        {/* KPI 5 : Taux Recouvrement T3 */}
        <div
          onClick={() => onNavigate('finances')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Cotisations T3
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-900">89.4 %</div>
            <p className="text-xs text-slate-500 mt-0.5">
              Budget de gestion maîtrisé
            </p>
          </div>
        </div>
      </div>

      {/* Grille de Synthèse des 9 Blocs (A à I) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Matrice de Gouvernance des 9 Blocs (A à I)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Supervision conjointe des représentants, de l'état des 2 piscines et des réclamations par secteur
            </p>
          </div>

          <button
            onClick={() => onNavigate('blocks')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ouvrir la gestion spatiale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tableau / Cartes réactives des 9 blocs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {blocksSummaries.map((summary) => {
            const { block, representative, adultPool, childPool, openComplaintsCount, hasAlert } = summary;

            const isAdultOk = adultPool?.status === 'operational';
            const isChildOk = childPool?.status === 'operational';

            return (
              <div
                key={block.id}
                onClick={() => handleBlockClick(block.code)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  hasAlert
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300 hover:bg-amber-50/40'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80'
                }`}
              >
                {/* Header du bloc */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition">
                      {block.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs leading-tight">
                        {block.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {block.apartmentCount} Lots • RDC à R+{block.floorsCount ? block.floorsCount - 1 : 3}
                      </p>
                    </div>
                  </div>

                  {hasAlert ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      Alerte active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>

                {/* Représentant assigné */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    Représentant : <strong className="text-slate-900">{representative?.name || 'Non assigné'}</strong>
                  </span>
                </div>

                {/* Statut des 2 piscines */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                  {/* Piscine adulte */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-slate-500 font-medium text-[10px]">Grand Bain</span>
                    <div className="mt-1 flex items-center gap-1">
                      {isAdultOk ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      )}
                      <span className={`font-semibold ${isAdultOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {adultPool?.status === 'operational'
                          ? 'Opérationnel'
                          : adultPool?.status === 'maintenance'
                          ? 'Maintenance'
                          : 'Fermé'}
                      </span>
                    </div>
                    {adultPool?.lightingStatus === 'defective' && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        Éclairage HS
                      </span>
                    )}
                  </div>

                  {/* Piscine enfant */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-slate-500 font-medium text-[10px]">Pataugeoire</span>
                    <div className="mt-1 flex items-center gap-1">
                      {isChildOk ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      )}
                      <span className={`font-semibold ${isChildOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {childPool?.status === 'operational'
                          ? 'Opérationnel'
                          : childPool?.status === 'maintenance'
                          ? 'Maintenance'
                          : 'Fermé'}
                      </span>
                    </div>
                    {childPool?.lightingStatus === 'defective' && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        Éclairage HS
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer bloc : tickets ouverts */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Incidents ouverts :{' '}
                    <strong className={openComplaintsCount > 0 ? 'text-rose-600' : 'text-slate-700'}>
                      {openComplaintsCount}
                    </strong>
                  </span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-0.5">
                    Inspecter lot <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
