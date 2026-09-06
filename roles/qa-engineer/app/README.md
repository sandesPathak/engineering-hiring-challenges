# Sabhaghar Booking — reference build v2.3.1

The application under test. It is the hall and facility booking system for the Himalaya
Cultural Centre: members request a space, the office approves it, and a public calendar
shows the community what is on.

**It has defects in it. That is the exercise.** Some are visible on the page, some only in
the API payloads, some only appear when two people do something at the same moment. Your
job is to find them, report them so a developer can fix them without asking you a question,
and leave behind an automated suite that would catch them coming back.

Read [`SPEC.md`](SPEC.md) before you start. It is the source of truth for what the
behaviour is supposed to be, and **§7 lists behaviour that looks wrong and is deliberate** —
reporting those costs marks.

---

## Running it

Node 24 and nothing else. There is one dependency and no build step.

```bash
npm install          # about ten seconds
npm start            # http://localhost:4000
```

Or under Docker, which is how we run it when we review your work:

```bash
docker compose up --build
```

To put the data back exactly as you found it:

```bash
npm run reset        # drops every table and reseeds
```

Do that between test runs. Your automated suite should assume it starts from the seeded
state, and should say so if it does not.

### Configuration

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `4000` | Port to listen on |
| `DB_PATH` | `./data/sabhaghar.sqlite` | Where the SQLite file lives |
| `BOOKING_LEAD_DAYS` | `3` | Notice the office asks for on a new request |
| `ORG_TIMEZONE` | `America/Chicago` | The centre's timezone |

---

## Accounts

```
staff@himalayacc.example     staff12345      staff  — the office console
member@himalayacc.example    member12345     member — has seeded bookings
other@himalayacc.example     other12345      member — use this one to prove authorisation
```

Every seeded member also exists as an account, but without a password.

## The two pages

| Page | What it is |
|---|---|
| `http://localhost:4000/` | Members: browse spaces, check availability, request a booking, see what is on |
| `http://localhost:4000/staff.html` | The office: every booking, search, filters, approve, reject, CSV export |

## The API

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/auth/login` | Returns a session token |
| `GET` | `/api/spaces` · `/api/spaces/:slug` | Catalogue, add-ons, blackout dates |
| `GET` | `/api/spaces/:slug/availability?date=` | What is taken that day |
| `GET` | `/api/calendar?from=&to=` | The public what's-on list |
| `POST` | `/api/bookings` | Request a booking. Signed in |
| `GET` | `/api/bookings/:reference` | One booking |
| `GET` | `/api/my/bookings` · `/api/my/profile` | The signed-in member's own records |
| `POST` | `/api/my/bookings/:reference/cancel` | Cancel your own booking |
| `GET` | `/api/staff/bookings` · `/bookings.csv` · `/stats` · `/audit` | The office. Staff only |
| `POST` | `/api/staff/bookings/:reference/approve` · `/reject` | Decide a request |

Send the token as `Authorization: Bearer <token>`.

```bash
TOKEN=$(curl -s localhost:4000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"staff@himalayacc.example","password":"staff12345"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')

curl -s "localhost:4000/api/staff/bookings?pageSize=5" -H "Authorization: Bearer $TOKEN"
```

---

## The seeded data, and the numbers you can check by hand

84 bookings across 87 members and six spaces, seeded from
[`src/seed/bookings.csv`](src/seed/bookings.csv). Read that file — it is a short read and it
tells you what the application is supposed to be holding.

| | |
|---|---|
| Bookings by status | 37 confirmed · 22 completed · 8 pending · 11 cancelled · 6 rejected |
| Hours booked (confirmed and completed, per §6.4) | **200.5** |
| Hire fees on those bookings | **$21,312.90** |
| Deposits held | **$16,400.00** |
| Private events in the data | 16 |
| Members whose name is in Devanagari | 2 |

**Work those figures out yourself from the CSV before you trust anything the application
tells you.** More than one number on the screens does not match the data behind it, and the
fastest way to find that class of defect is to have the right answer in front of you first.

Some rows in the seed file are deliberately awkward: a name containing a comma and
quotation marks, two names in Devanagari, a purpose containing HTML, an emoji, a 280-
character note, the same person's email in two different capitalisations, a booking at
exactly the room's capacity, a twelve-hour booking, a late-evening booking, and a
back-to-back pair on the courtyard on 2026-11-07 that the specification says is legal.

None of that is decoration. Each one is there because it breaks something, or because it
should not and you should check.
