# Counsel brief

**Version:** 3.0 · **Date:** 2026-10-07 · **Supersedes:** v1.1
**Changes from v1.0 are marked [v1.1]; changes from v1.1 are marked [v3]**
(see [CHANGELOG-v3.md](CHANGELOG-v3.md)). v3 asks counsel to confirm every
item it marks (C) before launch; they are added below as A21, B10–B12 and
C11–C20, with the decision numbers (D18–D34) from CHANGELOG-v3 §12.

Questions only a lawyer can settle before the system can be built and sold.
Each has the starting point proposed in the September 29–30, 2026 reviews
(finding IDs in brackets). **These starting points are not legal advice from
CiV or from any AI reviewer**; several rely on 2025–2026 developments that
counsel should verify against the sources before they go into the rulebook.

**[v1.1] How to use this brief.** Every item maps to one or more rulebook
keys. Until counsel sets an item, engineering builds against the provisional
value (and, where marked, runs *strict* and *lenient* variants); outputs stay
internal. The rulebook impact dashboard shows, per item, how many pilot
contacts change status between variants, so counsel can decide with numbers.
**[v3]** Under v3, a checkpoint that depends on a **TBD** value returns
`not_run` / `RULE_PENDING` in scored output; a **Proposed** value runs and the
result is marked provisional; the confirmed-rules score uses **Set** values
only. Setting an item therefore turns results on.

## A. Settings the system cannot run without (client-visible)

| # | Question | Starting point proposed | Rulebook key(s) | Blocks |
|---|---|---|---|---|
| A1 | Opt-out deadline | 10 business days, in force since April 11, 2025; also for company-specific DNC requests (F-019) | `optout_deadline_business_days` | Gate 2 |
| A2 | Confirmation text after an opt-out | One text within 5 minutes, no marketing content (F-019) | `confirmation_window_minutes` | Gate 2 |
| A3 | Words that count as an automatic opt-out | The FCC's seven: STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, UNSUBSCRIBE (plus OPTOUT); other wording goes to review as a rebuttable revocation (F-018) | `optout_keywords` | Gate 2 |
| A4 | Opt-out grace period used for M10 and the engine | **[v1.1]** In business days, tied to A1 or a shorter internal measure. Variants: strict 0 / lenient 10 | `optout_grace_business_days` | Gate 2 |
| A5 | Opt-out scope before and after January 31, 2027, and after the FCC's September 30, 2026 order | "Any opt-out stops everything" is a cautious policy until revoke-all takes effect; confirm both periods once the final order is published (F-021) | `optout_scope_rules` | Gate 2 |
| A6 | Calling hours | Federal 8am–9pm for telephone solicitations; state table by weekday with effective dates and each state's scope. **[v1.1] Starting points to verify:** Texas Sunday noon start; Maryland 8pm end; **Florida and Oklahoma 8pm end; Connecticut 9am–8pm**; Virginia text coverage (F-014, F-016) | `calling_hours` | Gate 4 |
| A7 | Frequency limits | Florida, Oklahoma, Maryland: 3 per 24 hours per person on the same subject, solicitations only; confirm counting rules (F-015) | `frequency_limits`, `frequency_per_campaign` | Gate 4 |
| A8 | State holiday restrictions | State table with sources | `state_holiday_restrictions` | Gate 4 |
| A9 | Existing-customer relationship | 18 months after purchase, 3 months after inquiry; never covers prerecorded telemarketing; never satisfies `dnc_listed` unless active | `ebr_purchase_months`, `ebr_inquiry_months`, `ebr_allowed_contact_types` | Gate 2 |
| A10 | Consent wording checklist, including "consent is not a condition of purchase" and "the number being consented shown" (F-024) | Counsel drafts; required vs optional per item; each item's effect | `consent_checklist` | Gate 2 |
| A11 | Required call and message disclosures, abandoned-call limit (3 % per campaign per 30 days, 2-second message) and prerecorded opt-out mechanism (F-024) | Counsel drafts | `required_disclosures`, `abandoned_call_max_rate`, `abandon_connect_seconds`, `abandon_period_days` | Gate 4 |
| A12 | Autodialed modes | Which dialer modes count as autodialed under federal law after *Facebook v. Duguid* (2021). **[v1.1]** Variants: strict = every mode except manual; lenient = none (only prerecorded / AI voice) | `autodialed_modes` | Gate 2 |
| A13 | Reassigned-number check test | Queried after the latest monthly database update, against the consent date, answer "No" (F-022) | `rnd_check_rule` | Gate 4 |
| A14 | **[v3]** DNC check age (renamed) | 31 days (confirmed in review). M13 is now Info only, never in the score | `dnc_check_max_age_days` | Gate 4 |
| **[v1.1]** A15a | Minimum consent font size; maximum sellers named (CiV policy since the one-to-one rule was vacated) (F-025) | Counsel sets; provisional 10 px / 5 | `cc_min_font_px`, `cc_max_sellers_named` | **Gate 2** (split from A15) |
| **[v1.1]** A15b | Vendor contract clauses | Counsel drafts | `vendor_required_clauses` | Gate 4 (split from A15) |
| A16 | Record retention | 5 years for call, consent, EBR and DNC records under the 2024 TSR amendment, separate from the 4-year lookback (F-023) | `record_retention_years`, `lookback_years` | Gate 4 |
| **[v1.1]** A17 | Autodialer treatment of texts and dialer modes per forum | After *Duguid*, most federal courts treat predictive / power dialers as not an ATDS; several states define autodialers more broadly. Set `sms_treated_as_autodialed` and any per-forum overrides. Variants: strict true / lenient false | `sms_treated_as_autodialed`, `autodialed_modes` (jurisdiction rows) | Gate 2 |
| **[v1.1]** A18 | State consent matrix | Per state: channels, contact types, autodialer definition, consent type required (any / written / signed written), private right of action, effective dates. Seed FL, OK, MD; counsel completes | `state_consent_rule` table | Gate 2 |
| **[v1.1]** A19 | Evidence standard for informational prior express consent | Provisional: a CRM purchase or intake record where the customer supplied the number, with source and timestamp. A bare CRM consent flag is never enough | `prior_express_evidence_types` | Gate 2 |
| **[v1.1]** A20 | Source for the "check required after N days" rule for reassigned numbers | v1.0 proposed 30 days with no cited source; counsel to state the basis or set the value as CiV policy | `rnd_required_after_days` | Gate 4 |
| **[v3]** A21 | Worst-case default values (D22). When an input to a score is unverified (source grade S or N), the engine uses its worst-case value; a client statement never raises a score | Consent proof rate 60 %; purchased-lead share 60 %; prerecorded / AI share 20 %; opt-outs not honored 10 %; internal-list and litigator contacts 1 (any); reassigned check "not checked"; prior matters max(stated, docket count). Product owns; counsel reviews the values and how they are labelled to clients and buyers ("worst case — {source} not supplied") | `worst_case_value.*` | Gate 4 |

## B. Legal questions about what counts

| # | Question | Starting point proposed | Rulebook key(s) | Blocks |
|---|---|---|---|---|
| B1 | Does IVR or keypress consent count as written consent? | Yes where the required disclosures were played, per the 2012 FCC order and E-SIGN; also check Florida's 2023 changes (F-005) | `written_consent_types` | Gate 2 |
| B2 | Informational robocalls | Need only prior express consent, not written; some informational prerecorded calls to landlines need none (F-003) | basis logic; `prior_express_evidence_types` | Gate 2 |
| B3 | Legal basis vs CiV policy | Confirm the bases in `consent_required_basis` (**[v1.1]** now six: `robocall_marketing`, `robocall_informational`, `dnc_listed`, `dnc_unknown`, `state_law`, `civ_policy`) and how each is reported; confirm the DNC exemption needs a **signed written** agreement (F-004) | basis logic; `signed_written_consent_types` | Gate 2 |
| B4 | Do calling-hour rules apply to texts? | Courts split after the 2025 *McLaughlin* decision; counsel sets the default per forum. Variants: strict true / lenient false (F-016) | `quiet_hours_apply_to_sms` | Gate 4 |
| B5 | Are texts "calls" for DNC claims? | Reported circuit split after a July 2026 Seventh Circuit decision; forum setting per client (F-017) | `litigation_forum`, M13 label | Gate 4 |
| B6 | Handling the client's **[v3]** DNC check records, including the client-SAN route and registry use restrictions (F-044) | Counsel defines what CiV may receive. **[v3]** CiV does not sell, maintain or query DNC or litigator lists; client records are read when connected, reported Info only, and not kept | intake rules | Gate 4 |
| **[v1.1]** B7 | Consent that names no seller at all | Is it NO_PROOF (consent must authorize *this* seller) or WEAK (wording gap)? Variants: strict NO_PROOF / lenient WEAK | `seller_absent_effect` | Gate 2 |
| **[v1.1]** B8 | Font size, contrast and one-number-per-certificate | Are these legal requirements (then they may move a status) or CiV policy (then they are warnings)? | `cc_min_contrast_ratio`, `cc_min_font_px`, `max_numbers_per_cert` (`affects_status`) | Gate 2 |
| **[v1.1]** B9 | Shared definitions (moved from decision D12) | `count_unanswered_calls` true; `count_undelivered_sms` false; `location_conflict_rule` strictest; `location_uncertain_treatment` report_as_possible; `location_uncertain_levels` low | those keys | Gate 4 |
| **[v3]** B10 | Must the consent name this seller? | Default **false**: the FCC one-to-one rule was vacated by the Eleventh Circuit in January 2025. While false, `CF_SELLER_MISMATCH` does not run and B7 does not apply | `seller_named_required` | Gate 2 |
| **[v3]** B11 | Is written consent required, per forum? | The Fifth Circuit held in February 2026 (*Bradford v. Sovereign Pest Control*) that the statute requires prior express consent, not written. Proposed: keep written consent required in every forum until counsel sets the Fifth Circuit row (and any others) | `written_consent_required_by_forum` (keyed by `litigation_forum`) | Gate 2 |
| **[v3]** B12 | Which outbound contacts an inbound call or text from the consumer covers (subject, days) | Counsel sets. TBD: `inbound_call` and `inbound_sms` evidence for manual numbers is `RULE_PENDING` until set | `inbound_contact_scope` | Gate 2 |

## C. CiV's own exposure

| # | Question | Starting point proposed | Blocks |
|---|---|---|---|
| C1 | Evidence and privilege claims in main spec §10 | Claim only what holds: FRE 902(14) for copy integrity, the client's custodian for accuracy; counsel-directed mode improves but does not guarantee protection (F-008). **[v3]** CiV no longer holds copies; see C13 | Launch |
| C2 | Alerts create notice that can support willful damages | In counsel-directed mode route alerts and findings to counsel only; tell buyers in writing; approve alert design (F-009) | Launch |
| C3 | Lead Inspector and the Fair Credit Reporting Act | Review exposure; contract bars eligibility use; written use-case approval from the carrier-data provider (F-011) | Phase 4 |
| C4 | Test numbers | Honest carrier registration; real carrier mobile lines; rotation disclosed in Annex C (F-012). **[v3]** Rotation every `test_rotation_days` (30); see C11 | Phase 3 |
| C5 | Recording consent for spoken tests in all-party states; whether Annex C binds the client's vendors and staff (F-083) | Until decided, play a recording notice at the start of every spoken test | Phase 3 |
| C6 | Report wording, evidence file format and fix-step library | Review before first client. **[v3]** The fix-step library is replaced by the common-response library (C17) and decision record (C18); the evidence file is C13 | Launch |
| **[v1.1]** C7 | Litigation hold, retention conflicts and subpoenas | Define: who may set `legal_hold`; what happens when a client's retention term conflicts with a hold; `civ_default_retention_years` when the contract is silent; the subpoena procedure (notify client unless forbidden; produce only what is required; no commentary); the SLA for single-artifact deletion by re-keying. **[v3]** CiV holds no client records: a hold is now (1) an instruction to the client to retain the named source records and (2) optionally a one-time encrypted snapshot to a bucket the client owns (CiV write-only; the client holds the keys). Release needs a Legal-role user and a reason. Confirm this meets a hold obligation | Launch |
| **[v1.1]** C8 | Unauthorized practice of law | Whether any feature (fix-step library, alerts, counsel-directed mode, evidence certification template) counts as legal advice in the states CiV sells into; required disclaimers. **[v3]** Apply the same review to common responses, the decision prompt, buyer attestations and the loss model | Launch |
| **[v1.1]** C9 | CiV's own data obligations | GLBA for insurance and financial-services clients; state privacy laws (CiV as service provider / processor); status of call recordings; DPA template; data-subject deletion requests against Object Lock. **[v3]** Object Lock for content is gone; recordings are processed in memory only. DPA wording on tokens is C15 | Launch |
| **[v1.1]** C10 | Capturing affiliate consent pages and seeding test leads | Whether headless capture of third-party public pages and seeding test identities through the client's public forms need any authorization beyond Annex C. **[v3]** Seeding now also runs through vendor forms; see C11 | Phase 2 / 3 |
| **[v3]** C11 | Annex C extension (D24) | Annex C also names the marketing campaigns and vendor forms CiV may seed through (at least one test per campaign; `seeded_via` client_form / vendor_form), states that test numbers rotate every 30 days, and that the numbers are never shown to operations staff. The Annex C signer (owner or counsel) authorizes rotation. Confirm whether the client can authorize seeding through a vendor's form, and whether vendors must be told | Phase 3 |
| **[v3]** C12 | Counsel-directed as the default engagement mode (D25) | `client.engagement_mode` defaults to `counsel_directed`. Confirm the default, the engagement letter wording, and what changes for a client that chooses `direct` | Launch |
| **[v3]** C13 | Store-nothing evidence: certification, evidence file and certification pack (D18) | The owner decided (2026-10-07) that CiV holds analyzed data only. Counsel to confirm: (a) **certification of copies** — under FRE 902(14) CiV can certify only that a file the client produces hashes to the value CiV recorded on that date; the copy comes from the client or the hold bucket; (b) **evidence file per phone epoch** = fingerprints, fetch times, re-fetch outcomes (Matches / Changed / No longer at source), the anchor proof and CiV's derived results; the client supplies the underlying records; (c) what the **certification pack** and the **evidence package for named numbers** contain; (d) **derived results are still discoverable** — metrics, findings and decision hashes are CiV's own records; counsel-directed mode may protect some of them, never the underlying facts; (e) **the record the client cannot produce** is an accepted risk: if a vendor purges history, CiV can prove the record existed but cannot fill the gap. The evidence file, certification pack and named-numbers package wait on this item | Phase 1 (scope); Phase 4 (packs) |
| **[v3]** C14 | HMAC key custody (D19) | Per-client key in CiV's KMS (pseudonymized; CiV can re-link a number during a job) or a client-held key (stronger, slower jobs). Confirm which, and whether key destruction at contract end (crypto-shredding, logged) satisfies deletion duties | Phase 1 |
| **[v3]** C15 | DPA wording on pseudonymized tokens | `phone_token` is pseudonymized personal data, not anonymized, while CiV holds the key. The data processing agreement must say so, and say that message bodies, recordings, certificate contents and agent names are processed in memory only | Launch |
| **[v3]** C16 | Buyer access wording and reliance letter (D26) | The consent wording a client signs to grant an insurer or acquirer a `buyer_link` (scope: attestation / integrity / export; revocable by either side), and a reliance letter per buyer: buyers may rely on CiV's method and observed data, not on the company's statements ("Insured states"). Related: CiV errors-and-omissions insurance (D27) before any insurer prices off CiV numbers | Phase 5 |
| **[v3]** C17 | Common-response library | Counsel owns `response_library`; CiV drafts. Only rows with status Set are shown, as "common responses" beside a finding (never "fix steps" or "you must"). Counsel to approve the first set and the review cycle | Phase 4 |
| **[v3]** C18 | Decision-record prompt wording | Each finding takes a client decision (accepted / declined / alternative), a note and a name. Proposed prompt: *"Reviewed with [role]; decided [action] because [reason]."* The note stays in the client tenant; CiV stores its SHA-256; insurer exports carry the decision and hash, never the note. Counsel to approve the prompt and confirm the note handling | Phase 4 |
| **[v3]** C19 | Position lookup and CiV's own page captures (D32) | (a) May CiV keep its own captures of **public** consent pages (CiV-made, source grade A, not client records)? (b) During a position lookup CiV re-fetches each source record, hashes it and compares with the stored fingerprint. May the re-fetched record be **displayed in the portal** and then discarded? | Phase 2 **Owner position 2026-10-08:** (a) keep CiV's own captures. |
| **[v3]** C20 | How a number appears in lists when only tokens are kept (D31) | As typed by the user, or a masked label such as "(480) •••-0923" (area code + last 4 digits). Confirm whether a masked label is personal data and how it is treated in the DPA | Phase 1 **Owner position 2026-10-08:** masked label (area code + last 4); fallback labels with no digits. |
| **[D37]** C21 | AI conversation review deciding opt-outs without a person (2026-10-08) | The owner decided that CiV's AI reads or listens to each whole conversation and decides opt-outs itself, after an accuracy gate (95%, calls and texts separately) and a confidence floor (0.90). Confirm this is acceptable for findings and for M10 and M38; confirm the wording "AI result"; set the scope rules for partial requests (time window, channel). | Owner + counsel | Phase 3 | Open |
| **[D37]** C22 | Processing call recordings and message text (2026-10-08) | CiV transcribes recordings and reads message threads in memory and keeps only the result, moment, confidence and fingerprint. Confirm: the DPA wording; whether two-party recording-consent states (e.g. California, Florida) need anything from the client or CiV; that the client's call notice covers a processor reviewing recordings. | Counsel | Phase 3 | Open |

## D. Recent facts to verify

The review relies on these; confirm each against its source before use:

- the FCC September 30, 2026 order text and its treatment of designated opt-out methods;
- revoke-all effective January 31, 2027;
- the July 2026 Seventh Circuit texts decision;
- Texas SB 140 and Virginia SB 1339 text and opt-out rules;
- the 2024 TSR record-keeping amendment;
- the vacatur of the one-to-one consent rule (*IMC v. FCC*, January 2025);
- *McLaughlin v. McKesson* (June 2025) and its effect on deference to FCC rulings;
- *Facebook v. Duguid* (2021) autodialer scope and state divergences (Florida, Oklahoma, Maryland);
- the January 2026 acquisition of Jornaya by ActiveProspect (from Verisk); **[v3]** TrustedForm and Jornaya now share one vendor;
- Reassigned Numbers Database coverage dates (July 27, 2020; January 27, 2021) and monthly update schedule;
- **[v1.1]** state calling-hour windows listed under A6 (Florida, Oklahoma, Connecticut, Maryland, Texas);
- **[v3]** *Bradford v. Sovereign Pest Control* (Fifth Circuit, February 2026): prior express consent, not written (B11);
- **[v3]** the Eleventh Circuit's January 2025 vacatur of the one-to-one rule as the basis for `seller_named_required` = false (B10);
- **[v3]** TrustedForm documentation that unclaimed certificates go dark after about 72 hours.

## E. Item status tracker

| Item | Status | Set on | Rulebook version |
|---|---|---|---|
| A1–A20, B1–B9, C1–C10 | Open | — | — |
| **[v3]** A21, B10–B12, C11–C20 | Open | — | — |

Counsel updates this table; each "Set" creates a new rulebook version with an effective date.
