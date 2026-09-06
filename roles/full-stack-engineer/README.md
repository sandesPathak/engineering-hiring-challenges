# Full-Stack Engineer — Take-Home Challenge

**Build a donation tracking page.** Backend, frontend, database, in a monorepo, running
under Docker.

| | |
|---|---|
| **Clock** | 24 hours from the email that sent you this link |
| **Expected work** | 5–8 hours. Please do not spend more. |
| **Stack** | Your choice, within the constraints in [`../../docs/08-node-and-tooling.md`](../../docs/08-node-and-tooling.md) |
| **Deliverables** | A repository, a `FirstName_LastName.zip`, and a 2–3 minute video |

## Read these first

1. [`../../docs/00-about-us-and-the-project.md`](../../docs/00-about-us-and-the-project.md) — why this exercise looks like this
2. [`REQUIREMENTS.md`](REQUIREMENTS.md) — **the actual specification.** Must / should / stretch
3. [`SETUP.md`](SETUP.md) — a suggested path through the first ninety minutes
4. [`DATA-MODEL.md`](DATA-MODEL.md) — a suggested schema, and the rules that are not negotiable
5. [`API-CONTRACT.md`](API-CONTRACT.md) — a suggested API shape
6. [`RUBRIC.md`](RUBRIC.md) — exactly how the 100 points are allocated
7. [`CHECKLIST.md`](CHECKLIST.md) — tick this before you submit

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

## Submitting

Follow [`../../SUBMISSION.md`](../../SUBMISSION.md) exactly. Zip named
`FirstName_LastName.zip`, GitHub link, video link, to **025pathaksandesh@gmail.com**.

## If you get stuck

Make a decision, write it in your README under *Decisions*, and keep moving. Every
ambiguity in this spec has at least two defensible answers, and we score the reasoning, not
the answer. If something is genuinely blocking, email us — asking is not a penalty.
