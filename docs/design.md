# Detailed Design — CiV Automated TCPA Audit System

**Version:** 3.0 · **Date:** 2026-10-07 · **Status:** Draft for engineering review
**Companion documents:** [architecture.md](architecture.md), [specs/01-engineering-spec.md](specs/01-engineering-spec.md), [specs/02-rulebook-parameters.md](specs/02-rulebook-parameters.md), [specs/CHANGELOG-v3.md](specs/CHANGELOG-v3.md)

This document gives the level of detail an engineer needs to implement each
component: schemas, algorithms, job boundaries, interfaces and tests. Where
a value is a parameter, the rulebook key is named and never the number.

**[v3]** This version applies Engineering Spec v3 (Oct 7, 2026). Changed or
new passages are marked **[v3]**; anything not marked stands as in v1.1. The
owner decided on 2026-10-07 that CiV holds only its own analyzed data and
fingerprints, never the client's CRM or other records
([CHANGELOG-v3 §2](specs/CHANGELOG-v3.md#2-owner-decision-civ-holds-analyzed-data-only-shakib-2026-10-07)).
Every table below follows that rule: a column either holds a fingerprint, a
token, or a fact CiV derived.

---

## 1. Data model

### 1.1 Conventions

- Every table has `client_id uuid not null` except pure reference tables (`checkpoint`, `rulebook_version`, `rule_value`, `test_number`, tz and area-code references) **[v3]** and the buyer tables `buyer_org`, `buyer_link` (keyed by `buyer_org_id`). RLS policy: `client_id = current_setting('app.client_id')::uuid` for tenant roles. **[v3]** Buyer roles get a separate policy: `client_id in (select client_id from buyer_link where buyer_org_id = current_setting('app.buyer_org_id')::uuid and revoked_at is null and <scope covers the table>)`, defined only on `attestation_snapshot`, `reconciliation`, `attestation_conflict` and `metric_snapshot`. Every other table has no buyer policy, so a buyer reads nothing from it.
- Versioned tables carry `valid_from timestamptz not null`, `valid_to timestamptz null`. A change closes the current row (`valid_to = now()`) and inserts a new one. Unique partial index on `(natural key) where valid_to is null`.
- All timestamps `timestamptz`, stored UTC. Local time is derived at evaluation from `address_version.time_zone`. **[v3]** Displayed in the viewer's local time zone with UTC on hover (§14.2).
- **[v3]** Phone numbers are stored only as `phone_token bytea` = HMAC-SHA256(per-client key, E.164 number), with `phone_token_kid text` naming the key version. The E.164 number is validated and exists only inside a running job. Caller IDs in the inventory are tokenized the same way (`caller_id_token`). *(v1.1: `phone_e164 text`. Superseded.)*
- **[v3]** Columns that pointed at a stored artifact (`*_artifact_id`) now point at a `fingerprint` row (`*_fingerprint_id`). Columns that held client content (message text, transcripts, agent names, complaint descriptions, ZIP codes) are removed; the content is read in memory only.
- Reason codes and rule values used are `jsonb`.
- Primary keys are `uuid` (v7 for insertion order).

### 1.2 Tables by group

`-- [v3]` marks a changed or new column or table.

**Configuration**

```sql
rulebook_version(version_id pk, status enum('draft','provisional','approved'),
                 published_at, approved_by, counsel_approved_by null, notes, code_version_min)
rule_value(id pk, key, value jsonb, jurisdiction text null, -- 'US', 'US-FL', 'circuit-7', 'district-ND-IL'
           effective_from date, effective_to date null, rulebook_version fk,
           affects_status bool, owner enum('counsel','product','engineering'),
           status enum('set','proposed','tbd'), variants jsonb null, -- {strict: v, lenient: v}
           source_ref text)
           -- [v3] worst-case values are rule_value rows keyed 'worst_case.<field>' (Product-owned, counsel-reviewed)
state_consent_rule(id pk, state, effective_from, effective_to, channels_covered text[],
           contact_types_covered text[], autodialer_definition text,
           consent_type_required enum('any','written','signed_written'),
           private_right_of_action bool, rulebook_version fk, source_ref)
client_parameter(id pk, client_id, key, value jsonb, effective_from, effective_to, set_by, approved_by,
                 buyer_org_id null)  -- [v3] loss-model parameters set by an underwriter for this insured
client(client_id pk, name, verticals text[], states text[], engagement_start_date,
       engagement_mode enum('direct','counsel_directed') default 'counsel_directed',  -- [v3] default
       litigation_forum jsonb, legal_hold bool default false, expected_sources text[],
       access_level smallint check (0..4),  -- [v3] recomputed nightly from connector health
       hmac_kid text)                       -- [v3] current phone-token key; replaces kms_key_arn
client_brand(id pk, client_id, name, kind enum('brand','dba'), valid_from, valid_to)
campaign(campaign_id pk, client_id, source_system, external_id, name,
         message_category enum('marketing','informational','unknown'), confirmed_by, valid_from, valid_to)
```

**Runs and checkpoints**

```sql
run(run_id pk, client_id, kind enum('nightly','backfill','report','phase0'), -- [v3] 'phase0' kept for v1.1 rows only
    evaluation_as_of timestamptz, rulebook_version fk, code_version, variant enum('single','strict','lenient'),
    output_visibility enum('client','internal'), started_at, finished_at, status, stats jsonb)
checkpoint(checkpoint_id pk, domain_code, sub_domain, title, test_procedure, criteria jsonb,
           automation_bucket enum('automated','needs_upload','not_yet'), data_acquisition_mode,
           weight numeric, authority_ids text[],
           aggregation jsonb) -- {unit:'contact'|'number'|'program', pass_max_share, warn_max_share}
metric_checkpoint_map(metric_code, checkpoint_id, pk(metric_code, checkpoint_id))
```

**Fingerprints and logs** **[v3: was "Evidence"]**

```sql
fingerprint(fingerprint_id pk, client_id, source_system, source_record_id,         -- [v3] replaces artifact
            source_grade enum('A','B','C','D'), fetched_at timestamptz, sha256 bytea,
            tsa_token bytea null,          -- RFC 3161
            anchor_date date null,
            content_kind text,             -- e.g. call_log, sms_log, crm_lead, certificate, invoice, page_capture
            leaf_index int null, merkle_path jsonb null)  -- carried from v1.1 for inclusion proofs
            -- dropped from artifact: storage_uri, retention_until, access_level, kms_key_id, size_bytes, legal_hold
purge_log(id pk, client_id, job_id, run_id null, table_name, rows_removed int,     -- [v3] replaces deletion_log
          reason text, at timestamptz)    -- in-memory job failures that wrote partial rows
merkle_anchor(date pk, merkle_root bytea, leaf_count int, opentimestamps_proof bytea null,
              rfc3161_token bytea null, status enum('pending','anchored'), anchored_at)
access_log(id pk, actor, actor_role, client_id, buyer_org_id null, action, object_type, object_id,  -- [v3] buyer_org_id
           detail_sha256 bytea null,   -- [v3] e.g. decision note_sha256, report sha256
           at, ip, user_agent)
legal_hold(hold_id pk, client_id, named_records jsonb, instructed_at, snapshot_written_at null,   -- [v3]
           bucket_ref text null, released_at null, released_by null, release_reason null)
report(report_id pk, client_id, run_id, period, sha256 bytea, rendered_at, rendered_by)         -- [v3] period PDF (D33)
ai_output(output_id pk, client_id, feature, model, prompt_version, checklist_version,
          input_hash bytea, input_fingerprint_ids uuid[],   -- [v3] was input_artifact_ids
          output jsonb, confidence numeric, created_at,
          unique(feature, model, prompt_version, checklist_version, input_hash))
ai_gate(feature pk, items_tested int, agreement numeric, passed bool, evaluated_at, rulebook_version)
page_capture(capture_id pk, client_id, url, normalized_url, captured_at, viewport,
             fingerprint_id,               -- [v3] replaces the image, DOM and text artifact ids (CiV keeps its own capture content: D32a, decided 2026-10-08)
             normalized_hash bytea, consent_block_hash bytea,
             measurements jsonb, blocked bool, similarity_to jsonb null) -- {proof_id, score, method}
```

`deletion_log` is removed: nothing is held to delete. The names `legal_hold`,
`report` and the `purge_log` columns are proposed here; v3 names the concepts
but not the columns.

**Numbers**

```sql
phone_epoch(epoch_id pk, client_id, phone_token, phone_token_kid,   -- [v3]
            start_after date null, start_before date null, end_after date null, end_before date null,
            epoch_certainty enum('known','bounded','unknown'), evidence_fingerprint_ids uuid[], valid_from, valid_to)
contact_epoch_assignment(id pk, client_id, subject_type enum('event','proof'), subject_id uuid, epoch_id fk,
            assignment_certainty enum('certain','uncertain'), valid_from, valid_to)
address_version(id pk, client_id, phone_token,      -- [v3] was contact_ref; zip read in memory only
            state, time_zone, tz_source enum('zip','area_code'), source_fingerprint_id, valid_from, valid_to)
rnd_query_log(id pk, client_id, phone_token, date_asked_about, queried_at, answer enum('yes','no','no_data'),
              queried_by enum('client','civ'), purpose enum('epoch','exposure_sample') null,  -- [v3] M35
              monthly_update_date, fingerprint_id)
```

**Contacts and consent**

```sql
contact_event(event_id pk, client_id, phone_token, phone_token_kid, source_system,   -- [v3]
              source_fingerprint_id, source_record_id,
              direction enum('outbound','inbound'), channel enum('call','sms'), occurred_at_utc,
              connected_at null, ended_at null, answered bool null, disposition, sms_delivery_status,
              -- [v3] body_artifact_id, recording_artifact_id removed: text and recordings never kept
              is_confirmation bool null,     -- [v3] derived in memory from the message body
              dial_mode, prerecorded_or_ai bool null,
              campaign_id fk null, agent_ref text null,   -- [v3] opaque source ID; agent names never kept
              caller_id_token bytea null,                 -- [v3]
              stir_attestation, lead_id null, import_batch_id null,  -- [v3]
              address_version_id null, line_type, location_confidence enum('high','medium','low'),
              local_time_zone_zip, local_time_zone_area, dedupe_group_id null, is_test bool, frozen bool,
              partition by (client_id, month(occurred_at_utc)))
consent_proof(proof_id pk, client_id, proof_type enum('web_cert','ivr_recording','keypress','signed_form',
              'existing_customer','prior_express'), provider, provider_ref, captured_at, confirmed bool,
              phone_match enum('match','no_match','not_checked'),  -- [v3] from provider fingerprints.matching; replaces phone_on_proof
              seller_named text[], seller_match enum('matched','not_found','other_seller','not_measured'),
              page_url, channels_covered text[], disclosures_played bool null, relationship_type, relationship_date,
              retention_status, expires_at,
              fingerprint_id,                                         -- [v3] was artifact_id
              custody enum('client_account','vendor_only','unclaimed'), claimed_at null,  -- [v3]
              lead_id null, valid_from, valid_to)
consent_evaluation(eval_id pk, client_id, event_id fk, run_id fk, evaluation_as_of, variant,
              status enum('NO_PROOF','CONFLICTING','WEAK','VERIFIED','PENDING'),
              primary_reason_code, reason_codes text[], bases jsonb, -- [{basis, status, codes, proof_id}]
              is_legal_basis bool, labels text[],   -- [v3] labels include EBR_ONLY
              proof_id null, evidence_event_id null,  -- [v3]
              frozen bool, inputs_changed bool default false,  -- [v3] "inputs changed since evaluation"
              reeval_reason text null,
              rulebook_version, rule_values_used jsonb, ai_output_ids uuid[], valid_from, valid_to)
lead(lead_id pk, client_id, phone_token, vendor_id fk null, sub_id, first_party bool, capture_url, captured_at,  -- [v3] phone_token
     received_at, delivered_at, cert_ref, price numeric null, is_test, source_fingerprint_id,
     basis enum('feed','crm_field','invoice','cert_domain','manual_import','untraced'),   -- [v3]
     source_type enum('form','referral','appended','skip_traced','unknown') null,          -- [v3] for NP_THIRD_PARTY
     batch_id null)                                                                        -- [v3] import_batch
vendor(vendor_id pk, client_id, name, is_affiliate_network, active_since)
vendor_contract(id pk, client_id, vendor_id, fingerprint_id, signed_at, expires_at, dispute_window_days,  -- [v3]
                clause_results jsonb)   -- derived by the AI reader; the contract is read in memory
acquired_list(list_id pk, client_id, source, acquired_at, record_count, consent_chain_fingerprint_ids uuid[], sample_seed)
```

**Stopping and revocation**

```sql
opt_out_event(opt_out_id pk, client_id, phone_token, channel, method enum('keyword','free_text','web','email',  -- [v3]
              'spoken','crm_field','disposition'), received_at,
              -- [v3] text removed: the reply text is never kept; method is the derived kind
              scope jsonb, source enum('client_data','civ_test'),
              designated bool null, is_test, source_fingerprint_id, ai_output_id null)
opt_out_suppression(id pk, client_id, opt_out_id fk, system, suppressed_at null, inferred bool, evidence_fingerprint_id)
test_number(number pk, carrier, line_type, acquired_at, retired_at, messaging_registration_id, time_zone,
            rotate_after date)   -- [v3] test_rotation_days; never exposed to any portal role
annex_c_authorization(id pk, client_id, channels text[], brands text[],
                      campaigns text[], vendor_forms text[],   -- [v3]
                      window_from, window_to, recording_notice bool,
                      signed_fingerprint_id, signed_by_role enum('owner','counsel'))  -- [v3]
revocation_test(test_id pk, client_id, test_number fk, seeded_via_url,
                seeded_campaign_id null, seeded_via enum('client_form','vendor_form'),  -- [v3]
                seeded_at, first_contact_at,
                opt_out_id fk, deadline_at, observed_until,
                result enum('suppressed','never','pending','not_reached'))  -- [v3] not_reached
matrix_cell(run_id, channel, system, test_count, median_hours, p90_hours, never_count, indicative bool)
```

**Client records and results**

```sql
client_list_entry(id pk, client_id, list_type enum('internal','dnc_check','litigator'), phone_token,  -- [v3]
                  entry_date null, list_version_date, fingerprint_id, date_approximate bool)
dnc_check_run(id pk, client_id, registry_version_date, ran_at, numbers_flagged_count int,   -- [v3] was scrub_run; Info only
              fingerprint_id)
complaint(id pk, client_id, phone_token, received_at, channel, category text null,   -- [v3] description never kept
          resolved_at, fingerprint_id)
agent(agent_id pk, client_id, external_id)            -- [v3] name removed
training_record(id pk, client_id, agent_id, course, completed_at, fingerprint_id, ai_output_id)
checkpoint_result(result_id pk, client_id, run_id, checkpoint_id, scope jsonb,
                  status enum('pass','warn','fail','not_run'), reason_code,  -- [v3] reason_code includes RULE_PENDING
                  provisional bool default false,                           -- [v3] a Proposed value was used
                  worst_case bool default false,                            -- [v3]
                  share numeric null,
                  evidence_fingerprint_ids uuid[], ai_output_ids uuid[], rule_values_used jsonb)
metric_snapshot(id pk, client_id, metric_code, date, run_id, value numeric null, display text,
                numerator numeric, denominator numeric, data_completeness numeric,
                checkpoints_run int, checkpoints_total int, breakdown jsonb, labels text[],
                basis_mix jsonb,            -- [v3] source grade → share
                evidence_coverage numeric,  -- [v3]
                worst_case_fields text[])   -- [v3]
                -- [v3] metric_code also holds SCORE_OVERALL, SCORE_CONFIRMED, SCORE_<domain>
finding(finding_id pk, client_id, severity, domain_code, title,  -- [v3] title is a noun phrase
        affected_count, example_ids uuid[],
        response_ids text[],        -- [v3] was fix_step_ids; Set responses only
        first_seen, last_seen, status enum('open','in_progress','resolved','reopened'))
lead_result(id pk, client_id, lead_id, run_id, signals jsonb, score_raw, score_display, hard_signals text[],
            result enum('few','some','high','not_measured'), consent_status, consent_codes text[],
            checklist_missing text[], not_measured text[])
vendor_score(id pk, client_id, vendor_id, sub_id null, window_from, window_to, rates jsonb, score, grade,
             not_enough_data bool, computed_at)
```

**[v3] Provenance (new)** — see [spec §5a](specs/01-engineering-spec.md)

```sql
import_batch(batch_id pk, client_id, system enum('crm','dialer'), created_by, starts, ends,
             created_count int, updated_count int,
             classification enum('bulk_import','hand_entered','small_batch','dialer_import'),
             opted_out_readded int default 0,     -- feeds M34; shown on the batch row
             confirmed_by_client bool null)
evidence_event(event_id pk, client_id, phone_token, system,
               type enum('cert','inbound_call','inbound_sms','form_submission','purchase','recording'),
               occurred_at, source_record_id, fingerprint_id,
               confirmed_by null)                 -- recording counts only after a person confirms
proof_request(request_id pk, client_id, batch_id fk, phone_token, sent_at, answered_at null,
              answer enum('proof','none') null, fingerprint_id null)   -- unanswered stays NO_PROOF
```

**[v3] Integrity (new)** — see [spec §5b](specs/01-engineering-spec.md)

```sql
reconciliation(id pk, client_id, period, measure enum('calls','texts','vendor_leads','seat_capacity',
               'stop_replies','days_present'), records_count, independent_total null, ratio numeric null,
               status enum('consistent','flag','not_available'), total_fingerprint_id null)
attestation_statement(statement_id pk, client_id, field_key, statement_text, signed_by, signed_at, fingerprint_id)
attestation_conflict(conflict_id pk, client_id, statement_id fk, observed_text, evidence_ref,
               treatment enum('scored_as_not_done','higher_figure_used','period_flagged','unknown_system'))
caller_id_inventory(id pk, client_id, caller_id_token, seen_by enum('test_line','carrier_label','consumer_report'),
               seen_at, brand_announced, in_connected_system bool, disclaimed_at null)
```

`statement_text` is the officer's own signed answer to CiV's question, so CiV
keeps it; it is not a client record.

**[v3] Decisions (new)**

```sql
response_library(response_id pk, domain_code, text, status enum('set','proposed','tbd'),
                 owner text default 'counsel', valid_from, valid_to)
decision_record(decision_id pk, client_id, finding_id fk, decision enum('accepted','declined','alternative'),
                note_sha256 bytea, recorded_by, recorded_at)
```

The note text stays in the client's tenant only; CiV writes `note_sha256` to
`access_log`; exports carry the decision and hash, never the note.

**[v3] Buyers (new)** — see [spec §9a](specs/01-engineering-spec.md)

```sql
buyer_org(buyer_org_id pk, kind enum('insurer','acquirer'), name)
buyer_link(id pk, buyer_org_id fk, client_id, scope text[],   -- attestation | integrity | export
           granted_by, granted_at, revoked_at null)
attestation_snapshot(snapshot_id pk, client_id, as_of date, payload jsonb,  -- schema civ.attestation.v1
                     sha256 bytea, signed_statement_ids uuid[], created_at)  -- prior versions kept
buyer_token(id pk, buyer_org_id, token_hash bytea, issued_at, expires_at, revoked_at null)  -- proposed; rotated 90 days
```

### 1.3 Phase 1 core **[v3: was Phase 0 core]**

v1.1's core set with `artifact` → `fingerprint` and `deletion_log` → `purge_log`,
plus `import_batch`, `evidence_event` and `reconciliation`:
`rulebook_version`, `rule_value`, `state_consent_rule`, `client_parameter`,
`client`, `client_brand`, `campaign`, `run`, `fingerprint`, `purge_log`,
`merkle_anchor`, `access_log`, `ai_output`, `ai_gate`, `page_capture`,
`phone_epoch`, `contact_epoch_assignment`, `address_version`, `rnd_query_log`,
`contact_event`, `consent_proof`, `consent_evaluation`, `lead`, `vendor`,
`opt_out_event`, `import_batch`, `evidence_event`, `reconciliation`. Import
detection and completeness are in Phase 1 because the worst-case defaults
depend on them.

---

## 2. Rulebook loader

```
load(version_id):
  rows = rule_value where rulebook_version = version_id
  validate:
    every key in REQUIRED_KEYS present (else refuse: MISSING_KEY)
    sum(vs_rate_weights) == 1 ± 1e-9 (else refuse: WEIGHTS)
    if version.status == 'approved':
        every row with affects_status must have owner='counsel' and version.counsel_approved_by not null
        no row with status='tbd' (else refuse: TBD_IN_APPROVED)
  build index: key → [(jurisdiction, effective_from, effective_to, value, variants)]

value(key, on_date, jurisdiction_chain, client_id):
  1. client_parameter for (client_id, key) in force on on_date → return
  2. for j in jurisdiction_chain (most specific → 'US'): row with j and on_date in [from, to) → return
  3. raise MISSING (caller maps to "not measured — rule not set")

variant_value(key, ..., variant):
  v = value(...); if row.variants and variant in row.variants → row.variants[variant] else v

[v3]
status(key, on_date, ...): the row's status (set | proposed | tbd)
worst_case(field): value('worst_case.' + field, ...)        # Product-owned, counsel-reviewed
```

`jurisdiction_chain(client, contact)` = `[district, circuit, 'US-'+state, 'US']` from `client.litigation_forum` and the recipient state.

**[v3] Status gates execution.** A checkpoint whose inputs depend on a TBD
value returns `not_run` with reason `RULE_PENDING`; it never runs on a
placeholder. A Proposed value runs and sets `checkpoint_result.provisional`.
*(v1.1: a TBD row with `variants` still returned the variant value in
provisional runs. Superseded.)* Counsel-owned consent keys added in v3:
`seller_named_required` (default false), `written_consent_required_by_forum`
(keyed by `client.litigation_forum`), `inbound_contact_scope`.

---

## 3. Normalizer

### 3.1 Parsing

Each `(source_system, upload_type)` has a parser with a `parser_version`. Parsing is idempotent: re-parsing the same record with the same version produces no new rows (upsert on `(source_fingerprint_id, source_record_id)`). **[v3]** The normalizer runs inside the intake job, on records held in memory. It tokenizes phones before any write, sets derived flags (for example `is_confirmation` from a message body, keyword matches for opt-outs) and writes only tokens, derived facts and `source_fingerprint_id`. When the job ends, the content is gone.

### 3.2 Contact rule

A row becomes a `contact_event` iff `direction = outbound` and (`channel = call` and (`answered` or `count_unanswered_calls`)) or (`channel = sms` and (`sms_delivery_status != rejected` or `count_undelivered_sms`)).

### 3.3 Cross-system dedupe

```
for each new outbound row r from system S:
  candidates = contact_event where client, phone_token, channel same          # [v3] phone_token
                and source_system != S and |occurred_at - r.occurred_at| <= dedupe_window_seconds
                and dedupe_group_id is null
  if exactly one candidate c: group r and c; keep the dialer/SMS-platform row as canonical
  if several: pick the nearest in time; the rest stay separate
```

`dedupe_window_seconds` is validated ≥ `clock_skew_seconds` at rulebook load.

### 3.4 Location resolution

```
addr = CRM address in force at occurred_at for the contact linked to this number   # [v3] read in memory
tz_zip  = zip_to_tz(addr.zip) if addr
tz_area = area_code_to_tz(phone)  (may be a list for split zones → take all)
confidence = high if addr.zip else medium if line_type == landline else low
store both zones; evaluators check both when they disagree (location_conflict_rule = strictest)
[v3] write address_version(phone_token, state, time_zone, tz_source); the ZIP and street are never written
```

---

## 4. Epoch resolver

Inputs: RND answers (client logs, **[v3]** source grade D; CiV queries, grade A), carrier line status (grade B), consent proof dates, contact dates.

```
resolve(phone_token):
  points = sorted distinct dates from proofs and contacts for this token (within lookback)
  epochs = [one open epoch: start unknown, end unknown, certainty unknown]
  for each consecutive pair (d1, d2) where a proof precedes a contact:
      ask RND "disconnected since d1?" at d2 (budget check)    # [v3] runs in a job where the number is present
      no  → same epoch confirmed for [d1, d2]
      yes → boundary in (d1, d2]; bisect with further dated queries until the interval ≤ 1 day
             or the per-number budget is spent → boundary stored as (end_after=d1', end_before=d2')
      no_data → certainty stays unknown for this interval
  certainty: known if every boundary interval ≤ 1 day; bounded if any interval > 1 day; unknown if any no_data
assign(subject): the epoch whose range contains subject.date; if the date falls in a boundary interval
                 → assignment_certainty = uncertain, label "reassignment uncertain"
```

The budget key is `rnd_query_budget_per_number`. Client RND logs never move a boundary but are used by M11. **[v3]** The M35 exposure sample (`purpose = exposure_sample`) also splits epochs but is never counted as the client's own check.

---

## 5. Consent engine

### 5.1 Required-proof profile

```
profile(contact, rb):
  category = campaign.message_category or 'unknown'  (unknown → evaluate as marketing; label 'category unknown')
  robocall = dial_mode in rb.autodialed_modes
             or prerecorded_or_ai
             or (channel == sms and category == marketing and rb.sms_treated_as_autodialed)
             or (dial_mode is null → treat as autodialed; label 'dial mode unknown')
  bases = []
  if robocall and category == marketing:      bases += robocall_marketing (needs proof_type ∈ written_consent_types)
  if robocall and category == informational:  bases += robocall_informational (needs any prior express)
  dnc = client_list_entry(dnc_check|internal) covering phone_token on contact date      # [v3] dnc_check
  if dnc found:                               bases += dnc_listed (needs signed_written or active EBR)
  elif no fresh DNC list for this date:       bases += dnc_unknown (needs any accepted proof; label 'DNC list not supplied')
  scr = state_consent_rule for recipient state, contact date, channel, contact type
  if scr:                                     bases += state_law (needs scr.consent_type_required)
  if bases empty:                             bases += civ_policy (needs any accepted proof)
  is_legal = any(b in {robocall_marketing, robocall_informational, dnc_listed, state_law} for b in bases)
  [v3] written-consent need is read through written_consent_required_by_forum for the client's forum
```

### 5.2 Per-basis evaluation

```
evaluate_basis(contact, basis, proofs, evidence, opt_outs, epoch, rb, as_of):
  # step 1 — applicable proof exists
  P = proofs same epoch; before contact per timing(); not cut off by in-scope opt-out;
      relationship not lapsed; proof_type satisfies basis; channel covered
  [v3] for a manual-import number (lead.basis = manual_import) with no linked proof:
       e = earliest evidence_event before first contact (§17.3); if e: P = [proof from e]
  codes1 = every step-1 code that fired while filtering (NP_NONE, NP_SELF_ASSERTED, NP_BEFORE_CONSENT,
           NP_AFTER_OPT_OUT, NP_RELATIONSHIP_LAPSED, NP_WRONG_TYPE,
           [v3] NP_NO_EVIDENCE_FOUND, NP_THIRD_PARTY)
  [v3] NP_SELF_ASSERTED also fires when the only evidence is a column in a manual import
  [v3] NP_THIRD_PARTY when lead.source_type in (referral, appended, skip_traced)
  [v3] evidence type purchase → label EBR_ONLY; covers ebr_allowed_contact_types only,
       never autodialed or prerecorded calls to cell phones
  if P empty: return (NO_PROOF, primary=first(codes1 in table order), codes1)

  results = []
  for p in P:
     [v3] custody(p)               → client_account | vendor_only | unclaimed (recorded, not a status)
     s2 = opens_at_source(p)       → via the client's own key only (rule 14)
                                     [v3] not at provider and CiV fingerprint on record → WEAK WK_FINGERPRINT_ONLY
                                     not at provider and no CiV fingerprint → CONFLICTING CF_NOT_FOUND
                                     CF_EXPIRED(+pre_engagement) | CF_FILE_MISSING
     s3 = content_is_consent(p)    → NO_PROOF codes NP_NO_CONSENT_TEXT | NP_PRETICKED
     s4 = sources_agree(p, contact)→ CONFLICTING codes CF_PHONE_MISMATCH ([v3] provider fingerprints.matching) |
                                      CF_SELLER_MISMATCH ([v3] only if seller_named_required) |
                                      CF_PAGE_MISMATCH | CF_CERT_AFTER_DELIVERY (gap > clock_skew_seconds)
     s5 = completeness(p, contact) → WEAK codes WK_TIMING_UNCERTAIN | WK_RETENTION | WK_WORDING |
                                      WK_LEAD_TRACE | WK_SELLER_NOT_FOUND (or seller_absent_effect)
                                     [v3] fill time and paste never set a status (vendor score only)
     first failing step decides p's status; all codes of that step recorded; else VERIFIED / VF_OK
     results.append((status, codes, p))

  rank = {VERIFIED:0, WEAK:1, CONFLICTING:2, NO_PROOF:3}
  best = min(results, key=(rank[status], -captured_at))
  return best
```

**[v3]** `WK_FINGERPRINT_ONLY` ends evaluation of that proof at step 2: CiV
can prove the certificate existed on a date but cannot read its content.
The "CiV stored copy" path is removed. Vendor-only certificates are evaluable
only while the vendor shares them; the custody finding names the vendor and
the share of leads affected.

### 5.3 Contact status

```
per_basis = {b: evaluate_basis(...) for b in bases}
worst = max(per_basis.values(), key=rank)            # NO_PROOF > CONFLICTING > WEAK > VERIFIED
consent_evaluation.status = worst.status; bases = per_basis; is_legal_basis = is_legal
primary_reason_code = worst.primary; reason_codes = union of all codes across bases
```

### 5.4 Timing

```
before(proof, contact):
  if contact.lead_id and proof.lead_id == contact.lead_id:      # linked chain
      return proof.captured_at <= lead.delivered_at <= contact.occurred_at   (no tolerance)
  d = contact.occurred_at - proof.captured_at
  if d >  clock_skew_seconds: return True
  if d < -clock_skew_seconds: return False   → NP_BEFORE_CONSENT
  else: True with WK_TIMING_UNCERTAIN
opt-out cut-off: effective from business_day_add(received_at, optout_grace_business_days, tz)
  one confirmation message within confirmation_window_minutes is never cut off
  after an in-scope opt-out only a *new consent proof* restores coverage (EBR never does)
[v3] inbound_call / inbound_sms evidence covers outbound contacts per inbound_contact_scope (subject, days)
```

### 5.5 Determinism and re-evaluation

- `as_of` is the run's `evaluation_as_of`; `WK_RETENTION` compares `expires_at - as_of` to `cert_expiry_warning_days`.
- A nightly run re-evaluates a contact only if: new proof, opt-out, epoch change, list entry, AI gate change, rulebook version change, or `expires_at` within warning window (`reeval_reason` recorded).
- Frozen contacts are never re-evaluated. **[v3]** `FZ_SOURCE_DELETED` no longer arises from CiV deletion (CiV holds no content). When a re-fetch finds a source record changed or gone, the result is kept, `inputs_changed = true`, and it is labeled "inputs changed since evaluation"; it is never silently recomputed.
- Provider outage: status `PENDING` for new contacts within `provider_retry_hours`; existing keep last status.
- **[v3]** A step that needs content again (certificate status, page match) re-fetches inside a job through the client's key; the result is derived and the content dropped.

### 5.6 Variants

When `run.variant ∈ {strict, lenient}`, every `rb.value` call for a key with `variants` uses `variant_value`. A provisional nightly run executes both variants and stores both `consent_evaluation` rows (distinguished by `variant`). The counsel dashboard shows, per key, how many contacts change status between variants.

---

## 6. Checklist evaluation (rule-based items)

Runs against `page_capture` for the certificate's page URL nearest the consent date (within `page_snapshot_max_gap_days`) or, for backfill, against the certificate snapshot only (labelled "not comparable — no contemporaneous capture"). **[v3]** The certificate's page scan is read through the client's key in memory; measurements and hashes are kept.

| Item | Measurement |
|---|---|
| CC_UNTICKED | checkbox `checked` attribute false in DOM at load |
| CC_NUMBER_SHOWN | phone field value or rendered text contains the consented number (E.164 normalized) |
| CC_SELLER_NAMED (rule pass) | normalized consent-block text or partner-list capture contains any `client_brand.name` (case-insensitive, whitespace-collapsed, Jaro-Winkler ≥ 0.92 on tokens) → `matched`; contains another known seller → `other_seller`; else `not_found` |
| CC_SELLER_COUNT | count of distinct seller names in consent block ≤ `cc_max_sellers_named` |
| CC_BUTTON_MATCH | submit button text equals the button text referenced in the consent sentence |
| CC_FONT_SIZE | computed `font-size` of consent text ≥ `cc_min_font_px` at every viewport |
| CC_CONTRAST | WCAG contrast ratio of consent text vs its background ≥ `cc_min_contrast_ratio` (3:1 if large text) |
| CC_ABOVE_BUTTON | consent block bounding box bottom ≤ button top |
| CC_NO_SCROLL | consent block within first viewport height |

AI items (CC_CONSENT_TEXT meaning, CC_OPT_OUT, CC_NOT_CONDITION, CC_AUTODIAL_DISCLOSED, CC_SELLER_NAMED meaning) run only when `ai_gate[feature].passed`. **[v3]** Required wording for check 3 is a counsel Rulebook value.

---

## 7. Rules engine and aggregation

```
for cp in checkpoints where automation_bucket == 'automated':
  inputs = resolve_inputs(cp)                       # metric codes via metric_checkpoint_map, or direct queries
  [v3] if any rule value cp depends on has status tbd: result not_run / RULE_PENDING; continue
  [v3] for each input graded S or N: use rb.worst_case(field); mark worst_case = true
       (v1.1: not_run / NEEDS_SOURCE. Superseded for score inputs.)
  if cp.aggregation.unit == 'program': status from criteria directly
  else:
     fail_share = failing_units / measured_units
     status = pass if fail_share <= pass_max_share else warn if fail_share <= warn_max_share else fail
  [v3] provisional = any rule value used has status proposed
  store checkpoint_result with share, evidence fingerprint ids, rule values used, worst_case, provisional
```

Consent feeds per-contact units: VERIFIED → pass; WEAK → warn; CONFLICTING or NO_PROOF with `is_legal_basis` → fail; NO_PROOF with only `civ_policy` → warn. Frozen, pending, test excluded. **[v3]** The client's DNC check records (M13) are Info only and feed no checkpoint score.

---

## 8. Scoring

```
credit = {pass:1, warn:rb.warn_credit, fail:0}
domain_score[d] = Σ w_cp·credit / Σ w_cp over cp in d with status != not_run; "not measured" if none ran
overall = Σ rb.domain_weights[d]·domain_score[d] / Σ weights over measured d, excluding NDN, SDN, litigator
grade = band(overall, rb.grade_bands) on the unrounded value

[v3] caps, applied to the unrounded score in this order; each held grade records the cap name
1. hard cap: legal-basis contacts with NO_PROOF or CONFLICTING ÷ legal-basis contacts > rb.hard_cap_share
          → overall grade = min(grade, rb.hard_cap_grade); excludes pre_engagement, frozen, civ_policy-only
2. contact-after-stop cap: any contact after an internal-list entry (IDN) or after an in-scope opt-out (REV)
          → that domain's grade = min(grade, rb.direct_violation_grade)
3. coverage cap: evidence_coverage < rb.coverage_cap_floor → overall grade = min(grade, rb.coverage_cap_grade)

[v3] evidence_coverage = Σ_g share_g × w_g over g in {A,B,C,D,S,N}; w_A=w_B=w_C=1, w_D=0.7, w_S=w_N=0
     share_g = share of score weight from inputs of source grade g
[v3] confirmed-rules score: rerun domain and overall using only rule values with status set;
     domains depending on a proposed or tbd value drop out as "rule pending";
     stored as metric_snapshot code SCORE_CONFIRMED
provisional: measured expected_sources ÷ len(expected_sources) < rb.provisional_completeness
display: one decimal; "checkpoints run X of Y" beside every score; [v3] evidence coverage beside every score
```

**[v3] Monotonicity rule (Gate 4 test).** A client that withholds a source
scores at or below the same client with that source showing its worst case.
Nothing graded S can raise a value.

---

## 9. Metric calculator

One module per card in `metrics/m01.py … m39.py` **[v3: 39 metrics]**, each exposing `compute(client, run, rb) → MetricResult(value, numerator, denominator, breakdown, labels, missing, basis_mix, worst_case_fields)`. A registry enforces a seven-field `CARD` dictionary defined beside `compute` (question, period, population, logic, edge cases, missing-data rule, example) — the card linter reads it and fails CI if a field is missing. Shared helpers: `window(rb)`, `local_time(contact)`, `business_days(...)`, `nearest_rank_percentile(values, p)` where NEVER sorts last.

**[v3] Changes:**

| Code | Metric | Basis | Note |
|---|---|---|---|
| M11 | Pre-Contact Reassigned Checks | D | No client logs → "not checked" (worst case); the client's statement shown as Insured states |
| M13 | DNC Check Record Check | D | Renamed; Info only, never in the score |
| M32 | Manual-import share | C | Contacts with basis `manual_import` ÷ all contacts |
| M33 | Evidence found rate (manual numbers) | C | EBR-only shown separately |
| M34 | Opted-out numbers re-added | C | Count per batch; High alert |
| M35 | Reassigned exposure (RND sample) | A | `rnd_sample_size`; after contact only |
| M36 | Evidence coverage | — | §8 formula |
| M37 | Records completeness | B | Minimum ratio over calls, texts, vendor leads |

Rules: one basis chip per metric (the grade with the largest share), with the
mix on hover; one denominator per figure (contacts, numbers or leads, never a
mix; the label says which); a cross-page consistency test asserts that every
figure shown on two pages comes from one query. Detail in
[03-metric-specs.md](specs/03-metric-specs.md).

---

## 10. Revocation tester **[v3: part of the Test + capture service]**

```
plan: for each channel in annex_c.channels × test plan methods:
   [v3] for each marketing campaign: seed at least one test (seeded_campaign_id, seeded_via = client_form)
   [v3] for each vendor form in annex_c.vendor_forms: seed through it (seeded_via = vendor_form)
   seed identity through the form (Playwright), flag lead.is_test, record seeded_via_url
   [v3] timing and channel randomized within the authorized window; test number from the rotation pool
observe (hourly job): for each open test:
   inbound handler shows first contact → first_contact_at; then send opt-out by method
   [v3] no contact within seed_contact_window_days → result = not_reached ("not reached", never "passed")
   poll each connected system (dialer suppression list, SMS opt-out list, CRM field, lead platform status)
   suppressed_at = first time the system shows suppression; inferred = true if system exposes no state
   (then suppressed_at = last contact time, clamped ≥ opt-out time)
   deadline_at = business_day_add(received_at, optout_deadline_business_days, test_number.time_zone)
   any later contact → recorded; after optout_observation_days without suppression → NEVER
matrix: per (channel, system): median and p90 by nearest rank, never_count, indicative = n < min_tests_per_cell
[v3] test coverage = marketing campaigns reached ÷ marketing campaigns; an unreached campaign is "untested"
[v3] rotation: retire numbers after test_rotation_days; numbers never returned by any portal endpoint
```

**[v3] Contacts after opt-out from logs alone (M10).** The messaging log holds
the inbound STOP and every later outbound text. The body is read in memory to
set `is_confirmation` and match `optout_keywords`; only the derived flags and
the fingerprint are stored. Plain-language opt-outs go through the AI reader
and count only after a person confirms each.

---

## 11. AI reader

```
ask(feature, inputs, prompt_version):
  key = sha256(feature, model, prompt_version, checklist_version, canonical(inputs))
  cached = ai_output where input_hash = key → return
  response = llm(structured schema for feature)
  store ai_output(confidence = response.confidence, input_fingerprint_ids)   # [v3]
  return output; consumers apply: gate passed and confidence >= ai_min_confidence, else "not measured"
```

**[D37] Conversation review** (owner decision 2026-10-08):

```
on conversation_ended(client, token, channel, refs):          # from live sync (call hang-up; text thread quiet 10 min)
  content = read_in_memory(refs)                               # recording → speech-to-text, or the text thread (last 30 days)
  r = ask("conversation_review", content, prompt_version)      # {result, moment, confidence}
  if gate_status("conversation_review", channel) != passed: store review(result=not_measured); return
  if r.confidence < rb.value("conv_review_min_confidence"): r.result = "unclear"
  review = store conversation_review(token, channel, r, fingerprint(content)); drop content
  if r.result in (opted_out, wrong_number):
      opt = store opt_out_event(source="ai_conversation", received_at=moment_time)
      marks = check_dnc_marks(client, token, systems=[dialer, messaging, crm])   # read-only
      if not all_contacting_systems_marked(marks): alert("optout_not_marked", within=15 min)
      schedule recheck every catchup_interval_minutes until the opt-out deadline → set client_marked_at
  if r.result == opted_back_in: close the earlier opt-out at moment_time
```

Features: `contract_clauses`, `call_transcription`, `call_disclosures`, `free_text_opt_out`, **[D37]** `conversation_review`, `consent_page_meaning`, `training_record`, **[v3]** `spoken_consent_flags`. Gate: ≥ `ai_accuracy_min_items` hand-labelled items, agreement ≥ `ai_accuracy_pass_mark`, recorded in `ai_gate`. **[v3]** Inputs (contracts, policies, training files, recordings, message text) are read in memory; only the structured output is kept. A cache hit needs the same input hash, so a re-read of a changed record re-asks.

---

## 12. Fingerprint ledger operations **[v3: replaces "Evidence store operations"]**

```
record(client, source_system, source_record_id, grade, content_kind, bytes):   # bytes in memory only
  h = sha256(bytes)                                    # raw response bytes, not a re-serialized object
  tsa = rfc3161.timestamp(h) (batched per job)
  insert fingerprint(client, source_system, source_record_id, grade, now(), h, tsa, content_kind)
  return fingerprint                                   # bytes go out of scope at job end
anchor_daily(date):
  leaves = fingerprint.sha256 where date(fetched_at)=date order by fingerprint_id
  tree = merkle(leaves); store root; for each leaf store leaf_index + path
  ots = opentimestamps.stamp(root); tsa = rfc3161.timestamp(root); status = anchored if both else pending (retry)
position_lookup(client, number, on_date):              # number typed by the user, tokenized at once
  t = hmac(client key, number)
  for each fingerprint behind t's contacts, proofs and opt-outs up to on_date:
     bytes = connector.refetch(source_system, source_record_id)   # inside a job
     outcome = matches if sha256(bytes) == fp.sha256
               else changed (show both hashes and dates) if bytes
               else no_longer_at_source (the timestamped fingerprint proves it existed)
     log access; drop bytes (showing them on a page first is D32b)
verify(fingerprint_id, file):  match if sha256(file) == fingerprint.sha256 else no_match
legal_hold(client, named_records, reason):
  insert legal_hold; send the retention instruction to the client
  optional: re-fetch named records → encrypt with the client's key → write once to the client-owned bucket
            (CiV role is write-only; CiV never reads it back)
release_hold(hold_id, user, reason):  require user.role == legal and reason; log both
purge(job): on job failure delete rows written by job_id in its transaction scope; insert purge_log
shred_key(client):  refuse if client.legal_hold; destroy the HMAC key versions in the KMS; log in access_log
```

*(v1.1: S3 Object Lock `put`/`get`/`delete`, per-client SSE-KMS keys, re-keying
for single-artifact deletion, `deletion_log`. Superseded by ADR-12.)*

---

## 13. Job orchestration

Workflows (Celery task chains, one task per activity; runner proposed, ADR-5): **[D35]** `LiveEventWorkflow(client, source, event)` (one change: read in memory, fingerprint, tokenize, normalize, per-contact checks, urgent alerts), **[D37]** `ConversationReviewWorkflow(client, token, channel, refs)` (after each conversation ends; see §11) and `OptOutMarkRecheckWorkflow(review_id)`, `CatchupWorkflow(client, source)` (hourly, from `sync_cursor`; writes `sync_gap` for anything the live feed missed), `PollWorkflow(client, source)` (every 5 min for tools without notifications), `FullSweepWorkflow(client, source)` (weekly), `ScoreRefreshWorkflow(client)` (hourly), `BackfillWorkflow(client, from, to)`, `NightlyWorkflow(client, date)`, `AnchorWorkflow(date)`, `CaptureWorkflow(client)`, `RevocationObserveWorkflow(client)`, `ReportWorkflow(client, run_id)`. **[v3]** Adds `ProvenanceWorkflow(client)` (batches, ladder, evidence search, re-added opt-outs), `ProofRequestWorkflow(batch)`, `ReconciliationWorkflow(client, period)`, `AttestationWorkflow(client, month)` (monthly snapshot + buyer webhooks), `AccessLevelWorkflow(client)` (nightly), `PositionLookupWorkflow(client, token, date)`, `LegalHoldWorkflow(hold_id)`, `ContentAtRestScan()`.

**[D35]** Webhook receivers verify the vendor's signature, write the event to a Redis queue and return at once; the event payload is processed in memory and never written to disk. `sync_cursor` (client_id, source_system, cursor, mode, last_event_at, last_heartbeat_at, last_catchup_at, last_full_sweep_at) and `sync_gap` (client_id, source_system, source_record_id, sha256, found_by, changed_at, found_at, delay_seconds) hold sync state; neither holds content.

Activities are idempotent by natural key (**[v3]** `(source_system, source_record_id, sha256)` for fingerprints, `(source_fingerprint_id, parser_version)`, `(event_id, run_id, variant)`). Retries with exponential backoff; a failed activity never leaves partial rows visible (write in a transaction keyed by run). **[v3]** An intake job that fails after writing removes its rows and records them in `purge_log`. A workflow that fails leaves `run.status = failed`; the portal keeps showing the last successful run. **[v3]** Workers fetch the client's HMAC key from the KMS at job start and hold it in memory only; no content is written to temporary files.

---

## 14. Portal and export API

```
GET  /clients/{id}/runs                       list runs (client roles see output_visibility=client only)
GET  /clients/{id}/score?run=                  scores, checkpoints run/total, provisional flag
                                               [v3] + evidence coverage, caps held (with cap name), SCORE_CONFIRMED
GET  /clients/{id}/metrics?run=&code=          metric cards [v3] + basis_mix, worst_case_fields
GET  /clients/{id}/contacts?run=&status=       contact rows: bases, five check states, proof summary, [v3] source grades, fingerprint
POST /clients/{id}/numbers/lookup              [v3] body {number, on_date}; number tokenized at once, never in a URL or log
                                               → contacts, results, fingerprints, fetch times, anchor proof, re-fetch outcomes
GET  /clients/{id}/numbers/{token_ref}/evidence  evidence file (PDF|JSON), logged [v3] contents wait on D18
                                               (v1.1: /numbers/{e164}/evidence. Superseded: no number in a URL)
POST /clients/{id}/fingerprints/{fid}/verify   [v3] upload a file; returns match | no_match; file not kept
GET  /clients/{id}/revocation?run=             M08 / M09 summary + propagation matrix cells [v3] + test coverage
GET  /clients/{id}/leads?run=                  signal counts, dispute-candidate count, vendor scores with month-on-month
GET  /clients/{id}/provenance?run=             [v3] ladder shares by basis (contacts), untraced count
GET  /clients/{id}/import-batches              [v3] batches, classification, counts, re-added opt-outs, proof production rate
POST /clients/{id}/import-batches/{bid}/confirm   [v3] onboarding calibration (five batches)
GET  /clients/{id}/proof-requests?batch=       [v3]
POST /clients/{id}/proof-requests/{rid}        [v3] attach proof (fingerprinted, discarded) or answer "none"
GET  /clients/{id}/reconciliation?period=      [v3] rows per measure, M37
GET  /clients/{id}/caller-ids                  [v3] inventory; unknown calling systems
POST /clients/{id}/caller-ids/{cid}/disclaim   [v3] written disclaimer by owner or legal
GET  /clients/{id}/statements                  [v3] Insured states with conflicts
POST /clients/{id}/statements                  [v3] officer-signed statement
GET  /clients/{id}/findings                    [v3] findings with common responses and decisions (was fix list)
POST /clients/{id}/findings/{fid}/status       open|in_progress|resolved|reopened
POST /clients/{id}/findings/{fid}/decision     [v3] {decision, note}; note kept in tenant, note_sha256 logged
GET  /clients/{id}/vendors/{vid}/disputes      (module 11)
GET  /clients/{id}/sources                     sources with [v3] source grade, access, last sync, status
GET  /clients/{id}/access-level                [v3] level 0–4, what each level unlocks, what is missing
POST /clients/{id}/sources/{sid}/revoke
POST /clients/{id}/uploads?type=&name=         [v3] fallback only: parsed, fingerprinted, discarded in the same job
GET  /clients/{id}/reports                     [v3] period report history with sha256
POST /clients/{id}/legal-holds                 [v3] legal role; DELETE needs legal role + reason
GET  /clients/{id}/buyer-links                 [v3] grant / revoke buyer access
GET  /clients/{id}/alerts
GET  /session                                  user, client, role, engagement mode, report period [v3] + access level, buyer_org for buyer roles
buyer (insurer_underwriter, acquirer_deal_counsel) [v3]:
GET  /buyer/portfolio                          linked insureds: score, coverage, completeness, conflicts, worst-case count
GET  /buyer/insureds/{client_id}/attestation?as_of=
GET  /buyer/insureds/{client_id}/integrity
GET  /buyer/insureds/{client_id}/loss-model    (labeled uncalibrated); PATCH parameters (versioned)
GET  /v1/insureds/{client_id}/attestation?as_of=YYYY-MM   underwriting export API; bearer token per buyer_org
internal:
POST /rulebook/versions  PATCH /rulebook/versions/{v}/approve (counsel role)
GET  /rulebook/impact?key=&from=&to=           contacts changing status between variants
POST /responses  PATCH /responses/{rid}         [v3] response library (counsel role)
```

All responses carry `run_id`, `rulebook_version`, `code_version`, and the standard disclosure.

The response shapes are fixed by the portal's contract file,
`frontend/src/api/types.ts` (frontend plan, Part A, Task A3). The endpoint list
above was revised on 2026-10-03 to match the screens of the CiV Audit Portal
Prototype: `contacts`, `revocation`, `leads` and `sources` were added, and
`sources` replaces the earlier `connectors` naming. **[v3]** The endpoints
marked [v3] are proposed paths; they enter `types.ts` only after the owner
approves the frontend update (CHANGELOG-v3 §14). `{token_ref}` is an opaque
reference returned by `numbers/lookup`, not the token itself.

### 14.1 Portal pages **[v3]**

Every page is built only from CiV's analyzed data
([CHANGELOG-v3 §2.2](specs/CHANGELOG-v3.md#22-how-civ-shows-everything-without-holding-the-clients-records)).
How a number appears in lists (as typed, or a masked label such as
"(480) •••-0923") — decided 2026-10-08 (D31): CiV stores area code + last 4 digits per token as `phone_label`.

| Page or section | What it shows | Built from |
|---|---|---|
| Overview / scores | Overall and domain scores; **evidence coverage beside every score**; the confirmed-rules score beside the overall score; a capped grade shows **"held"** and names the cap (hard, direct-contact, coverage); provisional and "rule pending" labels; worst-case fields counted | `metric_snapshot` (incl. `SCORE_CONFIRMED`), `checkpoint_result` |
| Access level | Level 0–4 today, what each level unlocks, which connection would raise it; below Level 1 only the outside-in score | `client.access_level`, source health |
| Metrics | 39 cards; one **source grade chip** per value (A, B, C, D, S, N; the largest share), mix on hover; "not checked" for M11 without client logs; one denominator named per figure | `metric_snapshot.basis_mix` |
| Contact Ledger | Per contact: time (local, UTC on hover), channel, status, reason codes, source grades, custody, fingerprint and fetch time | `contact_event`, `consent_evaluation`, `fingerprint` |
| Evidence file / position lookup | The person types a number and a date; results per record: **Matches / Changed / No longer at source**; anchor proof; verify a file against a fingerprint. Wording: "fingerprints of what CiV saw" | `fingerprint`, `merkle_anchor`, re-fetch |
| Lead provenance | Ladder chart (share of contacts by basis), kept apart from M06 (vendor leads); untraced list for the month | `lead.basis` |
| Import batches and proof requests | Batch rows: system, creator, start and end, created and updated counts, classification, re-added opt-outs (High), proof requests sent and answered, proof production rate; five batches to confirm at onboarding | `import_batch`, `proof_request` |
| Reconciliation | One row per measure with records, independent total, ratio, status; M37; "incomplete data" banner on a flagged period | `reconciliation` |
| Caller-ID inventory | Caller IDs seen on the client's brand vs those in connected systems; unknown calling systems first, with "connect" or "disclaim in writing" | `caller_id_inventory` |
| Insured states and conflicts | Each signed statement (signer, date) and every conflict CiV found with its evidence and treatment, shown as they are | `attestation_statement`, `attestation_conflict` |
| Revocation | Propagation matrix with **test coverage** on the same card; "not reached" and "untested" labels; no test numbers in any role | `revocation_test`, `matrix_cell` |
| Findings and decisions | **Replaces the fix list / Action Queue.** Noun-phrase titles; common responses (Set only); decision accepted / declined / alternative with the prompt *"Reviewed with [role]; decided [action] because [reason]."*; overdue against the real date | `finding`, `response_library`, `decision_record` |
| Reports | Period report history: period, rendered at, SHA-256 | `report` |
| Sources | Source grade, access, last sync, billing totals read or "not available"; uploads shown as a fallback | sources, `fingerprint` |
| Setup checklist | Connections by access level; Annex C v3; the five import-batch confirmations | — |
| **Buyer views** (separate role set) | Insurer: portfolio of linked insureds, each one's attestation, data integrity, loss model (labeled **uncalibrated**), export. Acquirer: the target's attestation, integrity and diligence export for the deal window. No contact-level rows, tokens, decision note text or test numbers | `attestation_snapshot`, `reconciliation`, `attestation_conflict`, `metric_snapshot` |

### 14.2 Wording and display rules **[v3]**

The banned-word check (§15) runs on every report template, generated text and
portal string (`src/lib/wording.ts`). v3 adds:

| Use | Never use |
|---|---|
| "DNC check records" | "scrub", "scrubbed", "screen", "screening" |
| "Fingerprints of what CiV saw" | "Records CiV holds", "stored write-once" |
| "Common responses" | "Fix steps", "you must" |
| "Insured states" | "Verified by the insured" |
| "Evidence package for named numbers" | "Court-ready" |
| "Source grade A" (always with "source") | "Grade A" alone (D30) |

Existing banned words stand, including "violation", "breach", "illegal",
"compromised", "fake", "fraud", "genuine", "compliant", "non-compliant",
"ensures compliance", "protects you", "guaranteed". Finding titles are noun
phrases of what was observed ("Web-form and email opt-outs not reaching
suppression"), never instructions.

Display rules:

- Timestamps in the viewer's local time zone, with UTC on hover.
- US spelling throughout (for example behavior, labeled, center).
- Every score carries evidence coverage; every metric value carries a source grade chip.
- A capped grade says "held" and names the cap.
- Loss model figures always carry the label "uncalibrated".
- Unreached tests say "untested" or "not reached", never "passed".

---

## 15. Testing strategy

| Level | What | Gate |
|---|---|---|
| Unit | Each engine step with fixtures; rulebook loader validation; timing rules; business-day calendar; nearest-rank | every PR |
| Consent cases C01–C50 | Fixture contacts + proofs + opt-outs → expected status and codes; run under strict and lenient. **[v3]** Adds cases for `WK_FINGERPRINT_ONLY` (synthetic expired certificate), `NP_NO_EVIDENCE_FOUND`, `NP_THIRD_PARTY`, `EBR_ONLY`, custody | Gate 2 |
| Lead Inspector L01–L29 | As specified in the Lead Inspector doc | Gate 2 (checks 2–3), Gate 4 (check 1, scorecard) |
| Metric cases T01–T54 | Fixture datasets → expected numerator, denominator, display, labels. **[v3]** Plus M32–M37 and basis mix | Gate 4 |
| Revocation cases | Simulated systems with configurable suppression delays. **[v3]** Plus per-campaign seeding, not reached, test coverage | Gate 3 |
| Reproducibility | Re-run a stored run; assert byte-identical evidence JSON. **[v3]** While fingerprints match; a changed input gives "inputs changed since evaluation" | every release |
| Banned-word | Every report template and every generated report text. **[v3]** Plus v3 additions and portal strings | every PR + every run |
| Rulebook load | Approved version with a TBD or unapproved `affects_status` key must refuse. **[v3]** A TBD-dependent checkpoint returns `RULE_PENDING` | every PR |
| Card linter | Every metric module has all seven docstring fields | every PR |
| Hand-checked sample | ≥ `gate_sample_size`, ≥ `gate_min_per_reason_code` per code, synthetic where the pilot lacks a code. **[v3]** 200 hand-checked contacts at Gate 2 | Gate 2 |
| **[v3]** No content at rest | After a full sync, scan the database and any object storage for phone numbers, message text and certificate bodies; any hit fails | Gate 1 + every release |
| **[v3]** Import detection | Five client-confirmed batches; thresholds calibrated | Gate 1 |
| **[v3]** Completeness | Reconciliation ≥ `completeness_floor` on the pilot | Gate 1 |
| **[v3]** Cross-page consistency | Every figure shown on two pages comes from the same query | Gate 4 |
| **[v3]** Worst-case monotonicity | Withholding a source never scores higher than showing its worst case | Gate 4 |
| **[v3]** Tenancy suite | Client → other client, client → buyer portfolio, buyer → contact-level rows, buyer after link revocation: all must fail | Gate 4, Gate 5, every PR |
| Security | RLS cross-tenant tests; secrets and keys never in logs; pen test before first real data | Launch |

---

## 16. Cost model hooks

Counters per run: RND queries (tier price) **[v3]** incl. the M35 sample, carrier lookups, email verifications, page captures (compute minutes), transcription minutes, AI tokens by feature, test-number SMS/voice. **[v3]** Adds KMS calls, re-fetch calls (position lookups, certificate re-checks, hold snapshots), period PDF renders. S3 GB-months for content are removed (no content stored). Exported as `run.stats.cost` and rolled up per client per month for the pricing doc. The base-rate study's PACER fees (about $8K a year, D29) are tracked on its own track.

---

## 17. Provenance engine **[v3: new]**

Detail and rationale: [spec §5a](specs/01-engineering-spec.md).

### 17.1 Provenance ladder

```
basis(phone_token):
  L = latest lead with received_at <= first outbound contact for this token
  first match, strongest first:
    1. lead platform feed (Level 3 or lead platform API)       → feed
    2. CRM lead-source field names a vendor (Level 4)          → crm_field
    3. number + date on a vendor's billed-leads invoice        → invoice
    4. certificate page domain identifies the publisher        → cert_domain
    5. number belongs to an import_batch                       → manual_import
    6. nothing                                                 → untraced (consent check 1: NP_NONE)
  monthly: untraced list returned to the client
```

The ladder counts **contacts** (share of contacts by basis); M06 counts
**vendor leads**. Never mix the two denominators in one figure.

### 17.2 Detecting manual imports

```
creation bursts (per CRM user, integration and API users excluded first):
  order by created_at; a gap > import_gap_seconds starts a new batch
  n >= import_min_batch → bulk_import; n == 1 → hand_entered; else small_batch
update bursts: same grouping over field-history rows on opt-out, do-not-call and lead-source fields;
  record updated_count (a re-uploaded sheet often updates rather than creates)
dialer-side imports: numbers in the dialer with no CRM record, grouped by list ID + list insert time
  → dialer_import
calibration: at onboarding show five detected batches; record confirmed_by_client;
  adjust the two thresholds per client before the first scored run (D21)
re-added opt-outs: per batch, count numbers whose opt-out predates the batch start
  → import_batch.opted_out_readded, M34, High alert
```

The SQL for creation bursts runs in the connector job against the CRM's API
results in memory (window over `created_by`, `created_at`); only the batch
rows are written. Salesforce field history exists only if field history
tracking is on; without it, update bursts are "not available".

### 17.3 Evidence search and proof requests

```
evidence(phone_token): earliest evidence_event with occurred_at < first outbound contact
  cert            → normal five checks via the client's key
  inbound_call    → consumer-initiated; scope per inbound_contact_scope
  inbound_sms     → keyword opt-in or "YES" reply; evidence for texts
  form_submission → timestamped record from the client's own form
  purchase        → EBR_ONLY, not consent
  recording       → counts only after a person confirms the AI-flagged moment
  none            → NP_NO_EVIDENCE_FOUND
proof_requests(batch):
  sample proof_request_sample numbers without evidence (larger sample above 10,000; see Rulebook)
  client attaches proof (fingerprinted, then discarded) or answers "none" per number in the portal
  unanswered stays NO_PROOF; proof production rate = produced ÷ requested, per batch
```

---

## 18. Integrity engine **[v3: new]**

Detail and rationale: [spec §5b](specs/01-engineering-spec.md).

### 18.1 Worst-case defaults and evidence coverage

Each score input has a `worst_case.<field>` Rulebook value. When the input's
source grade is S or N the engine uses it and records the field in
`worst_case_fields`. Starting values (D22): consent proof rate 60%;
purchased-lead share 60%; prerecorded / AI share 20%; opt-outs not honored by
deadline 10%; internal-list and litigator contacts 1; reassigned check "not
checked"; prior matters max(stated, docket count). Evidence coverage and the
coverage cap are in §8.

### 18.2 Reconciliation

```
per client per period, one row per measure:
  calls          outbound calls in dialer logs   vs calls billed on the carrier invoice   flag if ratio < completeness_floor
  texts          outbound messages in SMS log    vs messages billed by the platform        flag if ratio < completeness_floor
  vendor_leads   vendor leads in records         vs leads billed on vendor invoices         flag if ratio < completeness_floor
  seat_capacity  outbound calls                  vs seats × calls_per_agent_day range × working days   flag if outside
  stop_replies   inbound STOP replies            —                                         flag if 0 with > stop_check_min_texts texts
  days_present   days with at least one record   vs calendar working days                   flag if ratio < completeness_floor
  no independent total available → status not_available
M37 = min(ratio) over calls, texts, vendor_leads
flagged period → label "incomplete data"; missing share takes worst-case values
```

### 18.3 Caller-ID inventory

Caller IDs seen calling on the client's brand (CiV test lines, carrier spam
labels, consumer reports) are tokenized and compared with caller IDs in
connected systems. One not in a connected system is an **unknown calling
system** and the top finding until the client connects it or confirms in
writing that it does not call on their behalf (`disclaimed_at`).

### 18.4 Statements and conflicts

Every self-reported answer is an officer-signed `attestation_statement`
(weight 0). When CiV observes a contradiction (dockets show more suits than
stated, zero STOP replies in a busy period, a policy dated years ago) it
writes an `attestation_conflict` with the evidence reference and the
treatment applied: `scored_as_not_done`, `higher_figure_used`,
`period_flagged` or `unknown_system`. Conflicts are shown to buyers as they
are.

---

## 19. Buyer views and attestation **[v3: new]**

Detail and rationale: [spec §9a](specs/01-engineering-spec.md).

### 19.1 Attestation `civ.attestation.v1`

Built monthly per client by `AttestationWorkflow`, hashed (`sha256`), prior
versions kept. Every field carries `value`, `source_grade` and `worst_case`.

| Block | Fields |
|---|---|
| Frequency drivers | Marketing contacts per month; prerecorded / AI share; SMS share; purchased-lead share; manual-import share and evidence found rate; vendors and share with signed indemnification; consent proof rate; opt-out median time and share not honored; contacts after opt-out; opted-out re-added; internal-list contacts; RND exposure (M35); reassigned check before calling (M11); unknown caller IDs; private-right-of-action states contacted; prior matters (stated vs dockets) |
| Records integrity | Evidence coverage, records completeness, reconciliation rows, fingerprints recorded, theoretical statutory exposure = contacts × 12 × (1 − consent proof) × $500–$1,500 |
| Insured states | Each signed statement with its conflicts; statements never raise any value |

### 19.2 Loss model v0

```
P(suit in 12 months): base rate by marketing-volume band → odds → × each factor that applies → back to P
severity = (1 − class share) × individual-suit cost + class share × (class defense + class settlement for the band)
expected annual loss = P(suit) × severity
```

Factors and base rates start from the spec's values and are replaced by the
base-rate study and pilot claims data. Unverified inputs use their worst-case
values, so a company that shares nothing is priced as a high risk. Every
parameter is editable by the underwriter and versioned in `client_parameter`
with `buyer_org_id`. Labeled **uncalibrated** on every page and export.
Ownership is open (D28).

### 19.3 Underwriting export API

`GET /v1/insureds/{client_id}/attestation?as_of=YYYY-MM` returns the
`civ.attestation.v1` JSON, its `sha256`, and an evidence block (coverage,
completeness, conflicts, unknown caller IDs, worst-case fields). Bearer token
scoped to one `buyer_org`, rotated every 90 days, revocable by the client;
every call logged in the insured's `access_log`. A revoked `buyer_link` stops
the next call (Gate 5 test). Webhook on a score change of 5 points or more,
or a new open matter. Exports carry decision + hash, never decision note text.
