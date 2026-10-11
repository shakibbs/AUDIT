# Metric build priority

**Date:** 2026-10-12 · **Status:** agreed by the owner (Shakib) 2026-10-12 · **Source:** Engineering Spec v3 (42-page
version with C17–C19), §8 metric → factor map, §10 Exposure Indicator v2.2

## Why a priority list

The 39 metrics are not built at once. They are built in the order below, so that the first ones need only the
data every client must connect (dialer and texting logs, access Level 1) and the most serious defects are measured
first.

Ranking rules:

1. **Data first available:** Level 1 logs before certificates, CRM, lead feed or test numbers.
2. **Effect on the score:** factor weight, double weight (M10, M34), and whether the metric triggers a cap.
3. **Legal seriousness:** contact after an opt-out ranks above a missing form detail.

## How metrics reach the headline (summary of spec §8 and §10)

1. Each metric is counted, then normalized to a **0–100 metric score (higher = better)**: rate × 100; count band per
   10,000 contacts (0 → 100, above 0 to 5 → 50, above 5 → 0); special bands for M08, M31, M32, M35.
2. Each metric has exactly one role: **Scored** (moves one factor), **Display**, **Multiplier input**, **Loss model** or
   **Gate**.
3. **Factor F = 100 − weighted mean of its scored metrics** (higher = worse). Weights 1, except M10 and M34 at 2.
4. **Direct-violation cap** first: any contact after an internal-list entry or in-scope opt-out raises F2 or F3 to at least 75.
5. **D = 0.28·F1 + 0.20·F2 + 0.17·F3 + 0.16·F4 + 0.11·F5 + 0.08·F6**.
6. **Exposure = min(100, D × Venue × Targeting × Volume)**; then hard cap and coverage cap (each holds the grade at C or
   worse). Grades: A < 25 · B 25–39 · C 40–48 · D 49–66 · F 67+.

## Priority order

| Priority | Metrics | Factor | Data needed |
|---|---|---|---|
| **1. Level 1 logs** | M10 Contacts after opt-out (×2, cap) · M16 Out-of-hours · M15 Cross-border · M18 Restricted holidays · M31 Abandoned-call rate · M19 Robo-contact required-proof count · M21 Caller ID quality · M37 Records completeness (gate) · M36 Evidence coverage (gate) · Venue and Volume multipliers | F3, F4, F6, gates, multipliers | Dialer + texting logs, billing totals, Rulebook (hours, holidays) |
| **2. Suppression + imports** | M12 Internal list contacts (cap) · M34 Opted-out numbers re-added (×2) · M32 Manual-import share · M13 DNC check record check | F2, F3, F5 | Client's do-not-call list, import-batch detection, client's DNC check service |
| **3. Consent proof** | M01 Consent coverage · M03 Certificate validity · M04 Form wording pass rate · M27 Consent page match · M28 Consent completeness | F1, F5 | Consent engine, client's TrustedForm / Jornaya key (Level 2), page captures |
| **4. Lead source + reassigned** | M06 Lead traceability · M07 Vendor terms on file · M25b Acquired list proof · M26 Few-signal lead rate · M11 Pre-contact reassigned checks · M35 Reassigned exposure · M14 Litigator contacts (Targeting) | F5, F6, Targeting | Lead feed (Level 3), CRM (Level 4), client's own RND / litigator check services |
| **5. Test opt-outs** | M08 Opt-out propagation time · M09 Opt-outs unprocessed at deadline | F3 | Annex C, CiV test numbers |
| **6. Display, loss model, pending** | Display: M02, M05, M29, M30, M33 · Loss model: M22a, M22b, M23, M24, M25a · Rule pending: M17 Over-limit (waits for `frequency_limits`), M20 Disclosure check (needs recordings + AI) · AI "Missed opt-outs" (with module 9) · new M38–M48 (once the Metric Layer doc arrives) | — | Varies |

## Rule: "not yet measured" is not "worst case" (owner decision 2026-10-12)

| Situation | Treatment |
|---|---|
| **Metric not built yet by CiV** | Shown as **"not yet measured"**; left out of its factor's mean (like "rule pending"); never scored 0 |
| **Metric built, but the client did not connect or supply the data** (grade S or N) | **Worst case**: metric score 0, `worst_case = true` (spec §7) |
| **Factor with no built metric yet** | Factor shows **"pending"** |
| **Exposure while any factor is pending** | Labeled **"partial"**; not shown to insurers until Gate 4 |

Reason: the client must not be scored worse for work CiV has not done yet; withholding data still costs the client
exactly what bad data would (spec §7).

## Still open (not decided here)

- Follow C17 + C19 (Exposure Indicator as the one headline; domains retired)?
- The "Metric Layer doc" with M38–M48 definitions.
- Number clash: our M38 "Missed opt-outs" (D37) vs the spec's new M38–M48.
- Decision-number clash: spec D25–D28 vs our renumbered decisions.
- Spec still says AI opt-outs need a person to confirm; owner decision D37 says AI decides alone.
