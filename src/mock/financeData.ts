import {
  Apartment,
  Contribution,
  PaymentTransaction,
  AuditLogItem,
  BlockCode,
} from '../types';

const moroccanSurnames = [
  'Berrada', 'Tazi', 'Benjelloun', 'Alami', 'El Fassi', 'Kabbaj', 'Chraibi', 'Guessous',
  'Filali', 'Lahlou', 'Sqalli', 'Amrani', 'Idrissi', 'Bennis', 'Slaoui', 'Bensouda',
  'Mekouar', 'Sebti', 'Kadiri', 'Bouzoubaa', 'Belkahia', 'Tahiri', 'Cherkaoui', 'Mansouri',
  'Hammoudi', 'Dakhil', 'Zouiten', 'Naciri', 'Rochdi', 'El Amri', 'Hassani', 'Senoussi',
  'Ghellab', 'Lamrani', 'Benkirane', 'Daoudi', 'Oukacha', 'Lazrak', 'Benslimane'
];

const firstNames = [
  'Youssef', 'Mehdi', 'Omar', 'Karim', 'Amine', 'Leila', 'Sofia', 'Fatima', 'Nadia',
  'Ghita', 'Kenzo', 'Hamza', 'Saad', 'Reda', 'Zineb', 'Salma', 'Meryem', 'Iliass',
  'Tariq', 'Sanaa', 'Hicham', 'Adil', 'Houda', 'Imane', 'Asmaa', 'Driss', 'Nabil',
  'Kenza', 'Yassine', 'Malak', 'Badr', 'Othmane', 'Nisrine', 'Walid', 'Hajar'
];

export const blockAptCounts: Record<BlockCode, number> = {
  A: 48,
  B: 52,
  C: 60,
  D: 56,
  E: 64,
  F: 50,
  G: 58,
  H: 76,
  I: 44,
};

/**
 * Génère l'ensemble des appartements des 9 blocs de la résidence Puerto Banus
 */
export function generateAllResidenceApartments(): Apartment[] {
  const allApts: Apartment[] = [];
  const blockCodes: BlockCode[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  blockCodes.forEach((code, blockIdx) => {
    const count = blockAptCounts[code];
    const blockId = `block-${code.toLowerCase()}`;

    for (let i = 1; i <= count; i++) {
      const doorNumber = `${code}-${i < 10 ? '0' + i : i}`;
      const aptId = `apt-${code.toLowerCase()}-${i}`;
      const floor = Math.floor((i - 1) / Math.ceil(count / 4));
      const surname = moroccanSurnames[(blockIdx * 7 + i * 3) % moroccanSurnames.length];
      const firstName = firstNames[(blockIdx * 5 + i * 2) % firstNames.length];
      const surfaceM2 = 80 + ((i + blockIdx) % 6) * 12; // 80 à 140 m²
      const tantiemes = Math.round(surfaceM2 * 1.8); // Quote-part approximative

      // Cas particulier copropriétaire connecté de test : H-12
      if (code === 'H' && i === 12) {
        allApts.push({
          id: 'apt-h-12',
          tenantId: 'tenant-pb-01',
          blockId: 'block-h',
          doorNumber: 'H-12',
          floor: 1,
          ownerName: 'M. & Mme Youssef Tazi',
          residentName: 'Youssef Tazi',
          residentType: 'owner',
          surfaceM2: 118,
          tantiemes: 215,
          contactPhone: '+212 6 61 45 89 20',
        });
        continue;
      }

      const isRented = (i + blockIdx) % 4 === 0;
      const residentType = isRented ? 'tenant' : 'owner';
      const ownerName = `M. & Mme ${firstName} ${surname}`;
      const residentName = isRented
        ? `${firstNames[(i * 3 + 1) % firstNames.length]} ${moroccanSurnames[(i * 2 + 5) % moroccanSurnames.length]}`
        : `${firstName} ${surname}`;

      allApts.push({
        id: aptId,
        tenantId: 'tenant-pb-01',
        blockId,
        doorNumber,
        floor,
        ownerName,
        residentName,
        residentType,
        surfaceM2,
        tantiemes,
        contactPhone: `+212 6 ${60 + ((i + blockIdx) % 9)} ${10 + (i % 85)} ${20 + (i % 75)}`,
      });
    }
  });

  return allApts;
}

export const allResidenceApartments = generateAllResidenceApartments();

/**
 * Génération de cotisations pour les périodes T1 2026, T2 2026, T3 2026, T4 2026
 */
export function generateInitialContributions(apartments: Apartment[]): Contribution[] {
  const contributions: Contribution[] = [];

  apartments.forEach((apt) => {
    const baseQuarterly = Math.round(apt.surfaceM2 * 20); // ex: 100m² -> 2000 MAD
    const seed = parseInt(apt.id.replace(/\D/g, '') || '1', 10);
    const blockLetter = apt.doorNumber.charAt(0);

    // 1. T1 2026 (Échéance 15/01/2026) - presque 98% soldé
    const isT1Unpaid = (seed + blockLetter.charCodeAt(0)) % 45 === 0;
    const t1Paid = isT1Unpaid ? 0 : baseQuarterly;
    contributions.push({
      id: `cnt-${apt.id}-2026-t1`,
      tenantId: 'tenant-pb-01',
      apartmentId: apt.id,
      blockId: apt.blockId,
      period: 'T1 2026',
      amountDue: baseQuarterly,
      amountPaid: t1Paid,
      balance: baseQuarterly - t1Paid,
      status: isT1Unpaid ? 'overdue' : 'paid',
      tantiemes: apt.tantiemes,
      dueDate: '2026-01-15',
      issuedAt: '2025-12-20T08:00:00Z',
      paidAt: isT1Unpaid ? undefined : '2026-01-10T11:00:00Z',
    });

    // 2. T2 2026 (Échéance 15/04/2026) - 93% soldé
    const isT2Overdue = (seed * 3 + blockLetter.charCodeAt(0)) % 25 === 0;
    const isT2Partial = !isT2Overdue && (seed % 17 === 0);
    let t2Paid = baseQuarterly;
    let t2Status: 'paid' | 'partial' | 'overdue' = 'paid';
    if (isT2Overdue) {
      t2Paid = 0;
      t2Status = 'overdue';
    } else if (isT2Partial) {
      t2Paid = Math.round(baseQuarterly / 2);
      t2Status = 'partial';
    }
    contributions.push({
      id: `cnt-${apt.id}-2026-t2`,
      tenantId: 'tenant-pb-01',
      apartmentId: apt.id,
      blockId: apt.blockId,
      period: 'T2 2026',
      amountDue: baseQuarterly,
      amountPaid: t2Paid,
      balance: baseQuarterly - t2Paid,
      status: t2Status,
      tantiemes: apt.tantiemes,
      dueDate: '2026-04-15',
      issuedAt: '2026-03-20T08:00:00Z',
      paidAt: t2Paid > 0 ? '2026-04-09T14:20:00Z' : undefined,
    });

    // 3. T3 2026 (Échéance 15/07/2026) - période actuelle
    // Cas spécifique H-12 : Youssef Tazi a payé intégralement 2 400 MAD le 08/07/2026
    let t3Paid = baseQuarterly;
    let t3Status: 'paid' | 'partial' | 'overdue' = 'paid';
    let t3PaidDate: string | undefined = '2026-07-08T10:30:00Z';

    if (apt.id === 'apt-h-12') {
      t3Paid = 2400;
      t3Status = 'paid';
      t3PaidDate = '2026-07-08T10:30:00Z';
    } else if (apt.id === 'apt-h-2') {
      t3Paid = 1100;
      t3Status = 'partial';
      t3PaidDate = '2026-07-12T09:15:00Z';
    } else if (apt.id === 'apt-h-4') {
      t3Paid = 0;
      t3Status = 'overdue';
      t3PaidDate = undefined;
    } else {
      const mod = (seed * 7 + blockLetter.charCodeAt(0)) % 10;
      if (mod === 0 || mod === 1) {
        // En retard
        t3Paid = 0;
        t3Status = 'overdue';
        t3PaidDate = undefined;
      } else if (mod === 2) {
        // Partiel
        t3Paid = Math.round(baseQuarterly * 0.5);
        t3Status = 'partial';
        t3PaidDate = '2026-07-14T16:00:00Z';
      } else {
        t3Paid = baseQuarterly;
        t3Status = 'paid';
        t3PaidDate = '2026-07-10T12:00:00Z';
      }
    }

    contributions.push({
      id: `cnt-${apt.id}-2026-t3`,
      tenantId: 'tenant-pb-01',
      apartmentId: apt.id,
      blockId: apt.blockId,
      period: 'T3 2026',
      amountDue: apt.id === 'apt-h-12' ? 2400 : baseQuarterly,
      amountPaid: t3Paid,
      balance: (apt.id === 'apt-h-12' ? 2400 : baseQuarterly) - t3Paid,
      status: t3Status,
      tantiemes: apt.tantiemes,
      dueDate: '2026-07-15',
      issuedAt: '2026-06-20T08:00:00Z',
      paidAt: t3PaidDate,
    });

    // 4. T4 2026 (Échéance 15/10/2026) - Appel récent, majorité en attente
    // Pour H-12 : 2 400 MAD en attente
    let t4Paid = 0;
    let t4Status: 'pending' | 'paid' | 'partial' = 'pending';
    let t4PaidDate: string | undefined = undefined;

    if (apt.id === 'apt-h-12') {
      t4Paid = 0;
      t4Status = 'pending';
    } else if (seed % 9 === 0) {
      // Quelques paiements anticipés
      t4Paid = baseQuarterly;
      t4Status = 'paid';
      t4PaidDate = '2026-09-12T15:00:00Z';
    }

    contributions.push({
      id: `cnt-${apt.id}-2026-t4`,
      tenantId: 'tenant-pb-01',
      apartmentId: apt.id,
      blockId: apt.blockId,
      period: 'T4 2026',
      amountDue: apt.id === 'apt-h-12' ? 2400 : baseQuarterly,
      amountPaid: t4Paid,
      balance: (apt.id === 'apt-h-12' ? 2400 : baseQuarterly) - t4Paid,
      status: t4Status,
      tantiemes: apt.tantiemes,
      dueDate: '2026-10-15',
      issuedAt: '2026-09-01T08:00:00Z',
      paidAt: t4PaidDate,
    });
  });

  return contributions;
}

export const initialContributions = generateInitialContributions(allResidenceApartments);

/**
 * Génère les transactions de règlement (Paiements & Quittances)
 */
export function generateInitialPayments(contributions: Contribution[], apartments: Apartment[]): PaymentTransaction[] {
  const payments: PaymentTransaction[] = [];
  const aptMap = new Map<string, Apartment>();
  apartments.forEach((a) => aptMap.set(a.id, a));

  let receiptSeq = 100;

  // Filtrer les cotisations ayant un montant réglé
  const paidContributions = contributions.filter((c) => c.amountPaid > 0);

  paidContributions.forEach((c) => {
    const apt = aptMap.get(c.apartmentId);
    if (!apt) return;

    receiptSeq++;
    const receiptNumber = `REC-PB-2026-${receiptSeq.toString().padStart(4, '0')}`;
    const paymentMethod = receiptSeq % 3 === 0 ? 'check' : receiptSeq % 4 === 0 ? 'cash' : 'transfer';

    let reference = `VIR-BMCE-${receiptSeq * 13 + 450}`;
    if (paymentMethod === 'check') {
      reference = `CHQ-SG-${receiptSeq * 21 + 1000}`;
    } else if (paymentMethod === 'cash') {
      reference = `ESP-BORD-${receiptSeq * 7 + 300}`;
    }

    // Quittance spécifique demandée pour H-12 (Youssef Tazi)
    if (apt.id === 'apt-h-12' && c.period === 'T3 2026') {
      payments.push({
        id: `pay-h12-t3`,
        receiptNumber: 'REC-PB-2026-0012',
        tenantId: 'tenant-pb-01',
        contributionId: c.id,
        apartmentId: apt.id,
        blockId: apt.blockId,
        doorNumber: apt.doorNumber,
        residentOrOwnerName: apt.ownerName,
        amount: c.amountPaid,
        paymentDate: '2026-07-08',
        paymentMethod: 'transfer',
        reference: 'VIR-BMCE-940217',
        recordedBy: 'Sofia Benjelloun',
        recordedByRole: 'treasurer',
        createdAt: '2026-07-08T10:30:00Z',
        notes: 'Règlement par virement bancaire compte BMCE Résidence Puerto Banus.',
      });
      return;
    }

    payments.push({
      id: `pay-${c.id}`,
      receiptNumber,
      tenantId: 'tenant-pb-01',
      contributionId: c.id,
      apartmentId: apt.id,
      blockId: apt.blockId,
      doorNumber: apt.doorNumber,
      residentOrOwnerName: apt.ownerName,
      amount: c.amountPaid,
      paymentDate: c.paidAt ? c.paidAt.split('T')[0] : '2026-07-10',
      paymentMethod,
      reference,
      recordedBy: 'Sofia Benjelloun',
      recordedByRole: 'treasurer',
      createdAt: c.paidAt || '2026-07-10T12:00:00Z',
      notes: `Règlement cotisation syndicale ${c.period}`,
    });
  });

  return payments;
}

export const initialPayments = generateInitialPayments(initialContributions, allResidenceApartments);

/**
 * Journal d'Audit Immuable initial
 */
export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'log-audit-01',
    timestamp: '2026-09-16T11:45:00Z',
    actorId: 'usr-tres-01',
    actorName: 'Sofia Benjelloun',
    actorRole: 'treasurer',
    actionType: 'payment_recorded',
    actionLabel: 'Enregistrement de règlement #REC-PB-2026-0158',
    targetEntity: 'Quittance #REC-PB-2026-0158 (Porte H-03)',
    entityType: 'payment',
    oldValue: 'Solde dû: 2 400 MAD (Statut: En attente)',
    newValue: 'Encaissé: 2 400 MAD (Virement BMCE) - Solde: 0 MAD (Statut: Réglé)',
    details: 'Enregistrement du virement bancaire pour M. & Mme Kenzo Benjelloun (Lot H-03, T3 2026). Réf: VIR-BMCE-89412.',
  },
  {
    id: 'log-audit-02',
    timestamp: '2026-09-16T10:20:00Z',
    actorId: 'usr-pres-01',
    actorName: 'Karim Alami',
    actorRole: 'president',
    actionType: 'complaint_status_changed',
    actionLabel: 'Affectation prestataire & devis #cmp-01',
    targetEntity: 'Ticket #cmp-01 (Éclairage Bassin Bloc H)',
    entityType: 'complaint',
    oldValue: 'Statut: En attente (Non assigné)',
    newValue: 'Statut: En intervention (Prestataire: LuminaTech - Devis: 1 450 MAD)',
    details: 'Validation de l’intervention technique et bon de commande pour remplacement transformateur 12V.',
  },
  {
    id: 'log-audit-03',
    timestamp: '2026-09-15T16:30:00Z',
    actorId: 'usr-rep-h',
    actorName: 'Omar Berrada',
    actorRole: 'block_rep',
    actionType: 'service_validated',
    actionLabel: 'Validation émargement de passage Ménage Bloc H',
    targetEntity: 'Passage CleanNet #srv-pass-clean-01',
    entityType: 'service',
    oldValue: 'Statut: En attente de validation',
    newValue: 'Statut: Validé conforme avec signature terrain',
    details: 'Contrôle effectué : 4 niveaux vérifiés, coursives et abords des 2 bassins propres.',
  },
  {
    id: 'log-audit-04',
    timestamp: '2026-09-01T08:30:00Z',
    actorId: 'usr-tres-01',
    actorName: 'Sofia Benjelloun',
    actorRole: 'treasurer',
    actionType: 'call_funds_issued',
    actionLabel: 'Émission de l’appel de cotisations T4 2026',
    targetEntity: 'Appel Général T4 2026 (508 Lots)',
    entityType: 'contribution',
    oldValue: 'Aucune ligne de débit T4',
    newValue: '508 débits générés - Montant global: 1 124 000 MAD',
    details: 'Génération automatique des appels de fonds trimestriels pour les 9 blocs A à I selon la grille des tantièmes.',
  },
  {
    id: 'log-audit-05',
    timestamp: '2026-08-28T14:10:00Z',
    actorId: 'usr-tres-01',
    actorName: 'Sofia Benjelloun',
    actorRole: 'treasurer',
    actionType: 'manual_amount_adjusted',
    actionLabel: 'Ajustement d’avoir pour réfection infiltration Lot C-18',
    targetEntity: 'Cotisation #cnt-apt-c-18-2026-t3',
    entityType: 'contribution',
    oldValue: 'Montant dû initial: 2 600 MAD',
    newValue: 'Montant dû rectifié: 2 100 MAD (Avoir de 500 MAD accordé par le syndic)',
    details: 'Application de la délibération du conseil syndical du 25/08 pour dédommagement fuite toiture terrasse.',
  },
  {
    id: 'log-audit-06',
    timestamp: '2026-07-08T10:30:00Z',
    actorId: 'usr-tres-01',
    actorName: 'Sofia Benjelloun',
    actorRole: 'treasurer',
    actionType: 'payment_recorded',
    actionLabel: 'Enregistrement de règlement #REC-PB-2026-0012',
    targetEntity: 'Quittance #REC-PB-2026-0012 (Porte H-12)',
    entityType: 'payment',
    oldValue: 'Solde dû: 2 400 MAD (Statut: En attente)',
    newValue: 'Encaissé: 2 400 MAD (Virement BMCE) - Solde: 0 MAD (Statut: Réglé)',
    details: 'Règlement reçu de M. & Mme Youssef Tazi pour le 3ème trimestre 2026. Réf: VIR-BMCE-940217.',
  },
  {
    id: 'log-audit-07',
    timestamp: '2026-06-20T09:00:00Z',
    actorId: 'usr-tres-01',
    actorName: 'Sofia Benjelloun',
    actorRole: 'treasurer',
    actionType: 'call_funds_issued',
    actionLabel: 'Émission de l’appel de cotisations T3 2026',
    targetEntity: 'Appel Général T3 2026 (508 Lots)',
    entityType: 'contribution',
    oldValue: 'Aucune ligne de débit T3',
    newValue: '508 débits générés - Montant global: 1 124 000 MAD',
    details: 'Émission des appels de fonds estivaux avec rappel des consignes d’usage des 18 piscines.',
  },
];
