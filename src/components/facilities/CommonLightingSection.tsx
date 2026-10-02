import React from 'react';
import { useResidence } from '../../context/ResidenceContext';
import { useAuth } from '../../context/AuthContext';
import { CommonLightingItem } from '../../types';
import {
  Lightbulb,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const CommonLightingSection: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    commonLighting,
    blocks,
    toggleCommonLighting,
    defectiveCommonLightingCount,
  } = useResidence();

  // RBAC check
  const isAuthorizedToToggle = (blockId: string) => {
    if (currentUser.role === 'president' || currentUser.role === 'treasurer') {
      return true;
    }
    if (currentUser.role === 'block_rep' && currentUser.assignedBlockId === blockId) {
      return true;
    }
    return false;
  };

  const handleToggle = (item: CommonLightingItem) => {
    if (!isAuthorizedToToggle(item.blockId)) return;
    toggleCommonLighting(
      item.id,
      item.status === 'working' ? 'defective' : 'working',
      item.status === 'working'
        ? 'Signalé manuellement par le syndic'
        : 'Remise en service validée'
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Éclairage des Parties Communes & Abords (9 Blocs)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Surveillance des cages d'escalier, paliers RDC à R+3 et périmètres des 18 bassins
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              defectiveCommonLightingCount > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {defectiveCommonLightingCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{defectiveCommonLightingCount} anomalie(s) active(s)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tous les réseaux conformes</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid of lighting by block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {blocks.map((block) => {
          const items = commonLighting.filter((l) => l.blockId === block.id);
          const hasDefect = items.some((i) => i.status === 'defective');
          const canEdit = isAuthorizedToToggle(block.id);

          return (
            <div
              key={block.id}
              className={`p-4 rounded-xl border transition-all ${
                hasDefect
                  ? 'bg-amber-50/20 border-amber-300'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              {/* Header Bloc */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {block.code}
                  </div>
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {block.name.split(' - ')[1] || block.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                    hasDefect
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {hasDefect ? 'Panne signalée' : 'OK'}
                </span>
              </div>

              {/* Items for this block */}
              <div className="space-y-2 text-xs">
                {items.map((item) => {
                  const isDefective = item.status === 'defective';

                  return (
                    <div
                      key={item.id}
                      className="p-2 bg-white rounded-lg border border-slate-200/80 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Zap
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isDefective ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                          />
                          <span className="text-[11px] font-medium text-slate-800 truncate">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isDefective
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isDefective ? 'Défaut' : 'Conforme'}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-[10px] text-slate-500 mt-1 pl-5 line-clamp-1">
                          {item.notes}
                        </p>
                      )}

                      {/* Action toggle for authorized user */}
                      {canEdit && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleToggle(item)}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {isDefective ? 'Valider réparation' : 'Signaler panne'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
