# Backend step 1: login system

**Date:** 2026-10-09 · **Status:** built 2026-10-09 (all 9 steps) · **Covers:** the login part of roadmap modules 2 and 3

## Goal

Build the first piece of the Django backend: logins. There are **two separate doors**:

1. **CiV's door:** our own team signs in to the **CiV admin panel** (Django admin).
2. **The client's door:** client users sign in to the portal through the **login API**.

They are kept fully apart:

| | CiV staff | Client users |
|---|---|---|
| Account table | `staff_user` (app `staff`) | `client_user` (app `accounts`) |
| Signs in at | `/civ-admin/` | `/api/session/sign-in` (called by the portal) |
| Roles | Django admin permissions (e.g. only our lawyer can approve rules) | **Admin** or **Member**, plus a "this person is our lawyer" box |
| Can use the other door? | No: a staff login gets "401 not signed in" from the API | No: a client user can't sign in to `/civ-admin/` |

**Underwriter** isn't a role. It stays a view switch in the portal (decided 2026-10-09).

## Choices made (my defaults; say if you want different)

| Choice | Pick | Why |
|---|---|---|
| Python / Django | Python 3.14, latest stable Django 6, Django REST Framework | Already on this computer; Django 6 supports 3.14 |
| Package tool | `uv` (makes `pyproject.toml` + `uv.lock`) | Already installed; one command to set up |
| Database | Local PostgreSQL, database `civ` | Already running here |
| How a login is remembered | Django session cookie (secure, not readable by page scripts) | Safest for a website; no tokens kept in the browser |
| Password storage | **Argon2 + bcrypt** (owner's choice 2026-10-09): new passwords are saved with Argon2; bcrypt passwords are also accepted and switched to Argon2 at the next sign-in. Minimum 12 characters | Argon2 is the current best practice; bcrypt support lets us bring in accounts from other systems |
| Wrong password | Same message for wrong email or wrong password; 5 failed tries in 15 minutes locks that email for 15 minutes | Stops guessing |
| Emails (reset, invite) | Printed in the terminal while we build | No email service needed yet |
| Tests | `pytest` + `pytest-django` | Simple and standard |
| Admin address | `/civ-admin/` (not the usual `/admin/`); later its own web address | Harder to find, easy to separate |

## Folder layout

One Django app per module. Each file holds one thing, with short comments.

```
backend/
  pyproject.toml            # packages
  uv.lock
  .env.example              # settings template (real .env is not committed)
  manage.py
  README.md                 # how to run it
  config/
    settings.py             # all settings, read from .env
    urls.py                 # /civ-admin/ and /api/ routes
    health.py               # GET /api/health
    wsgi.py
    asgi.py
  apps/
    staff/                  # CiV team accounts + admin panel
      apps.py
      models.py             # StaffUser (AUTH_USER_MODEL)
      managers.py           # create_user / create_superuser
      admin.py              # staff section in the admin panel
      migrations/
    access_log/             # who did what, when (read-only in admin)
      apps.py
      models.py             # AccessEntry
      recorder.py           # record(...) used by every module
      admin.py
      migrations/
    clients/                # client companies
      apps.py
      models.py             # Client
      admin.py
      migrations/
    accounts/               # client users + login API
      apps.py
      models.py             # ClientUser, Invite
      managers.py
      admin.py              # client users section in the admin panel
      session.py            # sign a client user in / out of the session
      authentication.py     # DRF: reads only the client login, never staff
      permissions.py        # IsClientUser, IsClientAdmin
      lockout.py            # failed sign-in counter
      tokens.py             # password-reset and invite tokens
      emails.py             # reset and invite emails
      serializers/
        sign_in.py
        session.py
        password_reset.py
        invite.py
        user.py
      views/
        sign_in.py          # POST /api/session/sign-in
        sign_out.py         # POST /api/session/sign-out
        session.py          # GET  /api/session
        password_reset.py   # POST /api/session/reset, /api/session/reset/confirm
        invites.py          # POST /api/invites/accept
        users.py            # GET/POST /api/users, PATCH/DELETE /api/users/<id>
      urls.py
      migrations/
  tests/
    conftest.py
    staff/test_admin_access.py
    accounts/test_sign_in.py
    accounts/test_lockout.py
    accounts/test_password_reset.py
    accounts/test_invites.py
    accounts/test_users.py
    accounts/test_separation.py
    access_log/test_recorder.py
```

## What each part stores

- **StaffUser:** email, name, password, active, staff permissions.
- **Client:** name, plan, start date, lawyer-only mode (on by default), active.
- **ClientUser:** client, email, name, password, role (admin / member), is our lawyer (yes / no), active, last sign-in.
- **Invite:** client, email, role, who invited, sent at, expires (7 days), used at.
- **AccessEntry:** time, who (client user or staff), company, action, object, IP address. Nobody can edit or delete these rows.

## Rules the login API follows

- Every answer about users is limited to the signed-in person's own company.
- Only an **Admin** can invite, change roles or turn off a user. A company always keeps at least one Admin.
- A reset or invite request always answers "sent", so nobody can find out which emails exist.
- Reset links work for 1 hour, invite links for 7 days; each works once.
- Changing a password signs that user out everywhere.
- Logged actions: sign in, failed sign in, sign out, reset asked, reset done, invite sent, invite accepted, role changed, user turned off.

## Steps (I stop and report after each one)

1. **Project setup.** Create `backend/` with uv, Django, DRF, Postgres database `civ`, `.env.example`, `GET /api/health`, pytest. Check: the server starts and the health test passes.
2. **CiV staff accounts + admin panel.** `staff` app, `StaffUser`, admin at `/civ-admin/`, make your first admin account. Check: you can sign in to the admin panel.
3. **Access log.** `access_log` app, `record()` helper, read-only admin section. Check: test that rows are written and can't be edited.
4. **Client companies.** `clients` app, `Client` model, admin section. Check: add a client in the admin panel.
5. **Client users.** `accounts` models (`ClientUser`, `Invite`) and the admin section. Check: add a client user in the admin panel.
6. **Login API.** Sign in, sign out, session, lockout, separation. Check: tests for right password, wrong password, lockout, and that a staff login can't use the API (and the reverse).
7. **Password reset + invites + users API.** Check: tests for each flow, the Admin-only rules, and that one company can't see another's users.
8. **Frontend roles cleanup.** In `frontend/`, cut the 9 roles down to Admin and Member, and keep Owner / Underwriter as a separate view setting. Check: frontend tests pass.
9. **Connect the portal to the backend.** The portal's `/api` route forwards `/session` and `/users` to Django; every other page keeps its sample data for now. Check: sign in on the real sign-in page with a real account.

## Not in this plan

- The **Connections** section in the admin panel (API keys, connect links): the next plan.
- Single sign-on, two-step codes, a real email service and hosting: later.
- Everything else in modules 2 and 3 (fingerprint ledger, tenancy row-level security, other API endpoints).
