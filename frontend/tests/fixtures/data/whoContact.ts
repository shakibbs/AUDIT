import type { CheckColumn, WhoContact, WhoFound } from '@/api/types';

// Same sample client as the other pages: DNC check records and reassigned query logs not supplied, M14 informational,
// vendors A–G, internal list uploaded 28 Sep, 3 acquired lists. Our M38 is "Missed opt-outs", so the stale-registry check is M49.
// What CiV found for a vendor or list in this sample: no DNC check file or query logs, internal list compared.
function found(stillCalled: number): Record<CheckColumn, WhoFound> {
  return {
    national: { tone: 'gray', text: "Can't tell · no DNC check file" },
    state: { tone: 'gray', text: "Can't tell · no DNC check file" },
    internal: stillCalled ? { tone: 'bad', text: 'on your list still called', count: { n: stillCalled, label: 'on your list still called' } } : { tone: 'ok', text: 'None on your list called' },
    reassigned: { tone: 'gray', text: "Can't tell · no query logs" },
  };
}

const by = 'Dana Reyes (Admin) · 2 Oct 2026';

export const whoContact: WhoContact = {
  areas: [
    { id: 'dnc', title: 'National & state DNC', law: '47 C.F.R. §64.1200(c)(2)', checks: [
      { state: 'fail', name: 'Expired customer relationship used', result: '38 calls', source: 'records', metric: 'M40', why: 'Calls more than 3 months after an inquiry or 18 months after a purchase, found in your Salesforce records.' },
      { state: 'unverified', name: 'National registry checked', result: 'Not measured', source: 'none', metric: 'M13', why: 'Your DNC check records are not supplied. Upload them on the Source Registry.' },
      { state: 'unverified', name: 'Called after your provider flagged the number', result: 'Not measured', source: 'none', metric: 'M39', why: 'Needs your DNC check records.' },
      { state: 'unverified', name: 'Registry copy older than 31 days', result: 'Not measured', source: 'none', metric: 'M49', why: 'Needs your DNC check records. The law allows a copy no more than 31 days old.' },
      { state: 'unverified', name: 'State lists checked', result: 'Not measured', source: 'none', metric: 'M13', why: 'Needs your DNC check records.' },
    ], flags: [] },
    { id: 'idn', title: 'Internal do-not-call', law: '47 C.F.R. §64.1200(d)', checks: [
      { state: 'fail', name: 'Called after joining your list', result: '22 contacts', source: 'list', metric: 'M12', why: '11 numbers were contacted after they joined your list (uploaded 28 Sep).' },
      { state: 'fail', name: 'Stop requests that never reached your list', result: '6 of 41', source: 'records', metric: 'M41', isNew: true, why: '41 stop requests found in 6,820 reviewed calls and text replies; 6 never reached your list.' },
      { state: 'warn', name: 'Added within 10 business days', result: '91%', source: 'records', metric: 'M42', why: '37 were late. Median is 2 days.' },
      { state: 'pass', name: 'Removed from the list too early', result: 'None', source: 'list', metric: 'M44', why: 'Requests must be honored for 5 years.' },
      { state: 'pass', name: 'Called by another of your brands', result: 'None', source: 'records', metric: 'M43', why: 'Your brands share one list.' },
    ], flags: [
      { number: '(916) •••-2290', known: 'Joined your do-not-call list', from: 'Your internal list', flaggedOn: 'Aug 30', contactedOn: 'Sep 16', channel: 'Call' },
      { number: '(480) •••-7135', known: 'Joined your do-not-call list', from: 'Your internal list', flaggedOn: 'Sep 4', contactedOn: 'Sep 22', channel: 'Text' },
      { number: '(623) •••-4806', known: 'Replied “remove me”, never added', from: 'Twilio replies', flaggedOn: 'Sep 9', contactedOn: 'Sep 25', channel: 'Text' },
    ] },
    { id: 'rnd', title: 'Reassigned numbers', law: '47 C.F.R. §64.1200(m)', checks: [
      { state: 'fail', name: 'Contacted after a “wrong number” reply', result: '26 contacts', source: 'records', metric: 'M48', isNew: true, why: 'Once you are told the number changed hands, the safe harbor no longer applies.' },
      { state: 'fail', name: 'Contacted after the RND said the owner changed', result: '9 contacts', source: 'provider', metric: 'M35', why: 'From Somos reassigned-number results.' },
      { state: 'unverified', name: 'Covered by the safe harbor', result: 'Not measured', source: 'none', metric: 'M11', why: 'Your reassigned-number query logs are not supplied.' },
      { state: 'warn', name: 'Consent older than 12 months', result: '31%', source: 'records', metric: 'M47', why: 'Older consent means more numbers have changed hands.' },
    ], flags: [
      { number: '(520) •••-3318', known: 'Owner changed since consent', from: 'Somos RND', flaggedOn: 'Sep 1', contactedOn: 'Sep 18', channel: 'Call' },
      { number: '(928) •••-6054', known: 'Replied “wrong number”', from: 'Twilio replies', flaggedOn: 'Sep 8', contactedOn: 'Sep 19', channel: 'Text' },
    ] },
    { id: 'lit', title: 'Litigation signals', law: 'Targeting multiplier', checks: [
      { state: 'fail', name: 'Contacted after naming an attorney', result: '1 of 5', source: 'records', metric: 'M45', isNew: true, why: '3 demand letters in your complaint log and 2 replies naming an attorney; 1 person was contacted again.' },
      { state: 'warn', name: 'Numbers on your litigator list contacted', result: '4 contacts', source: 'list', metric: 'M14', why: '4 contacts to 2 numbers on your own litigator list. Shown for your information, never scored.' },
      { state: 'pass', name: 'Claims from serial plaintiffs', result: 'None', source: 'records', metric: 'M46', why: 'From court dockets.' },
    ], flags: [
      { number: '(916) •••-5527', known: 'On your litigator list', from: 'Your uploaded list', flaggedOn: 'Sep 14', contactedOn: 'Sep 15', channel: 'Call' },
      { number: '(480) •••-1964', known: 'On your litigator list', from: 'Your uploaded list', flaggedOn: 'Sep 2', contactedOn: 'Sep 21', channel: 'Call' },
    ] },
  ],
  glance: { contacts: 7120, words: 'in Sep 2026', lists: [
    { col: 'national', list: 'National DNC', tone: 'gray', verdict: "Can't tell", text: 'Your DNC check records are not uploaded, so CiV cannot see this check.', count: null, upload: { label: 'Upload DNC check records', source: 'dnc_checks' } },
    { col: 'state', list: 'State DNC', tone: 'gray', verdict: "Can't tell", text: 'Your DNC check records are not uploaded, so CiV cannot see this check.', count: null, upload: { label: 'Upload DNC check records', source: 'dnc_checks' } },
    { col: 'internal', list: 'Internal DNC', tone: 'bad', verdict: 'Checked, 4 called anyway', text: 'Every contact was compared with your list (4,120 numbers, uploaded 28 Sep). 4 numbers on it were still contacted.', count: { n: 4, label: 'called anyway' }, upload: null },
    { col: 'reassigned', list: 'Reassigned', tone: 'gray', verdict: "Can't tell", text: 'Your reassigned-number query logs are not uploaded, so CiV cannot see these checks.', count: null, upload: { label: 'Upload query logs', source: 'rnd_queries' } },
  ] },
  services: [
    { name: 'DNC check records', note: 'Not supplied · blocks M13', covers: { national: 'none', state: 'none' } },
    { name: 'Internal do-not-contact list', note: 'Uploaded 28 Sep · 4,120 numbers', covers: { internal: 'list' } },
    { name: 'Somos reassigned numbers', note: 'Synced 6 h ago', covers: { reassigned: 'provider' } },
    { name: 'Reassigned-number query logs', note: 'Not supplied · blocks M11', covers: { reassigned: 'none' } },
  ],
  leadSources: [
    { id: 'ls-a', group: 'vendor', name: 'Vendor A', note: 'Sub-ID 114 · 1,420 leads', checked: { national: true, state: true, internal: false, reassigned: false }, markedBy: { national: by, state: by, internal: null, reassigned: null }, found: found(3) },
    { id: 'ls-b', group: 'vendor', name: 'Vendor B', note: 'Sub-ID 22 · 1,000 leads', checked: { national: true, state: false, internal: false, reassigned: false }, markedBy: { national: by, state: null, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-c', group: 'vendor', name: 'Vendor C', note: '860 leads', checked: { national: false, state: false, internal: false, reassigned: false }, markedBy: { national: null, state: null, internal: null, reassigned: null }, found: found(1) },
    { id: 'ls-d', group: 'vendor', name: 'Vendor D', note: '640 leads', checked: { national: true, state: true, internal: true, reassigned: true }, markedBy: { national: by, state: by, internal: by, reassigned: by }, found: found(0) },
    { id: 'ls-e', group: 'vendor', name: 'Vendor E', note: 'Sub-ID 7 · 520 leads', checked: { national: false, state: false, internal: false, reassigned: false }, markedBy: { national: null, state: null, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-f', group: 'vendor', name: 'Vendor F', note: '480 leads', checked: { national: true, state: false, internal: false, reassigned: false }, markedBy: { national: by, state: null, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-g', group: 'vendor', name: 'Vendor G', note: '80 leads', checked: { national: false, state: false, internal: false, reassigned: false }, markedBy: { national: null, state: null, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-1', group: 'upload', name: 'Acquired list 1', note: '1,240 numbers', checked: { national: true, state: false, internal: false, reassigned: false }, markedBy: { national: by, state: null, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-2', group: 'upload', name: 'Acquired list 2', note: '860 numbers', checked: { national: true, state: true, internal: false, reassigned: false }, markedBy: { national: by, state: by, internal: null, reassigned: null }, found: found(0) },
    { id: 'ls-3', group: 'upload', name: 'Acquired list 3', note: '312 numbers', checked: { national: false, state: false, internal: false, reassigned: false }, markedBy: { national: null, state: null, internal: null, reassigned: null }, found: found(0) },
  ],
};
