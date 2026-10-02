import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, CreditCard, FileText, AlertCircle, Building2 } from 'lucide-react';
import { Contribution, Apartment, PaymentMethod, PaymentTransaction } from '../../types';
import { useResidence } from '../../context/ResidenceContext';
import { useAuth } from '../../context/AuthContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedContributionId?: string;
  onPaymentSuccess?: (payment: PaymentTransaction) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedContributionId,
  onPaymentSuccess,
}) => {
  const { currentTenant, currentUser } = useAuth();
  const { allApartments, contributions, recordPayment } = useResidence();

  const [selectedContributionId, setSelectedContributionId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Unpaid or partially paid contributions
  const eligibleContributions = contributions.filter((c) => c.balance > 0);

  useEffect(() => {
    if (preselectedContributionId) {
      setSelectedContributionId(preselectedContributionId);
      const target = contributions.find((c) => c.id === preselectedContributionId);
      if (target) {
        setAmount(target.balance);
      }
    } else if (eligibleContributions.length > 0 && !selectedContributionId) {
      setSelectedContributionId(eligibleContributions[0].id);
      setAmount(eligibleContributions[0].balance);
    }
  }, [isOpen, preselectedContributionId, contributions]);

  const selectedContribution = contributions.find((c) => c.id === selectedContributionId);
  const selectedApartment = selectedContribution
    ? allApartments.find((a) => a.id === selectedContribution.apartmentId)
    : undefined;

  const handleContributionChange = (id: string) => {
    setSelectedContributionId(id);
    const c = contributions.find((item) => item.id === id);
    if (c) {
      setAmount(c.balance);
    }
  };

  const handleQuickReferenceSuggest = (method: PaymentMethod) => {
    setPaymentMethod(method);
    const rand = Math.floor(100000 + Math.random() * 900000);
    if (method === 'transfer') {
      setReference(`VIR-BMCE-${rand}`);
    } else if (method === 'check') {
      setReference(`CHQ-SG-${rand}`);
    } else {
      setReference(`ESP-BORD-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedContribution) {
      setError('Veuillez sélectionner un appel de cotisation.');
      return;
    }

    if (amount <= 0) {
      setError('Le montant du paiement doit être supérieur à zéro.');
      return;
    }

    if (!reference.trim()) {
      setError('Veuillez renseigner une référence bancaire ou un numéro de bordereau.');
      return;
    }

    try {
      const createdPayment = recordPayment({
        apartmentId: selectedContribution.apartmentId,
        contributionId: selectedContribution.id,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        reference: reference.trim(),
        notes: notes.trim() || undefined,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(createdPayment);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’enregistrement.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Enregistrer un Encaissement</h2>
              <p className="text-[11px] text-emerald-100">
                Génération de quittance officielle et mise à jour du grand livre
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Sélection de la cotisation / lot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Sélectionner le lot & l'appel de fonds débiteur *
            </label>
            <select
              value={selectedContributionId}
              onChange={(e) => handleContributionChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
              required
            >
              <option value="" disabled>-- Choisir une cotisation en attente --</option>
              {eligibleContributions.map((c) => {
                const apt = allApartments.find((a) => a.id === c.apartmentId);
                return (
                  <option key={c.id} value={c.id}>
                    Porte {apt?.doorNumber || c.apartmentId} ({apt?.ownerName || 'Copropriétaire'}) • {c.period} — Solde: {c.balance} {currentTenant.currency}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Lot Quick Info Banner */}
          {selectedContribution && selectedApartment && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">
                  {selectedApartment.ownerName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Lot {selectedApartment.doorNumber} • Bloc {selectedApartment.doorNumber.charAt(0)} • {selectedApartment.surfaceM2} m² ({selectedApartment.tantiemes} tantièmes)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Total Dû sur l'appel</div>
                <div className="font-mono font-bold text-rose-600">
                  {selectedContribution.balance} {currentTenant.currency}
                </div>
              </div>
            </div>
          )}

          {/* 2. Montant & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Montant Réglé ({currentTenant.currency}) *
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                  required
                />
              </div>
              {selectedContribution && amount < selectedContribution.balance && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Paiement partiel : reste {selectedContribution.balance - amount} {currentTenant.currency}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date de Valeur / Versement *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Mode de règlement & Suggestion */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mode de Règlement *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickReferenceSuggest('transfer')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center ${
                  paymentMethod === 'transfer'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Virement
              </button>
              <button
                type="button"
                onClick={() => handleQuickReferenceSuggest('check')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center ${
                  paymentMethod === 'check'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chèque
              </button>
              <button
                type="button"
                onClick={() => handleQuickReferenceSuggest('cash')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Espèces
              </button>
            </div>
          </div>

          {/* 4. Référence bancaire */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Référence Bancaire ou Bordereau de Remise *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="ex: VIR-BMCE-940217 ou CHQ-004218"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              required
            />
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observations ou mentions particulières (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Virement reçu sur compte BMCE Puerto Banus"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l'Encaissement & Émettre Quittance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
