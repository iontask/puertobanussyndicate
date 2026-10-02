import React from 'react';
import { Building2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Block, BlockCode, Contribution } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BlockComparativeTableProps {
  blocks: Block[];
  contributions: Contribution[];
  selectedBlockFilter: string;
  onSelectBlock: (blockId: string) => void;
}

export const BlockComparativeTable: React.FC<BlockComparativeTableProps> = ({
  blocks,
  contributions,
  selectedBlockFilter,
  onSelectBlock,
}) => {
  const { currentTenant } = useAuth();
  const currency = currentTenant.currency || 'MAD';

  // Calcul dynamique dérivé par bloc
  const blockStats = blocks.map((block) => {
    const blockContributions = contributions.filter((c) => c.blockId === block.id);
    const totalCalled = blockContributions.reduce((sum, c) => sum + c.amountDue, 0);
    const totalPaid = blockContributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalUnpaid = blockContributions.reduce((sum, c) => sum + c.balance, 0);
    const lotsCount = block.apartmentCount || 50;
    const recoveryRate = totalCalled > 0 ? (totalPaid / totalCalled) * 100 : 100;
    const overdueLots = blockContributions.filter((c) => c.status === 'overdue').length;

    return {
      block,
      lotsCount,
      totalCalled,
      totalPaid,
      totalUnpaid,
      recoveryRate,
      overdueLots,
      isSelected: selectedBlockFilter === block.id,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Suivi Analytique & Comparatif des 9 Bâtiments (A à I)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Taux de recouvrement dynamique et ventilation des impayés par copropriété de bloc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Isolation financière active</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Bâtiment / Nom</th>
              <th className="px-4 py-3 text-center">Nombre de Lots</th>
              <th className="px-4 py-3 text-right">Total Appelé</th>
              <th className="px-4 py-3 text-right">Total Encaissé</th>
              <th className="px-4 py-3 text-right">Reste / Impayés</th>
              <th className="px-4 py-3 text-center w-48">Taux de Recouvrement</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {blockStats.map((stat) => {
              const isExcellent = stat.recoveryRate >= 90;
              const isMedium = stat.recoveryRate >= 75 && stat.recoveryRate < 90;

              return (
                <tr
                  key={stat.block.id}
                  onClick={() => onSelectBlock(stat.isSelected ? 'all' : stat.block.id)}
                  className={`cursor-pointer transition-colors ${
                    stat.isSelected
                      ? 'bg-blue-50/70 font-medium'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        stat.isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {stat.block.code}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Bloc {stat.block.code}</span>
                          <span className="text-slate-400 font-normal">({stat.block.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stat.overdueLots > 0 ? (
                            <span className="text-rose-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {stat.overdueLots} lot(s) en retard
                            </span>
                          ) : (
                            <span className="text-emerald-700">À jour</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700">
                    {stat.lotsCount} lots
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900">
                    {stat.totalCalled.toLocaleString('fr-FR')} {currency}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-bold">
                    {stat.totalPaid.toLocaleString('fr-FR')} {currency}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-bold">
                    {stat.totalUnpaid > 0 ? (
                      <span className="text-rose-600">
                        {stat.totalUnpaid.toLocaleString('fr-FR')} {currency}
                      </span>
                    ) : (
                      <span className="text-emerald-700">0 {currency}</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isExcellent
                              ? 'bg-emerald-500'
                              : isMedium
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, stat.recoveryRate))}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono font-bold text-xs ${
                        isExcellent ? 'text-emerald-700' : isMedium ? 'text-amber-700' : 'text-rose-600'
                      }`}>
                        {stat.recoveryRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock(stat.isSelected ? 'all' : stat.block.id);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        stat.isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{stat.isSelected ? 'Filtré' : 'Filtrer'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
