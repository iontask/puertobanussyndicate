import React, { useState } from 'react';
import { Block, Pool, CommonLightingItem, LightingStatus } from '../../types';
import { useResidence } from '../../context/ResidenceContext';
import { useAuth } from '../../context/AuthContext';
import { UpdatePoolModal } from '../modals/UpdatePoolModal';
import {
  Waves,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  Sparkles,
  Clock,
  Wrench,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';

interface BlockEquipmentsSectionProps {
  block: Block;
}

export const BlockEquipmentsSection: React.FC<BlockEquipmentsSectionProps> = ({ block }) => {
  const { currentUser } = useAuth();
  const {
    getPoolsForBlock,
    getCommonLightingForBlock,
    toggleCommonLighting,
  } = useResidence();

  const pools = getPoolsForBlock(block.id);
  const commonLighting = getCommonLightingForBlock(block.id);

  const [selectedPoolForEdit, setSelectedPoolForEdit] = useState<Pool | null>(null);

  // RBAC permission:
  // - President & Treasurer: can toggle/edit anything
  // - Block Rep: can toggle/edit only if blockId matches assignedBlockId
  // - Resident: read-only
  const canEditBlock =
    currentUser.role === 'president' ||
    currentUser.role === 'treasurer' ||
    (currentUser.role === 'block_rep' && block.id === currentUser.assignedBlockId);

  const handleToggleLighting = (item: CommonLightingItem) => {
    if (!canEditBlock) return;
    toggleCommonLighting(
      item.id,
      item.status === 'working' ? 'defective' : 'working',
      item.status === 'working' ? 'Signalé manuellement par le syndic' : 'Remis en service et vérifié'
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Équipements Techniques & Espaces Communs du {block.name}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Contrôle des 2 bassins et de l'éclairage des circulations
          </p>
        </div>

        {!canEditBlock && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1 border border-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>Consultation seule</span>
          </span>
        )}
      </div>

      {/* 1. Les 2 Bassins Aquatiques */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-cyan-600" />
          <span>Les 2 Bassins de Baignade (Adulte & Enfant)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {pools.map((pool) => {
            const isAdult = pool.type === 'adult';
            const isLightingDefective = pool.lightingStatus === 'defective';

            return (
              <div
                key={pool.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {isAdult ? 'Grand Bassin (Adulte)' : 'Pataugeoire (Enfant)'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {isAdult ? 'Profondeur 1.80m • Baignade libre' : 'Profondeur 0.45m • Bassin basse profondeur'}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        pool.status === 'operational'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pool.status === 'maintenance'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {pool.status === 'operational' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : pool.status === 'maintenance' ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      <span>
                        {pool.status === 'operational'
                          ? 'Opérationnelle'
                          : pool.status === 'maintenance'
                          ? 'En maintenance'
                          : 'Fermée'}
                      </span>
                    </span>
                  </div>

                  {/* Indicateurs physico-chimiques */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Thermometer className="w-3 h-3 text-rose-500" /> Température
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.waterTemperatureC}°C
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" /> pH Relevé
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.phLevel}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-500" /> Chlore Libre
                      </span>
                      <span className="font-bold text-xs text-slate-800 mt-0.5 block">
                        {pool.chlorinePpm} ppm
                      </span>
                    </div>
                  </div>

                  {/* Éclairage subaquatique & curage */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Zap className={`w-3.5 h-3.5 ${isLightingDefective ? 'text-amber-500' : 'text-emerald-500'}`} />
                        Éclairage projecteur subaquatique :
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          isLightingDefective
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isLightingDefective ? 'Défectueux' : 'Fonctionnel'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Dernier passage nettoyage :
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

                {/* Action button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                  <button
                    disabled={!canEditBlock}
                    onClick={() => setSelectedPoolForEdit(pool)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      canEditBlock
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Consigner intervention / paramètres</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Éclairage des parties communes (Cages d'escalier & Abords des bassins) */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Éclairage des Parties Communes & Sécurité</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonLighting.map((item) => {
            const isDefective = item.status === 'defective';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isDefective
                    ? 'bg-amber-50/40 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isDefective
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-snug">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.zone === 'stairwells' ? 'Paliers RDC à R+3' : 'Périmètre sécurisé bassins'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isDefective
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isDefective ? 'Panne signalée' : 'Fonctionnel'}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.notes}
                    </p>
                  )}

                  {isDefective && item.defectReportedAt && (
                    <p className="mt-1 text-[10px] text-rose-600 font-medium">
                      Signalé le {new Date(item.defectReportedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                {/* Bouton pour déclarer ou solder la panne */}
                {canEditBlock && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleToggleLighting(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                        isDefective
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                      }`}
                    >
                      {isDefective ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Marquer comme réparé</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Signaler une ampoule / panne</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
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
