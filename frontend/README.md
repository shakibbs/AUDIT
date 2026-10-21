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

### Sample data or the real backend

- **Sample data only (default):** any email and password signs in; every page uses the mock API in `src/mock/`.
  With `BACKEND_URL` set, sign-in, users, invites, Rulebook, Regulatory Changes, Source Registry (tool list) and the
  Overview's Data health card, Contact Ledger, number pages and "Can I call now?" come from Django. The Upload
  centre is unchanged.
- **With the Django backend:** create `.env.local` with

  ```
  BACKEND_URL=http://localhost:8000
  ```

  and restart `npm run dev`. Sign-in, sign-out, password reset, invites and the Users page then go to Django.
  Every other page still shows sample data until its backend module is built.

## Users and views

- **Roles:** client users are **Admin** or **Member**, plus an "is our lawyer" mark. In lawyer-only
  (counsel-directed) mode, a Member who is not the lawyer sees a locked page.
- **Owner / Underwriter** is a **view switch** in the account menu (sample data only), not a role. Underwriter view shows the
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
| `src/app/api/[...path]/route.ts` | Serves `/api/*`: login endpoints to Django when `BACKEND_URL` is set, the rest from the mock |
| `src/server/` | Forwarding to Django (`backend.ts`) and session merge (`mergeSession.ts`) |
| `src/screens/<page>/` | One folder per page; one component per file |
| `src/components/ui` | Shared building blocks (cards, pills, drawer, tabs) |
| `src/components/charts` | Hand-drawn SVG/HTML charts |
| `src/components/shell` | Sidebar, top bar, search, banners, drawer host |
| `src/components/drawers` | Detail panels: domain, metric, contact, action, vendor, Who You Contact area |
| `src/api/types.ts` | **The contract with the backend** |
| `src/api/queries.ts` | One hook per endpoint |
| `src/api/client.ts` | Fetch wrapper (sends the CSRF token Django needs) |
| `src/mock/` | `api.ts` (the mock) and `data/` (fixtures) |
| `src/lib/wording.ts` | Banned-wording guard; tests scan every screen and fixture |
| `src/lib/exposure.ts`, `src/lib/lossModel.ts` | Exposure Indicator v2.2 and loss model v0 math |
| `tests/` | Mock API tests and screen tests |

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
contacts after; sample data until live sync).

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
levels, frequent signals, most often missing: sample data from `/leads` until the Lead Inspector modules) and adds,
below them, from `/provenance` and `/proof-requests`: where this month's called numbers came from (ladder chart, top
sources), the untraced list, uploaded lists (CRM, update uploads, dialer lists) with evidence, STOP numbers brought
back and proof rate, and proof requests. Proof
requests: Admins and the company's lawyer attach a file (multipart through `apiUpload`; the proxy passes bytes) or
say "We have none". The number page says where the number came from; the Overview's attention strip counts proof
requests waiting.

**Partly real pages** (`MERGE_PATHS` in `server/backend.ts`: vault, settings, revocation, insureds, metrics,
who-contact): Django sends only the fields it really has and the portal lays them over the sample (`overlay`: objects
merged inside; lists of named items merged by code, id or name, so an item not built yet keeps its sample), so no card
loses anything while later modules are built. `WRITE_PATHS` (who-contact) send changes to Django. `access-log` is fully real. The contact panel loads its contact by ID (`/contacts/<id>`).

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
the measured ones. Fields not built yet (evidence coverage, confirmed-rules score, projected, unmeasured domains) still
show the sample. The insurer Litigation page takes WebRecon's monthly numbers from `/litigation` (cards merged by id).
