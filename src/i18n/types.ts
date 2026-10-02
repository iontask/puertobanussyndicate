export type SupportedLanguage = 'fr' | 'ar' | 'en';
export type Direction = 'ltr' | 'rtl';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: Direction;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
  },
  {
    code: 'ar',
    name: 'Arabe',
    nativeName: 'العربية',
    flag: '🇲🇦',
    direction: 'rtl',
  },
  {
    code: 'en',
    name: 'Anglais',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
  },
];

export interface TranslationDictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    export: string;
    print: string;
    search: string;
    filter: string;
    download: string;
    loading: string;
    error: string;
    success: string;
    back: string;
    all: string;
    yes: string;
    no: string;
    details: string;
    status: string;
    date: string;
    actions: string;
    refresh: string;
    verified: string;
  };
  nav: {
    dashboard: string;
    governance: string;
    announcements: string;
    blocks: string;
    pools: string;
    finances: string;
    complaints: string;
    services: string;
    audit: string;
    reports: string;
    my_block: string;
    my_apartment: string;
    my_finances: string;
    my_facilities: string;
    my_documents: string;
  };
  roles: {
    president: string;
    treasurer: string;
    block_rep: string;
    resident: string;
    provider: string;
    user: string;
  };
  terms: {
    residence: string;
    block: string;
    blocks: string;
    apartment: string;
    apartments: string;
    owner: string;
    tenant: string;
    floor: string;
    surface: string;
    quotite: string;
    syndic_fees: string;
    balance: string;
    due_amount: string;
    paid_amount: string;
    recovery_rate: string;
    ledger: string;
    receipt: string;
    official_receipt: string;
    audit_log: string;
    immutable: string;
    pool: string;
    pools: string;
    pool_adult: string;
    pool_child: string;
    temperature: string;
    ph_level: string;
    lighting: string;
    complaint: string;
    complaints: string;
    incident: string;
    priority_urgent: string;
    priority_works: string;
    priority_info: string;
    meeting: string;
    meetings: string;
    pv: string;
    decision: string;
    decisions: string;
    resolutions: string;
  };
  reports: {
    title: string;
    subtitle: string;
    grand_livre: string;
    grand_livre_desc: string;
    monthly_tech: string;
    monthly_tech_desc: string;
    ag_resolutions: string;
    ag_resolutions_desc: string;
    export_csv: string;
    print_report: string;
    generated_at: string;
    period: string;
    total_due: string;
    total_collected: string;
    recovery: string;
    residual_unpaid: string;
    legal_mentions: string;
    certified_by: string;
    lot_number: string;
    amount_called: string;
    amount_settled: string;
    remaining: string;
    status_paid: string;
    status_partial: string;
    status_unpaid: string;
  };
  governance: {
    title: string;
    meetings_tab: string;
    decisions_tab: string;
    ag_ordinary: string;
    ag_extraordinary: string;
    board_meeting: string;
    quorum: string;
    attendees: string;
    agenda: string;
    resolutions_count: string;
    complete_action: string;
    budget: string;
    due_date: string;
    responsible: string;
  };
  announcements: {
    title: string;
    scope_residence: string;
    scope_block: string;
    mark_all_read: string;
    mark_as_read: string;
    new_announcement: string;
    confidentiality_active: string;
    isolation_notice: string;
  };
  pools: {
    title: string;
    aquatic_status: string;
    adult_bassin: string;
    child_bassin: string;
    operational: string;
    maintenance: string;
    chlorine: string;
    lights_ok: string;
    lights_defective: string;
  };
  security: {
    firestore_rules_title: string;
    hermetic_isolation: string;
    immutable_audit: string;
    rbac_status: string;
    verified_tokens: string;
    server_rules_enforced: string;
  };
}
