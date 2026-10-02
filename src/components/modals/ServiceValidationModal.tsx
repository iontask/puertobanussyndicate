import React, { useState } from 'react';
import { ServicePassageLog } from '../../types';
import { X, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface ServiceValidationModalProps {
  passage: ServicePassageLog | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    passageId: string,
    status: 'validated' | 'incident_reported',
    comment?: string,
    incidentTitle?: string
  ) => void;
  validatorName: string;
}

export const ServiceValidationModal: React.FC<ServiceValidationModalProps> = ({
  passage,
  isOpen,
  onClose,
  onConfirm,
  validatorName,
}) => {
  const [decision, setDecision] = useState<'validated' | 'incident_reported'>('validated');
  const [comment, setComment] = useState('');
  const [incidentTitle, setIncidentTitle] = useState('');

  if (!isOpen || !passage) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      passage.id,
      decision,
      comment.trim() || undefined,
      decision === 'incident_reported' ? incidentTitle.trim() || undefined : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Contrôle qualité & Émargement terrain
            </h3>
            <p className="text-xs text-slate-500">
              Validation du passage par {validatorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Summary of passage */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>{passage.title}</span>
              <span className="uppercase text-blue-600">{passage.trade}</span>
            </div>
            <p className="text-slate-500">
              Prestataire : <strong>{passage.providerName}</strong> ({passage.agentName})
            </p>
            <p className="text-slate-500">
              Date : {passage.date} à {passage.timeSlot}
            </p>
          </div>

          {/* Decision selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Avis du représentant / inspecteur *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('validated')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition ${
                  decision === 'validated'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs">Passage conforme</span>
                <span className="text-[11px] text-slate-500">Prestation validée sans réserve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('incident_reported')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition ${
                  decision === 'incident_reported'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-xs">Non-conforme / Incident</span>
                <span className="text-[11px] text-slate-500">Créera un ticket d'anomalie</span>
              </button>
            </div>
          </div>

          {/* If incident reported */}
          {decision === 'incident_reported' && (
            <div className="space-y-3 p-3 bg-rose-50/50 rounded-xl border border-rose-200 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Intitulé de la non-conformité constatée *
                </label>
                <input
                  type="text"
                  required
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Ex: Plage de piscine sale, sacs poubelles laissés, abords non désherbés..."
                  className="w-full px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-xs focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observations / Commentaire d'émargement
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                decision === 'validated'
                  ? 'Ex: Escaliers et dalles propres, transats bien rangés...'
                  : 'Détaillez les anomalies constatées pour que le prestataire intervienne de nouveau...'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition ${
                decision === 'validated'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{decision === 'validated' ? 'Signer & Valider' : 'Consigner l’incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
