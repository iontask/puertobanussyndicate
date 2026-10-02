import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { BlockCode, UserRole } from '../../types';
import {
  X,
  PlusCircle,
  Gavel,
  Calendar,
  Building2,
  DollarSign,
  User,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface CreateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { meetings, blocks, addDecision } = useResidence();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingId, setMeetingId] = useState(meetings[0]?.id || '');
  const [assignedRole, setAssignedRole] = useState<'block_rep' | 'treasurer' | 'president' | 'provider'>('block_rep');
  const [assignedBlockCode, setAssignedBlockCode] = useState<BlockCode>('H');
  const [assignedCustomName, setAssignedCustomName] = useState('');
  const [targetScope, setTargetScope] = useState<'all' | 'block'>('all');
  const [targetBlockCode, setTargetBlockCode] = useState<BlockCode>('H');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [adoptionDate, setAdoptionDate] = useState('2026-09-16');
  const [budgetMAD, setBudgetMAD] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez renseigner l’intitulé de la décision / résolution.');
      return;
    }
    if (!description.trim()) {
      setError('Veuillez préciser le descriptif opérationnel et les attendus.');
      return;
    }

    let assignedNameFormatted = '';
    if (assignedRole === 'block_rep') {
      assignedNameFormatted = `Représentant Bloc ${assignedBlockCode}${
        assignedCustomName ? ` (${assignedCustomName})` : ''
      }`;
    } else if (assignedRole === 'treasurer') {
      assignedNameFormatted = 'Trésorière Générale (Laila Bennani)';
    } else if (assignedRole === 'president') {
      assignedNameFormatted = 'Président du Conseil (Karim Alami)';
    } else {
      assignedNameFormatted = assignedCustomName || 'Prestataire Agréé';
    }

    const selectedMeeting = meetings.find((m) => m.id === meetingId);

    addDecision(
      {
        tenantId: 'tenant-pb-01',
        title: title.trim(),
        description: description.trim(),
        adoptionDate,
        meetingId: meetingId || undefined,
        meetingTitle: selectedMeeting?.title || 'Décision du Bureau Syndical',
        targetBlockId: targetScope === 'block' ? `block-${targetBlockCode.toLowerCase()}` : 'all',
        targetBlockCode: targetScope === 'block' ? targetBlockCode : 'ALL',
        assignedName: assignedNameFormatted,
        assignedRole,
        assignedBlockCode: assignedRole === 'block_rep' ? assignedBlockCode : undefined,
        dueDate,
        status: 'to_do',
        budgetMAD: budgetMAD ? Number(budgetMAD) : undefined,
        isPublic,
      },
      currentUser.name,
      currentUser.role
    );

    onClose();
  };

  return (
    <div
      id="create-decision-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="create-decision-modal-container"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Adopter une Nouvelle Résolution / Décision
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Alimente automatiquement le Registre Officiel et le Journal d'Audit
              </p>
            </div>
          </div>

          <button
            id="create-decision-btn-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Réunion / Cadre d'adoption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cadre d'Adoption / Assemblée Associée
            </label>
            <select
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.date})
                </option>
              ))}
              <option value="">Décision directe du Bureau (hors AG)</option>
            </select>
          </div>

          {/* Intitulé */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intitulé de la Décision / Résolution <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Remplacement des projecteurs LED immergés - Bassins Adultes"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descriptif Opérationnel & Cahier des Charges <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Préciser les modalités techniques, les engagements attendus et le livrable..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grid: Responsable & Portée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de Responsable Désigné
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="block_rep">Représentant de Bloc (A-I)</option>
                <option value="treasurer">Trésorerie Générale</option>
                <option value="president">Président du Conseil</option>
                <option value="provider">Prestataire Technique Externe</option>
              </select>
            </div>

            {assignedRole === 'block_rep' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bloc Assigné
                </label>
                <select
                  value={assignedBlockCode}
                  onChange={(e) => setAssignedBlockCode(e.target.value as BlockCode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.code}>
                      Bloc {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {assignedRole === 'provider' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du Prestataire Mandaté
                </label>
                <input
                  type="text"
                  value={assignedCustomName}
                  onChange={(e) => setAssignedCustomName(e.target.value)}
                  placeholder="Ex: LuminaTech, Atlas Clean..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Portée des effets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portée de la Décision
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toute la Résidence (9 Blocs & 18 Bassins)</option>
                <option value="block">Spécifique à un Bloc Unique</option>
              </select>
            </div>

            {targetScope === 'block' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bloc Cible
                </label>
                <select
                  value={targetBlockCode}
                  onChange={(e) => setTargetBlockCode(e.target.value as BlockCode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.code}>
                      Bloc {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'Adoption
              </label>
              <input
                type="date"
                value={adoptionDate}
                onChange={(e) => setAdoptionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'Échéance (Limite)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budget Alloué (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="Ex: 14500"
                value={budgetMAD}
                onChange={(e) => setBudgetMAD(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Visibilité aux résidents */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Publication dans l'Espace Décisions des Résidents
              </span>
              <span className="text-[11px] text-slate-500">
                Visible en lecture seule par tous les copropriétaires de la résidence
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition"
            >
              Annuler
            </button>

            <button
              id="create-decision-btn-submit"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Adopter et Inscrire au Registre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
