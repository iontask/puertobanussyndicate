import React, { useState } from 'react';
import { X, Send, Calendar, DollarSign, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useResidence } from '../../context/ResidenceContext';
import { useAuth } from '../../context/AuthContext';

interface IssueCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const IssueCallModal: React.FC<IssueCallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentTenant, currentUser } = useAuth();
  const { blocks, issueCallForFunds } = useResidence();

  const [period, setPeriod] = useState<string>('T1 2027');
  const [dueDate, setDueDate] = useState<string>('2027-01-15');
  const [calculationMode, setCalculationMode] = useState<'fixed' | 'surface' | 'tantiemes'>('surface');
  const [amountValue, setAmountValue] = useState<number>(20); // 20 MAD/m² par défaut
  const [targetBlockId, setTargetBlockId] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!period.trim()) {
      setError('Veuillez renseigner le libellé de la période (ex: T1 2027).');
      return;
    }

    if (amountValue <= 0) {
      setError('Le montant doit être supérieur à zéro.');
      return;
    }

    try {
      issueCallForFunds({
        period: period.trim(),
        dueDate,
        amountPerM2OrFixed: amountValue,
        calculationMode,
        targetBlockId: targetBlockId === 'all' ? undefined : targetBlockId,
        notes: notes.trim() || undefined,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’émission de l’appel.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Émettre un Appel de Cotisations</h2>
              <p className="text-[11px] text-blue-100">
                Génération des débits de charges pour les copropriétaires
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition"
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

          {/* 1. Période & Échéance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Période d'appel *
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="ex: T1 2027 ou Travaux Bassin"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date limite de paiement *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Périmètre d'application (Tous ou 1 bloc) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Périmètre ciblé *
            </label>
            <select
              value={targetBlockId}
              onChange={(e) => setTargetBlockId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
            >
              <option value="all">Tous les 9 Blocs (A à I) — 508 Lots</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  Bloc {b.code} ({b.name}) — {b.apartmentCount} lots
                </option>
              ))}
            </select>
          </div>

          {/* 3. Mode de calcul */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Formule de Répartition *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCalculationMode('surface');
                  setAmountValue(20);
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition text-center ${
                  calculationMode === 'surface'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Par m² (ex: 20 MAD/m²)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalculationMode('fixed');
                  setAmountValue(2400);
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition text-center ${
                  calculationMode === 'fixed'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Forfait fixe par lot
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalculationMode('tantiemes');
                  setAmountValue(12);
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition text-center ${
                  calculationMode === 'tantiemes'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Par tantième
              </button>
            </div>
          </div>

          {/* 4. Valeur du barème */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {calculationMode === 'surface'
                ? `Tarif par m² (${currentTenant.currency}/m²)`
                : calculationMode === 'tantiemes'
                ? `Tarif par tantième (${currentTenant.currency}/tantième)`
                : `Montant fixe par lot (${currentTenant.currency})`} *
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="1"
                min="1"
                value={amountValue}
                onChange={(e) => setAmountValue(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Exemple pour un appartement de 100 m² :{' '}
              <strong className="text-slate-800 font-mono">
                {calculationMode === 'surface'
                  ? `${100 * amountValue} ${currentTenant.currency}`
                  : calculationMode === 'fixed'
                  ? `${amountValue} ${currentTenant.currency}`
                  : `${Math.round(180 * amountValue)} ${currentTenant.currency}`}
              </strong>
            </p>
          </div>

          {/* 5. Notes / Motivation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Consigne ou objet de l'appel (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Vote de l'AG ordinaire du 10/12/2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-800"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Générer l'Appel de Fonds & Enregistrer à l'Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
