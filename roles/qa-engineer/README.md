# QA Engineer — Take-Home Challenge

**We broke a booking system on purpose. Find what is wrong with it, prove it, and build
the net that stops it coming back.**

| | |
|---|---|
| **Clock** | 24 hours from the email that sent you this link |
| **Expected work** | 5–8 hours. Please do not spend more. |
| **The app** | [`app/`](app/) — runs in one command, no build step |
| **The spec** | [`app/SPEC.md`](app/SPEC.md) — the source of truth for what is a defect |
| **Deliverables** | A test plan, bug reports, an automated suite, a summary, and a 2–3 minute video |

## Which files do I actually need?

**Five files, then start testing.** Everything else is reference.

| | File | |
|---|---|---|
| **Read now** | [`SETUP.md` → Step 0](SETUP.md#step-0--get-your-machine-ready-10-minutes-do-it-first) | What to install, with links. Node 24, Docker, Git. Ten minutes. |
| **Read now** | [`app/README.md`](app/README.md) | How to run it, the accounts, and the seeded numbers you can check by hand. |
| **Read now** | [`app/SPEC.md`](app/SPEC.md) | **The source of truth for what counts as a defect.** §7 lists behaviour that looks wrong and is not — reporting those costs points. |
| **Read now** | [`REQUIREMENTS.md`](REQUIREMENTS.md) | The five deliverables. |
| **Read now** | [`SETUP.md`](SETUP.md) | A suggested path through the day, with the API commands to get you moving. |
| Reference | [`templates/`](templates/) | Bug report, test plan and test summary templates. Use them or do not — they show what we expect a report to contain. |
| Before you submit | [`CHECKLIST.md`](CHECKLIST.md) | Thirty minutes, and it protects the biggest scoring category. |
| If curious | [`RUBRIC.md`](RUBRIC.md) | The exact points breakdown. |

---

## The scenario

You have joined a small studio. On your second day the technical lead hands you version
2.3.1 of **Sabhaghar Booking**, the hall and facility booking system for a cultural centre,
and says:

> "It goes live on Friday, and wedding season starts the week after. Nobody has tested it
> properly. Here is the spec. Tell me what I am walking into, and leave me something that
> stops it happening again."

That is the exercise. It is also, more or less, a real Tuesday here.

## What we are actually assessing

Not "how many bugs did you find". Three things:

1. **Judgement.** Did you find the ones that matter, and did you rank them the way somebody
   with money on the line would rank them? A member's home address exposed to any logged-in
   user is not the same class of problem as a misaligned button, and a report that lists
   them next to each other tells us you cannot tell.
2. **Rigour.** Can a developer reproduce your bug from your report, first read, without
   asking you a question? Do you cite the spec rather than your opinion?
3. **Leverage.** Does your automated suite actually protect the codebase, or does it assert
   that a page has a title? A regression test that has never been red proves nothing.

## What is in the app

Everything you need is running. There are defects across all of these areas, and the number
of them in each is deliberately not stated:

- money and arithmetic — hire fees, deposits, totals
- authentication, authorisation, and what leaves the server in a payload
- concurrency — two members booking the same room at the same moment
- data handling: search, pagination, filtering, export
- input validation
- rendering member-supplied text
- dates, times and the rules about when a room is free
- accessibility

Some are visible in the interface. Several are only visible in an API response, which is a
hint about where to spend your time. At least one needs two browser tabs or two concurrent
requests to see at all.

**Some behaviour that looks wrong is correct** and is documented in `SPEC.md` §7. Reporting
those costs you points — reading the specification carefully is part of the job.

---

## What a good 6-hour submission looks like

So you can calibrate rather than guess. This is a **strong** submission, not a minimum one:

- A two-page `TEST-PLAN.md` with a real out-of-scope list and a risk ranking
- **Eight bug reports**, ranked, of which two or three are serious and at least one is not
  visible in the interface
- **Nine automated tests**: six API, one concurrency, one UI flow, one that fails and is
  labelled with the bug it covers
- A `TEST-SUMMARY.md` that ends in a go / no-go recommendation with conditions
- Nine commits and a three-minute video

**No CI workflow. No load testing. No cross-browser matrix. Eight bugs, not twenty-five.**
That submission scores in the eighties. The submissions that score below sixty are almost
never the ones that found fewer bugs — they are the ones with twenty green UI tests, no
ranking, and no recommendation.

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
