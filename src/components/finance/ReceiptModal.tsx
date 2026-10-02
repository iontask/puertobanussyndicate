import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building, FileText } from 'lucide-react';
import { PaymentTransaction, Apartment, Contribution } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentTransaction | null;
  apartment?: Apartment;
  contribution?: Contribution;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  apartment,
  contribution,
}) => {
  const { currentTenant } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const currency = currentTenant.currency || 'MAD';

  const handlePrint = () => {
    window.print();
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'transfer':
        return 'Virement bancaire';
      case 'check':
        return 'Chèque bancaire';
      case 'cash':
        return 'Espèces (Bordereau régie)';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Control Bar (Non-printed in print mode) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Quittance Officielle de Cotisation</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {payment.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={receiptRef} className="p-8 sm:p-10 space-y-6 bg-white text-slate-800">
          {/* Header of Syndicate */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base">
                  PB
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">
                    Syndicat des Copropriétaires
                  </h1>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">
                    Résidence Puerto Banus • Marina & Plage
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Boulevard Maritime des Dunes, BP 4022 • Tétouan / M'diq, Maroc<br />
                Registre des Copropriétés N° 4892/TET • Compte BMCE N° 011 780 0000 1234567890 44
              </p>
            </div>

            <div className="sm:text-right border-l-2 sm:border-l-0 pl-4 sm:pl-0 border-emerald-500">
              <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
                Quittance de Règlement
              </div>
              <div className="font-mono text-sm font-bold text-slate-900">
                N° {payment.receiptNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Date d'émission : {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            {/* Copropriétaire & Lot */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Copropriétaire & Désignation du Lot
              </span>
              <div className="text-sm font-bold text-slate-900">
                {payment.residentOrOwnerName}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-blue-700">
                  Porte {payment.doorNumber}
                </span>
                <span>Bloc {payment.doorNumber.charAt(0)}</span>
                {apartment?.floor !== undefined && (
                  <span className="text-slate-400">• Étage {apartment.floor === 0 ? 'RDC' : apartment.floor}</span>
                )}
              </div>
              {apartment?.tantiemes && (
                <div className="text-[11px] text-slate-500">
                  Quote-part : <strong className="font-mono text-slate-800">{apartment.tantiemes} / 10 000 tantièmes</strong> ({apartment.surfaceM2} m²)
                </div>
              )}
            </div>

            {/* Règlement & Transaction */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Modalités de Paiement
              </span>
              <div className="text-xs text-slate-700 space-y-1">
                <div>
                  Mode : <strong className="text-slate-900">{getMethodLabel(payment.paymentMethod)}</strong>
                </div>
                <div>
                  Référence : <span className="font-mono font-bold text-slate-900">{payment.reference}</span>
                </div>
                <div>
                  Date de valeur : <strong className="text-slate-900">{payment.paymentDate}</strong>
                </div>
                <div>
                  Enregistré par : <span className="text-slate-600">{payment.recordedBy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Nature de la charge / Appel</th>
                  <th className="px-4 py-2.5 text-center">Période</th>
                  <th className="px-4 py-2.5 text-right">Montant Réglé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">
                      Charges communes générales & entretien des 18 piscines
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Gardiennage, nettoyage des parties communes, contrat pisciniste, ascenseurs & espaces verts
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-800">
                    {contribution?.period || 'Exercice 2026'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-sm text-emerald-700">
                    {payment.amount.toLocaleString('fr-FR')} {currency}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-slate-600">
                    Total Encaissé (TTC) :
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-black text-emerald-700">
                    {payment.amount.toLocaleString('fr-FR')} {currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Solde restant dû */}
          {contribution && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600">
                Solde restant dû au titre de la période ({contribution.period}) :
              </span>
              <span className="font-mono font-bold">
                {contribution.balance <= 0 ? (
                  <span className="text-emerald-700 font-bold">0,00 {currency} (Compte soldé)</span>
                ) : (
                  <span className="text-rose-600">{contribution.balance.toLocaleString('fr-FR')} {currency}</span>
                )}
              </span>
            </div>
          )}

          {/* Legal Notice & Digital Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-[10px] text-slate-400 max-w-xs leading-relaxed text-center sm:text-left">
              Quittance délivrée sous réserve de bon encaissement définitif de la provision. Document officiel tenant lieu de libération de dette de charges syndicales pour la somme susmentionnée.
            </div>

            {/* Stamp Simulation */}
            <div className="flex items-center gap-3 border-2 border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-700 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  Syndic Puerto Banus
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Trésorerie Générale • Sofia Benjelloun
                </div>
                <div className="text-[9px] font-mono text-emerald-700 font-bold">
                  VALIDÉ NUMÉRIQUEMENT
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Screen only) */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Exporter en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
