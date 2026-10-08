# Business Requirements Document — CiV Automated TCPA Audit System

**Version:** 3.0 · **Date:** 2026-10-07 · **Status:** Draft for Product and Counsel review
**Supersedes:** BRD v1.1 (2026-10-01), which superseded the business framing in the v1.0 Engineering Spec (2026-09-27)
**[v3] Source of changes:** [specs/CHANGELOG-v3.md](specs/CHANGELOG-v3.md), from *Engineering Spec v3* (Oct 7, 2026, kept in [source-documents/](source-documents/)). Anything v3 does not mention stands as written in v1.1. Changed or new passages are marked **[v3]**.

---

## 1. Executive summary

Companies that make outbound sales calls and texts in the United States face
statutory damages of $500–$1,500 per call or text under the Telephone Consumer
Protection Act (TCPA), with a four-year lookback and class actions as the
common vehicle. Most defendants lose not because they lacked consent but
because they cannot *prove* it for a specific number on a specific date, or
because a single opt-out was not honored somewhere in a chain of dialers,
SMS platforms, CRMs and lead vendors.

CiV will sell an automated audit service that connects to a client's own
tools through published APIs, reads every outbound contact and every piece of
consent proof, decides a consent status for each contact, tests the client's
opt-out handling from CiV's own phone numbers, runs the CIV-ATP-01 checkpoint
library across 25 audit domains, and delivers a score, a per-number evidence
file, **[v3]** findings with recorded client decisions, alerts and a client
portal. Everything is measured, fingerprinted, anchored and reproducible;
nothing is blocked, dialed or removed from a list on the client's behalf.

**[v3] Three readers, one record.** The same measurements now serve three
readers: the **client** (portal), the **insurer** (a monthly risk attestation,
data integrity view, loss model and underwriting export) and the **acquirer**
(a diligence file for a deal window). Buyers see standardized derived results,
never the client's records.

**[v3] CiV holds analyzed data only.** CiV keeps its own results and a
fingerprint of every record it read. It never keeps the client's records
(owner decision 2026-10-07, D18). It is a measuring instrument, not a records
custodian.

The first paying users are general counsel and owners in HVAC, solar,
insurance and financial services (mid-market, 50–500 seats). **[v3]** The
first pilot candidates are the pilot insureds of Falcon Risk, an insurance-side
partner (3–5 companies, D3).

## 2. Problem statement

| Problem | Consequence today |
|---|---|
| Consent proof is scattered across TrustedForm, Jornaya, CRM fields, IVR recordings and vendor lead files | At litigation time the client cannot assemble proof for one number in the time a demand letter allows |
| Opt-outs must propagate across every system that can contact a person | A STOP reply honored by the SMS platform but not the dialer produces a willful-damages claim |
| Numbers get reassigned; the person who consented is not the person now called | The client has no record of having checked the Reassigned Numbers Database before calling |
| State "mini-TCPA" laws add calling-hour, frequency and holiday rules that differ by state and change yearly | Manual audits go stale within months |
| Analyst-run audits are expensive, slow and produce a point-in-time PDF | No continuous view, no alert when a consent page silently changes |
| Existing vendors sell call blocking or list cleaning | Nobody independently tests whether the client's own opt-out chain works, and nobody keeps a tamper-evident record for the client's lawyers |
| **[v3]** Numbers enter dialers by hand or by bulk import with no trace of where they came from | Contacts with no lead record, no certificate and no invoice behind them; nobody counts them |
| **[v3]** Insurers and acquirers price TCPA risk from questionnaires the company fills in itself | The company being measured has every reason to look clean; the buyer cannot tell a clean company from one that shared nothing |

## 3. Vision and positioning

**CiV is an independent measuring instrument, not a call blocker, not a law
firm and [v3] not a records custodian.** It records what the client did and
what proof existed, labels the evidence by source, and hands the client — or
the client's counsel — a file it can defend with. Because CiV never dials,
blocks or cleans lists, its outputs stay measurements, which keeps CiV out of
the client's liability chain and keeps the outputs usable as records of what
was observed.

### 3.1 [v3] Store-nothing value proposition

CiV keeps **fingerprints, not content**. For every record it reads it keeps a
SHA-256 hash, source system, source record ID, fetch time, trusted timestamp
and daily anchor. The record itself is read in memory and dropped when the job
ends. Phone numbers are kept only as a keyed token.

What this offers each party:

| Party | Value |
|---|---|
| Client | CiV is not another copy of its customer data to secure, disclose or delete. Ending the contract and destroying the client's key makes every token unlinkable |
| Client's counsel | CiV can prove a record the client produces is the same one CiV saw on a date (its hash matches) |
| Insurer / acquirer | Standardized derived results with the evidence coverage behind each one, from a party that does not hold the records it rates |
| CiV | A smaller security and privacy surface; no custodian duties over client records |

What it costs, stated plainly (CHANGELOG-v3 §2.3): a past result reproduces
exactly only while the client's records still match their fingerprints; if a
vendor deletes a certificate CiV can prove it existed but cannot show its
content; CiV's own derived results can still be requested in a lawsuit.

### 3.2 [v3] Why unverified inputs score as worst case

Insurers and acquirers will rely on CiV's numbers, and the company being
measured has a reason to look clean. If missing data were simply left out of
the score (v1.1's "Not measured"), a company could raise its score by
withholding its worst sources: **adverse selection**. So in v3:

- every input CiV cannot verify takes a **worst-case value** set in the
  rulebook (Product-owned, counsel-reviewed);
- **a statement never raises a score**: client answers are kept as signed
  "Insured states" with weight 0; they can lower a score, never raise it;
- **withholding a source costs exactly what bad data would cost**: Gate 4
  tests that a client that withholds a source scores no higher than the same
  client showing its worst case;
- every score shows its **evidence coverage** beside it, and a score built on
  too little verified evidence is capped.

### 3.3 [v3] Data access levels: the onboarding model

Onboarding is a ladder. Each level the client connects unlocks more checks.
`client.access_level` (0–4) is recomputed nightly from connector health.

| Level | Client connects | Unlocks |
|---|---|---|
| 0 | Application only | Self-reported fields (source grade S); outside-in checks: page captures, test opt-outs (with Annex C), caller-ID callbacks, carrier labels, court dockets. **Outside-in score only** |
| 1 | Dialer + messaging logs (API or scheduled export) | Contacts after opt-out, calling hours, abandoned calls, cross-border, dialer-side import detection, untraced numbers, reconciliation. **Minimum for monitoring** |
| 2 | Client's own TrustedForm / Jornaya key | All five consent checks, page match, vendor scoring, certificate custody |
| 3 | Copy of the lead feed (CiV as an extra delivery destination) | Real-time provenance; the client switches it off in one click |
| 4 | Read-only CRM API | Lead-source fields, form submissions, purchase / inquiry dates, record creator and field history |

Uploads are an optional fallback at any level, never the core path (clients
will not upload; Rad, Oct 7).

## 4. Stakeholders and users

| Role | Needs | Portal role |
|---|---|---|
| General counsel / outside counsel | Fingerprint-verified evidence; alerts routed to counsel; work-product posture where available | `legal` |
| Owner / CEO | One score with its evidence coverage, the top findings, cost per client | `owner` |
| Operations lead | **[v3]** Findings and decisions with status, connector health, vendor scorecards | `operations` (disabled in counsel-directed mode) |
| Lead-buying manager | Dispute candidates per vendor inside the dispute window | `operations` |
| **[v3]** Insurer underwriter (e.g. Falcon Risk) | Portfolio of linked insureds; each one's attestation, data integrity, loss model and export. Never contact-level rows, tokens, decision note text or test numbers | `insurer` (buyer role) |
| **[v3]** Acquirer deal counsel | The target's attestation, data integrity and diligence export for the deal window; access ends when the link is revoked | `acquirer` (buyer role) |
| CiV product / engineering | Rulebook administration, run monitoring, cost model | internal |
| CiV counsel | Approves every status-affecting parameter, report wording, **[v3]** the common-responses library | internal `counsel` |

**[v3]** A buyer gets access only when the client grants it through a buyer
link, scoped and revocable by either side.

## 5. Goals and success criteria

| # | Goal | Measure of success |
|---|---|---|
| G1 | Every outbound contact in the lookback window gets a consent status with reason codes | 100 % of normalized contacts evaluated; 0 silently skipped |
| G2 | Results reproduce exactly | **[v3]** Re-running any past run with its stored `evaluation_as_of`, rulebook version and code version gives identical results while the client's records still match their fingerprints; otherwise the result is labeled "inputs changed since evaluation", never silently recomputed |
| G3 | Evidence is tamper-evident | **[v3]** Every record read is fingerprinted at fetch (SHA-256 + RFC 3161 timestamp), included in a daily Merkle root anchored to OpenTimestamps and an RFC 3161 authority; per-fingerprint inclusion proof exported |
| G4 | Opt-out handling is tested, not assumed | Propagation matrix delivered for each pilot client with ≥ `min_tests_per_cell` tests per cell; **[v3]** test coverage reported (campaigns reached ÷ marketing campaigns) |
| G5 | Nothing runs on a human's judgment | No human in the loop to produce a result; humans only approve rulebook versions and **[v3]** the common-responses library |
| G6 | Outputs are usable by counsel without overclaiming | Counsel items C1, C2, C6 signed off before launch; banned-word check passes on every report |
| G7 | **[v3]** Pilot proves value on connectors | Gate 1: pilot synced, fingerprinted and anchored; five import batches confirmed; records completeness ≥ 0.9; no content on disk after a full sync. Gate 2: 200 hand-checked contacts agree with the engine. (v1.1's upload-only Phase 0 is removed) |
| G8 | Cost per client is known | Running cost per client and per number measured from Phase 1 and fed to the pricing model |
| G9 | **[v3]** Withholding data never helps | A client that withholds a source scores ≤ the same client showing its worst case (Gate 4) |
| G10 | **[v3]** No client content at rest | Every build phase ends with a checklist that confirms no client content is stored |
| G11 | **[v3]** Buyers can rely on the record | Falcon receives 3–5 attestations; reliance letter and CiV E&O insurance in place; a buyer token reads no contact row (Gate 5) |

## 6. Non-goals (explicitly out of scope)

- Blocking, dialing, cleaning or suppressing any contact on the client's behalf.
- Selling, sourcing, maintaining **[v3]** or querying DNC, state DNC or litigator lists. The client's own DNC check records are read when connected and reported as Info only.
- **[v3]** Keeping the client's records: CRM records, message text, recordings, transcripts, certificate contents, raw phone numbers, agent names, uploaded files, contracts and policies. CiV is not a records custodian (D18).
- **[v3]** Claiming or retaining a consent certificate in CiV's own account.
- **[v3]** Uploads as the core data path (fallback only).
- Contacting the client's customers (except CiV's own test numbers and one callback per client caller ID for M21).
- Giving legal advice. **[v3]** Common responses come only from a counsel-owned library, and the client records its own decision.
- Live (per-lead, synchronous) Lead Inspector in v1. Batch only; live mode is post-pilot.
- Consumer reports of any kind. Lead Inspector outputs may not be used for eligibility decisions (Counsel C3).
- Any workflow that requires a CiV analyst to change a result.
- **[v3]** Setting insurance terms. CiV supplies measurements; the carrier sets coverage terms and premiums.

## 7. Product rules (binding on every requirement below)

1. **Consent is decided per contact.** A number's result is rolled up from its contacts (worst status wins).
2. **Consent needs proof, and CiV reports separately whether the law or CiV policy required it.** Every contact records `consent_required_basis`; a manual live call to a number on no DNC list is NO_PROOF with basis "CiV policy only".
3. **[v3] CiV does not sell, maintain or query DNC or litigator lists.** The client's own **DNC check records** are read when connected and reported as **Info only**. If no list is supplied, the DNC basis is `dnc_unknown`, never silently "policy only".
4. **Everything runs automatically.**
5. **Official access only.** Published APIs, client-owned credentials, read-only or least-privilege, every call logged.
6. **Flag, don't judge — in names too.** See README wording rules (**[v3]** the banned list adds four list-cleaning words; see README).
7. **Names describe acts, not outcomes.**
8. **[v3] Evidence is tamper-evident and graded by source:** source grades A–D plus S and N. A hash proves a record is unchanged, not that it was true.
9. **Built for counsel.** **[v3]** Counsel-directed is the **default** engagement mode (counsel to confirm, D25); no overclaiming.
10. **A status-affecting parameter needs counsel approval.** Any rulebook key flagged `affects_status` must be approved by the counsel role before an `approved` rulebook version can include it.
11. **TBD blocks client output, not engineering.** A provisional rulebook lets code be built and tested; its outputs are watermarked and never shown to a client.
12. **[v3] Store fingerprints, not content** (spec rule 10).
13. **[v3] Unverified counts as worst case** (spec rule 11), per field, with the value in the rulebook.
14. **[v3] A statement never raises a score** (spec rule 12). Stored as a signed "Insured states" entry, weight 0.
15. **[v3] Every number states its basis** (spec rule 13). Each value carries its source grade; every score shows evidence coverage beside it.
16. **[v3] CiV never claims or retains a certificate in its own account** (spec rule 14). Lookups use the client's key; billed operations need written approval.

## 8. Functional requirements

Requirements are grouped by capability. Priority: **M** = must have for pilot, **S** = should have for launch, **L** = later. **[v3]** Source grades replace tiers throughout.

### 8.1 Data acquisition

| ID | Requirement | Pri |
|---|---|---|
| FR-ACQ-1 | **[v3]** Accept client uploads (CSV, PDF, DOCX, audio) as an **optional fallback**: parsed, fingerprinted (uploader, time, SHA-256) and discarded in the same job; source grade D | S |
| FR-ACQ-2 | Retrieve TrustedForm / Jornaya certificates by ID through the **client's own key** (source grade B); **[v3]** record custody: claimed in the client's account, vendor-only, or never claimed | M |
| FR-ACQ-3 | Pull dialer, SMS, CRM and lead-platform records through published APIs with client credentials (source grade C); one adapter per vendor; build order follows the pilot client. **[v3]** This is the core path | M |
| FR-ACQ-4 | Query the Reassigned Numbers Database through CiV's own caller-agent account (source grade A). **[v3]** The RND exposure sample (M35) is post-contact and sampled, never before a dial (D20) | S |
| FR-ACQ-5 | Capture public consent pages with a headless browser at every viewport in `cc_viewports` (source grade A; CiV keeps its own captures, D32a decided 2026-10-08) | M |
| FR-ACQ-6 | Carrier line-type and caller-name lookup, email verification, RDAP domain age — only under written use-case approval (source grade B) | S |
| FR-ACQ-7 | Never trigger a billed vendor operation on the client's account without written approval | M |
| FR-ACQ-8 | Backfill to `lookback_years`; then **[D35] live sync**: live feed (webhooks / change events) for every tool that offers it, polling every 5 minutes otherwise, an hourly catch-up sweep that records any missed change as a gap, and a weekly full comparison; urgent alerts within 15 minutes; scores refresh hourly. **[v3]** A stale connector (no change or heartbeat in 2 hours) raises an alert and dependent inputs take their worst-case value (or "not checked" where the metric card says so) | M |
| FR-ACQ-9 | **[v3]** Compute `client.access_level` (0–4) nightly from connector health; below Level 1 the client gets the outside-in score only | M |
| FR-ACQ-10 | **[v3]** Process records in memory; tokenize phone numbers at the edge with a per-client HMAC key held in a KMS (key custody: D19) | M |
| FR-ACQ-11 | **[v3]** Read CRM creator, created time and field history; dialer list ID and list insert time; SMS billing totals; carrier and vendor invoices; court dockets (CourtListener RECAP, PACER) | S |

### 8.2 [v3] Evidence: fingerprint ledger

| ID | Requirement | Pri |
|---|---|---|
| FR-EVI-1 | **[v3]** One fingerprint row per record read: source system, source record ID, source grade, fetch time, SHA-256, RFC 3161 timestamp, anchor date, content kind. The record itself is never written to disk | M |
| FR-EVI-2 | **[v3]** No client content at rest. A `purge_log` records any in-memory job failure that wrote partial rows and their removal. (Replaces v1.1's write-once object storage and `deletion_log`) | M |
| FR-EVI-3 | Daily Merkle root anchored to OpenTimestamps and an RFC 3161 TSA; per-fingerprint inclusion path stored | M |
| FR-EVI-4 | **[v3]** Legal hold = an instruction to the client + an optional encrypted snapshot to a bucket **the client owns** (CiV write-only); release needs a Legal user and a reason | M |
| FR-EVI-5 | Every portal view, export, connector call **[v3]** and buyer API call in `access_log` | M |
| FR-EVI-6 | **[v3]** Position lookup = re-fetch and compare: read the source record again, hash it, show Matches / Changed / No longer at source. Whether content may be shown in the portal during the lookup is D32b | S |
| FR-EVI-7 | **[v3]** Verify a fingerprint: compare a file the client produces with the stored hash | M |
| FR-EVI-8 | **[v3]** Crypto-shredding: destroying a client's HMAC key at contract end makes its tokens unlinkable; logged in `access_log` | S |

### 8.3 Normalization

| ID | Requirement | Pri |
|---|---|---|
| FR-NRM-1 | Turn every source into outbound `contact_event` rows; inbound never a contact; a text counts once the platform accepts it | M |
| FR-NRM-2 | Cross-system dedupe only, one-to-one, same number and channel within `dedupe_window_seconds`; dialer/SMS record wins | M |
| FR-NRM-3 | Phone epochs as date ranges with certainty known / bounded / unknown; RND queries within `rnd_query_budget_per_number` | S |
| FR-NRM-4 | Recipient local time from the address ZIP in force, else area code; both checked when they disagree; confidence recorded | M |
| FR-NRM-5 | Rows never overwritten; `valid_from` / `valid_to` on every versioned row | M |
| FR-NRM-6 | **[v3]** `phone_token` (+ key ID) replaces the phone number in every stored row | M |

### 8.4 Consent engine

| ID | Requirement | Pri |
|---|---|---|
| FR-CON-1 | Exactly one of NO_PROOF / CONFLICTING / WEAK / VERIFIED per contact, with primary and secondary reason codes | M |
| FR-CON-2 | Every applicable basis evaluated separately; contact status = worst across bases; contact is "legal-basis" if any basis is legal | M |
| FR-CON-3 | Proof ranking VERIFIED > WEAK > CONFLICTING > NO_PROOF; ties to most recent capture | M |
| FR-CON-4 | Timing: linked chain has no tolerance; unlinked sources use `clock_skew_seconds`; opt-outs cut off after `optout_grace_business_days` | M |
| FR-CON-5 | Same inputs + same `evaluation_as_of` + same rulebook version = same output | M |
| FR-CON-6 | Rule-based checklist items run in code from Phase 2; AI items only after their accuracy gate | M |
| FR-CON-7 | Frozen (source deleted under retention), pending (provider outage) and test contacts excluded from metrics and the hard cap | M |
| FR-CON-8 | **[v3]** New codes: `WK_FINGERPRINT_ONLY` (certificate no longer opens but CiV holds its fingerprint → WEAK), `NP_NO_EVIDENCE_FOUND`, `NP_THIRD_PARTY`, label `EBR_ONLY`; `CF_NOT_FOUND` only when there is also no CiV fingerprint | M |
| FR-CON-9 | **[v3]** Phone match uses the provider's matching service (CiV submits the phone); fill time and paste are lead-quality signals only, never a consent status | M |
| FR-CON-10 | **[v3]** Counsel-owned settings: `seller_named_required` (default false), `written_consent_required_by_forum`, `inbound_contact_scope` | M |

### 8.5 Rules engine and scoring

| ID | Requirement | Pri |
|---|---|---|
| FR-RUL-1 | Load CIV-ATP-01 into `checkpoint` with automation bucket, aggregation rule and metric map | S |
| FR-RUL-2 | Per-contact results aggregate to a checkpoint result by `checkpoint.aggregation` | S |
| FR-RUL-3 | Checkpoints that cannot run return `not_run` / `NEEDS_SOURCE`; "checkpoints run out of total" beside every score. **[v3]** A TBD rule value → `not_run` with reason `RULE_PENDING`; a Proposed value runs and is marked provisional | S |
| FR-RUL-4 | Domain and overall score, grade bands, provisional flag; DNC and litigator domains never in the overall | S |
| FR-RUL-5 | **[v3]** Three caps, applied in order: hard cap (grade ≤ C); **contact-after-stop cap** (rulebook key `direct_violation_grade`; any contact after an internal-list entry or an in-scope opt-out → that domain ≤ D); **coverage cap** (evidence coverage < 0.60 → overall ≤ C). A held grade shows "held" and names the cap | M |
| FR-RUL-6 | **[v3]** Worst-case defaults for every unverified input (S or N); the engine records `worst_case = true` per field | M |
| FR-RUL-7 | **[v3]** Evidence coverage (Σ share × source-grade weight) beside every score, attestation and export | M |
| FR-RUL-8 | **[v3]** Confirmed-rules score (Set values only) beside every overall score | M |
| FR-RUL-9 | **[v3]** Metrics grow from 33 to 39 (M32–M37); every value carries a basis chip; one denominator per figure; a cross-page consistency test asserts shared figures come from one query | M |

### 8.6 Revocation testing

| ID | Requirement | Pri |
|---|---|---|
| FR-REV-1 | No test without signed Annex C naming channels, brands, dates **[v3]**, campaigns and vendor forms | S |
| FR-REV-2 | **[v3]** Seed at least once per marketing campaign, through the client's public forms and vendor forms authorized in Annex C; test identities flagged `is_test` | S |
| FR-REV-3 | Opt out on each channel; watch every connected system; record suppression time or NEVER after `optout_observation_days` | S |
| FR-REV-4 | Propagation matrix with test counts and "indicative" label below `min_tests_per_cell`; **[v3]** test coverage on the matrix card; unreached = "untested", never "passed" | S |
| FR-REV-5 | Real carrier mobile lines, honest texting registration, recording notice on spoken tests until C5 is decided | S |
| FR-REV-6 | **[v3]** Blind testing: test numbers rotate every `test_rotation_days`, are never shown in any portal role, and timing and channel are randomized | S |

| FR-REV-7 | **[D37]** AI conversation review: right after each call or text conversation ends, AI reads or listens to the whole conversation (in memory) and decides opted out / partial request / wrong number / opted back in / unclear, without a person per item, after passing a 95% accuracy gate | S |
| FR-REV-8 | **[D37]** For each AI-found opt-out, check whether the client's dialer, messaging platform and CRM marked the number; not marked → urgent alert within 15 minutes; still not marked at the deadline → M38 Missed Opt-outs | S |
| FR-REV-9 | **[D37]** Portal update card per finding: channel, time, masked number, AI result, moment in the conversation, confidence, dialer / CRM status. CiV never writes to the client's systems | S |

### 8.7 Lead Inspector

| ID | Requirement | Pri |
|---|---|---|
| FR-LI-1 | Check 2 (consent source) and Check 3 (completeness) in batch from Phase 2 | M |
| FR-LI-2 | Check 1 (lead signals) and vendor scorecard after counsel C3 | S |
| FR-LI-3 | Rule-based seller-name match from Phase 2; AI meaning check after its gate | M |
| FR-LI-4 | Dispute candidates per vendor inside the dispute window; CiV never contacts vendors | S |

### 8.8 Outputs

| ID | Requirement | Pri |
|---|---|---|
| FR-OUT-1 | **[v3]** Evidence file per phone epoch: fingerprints, fetch times, re-fetch outcomes, anchor proofs, verifier script and CiV's derived results; the client supplies the underlying records. Its exact contents, the certification pack and the named-numbers package wait on D18 (counsel) | M |
| FR-OUT-2 | **[v3]** Findings and decisions replace the fix list (see 8.11) | S |
| FR-OUT-3 | Alerts: page change, certificate expiry, test opt-out past deadline, contacts after opt-out, stale connector, **[v3]** opted-out numbers re-added (High), unknown calling system; counsel-only routing in counsel-directed mode | S |
| FR-OUT-4 | Client portal with role-based access; every view logged | S |
| FR-OUT-5 | Banned-word check on every report; standard disclosure on every report | M |
| FR-OUT-6 | Provisional-rulebook outputs watermarked and never visible to client roles | M |
| FR-OUT-7 | **[v3]** Period report: a real PDF rendered from the same queries as the portal; holds only derived results; its SHA-256 in its footer, the report history and the access log (keeping these PDFs: D33) | S |

### 8.9 [v3] Provenance and manual imports

| ID | Requirement | Pri |
|---|---|---|
| FR-PRV-1 | Provenance ladder per number for the latest lead before first contact: feed → CRM field → invoice → certificate domain → manual batch → untraced (consent check 1 → `NP_NONE`) | M |
| FR-PRV-2 | The untraced list goes back to the client monthly | S |
| FR-PRV-3 | Import-batch detection from creation bursts (gap `import_gap_seconds`, size `import_min_batch`), update bursts over field history, and dialer list ID + insert time; integration users excluded | M |
| FR-PRV-4 | Calibration on five batches confirmed by the client at onboarding (thresholds: D21) | M |
| FR-PRV-5 | Evidence search: earliest evidence event (certificate, inbound call or text, form submission, purchase = EBR only, recording after a person confirms) before first contact | M |
| FR-PRV-6 | Proof requests: a sample per batch (`proof_request_sample`); the client attaches proof or marks "none" in the portal; unanswered stays NO_PROOF; proof production rate per batch | S |
| FR-PRV-7 | Opted-out numbers re-added in a batch feed M34, raise a High alert and appear on the batch row | M |
| FR-PRV-8 | M06 counts vendor leads; the ladder counts contacts; the two are never mixed in one figure | M |

### 8.10 [v3] Data integrity and reconciliation

| ID | Requirement | Pri |
|---|---|---|
| FR-INT-1 | Reconciliation per period: calls vs carrier invoice, texts vs platform billing, vendor leads vs vendor invoices (flag below `completeness_floor`), seat capacity, STOP replies, days present. Every Level 1 connector reads billing totals or marks reconciliation "not available" | M |
| FR-INT-2 | Records completeness (M37) = the lowest of the first three ratios; a flagged period is "incomplete data" and the missing share takes worst-case values | M |
| FR-INT-3 | Evidence coverage (M36) per score and per period | M |
| FR-INT-4 | Caller-ID inventory: caller IDs seen calling on the client's brand vs those in connected systems; an unknown one is an **unknown calling system** and the top finding until connected or disclaimed in writing | S |
| FR-INT-5 | Insured states: every self-reported answer is an officer-signed statement with weight 0; contradictions with measured data or court dockets become conflict rows, shown to buyers as they are | S |
| FR-INT-6 | Reassigned exposure from an RND sample (M35, `rnd_sample_size`), independent of the client's own RND logs (M11 = "not checked" without them) | S |

### 8.11 [v3] Findings and decisions

| ID | Requirement | Pri |
|---|---|---|
| FR-FND-1 | Findings with noun-phrase titles (what CiV found, not what to do) | S |
| FR-FND-2 | Common responses from a counsel-owned library, Set values only | S |
| FR-FND-3 | Client decision per finding: accepted / declined / alternative, recorded with the prompt *"Reviewed with [role]; decided [action] because [reason]."*; the note is hashed (`note_sha256` in the access log) | S |
| FR-FND-4 | Exports carry the decision and its hash, never the note; overdue is measured against the real date | S |

### 8.12 [v3] Buyer views (insurer and acquirer)

| ID | Requirement | Pri |
|---|---|---|
| FR-BUY-1 | Buyer orgs and buyer links: access granted by the client, scoped, revocable by either side; consent wording and reliance letter per D26 | S |
| FR-BUY-2 | Row-level security: a buyer's queries resolve only through `buyer_link` and only to attestation, reconciliation, conflict and metric rows; tenancy tests in CI (client ↔ client, client → buyer portfolio, buyer → contact rows) must all fail | S |
| FR-BUY-3 | Risk attestation `civ.attestation.v1`, monthly, hashed, versions kept; every field carries value, source grade and worst-case flag; blocks: frequency drivers, records integrity, Insured states with conflicts | S |
| FR-BUY-4 | Insurer portfolio of linked insureds | S |
| FR-BUY-5 | Loss model v0, labeled **uncalibrated** everywhere, parameters editable by the underwriter (ownership: D28) | L |
| FR-BUY-6 | Underwriting export API `GET /v1/insureds/{client_id}/attestation?as_of=YYYY-MM`; bearer token per buyer org rotated every 90 days; webhook on a 5-point score change or a new open matter | S |
| FR-BUY-7 | Acquirer diligence export for the deal window; access ends at link revocation | S |
| FR-BUY-8 | Draft coverage conditions for the carrier's counsel (CiV supplies measurements; the carrier sets terms) | L |

**Owner question (see feature list D2):** the attestation includes a
*theoretical statutory exposure* in dollars and the loss model produces a
dollar expected loss. The owner's earlier decision D2 was "no dollar
estimates anywhere". v3 limits these to buyer views; the owner should confirm.

### 8.13 [v3] Litigation base-rate study (separate track)

| ID | Requirement | Pri |
|---|---|---|
| FR-BRS-1 | Pull federal TCPA dockets filed 2023–2026 (CourtListener RECAP, PACER) into a study store that holds public records only | L |
| FR-BRS-2 | Publish base rates (suits per 100 companies by industry, volume band, channel) and cost per suit by claim type | L |
| FR-BRS-3 | Feeds only the loss model and the prior-matters conflict check; shares no client data. Owner and budget (~$8K/year PACER fees): D29 | L |

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Reproducibility | **[v3]** Any result reproducible from stored run metadata while the source records still match their fingerprints; otherwise labeled "inputs changed since evaluation" |
| Integrity | SHA-256 at fetch; daily external anchoring; inclusion proofs; per-client keys in a KMS, fetched per job, never on disk |
| **[v3]** Data minimization | No client content at rest; every build phase ends with a checklist that includes "no content at rest" |
| Isolation | Per-client row-level security on every table; per-client keys; credentials in a secrets vault revocable in one click; **[v3]** buyer access only through `buyer_link`, tested in CI |
| Availability | Batch system; no uptime SLA in v1. Live Lead Inspector (post-pilot) needs an SLA before it ships |
| Scale (planning assumption, to be confirmed with the pilot) | 1–5 M contacts per client per year; 4-year backfill up to 20 M contacts; nightly incremental of ≤ 50 k contacts; page captures ≤ 500 URLs × 2 viewports per day per client |
| Determinism | All time-dependent checks use stored `evaluation_as_of`, never the wall clock |
| Auditability | `access_log` for every read; `run` row for every computation; AI outputs stored with model and prompt version |
| Security gates before first real client data | SOC 2 Type I, signed DPAs, independent penetration test |
| Cost | Per-client and per-number running cost measured from **[v3]** Phase 1 |
| **[v3]** Display | US spelling; timestamps in the viewer's local time zone with UTC on hover |

## 10. Legal and regulatory constraints

These shape requirements; the counsel brief holds the open questions.

- **Unsettled law.** After *McLaughlin v. McKesson* (2025) district courts are not bound by FCC interpretations; results may depend on `litigation_forum`. Rule values carry a jurisdiction dimension (federal circuit / district and state).
- **Autodialer scope** after *Facebook v. Duguid* (2021) is narrow federally, broad in several states. The engine runs strict and lenient variants until counsel sets A12 and A17.
- **[v3] Written consent by forum and seller naming.** The FCC one-to-one rule was vacated (11th Cir., Jan 2025), so `seller_named_required` defaults to false; *Bradford v. Sovereign Pest Control* (5th Cir., Feb 2026) drives `written_consent_required_by_forum`. Both counsel-owned.
- **Revocation** deadline is 10 business days (since April 2025); revoke-all effective 2027-01-31 per the FCC's 2026 order (to verify).
- **DNC exemption** needs a *signed written* agreement, not merely consent.
- **Reassigned Numbers Database** answers only yes / no / no data to "disconnected since date X"; safe harbor covers robocall consent claims only.
- **[v3] Evidence.** CiV can certify only that a record the client produces hashes to the value CiV recorded on that date; accuracy needs the client's custodian (FRE 902(11), 803(6)); computed metrics are analysis and need a witness. CiV's derived results (metrics, findings, decision hashes) are its own records and can be requested in a lawsuit; counsel-directed mode may protect some of them, never the underlying facts.
- **[v3] Personal data.** `phone_token` is pseudonymized personal data while CiV holds the key; the data processing agreement must say so.
- **Alerts create notice.** Buyers are told in writing; alert design approved by counsel.
- **Lead Inspector** must not become a consumer report (FCRA); carrier-data providers bar eligibility uses.
- **CiV's own obligations** (GLBA for insurance/finance verticals, state privacy laws, recording consent in all-party states) — Counsel C9, C5.
- **[v3] Reliance.** Buyers may rely on CiV's method and observed data, not on the company's statements; a reliance letter per buyer (D26).

## 11. Delivery plan

**[v3]** Replaces v1.1 Phases 0–5. The upload-only Phase 0 is removed;
uploads are a fallback.

| Phase | Builds | Gate |
|---|---|---|
| **1. Foundation** | Fingerprint ledger, connectors, normalizer, phone epochs, rulebook, import-batch detection, reconciliation | G1: pilot synced, fingerprinted, anchored; 5 batches confirmed; completeness ≥ 0.9; **no content on disk after a full sync** |
| **2. Consent and provenance** | Consent engine (v3 codes), certificates via the client's key, custody, page capture, provenance ladder, evidence search, proof requests | G2: 200 hand-checked contacts agree; counsel consent items set; custody reported; `WK_FINGERPRINT_ONLY` exercised |
| **3. Revocation** | Test numbers, Annex C v3, seeding per campaign and vendor form, matrix + test coverage | G3: first matrix; campaign coverage reported |
| **4. Metrics and scoring** | 39 metrics, worst-case defaults, evidence coverage, three caps, confirmed score, findings and decisions, period PDF | G4: every metric on the pilot; consistency and tenancy suites; a client that withholds a source scores ≤ the same client showing its worst case |
| **5. Buyer views** | Buyer orgs and links, attestation v1, loss model v0, export API, insurer portfolio | G5: Falcon receives 3–5 attestations; reliance letter and E&O in place; buyer token reads no contact row |
| **6. AI features** | Contract clauses, transcription, free-text opt-outs, page meaning, training records, spoken-consent flags | Per-feature accuracy gate |
| **Alongside from day one** | Counsel brief; litigation base-rate study | — |
| **Post-pilot** | Live Lead Inspector | Liability terms, uptime SLA |
| **Launch** | — | Counsel C1, C2, C6–C10; SOC 2 Type I; DPAs; pen test; cost model |

Phase 5 may start once Gate 4 passes on one pilot client. Every build phase
ends with a human-reviewed checklist (auth, tenancy, input validation, error
handling, logging, no content at rest).

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Counsel settings arrive late and stall Phase 2 | High | High | Provisional rulebook; strict/lenient dual runs quantify each decision |
| Pilot client's vendors have no read-only API role | Medium | Medium | Least-privilege user with contractual read-only commitment, every call logged (D6) |
| Vendor API terms forbid third-party access | Medium | High | Confirm terms before building each adapter; upload fallback (source grade D, weight 0.7) |
| Backfilled leads have no contemporaneous page capture | Certain | Medium | Label "not comparable"; tell buyers up front |
| AI features fail their accuracy gate | Medium | Low | Items take their worst-case value or stay "not checked"; rule-based items carry Phase 2 |
| CiV subpoenaed; reports used against the client | Medium | High | Measurements only; counsel-directed mode by default; subpoena procedure (C7). **[v3]** CiV holds no client records, but its derived results remain discoverable |
| ~~Object Lock prevents legally required deletion~~ | — | — | **[v3]** Removed: CiV stores no client content; crypto-shredding of the per-client key makes tokens unlinkable |
| Checkpoint count mismatch (1,132 vs 1,067) | Certain | Low | D4 reconciliation before Phase 1; aggregation rules per checkpoint |
| Scale unknown until pilot | High | Medium | Planning assumptions in §9; measure in Phase 1 |
| **[v3]** The record the client cannot produce: a vendor purges history or a certificate is deleted | Medium | High | CiV proves the record existed on a date (`WK_FINGERPRINT_ONLY`) but cannot fill the gap. Accepted consciously in exchange for not being a custodian; optional client-owned hold bucket |
| **[v3]** Vendor concentration: TrustedForm and Jornaya both belong to ActiveProspect (since Jan 2026) | Medium | High | One terms or API change hits both consent sources; keep the certificate adapter behind one interface; track ActiveProspect's terms as a launch risk |
| **[v3]** An insurer prices off a CiV number that later proves wrong | Low | High | CiV errors-and-omissions insurance before the first insurer pilot (D27); loss model labeled uncalibrated |
| **[v3]** A buyer relies on the company's statements as if CiV verified them | Medium | High | Reliance letter per buyer (D26): reliance on CiV's method and observed data only; statements shown as "Insured states", weight 0, with conflicts |
| **[v3]** Clients withhold sources to look clean (adverse selection) | High | High | Worst-case defaults, coverage cap, evidence coverage beside every score; Gate 4 withholding test |
| **[v3]** Clients will not upload | Certain | Medium | Connectors-first; Level 1 (dialer + messaging logs) as the minimum |
| **[v3]** Import-batch thresholds misfire on a real client | Medium | Medium | Calibration on five client-confirmed batches (D21) |

## 13. Open decisions

Tracked in engineering spec section 12 and [CHANGELOG-v3 §12](specs/CHANGELOG-v3.md). The ones that gate the next step:

- **D3 [v3]** Pilot client: Falcon Risk's pilot insureds (3–5 companies) are the first candidates; their dialer / SMS / CRM sets connector order.
- **D4** Checkpoint count reconciliation and automation buckets.
- **D13** Confirm ActiveProspect exposes certificate page snapshots through the API.
- **D18 [v3]** Store-nothing scope: **decided by the owner 2026-10-07** (analyzed data only); open with counsel: contents of the evidence file and certification pack.
- **D19 [v3]** HMAC key custody: CiV's KMS or a client-held key (Phase 1).
- **D21 [v3]** Import thresholds calibrated on the pilot (Gate 1).
- **D22, D23 [v3]** Worst-case default values; coverage and completeness thresholds (Gate 4).
- **D26–D28 [v3]** Buyer-link wording and reliance letter; CiV E&O insurance; loss model ownership (Phase 5).
- **D29 [v3]** Base-rate study owner and budget.
- **D30–D34, D36 [v3]** Owner answers 2026-10-08: source grades A–D, S, N (D30); masked number labels "(480) •••-0923" (D31); keep CiV's own page captures (D32a; D32b open); no v2 exists, v1.1 stands (D34); dollar figures in insurer and acquirer views only, labelled uncalibrated (D36). Still open: D32b, D33.

## 14. Glossary

| Term | Meaning |
|---|---|
| Contact | One outbound call attempt or one outbound text accepted by the SMS platform |
| Phone epoch | One number held by one person; boundaries are date ranges |
| Consent status | NO_PROOF / CONFLICTING / WEAK / VERIFIED, per contact |
| Basis | Why proof is needed: `robocall_marketing`, `robocall_informational`, `dnc_listed`, `dnc_unknown`, `state_law`, `civ_policy` |
| **[v3]** Source grade | Where evidence content came from: A captured by CiV, B independent third party, C client systems by API, D client export or upload, S Insured states, N not supplied. Replaces "Tier" |
| **[v3]** Access level | 0–4: how much of its stack the client has connected (§3.3) |
| **[v3]** Fingerprint | Hash, source, fetch time, trusted timestamp and anchor date of a record CiV read; the record itself is not kept |
| **[v3]** Phone token | Keyed hash of a phone number with a per-client key; stored instead of the number |
| **[v3]** Worst-case default | The value an unverified input takes in scoring |
| **[v3]** Evidence coverage | Share of the evidence behind a score that CiV verified, weighted by source grade |
| **[v3]** Records completeness | How fully the client's logs match invoices and billing (M37) |
| **[v3]** Insured states | A signed client statement; weight 0; can lower a score, never raise it |
| **[v3]** Provenance ladder | Where a contacted number came from: feed, CRM field, invoice, certificate domain, manual batch, or untraced |
| **[v3]** Import batch | A burst of records created or updated together, detected from creator, time and field history |
| **[v3]** Finding / decision | What CiV found (noun phrase) and the client's recorded response to it |
| **[v3]** Attestation | `civ.attestation.v1`: monthly, hashed statement of measured values for a buyer |
| **[v3]** Buyer link | The client's grant that lets an insurer or acquirer see its attestation |
| Rulebook | Effective-dated legal values plus per-client settings; versioned; draft / provisional / approved |
| Checkpoint | One test from the CIV-ATP-01 library |
| Domain | One of 25 audit domains (e.g. CON, REV, CTF) |
| Evidence file | Per-epoch export: contacts, statuses, **[v3]** fingerprints, re-fetch outcomes, anchors and derived results |
| Propagation matrix | Opt-out channel × client system → hours to suppression or NEVER |
| Counsel-directed mode | Engagement run through the client's lawyers; alerts routed to counsel only; **[v3]** the default mode |
| RND | FCC Reassigned Numbers Database (operated by Somos) |
| EBR | Existing business relationship |
