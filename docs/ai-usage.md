# AI Usage in CiV

**Version:** 1.0 · **Date:** 2026-10-08 · **Status:** plan (no AI is built yet; the portal runs on sample data)

This document explains every place CiV uses AI: what it does, which AI does
it, how we keep it accurate and private, and what it costs. Decisions are
numbered as in [specs/CHANGELOG-v3.md](specs/CHANGELOG-v3.md).

---

## 1. The one rule

| AI does | Fixed rules do |
|---|---|
| Understand messy human things: spoken calls, text conversations, contracts, policies, web pages, court papers | Counting, scoring, deadlines, grades, caps |

A score must give the **same answer every time** so it can be checked later,
including in court. AI can answer slightly differently each time, so AI only
turns messy material into **facts** ("this customer opted out at 1 min 42 s").
The rules engine then counts those facts and produces the score.

*Example:* a teacher uses judgment to read an essay, then a calculator to add
up the marks. AI is the judgment; the rules are the calculator.

**AI never:** decides a score or grade, writes to a client's systems, contacts
a customer, gives legal advice, or keeps the material it read.

---

## 2. Where AI is used

### 2.1 In the plan

| # | AI job | What it reads | What it produces | Used by | Build phase | Who decides |
|---|---|---|---|---|---|---|
| 1 | **Conversation review — calls** (D37) | The whole call recording, turned into text | Opted out / partial request / wrong number / opted back in / unclear / none, the moment in the call, confidence | M10, M38, urgent alerts, update cards | 3 | **AI alone** (owner decision D37) |
| 2 | **Conversation review — texts** (D37) | The whole text thread (last 30 days for that number) | Same results as calls, plus which message | M10, M38, urgent alerts | 3 | **AI alone** (D37) |
| 3 | **Call disclosures** | The call text | Whether the agent gave the required disclosures (company name, purpose) | M20 | 3 (same pass as #1) | After the accuracy gate |
| 4 | **Spoken consent** | The call text | The moment a customer agreed to be contacted | Evidence search (`recording` evidence) | 6 | A person confirms each one (v3 rule) |
| 5 | **Vendor contracts** | Uploaded or connected contracts | Which required clauses are present | M07, VND domain | 6 | After the accuracy gate |
| 6 | **Consent page meaning** | CiV's own captures of public consent pages | Whether the consent sentence really means consent; where wording is unclear | WEB domain, M04 | 6 | After the accuracy gate |
| 7 | **Training records** | Training logs and policies | Who was trained, on what, and when | M25a, GOV domain | 6 | After the accuracy gate |
| 8 | **Court cases** (base-rate study) | Public federal TCPA complaints | Claim type, channel, industry, outcome, amount | Loss model (insurer views only) | Separate track | Hand-check 100 first; publish the agreement rate |

Seller-name matching on consent pages stays **rule-based** (string match) and
does not use AI.

### 2.2 Proposed additions (awaiting the owner's choice)

| # | AI job | What it does | Recommendation |
|---|---|---|---|
| A | **Complaint reader** | Reads the client's complaint log; finds opt-outs hidden inside complaints; sorts complaints by type | Add |
| B | **Plain-language explainer** | An "Explain this" button on each finding, in simple words, with the banned-word check and "not legal advice" | Add |
| C | **Page change summary** | When a consent page changes, says what changed in one sentence | Add |
| D | **Rule change summary** | Drafts a simple summary of a new law or ruling for Regulatory Changes; counsel approves before clients see it | Add |
| E | Monthly report story | Writes the opening paragraph of the monthly PDF from the numbers | Later |
| F | "Ask CiV" assistant | Answers owner questions from CiV's own results | Later (risk of sounding like legal advice) |
| G | Agent coaching hints | Tells the client which agents miss disclosures | Not recommended: CiV measures, it does not run the call center |

---

## 3. AI conversation review in detail (D37)

This is the largest AI job and the one that runs most often.

**When:** right after each conversation ends — a call hangs up, or a text
thread has been quiet for 10 minutes. It runs on the live-sync feed (D35),
never during a call.

**How:**

1. Read the recording or text thread **in memory**. Calls are first turned into text by a speech-to-text service that marks who is speaking (agent or customer).
2. The AI reads the **whole conversation** and judges meaning in context — not keyword matching.
3. CiV stores the result, the moment, the confidence, the model and prompt version, and a fingerprint. The audio, transcript and text are dropped.
4. For an opt-out or wrong number, CiV checks the client's dialer, texting platform and CRM: was the number marked "do not contact"?
5. Not marked → **urgent alert within 15 minutes**. Still not marked at the deadline → counted in **M38 Missed Opt-outs**. Any later contact → **contact after opt-out (M10)**.

**Examples:**

| The customer said | Result |
|---|---|
| "Stop, let me grab a pen… okay go on" | Not an opt-out (they kept talking) |
| "I'm not interested, please don't call this number anymore" | Opted out (no "stop" needed) |
| "Text me after 6, not at work" | Partial request, shown to the client |
| "Wrong number, I'm not John" | Wrong number |
| "STOP" and the next day "START" | Opted out, then opted back in |

**Results and what happens:**

| Result | Marked as opt-out? |
|---|---|
| `opted_out` | Yes |
| `partial_request` | No; shown as a card; applied once counsel sets the scope rules |
| `wrong_number` | Yes for that number; also a sign the number may belong to someone new |
| `opted_back_in` | Ends the earlier opt-out from that moment |
| `unclear` (confidence below 0.90) | No; counted and shown as unclear |
| `none` | No; counted only |

**What the client sees:** an update card per finding — channel, time, masked
number, "AI result", the moment in the conversation, the confidence, and
whether the dialer marked it. The client can open the recording in its own
dialer at that moment. CiV never writes to the client's systems.

---

## 4. Which AI does which job

Claude reads text, documents and web pages but does not hear audio, so calls
use a separate speech-to-text service first.

### 4.1 Reading and understanding: Claude

Prices per million tokens (about 750,000 words), Anthropic list prices as of
September 2026:

| Model | Strength | Input | Output |
|---|---|---|---|
| Claude Haiku 4.5 | Fast and cheapest; simple sorting | $1 | $5 |
| Claude Sonnet 5.5 | Good judgment at a mid price | $2 | $10 |
| Claude Opus 5.5 | Strongest everyday model; careful legal-style reading | $4 | $20 |

| Job | Suggested model | Why |
|---|---|---|
| Call and text review (#1–#3) | Sonnet 5.5, tested against Haiku 4.5 and Opus 5.5 | High volume and needs judgment. **The accuracy gate picks the cheapest model that passes 95%** |
| Contracts, policies, training, consent pages (#5–#7) | Opus 5.5 | Few documents, high stakes; the cost is small |
| Court cases (#8) | Sonnet 5.5 in batch mode | Not urgent; batch is 50% cheaper |
| Explanations and summaries (A–D) | Sonnet 5.5 | Good writing at a mid price |

Every AI answer uses a fixed **structured output** (a set form of fields), so
results can be checked and counted automatically.

### 4.2 Listening: speech-to-text

| Service | Price per call minute | Note |
|---|---|---|
| AssemblyAI (Universal-2) | about $0.0025 | Cheapest; includes "who is speaking" |
| Deepgram (Nova-3) | about $0.0043 | Fast; "who is speaking" included for recorded calls |
| OpenAI (gpt-4o-transcribe) | about $0.006 | Good accuracy; costs more |

"Who is speaking" (speaker separation) is required, so the AI knows the
**customer** said "stop", not the agent. Pick by testing AssemblyAI and
Deepgram on real pilot recordings.

---

## 5. Keeping AI accurate

| Safeguard | How it works | Setting |
|---|---|---|
| **Accuracy gate** | Before an AI job goes live, it is tested on hand-checked examples. It must agree with people at least 95% of the time. Calls and texts are tested separately | `ai_accuracy_min_items`, `ai_accuracy_pass_mark` 95%, `conv_review_accuracy_pass_mark` 95% |
| **Confidence floor** | Each answer comes with how sure the AI is. Below the floor, the result is "unclear" and changes nothing | `conv_review_min_confidence` 0.90; `ai_min_confidence` 0.85 for other jobs |
| **Re-test on change** | A new model or a changed prompt re-runs the accuracy gate before results count again | Recorded in `ai_gate` |
| **Labelled** | Every AI result shows "AI result" and its confidence | Portal and reports |
| **Same input, same stored answer** | Answers are saved with model and prompt version, and reused for the same input | `ai_output` |
| **Not measured until passed** | Before a job passes its gate, its metrics show "not measured" | Metric cards |
| **Person checks where v3 requires it** | Spoken consent (#4) still needs a person to confirm each moment | v3 rule |

---

## 6. Keeping data private

CiV keeps **no client records** (owner decision D18). AI follows the same rule.

- Recordings, transcripts, messages, contracts and documents are read **in memory** and dropped after the job.
- CiV keeps only the **result**, the moment, the confidence, the model and prompt version, and a **fingerprint** of what was read.
- Every AI company used must agree **not to keep** the data after answering ("zero data retention") and **not to train** on it. Anthropic offers zero data retention by agreement; check each speech-to-text service's settings before use.
- Each client's data processing agreement must name CiV's AI and speech-to-text processors (counsel item C22).
- Call recording laws: some states require everyone on a call to agree to recording. The client's call notice must cover a processor reviewing recordings (counsel item C22).

---

## 7. Cost

### 7.1 Example: one Growth-plan client per month

Assumptions, to be measured on the pilot: about 35,000 numbers contacted;
30,000 answered and recorded calls of about 3 minutes (90,000 minutes);
40,000 text conversations; about 20 documents and 50 page changes.

| Item | How it is counted | Per month |
|---|---|---|
| Speech-to-text | 90,000 min × $0.0025–$0.006 | $225–$540 |
| Call and text review (70,000 conversations) | about $0.003 (Haiku), $0.006 (Sonnet) or $0.012 (Opus) each | $225–$870 |
| Documents, pages, explanations | small volumes | $10–$30 |
| **Total** | | **about $460–$1,440** |

The court-case study is separate: about $50–$150 of AI once, plus about
$8,000 a year in court-record fees (decision D29).

### 7.2 Ways to cut the cost

1. **Review only texts where the customer replied.** A thread with no customer reply has nothing to understand; this may halve text reviews.
2. **Skip calls with no conversation**: no answer, voicemail, or under 15 seconds.
3. **Use the cheapest model that passes the accuracy gate.**
4. **Prompt caching**: the long instructions sent with every request are stored and re-read at about one tenth of the price.
5. **One pass, several answers**: the same call review also checks disclosures and spoken consent.
6. **Batch mode** (50% off) for work that can wait, such as the court-case study. Not for call review, which must alert within 15 minutes.

With these, a realistic target for the example client is about **$300–$700 a month**.

---

## 8. Build order

| Phase | AI work |
|---|---|
| 1 Foundation | None. Live sync (D35) prepares the feed AI review runs on |
| 3 Revocation | Speech-to-text; conversation review for calls and texts; disclosures; dialer and CRM mark check; M38; urgent alert; accuracy gates |
| 4 Metrics and scoring | AI results feed M10, M20 and M38; "AI result" labels in the portal |
| 6 AI features | Contracts, consent page meaning, training records, spoken consent |
| Separate track | Court-case classification for the base-rate study |
| To decide | Proposed additions A–D |

---

## 9. Open decisions

| # | Question | Owner | Status |
|---|---|---|---|
| — | Which proposed AI jobs to add (A–G, section 2.2) | Owner | Open |
| — | Let the accuracy gate pick the cheapest Claude model that passes, for call and text review | Owner | Open |
| — | Speech-to-text provider: test AssemblyAI against Deepgram on pilot recordings | Owner | Open |
| C21 | AI deciding opt-outs without a person checking each one | Counsel | Open |
| C22 | Processing recordings and messages: data agreement wording, recording-consent states | Counsel | Open |
| D9 | `ai_accuracy_pass_mark`, gate sample size | Product | Open |

---

## Sources

- Claude prices: Anthropic API price list (September 2026).
- Speech-to-text prices:
  - [Gladia — AssemblyAI vs Deepgram 2026](https://www.gladia.io/blog/assemblyai-vs-deepgram)
  - [Deepgram — Best Speech-to-Text APIs 2026](https://deepgram.com/learn/best-speech-to-text-apis-2026)
  - [Speech-to-Text API Pricing 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026)
  - [GPT-4o Transcribe pricing 2026](https://gate.ai/blog/gpt-4o-transcribe-openai-specs-pricing-api-use-cases)
- Project decisions: [specs/CHANGELOG-v3.md](specs/CHANGELOG-v3.md) §2 (D18), §2a (D35), §2b (D37); [specs/02-rulebook-parameters.md](specs/02-rulebook-parameters.md) §16; [specs/05-counsel-brief.md](specs/05-counsel-brief.md) C21, C22.
