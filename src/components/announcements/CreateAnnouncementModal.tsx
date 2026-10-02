import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import {
  AnnouncementPriority,
  AnnouncementScope,
  BlockCode,
} from '../../types';
import {
  X,
  Megaphone,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  Paperclip,
  CheckCircle2,
  Info,
  Wrench,
} from 'lucide-react';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, isBlockScoped } = useAuth();
  const { blocks, addAnnouncement } = useResidence();

  const userBlockCode: BlockCode = currentUser.assignedBlockCode || 'H';

  // If rep: scope is locked to 'block' and target block locked to userBlockCode
  const initialScope: AnnouncementScope = isBlockScoped ? 'block' : 'residence';
  const [scope, setScope] = useState<AnnouncementScope>(initialScope);
  const [targetBlockCode, setTargetBlockCode] = useState<BlockCode>(userBlockCode);
  const [priority, setPriority] = useState<AnnouncementPriority>('info');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez saisir le titre de la communication.');
      return;
    }
    if (!content.trim()) {
      setError('Veuillez renseigner le message de l’annonce.');
      return;
    }

    const targetCode = scope === 'block' ? targetBlockCode : undefined;
    const targetId = scope === 'block' ? `block-${targetBlockCode.toLowerCase()}` : undefined;

    addAnnouncement(
      {
        tenantId: 'tenant-pb-01',
        title: title.trim(),
        content: content.trim(),
        scope,
        targetBlockId: targetId,
        targetBlockCode: targetCode,
        priority,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        expiresAt: expiresAt || undefined,
        attachmentUrl: attachmentName ? `/docs/${attachmentName}` : undefined,
        attachmentName: attachmentName || undefined,
      },
      currentUser.name,
      currentUser.role
    );

    onClose();
  };

  return (
    <div
      id="create-announcement-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="create-announcement-modal-container"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Publier une Communication Officielle
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Diffusion ciblée et notification automatique aux résidents
              </p>
            </div>
          </div>

          <button
            id="btn-close-announcement-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Portée de Diffusion
            </label>
            {isBlockScoped ? (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  Communication circonscrite à votre bloc : <strong>Bloc {userBlockCode}</strong>
                </span>
                <span className="font-semibold text-[11px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  Verrouillé Rep.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScope('residence')}
                  className={`p-3 rounded-xl border text-left transition ${
                    scope === 'residence'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs">🌐 Toute la Résidence</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    Tous les 9 blocs (A à I)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('block')}
                  className={`p-3 rounded-xl border text-left transition ${
                    scope === 'block'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs">🏢 Bloc Spécifique</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    Étanche aux autres blocs
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Block Picker if scope is block */}
          {scope === 'block' && !isBlockScoped && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sélectionner le Bloc Destinataire
              </label>
              <select
                value={targetBlockCode}
                onChange={(e) => setTargetBlockCode(e.target.value as BlockCode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.code}>
                    Bloc {b.code} ({b.name}) - {b.totalApartments} logements
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Niveau de Priorité / Typologie
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('info')}
                className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  priority === 'info'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Information</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('works')}
                className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  priority === 'works'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Travaux</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-2.5 rounded-xl border text-center transition text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  priority === 'urgent'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-2xs animate-pulse'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Urgent</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre de l'Annonce <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Coupure d'eau programmée pour maintenance des vannes"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message Détaillé <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez le texte de l'annonce avec toutes les précisions opérationnelles, dates et recommandations..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachment & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pièce Jointe Officielle (Optionnelle)
              </label>
              <div className="relative">
                <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: planning_travaux_sept2026.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'Expiration (Optionnelle)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition"
            >
              Annuler
            </button>

            <button
              id="btn-submit-create-announcement"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publier l'Annonce</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
