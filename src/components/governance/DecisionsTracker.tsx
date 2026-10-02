import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { GovernanceDecision, DecisionStatus, BlockCode } from '../../types';
import {
  Gavel,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  Coins,
  ChevronRight,
  Sparkles,
  Check,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';

interface DecisionsTrackerProps {
  onOpenCreateDecision?: () => void;
  isReadOnly?: boolean;
}

export const DecisionsTracker: React.FC<DecisionsTrackerProps> = ({
  onOpenCreateDecision,
  isReadOnly = false,
}) => {
  const { currentUser, isBlockScoped, isResidentScoped } = useAuth();
  const { decisions, completeDecision, updateDecisionStatus } = useResidence();

  const [statusFilter, setStatusFilter] = useState<'all' | DecisionStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'my_assigned' | 'block_rep' | 'treasurer' | 'president'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecisionForComplete, setSelectedDecisionForComplete] = useState<GovernanceDecision | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Rep Bloc H context
  const myBlockCode: BlockCode = currentUser.assignedBlockCode || 'H';

  // KPIs
  const stats = useMemo(() => {
    const total = decisions.length;
    const todo = decisions.filter((d) => d.status === 'to_do').length;
    const inProgress = decisions.filter((d) => d.status === 'in_progress').length;
    const done = decisions.filter((d) => d.status === 'done').length;
    const overdue = decisions.filter((d) => d.status === 'overdue').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, inProgress, done, overdue, rate };
  }, [decisions]);

  // Filtered decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      // If resident: only public decisions
      if (isResidentScoped && !d.isPublic) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && d.status !== statusFilter) {
        return false;
      }

      // Role filter
      if (roleFilter === 'my_assigned') {
        const isMyBlock = d.assignedBlockCode === myBlockCode || d.targetBlockCode === myBlockCode;
        if (!isMyBlock && !d.assignedName.toLowerCase().includes(currentUser.name.toLowerCase())) {
          return false;
        }
      } else if (roleFilter === 'block_rep' && d.assignedRole !== 'block_rep') {
        return false;
      } else if (roleFilter === 'treasurer' && d.assignedRole !== 'treasurer') {
        return false;
      } else if (roleFilter === 'president' && d.assignedRole !== 'president') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = d.code.toLowerCase().includes(q);
        const matchesTitle = d.title.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesAssignee = d.assignedName.toLowerCase().includes(q);
        return matchesCode || matchesTitle || matchesDesc || matchesAssignee;
      }

      return true;
    });
  }, [decisions, statusFilter, roleFilter, searchQuery, isResidentScoped, myBlockCode, currentUser.name]);

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecisionForComplete) return;

    completeDecision(
      selectedDecisionForComplete.id,
      completionNotes.trim() || 'Action réalisée et certifiée conforme.',
      currentUser.name,
      currentUser.role
    );

    setSelectedDecisionForComplete(null);
    setCompletionNotes('');
  };

  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Réalisée</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>En cours</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>En retard</span>
          </span>
        );
      case 'to_do':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>À faire</span>
          </span>
        );
    }
  };

  const canManageDecisions = currentUser.role === 'president' || currentUser.role === 'treasurer';
  const canCompleteDecision = (decision: GovernanceDecision) => {
    if (decision.status === 'done') return false;
    if (canManageDecisions) return true;
    if (isBlockScoped && (decision.assignedBlockCode === myBlockCode || decision.targetBlockCode === myBlockCode)) {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Registre Légal d'Exécution
            </span>
            <span className="text-xs text-slate-400">• Exercice 2026</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Suivi des Décisions & Actions Adoptées
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isResidentScoped
              ? 'Consultation en lecture seule des résolutions votées lors des assemblées générales'
              : 'Pilotage des résolutions votées, affectation des représentants et traçabilité immuable'}
          </p>
        </div>

        {canManageDecisions && onOpenCreateDecision && (
          <button
            id="decisions-btn-open-create"
            onClick={onOpenCreateDecision}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition transform active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Adopter une Décision</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">
            Total Décisions
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.total}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Adoptées au registre</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">À Faire</span>
          <span className="text-2xl font-bold text-slate-700 mt-1 block">{stats.todo}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">En attente de démarrage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-blue-600 block">En Cours</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">{stats.inProgress}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Actions engagées</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
            Réalisées
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{stats.done}</span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">
            Taux d'exécution : {stats.rate}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-rose-600 block">En Retard</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{stats.overdue}</span>
          <span className="text-[11px] text-rose-500 mt-0.5 block">Échéances dépassées</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par code, mot-clé, responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({decisions.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En cours ({stats.inProgress})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              statusFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Réalisées ({stats.done})
          </button>
          <button
            onClick={() => setStatusFilter('to_do')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              statusFilter === 'to_do'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            À faire ({stats.todo})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En retard ({stats.overdue})
          </button>
        </div>

        {/* Rep Bloc shortcut toggle */}
        {isBlockScoped && (
          <button
            id="decisions-btn-filter-my-bloc"
            onClick={() => setRoleFilter(roleFilter === 'my_assigned' ? 'all' : 'my_assigned')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              roleFilter === 'my_assigned'
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Mes actions Bloc {myBlockCode}</span>
          </button>
        )}
      </div>

      {/* Decisions List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredDecisions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Aucune décision ne correspond à vos critères de recherche ou de filtre.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDecisions.map((decision) => {
              const isMine =
                isBlockScoped &&
                (decision.assignedBlockCode === myBlockCode ||
                  decision.targetBlockCode === myBlockCode);

              return (
                <div
                  key={decision.id}
                  className={`p-5 transition hover:bg-slate-50/60 ${
                    isMine ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Code, Title, Desc */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white tracking-wide">
                          {decision.code}
                        </span>

                        {getStatusBadge(decision.status)}

                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {decision.targetBlockCode === 'ALL'
                            ? '🌐 Toute la Résidence'
                            : `🏢 Bloc ${decision.targetBlockCode}`}
                        </span>

                        {decision.meetingTitle && (
                          <span className="text-slate-400 text-xs truncate max-w-xs">
                            • {decision.meetingTitle}
                          </span>
                        )}

                        {isMine && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                            Assigné à mon bloc
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {decision.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {decision.description}
                      </p>

                      {/* Completed note if any */}
                      {decision.status === 'done' && decision.completionNotes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 text-xs flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">
                              Réalisé par {decision.completedBy}
                              {decision.completedAt ? ` le ${decision.completedAt.split('T')[0]}` : ''} :
                            </span>
                            <span className="text-emerald-800">{decision.completionNotes}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Meta & Actions */}
                    <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right text-xs space-y-1">
                        <div className="flex items-center justify-end gap-1.5 text-slate-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{decision.assignedName}</span>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Échéance : <strong>{decision.dueDate}</strong>
                          </span>
                        </div>

                        {decision.budgetMAD && (
                          <div className="flex items-center justify-end gap-1 text-slate-600 font-semibold">
                            <Coins className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{decision.budgetMAD.toLocaleString('fr-FR')} MAD</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Marquer comme réalisée */}
                      {canCompleteDecision(decision) && (
                        <button
                          id={`btn-complete-decision-${decision.id}`}
                          onClick={() => {
                            setSelectedDecisionForComplete(decision);
                            setCompletionNotes('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Valider réalisation</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Confirmation de Réalisation avec note */}
      {selectedDecisionForComplete && (
        <div
          id="complete-decision-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  Valider la Réalisation • {selectedDecisionForComplete.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDecisionForComplete(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block">
                  {selectedDecisionForComplete.title}
                </span>
                <span className="text-slate-500 mt-1 block">
                  Responsable : {selectedDecisionForComplete.assignedName}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compte-rendu de fin d'action / Remarques d'exécution
                </label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Ex: Travaux réceptionnés sans réserve le 16/09/2026. Attestation de conformité transmise au bureau..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Cette validation sera inscrite de façon permanente dans le <strong>Journal d'Audit du Syndic</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDecisionForComplete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition"
                >
                  Annuler
                </button>
                <button
                  id="btn-confirm-complete-decision"
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmer la réalisation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
