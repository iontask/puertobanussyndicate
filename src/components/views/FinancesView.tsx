import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { PaymentTransaction, Contribution } from '../../types';
import { FinanceOverviewKPIs } from '../finance/FinanceOverviewKPIs';
import { BlockComparativeTable } from '../finance/BlockComparativeTable';
import { ContributionsRegistry } from '../finance/ContributionsRegistry';
import { RecordPaymentModal } from '../finance/RecordPaymentModal';
import { IssueCallModal } from '../finance/IssueCallModal';
import { ReceiptModal } from '../finance/ReceiptModal';
import { ResidentFinancesPortal } from '../portal/ResidentFinancesPortal';
import { PrintableFinancialLedger } from '../reports/PrintableFinancialLedger';
import { downloadCSV } from '../../utils/exportHelpers';
import { ShieldCheck, Lock, AlertTriangle, Building2, Coins, Printer, Download } from 'lucide-react';

export const FinancesView: React.FC = () => {
  const { currentUser, currentTenant } = useAuth();
  const {
    blocks,
    allApartments,
    contributions,
    payments,
    financialTotals,
    getApartmentById,
  } = useResidence();

  // Filters State
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [preselectedContributionId, setPreselectedContributionId] = useState<string | undefined>(undefined);
  const [isIssueCallOpen, setIsIssueCallOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentTransaction | null>(null);
  const [selectedReceiptContribution, setSelectedReceiptContribution] = useState<Contribution | undefined>(undefined);
  const [isPrintableLedgerOpen, setIsPrintableLedgerOpen] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 1. ISOLATION STRICTE : PORTAIL PRIVATIF RÉCUPÉRÉ POUR LE RÉSIDENT
  // -------------------------------------------------------------
  if (currentUser.role === 'resident') {
    return <ResidentFinancesPortal />;
  }

  // -------------------------------------------------------------
  // 2. RESTRICTION STRICTE : REPRÉSENTANT DE BLOC
  // Le représentant de bloc n'a pas accès aux données financières nominatives
  // -------------------------------------------------------------
  if (currentUser.role === 'block_rep') {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-amber-900">
            Accès Financier Nominatif Restreint
          </h2>
          <p className="text-xs text-amber-800 mt-2 leading-relaxed">
            Conformément au règlement de copropriété de la Résidence Puerto Banus et aux règles d'isolation RGPD/stricte étanchéité financière, l'accès au Grand Livre comptable nominatif et aux relevés individuels des copropriétaires est réservé exclusivement au <strong>Trésorier Général</strong> et au <strong>Président du Syndic</strong>.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Périmètre sécurisé : Représentant Bloc {currentUser.assignedBlockId ? currentUser.assignedBlockId.replace('block-', '').toUpperCase() : 'H'}</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. TABLEAU DE BORD GLOBAL TRÉSORIER & PRÉSIDENT
  // Calculs dynamiques dérivés des transactions et cotisations réelles
  // -------------------------------------------------------------
  const filteredContributionsForKPIs = useMemo(() => {
    return contributions.filter((c) => {
      if (selectedBlockFilter !== 'all' && c.blockId !== selectedBlockFilter) return false;
      if (selectedPeriodFilter !== 'all' && c.period !== selectedPeriodFilter) return false;
      if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [contributions, selectedBlockFilter, selectedPeriodFilter, selectedStatusFilter]);

  const dynamicKPIs = useMemo(() => {
    const totalCalled = filteredContributionsForKPIs.reduce((sum, c) => sum + c.amountDue, 0);
    const totalPaid = filteredContributionsForKPIs.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalBalance = filteredContributionsForKPIs.reduce((sum, c) => sum + c.balance, 0);
    const recoveryRate = totalCalled > 0 ? (totalPaid / totalCalled) * 100 : 100;

    let periodLabel = 'Consolidé (Tous blocs/périodes)';
    if (selectedPeriodFilter !== 'all' && selectedBlockFilter !== 'all') {
      periodLabel = `${selectedPeriodFilter} • Bloc ${selectedBlockFilter.replace('block-', '').toUpperCase()}`;
    } else if (selectedPeriodFilter !== 'all') {
      periodLabel = `${selectedPeriodFilter} • 9 Blocs`;
    } else if (selectedBlockFilter !== 'all') {
      periodLabel = `Bloc ${selectedBlockFilter.replace('block-', '').toUpperCase()} • Toutes périodes`;
    }

    return {
      totalCalled,
      totalPaid,
      totalBalance,
      recoveryRate,
      periodLabel,
    };
  }, [filteredContributionsForKPIs, selectedPeriodFilter, selectedBlockFilter]);

  const handleOpenRecordPayment = (contributionId?: string) => {
    setPreselectedContributionId(contributionId);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenReceipt = (payment: PaymentTransaction, contribution?: Contribution) => {
    setSelectedReceiptPayment(payment);
    setSelectedReceiptContribution(contribution);
    setIsReceiptOpen(true);
  };

  const handlePaymentSuccess = (payment: PaymentTransaction) => {
    setSelectedReceiptPayment(payment);
    const c = contributions.find((item) => item.id === payment.contributionId);
    setSelectedReceiptContribution(c);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span>Finances de la Copropriété • Grand Livre & Encaissements</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comptabilité syndicale consolidée, suivi analytique des 9 blocs et émission des quittances certifiées
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-finances-print-ledger"
            onClick={() => setIsPrintableLedgerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Grand Livre PDF/Imprimer</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Accès certifié : {currentUser.role === 'treasurer' ? 'Trésorière Générale' : 'Président du Syndic'}</span>
          </span>
        </div>
      </div>

      {/* 1. Dynamic Financial KPIs (No hardcoded values) */}
      <FinanceOverviewKPIs
        totalCalled={dynamicKPIs.totalCalled}
        totalPaid={dynamicKPIs.totalPaid}
        totalBalance={dynamicKPIs.totalBalance}
        recoveryRate={dynamicKPIs.recoveryRate}
        periodLabel={dynamicKPIs.periodLabel}
      />

      {/* 2. Analytical Comparative Table of all 9 Blocks */}
      <BlockComparativeTable
        blocks={blocks}
        contributions={contributions}
        selectedBlockFilter={selectedBlockFilter}
        onSelectBlock={(blockId) => setSelectedBlockFilter(blockId)}
      />

      {/* 3. Detailed Contributions Registry */}
      <ContributionsRegistry
        contributions={contributions}
        apartments={allApartments}
        blocks={blocks}
        payments={payments}
        selectedBlockFilter={selectedBlockFilter}
        onSelectBlockFilter={(b) => setSelectedBlockFilter(b)}
        selectedPeriodFilter={selectedPeriodFilter}
        onSelectPeriodFilter={(p) => setSelectedPeriodFilter(p)}
        selectedStatusFilter={selectedStatusFilter}
        onSelectStatusFilter={(s) => setSelectedStatusFilter(s)}
        searchQuery={searchQuery}
        onSearchQueryChange={(q) => setSearchQuery(q)}
        onOpenRecordPayment={handleOpenRecordPayment}
        onOpenIssueCall={() => setIsIssueCallOpen(true)}
        onOpenReceipt={handleOpenReceipt}
      />

      {/* Modal 1 : Record Payment */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        preselectedContributionId={preselectedContributionId}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Modal 2 : Issue Call for Funds */}
      <IssueCallModal
        isOpen={isIssueCallOpen}
        onClose={() => setIsIssueCallOpen(false)}
      />

      {/* Modal 3 : Printable Receipt Quittance */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedReceiptPayment}
        contribution={selectedReceiptContribution}
        apartment={
          selectedReceiptPayment
            ? getApartmentById(selectedReceiptPayment.apartmentId)
            : undefined
        }
      />

      {/* Modal 4 : Printable Financial Ledger (Grand Livre Officiel) */}
      <PrintableFinancialLedger
        isOpen={isPrintableLedgerOpen}
        onClose={() => setIsPrintableLedgerOpen(false)}
        tenant={currentTenant}
        apartments={allApartments}
        contributions={contributions}
        payments={payments}
        financialTotals={financialTotals}
      />
    </div>
  );
};
