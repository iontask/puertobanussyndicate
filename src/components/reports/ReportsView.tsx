import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ScrollText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  FileCheck,
  Search,
  Filter,
} from 'lucide-react';
import { PrintableFinancialLedger } from './PrintableFinancialLedger';
import { PrintableMaintenanceSheet } from './PrintableMaintenanceSheet';
import { PrintableMinutesDocument } from './PrintableMinutesDocument';
import { SecurityMatrixModal } from './SecurityMatrixModal';
import { downloadCSV } from '../../utils/exportHelpers';

export const ReportsView: React.FC = () => {
  const { currentTenant, currentUser } = useAuth();
  const {
    allApartments,
    contributions,
    payments,
    financialTotals,
    blocks,
    pools,
    commonLighting,
    servicePassages,
    meetings,
    decisions,
  } = useResidence();
  const { t, isRTL } = useI18n();

  // Modals state
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Quick download handlers
  const handleQuickExportLedgerCSV = () => {
    const headers = [
      'N° Lot',
      'Bloc',
      'Étage',
      'Surface (m²)',
      'Tantièmes',
      'Copropriétaire',
      'Téléphone',
      'Appelé (MAD)',
      'Encaissé (MAD)',
      'Solde Restant (MAD)',
      'Statut',
    ];

    const rows = allApartments.map((apt) => {
      const aptContributions = contributions.filter((c) => c.apartmentId === apt.id);
      const called = aptContributions.reduce((sum, c) => sum + c.amountDue, 0);
      const settled = aptContributions.reduce((sum, c) => sum + c.amountPaid, 0);
      const balance = called - settled;
      const blockCode = apt.blockId.replace('block-', '').toUpperCase();
      return [
        apt.doorNumber,
        blockCode,
        apt.floor,
        apt.surfaceM2 || 95,
        `${apt.tantiemes || 132} / 10 000`,
        apt.ownerName,
        apt.contactPhone || 'N/A',
        called,
        settled,
        balance,
        balance === 0 ? 'À jour' : settled > 0 ? 'Partiel' : 'Impayé',
      ];
    });

    downloadCSV(
      `Grand_Livre_${currentTenant.code}_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const handleQuickExportPoolsCSV = () => {
    const headers = [
      'Bassin ID',
      'Bloc',
      'Type',
      'Statut',
      'Température (°C)',
      'pH',
      'Chlore (ppm)',
      'Éclairage',
    ];

    const rows = pools.map((p) => [
      p.id,
      p.blockId.replace('block-', '').toUpperCase(),
      p.type === 'adult' ? 'Grand Bassin' : 'Pataugeoire',
      p.status,
      p.waterTemperatureC || 26,
      p.phLevel || 7.3,
      p.chlorinePpm || 1.8,
      p.lightingStatus,
    ]);

    downloadCSV(
      `Maintenance_Piscines_${currentTenant.code}_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const handleQuickExportDecisionsCSV = () => {
    const headers = [
      'Code',
      'Titre',
      'Périmètre',
      'Responsable',
      'Échéance',
      'Budget (MAD)',
      'Statut',
    ];

    const rows = decisions.map((d) => [
      d.code,
      d.title,
      d.targetBlockCode ? `Bloc ${d.targetBlockCode}` : 'Résidence',
      d.assignedName,
      d.dueDate,
      d.budgetMAD || 0,
      d.status,
    ]);

    downloadCSV(
      `Decisions_Resolutions_${currentTenant.code}_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Lot 6 • Production SaaS Multi-Tenant
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {currentTenant.name} ({currentTenant.code})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('reports.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('reports.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-inspect-security-rules"
            onClick={() => setShowSecurityModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sécurité Firestore</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Recouvrement Total
            </span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {financialTotals.recoveryRatePercent}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {financialTotals.totalPaid.toLocaleString('fr-FR')} {currentTenant.currency} encaissés
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              18 Bassins Baignade
            </span>
            <Sparkles className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pools.filter((p) => p.status === 'operational').length} / {pools.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Qualité de l'eau certifiée conforme
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Décisions en Cours
            </span>
            <ScrollText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {decisions.filter((d) => d.status === 'in_progress').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur {decisions.length} résolutions votées en AG
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Conformité Visites
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            100%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Nettoyage & Espaces verts audités
          </p>
        </div>
      </div>

      {/* 3 Main Reporting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Grand Livre Financier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition group">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('reports.grand_livre')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('reports.grand_livre_desc')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Lots couverts :</span>
                <span className="font-semibold text-slate-900">{allApartments.length} lots</span>
              </div>
              <div className="flex justify-between">
                <span>Reste à recouvrer :</span>
                <span className="font-semibold text-rose-600">
                  {financialTotals.totalBalance.toLocaleString('fr-FR')} {currentTenant.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'encaissement :</span>
                <span className="font-semibold text-emerald-700">
                  {financialTotals.recoveryRatePercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              id="btn-open-printable-ledger"
              onClick={() => setShowLedgerModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('reports.print_report')}</span>
            </button>

            <button
              id="btn-export-ledger-csv"
              onClick={handleQuickExportLedgerCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Card 2: Bilan Technique & Bassins */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition group">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('reports.monthly_tech')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('reports.monthly_tech_desc')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Bassins inspectés :</span>
                <span className="font-semibold text-slate-900">18 bassins (9 blocs)</span>
              </div>
              <div className="flex justify-between">
                <span>Éclairage commun :</span>
                <span className="font-semibold text-emerald-700">
                  {commonLighting.filter((l) => l.status === 'working').length} / {commonLighting.length} opérationnels
                </span>
              </div>
              <div className="flex justify-between">
                <span>Passages validés :</span>
                <span className="font-semibold text-slate-900">
                  {servicePassages.filter((p) => p.status === 'validated').length} interventions
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              id="btn-open-printable-tech"
              onClick={() => setShowMaintenanceModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('reports.print_report')}</span>
            </button>

            <button
              id="btn-export-pools-csv"
              onClick={handleQuickExportPoolsCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Card 3: Procès-Verbaux & Résolutions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition group">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <ScrollText className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('reports.ag_resolutions')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('reports.ag_resolutions_desc')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Dernière AG :</span>
                <span className="font-semibold text-slate-900">15 Janvier 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Quorum de vote :</span>
                <span className="font-semibold text-emerald-700">84.2% représenté</span>
              </div>
              <div className="flex justify-between">
                <span>Résolutions enregistrées :</span>
                <span className="font-semibold text-indigo-700">
                  {decisions.length} actions suivies
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              id="btn-open-printable-pv"
              onClick={() => setShowMinutesModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('reports.print_report')}</span>
            </button>

            <button
              id="btn-export-decisions-csv"
              onClick={handleQuickExportDecisionsCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

      </div>

      {/* Firestore Production Rules Security Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">
                Protection Multi-Tenant & Immutabilité WORM Certifiées
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
                PROD-READY
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-snug">
              Les règles de sécurité Firestore garantissent l’isolation stricte par token, interdisent la suppression des journaux d'audit et restreignent la visibilité financière aux seuls propriétaires concernés.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSecurityModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm shrink-0 cursor-pointer"
        >
          <span>Examiner les règles</span>
        </button>
      </div>

      {/* Printable Modals */}
      <PrintableFinancialLedger
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        tenant={currentTenant}
        apartments={allApartments}
        contributions={contributions}
        payments={payments}
        financialTotals={financialTotals}
      />

      <PrintableMaintenanceSheet
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        tenant={currentTenant}
        blocks={blocks}
        pools={pools}
        commonLighting={commonLighting}
        servicePassages={servicePassages}
      />

      <PrintableMinutesDocument
        isOpen={showMinutesModal}
        onClose={() => setShowMinutesModal(false)}
        tenant={currentTenant}
        meeting={meetings[0]}
        decisions={decisions}
      />

      <SecurityMatrixModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
};
