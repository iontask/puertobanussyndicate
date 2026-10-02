import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { Complaint, ComplaintPriority, ComplaintStatus, ComplaintScope, UserRole } from '../../types';
import { ComplaintDetailModal } from '../modals/ComplaintDetailModal';
import {
  AlertOctagon,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  Check,
  Search,
  Wrench,
  DollarSign,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ComplaintsViewProps {
  onOpenNewComplaint: () => void;
  complaintsList: Complaint[];
  onUpdateComplaintStatus: (
    id: string,
    newStatus: ComplaintStatus,
    notes?: string,
    extraData?: {
      assignedTo?: string;
      assignedTechnician?: string;
      scheduledDate?: string;
      estimatedCost?: number;
      actualCost?: number;
      interventionReport?: string;
      authorName?: string;
      authorRole?: UserRole;
    }
  ) => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  onOpenNewComplaint,
  complaintsList,
  onUpdateComplaintStatus,
}) => {
  const { currentUser, isBlockScoped, isResidentScoped, isPresidentScoped } = useAuth();
  const { blocks, pools, commonLighting } = useResidence();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // RBAC scope isolation
  const scopedComplaints = complaintsList.filter((c) => {
    if (isBlockScoped) {
      return c.blockId === 'block-h';
    }
    if (isResidentScoped) {
      // Resident sees tickets from their apartment OR common areas of block H
      return c.apartmentId === 'apt-h-12' || c.blockId === 'block-h';
    }
    return true; // Global admin (president / treasurer)
  });

  const filteredComplaints = scopedComplaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesScope = scopeFilter === 'all' || c.scope === scopeFilter;
    const matchesBlock = blockFilter === 'all' || c.blockId === blockFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedTo && c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPriority && matchesScope && matchesBlock && matchesSearch;
  });

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            🚨 URGENT
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            HAUTE
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800">
            MOYENNE
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
            BASSE
          </span>
        );
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Nouveau
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-3 h-3" /> Assigné
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" /> En cours
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Résolu
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Clôturé
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-blue-600" />
            <span>
              {isBlockScoped
                ? 'Gestion des Réclamations & Interventions - Bloc H'
                : isResidentScoped
                ? 'Mes Réclamations & Incidents Déclarés'
                : 'Moteur Opérationnel de Ticketing & Interventions'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBlockScoped
              ? 'Périmètre exclusif Bloc H : Suivi des réclamations privatives et des équipements communs'
              : isResidentScoped
              ? 'Vos réclamations pour l’appartement H-12 et les signalements parties communes du Bloc H'
              : 'Supervision globale des 9 blocs, dispatch prestataires, suivi budgétaire et traçabilité'}
          </p>
        </div>

        <button
          id="btn-open-complaint-modal-page"
          onClick={onOpenNewComplaint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouveau signalement</span>
        </button>
      </div>

      {/* KPI Counters row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tickets
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {scopedComplaints.length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Urgences & Nouveaux
          </span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">
            {scopedComplaints.filter((c) => c.priority === 'urgent' || c.status === 'new').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
            En intervention
          </span>
          <span className="text-xl font-bold text-indigo-700 mt-1 block">
            {scopedComplaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Résolus / Clôturés
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {scopedComplaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, ID, prestataire, description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">Tous les statuts ({scopedComplaints.length})</option>
            <option value="new">Nouveaux</option>
            <option value="pending">En attente devis</option>
            <option value="assigned">Assignés</option>
            <option value="in_progress">En intervention</option>
            <option value="resolved">Résolus</option>
            <option value="closed">Clôturés</option>
          </select>

          {/* Priority selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">🚨 Urgente</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          {/* Scope filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">Tous les périmètres</option>
            <option value="common">Parties Communes</option>
            <option value="private">Lots Privatifs</option>
          </select>

          {/* Block filter (only visible to global admins) */}
          {isPresidentScoped && (
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">Tous les blocs (A-I)</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  Bloc {b.code} ({b.name})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Complaints Cards List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl p-10 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Aucun signalement ne correspond à vos critères</h3>
            <p className="text-xs text-slate-500">Modifiez vos filtres ou effectuez un nouveau signalement.</p>
          </div>
        ) : (
          filteredComplaints.map((cmp) => {
            const block = blocks.find((b) => b.id === cmp.blockId);
            const isMyTicket = cmp.authorUserId === currentUser.id || cmp.apartmentId === 'apt-h-12';
            const linkedPool = pools.find((p) => p.id === cmp.equipmentId);
            const linkedLighting = commonLighting.find((l) => l.id === cmp.equipmentId);

            return (
              <div
                key={cmp.id}
                onClick={() => setSelectedComplaint(cmp)}
                className={`bg-white rounded-xl p-5 border transition-all cursor-pointer ${
                  cmp.priority === 'urgent'
                    ? 'border-rose-300 shadow-xs hover:border-rose-400'
                    : isMyTicket
                    ? 'border-blue-200 bg-blue-50/5 hover:border-blue-300'
                    : 'border-slate-200 hover:border-slate-300'
                } shadow-2xs hover:shadow-xs group`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{cmp.id}
                      </span>
                      {getPriorityBadge(cmp.priority)}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {cmp.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
                        {cmp.scope === 'private' ? 'Privatif' : 'Parties Communes'}
                      </span>
                      {isMyTicket && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                          Mon signalement
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2">
                      <span>{cmp.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                    </h3>

                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed line-clamp-2">
                      {cmp.description}
                    </p>

                    {/* Linked equipment tag */}
                    {(linkedPool || linkedLighting) && (
                      <div className="flex items-center gap-2 pt-1">
                        {linkedPool && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            🏊 Bassin lié : {linkedPool.name || (linkedPool.type === 'adult' ? 'Grand Bain' : 'Pataugeoire')}
                          </span>
                        )}
                        {linkedLighting && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            💡 Éclairage : {linkedLighting.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    {getStatusBadge(cmp.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(cmp.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Card footer details */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{block?.name || cmp.blockId}</strong>
                    </span>
                    {cmp.apartmentId && (
                      <span>
                        Lot : <strong className="text-slate-700 uppercase">{cmp.apartmentId.replace('apt-', '')}</strong>
                      </span>
                    )}
                    {cmp.assignedTo && (
                      <span className="text-slate-600">
                        Prestataire : <strong>{cmp.assignedTo}</strong>
                      </span>
                    )}
                    {cmp.estimatedCost !== undefined && (
                      <span className="text-blue-700 font-semibold">
                        Devis : {cmp.estimatedCost} MAD
                      </span>
                    )}
                    {cmp.activityLogs && (
                      <span className="text-slate-400">
                        {cmp.activityLogs.length} action(s) dans le journal
                      </span>
                    )}
                  </div>

                  {/* Fast action button */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedComplaint(cmp)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition"
                    >
                      Détails & Journal
                    </button>
                    {(currentUser.role === 'president' || currentUser.role === 'block_rep') && (
                      <>
                        {cmp.status !== 'resolved' && cmp.status !== 'closed' && (
                          <button
                            onClick={() => onUpdateComplaintStatus(cmp.id, 'resolved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                          >
                            <Check className="w-3 h-3" /> Résolu
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Detail & Lifecycle Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        onUpdateStatus={(id, newStatus, notes, extraData) => {
          onUpdateComplaintStatus(id, newStatus, notes, extraData);
          // Keep modal in sync with updated complaint
          const updated = complaintsList.find((c) => c.id === id);
          if (updated) {
            setSelectedComplaint({ ...updated, status: newStatus });
          }
        }}
      />
    </div>
  );
};
