import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { RecurringServiceTrade, ServicePassageLog } from '../../types';
import { ServiceValidationModal } from '../modals/ServiceValidationModal';
import { NewServicePassageModal } from '../modals/NewServicePassageModal';
import {
  Wrench,
  Phone,
  CheckCircle2,
  Shield,
  Calendar,
  AlertCircle,
  PlusCircle,
  Sparkles,
  TreePine,
  Check,
  AlertTriangle,
  Clock,
  Building,
  UserCheck,
  ChevronRight,
  FileText,
  ListChecks,
  ExternalLink,
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { currentUser, isBlockScoped, isResidentScoped, isPresidentScoped } = useAuth();
  const {
    servicePassages,
    validateServicePassage,
    addServicePassage,
    blocks,
  } = useResidence();

  const [activeTab, setActiveTab] = useState<'passages' | 'contracts' | 'security'>('passages');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedPassageForValidation, setSelectedPassageForValidation] = useState<ServicePassageLog | null>(null);
  const [isNewPassageOpen, setIsNewPassageOpen] = useState(false);

  // Scoped passages
  const scopedPassages = servicePassages.filter((p) => {
    if (isBlockScoped) {
      return p.blockId === 'block-h' || p.blockId === 'all';
    }
    if (isResidentScoped) {
      return p.blockId === 'block-h' || p.blockId === 'all';
    }
    return true; // Global admin
  });

  const filteredPassages = scopedPassages.filter((p) => {
    const matchesTrade = tradeFilter === 'all' || p.trade === tradeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesTrade && matchesStatus;
  });

  // Pending validation items for current role
  const pendingValidationForMe = scopedPassages.filter(
    (p) => p.status === 'completed_pending_validation'
  );

  const serviceProviders = [
    {
      id: 'srv-01',
      name: 'AquaPool Maintenance & Services',
      domain: 'Entretien & Traitement des 18 Piscines',
      trade: 'pool',
      contact: 'Hassan Amrani',
      phone: '+212 5 39 94 80 10',
      status: 'contract_active',
      nextVisit: 'Jeudi 18 Septembre (08:00)',
      contractEnd: '31 Décembre 2026',
      sla: 'Intervention sous 4h en cas de panne de pompe',
    },
    {
      id: 'srv-02',
      name: 'Otis Elevators Maroc',
      domain: 'Maintenance Ascenseurs des 9 Blocs (A à I)',
      trade: 'elevator',
      contact: 'Support Urgence 24/7',
      phone: '+212 5 22 20 40 60',
      status: 'contract_active',
      nextVisit: 'Mardi 23 Septembre (Visite mensuelle)',
      contractEnd: '30 Juin 2027',
      sla: 'Astreinte 24h/24 déblocage personnes en moins de 30 min',
    },
    {
      id: 'srv-03',
      name: 'LuminaTech Électricité & Domotique',
      domain: 'Éclairage subaquatique & parties communes',
      trade: 'lighting',
      contact: 'Rachid Bennani',
      phone: '+212 6 61 78 90 12',
      status: 'intervention_pending',
      nextVisit: 'Mercredi 17 Septembre (Remplacement LED Bloc H)',
      contractEnd: '31 Décembre 2026',
      sla: 'Intervention sous 24h pour éclairage de sécurité',
    },
    {
      id: 'srv-04',
      name: 'Marina Security Guarding',
      domain: 'Gardiennage, Contrôle d’accès & Vidéoprotection',
      trade: 'security',
      contact: 'Capitaine Zouhir',
      phone: '+212 5 39 99 11 22',
      status: 'contract_active',
      nextVisit: 'Permanence continue 24/7 (Poste Central)',
      contractEnd: '31 Mars 2027',
      sla: 'Rondes nocturnes horaires sur les 9 blocs et 18 bassins',
    },
    {
      id: 'srv-05',
      name: 'Société CleanNet Marina SARL',
      domain: 'Nettoyage des parties communes, cages d’escalier & abords bassins',
      trade: 'cleaning',
      contact: 'Mme Latifa Kabbaj',
      phone: '+212 5 39 33 44 55',
      status: 'contract_active',
      nextVisit: 'Passages 3x par semaine (Lundi, Mercredi, Samedi)',
      contractEnd: '31 Décembre 2026',
      sla: 'Émargement obligatoire par les représentants de bloc après chaque passage',
    },
    {
      id: 'srv-06',
      name: 'Verts Jardins du Détroit',
      domain: 'Aménagement paysager, tonte & arrosage automatique',
      trade: 'gardening',
      contact: 'Youssef Mansouri',
      phone: '+212 6 63 45 67 89',
      status: 'contract_active',
      nextVisit: 'Vendredi 18 Septembre (Élagage trimestriel des palmiers)',
      contractEnd: '31 Octobre 2026',
      sla: 'Traitement biologique phyto & nettoyage immédiat des allées',
    },
  ];

  const getTradeBadge = (trade: RecurringServiceTrade) => {
    switch (trade) {
      case 'cleaning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3" /> Ménage & Propreté
          </span>
        );
      case 'gardening':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TreePine className="w-3 h-3" /> Espaces Verts
          </span>
        );
      case 'security':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3" /> Sécurité & Rondes
          </span>
        );
    }
  };

  const getPassageStatusBadge = (status: ServicePassageLog['status']) => {
    switch (status) {
      case 'completed_pending_validation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> À émarger / valider
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validé conforme
          </span>
        );
      case 'incident_reported':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Non-conforme / Incident
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Calendar className="w-3 h-3" /> Planifié
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
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>
              {isBlockScoped
                ? 'Services Récurrents & Émargement • Bloc H'
                : isResidentScoped
                ? 'Services & Entretien de ma Résidence'
                : 'Facility Management & Services Récurrents'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBlockScoped
              ? 'Contrôle qualité terrain : Ménage, Jardinage et Sécurité des abords et bassins du Bloc H'
              : isResidentScoped
              ? 'Suivi des passages d’entretien, émargements et rondes de sécurité'
              : 'Registre d’émargement, conformité contractuelle SLA et coordination des prestataires'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isPresidentScoped || isBlockScoped) && (
            <button
              onClick={() => setIsNewPassageOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Consigner un passage</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner for pending validation by representative */}
      {pendingValidationForMe.length > 0 && (isBlockScoped || isPresidentScoped) && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                {pendingValidationForMe.length} passage(s) en attente d'émargement qualité
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Le passage récent de CleanNet pour le Bloc H requiert votre vérification terrain des paliers et des abords bassins.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPassageForValidation(pendingValidationForMe[0])}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs shrink-0 self-start sm:self-auto"
          >
            Émarger maintenant
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('passages')}
          className={`pb-3 transition relative flex items-center gap-1.5 ${
            activeTab === 'passages'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Fiches de passage & Émargement ({scopedPassages.length})</span>
          {pendingValidationForMe.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition relative flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Main Courante & Sécurité Nocturne</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 transition relative flex items-center gap-1.5 ${
            activeTab === 'contracts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contrats & SLA Prestataires ({serviceProviders.length})</span>
        </button>
      </div>

      {/* TAB 1: FICHES DE PASSAGE & EMARGEMENT */}
      {activeTab === 'passages' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">Tous les corps de métier</option>
                <option value="cleaning">Ménage</option>
                <option value="gardening">Jardinage</option>
                <option value="security">Sécurité</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">Tous les états</option>
                <option value="completed_pending_validation">En attente de validation</option>
                <option value="validated">Validés conformes</option>
                <option value="incident_reported">Incidents signalés</option>
                <option value="scheduled">Planifiés</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              {filteredPassages.length} fiche(s) de passage
            </span>
          </div>

          {/* Passages List */}
          <div className="space-y-3">
            {filteredPassages.map((passage) => {
              const block = blocks.find((b) => b.id === passage.blockId);
              const isPendingForMe =
                passage.status === 'completed_pending_validation' &&
                (isPresidentScoped || (isBlockScoped && (passage.blockId === 'block-h' || passage.blockId === 'all')));

              return (
                <div
                  key={passage.id}
                  className={`bg-white rounded-xl p-5 border transition-all shadow-2xs ${
                    isPendingForMe
                      ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                      : passage.status === 'incident_reported'
                      ? 'border-rose-200 bg-rose-50/5'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTradeBadge(passage.trade)}
                        <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {passage.blockId === 'all' ? 'Global Résidence (9 Blocs)' : block?.name || passage.blockId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {passage.date} ({passage.timeSlot})
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1">{passage.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {passage.description}
                      </p>

                      {/* Checklist verification tags */}
                      <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
                        {passage.stairwellsChecked !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium ${
                              passage.stairwellsChecked
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Check className="w-3 h-3" /> Paliers & Escaliers
                          </span>
                        )}
                        {passage.poolSurroundingsChecked !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium ${
                              passage.poolSurroundingsChecked
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {passage.poolSurroundingsChecked ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            Abords des 2 Bassins
                          </span>
                        )}
                        {passage.greenAreasTreated && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium">
                            <Check className="w-3 h-3" /> Espaces Verts
                          </span>
                        )}
                        {passage.securityRoundCount && (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 font-medium">
                            <Shield className="w-3 h-3" /> {passage.securityRoundCount} rondes nocturnes
                          </span>
                        )}
                      </div>

                      {/* Tasks executed list */}
                      {passage.tasksDone && passage.tasksDone.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-800 text-[11px] block mb-1">
                            Détail des opérations exécutées :
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {passage.tasksDone.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Anomalies if any */}
                      {passage.anomaliesNoted && passage.anomaliesNoted.length > 0 && (
                        <div className="mt-2 text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                          <span className="font-bold flex items-center gap-1 text-[11px] mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Anomalies relevées :
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {passage.anomaliesNoted.map((a, idx) => (
                              <li key={idx}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      {getPassageStatusBadge(passage.status)}
                      <span className="text-[11px] text-slate-500 font-medium">
                        {passage.providerName}
                      </span>
                    </div>
                  </div>

                  {/* Sign-off / Validation info footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      {passage.validatedBy ? (
                        <span className="flex items-center gap-1 text-slate-700">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Émargé par : <strong>{passage.validatedBy}</strong>
                          {passage.validatedAt && (
                            <span className="text-slate-400">
                              (le {new Date(passage.validatedAt).toLocaleDateString('fr-FR')})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En attente de signature par le représentant
                        </span>
                      )}
                      {passage.validationComment && (
                        <p className="italic text-slate-600 mt-0.5">
                          "{passage.validationComment}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isPendingForMe && (
                      <button
                        onClick={() => setSelectedPassageForValidation(passage)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Contrôler & Émarger</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MAIN COURANTE SECURITE */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Poste Central de Sécurité & Surveillance
              </span>
              <h2 className="text-lg font-bold">Rondes Nocturnes & Protection des 18 Piscines</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Surveillance continue 24/7 assurée par Marina Security Guarding. Évacuation obligatoire des bassins à 22h00, rondes horaires sur les 9 blocs.
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center min-w-[160px]">
              <span className="text-[11px] text-slate-400 block">Capitaine de Poste</span>
              <strong className="text-white text-sm">Zouhir (+212 5 39 99 11 22)</strong>
              <span className="text-[10px] text-emerald-400 block mt-1">● Poste actif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicePassages
              .filter((p) => p.trade === 'security')
              .map((sec) => (
                <div key={sec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Rapport du {sec.date}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {sec.timeSlot}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                  <p className="text-xs text-slate-600">{sec.description}</p>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      Déroulement des rondes :
                    </span>
                    {sec.tasksDone.map((td, i) => (
                      <p key={i} className="text-slate-600 text-[11px]">
                        • {td}
                      </p>
                    ))}
                  </div>

                  {sec.anomaliesNoted && sec.anomaliesNoted.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-bold block text-[11px]">Événements consignés :</span>
                      {sec.anomaliesNoted.map((anom, i) => (
                        <p key={i} className="text-[11px]">
                          ⚠️ {anom}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Agents : <strong>{sec.agentName}</strong></span>
                    <span className="text-emerald-700 font-medium">Validé par le syndic</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTRATS & PRESTATAIRES */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceProviders.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{srv.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      srv.status === 'intervention_pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {srv.status === 'intervention_pending' ? 'Intervention planifiée' : 'Contrat actif'}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-blue-600">{srv.domain}</div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {srv.contact} : <strong className="text-slate-900">{srv.phone}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prochaine visite : {srv.nextVisit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Échéance : {srv.contractEnd}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
                SLA contractuel : {srv.sla}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Modal */}
      <ServiceValidationModal
        passage={selectedPassageForValidation}
        isOpen={Boolean(selectedPassageForValidation)}
        onClose={() => setSelectedPassageForValidation(null)}
        validatorName={`${currentUser.name} (${currentUser.role === 'block_rep' ? 'Rep. ' + (currentUser.assignedBlockCode || 'H') : 'Syndic'})`}
        onConfirm={(passageId, status, comment, incidentTitle) => {
          validateServicePassage(
            passageId,
            status,
            `${currentUser.name} (${currentUser.role === 'block_rep' ? 'Rep. ' + (currentUser.assignedBlockCode || 'H') : 'Syndic'})`,
            comment,
            incidentTitle
          );
        }}
      />

      {/* New Service Passage Modal */}
      <NewServicePassageModal
        isOpen={isNewPassageOpen}
        onClose={() => setIsNewPassageOpen(false)}
        onSuccess={(passage) => {
          addServicePassage(passage);
        }}
      />
    </div>
  );
};
