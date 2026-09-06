# Aangan Giving — reference build v1.4.2

The application under test. A small donation tracking page for the Himalaya Cultural
Centre: a public campaign page, a guest donation flow, a courtyard units grid, and a staff
console.

**This build contains defects that were put here deliberately.** Finding them is the
exercise. Read [`SPEC.md`](SPEC.md) — it is the source of truth for what the application is
*supposed* to do, and §7 lists the behaviour that surprises people and is nonetheless
correct.

Do not read the source expecting clean code. It is written the way a real second-year
codebase is written, which is the point.

---

## Run it

### Docker (recommended)

```bash
cd roles/qa-engineer/app
docker compose up --build
# → http://localhost:4000
```

### Node directly

Node 22.11+ or, better, **Node 24**. The database is SQLite through Node's built-in
`node:sqlite`, so there is nothing to install beyond Express and nothing to compile.

```bash
cd roles/qa-engineer/app
npm install
npm start
# → http://localhost:4000
```

The database is created and seeded on first start at `data/aangan.sqlite`.

### Reset between test runs

```bash
npm run reset      # drops everything and reseeds — 75 donations, 96 units
```

Do this before a suite that asserts on totals. Your own testing will change the data, and a
test that passed yesterday against a polluted database is not a test.

---

## Accounts

| Email | Password | Role |
|---|---|---|
| `admin@himalayacc.example` | `admin12345` | admin |
| `donor@himalayacc.example` | `donor12345` | donor — owns 3 seeded donations |
| `other@himalayacc.example` | `other12345` | donor — owns 2 seeded donations |

Use `donor@` and `other@` together. Two accounts is what it takes to test an authorisation
rule, and one is what it takes to miss one.

Every other seeded donor is a guest with no password, which is the normal case.

---

## Pages

| | |
|---|---|
| `/` | Public campaign page, donation form, units grid, recent giving |
| `/admin.html` | Staff console — sign in, search, filter, refund, export |

## API

| | |
|---|---|
| `GET /api/health` | liveness and the seeded donation count |
| `GET /api/campaigns` | all campaigns |
| `GET /api/campaigns/:slug` | one campaign with its totals |
| `GET /api/campaigns/:slug/donations?limit=` | the public list |
| `POST /api/donations` | make a donation |
| `GET /api/campaigns/:slug/units` | the courtyard grid |
| `POST /api/campaigns/:slug/units/hold` | hold units |
| `POST /api/auth/login` | returns a bearer token |
| `GET /api/me` · `GET /api/me/donations` | the signed-in donor |
| `GET /api/donations/:id` · `GET /api/donors/:id` | records |
| `GET /api/receipts/:receiptNumber` | look up a receipt |
| `GET /api/admin/donations` | `?q= &status= &from= &to= &page= &pageSize= &sort= &dir=` |
| `POST /api/admin/donations/:id/refund` | |
| `GET /api/admin/stats` · `GET /api/admin/audit` | |
| `GET /api/admin/donations.csv` | export |

Authenticate with `Authorization: Bearer <token>` from the login response.

---

## Configuration

| Variable | Default | |
|---|---|---|
| `PORT` | `4000` | |
| `DB_PATH` | `./data/aangan.sqlite` | |
| `GUEST_COOLDOWN_SECONDS` | `120` | Seconds between guest donations from one IP. **Intentional** — see `SPEC.md` §7. Set to `0` while testing, but report against the shipped default. |
| `PAYMENT_LATENCY_MS` | `120` | Simulated payment provider round trip |
| `PRICING_LATENCY_MS` | `60` | Simulated pricing service round trip |
| `ORG_TIMEZONE` | `America/Chicago` | The organisation's timezone |

---

## The seeded data

75 donations across the three campaigns. Several rows are awkward on purpose — a name with
a comma and quotation marks, a name in Devanagari, a message containing HTML, amounts at
the exact minimum and maximum, refunded and failed donations, and the same person under two
capitalisations of their email address.

Numbers you can check by hand against a correct implementation of `SPEC.md`:

- **75** donations — 66 completed, 7 refunded, 2 failed
- Completed donations for `aangan-courtyard` total **$43,058.00**
- 96 courtyard units, of which 5 are already dedicated

If the application shows you a different number, that is not a mistake in this README.

---

## A note on the guest cooldown

It will get in your way when you are testing the donation form by hand. That is what it
does to a real donor too, which is why it is in the specification rather than hidden.

Set `GUEST_COOLDOWN_SECONDS=0` for your automated suite if you need to, say so in your test
plan, and remember that the shipped default is 120 — a suite that only ever runs with the
protection disabled has not tested the shipped product.
