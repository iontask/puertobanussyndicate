import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { Complaint, ComplaintStatus, UserRole } from '../../types';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building,
  User,
  Wrench,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  MessageSquare,
  ShieldAlert,
  FileText,
  Activity,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
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

const statusSteps: { key: ComplaintStatus; label: string; step: number }[] = [
  { key: 'new', label: 'Nouveau', step: 1 },
  { key: 'pending', label: 'En attente', step: 2 },
  { key: 'assigned', label: 'Assigné', step: 3 },
  { key: 'in_progress', label: 'En cours', step: 4 },
  { key: 'resolved', label: 'Résolu', step: 5 },
  { key: 'closed', label: 'Clôturé', step: 6 },
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const { currentUser, isResidentScoped, isBlockScoped, isPresidentScoped } = useAuth();
  const { pools, commonLighting, blocks } = useResidence();

  // Status advancement form state
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('in_progress');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [providerName, setProviderName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [interventionReport, setInterventionReport] = useState('');

  if (!isOpen || !complaint) return null;

  const currentStepObj = statusSteps.find((s) => s.key === complaint.status) || statusSteps[0];
  const block = blocks.find((b) => b.id === complaint.blockId);

  // Check if linked to equipment
  const linkedPool = pools.find((p) => p.id === complaint.equipmentId);
  const linkedLighting = commonLighting.find((l) => l.id === complaint.equipmentId);

  const canManage = isPresidentScoped || isBlockScoped;

  const handleOpenAdvanceForm = (statusToSet: ComplaintStatus) => {
    setTargetStatus(statusToSet);
    setProviderName(complaint.assignedTo || '');
    setTechnicianName(complaint.assignedTechnician || '');
    setScheduledDate(complaint.scheduledDate || '');
    setEstimatedCost(complaint.estimatedCost ? complaint.estimatedCost.toString() : '');
    setActualCost(complaint.actualCost ? complaint.actualCost.toString() : '');
    setInterventionReport(complaint.interventionReport || '');
    setTransitionNotes('');
    setShowAdvanceForm(true);
  };

  const handleSubmitAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(complaint.id, targetStatus, transitionNotes.trim() || undefined, {
      assignedTo: providerName.trim() || undefined,
      assignedTechnician: technicianName.trim() || undefined,
      scheduledDate: scheduledDate || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
      interventionReport: interventionReport.trim() || undefined,
      authorName: currentUser.name,
      authorRole: currentUser.role,
    });
    setShowAdvanceForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              #{complaint.id}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                complaint.priority === 'urgent'
                  ? 'bg-rose-100 text-rose-800'
                  : complaint.priority === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              Priorité {complaint.priority}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              {complaint.category.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-sm">
          {/* Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{complaint.title}</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {complaint.description}
            </p>
          </div>

          {/* Stepper Cycle de vie */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cycle de vie du ticket
              </span>
              <span className="text-xs font-semibold text-blue-600">
                Étape {currentStepObj.step} sur {statusSteps.length} ({currentStepObj.label})
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {statusSteps.map((step) => {
                const isPassed = step.step <= currentStepObj.step;
                const isCurrent = step.key === complaint.status;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-blue-600 ring-2 ring-blue-400/30'
                          : isPassed
                          ? 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium text-center truncate w-full ${
                        isCurrent
                          ? 'text-blue-700 font-bold'
                          : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spatial & Equipment Link Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Localisation spatiale
              </span>
              <div className="text-slate-600 space-y-0.5 pl-5">
                <p>
                  Bloc : <strong>{block?.name || complaint.blockId}</strong> (Bloc {block?.code || 'H'})
                </p>
                <p>
                  Périmètre :{' '}
                  <span className="capitalize font-medium">
                    {complaint.scope === 'private' ? 'Lot Privatif' : 'Parties Communes'}
                  </span>
                </p>
                {complaint.apartmentId && (
                  <p>
                    Porte / Lot : <strong className="uppercase">{complaint.apartmentId.replace('apt-', '')}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                Équipement rattaché (FM)
              </span>
              <div className="text-slate-600 space-y-0.5 pl-5">
                {linkedPool ? (
                  <div>
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      🏊 Bassin : {linkedPool.name || (linkedPool.type === 'adult' ? 'Grand Bain' : 'Pataugeoire')} ({(linkedPool.poolType || linkedPool.type) === 'adult' ? 'Grand bain' : 'Pataugeoire'})
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Statut équipement : <strong>{linkedPool.status.toUpperCase()}</strong> | Éclairage : {linkedPool.lightingStatus}
                    </p>
                  </div>
                ) : linkedLighting ? (
                  <div>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      💡 Éclairage : {linkedLighting.label}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Localisation : {linkedLighting.location || linkedLighting.zone} {linkedLighting.totalBulbs ? `| Ampoules : ${linkedLighting.workingBulbs || 0}/${linkedLighting.totalBulbs}` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Aucun équipement unitaire spécifié (Général)</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Provider & Intervention Details */}
          {(complaint.assignedTo || complaint.estimatedCost || complaint.interventionReport) && (
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  Prise en charge prestataire
                </span>
                {complaint.scheduledDate && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    Intervention prévue le : <strong>{complaint.scheduledDate}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-600">
                {complaint.assignedTo && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Prestataire mandaté</span>
                    <strong className="text-slate-800">{complaint.assignedTo}</strong>
                  </div>
                )}
                {complaint.assignedTechnician && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Technicien</span>
                    <strong className="text-slate-800">{complaint.assignedTechnician}</strong>
                  </div>
                )}
                {complaint.estimatedCost !== undefined && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Devis estimé</span>
                    <strong className="text-blue-700">{complaint.estimatedCost} MAD</strong>
                  </div>
                )}
                {complaint.actualCost !== undefined && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Coût final facturé</span>
                    <strong className="text-emerald-700">{complaint.actualCost} MAD</strong>
                  </div>
                )}
              </div>
              {complaint.interventionReport && (
                <div className="mt-2 pt-2 border-t border-blue-100 text-slate-700">
                  <span className="font-semibold text-slate-900 block text-[11px]">Rapport d'intervention :</span>
                  <p className="mt-0.5 text-slate-600">{complaint.interventionReport}</p>
                </div>
              )}
            </div>
          )}

          {/* Attached Photos */}
          {complaint.photos && complaint.photos.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Photos & Justificatifs constat ({complaint.photos.length})
              </span>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {complaint.photos.map((src, idx) => (
                  <a
                    key={idx}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition"
                  >
                    <img src={src} alt="Constat" className="w-24 h-24 object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log / Timeline */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Traçabilité & Historique d'activités</span>
            </div>
            <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
              {complaint.activityLogs && complaint.activityLogs.length > 0 ? (
                complaint.activityLogs.map((log) => (
                  <div key={log.id} className="relative text-xs space-y-1">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {log.authorName}{' '}
                        <span className="text-[10px] font-normal text-slate-400">({log.authorRole})</span>
                      </span>
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-slate-700">{log.action}</p>
                    {log.notes && (
                      <p className="text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Aucun historique consigné.</p>
              )}
            </div>
          </div>

          {/* Advance status form if open */}
          {showAdvanceForm && (
            <form
              onSubmit={handleSubmitAdvance}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Mettre à jour le statut : {targetStatus.toUpperCase()}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAdvanceForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Prestataire assigné
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="Ex: LuminaTech, AquaPool..."
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Technicien sur site
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Ex: Rachid B."
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Date prévue
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Devis estimé (MAD)
                  </label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="1450"
                    className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Coût réel final (MAD)
                  </label>
                  <input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="1450"
                    className="w-full px-2 py-1.5 rounded-md border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Note d'avancement / Remarque pour le log
                </label>
                <textarea
                  rows={2}
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Expliquez la décision, le constat ou la confirmation..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                />
              </div>

              {targetStatus === 'resolved' && (
                <div>
                  <label className="block text-[11px] font-medium text-emerald-800 mb-1">
                    Rapport technique de résolution finalisée
                  </label>
                  <textarea
                    rows={2}
                    value={interventionReport}
                    onChange={(e) => setInterventionReport(e.target.value)}
                    placeholder="Détail des pièces remplacées, tests effectués..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-emerald-300 bg-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanceForm(false)}
                  className="px-3 py-1.5 text-xs rounded-md text-slate-600 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Confirmer le changement</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer / Fast Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            Fermer
          </button>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              {complaint.status === 'new' && (
                <>
                  <button
                    onClick={() => handleOpenAdvanceForm('pending')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  >
                    Mettre en attente devis
                  </button>
                  <button
                    onClick={() => handleOpenAdvanceForm('assigned')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    Assigner prestataire
                  </button>
                </>
              )}
              {complaint.status === 'pending' && (
                <button
                  onClick={() => handleOpenAdvanceForm('assigned')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                >
                  Assigner prestataire
                </button>
              )}
              {(complaint.status === 'assigned' || complaint.status === 'pending') && (
                <button
                  onClick={() => handleOpenAdvanceForm('in_progress')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                >
                  Démarrer intervention
                </button>
              )}
              {complaint.status === 'in_progress' && (
                <button
                  onClick={() => handleOpenAdvanceForm('resolved')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                >
                  Marquer résolu & Valider
                </button>
              )}
              {complaint.status === 'resolved' && (
                <button
                  onClick={() => handleOpenAdvanceForm('closed')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-800"
                >
                  Clôturer définitivement
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
