# CiV Automated TCPA Audit System

Documentation and (later) source for the CiV Automated TCPA Audit System: a
service that builds, for every outbound call and text a client made, an
independent measurement of whether proof of permission existed, where the
number came from, and how much of that measurement CiV verified itself, then
flags every gap.

**[v3] Three readers, one record.** The same measurements serve the
**client** (the portal), the **insurer** (a monthly risk attestation and an
underwriting export) and the **acquirer** (a diligence file for a deal
window). Buyers see standardized, derived results, never the client's records.

**[v3] Analyzed data only (owner decision, 2026-10-07).** CiV is not a
records custodian. It keeps its own results (statuses, metrics, scores,
findings, decisions) and a *fingerprint* of every record it read (hash,
source, fetch time, trusted timestamp, daily anchor). It never keeps CRM
records, message text, recordings, certificate contents or raw phone
numbers; those are read in memory and dropped when the job ends. Phone
numbers are kept only as a keyed token. See
[CHANGELOG-v3 §2](docs/specs/CHANGELOG-v3.md).

**[v3] Connectors first.** The core path reads the client's systems through
official APIs. Dialer and messaging logs (access Level 1) are the minimum for
monitoring. Uploads are an optional fallback. Anything CiV cannot verify takes
a worst-case value, and nothing the client merely states can raise a score.

This repository holds the **v3.0 document set** (2026-10-07) and the
**client portal** (`frontend/`). v3 is applied on top of v1.1: anything v3
does not mention stands as written in v1.1.

**Two repos, fully separate.** The Django backend lives in its own repo:
**[shakibbs/Audit-backend](https://github.com/shakibbs/Audit-backend)**. The
portal and the backend talk only over `/api`.

## Document map

| Document | Audience | What it answers |
|---|---|---|
| [docs/feature-guide.md](docs/feature-guide.md) | Owner, everyone new to the project | Every feature in plain language: what it is, why a client needs it, how it works, what is automatic, what the client supplies |
| [docs/BRD.md](docs/BRD.md) | Product, leadership, counsel | Why we build this, for whom, what "done" means, what we will not build |
| [docs/architecture.md](docs/architecture.md) | Engineering | The six-layer pipeline, components, interfaces, stack, tenancy, integrity chain |
| [docs/design.md](docs/design.md) | Engineering | Detailed design: data model, algorithms, job orchestration, APIs, testing |
| [docs/specs/01-engineering-spec.md](docs/specs/01-engineering-spec.md) | Engineering, product | The engineering spec, now v3.0 (product rules, access levels, source grades, data model, consent engine, provenance, data integrity, domains, scoring, buyers, security, build order) |
| [docs/specs/02-rulebook-parameters.md](docs/specs/02-rulebook-parameters.md) | Engineering, counsel | Every parameter the system reads, its default, owner and status |
| [docs/specs/03-metric-specs.md](docs/specs/03-metric-specs.md) | Engineering, product | One card per metric: question, period, population, logic, edge cases, missing-data rule, example |
| [docs/specs/04-lead-inspector.md](docs/specs/04-lead-inspector.md) | Engineering, product, counsel | Lead signal check, consent source check, consent completeness, vendor scorecard |
| [docs/specs/05-counsel-brief.md](docs/specs/05-counsel-brief.md) | Counsel | Every question only a lawyer can settle, with the proposed starting point and what it blocks |
| [docs/specs/CHANGELOG-v3.md](docs/specs/CHANGELOG-v3.md) **[v3]** | Everyone | What v3 changed (C1–C16), the owner's analyzed-data-only decision, the new build phases, decisions D18–D34, and what the built frontend would need |
| [docs/specs/CHANGELOG-v1.1.md](docs/specs/CHANGELOG-v1.1.md) | Everyone | Each v1.0 gap and the v1.1 fix, with the owner who still has to approve it |
| [docs/source-documents/](docs/source-documents/) **[v3]** | Everyone | The original source PDF: *CiV Automated TCPA Audit System — Engineering Spec v3* (Oct 7, 2026) |
| [docs/ai-usage.md](docs/ai-usage.md) | Owner, product, engineering | Every place CiV uses AI: what it reads, which model, accuracy gates, privacy, cost per client |
| [docs/feature-list.md](docs/feature-list.md) | Owner, product | Every feature by ID (F01–F72, plus **[v3]** additions from F73), with a Now / Later recommendation and the owner's decisions |
| [docs/plans/2026-10-01-00-roadmap.md](docs/plans/2026-10-01-00-roadmap.md) | Engineering, product | Module order aligned to v3's six phases and gates **[v3]**, rules every plan follows, open decisions |
| [docs/plans/2026-10-09-02-backend-login.md](docs/plans/2026-10-09-02-backend-login.md) | Engineering | Backend login system: CiV admin login separate from the client login API (built 2026-10-09) |
| [docs/plans/2026-10-09-03-admin-connections.md](docs/plans/2026-10-09-03-admin-connections.md) | Engineering | Client API connections in the admin panel (built 2026-10-09) |
| [docs/plans/superseded/](docs/plans/superseded/) `2026-10-03-01a … 01d` | Engineering | The earlier seven-page frontend plans, kept for reference |
| [docs/design-reference/complyiv-portal-audit.html](docs/design-reference/complyiv-portal-audit.html) | Engineering, design | The 15-page portal file the rebuilt frontend follows |
| [docs/design-reference/portal-prototype.dc.html](docs/design-reference/portal-prototype.dc.html) | Engineering, design | Source of the earlier CiV Audit Portal Prototype (Sep 29, 2026) |
| [docs/session-history/](docs/session-history/) | Everyone | Notes and transcripts from review sessions |

## Reading order

1. **New to the project:** feature guide ("What changed in v3") → BRD → CHANGELOG-v3 → architecture → engineering spec.
2. **Building a component:** design → the spec section for that component → rulebook parameters it reads → metric cards it feeds.
3. **Counsel:** counsel brief → engineering spec section 5 (consent engine) and section 10 (security, legal, evidence) → rulebook parameters marked *Counsel*.

## Status

| Item | State |
|---|---|
| Document set | **[v3]** At **v3.0, 2026-10-07** (engineering spec v3 applied on top of v1.1). Items marked *Proposed* or *TBD* await Product and Counsel sign-off |
| Stored-data scope (D18) | **[v3] Decided by the owner 2026-10-07:** CiV holds analyzed data and fingerprints only, never CRM or other client records. Open with counsel: what the evidence file and certification pack contain |
| Pilot client (decision D3) | **[v3]** Open. Falcon Risk's pilot insureds (3–5 companies) are now the first candidates. Connector build order depends on it |
| Implementation plan | **[v3]** Roadmap realigned to v3's six phases and gates; later modules are planned when reached |
| Frontend | Built in `frontend/` (Next.js + TypeScript): the portal pages, Owner / Underwriter view, insurer pages. Roles are **Admin** and **Member** (2026-10-09). Sign-in, reset, invites and Users use the real backend when `BACKEND_URL` is set; every other page still uses sample data. See [frontend/README.md](frontend/README.md) |
| Backend | **Started 2026-10-09** in its own repo, [Audit-backend](https://github.com/shakibbs/Audit-backend): login system, CiV admin panel styled like the portal, client API connections. Real connectors and live sync are next. Hosting deferred until the project is complete |
| Provisional rulebook | Defined (section 4 of the rulebook). Lets engineering build and test before counsel sets final values |

## Conventions every document follows

**Wording.** Outputs, metric names, flags and reports describe what CiV
*measured*, never a legal conclusion. Never use: "violation", "breach",
"illegal", "compromised", "fake", "fraud", "genuine", "compliant",
"non-compliant", "ensures compliance", "protects you", "guaranteed", and
**[v3]** "scrub", "scrubbed", "screen", "screening", "court-ready". Use:
"CiV found", "no consent proof supplied", "sources conflict", "few / some /
high risk signals", "measured", "captured", "tested", **[v3]** "DNC check
records", "fingerprints of what CiV saw", "common responses", "Insured
states", "evidence package for named numbers". An automated check runs every
report against this list before release. **[v3]** US spelling throughout;
timestamps in the viewer's local time zone with UTC on hover.

**Names describe acts, not outcomes.** Capture, Test, Record — never
Protection, Assurance, Prevention.

**Parameters.** Code never hard-codes a value that appears in the rulebook.
Every legal value is effective-dated and each contact is judged by the value
in force on the contact's date.

**Statuses.** Every parameter and every counsel item carries one of:
*Set* (decided), *Proposed* (starting value; owner to confirm), *TBD*
(client output blocked until set; engineering may build against the
provisional value).

**[v3] Source grades.** Evidence is labeled by where the *content* came
from: source grade A (captured by CiV), B (retrieved by CiV from an
independent third party), C (retrieved by CiV from the client's systems by
API), D (exported or uploaded by the client, weight 0.7), S (Insured states:
the client's own statements, weight 0, can lower a score but never raise it),
N (not supplied: the worst-case value applies). This replaces v1.1's "Tier
1–4". Decided 2026-10-08 (D30): always write "source grade A", never "grade A" alone,
so "grade" on its own still means a score.

**[v3] Evidence coverage.** Every score shows, beside it, how much of the
evidence behind it CiV verified itself.

**Not legal advice.** Nothing in this repository is legal advice. Starting
points in the counsel brief are proposals for counsel to verify.

## Repository layout

```
Audit/
├── README.md
├── frontend/              Next.js + TypeScript client portal
│                          (backend: separate repo shakibbs/Audit-backend)
└── docs/
    ├── BRD.md
    ├── architecture.md
    ├── design.md
    ├── ai-usage.md
    ├── feature-guide.md
    ├── feature-list.md
    ├── specs/
    │   ├── 01-engineering-spec.md
    │   ├── 02-rulebook-parameters.md
    │   ├── 03-metric-specs.md
    │   ├── 04-lead-inspector.md
    │   ├── 05-counsel-brief.md
    │   ├── CHANGELOG-v1.1.md
    │   └── CHANGELOG-v3.md
    ├── source-documents/
    │   └── CiV Automated TCPA Audit System — Engineering Spec v3.pdf
    ├── plans/
    │   ├── 2026-10-01-00-roadmap.md
    │   ├── 2026-10-09-02-backend-login.md
    │   ├── 2026-10-09-03-admin-connections.md
    │   └── superseded/    earlier seven-page frontend plans (01a–01d)
    ├── design-reference/
    │   ├── complyiv-portal-audit.html
    │   └── portal-prototype.dc.html
    └── session-history/
        ├── 2026-09-30-spec-review.md
        └── 2026-09-30-spec-review.jsonl
```

## Versioning

Documents carry a version in their header. A change to a legal value is a new
rulebook version with an effective date, never an edit in place; old versions
stay so past results reproduce. This repo (docs + portal) and the backend repo
are versioned separately on GitHub.
