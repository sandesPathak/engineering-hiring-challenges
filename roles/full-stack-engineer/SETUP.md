# Setup — a suggested path through the day

You do not have to follow this. It is here because "5–8 hours, 24-hour clock" punishes a
bad order of operations more than it punishes a slow typist, and the order below is the one
we would use ourselves.

Times are rough. Read [`REQUIREMENTS.md`](REQUIREMENTS.md) first.

---

## Before you write anything — 20 minutes

Read `REQUIREMENTS.md`, `DATA-MODEL.md` and `API-CONTRACT.md`. Then open a file called
`NOTES.md` and write down:

- the schema you are going to build, in five lines
- the four or five decisions you already know you have to make
- what you are **not** going to build

That file becomes the *Decisions* section of your README at the end. Writing it first costs
twenty minutes and saves two hours, because it is where you notice that privacy modes have
to be enforced in the query rather than in the component.

---

## Hour 0:20 – 1:00 — scaffold and tooling

Tooling **first**, before feature code. Retrofitting a linter is how standards get skipped.

```bash
mkdir aangan-donations && cd aangan-donations
git init -b main
node -v                                   # 24.x — see ../../docs/08-node-and-tooling.md
echo "24" > .nvmrc

npm init -y
mkdir -p apps/api apps/web packages/shared
# npm workspaces: add  "workspaces": ["apps/*", "packages/*"]  to package.json
# (pnpm: create pnpm-workspace.yaml instead)

npm i -D eslint prettier vitest
npx eslint --init
```

Commit: `Set up the monorepo workspaces and tooling`

A fast, boring, known-good combination if you have no preference:

| | |
|---|---|
| API | **Fastify** or **Express 5** + **Zod** |
| DB | **Postgres 16** + **Drizzle** or **Prisma** |
| Web | **Next.js 15** (App Router) + **Tailwind** |
| Tests | **Vitest** + **Supertest**, **Playwright** for the one end-to-end path |
| Shared | plain TypeScript: types, Zod schemas, money helpers |

Use whatever you are fastest in. Being fast today matters more than matching our stack.

## Hour 1:00 – 1:45 — schema, migrations, seed

Get the database right before you write an endpoint. Everything downstream is cheaper.

```bash
# migration, then:
npm run db:migrate
npm run db:seed        # loads seed/campaigns.json and seed/donations.csv
psql $DATABASE_URL -c "select count(*), sum(amount_cents) from donations"
```

Verify the seeded totals by hand before you trust any UI you build on top of them.

Commit: `Add the campaign and donation schema` · `Load the provided seed data`

## Hour 1:45 – 2:15 — money, in `packages/shared`

Do this **now**, in one place, before any amount exists anywhere in your code:

```ts
export type Money = { amountCents: number; currency: 'USD' };

export function parseDollarsToCents(input: string): number { /* ... */ }
export function formatCents(cents: number, locale = 'en-US'): string { /* ... */ }
```

Write the tests for it immediately — $0.99, $1.00, $25,000.00, $25,000.01, `-1`, `"abc"`,
`null`, `1e9`, `"1,000.00"`, `" 51 "`. Ten minutes, and it removes an entire class of
failure from the rest of your day.

Commit: `Add the shared money type with conversion tests`

## Hour 2:15 – 3:45 — the API

Order matters. Build the read path first so you have something to look at:

1. `GET /api/campaigns/:slug` — **with the privacy rules applied in the query.** Prove it
   with `curl` before you build any UI. If an anonymous donor's name appears in that JSON,
   fix it now, not later.
2. `POST /api/donations` — validate, derive the amount server-side, call the mock provider,
   persist, return a receipt number
3. `POST /api/auth/login`, and the session middleware
4. `GET /api/admin/donations` — search, filter, pagination
5. `POST /api/admin/donations/:id/refund` — in a transaction, with the audit row
6. `GET /api/admin/donations.csv`

Test each one as you finish it. **Do not build the next thing on an unverified one** — that
is the single habit that separates a calm day from a bad night.

Commit after each endpoint.

## Hour 3:45 – 5:15 — the frontend

1. Campaign page: progress, totals, recent donations, empty/loading/error states
2. Donation form: presets, custom, dedication, privacy mode, validation messages
3. Confirmation with the receipt number
4. Admin: login, table, filters, refund button, export link

Keep the CSS boring. Legible, responsive at 375px, done. If you catch yourself picking a
font, stop.

## Hour 5:15 – 6:00 — Docker

`Dockerfile` per app, `docker-compose.yml`, `.env.example`, `.dockerignore`. Then:

```bash
docker compose down -v && docker builder prune -f
rm -rf node_modules
docker compose up --build
```

Watch it come up from nothing, with a timer running, and note the cold-build time for your
README. **Do not leave this to the last thirty minutes.** It is the largest single scoring
category and the most common way a good submission loses twenty points.

Commit: `Add the docker compose stack`

## Hour 6:00 – 7:00 — tests, README, tidy

- Fill the gaps in the M8 list, especially the authorisation test and the refund test
- `npm run lint` — clean, not "clean with warnings"
- Read your **whole diff**. Delete the AI narration comments, the dead helper you stopped
  using, the `console.log`
- Write the README properly: run instructions, test accounts, decisions, known issues
- Write `AI-USAGE.md`

## Hour 7:00 – 7:30 — the clean-clone test and the video

```bash
cd .. && git clone ./aangan-donations clean-test && cd clean-test
cp .env.example .env
docker compose up --build
```

Follow **your own README**, word for word, using nothing that is only in your head. Fix what
breaks. Then record the video in one take and send it.

---

## Environment variables

Commit a `.env.example` like this. Never a `.env`.

```bash
# Database
POSTGRES_USER=aangan
POSTGRES_PASSWORD=change_me_locally
POSTGRES_DB=aangan
DATABASE_URL=postgres://aangan:change_me_locally@db:5432/aangan

# API
PORT=4000
NODE_ENV=development
SESSION_SECRET=generate_with_openssl_rand_hex_32
CORS_ORIGIN=http://localhost:3000

# Payments — the mock provider. There is no real key and there must not be one.
PAYMENT_PROVIDER=mock
PAYMENT_MOCK_LATENCY_MS=250

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## The mock payment provider

[`reference/mock-payment-provider.js`](reference/mock-payment-provider.js) is provided —
copy it in, port it to your language, or import it as it is. It is deterministic, so your
tests can rely on it:

| Token | Behaviour |
|---|---|
| `tok_ok` | succeeds after a short delay |
| `tok_decline` | declines — `card_declined` |
| `tok_insufficient` | declines — `insufficient_funds` |
| `tok_timeout` | never resolves. **Your code must time out and handle it.** |
| `tok_flaky` | fails once per charge id, succeeds on retry |
| `tok_dup` | succeeds, and returns the *same* charge id every time — for testing idempotency |

Handle `tok_timeout` and `tok_flaky` deliberately. In production, "the provider did not
answer" is the case that creates a donor who was charged and has no receipt, and it is
worth more points here than any UI you could build in the same twenty minutes.

## Test accounts to seed

Put these, in plain text, in your README:

```
admin@himalayacc.example    admin12345     role: admin
donor@himalayacc.example    donor12345     role: donor  (owns 3 seeded donations)
other@himalayacc.example    other12345     role: donor  (owns 2 — use this one to prove
                                                         the authorisation test)
```

## Common ways people lose points here

- Leaving Docker until the end, then submitting a compose file that has never run cold
- Storing money as a float "just for now"
- Filtering anonymous donors in the React component instead of the query
- A refund that updates the row but not the campaign total
- Pagination written as `OFFSET page * limit` with a 1-based `page`, which silently skips
  the first page of results
- Committing `.env`
- Building the stretch grid before the must-have list is finished
