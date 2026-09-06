# QA Engineer — Take-Home Challenge

**We broke a donation app on purpose. Find what is wrong with it, prove it, and build the
net that stops it coming back.**

| | |
|---|---|
| **Clock** | 24 hours from the email that sent you this link |
| **Expected work** | 5–8 hours. Please do not spend more. |
| **The app** | [`app/`](app/) — runs in one command, no build step |
| **The spec** | [`app/SPEC.md`](app/SPEC.md) — the source of truth for what is a defect |
| **Deliverables** | A test plan, bug reports, an automated suite, a summary, and a 2–3 minute video |

## Read these first

1. [`../../docs/00-about-us-and-the-project.md`](../../docs/00-about-us-and-the-project.md) — why this exercise looks like this
2. [`app/README.md`](app/README.md) — how to run it, the accounts, the seeded numbers
3. [`app/SPEC.md`](app/SPEC.md) — **read this properly.** §7 lists the behaviour that looks like a bug and is not
4. [`REQUIREMENTS.md`](REQUIREMENTS.md) — what you have to produce
5. [`SETUP.md`](SETUP.md) — a suggested path through the day
6. [`RUBRIC.md`](RUBRIC.md) — exactly how the 100 points are allocated
7. [`CHECKLIST.md`](CHECKLIST.md) — tick this before you submit

---

## The scenario

You have joined a small studio. On your second day the technical lead hands you version
1.4.2 of **Aangan Giving**, a donation tracker built for a cultural centre, and says:

> "It goes to the client on Friday for a fundraising drive. Nobody has tested it properly.
> Here is the spec. Tell me what I am walking into, and leave me something that stops it
> happening again."

That is the exercise. It is also, more or less, a real Tuesday here.

## What we are actually assessing

Not "how many bugs did you find". Three things:

1. **Judgement.** Did you find the ones that matter, and did you rank them the way somebody
   with money on the line would rank them? A donor's home address exposed to any logged-in
   user is not the same class of problem as a misaligned button, and a report that lists
   them next to each other tells us you cannot tell.
2. **Rigour.** Can a developer reproduce your bug from your report, first read, without
   asking you a question? Do you cite the spec rather than your opinion?
3. **Leverage.** Does your automated suite actually protect the codebase, or does it assert
   that a page has a title? A regression test that has never been red proves nothing.

## What is in the app

Everything you need is running. There are defects across all of these areas, and the number
of them in each is deliberately not stated:

- money and arithmetic
- authentication, authorisation, and what leaves the server in a payload
- concurrency — two people doing the same thing at the same moment
- data handling: search, pagination, filtering, export
- input validation
- rendering donor-supplied text
- dates and timezones
- accessibility

Some are visible in the interface. Several are only visible in an API response, which is a
hint about where to spend your time. At least one needs two browser tabs or two concurrent
requests to see at all.

**Some behaviour that looks wrong is correct** and is documented in `SPEC.md` §7. Reporting
those costs you points — reading the specification carefully is part of the job.

---

## Submitting

Follow [`../../SUBMISSION.md`](../../SUBMISSION.md). Zip named `FirstName_LastName.zip`,
GitHub link, video link, to **025pathaksandesh@gmail.com** with the subject
`QA Challenge — FirstName LastName`.

## A word on scope

You cannot test everything in a day, and we are not asking you to. **A stated strategy that
explains what you covered, what you deliberately did not, and why, is worth more than
undirected clicking that happens to find one more bug.** Say what you left out. That
sentence is one of the strongest signals in the whole submission.
