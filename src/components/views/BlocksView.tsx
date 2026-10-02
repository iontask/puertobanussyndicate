import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { BlockDetailView } from '../blocks/BlockDetailView';
import { BlockCode } from '../../types';
import {
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Zap,
  Users,
  Search,
  ShieldCheck,
  User,
  ArrowRight,
} from 'lucide-react';

interface BlocksViewProps {
  initialBlockCode?: BlockCode;
}

export const BlocksView: React.FC<BlocksViewProps> = ({ initialBlockCode = 'H' }) => {
  const { currentUser } = useAuth();
  const {
    blocks,
    blocksSummaries,
    getBlockByCode,
    getRepresentativeForBlock,
    totalBlocksCount,
    totalApartmentsCount,
  } = useResidence();

  // If block rep, default to assigned block
  const defaultCode = currentUser.role === 'block_rep' ? 'H' : initialBlockCode;
  const [selectedBlockCode, setSelectedBlockCode] = useState<BlockCode>(defaultCode);
  const [filterMode, setFilterMode] = useState<'all' | 'alerts' | 'complaints'>('all');

  // Filtrage des blocs selon le statut
  const filteredSummaries = useMemo(() => {
    if (filterMode === 'alerts') {
      return blocksSummaries.filter((s) => s.hasAlert);
    }
    if (filterMode === 'complaints') {
      return blocksSummaries.filter((s) => s.openComplaintsCount > 0);
    }
    return blocksSummaries;
  }, [blocksSummaries, filterMode]);

  const selectedBlock = getBlockByCode(selectedBlockCode) || blocks[7];
  const selectedRep = getRepresentativeForBlock(selectedBlockCode);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Patrimoine Bâti & Gestion Spatiale des 9 Blocs (A à I)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision cadastrale des {totalBlocksCount} bâtiments, des 18 piscines associées et des {totalApartmentsCount} logements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span>Total Puerto Banus :</span>
          <strong className="text-blue-600">{totalApartmentsCount} Lots</strong>
          <span className="text-slate-300">|</span>
          <span>Bloc {selectedBlockCode} :</span>
          <strong className="text-slate-900">{selectedBlock.apartmentCount} Lots</strong>
        </div>
      </div>

      {/* Filter and Overview Cards of the 9 Blocks */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-800">Filtrer les Bâtiments :</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterMode === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous (9)
              </button>
              <button
                onClick={() => setFilterMode('alerts')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  filterMode === 'alerts'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Avec anomalie</span>
              </button>
              <button
                onClick={() => setFilterMode('complaints')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  filterMode === 'complaints'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Incidents ouverts</span>
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Sélectionnez un bloc pour afficher sa fiche complète
          </span>
        </div>

        {/* 9 Blocks Interactive Badges / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {blocks.map((b) => {
            const isSelected = b.code === selectedBlockCode;
            const summary = blocksSummaries.find((s) => s.block.id === b.id);
            const hasAlert = summary?.hasAlert;

            return (
              <button
                key={b.id}
                id={`block-tab-${b.code}`}
                onClick={() => setSelectedBlockCode(b.code)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : hasAlert
                    ? 'bg-amber-50 text-slate-800 border-amber-200 hover:bg-amber-100/60'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {b.code}
                </span>
                <span>{b.name.split(' - ')[1] || b.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  ({b.apartmentCount})
                </span>
                {hasAlert && !isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vue détaillée du bloc sélectionné */}
      <BlockDetailView block={selectedBlock} representative={selectedRep} />
    </div>
  );
};
