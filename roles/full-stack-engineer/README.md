# Full-Stack Engineer — Take-Home Challenge

**Build a donation tracking page.** Backend, frontend, database, in a monorepo, running
under Docker.

| | |
|---|---|
| **Clock** | 24 hours from the email that sent you this link |
| **Expected work** | 5–8 hours. Please do not spend more. |
| **Stack** | Your choice, within the constraints in [`../../docs/08-node-and-tooling.md`](../../docs/08-node-and-tooling.md) |
| **Deliverables** | A repository, a `FirstName_LastName.zip`, and a 2–3 minute video |

## Which files do I actually need?

**Read three things and start.** Everything else in this folder is reference — open it at the
moment it becomes relevant, and the requirements will tell you when.

| | File | |
|---|---|---|
| **Read now** | [`SETUP.md` → Step 0](SETUP.md#step-0--get-your-machine-ready-10-minutes-do-it-first) | What to install, with links. Node 24, Docker, Git. Ten minutes. |
| **Read now** | [`REQUIREMENTS.md`](REQUIREMENTS.md) | The specification. Must / should / stretch. |
| **Read now** | [`SETUP.md`](SETUP.md) | A suggested path through the day, and the environment variables. |
| Reference | [`DATA-MODEL.md`](DATA-MODEL.md) | When you design the schema. A suggestion plus seven non-negotiable rules. |
| Reference | [`API-CONTRACT.md`](API-CONTRACT.md) | When you write the endpoints. A suggested shape; deviate and document. |
| Reference | [`seed/README.md`](seed/README.md) | When you write the importer. **The awkward rows and the totals you must show.** |
| Reference | [`reference/`](reference/) | The mock payment provider, an `.env` example, a concurrency harness. |
| Before you submit | [`CHECKLIST.md`](CHECKLIST.md) | Thirty minutes, and it protects the biggest scoring category. |
| If curious | [`RUBRIC.md`](RUBRIC.md) | The exact points breakdown. |

---

## The scenario

The Himalaya Cultural Centre runs a fundraising campaign called **Aangan** — a courtyard
restoration. They need a page that does three things:

1. **The public sees the campaign** — the goal, how much has been raised, how far along it
   is, and a live list of recent donors. It has to feel alive during a fundraising push,
   because the number moving is what makes the next person give.
2. **A donor gives money** — quickly, on a phone, without creating an account if they do
   not want one, and can dedicate the gift to somebody. Some donors want their name in
   lights. Some want to be invisible. Both must be respected exactly.
3. **The office can see and manage what came in** — search it, filter it, refund a mistake,
   and export it for the treasurer, who lives in a spreadsheet and always will.

That is the whole product. It is small on purpose. The difficulty is not in the feature
list — it is in getting money, privacy, concurrency and refunds *right*, which is what the
real work is.

## What is explicitly not in scope

- **Real payment processing.** Use the mock provider in
  [`reference/mock-payment-provider.js`](reference/mock-payment-provider.js). Wiring a real
  Stripe or Square key into this would be a finding against you, not a bonus.
- Email sending. Log it, or write it to a table, and say so.
- Design polish, a design system, animation, a brand.
- User registration flows, password reset, social login.
- Anything from the "should" or "stretch" list, until the must-haves are properly done.

## The three things that decide your score

Everything else is table stakes. These are the ones we look at hardest:

1. **Money is never a float.** Integer minor units in the database, in the API and in your
   arithmetic. Formatted once, at the edge, for display.
2. **Privacy modes are enforced on the server.** A donation marked anonymous must not carry
   the donor's name in the JSON that reaches the public page. Hiding it in the UI is a
   failure, and it is the first thing we check, with `curl`.
3. **Refunds are correct everywhere.** A refunded donation leaves the campaign total, the
   progress bar, the donor count and the public list — in the same request, not on a nightly
   job.

---

## What a good 6-hour submission looks like

So you can calibrate rather than guess. This is a **strong** submission, not a minimum one:

- A monorepo with two apps and one genuinely shared package
- Postgres or SQLite, migrations committed, the seed data loaded and the totals correct
- A public campaign page with the right numbers and privacy enforced in the query
- A donation form that works, validates on the server, and shows a receipt number
- An admin login, a searchable list, and a refund that corrects every total
- Three tests: money boundaries, authorisation, refund
- `docker compose up` working from a clean clone
- A README with a *Decisions* section and a *Known issues* section
- Fourteen commits and a three-minute video

**No stretch goals. No CSV export. No pagination. No bilingual toggle.** That submission
scores in the eighties, and it has done before. The people who score below sixty are almost
never the ones who ran out of time — they are the ones who started the units grid before the
refund worked.

---

## Submitting

Follow [`../../SUBMISSION.md`](../../SUBMISSION.md) exactly. Zip named
`FirstName_LastName.zip`, GitHub link, video link, to **025pathaksandesh@gmail.com**.

## If you get stuck

Make a decision, write it in your README under *Decisions*, and keep moving. Every
ambiguity in this spec has at least two defensible answers, and we score the reasoning, not
the answer. If something is genuinely blocking, email us — asking is not a penalty.
