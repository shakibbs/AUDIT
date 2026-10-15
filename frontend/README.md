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
  With `BACKEND_URL` set, sign-in, users, invites, Rulebook and Regulatory Changes come from Django.
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
