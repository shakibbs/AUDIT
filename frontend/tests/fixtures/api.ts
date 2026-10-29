// Test fixture: an in-memory stand-in for the Django API, used only by the automatic tests (never by the portal).
import type { CheckColumn, DataHealth, HashCheck, RatingEngine, Role, SearchHit, Session, View } from '@/api/types';
import { gradeOf } from '@/lib/format';
import { accessLog, readiness, settings, users } from './data/account';
import { reportRuns, reportTypes, sources, uploads } from './data/disclosure';
import { domains, score } from './data/domains';
import { calendar, regChanges, rulebook } from './data/engagement';
import { certificates, proofRequests, provenance, consent, consentPages, contacts, evidenceFiles, KNOWN_HASH, legalHolds, optOuts, position, revocation, vault } from './data/evidence';
import { insureds, litigation } from './data/insurer';
import { conduct, leads, vendorSummary } from './data/intelligence';
import { metrics } from './data/metrics';
import { session } from './data/session';
import { whoContact } from './data/whoContact';
import { actions, alerts } from './data/work';

export interface MockRequest { method: string; path: string; query?: Record<string, string>; body?: unknown }
export interface MockResponse { status: number; body: unknown }

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const fresh = () => clone({ session, actions, alerts, consentPages, proofRequests, legalHolds, uploads, reportRuns, readiness, settings, users, accessLog, regChanges, whoContact });

let db = fresh();

/** Restores the fixtures; tests call this after each case. */
export function resetMock(): void {
  db = fresh();
}

const ok = (body: unknown): MockResponse => ({ status: 200, body });
const fail = (status: number, detail: string): MockResponse => ({ status, body: { detail } });

function visibleSession(): Session {
  const s = db.session;
  if (s.view === 'underwriter') {
    return { ...s, orgKind: 'insurer', canSwitchView: true, userId: 'u-uw', name: 'J. Merchant', initials: 'JM', email: 'j.merchant@falconrisk.example',
      clientId: 'falcon', clientName: 'Falcon Risk Services', vertical: 'Underwriting pilot · 5 insureds' };
  }
  return { ...s, orgKind: 'client', canSwitchView: true };
}

// An underwriter reaches only insurer data: never a client's contacts, findings, alerts or sources (v3 §9a).
const UNDERWRITER_READS = ['session', 'insureds', 'litigation', 'rating-engine', 'rulebook', 'reg-changes', 'search'];
// What a client sees of the insurer side: its own company only.
const OWN_INSURED = 'sunpath';

const INSURER_PAGES: [string, string][] = [['/portfolio', 'Portfolio'], ['/exposure', 'Exposure Indicator'], ['/integrity', 'Data Integrity'], ['/attestation', 'Risk Attestation'], ['/litigation', 'Litigation Intelligence'], ['/uw-export', 'Underwriting Export'], ['/rulebook', 'Rulebook'], ['/regulatory', 'Regulatory Changes']];
const SHARED_PAGES: [string, string][] = [['/integrity', 'Data Integrity'], ['/attestation', 'Risk Attestation'], ['/uw-export', 'Underwriting Export']];

// Index of the chosen month in every four-point history; the latest month when absent.
function periodIndex(period: string | undefined): number {
  const i = score.history.findIndex((h) => h.period === period);
  return i === -1 ? score.history.length - 1 : i;
}

function scoreFor(period: string | undefined) {
  const i = periodIndex(period);
  const last = score.history.length - 1;
  if (i === last) return score;
  const point = score.history[i];
  return {
    ...score, score: point.score, grade: point.grade, rawGrade: gradeOf(point.score), cap: null,
    confirmedScore: Math.round((point.score - 1.7) * 10) / 10, caps: [],
    previous: i > 0 ? score.history[i - 1].score : point.score, history: score.history.slice(0, i + 1),
    families: score.families.map((f) => ({ ...f, score: f.score === null ? null : Math.round((f.score - ((score.score ?? 0) - point.score)) * 10) / 10 })),
  };
}

function search(q: string): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const has = (...parts: (string | null)[]) => parts.some((p) => p?.toLowerCase().includes(needle));
  const digits = needle.replace(/\D/g, '');
  if (db.session.view === 'underwriter') {
    return [
      ...insureds.filter((i) => has(i.name, i.industry)).map((i): SearchHit => ({ kind: 'insured', id: i.id, label: i.name, hint: 'Insured' })),
      ...INSURER_PAGES.filter(([, label]) => has(label)).map(([id, label]): SearchHit => ({ kind: 'page', id, label, hint: 'Page' })),
    ].slice(0, 10);
  }
  const pages: [string, string][] = [['/', 'Overview'], ['/scorecard', 'Audit Scorecard'], ['/actions', 'Action Queue'], ['/alerts', 'Alerts'], ['/ledger', 'Contact Ledger'], ['/consent', 'Consent Integrity'], ['/revocation', 'Revocation Integrity'], ['/who-contact', 'Who You Contact'], ['/vault', 'Evidence Vault'], ['/conduct', 'Contact Conduct'], ['/leads', 'Lead Provenance'], ['/vendors', 'Vendor Ledger'], ['/sources', 'Source Registry'], ['/reports', 'Reports & Exports'], ['/rulebook', 'Rulebook'], ['/regulatory', 'Regulatory Changes'], ['/setup', 'Setup & Readiness'], ['/settings', 'Settings'], ['/users', 'Users & Access']];
  pages.push(...SHARED_PAGES);
  return [
    ...domains.filter((d) => has(d.code, d.name)).map((d): SearchHit => ({ kind: 'domain', id: d.code, label: d.name, hint: `Domain ${d.code}` })),
    ...metrics.filter((m) => has(m.code, m.name)).map((m): SearchHit => ({ kind: 'metric', id: m.code, label: m.name, hint: `Metric ${m.code}` })),
    ...(digits.length >= 3 ? contacts.filter((c) => c.phoneE164.includes(digits)).map((c): SearchHit => ({ kind: 'number', id: c.phoneE164, label: c.phoneDisplay, hint: 'Evidence file' })) : []),
    ...vendorSummary.vendors.filter((v) => has(v.name, v.subId)).map((v): SearchHit => ({ kind: 'vendor', id: v.id, label: v.subId ? `${v.name} · sub-ID ${v.subId}` : v.name, hint: 'Vendor' })),
    ...pages.filter(([, label]) => has(label)).map(([id, label]): SearchHit => ({ kind: 'page', id, label, hint: 'Page' })),
  ].filter((hit, i, all) => all.findIndex((h) => h.kind === hit.kind && h.id === hit.id) === i).slice(0, 10);
}

function log(action: string, object: string): void {
  db.accessLog.unshift({ at: '2026-09-30T09:00:00Z', actor: db.session.name, role: db.session.role, action, object });
}

function read(path: string, q: Record<string, string>): MockResponse {
  const seg = path.split('/').filter(Boolean);
  const underwriter = db.session.view === 'underwriter';
  if (underwriter && !UNDERWRITER_READS.includes(seg[0])) return fail(403, 'Not available in the underwriter view.');
  const i = periodIndex(q.period);
  switch (seg[0]) {
    case 'session': return ok(visibleSession());
    case 'score': return ok(scoreFor(q.period));
    case 'domains': return ok(domains.map((d) => ({ ...d, score: d.history[i] })));
    case 'actions': return ok(db.actions);
    case 'alerts': return ok(db.alerts);
    case 'contacts': if (seg[1]) {
      const one = contacts.find((c) => c.id === decodeURIComponent(seg[1]));
      return one ? ok(one) : fail(404, 'No such contact.');
    } else return ok(contacts.filter((c) => (!q.status || q.status === 'ALL' || c.status === q.status) && (!q.q || c.phoneE164.includes(q.q.replace(/\D/g, '')))));
    case 'consent': return ok(consent);
    case 'consent-pages': return ok(db.consentPages);
    case 'certificates': return ok(certificates);
    case 'provenance': return ok(provenance);
    case 'proof-requests': return ok(db.proofRequests);
    case 'revocation': return ok(revocation);
    case 'optouts': return ok(optOuts);
    case 'who-contact': return ok(db.whoContact);
    case 'vault': return ok(vault);
    case 'position': return ok({ ...position, sample: true, ref: '+14805550923', phone: q.phone || position.phone, date: q.date || position.date, insideCoverage: (q.date || position.date) >= '2026-05-01' });
    case 'hash-check': {
      const found = (q.hash ?? '').trim().toLowerCase() === KNOWN_HASH;
      const result: HashCheck = found
        ? { found, artifact: 'TrustedForm certificate · lead L-88214', capturedAt: '2026-09-04T09:12:40Z', anchoredOn: '2026-09-05', tier: 2 }
        : { found, artifact: null, capturedAt: null, anchoredOn: null, tier: null };
      return ok(result);
    }
    case 'legal-holds': return ok(db.legalHolds);
    case 'evidence': {
      const file = evidenceFiles[decodeURIComponent(seg[1] ?? '')];
      return file ? ok(file) : fail(404, 'No evidence file for this number in the sample data.');
    }
    case 'metrics': return ok(metrics.map((m) => (i === score.history.length - 1 ? m : { ...m, value: m.history[i], display: m.history[i] === null ? m.display : `${m.history[i]}${m.unit}` })));
    case 'conduct': return ok(conduct);
    case 'leads': return ok(leads);
    case 'vendors': return ok(vendorSummary);
    case 'vendor-contracts': return ok([]);  // sample: none uploaded yet (real list from Django)
    case 'rating-engine': return underwriter ? ok(ratingEngine) : fail(403, 'Only the insurer sets its rating engine.');
    case 'buyer-links': return ok({ links: [] });  // sample: nobody shared yet (real list from Django)
    case 'sources': return ok(sources);
    case 'uploads': return ok(db.uploads);
    case 'reports': return ok({ types: reportTypes, runs: db.reportRuns });
    case 'rulebook': return ok(seg[1] === 'calendar' ? { ...calendar, year: Number(q.year) || calendar.year } : { ...rulebook, impact: [] });
    case 'reg-changes': return ok(db.regChanges);
    case 'readiness': return ok(db.readiness);
    case 'settings': return ok(db.settings);
    case 'billed-numbers': return fail(404, 'The list of billed numbers comes from the real server (sample data has none).');
    case 'users': return ok(db.users);
    case 'access-log': return ok(db.accessLog);
    case 'search': return ok(search(q.q ?? ''));
    case 'insureds': {
      if (!seg[1]) return underwriter ? ok(insureds) : fail(403, 'Only the insurer sees its portfolio.');
      // A client asks for its own company as 'own' (the backend's own sheet).
      if (!underwriter && seg[1] !== 'own') return fail(403, 'You can see only your own company.');
      const insured = insureds.find((x) => x.id === (seg[1] === 'own' ? OWN_INSURED : seg[1]));
      return insured ? ok(insured) : fail(404, 'Insured not found.');
    }
    case 'litigation': return underwriter ? ok(litigation) : fail(403, 'Only the insurer sees this page.');
    case 'data-health': {
      const health: DataHealth = {
        accessLevel: 4, accessLabel: 'Level 4 · dialer, texting, certificates, lead feed and CRM connected', lastChangeAt: '2026-09-30T08:52:00Z',
        sources: { live: sources.filter((x) => x.status === 'current').length, stale: sources.filter((x) => x.status === 'stale').length, notSupplied: sources.filter((x) => x.status === 'not_supplied').length, total: sources.length },
        recordsCompleteness: 0.94, completenessFloor: 0.9,
        conversationReview: { reviewed: 6820, optOutsFound: 41, missed: 6, notMarkedFirstCheck: 11 },
      };
      return ok(health);
    }
    default: return fail(404, `No mock for GET ${path}`);
  }
}

const LAST_ADMIN = 'A company needs at least one active Admin.';
const otherAdmin = (id: string) => db.users.some((u) => u.id !== id && u.role === 'admin' && u.status === 'active');

// The sample insurer's rating engine (Module 15): saved here only; nothing is ever sent.
let ratingEngine: RatingEngine = { url: '', keyHint: '', monthly: false, sends: [] };
function rating(method: string, verb: string | undefined, body: Record<string, unknown>): MockResponse {
  if (db.session.view !== 'underwriter') return fail(403, 'Only the insurer sets its rating engine.');
  if (method === 'DELETE') { ratingEngine = { url: '', keyHint: '', monthly: false, sends: [] }; return ok(ratingEngine); }
  if (verb === 'send') {
    if (!ratingEngine.url) return fail(400, 'Add your rating engine address and key first.');
    ratingEngine.sends.unshift({ at: new Date().toISOString(), company: String(body.insured ?? ''), ok: true, detail: 'Accepted by the rating engine (sample)', by: 'J. Merchant' });
    return ok({ ok: true, detail: 'Accepted by the rating engine (sample) · logged in the insured’s access log' });
  }
  const url = String(body.url ?? '');
  if (!url.startsWith('https://')) return fail(400, 'Use an https:// address.');
  const key = String(body.key ?? '');
  if (!key && !ratingEngine.keyHint) return fail(400, 'Enter the key your rating engine gave you.');
  ratingEngine = { ...ratingEngine, url, monthly: Boolean(body.monthly), keyHint: key ? key.slice(-4) : ratingEngine.keyHint };
  return ok(ratingEngine);
}

function write(method: string, path: string, body: Record<string, unknown>): MockResponse {
  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'rating-engine') return rating(method, seg[1], body);
  if (db.session.view === 'underwriter' && seg[0] !== 'session') return fail(403, 'The underwriter view is read-only.');
  // "/session/sign-in" names its verb second; "/alerts/al-1/review" names it third, after the id.
  const verb = seg[0] === 'session' ? seg[1] : seg[2];
  const key = `${method} ${seg[0]}${verb ? `/${verb}` : ''}`;
  switch (key) {
    case 'POST session/sign-in': {
      if (!body.email || !body.password) return fail(400, 'Enter your email and password.');
      db.session.signedIn = true;
      return ok(visibleSession());
    }
    case 'POST session/sign-out': db.session.signedIn = false; return ok(visibleSession());
    case 'POST session/password': {
      if (!body.current) return fail(400, 'Your current password is not right.');
      if (String(body.password ?? '').length < 12) return fail(400, 'This password is too short. It must contain at least 12 characters.');
      return ok({ done: true });
    }
    // Sample data only: switch the view, or see the portal as another role or engagement mode.
    case 'POST session/view-as': {
      if (body.view) db.session.view = body.view as View;
      if (body.role) db.session.role = body.role as Role;
      if (typeof body.isCounsel === 'boolean') db.session.isCounsel = body.isCounsel;
      return ok(visibleSession());
    }
    case 'PATCH actions': {
      const action = db.actions.find((a) => a.id === seg[1]);
      if (!action) return fail(404, 'Action not found.');
      Object.assign(action, body);
      action.overdue = action.due !== null && action.due < '2026-09-30' && action.status !== 'resolved';
      log('Updated', `Action ${action.rank}`);
      return ok(action);
    }
    case 'PATCH consent-pages': {
      const page = db.consentPages.find((p) => p.id === seg[1]);
      if (!page) return fail(404, 'Page not found.');
      Object.assign(page, body);
      return ok(page);
    }
    case 'POST proof-requests/answer': {
      const req = db.proofRequests.requests.find((r) => r.id === seg[1]);
      if (!req) return fail(404, 'Proof request not found.');
      // A file upload arrives here without a JSON body: sample data records it as attached.
      Object.assign(req, body.none ? { answer: 'none', fileName: null, fileType: null } : { answer: 'proof', fileName: 'proof.pdf', fileType: 'Signed form or contract' },
        { answeredAt: '2026-10-21T10:00:00Z', answeredBy: db.session.name });
      return ok(req);
    }
    case 'POST alerts/review': {
      const alert = db.alerts.find((a) => a.id === seg[1]);
      if (!alert) return fail(404, 'Alert not found.');
      alert.reviewed = true;
      return ok(alert);
    }
    case 'POST legal-holds': {
      const hold = { id: `lh-${db.legalHolds.length + 1}`, scope: body.scope, target: body.target, reason: body.reason, setBy: `${db.session.name}`, setOn: '2026-09-30', releasedOn: null };
      db.legalHolds.unshift(hold as (typeof db.legalHolds)[number]);
      log('Set legal hold', String(body.target));
      return ok(hold);
    }
    case 'POST legal-holds/release': {
      const hold = db.legalHolds.find((h) => h.id === seg[1]);
      if (!hold) return fail(404, 'Hold not found.');
      hold.releasedOn = '2026-09-30';
      log('Released legal hold', hold.target);
      return ok(hold);
    }
    case 'POST uploads': {
      // A real upload arrives as a file (no JSON body): sample data records a placeholder row.
      const upload = { artifactId: `art-${9100 + db.uploads.length}`, source: String(body.source ?? 'Internal do-not-contact list'), fileName: String(body.fileName ?? 'upload.csv'), sha256: String(body.sha256 ?? `${'0'.repeat(64)}`), receivedAt: '2026-09-30T09:00:00Z', rowsRead: Number(body.rows ?? 0), rowsRejected: 0 };
      db.uploads.unshift(upload);
      log('Uploaded', upload.fileName);
      return ok(upload);
    }
    case 'POST reports': {
      if (['Evidence file export', 'Certification pack'].includes(String(body.name))) return fail(400, 'Paste the numbers in the bulk evidence export below the cards.');
      if (String(body.name) === 'Litigation evidence package') {
        const quote = { id: `quote-${db.reportRuns.length}`, name: String(body.name), period: String(body.period), requestedBy: db.session.name, at: '2026-09-30T09:00:00Z', status: 'requested' as const };
        db.reportRuns.unshift(quote);
        log('Asked for a quote', quote.name);
        return ok(quote);
      }
      const run = { id: `r-${32 + db.reportRuns.length}`, name: String(body.name), period: String(body.period), requestedBy: db.session.name, at: '2026-09-30T09:00:00Z', status: 'queued' as const };
      db.reportRuns.unshift(run);
      log('Requested', run.name);
      return ok(run);
    }
    // The company's lawyer: agree or disagree with a draft rule update (advice; CiV alone approves).
    // "Can I call now?" in the sample data: a fixed answer shaped like the real one. The number is not kept.
    case 'POST can-call': {
      const digits = String(body.number ?? '').replace(/\D/g, '');
      if (digits.length < 10) return fail(400, 'Enter a full phone number.');
      const area = digits.slice(-10, -7);
      const florida = area === '850';
      return ok({
        number: `(${area}) •••-${digits.slice(-4)}`, state: florida ? 'FL' : 'CA', country: 'US', timeZones: florida ? ['America/Chicago', 'America/New_York'] : ['America/Los_Angeles'],
        confidence: florida ? 'low' : 'medium', checkedAt: '2026-09-30T23:40:00Z', verdict: florida ? 'not_safe' : 'ok', hours: florida ? '8am – 8pm' : '8am – 9pm',
        status: 'tbd', draft: true, place: florida ? 'FL' : 'Federal', holidays: 'State holiday restrictions: not set yet (counsel item A8)',
        zones: florida ? [{ zone: 'America/Chicago', localTime: 'Wed 7:40 PM', allowed: true }, { zone: 'America/New_York', localTime: 'Wed 8:40 PM', allowed: false }]
          : [{ zone: 'America/Los_Angeles', localTime: 'Wed 4:40 PM', allowed: true }],
        note: florida ? 'The number could be in more than one time zone: the stricter one decides. Draft hours: not confirmed by a lawyer yet.' : 'Draft hours: not confirmed by a lawyer yet.',
      });
    }
    case 'POST rule-updates/review': {
      if (!db.session.isCounsel) return fail(403, "Only your company's lawyer can do this.");
      const update = db.regChanges.flatMap((c) => c.updates ?? []).find((u) => u.id === seg[1]);
      if (!update) return fail(404, 'Rule update not found.');
      if (update.state !== 'draft') return fail(400, 'CiV has already decided on this update.');
      update.myReview = { verdict: body.verdict === 'disagree' ? 'disagree' : 'agree', comment: String(body.comment ?? ''), by: db.session.name, at: '2026-09-30T09:00:00Z' };
      log('Reviewed rule update', `${update.rule} · ${update.myReview.verdict}`);
      return ok(update);
    }
    // The company's lawyer tells CiV about a law change. Only CiV sees it.
    case 'POST reg-changes': {
      if (seg[1] !== 'suggest') return fail(404, `No mock for ${method} ${path}`);
      if (!db.session.isCounsel) return fail(403, "Only your company's lawyer can do this.");
      if (!body.title || !body.summary || !body.jurisdiction) return fail(400, 'Enter a title, the place and a summary.');
      log('Suggested a law change', String(body.title));
      return ok({ id: 'cs-1', received: true });
    }
    case 'POST reg-changes/confirm': {
      const change = db.regChanges.find((c) => c.id === seg[1]);
      if (!change) return fail(404, 'Change not found.');
      change.confirmed = true;
      return ok(change);
    }
    // A client switch is a statement, not proof: it is logged and never changes a score.
    case 'PATCH who-contact': {
      const source = db.whoContact.leadSources.find((l) => l.id === seg[1]);
      const column = body.column as CheckColumn;
      if (!source || !(column in source.checked)) return fail(404, 'Lead source not found.');
      source.checked[column] = Boolean(body.checked);
      log(source.checked[column] ? 'Checked' : 'Unchecked', `${source.name} · ${column}`);
      return ok(source);
    }
    case 'PATCH setup': {
      const item = db.readiness.setup.find((s) => s.id === seg[1]);
      if (!item) return fail(404, 'Item not found.');
      item.done = Boolean(body.done);
      return ok(item);
    }
    case 'PATCH settings/notifications': {
      const n = db.settings.notifications.find((x) => x.kind === body.kind);
      if (!n) return fail(404, 'Notification not found.');
      n.email = Boolean(body.email);
      return ok(n);
    }
    case 'POST users/resend': return ok(db.users.find((u) => u.id === seg[1]) ?? {});
    case 'POST users': {
      if (db.session.role !== 'admin') return fail(403, 'Only an Admin can do this.');
      if (!body.email) return fail(400, 'Enter an email address.');
      const user = { id: `inv-${db.users.length + 1}`, name: String(body.name || body.email), email: String(body.email), role: (body.role as Role) || 'member', isCounsel: Boolean(body.isCounsel), status: 'invited' as const, lastSeen: null };
      db.users.push(user);
      log('Invited', user.email);
      return ok(user);
    }
    case 'PATCH users': {
      const user = db.users.find((u) => u.id === seg[1]);
      if (db.session.role !== 'admin') return fail(403, 'Only an Admin can do this.');
      if (!user) return fail(404, 'User not found.');
      if (body.role === 'member' && user.role === 'admin' && !otherAdmin(user.id)) return fail(400, LAST_ADMIN);
      if (body.role) user.role = body.role as Role;
      if (typeof body.isCounsel === 'boolean') user.isCounsel = body.isCounsel;
      return ok(user);
    }
    case 'DELETE users': {
      const user = db.users.find((u) => u.id === seg[1]);
      if (db.session.role !== 'admin') return fail(403, 'Only an Admin can do this.');
      if (!user) return fail(404, 'User not found.');
      if (user.id === db.session.userId) return fail(400, 'You cannot turn off your own access.');
      if (user.role === 'admin' && !otherAdmin(user.id)) return fail(400, LAST_ADMIN);
      db.users = db.users.filter((u) => u.id !== seg[1]);
      log('Removed access', user.email);
      return ok({ removed: true });
    }
    default: return fail(404, `No mock for ${method} ${path}`);
  }
}

export function mockApi({ method, path, query = {}, body }: MockRequest): MockResponse {
  const open = path.startsWith('/session');
  if (!open && !db.session.signedIn) return fail(401, 'Sign in to continue.');
  return method === 'GET' ? read(path, query) : write(method, path, (body ?? {}) as Record<string, unknown>);
}
