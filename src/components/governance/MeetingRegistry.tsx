import React, { useState } from 'react';
import { useResidence } from '../../context/ResidenceContext';
import { Meeting, MeetingDocument } from '../../types';
import { DocumentViewerModal } from './DocumentViewerModal';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Download,
  ShieldCheck,
  Building,
  Gavel,
} from 'lucide-react';

export const MeetingRegistry: React.FC = () => {
  const { meetings } = useResidence();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting>(meetings[0] || null);
  const [activeDocForViewer, setActiveDocForViewer] = useState<MeetingDocument | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'ag' | 'bureau'>('all');

  const filteredMeetings = meetings.filter((m) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'ag') return m.type === 'ag_ordinary' || m.type === 'ag_extraordinary';
    if (typeFilter === 'bureau') return m.type === 'bureau';
    return true;
  });

  const getMeetingTypeBadge = (type: Meeting['type']) => {
    switch (type) {
      case 'ag_ordinary':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Assemblée Générale Ordinaire
          </span>
        );
      case 'ag_extraordinary':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            AG Extraordinaire
          </span>
        );
      case 'bureau':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Réunion du Bureau Syndical
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-header with Filter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Registre des Délibérations
            </span>
            <span className="text-xs text-slate-400">• PV & Procès-Verbaux</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Assemblées Générales & Réunions du Bureau
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique certifié des séances, vérification des quorums, émargements et feuilles de présence
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({meetings.length})
          </button>
          <button
            onClick={() => setTypeFilter('ag')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'ag'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assemblées (AG)
          </button>
          <button
            onClick={() => setTypeFilter('bureau')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              typeFilter === 'bureau'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bureau Syndical
          </button>
        </div>
      </div>

      {/* Grid: Left Column = List, Right Column = Detailed Meeting Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase text-slate-400 px-1 tracking-wider">
            Séances Enregistrées ({filteredMeetings.length})
          </div>

          {filteredMeetings.map((meeting) => {
            const isSelected = selectedMeeting?.id === meeting.id;
            return (
              <div
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  {getMeetingTypeBadge(meeting.type)}
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {meeting.date}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{meeting.title}</h3>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {meeting.participants.length} membres
                  </span>
                  {meeting.quorumPercentage && (
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] border border-purple-100">
                      Quorum {meeting.quorumPercentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Meeting Detail Card */}
        <div className="lg:col-span-8">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 text-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getMeetingTypeBadge(selectedMeeting.type)}
                    <span className="text-xs text-slate-400">
                      Réf. officielle : PV-{selectedMeeting.id.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PV validé & signé
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mt-3">{selectedMeeting.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {selectedMeeting.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    {selectedMeeting.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    {selectedMeeting.location}
                  </span>
                </div>
              </div>

              {/* Quorum Metric if present */}
              {selectedMeeting.quorumPercentage && (
                <div className="bg-purple-50/70 border-b border-purple-100 px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">
                        Quorum statutaire validé
                      </span>
                      <span className="text-[11px] text-purple-700">
                        Représentation légale de {selectedMeeting.quorumPercentage}% des tantièmes
                        (seuil légal 66.6% largement dépassé)
                      </span>
                    </div>
                  </div>
                  <div className="w-36 bg-purple-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${selectedMeeting.quorumPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Ordre du jour */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-slate-600" />
                    Ordre du Jour Adopté
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <ol className="list-decimal list-inside space-y-2 text-xs font-medium text-slate-800">
                      {selectedMeeting.agenda.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Participants (Président, VP, Trésorier, Représentants A-I) */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    Émargement des Participants ({selectedMeeting.participants.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedMeeting.participants.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {p.roleLabel}
                            {p.blockCode ? ` • Bloc ${p.blockCode}` : ''}
                          </span>
                        </div>

                        {p.present ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Présent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Excusé
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compte-rendu textuel officiel */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    Compte-Rendu Textuel Officiel
                  </h3>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                    {selectedMeeting.minutesText}
                  </div>
                </div>

                {/* Documents & PV associés */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    Documents & PV Associés
                  </h3>

                  <div className="space-y-2">
                    {selectedMeeting.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {doc.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {doc.fileName} • {doc.fileSize} • {doc.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-view-doc-${doc.id}`}
                            onClick={() => setActiveDocForViewer(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Consulter</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
              Sélectionnez une réunion dans la colonne de gauche pour afficher son compte-rendu.
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={activeDocForViewer}
        isOpen={!!activeDocForViewer}
        onClose={() => setActiveDocForViewer(null)}
      />
    </div>
  );
};
