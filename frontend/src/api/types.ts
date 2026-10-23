// The frontend's contract with the backend. Every shape a screen reads is defined here.
// Feature IDs (F01…) refer to docs/feature-list.md.

/** A client user's role. CiV staff never use the portal; they use the CiV admin panel. */
export type Role = 'admin' | 'member';
/** What the portal shows: the client's own pages, or what its insurer's underwriter sees. A view, not a role. */
export type View = 'owner' | 'underwriter';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Tier = 1 | 2 | 3 | 4;
/** NOT_CHECKED: the consent engine has not looked at it yet. Never a worst case. PENDING: a certificate not read yet,
 * left out of totals. NOT_NEEDED: the person contacted the client, or a CiV test number. */
export type ConsentStatus = 'VERIFIED' | 'WEAK' | 'CONFLICTING' | 'NO_PROOF' | 'PENDING' | 'NOT_CHECKED' | 'NOT_NEEDED';
export type Severity = 'High' | 'Medium' | 'Low';
export type Basis = 'robocall_marketing' | 'robocall_informational' | 'dnc_listed' | 'dnc_unknown' | 'state_law' | 'civ_policy';
export type Family = 'Permission' | 'Who you contact' | 'How you contact' | 'Stopping' | 'Records' | 'Company controls';
export type Plan = 'Starter' | 'Growth' | 'Scale' | 'Enterprise';

export const FAMILIES: Family[] = ['Permission', 'Who you contact', 'How you contact', 'Stopping', 'Records', 'Company controls'];
export const DISCLOSURE = 'Comply iV measures and records. It operates no controls, sits in no call path and makes no compliance decisions. Findings are measurements, not legal advice.';

export const BASIS_LABEL: Record<Basis, string> = {
  robocall_marketing: 'Marketing robocall · written consent',
  robocall_informational: 'Informational robocall · prior express consent',
  dnc_listed: 'DNC-listed number',
  dnc_unknown: 'DNC list not supplied',
  state_law: 'State law',
  civ_policy: 'CiV policy only',
};

/** A month in the picker; revisedOn: a locked month saved again after late data or a rule change (Module 10). */
export interface Period { id: string; label: string; revisedOn?: string }

export interface Session {
  signedIn: boolean;
  userId: string; name: string; initials: string; email: string;
  clientId: string; clientName: string; vertical: string;
  role: Role; isCounsel: boolean; view: View; plan: Plan | null;
  /** 'insurer' in the underwriter view: insurer pages only, never a client's records. */
  orgKind: 'client' | 'insurer' | 'acquirer';
  /** Owner decision 2026-10-22: client users switch their own view; insurers and locked Members cannot. */
  canSwitchView?: boolean;
  /** The last time CiV read something new from the company's tools; null = nothing read yet. */
  updatedAt: string | null;
  periods: Period[];
}

// ----- Your position -----
export interface ScorePoint { period: string; label: string; score: number; grade: Grade; event: string | null }

/** Every number is null until the month has a saved score ("Not measured", never a sample value). */
export interface ScoreSummary {
  score: number | null; grade: Grade | null; rawGrade: Grade | null;
  cap: { share: number; limit: number | null } | null;
  checkpointsRun: number; checkpointsTotal: number; domainsMeasured: number; domainsTotal: number;
  projected: { score: number; grade: Grade; actions: number; clearsCap: boolean } | null;
  previous: number | null;
  /** Share of the score backed by proof CiV checked itself, 0–1 (shown beside every score). */
  evidenceCoverage: number | null;
  /** Score using only Rulebook values marked Set; the figure that holds if the Rulebook is challenged. */
  confirmedScore: number | null;
  /** The three grade caps, in the order they apply. */
  caps: CapStatus[];
  families: { family: Family; score: number | null }[];
  history: ScorePoint[];
  /** Module 10: some of the six factors are not measured yet; the bands are drafts until counsel confirms them. */
  partial?: { factorsMeasured: number; factors: number } | null; draftBands?: boolean;
  exposure?: { value: number | null; grade: Grade | null; defect: number | null };
}

export interface CapStatus { name: string; held: boolean; detail: string }

/** Is the data behind the score complete, fresh and checked? */
export interface DataHealth {
  /** null until anything has been read. */
  accessLevel: number; accessLabel: string; lastChangeAt: string | null;
  sources: { live: number; stale: number; notSupplied: number; total: number };
  /** null = not yet measured (records completeness comes with Module 5, conversation review with Module 9). */
  recordsCompleteness: number | null; completenessFloor: number;
  /** Records completeness box (M37): complete / incomplete / not_available (no billing source) / not_measured, and why. */
  completenessStatus?: 'complete' | 'incomplete' | 'not_available' | 'not_measured'; completenessNote?: string | null;
  conversationReview: { reviewed: number; optOutsFound: number; missed: number; notMarkedFirstCheck: number } | null;
  /** Module 8: proof requests not answered yet. */
  proofRequestsWaiting?: number;
}

export interface Domain {
  code: string; name: string; family: Family;
  total: number; run: number; pass: number; warn: number; fail: number; notRun: number;
  score: number | null; excluded: boolean;
  what: string; finding: string; sources: string; metrics: string[];
  history: (number | null)[];
}

export interface Action {
  id: string; rank: number; severity: Severity; title: string; why: string; domain: string;
  owner: 'you' | 'we'; impact: string; fixStep: string;
  assignee: string | null; due: string | null; overdue: boolean;
  status: 'open' | 'in_progress' | 'resolved';
  dispute: { note: string; by: string; at: string } | null;
  /** Module 11 findings: the metric, masked example numbers (ref opens the number page), first seen, reopened. */
  metric?: string; examples?: { label: string; ref: string }[]; numbersAffected?: number | null;
  since?: string; reopened?: boolean; resolvedOn?: string | null;
  /** Step 2: the client's decision with its note (kept in their workspace, never sent to insurers); the common
   * response is a draft for their lawyers to review. */
  decision?: { choice: 'accepted' | 'declined' | 'alternative'; note: string; by: string; at: string } | null;
  fixStepDraft?: boolean;
}

export interface Alert {
  id: string; severity: Severity; kind: string; title: string; detail: string;
  at: string; domain: string; reviewed: boolean;
  /** Module 11: the condition went away by itself; who reviewed it. */
  resolved?: boolean; reviewedBy?: string | null;
}

// ----- Evidence -----
/** not_measured: a check CiV cannot run yet (Module 7 or 8); it never changes a result. */
export type CheckState = 'pass' | 'fails' | 'gap' | 'not_reached' | 'not_measured';

// ----- Who You Contact -----
export type WhoState = 'fail' | 'warn' | 'unverified' | 'pass';
/** Where a check's result came from. "stated" = the client only says so: shown, but scored 0. */
export type CheckSource = 'provider' | 'list' | 'stated' | 'none' | 'records';
export type CheckColumn = 'national' | 'state' | 'internal' | 'reassigned';

export interface WhoCheck { state: WhoState; name: string; result: string; source: CheckSource; metric: string; why: string; isNew?: boolean }
export interface WhoFlag { number: string; known: string; from: string; flaggedOn: string; contactedOn: string; channel: 'Call' | 'Text' }
export interface WhoArea { id: string; title: string; law: string; checks: WhoCheck[]; flags: WhoFlag[] }
export interface WhoService { name: string; note: string; covers: Partial<Record<CheckColumn, CheckSource>> }
export interface WhoLeadSource { id: string; group: 'vendor' | 'upload'; name: string; note?: string; checked: Record<CheckColumn, boolean> }
export interface WhoContact { areas: WhoArea[]; services: WhoService[]; leadSources: WhoLeadSource[] }

export interface Contact {
  id: string; occurredAt: string; phoneDisplay: string; phoneE164: string;
  channel: 'Call' | 'Text'; category: 'Marketing' | 'Informational' | 'Unknown';
  bases: Basis[]; status: ConsentStatus; code: string; reasonText: string;
  checks: CheckState[]; proof: string; tiers: Tier[]; flags: string[]; hash: string | null;
  /** Real contacts only: direction, where the person probably is, the tool's own result code, which tool. */
  direction?: 'outbound' | 'inbound' | 'unknown'; where?: string; result?: string; tool?: string;
}

export interface ConsentSummary {
  contacts: number;
  mix: { status: ConsentStatus; share: number; count: number; note: string }[];
  reasons: { code: string; count: number; text: string }[];
  legalShare: number; legalCount: number; policyCount: number; dncUnknownShare: number;
  certificateValidity: number; certificatePairs: number; expiredBeforeEngagement: number;
  trend: { label: string; verified: number; weak: number; conflicting: number; noProof: number }[];
  expiring: { within: string; count: number }[];
  /** Real data: left out of the shares above, shown apart. */
  pending?: number; frozen?: number; notNeeded?: number; period?: string; real?: boolean;
  /** No proof where a legal basis (not only CiV policy) requires proof. */
  noProofLegal?: number;
}

/** A consent certificate CiV found in the client's records (TrustedForm / Jornaya). Never the whole certificate ID. */
export interface Certificate {
  id: string; provider: string; ref: string; state: 'waiting' | 'claimed' | 'no_key' | 'lost'; stateLabel: string;
  seenAt: string; deadlineAt: string; createdAt: string | null; expiresAt: string | null; page: string; usedBy: number; problem: string;
  source?: string; phoneMatch?: boolean | null;
}

/** The consent part of a number's page (strict results, current owner). */
export interface ConsentPanel {
  owner: number | null;
  proofs: { id: string; kind: string; provider: string | null; madeAt: string | null; dateKnown: boolean; expiresAt: string | null;
    state: string | null; tool: string; withdrawn: boolean; usedBy: number; source?: string; phoneMatch?: boolean | null; page?: string }[];
  needs: { basis: Basis; status: ConsentStatus; proof: string | null }[]; needsFor: string | null;
  history: { at: string; contactAt: string; from: ConsentStatus | null; to: ConsentStatus; reason: string; frozen: boolean }[];
  frozen: number; pending: number; notMeasured: string[]; draftRules: boolean;
}

/** A consent form page from your certificates, with CiV's latest photos of it and the checklist read from them. */
export interface ConsentPage {
  id: string; address: string; source: 'client_form' | 'vendor' | 'uploaded_list' | 'unknown'; sourceLabel: string;
  firstSeen: string; lastSeen: string; leads: number; capturedAt: string | null; problem: string;
  photos: { viewport: string; label: string; url: string }[]; wording: string;
  /** effect when an item fails: no_proof · wording (weak) · warning · info; ai = needs AI, not measured yet. */
  items: { code: string; label: string; effect: 'no_proof' | 'wording' | 'warning' | 'info' | 'ai'; result: 'pass' | 'fail' | 'not_measured' }[];
  draft: boolean;
  /** Restored from the first portal: your own mark (never changes a result), the vendor your CRM names, when the
   * wording last changed on CiV's photos, the checklist count and what is missing. */
  mark: 'approved' | 'rejected' | 'unmarked'; vendor: string | null; changedOn: string | null;
  checklistPassed: number; checklistTotal: number; missing: string[];
}

export interface RevocationCell { hours: number | null; tested: boolean; tests: number }

export interface Revocation {
  windowDays: number; tests: number; medianHours: number | null; p90: number | 'NEVER' | null;
  notSuppressedByDeadline: number; contactedAfterDeadline: number; deadlineBusinessDays: number; minTestsPerCell: number;
  systems: { name: string; contacting: boolean }[];
  rows: { channel: string; cells: RevocationCell[] }[];
  distribution: { label: string; count: number }[];
  wording: { phrase: string; kind: 'keyword' | 'plain words'; dialer: boolean | null; messaging: boolean | null }[];
  /** signedOn: the Annex C date, null until signed; the window is the last windowDays days. */
  authorisation: { signedOn: string | null; windowFrom: string; windowTo: string; channels: string[] };
}

export interface OptOut {
  id: string; phoneDisplay: string; phoneE164: string | null; how: string; words: string | null; at: string;
  deadline: string; businessDaysLeft: number; deadlineProvisional: boolean;
  /** null = not checked yet (Module 9). */
  dialerMarked: boolean | null; contactsAfter: { count: number; channel: string; lastAt: string; afterDeadline: boolean } | null;
  /** Module 9: each tool's answer (null = can't tell), a tool not marked after the first check, and whether it counts in
   * the score (an AI result before the AI passed its exam does not). */
  tools?: { name: string; marked: boolean | null; note: string | null }[]; urgent?: boolean; counted?: boolean;
}

export interface VaultStats {
  artifacts: string; anchors: number; deletedUnderRetention: number; lastAnchor: string | null; engagedSince: string;
  coverage: { label: string; state: 'covered' | 'partial' | 'before' }[];
}

export interface Position {
  phone: string; date: string; insideCoverage: boolean;
  /** The number's evidence file address when CiV has contacts with it (2026-10-23). */
  ref?: string | null;
  rows: { label: string; value: string; source: string }[];
}

export interface HashCheck { found: boolean; artifact: string | null; capturedAt: string | null; anchoredOn: string | null; tier: Tier | null }

export interface LegalHold {
  id: string; scope: 'number' | 'vendor' | 'date range'; target: string; reason: string;
  setBy: string; setOn: string; releasedOn: string | null;
}

export interface EvidenceContact {
  id: string; occurredAt: string; channel: 'Call' | 'Text'; dialMode: string | null; status: ConsentStatus; code: string;
  bases: { basis: Basis; status: ConsentStatus }[]; labels: string[];
}

export interface ProofElement {
  number: number; element: string; applies: boolean; present: boolean | null;
  tier: Tier | null; hash: string | null; source: string | null; capturedAt: string | null;
  /** Who holds the original consent proof (2026-10-23), when CiV knows. */
  holder?: string | null;
}

export interface EvidenceFile {
  phone: string; epoch: string; epochCertainty: 'known' | 'bounded' | 'unknown';
  worstStatus: ConsentStatus; counts: Partial<Record<ConsentStatus, number>>;
  contacts: EvidenceContact[]; proofElements: ProofElement[];
  optOuts: { at: string; channel: string; method: string }[];
  listChecks: { list: string; onList: boolean | null; label: string }[];
  anchor: { date: string; root: string; anchored: boolean; sealedCount?: number; recordCount?: number; stamped?: boolean }; onHold: boolean;
  /** Real files: where the person probably is, the calling window now, and the owners of the number over time. */
  where?: string; locationConfidence?: string; callingWindow?: CallingWindow;
  epochs?: { number: number; from: string | null; to: string | null; reason: string }[];
  consent?: ConsentPanel;
  /** Where this owner's number came from (Module 8 provenance ladder), in words. */
  cameFrom?: string | null;
}

/** Advice only: CiV never blocks a call. Draft hours are said to be draft. */
export interface CallingWindow {
  verdict: 'ok' | 'not_safe' | 'unknown'; hours: string | null; status: RuleStatus | null; draft: boolean; place?: string;
  zones: { zone: string; localTime: string; allowed: boolean }[]; note: string; holidays: string;
}
export interface CanCall extends CallingWindow {
  number: string; state: string; country: string; timeZones: string[]; confidence: string; checkedAt: string;
}

// ----- Intelligence -----
export interface Metric {
  code: string; name: string; group: string; source: 'CiV' | 'Client' | 'AI';
  value: number | null; display: string; note: string; definition: string;
  notMeasured: string | null; domains: string[];
  history: (number | null)[]; unit: string; better: 'higher' | 'lower' | 'none'; evidence: string;
}

export interface Conduct {
  metrics: string[];
  byState: { state: string; count: number; window: string }[];
  possibleLocationUncertain: number;
  byCampaign: { campaign: string; rate: number }[]; abandonLimit: number;
  hoursOfDay: { hour: string; count: number; outside: boolean }[];
}

/** null = not measured yet (signal levels and page match need lead inspection data CiV does not read yet). */
export interface Leads {
  inspected: number; few: number | null; some: number | null; high: number | null; completeness: number | null; pageMatch: number | null;
  signals: { label: string; count: number }[]; missing: { label: string; count: number }[];
}

export interface Vendor {
  /** highSignals: null = not measured yet (needs the Lead Inspector signals, Module 12). */
  id: string; name: string; subId: string | null; leads: number; highSignals: number | null;
  score: number | null; grade: Grade | null; monthOnMonth: number | null; alert: boolean; notEnoughData: boolean;
  history: (number | null)[]; termsOnFile: boolean; disputeCandidates: number;
  rates: { label: string; value: number }[];
  /** Module 12: the newest contract the client uploaded (clauses are checked later by the AI reader). */
  contract?: VendorContract | null;
  /** Module 12: the rates CiV cannot measure yet, and how many of the six were measured. */
  notMeasuredRates?: string[]; ratesMeasured?: number; ratesTotal?: number;
}

/** Module 12: a vendor's dispute candidates (leads with a consent problem inside the contract's dispute window). */
export interface VendorDisputes {
  name: string; windowDays: number; basis: string; total: string; noPrice: number;
  rows: { lead: string; subId: string | null; date: string; price: string | null; result: string; reasons: string; number: string; ref: string }[];
}

/** Module 15: who the company shares its attestation with. */
/** Module 15: the insurer's own pricing software; the key is never sent back, only its last 4 characters. */
export interface RatingEngine { url: string; keyHint: string; monthly: boolean; adapter?: string; sends: { at: string; company: string; ok: boolean; detail: string; by: string }[] }

export interface BuyerLink { id: string; org: string; kind: 'insurer' | 'acquirer'; grantedBy: string; grantedOn: string; endsOn: string | null; stoppedOn: string | null; active: boolean }

/** Module 15: a statement the company signed, with what CiV measured (conflict) or a note. */
export interface StatementRow { id: string; topic: string; text: string; signedBy: string; signedOn: string; conflict: string | null; note: string }

export interface VendorContract {
  id: string; vendor: string; file: string; endsOn: string | null; disputeDays: number | null;
  state: 'on_file' | 'expired' | 'none'; uploadedBy: string; uploadedAt: string; url: string | null;
}

export interface VendorSummary { gradeMix: string; gradeMixNote: string; disputeCandidates: number; alerts: number; alertNote: string; vendors: Vendor[] }

// ----- Disclosure -----
export type SourceStatus = 'current' | 'stale' | 'not_supplied' | 'revoked';

export interface Source {
  id: string; name: string; tier: Tier; access: string; lastSync: string; status: SourceStatus;
  feeds: string[]; revocable: boolean; acceptsUpload: boolean; blocks: string | null;
}

export interface Upload { artifactId: string; source: string; fileName: string; sha256: string; receivedAt: string; rowsRead: number; rowsRejected: number }

export interface ReportType { id: string; name: string; description: string; format: string; addOn: boolean }
/** Module 11: blocked = held back by the banned-word check; unavailable = that report type is not built yet; url downloads it. */
export interface ReportRun { id: string; name: string; period: string; requestedBy: string; at: string; status: 'ready' | 'queued' | 'blocked' | 'unavailable'; url?: string | null; sha256?: string | null }

// ----- Engagement -----
export type RuleStatus = 'set' | 'proposed' | 'tbd';
export interface RulebookSetting {
  key: string; value: string; owner: 'Counsel' | 'Product' | 'Engineering'; status: RuleStatus; counselItem: string | null;
  /** 'Federal' or a state / court forum code. */
  place?: string; section?: string; meaning?: string; since?: string | null;
}
export interface ImpactRow { key: string; counselItem: string; strict: string; lenient: string; contacts: number; changing: number }
export interface Rulebook {
  version: string; set: number; proposed: number; tbd: number; settings: RulebookSetting[]; impact: ImpactRow[];
  /** 'provisional' until a lawyer-confirmed version exists; `note` then says so. */
  versionStatus?: 'draft' | 'provisional' | 'approved'; note?: string | null;
}

/** One value of the Calendar & hours tab. `value` is the draft value while the status is TBD. */
export interface CalendarRule { value: unknown; shown: string; status: RuleStatus; counselItem: string | null }
export interface PlaceRule { place: string; value: string | null; status: RuleStatus; counselItem: string | null }
export interface RulebookCalendar {
  year: number;
  holidays: { date: string; name: string; actual: string }[];
  nextHoliday: { date: string; name: string } | null;
  businessDays: CalendarRule;
  callingHours: PlaceRule[];
  smsFollowsCallingHours: CalendarRule;
  frequencyLimits: PlaceRule[];
  restrictedHolidays: CalendarRule;
  optOut: { deadlineDays: CalendarRule; confirmationMinutes: CalendarRule; keywords: CalendarRule };
  timeZone: { order: string[]; status: RuleStatus };
}

export interface RegChange {
  id: string; title: string; jurisdiction: string; status: 'adopted' | 'in force' | 'proposed' | 'court ruling';
  date: string; effective: string; summary: string; settings: string[]; metrics: string[]; domains: string[];
  confirmed: boolean; source: string;
  sourceUrl?: string | null; checkedByCounsel?: boolean;
  /** New rule values this change brings. Drafts wait for CiV's approval; your lawyer may review them. */
  updates?: RuleUpdateDraft[];
}

export interface RuleReview { verdict: 'agree' | 'disagree'; comment: string; by: string; at: string }
export interface RuleUpdateDraft {
  id: string; rule: string; isNewRule: boolean; meaning: string | null; place: string; value: string; startsOn: string;
  state: 'draft' | 'approved'; myReview: RuleReview | null;
}

// ----- Account -----
export type ReadyState = 'ready' | 'partial' | 'missing';
export interface ReadinessCheck { name: string; how: string; state: ReadyState; detail: string; fix: string | null }
export interface SetupItem { id: string; label: string; detail: string; done: boolean; count: string }

export interface Readiness {
  runOn: string; sampleNumbers: number; checks: ReadinessCheck[];
  preview: { status: ConsentStatus; count: number }[];
  notMeasured: string[]; recommendedPlan: Plan; numbersPerMonth: number; canStart: boolean;
  setup: SetupItem[];
}

export interface PlanUsage {
  plan: Plan; limit: number | null; used: number; monthlyPrice: string | null; nextPlan: Plan | null;
  history: { label: string; used: number }[]; overLimitMonths: number; rule: string;
}

export interface Agreement { name: string; status: 'signed' | 'pending'; date: string | null; detail: string }

export interface Settings {
  company: { name: string; vertical: string; states: string[]; brands: string[]; forum: string | null; engaged: string };
  contacts: { role: string; name: string; email: string }[];
  notifications: { kind: string; label: string; email: boolean }[];
  agreements: Agreement[]; usage: PlanUsage;
}

/** status 'expired': an invite whose 7-day link ran out (kept in the list so the Admin can resend it, 2026-10-23). */
export interface User { id: string; name: string; email: string; role: Role; isCounsel: boolean; status: 'active' | 'invited' | 'expired'; lastSeen: string | null; sentAt?: string }
export interface AccessEntry { at: string; actor: string; role: Role; action: string; object: string }

export interface SearchHit { kind: 'domain' | 'metric' | 'number' | 'vendor' | 'page' | 'insured'; id: string; label: string; hint: string }

// ----- Insurer view (buyers: insurers and acquirers) -----
export type SourceGrade = 'A' | 'B' | 'C' | 'D' | 'S' | 'N';

/** One reading of the six exposure factors (0–100, higher = more exposed) and the three pressure multipliers. */
/** factors: F1–F6, higher = worse; null = pending (nothing measured yet: left out, weight spread over the others). */
export interface ExposureReading { factors: (number | null)[]; venue: number; targeting: number; volume: number; source: string }

export interface Insured {
  id: string; name: string; industry: string; contactsPerMonth: number | null; selfReported: boolean;
  asOf: string | null; sheetHash: string | null; monitoring: string; signedBy: string | null;
  consentProof: number | null; marketingShare: number | null; prerecordedShare: number | null; smsShare: number | null;
  purchasedShare: number | null; vendors: number | null; vendorTermsShare: number | null;
  optOutMedianHours: number | null; optOutFailShare: number | null; contactsAfterOptOut: number | null; reAdded: number | null;
  internalListContacts: number | null; rndExposure: number | null; reassignedCheckRate: number | null; litigatorContacts: number | null;
  manualImportShare: number | null; evidenceFoundShare: number | null;
  /** null = not measured yet (a real insurer's page never shows sample values). */
  praStates: number | null; priorStated: number | null; priorDocket: number | null; openMatters: number | null;
  coverage: number | null; completeness: number | null; unknownCallerIds: number | null;
  basisMix: { grade: SourceGrade; share: number }[];
  conflicts: { stated: string; observed: string; treatment: string; ref: string }[];
  statements: string[];
  /** Module 15: the company's own signed statements (its own page only). */
  statementRows?: StatementRow[];
  reconciliation: { label: string; against: string; records: string; total: string; ratio: number | null; result: 'consistent' | 'flag'; source: string }[];
  controls: { policy: boolean | null; trainingCurrency: number | null; optOutTests90d: number | null; fingerprinted: number };
  exposure: { inside: ExposureReading | null; outside: ExposureReading | null; why: { venue: string; targeting: string; volume: string } };
}

export interface LitigationStats {
  /** id: which card a real figure replaces (Module 10: WebRecon's monthly posts). */
  headline: { id?: string; label: string; value: string; note: string; status: 'Verified' | 'Estimate'; source: string; url: string | null }[];
  classByYear: { label: string; count: number }[];
  /** The month the class-action chart compares year by year, and its source line (real data only). */
  classMonth?: string; classSource?: string;
  costs: { label: string; value: string; status: 'Statute' | 'Verified' | 'Estimate' }[];
  claimTypes: { type: string; hook: string; direction: string }[];
  study: { step: string; how: string; cost: string }[];
}

// ----- Lead provenance (Module 8) -----
export type ProvenanceBasis = 'feed' | 'crm_field' | 'invoice' | 'cert_domain' | 'manual_import' | 'untraced';

/** The Lead Provenance page: where this month's called numbers came from, uploads, missing checklist items. */
export interface ProvenancePage {
  period: string; numbers: number;
  /** available = false: the rung needs a source CiV does not read yet (lead platform feed, vendor invoices). */
  ladder: { basis: ProvenanceBasis; label: string; count: number; share: number; available: boolean }[];
  topSources: { name: string; basis: string; count: number }[];
  untraced: { number: string; firstContactAt: string; tool: string; crmRecord: string; note: string }[];
  uploads: { id: string; label: string; system: string; numbers: number; withEvidence: number; stopBroughtBack: number;
    optOutsCleared: number; asked: number; proofRate: number | null }[];
  missing: { label: string; count: number }[];
}

export interface ProofRequest {
  id: string; batchKey: string; list: string; number: string; sentAt: string; dueAt: string;
  answer: 'proof' | 'none' | null; answeredAt: string | null; answeredBy: string | null;
  fileType: string | null; fileName: string | null; fileUrl: string | null;
  review: 'valid' | 'invalid' | null; reviewNote: string | null; consentDate: string | null;
}

export interface ProofRequests {
  canAnswer: boolean;
  lists: { batchKey: string; label: string; listSize: number; asked: number; attached: number; valid: number; waitingReview: number;
    none: number; overdue: number; rate: number | null }[];
  requests: ProofRequest[];
}
