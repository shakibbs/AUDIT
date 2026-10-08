# Master Feature List — Comply iV Automated TCPA Audit System

**Date:** 2026-10-03 · **[v3] Revised:** 2026-10-07 (Engineering Spec v3 applied) · **Status:** Proposed, awaiting the owner's decisions
**Companion:** [feature-guide.md](feature-guide.md) explains each existing feature in plain language.
**[v3] What changed:** [specs/CHANGELOG-v3.md](specs/CHANGELOG-v3.md). F01–F72 keep their numbers. Each existing feature that v3 changes carries a **[v3] impact** note in its row. New features start at F73 (section 4a). The frontend built on 2026-10-04 covers the 55 "Now" features as written for v1.1; it has not been updated for v3 yet.

Every feature has an ID so it can be approved or dropped by number. The **Recommendation** column is a proposal only:

- **Now** — include in the frontend rebuild (**[v3]** for F73 onward: include in the frontend update to v3, step 1b of the roadmap).
- **Later** — worth having, but after the first complete version (it needs data or backend work that does not exist yet, or counsel's wording).
- **No** — recommend against; the reason is given.
- **Decide** — depends on a choice listed in section 5.

Nothing here is built or planned until the owner marks it.

---

## 1. Core portal — the 15 pages in the portal file

Source: `design-reference/complyiv-portal-audit.html`. All recommended **Now**.

| ID | Page | Group | What the user gets |
|---|---|---|---|
| F01 | Overview | Your position | Score gauge and grade, grade-cap banner, six family scores, four headline numbers, top three actions — **[v3] impact:** Evidence coverage beside the score (F74); the grade-cap banner shows all three caps and says "held" (F75); confirmed-rules score beside it (F76); access level shown (F73); "top three actions" become top findings (F88) |
| F02 | Audit Scorecard | Your position | Map of all 25 domains by grade, domain register, and a detail panel per domain (checkpoints passed, warned, failed, not run; top finding; metrics; sources) — **[v3] impact:** A TBD rule value shows `not_run` with reason `RULE_PENDING`; a domain can be held at D by the contact-after-stop cap; sources carry source grades |
| F03 | Action Queue | Your position | Ranked fixes with severity, reason, domain, who does it, and score impact; a count badge in the menu — **[v3] impact:** Becomes **Findings and decisions**: noun-phrase titles (what CiV found), common responses from a counsel-owned library (Set values only), and a recorded client decision with a hashed note (F88). "Fix step" wording is retired |
| F04 | Contact Ledger | Evidence | Every call and text with status, reason and flags from other domains; a detail panel with the five checks, proof, tier and hash — **[v3] impact:** CiV keeps no phone numbers, only tokens: a row shows the number as typed by the user or a masked label (D31); tier → source grade; hash → fingerprint; each row adds provenance basis and import batch; test numbers never appear |
| F05 | Consent Integrity | Evidence | Status split, most common reason codes, the five checks explained, legal basis versus CiV policy, certificate validity, certificates expired before engagement — **[v3] impact:** New codes `WK_FINGERPRINT_ONLY`, `NP_NO_EVIDENCE_FOUND`, `NP_THIRD_PARTY` and label `EBR_ONLY`; certificate custody (F85); fill time and paste become lead-quality signals only, never a status |
| F06 | Revocation Integrity | Evidence | Opt-out test results: three headline numbers and the matrix of opt-out channel by system, in hours or NEVER — **[v3] impact:** Test coverage on the matrix card (F86); unreached campaigns show "untested" or "not reached", never "passed"; test numbers never shown in any role; seeding per campaign and Annex C vendor form |
| F07 | Evidence Vault | Evidence | Number-and-date lookup returning the full position with sources and hashes; totals for artifacts held, daily anchors, items deleted under retention — **[v3] impact:** Store-nothing: wording becomes "fingerprints of what CiV saw" (never "stored write-once" or "records held"); position lookup re-fetches and shows Matches / Changed / No longer at source (F87); "items deleted under retention" no longer applies (CiV keeps no content); legal hold changes (F61) |
| F08 | Contact Conduct | Intelligence | Hours, frequency, holidays, abandoned calls, robocall proof, disclosures, caller ID, non-US numbers; out-of-hours by state; abandoned rate by campaign — **[v3] impact:** Caller ID quality is joined by the caller-ID inventory (F83); reassigned exposure from CiV's RND sample (M35) |
| F09 | Lead Provenance | Intelligence | Leads by risk signal level, most frequent signals, most often missing checklist items, consent completeness, page match — **[v3] impact:** Adds the provenance ladder and untraced list (F82); vendor-lead counts (M06) and contact counts (ladder) never mixed in one figure; page match depends on CiV keeping its own page captures (D32a) |
| F10 | Vendor Ledger | Intelligence | Each vendor's leads, high-signal count, score, grade and monthly change; grade distribution; dispute candidates; score-drop alerts — **[v3] impact:** Vendor leads reconciled to vendor invoices (F79); needs access Level 2 for vendor scoring |
| F11 | Metrics Library | Intelligence | All 33 metrics with a group filter, value, note and linked domains; a detail panel with the definition — **[v3] impact:** 33 → 39 metrics (F89); every value carries a source-grade chip; M11 shows "not checked" without client RND logs; M13 renamed "DNC Check Record Check", Info only |
| F12 | Source Registry | Disclosure | Every source with tier, access, last sync, status and the domains it feeds; totals for current, stale and not supplied — **[v3] impact:** Tier → source grade A–D, S, N (D30); shows the access level each source unlocks; uploads shown as a fallback; "DNC check records" replaces the old list-cleaning label; shows whether billing totals are read |
| F13 | Reports & Exports | Disclosure | Six downloads: period report, evidence file export, certification pack, litigation evidence package, metric export, rulebook snapshot — **[v3] impact:** Period report becomes a real PDF with its SHA-256 in the footer and a report history (F90). Evidence file export, certification pack and the evidence package for named numbers (the old litigation-package name is retired) wait on D18 with counsel |
| F14 | Scope & Boundaries | Engagement | What CiV does, what the client decides, what CiV never does; engagement mode; notice acknowledgement — **[v3] impact:** Adds "CiV keeps no client records, only its own analyzed data and fingerprints"; counsel-directed is the default mode (D25) |
| F15 | Rulebook | Engagement | Settings in force with value, owner and status (Set, Proposed, TBD) and their totals — **[v3] impact:** New keys: worst-case values, cap thresholds, import and reconciliation thresholds, test rotation, counsel-owned consent keys |

### Features that apply on every page

| ID | Feature | What the user gets | Recommendation |
|---|---|---|---|
| F16 | Global search | Find a domain, metric, phone number or vendor from any page (the portal file searches domains and metrics only) — **[v3] impact:** Phone search works by computing the token from the typed number; there is no stored number list to browse | Now |
| F17 | Slide-out detail panels | Open any domain, metric or contact without leaving the page | Now |
| F18 | Light and dark theme | A switch in the top bar | Now |
| F19 | Freshness indicator | "Updated 04:10 UTC" with a live dot; turns amber when a source is stale — **[v3] impact:** Times in the viewer's local time zone with UTC on hover | Now |
| F20 | Hover explanations | A small "i" beside technical terms | Now |
| F21 | Sample-data marker and standing disclaimer | Shown until real data is connected; the "not a law firm" line on every page — **[v3] impact:** Banned-word list adds four list-cleaning words and "court-ready" | Now |

---

## 2. In the specs and the prerequisites file, but not in the portal file

These are described in your documents and have no screen yet.

| ID | Feature | What the user gets | Source | Recommendation |
|---|---|---|---|---|
| F22 | Sign-in | Email and password sign-in, sign-out, password reset | Spec §10; you asked for it | Now |
| F23 | Users and roles | Invite people; set each as owner, legal, operations or read-only; remove access — **[v3] impact:** Buyer roles (insurer, acquirer) are a separate role set (F96); no role ever sees test numbers | Spec §10 | Now |
| F24 | Evidence file page per number | The full file for one phone number: every contact, proof elements, opt-out history, list checks, anchor status; export button — **[v3] impact:** Contents become fingerprints, fetch times, re-fetch outcomes, anchor proof and CiV's derived results; the client supplies the underlying records. Exact contents wait on D18 | Spec §9 | Now |
| F25 | Alerts inbox | Every alert with its date, severity and what triggered it; mark as reviewed; history — **[v3] impact:** New alerts: opted-out numbers re-added (High), unknown calling system, period flagged as incomplete data | Spec §9 | Now |
| F26 | Readiness report | The 11 prerequisite checks as Ready, Partial or Missing with the fix for each; the preview status mix; metrics that would show "Not measured"; the recommended plan — **[v3] impact:** Readiness becomes the access level ladder (F73): what the client has connected and what the next level unlocks; "Not measured" previews become worst-case previews | Prerequisites §4 | Now |
| F27 | Setup checklist | The one-time facts the client must give: outcome mapping, caller IDs, consent page addresses, vendors and sub-IDs, states, brands, campaign categories; shows what is still outstanding — **[v3] impact:** Adds the five import-batch confirmations used for calibration; Annex C now lists campaigns and vendor forms | Prerequisites §5.5 | Now |
| F28 | Plan and usage | Current plan, numbers contacted this month against the plan limit, the downloadable list of billed numbers, the rule for moving up a plan — **[v3] impact:** The downloadable list of billed numbers cannot show stored numbers (CiV keeps tokens only); it shows masked labels (D31) or is produced inside a job and not kept | Prerequisites §3, §6 | Now |
| F29 | Agreements and authorisations | Status and dates of the services agreement, data processing agreement and opt-out test authorisation (channels, brands, test window) — **[v3] impact:** Annex C v3 (campaigns, vendor forms, numbers hidden from operations, D24); the DPA must say phone tokens are pseudonymized personal data; buyer-link consent wording (D26) | Prerequisites §5.1 | Now |
| F30 | Access log | Who viewed or exported what, and when — **[v3] impact:** Also logs buyer API calls, decision-note hashes and report hashes | Spec §10 | Now |
| F31 | Counsel-directed mode | When on: findings and alerts go only to legal users; operations users are locked out; every page is marked as prepared at counsel's direction — **[v3] impact:** Counsel-directed is the default mode (counsel to confirm, D25) | Spec §9, §10 | Now |
| F32 | Company settings | Brands and trade names, states, litigation forum, engagement mode, technical and legal contacts, notification choices — **[v3] impact:** Engagement mode defaults to counsel-directed; key custody choice (D19) | Spec §4; Prerequisites §5 | Now |
| F33 | Internal view: run selector and provisional marker | CiV staff can switch between runs; results from an unapproved rulebook are marked and hidden from clients | Rulebook §2 | Now |
| F34 | Internal view: rulebook impact | For each unsettled legal setting, how many contacts change status between the strict and lenient reading | Rulebook §2 | Now |
| F35 | Upload centre | Upload a file by type, see its recorded hash, see past uploads and any rows that could not be read — **[v3] impact:** Demoted to an optional fallback: files are parsed, fingerprinted and discarded in the same job; source grade D (weight 0.7) | Spec §3 | Now |

---

## 3. In your earlier documents, dropped from the current portal

| ID | Feature | What the user gets | Recommendation | Reason |
|---|---|---|---|---|
| F36 | Projected score | "Today → if the open actions are completed", on Overview and Action Queue — **[v3] impact:** Must respect the three caps and evidence coverage: completing findings may not lift a held grade until the cap condition clears; connecting a missing source replaces its worst-case value | Now | The portal file already states one such figure ("would lift the score to 84.9"); must be labeled a projection |
| F37 | Score history and "what moved" | A trend line for the score and each domain, with dated markers for what caused each change — **[v3] impact:** Show evidence coverage as a second line beside the score trend | Now | Shows direction, not only level; you asked for charts |
| F38 | Coverage strip | Which months the evidence record covers, and where it is thin — **[v3] impact:** Easily confused with v3's evidence coverage and records completeness; suggest renaming to "record span" | Now | Shows at a glance how far back proof reaches |
| F39 | Regulatory changes | Only the rule changes that affect this client: the change, its effective date, the settings and metrics it touches | Now | A rule changed on September 30; clients need to see the effect, stated as fact, not advice |
| F40 | Accountability Register | CiV's own monitoring misses with cause and fix | Later | Useful for trust; nothing to show until the system has run |
| F41 | Number Health | Carrier "spam" labels on each caller ID over time — **[v3] impact:** v3 adds carrier labels as an outside-in (Level 0) check, which gives this feature a data source | Later | Needs a data source the specs do not include; observe only, never fix |
| F42 | Attestations | A dated statement of measured status for insurers and buyers, with a questionnaire mapper — **[v3] impact:** **Now core for buyers** as the risk attestation `civ.attestation.v1` (F93), built in Phase 5; proposed re-mark: Now | Later | Wording needs counsel; must say "measured as of", never a verdict |
| F43 | Plaintiff Proximity | Lawsuit filings by district, active law firms, similar companies sued — **[v3] impact:** v3 adds court dockets as a source (source grade B) for the prior-matters conflict check and the base-rate study; a per-client litigation watch is still D5 | Decide (D5) | Needs court-docket data; valuable to owners, but outside the current specs |
| F44 | API and assistant access | The client's own tools can query a number's position — **[v3] impact:** v3 adds an underwriting export API for buyers (F95); the client's own API stays Later | Later | Backend feature; no screen needed yet beyond an API-key page |
| F45 | Insurer and investor reports | A diligence report on a company or an acquisition target — **[v3] impact:** Now in scope as the buyer views (F92–F97), built in Phase 5 | Later | A separate audience and product line |
| F46 | Operator Certification | A certificate for call centres with spot checks | No, for this product | A different service with different customers |
| F47 | Exposure Indicator | A second score where higher is worse — **[v3] impact:** v3's loss model v0 (F94) is a higher-is-worse dollar figure for insurer views only; D1 stays (a) for the client portal. See D2 | Decide (D1) | Two scores in opposite directions will confuse readers |

---

## 4. Suggested additions from the research

Ideas from comparable tools and audit platforms that fit CiV's boundaries.

### Making it easier to read and use

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F48 | Charts throughout | Score ring and trend; status mix as a donut; domains and vendors as ranked bars; opt-out matrix as a heat map; time-to-stop distribution; a small trend line on every metric | Your request | Now |
| F49 | One layout for every metric and domain | The same tabs each time: result, evidence, history, linked actions, definition | Vanta | Now |
| F50 | Urgent-first ordering | Lists open with the most urgent item at the top, with filters | Vanta | Now |
| F51 | "Not measured" as its own state | Counted and shown separately everywhere, with the source it is waiting for and a link to supply it — **[v3] impact:** v3 replaces "Not measured" in scoring with a worst-case value; the display still says which source is missing, plus "not checked" (M11) and "rule pending" (F78) | Sprinto | Now |
| F52 | Period selector and comparison | Choose the month; see change against the previous period | Common practice | Now |
| F53 | Evidence beside every result | Each status shows the exact record, time and source that produced it — **[v3] impact:** Becomes a source-grade chip on every value plus evidence coverage beside every score (F74, F77) | Observe.AI | Now |

### Making it more automatic

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F54 | Owner and due date on every action | Assign an action to a person with a date; filter by owner; overdue marked — **[v3] impact:** Applies to findings; overdue uses the real date | Vanta, Sprinto | Now |
| F55 | Escalation | If an action passes its date, the next person up is notified | Sprinto | Later |
| F56 | Notifications | Choose which alerts arrive by email; later Slack and webhooks | Common practice | Now for email; Later for the rest |
| F57 | Scheduled reports | The period report sent automatically each month to chosen people | Common practice | Later |
| F58 | Sync actions to a task tool | Push actions into Jira, Asana or ClickUp and read the status back | Vanta | Later |
| F59 | Certificate expiry countdown | Which consent certificates will become unavailable, and when — **[v3] impact:** Adds custody (claimed, vendor-only, never claimed); after a certificate is gone, CiV shows `WK_FINGERPRINT_ONLY` | TrustedForm | Now |
| F60 | Opt-out wording coverage | The opt-out test sends varied plain-language replies and reports which wordings each system honoured — **[v3] impact:** Tests are blind: timing and channel randomized, numbers rotated every 30 days | Drips | Now |

### Evidence and legal use

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F61 | Legal hold | Freeze a number, a vendor or a date range so nothing is deleted while a dispute is open; a log of who set and released it — **[v3] impact:** CiV holds no client content to freeze: legal hold = an instruction to the client plus an optional encrypted snapshot to a bucket the client owns; release needs a Legal user and a reason | Relativity | Now |
| F62 | Read-only seat for outside counsel or an insurer | A limited view scoped to a period, which the client switches on and off — **[v3] impact:** For insurers and acquirers, replaced by buyer links (F96); stays for outside counsel | Drata | Now |
| F63 | Dispute a finding | The client attaches a note contesting a finding; the original is kept and both are shown — **[v3] impact:** Overlaps the decision record (F88): "declined" or "alternative" with a hashed note | Observe.AI | Now |
| F64 | Verify a hash | Paste a file's fingerprint to confirm it matches the record and see its anchor — **[v3] impact:** Core under store-nothing: compare a file the client produces with the fingerprint CiV recorded | WebPreserver | Now |
| F65 | Bulk evidence export | Export evidence files for a list of numbers in one request — **[v3] impact:** Becomes the "evidence package for named numbers"; waits on D18 | WebPreserver | Now |
| F66 | Consent wording catalogue | Every wording variant seen on captured pages, with first and last seen dates, and the client's own approve or reject mark — **[v3] impact:** Depends on CiV keeping its own captures of public consent pages (D32a) | TrustedForm | Now |
| F67 | Custodian declaration template | A pre-filled declaration to accompany an export — **[v3] impact:** CiV is not the custodian; it can certify only a hash match. Waits on D18 and counsel | Page Vault | Later (needs counsel) |
| F68 | Shareable status page | A page the client can share with a buyer or carrier showing measured status as of a date — **[v3] impact:** Superseded by the attestation and buyer links (F93, F96) | Vanta | Later (needs counsel) |
| F69 | Questionnaire answer library | Stock answers to partner and insurer questionnaires, filled from measured data — **[v3] impact:** Answers the client gives become "Insured states" (weight 0); measured answers come from the attestation | Vanta | Later |

### Account and scale

| ID | Feature | What the user gets | Inspired by | Recommendation |
|---|---|---|---|---|
| F70 | Brand filter | View results for one brand or all | Prerequisites (brands) | Later |
| F71 | Single sign-on | Sign in through the company's identity provider | Common practice | Later |
| F72 | Registration status | The client's messaging and caller registration status, read from its accounts | Twilio Trust Hub | Later |

### Recommended against

| Idea | Why not |
|---|---|
| Blocking calls or leads | Makes CiV part of the dialing decision and answerable for misses |
| Selling or bundling DNC or litigator lists | Outside the product's boundaries |
| Labelling a lead or vendor as fraud | Legal exposure; CiV reports signals, not verdicts |
| A "compliant" badge or any guarantee | Turns a measurement into a warranty |
| Live prompts to agents, or fixing caller ID labels | CiV would be acting in the client's operations |
| Peer rankings | Your earlier portal rejects them; see D3 (feature-list D3) |
| **[v3]** Keeping copies of the client's records "just in case" | The owner decided CiV holds only its analyzed data and fingerprints (D18) |
| **[v3]** Letting a client statement raise a score | Buyers would rely on what the client merely says; v3 rule 12 gives statements weight 0 |
| **[v3]** Showing test numbers to any portal role | It would let operations staff spot and special-case CiV's tests |

## 4a. [v3] Additions from Engineering Spec v3

New features from v3 (CHANGELOG-v3 §§5–11, §14). **Phase** is the v3 build
phase that makes the feature real (the frontend can show it earlier against
the mock). **Recommendation** is for the frontend update to v3.

### Scores and evidence

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F73 | Access level indicator | The client's data access level (0–4), what each level unlocks, and what connecting the next system would add; below Level 1, a clear "outside-in score only" label | 1 | Now |
| F74 | Evidence coverage beside every score | A second number beside every score, attestation and export: how much of the evidence CiV verified itself (M36) | 4 | Now |
| F75 | Three caps with "held" | Hard cap, contact-after-stop cap (domain ≤ D) and coverage cap (overall ≤ C); a held grade says "held" and names the cap | 4 | Now |
| F76 | Confirmed-rules score | Beside every overall score, the score using only Set rule values | 4 | Now |
| F77 | Source grade chips | A chip on every value: source grade A, B, C, D, S or N, replacing Tier 1–4 (wording: D30) | 1 (labels), 4 (on metrics) | Now |
| F78 | Worst-case markers | Each field that took its worst-case value is marked; "not checked" (M11); "rule pending" (`RULE_PENDING`); Proposed values marked provisional | 4 | Now |
| F79 | Records completeness (reconciliation) | Per period: calls vs carrier invoice, texts vs platform billing, vendor leads vs vendor invoices, seat capacity, STOP replies, days present; M37; a flagged period shows "incomplete data" | 1 | Now |
| F89 | Metrics M32–M37 | Manual-import share, evidence found rate for manual numbers, opted-out numbers re-added, reassigned exposure (RND sample), evidence coverage, records completeness; 33 → 39 metrics | 1–4 (M37 and M34 from 1; M32–M33 from 2; M35, M36 by 4) | Now |
| F90 | Period report PDF with hash | A real PDF built from the same queries as the portal; its SHA-256 in the footer; a report history | 4 | Now (keeping the PDFs: D33) |

### Provenance and manual imports

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F80 | Import batches | Every detected bulk import, small batch or hand entry, with its creator, time, size, evidence found rate and any opted-out numbers re-added (High alert); the five onboarding confirmations | 1 | Now |
| F81 | Proof requests | For a sample of each batch, the client attaches proof or marks "none" in the portal; unanswered stays NO_PROOF; proof production rate per batch | 2 | Now |
| F82 | Provenance ladder chart and untraced list | How contacted numbers trace back: feed, CRM field, invoice, certificate domain, manual batch, untraced; the untraced list returned to the client monthly | 2 | Now |
| F85 | Certificate custody | For each certificate: claimed in the client's account, vendor-only, or never claimed | 2 | Now |

### Integrity and statements

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F83 | Caller-ID inventory | Caller IDs seen calling on the client's brand vs those in its connected systems; an unknown one is an "unknown calling system" and the top finding until connected or disclaimed in writing | 4 (v3 lists it as a new check without naming a phase; suggested) | Now |
| F84 | Insured states and conflicts | Every officer-signed client statement (weight 0) and each conflict CiV found against measured data or court dockets | 4 (statements), 5 (shown to buyers) | Now |
| F86 | Test coverage on revocation | Campaigns reached ÷ marketing campaigns on the matrix card; "untested" and "not reached" states | 3 | Now |
| F87 | Position lookup re-fetch outcomes | Each record re-read now and compared with its fingerprint: Matches / Changed / No longer at source (whether content may be shown: D32b) | 1 | Now |
| F91 | Number display without stored numbers | How numbers appear in lists when CiV keeps tokens only: as typed by the user, or a masked label such as "(480) •••-0923" | 1 | Now (D31 decided: masked label) |

### Findings and decisions

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F88 | Decision record | For each finding: accepted / declined / alternative, recorded with *"Reviewed with [role]; decided [action] because [reason]."*; the note is hashed; exports carry the decision and hash, never the note | 4 | Now |

### Buyer views (insurer and acquirer)

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F92 | Insurer portfolio | The underwriter's list of linked insureds with score, evidence coverage, completeness, conflicts and open matters | 5 | Now (mock first; Falcon Risk is the first pilot candidate, D3) |
| F93 | Risk attestation | `civ.attestation.v1`, monthly and hashed: frequency drivers, records integrity, Insured states with conflicts; every field with value, source grade and worst-case flag | 5 | Now (wording with counsel) |
| F94 | Loss model v0 | Expected annual loss for an insured, labeled **uncalibrated** everywhere, parameters editable by the underwriter | 5 | Now in insurer views (D36 decided; labelled uncalibrated) |
| F95 | Underwriting export API | `GET /v1/insureds/{client_id}/attestation?as_of=YYYY-MM`, bearer token per buyer org (rotated every 90 days), webhook on a 5-point score change or a new open matter | 5 | Later (no page beyond token management) |
| F96 | Buyer access management | The client grants, scopes and revokes access for an insurer or acquirer (buyer links); a buyer role set that never sees contact rows, tokens, decision notes or test numbers | 5 | Now |
| F97 | Acquirer diligence view | The target's attestation, integrity and diligence export for the deal window; access ends at revocation | 5 | Later |
| F98 | Theoretical statutory exposure | In the attestation: contacts × 12 × (1 − consent proof rate) × $500–$1,500, for insurer views only | 5 | Now in insurer views (D36 decided) |

### Behind the pages

| ID | Feature | What the user gets | v3 phase | Recommendation |
|---|---|---|---|---|
| F99 | Spoken-consent flags | AI flags where consent may have been given on a call, after its accuracy gate | 6 | Later |
| F100 | Litigation base-rate study (internal) | Base rates and cost per suit from federal dockets; feeds only the loss model and the prior-matters check | Separate track | Later |
| F102 | **[D35]** Live sync status per source | Each source shows Live / Catching up / Stale, last change time, and how many changes the hourly catch-up found that the live feed missed | 1 | Now |
| F103 | **[D35]** Urgent alerts within minutes | Contact after "STOP", opted-out numbers re-added and unknown caller IDs alert within 15 minutes of the change | 1 | Now |
| F104 | **[D37]** AI conversation review updates | After each call or text ends, the AI reads or listens to the whole conversation and shows an update card: opted out, partial request, wrong number or opted back in, with the moment, confidence and "AI result" label | 3 | Now |
| F105 | **[D37]** Missed opt-out check (M38) | For each AI-found opt-out, shows whether the client's dialer and CRM marked the number; urgent alert within 15 minutes if not | 3 | Now |
| F106 | **Simple / Full view switch** (owner request 2026-10-08) | A switch at the top changes the whole portal. Simple view: Home (score, grade, held note, evidence coverage, trend), Urgent alerts, Things to fix (top 5 in plain words), Reports (one-click monthly report). Full view: every page. Other pages say "part of Full view" with a one-click switch. New users start in Full view; the choice is remembered; `?view=simple` in a link opens Simple view | — | Now (built 2026-10-08) |
| F101 | End-of-contract key destruction record | When a contract ends, the client's key is destroyed so its tokens can no longer be linked; the client sees the dated record | 1 | Later |

---

## 5. Decisions for the owner

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | One score or two? The Audit Score (higher is better) and the earlier Exposure Indicator (higher is worse) | (a) Audit Score only · (b) both | (a). One score, with the hard cap, is easier to trust and explain. **[v3]** The loss model (F94) is a second, higher-is-worse figure, but for insurer views only; the client portal keeps one score |
| D2 | Dollar estimates of exposure | (a) none anywhere · (b) a stated-assumption range · (c) a single figure | **Decided 2026-10-08:** none in the client portal; insurer and acquirer views show the theoretical exposure range and the loss model, always labelled "uncalibrated estimate" (spec D36) |
| D3 | Peer benchmarks | (a) none · (b) industry baselines only when a documented sample exists | (a). Your earlier portal rejects rankings |
| D4 | Rulebook visible to the client's owner? | (a) yes, read-only · (b) CiV staff only | (a), as your portal file shows it |
| D5 | Plaintiff Proximity (litigation watch) | (a) include later · (b) leave out | (a) Later, once a court-docket data source is chosen. **[v3]** v3 chooses CourtListener RECAP and PACER for the base-rate study and prior-matters check |
| D6 | Wording of source labels | (a) Tier 1–4 · (b) Grade A–D as in the portal file | ~~(a)~~ **[v3]** Superseded by D30 below: v3 uses letters A–D plus S and N |
| D7 | Sample client name | (a) SunPath Residential Solar (portal file) · (b) Acme Solar (older prototype) | (a) |

**Numbering note.** D1–D7 above are this feature list's own questions. The
engineering spec has its own D-numbers (its D3 is the pilot client). The
decisions below use the spec's numbers from [CHANGELOG-v3 §12](specs/CHANGELOG-v3.md).

### [v3] Spec decisions that affect features

| # | Decision | Affects | Status |
|---|---|---|---|
| D3 (spec) | Pilot client: Falcon Risk's pilot insureds (3–5 companies) are the first candidates | F92–F96 priority | Open |
| D18 | Store-nothing scope | F07, F13, F24, F61, F65, F67 | **Decided by the owner 2026-10-07:** analyzed data only, no CRM or other client records. Open with counsel: what the evidence file and certification pack contain |
| D22, D23 | Worst-case default values; cap and completeness thresholds | F74, F75, F78, F79 | Open (Product + counsel) |
| D25 | Counsel-directed as the default mode | F14, F31, F32 | Open (counsel) |
| D26 | Buyer-link consent wording and reliance letter | F93, F96 | Open (counsel) |
| D28 | Loss model ownership: CiV v0 or Falcon's actuary | F94 | Open |
| D30 | Source labels: adopt v3's letters A–D, S, N, always written "source grade A", never "grade A" alone | F04, F12, F53, F77 | Decided 2026-10-08: source grades |
| D31 | How a number appears in lists when only tokens are kept: as typed, or a masked label such as "(480) •••-0923" | F04, F16, F25, F28, F91 | Decided 2026-10-08: masked label "(480) •••-0923" (counsel to confirm) |
| D32 | (a) Keep CiV's own captures of public consent pages? (b) May a re-fetched record be shown during a position lookup and then discarded? | F09, F66, F87 | (a) Decided 2026-10-08: keep · (b) Open (counsel) |
| D33 | Keep period report PDFs (they hold only derived results) | F90 | Proposed |
| D34 | Obtain Engineering Spec v2 (Sep 27) to confirm what "unchanged from v2" means | All | Closed 2026-10-08: no v2; v1.1 stands |

---

## 6. Totals

| | Now | Later | No / Decide |
|---|---|---|---|
| Core portal (F01–F21) | 21 | — | — |
| In the specs, no screen yet (F22–F35) | 14 | — | — |
| From earlier documents (F36–F47) | 4 | 5 | 3 |
| Suggested additions (F48–F72) | 16 | 9 | — |
| **Total F01–F72 (v1.1, built 2026-10-04)** | **55** | **14** | **3** |
| **[v3] Additions (F73–F106, incl. live sync F102–F103, conversation review F104–F105, view switch F106)** | **29** | **5** | — |
| **[v3] Grand total** | **84** | **19** | **3** |

**[v3]** Counts for F01–F72 keep their original marks. Proposed re-marks
from v3, not yet counted: F42 Later → Now (as F93); F45 Later → covered by
F92–F97; F62 narrowed to outside counsel; F68 superseded by F93 and F96.

The 55 "Now" features of F01–F72 are built (frontend, 2026-10-04, on v1.1).
The 21 new "Now" features and the [v3] impact notes are the scope of the
frontend update to v3 (roadmap step 1b), which waits for the owner's yes.
