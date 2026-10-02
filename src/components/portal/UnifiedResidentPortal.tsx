import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import {
  PaymentTransaction,
  MeetingDocument,
  GovernanceDecision,
  ComplaintStatus,
} from '../../types';
import { ReceiptModal } from '../finance/ReceiptModal';
import { DocumentViewerModal } from '../governance/DocumentViewerModal';
import {
  Home,
  Waves,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Download,
  Eye,
  Thermometer,
  Droplets,
  Lightbulb,
  ExternalLink,
  Receipt,
  UserCheck,
  Megaphone,
  Wrench,
  Info,
  Check,
} from 'lucide-react';

interface UnifiedResidentPortalProps {
  onOpenNewComplaint: () => void;
  onNavigateToView?: (view: string) => void;
}

export const UnifiedResidentPortal: React.FC<UnifiedResidentPortalProps> = ({
  onOpenNewComplaint,
  onNavigateToView,
}) => {
  const { currentTenant, assignedApartment, currentUser } = useAuth();
  const {
    getContributionsForApartment,
    getPaymentsForApartment,
    getPoolsForBlock,
    getRepresentativeForBlock,
    getServicePassagesForBlock,
    complaints,
    getAnnouncementsForUser,
    readAnnouncementIds,
    markAnnouncementAsRead,
    getPublicDecisions,
    officialDocs,
  } = useResidence();

  const [activePortalTab, setActivePortalTab] = useState<'foyer' | 'bloc' | 'documents'>('foyer');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<MeetingDocument | null>(null);

  // Fallback apartment data for demo
  const apt = assignedApartment || {
    id: 'apt-h-12',
    tenantId: 'tenant-pb-01',
    blockId: 'block-h',
    doorNumber: 'H-12',
    floor: 1,
    ownerName: 'M. & Mme Youssef Tazi',
    residentName: 'Youssef Tazi',
    residentType: 'owner' as const,
    surfaceM2: 118,
    contactPhone: '+212 6 61 45 89 20',
  };

  const blockCode = 'H';
  const blockId = 'block-h';

  // 1. Financial summary
  const myContributions = useMemo(() => getContributionsForApartment(apt.id), [getContributionsForApartment, apt.id]);
  const myPayments = useMemo(() => getPaymentsForApartment(apt.id), [getPaymentsForApartment, apt.id]);

  const totalDue = myContributions.reduce((sum, c) => sum + c.balance, 0);
  const isUpToDate = totalDue <= 0;
  const latestPayment = myPayments.length > 0 ? myPayments[0] : null;

  // 2. Pools for Bloc H
  const blockPools = useMemo(() => getPoolsForBlock(blockId), [getPoolsForBlock, blockId]);
  const adultPool = blockPools.find((p) => p.type === 'adult') || blockPools[0];
  const childPool = blockPools.find((p) => p.type === 'child') || blockPools[1];

  // 3. Representative for Bloc H
  const representative = useMemo(() => getRepresentativeForBlock(blockCode), [getRepresentativeForBlock, blockCode]);

  // 4. Service passages for Bloc H
  const blockServices = useMemo(() => getServicePassagesForBlock(blockId), [getServicePassagesForBlock, blockId]);

  // 5. User complaints
  const myComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        c.apartmentId === apt.id ||
        c.doorNumber === apt.doorNumber ||
        (c.blockId === blockId && c.authorRole === 'resident')
    );
  }, [complaints, apt, blockId]);

  // 6. Announcements (isolated for user/Bloc H)
  const myAnnouncements = useMemo(() => {
    return getAnnouncementsForUser('resident', blockId, blockCode);
  }, [getAnnouncementsForUser, blockId, blockCode]);

  // Urgent / top active announcements
  const urgentAnnouncements = myAnnouncements.filter((a) => a.priority === 'urgent');
  const localBlockAnnouncements = myAnnouncements.filter((a) => a.scope === 'block');

  // 7. Public decisions
  const publicDecisions = useMemo(() => getPublicDecisions(), [getPublicDecisions]);

  // Timeline step generator for complaints
  const getTimelineStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return 0;
      case 'pending':
      case 'assigned':
        return 1;
      case 'in_progress':
        return 2;
      case 'resolved':
      case 'closed':
        return 3;
      default:
        return 0;
    }
  };

  const timelineSteps = [
    'Déposé',
    'Constaté Rep.',
    'Intervention en cours',
    'Clôturé conforme',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Foyer Profile & Tabs */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Portail Résident Officiel
              </span>
              <span className="text-xs text-slate-400">Puerto Banus Marina</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Bienvenue chez vous, {apt.residentName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Lot privatif <strong>{apt.doorNumber}</strong> • Bloc {blockCode} ({apt.surfaceM2} m² • {apt.residentType === 'owner' ? 'Copropriétaire Résident' : 'Locataire'})
            </p>
          </div>

          {/* Quick Action Button: Signaler un problème */}
          <div className="flex items-center gap-3">
            <button
              id="btn-portal-report-issue"
              onClick={onOpenNewComplaint}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition transform active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Signaler un incident</span>
            </button>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <button
            id="portal-tab-foyer"
            onClick={() => setActivePortalTab('foyer')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activePortalTab === 'foyer'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>Mon Foyer (Accueil)</span>
          </button>

          <button
            id="portal-tab-bloc"
            onClick={() => setActivePortalTab('bloc')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activePortalTab === 'bloc'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Mon Bloc {blockCode}</span>
            {localBlockAnnouncements.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          <button
            id="portal-tab-documents"
            onClick={() => setActivePortalTab('documents')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activePortalTab === 'documents'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Documents & Décisions</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MON FOYER (ACCUEIL SYNTHÉTIQUE MOBILE-FIRST)                      */}
      {/* ========================================================================= */}
      {activePortalTab === 'foyer' && (
        <div className="space-y-6">
          {/* Dynamic Active / Urgent Announcements Banner */}
          {urgentAnnouncements.length > 0 && (
            <div className="space-y-2">
              {urgentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                          Alerte Prioritaire
                        </span>
                        <span className="text-xs font-bold text-rose-900">{ann.title}</span>
                      </div>
                      <p className="text-xs text-rose-800 mt-1 line-clamp-2">{ann.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePortalTab('bloc')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 self-end sm:self-center shrink-0 underline"
                  >
                    <span>Consulter le détail</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Grid 2 Columns: Financial situation & Pool status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget 1: Situation Financière Personnelle */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Cotisations Syndicales</h3>
                      <span className="text-[11px] text-slate-400">Compte privatif du lot {apt.doorNumber}</span>
                    </div>
                  </div>

                  {isUpToDate ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>À jour</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Solde débiteur</span>
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Solde exigible :</span>
                    <span
                      className={`text-xl font-extrabold ${
                        isUpToDate ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {totalDue.toLocaleString('fr-FR')} MAD
                    </span>
                  </div>

                  {latestPayment && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                      <span>Dernier règlement enregistré :</span>
                      <span className="font-semibold text-slate-800">
                        {latestPayment.amount.toLocaleString('fr-FR')} MAD le{' '}
                        {latestPayment.paymentDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {latestPayment ? (
                  <button
                    id="btn-view-official-receipt"
                    onClick={() => {
                      setSelectedReceipt(latestPayment);
                      setIsReceiptModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Voir la dernière quittance officielle</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Aucun paiement archivé</span>
                )}

                <button
                  onClick={() => onNavigateToView && onNavigateToView('finances')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <span>Grand livre</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Widget 2: Statut des 2 Bassins du Bloc H */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Waves className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Baignade & 2 Bassins • Bloc {blockCode}</h3>
                      <span className="text-[11px] text-slate-400">Surveillance sanitaire et technique</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Bassin Adultes & Pataugeoire
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Grand bassin adulte */}
                  {adultPool && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Grand Bassin Principal
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                              adultPool.status === 'operational'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {adultPool.status === 'operational' ? 'Opérationnel' : 'Maintenance'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-blue-600" />
                            {adultPool.waterTemperatureC || 27}°C
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-600" />
                            pH {adultPool.phLevel || 7.3}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Lightbulb
                              className={`w-3 h-3 ${
                                adultPool.lightingStatus === 'working'
                                  ? 'text-emerald-600'
                                  : 'text-amber-500'
                              }`}
                            />
                            {adultPool.lightingStatus === 'working' ? 'Projecteurs OK' : 'Éclairage défectueux'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pataugeoire enfants */}
                  {childPool && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Pataugeoire Enfants
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                              childPool.status === 'operational'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {childPool.status === 'operational' ? 'Opérationnel' : 'Maintenance'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-blue-600" />
                            {childPool.waterTemperatureC || 28}°C
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-600" />
                            pH {childPool.phLevel || 7.2}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Sécurité OK
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Contrôle qualité quotidien par Atlas Services</span>
                <button
                  onClick={() => onNavigateToView && onNavigateToView('pools')}
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Vue 18 piscines</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Widget 3: Suivi Chronologique de mes Réclamations Ouvertes avec Timeline Graphique */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Suivi de Mes Demandes d'Intervention ({myComplaints.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Timeline d'avancement des tickets et des résolutions
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenNewComplaint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nouveau ticket</span>
              </button>
            </div>

            {myComplaints.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                Aucune réclamation en cours sur votre lot. Tout fonctionne parfaitement !
              </div>
            ) : (
              <div className="space-y-4">
                {myComplaints.map((ticket) => {
                  const currentStepIdx = getTimelineStepIndex(ticket.status);

                  return (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                            {ticket.ticketNumber}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900">{ticket.title}</h4>
                        </div>

                        <span className="text-xs text-slate-400">
                          Enregistré le {ticket.createdAt.split('T')[0]}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>

                      {/* Timeline Graphique 4 Étapes */}
                      <div className="pt-2">
                        <div className="grid grid-cols-4 gap-2 relative">
                          {timelineSteps.map((stepLabel, idx) => {
                            const isPast = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={idx} className="space-y-1.5 text-center relative">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isPast
                                      ? 'bg-emerald-500'
                                      : isCurrent
                                      ? 'bg-blue-600 animate-pulse'
                                      : 'bg-slate-200'
                                  }`}
                                />
                                <span
                                  className={`block text-[10px] font-semibold leading-tight ${
                                    isCurrent
                                      ? 'text-blue-700 font-bold'
                                      : isPast
                                      ? 'text-emerald-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {stepLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active step info */}
                      {ticket.assignedTechnician && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between">
                          <span>
                            Prestataire mandaté : <strong>{ticket.assignedTechnician}</strong>
                          </span>
                          {ticket.scheduledDate && (
                            <span>Passage prévu le {ticket.scheduledDate}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MON BLOC (COMMUNICATION LOCALE, REPRÉSENTANT & SERVICES)           */}
      {/* ========================================================================= */}
      {activePortalTab === 'bloc' && (
        <div className="space-y-6">
          {/* Representative card */}
          {representative && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    {representative.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Votre Représentant de Bloc
                      </span>
                      <span className="text-xs text-slate-400">Mandat 2024-2026</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {representative.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Copropriétaire élu du Bloc {blockCode} (Appartement {representative.apartmentNumber}) • Relais officiel auprès du Syndic
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <a
                    href={`tel:${representative.phone}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{representative.phone}</span>
                  </a>
                  <a
                    href={`mailto:${representative.email}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contacter</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Local announcements for Bloc H */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Vie & Annonces du Bloc {blockCode}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Informations locales et notes de service exclusives au Bloc {blockCode}
                  </span>
                </div>
              </div>
            </div>

            {localBlockAnnouncements.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                Aucune communication locale en cours pour le Bloc {blockCode}.
              </div>
            ) : (
              <div className="space-y-3">
                {localBlockAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                          Bloc {blockCode}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">{ann.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Auteur : {ann.authorName}</span>
                      {ann.attachmentName && (
                        <span className="text-blue-600 font-medium">{ann.attachmentName}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Planning des Passages de Services au Bloc H */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Planning & Passages des Prestataires au Bloc {blockCode}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Nettoyage des paliers, entretien des espaces verts et relevé des bassins
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {blockServices.length > 0 ? (
                blockServices.map((passage) => (
                  <div
                    key={passage.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {passage.serviceType === 'cleaning'
                          ? 'Nettoyage des Paliers'
                          : passage.serviceType === 'gardening'
                          ? 'Espaces Verts'
                          : 'Maintenance'}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-1">
                        {passage.providerName}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {passage.notes || 'Prestation conforme au cahier des charges.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] flex items-center justify-between text-slate-500">
                      <span>Passage du {passage.scheduledDate}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Validé
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-6 text-center text-xs text-slate-400">
                  Aucun passage programmé cette semaine pour le Bloc {blockCode}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCUMENTS & DÉCISIONS (REGISTRE OFFICIEL & TÉLÉCHARGEMENTS)        */}
      {/* ========================================================================= */}
      {activePortalTab === 'documents' && (
        <div className="space-y-6">
          {/* Espace Documentaire Certifié */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Documents Officiels de la Copropriété
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Règlement intérieur, procès-verbaux d'assemblées et modèles juridiques
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {officialDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {doc.fileName} • {doc.fileSize} • {doc.date}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Registre des Résolutions Publiques Votées */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Résolutions Publiques Adoptées ({publicDecisions.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Décisions opposables votées en Assemblée Générale et engagées par le Conseil
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {publicDecisions.map((dec) => (
                <div key={dec.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {dec.code}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{dec.title}</h4>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          dec.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {dec.status === 'done' ? 'Réalisée' : 'En cours'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      Échéance : <strong>{dec.dueDate}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{dec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quittance Officielle Modal */}
      <ReceiptModal
        transaction={selectedReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={selectedDocForViewer}
        isOpen={!!selectedDocForViewer}
        onClose={() => setSelectedDocForViewer(null)}
      />
    </div>
  );
};
