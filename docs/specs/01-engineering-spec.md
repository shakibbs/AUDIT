# CiV Automated TCPA Audit System — Engineering Spec

**Version:** 3.0 · **Date:** 2026-10-07 · **Supersedes:** v1.1 (2026-10-01), which elaborated v1.0 (Sep 27, 2026, @Zen)
**Source:** *Engineering Spec v3* (Oct 7, 2026, @Zen), in [../source-documents/](../source-documents/).
**Change summaries:** [CHANGELOG-v3.md](CHANGELOG-v3.md) (v1.1 → v3.0) and [CHANGELOG-v1.1.md](CHANGELOG-v1.1.md) (v1.0 → v1.1). Changes marked **[v3]** and **[v1.1]**. Anything v3 does not change stands as in v1.1.

> **[v3] Three foundations.** (1) CiV stores **fingerprints and its own analyzed results, never the client's records** (owner decision 2026-10-07, [CHANGELOG-v3 §2](CHANGELOG-v3.md#2-owner-decision-civ-holds-analyzed-data-only-shakib-2026-10-07)). (2) **Nothing the client says can raise a score**; unverified inputs take a worst-case value. (3) The core path runs on **API connectors**, not uploads.

---

## 1. Overview

The system automatically builds, for every contact a client made, an
independent measurement of whether proof of permission existed, where the
number came from, and **[v3]** how much of that measurement CiV verified
itself, rolled up per phone epoch, and flags every gap. It runs the
CIV-ATP-01 checkpoint library against data read from the client's own tools.

**[v3] Three readers, one record:** the **client** (portal), the **insurer**
(attestation and export) and the **acquirer** (diligence file).

**Who uses it:** **[v3]** mid-market companies (50–500 seats) that make
outbound sales calls and texts (first verticals: HVAC, solar, insurance,
financial services). The buyer is the owner or general counsel; an insurer's
chief underwriting officer and an acquirer's deal counsel read the same file.

**What it is not:** a call blocker, a CRM, or **[v3]** a records custodian.
CiV never sits in the call path, never contacts the client's customers or
vendors, never blocks or dials on the client's behalf, and **[v3]** never keeps
a copy of a client record. CiV does make its
own test contacts (revocation tests from CiV test numbers, and one callback to
each client caller ID for M21) and captures public consent pages with a
headless browser.

### Product rules engineers must build to

1. **Consent is decided per contact.** Every call and text gets its own consent status. A number's result is rolled up from its contacts.
2. **Consent needs proof — as a CiV policy, reported separately from the law.** Every contact records *why* proof is needed (`consent_required_basis`). A manual live call to a number on no DNC list is NO_PROOF with basis "CiV policy only". **[v1.1]** A contact may carry several bases; each is evaluated and reported separately (section 5).
3. **CiV does not sell, maintain or query DNC or litigator lists.** **[v3]** The client's own DNC check records are read when connected and reported as **Info only**. **[v1.1]** When no list covers a contact's date the basis is `dnc_unknown`, never silently "CiV policy only".
4. **Everything runs automatically.** No human is in the loop to produce a result. AI outputs pass their accuracy gate before they count. **[D37]** This includes AI conversation review: AI-found opt-outs count without a person confirming each one (section 8, "AI conversation review").
5. **Official access only.** Published APIs with the client's own credentials, read-only wherever offered.
6. **Flag, don't judge — in names too.** No output uses "violation", "breach", "illegal", "compromised", "fake", "fraud", "compliant", "non-compliant" or "ensures compliance". **[v3]** Also banned: "scrub", "scrubbed", "screen", "screening" (section 9).
7. **Names describe acts, not outcomes.** Capture, Test, Record — never Protection, Assurance, Prevention.
8. **Evidence is tamper-evident and graded by source** (section 10). A hash proves a record is unchanged, not that it was true. **[v3]** Source grades A, B, C, D plus **S** (insured states) and **N** (not supplied), each with a weight (section 4). Written "source grade A", never "grade A" alone, so it is not confused with score grades (D30, decided 2026-10-08; v1.1 used "Tier 1–4").
9. **Built for counsel.** Counsel-directed engagements, without claiming more protection than the law gives. **[v3]** Counsel-directed is the **default** engagement mode (counsel to confirm, D25).
10. **[v1.1] A status-affecting parameter needs counsel approval.** Any rulebook key flagged `affects_status` must be approved by the counsel role before an `approved` rulebook version can include it.
11. **[v1.1] TBD blocks client output, not engineering.** A `provisional` rulebook lets code be built and tested; its outputs are watermarked and never shown to client roles. **[v3]** A checkpoint that depends on a TBD value returns `not_run` / `RULE_PENDING`; it never runs on a placeholder.
12. **[v3] Store fingerprints, not content.** CiV keeps a SHA-256 hash, source system, source record ID, fetch time, trusted timestamp and daily anchor per record, plus its own analyzed results. Content is read in memory and discarded when the job ends.
13. **[v3] Unverified counts as worst case.** A field CiV cannot verify takes its pessimistic default, defined per field in the Rulebook.
14. **[v3] A statement never raises a score.** Anything the client tells CiV is stored as an `attestation_statement`, shown as "Insured states", signed by an officer, and weighted 0 for raising any score.
15. **[v3] Every number states its basis.** Each metric value and attestation field carries its source grade, and every score shows its evidence coverage beside it.
16. **[v3] CiV never claims or retains a certificate in its own account.** Certificate lookups use the client's key; billed operations still need written approval.

## 2. System architecture

The pipeline has six layers, and nothing is checked until its source has
been fingerprinted. **[v3]** The evidence store becomes a **fingerprint
ledger**; two engines are new (Provenance, Integrity); no content is kept
after a job ends. The one place a copy of a client record may exist is the
**hold bucket, which the client owns** (legal hold only). The layer diagram, the consent flowchart,
the domain map and the build-phase diagram are in
[../architecture.md](../architecture.md) section 3.

| Component | Responsibility | Key requirement |
|---|---|---|
| Connector service | Pull data from client tools through published APIs | Client-owned credentials, read-only or least-privilege, every call in `access_log`; **[v3]** in memory only; fingerprint each record; tokenize phones at the edge; read billing totals; drop content |
| Upload service | **[v3] Optional fallback** for tools without an API | Source grade D (weight 0.7); parsed, fingerprinted and discarded in the same job |
| **[v3]** Test + capture service | CiV test lines, page captures, caller-ID callbacks, RND exposure sample | Annex C; test numbers never shown to any portal role |
| **[v3]** Attestation intake | Officer-signed client statements | Weight 0; conflicts written by the Integrity engine |
| **[v3]** Fingerprint ledger (replaces the evidence store) | Hashes, fetch times, trusted timestamps, daily anchors | Postgres + Merkle anchor; **no content stored**; no S3 Object Lock for content |
| **[v3]** Hold bucket | Snapshot of named source records under legal hold | **Owned by the client**; CiV has a write-only role |
| **[v3]** Provenance engine | Provenance ladder, import batches, evidence search, proof requests | Section 5a |
| **[v3]** Integrity engine | Evidence coverage, reconciliation, caller-ID inventory, statement conflicts | Section 5b |
| Normalizer | Turn sources into outbound contact events and phone epochs | Dedupe across systems only; time zone from ZIP *and* area code; epochs as date ranges with certainty |
| Consent engine | Decide a consent status for every contact and every basis | Section 5; same inputs + `evaluation_as_of` = same result |
| Revocation tester | Send opt-outs from CiV test numbers and time suppression | Section 8 |
| Lead Inspector | Batch checks on each lead and vendor scorecards | [04-lead-inspector.md](04-lead-inspector.md); batch only in v1 |
| AI reader | Every AI feature | Each feature has its own accuracy gate; outputs stored with model and prompt version |
| Rules engine | Run the checkpoints against normalized data | Each result references checkpoint, run and rule values used; **[v1.1]** per-checkpoint aggregation rule; **[v3]** three caps, confirmed-rules score, TBD values gate execution |
| Rulebook | Dated legal rule values plus per-client settings | One parameter registry ([02-rulebook-parameters.md](02-rulebook-parameters.md)); **[v1.1]** draft / provisional / approved |
| Outputs | Metrics, evidence file, **[v3]** findings and decisions, alerts, portal, period report PDF, attestation API | Sections 7, 9 and 9a |

**[v3]** Normalizer, consent engine, AI reader and Rulebook are unchanged
except that they work on `phone_token`, never on phone numbers.

## 3. Data sources and connectors

Every source connects through a published API with the client's own
credentials, or falls back to a client upload. The connector layer is
pluggable: a new vendor is one adapter. Each source carries a **source
grade** (section 4; **[v3]** the "Tier" column below maps 1 → A, 2 → B,
3 → C, 4 → D).

### Data access levels **[v3]**

A client's access level decides which checks can run. Stored on
`client.access_level` and recomputed nightly from connector health. Contact
logs (Level 1) are the minimum for monitoring; below Level 1 the client gets
the outside-in score only.

| Level | What the client connects | What it unlocks |
|---|---|---|
| 0 | Application only | Self-reported fields (source grade S); outside-in checks: page captures, test opt-outs (with Annex C), caller-ID callbacks, carrier labels, court dockets |
| 1 | Dialer + messaging platform logs, by API or scheduled export | Contacts after opt-out, calling hours, abandoned calls, cross-border, dialer-side import detection, untraced numbers, reconciliation. **Minimum for monitoring** |
| 2 | Certificate key: the client's own TrustedForm / Jornaya account | All five consent checks, page match, vendor scoring, certificate custody |
| 3 | Copy of the lead feed: CiV added as an extra delivery destination in the lead platform | Real-time provenance; the client switches it off in one click |
| 4 | Read-only CRM API | Lead-source fields, form submissions, purchase and inquiry dates, record creator and field history |

### Sources Vendor facts below are as reported in the September 2026 review;
confirm each vendor's current API and terms before building its adapter.

| Source | First vendors | Access | Data pulled | Fallback | Tier |
|---|---|---|---|---|---|
| Consent certificates | TrustedForm (Certificate API v4, HTTP Basic with the client's account key); Jornaya (owned by ActiveProspect since Jan 2026; buyer's own account codes, billed to buyer) | Client's account | Certificate ID, phone, timestamps, page URL, page snapshot, seller, retention status. Unretained certificates deleted after 72 h (90 days if confirmed); retained 5 years | Client supplies certificate IDs; CiV still retrieves each one | 2 |
| Other consent proof | IVR / keypress recordings, signed forms | Upload or recording platform API | File, date, phone, whether required disclosures were played | Upload | 3 or 4 |
| Dialers | Five9 (reporting-only API user role), Convoso (single token, no scopes → least-privilege fallback), RingCentral, NICE CXone | Client's account | Every call: number, time, direction, connect and end time, dial mode, prerecorded / AI flag, campaign, agent, disposition, caller ID, attestation if exposed, recording link; **[v3]** list ID and list insert time per lead (dialer-side imports) | Daily export | 3 / 4 |
| SMS platforms | Twilio and similar | Client's account | Every message: number, time, direction, body (**[v3]** read in memory only), delivery status; every inbound reply; **[v3]** billing totals (messages and segments billed) | Daily export | 3 / 4 |
| CRM | Salesforce, HubSpot, ServiceTitan (each client creates its own custom app until partner approval) | Client's account | Contact ID, all phone numbers, **address (state, ZIP) with change history**, created date, lead ID and source, certificate ID, consent and opt-out fields with timestamps, customer status, purchase and inquiry dates; **[v3]** creator user, created time and **field history** for opt-out, do-not-call and lead-source fields (HubSpot: record source property — Import, CRM UI, Forms, Integration, API; confirm the internal name per portal. Salesforce: `CreatedById`, `CreatedDate`, Lead/Contact history objects, which exist only if field history tracking is on) | Export | 3 / 4 |
| Lead platforms | LeadConduit, lead vendors | Client's account | Lead ID, vendor, sub-ID, first-party flag, capture URL, capture and delivery times, certificate ID, price | Lead file | 3 / 4 |
| Reassigned Numbers Database | Somos (reassigned.us Caller API or bulk SFTP) | CiV's own registered caller-agent account | Yes / No / No Data to "permanently disconnected since date X?". No disconnect dates. Coverage from July 27, 2020 (dates before Jan 27, 2021 return no data) | None; "not checked" | 1 |
| Client's own RND query logs | Client's Somos account | Export | Each query: number, date asked about, time queried, answer | None; **[v3]** M11 = "not checked" (worst case), not "not measured" | 4 |
| **[v3]** DNC check records (renamed) | Client's DNC check vendor | Export or client vendor API | Registry version used, check time, numbers flagged | None; M13 not available. **Info only, never enters the score** | 3 / 4 |
| **[v3]** Carrier invoices | Client's carrier | Carrier billing API, else upload | Calls and minutes billed per month (reconciliation) | Reconciliation "not available" | B by API, D if uploaded |
| **[v3]** Vendor invoices | Lead vendors | Upload or export | Leads billed per vendor per month (provenance ladder rung 3, reconciliation) | Rung skipped | D |
| **[v3]** Court dockets | CourtListener RECAP, PACER | Public | Matters naming the client (prior-matters conflict check) | None | B |
| Complaint log | Client | Upload | Date, number, channel, description, resolution date | None; M24 not measured | 4 |
| Carrier line type and caller name | Official lookup provider (e.g. Twilio Lookup), only under written use-case approval | CiV's account | Line type, carrier, caller name, line status | None; signals "not measured" | 2 |
| **[v1.1]** Email verification | Commercial verification API (never direct mail-server probing) | CiV's account | Deliverability, disposable-domain flag | None; signal "not measured" | 2 |
| **[v1.1]** Domain age | RDAP public registration lookup | Public | Registration date | None; signal "not measured" | 2 |
| Consent page captures | CiV headless browser | Public pages | Rendered page, screenshot, DOM, text, measurements, hash | None | 1 |
| Form behaviour data | TrustedForm Insights (bought by the client, per data point) | Client's account | Time on page, paste, device and IP data | None; signals "not measured" | 2 |
| Client lists | Internal do-not-contact, DNC check output, litigator lists | Upload or client vendor API | Number, entry date or list version date | Required for list metrics | 4 |
| Documents | Vendor contracts, policies, training logs | Upload (**[v3]** read in memory by the AI reader, then discarded) | PDF / DOCX / CSV | Upload only | 4 |
| **[v3]** Client statements | The client's officer | Portal form | Self-reported answers (application, attestation) | — | S |

### Connector requirements

- **Credentials:** OAuth where offered, else API key, in a secrets vault, revocable by the client from the portal.
- **When no read-only access exists:** (1) a dedicated least-privilege user, with CiV's contract committing to reads only and every call logged; (2) scheduled exports, source grade D. (Decision D6.)
- **Billed vendor operations:** CiV never triggers a billed operation on the client's account (certificate retain, verify, insights) without the client's written approval, kept as a fingerprinted record.
- **Build order follows the pilot client's systems** (D3). **[v3]** The v1.1 upload-only Phase 0 is removed: uploads are a fallback, never the core path.
- **[v3] Process in memory.** A connector streams records, computes fingerprints and derived fields, writes them, and drops content. Nothing is written to disk except fingerprint rows and derived values.
- **[v3] Tokenize at the edge.** Phone numbers become `phone_token` inside the connector job, before any write. The per-client HMAC key lives in a KMS, scoped to that client's jobs (key custody: D19).
- **[v3] Read billing totals.** Every Level 1 connector also reads the platform's billing totals for the period, or marks reconciliation "not available".
- **Sync:** backfill up to `lookback_years`; then **live sync** (below).
- **[v3, owner decision D35] Live sync — nothing missed.** CiV watches the client's tools continuously, in three layers:
  1. **Live feed.** Each tool notifies CiV of every change (webhooks or change events: HubSpot webhooks, Salesforce change events, Twilio message and status callbacks, dialer call events, lead platform deliveries). CiV reads that change in memory, fingerprints it, runs the per-contact checks, stores the result and drops the record.
  2. **Catch-up sweep** every `catchup_interval_minutes` (60): CiV asks each tool for everything changed since its stored cursor. Anything the live feed missed is processed and written to `sync_gap`. Tools with no notifications are polled every `poll_interval_minutes` (5).
  3. **Full comparison** every `full_sweep_interval_days` (7): a full listing finds deleted or silently changed records; the period reconciliation (section 5b) finds missing volume against the bills.
  - **On each change:** consent status for affected contacts, contact after opt-out, calling hours, import-batch detection, and **urgent alerts within `urgent_alert_max_minutes` (15)** (contact after "STOP", opted-out numbers re-added, unknown caller ID). Scores and metrics refresh every `score_refresh_minutes` (60). The daily anchor and nightly re-evaluation of time-dependent results stay nightly.
  - **Reliability:** if a source's gap share passes `live_gap_alert_share` (1%) in a day, CiV raises a connector-reliability alert. Every event is idempotent by `(source_system, source_record_id, sha256)`, so the same change arriving twice is processed once.
  - **Limits:** vendor rate limits; Salesforce field history only if the client enables it; live checking raises the cost per client somewhat.
- **Health:** **[D35]** each source shows Live / Catching up / Stale in the portal; a connector with no change and no heartbeat within `source_freshness_hours` (**2**, was 48) raises an alert; **[v3]** dependent inputs take their worst-case value (section 5b) and the access level is recomputed.
- **Terms of service:** confirm each vendor's API terms allow client-authorised third-party access before building its adapter.
- **[v1.1] Raw bytes:** the fingerprint is taken over the exact response body plus request metadata (URL, status, subset of headers); never a re-serialized object. **[v3]** The body itself is not kept.

## 4. Data model

The central objects are the **contact event** (where consent is decided) and
the **phone epoch** (one number held by one person). Legal rules are stored
with the dates they apply, and every versioned row carries
`valid_from` / `valid_to`. Column-level definitions are in
[../design.md](../design.md) section 1.

**[v3] Global changes:** every `phone_e164` column becomes `phone_token`
(HMAC-SHA256 with a per-client key; key version in `phone_token_kid`);
`artifact` becomes `fingerprint`; `deletion_log` is removed; twelve tables are
new. Versioning (`valid_from` / `valid_to`, never overwrite) and row-level
security on `client_id` stand for every table.

### What CiV stores **[v3, owner decision 2026-10-07]**

CiV holds **only its own analyzed data** and a fingerprint of every record it
read — never CRM records or any other client record (D18). Full table and the
explanation of how every portal page and report is built from analyzed data:
[CHANGELOG-v3 §2](CHANGELOG-v3.md#2-owner-decision-civ-holds-analyzed-data-only-shakib-2026-10-07).

| Kept by CiV | Never kept |
|---|---|
| Fingerprints, anchors, phone tokens, **masked number labels (area code + last 4, D31)**, **CiV's own captures of public consent pages (D32a)**, derived contact facts (time, channel, campaign, dial mode, category, state, time zone), consent results, opt-out facts, checkpoint results, scores, metrics, findings, decisions (note as a hash), reconciliation totals, import batches, signed statements and conflicts, CiV's own test data, rulebook, runs, access log, CiV's own reports | Phone numbers, names, emails, street addresses, message text, recordings, transcripts, certificate contents, CRM notes and deal details, agent names, uploaded files, documents |

Summary of tables:

| Group | Table | Key fields |
|---|---|---|
| Configuration | `rulebook_version` | version_id, **[v1.1]** status (draft / provisional / approved), published_at, approved_by, **[v1.1]** counsel_approved_by, notes |
| Configuration | `rule_value` | key, value, jurisdiction (**[v1.1]** state *or* federal circuit / district), effective_from, effective_to, rulebook_version, **[v1.1]** affects_status, owner, status, variants (strict / lenient), source_ref |
| Configuration | **[v1.1]** `state_consent_rule` | state, effective dates, channels_covered, contact_types_covered, autodialer_definition, consent_type_required (any / written / signed_written), private_right_of_action, source_ref |
| Configuration | `client_parameter` | client_id, key, value, effective dates, set_by, approved_by |
| Configuration | `client` | client_id, name, verticals, states, engagement_start_date, engagement_mode (direct / counsel_directed; **[v3]** default `counsel_directed`), litigation_forum, **[v1.1]** legal_hold, kms_key_arn, expected_sources, **[v3]** access_level (0–4), hmac_kid |
| Configuration | `client_brand` | client_id, brand or DBA name, valid dates |
| Configuration | `campaign` | campaign_id, client_id, source_system, message_category (marketing / informational / unknown), confirmed_by, valid_from |
| Runs | `run` | run_id, client_id, kind (nightly / backfill / report / phase0), evaluation_as_of, rulebook_version, code_version, **[v1.1]** variant, output_visibility (client / internal), started_at, finished_at |
| Runs | `checkpoint` | checkpoint_id, domain_code, automation_bucket, test_procedure, criteria, weight, authority_ids, **[v1.1]** aggregation {unit, pass_max_share, warn_max_share} |
| Runs | **[v1.1]** `metric_checkpoint_map` | metric_code, checkpoint_id |
| Evidence | **[v3]** `fingerprint` (was `artifact`) | fingerprint_id, client_id, source_system, source_record_id, source_grade (A / B / C / D), fetched_at, sha256, tsa_token (RFC 3161), anchor_date, content_kind, leaf_index, merkle_path, request_meta. **Dropped:** storage_uri, retention_until, access_level |
| Evidence | **[v3]** `purge_log` (replaces `deletion_log`) | Records in-memory job failures that wrote partial rows, and their clean-up. Nothing else is held to delete |
| Evidence | `merkle_anchor` | date, merkle_root, opentimestamps_proof, rfc3161_token, **[v1.1]** status, leaf_count |
| **[D37]** Stopping | `conversation_review` | review_id, client_id, phone_token, channel (call / text), conversation_ref (source record IDs), ended_at, reviewed_at, result (opted_out / partial_request / wrong_number / opted_back_in / unclear / none), moment_offset_seconds or message_ref, confidence, model, prompt_version, fingerprint_id, opt_out_id, client_marked_at (null until marked), alert_id. No audio, transcript or text |
| **[D35]** Sync | `sync_cursor` | client_id, source_system, cursor (vendor change token or timestamp), mode (live / poll), last_event_at, last_heartbeat_at, last_catchup_at, last_full_sweep_at |
| **[D35]** Sync | `sync_gap` | client_id, source_system, source_record_id, sha256, found_by (catchup / full_sweep), changed_at, found_at, delay_seconds |
| Evidence | `access_log` | who, what, when, from where — every portal view, export and connector call |
| Evidence | `ai_output` | output_id, feature, model, prompt_version, checklist_version, input_fingerprint_ids, output (**[v3]** derived result only, never the input text), confidence, created_at |
| Evidence | **[v1.1]** `ai_gate` | feature, items_tested, agreement, passed, evaluated_at |
| Evidence | `page_capture` | capture_id, url, captured_at, viewport, screenshot and DOM fingerprint ids, measurements, **[v1.1]** consent_block_hash, similarity_to {proof_id, score, method}. **[v3]** These are CiV's own captures of public pages; **CiV keeps the screenshot, page text and measurements** (owner decision D32a, 2026-10-08; counsel to confirm) |
| Numbers | `phone_epoch` | epoch_id, client_id, **[v3]** phone_token, phone_token_kid, start_after, start_before, end_after, end_before, epoch_certainty (known / bounded / unknown), evidence_fingerprint_ids, valid dates |
| Numbers | `contact_epoch_assignment` | event_id or proof_id, epoch_id, assignment_certainty, valid dates |
| Numbers | `address_version` | contact_id, state, zip, time_zone, valid dates, source |
| Numbers | `rnd_query_log` | **[v3]** phone_token, date_asked_about, queried_at, answer, queried_by (client / civ), monthly_update_date, fingerprint_id |
| Contacts | `contact_event` | event_id, client_id, **[v3]** phone_token, source_system, direction, channel, occurred_at_utc, connected_at, ended_at, answered, disposition, sms_delivery_status, **[v3]** body_fingerprint_id, recording_fingerprint_id, is_confirmation, dial_mode, prerecorded_or_ai, campaign_id, agent_id, caller_id, stir_attestation, lead_id, address_version_id, line_type, location_confidence, **[v1.1]** local_time_zone_zip, local_time_zone_area, dedupe_group_id, is_test, frozen |
| Consent | `consent_proof` | proof_id, **[v1.1]** client_id, proof_type (web_cert / ivr_recording / keypress / signed_form / existing_customer / prior_express), provider, provider_ref, captured_at, confirmed, **[v3]** phone_match (from the provider's matching check; replaces phone_on_proof), seller_named, **[v1.1]** seller_match, page_url, channels_covered, disclosures_played, relationship_type, relationship_date, retention_status, expires_at, **[v3]** fingerprint_id (was artifact_id), custody (client_account / vendor_only / unclaimed), claimed_at, valid_from |
| Consent | `consent_evaluation` | eval_id, **[v1.1]** client_id, event_id, **[v1.1]** run_id, evaluation_as_of, **[v1.1]** variant, status, primary_reason_code, reason_codes, **[v1.1]** bases [{basis, status, codes, proof_id}], is_legal_basis, labels, proof_id, frozen, **[v1.1]** reeval_reason, rulebook_version, rule_values_used, ai_output_ids, valid_from |
| Leads | `lead` | lead_id, client_id, vendor_id, sub_id, first_party, capture_url, captured_at, delivered_at, cert_ref, price, is_test, **[v3]** phone_token, basis (feed / crm_field / invoice / cert_domain / manual_import / untraced), batch_id, source_type (incl. referral / appended / skip_traced) |
| Leads | `vendor`, `vendor_contract`, `acquired_list` | as v1.0; `acquired_list` **[v1.1]** adds sample_seed |
| Stopping | `opt_out_event` | opt_out_id, **[v1.1]** client_id, **[v3]** phone_token, channel, method, received_at, **[v3]** text_fingerprint_id (the text itself is read in memory only), scope, source (client_data / civ_test), **[v1.1]** designated, is_test |
| Stopping | `opt_out_suppression` | opt_out_id, system, suppressed_at or null, inferred |
| Revocation tests | `test_number`, `annex_c_authorization`, `revocation_test`, `matrix_cell` | as v1.0; `test_number` **[v1.1]** adds time_zone, **[v3]** rotated_at (rotation every `test_rotation_days`; never shown in any portal role); `revocation_test` **[v3]** adds seeded_campaign_id, seeded_via (client_form / vendor_form), outcome incl. not_reached; `matrix_cell` adds p90_hours |
| Client records | `client_list_entry`, **[v3]** `dnc_check_run` (was `scrub_run`), `complaint`, `agent`, `training_record` | as v1.0; `client_list_entry` **[v1.1]** adds date_approximate; **[v3]** phone_token; list_type internal / dnc_check / litigator; `complaint` phone_token; `agent` holds no names (agent ID only) |
| Results | `checkpoint_result` | result_id, run_id, checkpoint_id, scope, status (pass / warn / fail / not_run), reason_code, **[v1.1]** share, evidence_fingerprint_ids, ai_output_ids |
| Results | `metric_snapshot` | client_id, metric_code, date, value, numerator, denominator, data_completeness, checkpoints_run, **[v1.1]** checkpoints_total, run_id, breakdown, labels, **[v3]** basis_mix (source grade → share), evidence_coverage, worst_case_fields. Also stores `SCORE_CONFIRMED` |
| Results | `finding` | finding_id, client_id, severity, domain_code, title (**[v3]** noun phrase of what was observed), affected_count, **[v3]** response_ids (was fix_step_ids; Set responses only), first_seen, status |
| **[v3]** Provenance | `import_batch` | batch_id, client_id, system (crm / dialer), created_by, starts, ends, created_count, updated_count, classification (bulk_import / hand_entered / small_batch / dialer_import), confirmed_by_client, opted_out_readded |
| **[v3]** Provenance | `evidence_event` | event_id, client_id, phone_token, system, type (cert / inbound_call / inbound_sms / form_submission / purchase / recording), occurred_at, source_record_id, fingerprint_id |
| **[v3]** Provenance | `proof_request` | request_id, batch_id, phone_token, sent_at, answered_at, answer (proof / none), fingerprint_id |
| **[v3]** Integrity | `reconciliation` | client_id, period, measure (calls / texts / vendor_leads / seat_capacity / stop_replies / days_present), records_count, independent_total, ratio, status (consistent / flag), total_fingerprint_id |
| **[v3]** Integrity | `attestation_statement` | statement_id, client_id, field_key, statement_text, signed_by, signed_at, fingerprint_id |
| **[v3]** Integrity | `attestation_conflict` | conflict_id, statement_id, observed_text, evidence_ref, treatment (scored_as_not_done / higher_figure_used / period_flagged / unknown_system) |
| **[v3]** Integrity | `caller_id_inventory` | client_id, caller_id_token, seen_by (test_line / carrier_label / consumer_report), seen_at, brand_announced, in_connected_system |
| **[v3]** Decisions | `response_library` | response_id, domain_code, text, status (Set / Proposed / TBD), owner = counsel, valid_from |
| **[v3]** Decisions | `decision_record` | decision_id, finding_id, decision (accepted / declined / alternative), note_sha256, recorded_by, recorded_at. The note text stays in the client's own workspace only |
| **[v3]** Buyers | `buyer_org`, `buyer_link` | buyer_org_id, kind (insurer / acquirer), name; buyer_link = buyer_org_id, client_id, scope (attestation / integrity / export), granted_by, granted_at, revoked_at |
| **[v3]** Buyers | `attestation_snapshot` | snapshot_id, client_id, as_of, payload (schema `civ.attestation.v1`), sha256, signed_statement_ids |

### Phone epochs

The Reassigned Numbers Database only answers yes, no or no data to "was this
number permanently disconnected since date X?" It never gives the disconnect
date, and it has no data before July 27, 2020. So:

- An epoch boundary is stored as a **range** (`end_after … end_before`), found by repeated dated queries between the consent date and the contact date (**[v1.1]** budget `rnd_query_budget_per_number`), or from a second carrier source.
- `epoch_certainty`: **known** (boundary pinned to a day), **bounded** (range), **unknown** (no data or never checked).
- A contact inside a bounded range is labelled "reassignment uncertain". Any result on an unknown epoch is labelled **"reassignment not checked"**; it is never silently treated as the same person.
- CiV's own after-the-fact queries **do** split epochs; they are not counted as the client's pre-contact check (M11).
- **[v1.1]** The monthly update dates come from the `rnd_update_calendar` reference table.

### Source grades **[v3]** (were "source tiers" in v1.1)

Grade by where the **content** came from, not who supplied the pointer. The
weight is how much a value counts toward evidence coverage (section 5b).

| Source grade | v1.1 tier | Meaning | Weight | Examples |
|---|---|---|---|---|
| A | 1 | Captured by CiV itself | 1.0 | Page captures, CiV RND queries, test-number records, caller-ID callbacks |
| B | 2 | Retrieved by CiV from an independent third party | 1.0 | Certificates via the client's key, carrier lookups, carrier and platform invoices via billing API, court dockets, email verification, RDAP |
| C | 3 | Retrieved by CiV from the client's systems by API | 1.0 | Dialer, SMS, CRM, lead platform records |
| D | 4 | Exported or uploaded by the client | 0.7 | Scheduled exports, spreadsheets, uploaded invoices and contracts, client query logs |
| S | — | Insured states | 0 (can lower, never raise) | Application answers, officer-signed statements |
| N | — | Not supplied | 0, worst-case default applies | Any field with no source |

### Versioning, deletion and contacts

- **Versioning:** rows are never overwritten; a change closes the old row and opens a new one. Epoch assignments live in `contact_epoch_assignment`, so a later split re-points contacts without editing them.
- **Deletion:** **[v3]** CiV holds no client content, so there is nothing to delete under retention. At contract end the client's HMAC key is destroyed, which makes every token unlinkable (crypto-shredding), logged in `access_log`. A result whose source record later disappears or changes is labelled, not deleted (section 10).
- **Contacts:** only `direction = outbound` rows are contacts. A text counts once the SMS platform accepts it; delivery status is stored separately. `count_unanswered_calls` and `count_undelivered_sms` decide the edge cases.
- **Dedupe:** matches only **across systems**, one-to-one, same number and channel within `dedupe_window_seconds` (never less than `clock_skew_seconds`). Two dialer calls 40 seconds apart stay two contacts. The dialer or SMS record wins.
- **Time:** UTC everywhere. **[v1.1]** Both the ZIP time zone (from the `address_version` in force) and the area-code time zone are stored; when they disagree, both are checked and the stricter result counts (`location_conflict_rule`); low-confidence contacts are reported as "possible" findings, never dropped (`location_uncertain_treatment`).

### Phase 1 core **[v3]** (was Phase 0 core)

`rulebook_version`, `rule_value`, `state_consent_rule`, `client_parameter`,
`client`, `client_brand`, `campaign`, `run`, `fingerprint`, `purge_log`,
`merkle_anchor`, `access_log`, `ai_output`, `ai_gate`, `page_capture`,
`phone_epoch`, `contact_epoch_assignment`, `address_version`,
`rnd_query_log`, `contact_event`, `consent_proof`, `consent_evaluation`,
`lead`, `vendor`, `opt_out_event`, **`import_batch`, `evidence_event`,
`reconciliation`**. Import detection and completeness are Phase 1 because the
worst-case defaults depend on them. The rest arrive with the phase that first
needs them.

## 5. Consent verification engine

Every call and text gets exactly one of four consent statuses, decided by
five checks run in order — **[v1.1]** once per basis the contact carries,
then combined. A number's result for the selected report period is its worst
contact status, shown with counts ("3 of 41 contacts NO_PROOF"), ranked worst
to best: **NO_PROOF > CONFLICTING > WEAK > VERIFIED**.

The flowchart is in [../architecture.md](../architecture.md) §3.1.

**[v3]** The five checks, four statuses, timing rules and algorithm stand.
Four things change: what happens when a certificate is gone, how existing
customers and inbound contacts count as evidence, which fields each check
reads, and which wording rules are counsel-owned.

### Before the checks: what proof this contact needs

For each contact the engine first works out, using the rules in force **on the contact's date**:

| Input | How it is set |
|---|---|
| `message_category` | marketing / informational / unknown, from the campaign-to-category map the client confirms at onboarding. Unknown is evaluated as marketing and reported in its own "category unknown" bucket. |
| Robocall or not | Autodialed if the dial mode is in `autodialed_modes`; prerecorded or AI voice from the dialer flag; marketing texts count as autodialed when `sms_treated_as_autodialed`. Unknown dial mode is treated as autodialed and labelled "dial mode unknown". **[v1.1]** While the rulebook is provisional, these keys run in strict and lenient variants. |
| `consent_required_basis` | **Every** basis that applies: `robocall_marketing`, `robocall_informational`, `dnc_listed` (number on the client's DNC check or internal list on the contact date), **[v1.1]** `dnc_unknown` (no client list covers the contact date; labelled "DNC list not supplied"), `state_law` (**[v1.1]** a `state_consent_rule` row matches the recipient state, date, channel and contact type), or `civ_policy` (none of the others). |
| Required proof type | `robocall_marketing` needs a type in `written_consent_types`. `robocall_informational` needs any prior express consent (**[v1.1]** evidence per `prior_express_evidence_types`). `dnc_listed` needs **signed written** consent or an active existing-customer relationship (**[v1.1]** corrected from "consent"). `dnc_unknown` and `civ_policy` accept any accepted proof. `state_law` needs the row's `consent_type_required`. |
| **[v1.1]** `is_legal_basis` | True if any basis other than `civ_policy` and `dnc_unknown` applies. |

### The five checks

| Step | Check | Fails when | Status | Reason code |
|---|---|---|---|---|
| 1 | An applicable proof exists | No proof of any accepted type for this phone epoch | NO_PROOF | `NP_NONE` |
| 1 | | Only a CRM field says "consent = yes", or **[v3]** the only evidence is a column in a manual import | NO_PROOF | `NP_SELF_ASSERTED` |
| 1 | **[v3]** | Manual-import number with no `evidence_event` before first contact (section 5a) | NO_PROOF | `NP_NO_EVIDENCE_FOUND` |
| 1 | **[v3]** | Source type is referral, appended or skip-traced: no one can consent for someone else | NO_PROOF | `NP_THIRD_PARTY` |
| 1 | | Every proof is dated after the contact (see Timing) | NO_PROOF | `NP_BEFORE_CONSENT` |
| 1 | | An in-scope opt-out came before the contact (after grace and confirmation allowances), with no newer consent proof | NO_PROOF | `NP_AFTER_OPT_OUT` |
| 1 | | Only proof is an existing-customer relationship that had lapsed on the contact date | NO_PROOF | `NP_RELATIONSHIP_LAPSED` |
| 1 | | Proof type does not meet the required type for this basis, or the proof does not cover the contact's channel | NO_PROOF | `NP_WRONG_TYPE` |
| 2 | Proof opens at its source | Certificate not found at the provider **[v3] and CiV holds no fingerprint of it** (the lead record names a certificate the provider does not have) | CONFLICTING | `CF_NOT_FOUND` |
| 2 | **[v3]** | Certificate no longer opens, but CiV fetched it earlier and holds its fingerprint and trusted timestamp. Proves it existed on that date; cannot show its content | WEAK | `WK_FINGERPRINT_ONLY` |
| 2 | | Not found, and client-supplied capture time + `cert_unretained_expiry_hours` is earlier than CiV's first request (labelled `pre_engagement` if before `engagement_start_date`) | CONFLICTING | `CF_EXPIRED` |
| 2 | | Recording, signed form or purchase record missing (not deleted under retention) | CONFLICTING | `CF_FILE_MISSING` |
| 3 | Proof content is consent | Captured page shows no consent wording | NO_PROOF | `NP_NO_CONSENT_TEXT` |
| 3 | | Consent box pre-ticked | NO_PROOF | `NP_PRETICKED` |
| 4 | Sources agree | Phone on proof differs from phone contacted. **[v3]** Read from the provider's matching check (CiV submits the phone; the provider hashes it against the form), so CiV never needs the certificate's stored phone | CONFLICTING | `CF_PHONE_MISMATCH` |
| 4 | | Seller named is a different, known seller (not the client or one of its brands). **[v3]** Runs only when counsel sets `seller_named_required` = true (default false) | CONFLICTING | `CF_SELLER_MISMATCH` |
| 4 | | CiV's page capture has similarity below `ca_page_match_threshold` to the certificate snapshot (**[v1.1]** by `page_similarity_method`; only within `page_snapshot_max_gap_days`, else "not comparable") | CONFLICTING | `CF_PAGE_MISMATCH` |
| 4 | | Certificate created after the lead was delivered **[v1.1]** by more than `clock_skew_seconds` (within tolerance → `WK_TIMING_UNCERTAIN`) | CONFLICTING | `CF_CERT_AFTER_DELIVERY` |
| 5 | Completeness | Proof and contact within the clock tolerance of each other, on unlinked sources | WEAK | `WK_TIMING_UNCERTAIN` |
| 5 | | Certificate not retained long-term, or expiring within `cert_expiry_warning_days` of `evaluation_as_of` | WEAK | `WK_RETENTION` |
| 5 | | A **required** checklist item is missing | WEAK | `WK_WORDING` |
| 5 | | Web lead not traceable to a named vendor or the client's own form (existing customers exempt) | WEAK | `WK_LEAD_TRACE` |
| 5 | **[v1.1]** | No seller name found in the consent block by the rule-based match (`seller_match = not_found`) | per `seller_absent_effect` (provisional strict: NO_PROOF `NP_SELLER_ABSENT`; lenient: WEAK `WK_SELLER_NOT_FOUND`) | `WK_SELLER_NOT_FOUND` / `NP_SELLER_ABSENT` |
| — | All pass | — | VERIFIED | `VF_OK` |
| — | **[v3] Label** | Proof is a purchase or inquiry within its window. Covers `ebr_allowed_contact_types` only, never autodialed or prerecorded calls to cell phones | (label on the status) | `EBR_ONLY` |

A missing **optional** checklist item is a warning on the evidence file and
never changes the status. **CONFLICTING** means the sources disagree — which
**[v1.1]** includes the client's pointer disagreeing with the provider
(`CF_NOT_FOUND`, `CF_EXPIRED`, `CF_FILE_MISSING`): the client says a proof
exists and the source says it does not. Missing or invalid consent is
NO_PROOF.

### Timing

- **Linked contacts** (the contact carries the `lead_id` whose certificate is the proof): order is proven along the chain certificate → lead delivered → contact, with no tolerance. A call 45 seconds after the form is VERIFIED.
- **Unlinked sources:** proof counts as before the contact only if earlier by more than `clock_skew_seconds`. Within the tolerance either way → `WK_TIMING_UNCERTAIN`, never NO_PROOF. Later than the tolerance → `NP_BEFORE_CONSENT`.
- **Opt-outs** cut off coverage from received time + **[v1.1]** `optout_grace_business_days` (business days per `business_day_calendar`). One confirmation message within `confirmation_window_minutes` is never cut off. These are the same allowances M10 uses.

### Algorithm **[v1.1 revised]**

1. Build the contact's required-proof profile (above), including every basis.
2. **For each basis:**
   a. **Filter** proofs: same phone epoch, dated before the contact (Timing), not cut off by an in-scope opt-out, relationship not lapsed, type meets this basis's requirement, channel covered. After an in-scope opt-out, only a new consent proof restores coverage — a later purchase never does.
   b. If none remain: this basis is NO_PROOF, storing every step-1 code that fired; the primary code is the first in table order.
   c. **Evaluate** each remaining proof through steps 2–5; each proof gets a status and all the codes that fired in its deciding step.
   d. **Pick the best:** VERIFIED > WEAK > CONFLICTING > NO_PROOF; ties go to the most recently captured proof. If every proof fails at step 3, the basis is NO_PROOF with the step-3 codes.
3. **Combine:** the contact's status is the worst across its bases. `bases` stores each basis's status, codes and winning proof. `is_legal_basis` is stored.
4. Store `evaluation_as_of`, `run_id`, `variant`, rulebook version, the effective-dated rule values used, and any AI model and prompt version.

### Engineering notes

- **Same answer every time:** time-dependent checks use the stored `evaluation_as_of`, not the clock. Nightly runs re-evaluate only contacts whose result depends on time or on new data, recording `reeval_reason`.
- **Wording:** one checklist (`consent_checklist`, counsel-owned) is the only source of truth, used by this engine and the Lead Inspector. Rule-based items run in code from Phase 2; AI is used only for meaning. **[v1.1]** Seller identity gets a rule-based first pass (brand and DBA string match) so it is measured from Phase 2; AI only settles meaning.
- **AI outputs** are stored with model and prompt version and reused; re-asked only when the prompt or checklist version changes. Until a feature passes its accuracy gate its items are "not measured" and never change a status.
- **Existing customers:** step 2 means the purchase or inquiry record exists in the CRM. The relationship covers only `ebr_allowed_contact_types`, never texts or robocalls to a marketing basis, and never satisfies `dnc_listed` unless active.
- **[v1.1] Informational consent:** a record in `prior_express_evidence_types` (e.g. a CRM intake record where the customer supplied the number, with source and timestamp) is `prior_express` proof; a bare CRM consent flag stays `NP_SELF_ASSERTED`.
- **Source record gone or changed:** **[v3]** CiV deletes nothing, but a client's source record can disappear or change. The contact's last evaluation is **frozen** and labelled "inputs changed since evaluation" (or `FZ_SOURCE_DELETED` when the record is gone); it is never silently recomputed. Frozen contacts are excluded from re-evaluation, M02 counts and the hard cap.
- **[v3] No CiV stored copies.** v1.1's "CiV stored copy" is removed. A certificate that no longer opens is `WK_FINGERPRINT_ONLY` if CiV fingerprinted it earlier, else `CF_NOT_FOUND` / `CF_EXPIRED`.
- **[v3] Custody check** (runs before step 2): each certificate records `consent_proof.custody` — claimed in the client's account, claimed by the vendor only, or never claimed. Vendor-only certificates are evaluable only while the vendor shares them; the finding names the vendor and the share of leads affected. Unclaimed certificates go dark after about 72 hours.
- **[v3] Lead-quality signals:** fill time, paste and framing (`form_input_method`, `event_duration_ms`, `is_framed`) feed the vendor score, never a consent status.
- **[v3] Counsel-owned settings** (no code change): `seller_named_required` (the FCC one-to-one rule was vacated by the Eleventh Circuit in January 2025; default false); `written_consent_required_by_forum` (the Fifth Circuit held in February 2026, *Bradford v. Sovereign Pest Control*, that the statute requires prior express consent, not written; keyed by `client.litigation_forum`); `inbound_contact_scope` (which outbound contacts an inbound call or text covers: subject, days).
- **Provider outages:** during `provider_retry_hours` a contact keeps its previous status; a new contact is `PENDING` ("provider unavailable") and excluded from metrics.
- **Pre-engagement expiries** (`CF_EXPIRED` with `pre_engagement`) are reported as their own line and excluded from the hard cap.
- **[v1.1] Backfilled leads** never have a contemporaneous CiV page capture; step 4's page comparison is "not comparable" for them and buyers are told this at onboarding.
- **[v1.1] Variants:** while the rulebook is `provisional`, keys with `variants` run strict and lenient; both evaluations are stored and the counsel dashboard shows how many contacts change status per key.

## 5a. Lead provenance and manual imports **[v3]**

Every contacted number gets a provenance basis from the first source that
matches, strongest first. A number no source matches is **untraced**, and the
untraced list goes back to the client monthly. Manual imports are found from
API metadata — no file names, no uploads.

### Provenance ladder

Run per `phone_token`, for the latest lead record with `received_at` ≤ the
first contact:

1. **Lead platform feed** (Level 3 or lead platform API): vendor, sub-ID, price, certificate ID → `basis = feed`
2. **CRM lead-source field** (Level 4): vendor named on the record → `crm_field`
3. **Vendor invoice match:** number and date on a vendor's billed-leads file → `invoice`
4. **Certificate page domain:** the certificate's domain identifies the publisher → `cert_domain`
5. **Manual import batch** (below) → `manual_import`
6. Nothing matches → `untraced`; consent check 1 fires `NP_NONE`

M06 (Lead Traceability) still counts **vendor leads**. The ladder counts
**contacts** and is shown on Lead Provenance as its own chart. Never mix the
two denominators in one figure.

### Detecting manual imports

- **Creation bursts.** Exclude integration and API users (they are feeds). Group each remaining user's records by creation time: a gap over `import_gap_seconds` (120) starts a new batch. n ≥ `import_min_batch` (20) → `bulk_import`; n = 1 → `hand_entered`; else `small_batch`.
- **Update bursts.** CRMs deduplicate on phone or email, so a re-uploaded sheet often updates records instead of creating them. Run the same grouping over field-history rows on the opt-out, do-not-call and lead-source fields; record `updated_count`.
- **Dialer-side imports.** Numbers in the dialer with no CRM record, grouped by list ID and list insert time → `dialer_import`.
- **Calibration.** The thresholds are hypotheses. At onboarding the client confirms five detected batches (`confirmed_by_client`); the two settings are adjusted per client before the first scored run (D21).

```sql
-- creation bursts per user; integration users excluded ($2); gap seconds ($3)
with r as (
  select id, created_by, created_at,
         case when lag(created_at) over w is null
                or created_at - lag(created_at) over w > make_interval(secs => $3)
              then 1 else 0 end as new_batch
  from crm_record
  where client_id = $1 and created_by <> all($2::text[])
  window w as (partition by created_by order by created_at)
), b as (
  select *, sum(new_batch) over (partition by created_by order by created_at) as batch_no from r
)
select created_by, batch_no, min(created_at) as starts, max(created_at) as ends, count(*) as n
from b group by created_by, batch_no;
```

`crm_record` is the in-job view of the CRM read; only the batch rows are stored.

### Evidence search for manual numbers

For each manual number take the earliest `evidence_event` before the first
outbound contact. The type sets the status; nothing found →
`NP_NO_EVIDENCE_FOUND`.

| Evidence type | Source | Counts as |
|---|---|---|
| `cert` | Certificate ID in a CRM field → client's certificate key | Normal five checks |
| `inbound_call` | Dialer log, direction = inbound | Consumer-initiated; scope per `inbound_contact_scope` |
| `inbound_sms` | Messaging log: keyword opt-in or "YES" reply | Evidence for texts |
| `form_submission` | CRM form-submission records | Timestamped record from the client's own form |
| `purchase` | CRM deal / opportunity dates | `EBR_ONLY`, not consent |
| `recording` | Dialer recording API → speech-to-text → AI flags the moment | Counts only after a person confirms it (AI gate) |

### Proof requests

For each batch, sample `proof_request_sample` numbers (50; 100 when the batch
exceeds 10,000) that had no evidence. The client attaches proof or marks
"none" in the portal, per number. Unanswered stays NO_PROOF. **Proof
production rate** = proofs produced ÷ requested, per batch (about ±14 points
at 95% confidence on 50).

### Opted-out numbers re-added

For every batch (created or updated), count numbers whose opt-out is dated
before the batch started. These feed M34, raise a High alert, and appear on
the batch row.

## 5b. Data integrity **[v3]**

Insurers and acquirers rely on CiV's numbers, and the company being measured
has a reason to look clean. So every score carries a second number, **evidence
coverage**, and withholding data costs the client exactly what the bad data
would have cost.

### Worst-case defaults

Each input to a score has a `worst_case_value` in the Rulebook (Product-owned,
counsel-reviewed; D22). When the input's source grade is S or N, the engine
uses that value and records `worst_case = true`. Starting values:

| Input | Worst case |
|---|---|
| Consent proof rate (unverified) | 60% (the loss model's worst band) |
| Purchased-lead share | 60% |
| Prerecorded / AI voice share | 20% |
| Opt-outs not honored by deadline | 10% |
| Internal-list contacts, litigator contacts | 1 (any) |
| Reassigned check before calling | Not checked |
| Prior matters | max(stated, docket count) |

### Evidence coverage

Evidence coverage = Σ (share of score weight from inputs of source grade g ×
weight of g), with A = B = C = 1, D = 0.7, S = N = 0. Stored on
`metric_snapshot.evidence_coverage` (metric M36) and shown beside every score,
attestation and export. **Coverage cap:** below `coverage_cap_floor` (0.60)
the overall grade cannot exceed `coverage_cap_grade` (C) (D23).

### Reconciliation

CiV cannot check every record, but it can check that it received all of them.
Each period, one `reconciliation` row per measure:

| Measure | Records | Independent total | Flag when |
|---|---|---|---|
| `calls` | Outbound calls in dialer logs | Calls billed on the carrier invoice | ratio < `completeness_floor` (0.9) |
| `texts` | Outbound messages in the SMS log | Messages billed by the platform | ratio < 0.9 |
| `vendor_leads` | Vendor leads in records | Leads billed on vendor invoices | ratio < 0.9 |
| `seat_capacity` | Outbound calls | Seats × `calls_per_agent_day` range × working days | outside the range |
| `stop_replies` | Inbound STOP replies | — | zero in a period with > `stop_check_min_texts` (1,000) outbound texts |
| `days_present` | Days with at least one record | Calendar working days | ratio < 0.9 |

**Records completeness (M37)** = the minimum ratio across `calls`, `texts` and
`vendor_leads`. A flagged period is labelled "incomplete data"; the missing
share takes worst-case values.

### Blind testing

- Test numbers rotate every `test_rotation_days` (30) and are **never shown in any portal role**. The Annex C signer (owner or counsel) authorizes rotation.
- Timing and channel are randomized within the authorized window.
- At least one test per marketing campaign, and through each vendor form the client authorizes in Annex C.
- **Test coverage** = campaigns reached ÷ marketing campaigns. An unreached campaign is "untested", never "passed".

### Caller-ID inventory

Compare the caller IDs seen calling on the client's brand (CiV test lines,
carrier spam labels, consumer reports) with the caller IDs in connected
systems. A caller ID not in any connected system means an **unknown calling
system** (a side dialer, an offshore center, a tool bought on a card). It is
the top finding until the client connects it or confirms in writing that it
does not call on the client's behalf.

### Statements and conflicts

Every self-reported answer is an `attestation_statement`, signed by an
officer. When CiV observes something that contradicts it (dockets show more
suits than stated, a log with zero STOP replies, a policy dated years ago), it
writes an `attestation_conflict` with the evidence reference and the treatment
applied. Conflicts are shown to buyers as they are, never softened.

## 6. Audit domains

The rules engine runs the CIV-ATP-01 library: 25 domains in six families
(diagram in [../architecture.md](../architecture.md) §3.2). Domain codes are
fixed IDs; the plain names are working names to confirm against the library.

| Family | Code | Working name | Main data source |
|---|---|---|---|
| Permission | CON | Consent records | Consent certs, CRM |
| Permission | WEB | Website consent forms | CiV page captures |
| Permission | LPV | Lead provenance | Lead platforms |
| Permission | VND | Vendor contracts | Uploads (AI reader) |
| Permission | AFF | Affiliates and sub-IDs | Lead platforms, page captures |
| Who you contact | RND | Reassigned numbers | FCC RND |
| Who you contact | IDN | Internal do-not-contact list | Client list |
| Who you contact | NDN | National DNC | Client's DNC check records only (**[v3]** Info only) |
| Who you contact | SDN | State DNC | Client's DNC check records only (**[v3]** Info only) |
| Who you contact | XBD | Cross-border contacts | Dialer, SMS |
| How you contact | DLR | Dialer / autodialer use | Dialer |
| How you contact | PRV | Prerecorded or AI voice | Dialer, recordings |
| How you contact | SMS | Text messaging | SMS platform |
| How you contact | CTF | Calling times and frequency | Dialer, SMS |
| How you contact | IDD | Caller ID and identification | Dialer |
| How you contact | SHK | STIR/SHAKEN | Dialer / carrier |
| How you contact | VLT | Name to confirm (D5; possibly ringless voicemail) | To confirm |
| Stopping | REV | Opt-out and revocation | SMS, dialer, CRM, CiV test numbers |
| Records | REC | Recordkeeping | All sources |
| Records | RET | Data retention | All sources |
| Records | SEC | Data security | Uploads, connector metadata |
| Company controls | GOV | Policy and training | Uploads (AI reader) |
| Company controls | INC | Complaints and incidents | Client complaint data |
| Company controls | PLT | Platforms | Connector metadata |
| Company controls | MNA | Acquired or purchased lists | Uploads, lead platforms |

**Implementation:** before Phase 1 each checkpoint is sorted into **can be
automated**, **needs an upload**, or **cannot be automated yet**, and the
count is reconciled with Build Plan v2 (1,132 vs 1,067; D4). The library
loads into `checkpoint` with **[v1.1]** an `aggregation` rule per checkpoint
({unit: contact / number / program, pass_max_share, warn_max_share};
defaults 0 % pass, 1 % warn) and a `metric_checkpoint_map` linking each metric
card to the checkpoints it feeds. Checkpoints that cannot run return
`not_run` with reason `NEEDS_SOURCE`, never a guess; **[v3]** a checkpoint
that depends on a TBD rule value returns `not_run` with `RULE_PENDING`. Where
a missing source feeds a score input, that input takes its worst-case value
(section 5b) instead of being dropped. Every score shows
**checkpoints run out of total** beside it.

## 7. Metrics catalogue

The system computes 28 audit metrics and 5 Lead Inspector metrics, **[v3]**
plus 6 new metrics (M32–M37) and **[D37]** M38: **40 in all**.
[03-metric-specs.md](03-metric-specs.md) is the single source of truth; the
index below is generated from it. Every metric counts what CiV measured, never
calls blocked. Source: **CiV** collects it; **Client** checks the client's own
lists, logs or DNC check records; **AI** reads an uploaded file.

| Code | Metric | Family | Source |
|---|---|---|---|
| M01 | Consent Coverage (legal basis; and including CiV policy) | Permission | CiV |
| M02 | Consent Status Mix | Permission | CiV |
| M03 | Certificate Validity | Permission | CiV |
| M04 | Form Wording Pass Rate | Permission | CiV |
| M05 | Form Change Alerts | Permission | CiV |
| M06 | Lead Traceability | Permission | CiV |
| M07 | Vendor Terms on File | Permission | AI |
| M08 | Opt-out Speed | Stopping | CiV |
| M09 | Opt-outs Unprocessed at Deadline (M09a, M09b) | Stopping | CiV |
| M10 | Contacts After Opt-out | Stopping | CiV |
| M11 | Pre-Contact Reassigned Checks (**[v3]** no client logs → "not checked", worst case) | Who you contact | Client |
| M12 | Internal List Contacts | Who you contact | Client |
| M13 | **[v3]** DNC Check Record Check (Info only, never in the score) | Who you contact | Client |
| M14 | Litigator List Contacts | Who you contact | Client |
| M15 | Cross-border Contacts | Who you contact | CiV |
| M16 | Out-of-Hours Contacts (federal, state) | How you contact | CiV |
| M17 | Over-Limit Contacts | How you contact | CiV |
| M18 | Holiday Contacts | How you contact | CiV |
| M19 | Robo-contact Required-Proof Count | How you contact | CiV |
| M20 | Disclosure Check | How you contact | AI |
| M21 | Caller ID Quality | How you contact | CiV |
| M31 | Abandoned-Call Rate | How you contact | CiV |
| M22a | Proof Completeness (headline; **[v1.1]** legal-basis and all-contacts lines) | Records | CiV |
| M22b | Conduct Pass Rate (**[v1.1]** without M19) | Records | CiV |
| M23 | Record Age Coverage | Records | CiV |
| M24 | Complaint Handling | Company controls | Client |
| M25a | Training Records | Company controls | AI |
| M25b | Acquired List Proof | Company controls | CiV |
| M26 | Few-Signal Lead Rate | Lead Inspector | CiV |
| M27 | Consent Page Match Rate | Lead Inspector | CiV |
| M28 | Consent Completeness Rate | Lead Inspector | CiV |
| M29 | Vendor Grade Mix | Lead Inspector | CiV |
| M30 | Disputable Lead Value | Lead Inspector | CiV |
| **[v3]** M32 | Manual-Import Share (contacts with basis manual_import ÷ all contacts) | Permission | CiV (C) |
| **[v3]** M33 | Evidence Found Rate, manual numbers (EBR-only shown separately) | Permission | CiV (C) |
| **[v3]** M34 | Opted-out Numbers Re-added | Stopping | CiV (C) |
| **[v3]** M35 | Reassigned Exposure, RND sample (`rnd_sample_size` 400) | Who you contact | CiV (A) |
| **[v3]** M36 | Evidence Coverage (section 5b) | Integrity | CiV |
| **[v3]** M37 | Records Completeness (section 5b) | Integrity | CiV (B) |
| **[D37]** M38 | Missed Opt-outs (AI-found opt-outs not marked in the client's contacting systems by the deadline) | Stopping | CiV (A/C) |

**[v3] Rules for every metric:**

- **Basis on every value.** `metric_snapshot.basis_mix` stores the share per source grade; the portal shows one basis chip (the grade with the largest share) with the mix on hover.
- **One denominator per figure.** A figure counts contacts, numbers or leads, never a mix; the label says which.
- **Cross-page consistency test.** The test suite asserts that every figure shown on two pages (contacts in period, vendor count, vendors without terms, opt-out tests run) is computed from the same query.
- **M35 never runs before a dial.** It samples contacts already made. It splits epochs but is never counted as the client's own check (M11). (D20)

## 8. Revocation testing

CiV measures whether opt-outs work by sending real opt-outs from its own test
numbers and timing how long each client system takes to stop.

### Test run

1. **Authorize.** The client signs Annex C naming channels, brands, dates, and that CiV's test numbers are rotated. **[v3]** Annex C also names the **campaigns** and **vendor forms** CiV may seed through, and states that test numbers rotate and are not shown to operations staff (D24). No test runs without it.
2. **Seed.** **[v3]** At least one test per marketing campaign, and through each vendor form authorized in Annex C, so the test travels the same path as real volume. Record `revocation_test.seeded_campaign_id` and `seeded_via` (client_form / vendor_form). Test identities are flagged `is_test` and excluded from the Lead Inspector, vendor scores and every client metric except M08 and M09.
3. **Wait for contact**, confirmed from the dialer and SMS logs. **[v3]** A test with no contact within `seed_contact_window_days` (14) is "not reached", never "passed".
4. **Opt out** on each channel in the test plan: reply STOP, reply in plain words, web or email opt-out, and spoken on a call.
5. **Watch** every connected system for suppression and log any further contact, for up to `optout_observation_days`.
6. **Record** in `opt_out_event`, `opt_out_suppression`, `revocation_test` and the evidence store.

### Which opt-outs count

The rulebook stores each client's designated exclusive opt-out methods and
scope rules with effective dates, ready for the FCC's September 30, 2026
order and the January 31, 2027 revoke-all date (both to verify, Counsel D).
An opt-out made through a method the client has **validly designated as not
accepted** is still run and reported, labelled "method not designated", and
left out of M08–M10 once counsel confirms this treatment.

### Output: the propagation matrix

Rows = opt-out channel, columns = client system, cell = hours until
suppression or NEVER, plus the number of tests (**[v1.1]** median and p90 by
nearest rank). Cells with fewer than `min_tests_per_cell` tests are
"indicative". Only systems that can contact the person (dialer, SMS) set a
test's overall time; CRM and lead platform are informational columns.

| Opt-out channel | Dialer | SMS platform | CRM (info) | Lead platform (info) |
|---|---|---|---|---|
| Reply STOP | hours (n) | hours (n) | hours (n) | hours (n) |
| Plain-words reply | hours (n) | hours (n) | hours (n) | hours (n) |
| Spoken on a call | hours (n) | hours (n) | hours (n) | hours (n) |
| Web / email | hours (n) | hours (n) | hours (n) | hours (n) |

**[v3]** The matrix card also shows **test coverage** (campaigns reached ÷
marketing campaigns). Test numbers rotate every `test_rotation_days` and are
never shown in any portal role (section 5b).

### AI conversation review **[D37, owner decision 2026-10-08]**

Right after each call or text conversation ends, CiV's AI reviews the **whole
conversation** and decides whether the customer opted out. It does not match
keywords; it reads the full text thread (last `conv_review_thread_days`, 30,
for that number) or the full call (recording → speech-to-text in memory) and
judges meaning in context. "Stop, let me grab a pen" is not an opt-out; "please
don't call this number anymore" is.

| Result | Meaning | Marked as opt-out? |
|---|---|---|
| `opted_out` | The customer asked to stop all contact (or all contact on that channel) | Yes |
| `partial_request` | A limit, not a full stop: a time window, a channel, a person | No; shown as a card for the client to review; feeds the scope rules when counsel sets them |
| `wrong_number` | The person reached is not the customer | Yes for that number; also an epoch signal (possible reassignment) |
| `opted_back_in` | The customer allowed contact again after an earlier opt-out | Ends the earlier opt-out from that time |
| `unclear` | Confidence below `conv_review_min_confidence` (0.90) | No; counted and shown as "unclear" |
| `none` | Nothing found | No; counted only |

**Flow per conversation:**
1. Conversation ends (call hangs up; text thread quiet for `conv_review_text_quiet_minutes`, 10) → live sync event.
2. Read the recording or thread **in memory**; transcribe calls; AI decides the result, the **moment** (offset into the call, or which message) and a confidence.
3. Write an `opt_out_event` with `source = ai_conversation` (plus `conversation_review` row); keep result, moment, confidence, model and prompt version, and the fingerprint. Drop the audio, transcript and text.
4. For `opted_out` / `wrong_number`: check the client's dialer, messaging platform and CRM for a do-not-contact mark on that number. Not marked → **urgent alert** within `urgent_alert_max_minutes` (15). Re-check every `catchup_interval_minutes` until the opt-out deadline; record when it was marked.
5. Still not marked at the deadline → **M38 Missed Opt-outs**. Any later contact → contact after opt-out (M10).

**Safeguards:** the feature runs only after passing its accuracy gate (≥
`ai_accuracy_min_items` hand-labelled conversations, agreement ≥
`conv_review_accuracy_pass_mark`, 95%, measured separately for calls and
texts); every result is labelled "AI result" with its confidence; the gate is
re-run when the model or prompt changes. CiV marks opt-outs **only in its own
records** and never writes to the client's systems. Calls without a recording
are "not reviewed". Counsel items C21 (AI deciding without a person) and C22
(processing recordings and message text).

### Contacts after opt-out, from logs alone **[v3]**

M10 needs no client list: the messaging log holds the inbound STOP and every
later outbound text. Keywords and the grace window are counsel Rulebook
values; plain-language opt-outs go through the AI reader. **[D37]** They count as soon as AI conversation review decides `opted_out` (above); no person confirms each.

```sql
with stops as (
  select client_id, phone_token, min(sent_at) as stop_at
  from message
  where direction = 'inbound' and lower(trim(body)) = any($1::text[])  -- optout_keywords
  group by client_id, phone_token
)
select m.client_id, m.phone_token, s.stop_at, m.sent_at, m.campaign_id
from message m join stops s using (client_id, phone_token)
where m.direction = 'outbound'
  and m.sent_at > s.stop_at + make_interval(mins => $2)  -- confirmation_window_minutes
  and not m.is_confirmation;
```

`message.body` is the in-job view of the SMS log; it is read in memory to set
`is_confirmation` and match keywords. Only the derived flags and the
fingerprint are stored.

### Test numbers and legal needs

- **Real carrier mobile lines** owned by CiV, not VoIP numbers.
- **One honest, low-volume texting registration** describing the real purpose. Rotation is for freshness and disclosed in Annex C, never to avoid detection.
- **Spoken opt-outs:** a recording notice is played at the start of every spoken test call until counsel decides C5.
- An inbound handler records every call and text to test numbers; tests re-run every `retest_interval_days` for retainer clients.
- **[v1.1]** Deadlines for test opt-outs use the test number's own time zone (`test_number.time_zone`).

## 9. Scoring and outputs

### Score

- **Checkpoint credit:** pass = 1, warn = `warn_credit`, fail = 0, not_run excluded. Weights from the library.
- **[v1.1] Per-contact results aggregate** to a checkpoint status by `checkpoint.aggregation` (share of failing units against `pass_max_share` / `warn_max_share`).
- **Domain score** = weighted average of its checkpoints. A domain where every checkpoint is not_run shows "not measured" and is dropped from the overall. **[v3]** Score inputs from a missing source take their worst-case value (section 5b) rather than being dropped; a domain that cannot run because a rule is TBD shows "rule pending".
- **Overall score** = `domain_weights`-weighted average of measured domains, re-normalised over the domains that ran. NDN, SDN and the litigator checks are shown separately and never enter the overall.
- **Checkpoints run out of total** is shown next to every score.
- **Consent results feed checkpoints** per contact: VERIFIED → pass; WEAK → warn; CONFLICTING or NO_PROOF with `is_legal_basis` → fail; NO_PROOF under CiV policy only (or `dnc_unknown` only) → warn. Frozen, pending and test contacts are excluded.
- **Grades:** A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F below 60 (`grade_bands`), on the unrounded score.
- **[v3] Three caps,** applied to the unrounded score in this order. A grade held by a cap shows **"held"** and names the cap.

  | Cap | Trigger | Effect |
  |---|---|---|
  | Hard cap | Legal-basis contacts NO_PROOF or CONFLICTING above `hard_cap_share` of legal-basis contacts (pre-engagement expiries, frozen and policy-only contacts never count) | Overall grade ≤ `hard_cap_grade` (C) |
  | **Contact-after-stop cap** (v3 PDF: "direct-violation cap") | Any contact after an internal-list entry (IDN) or after an in-scope opt-out (REV) | That domain's grade ≤ `direct_violation_grade` (D) |
  | **Coverage cap** | Evidence coverage below `coverage_cap_floor` (0.60) | Overall grade ≤ `coverage_cap_grade` (C) |

- **[v3] Evidence coverage** (section 5b) is shown beside every score.
- **[v3] Confirmed-rules score.** Beside every overall score, a second score uses only Rulebook values with status **Set**. Domains whose checkpoints depend on a Proposed or TBD value drop out as "rule pending". Stored as `metric_snapshot` code `SCORE_CONFIRMED`. This is the figure that holds if the Rulebook is challenged.
- **[v3] Rulebook status gates execution.** A checkpoint that depends on a TBD value returns `not_run` with `RULE_PENDING`; Proposed values run and mark the result provisional.
- **Provisional:** a score built on fewer than `provisional_completeness` of the client's `expected_sources` is marked provisional. **[v1.1]** A score from a non-approved rulebook is `internal` and never shown to client roles.
- **Display:** one decimal place; 0 ÷ 0 shows "not measured". **[v3]** Timestamps in the viewer's local time zone with UTC on hover; US spelling throughout.

### Evidence file (per phone epoch) **[v3 revised]**

Because CiV holds no client records, the evidence file is built from CiV's own
data: every contact with its consent status, bases and reason codes; the 8
proof elements with their source grades; the conduct checks; opt-out history
and list checks; and for each item the **fingerprint, source system, source
record ID and fetch time**, the **re-fetch outcome** (Matches / Changed / No
longer at source), each fingerprint's Merkle path, the day's root and both
external proofs. **The client supplies the underlying records** (from its own
systems or the hold bucket). A person finds a number's file by typing the
number; CiV computes its token and looks it up. What exactly ships in the
evidence file and the certification pack is decision D18 (with counsel); until
then these exports and the named-numbers package are not offered.

### Findings, responses and decisions **[v3]** (replaces the fix list)

- Findings sorted by severity × affected contacts. Each shows what CiV observed, how many contacts or numbers, and example rows (shown as a masked label such as "(480) •••-0923", D31).
- **Finding title = a noun phrase of what was observed:** "Web-form and email opt-outs not reaching suppression", never "Route opt-outs to…". CiV stays out of remediation.
- **Common responses** come only from `response_library` rows with status Set. Counsel owns the library; CiV drafts.
- **Decision record.** Each finding takes a client decision (accepted / declined / alternative), a note and a name. The portal shows a counsel-approved prompt: *"Reviewed with [role]; decided [action] because [reason]."* The note text stays in the client's own workspace; CiV stores `note_sha256` and writes it to `access_log`. Insurer exports carry the decision and the hash, never the note.
- Status (open / in progress / resolved / reopened) closes automatically when a later run no longer finds the issue. **Overdue is computed against the real date**, never a stored demo date.

### Period audit report **[v3]**

A real PDF rendered by Playwright from the same queries the portal uses. It
holds only CiV's derived results. Its SHA-256 goes in its footer, the report
history row and `access_log`. CiV keeps its own reports (D33).

### Alerts

Sent when a consent page changes, a certificate nears expiry, a test opt-out
passes its deadline, contacts after opt-out appear, a connector goes stale,
**[v3]** opted-out numbers are re-added in an import batch (High), an unknown
caller ID appears, a period is flagged "incomplete data", or **[D37]** an AI-found
opt-out is not marked in the client's dialer or CRM (urgent, ≤ 15 minutes).
**Alerts create notice:** a client that learns of contacts after opt-out and
does not act may face willful-damages claims. Buyers are told this in writing
before onboarding, and counsel approves the alert design (C2). In
**counsel-directed mode**, alerts and findings go only to the client's
counsel, and operations-role portal access is turned off.

### Wording rules for every output

| Use | Never use |
|---|---|
| "CiV found 14 contacts after opt-out" | "14 violations", "14 breaches" |
| "No consent proof supplied" | "Illegal call" |
| "Sources conflict" (CONFLICTING) | "Compromised consent" |
| "Few / Some / High risk signals" | "Fake lead", "fraud", "genuine" |
| "Out-of-hours contacts", "over-limit contacts" | "Calling-hour breaches" |
| "Dispute candidates" | "Leads to claim back" |
| "Measured", "captured", "tested" | "Non-compliant", "ensures compliance", "protects you", "guaranteed" |
| "Possible out-of-hours contact (location uncertain)" | dropping the contact |
| **[v3]** "DNC check records" | "Scrub", "scrubbed", "screen", "screening" |
| **[v3]** "Fingerprints of what CiV saw" | "Records CiV holds", "stored write-once" |
| **[v3]** "Common responses" | "Fix steps", "you must" |
| **[v3]** "Insured states" | "Verified by the insured" |
| **[v3]** "Evidence package for named numbers" | "Court-ready" |

An automated check runs every report's text against the banned-word list
before release. Every report ends with the standard disclosure: CiV is not a
law firm; findings are measurements, not legal advice.

## 9a. Insurer and acquirer outputs **[v3]**

A buyer (insurer or acquirer) sees a standardized attestation per company,
never the company's records. Access is granted by the company through
`buyer_link`, scoped, and revocable by either side.

### Roles and tenancy

| Role | Sees | Never sees |
|---|---|---|
| Client owner / legal / operations | Own portal; own attestation, integrity and export pages | Any other company; a buyer's portfolio, loss model or litigation pages |
| Insurer underwriter | Portfolio of linked insureds; each one's attestation, data integrity, loss model, export | Contact-level rows, tokens, decision note text, test numbers |
| Acquirer deal counsel | The target's attestation, integrity and diligence export for the deal window | Same as insurer; access ends at `buyer_link.revoked_at` |

Enforced in row-level security, not only in the UI: a buyer's queries resolve
only through `buyer_link`, and only to `attestation_snapshot`,
`reconciliation`, `attestation_conflict` and `metric_snapshot` rows. A tenancy
test covers "client owner cannot see an insurer's portfolio".

### Risk attestation (`civ.attestation.v1`)

Monthly per company, hashed, prior versions kept. Every field carries value,
source grade and `worst_case`. Three blocks:

- **Frequency drivers:** marketing contacts per month; prerecorded / AI voice share; SMS share; purchased-lead share; manual-import share and evidence found rate; vendors and share with signed indemnification; consent proof rate; opt-out median time and share not honored; contacts after opt-out; opted-out re-added; internal-list contacts; RND exposure (M35); reassigned check before calling (M11); unknown caller IDs; private-right-of-action states contacted; prior matters (stated vs dockets).
- **Records integrity:** evidence coverage, records completeness, reconciliation rows, fingerprints recorded, theoretical statutory exposure (contacts × 12 × (1 − consent proof) × $500–$1,500).
- **Insured states:** each signed statement, with its conflicts. Statements never raise any value.

### Loss model v0 (a hypothesis, labelled uncalibrated everywhere)

Expected annual loss = P(suit in 12 months) × expected cost if sued.

- **P(suit):** start from a base rate by marketing-volume band, convert to odds, multiply the odds by each factor that applies, convert back (keeps P under 100%).
- **Factors (starting values):** consent proof < 70% × 1.8, 70–90% × 1.2, ≥ 90% × 0.8; purchased leads > 50% × 1.5, 20–50% × 1.25; prerecorded / AI > 10% × 1.3; opt-outs not honored × 1.5; internal-list contacts × 1.3; litigator contacts × 1.3; prior matters × (1 + 0.25 n, max 2); two or more private-right-of-action states × 1.2; live monitoring × 0.75; evidence coverage < 60% × 1.4; records completeness < 0.9 × 1.3.
- **Unverified inputs use their worst-case values** (section 5b), so a company that shares nothing is priced as a bad risk.
- **Severity:** (1 − class share) × individual-suit cost + class share × (class defense + class settlement for the volume band). Every parameter is editable by the underwriter and versioned in `client_parameter` under the buyer's org.
- The base rates and multipliers are replaced by the base-rate study (section 10a) and pilot claims data; the page says so. Ownership: D28.

### Underwriting export API

`GET /v1/insureds/{client_id}/attestation?as_of=YYYY-MM` → the
`civ.attestation.v1` JSON + `sha256` + an evidence block (coverage,
completeness, conflicts, unknown caller IDs, worst-case fields). Bearer token
scoped to one `buyer_org`, rotated every 90 days, revocable by the client;
every call logged in the insured's `access_log`. Webhook on any score change of
5 points or more, or a new open matter.

### Draft coverage conditions (for the carrier's counsel; CiV supplies measurements, the carrier sets terms)

Monitoring maintained for the term; evidence coverage ≥ 60%; records
completeness ≥ 0.9; score ≥ 70 with a two-month review trigger; attestation
dated within 30 days; High findings carry a recorded decision within 30 days;
every Insured states field signed by an officer; counsel-directed routing;
vendors above 10% of contacts have signed indemnification.

## 10. Security, legal and evidence integrity

### Evidence integrity

**[v3]** Storing fingerprints instead of content keeps CiV out of discovery as
a custodian of client records, but it moves the copies v1.1 relied on to the
client. Items marked **(C)** need counsel before launch.

- **Fingerprint at fetch:** SHA-256 of each record as fetched, a trusted clock (RFC 3161 token), source and source grade. The content is not kept. A hash proves a record is unchanged since fetch, not that it was accurate, so reports always show the source grade.
- **[v3] No write-once content store.** v1.1's S3 Object Lock store of raw artifacts is removed. Fingerprints and derived results live in PostgreSQL.
- **Daily anchoring** (unchanged): each day's fingerprints roll up into a Merkle root anchored outside CiV twice, OpenTimestamps and an RFC 3161 timestamp authority, stored in `merkle_anchor`. Each fingerprint stores its `leaf_index` and `merkle_path` for an inclusion proof.
- **[v3] Position lookup = re-fetch and compare.** For a number and a date, CiV re-fetches each source record now, hashes it and compares with the stored fingerprint. Three outcomes: **Matches**, **Changed** (both hashes and dates shown), **No longer at source** (the timestamped fingerprint proves it existed). Never "verified" by CiV alone. Whether the re-fetched content may be shown in the portal before it is discarded is D32b.
- **[v3] Legal hold** = (1) an instruction to the client to retain the named source records, and (2) optionally a one-time encrypted snapshot written to a bucket **the client owns** (their S3 or similar). CiV gets a write-only role; the client holds the keys. Setting and releasing a hold needs a Legal-role user and a reason, both in `access_log`.
- **Reproducibility:** every result links to its run, rulebook version, rule values in force on the contact's date, code version and stored AI outputs. **[v3]** It reproduces exactly only while the client's source records still match their fingerprints; otherwise it is labelled "inputs changed since evaluation" and never silently recomputed.

### What store-nothing changes in court **(C)** **[v3]**

- **Certification of copies.** Under FRE 902(14) a qualified person certifies that a copy matches its original by hash. CiV holds no copy, so CiV can certify only that the file the client produces **hashes to the value CiV recorded on that date**. The copy comes from the client or the hold bucket.
- **The evidence file per phone epoch** becomes fingerprints, fetch times, re-fetch outcomes, the anchor proof and CiV's derived results (section 9).
- **Derived results are still discoverable.** Metrics, findings and decision hashes are CiV's own records; counsel-directed mode may protect some of them, never the underlying facts.
- **The record the client cannot produce is the risk.** If a vendor purges history, CiV can prove the record existed but cannot fill the gap. Accepted consciously in exchange for not being a custodian.

### Personal data **[v3]**

- `phone_token` is **pseudonymized** personal data: CiV holds the per-client HMAC key, so it can re-link a number during a job. The data processing agreement must say so **(C)**. Key custody: D19.
- **Key destruction at contract end** makes every token for that client unlinkable (crypto-shredding), logged in `access_log`.
- Message bodies, recordings, certificate contents and agent names are processed in memory only.

### Security

- Client credentials in a secrets vault, least privilege, revocable by the client in one click.
- **[v3]** Per-client HMAC keys in a KMS; job workers fetch the key per job; no key on disk.
- **[v3]** Buyer tokens scoped to one `buyer_org`, rotated every 90 days, revocable by the client.
- **[v3]** Tenancy tests in CI: client ↔ client, client → buyer portfolio, buyer → contact-level rows. All must fail.
- Encryption in transit and at rest; per-client data isolation (row-level security on every table; **[v1.1]** `client_id` added to `opt_out_event`, `consent_proof`, `consent_evaluation`).
- Role-based portal access (owner, legal, operations, read-only; **[v3]** insurer underwriter, acquirer deal counsel); every view and export logged.
- Launch-gate items with an owner: SOC 2 Type I (Type II to follow), signed DPAs, independent penetration test before the first client's real data.

### Legal guardrails

- Output wording follows section 9: measurements, never legal conclusions.
- DNC and litigator lists: CiV never sources, sells or maintains them.
- Revocation tests only under a signed authorisation naming channels and dates.
- Before launch, a lawyer reviews: the rulebook, report wording, evidence file format, common-response library, and whether any feature counts as legal advice in the states CiV sells into (C6, C8).
- Before each connector ships, confirm the vendor's API terms allow third-party access with client credentials.
- **[v1.1]** Any rulebook key with `affects_status` requires counsel approval (product rule 10).

### CiV's own liability **[v3]**

- **Reliance letter** for each buyer: they may rely on CiV's method and observed data, not on the company's statements **(C)** (D26).
- **Errors and omissions (E&O) insurance** for CiV before any insurer prices off CiV numbers (D27).
- **Vendor concentration:** TrustedForm and Jornaya are both ActiveProspect since January 2026. A terms or API change there hits both consent sources at once; keep the certificate adapter behind one interface and track ActiveProspect's terms as a launch risk.

### Legal protection of the evidence

A dated, independent record of findings can be demanded by the other side in
the very lawsuit the buyer fears, and CiV can be subpoenaed. This section
claims only what holds; counsel confirms all of it before launch (C1, C2, C7).

- **Counsel-directed mode improves protection but does not guarantee it.** Work may qualify as attorney work product; courts have refused protection for ongoing dual-purpose monitoring; underlying facts are never privileged; using the file in court waives protection for what is used.
- **Certification covers copies, not accuracy.** **[v3]** A qualified certifier can show under FRE 902(14) that a copy the client produces matches the fingerprint CiV recorded (see "What store-nothing changes in court"). That does not prove the client's records were accurate (client's custodian, FRE 902(11) and 803(6)), does not answer hearsay objections, requires advance notice, and does not cover CiV's computed metrics, which are analysis and need a witness.
- **Reports can be used against the client.** Outputs stay measurements; the client decides what it adopts.
- **Notice:** findings and alerts put the client on notice (section 9).
- **Subpoenas:** CiV notifies the client unless the law forbids it, produces only what is legally required, adds no commentary. **[v1.1]** Procedure in C7.

## 10a. Litigation base-rate study **[v3]** (separate track)

The loss model needs suits per 100 companies by industry, volume band and
channel, and cost per suit by claim type; no published source has them. This
track builds that dataset from federal dockets. It shares the stack and the
classifier pattern but **no client data**, and it does not feed any
per-company score except the prior-matters conflict check.

| Step | Mechanics | Output |
|---|---|---|
| 1. Pull dockets | CourtListener RECAP API, nature-of-suit 890, cause 47:227, filed 2023–2026; PACER for complaints missing from RECAP ($0.10 a page, $3 cap per document) | `docket`, `complaint` (fingerprint + parsed text in a study store holding public records only) |
| 2. Classify | Deterministic: court, date, class flag, forum. LLM with a fixed JSON schema: claim types, channel, lead-gen involvement, defendant industry (NAICS), serial-plaintiff flag, outcome, amount. Hand-code 100 first; publish the agreement rate | `complaint_label`, versioned by model and prompt |
| 3. Resolve defendants | Match each defendant to a company record (industry, size band, states, channels) | `defendant_company` |
| 4. Price outcomes | Settlement approval orders and settlement sites for class amounts; dismissal and default rates by claim type | `outcome` |
| 5. Publish | Base rates by industry × volume band × channel; cost per suit by claim type; repeat-defendant list. Quarterly | `base_rate_table` → loss model parameters, with version |

Scope limit, stated in the output: federal filings only in the first edition;
state-court suits (Florida, Texas, Washington) come later. Budget about $8K a
year in PACER fees (D29).

## 11. Build order

Diagram in [../architecture.md](../architecture.md) §3.3. **[v3]** Six
phases, each shipping only after its gate passes. Phase 1 now carries import
detection and reconciliation, because worst-case defaults and evidence
coverage depend on them from the first score. v1.1's upload-only Phase 0 is
removed. Counsel work and the base-rate study run alongside from day one.

| Phase | Builds | Gate to pass |
|---|---|---|
| 1. Foundation | Fingerprint ledger, connectors (in memory, tokens at the edge, billing totals, **[D35]** live feed + catch-up sweep + full comparison, `sync_cursor`, `sync_gap`), normalizer, phone epochs, Rulebook (draft / provisional / approved, impact dashboard), import-batch detection, reconciliation | **Gate 1:** pilot synced, fingerprinted and anchored; **[D35]** live feed and hourly catch-up running on every pilot source, gap share measured per source; 5 batches confirmed by the client; completeness ≥ 0.9; **no content on disk after a full sync** (scan the database and object storage for phone numbers, message text and certificate bodies; any hit fails) |
| 2. Consent and provenance | Consent engine (v3 codes), certificates via the client's key, custody, page capture, provenance ladder, evidence search, proof requests | **Gate 2:** 200 hand-checked contacts agree; counsel consent items set; custody reported for every certificate; `WK_FINGERPRINT_ONLY` exercised on a synthetic expired certificate; consent cases C01–C50 pass |
| 3. Revocation | Test numbers, Annex C v3, seeding per campaign and vendor form, propagation matrix + test coverage; **[D37]** AI conversation review (call transcription in memory, whole-conversation opt-out decisions, dialer / CRM mark check, update cards, M38, urgent alert) | **Gate 3:** first matrix delivered; campaign coverage reported; **[D37]** conversation review passes its accuracy gate (calls and texts separately) |
| 4. Metrics and scoring | 39 metrics, worst-case defaults, evidence coverage, three caps, confirmed-rules score, findings and decisions, alerts, portal, period report PDF | **Gate 4:** every metric on the pilot; metric cases T01–T54; cross-page consistency suite and tenancy suite pass; a client that withholds a source scores at or below the same client with that source showing its worst case |
| 5. Buyer views | Buyer orgs and links, attestation v1, loss model v0, underwriting export API, insurer portfolio | **Gate 5:** Falcon receives 3–5 attestations; reliance letter and E&O in place; a buyer token cannot read any contact-level row; revoking `buyer_link` stops the next API call |
| 6. AI features | Contract clauses, consent-page meaning, training records, spoken-consent flags (**[D37]** transcription and free-text opt-outs moved to Phase 3) | Per feature: ≥ `ai_accuracy_min_items` labelled items, agreement ≥ `ai_accuracy_pass_mark` |
| Launch | — | Counsel items; SOC 2 Type I; DPAs; penetration test; cost model |

Phase 5 can start as soon as Gate 4 passes on one pilot client; it does not
wait for Phase 6.

**Who owns review:** every build phase ends with a human-reviewed checklist
(auth, tenancy isolation, input validation, error handling, logging, and
**no content at rest**). Name the reviewer and their hours per phase before
Phase 1 starts.

**Cost per client:** measured from Phase 1: RND queries (up to `rnd_query_budget_per_number` at Somos tier prices, plus the M35 sample), carrier lookups, email verifications, page captures, transcription, AI tokens, test-number messaging. Feeds the pricing doc.

## 12. Open decisions

Counsel's items are tracked in [05-counsel-brief.md](05-counsel-brief.md).

| # | Decision | Owner | Needed by | Status |
|---|---|---|---|---|
| D1 | All Counsel brief items | Counsel | Per item | Open |
| D2 | Confirm CiV's caller-agent contract with Somos | Product | Phase 1 | Decided in principle |
| D3 | Pilot client, and which dialer, SMS and CRM it uses. **[v3]** Falcon Risk's pilot insureds are now the first candidates (3–5 companies) | Product | Phase 1 | Open |
| D4 | Checkpoint count (1,132 vs 1,067), automation buckets, **[v1.1]** aggregation rule and metric map per checkpoint | Product + Engineering | Phase 1 | Open |
| D5 | VLT meaning and domain working names | Product | Phase 1 | Open |
| D6 | Accept a least-privilege user where vendors have no read-only access | Product | Phase 1 | Open |
| D7 | Attach Annex C, CIV-RIM-01, Build Plan v2, state matrix, legal authority register; link pricing doc | Product | As listed | Open |
| D8 | `hard_cap_share`, `hard_cap_grade`, `domain_weights`, `warn_credit` | Product | Gate 4 | Open |
| D9 | `ai_accuracy_pass_mark`, `gate_sample_size` | Product | Gate 2 / Phase 5 | Open |
| D10 | SOC 2 Type I, DPAs, penetration test | Product | Launch | Open |
| D11 | Live mode terms and service level | Product | Post-pilot | Open |
| D12 | Legal sign-off on `count_unanswered_calls`, `count_undelivered_sms`, `location_conflict_rule`, `location_uncertain_treatment` (**[v1.1]** now counsel item B9) | Counsel | Gate 4 | Open |
| **[v1.1]** D13 | Confirm with ActiveProspect that certificate page snapshots are available through the API | Product | Phase 2 | Open |
| **[v1.1]** D14 | Planning volumes (contacts/day, backfill size) from the pilot client | Product | Phase 1 | Open |
| **[v1.1]** D15 | Background job runner — ADR-5 | Engineering | Module 2 | Decided by the owner 2026-10-03: Celery as the task runner on Redis (stack: Django + Django REST Framework + PostgreSQL + Redis + Next.js) |
| **[v1.1]** D16 | Where the PostgreSQL database is hosted, and whether the existing Supabase projects (`FCC`, `civ-platform-prod`) are used at all now that the backend is Django | Product + Engineering | After the project is complete | Deferred by the owner 2026-10-03: the full project is built and run locally first |
| **[v1.1]** D17 | Reconcile Build Plan v2 with this spec: (a) v2 has one CiV reviewer sign-off before the client sees anything, this spec has no human in the loop; (b) v2 removes all DNC-registry checkpoints (~61), this spec keeps NDN and SDN on client-supplied lists, shown separately; (c) v2 sells tiers T0–T4, this spec has no tier field | Product + Counsel | Module 7 | Open |
| **[v3]** D18 | Store-nothing scope (PDF D13) | Stu + counsel | Phase 1 | **Decided by the owner 2026-10-07: CiV holds only its analyzed data and fingerprints, never CRM or other client records.** Open with counsel: what the evidence file and certification pack contain |
| **[v3]** D19 | HMAC key custody: per-client key in CiV's KMS (pseudonymized) or a client-held key (stronger, slower jobs) (PDF D14) | Product + counsel | Phase 1 | Open |
| **[v3]** D20 | The RND exposure sample (M35) sits outside the "no checking before a dial" line: post-contact, sampled, never before a dial (PDF D15) | Stu | Phase 1 | Open |
| **[v3]** D21 | Import-detection thresholds (`import_gap_seconds`, `import_min_batch`) calibrated on the pilot (PDF D16) | Engineering | Gate 1 | Open |
| **[v3]** D22 | Worst-case default values per input (PDF D17) | Product + counsel | Gate 4 | Open |
| **[v3]** D23 | `coverage_cap_floor`, `coverage_cap_grade`, `completeness_floor`, `direct_violation_grade` (PDF D18) | Product | Gate 4 | Open |
| **[v3]** D24 | Annex C extension: campaigns, vendor forms, test numbers not shown to operations roles (PDF D19) | Counsel | Phase 3 | Open |
| **[v3]** D25 | Counsel-directed as the default engagement mode (PDF D20) | Counsel | Launch | Open |
| **[v3]** D26 | Buyer access: `buyer_link` consent wording and the reliance letter (PDF D21) | Counsel | Phase 5 | Open |
| **[v3]** D27 | CiV errors and omissions (E&O) insurance (PDF D22) | Stu + Sally | Before the first insurer pilot | Open |
| **[v3]** D28 | Loss model ownership: CiV ships v0, or Falcon's actuary owns parameters from day one (PDF D23) | Stu + Falcon | Phase 5 | Open |
| **[v3]** D29 | Base-rate study owner and budget (about $8K a year in PACER fees) (PDF D24) | Stu | Parallel track | Open |
| **[v3]** D30 | Source labels: adopt v3's letters A–D, S, N (always "source grade A", never "grade A") in place of v1.1's "Tier 1–4" | Owner | Before the frontend update | **Decided by the owner 2026-10-08:** use source grades A, B, C, D, S, N, always written "source grade A" |
| **[v3]** D31 | How a number appears in lists when only tokens are kept: as typed by the user, or a masked label keeping area code + last 4 digits | Owner + counsel | Phase 1 | **Decided by the owner 2026-10-08: masked label** — area code + last 4 digits, e.g. "(480) •••-0923"; full numbers only as typed into search; buyers see no numbers. Counsel to confirm (C20); fallback if counsel says no: labels with no digits |
| **[v3]** D32 | (a) Keep CiV's own captures of public consent pages (CiV-made, not client records)? (b) May a re-fetched record be shown in the portal during a position lookup, then discarded? | Owner + counsel | Phase 2 | (a) **Decided by the owner 2026-10-08: keep** CiV's own captures of public consent pages (counsel to confirm, C19a). (b) Open (counsel, C19b) |
| **[v3]** D33 | Keep CiV's own period report PDFs (derived results only) | Owner | Phase 4 | Proposed |
| **[v3]** D34 | Obtain Engineering Spec v2 (Sep 27) to confirm what "unchanged from v2" means | Owner | Before Phase 1 | **Closed 2026-10-08:** the owner has no v2; where v3 says "unchanged from v2", v1.1 stands |
| D36 | Dollar figures (theoretical exposure, loss model) in insurer and acquirer views only, labelled "uncalibrated estimate"; none in the client portal | Owner + counsel | Phase 5 | **Decided by the owner 2026-10-08** |
| D37 | AI conversation review: whole-conversation opt-out decisions by AI right after each call or text, dialer / CRM mark check, M38, urgent alert; moved to Phase 3 | Owner + counsel | Phase 3 | **Decided by the owner 2026-10-08** (counsel: C21, C22) |
| D35 | Live sync: continuous checking of client tools (live feed + hourly catch-up + weekly full comparison) instead of nightly pulls | Owner | Phase 1 | **Decided by the owner 2026-10-07** ([CHANGELOG-v3 §2a](CHANGELOG-v3.md)) |
