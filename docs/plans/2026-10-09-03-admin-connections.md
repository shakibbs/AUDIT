# Admin panel: client API connections

**Date:** 2026-10-09 · **Status:** built 2026-10-09 · **Module:** `backend/apps/connections`

## What it does

CiV staff add each client's tools in the admin panel, read-only, with the key locked.

- **Tools** (grouped by type): Dialer (Five9, Convoso, RingCentral, other), Texting (Twilio, other),
  Certificate account (TrustedForm, Jornaya), Lead feed copy, CRM (Salesforce, HubSpot, other).
- **Key tools:** paste account ID / key / secret. Locked with Fernet (`CIV_SECRETS_KEYS` in `.env`,
  several keys allowed for rotation). Never shown again; empty fields on edit keep the saved key.
- **"Sign in with…" tools** (Salesforce, HubSpot, RingCentral): no key; "Send connect link" emails
  the client's Admins and marks the connection "Waiting for client". The real Allow step comes with
  each connector.
- **Test connection:** runs on save and as an action. Twilio has a live read-only test; other tools
  show "Saved, not tested" until their connector is built.
- **Status:** Not connected · Waiting for client · Saved, not tested · Connected · Failed · Stale.
- **Access level 0–4** on the client, recomputed whenever a connection changes: 1 contact logs
  (dialer or texting), 2 + certificate account, 3 + lead feed copy, 4 + CRM. Each level needs the one below.
- **Logged:** added, key replaced, tested, removed, connect link sent.
- **Where:** menu → Clients → Connections; each client company page lists its connections and has
  "+ Add connection"; the dashboard shows connected / waiting / failed counts.

## Files

`providers.py` (tool list) · `crypto.py` (lock/unlock) · `models.py` (`Connection`) · `access_level.py` ·
`signals.py` · `testers.py` · `emails.py` · `forms.py` · `admin.py`; tests in `tests/connections/`.

## Not yet

- Real connectors (reading each tool's data), live sync and the stale check: roadmap module 5.
- The portal's Source Registry page still shows sample data.
