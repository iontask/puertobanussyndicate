import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { MeetingRegistry } from './MeetingRegistry';
import { DecisionsTracker } from './DecisionsTracker';
import { CreateDecisionModal } from './CreateDecisionModal';
import { PrintableMinutesDocument } from '../reports/PrintableMinutesDocument';
import { Gavel, FileCheck2, CalendarDays, ShieldAlert, Printer } from 'lucide-react';

export const GovernanceView: React.FC = () => {
  const { currentUser, currentTenant, isResidentScoped } = useAuth();
  const { meetings, decisions } = useResidence();
  const [activeTab, setActiveTab] = useState<'decisions' | 'meetings'>('decisions');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintableMinutesOpen, setIsPrintableMinutesOpen] = useState(false);

  const canCreate = currentUser.role === 'president' || currentUser.role === 'treasurer';

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Lot 5 • Gouvernance & Légitimité
            </span>
            <span className="text-xs text-slate-400">Loi 18-00 sur la Copropriété</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Gouvernance Officielle & Registre des Décisions
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Tenue légale des assemblées générales, registre immuable des délibérations du bureau syndical et suivi de l'exécution des résolutions votées.
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-governance-print-pv"
            onClick={() => setIsPrintableMinutesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>PV & Résolutions PDF</span>
          </button>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              id="tab-btn-governance-decisions"
              onClick={() => setActiveTab('decisions')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'decisions'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Plan d'Actions & Décisions</span>
            </button>

            <button
              id="tab-btn-governance-meetings"
              onClick={() => setActiveTab('meetings')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'meetings'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-purple-600" />
              <span>Registre des Réunions & PV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'decisions' && (
        <DecisionsTracker
          onOpenCreateDecision={canCreate ? () => setIsCreateModalOpen(true) : undefined}
          isReadOnly={isResidentScoped}
        />
      )}

      {activeTab === 'meetings' && <MeetingRegistry />}

      {/* Create Decision Modal */}
      {canCreate && (
        <CreateDecisionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Printable Minutes & Resolutions Modal */}
      <PrintableMinutesDocument
        isOpen={isPrintableMinutesOpen}
        onClose={() => setIsPrintableMinutesOpen(false)}
        tenant={currentTenant}
        meeting={meetings[0]}
        decisions={decisions}
      />
    </div>
  );
};
