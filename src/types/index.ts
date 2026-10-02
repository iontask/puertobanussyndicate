export type BlockCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | string;

export type ResidentType = 'owner' | 'tenant';

export type PoolType = 'adult' | 'child';

export type PoolStatus = 'operational' | 'maintenance' | 'closed';

export type LightingStatus = 'working' | 'defective';

export type UserRole = 'president' | 'treasurer' | 'block_rep' | 'resident' | 'provider' | 'super_admin';

export type ComplaintStatus =
  | 'new'
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintScope = 'private' | 'common';

export type ComplaintZoneType =
  | 'private_lot'
  | 'block_stairwell'
  | 'block_pool_adult'
  | 'block_pool_child'
  | 'block_garden'
  | 'general_security'
  | 'other';

export type ComplaintCategory =
  | 'pool'
  | 'lighting'
  | 'plumbing'
  | 'elevator'
  | 'noise'
  | 'cleanliness'
  | 'gardening'
  | 'security'
  | 'other';

export type ContributionStatus = 'paid' | 'partial' | 'pending' | 'overdue';

/**
 * 1. Tenant (Résidence gérée)
 */
export interface Tenant {
  id: string;
  name: string;
  code: string;
  currency: string;
  createdAt: string;
  address?: string;
  city?: string;
  totalBlocks?: number;
  totalPools?: number;
  totalApartments?: number;
  status?: 'active' | 'trial' | 'maintenance';
  themeColor?: string;
  logoUrl?: string;
}

/**
 * 2. Block (Bâtiment de la résidence)
 */
export interface Block {
  id: string;
  tenantId: string;
  code: BlockCode;
  name: string;
  representativeUserId: string;
  apartmentCount: number;
  totalApartments?: number;
  floorsCount?: number;
}

/**
 * 3. Apartment (Lot / Logement)
 */
export interface Apartment {
  id: string;
  tenantId: string;
  blockId: string;
  doorNumber: string;
  floor: number;
  ownerName: string;
  residentName: string;
  residentType: ResidentType;
  surfaceM2?: number;
  tantiemes?: number;
  contactPhone?: string;
  contactEmail?: string;
}

/**
 * 4. Pool (Piscine - 2 par bloc : adulte & enfant)
 */
export interface Pool {
  id: string;
  tenantId: string;
  blockId: string;
  type: PoolType;
  poolType?: PoolType;
  name?: string;
  volumeM3?: number;
  status: PoolStatus;
  lightingStatus: LightingStatus;
  lastCleanedAt: string;
  waterTemperatureC?: number;
  phLevel?: number;
  chlorinePpm?: number;
}

/**
 * 5. User (Utilisateur multi-rôle du système)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  assignedBlockId?: string;
  assignedBlockCode?: BlockCode;
  assignedApartmentId?: string;
  phone?: string;
  title?: string;
}

/**
 * 6. TicketActivityLog (Fil d'activité d'un ticket)
 */
export interface TicketActivityLog {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: UserRole;
  action: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  notes?: string;
}

/**
 * 6. Complaint (Ticket de réclamation / incident)
 */
export interface Complaint {
  id: string;
  tenantId: string;
  ticketNumber?: string;
  title: string;
  description: string;
  category: ComplaintCategory | string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  scope?: ComplaintScope;
  zoneType?: ComplaintZoneType;
  equipmentId?: string; // id d'une piscine (ex: pool-h-adult) ou d'un éclairage (ex: lighting-h-stairs-1)
  blockId: string;
  apartmentId?: string;
  doorNumber?: string;
  createdAt: string;
  authorUserId?: string;
  authorName?: string;
  authorRole?: UserRole;
  assignedTo?: string; // Nom de l'entreprise prestataire
  assignedTechnician?: string; // Nom du technicien mandaté
  scheduledDate?: string; // Date planifiée d'intervention
  estimatedCost?: number; // Devis / Estimation en MAD
  actualCost?: number; // Coût facturé en MAD
  interventionReport?: string; // Rapport / Compte-rendu de fin d'intervention
  photos?: string[]; // URLs ou aperçus simulés de photos jointes
  activityLogs?: TicketActivityLog[];
  resolvedAt?: string;
  closedAt?: string;
}

/**
 * Recurring Services (Ménage, Jardinage, Sécurité)
 */
export type RecurringServiceTrade = 'cleaning' | 'gardening' | 'security';

export type ServicePassageStatus =
  | 'scheduled'
  | 'completed_pending_validation'
  | 'validated'
  | 'incident_reported';

export interface ServicePassageLog {
  id: string;
  trade: RecurringServiceTrade;
  blockId: string; // 'block-a' .. 'block-i' ou 'all'
  providerName: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00 - 10:30"
  title: string;
  description: string;
  tasksDone: string[];
  poolSurroundingsChecked?: boolean;
  stairwellsChecked?: boolean;
  greenAreasTreated?: boolean;
  securityRoundCount?: number;
  anomaliesNoted?: string[];
  status: ServicePassageStatus;
  validationComment?: string;
  validatedBy?: string; // Nom du représentant ou syndic
  validatedAt?: string;
  reportedIncidentComplaintId?: string;
}

export interface InAppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'all';
  targetBlockId?: string;
  title: string;
  message: string;
  type:
    | 'status_change'
    | 'new_ticket'
    | 'service_validation'
    | 'urgent_alert'
    | 'complaint'
    | 'service'
    | 'pool'
    | 'system';
  relatedComplaintId?: string;
  createdAt: string;
  read: boolean;
  isRead?: boolean;
}

/**
 * 7. Contribution (Cotisation de charges syndicales)
 */
export interface Contribution {
  id: string;
  tenantId: string;
  apartmentId: string;
  blockId?: string;
  period: string; // e.g. "T1 2026", "T2 2026", "T3 2026", "T4 2026"
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: ContributionStatus;
  tantiemes?: number;
  dueDate?: string;
  issuedAt?: string;
  paidAt?: string;
  notes?: string;
}

export type PaymentMethod = 'transfer' | 'check' | 'cash';

export interface PaymentTransaction {
  id: string;
  receiptNumber: string; // Unique, e.g. "REC-PB-2026-0042"
  tenantId: string;
  contributionId: string;
  apartmentId: string;
  blockId: string;
  doorNumber: string;
  residentOrOwnerName: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  reference: string; // Virement ref, numéro chèque ou bordereau
  recordedBy: string;
  recordedByRole: UserRole;
  createdAt: string;
  notes?: string;
}

export type AuditActionType =
  | 'call_funds_issued'
  | 'payment_recorded'
  | 'manual_amount_adjusted'
  | 'role_changed'
  | 'service_validated'
  | 'complaint_status_changed'
  | 'pool_maintenance_logged'
  | 'entity_deleted'
  | 'decision_created'
  | 'decision_completed'
  | 'announcement_published'
  | 'meeting_logged';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: AuditActionType;
  actionLabel: string;
  targetEntity: string;
  entityType: 'payment' | 'contribution' | 'complaint' | 'service' | 'user' | 'pool' | 'decision' | 'announcement' | 'meeting' | 'document';
  oldValue?: string;
  newValue?: string;
  details: string;
  metadata?: Record<string, any>;
}

/**
 * 8. CommonLightingItem (Éclairage des parties communes par bloc)
 */
export interface CommonLightingItem {
  id: string;
  blockId: string;
  zone: 'stairwells' | 'pool_surroundings' | 'hallways' | 'outdoor_paths';
  label: string;
  location?: string;
  workingBulbs?: number;
  totalBulbs?: number;
  status: LightingStatus;
  defectReportedAt?: string;
  notes?: string;
}

/**
 * 9. BlockRepresentativeInfo (Informations du représentant de bloc)
 */
export interface BlockRepresentativeInfo {
  userId: string;
  name: string;
  blockCode: BlockCode;
  email: string;
  phone: string;
  mandatePeriod: string;
  isAssignedUser?: boolean;
}

/**
 * 10. Governance & Decisions (Lot 5)
 */
export type MeetingType = 'ag_ordinary' | 'ag_extraordinary' | 'board_meeting' | 'bureau';

export interface MeetingParticipant {
  name: string;
  role: string;
  roleLabel?: string;
  blockCode?: string;
  present: boolean;
  avatarUrl?: string;
}

export interface MeetingDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  type: 'pv' | 'convocation' | 'budget' | 'resolution' | 'rules';
  date: string;
  downloadUrl?: string;
  description?: string;
}

export interface Meeting {
  id: string;
  tenantId: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "18:00 - 20:30"
  location: string;
  quorumPercent?: number;
  quorumPercentage?: number;
  agenda: string[];
  participants: MeetingParticipant[];
  summary?: string;
  minutesText?: string;
  pvDocument?: MeetingDocument;
  documents: MeetingDocument[];
  isPublicToResidents: boolean;
  status: 'held' | 'scheduled';
}

export type DecisionStatus = 'to_do' | 'in_progress' | 'done' | 'overdue';

export interface GovernanceDecision {
  id: string;
  tenantId: string;
  code: string; // e.g. "DEC-2026-01", "RES-AG-04"
  title: string;
  description: string;
  adoptionDate: string; // YYYY-MM-DD
  meetingId?: string;
  meetingTitle?: string;
  targetBlockId?: string; // 'all' or 'block-a'..'block-i'
  targetBlockCode?: BlockCode | 'ALL';
  assignedName: string; // e.g. "Représentant Bloc C (Rachid Filali)", "Trésorière (Laila Bennani)"
  assignedRole: 'president' | 'treasurer' | 'block_rep' | 'provider' | string;
  assignedBlockCode?: BlockCode;
  dueDate: string; // YYYY-MM-DD
  status: DecisionStatus;
  budgetMAD?: number;
  isPublic: boolean;
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;
}

/**
 * 11. Announcements & Targeted Communication (Lot 5)
 */
export type AnnouncementScope = 'residence' | 'block';
export type AnnouncementPriority = 'info' | 'urgent' | 'works';

export interface AnnouncementAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image';
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  scope: AnnouncementScope;
  targetBlockId?: string; // 'block-a'..'block-i'
  targetBlockCode?: BlockCode;
  priority: AnnouncementPriority;
  authorId?: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  expiresAt?: string;
  attachment?: AnnouncementAttachment;
  attachmentName?: string;
  attachmentUrl?: string;
  isPinned?: boolean;
}

/**
 * Navigation and UI View types
 */
export type ViewKey =
  | 'dashboard'
  | 'blocks'
  | 'pools'
  | 'finances'
  | 'complaints'
  | 'services'
  | 'governance'
  | 'announcements'
  | 'audit'
  | 'reports'
  | 'my_block'
  | 'my_apartment'
  | 'my_finances'
  | 'my_facilities'
  | 'my_documents'
  | 'platform'
  | 'onboarding';

export interface NavigationItem {
  id: ViewKey;
  label: string;
  iconName: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'danger' | 'success';
  allowedRoles: UserRole[];
}

/**
 * Offline Sync Types (PWA & Field Operations)
 */
export type OfflineActionType = 'pool_check' | 'service_passage' | 'complaint';

export interface OfflineSyncAction {
  id: string;
  type: OfflineActionType;
  timestamp: string;
  tenantId: string;
  authorName: string;
  authorRole: UserRole;
  data: Record<string, any>;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  retryCount?: number;
}

/**
 * Multichannel Notifications (Email, SMS, WhatsApp, In-App)
 */
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export type NotificationEventType =
  | 'overdue_fee'
  | 'urgent_block_alert'
  | 'ticket_resolved'
  | 'announcement_general';

export interface NotificationPreference {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  inAppEnabled: boolean;
  verifiedEmail?: string;
  verifiedPhone?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  channelsByEvent: Record<NotificationEventType, NotificationChannel[]>;
}

export interface NotificationLogEntry {
  id: string;
  timestamp: string;
  tenantId: string;
  recipientName: string;
  recipientContact: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  subject?: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  providerMessageId?: string;
  language: 'fr' | 'ar' | 'en';
}

/**
 * SaaS Platform & Onboarding Types
 */
export interface PlatformGlobalMetrics {
  totalTenants: number;
  activeTenants: number;
  totalApartments: number;
  totalBlocks: number;
  totalPools: number;
  totalComplaintsResolved: number;
  platformUptimePercent: number;
  averageResponseTimeMs: number;
  lastBackupAt: string;
  securityHealthScore: number;
}

export interface OnboardingTenantData {
  // Step 1: Identity
  name: string;
  code: string;
  city: string;
  currency: string;
  address: string;
  surfaceM2: number;
  themeColor: string;
  logoUrl?: string;

  // Step 2: Spatial Topology
  blockNamingMode: 'alpha' | 'custom';
  blockCount: number;
  floorsPerBlock: number;
  doorsPerFloor: number;
  customBlockNames?: string[];

  // Step 3: Equipment & Technical zones
  poolsPerBlock: number;
  hasChildPools: boolean;
  poolWaterTreatment: 'chlorine' | 'salt' | 'bromine';
  hasElevators: boolean;
  hasSurpressorPump: boolean;
  hasLedCommonLighting: boolean;

  // Step 4: Governance & Quotas
  presidentName: string;
  presidentEmail: string;
  presidentPhone: string;
  treasurerName: string;
  treasurerEmail: string;
  treasurerPhone: string;
  feeCalculationMode: 'fixed' | 'tantiemes' | 'surface';
  defaultFeeAmount: number;
  billingCycle: 'monthly' | 'quarterly';
  dueDayOfMonth: number;
}

