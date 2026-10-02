import React from 'react';
import { Apartment, Contribution, PaymentTransaction, Tenant } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { Printer, Download, X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { downloadCSV } from '../../utils/exportHelpers';

interface PrintableFinancialLedgerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  apartments: Apartment[];
  contributions: Contribution[];
  payments: PaymentTransaction[];
  financialTotals: {
    totalCalled: number;
    totalPaid: number;
    totalBalance: number;
    recoveryRatePercent: number;
  };
}

export const PrintableFinancialLedger: React.FC<PrintableFinancialLedgerProps> = ({
  isOpen,
  onClose,
  tenant,
  apartments,
  contributions,
  payments,
  financialTotals,
}) => {
  const { t, isRTL } = useI18n();

  if (!isOpen) return null;

  // Build rows per apartment
  const apartmentRows = apartments.map((apt) => {
    const aptContributions = contributions.filter((c) => c.apartmentId === apt.id);
    const called = aptContributions.reduce((sum, c) => sum + c.amountMAD, 0);
    const settled = aptContributions.reduce((sum, c) => sum + c.paidAmountMAD, 0);
    const balance = called - settled;

    let status = 'paid';
    if (balance > 0 && settled === 0) status = 'unpaid';
    else if (balance > 0) status = 'partial';

    return {
      apt,
      called,
      settled,
      balance,
      status,
    };
  });

  const handleExportCSV = () => {
    const headers = [
      'N° Lot / Appartement',
      'Bloc',
      'Étage',
      'Surface (m²)',
      'Tantièmes / Quote-part',
      'Copropriétaire',
      'Téléphone',
      'Cotisations Appelées (MAD)',
      'Montant Encaissé (MAD)',
      'Solde Restant (MAD)',
      'Statut',
    ];

    const rows = apartmentRows.map((row) => [
      row.apt.number,
      row.apt.blockCode,
      row.apt.floor,
      row.apt.surfaceM2,
      `${row.apt.shareTantiemes} / 10 000`,
      row.apt.ownerName,
      row.apt.ownerPhone,
      row.called,
      row.settled,
      row.balance,
      row.status === 'paid' ? 'À jour' : row.status === 'partial' ? 'Partiel' : 'Impayé',
    ]);

    downloadCSV(`Grand_Livre_Financier_${tenant.code}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Action Bar (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              GL
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                {t('reports.grand_livre')}
              </h3>
              <p className="text-xs text-slate-400">
                {tenant.name} • {apartments.length} {t('terms.apartments')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('common.print')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-900 bg-white" id="printable-financial-ledger">
          
          {/* Formal Official Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest uppercase bg-slate-900 text-white">
                  Syndic de Copropriété
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Loi 18-00 relative au statut de la copropriété
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {tenant.name}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Code Résidence : {tenant.code} • 9 Blocs Résidentiels (A à I) • 18 Bassins
              </p>
              <p className="text-[11px] text-slate-500">
                Immatriculation Syndicale N° RC-MAR-2024-88419 • M'diq - Fnideq
              </p>
            </div>

            <div className={`text-right sm:${isRTL ? 'text-left' : 'text-right'}`}>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('reports.grand_livre')}
              </div>
              <div className="text-xs text-slate-500">
                {t('reports.period')} : Exercice 2026
              </div>
              <div className="text-xs text-slate-500">
                {t('reports.generated_at')} : <span className="font-semibold text-slate-700">{currentDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* Consolidated Financial Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                {t('reports.total_due')}
              </span>
              <span className="text-lg font-black text-slate-900">
                {financialTotals.totalCalled.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">{tenant.currency}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                {t('reports.total_collected')}
              </span>
              <span className="text-lg font-black text-emerald-700">
                {financialTotals.totalPaid.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">{tenant.currency}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                {t('reports.recovery')}
              </span>
              <span className="text-lg font-black text-blue-700">
                {financialTotals.recoveryRatePercent}%
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                {t('reports.residual_unpaid')}
              </span>
              <span className="text-lg font-black text-rose-700">
                {financialTotals.totalBalance.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">{tenant.currency}</span>
              </span>
            </div>
          </div>

          {/* Detailed Ledger Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 font-semibold">{t('reports.lot_number')}</th>
                  <th className="py-2.5 px-3 font-semibold">{t('terms.block')}</th>
                  <th className="py-2.5 px-3 font-semibold">{t('terms.owner')}</th>
                  <th className="py-2.5 px-3 font-semibold">{t('terms.quotite')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t('reports.amount_called')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t('reports.amount_settled')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t('reports.remaining')}</th>
                  <th className="py-2.5 px-3 font-semibold text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {apartmentRows.map((row) => (
                  <tr key={row.apt.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                      {row.apt.number}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      Bloc {row.apt.blockCode}
                    </td>
                    <td className="py-2 px-3 text-slate-800">
                      <div className="font-medium leading-tight">{row.apt.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{row.apt.ownerPhone}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                      {row.apt.shareTantiemes} / 10 000
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900">
                      {row.called.toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-700">
                      {row.settled.toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {row.balance > 0 ? (
                        <span className="text-rose-600">{row.balance.toLocaleString('fr-FR')}</span>
                      ) : (
                        <span className="text-slate-400">0,00</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.status === 'paid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {t('reports.status_paid')}
                        </span>
                      )}
                      {row.status === 'partial' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          {t('reports.status_partial')}
                        </span>
                      )}
                      {row.status === 'unpaid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          {t('reports.status_unpaid')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td colSpan={4} className="py-3 px-3 uppercase text-xs">
                    Totaux Généraux ({apartments.length} lots)
                  </td>
                  <td className="py-3 px-3 text-right text-xs">
                    {financialTotals.totalCalled.toLocaleString('fr-FR')} {tenant.currency}
                  </td>
                  <td className="py-3 px-3 text-right text-xs text-emerald-700">
                    {financialTotals.totalPaid.toLocaleString('fr-FR')} {tenant.currency}
                  </td>
                  <td className="py-3 px-3 text-right text-xs text-rose-700">
                    {financialTotals.totalBalance.toLocaleString('fr-FR')} {tenant.currency}
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-blue-700">
                    {financialTotals.recoveryRatePercent}% recouvré
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Signatures and Stamp Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 mt-6 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Mention légale :
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {t('reports.legal_mentions')} Tout copropriétaire dispose d’un droit de consultation des pièces justificatives de dépenses au siège du syndic durant les heures ouvrables.
              </p>
            </div>

            <div className="flex justify-around items-end pt-4 sm:pt-0">
              <div className="text-center">
                <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                  La Trésorière du Bureau
                </div>
                <div className="font-serif italic text-slate-800 text-sm">
                  Laila Bennani
                </div>
                <div className="text-[10px] text-slate-400">
                  (Signature & Visa)
                </div>
              </div>

              <div className="text-center">
                <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                  Le Président du Syndic
                </div>
                <div className="font-serif italic text-slate-800 text-sm">
                  Mohamed Alami
                </div>
                <div className="text-[10px] text-slate-400">
                  (Sceau officiel du Syndic)
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
