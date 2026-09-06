# AI coding agents

**You may use them. We do. Read the rest of this page before you start.**

Pretending otherwise would make this exercise a test of whether you can hide something,
which is not a quality we are hiring for. Our own team uses coding agents daily, on client
work, and the productivity difference is real.

So the exercise is not "did you use AI". It is **"can you own what came out of it"**.

---

## The one rule

> **You must be able to explain and defend every line you submit, live, without notes.**

In the interview we will open a file — often one we suspect you did not write by hand — and
ask why it is that way. What that call does. What happens if the input is empty. Why you
chose this approach over the obvious alternative. What breaks if we delete this line.

"The AI wrote that part" ends the interview. Not because you used AI, but because you shipped
code you had not read, and in this domain that is how a donor's address ends up in a public
JSON response.

The person we want is the one who used an agent to move four times faster and then read
every line it produced, deleted a third of it, and can argue about the rest.

---

## Tools you may use

Any of them. Pick what you are fastest in:

- **Claude Code**, Cursor, GitHub Copilot, Windsurf, Codex, Gemini CLI, Aider, Cline, Zed
- Any chat assistant, in a browser, alongside your editor
- Stack Overflow, documentation, blog posts, a book, a friend who is a developer

The only thing that is not allowed is **submitting somebody else's completed solution to
this exercise as your own**. If a friend writes it, that is not you, and it will surface in
the first four minutes of the interview.

---

## Required: `AI-USAGE.md`

Add a file called `AI-USAGE.md` at the root of your submission. It is short — half a page.
It is **required**, and it is the easiest few points in this exercise.

```markdown
# AI usage

## Tools
- Claude Code (Opus) for the API layer and the tests
- Copilot inline completions throughout
- ChatGPT for a Postgres row-locking question I could not remember the syntax for

## Roughly how much
About 60% of the first draft of the code. Close to 100% of the boilerplate — Dockerfile,
compose file, eslint config. Almost none of the schema design or the hold logic, which
I worked out on paper first because I wanted to be sure about the concurrency.

## What I changed about what it produced
- It generated the hold check as a read followed by an update. That is the exact race the
  brief warns about, so I rewrote it as a single conditional UPDATE and added a test that
  fires 20 concurrent requests at one unit.
- It kept storing money as a float. I changed every amount to integer cents and added a
  lint rule.
- It wrote a lot of JSDoc that restated the function names. I deleted it.
- Its first Dockerfile was single-stage and ran as root. I made it multi-stage and added
  `USER node`.

## What I did not let it near
The authorisation rules. I wanted to reason about every one of those myself, and I wrote
the tests for them first.
```

**Why we want it:** the "what I changed" section is one of the strongest signals in the
whole submission. It shows us your review instincts, which is most of what senior
engineering is now. A candidate who writes four specific things they caught and corrected
is telling us more than a thousand lines of clean code would.

An honest `AI-USAGE.md` that says "I used it for almost everything" is fine. A missing one,
or one that says "minimal AI usage" attached to code with `// Step 1:` comments and three
different naming conventions in it, is not.

---

## Where agents reliably let people down

We see the same failures every round. These are worth checking for by hand before you
submit — each one is also a real production bug we have fixed for a client:

| Area | What the agent tends to produce |
|---|---|
| **Money** | `parseFloat`, `toFixed(2)`, float columns. Wrong in a donation system. |
| **Concurrency** | Read, check, then write, in two statements, with no transaction. The exact race. |
| **Authorisation** | An auth *middleware* and then no per-record ownership check. |
| **Errors** | `catch (e) { res.status(500).json({ error: e.message }) }` — leaking internals. |
| **Timezones** | `new Date()` and `getMonth()` with no zone, then "today" is wrong for half your users. |
| **Unicode** | `toLowerCase()` and ASCII assumptions. Devanagari search silently returns nothing. |
| **Tests** | Many assertions on trivia, none on the thing that is actually hard. Mocks that assert the mock. |
| **Docker** | Single stage, running as root, `node_modules` copied from the host, `depends_on` with no health check. |
| **Comments** | `// Step 3: create the handler`, `// This ensures robust error handling`. Noise. |
| **Consistency** | Three naming conventions and two error shapes, because each file was generated in isolation. |

That table is, more or less, the review checklist we would use on your first pull request.
Running it over your own work before you submit is free points.

---

## Style tells, and what to do about them

You do not need to hide that an agent was involved — we assume it. But these make code
*worse to maintain*, so clean them up for their own sake:

- Comments narrating the code instead of the reasoning
- Ceremonial JSDoc on self-evident functions
- Defensive try/catch around code that cannot throw
- Three helper files with one function each, invented for a single call site
- README sections full of "comprehensive", "robust", "seamless", "leverages"
- Emoji-headed bullet lists in a technical document
- Inconsistent error shapes between two endpoints written twenty minutes apart

**Read your whole diff before you commit.** Not skim — read. That habit is the actual skill
we are hiring for, and it is visible in the result from across the room.

---

## For QA candidates

Everything above applies. Two additions:

- Generated test suites are notorious for **asserting the mock rather than the behaviour**,
  and for lots of shallow assertions that all pass whatever the app does. Check that each
  of your tests **fails when the bug is present**. A regression test that has never been red
  is not a regression test.
- Do not let an agent write your bug reports without editing them. A report that says
  "the application exhibits unexpected behaviour" is worthless to a developer. The value of
  a bug report is exact reproduction steps, the actual result, the expected result and
  **why you believe it is wrong** — with a citation to the spec.
