import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { Pool, PoolStatus, PoolType } from '../../types';
import { UpdatePoolModal } from '../modals/UpdatePoolModal';
import { CommonLightingSection } from '../facilities/CommonLightingSection';
import { PrintableMaintenanceSheet } from '../reports/PrintableMaintenanceSheet';
import { downloadCSV } from '../../utils/exportHelpers';
import {
  Waves,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Thermometer,
  Droplets,
  Sparkles,
  Wrench,
  ShieldAlert,
  Building2,
  Clock,
  Printer,
  Download,
} from 'lucide-react';

export const PoolsView: React.FC = () => {
  const { currentUser, currentTenant } = useAuth();
  const {
    pools,
    blocks,
    commonLighting,
    servicePassages,
    operationalPoolsCount,
    maintenancePoolsCount,
    closedPoolsCount,
    operationalRatePercent,
    defectivePoolLightingCount,
  } = useResidence();

  // If block rep, default filter to their block, otherwise all
  const defaultBlock = currentUser.role === 'block_rep' ? (currentUser.assignedBlockId || 'block-h') : 'all';
  const [selectedBlockId, setSelectedBlockId] = useState<string>(defaultBlock);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal d'intervention
  const [selectedPoolForEdit, setSelectedPoolForEdit] = useState<Pool | null>(null);
  const [isPrintableMaintenanceOpen, setIsPrintableMaintenanceOpen] = useState(false);

  // Filtrage réactif
  const filteredPools = useMemo(() => {
    return pools.filter((pool) => {
      const matchesBlock = selectedBlockId === 'all' || pool.blockId === selectedBlockId;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'lighting_defective'
          ? pool.lightingStatus === 'defective'
          : pool.status === statusFilter;
      const matchesType = typeFilter === 'all' || pool.type === typeFilter;

      return matchesBlock && matchesStatus && matchesType;
    });
  }, [pools, selectedBlockId, statusFilter, typeFilter]);

  const getStatusBadge = (status: PoolStatus) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Opérationnelle
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Maintenance
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Fermée
          </span>
        );
    }
  };

  const isUserAuthorizedForPool = (pool: Pool) => {
    if (currentUser.role === 'president' || currentUser.role === 'treasurer') {
      return true;
    }
    if (currentUser.role === 'block_rep' && pool.blockId === currentUser.assignedBlockId) {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-600" />
            <span>Facility Management • Matrice des 18 Piscines</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance en temps réel des 2 bassins attribués à chacun des 9 blocs (1 Adulte + 1 Pataugeoire Enfant)
          </p>
        </div>

        {/* Action buttons & KPI Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-pools-print-sheet"
            onClick={() => setIsPrintableMaintenanceOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-600" />
            <span>Fiche Technique PDF</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs text-xs font-bold">
            {operationalPoolsCount} / {pools.length} Opérationnelles ({operationalRatePercent}%)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs text-xs font-bold">
            {maintenancePoolsCount} Maintenance
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs text-xs font-bold">
            {closedPoolsCount} Fermée
          </span>
        </div>
      </div>

      {/* Role-specific banner notice */}
      {currentUser.role === 'block_rep' && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Vous êtes connecté en tant que <strong>Représentant du Bloc H</strong>. Vous avez les droits d'édition sur les 2 bassins du Bloc H.
            </span>
          </div>
          <button
            onClick={() => setSelectedBlockId('block-h')}
            className="text-blue-700 font-bold hover:underline shrink-0 text-xs"
          >
            Focaliser sur le Bloc H
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bloc selector */}
          <div>
            <select
              value={selectedBlockId}
              onChange={(e) => setSelectedBlockId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">Tous les 9 Blocs (A à I)</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">Tous statuts</option>
              <option value="operational">Opérationnelles</option>
              <option value="maintenance">En maintenance</option>
              <option value="closed">Fermées</option>
              <option value="lighting_defective">
                Défaut éclairage subaquatique ({defectivePoolLightingCount})
              </option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">Tous bassins (18)</option>
              <option value="adult">Grands Bassins Adultes (9)</option>
              <option value="child">Pataugeoires Enfants (9)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredPools.length}</strong> bassin{filteredPools.length > 1 ? 's' : ''} affiché{filteredPools.length > 1 ? 's' : ''} sur 18
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPools.map((pool) => {
          const block = blocks.find((b) => b.id === pool.blockId);
          const hasLightingDefect = pool.lightingStatus === 'defective';
          const canEdit = isUserAuthorizedForPool(pool);

          return (
            <div
              key={pool.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                hasLightingDefect
                  ? 'border-amber-300 bg-amber-50/15'
                  : pool.status !== 'operational'
                  ? 'border-rose-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header de la carte bassin */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      {block?.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {block?.name.split(' - ')[1] || block?.name} • {pool.type === 'adult' ? 'Grand Bassin' : 'Pataugeoire'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {pool.type === 'adult' ? 'Bassin Adulte (Prof. 1.80m)' : 'Enfant Sécurisé (Prof. 0.45m)'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(pool.status)}
                </div>

                {/* Paramètres physico-chimiques */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Thermometer className="w-3 h-3 text-rose-500" />
                      <span>Eau</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                      {pool.waterTemperatureC ? `${pool.waterTemperatureC}°C` : '25.0°C'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>pH</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                      {pool.phLevel ?? '7.2'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Sparkles className="w-3 h-3 text-cyan-500" />
                      <span>Chlore</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                      {pool.chlorinePpm ? `${pool.chlorinePpm} ppm` : '1.3 ppm'}
                    </span>
                  </div>
                </div>

                {/* Statut Éclairage & Date dernier traitement */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Zap className={`w-3.5 h-3.5 ${hasLightingDefect ? 'text-rose-500' : 'text-emerald-500'}`} />
                      Éclairage immergé :
                    </span>
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                        hasLightingDefect
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {hasLightingDefect ? 'Défaut LED signalé' : 'Fonctionnel'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Curage & Nettoyage :
                    </span>
                    <span className="text-slate-700 font-medium">
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

              {/* Bouton d'action pour mettre à jour ou consigner */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {canEdit ? 'Contrôle autorisé' : 'Lecture seule'}
                </span>

                <button
                  onClick={() => setSelectedPoolForEdit(pool)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    canEdit
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{canEdit ? 'Consigner intervention' : 'Consulter fiche'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Common Lighting Section */}
      <CommonLightingSection />

      {/* Modal d'édition du bassin */}
      <UpdatePoolModal
        isOpen={Boolean(selectedPoolForEdit)}
        pool={selectedPoolForEdit}
        onClose={() => setSelectedPoolForEdit(null)}
      />

      {/* Modal Bilan Technique Imprimable */}
      <PrintableMaintenanceSheet
        isOpen={isPrintableMaintenanceOpen}
        onClose={() => setIsPrintableMaintenanceOpen(false)}
        tenant={currentTenant}
        blocks={blocks}
        pools={pools}
        commonLighting={commonLighting}
        servicePassages={servicePassages}
      />
    </div>
  );
};
