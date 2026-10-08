# Rulebook parameters

**Version:** 3.0 · **Date:** 2026-10-07 · **Supersedes:** v1.1
**Changes from v1.0 are marked [v1.1]; changes from v1.1 are marked [v3]**
(see [CHANGELOG-v3.md](CHANGELOG-v3.md)).

**The one parameter registry for the whole system,** including the Lead
Inspector. Code never hard-codes these values. Legal settings are stored in
`rule_value` with `effective_from` / `effective_to`, and each contact is
judged by the value in force on its date. Per-client settings live in
`client_parameter`, layered over the rulebook.

## 1. Status, ownership and approval

**Status:** *Set* = decided; *Proposed* = starting value from the September
2026 review, owner to confirm; *TBD* = no approved value yet.

**[v1.1] What TBD means.** A TBD key blocks *client-visible* output, not
engineering. Every TBD key carries a provisional value (and where the law is
contested, `strict` / `lenient` variants) so code can be built and tested.
See section 2.

**[v3] What status does at run time.** A checkpoint (or metric) that depends
on a **TBD** value returns `not_run` with reason `RULE_PENDING`; it never runs
on a placeholder in a scored or client-visible run. A **Proposed** value runs
and marks the result *provisional*. The **confirmed-rules score**
(`SCORE_CONFIRMED`) uses only **Set** values; domains that depend on a
Proposed or TBD value drop out of it as "rule pending". Provisional values and
strict / lenient variants of TBD keys stay for `draft` rulebooks (tests) and
the internal rulebook impact dashboard only.

**Owner:** Counsel, Product or Engineering. **[v1.1]** Every key also carries
`affects_status` (true if changing it can change a contact's consent status,
a checkpoint status or a Lead Inspector result). A key with
`affects_status = true` must be owned by Counsel *or* approved by the counsel
role before it may appear in an `approved` rulebook version. This moved
several v1.0 "Product" keys under counsel approval; they are marked
**[counsel-approved]** below.

**How changes work:** a change is a new rulebook version, approved by the
owner, with an effective date; old versions stay so past results reproduce.

## 2. Rulebook versions **[v1.1]**

| Status | Loads? | Runs? | Output visibility | May contain TBD? | Counsel approval of `affects_status` keys? |
|---|---|---|---|---|---|
| `draft` | yes | tests only | none | yes | no |
| `provisional` | yes | yes | `internal` — watermarked "PROVISIONAL — not for client"; hidden from client roles | yes (with provisional values / variants) | no |
| `approved` | yes | yes | `client` | **no** (loader refuses) | **required** (loader refuses otherwise) |

**Variants.** A key may carry `variants = {strict: v1, lenient: v2}`. A
provisional nightly run executes both variants and stores both
`consent_evaluation` rows; the rulebook impact dashboard shows, per key, how
many contacts change status. Counsel decides with numbers in hand.
**[v3]** Variant results are internal only: in any scored run a checkpoint
that depends on a TBD key is `not_run` / `RULE_PENDING` (section 1).

**Loader refusals:** missing required key; `vs_rate_weights` not summing to 1;
`dedupe_window_seconds < clock_skew_seconds`; TBD key in an approved version;
unapproved `affects_status` key in an approved version.

## 3. General and time

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `count_unanswered_calls` | Unanswered call attempts count as contacts | true | Counsel | Proposed (B9) | yes |
| `count_undelivered_sms` | Texts the carrier rejected count as contacts | false | Counsel | Proposed (B9) | yes |
| `metric_window_days` | Default rolling metric window | 30 | Product | Set | no |
| `lookback_years` | Lawsuit lookback | 4 | Counsel | Proposed | no |
| `location_conflict_rule` | Address and number time zones disagree | `strictest` (check both, stricter counts) | Counsel | Proposed (B9) | yes |
| **[v1.1]** `location_uncertain_treatment` | What to do with low-confidence locations | `report_as_possible` (check against area-code zone; report as "possible", never dropped) | Counsel | Proposed (B9) | yes |
| `location_uncertain_levels` | Confidence levels reported as "location uncertain" | low | Counsel | Proposed (B9) | yes |
| `clock_skew_seconds` | Tolerance for unlinked timestamps | 120 | Engineering | Set | yes **[counsel-approved]** |
| `dedupe_window_seconds` | Cross-system dedupe window, never below clock skew | 120 | Engineering | Set | no |
| `source_freshness_hours` | Source fresh if a change or heartbeat arrived within this | **[D35]** 2 (was 48) | Engineering | Set | no |
| **[D35]** `catchup_interval_minutes` | How often the catch-up sweep asks each tool for changes since its cursor | 60 | Engineering | Set | no |
| **[D35]** `poll_interval_minutes` | Polling interval for tools with no change notifications | 5 | Engineering | Set | no |
| **[D35]** `full_sweep_interval_days` | How often a full listing looks for deleted or silently changed records | 7 | Engineering | Set | no |
| **[D35]** `score_refresh_minutes` | How often scores and metrics are recomputed from live results | 60 | Product | Set | no |
| **[D35]** `urgent_alert_max_minutes` | Longest delay from a change to an urgent alert (contact after opt-out, opted-out re-added, unknown caller ID) | 15 | Product | Set | no |
| **[D35]** `live_gap_alert_share` | Daily share of changes found by catch-up instead of the live feed that raises a connector-reliability alert | 1% | Engineering | Set | no |
| `ai_min_confidence` | Minimum AI confidence per item | 0.85 | Engineering | Set | yes **[counsel-approved]** |
| `provider_retry_hours` | Retry window during provider outages | 24 | Engineering | Set | no |
| **[v1.1]** `expected_sources` | Per client: the sources a full score needs (denominator for "provisional") | set at onboarding | Product | Set | no |
| **[v1.1]** `business_day_calendar` | How business days are counted | Mon–Fri except US federal holidays, in the recipient time zone | Counsel | Proposed | yes |
| **[v1.1]** `business_day_tz_fallback` | Time zone for business-day counting when recipient location is uncertain | recipient ZIP tz → area-code tz → `America/New_York` (earliest deadline) | Counsel | Proposed | yes |

## 4. Consent

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `written_consent_types` | Proof types that count as written consent | web_cert, signed_form, IVR or keypress with required disclosures | Counsel | Proposed (B1) | yes |
| **[v1.1]** `signed_written_consent_types` | Proof types that satisfy the DNC "signed written agreement" exemption | web_cert (with e-signature elements), signed_form | Counsel | Proposed (B3) | yes |
| **[v1.1]** `prior_express_evidence_types` | Records accepted as prior express (non-written) consent for informational robocalls | CRM purchase or intake record where the customer supplied the number, with source and timestamp (tier 3). A bare CRM consent flag is never enough | Counsel | TBD (A19); provisional as stated | yes |
| `autodialed_modes` | Dialer modes treated as autodialed | — | Counsel | TBD (A12, A17). Provisional variants: strict = every mode except manual; lenient = none (only prerecorded/AI counts) | yes |
| `sms_treated_as_autodialed` | Marketing texts treated as autodialed | true | Counsel | Proposed (A17). Variants: strict = true; lenient = false | yes |
| **[v1.1]** `state_consent_rule` (table) | Per state: channels, contact types, autodialer definition, consent type required, PRA, effective dates | seeded FL, OK, MD | Counsel | TBD (A18) | yes |
| `ebr_purchase_months` / `ebr_inquiry_months` | Existing-customer relationship lapse | 18 / 3 | Counsel | Proposed (A9) | yes |
| `ebr_allowed_contact_types` | What a relationship can cover. **[v3]** Also the only contacts the `EBR_ONLY` label covers (proof is a purchase or inquiry within its window); never autodialed or prerecorded calls to cell phones | live, manually dialed calls | Counsel | Proposed (A9) | yes |
| `consent_checklist` | Items, required or optional, and each item's effect | — | Counsel | TBD (A10). Provisional: the `CC_*` table in the Lead Inspector doc with its stated effects | yes |
| **[v1.1]** `seller_absent_effect` | Status when no seller name is found in the consent block. **[v3]** Applies only when `seller_named_required` = true | — | Counsel | TBD (B7). Variants: strict = NO_PROOF (`NP_SELLER_ABSENT`); lenient = WEAK (`WK_SELLER_NOT_FOUND`) | yes |
| **[v1.1]** `seller_match_threshold` | Token similarity for the rule-based brand / DBA match | 0.92 (Jaro-Winkler) | Engineering | Set | yes **[counsel-approved]** |
| `max_numbers_per_cert` | Numbers one certificate may cover | 1 | Product | Set (B8) | yes **[counsel-approved]** |
| `cert_unretained_expiry_hours` / `cert_confirmed_expiry_hours` | Vendor deletion windows | 72 / 2,160 | Engineering | Set (vendor-documented) | yes |
| `cert_expiry_warning_days` | WEAK when expiring within this of `evaluation_as_of` | 30 | Product | Set | yes **[counsel-approved]** |
| `page_capture_interval_hours` | Re-capture interval for consent pages | 24 | Engineering | Set | no |
| `page_normalize_rules` | Page parts ignored when hashing | timestamps, session IDs, ads | Engineering | Set | no |
| `page_snapshot_max_gap_days` | Max gap for comparing CiV capture with certificate snapshot | 1 | Product | Proposed | yes **[counsel-approved]** |
| **[v1.1]** `page_similarity_method` | How `ca_page_match_threshold` is measured | `consent_block_text` (normalized text similarity of the consent block; whole-page visual hash reported for information) | Engineering | Set | yes **[counsel-approved]** |
| `ca_page_match_threshold` | Minimum page similarity | 0.90 | Product | Set | yes **[counsel-approved]** |
| `cc_viewports` | Viewport sizes pages are rendered at **[v3 wording]** | 390 × 844, 1440 × 900 | Product | Set | no |
| `cc_min_contrast_ratio` | Minimum text contrast | 4.5 : 1 (3 : 1 large text) | Product | Set (B8) | yes **[counsel-approved]** |
| `cc_min_font_px` | Minimum consent text size | — | Counsel | TBD (A15a); provisional 10 px | yes |
| `cc_max_sellers_named` | Most sellers one consent may name (CiV policy) | — | Counsel | TBD (A15a); provisional 5 | yes |
| `cc_consent_above_button` | Consent text must sit above the button | true | Counsel | Proposed | yes |
| **[v3]** `seller_named_required` | The consent must name this seller. When false, `CF_SELLER_MISMATCH` does not run and seller findings are information only. The FCC one-to-one rule was vacated by the Eleventh Circuit in January 2025 | false | Counsel | Proposed (B10) | yes |
| **[v3]** `written_consent_required_by_forum` (table) | Per `litigation_forum`: whether marketing robocalls need **written** consent or prior express consent is enough (Fifth Circuit, February 2026, *Bradford v. Sovereign Pest Control*) | true in every forum (the v1.1 behavior); the Fifth Circuit row is for counsel to set | Counsel | Proposed (B11) | yes |
| **[v3]** `inbound_contact_scope` | Which outbound contacts an inbound call or text from the consumer covers (subject, days). Used by the `inbound_call` / `inbound_sms` evidence types | — | Counsel | TBD (B12); evidence that depends on it is `RULE_PENDING` | yes |

## 5. Stopping

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `optout_keywords` | Replies treated as automatic opt-outs | STOP, QUIT, END, REVOKE, OPT OUT, OPTOUT, CANCEL, UNSUBSCRIBE | Counsel | Proposed (A3) | yes |
| `optout_deadline_business_days` | Deadline to honor an opt-out | 10 | Counsel | Proposed (A1) | yes |
| **[v1.1]** `optout_grace_business_days` (replaces `optout_grace_hours`) | Delay before a later contact counts, in business days | — | Counsel | TBD (A4). Variants: strict = 0; lenient = 10 | yes |
| `confirmation_window_minutes` | One confirmation text allowed, no marketing | 5 | Counsel | Proposed (A2) | yes |
| `optout_scope_rules` | Which messages an opt-out stops, by channel and message category, effective-dated | Before 2027-01-31: per counsel; from 2027-01-31: revoke-all as finalized | Counsel | TBD (A5). Provisional: any opt-out stops everything | yes |
| `optout_observation_days` | How long a test opt-out is watched before NEVER | 30 | Product | Set | no |
| `min_tests_per_cell` | Tests before a matrix cell or M09 result is a finding | 3 | Product | Set | no |
| `retest_interval_days` | Revocation re-test interval for retainer clients | 30 | Product | Set | no |
| **[v1.1]** `revocation_window_days` | Period for M08 / M09 (tests completed in the last N days) | 90 | Product | Set | no |
| **[v3]** `test_rotation_days` | Test numbers rotate this often; never shown in any portal role. The Annex C signer authorizes rotation | 30 | Product | Proposed (C11) | no |
| **[v3]** `seed_contact_window_days` | A seeded test with no contact within this many days is "not reached", never "passed"; its campaign counts as "untested" in test coverage | 14 | Product | Proposed | no |

## 6. Who you contact

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `rnd_check_rule` | What counts as a proper reassigned-number check | After the latest monthly update, about the consent date, answer No | Counsel | Proposed (A13) | yes |
| `rnd_required_after_days` | Check required for robocalls this long after consent | — | Counsel | **[v1.1]** TBD (A20; v1.0's 30 had no stated source); provisional 30 | yes |
| **[v1.1]** `rnd_query_budget_per_number` | Paid CiV RND queries per number needing an epoch search | 12 | Product | Set | no |
| **[v1.1]** `rnd_update_calendar` | Somos monthly update dates (reference table) | maintained by Engineering | Engineering | Set | no |
| **[v3]** `rnd_sample_size` | Contacted numbers CiV samples per period for M35 (reassigned exposure). CiV RND queries, after contact only, never before a dial (D20) | 400 | Product | Proposed | no |
| **[v3]** `dnc_check_max_age_days` (renamed) | Oldest client DNC check record allowed at contact. Feeds M13, which is Info only | 31 | Counsel | Proposed (A14) | yes |
| `nanp_non_us_area_codes` | +1 area codes outside the US | reference data | Engineering | Set | no |

## 7. How you contact

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `calling_hours` | Federal and state windows by weekday, with each state's scope, effective-dated | — | Counsel | TBD (A6). Provisional: federal 08:00–21:00; FL, OK 08:00–20:00; MD, CT ends 20:00; CT starts 09:00; TX Sunday from 12:00 — all to verify | yes |
| `quiet_hours_apply_to_sms` | Calling hours apply to texts, per forum | — | Counsel | TBD (B4). Variants: strict = true; lenient = false | yes |
| `frequency_limits` | Per state: maximum, window, counting unit, scope | — | Counsel | TBD (A7). Provisional: FL, OK, MD 3 per 24 h per person per subject, solicitations only | yes |
| `frequency_per_campaign` | Count per campaign instead of per client | false | Counsel | Proposed | yes |
| `state_holiday_restrictions` | Restricted dates by state | — | Counsel | TBD (A8) | yes |
| `required_disclosures` | Words calls and texts must contain | — | Counsel | TBD (A11) | yes |
| `abandoned_call_max_rate` | Abandoned-call limit per campaign per period | 3 % | Counsel | Proposed (A11) | yes |
| **[v1.1]** `abandon_connect_seconds` | Seconds after greeting within which a live agent must connect | 2 | Counsel | Proposed (A11) | yes |
| **[v1.1]** `abandon_period_days` | Period over which the abandoned-call rate is measured | 30 | Counsel | Proposed (A11) | no |
| `disclosure_sample_size` | Recorded calls reviewed per campaign per period | 50 | Product | Set | no |

## 8. Records

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `record_retention_years` | Retention required for call, consent, EBR and DNC records | 5 | Counsel | Proposed (A16) | no |
| **[v1.1]** `civ_default_retention_years` | CiV artifact retention when the client contract is silent. **[v3]** CiV keeps no client records; this now applies to CiV's fingerprints and analyzed data (CHANGELOG-v3 §2) | max(`record_retention_years`, `lookback_years`) + 1 = 6 | Counsel | Proposed (C7) | no |
| **[v1.1]** `legal_hold` | Per client (or per artifact): blocks every deletion including key destruction. **[v3]** A hold is also an instruction to the client to retain the named source records, with an optional encrypted snapshot to a bucket the client owns; release needs a Legal-role user and a reason | false | Counsel | Set (C7) | no |
| `vendor_required_clauses` | Clauses each vendor contract must contain | — | Counsel | TBD (A15b) | no |
| `vendor_active_days` | Vendor active if it sent a lead within | 90 | Product | Set | no |
| `require_sub_id` | Affiliate networks must supply a sub-ID | true | Product | Set | no |
| `acquired_list_sample_size` / `acquired_list_max_failures` | Acquired list sampling | 100 / 2 | Product | Set | no |
| `training_valid_days` | Training record stays current | 365 | Product | Set | no |
| **[v1.1]** `default_dispute_window_days` | Dispute window when a vendor has no contract on file | 0 (no dispute candidates; shown as "no contract on file") | Product | Set | no |

## 9. Scoring and gates

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `warn_credit` | Credit for a warn result | 0.5 | Product | Proposed (D8) | no |
| `domain_weights` | Weights of domains in the overall score | equal | Product | Proposed (D8) | no |
| `grade_bands` | Cut-offs for A, B, C, D | 90 / 80 / 70 / 60 | Product | Set | no |
| `hard_cap_share` / `hard_cap_grade` | Cap trigger and capped grade | — / C | Product | TBD (D8); provisional 5 % | no |
| **[v3]** `direct_violation_grade` | Second cap: any contact after an internal-list entry (IDN) or after an in-scope opt-out (REV) holds **that domain's** grade at or below this | D | Product | Proposed (D23) | no |
| **[v3]** `coverage_cap_floor` / `coverage_cap_grade` | Third cap: evidence coverage (M36) below the floor holds the **overall** grade at or below this grade | 0.60 / C | Product | Proposed (D23) | no |
| `provisional_completeness` | Below this share of `expected_sources`, a score is provisional | 80 % | Product | Set | no |
| **[v1.1]** `checkpoint_aggregation_default` | Default {unit, pass_max_share, warn_max_share} where a checkpoint has none | {contact, 0 %, 1 %} | Product | Proposed (D4) | yes **[counsel-approved]** |
| `gate_sample_size` / `gate_min_per_reason_code` | Gate 0 / Gate 2 hand-check sample | 200 / 5 | Product | Set | no |
| `ai_accuracy_min_items` / `ai_accuracy_pass_mark` | AI feature gate | 300 / 95 % | Product | Proposed (D9) | no |

**[v3]** Caps apply to the unrounded score in this order: hard cap, then the
`direct_violation_grade` cap, then the coverage cap. A grade held by a cap
shows "held" and names the cap.

## 10. Lead Inspector

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `li_min_form_seconds` / `li_hard_signal_form_seconds` | Fast fill / instant fill | 8 / 2 s | Product | Set | yes **[counsel-approved]** |
| `li_device_burst_count` / `li_device_burst_window_minutes` | Device burst, per client | 5 / 60 | Product | Set | yes **[counsel-approved]** |
| `li_line_status_max_age_days` | Line status used only this close to the lead date | 30 | Product | Set | yes **[counsel-approved]** |
| `li_suspect_line_types` | Line types that add points | non-fixed VoIP | Product | Set | yes **[counsel-approved]** |
| `li_name_match_threshold` | Minimum name similarity | 0.6 | Product | Set | yes **[counsel-approved]** |
| `li_min_domain_age_days` | New-website signal | 90 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_signal_points` | Points per signal (moved here from the Lead Inspector tab) | fast_fill 25; pasted_fields 10; device_burst 25; location_mismatch 10; line_type 10; name_match 20; email 15; new_website 15 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_hard_signals` | Signals that set "High risk signals" alone | instant_fill, line_out_of_service, certificate_after_delivery | Product | Set | yes **[counsel-approved]** |
| `li_some_risk_threshold` / `li_high_risk_threshold` | Result thresholds (inclusive) | 40 / 70 | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_hypothetical_contact` | The contact Check 2 evaluates against | `strictest` — an autodialed marketing contact on every channel the lead covers | Product | Set | yes **[counsel-approved]** |
| **[v1.1]** `li_carrier_lookup_enabled` | Per client: run carrier lookups (pass-through cost) | false until the client opts in | Product | Set | no |
| `vs_window_days` | Vendor score period | 90 | Product | Set | no |
| `vs_rate_weights` | Rate weights; must sum to 1 | 0.35 / 0.30 / 0.15 / 0.10 / 0.05 / 0.05 | Product | Set | no |
| `vs_some_weight` | Weight of a "Some" lead against "High" | 0.5 | Product | Set | no |
| `vs_max_delivery_hours` | Late delivery threshold | 24 | Product | Set | no |
| `vs_stop_window_days` | Stop and complaint window | 30 | Product | Set | no |
| `vs_grade_bands` / `vs_min_leads_for_score` / `vs_alert_drop_points` | Grades, minimum leads, alert drop | 90/80/70/60, 100, 10 | Product | Set | no |
| `lg_response_timeout_ms` / `lg_webhook_retry_count` | Live mode (post-pilot) | 3,000 / 5 | Engineering | Set | no |

**[v3]** Fill time and paste (`li_min_form_seconds`, `li_hard_signal_form_seconds`,
the `pasted_fields` points) are lead-quality signals: they feed the lead result
and the vendor score, never a consent status.

## 11. Per-client settings (`client_parameter`)

| Key | Meaning | Set by |
|---|---|---|
| `engagement_start_date`, brands and DBAs, `litigation_forum` (state, federal circuit, district) | Client facts used by the engine | Client + Product at onboarding |
| Campaign category map | Marketing / informational / unknown per campaign | Client confirms at onboarding |
| `expected_sources` | Sources the client will connect | Client + Product |
| `optout_dispositions` | Dialer outcomes meaning "stop" | Client + Product |
| `optout_exclusive_methods` | Designated opt-out methods and whether disclosed | Client + Counsel |
| `retention_by_data_type` | Retention per data type | Client contract |
| `legal_hold` | Litigation hold | CiV counsel role on client's counsel's instruction |
| `complaint_resolution_target_days` | Target days to resolve complaints | Client |
| `vs_dispute_window_days` | Dispute window per vendor | Vendor contract (else `default_dispute_window_days`) |
| `li_carrier_lookup_enabled` | Opt in to carrier lookups | Client |
| **[v3]** `engagement_mode` (on `client`) | `direct` or `counsel_directed`. Default **`counsel_directed`** (counsel to confirm, D25 / C12) | Counsel + client at onboarding |
| **[v3]** Integration and API users | CRM and dialer users whose records are feeds, excluded before manual-import detection | Client + Engineering at onboarding |
| **[v3]** `import_gap_seconds`, `import_min_batch` (per-client overrides) | Adjusted after the client confirms five detected batches at onboarding, before the first scored run | Engineering, with the client's confirmation |
| **[v3]** Annex C campaigns and vendor forms | Marketing campaigns and vendor forms CiV may seed test leads through | Client (Annex C signer: owner or counsel) |

## 12. Removed or renamed in this version

- `optout_grace_hours` → `optout_grace_business_days` (the deadline is in business days).
- `client_list_max_age_days` (removed in v1.0, replaced by what is now `dnc_check_max_age_days`).
- Separate `optout_scope` (merged into `optout_scope_rules`).
- Per-setting copies in the Lead Inspector tab (points now live only here as `li_signal_points`).
- Hard-coded values removed from metric cards: 90 days (M08/M09) → `revocation_window_days`; 2 s and 30 days (M31) → `abandon_connect_seconds`, `abandon_period_days`.
- **[v3]** `dnc_scrub_max_age_days` → `dnc_check_max_age_days`; every other DNC key, table and label uses `dnc_check` (`client_list_entry.list_type` = `dnc_check`, `scrub_run` → `dnc_check_run`, M13 "DNC Check Record Check"). No key name uses "scrub" or "screen" (banned list, CHANGELOG-v3 §10).
- **[v3]** The counsel fix-step library is replaced by `response_library` (section 15).

## 13. Provenance and manual imports **[v3]**

See [01-engineering-spec.md](01-engineering-spec.md) §5a.

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `import_gap_seconds` | A gap longer than this between one user's created (or updated) records starts a new import batch | 120 | Engineering | Proposed (D21; calibrated on the pilot and per client) | no |
| `import_min_batch` | Batch size at or above which a batch is `bulk_import` (n = 1 → `hand_entered`; otherwise `small_batch`) | 20 | Engineering | Proposed (D21) | no |
| `proof_request_sample` | Numbers with no evidence sampled per batch for a proof request | 50; 100 when the batch has more than 10,000 numbers | Product | Proposed | no |

## 14. Data integrity **[v3]**

See [01-engineering-spec.md](01-engineering-spec.md) §5b.

**Worst-case defaults.** Each input to a score has a `worst_case_value`. When
the input's source grade is S (insured states) or N (not supplied), the engine
uses this value and records `worst_case = true`. A statement never raises a
score. Product-owned, counsel-reviewed (D22, counsel item A21).

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `worst_case_value.consent_proof_rate` | Consent proof rate when unverified | 60 % (the loss model's worst band) | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.purchased_lead_share` | Purchased-lead share | 60 % | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.prerecorded_ai_share` | Prerecorded / AI voice share | 20 % | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.optouts_not_honored_share` | Opt-outs not honored by the deadline | 10 % | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.internal_list_contacts` | Internal-list contacts (M12) | 1 (any) | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.litigator_contacts` | Litigator-list contacts (M14) | 1 (any) | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.reassigned_check` | Reassigned check before calling (M11) | "not checked" | Product | Proposed (D22) | yes **[counsel-approved]** |
| `worst_case_value.prior_matters` | Prior TCPA matters | max(stated, court docket count) | Product | Proposed (D22) | yes **[counsel-approved]** |

**Reconciliation and completeness.**

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `completeness_floor` | Reconciliation ratio (records ÷ independent total) below which the `calls`, `texts`, `vendor_leads` and `days_present` measures flag the period as "incomplete data"; the missing share takes worst-case values | 0.9 | Product | Proposed (D23) | no |
| `calls_per_agent_day` (range) | Low and high calls per seat per working day for the `seat_capacity` check; outbound calls outside seats × range × working days flag the period | — | Product | TBD (no value in v3); the `seat_capacity` row is `RULE_PENDING` until set | no |
| `stop_check_min_texts` | A period with more outbound texts than this and zero inbound STOP replies is flagged | 1,000 | Product | Proposed | no |

## 15. Response library **[v3]**

The fix-step library is replaced by **`response_library`**: counsel-owned
rows (response_id, domain_code, text, status Set / Proposed / TBD,
valid_from). CiV drafts; counsel owns. Only rows with status **Set** are shown
to clients, as "common responses" beside a finding. Proposed and TBD rows are
never shown. Each finding then takes a recorded client decision (accepted /
declined / alternative) with a hashed note; see
[01-engineering-spec.md](01-engineering-spec.md) (scoring and outputs) and
counsel items C17–C18 in [05-counsel-brief.md](05-counsel-brief.md).

## 16. AI conversation review **[D37, owner decision 2026-10-08]**

| Key | Meaning | Default | Owner | Status | affects_status |
|---|---|---|---|---|---|
| `conv_review_enabled_channels` | Channels reviewed | call, text | Product | Set | no |
| `conv_review_min_confidence` | Below this the result is `unclear` and no opt-out is marked | 0.90 | Product | Proposed (counsel C21) | yes |
| `conv_review_accuracy_pass_mark` | Accuracy gate, measured separately for calls and texts | 95% | Product | Proposed (counsel C21) | yes |
| `conv_review_thread_days` | How far back a text thread is read for context | 30 | Product | Set | yes |
| `conv_review_text_quiet_minutes` | A text conversation counts as ended after this long with no new message | 10 | Engineering | Set | no |
| `conv_review_partial_requests` | Whether a partial request (time window, channel) limits contact | not applied until counsel sets scope rules | Counsel | TBD (C21) | yes |

AI-found opt-outs count without a person confirming each (owner decision
D37). Opt-out keywords (`optout_keywords`) still apply to texts as before;
conversation review adds meaning in context on top of them.
