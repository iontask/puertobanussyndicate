import React, { useState } from 'react';
import {
  Coins,
  FileCheck2,
  Calendar,
  AlertCircle,
  Download,
  Copy,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { PaymentTransaction, Contribution } from '../../types';
import { ReceiptModal } from '../finance/ReceiptModal';

export const ResidentFinancesPortal: React.FC = () => {
  const { currentTenant, assignedApartment, currentUser } = useAuth();
  const { getContributionsForApartment, getPaymentsForApartment, allApartments } = useResidence();

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copiedRib, setCopiedRib] = useState(false);

  const currency = currentTenant.currency || 'MAD';

  // Strict Resident Isolation: Target is strictly assignedApartment or apt-h-12
  const myApartment = assignedApartment || allApartments.find((a) => a.id === 'apt-h-12') || {
    id: 'apt-h-12',
    tenantId: 'tenant-pb-01',
    blockId: 'block-h',
    doorNumber: 'H-12',
    floor: 1,
    ownerName: 'M. & Mme Youssef Tazi',
    residentName: 'Youssef Tazi',
    residentType: 'owner' as const,
    surfaceM2: 118,
    tantiemes: 215,
    contactPhone: '+212 6 61 45 89 20',
  };

  // Strictly filter records for THIS apartment only
  const myContributions = getContributionsForApartment(myApartment.id);
  const myPayments = getPaymentsForApartment(myApartment.id);

  // Derived financial metrics for this resident
  const totalDue = myContributions.reduce((sum, c) => sum + c.balance, 0);
  const totalPaid = myContributions.reduce((sum, c) => sum + c.amountPaid, 0);

  // Find last payment
  const lastPayment = myPayments.length > 0 ? myPayments[0] : null;

  // Find next upcoming due
  const nextPendingContribution = myContributions.find((c) => c.balance > 0);

  const handleCopyRib = () => {
    navigator.clipboard?.writeText('011 780 0000 1234567890 44');
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2000);
  };

  const handleOpenReceipt = (payment: PaymentTransaction) => {
    setSelectedReceiptPayment(payment);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <span>Portail Financier Privatif • Porte {myApartment.doorNumber}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Périmètre Sécurisé
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Relevé officiel des cotisations syndicales de copropriété pour {myApartment.ownerName}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs">
          <span className="text-slate-400">Quote-part légale :</span>{' '}
          <strong className="text-white font-mono">{myApartment.tantiemes || 215} / 10 000 tantièmes</strong>
        </div>
      </div>

      {/* 3 Personal KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Solde actuel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Solde Actuel Dû</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              totalDue > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black font-mono tracking-tight ${
              totalDue > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {totalDue.toLocaleString('fr-FR')} <span className="text-sm font-sans font-semibold text-slate-500">{currency}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalDue === 0 ? 'Votre compte copropriétaire est à jour' : 'Appel de charges en attente'}
            </p>
          </div>
        </div>

        {/* 2. Dernière Quittance Disponible */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Dernière Quittance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {lastPayment ? (
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {lastPayment.receiptNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>{lastPayment.amount.toLocaleString('fr-FR')} {currency} réglés</span>
                  <button
                    onClick={() => handleOpenReceipt(lastPayment)}
                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    Voir reçu
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-2">Aucun reçu archivé</div>
            )}
          </div>
        </div>

        {/* 3. Prochaine Échéance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Prochaine Échéance</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {nextPendingContribution ? (
              <div>
                <div className="text-base font-bold text-slate-900">
                  {nextPendingContribution.period}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Échéance : <strong className="font-mono text-slate-800">{nextPendingContribution.dueDate || '15/10/2026'}</strong> ({nextPendingContribution.balance.toLocaleString('fr-FR')} {currency})
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-700 font-semibold mt-2">Aucune échéance en attente</div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <span>Historique Personnel des Cotisations & Paiements (Porte {myApartment.doorNumber})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Relevé certifié conforme au registre de la copropriété
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Période</th>
                <th className="px-4 py-3 text-right">Montant Appelé</th>
                <th className="px-4 py-3 text-right">Montant Réglé</th>
                <th className="px-4 py-3 text-right">Solde Dû</th>
                <th className="px-4 py-3">Date Limite</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-right">Quittance Officielle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myContributions.map((cnt) => {
                const matchedPayment = myPayments.find((p) => p.contributionId === cnt.id);

                return (
                  <tr key={cnt.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
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
                        <span className="text-rose-600 font-bold">
                          {cnt.balance.toLocaleString('fr-FR')} {currency}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">0,00 {currency}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {cnt.dueDate || '15/10/2026'}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          cnt.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cnt.status === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : cnt.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {cnt.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Réglée</span>
                          </>
                        ) : cnt.status === 'partial' ? (
                          'Paiement partiel'
                        ) : cnt.status === 'overdue' ? (
                          'En retard'
                        ) : (
                          'En attente'
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {matchedPayment ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(matchedPayment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 shadow-2xs transition"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Télécharger le reçu ({matchedPayment.receiptNumber})</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">En attente de paiement</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Settlement Instructions (RIB) Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Coordonnées Bancaires Officielles du Syndicat Puerto Banus
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pour régler vos cotisations par virement bancaire, veuillez indiquer le numéro de votre lot en libellé (ex: COTISATION H-12 T4).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">RIB BMCE Bank of Africa</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  011 780 0000 1234567890 44
                </div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Titulaire : Syndicat des Copropriétaires Résidence Puerto Banus
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRib}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold font-sans transition shrink-0"
              >
                {copiedRib ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RIB Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copier le RIB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedReceiptPayment}
        apartment={myApartment}
      />
    </div>
  );
};
