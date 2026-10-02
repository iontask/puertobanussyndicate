import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Shield,
  Lock,
  ArrowRight,
  Clock,
  User,
  DollarSign,
  AlertOctagon,
  Wrench,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { AuditLogItem, AuditActionType, UserRole } from '../../types';
import { useResidence } from '../../context/ResidenceContext';
import { useAuth } from '../../context/AuthContext';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useResidence();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedActorFilter, setSelectedActorFilter] = useState<string>('all');

  // Unique list of actors
  const actors = useMemo(() => {
    const list = Array.from(new Set(auditLogs.map((log) => `${log.actorName} (${log.actorRole})`)));
    return list;
  }, [auditLogs]);

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Action Type filter
      if (selectedActionType !== 'all' && log.actionType !== selectedActionType) {
        return false;
      }

      // 2. Actor filter
      if (selectedActorFilter !== 'all') {
        const actorTag = `${log.actorName} (${log.actorRole})`;
        if (actorTag !== selectedActorFilter) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = log.actionLabel.toLowerCase().includes(q);
        const matchTarget = log.targetEntity.toLowerCase().includes(q);
        const matchActor = log.actorName.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchOld = log.oldValue?.toLowerCase().includes(q);
        const matchNew = log.newValue?.toLowerCase().includes(q);

        if (!matchTitle && !matchTarget && !matchActor && !matchDetails && !matchOld && !matchNew) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedActionType, selectedActorFilter, searchQuery]);

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'payment_recorded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-3 h-3" />
            <span>Encaissement</span>
          </span>
        );
      case 'call_funds_issued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Layers className="w-3 h-3" />
            <span>Appel de Fonds</span>
          </span>
        );
      case 'manual_amount_adjusted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertOctagon className="w-3 h-3" />
            <span>Ajustement</span>
          </span>
        );
      case 'complaint_status_changed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertOctagon className="w-3 h-3" />
            <span>Réclamation</span>
          </span>
        );
      case 'service_validated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Wrench className="w-3 h-3" />
            <span>Émargement Prestation</span>
          </span>
        );
      case 'role_changed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <User className="w-3 h-3" />
            <span>Sécurité / Rôle</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileCheck2 className="w-3 h-3" />
            <span>{type}</span>
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'president':
        return <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-semibold">Président</span>;
      case 'treasurer':
        return <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">Trésorier</span>;
      case 'block_rep':
        return <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 font-semibold">Représentant</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Immutability Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/15">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2.5">
              <span>Journal d'Audit Immuable & Traçabilité Opérationnelle</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Lecture Seule • Certifié Conforme
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Horodatage séquentiel et journalisation inaltérable de chaque appel de fonds, encaissement et action critique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-mono font-bold text-slate-200 border border-white/10">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{auditLogs.length} événements certifiés</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche acteur, quittance, montant..."
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-64"
            />
          </div>

          {/* Action Type Filter */}
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Toutes les actions</option>
            <option value="payment_recorded">Encaissements / Quittances</option>
            <option value="call_funds_issued">Appels de cotisations</option>
            <option value="manual_amount_adjusted">Ajustements manuels</option>
            <option value="service_validated">Émargements prestataires</option>
            <option value="complaint_status_changed">Statuts des réclamations</option>
            <option value="role_changed">Rôles & Sécurité</option>
          </select>

          {/* Actor Filter */}
          <select
            value={selectedActorFilter}
            onChange={(e) => setSelectedActorFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Tous les acteurs</option>
            {actors.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredLogs.length}</strong> entrée(s) filtrée(s)
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun enregistrement d'audit ne correspond à vos critères de recherche.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActionBadge(log.actionType)}
                    <span className="font-bold text-xs text-slate-900">
                      {log.actionLabel}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs font-semibold text-blue-700">
                      {log.targetEntity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dateStr} à {timeStr}</span>
                  </div>
                </div>

                {/* Actor & Details */}
                <div className="pt-3 text-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Acteur certifié :</span>
                      <strong className="text-slate-900">{log.actorName}</strong>
                      {getRoleBadge(log.actorRole)}
                    </div>
                  </div>

                  <p className="text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {log.details}
                  </p>

                  {/* Diff visualization if available */}
                  {(log.oldValue || log.newValue) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {log.oldValue && (
                        <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-800 text-[11px]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-0.5">
                            État antérieur (Avant)
                          </span>
                          <span className="font-mono">{log.oldValue}</span>
                        </div>
                      )}

                      {log.newValue && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-[11px]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">
                            Nouvel état certifié (Après)
                          </span>
                          <span className="font-mono">{log.newValue}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
