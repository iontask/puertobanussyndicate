import React, { useState } from 'react';
import { Announcement, AnnouncementPriority } from '../../types';
import {
  Megaphone,
  AlertTriangle,
  Wrench,
  Info,
  Calendar,
  Building2,
  Paperclip,
  Check,
  CheckCircle2,
  Clock,
  UserCheck,
  Download,
} from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isRead,
  onMarkAsRead,
}) => {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Urgent</span>
          </span>
        );
      case 'works':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" />
            <span>Travaux</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            <span>Information</span>
          </span>
        );
    }
  };

  const handleSimulateDownload = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  const formattedDate = new Date(announcement.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-5 ${
        !isRead
          ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-100'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getPriorityBadge(announcement.priority)}

          {announcement.scope === 'residence' ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              🌐 Toute la Résidence
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              🏢 Bloc {announcement.targetBlockCode || 'Cible'}
            </span>
          )}

          {!isRead && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
              Nouveau
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>

          {!isRead && (
            <button
              onClick={() => onMarkAsRead(announcement.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              title="Marquer comme lu"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-base text-slate-900 leading-snug">{announcement.title}</h3>

      {/* Content */}
      <p className="mt-2 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
        {announcement.content}
      </p>

      {/* Attachment download */}
      {announcement.attachmentName && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-800">{announcement.attachmentName}</span>
          </div>

          <button
            onClick={handleSimulateDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger</span>
          </button>
        </div>
      )}

      {downloadNotice && (
        <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fichier {announcement.attachmentName} téléchargé.</span>
        </div>
      )}

      {/* Author Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Publié par <strong>{announcement.authorName}</strong> ({announcement.authorRole === 'president' ? 'Président du Syndic' : announcement.authorRole === 'treasurer' ? 'Trésorière' : 'Représentant de Bloc'})
          </span>
        </div>

        {announcement.expiresAt && (
          <span className="text-slate-400">
            Valable jusqu'au {announcement.expiresAt}
          </span>
        )}
      </div>
    </div>
  );
};
