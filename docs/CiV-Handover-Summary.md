# Comply iV (CiV) — Handover Summary

Version: 23 October 2026 · a short guide to what the system does and how it works. The full detail is in the CiV System Specification.

# 1. What CiV is, in one minute

CiV is an **independent TCPA compliance audit system** for companies that call and text people for marketing (call centers, sellers, lead buyers). It connects **read-only** to the tools a company already uses, reads **every call and text**, and checks each one against a written set of US rules (the **Rulebook**).

It gives the company, every day and every month:

| What | In plain words |
|---|---|
| **Proof per contact** | For every number: was there consent, was a "stop" honoured in time, was it inside calling hours, where did the number come from |
| **Scores** | An **Audit Score** (how compliant) and an **Exposure Indicator** (how likely and costly a lawsuit is) |
| **Findings and alerts** | Problems written in plain words, with what to fix first |
| **Evidence** | Sealed, fingerprinted records that can be exported for a lawyer, a court or an insurer |
| **Insurer sharing** | A monthly risk sheet the company can share with its insurer or a buyer |

CiV **measures and records**. It never makes calls, never blocks anything and gives no legal advice.

# 2. Who uses it

| Who | Where | What they can do |
|---|---|---|
| **Client Admin** | Client portal | Everything for their company: invites the team, changes roles, connects and uploads, shares with insurers, Settings, Users & Access |
| **Client lawyer** (a Member or Admin with the lawyer tick) | Client portal | Everything a Member sees, plus **reviews new laws and rule drafts** and **suggests law changes**; signs statements, decides findings, exports evidence |
| **Client Member** | Client portal | Sees every page (except Settings and Users & Access); cannot change people, settings or evidence |
| **Insurer / acquirer** | Insurer view of the portal | Sees only the companies that share with them: portfolio, exposure, risk sheet, litigation figures |
| **CiV staff** | CiV admin panel | Onboards clients, approves rule changes, checks proof files, manages insurers, sends password links |

Every client user has their own **"View as" switch**: *Owner* (their portal) or *Underwriter* (their own company exactly as their insurer sees it).

# 3. How it works, start to finish

1. **Onboarding:** CiV creates the client with its Admin's name and email. The Admin gets an **invitation link**, chooses a password, and invites the team.
2. **Connecting tools:** CiV saves a **read-only key** for each tool (dialer, texting, CRM, consent certificates). Keys are locked away and never shown again.
3. **Reading:** every **2 minutes** CiV asks each tool for new calls, texts and records. Phone numbers are turned into **private codes** at once; CiV **never stores a phone number**.
4. **Uploads:** what a tool can't give by API comes in through the **Upload centre** (do-not-call lists, DNC check records, complaints, policies, vendor lead files, vendor contracts).
5. **Fingerprints and daily seal:** every record gets a fingerprint; every night the day's fingerprints are **sealed and time-stamped**, so any later change would show.
6. **Checking:** each contact is checked for consent, certificates, consent page wording, lead source, opt-outs and the 10-business-day deadline, calling hours, frequency, and do-not-call lists.
7. **Scoring:** every night the metrics are worked out; every month a snapshot is saved (scores, factors, Exposure).
8. **Findings, alerts, reports:** problems appear in plain words; alerts show in the portal (and by email to Admins if they choose); monthly reports are made on the 6th.
9. **Sharing:** each night a **risk sheet** is saved; an insurer the company shares with sees it, and can have it sent to its own pricing software.
10. **Keeping the rules current:** a **law watcher** reads new US federal rules every morning; CiV drafts Rulebook changes, the clients' lawyers review them, CiV approves them.

# 4. The 16 modules

| # | Module | What it does |
|---|---|---|
| 1 | Data foundation | Background workers, private phone codes, fingerprints, nightly seal, each company's data locked apart |
| 2 | Rulebook | Every rule written as data, with versions and per-state values |
| 3 | Connectors | Read-only links to tools, read every 2 minutes |
| 4 | Normaliser | Turns every tool's records into one standard "contact" |
| 5 | Imports and completeness | Groups imports; checks CiV was given all records |
| 6 | Consent engine | Gives each contact a consent result with a reason |
| 7 | Certificates and page photos | Claims consent certificates; photographs consent web pages |
| 8 | Lead source | Traces where each number came from; asks the client for missing proof |
| 9 | Opt-outs and AI review | Tracks every "stop" and its deadline; AI reads texts and calls (switched off until an AI is chosen) |
| 10 | Metrics and scoring | The metrics, Audit Score and Exposure Indicator |
| 11 | Findings, alerts, reports | Problems, alerts and PDF reports |
| 12 | Vendor scorecard | Scores each lead vendor monthly; contracts and return requests |
| 13 | Rule changes and law watcher | New laws found, lawyer review, CiV approval |
| 14 | Evidence vault | Evidence per number, re-checks at the source, sealed exports, legal holds |
| 15 | Insurer views | Sharing, signed statements, risk sheets, insurer pages, sending to insurer software |
| 16 | Document AI | Readers for contracts, consent pages and policy files (switched off until an AI is chosen) |

# 5. The client portal, page by page

| Page | What the client sees and does |
|---|---|
| **Overview** | The score, what to fix first, recent alerts |
| **Audit Scorecard** | The score by area and the six risk factors |
| **Action Queue** | Findings to fix: assign, set a due date, record a decision |
| **Alerts** | New problems, sorted by how serious; mark as reviewed |
| **Consent Integrity** | Consent results, certificates, consent page photos |
| **Contact Ledger** | Every call and text (numbers masked) |
| **Revocation Integrity** | Every opt-out, its deadline, and whether each tool honoured it |
| **Who You Contact** | Do-not-call, internal list, reassigned numbers, litigators |
| **Evidence Vault** | Look up a number on a date, **verify a file** (is it untouched?), legal holds |
| **Contact Conduct** | Calling hours, frequency, robocalls |
| **Lead Provenance** | Where numbers came from; answer CiV's proof requests |
| **Vendor Ledger** | Vendor scores, contracts, leads that can be returned |
| **Source Registry** | Connected tools and the Upload centre |
| **Reports & Exports** | Download the monthly audit report, other reports, bulk evidence export |
| **Rulebook / Regulatory Changes** | The rules in use; new laws (the lawyer reviews them) |
| **Shared with your insurer** | Data Integrity, Risk Attestation (sign statements), Underwriting Export |
| **Setup & Readiness** | Can the audit start; the setup checklist (Admin ticks) |
| **Settings** *(Admin)* | Company facts, alert emails, plan and usage, agreements, insurer sharing |
| **Users & Access** *(Admin)* | Invite people (lawyer tick box), roles, resend or cancel invites, access log |
| **My account** *(everyone)* | Change your own password |

Anything CiV does not measure yet says **"Not measured"**, never a made-up number.

# 6. Users, logins and safety

- **Joining:** everyone joins by an **invitation link** (one use, 7 days) and chooses their own password. Nobody ever types a password for someone else.
- **Passwords:** at least 12 characters, not a common one, stored scrambled (Argon2). Change your own in **My account**. Forgot it? CiV staff send a **password link**; there is no self-service "Forgot password".
- **Lockout:** 5 wrong passwords in 15 minutes locks that email for 15 minutes, on the portal and on the CiV panel.
- **Company walls:** each company's data is locked apart **in the database itself**; no company can ever see another's.
- **No phone numbers stored:** only private codes and masked labels like (916) •••-0142.
- **Files:** private, every opening logged, kept 4 years, then deleted (their fingerprints stay); legal holds stop deletion.
- **Access log:** every sign-in, view, export and change is recorded and can't be edited.
- **Tools:** read-only; CiV never changes anything in the client's tools.

# 7. Scores in short

- Each metric becomes a score from 0 to 100.
- The metrics roll up into **six risk factors** (consent, suppression, opt-outs, calling conduct, lead sources, call integrity).
- **Exposure Indicator** = how much is wrong × pressure from where they call, who targets them and how much they call. Grades **A** (lowest risk) to **F**.
- A grade is capped when too little of it rests on real evidence, so a company can't look good by sharing nothing.

# 8. Insurers

- The client's Admin shares from **Settings → Insurer sharing** (insurer or acquirer, optional end date) and can stop at any time.
- The insurer gets an invitation, or an email "now shares with you" if they already have an account.
- They see the company's monthly risk sheet, data integrity and exposure; **never** contacts, numbers, findings or notes.
- The company can sign **statements** for its insurer; statements never raise a score, and CiV shows any conflict with what it measured.
- An insurer can save its own pricing software's address and key and have each month's sheet **sent automatically**, signed so they can check it came from CiV unchanged.

# 9. The CiV staff panel

- **Clients:** create a client (with its Admin), stages, contract, documents, connections (time zone picked from a list), users, invites (Resend), onboarding checklist.
- **Insurers:** people (password link, turn off, delete), waiting invites (Resend, Cancel), companies sharing (Stop sharing), block or delete an insurer.
- **Rules:** Rulebook with each rule's history, Rulebook check, regulatory changes (approve rule updates, delete drafts), new law items, client suggestions.
- **AI:** AI answers to approve, exam results, extra exam questions.
- **Team:** CiV staff (added by name and email; welcome link; full access for now).
- **Records:** access log, client reports (download), failed-job cleanups, missed records.

# 10. What the client provides, and what comes next

**The client provides:** read-only keys for their tools (or clicks "Allow"), the upload files a tool can't give, and their lawyer's review of draft rules.

**To switch on:**
- **Email sending:** the Gmail login goes into the server settings; until then invitations, password links and alert emails are not delivered.
- **AI:** the AI for conversation review, call transcription and document reading is chosen later; until then those parts are switched off and nothing is sent anywhere.

**Planned later:** per-person permissions for CiV staff; more tool connectors as clients need them; more state laws and court data.
