# CiV client portal (frontend)

Next.js + TypeScript portal for the Comply iV Automated TCPA Audit System.

Docs are in `../docs/`. The backend lives in its own repo: **[shakibbs/Audit-backend](https://github.com/shakibbs/Audit-backend)**.
The two repos never import from each other; they talk only over `/api`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit and screen tests
npm run typecheck
npm run lint
npm run build
```

### The backend is required (no sample data)

Since 2026-10-23 **every page comes from the Django backend**: the portal never shows sample data. Create
`.env.local` with

```
BACKEND_URL=http://localhost:8000
```

and restart `npm run dev`. Without `BACKEND_URL` every `/api` call answers 503 "The CiV server address is not set".
Anything CiV does not measure yet comes back empty or null, and the page says **"Not measured"** (with the reason),
never a made-up number. The old sample lives only in `tests/fixtures/` for the automatic tests.

## Users and views

- **Roles:** client users are **Admin** or **Member**, plus an "is our lawyer" mark. Everyone sees every page (no
  lawyer-only mode since 2026-10-22); only the lawyer reviews rule drafts and suggests law changes; Admins and the
  lawyer sign statements, decide findings, upload and export evidence; only Admins invite people and share with insurers. **Settings and Users & Access are for the Admin only** (not in
  others' account menu; opening them shows "Only an Admin can open this page").
- **Owner / Underwriter** is each client user's own **view switch** in the account menu (saved per person), not a role. Underwriter view shows the
  insurer pages: `/portfolio`, `/exposure`, `/integrity`, `/attestation`, `/litigation`, `/uw-export`,
  `/rulebook`, `/regulatory`. The owner never sees dollar figures.
- Access is enforced in the shell (`src/lib/views.ts`) and in the API (403s). CiV staff never use this
  portal; they use the CiV admin panel in the backend.
- **Top bar:** search · data freshness and month · account menu. The **account menu** (top right) holds
  Setup & Readiness, Settings, Users & Access, the role (shown, not changeable), the view switch and dark mode.

## Layout

| Path | What it holds |
|---|---|
| `src/app/(portal)/*/page.tsx` | One route per page; each only renders its screen |
| `src/app/sign-in` | Sign-in, password reset, new password and invite links |
| `src/app/api/[...path]/route.ts` | Serves `/api/*`: every request goes to Django |
| `src/server/backend.ts` | Forwarding to Django (cookies, CSRF, visitor address; file names, privacy and `X-Not-Found` headers back) |
| `src/screens/<page>/` | One folder per page; one component per file |
| `src/components/ui` | Shared building blocks (cards, pills, drawer, tabs) |
| `src/components/charts` | Hand-drawn SVG/HTML charts |
| `src/components/shell` | Sidebar, top bar, search, banners, drawer host |
| `src/components/drawers` | Detail panels: domain, metric, contact, action, vendor, Who You Contact area |
| `src/api/types.ts` | **The contract with the backend** |
| `src/api/queries.ts` | One hook per endpoint |
| `src/api/client.ts` | Fetch wrapper (sends the CSRF token Django needs) |
| `src/lib/wording.ts` | Banned-wording guard; tests scan every screen and fixture |
| `src/lib/exposure.ts`, `src/lib/lossModel.ts` | Exposure Indicator v2.2 and loss model v0 math |
| `tests/` | Screen tests; `tests/fixtures/` holds the test-only stand-in API and its data (alias `@fixtures`) |

## Pages

Your position: Overview, Audit Scorecard (six factor tiles + factor register), Action Queue, Alerts ·
Evidence: Consent Integrity, Contact Ledger, Revocation Integrity, **Who You Contact** (DNC, internal list,
reassigned numbers, litigation signals; who checked what; checks), Evidence Vault, evidence file per number ·
Intelligence: Contact Conduct, Lead Provenance, Vendor Ledger · Disclosure: Source Registry, Reports &
Exports · Engagement: Rulebook, Regulatory Changes · Shared with your insurer: Data Integrity, Risk
Attestation, Underwriting Export · Account menu (top right): Setup & Readiness, Settings, Users & Access ·
Underwriter view: Portfolio, Exposure Indicator, Litigation Intelligence.

Rulebook (two tabs: **Settings** with search and status filter, and **Calendar & hours**: holidays, calling hours
and limits by state, opt-out timing, time-zone order) and **Regulatory Changes** (draft rule values that the
company's lawyer can agree or disagree with, and "Suggest a change") come from Django when `BACKEND_URL` is set.
Revocation Integrity starts with the **Opt-outs** card (every opt-out with its business-day deadline, dialer marked,
contacts after).

Data health (`/data-health`): the Overview's **Records completeness** box shows the latest month's percentage over
every connected tool (each checked by its bill, its own count or its working days) with "Complete" or "Incomplete
data" and a one-line reason, "Not available" when no tool gave a second number yet, or "Not yet measured". The
"Opt-outs your dialer missed" card reads `conversationReview` (Module 9: AI review counts, missed, not marked at first
check); "Not yet measured" until the AI has read anything; "Nothing read yet" until the first record arrives.

**Consent results (Module 6, strict reading):** Contact Ledger rows show Verified / Weak / Conflicting / No proof /
Pending / Not needed with the reason in words, the five checks ("Not yet measured" for checks CiV cannot run yet) and
the proof used; "Not checked yet" (`NOT_CHECKED`) only in the minute before the engine runs, never a worst case. The
number page adds a **Consent** card (current owner's proofs, what the latest contact needed, history of changes, not
yet measured) and the real opt-outs in the timeline. Consent Integrity's Summary and Expiry tabs read `/consent`
(pending and frozen counted apart), and a **Your certificates** card reads `/certificates`; the Wording tab is
real since Module 7: each consent page with its source (own form / vendor / uploaded list), CiV's photos (through
`/consent-pages/.../photo/...`; the proxy passes bytes), the consent words and the checklist (✅ / ❌ with its effect /
⚠️ / ℹ️ / ⏳ needs AI), no approve/reject mark. Your certificates shows each one's source and phone match. Numbers appear
only masked (area code + last 4). The number page adds the
**calling window**, **owners of the number** and the real **seal**; Rulebook → Calendar & hours starts with **"Can I call
now?"**. Revocation Integrity's **Opt-outs card** reads `/optouts` (the real STOP list from Django).

**Revocation (Module 9):** CiV has no paid test lines (owner decision): M08 / M09, the opt-out matrix, the
time-to-stop chart and the "Opt-out measurement" card come from the client's real opt-outs (`/revocation`, merged), and
the wording says "opt-outs", not "test opt-outs". The Opt-outs table shows "Dialer marked" from CiV's tool checks, each
tool's answer, an amber "Urgent: a tool has not marked it", and "AI result · not counted in your score yet" (AI before
its accuracy exam); its All / Open / Late / Contacted after STOP filters are tested. Who You Contact gets M41, M42, M48
and M45 from Django once the AI has read anything; Overview M08 comes from `/metrics`.

**Lead Provenance (Module 8)** keeps its existing cards (leads inspected, consent completeness, page match, signal
levels, frequent signals, most often missing from `/leads`; signal levels, frequent signals and page match say "Not measured" until lead inspection exists) and adds,
below them, from `/provenance` and `/proof-requests`: where this month's called numbers came from (ladder chart, top
sources), the untraced list, uploaded lists (CRM, update uploads, dialer lists) with evidence, STOP numbers brought
back and proof rate, and proof requests. Proof
requests: Admins and the company's lawyer attach a file (multipart through `apiUpload`; the proxy passes bytes) or
say "We have none". The number page says where the number came from; the Overview's attention strip counts proof
requests waiting.

**Every page is real** (2026-10-23): the proxy forwards each request to Django and passes the answer back unchanged
(no sample filled in). Django sends each page's full shape: fixed words (metric and domain names, Who You Contact
areas, setup checklist labels, report types, litigation reference text) come from the backend too; values not measured
yet are null or empty. The company's own insurer pages read `/insureds/own`, the same sheet its insurer receives. The
contact panel loads its contact by ID (`/contacts/<id>`).

The **Upload centre** sends the file itself (multipart through `apiUpload`); Django keeps it, fingerprints it and reads
its rows (CSV; policies and contracts may also be PDF or Word).

Metric numbers: ours stay as they are (M38 = AI "Missed opt-outs"). Who You Contact uses M39–M48 from the
v2 prototype, and its stale-registry check is **M49**.

## Hosting

**Server (Docker, current):** `Dockerfile` builds a standalone Next.js server (`output: 'standalone'`).
It is started together with the backend and database by `deploy/docker-compose.yml` in the
[Audit-backend](https://github.com/shakibbs/Audit-backend) repo; see its README, "Deploy". Inside
Docker the portal reaches Django at `BACKEND_URL=http://backend:8000`.

**Automatic updates:** every push to `main` that changes `frontend/` runs the checks (typecheck, lint,
tests) in `.github/workflows/deploy.yml`; if they pass, GitHub updates the server. See the Audit-backend
README, "Automatic updates". Docs-only pushes do not redeploy.

### Vercel (alternative)

`vercel.json` is in this folder; set Vercel's **Root Directory** to `frontend`.
Set `BACKEND_URL` in Vercel's environment variables once the backend is hosted.

**Scores (Module 10):** the month picker lists every month since the client's start date (from `/session`), with a
"This month was revised…" notice when a locked month was saved again. The Audit Score card, the domain cards and the
factor map read the saved scores (`/score`, `/domains` merged by code, `exposure.inside` on `/insureds/<ref>`): a
domain is the mean of its metrics' scores, the Audit Score the mean of the measured domains, and the score card adds
"Partial: n of 6 factors measured · Draft bands". Pending factors are null and the Exposure spreads their weight over
the measured ones. Fields not measured yet (confirmed-rules score, unmeasured domains, a month with no contacts) say "Not measured".
The insurer Litigation page takes WebRecon's monthly numbers and the fixed reference cards from `/litigation`.

**Findings, alerts and reports (Module 11):** the Action Queue and the Overview's "Things to fix" read `/actions`
(findings in plain words, severity, masked examples, score impact, "Found again"); the action panel saves owner, due
date, status, a decision with its note and a dispute (`PATCH /actions/<id>`, Admins and the company's lawyer only),
and labels each common response "Draft · for your lawyers to review". The Alerts page and the Overview's alert box
read `/alerts` (fully from Django: portal only, "Resolved", "Reviewed by"). The projected score is real (top 5
findings fixed). Reports & Exports: Period audit report, Rulebook snapshot and Metric export are made by Django and
download from the history; files pass through the proxy untouched; evidence file, certification pack and litigation
package come with Module 14.

**Vendors (Module 12):** the Vendor Ledger reads `/vendors` (scorecards from Django). Admins and the company's lawyer upload a vendor contract (`AddContractCard`, `ContractForm`: private file,
end date, dispute days) and see lead dispute candidates (`DisputeList`, `/vendor-contracts`, `/vendor-disputes`).

**Evidence vault (Module 14):** the evidence file per number exports as PDF or JSON (`/evidence-file`), Bulk export
makes a sealed bundle of up to 25 numbers (`/evidence-bundle`), and the Vault manages legal holds (`/legal-holds`).
Admins and the company's lawyer only.

**Insurer views (Module 15):** Settings → Insurer sharing (`SharingTab`, `/buyer-links`): an Admin shares the company
with its insurer or acquirer by email and can stop at any time. The client's Risk Attestation page has the signed
statements box (`StatementForm`, `/statements`: Admins and the lawyer). A real insurer signs in to the underwriter
view: Portfolio, Exposure, Data Integrity, Risk Attestation, Litigation and Underwriting Export come only from Django
(header `x-civ-viewer: buyer`), and anything not measured shows "Not measured". Underwriting Export shows
the sheet in plain words (`PlainPayload`) and the insurer's rating engine settings (`RatingEngineCard`,
`/rating-engine`; "Send to rating engine" really sends). The insurer menu has no Engagement pages.

**Document AI (Module 16):** backend only so far (readers for contracts, consent pages and policy files; the AI slot is
off until it is plugged in).

The full system description is in [docs/CiV-System-Spec.md](../docs/CiV-System-Spec.md) (also `.docx` and `.pdf`).

**Passwords (2026-10-22):** the sign-in page has no "Forgot your password?" (CiV staff send password links). Account
menu → **My account** (`/account`, open to every user, insurers too): who is signed in and **Change password**
(current password, new one twice; `POST /session/password`).

**Evidence Vault and Reports (2026-10-23):** the Vault has a **Verify a file** card (the file's SHA-256 is made in the
browser; only that is sent), "No daily seal yet" before the first seal, the real deleted count, and the lookup links to
that number's own evidence file. Reports & Exports has a **Download the <month> audit report (PDF)** button. A number's
evidence file shows **Who holds it** for each consent proof.

## Screen fixes (super test, 2026-10-23)

- **Phones:** cards can shrink to the screen (`.card { min-width: 0 }`); wide tables scroll inside their card (Revocation
  wording, report history, Data Integrity basis mix); the search box says "Search…" on a phone. No page scrolls sideways at 390 px.
- **Keyboard:** the account menu closes on Escape or a click outside; Tab stays inside an open side panel and returns
  where it was when it closes; search results take the arrow keys, Enter and Escape.
- **Messages:** "Invitation sent to …", "A new invite was sent to …", "Saved for …", "Uploaded … rows read"; a new
  password attempt clears the old error; Alerts says "No alerts yet" when there has never been one; the Email delivery
  tile says Admins choose which alerts are emailed; a wrong address shows a styled "This page does not exist" page
  (`app/not-found.tsx`) with a way back.
- **Roles:** the Admin's own row shows "Admin · you" with no role change or "Remove access"; a Member sees the legal
  hold form and the Who You Contact vendor switches greyed with "Only an Admin or your lawyer…".
- Tests: `tests/screens/screenFixes.test.tsx`.
