import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { PaymentTransaction } from '../../types';
import { ReceiptModal } from '../finance/ReceiptModal';
import {
  Home,
  UserCheck,
  Shield,
  Key,
  Car,
  Warehouse,
  Coins,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  PlusCircle,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

interface ResidentApartmentViewProps {
  onOpenNewComplaint: () => void;
}

export const ResidentApartmentView: React.FC<ResidentApartmentViewProps> = ({ onOpenNewComplaint }) => {
  const { currentTenant, assignedApartment } = useAuth();
  const { getContributionsForApartment, getPaymentsForApartment } = useResidence();

  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const apt = assignedApartment || {
    id: 'apt-h-12',
    tenantId: 'tenant-pb-01',
    blockId: 'block-h',
    doorNumber: 'H-12',
    floor: 1,
    ownerName: 'M. & Mme Youssef Tazi',
    residentName: 'Youssef Tazi',
    residentType: 'owner' as const,
    surfaceM2: 118,
    contactPhone: '+212 6 61 45 89 20',
  };

  const myContributions = getContributionsForApartment(apt.id);
  const myPayments = getPaymentsForApartment(apt.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Fiche Privée du Logement • {apt.doorNumber}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informations de copropriété, dépendances, charges et contact enregistrés
          </p>
        </div>

        <button
          onClick={onOpenNewComplaint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Signaler un problème sur ce lot</span>
        </button>
      </div>

      {/* Main Apartment Details Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center">
              {apt.doorNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Bloc H (Horizon) • Porte {apt.doorNumber}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Propriétaire Résident
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentTenant.name} • 1er Étage • Quote-part : <strong>18 / 10 000èmes</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Superficie privative</span>
            <span className="text-2xl font-bold text-slate-900">{apt.surfaceM2} m²</span>
          </div>
        </div>

        {/* Technical annexes & dependencies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Stationnement Privatif</span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Place P-42</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sous-sol niveau -1 (Accès badge)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
              <Warehouse className="w-4 h-4 text-indigo-600" />
              <span>Cave / Box Annexe</span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Cave C-14</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Surface : 8 m² (Sous-sol -1)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Badges d'Accès RFID</span>
            </div>
            <div className="mt-2 text-sm font-bold text-emerald-700">3 Badges Actifs</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Portails, halls & 18 piscines</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Assurance Habitation</span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Conforme</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Attestation 2026 validée</p>
          </div>
        </div>

        {/* Contact info registered with the syndic */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 text-slate-600">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-400" />
              Titulaires : <strong className="text-slate-900">{apt.ownerName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              {apt.contactPhone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              youssef.tazi@gmail.com
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Dernière mise à jour du dossier : 15 Janvier 2026
          </span>
        </div>
      </div>

      {/* Contributions for H-12 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>Relevé des Charges & Cotisations (H-12)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Période</th>
                <th className="px-4 py-2.5 text-right">Montant Appelé</th>
                <th className="px-4 py-2.5 text-right">Montant Réglé</th>
                <th className="px-4 py-2.5 text-right">Solde Dû</th>
                <th className="px-4 py-2.5">Date limite</th>
                <th className="px-4 py-2.5 text-center">Statut</th>
                <th className="px-4 py-2.5 text-right">Quittance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myContributions.map((c) => {
                const matchedPayment = myPayments.find((p) => p.contributionId === c.id);

                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.period}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{c.amountDue} {currentTenant.currency}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700">{c.amountPaid} {currentTenant.currency}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {c.balance > 0 ? (
                        <span className="text-rose-600">{c.balance} {currentTenant.currency}</span>
                      ) : (
                        <span className="text-emerald-700">0 {currentTenant.currency}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.dueDate || '15/10/2026'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : c.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {c.status === 'paid' ? 'Payée' : c.status === 'partial' ? 'Partielle' : c.status === 'overdue' ? 'En retard' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {matchedPayment ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceipt(matchedPayment);
                            setIsReceiptOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Reçu {matchedPayment.receiptNumber}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedReceipt}
        apartment={apt}
      />
    </div>
  );
};
