import React, { useState } from 'react';
import { MeetingDocument } from '../../types';
import {
  X,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  HardDrive,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: MeetingDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen || !document) return null;

  const handleSimulateDownload = () => {
    setIsDownloaded(true);
    setTimeout(() => {
      setIsDownloaded(false);
    }, 3500);
  };

  const getDocBadgeColor = (type: MeetingDocument['type']) => {
    switch (type) {
      case 'pv':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rules':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'budget':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'convocation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDocTypeLabel = (type: MeetingDocument['type']) => {
    switch (type) {
      case 'pv':
        return 'Procès-Verbal Officiel';
      case 'rules':
        return 'Règlement Intérieur';
      case 'budget':
        return 'Budget & Finances';
      case 'convocation':
        return 'Modèle & Convocation';
      default:
        return 'Document Certifié';
    }
  };

  return (
    <div
      id="doc-viewer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="doc-viewer-modal-container"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white line-clamp-1">
                  {document.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDocBadgeColor(
                    document.type
                  )}`}
                >
                  {getDocTypeLabel(document.type)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {document.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  {document.fileSize}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-mono text-[11px]">{document.fileName}</span>
              </p>
            </div>
          </div>

          <button
            id="doc-viewer-btn-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Simulated Sheet Preview */}
        <div className="p-6 bg-slate-100 flex-1 overflow-y-auto max-h-[60vh]">
          {isDownloaded && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Téléchargement du fichier <strong>{document.fileName}</strong> initié avec succès.
              </span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-slate-800 font-serif leading-relaxed max-w-2xl mx-auto min-h-[480px] flex flex-col justify-between">
            <div>
              {/* Document Header */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800 mb-6">
                <div>
                  <div className="text-[11px] font-sans font-bold tracking-widest uppercase text-blue-900">
                    Copropriété Puerto Banus Marina
                  </div>
                  <div className="text-lg font-bold font-sans text-slate-900 mt-0.5">
                    Registre des Délibérations & Documents Officiels
                  </div>
                  <div className="text-xs font-sans text-slate-500">
                    Avenue de la Baie • Blocs A à I (9 Bâtiments & 18 Bassins)
                  </div>
                </div>

                <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex flex-col items-center justify-center text-center p-1 font-sans">
                  <ShieldCheck className="w-5 h-5 text-blue-800" />
                  <span className="text-[8px] font-bold uppercase tracking-tight text-slate-700">
                    Certifié
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <div className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Titre du Document
                </div>
                <h4 className="text-xl font-bold font-sans text-slate-900">{document.title}</h4>
                {document.description && (
                  <p className="text-xs text-slate-600 font-sans mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    {document.description}
                  </p>
                )}
              </div>

              {/* Legal Text Extract */}
              <div className="space-y-4 text-xs font-sans text-slate-700 leading-normal border-t border-slate-100 pt-4">
                <p>
                  <strong>EXTRAIT DU DOCUMENT :</strong> En vertu des dispositions de la loi n° 18-00
                  régissant le statut de la copropriété des immeubles bâtis au Royaume du Maroc, et
                  du règlement de copropriété enregistré de la résidence Puerto Banus Marina, le
                  présent acte constitue un document officiel opposable.
                </p>
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 text-amber-900 text-[11px]">
                  <strong>Mentions d’accessibilité :</strong> Le présent fichier est accessible à
                  l’ensemble des copropriétaires à jour de leurs obligations ou aux ayants droit
                  mandatés. Toute reproduction sans accord du syndic est strictement prohibée.
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-8 border-t border-slate-200 mt-8 flex items-center justify-between text-xs font-sans text-slate-500">
              <div>
                <span className="block font-bold text-slate-800">Le Bureau Syndical</span>
                <span>Karim Alami & Laila Bennani</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] text-slate-400">Date d'enregistrement</span>
                <span className="font-semibold text-slate-700">{document.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Document numérique intègre avec horodatage certifié</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              id="doc-viewer-btn-download"
              onClick={handleSimulateDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le PDF ({document.fileSize})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
