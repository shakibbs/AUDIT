# Changelog — v1.1 → v3.0

**Date:** 2026-10-07. **Source:** *CiV Automated TCPA Audit System — Engineering
Spec v3* (Oct 7, 2026, @Zen, 34 pages), kept at
[../source-documents/](../source-documents/). The PDF says it supersedes "v2
(Sep 27)"; our v1.1 document set is our elaboration of that version, so v3 is
applied on top of v1.1. **Anything v3 does not mention stands as written in
v1.1.**

This file is the single record of what v3 changed, the owner's decision on
stored data (§2), and where each change landed in the documents (§12). Changes
in the other documents are marked **[v3]**.

> **Not yet seen:** the PDF refers to "v2 (Sep 27)", the Metric specs tab, the
> Counsel brief tab, Annex C and the Oct 6 prototype review. We have the v1.0
> PDFs, not v2. Where v3 says "unchanged from v2" we keep v1.1 (decision D34;
> the owner confirmed on 2026-10-08 that no v2 is available).

---

## 1. The three new foundations

1. **CiV stores fingerprints, not content.** For every record CiV reads, it
   keeps a SHA-256 hash, source system, source record ID, fetch time, trusted
   timestamp and daily anchor. The record itself is read in memory and dropped
   when the job ends. (Stu, Oct 6.)
2. **Nothing the client says can raise a score.** Missing or unverified inputs
   take a pessimistic **worst-case** value. Client statements are kept as
   signed "Insured states" and count 0 toward raising any score.
3. **The core path runs on API connectors, not uploads.** Uploads become an
   optional fallback. Dialer and messaging logs (access Level 1) are the
   minimum for monitoring. (Rad, Oct 7: clients will not upload.)

## 2. Owner decision: CiV holds analyzed data only (Shakib, 2026-10-07)

> "We will not hold CRM data. We will only hold our analyzed data — what we
> analyzed and how we show all of this."

This matches v3 rule 10 and settles v3 decision D13 (our D18) for client
records. CiV keeps **its own results**, never the client's records.

### 2.1 What CiV keeps and what it never keeps

| CiV keeps (its own analyzed data) | CiV never keeps (the client's records) |
|---|---|
| Fingerprint row per record read: hash, source system, source record ID, fetch time, trusted timestamp, anchor date, content kind, source grade | CRM records: names, emails, street addresses, notes, deal details |
| `phone_token` (keyed hash of the number), never the number | Raw phone numbers (they exist only inside a running job) |
| Per-contact derived facts: time, channel, direction, campaign ID, dial mode, message category, recipient state and time zone, provenance basis, import batch | Message text, call recordings, transcripts |
| Consent results: status, reason codes, bases, labels, certificate custody | Certificate contents and page snapshots held at TrustedForm / Jornaya |
| Opt-out events as derived facts: token, time, channel, method kind | The text of opt-out replies |
| Checkpoint results, domain scores, metric values with basis mix and evidence coverage, caps, confirmed-rules score | Agent names and agent-level personal data |
| Findings, client decisions (decision, recorder, time, note fingerprint) | Uploaded files (parsed, fingerprinted and discarded in the same job) |
| Reconciliation totals, import batches, proof-request answers (fingerprinted), caller-ID inventory (tokens) | Vendor contracts, policies, training files (read by the AI reader in memory) |
| Signed client statements ("Insured states") and the conflicts CiV found | |
| CiV's own test data: test opt-outs, test-line records, callbacks, CiV RND queries | |
| Rulebook versions, runs, alerts, access log, daily anchors | |
| CiV's own reports (period report PDF with its hash; attestation snapshots) | |

### 2.2 How CiV shows everything without holding the client's records

The portal, the reports and the buyer views are built **only from CiV's
analyzed data**. Nothing on a page needs a client record to be stored.

| What a person sees | Built from |
|---|---|
| Scores, grades, caps, evidence coverage, confirmed-rules score | `metric_snapshot`, `checkpoint_result` |
| Metric values, trends, charts | `metric_snapshot` history (one row per metric per period, kept) |
| Consent status mix, reason codes | `consent_evaluation` rows (derived) |
| Contact Ledger rows | `contact_event` derived facts + `consent_evaluation`; the number is shown as a masked label, area code + last 4 digits, e.g. "(480) •••-0923" (D31, decided) |
| Findings and decisions | `finding`, `decision_record` |
| Evidence file for a number | The person types the number → CiV computes its token → shows that token's contacts, results, fingerprints, fetch times and anchor proof. The underlying records are supplied by the client (or the hold bucket) |
| Position lookup ("what was on record on date X") | **Re-fetch and compare:** CiV reads each source record again now, hashes it, compares with the stored fingerprint, and shows **Matches / Changed / No longer at source**. What is read is shown and then discarded (counsel to confirm showing content in the portal, D32) |
| Verify a fingerprint | Compares a file the client produces with the stored hash |
| Period audit report (PDF) | The same queries as the portal; the PDF holds only derived results; its SHA-256 goes in its footer, the report history and the access log |
| Insurer / acquirer attestation | `attestation_snapshot` (derived values + grade + worst-case flag per field) |

**In one sentence:** CiV keeps the *answers* it worked out and a *fingerprint*
of every record it looked at; the client keeps the records themselves.

### 2.3 What this costs, stated plainly

- A past result reproduces exactly only while the client's records still match
  their fingerprints. Otherwise it is labelled "inputs changed since
  evaluation" and never silently recomputed.
- If a vendor deletes a certificate, CiV can prove it existed on a date
  (`WK_FINGERPRINT_ONLY`) but cannot show its content.
- CiV can certify only that a file the client produces **hashes to the value
  CiV recorded on that date**. The copy itself comes from the client or the
  hold bucket.
- CiV's derived results (metrics, findings, decision hashes) are still CiV's
  own records and can be requested in a lawsuit.

## 2a. Owner decision: live sync (Shakib, 2026-10-07)

> "Our live CiV will live check the CRM all the time and update its track
> record so it doesn't miss out any data."

CiV watches the client's tools **continuously**, not once a night. This goes
beyond v3, which kept v1.1's "daily pulls plus webhooks for replies and new
leads". Recorded as **D35 (decided)**.

**Three layers, so nothing is missed:**

| Layer | How | When |
|---|---|---|
| 1. Live feed | The tool notifies CiV of each change (webhook / change event); CiV reads that one change, checks it, keeps the result and fingerprint, drops the record | Within seconds to minutes of the change |
| 2. Catch-up sweep | CiV asks each tool for everything changed since its last cursor; anything the live feed missed is processed and logged as a **gap** | Every `catchup_interval_minutes` (60) |
| 3. Full comparison + reconciliation | A periodic full listing finds deleted or silently changed records; the period reconciliation against bills (§9) finds missing volume | Every `full_sweep_interval_days` (7); reconciliation each period |

- **Tools without notifications** are polled every `poll_interval_minutes` (5).
- **What runs on each change:** the per-contact checks (consent status, contact after opt-out, calling hours, import-batch detection) and **urgent alerts within `urgent_alert_max_minutes` (15)** — contact after "STOP", opted-out numbers re-added, unknown caller ID.
- **What stays scheduled:** scores and metrics refresh every `score_refresh_minutes` (60); the daily anchor and the nightly re-evaluation of time-dependent results stay nightly.
- **Freshness in the portal:** each source shows "Live · last change 2 min ago", "Catching up", or "Stale". A source with no change and no heartbeat within `source_freshness_hours` (now **2**, was 48) is stale.
- **Gap tracking:** every record found by the catch-up sweep instead of the live feed is written to `sync_gap`. If the gap share for a source passes `live_gap_alert_share` (1%) in a day, CiV raises a connector-reliability alert.
- **Still store-nothing:** live events are read in memory, fingerprinted and discarded like any other read.
- **Limits stated plainly:** vendor rate limits apply; Salesforce field history exists only if the client enables it; some dialers offer no notifications (polled instead); live checking raises the cost per client somewhat.

## 2b. Owner decision: AI conversation review (Shakib, 2026-10-08)

> "Our CiV will also read texts and calls so that it can understand or mark if
> a client opted out or stopped." — "Not just by the client saying stop, but
> after listening to or reading the full conversation."

Recorded as **D37 (decided)**. Changes v3, which kept free-text opt-outs and
transcription in Phase 6 and required a person to confirm each AI-found
opt-out.

- **When:** right after each call or text conversation ends (part of live sync, D35). Never during a call; CiV stays out of the call path.
- **What:** CiV's AI reads the **whole** text thread, or listens to the **whole** call recording (speech-to-text in memory), and decides what the customer meant — not keyword matching. Results: `opted_out` (stop all contact) · `partial_request` (e.g. "only after 6 pm", "text, don't call") · `wrong_number` · `opted_back_in` · `unclear` · `none`.
- **Who decides:** the **AI decides by itself**; no person checks each result. Safeguards: the feature goes live only after passing its accuracy gate (≥ `ai_accuracy_min_items` hand-labelled conversations, agreement ≥ `conv_review_accuracy_pass_mark` 95%); every result stores its confidence and model version and is labelled "AI result"; below `conv_review_min_confidence` (0.90) the result is `unclear` and no opt-out is marked.
- **Dialer and CRM check:** for each `opted_out` result, CiV checks whether the client's dialer, messaging platform and CRM marked the number do-not-contact. Not marked → **urgent alert within `urgent_alert_max_minutes` (15)**: "Opt-out not marked in your dialer". CiV re-checks until the opt-out deadline; still not marked → counted in **M38 Missed Opt-outs**. Any later contact → contact after opt-out (M10).
- **Where it is marked:** in CiV's own records only (an `opt_out_event` with `source = ai_conversation`). CiV never writes to the client's systems; the client marks the number in its own dialer.
- **Portal:** an update card per conversation with a finding: channel, time, masked number, AI result, the moment in the conversation (e.g. "1 min 42 s into the call"), confidence, and the dialer / CRM status. The client can open the recording or thread in its own dialer at that moment.
- **Store-nothing:** recording, transcript and message text are read in memory and dropped. CiV keeps the result, the moment (offset), confidence, model version and a fingerprint.
- **Build phase:** moved from Phase 6 to **Phase 3** (Revocation). Call listening needs recordings from the dialer; without them, calls are "not reviewed".
- **Cost:** speech-to-text is paid per minute of calls; measured per client.
- **Counsel:** AI deciding without a person per item (C21); processing call recordings and message text, including two-party recording-consent states and the DPA wording (C22).

## 3. Change table C1–C16 (from the PDF)

| # | Area | v1.1 | v3 |
|---|---|---|---|
| C1 | Evidence store | Raw artifacts in S3 Object Lock | **Fingerprint ledger** in Postgres + daily Merkle anchor. Legal holds snapshot into a bucket **the client owns** |
| C2 | Phone numbers | `phone_e164` in every table | `phone_token` = HMAC-SHA256 with a per-client key (key ID in `phone_token_kid`); the number exists only inside a running job |
| C3 | Client uploads | Standard source; Phase 0 ran on uploads only | Optional fallback. Core path = connectors. Contact logs (Level 1) are the minimum |
| C4 | Source labels | Tier 1–4 | **Source grades A, B, C, D, S, N**, each with a weight (§4) |
| C5 | Missing data | "Not measured", dropped from the score | **Worst-case default** for anything unverified. A statement can lower a score, never raise it |
| C6 | Score caps | Hard cap only | Hard cap + **contact-after-stop cap** (IDN, REV; the PDF calls it "direct-violation cap", renamed because "violation" is a banned word) + **coverage cap** |
| C7 | Completeness | Not checked | Logs reconciled to carrier, platform and vendor invoices; ratio < 0.9 flags the period |
| C8 | Revocation seeding | Client's own public forms only | At least one test per marketing campaign + vendor forms authorized in Annex C. Test numbers never shown to operations roles |
| C9 | Manual imports | Not covered | Detected from CRM / dialer creator + time bursts and field history; evidence search; metrics M32–M34 |
| C10 | Provenance | `lead` table only | **Provenance ladder**: feed → CRM field → invoice → certificate domain → manual batch → untraced |
| C11 | Consent check 2 | Certificate not found → CONFLICTING; CiV stored copy kept it evaluable | Certificate gone but fingerprint on record → **WEAK `WK_FINGERPRINT_ONLY`**. No CiV stored copies |
| C12 | Fix list | Fix steps from a counsel library | **Findings** (noun phrases) + **common responses** (Set only) + a recorded **client decision** with a hashed note |
| C13 | Wording | "scrub" in names | "Scrub", "scrubbed", "screen", "screening" banned. `dnc_check`, `dnc_check_run`, M13 "DNC Check Record Check" |
| C14 | Buyers | Client portal only | **Insurer and acquirer views**: portfolio, risk attestation, loss model v0, underwriting export API |
| C15 | New checks | — | Caller-ID inventory (unknown calling systems), statement conflicts against court dockets, RND exposure sample (M35) |
| C16 | Certificate vendor | ActiveProspect owns Jornaya | Unchanged; TrustedForm and Jornaya share one vendor → concentration risk |

## 4. Product rules (rules 1–9 stand except as noted; 10–14 new)

- **Rule 3 reworded:** CiV does not sell, maintain or query DNC or litigator
  lists. The client's own **DNC check records** are read when connected and
  reported as **Info only**.
- **Rule 6:** banned list adds "scrub", "scrubbed", "screen", "screening".
- **Rule 8:** evidence is graded by source: A–D plus S and N.
- **Rule 9:** counsel-directed is the **default** engagement mode (counsel to confirm, D25).
- **Rule 10 — Store fingerprints, not content.**
- **Rule 11 — Unverified counts as worst case** (per-field value in the Rulebook).
- **Rule 12 — A statement never raises a score.** Stored as `attestation_statement`, shown as "Insured states", officer-signed, weight 0.
- **Rule 13 — Every number states its basis.** Each value carries its source grade; every score shows evidence coverage beside it.
- **Rule 14 — CiV never claims or retains a certificate in its own account.** Lookups use the client's key; billed operations need written approval.

Three readers now use one record: the **client** (portal), the **insurer**
(attestation and export) and the **acquirer** (diligence file).

## 5. Data access levels and source grades

`client.access_level` (0–4), recomputed nightly from connector health. Below
Level 1 the client gets the outside-in score only.

| Level | Client connects | Unlocks |
|---|---|---|
| 0 | Application only | Self-reported fields (grade S); outside-in checks: page captures, test opt-outs (with Annex C), caller-ID callbacks, carrier labels, court dockets |
| 1 | Dialer + messaging logs (API or scheduled export) | Contacts after opt-out, calling hours, abandoned calls, cross-border, dialer-side import detection, untraced numbers, reconciliation. **Minimum for monitoring** |
| 2 | Client's own TrustedForm / Jornaya key | All five consent checks, page match, vendor scoring, certificate custody |
| 3 | Copy of the lead feed (CiV as an extra delivery destination) | Real-time provenance; client switches it off in one click |
| 4 | Read-only CRM API | Lead-source fields, form submissions, purchase / inquiry dates, record creator and field history |

| Grade | Meaning | Weight |
|---|---|---|
| A | Captured by CiV itself (page captures, CiV RND queries, test-number records, caller-ID callbacks) | 1.0 |
| B | Retrieved by CiV from an independent third party (certificates via the client's key, carrier lookups, invoices via billing API, court dockets) | 1.0 |
| C | Retrieved by CiV from the client's systems by API | 1.0 |
| D | Exported or uploaded by the client | 0.7 |
| S | Insured states (application answers, signed statements) | 0 — can lower, never raise |
| N | Not supplied | 0 — worst-case default applies |

**Source changes:** CRM adds creator, created time and field history (HubSpot
record source; Salesforce `CreatedById`, `CreatedDate`, history objects —
only if field history tracking is on). Dialers add list ID and list insert time.
SMS platforms add billing totals. New sources: carrier invoices (B via billing
API, D if uploaded), vendor invoices (D), court dockets (B: CourtListener RECAP,
PACER). Client RND query logs stay D; without them M11 = "not checked". DNC
scrub records → **DNC check records**, Info only.

**Connector rules added:** process in memory; tokenize phones at the edge (per-
client HMAC key in a KMS); every Level 1 connector reads billing totals or
marks reconciliation "not available"; least-privilege fallback stands.

## 6. Data model

- Every `phone_e164` → `phone_token` (+ `phone_token_kid`).
- `artifact` → **`fingerprint`**: fingerprint_id, client_id, source_system, source_record_id, source_grade, fetched_at, sha256, tsa_token (RFC 3161), anchor_date, content_kind. Drops storage_uri, retention_until, access_level.
- `deletion_log` removed; `purge_log` for in-memory job failures that wrote partial rows.
- `client_list_entry.list_type`: internal / dnc_check / litigator. `scrub_run` → `dnc_check_run`.
- `client` adds access_level, engagement_mode default `counsel_directed`, hmac_kid.
- `consent_proof`: artifact_id → fingerprint_id; adds custody (client_account / vendor_only / unclaimed), claimed_at.
- `lead` adds basis (feed / crm_field / invoice / cert_domain / manual_import / untraced), batch_id.
- `metric_snapshot` adds basis_mix, evidence_coverage, worst_case_fields.
- `finding`: fix_step_ids → response_ids.
- **New tables:** `import_batch`, `evidence_event`, `proof_request` (provenance); `reconciliation`, `attestation_statement`, `attestation_conflict`, `caller_id_inventory` (integrity); `response_library`, `decision_record` (decisions); `buyer_org`, `buyer_link`, `attestation_snapshot` (buyers).
- **Phase 1 core** adds `import_batch`, `evidence_event`, `reconciliation`.

## 7. Consent engine

Five checks, four statuses, timing rules and algorithm stand.

- `CF_NOT_FOUND`: not at the provider **and no CiV fingerprint** → CONFLICTING.
- **New `WK_FINGERPRINT_ONLY`** (step 2): certificate no longer opens but CiV holds its fingerprint + trusted timestamp → WEAK.
- `NP_SELF_ASSERTED` also fires when the only evidence is a column in a manual import.
- **New `NP_NO_EVIDENCE_FOUND`**: manual-import number with no `evidence_event` before first contact.
- **New `NP_THIRD_PARTY`**: source type is referral, appended or skip-traced.
- **New label `EBR_ONLY`**: proof is a purchase or inquiry within its window; covers `ebr_allowed_contact_types` only.
- "CiV stored copy" removed.
- Check 4 phone match uses the provider's `fingerprints.matching` (CiV submits the phone; never needs the certificate's stored phone).
- Check 5: fill time and paste are lead-quality signals only (vendor score), never a consent status.
- **Custody check** (before step 2): claimed in the client's account, vendor-only, or never claimed.
- Counsel-owned settings: `seller_named_required` (default **false**; FCC one-to-one rule vacated, 11th Cir., Jan 2025), `written_consent_required_by_forum` (5th Cir., Feb 2026, *Bradford v. Sovereign Pest Control*), `inbound_contact_scope`.

## 8. Lead provenance and manual imports (new)

- Ladder per `phone_token`, for the latest lead with `received_at` ≤ first contact: feed → crm_field → invoice → cert_domain → manual_import → untraced (consent check 1 → `NP_NONE`). The untraced list goes back to the client monthly.
- M06 still counts **vendor leads**; the ladder counts **contacts**. Never mix the two in one figure.
- **Creation bursts:** exclude integration users; gap > `import_gap_seconds` (120) starts a batch; n ≥ `import_min_batch` (20) → bulk_import; n = 1 → hand_entered; else small_batch.
- **Update bursts** over field-history rows; **dialer-side imports** by list ID + insert time; **calibration** on five batches confirmed by the client at onboarding.
- **Evidence search:** earliest `evidence_event` (cert / inbound_call / inbound_sms / form_submission / purchase = EBR_ONLY / recording after a person confirms) before first contact.
- **Proof requests:** sample `proof_request_sample` (50; 100 above 10,000) per batch; client attaches proof or marks "none" in the portal; unanswered stays NO_PROOF; proof production rate per batch.
- **Opted-out numbers re-added:** feed M34, raise a High alert, appear on the batch row.

## 9. Data integrity (new)

- **Worst-case defaults** (Product-owned, counsel-reviewed): consent proof rate 60%; purchased-lead share 60%; prerecorded / AI share 20%; opt-outs not honored 10%; internal-list and litigator contacts 1; reassigned check "not checked"; prior matters max(stated, docket count).
- **Evidence coverage** = Σ share_g × weight_g (A=B=C=1, D=0.7, S=N=0). Shown beside every score, attestation and export. **Coverage cap:** below `coverage_cap_floor` (0.60) → grade ≤ `coverage_cap_grade` (C).
- **Reconciliation** per period: calls vs carrier invoice, texts vs platform billing, vendor leads vs vendor invoices (flag < `completeness_floor` 0.9), seat capacity (outside range), STOP replies (zero with > 1,000 texts), days present (< 0.9). **M37** = minimum of the first three; a flagged period is "incomplete data" and the missing share takes worst-case values.
- **Blind testing:** test numbers rotate every `test_rotation_days` (30), never shown in any portal role; timing and channel randomized; test coverage = campaigns reached ÷ marketing campaigns; unreached = "untested", never "passed".
- **Caller-ID inventory:** caller IDs seen calling on the client's brand vs those in connected systems; an unknown one is an **unknown calling system** and the top finding until connected or disclaimed in writing.
- **Statements and conflicts:** every self-reported answer is an officer-signed `attestation_statement`; contradictions become `attestation_conflict` rows, shown to buyers as they are.

## 10. Metrics, revocation, scoring

**Metrics: 33 → 39.**

| Code | Metric | Family | Basis |
|---|---|---|---|
| M32 | Manual-import share (contacts with basis manual_import ÷ all contacts) | Permission | C |
| M33 | Evidence found rate, manual numbers (EBR-only shown separately) | Permission | C |
| M34 | Opted-out numbers re-added | Stopping | C |
| M35 | Reassigned exposure, RND sample (`rnd_sample_size` 400; after contact only) | Who you contact | A |
| M36 | Evidence coverage | Integrity | — |
| M37 | Records completeness | Integrity | B |

M11 without client logs → **"not checked"** (worst case); M35 measures exposure
independently. M13 → **"DNC Check Record Check"**, Info only. Every value
carries a basis chip; one denominator per figure; a cross-page consistency
test asserts that shared figures come from one query.

**Revocation:** Annex C names campaigns and vendor forms; seed per campaign
(`seeded_campaign_id`, `seeded_via`); no contact within
`seed_contact_window_days` (14) = "not reached"; the matrix card shows test
coverage. M10 runs from messaging logs alone.

**Scoring:** three caps in order — hard cap (grade ≤ C), **direct-violation
cap** (any contact after IDN entry or in-scope opt-out → that domain ≤ D),
**coverage cap** (coverage < 0.60 → overall ≤ C). A held grade shows "held"
and names the cap. **Confirmed-rules score** (`SCORE_CONFIRMED`) beside every
overall score, using Set values only. A TBD value → checkpoint `not_run`
reason `RULE_PENDING`; Proposed runs and is marked provisional.

**Findings and decisions** replace the fix list: noun-phrase titles; common
responses (Set only, counsel-owned); decision accepted / declined / alternative
with the prompt *"Reviewed with [role]; decided [action] because [reason]."*;
`note_sha256` in the access log; exports carry decision + hash, never the
note; overdue uses the real date.

**Period report:** real PDF rendered by Playwright from the portal queries;
hash in footer, history and access log. Evidence file, certification pack and
the named-numbers package wait on D18.

**Wording additions:**

| Use | Never use |
|---|---|
| "DNC check records" | "scrub", "scrubbed", "screen", "screening" |
| "Fingerprints of what CiV saw" | "Records CiV holds", "stored write-once" |
| "Common responses" | "Fix steps", "you must" |
| "Insured states" | "Verified by the insured" |
| "Evidence package for named numbers" | "Court-ready" |

Timestamps in the viewer's local time zone with UTC on hover; **US spelling throughout**.

## 11. Buyers, security, base-rate study, build order

- **Buyer roles:** insurer underwriter (portfolio of linked insureds; attestation, integrity, loss model, export) and acquirer deal counsel (target's attestation, integrity, diligence export for the deal window). Neither sees contact-level rows, tokens, decision notes or test numbers. Enforced by row-level security through `buyer_link`; tenancy tests in CI.
- **Attestation `civ.attestation.v1`:** monthly, hashed, versions kept; blocks = frequency drivers, records integrity (incl. theoretical statutory exposure = contacts × 12 × (1 − consent proof) × $500–$1,500), insured states with conflicts.
- **Loss model v0:** P(suit) by odds × factors, × severity; labelled **uncalibrated** everywhere; parameters editable by the underwriter.
- **Underwriting export API:** `GET /v1/insureds/{client_id}/attestation?as_of=YYYY-MM`; bearer token per buyer org (rotated 90 days); webhook on a 5-point score change or a new open matter. Draft coverage conditions for carriers' counsel.
- **Security under store-nothing:** fingerprint at fetch; daily anchoring unchanged; position lookup = re-fetch and compare; legal hold = instruction to the client + optional encrypted snapshot to a **client-owned** bucket (CiV write-only); release needs a Legal user + reason. Crypto-shredding: destroying a client's HMAC key makes its tokens unlinkable. Per-client keys in a KMS. Launch gates stand (SOC 2 Type I, DPAs, pen test). New: reliance letter per buyer, CiV E&O insurance, ActiveProspect concentration risk.
- **Litigation base-rate study** (separate track): federal TCPA dockets 2023–2026 → base rates and cost per suit; about $8K/year in PACER fees; feeds only the loss model and the prior-matters check.
- **Build order (replaces v1.1 Phases 0–5):**

| Phase | Builds | Gate |
|---|---|---|
| 1. Foundation | Fingerprint ledger, connectors, normalizer, phone epochs, Rulebook, import-batch detection, reconciliation | G1: pilot synced, fingerprinted, anchored; 5 batches confirmed; completeness ≥ 0.9; **no content on disk after a full sync** |
| 2. Consent and provenance | Consent engine (v3 codes), certificates via client key, custody, page capture, provenance ladder, evidence search, proof requests | G2: 200 hand-checked contacts agree; counsel consent items set; custody reported; `WK_FINGERPRINT_ONLY` exercised |
| 3. Revocation | Test numbers, Annex C v3, seeding per campaign and vendor form, matrix + test coverage | G3: first matrix; campaign coverage reported |
| 4. Metrics and scoring | 39 metrics, worst-case defaults, evidence coverage, three caps, confirmed score, findings and decisions, period PDF | G4: every metric on the pilot; consistency and tenancy suites; a client that withholds a source scores ≤ the same client showing its worst case |
| 5. Buyer views | Buyer orgs and links, attestation v1, loss model v0, export API, insurer portfolio | G5: Falcon receives 3–5 attestations; reliance letter and E&O in place; buyer token reads no contact row |
| 6. AI features | Contract clauses, transcription, free-text opt-outs, page meaning, training records, spoken-consent flags | Per feature: accuracy gate |

Alongside from day one: counsel brief and the base-rate study. Phase 5 may
start once Gate 4 passes on one pilot client. Every build phase ends with a
human-reviewed checklist (auth, tenancy, input validation, error handling,
logging, **no content at rest**).

## 12. Decisions

v3 numbers its new decisions D13–D24, which clash with our existing D13–D17.
They are renumbered **D18–D29** here; the PDF number is shown.

| # | PDF # | Decision | Owner | Needed by | Status |
|---|---|---|---|---|---|
| D3 | D3 | Pilot client: Falcon Risk's pilot insureds are now the first candidates (3–5 companies) | Product | Phase 1 | Open |
| D18 | D13 | Store-nothing scope | Stu + counsel | Phase 1 | **Decided by the owner 2026-10-07: CiV holds analyzed data only, no CRM or other client records (§2).** Open with counsel: what the evidence file and certification pack contain |
| D19 | D14 | HMAC key custody: CiV's KMS or a client-held key | Product + counsel | Phase 1 | Open |
| D20 | D15 | RND exposure sample (M35) is post-contact and sampled, never before a dial | Stu | Phase 1 | Open |
| D21 | D16 | Import thresholds calibrated on the pilot | Engineering | Gate 1 | Open |
| D22 | D17 | Worst-case default values | Product + counsel | Gate 4 | Open |
| D23 | D18 | `coverage_cap_floor`, `coverage_cap_grade`, `completeness_floor`, `direct_violation_grade` | Product | Gate 4 | Open |
| D24 | D19 | Annex C extension (campaigns, vendor forms, numbers hidden from operations) | Counsel | Phase 3 | Open |
| D25 | D20 | Counsel-directed as the default mode | Counsel | Launch | Open |
| D26 | D21 | Buyer-link consent wording and reliance letter | Counsel | Phase 5 | Open |
| D27 | D22 | CiV errors-and-omissions insurance | Stu + Sally | Before the first insurer pilot | Open |
| D28 | D23 | Loss model ownership (CiV v0 or Falcon's actuary) | Stu + Falcon | Phase 5 | Open |
| D29 | D24 | Base-rate study owner and budget (~$8K/yr) | Stu | Parallel | Open |
| D30 | — | Source labels: v3 uses letters A–D, S, N; v1.1 used "Tier 1–4" to keep "grade" for scores. Proposal: adopt v3's letters, always written "source grade A", never "grade A" alone | Owner | Before frontend update | **Decided by the owner 2026-10-08:** use source grades A, B, C, D, S, N, always written "source grade A" |
| D31 | — | How a number appears in lists (Ledger, alerts) when only tokens are kept: as typed by the user, or a masked label such as "(480) •••-0923" (would keep area code + last 4 digits) | Owner + counsel | Phase 1 | **Decided by the owner 2026-10-08: masked label** — area code + last 4 digits, e.g. "(480) •••-0923"; full numbers only as typed into search; buyers see no numbers. Counsel to confirm (C20); fallback if counsel says no: labels with no digits |
| D32 | — | (a) Keep CiV's own captures of **public** consent pages (they are CiV-made, grade A, not client records)? (b) May a re-fetched record be shown in the portal during a position lookup and then discarded? | Owner + counsel | Phase 2 | (a) **Decided by the owner 2026-10-08: keep** CiV's own captures of public consent pages (counsel to confirm, C19a). (b) Open (counsel, C19b) |
| D33 | — | Period report PDFs are kept (they hold only derived results) | Owner | Phase 4 | Proposed |
| D34 | — | Obtain Engineering Spec v2 (Sep 27) to confirm what "unchanged from v2" means | Owner | Before Phase 1 | **Closed 2026-10-08:** the owner has no v2; where v3 says "unchanged from v2", v1.1 stands |
| D36 | — | Dollar figures (theoretical exposure, loss model) in **insurer and acquirer views only**, always labelled "uncalibrated estimate"; the client portal shows no dollar figures | Owner + counsel | Phase 5 | **Decided by the owner 2026-10-08** (counsel approves wording) |
| D37 | — | AI conversation review: AI reads or listens to each whole conversation right after it ends, decides opt-outs itself (after its accuracy gate), and checks whether the client's dialer and CRM marked them; new metric M38 and an urgent alert (§2b) | Owner + counsel | Phase 3 | **Decided by the owner 2026-10-08** (counsel: C21, C22) |
| D35 | — | Live sync: CiV checks client tools continuously (live feed + hourly catch-up + weekly full comparison), not nightly (§2a) | Owner | Phase 1 | **Decided by the owner 2026-10-07** |

The PDF says phase 5 buyer views gate on "Phase 6" for D21 and D23; read as
Phase 5 (buyer views) here.

### 12.1 Owner answers (2026-10-08)

| # | Question | Answer |
|---|---|---|
| D30 | Source labels | Source grades A, B, C, D, S, N, written "source grade A" |
| D31 | Numbers in lists | Masked label: area code + last 4 digits, e.g. "(480) •••-0923" |
| D32a | CiV's own page captures | Keep them |
| D36 | Dollar figures | Insurer and acquirer views only, labelled "uncalibrated estimate" |
| D34 | Spec v2 | Not available; v1.1 stands where v3 says "unchanged from v2" |

What CiV keeps (§2.1) therefore adds two items: the **masked number label**
(area code + last 4 digits, per phone token) and **CiV's own captures of public
consent pages** (screenshot, page text, measurements). Neither is a client
record; counsel confirms both (C19a, C20).

## 13. Where each change landed

| Document | What changed |
|---|---|
| [01-engineering-spec.md](01-engineering-spec.md) | v3.0: rules, architecture, access levels, grades, data model, consent codes, new §5a provenance, §5b data integrity, metrics, revocation, scoring, new §9a buyers, store-nothing evidence, build order, decisions |
| [02-rulebook-parameters.md](02-rulebook-parameters.md) | New keys (worst-case values, caps, import, reconciliation, testing, counsel-owned consent keys) |
| [03-metric-specs.md](03-metric-specs.md) | M32–M37; M11 and M13 redefined; basis on every value |
| [05-counsel-brief.md](05-counsel-brief.md) | New (C) items from v3 |
| [../architecture.md](../architecture.md), [../design.md](../design.md), [../BRD.md](../BRD.md), [../../README.md](../../README.md) | Store-nothing architecture, buyer readers, data model, wording |
| [../feature-list.md](../feature-list.md), [../plans/2026-10-01-00-roadmap.md](../plans/2026-10-01-00-roadmap.md) | Feature changes, new features, revised build order |

## 14. What this means for the frontend already built (not yet changed)

The portal built on 2026-10-04 follows v1.1. To match v3 (each needs the
owner's yes before work starts):

1. **Banned words now shown in the portal:** "stored write-once", "Records held" (Evidence Vault); "DNC scrub records" (Source Registry, readiness, fixtures); "Fix step" (Action drawer). Update `src/lib/wording.ts` with the new words.
2. **Action Queue → Findings and decisions:** noun-phrase titles, common responses, decision record with the counsel prompt; overdue against the real date.
3. **Source labels:** Tier 1–4 → source grades A–D, S, N (D30); basis chip on every metric.
4. **Scores:** evidence coverage beside every score; three caps with "held" naming the cap; confirmed-rules score; worst-case instead of "Not measured" where v3 says so ("not checked" for M11); `RULE_PENDING`.
5. **Metrics:** 33 → 39.
6. **Evidence Vault:** position lookup outcomes Matches / Changed / No longer at source; legal hold = instruction + client-owned bucket, release by a Legal user with a reason; wording "fingerprints of what CiV saw".
7. **Revocation:** test coverage on the matrix card; "not reached" / "untested"; test numbers never shown.
8. **New pages or sections:** access level; reconciliation (records completeness); import batches with proof requests; provenance ladder chart; untraced list; caller-ID inventory; insured states and conflicts; certificate custody.
9. **Buyer views:** insurer portfolio, attestation, loss model (labelled uncalibrated), export — a separate role set.
10. **Uploads** demoted to a fallback; Setup checklist adds the five import-batch confirmations.
11. **US spelling** and local time with UTC on hover.
