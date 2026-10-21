import type { ProofRequests, ProvenancePage, Certificate, OptOut, CheckState, ConsentPage, ConsentSummary, Contact, EvidenceFile, LegalHold, Position, Revocation, VaultStats } from '@/api/types';

const STEP_OF: Record<string, number> = { VF_OK: 6, NP_NO_CONSENT_TEXT: 3, NP_PRETICKED: 3, CF_NOT_FOUND: 2, CF_EXPIRED: 2, CF_FILE_MISSING: 2 };

/** Which of the five checks decided the status, from the primary reason code. */
export function checksFor(code: string): CheckState[] {
  const failAt = STEP_OF[code] ?? (code.startsWith('NP_') ? 1 : code.startsWith('CF_') ? 4 : 5);
  return [1, 2, 3, 4, 5].map((n) => (n < failAt ? 'pass' : n > failAt ? 'not_reached' : n === 5 ? 'gap' : 'fails'));
}

const sha = (head: string, tail: string) => `${head}${'0'.repeat(56)}${tail}`;
const c = (row: Omit<Contact, 'checks'>): Contact => ({ ...row, checks: checksFor(row.code) });

export const contacts: Contact[] = [
  c({ id: 'ev-1', occurredAt: '2026-09-29T14:02:00Z', phoneDisplay: '(916) •••-4471', phoneE164: '+19165554471', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'VERIFIED', code: 'VF_OK', reasonText: 'All five checks pass.', proof: 'TrustedForm certificate, linked to lead L-88214', tiers: [2], flags: [], hash: sha('9f2c', '4a1e') }),
  c({ id: 'ev-2', occurredAt: '2026-09-29T13:47:00Z', phoneDisplay: '(480) •••-0923', phoneE164: '+14805550923', channel: 'Text', category: 'Marketing', bases: ['robocall_marketing'], status: 'NO_PROOF', code: 'NP_AFTER_OPT_OUT', reasonText: 'An in-scope opt-out preceded this contact and no newer consent exists.', proof: 'Certificate cut off by STOP on 21 Sep', tiers: [2], flags: ['REV · after opt-out'], hash: sha('1b77', 'e03c') }),
  c({ id: 'ev-3', occurredAt: '2026-09-29T21:34:00Z', phoneDisplay: '(623) •••-3380', phoneE164: '+16235553380', channel: 'Call', category: 'Marketing', bases: ['civ_policy'], status: 'NO_PROOF', code: 'NP_NONE', reasonText: 'No accepted proof for this number. Required by CiV policy only.', proof: 'None supplied', tiers: [], flags: ['CTF · out of hours (state)'], hash: null }),
  c({ id: 'ev-4', occurredAt: '2026-09-28T18:31:00Z', phoneDisplay: '(520) •••-7712', phoneE164: '+15205557712', channel: 'Call', category: 'Informational', bases: ['robocall_informational'], status: 'VERIFIED', code: 'VF_OK', reasonText: 'All five checks pass.', proof: 'Number provided at purchase (prior express consent)', tiers: [3], flags: [], hash: sha('7c10', '9d52') }),
  c({ id: 'ev-5', occurredAt: '2026-09-28T16:05:00Z', phoneDisplay: '(916) •••-1198', phoneE164: '+19165551198', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing', 'dnc_listed'], status: 'CONFLICTING', code: 'CF_PHONE_MISMATCH', reasonText: 'The number on the proof differs from the number contacted.', proof: 'Certificate issued for a different number', tiers: [2], flags: ['NDN · on your scrub list'], hash: sha('a4e9', '30bb') }),
  c({ id: 'ev-6', occurredAt: '2026-09-28T10:44:00Z', phoneDisplay: '(480) •••-5561', phoneE164: '+14805555561', channel: 'Text', category: 'Marketing', bases: ['robocall_marketing'], status: 'WEAK', code: 'WK_RETENTION', reasonText: 'Certificate not retained long-term; it becomes unavailable within 30 days.', proof: 'Certificate not retained; unavailable after 12 Oct', tiers: [2], flags: [], hash: sha('55d2', 'c871') }),
  c({ id: 'ev-7', occurredAt: '2026-09-27T20:58:00Z', phoneDisplay: '(928) •••-2047', phoneE164: '+19285552047', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'WEAK', code: 'WK_TIMING_UNCERTAIN', reasonText: 'Proof and contact fall within the clock tolerance on unlinked sources.', proof: 'Certificate 45 s before call; sources unlinked', tiers: [2], flags: ['CTF · over limit', 'DLR · abandoned'], hash: sha('e018', '4f6a') }),
  c({ id: 'ev-8', occurredAt: '2026-09-27T15:20:00Z', phoneDisplay: '(916) •••-8834', phoneE164: '+19165558834', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'CONFLICTING', code: 'CF_PAGE_MISMATCH', reasonText: 'CiV’s page capture does not match the certificate snapshot.', proof: 'Certificate; page similarity 0.72', tiers: [1, 2], flags: ['PRV · missing disclosure'], hash: sha('3d9a', 'b2c4') }),
  c({ id: 'ev-9', occurredAt: '2026-09-26T12:09:00Z', phoneDisplay: '(480) •••-6620', phoneE164: '+14805556620', channel: 'Call', category: 'Marketing', bases: ['robocall_marketing'], status: 'NO_PROOF', code: 'NP_PRETICKED', reasonText: 'The consent box was pre-ticked on the captured page.', proof: 'Certificate; consent box pre-ticked', tiers: [1], flags: ['IDD · caller ID not callable'], hash: sha('c6f1', '0e97') }),
  c({ id: 'ev-10', occurredAt: '2026-09-26T09:31:00Z', phoneDisplay: '(604) •••-9015', phoneE164: '+16045559015', channel: 'Text', category: 'Unknown', bases: ['robocall_marketing'], status: 'NO_PROOF', code: 'NP_WRONG_TYPE', reasonText: 'The proof type does not meet what this contact requires.', proof: 'Existing-customer relationship only', tiers: [3], flags: ['XBD · non-US number'], hash: sha('8b35', 'f210') }),
];

export const consent: ConsentSummary = {
  contacts: 10000,
  mix: [
    { status: 'VERIFIED', share: 76.0, count: 7600, note: 'All five checks pass' },
    { status: 'WEAK', share: 8.0, count: 800, note: 'Fixable gaps' },
    { status: 'CONFLICTING', share: 11.0, count: 1100, note: 'Sources disagree' },
    { status: 'NO_PROOF', share: 5.0, count: 500, note: '40% CiV policy only' },
  ],
  reasons: [
    { code: 'WK_RETENTION', count: 510, text: 'Certificate not retained long-term' },
    { code: 'CF_PHONE_MISMATCH', count: 420, text: 'Number on proof differs from number contacted' },
    { code: 'CF_PAGE_MISMATCH', count: 380, text: 'Page capture does not match certificate snapshot' },
    { code: 'CF_EXPIRED', count: 300, text: 'Certificate no longer available; 210 from before engagement' },
    { code: 'WK_TIMING_UNCERTAIN', count: 290, text: 'Near-tie on unlinked sources' },
    { code: 'NP_NONE', count: 200, text: 'No proof supplied (CiV policy only)' },
    { code: 'NP_AFTER_OPT_OUT', count: 160, text: 'Contact after an in-scope opt-out' },
    { code: 'NP_WRONG_TYPE', count: 140, text: 'Proof type does not meet requirement' },
  ],
  legalShare: 70, legalCount: 7000, policyCount: 3000, dncUnknownShare: 12, noProofLegal: 2860,
  certificateValidity: 92.5, certificatePairs: 800, expiredBeforeEngagement: 210,
  trend: [
    { label: 'Jun', verified: 61, weak: 12, conflicting: 16, noProof: 11 },
    { label: 'Jul', verified: 67, weak: 11, conflicting: 14, noProof: 8 },
    { label: 'Aug', verified: 73, weak: 9, conflicting: 12, noProof: 6 },
    { label: 'Sep', verified: 76, weak: 8, conflicting: 11, noProof: 5 },
  ],
  expiring: [{ within: '7 days', count: 14 }, { within: '30 days', count: 42 }, { within: '90 days', count: 118 }],
};

const ITEMS: ConsentPage['items'] = [
  { code: 'CC_CONSENT_TEXT', label: 'Asks for permission to call or text', effect: 'no_proof', result: 'pass' },
  { code: 'CC_UNTICKED', label: 'Consent box not ticked in advance', effect: 'no_proof', result: 'pass' },
  { code: 'CC_BUTTON_MATCH', label: '“By clicking …” names the real button', effect: 'wording', result: 'pass' },
  { code: 'CC_NUMBER_SHOWN', label: 'Mentions the phone number', effect: 'wording', result: 'pass' },
  { code: 'CC_FONT_SIZE', label: 'Text big enough (10 px, draft)', effect: 'wording', result: 'pass' },
  { code: 'CC_CONTRAST', label: 'Text easy to read (contrast)', effect: 'wording', result: 'pass' },
  { code: 'CC_ABOVE_BUTTON', label: 'Text above the button', effect: 'warning', result: 'pass' },
  { code: 'CC_NO_SCROLL', label: 'Seen without scrolling', effect: 'warning', result: 'pass' },
  { code: 'CC_SELLER_NAMED', label: 'Your company named', effect: 'info', result: 'pass' },
  { code: 'CC_OPT_OUT', label: 'Says how to stop', effect: 'ai', result: 'not_measured' },
  { code: 'CC_NOT_CONDITION', label: 'Says consent is not a condition of purchase', effect: 'ai', result: 'not_measured' },
  { code: 'CC_AUTODIAL_DISCLOSED', label: 'Says calls may be automated', effect: 'ai', result: 'not_measured' },
];
const withFails = (...codes: string[]) => ITEMS.map((i) => (codes.includes(i.code) ? { ...i, result: 'fail' as const } : i));

/** Sample pages (no photos in sample data). */
export const consentPages: ConsentPage[] = [
  { id: 'cpg-1', address: 'go.sunpathsolar.com/quote', source: 'client_form', sourceLabel: "Client's own form", firstSeen: '2026-06-01', lastSeen: '2026-09-30',
    leads: 2140, capturedAt: '2026-09-30T09:20:00Z', problem: '', photos: [], items: withFails('CC_FONT_SIZE'), draft: true, mark: 'unmarked', vendor: null, changedOn: '2026-09-28', checklistPassed: 8, checklistTotal: 9, missing: ['Text big enough (10 px, draft)'],
    wording: 'By clicking Get my quote, I agree that SunPath may call or text me at the number above using automated technology.' },
  { id: 'cpg-2', address: 'solar-savings-quotes.example/ca', source: 'vendor', sourceLabel: 'From a vendor', firstSeen: '2026-06-03', lastSeen: '2026-09-30',
    leads: 1420, capturedAt: '2026-09-30T09:24:00Z', problem: '', photos: [], items: ITEMS, draft: true, mark: 'approved', vendor: 'Vendor A · sub-ID 114', changedOn: null, checklistPassed: 9, checklistTotal: 9, missing: [],
    wording: 'I consent to receive calls and texts from SunPath Residential Solar at this number, including by autodialer. Not required to purchase.' },
  { id: 'cpg-3', address: 'home-energy-match.example/form', source: 'vendor', sourceLabel: 'From a vendor', firstSeen: '2026-07-11', lastSeen: '2026-09-30',
    leads: 520, capturedAt: '2026-09-30T09:31:00Z', problem: '', photos: [], items: withFails('CC_UNTICKED', 'CC_SELLER_NAMED', 'CC_CONTRAST'), draft: true, mark: 'rejected', vendor: 'Vendor E · sub-ID 7', changedOn: '2026-09-12', checklistPassed: 6, checklistTotal: 9, missing: ['Consent box not ticked in advance', 'Text easy to read (contrast)', 'Your company named'],
    wording: 'By submitting, you agree to be contacted by our marketing partners.' },
  { id: 'cpg-4', address: 'best-roof-deals.example/get-quote', source: 'uploaded_list', sourceLabel: 'From a vendor (uploaded list)', firstSeen: '2026-06-20',
    lastSeen: '2026-09-29', leads: 480, capturedAt: '2026-09-30T09:35:00Z', problem: 'The page answered 404', photos: [], wording: '',
    items: ITEMS.map((i) => ({ ...i, result: 'not_measured' as const })), draft: true, mark: 'unmarked', vendor: 'Vendor F', changedOn: null, checklistPassed: 0, checklistTotal: 0, missing: [] },
];

const cell = (hours: number | null, tests: number, tested = true) => ({ hours, tests, tested });
const nt = cell(null, 0, false);

export const revocation: Revocation = {
  windowDays: 90, tests: 14, medianHours: 6.0, p90: 'NEVER',
  notSuppressedByDeadline: 2, contactedAfterDeadline: 1, deadlineBusinessDays: 10, minTestsPerCell: 3,
  systems: [{ name: 'Dialer', contacting: true }, { name: 'Messaging platform', contacting: true }, { name: 'CRM (info)', contacting: false }, { name: 'Lead platform (info)', contacting: false }],
  rows: [
    { channel: 'SMS reply — “STOP”', cells: [cell(2, 3), cell(0.4, 3), cell(5.5, 3), cell(26, 3)] },
    { channel: 'SMS reply — “please stop texting me”', cells: [cell(20, 3), cell(6, 3), cell(null, 3), cell(null, 2)] },
    { channel: 'Spoken on a call', cells: [cell(48, 2), nt, cell(30, 2), nt] },
    { channel: 'Web form opt-out', cells: [cell(null, 3), cell(null, 3), cell(12, 3), nt] },
    { channel: 'Email reply', cells: [cell(null, 3), cell(null, 3), cell(18, 3), nt] },
  ],
  distribution: [
    { label: 'Under 1 h', count: 0 }, { label: '1–6 h', count: 6 }, { label: '6–24 h', count: 3 },
    { label: '1–3 days', count: 3 }, { label: 'Over 3 days', count: 0 }, { label: 'Never', count: 2 },
  ],
  wording: [
    { phrase: 'STOP', kind: 'keyword', dialer: true, messaging: true },
    { phrase: 'UNSUBSCRIBE', kind: 'keyword', dialer: true, messaging: true },
    { phrase: 'REVOKE', kind: 'keyword', dialer: false, messaging: true },
    { phrase: 'please stop texting me', kind: 'plain words', dialer: true, messaging: true },
    { phrase: 'take me off your list', kind: 'plain words', dialer: false, messaging: false },
    { phrase: 'do not contact me again', kind: 'plain words', dialer: false, messaging: true },
    { phrase: 'wrong number', kind: 'plain words', dialer: false, messaging: false },
    { phrase: 'no more messages', kind: 'plain words', dialer: null, messaging: false },
  ],
  authorisation: { signedOn: '2026-06-01', windowFrom: '2026-06-01', windowTo: '2027-05-31', channels: ['Text', 'Call', 'Web form', 'Email'] },
};

export const vault: VaultStats = {
  artifacts: '2.41 M', anchors: 122, deletedUnderRetention: 1840, lastAnchor: '2026-09-30T04:12:00Z', engagedSince: '2026-06-01',
  coverage: [
    ...['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((label) => ({ label, state: 'before' as const })),
    { label: 'May', state: 'partial' }, { label: 'Jun', state: 'covered' }, { label: 'Jul', state: 'covered' },
    { label: 'Aug', state: 'covered' }, { label: 'Sep', state: 'covered' },
  ],
};

export const position: Position = {
  phone: '(916) 555-0142', date: '2026-09-04', insideCoverage: true,
  rows: [
    { label: 'Phone epoch', value: 'Epoch 2 · since Feb 2025 (bounded) · reassignment checked', source: 'Somos query · Tier 1' },
    { label: 'Consent proof', value: 'TrustedForm certificate, captured 04 Sep 09:12:40', source: 'sha256 4f9c…a71e · Tier 2' },
    { label: 'Consent page as of date', value: 'go.sunpathsolar.com/quote · checklist 12 of 12', source: 'Capture 04 Sep · Tier 1' },
    { label: 'Lead source', value: 'Vendor A · sub-ID 114 · delivered 09:12:58', source: 'LeadConduit · Tier 3' },
    { label: 'Contact log', value: 'Call 09:13:41 · manual · agent 1182', source: 'Convoso · Tier 3' },
    { label: 'Opt-out history', value: 'None on any channel at that date', source: 'SMS + CRM · Tier 3' },
    { label: 'Internal list', value: 'Not listed', source: 'Upload · Tier 4' },
    { label: 'Consent status', value: 'VERIFIED · VF_OK · linked chain', source: 'Engine 2.0.4 · Rulebook v1.3' },
  ],
};

export const KNOWN_HASH = sha('4f9c', 'a71e');

export const legalHolds: LegalHold[] = [
  { id: 'lh-1', scope: 'number', target: '(480) •••-0923', reason: 'Demand letter received 22 Sep', setBy: 'M. Okafor (Admin, lawyer)', setOn: '2026-09-22', releasedOn: null },
  { id: 'lh-2', scope: 'vendor', target: 'Vendor E · sub-ID 7', reason: 'Vendor dispute', setBy: 'Dana Reyes (Admin)', setOn: '2026-09-15', releasedOn: '2026-09-26' },
];

export const evidenceFiles: Record<string, EvidenceFile> = {
  '+14805550923': {
    phone: '+14805550923', epoch: 'Epoch 1 · since Mar 2024', epochCertainty: 'bounded', worstStatus: 'NO_PROOF',
    counts: { NO_PROOF: 1, CONFLICTING: 0, WEAK: 1, VERIFIED: 1, PENDING: 0 },
    contacts: [
      { id: 'ev-0a', occurredAt: '2026-09-02T15:04:00Z', channel: 'Call', dialMode: 'predictive', status: 'VERIFIED', code: 'VF_OK', bases: [{ basis: 'robocall_marketing', status: 'VERIFIED' }], labels: [] },
      { id: 'ev-0b', occurredAt: '2026-09-11T22:10:00Z', channel: 'Text', dialMode: null, status: 'WEAK', code: 'WK_TIMING_UNCERTAIN', bases: [{ basis: 'robocall_marketing', status: 'WEAK' }], labels: ['reassignment uncertain'] },
      { id: 'ev-2', occurredAt: '2026-09-29T13:47:00Z', channel: 'Text', dialMode: null, status: 'NO_PROOF', code: 'NP_AFTER_OPT_OUT', bases: [{ basis: 'robocall_marketing', status: 'NO_PROOF' }], labels: ['after opt-out'] },
    ],
    proofElements: [
      { number: 1, element: 'Every contact VERIFIED or WEAK', applies: true, present: false, tier: null, hash: null, source: null, capturedAt: null },
      { number: 2, element: 'Consent page as of that date', applies: true, present: true, tier: 1, hash: sha('c3ab', 'c4f2'), source: 'CiV page capture', capturedAt: '2026-08-30T11:00:00Z' },
      { number: 3, element: 'Third-party proof', applies: true, present: true, tier: 2, hash: sha('1b77', 'e03c'), source: 'TrustedForm', capturedAt: '2026-08-30T10:58:00Z' },
      { number: 4, element: 'Lead source', applies: true, present: true, tier: 3, hash: sha('2c26', 'e7ae'), source: 'LeadConduit', capturedAt: '2026-08-30T10:59:00Z' },
      { number: 5, element: 'Contact log with required fields', applies: true, present: true, tier: 3, hash: sha('fcde', '8fb9'), source: 'Twilio messaging', capturedAt: '2026-09-30T02:00:00Z' },
      { number: 6, element: 'Opt-out history synced', applies: true, present: true, tier: 3, hash: sha('4e07', '9fce'), source: 'Twilio messaging', capturedAt: '2026-09-30T02:00:00Z' },
      { number: 7, element: 'Internal list checked', applies: true, present: true, tier: 4, hash: sha('6b86', '4b27'), source: 'Upload', capturedAt: '2026-09-28T00:00:00Z' },
      { number: 8, element: 'Your pre-contact reassigned check', applies: true, present: null, tier: null, hash: null, source: null, capturedAt: null },
    ],
    optOuts: [{ at: '2026-09-21T18:30:00Z', channel: 'Text', method: 'Reply STOP' }],
    listChecks: [
      { list: 'Internal do-not-contact list', onList: false, label: 'supplied by you' },
      { list: 'DNC scrub records', onList: null, label: 'DNC scrub records not supplied' },
    ],
    anchor: { date: '2026-09-30', root: sha('5fec', '57e9'), anchored: true }, onHold: true,
  },
};

// The Opt-outs card (Revocation Integrity). Deadlines counted with the business-day rule (Columbus Day 12 Oct and
// Labor Day 7 Sep skipped). Sample "today": 30 Sep.
export const optOuts: OptOut[] = [
    { id: 'oo-1', phoneDisplay: '(480) •••-1234', phoneE164: null, how: 'Text · keyword', words: 'STOP', at: '2026-09-29T15:00:00Z',
      deadline: '2026-10-14', businessDaysLeft: 9, deadlineProvisional: true, dialerMarked: true, contactsAfter: null },
    { id: 'oo-2', phoneDisplay: '(916) •••-5527', phoneE164: null, how: 'Call · AI review', words: '“Take me off your list”', at: '2026-09-28T18:20:00Z',
      deadline: '2026-10-13', businessDaysLeft: 8, deadlineProvisional: true, dialerMarked: false, contactsAfter: null },
    { id: 'oo-3', phoneDisplay: '(480) •••-0923', phoneE164: '+14805550923', how: 'Text · keyword', words: 'STOP', at: '2026-09-22T16:40:00Z',
      deadline: '2026-10-06', businessDaysLeft: 4, deadlineProvisional: true, dialerMarked: true,
      contactsAfter: { count: 3, channel: 'Text', lastAt: '2026-09-29T13:47:00Z', afterDeadline: false } },
    { id: 'oo-4', phoneDisplay: '(623) •••-4806', phoneE164: null, how: 'Text · AI review', words: '“Please don’t text me anymore”', at: '2026-09-10T16:05:00Z',
      deadline: '2026-09-24', businessDaysLeft: 0, deadlineProvisional: true, dialerMarked: true,
      contactsAfter: { count: 1, channel: 'Call', lastAt: '2026-09-26T19:10:00Z', afterDeadline: true } },
    { id: 'oo-5', phoneDisplay: '(520) •••-7712', phoneE164: null, how: 'Call · dialer code', words: 'Agent coded “DNC”', at: '2026-09-01T17:30:00Z',
      deadline: '2026-09-16', businessDaysLeft: 0, deadlineProvisional: true, dialerMarked: true, contactsAfter: null },
  ];

/** Sample: certificates CiV found in the client's records (only the start of each ID is ever shown). */
export const certificates: Certificate[] = [
  { id: 'cc-3', provider: 'TrustedForm', ref: '7f3a91c2…', source: "Client's own form", phoneMatch: true, state: 'claimed', stateLabel: 'Claimed', seenAt: '2026-09-28T14:02:00Z', deadlineAt: '2026-10-01T14:00:00Z',
    createdAt: '2026-09-28T13:58:00Z', expiresAt: '2029-09-28T13:58:00Z', page: 'solar.example.com/quote', usedBy: 4, problem: '' },
  { id: 'cc-2', provider: 'Jornaya', ref: 'A41C77E0…', state: 'waiting', stateLabel: 'Waiting to be claimed', seenAt: '2026-09-29T09:15:00Z', deadlineAt: '2026-10-02T09:10:00Z',
    createdAt: null, expiresAt: null, page: '', usedBy: 0, problem: '' },
  { id: 'cc-1', provider: 'TrustedForm', ref: '0b2e4d18…', state: 'lost', stateLabel: 'Lost: not claimed in time', seenAt: '2026-09-20T11:00:00Z', deadlineAt: '2026-09-23T10:55:00Z',
    createdAt: null, expiresAt: null, page: '', usedBy: 2, problem: '' },
];

/** Sample Lead Provenance page (Module 8). */
export const provenance: ProvenancePage = {
  period: 'October 2026', numbers: 2000,
  ladder: [
    { basis: 'feed', label: 'Lead platform feed', count: 0, share: 0, available: false },
    { basis: 'crm_field', label: 'CRM lead source', count: 1040, share: 52, available: true },
    { basis: 'invoice', label: 'Vendor invoice', count: 0, share: 0, available: false },
    { basis: 'cert_domain', label: 'Certificate website', count: 420, share: 21, available: true },
    { basis: 'manual_import', label: 'Uploaded list', count: 360, share: 18, available: true },
    { basis: 'untraced', label: 'Untraced', count: 180, share: 9, available: true },
  ],
  topSources: [
    { name: 'SolarLeads Inc', basis: 'CRM lead source', count: 610 },
    { name: 'go.sunpathsolar.com', basis: 'Certificate website', count: 300 },
    { name: 'HomeEnergy Match', basis: 'CRM lead source', count: 260 },
    { name: 'home-energy-match.example', basis: 'Certificate website', count: 120 },
  ],
  untraced: [
    { number: '(850) •••-0009', firstContactAt: '2026-10-06T16:00:00Z', tool: 'convoso', crmRecord: 'salesforce leads:00Q9', note: 'The CRM record names no vendor and carries no certificate.' },
    { number: '(415) •••-0231', firstContactAt: '2026-10-07T14:12:00Z', tool: 'convoso', crmRecord: '', note: 'No CRM record before the first contact.' },
  ],
  uploads: [
    { id: 'ib-1', label: 'Uploaded list · 1,240 records · 03 Oct 2026', system: 'crm', numbers: 1240, withEvidence: 210, stopBroughtBack: 2, optOutsCleared: 0, asked: 50, proofRate: 0.24 },
    { id: 'ib-2', label: 'Update upload · 300 records · 06 Oct 2026', system: 'crm_update', numbers: 300, withEvidence: 40, stopBroughtBack: 1, optOutsCleared: 1, asked: 50, proofRate: null },
    { id: 'ib-3', label: 'Dialer upload · list 1002 · 25 records · 05 Oct 2026', system: 'dialer', numbers: 25, withEvidence: 0, stopBroughtBack: 0, optOutsCleared: 0, asked: 0, proofRate: null },
  ],
  missing: [{ label: 'Text big enough (10 px, draft)', count: 2140 }, { label: 'Consent box not ticked in advance', count: 520 }, { label: 'Text easy to read (contrast)', count: 520 }],
};

export const proofRequests: ProofRequests = {
  canAnswer: true,
  lists: [{ batchKey: 'crm|salesforce|005U|20261003T101500', label: 'Uploaded list · 1,240 records · 03 Oct 2026', listSize: 1240, asked: 50, attached: 13, valid: 12, waitingReview: 1, none: 30, overdue: 0, rate: 0.24 }],
  requests: [
    { id: 'pr-1', batchKey: 'crm|salesforce|005U|20261003T101500', list: 'Uploaded list · 1,240 records · 03 Oct 2026', number: '(916) •••-0001', sentAt: '2026-10-08T09:00:00Z', dueAt: '2026-11-07T09:00:00Z',
      answer: null, answeredAt: null, answeredBy: null, fileType: null, fileName: null, fileUrl: null, review: null, reviewNote: null, consentDate: null },
    { id: 'pr-2', batchKey: 'crm|salesforce|005U|20261003T101500', list: 'Uploaded list · 1,240 records · 03 Oct 2026', number: '(916) •••-0007', sentAt: '2026-10-08T09:00:00Z', dueAt: '2026-11-07T09:00:00Z',
      answer: 'proof', answeredAt: '2026-10-09T11:00:00Z', answeredBy: 'Dana Reyes', fileType: 'Signed form or contract', fileName: 'signup-0007.pdf', fileUrl: null, review: null, reviewNote: null, consentDate: null },
    { id: 'pr-3', batchKey: 'crm|salesforce|005U|20261003T101500', list: 'Uploaded list · 1,240 records · 03 Oct 2026', number: '(916) •••-0012', sentAt: '2026-10-08T09:00:00Z', dueAt: '2026-11-07T09:00:00Z',
      answer: 'proof', answeredAt: '2026-10-09T11:05:00Z', answeredBy: 'Dana Reyes', fileType: 'Signed form or contract', fileName: 'signup-0012.pdf', fileUrl: null, review: 'valid', reviewNote: null, consentDate: '2026-09-01' },
  ],
};
