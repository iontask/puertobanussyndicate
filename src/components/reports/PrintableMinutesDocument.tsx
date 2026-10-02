import React from 'react';
import { Meeting, GovernanceDecision, Tenant } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { Printer, Download, X, ScrollText, CheckCircle2, Users, FileText } from 'lucide-react';
import { downloadCSV } from '../../utils/exportHelpers';

interface PrintableMinutesDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  meeting?: Meeting;
  decisions: GovernanceDecision[];
}

export const PrintableMinutesDocument: React.FC<PrintableMinutesDocumentProps> = ({
  isOpen,
  onClose,
  tenant,
  meeting,
  decisions,
}) => {
  const { t, isRTL } = useI18n();

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = [
      'Code Résolution',
      'Intitulé',
      'Description',
      'Périmètre',
      'Date d’Adoption',
      'Responsable Désigné',
      'Échéance',
      'Budget Alloué (MAD)',
      'Statut d’Exécution',
    ];

    const rows = decisions.map((d) => [
      d.code,
      d.title,
      d.description,
      d.targetBlockCode ? `Bloc ${d.targetBlockCode}` : 'Toute la résidence',
      d.adoptionDate,
      d.assignedName,
      d.dueDate,
      d.budgetMAD ? d.budgetMAD : 0,
      d.status === 'completed' ? 'Réalisée' : d.status === 'in_progress' ? 'En cours' : 'À planifier',
    ]);

    downloadCSV(`Registre_Resolutions_AG_${tenant.code}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const defaultMeetingTitle = meeting?.title || "Procès-Verbal de l'Assemblée Générale Ordinaire 2026";
  const defaultMeetingDate = meeting?.date ? new Date(meeting.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '15 Janvier 2026';
  const defaultQuorum = meeting?.quorumPercentage || 84.2;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Action Bar (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              PV
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                {t('reports.ag_resolutions')}
              </h3>
              <p className="text-xs text-slate-400">
                {tenant.name} • {decisions.length} {t('terms.resolutions')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('common.print')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-900 bg-white" id="printable-minutes-document">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest uppercase bg-indigo-900 text-white">
                  Document Officiel Opposable
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Loi 18-00 • Registre des Délibérations
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {defaultMeetingTitle}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Copropriété {tenant.name} ({tenant.code}) • Tenue au Club-House de la Résidence
              </p>
            </div>

            <div className={`text-right sm:${isRTL ? 'text-left' : 'text-right'}`}>
              <div className="text-xs text-slate-500">
                Date de tenue : <span className="font-semibold text-slate-800">{defaultMeetingDate}</span>
              </div>
              <div className="text-xs text-slate-500">
                Quorum certifié : <span className="font-bold text-emerald-700">{defaultQuorum}% des tantièmes</span>
              </div>
            </div>
          </div>

          {/* Bureau de Séance */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Composition du Bureau de Séance & Scrutateurs</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block">Président de Séance :</span>
                <span>M. Mohamed Alami (Président du Syndic)</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">Secrétaire de Séance :</span>
                <span>Mme Laila Bennani (Trésorière)</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">Scrutateur Élu :</span>
                <span>M. Rachid Filali (Représentant Bloc C)</span>
              </div>
            </div>
          </div>

          {/* Decisions Table */}
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Extrait Certifié des Résolutions Adoptées</span>
          </h3>

          <div className="space-y-3 mb-6">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                      {dec.code}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{dec.title}</h5>
                  </div>
                  <div>
                    {dec.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Réalisée
                      </span>
                    )}
                    {dec.status === 'in_progress' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        En cours d’exécution
                      </span>
                    )}
                    {dec.status === 'to_do' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        À planifier
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-3">
                  {dec.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Périmètre :</span>
                    <span className="font-medium">{dec.targetBlockCode ? `Bloc ${dec.targetBlockCode}` : 'Toute la Résidence'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsable :</span>
                    <span className="font-medium">{dec.assignedName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Échéance :</span>
                    <span className="font-medium">{new Date(dec.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Budget alloué :</span>
                    <span className="font-bold text-slate-900">
                      {dec.budgetMAD ? `${dec.budgetMAD.toLocaleString('fr-FR')} MAD` : 'Frais de gestion'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                Le Secrétaire de Séance
              </div>
              <div className="font-serif italic text-slate-800 text-sm">
                Laila Bennani
              </div>
              <div className="text-[10px] text-slate-400">
                (Signature)
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                Le Scrutateur
              </div>
              <div className="font-serif italic text-slate-800 text-sm">
                Rachid Filali
              </div>
              <div className="text-[10px] text-slate-400">
                (Signature)
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                Le Président de Séance
              </div>
              <div className="font-serif italic text-slate-800 text-sm">
                Mohamed Alami
              </div>
              <div className="text-[10px] text-slate-400">
                (Sceau du Syndic)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
