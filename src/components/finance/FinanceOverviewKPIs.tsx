import React from 'react';
import { Coins, TrendingUp, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FinanceOverviewKPIsProps {
  totalCalled: number;
  totalPaid: number;
  totalBalance: number;
  recoveryRate: number;
  periodLabel?: string;
}

export const FinanceOverviewKPIs: React.FC<FinanceOverviewKPIsProps> = ({
  totalCalled,
  totalPaid,
  totalBalance,
  recoveryRate,
  periodLabel = 'Exercice consolidé',
}) => {
  const { currentTenant } = useAuth();
  const currency = currentTenant.currency || 'MAD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Appelé */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Appelé
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totalCalled.toLocaleString('fr-FR')} <span className="text-sm font-sans font-semibold text-slate-500">{currency}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{periodLabel}</span>
          </div>
        </div>
      </div>

      {/* 2. Total Encaissé */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Encaissé
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-emerald-700 tracking-tight font-mono">
            {totalPaid.toLocaleString('fr-FR')} <span className="text-sm font-sans font-semibold text-emerald-600">{currency}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100/70 text-emerald-800">
              {recoveryRate.toFixed(1)}% du total
            </span>
            <span className="text-xs text-slate-500">Fonds reçus en banque</span>
          </div>
        </div>
      </div>

      {/* 3. Reste à Recouvrer / Impayés */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reste à Recouvrer
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            totalBalance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-black tracking-tight font-mono ${
            totalBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {totalBalance.toLocaleString('fr-FR')} <span className="text-sm font-sans font-semibold text-slate-500">{currency}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${totalBalance > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            <span>Impayés & échéances en cours</span>
          </div>
        </div>
      </div>

      {/* 4. Taux de Recouvrement Global (%) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Taux de Recouvrement
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {recoveryRate.toFixed(1)}%
            </span>
            <span className={`text-xs font-bold ${
              recoveryRate >= 90
                ? 'text-emerald-600'
                : recoveryRate >= 75
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {recoveryRate >= 90 ? 'Excellent' : recoveryRate >= 75 ? 'Satisfaisant' : 'Vigilance'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                recoveryRate >= 90
                  ? 'bg-emerald-500'
                  : recoveryRate >= 75
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, recoveryRate))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
