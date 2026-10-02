import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  FileCheck2,
  Receipt,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coins,
  ChevronDown,
} from 'lucide-react';
import { Contribution, Apartment, Block, PaymentTransaction, ContributionStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ContributionsRegistryProps {
  contributions: Contribution[];
  apartments: Apartment[];
  blocks: Block[];
  payments: PaymentTransaction[];
  selectedBlockFilter: string;
  onSelectBlockFilter: (blockId: string) => void;
  selectedPeriodFilter: string;
  onSelectPeriodFilter: (period: string) => void;
  selectedStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onOpenRecordPayment: (contributionId?: string) => void;
  onOpenIssueCall: () => void;
  onOpenReceipt: (payment: PaymentTransaction, contribution?: Contribution) => void;
}

export const ContributionsRegistry: React.FC<ContributionsRegistryProps> = ({
  contributions,
  apartments,
  blocks,
  payments,
  selectedBlockFilter,
  onSelectBlockFilter,
  selectedPeriodFilter,
  onSelectPeriodFilter,
  selectedStatusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchQueryChange,
  onOpenRecordPayment,
  onOpenIssueCall,
  onOpenReceipt,
}) => {
  const { currentTenant } = useAuth();
  const currency = currentTenant.currency || 'MAD';

  // Map apartment for fast lookup
  const aptMap = useMemo(() => {
    const map = new Map<string, Apartment>();
    apartments.forEach((a) => map.set(a.id, a));
    return map;
  }, [apartments]);

  // Unique periods available
  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(contributions.map((c) => c.period)));
    return periods.sort().reverse();
  }, [contributions]);

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter((cnt) => {
      // 1. Block Filter
      if (selectedBlockFilter !== 'all' && cnt.blockId !== selectedBlockFilter) {
        return false;
      }

      // 2. Period Filter
      if (selectedPeriodFilter !== 'all' && cnt.period !== selectedPeriodFilter) {
        return false;
      }

      // 3. Status Filter
      if (selectedStatusFilter !== 'all') {
        if (cnt.status !== selectedStatusFilter) return false;
      }

      // 4. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const apt = aptMap.get(cnt.apartmentId);
        const matchDoor = apt?.doorNumber.toLowerCase().includes(query);
        const matchOwner = apt?.ownerName.toLowerCase().includes(query);
        const matchPeriod = cnt.period.toLowerCase().includes(query);
        const matchBlock = cnt.blockId.toLowerCase().includes(query);

        if (!matchDoor && !matchOwner && !matchPeriod && !matchBlock) {
          return false;
        }
      }

      return true;
    });
  }, [
    contributions,
    selectedBlockFilter,
    selectedPeriodFilter,
    selectedStatusFilter,
    searchQuery,
    aptMap,
  ]);

  const getStatusBadge = (status: ContributionStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Réglée (100%)</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Partiel</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>En attente</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>En retard (Impayé)</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Top Header & Global Actions */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Grand Livre & Registre des Cotisations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi individuel par lot, quote-part de tantièmes, encaissements et quittances
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenIssueCall}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Émettre un appel de fonds</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenRecordPayment()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Enregistrer un encaissement</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Chercher lot (ex: H-12), nom..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-60"
            />
          </div>

          {/* Period Filter */}
          <select
            value={selectedPeriodFilter}
            onChange={(e) => onSelectPeriodFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Toutes les périodes</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Block Filter */}
          <select
            value={selectedBlockFilter}
            onChange={(e) => onSelectBlockFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Tous les Blocs (A à I)</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                Bloc {b.code} ({b.name})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => onSelectStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Tous les états</option>
            <option value="paid">Réglées (100%)</option>
            <option value="partial">Paiements partiels</option>
            <option value="pending">En attente</option>
            <option value="overdue">Impayées (En retard)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Affichage de <strong className="text-slate-900">{filteredContributions.length}</strong> lot(s)
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Lot & Bloc</th>
              <th className="px-4 py-3">Copropriétaire Débiteur</th>
              <th className="px-4 py-3">Quote-part</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3 text-right">Appelé</th>
              <th className="px-4 py-3 text-right">Réglé</th>
              <th className="px-4 py-3 text-right">Solde Dû</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredContributions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                  Aucune cotisation ne correspond aux critères de recherche sélectionnés.
                </td>
              </tr>
            ) : (
              filteredContributions.slice(0, 50).map((cnt) => {
                const apt = aptMap.get(cnt.apartmentId);
                const isH12 = apt?.doorNumber === 'H-12';

                // Find matching payment for receipt
                const matchedPayment = payments.find((p) => p.contributionId === cnt.id);

                return (
                  <tr
                    key={cnt.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isH12 ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {apt?.doorNumber || cnt.apartmentId}
                        </span>
                        {isH12 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-600 text-white font-bold">
                            Lot H-12
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Bloc {apt?.doorNumber.charAt(0) || 'H'} • {apt?.surfaceM2 || 100} m²
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">
                        {apt?.ownerName || 'Copropriétaire standard'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {apt?.residentType === 'owner' ? 'Propriétaire occupant' : 'Bailleur (Lot loué)'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {cnt.tantiemes ? `${cnt.tantiemes} / 10 000` : '200 / 10 000'}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {cnt.period}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800">
                      {cnt.amountDue.toLocaleString('fr-FR')} {currency}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-bold">
                      {cnt.amountPaid.toLocaleString('fr-FR')} {currency}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-black">
                      {cnt.balance > 0 ? (
                        <span className="text-rose-600">
                          {cnt.balance.toLocaleString('fr-FR')} {currency}
                        </span>
                      ) : (
                        <span className="text-emerald-700">0 {currency}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {getStatusBadge(cnt.status)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {cnt.balance > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenRecordPayment(cnt.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
                            title="Encaisser et solder"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Encaisser</span>
                          </button>
                        )}

                        {cnt.amountPaid > 0 && matchedPayment && (
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(matchedPayment, cnt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                            title="Visualiser la quittance officielle"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Quittance</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredContributions.length > 50 && (
        <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-100">
          Affichage des 50 premiers résultats sur {filteredContributions.length}. Utilisez les filtres ou la recherche pour affiner.
        </div>
      )}
    </div>
  );
};
