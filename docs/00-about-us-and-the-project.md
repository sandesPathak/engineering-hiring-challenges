# Who we are, and what the real work looks like

## How we work

We build and maintain web platforms for community organisations — nonprofits, cultural
centres, membership associations. The kind of client who has real users, real money moving
through the system, a board asking questions, and no in-house engineering team at all.

That last part shapes everything. When we ship something broken, nobody at the client can
fix it. They call us. So we care about tests and about boring, obvious code far more than
most teams our size do.

The team is distributed and overlaps for about four hours a day. We work asynchronously by
default, which means **written communication is a first-class engineering skill here**, not
a soft skill. That is why the documentation and the video in this challenge are graded, and
graded seriously.

---

## The engagement you would be joining

> **A note on names.** The client details below are fictionalised — the organisation is a
> composite, and the names, domains and numbers are invented. We are not going to hand a
> live client's architecture to everyone who applies for a job. **Everything technical is
> real**: the stack, the constraints, the problems and the deadlines are the ones you would
> actually walk into. We think you deserve to know what you are signing up for.

### The client

The **Himalaya Cultural Centre** (we will call it HCC) is a nonprofit in the United States
serving a South Asian diaspora community of roughly 4,000 households. They run a building
with event halls, a calendar of religious and cultural events, a paid membership programme,
and a donation operation that is the majority of their income.

They have had a web platform for about two years. It works. It takes money. It is not a
greenfield project and **you would not be rewriting it**.

### What already exists in production

- **Next.js (App Router)** front end, React Server Components, TypeScript, Tailwind, Radix
  primitives in a shadcn-style component layer
- **Session-based auth** with a credentials provider — no social login, by the client's choice
- **A separate backend API**, reached from the front end through a server-side proxy route
- **A hosted payment provider** already integrated and live: card, ACH bank transfer, Apple
  Pay, Google Pay, and card-on-file for membership auto-renewal. **This is done. We are not
  rebuilding it, and neither are you in this challenge.**
- **Object storage behind a CDN** for images and documents
- **A PaaS host behind a CDN/WAF** — which matters more than it sounds like it does, because
  the bot protection also blocks automated test traffic unless you plan around it
- A member directory, event RSVPs, a bookable hall and services catalogue with about 60
  items, eleven priced membership tiers, recurring donations, and client-side PDF receipts

### What we have been asked to build next

Three signed change orders, roughly 60 developer-weeks of work, on a **three-month clock**:

1. **A graphical donation engine.** Donors buy a named unit on an interactive map of a
   physical structure — think a wall of engraved bricks, addressed by coordinate
   (`PM-A12-045`). Fixed price per unit. A donor can hold up to five units for ten minutes
   while they check out, and a guest gets a shorter hold. Each dedication carries an
   "In honour of" / "In memory of" line and a privacy mode: public, anonymous, or
   family-only. Completed dedications generate a numbered PDF certificate.

   *This is the hard one.* It is a concurrency problem wearing a donation page's clothes.
   Two donors clicking the same brick at the same moment must not both get it, ever, under
   any load, including when one of them is on a train and their request arrives twice.

2. **Platform enhancements.** Splitting household records into individual member records,
   contributions made on behalf of a family member, profile merging with a two-level
   approval chain, a point-of-sale flow for signing up members at the front desk, inventory
   and usage tracking, volunteer and staff management with geolocated check-in, page-level
   access control with an audit log, search that works correctly in **Devanagari as well as
   Latin script**, and a migration off the current host.

3. **Life events and outreach.** A daily background service that knows about birthdays,
   anniversaries and memorial dates — some of which fall on a **lunar calendar** and
   therefore move against the Gregorian one every year — plus audience segmentation and a
   campaign dashboard.

### The constraints that actually shape the work

These are the things that make this engagement interesting, and they are why the challenge
looks the way it does:

- **Money is involved and it is somebody's donation.** A rounding error is not a rounding
  error, it is a receipt that does not match a bank statement, discovered by a volunteer
  treasurer six weeks later. Money is stored in integer minor units here. Always.
- **Concurrency is not theoretical.** Their traffic is spiky and event-driven: a
  fundraising email goes out and 300 people hit the same page in ninety seconds.
- **The data is sensitive.** Home addresses, phone numbers, family relationships, religious
  participation, giving history. A leak here is not embarrassing, it is harmful. We treat
  authorisation on every single endpoint as non-optional.
- **The audience is bilingual.** English and Nepali (Devanagari). Names do not fit into
  ASCII assumptions. `toLowerCase()` is not a search strategy.
- **Timezones and calendars are hard here.** The client is in US Central. Donors are
  worldwide. Some dates are lunar. "Today" is a genuinely difficult question.
- **There is no QA department at the client.** If we do not catch it, a donor does.
- **Regression risk is the schedule risk.** Most of our work is changes to a system that is
  already taking money. The test suite is what lets us move fast without frightening
  ourselves.

---

## The two roles

### Full-Stack Engineer

You would own features end to end: schema, API, UI, tests, and the deploy. You would spend
most of your time inside an existing codebase rather than starting new ones. We expect you
to push back on a specification when it is wrong, in writing, before you build it.

### QA Engineer

You would own the definition of *done*. Test strategy, exploratory testing on every feature
before it ships, an automated regression suite that runs in CI, and the bug reports that
make a developer able to reproduce something in one read. You are not a manual clicker and
you are not only an automation script author — you are the person who asks "what happens if
two people do this at the same time?" before it reaches a donor.

Both roles report to the technical lead and sit in the same standup. QA is not downstream
of engineering here; it is beside it.

---

## Why the challenge is what it is

The full-stack exercise is a **donation tracking page**, because that is a small honest
slice of the real work: money, concurrency, authorisation, an admin view, and a deploy.

The QA exercise is **a hall-booking system we broke on purpose** — a different corner of the
same platform, so the two exercises do not overlap — because your first month on this job
would be exactly that: arriving at a system somebody else wrote, finding what is wrong with
it, and building the net that stops it happening again.

Neither exercise contains anything from a client repository. Both were written for hiring.
