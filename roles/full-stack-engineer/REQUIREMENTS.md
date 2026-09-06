# Requirements — Full-Stack Engineer

Three tiers. **Do the must-haves properly before you look at anything below them.** A
complete, tested must-have list with a thoughtful README beats a partial attempt at
everything, and we have rejected submissions that reached for stretch goals while leaving
authorisation broken.

Legend: **M** must-have · **S** should-have · **X** stretch

---

## M1 — Monorepo and tooling

- A single repository containing both applications and at least one genuinely shared
  package.
- Workspaces via npm, pnpm or yarn. Turborepo/Nx are welcome but not required.

```
package.json                root scripts + workspaces
apps/api/                   backend
apps/web/                   frontend
packages/shared/            types, validation schemas, money helpers — imported by BOTH
docker-compose.yml
.env.example
```

- `packages/shared` must be **real**: the donation types, the validation schemas and the
  money conversion live there and are imported on both sides. A monorepo where the two apps
  share nothing is two repos in a trench coat, and we will say so.
- Linter and formatter configured **in your first commit**, before feature code. `npm run
  lint` passes clean at submission time.
- Root scripts a reviewer can run without reading your source: `dev`, `build`, `test`,
  `lint`, `db:migrate`, `db:seed`.

## M2 — Data model, migrations and seed

- Migrations checked into the repository. Not `synchronize: true`, not a `schema.sql` you
  ran by hand.
- Constraints **in the database**: `NOT NULL`, foreign keys, a `CHECK` that an amount is
  positive, a unique constraint on the receipt number.
- A seed script producing a populated, believable page — use
  [`seed/campaigns.json`](seed/campaigns.json) and [`seed/donations.csv`](seed/donations.csv)
  so that every submission we review has the same data. **Read
  [`seed/README.md`](seed/README.md) first — several rows are deliberately awkward, and it
  tells you the totals your page must show.**
- Indexes on what you actually query, with a one-line comment saying why.

See [`DATA-MODEL.md`](DATA-MODEL.md).

## M3 — The public campaign page

Anonymous visitor, no login.

- Campaign title, story, **goal**, **total raised**, **donor count**, and a progress bar
  with a percentage.
- A list of recent donations: display name, amount, dedication line, relative time.
- **Privacy modes are enforced server-side.** Three values:
  - `public` — show the donor's name
  - `anonymous` — show "Anonymous". The donor's name, email and any other identifying field
    **must not be present in the API response at all**
  - `family` — show the surname only, e.g. "The Gurung family"
- Refunded donations do not appear and are not counted anywhere.
- Empty state, loading state, and error state all handled. An empty campaign must not
  render `NaN%`.
- Works on a 375px-wide phone.

## M4 — The donation flow

- Preset amounts **$21 / $51 / $101 / $501 / $1,001** plus a custom amount.
- Minimum **$1.00**. Maximum **$25,000** per donation. Both enforced on the server; the
  client-side check is a convenience, not the control.
- Donor gives name and email. **Guest checkout with no account is required** — most donors
  will never register.
- Optional dedication: type (`in_honor_of` / `in_memory_of`) and a name, plus an optional
  message up to 280 characters.
- Privacy mode selector, defaulting to `public`, explained to the donor in one sentence.
- Payment via the **mock provider** — see
  [`reference/mock-payment-provider.js`](reference/mock-payment-provider.js). Handle
  success, decline, and provider timeout distinctly, and show the donor something honest for
  each.
- On success: a confirmation with a **receipt number** the donor could quote on the phone.
- **The amount charged is derived on the server.** If your API trusts an `amount` in the
  request body without validating it against your own rules, that is a finding.
- **Never store a card number**, not even the fake ones. Store the provider's token or
  charge id, and the last four digits if you want them.

## M5 — The admin view

- Login. Sessions handled properly — see
  [`../../docs/04-security-baseline.md`](../../docs/04-security-baseline.md).
- **Role separation.** An `admin` sees everything. A logged-in `donor` sees **only their
  own** donations. Enforce it in the query, not in a branch after the fetch, and return 404
  rather than 403 for somebody else's record.
- A donation list with:
  - search by donor name or email — **and it must work for a name written in Devanagari**,
    which is in your seed data
  - filter by status (`completed` / `refunded` / `failed`) and by date range
  - pagination that is correct at the boundaries. Page 2 must not repeat or skip a row.
- **Refund** an individual donation. The status changes, an audit row is written, and every
  aggregate updates in the same transaction.
- **CSV export** of the filtered list. It must survive a donor named
  `Shrestha, Bijay "BJ"` and a name in Devanagari without shifting columns — there is one of
  each in the seed data, on purpose.

## M6 — Security

Implement the seven non-negotiables in
[`../../docs/04-security-baseline.md`](../../docs/04-security-baseline.md). Summarised:

- no secrets in the repo or its history · authorisation per record, not just per session ·
  schema validation at every boundary · money as integer cents · parameterised queries ·
  escaped output (the dedication message is rendered in three places) · errors that do not
  leak internals

Plus: passwords hashed with bcrypt/argon2, random expiring session tokens, security headers,
CORS naming an origin.

## M7 — Docker

`git clone`, `cp .env.example .env`, `docker compose up --build`, and it works. Database,
migrations, seed, API, web. See
[`../../docs/05-docker-and-deployment.md`](../../docs/05-docker-and-deployment.md).

**Test it from a clean clone with the build cache pruned.** This is 20 of the 100 points and
it is the one people lose.

## M8 — Tests

No coverage target. We look at *what* you chose to test. At minimum:

- **Money.** Conversion, arithmetic, formatting, and the boundaries: $0.99, $1.00,
  $25,000.00, $25,000.01, a negative, a string, `null`, `1e9`.
- **Privacy.** An anonymous donation's API response contains no donor name. Assert on the
  serialised payload, not on a function's return value.
- **Authorisation.** Donor A cannot read donor B's donation. This is the test we look for
  first.
- **Refund.** Totals, counts and the public list all move, and they move together.
- **Pagination boundaries.** No repeats, no skips, across a page boundary.
- **One end-to-end path**, ideally with Playwright: land on the page → donate → see it
  appear. It does not have to be more than one.

## M9 — Documentation and the video

Per [`../../docs/03-documentation-and-comments.md`](../../docs/03-documentation-and-comments.md)
and [`../../docs/06-video-walkthrough.md`](../../docs/06-video-walkthrough.md). Root README,
per-app READMEs, `AI-USAGE.md`, and a 2–3 minute video.

---

## Should-have — if the must-haves are genuinely done

**S1 — Donor history.** A logged-in donor sees their own giving history and total, and
nobody else's.

**S2 — Recurring donations.** A monthly flag captured at donation time, with the next
scheduled date shown. **Do not build a scheduler or charge anything** — persist the intent
and display it.

**S3 — Idempotency.** The same donation request arriving twice — a double click, a mobile
retry — creates one donation. An idempotency key or a natural unique constraint; say which
and why.

**S4 — Rate limiting and an admin audit log.** Limit the donation endpoint and the login
endpoint. Record who refunded what, when. In the real world, unlimited donation endpoints
get used to test stolen card numbers.

**S5 — Bilingual UI.** An English / नेपाली toggle on the public page. The point is not
translation quality — it is whether your layout, your fonts and your string handling survive
a script that is not Latin.

**S6 — Optimistic UI or live updates.** The total moves without a manual refresh. Polling
is a perfectly good answer; say why you chose it over SSE or a socket.

---

## Stretch — pick at most one, and only if you are ahead

**X1 — The dedication grid.** *(This is the one we would pick, by a distance.)*

A grid of units on a wall — say 20 × 20, addressed `A01`…`T20`, at a fixed price per unit.

- A donor selects up to **5** units, which places a **10-minute hold**
- Held units are unavailable to everyone else, and the hold expires without needing a cron
  job — compute expiry at read time
- Completing the donation converts the holds to permanent dedications
- **Two requests arriving in the same millisecond for the same unit: exactly one succeeds.**
  Always. Under any load. Explain your mechanism in a comment — row lock, unique constraint,
  atomic conditional update, or optimistic concurrency with a version column. All four are
  acceptable answers; *check-then-act across two statements is not*.
- **Ship a test that fires 20 concurrent requests at one unit and asserts exactly one
  winner.** That test, alone, is worth more than the whole should-have list.

**X2 — Server-side PDF receipt** with a real receipt number, reproducible on reissue. (Note
for the curious: doing this client-side is what the real platform does today, and it is one
of the things we would change — client-side PDFs cannot embed a Devanagari font reliably or
guarantee the same output twice.)

**X3 — Accessibility pass.** Keyboard-navigable donation form, labelled inputs, visible
focus, a modal that traps focus and closes on Escape, contrast at AA. Run axe and put the
result in your README. A large part of this membership is over 65 and this is not decoration.

**X4 — Deployed somewhere real**, with the seeded accounts working and the URL in your
README.

---

## Deliberate ambiguities

There are at least five things this specification does not decide. Some examples, and there
are others we have not listed:

- Should a refunded donation still be visible to the donor who made it?
- What does "recent" mean on the public list — count, or time window?
- Is the $25,000 cap per donation, per donor per day, or per campaign?
- Do the presets change if the campaign has nearly reached its goal?
- What happens to a held unit if the payment provider times out — released immediately, or
  after the ten minutes?

**Decide, write it in your README under *Decisions*, and move on.** Noticing the gap and
naming it scores better than guessing our intent correctly and saying nothing.
