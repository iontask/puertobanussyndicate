import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { ViewKey, Pool } from '../../types';
import { UpdatePoolModal } from '../modals/UpdatePoolModal';
import {
  Building2,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Zap,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Thermometer,
  Sparkles,
  Users,
  Clock,
  Wrench,
  AlertOctagon,
} from 'lucide-react';

interface BlockRepDashboardProps {
  onNavigate: (view: ViewKey) => void;
  onOpenNewComplaint: () => void;
}

export const BlockRepDashboard: React.FC<BlockRepDashboardProps> = ({
  onNavigate,
  onOpenNewComplaint,
}) => {
  const { currentUser, currentTenant } = useAuth();
  const {
    getBlockById,
    getPoolsForBlock,
    getComplaintsForBlock,
    getCommonLightingForBlock,
    apartmentsBlockH,
  } = useResidence();

  const assignedBlockId = currentUser.assignedBlockId || 'block-h';
  const block = getBlockById(assignedBlockId);
  const blockPools = getPoolsForBlock(assignedBlockId);
  const blockComplaints = getComplaintsForBlock(assignedBlockId);
  const blockLighting = getCommonLightingForBlock(assignedBlockId);

  // Modal de mise à jour rapide de piscine
  const [selectedPoolForEdit, setSelectedPoolForEdit] = useState<Pool | null>(null);

  // Calculs dynamiques locaux
  const totalApartments = block?.apartmentCount || apartmentsBlockH.length;
  const ownerCount = apartmentsBlockH.filter((a) => a.residentType === 'owner').length;
  const tenantCount = apartmentsBlockH.filter((a) => a.residentType === 'tenant').length;

  const activeComplaints = blockComplaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  );
  const urgentComplaints = activeComplaints.filter((c) => c.priority === 'urgent');

  const operationalPools = blockPools.filter((p) => p.status === 'operational').length;
  const poolLightingDefects = blockPools.filter((p) => p.lightingStatus === 'defective').length;
  const commonLightingDefects = blockLighting.filter((l) => l.status === 'defective').length;

  return (
    <div className="space-y-6">
      {/* Banner Bloc H */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Scope Représentant Élu • {block?.name || 'Bloc H (Horizon)'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de Bord du {block?.name || 'Bloc H'}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Supervision directe et exclusive de vos <strong>{totalApartments} logements</strong> et de vos <strong>2 piscines de secteur</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('my_block')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              Gérer les {totalApartments} Lots
            </button>
            <button
              onClick={onOpenNewComplaint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau signalement</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Locaux du Bloc calculés dynamiquement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lots du bloc */}
        <div
          onClick={() => onNavigate('my_block')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Logements de mon secteur
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalApartments} Lots
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {ownerCount} Propriétaires • {tenantCount} Locataires
          </p>
        </div>

        {/* État des 2 piscines du bloc */}
        <div
          onClick={() => onNavigate('pools')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-cyan-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Piscines du Bloc
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {operationalPools} / {blockPools.length} Opérationnelles
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {poolLightingDefects > 0 ? (
              <span className="text-amber-600 font-medium">
                {poolLightingDefects} défaut projecteur signalé
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Équipements conformes</span>
            )}
          </p>
        </div>

        {/* Réclamations du bloc */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-rose-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Réclamations locales
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {activeComplaints.length} Ouverte{activeComplaints.length > 1 ? 's' : ''}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {urgentComplaints.length > 0 ? (
              <span className="text-rose-600 font-bold">
                {urgentComplaints.length} Urgence (Vanne R+2)
              </span>
            ) : (
              <span className="text-slate-500">Traitements normaux en cours</span>
            )}
          </p>
        </div>

        {/* Éclairage des parties communes */}
        <div
          onClick={() => onNavigate('pools')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <span className="text-[11px] font-semibold uppercase text-slate-500">
            Éclairage & Sécurité
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {commonLightingDefects > 0 ? (
              <span className="text-amber-600 font-bold">{commonLightingDefects} Défaut</span>
            ) : (
              <span className="text-emerald-600 font-bold">100% Fonctionnel</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Escaliers, coursives et abords bassin
          </p>
        </div>
      </div>

      {/* Alertes prioritaires du secteur Bloc H */}
      {(poolLightingDefects > 0 || commonLightingDefects > 0 || urgentComplaints.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Alertes & Pannes en cours sur votre secteur (Bloc H)</span>
          </div>

          <div className="space-y-2 text-xs">
            {urgentComplaints.map((c) => (
              <div
                key={c.id}
                className="bg-white p-3 rounded-lg border border-rose-200 flex items-center justify-between gap-3 text-rose-900"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                    Urgent
                  </span>
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-slate-500 text-[11px]">({c.description})</span>
                </div>
                <button
                  onClick={() => onNavigate('complaints')}
                  className="text-xs text-blue-600 font-semibold hover:underline shrink-0"
                >
                  Gérer l'incident
                </button>
              </div>
            ))}

            {poolLightingDefects > 0 && (
              <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Piscine
                  </span>
                  <span className="font-semibold">
                    Grand Bassin Bloc H : Projecteur LED immergé défectueux côté sud
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    (Signalé par le résident H-12 le 14/09 • AquaPool prévenu)
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('pools')}
                  className="text-xs text-blue-600 font-semibold hover:underline shrink-0"
                >
                  Voir fiche bassin
                </button>
              </div>
            )}

            {commonLightingDefects > 0 && (
              <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Éclairage
                  </span>
                  <span className="font-semibold">
                    Abords bassin & solarium : Mât ouest hors service
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    (Intervention programmée)
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('pools')}
                  className="text-xs text-blue-600 font-semibold hover:underline shrink-0"
                >
                  Voir éclairage
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus direct sur les 2 bassins du Bloc H */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-600" />
              <span>Gestion des 2 Bassins de votre Bloc</span>
            </h2>
            <p className="text-xs text-slate-500">
              Paramètres physico-chimiques en temps réel et consigne des nettoyages
            </p>
          </div>

          <button
            onClick={() => onNavigate('pools')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Ouvrir la matrice globale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blockPools.map((pool) => {
            const isAdult = pool.type === 'adult';
            const isLightingDefective = pool.lightingStatus === 'defective';

            return (
              <div
                key={pool.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{isAdult ? 'Grand Bassin (Adulte)' : 'Pataugeoire (Enfant)'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isAdult ? 'Profondeur 1.80m • Volume 220 m³' : 'Profondeur 0.45m • Bassin sécurisé'}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        pool.status === 'operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pool.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {pool.status === 'operational'
                        ? 'Opérationnelle'
                        : pool.status === 'maintenance'
                        ? 'En maintenance'
                        : 'Fermée'}
                    </span>
                  </div>

                  {/* Paramètres physico-chimiques */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-rose-500" /> Température
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.waterTemperatureC}°C
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" /> pH Eau
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.phLevel}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-500" /> Chlore
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.chlorinePpm} ppm
                      </span>
                    </div>
                  </div>

                  {/* Statut Éclairage & Nettoyage */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Zap className={`w-3.5 h-3.5 ${isLightingDefective ? 'text-amber-500' : 'text-emerald-500'}`} />
                        Éclairage immergé :
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.2 rounded ${
                          isLightingDefective
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isLightingDefective ? 'Défaut LED signalé' : 'Fonctionnel'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Dernier curage :</span>
                      <span className="text-slate-600 font-medium">
                        {new Date(pool.lastCleanedAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action pour le représentant sur son bassin */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedPoolForEdit(pool)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Mettre à jour l'état</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal d'édition de bassin */}
      <UpdatePoolModal
        isOpen={Boolean(selectedPoolForEdit)}
        pool={selectedPoolForEdit}
        onClose={() => setSelectedPoolForEdit(null)}
      />
    </div>
  );
};
