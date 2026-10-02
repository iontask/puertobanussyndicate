import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Block,
  Pool,
  Complaint,
  CommonLightingItem,
  BlockRepresentativeInfo,
  Apartment,
  PoolStatus,
  LightingStatus,
  ComplaintStatus,
  ServicePassageLog,
  InAppNotification,
  UserRole,
  TicketActivityLog,
  PaymentMethod,
  PaymentTransaction,
  Contribution,
  AuditLogItem,
  Meeting,
  GovernanceDecision,
  MeetingDocument,
  DecisionStatus,
  Announcement,
  BlockCode,
} from '../types';
import {
  demoBlocks,
  demoPools,
  demoComplaints,
  demoCommonLighting,
  demoRepresentatives,
  demoApartmentsBlockH,
  demoServicePassages,
  demoNotifications,
} from '../mock/puertoBanusData';
import {
  allResidenceApartments,
  initialContributions,
  initialPayments,
  initialAuditLogs,
} from '../mock/financeData';
import {
  initialMeetings,
  initialDecisions,
  officialDocuments,
} from '../mock/governanceData';
import { initialAnnouncements } from '../mock/announcementsData';

export interface BlockStatusSummary {
  block: Block;
  representative?: BlockRepresentativeInfo;
  adultPool?: Pool;
  childPool?: Pool;
  openComplaintsCount: number;
  poolAlertsCount: number;
  commonLightingDefectsCount: number;
  hasAlert: boolean;
  alertSummary: string[];
}

interface ResidenceContextType {
  blocks: Block[];
  pools: Pool[];
  complaints: Complaint[];
  commonLighting: CommonLightingItem[];
  representatives: BlockRepresentativeInfo[];
  apartmentsBlockH: Apartment[];
  allApartments: Apartment[];
  contributions: Contribution[];
  payments: PaymentTransaction[];
  auditLogs: AuditLogItem[];
  servicePassages: ServicePassageLog[];
  notifications: InAppNotification[];
  unreadNotificationsCount: number;

  // Finance & Audit mutations
  recordPayment: (payment: {
    apartmentId: string;
    contributionId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    reference: string;
    notes?: string;
    actorName?: string;
    actorRole?: UserRole;
  }) => PaymentTransaction;
  issueCallForFunds: (params: {
    period: string;
    dueDate: string;
    amountPerM2OrFixed: number;
    calculationMode: 'fixed' | 'surface' | 'tantiemes';
    targetBlockId?: string;
    notes?: string;
    actorName?: string;
    actorRole?: UserRole;
  }) => { count: number; totalAmount: number };
  addAuditLog: (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => void;

  // Finance Selectors
  getApartmentById: (aptId: string) => Apartment | undefined;
  getContributionsForApartment: (aptId: string) => Contribution[];
  getPaymentsForApartment: (aptId: string) => PaymentTransaction[];
  getContributionsForBlock: (blockId: string) => Contribution[];
  getReceiptByNumber: (receiptNumber: string) => PaymentTransaction | undefined;

  // Consolidated Financial KPIs
  financialTotals: {
    totalCalled: number;
    totalPaid: number;
    totalBalance: number;
    recoveryRatePercent: number;
  };

  // Mutations
  updatePool: (poolId: string, updates: Partial<Pool>) => void;
  recordPoolMaintenance: (
    poolId: string,
    updates: {
      status?: PoolStatus;
      lightingStatus?: LightingStatus;
      waterTemperatureC?: number;
      phLevel?: number;
      chlorinePpm?: number;
      lastCleanedAt?: string;
    }
  ) => void;
  toggleCommonLighting: (lightingId: string, status?: LightingStatus, notes?: string) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (
    complaintId: string,
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

  // Services mutations
  validateServicePassage: (
    passageId: string,
    status: 'validated' | 'incident_reported',
    validatorName: string,
    comment?: string,
    reportedIncidentTitle?: string
  ) => void;
  addServicePassage: (passage: ServicePassageLog) => void;

  // Notifications mutations
  addNotification: (notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Governance & Decisions (Lot 5)
  meetings: Meeting[];
  decisions: GovernanceDecision[];
  officialDocs: MeetingDocument[];
  addMeeting: (meeting: Meeting, actorName?: string, actorRole?: UserRole) => void;
  addDecision: (
    decision: Omit<GovernanceDecision, 'id' | 'code'>,
    actorName: string,
    actorRole: UserRole
  ) => GovernanceDecision;
  completeDecision: (
    decisionId: string,
    notes: string,
    completedBy: string,
    completedRole: UserRole
  ) => void;
  updateDecisionStatus: (
    decisionId: string,
    status: DecisionStatus,
    actorName: string,
    actorRole: UserRole
  ) => void;
  getDecisionsForBlock: (blockId?: string, blockCode?: string) => GovernanceDecision[];
  getPublicDecisions: () => GovernanceDecision[];

  // Communication & Announcements (Lot 5)
  announcements: Announcement[];
  readAnnouncementIds: string[];
  addAnnouncement: (
    announcement: Omit<Announcement, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: UserRole
  ) => Announcement;
  markAnnouncementAsRead: (id: string) => void;
  markAllAnnouncementsAsRead: (userId?: string) => void;
  getAnnouncementsForUser: (role: UserRole, blockId?: string, blockCode?: string) => Announcement[];
  unreadAnnouncementsCountForUser: (role: UserRole, blockId?: string, blockCode?: string) => number;

  // Calculs dynamiques consolidés
  totalBlocksCount: number;
  totalApartmentsCount: number;
  totalPoolsCount: number;
  operationalPoolsCount: number;
  maintenancePoolsCount: number;
  closedPoolsCount: number;
  operationalRatePercent: number;
  defectivePoolLightingCount: number;
  defectiveCommonLightingCount: number;
  totalLightingDefectsCount: number;
  totalActiveAlertsCount: number;
  openComplaintsCount: number;
  urgentComplaintsCount: number;
  pendingServicesValidationCount: number;

  // Sélecteurs par bloc
  getBlockById: (blockId: string) => Block | undefined;
  getBlockByCode: (code: string) => Block | undefined;
  getPoolsForBlock: (blockId: string) => Pool[];
  getCommonLightingForBlock: (blockId: string) => CommonLightingItem[];
  getRepresentativeForBlock: (blockCode: string) => BlockRepresentativeInfo | undefined;
  getComplaintsForBlock: (blockId: string) => Complaint[];
  getServicePassagesForBlock: (blockId: string) => ServicePassageLog[];
  getBlockStatusSummary: (blockId: string) => BlockStatusSummary | undefined;
  blocksSummaries: BlockStatusSummary[];
}

const ResidenceContext = createContext<ResidenceContextType | undefined>(undefined);

export const ResidenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blocks] = useState<Block[]>(demoBlocks);
  const [pools, setPools] = useState<Pool[]>(demoPools);
  const [complaints, setComplaints] = useState<Complaint[]>(demoComplaints);
  const [commonLighting, setCommonLighting] = useState<CommonLightingItem[]>(demoCommonLighting);
  const [representatives] = useState<BlockRepresentativeInfo[]>(demoRepresentatives);
  const [apartmentsBlockH] = useState<Apartment[]>(demoApartmentsBlockH);
  const [allApartments] = useState<Apartment[]>(allResidenceApartments);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [payments, setPayments] = useState<PaymentTransaction[]>(initialPayments);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [servicePassages, setServicePassages] = useState<ServicePassageLog[]>(demoServicePassages);
  const [notifications, setNotifications] = useState<InAppNotification[]>(demoNotifications);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [decisions, setDecisions] = useState<GovernanceDecision[]>(initialDecisions);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [officialDocs] = useState<MeetingDocument[]>(officialDocuments);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(['ann-02']);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const pendingServicesValidationCount = useMemo(
    () => servicePassages.filter((p) => p.status === 'completed_pending_validation').length,
    [servicePassages]
  );

  // Mutations
  const updatePool = (poolId: string, updates: Partial<Pool>) => {
    setPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, ...updates } : p))
    );
  };

  const recordPoolMaintenance = (
    poolId: string,
    updates: {
      status?: PoolStatus;
      lightingStatus?: LightingStatus;
      waterTemperatureC?: number;
      phLevel?: number;
      chlorinePpm?: number;
      lastCleanedAt?: string;
    }
  ) => {
    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? {
              ...p,
              ...updates,
              lastCleanedAt: updates.lastCleanedAt || new Date().toISOString(),
            }
          : p
      )
    );
  };

  const toggleCommonLighting = (lightingId: string, newStatus?: LightingStatus, notes?: string) => {
    setCommonLighting((prev) =>
      prev.map((item) => {
        if (item.id === lightingId) {
          const nextStatus = newStatus || (item.status === 'working' ? 'defective' : 'working');
          return {
            ...item,
            status: nextStatus,
            defectReportedAt: nextStatus === 'defective' ? new Date().toISOString() : undefined,
            notes: notes !== undefined ? notes : item.notes,
          };
        }
        return item;
      })
    );
  };

  const addNotification = (notif: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addComplaint = (newComplaint: Complaint) => {
    const createdWithLog: Complaint = {
      ...newComplaint,
      activityLogs:
        newComplaint.activityLogs && newComplaint.activityLogs.length > 0
          ? newComplaint.activityLogs
          : [
              {
                id: `act-${Date.now()}`,
                timestamp: new Date().toISOString(),
                authorName: newComplaint.authorName || 'Utilisateur',
                authorRole: newComplaint.authorRole || 'resident',
                action: 'Création du signalement',
                newStatus: 'new',
                notes: newComplaint.description,
              },
            ],
    };

    setComplaints((prev) => [createdWithLog, ...prev]);

    // In-app notification
    if (newComplaint.priority === 'urgent') {
      addNotification({
        targetRole: 'all',
        targetBlockId: newComplaint.blockId,
        title: `🚨 Alerte Urgente : ${newComplaint.title}`,
        message: `Signalement prioritaire enregistré (${newComplaint.blockId.toUpperCase()}). Prise en charge immédiate requise.`,
        type: 'urgent_alert',
        relatedComplaintId: newComplaint.id,
      });
    } else {
      addNotification({
        targetRole: 'block_rep',
        targetBlockId: newComplaint.blockId,
        title: `Nouveau ticket (${newComplaint.category.toUpperCase()})`,
        message: `Nouveau signalement "${newComplaint.title}" enregistré pour le ${newComplaint.blockId.toUpperCase()}.`,
        type: 'new_ticket',
        relatedComplaintId: newComplaint.id,
      });
    }
  };

  const updateComplaintStatus = (
    complaintId: string,
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
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const prevStatus = c.status;
        const now = new Date().toISOString();
        const authorName = extraData?.authorName || 'Gestionnaire Syndic';
        const authorRole = extraData?.authorRole || 'president';

        const newLog: TicketActivityLog = {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          authorName,
          authorRole,
          action: `Changement de statut en "${newStatus.toUpperCase()}"`,
          previousStatus: prevStatus,
          newStatus,
          notes:
            notes ||
            extraData?.interventionReport ||
            (extraData?.assignedTo ? `Prestataire désigné : ${extraData.assignedTo}` : undefined),
        };

        const updated: Complaint = {
          ...c,
          status: newStatus,
          assignedTo: extraData?.assignedTo !== undefined ? extraData.assignedTo : c.assignedTo,
          assignedTechnician:
            extraData?.assignedTechnician !== undefined
              ? extraData.assignedTechnician
              : c.assignedTechnician,
          scheduledDate:
            extraData?.scheduledDate !== undefined ? extraData.scheduledDate : c.scheduledDate,
          estimatedCost:
            extraData?.estimatedCost !== undefined ? extraData.estimatedCost : c.estimatedCost,
          actualCost: extraData?.actualCost !== undefined ? extraData.actualCost : c.actualCost,
          interventionReport:
            extraData?.interventionReport !== undefined
              ? extraData.interventionReport
              : c.interventionReport,
          resolvedAt: newStatus === 'resolved' ? now : c.resolvedAt,
          closedAt: newStatus === 'closed' ? now : c.closedAt,
          activityLogs: [newLog, ...(c.activityLogs || [])],
        };

        // Link with equipment Lot 2: if resolved and targets pool or lighting, restore equipment status
        if (newStatus === 'resolved' && c.equipmentId) {
          if (c.equipmentId.startsWith('pool-')) {
            updatePool(c.equipmentId, { lightingStatus: 'working', status: 'operational' });
          } else if (c.equipmentId.startsWith('lighting-')) {
            toggleCommonLighting(c.equipmentId, 'working', 'Réparé suite au ticket #' + c.id);
          }
        }

        // Emit discreet in-app notification when moving to in_progress or resolved
        if (newStatus === 'in_progress' || newStatus === 'resolved') {
          addNotification({
            userId: c.authorUserId,
            targetRole: 'resident',
            targetBlockId: c.blockId,
            title: `Ticket #${c.id} : ${newStatus === 'resolved' ? 'Résolu ✅' : 'En cours d’intervention 🛠️'}`,
            message: `Le signalement "${c.title}" est désormais ${
              newStatus === 'resolved'
                ? 'résolu avec succès.'
                : `pris en charge${extraData?.assignedTo ? ' par ' + extraData.assignedTo : ''}.`
            }`,
            type: 'status_change',
            relatedComplaintId: c.id,
          });
        }

        return updated;
      })
    );
  };

  const validateServicePassage = (
    passageId: string,
    status: 'validated' | 'incident_reported',
    validatorName: string,
    comment?: string,
    reportedIncidentTitle?: string
  ) => {
    const now = new Date().toISOString();
    let newTicketId: string | undefined;

    setServicePassages((prev) =>
      prev.map((p) => {
        if (p.id !== passageId) return p;

        if (status === 'incident_reported') {
          newTicketId = `cmp-srv-${Date.now()}`;
          // Auto create a complaint ticket
          const autoTicket: Complaint = {
            id: newTicketId,
            tenantId: 'tenant-pb-01',
            title: reportedIncidentTitle || `Non-conformité passage ${p.trade} - ${p.title}`,
            description: `Incident consigné lors de la vérification terrain par ${validatorName} : ${
              comment || 'Prestation jugée non conforme.'
            }`,
            category:
              p.trade === 'cleaning'
                ? 'cleanliness'
                : p.trade === 'gardening'
                ? 'gardening'
                : 'security',
            priority: 'high',
            status: 'new',
            scope: 'common',
            blockId: p.blockId === 'all' ? 'block-h' : p.blockId,
            createdAt: now,
            authorName: validatorName,
            activityLogs: [
              {
                id: `act-auto-${Date.now()}`,
                timestamp: now,
                authorName: validatorName,
                authorRole: 'block_rep',
                action: 'Création automatique suite à constat de non-conformité de service',
                newStatus: 'new',
                notes: comment,
              },
            ],
          };
          setComplaints((cPrev) => [autoTicket, ...cPrev]);

          addNotification({
            targetRole: 'president',
            title: `Alerte Service : ${p.title}`,
            message: `${validatorName} a consigné une non-conformité sur le passage ${p.trade}. Ticket #${newTicketId} créé.`,
            type: 'service_validation',
            relatedComplaintId: newTicketId,
          });
        } else {
          addNotification({
            targetRole: 'president',
            title: `Service validé (${p.trade})`,
            message: `${validatorName} a validé la conformité du passage pour le ${p.blockId.toUpperCase()}.`,
            type: 'service_validation',
          });
        }

        return {
          ...p,
          status,
          validatedBy: validatorName,
          validatedAt: now,
          validationComment: comment,
          reportedIncidentComplaintId: newTicketId,
        };
      })
    );
  };

  const addServicePassage = (passage: ServicePassageLog) => {
    setServicePassages((prev) => [passage, ...prev]);
  };

  const getServicePassagesForBlock = (blockId: string) => {
    return servicePassages.filter((p) => p.blockId === blockId || p.blockId === 'all');
  };

  // Calculs dynamiques
  const totalBlocksCount = blocks.length;
  const totalApartmentsCount = useMemo(
    () => blocks.reduce((acc, b) => acc + (b.apartmentCount || 0), 0),
    [blocks]
  );
  const totalPoolsCount = pools.length;

  const operationalPoolsCount = useMemo(
    () => pools.filter((p) => p.status === 'operational').length,
    [pools]
  );
  const maintenancePoolsCount = useMemo(
    () => pools.filter((p) => p.status === 'maintenance').length,
    [pools]
  );
  const closedPoolsCount = useMemo(
    () => pools.filter((p) => p.status === 'closed').length,
    [pools]
  );

  const operationalRatePercent = useMemo(() => {
    if (totalPoolsCount === 0) return 0;
    return Math.round((operationalPoolsCount / totalPoolsCount) * 1000) / 10;
  }, [operationalPoolsCount, totalPoolsCount]);

  const defectivePoolLightingCount = useMemo(
    () => pools.filter((p) => p.lightingStatus === 'defective').length,
    [pools]
  );

  const defectiveCommonLightingCount = useMemo(
    () => commonLighting.filter((item) => item.status === 'defective').length,
    [commonLighting]
  );

  const totalLightingDefectsCount = defectivePoolLightingCount + defectiveCommonLightingCount;

  const totalActiveAlertsCount = useMemo(() => {
    const nonOpPools = pools.filter((p) => p.status !== 'operational').length;
    return nonOpPools + defectivePoolLightingCount + defectiveCommonLightingCount;
  }, [pools, defectivePoolLightingCount, defectiveCommonLightingCount]);

  const openComplaintsCount = useMemo(
    () => complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length,
    [complaints]
  );

  const urgentComplaintsCount = useMemo(
    () =>
      complaints.filter(
        (c) =>
          c.priority === 'urgent' && c.status !== 'resolved' && c.status !== 'closed'
      ).length,
    [complaints]
  );

  // Helpers
  const getBlockById = (blockId: string) => blocks.find((b) => b.id === blockId);
  const getBlockByCode = (code: string) => blocks.find((b) => b.code === code);

  const getPoolsForBlock = (blockId: string) => pools.filter((p) => p.blockId === blockId);

  const getCommonLightingForBlock = (blockId: string) =>
    commonLighting.filter((item) => item.blockId === blockId);

  const getRepresentativeForBlock = (blockCode: string) =>
    representatives.find((rep) => rep.blockCode === blockCode);

  const getComplaintsForBlock = (blockId: string) =>
    complaints.filter((c) => c.blockId === blockId);

  const getBlockStatusSummary = (blockId: string): BlockStatusSummary | undefined => {
    const block = getBlockById(blockId);
    if (!block) return undefined;

    const blockPools = getPoolsForBlock(blockId);
    const adultPool = blockPools.find((p) => p.type === 'adult');
    const childPool = blockPools.find((p) => p.type === 'child');
    const blockComplaints = getComplaintsForBlock(blockId);
    const activeComplaints = blockComplaints.filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed'
    );
    const blockLighting = getCommonLightingForBlock(blockId);
    const lightingDefects = blockLighting.filter((l) => l.status === 'defective');

    const alertSummary: string[] = [];

    if (adultPool && adultPool.status !== 'operational') {
      alertSummary.push(
        `Bassin adulte : ${adultPool.status === 'maintenance' ? 'En maintenance' : 'Fermé'}`
      );
    }
    if (adultPool && adultPool.lightingStatus === 'defective') {
      alertSummary.push('Bassin adulte : éclairage LED défectueux');
    }
    if (childPool && childPool.status !== 'operational') {
      alertSummary.push(
        `Pataugeoire : ${childPool.status === 'maintenance' ? 'En maintenance' : 'Fermée'}`
      );
    }
    if (childPool && childPool.lightingStatus === 'defective') {
      alertSummary.push('Pataugeoire : éclairage défectueux');
    }
    lightingDefects.forEach((ld) => {
      alertSummary.push(`Éclairage : ${ld.label}`);
    });
    if (activeComplaints.length > 0) {
      alertSummary.push(`${activeComplaints.length} réclamation(s) en cours`);
    }

    const poolAlerts = blockPools.filter(
      (p) => p.status !== 'operational' || p.lightingStatus === 'defective'
    ).length;

    const hasAlert =
      poolAlerts > 0 || lightingDefects.length > 0 || activeComplaints.length > 0;

    return {
      block,
      representative: getRepresentativeForBlock(block.code),
      adultPool,
      childPool,
      openComplaintsCount: activeComplaints.length,
      poolAlertsCount: poolAlerts,
      commonLightingDefectsCount: lightingDefects.length,
      hasAlert,
      alertSummary,
    };
  };

  // -------------------------------------------------------------
  // MUTATIONS & SELECTEURS FINANCIERS & AUDIT (LOT 4)
  // -------------------------------------------------------------
  const addAuditLog = (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogItem = {
      ...entry,
      id: `log-audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const recordPayment = (params: {
    apartmentId: string;
    contributionId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    reference: string;
    notes?: string;
    actorName?: string;
    actorRole?: UserRole;
  }): PaymentTransaction => {
    const apt = allApartments.find((a) => a.id === params.apartmentId);
    const targetContribution = contributions.find((c) => c.id === params.contributionId);

    const receiptSeq = payments.length + 101;
    const receiptNumber = `REC-PB-2026-${receiptSeq.toString().padStart(4, '0')}`;

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      tenantId: targetContribution?.tenantId || 'tenant-pb-01',
      contributionId: params.contributionId,
      apartmentId: params.apartmentId,
      blockId: apt?.blockId || targetContribution?.blockId || 'block-h',
      doorNumber: apt?.doorNumber || 'Lot',
      residentOrOwnerName: apt?.ownerName || 'Copropriétaire',
      amount: params.amount,
      paymentDate: params.paymentDate,
      paymentMethod: params.paymentMethod,
      reference: params.reference,
      recordedBy: params.actorName || 'Sofia Benjelloun',
      recordedByRole: params.actorRole || 'treasurer',
      createdAt: new Date().toISOString(),
      notes: params.notes,
    };

    if (targetContribution) {
      const newAmountPaid = targetContribution.amountPaid + params.amount;
      const newBalance = Math.max(0, targetContribution.amountDue - newAmountPaid);
      const newStatus =
        newBalance <= 0
          ? 'paid'
          : newAmountPaid > 0
          ? 'partial'
          : targetContribution.status;

      setContributions((prev) =>
        prev.map((c) =>
          c.id === targetContribution.id
            ? {
                ...c,
                amountPaid: newAmountPaid,
                balance: newBalance,
                status: newStatus,
                paidAt: newStatus === 'paid' ? `${params.paymentDate}T12:00:00Z` : c.paidAt,
              }
            : c
        )
      );

      // Inscription au journal d'audit immuable
      addAuditLog({
        actorId: 'usr-tres-01',
        actorName: params.actorName || 'Sofia Benjelloun',
        actorRole: params.actorRole || 'treasurer',
        actionType: 'payment_recorded',
        actionLabel: `Enregistrement de règlement #${receiptNumber}`,
        targetEntity: `Quittance #${receiptNumber} (Porte ${apt?.doorNumber || targetContribution.apartmentId})`,
        entityType: 'payment',
        oldValue: `Solde dû: ${targetContribution.balance.toLocaleString('fr-FR')} MAD`,
        newValue: `Encaissé: ${params.amount.toLocaleString('fr-FR')} MAD (${params.paymentMethod.toUpperCase()}) - Reste: ${newBalance.toLocaleString('fr-FR')} MAD`,
        details: `Règlement pour ${apt?.doorNumber} (${apt?.ownerName}) au titre de ${targetContribution.period}. Mode: ${params.paymentMethod}. Réf: ${params.reference}`,
        metadata: { receiptNumber, paymentId: newPayment.id, amount: params.amount },
      });
    }

    setPayments((prev) => [newPayment, ...prev]);

    addNotification({
      targetRole: 'all',
      title: `Quittance #${receiptNumber} émise`,
      message: `Règlement de ${params.amount.toLocaleString('fr-FR')} MAD validé pour le lot ${apt?.doorNumber || ''}.`,
      type: 'service',
    });

    return newPayment;
  };

  const issueCallForFunds = (params: {
    period: string;
    dueDate: string;
    amountPerM2OrFixed: number;
    calculationMode: 'fixed' | 'surface' | 'tantiemes';
    targetBlockId?: string;
    notes?: string;
    actorName?: string;
    actorRole?: UserRole;
  }): { count: number; totalAmount: number } => {
    const targetApts =
      params.targetBlockId && params.targetBlockId !== 'all'
        ? allApartments.filter((a) => a.blockId === params.targetBlockId)
        : allApartments;

    const newContributions: Contribution[] = [];
    let totalAmount = 0;

    targetApts.forEach((apt) => {
      let amountDue = 2400;
      if (params.calculationMode === 'surface') {
        amountDue = Math.round(apt.surfaceM2 * params.amountPerM2OrFixed);
      } else if (params.calculationMode === 'tantiemes') {
        amountDue = Math.round((apt.tantiemes || 200) * params.amountPerM2OrFixed);
      } else {
        amountDue = params.amountPerM2OrFixed;
      }

      totalAmount += amountDue;
      newContributions.push({
        id: `cnt-${apt.id}-${params.period.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        tenantId: 'tenant-pb-01',
        apartmentId: apt.id,
        blockId: apt.blockId,
        period: params.period,
        amountDue,
        amountPaid: 0,
        balance: amountDue,
        status: 'pending',
        tantiemes: apt.tantiemes,
        dueDate: params.dueDate,
        issuedAt: new Date().toISOString(),
        notes: params.notes,
      });
    });

    setContributions((prev) => [...newContributions, ...prev]);

    addAuditLog({
      actorId: 'usr-tres-01',
      actorName: params.actorName || 'Sofia Benjelloun',
      actorRole: params.actorRole || 'treasurer',
      actionType: 'call_funds_issued',
      actionLabel: `Émission d'appel de cotisations ${params.period}`,
      targetEntity: `Appel ${params.period} (${targetApts.length} lots)`,
      entityType: 'contribution',
      oldValue: 'Aucune ligne de cotisation enregistrée pour cette période',
      newValue: `${targetApts.length} débits générés - Total: ${totalAmount.toLocaleString('fr-FR')} MAD`,
      details: `Appel émis pour ${targetApts.length} lots (Échéance: ${params.dueDate}). Mode: ${params.calculationMode}.`,
      metadata: { period: params.period, count: targetApts.length, totalAmount },
    });

    addNotification({
      targetRole: 'all',
      title: `Appel de cotisations : ${params.period}`,
      message: `L'appel de charges ${params.period} est émis pour tous les lots. Date limite : ${params.dueDate}.`,
      type: 'service',
    });

    return { count: targetApts.length, totalAmount };
  };

  const getApartmentById = (aptId: string) => allApartments.find((a) => a.id === aptId);
  const getContributionsForApartment = (aptId: string) =>
    contributions.filter((c) => c.apartmentId === aptId);
  const getPaymentsForApartment = (aptId: string) =>
    payments.filter((p) => p.apartmentId === aptId);
  const getContributionsForBlock = (blockId: string) =>
    contributions.filter((c) => c.blockId === blockId);
  const getReceiptByNumber = (receiptNumber: string) =>
    payments.find((p) => p.receiptNumber === receiptNumber);

  const financialTotals = useMemo(() => {
    const totalCalled = contributions.reduce((sum, c) => sum + c.amountDue, 0);
    const totalPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalBalance = contributions.reduce((sum, c) => sum + c.balance, 0);
    const recoveryRatePercent =
      totalCalled > 0 ? Math.round((totalPaid / totalCalled) * 1000) / 10 : 100;

    return {
      totalCalled,
      totalPaid,
      totalBalance,
      recoveryRatePercent,
    };
  }, [contributions]);

  // -------------------------------------------------------------
  // GOUVERNANCE & DÉCISIONS (LOT 5)
  // -------------------------------------------------------------
  const addMeeting = (newMeeting: Meeting, actorName?: string, actorRole?: UserRole) => {
    setMeetings((prev) => [newMeeting, ...prev]);
    addAuditLog({
      actorId: actorName || 'usr-pres-01',
      actorName: actorName || 'Karim Alami',
      actorRole: actorRole || 'president',
      actionType: 'meeting_logged',
      actionLabel: 'Création / Enregistrement de Réunion',
      targetEntity: newMeeting.title,
      entityType: 'meeting',
      newValue: newMeeting.date,
      details: `Réunion "${newMeeting.title}" (${newMeeting.type}) enregistrée pour le ${newMeeting.date}.`,
    });
  };

  const addDecision = (
    decisionData: Omit<GovernanceDecision, 'id' | 'code'>,
    actorName: string,
    actorRole: UserRole
  ): GovernanceDecision => {
    const nextIndex = decisions.length + 1;
    const prefix = decisionData.meetingId?.includes('ag') ? 'RES-AG-26' : 'DEC-BUR-26';
    const code = `${prefix}-${String(nextIndex).padStart(2, '0')}`;
    const newDecision: GovernanceDecision = {
      ...decisionData,
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
    };

    setDecisions((prev) => [newDecision, ...prev]);

    // Alimentation automatique du journal d'audit (Lot 4 / Lot 5)
    addAuditLog({
      actorId: actorName,
      actorName,
      actorRole,
      actionType: 'decision_created',
      actionLabel: 'Adoption d’une Résolution / Décision',
      targetEntity: `${code} - ${newDecision.title}`,
      entityType: 'decision',
      newValue: newDecision.status,
      details: `Résolution ${code} adoptée. Responsable désigné: ${newDecision.assignedName}. Échéance: ${newDecision.dueDate}. Budget alloué: ${newDecision.budgetMAD ? `${newDecision.budgetMAD.toLocaleString('fr-FR')} MAD` : 'N/A'}.`,
    });

    return newDecision;
  };

  const completeDecision = (
    decisionId: string,
    notes: string,
    completedBy: string,
    completedRole: UserRole
  ) => {
    const target = decisions.find((d) => d.id === decisionId);
    const nowIso = new Date().toISOString();

    setDecisions((prev) =>
      prev.map((d) =>
        d.id === decisionId
          ? {
              ...d,
              status: 'done',
              completedAt: nowIso,
              completedBy,
              completionNotes: notes,
            }
          : d
      )
    );

    // Alimentation automatique du journal d'audit immuable
    addAuditLog({
      actorId: completedBy,
      actorName: completedBy,
      actorRole: completedRole,
      actionType: 'decision_completed',
      actionLabel: 'Action Gouvernance Réalisée',
      targetEntity: target ? `${target.code} - ${target.title}` : decisionId,
      entityType: 'decision',
      oldValue: target?.status || 'in_progress',
      newValue: 'done',
      details: `Action validée réalisée par ${completedBy}. Compte-rendu : "${notes}".`,
    });
  };

  const updateDecisionStatus = (
    decisionId: string,
    status: DecisionStatus,
    actorName: string,
    actorRole: UserRole
  ) => {
    const target = decisions.find((d) => d.id === decisionId);
    setDecisions((prev) =>
      prev.map((d) => (d.id === decisionId ? { ...d, status } : d))
    );

    addAuditLog({
      actorId: actorName,
      actorName,
      actorRole,
      actionType: 'decision_created',
      actionLabel: 'Modification Statut Décision',
      targetEntity: target ? `${target.code} - ${target.title}` : decisionId,
      entityType: 'decision',
      oldValue: target?.status,
      newValue: status,
      details: `Statut de la décision ${target?.code} mis à jour à "${status}".`,
    });
  };

  const getDecisionsForBlock = (blockId?: string, blockCode?: string): GovernanceDecision[] => {
    if (!blockId && !blockCode) return decisions;
    const codeUpper = blockCode?.toUpperCase();
    return decisions.filter((d) => {
      if (d.targetBlockId === 'all' || d.targetBlockCode === 'ALL') return true;
      if (codeUpper && d.targetBlockCode === codeUpper) return true;
      if (blockId && d.targetBlockId === blockId) return true;
      if (codeUpper && d.assignedBlockCode === codeUpper) return true;
      return false;
    });
  };

  const getPublicDecisions = (): GovernanceDecision[] => {
    return decisions.filter((d) => d.isPublic);
  };

  // -------------------------------------------------------------
  // COMMUNICATION & ANNONCES CIBLÉES (LOT 5)
  // -------------------------------------------------------------
  const addAnnouncement = (
    announcementData: Omit<Announcement, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: UserRole
  ): Announcement => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    // Notification in-app automatique
    addNotification({
      title: `${newAnnouncement.priority === 'urgent' ? '🚨 [URGENT] ' : newAnnouncement.priority === 'works' ? '🚧 [TRAVAUX] ' : '📢 '}${newAnnouncement.title}`,
      message: newAnnouncement.content.substring(0, 140) + '...',
      type: newAnnouncement.priority === 'urgent' ? 'urgent_alert' : 'system',
      targetBlockId: newAnnouncement.targetBlockId,
      targetRole: 'all',
    });

    // Journal d'audit
    addAuditLog({
      actorId: actorName,
      actorName,
      actorRole,
      actionType: 'announcement_published',
      actionLabel: 'Publication Annonce Officielle',
      targetEntity: newAnnouncement.title,
      entityType: 'announcement',
      newValue: newAnnouncement.scope,
      details: `Annonce "${newAnnouncement.title}" publiée [Portée: ${newAnnouncement.scope.toUpperCase()}${newAnnouncement.targetBlockCode ? ` - Bloc ${newAnnouncement.targetBlockCode}` : ''}] Priorité: ${newAnnouncement.priority}.`,
    });

    return newAnnouncement;
  };

  const markAnnouncementAsRead = (id: string) => {
    setReadAnnouncementIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAnnouncementsAsRead = () => {
    const allIds = announcements.map((a) => a.id);
    setReadAnnouncementIds(allIds);
  };

  const getAnnouncementsForUser = (
    role: UserRole,
    blockId?: string,
    blockCode?: string
  ): Announcement[] => {
    // Président et Trésorier voient l'ensemble des annonces (globales et tous blocs)
    if (role === 'president' || role === 'treasurer') {
      return announcements;
    }

    // Étanchéité stricte pour les Représentants et Résidents :
    // Visibles : Annonces à portée 'residence'
    // ET UNIQUEMENT les annonces à portée 'block' correspondant au bloc de l'utilisateur
    const targetCode = blockCode || (blockId ? blockId.replace('block-', '').toUpperCase() : 'H');
    const targetId = blockId || `block-${targetCode.toLowerCase()}`;

    return announcements.filter((a) => {
      if (a.scope === 'residence') return true;
      if (a.scope === 'block') {
        if (a.targetBlockCode && a.targetBlockCode === targetCode) return true;
        if (a.targetBlockId && a.targetBlockId === targetId) return true;
        return false;
      }
      return false;
    });
  };

  const unreadAnnouncementsCountForUser = (
    role: UserRole,
    blockId?: string,
    blockCode?: string
  ): number => {
    const visible = getAnnouncementsForUser(role, blockId, blockCode);
    return visible.filter((a) => !readAnnouncementIds.includes(a.id)).length;
  };

  const blocksSummaries = useMemo(() => {
    return blocks.map((b) => getBlockStatusSummary(b.id)!).filter(Boolean);
  }, [blocks, pools, complaints, commonLighting, representatives]);

  return (
    <ResidenceContext.Provider
      value={{
        blocks,
        pools,
        complaints,
        commonLighting,
        representatives,
        apartmentsBlockH,
        allApartments,
        contributions,
        payments,
        auditLogs,
        recordPayment,
        issueCallForFunds,
        addAuditLog,
        getApartmentById,
        getContributionsForApartment,
        getPaymentsForApartment,
        getContributionsForBlock,
        getReceiptByNumber,
        financialTotals,
        servicePassages,
        notifications,
        unreadNotificationsCount,
        updatePool,
        recordPoolMaintenance,
        toggleCommonLighting,
        addComplaint,
        updateComplaintStatus,
        validateServicePassage,
        addServicePassage,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        meetings,
        decisions,
        officialDocs,
        addMeeting,
        addDecision,
        completeDecision,
        updateDecisionStatus,
        getDecisionsForBlock,
        getPublicDecisions,
        announcements,
        readAnnouncementIds,
        addAnnouncement,
        markAnnouncementAsRead,
        markAllAnnouncementsAsRead,
        getAnnouncementsForUser,
        unreadAnnouncementsCountForUser,
        totalBlocksCount,
        totalApartmentsCount,
        totalPoolsCount,
        operationalPoolsCount,
        maintenancePoolsCount,
        closedPoolsCount,
        operationalRatePercent,
        defectivePoolLightingCount,
        defectiveCommonLightingCount,
        totalLightingDefectsCount,
        totalActiveAlertsCount,
        openComplaintsCount,
        urgentComplaintsCount,
        pendingServicesValidationCount,
        getBlockById,
        getBlockByCode,
        getPoolsForBlock,
        getCommonLightingForBlock,
        getRepresentativeForBlock,
        getComplaintsForBlock,
        getServicePassagesForBlock,
        getBlockStatusSummary,
        blocksSummaries,
      }}
    >
      {children}
    </ResidenceContext.Provider>
  );
};

export const useResidence = (): ResidenceContextType => {
  const context = useContext(ResidenceContext);
  if (!context) {
    throw new Error('useResidence doit être utilisé à l’intérieur d’un ResidenceProvider');
  }
  return context;
};
