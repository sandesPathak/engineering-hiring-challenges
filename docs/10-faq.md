# FAQ

Read this before emailing. If your question is not here, email
**025pathaksandesh@gmail.com** with `[Challenge Question]` in the subject and we answer
within one working day. Asking a good clarifying question is a point in your favour.

---

### Is this exercise paid?

No, and we know that is a real cost to you. It is why we capped it at 5–8 hours of work and
published the entire rubric instead of making you guess. If you would rather do a paid
trial day on a real ticket instead, reply and say so — we will arrange it. Several people
have.

### Do you use the submissions in production?

No. Never. Nothing in this exercise touches a client system, and we do not take code from
it. The reference app is fictional and the specs were written for hiring.

### 24 hours from when, exactly?

From the timestamp on the email that sent you this repository link. If you open it at 9pm on
a Friday and would rather start Saturday morning, just reply and say so — we will restart
your clock. We would rather you did it rested.

### Can I have more time?

Yes, if you ask before the deadline. Family, work, illness, a visa appointment — reply to
the email and name a new time. We have never refused. Going quiet and submitting late is
the only version of this that costs you.

### I can only spend three hours. Is it worth submitting?

Yes. Do the must-haves, write an honest README about what you cut and why, record the video.
That has scored higher than complete-but-sloppy submissions more than once.

### Can I use my own boilerplate or a starter template?

Yes. Say so in your README and be clear about which parts are pre-existing. We grade what
you did in the exercise, and pointing at your own starter is not cheating — it is what you
would do at work.

### Can I use AI?

Yes. Read [`07-ai-coding-agents.md`](07-ai-coding-agents.md) — there is a required
`AI-USAGE.md` file, and there is one rule about being able to defend every line.

### Which framework should I use?

Whatever you are fastest in and can defend. The client platform is Next.js + TypeScript +
Tailwind with a separate Node API, so matching that is a small advantage in the "would this
person be productive on day one" sense. It is a small advantage. It is not worth learning a
framework in a day to get it.

### Which database?

Yours. See [`08-node-and-tooling.md`](08-node-and-tooling.md). Postgres is the safe answer
because the hard part of the exercise is a concurrency problem. If you choose SQLite or
Mongo, address concurrency explicitly in your README.

### Does the database have to run inside Docker?

**Yes.** It is a service in your own `docker-compose.yml` and it starts with
`docker compose up --build`. We will not create a cloud database or install Postgres to
review your work, and a free-tier hosted URL will be expired or rate-limited by the time we
open it. Use `postgres:16-alpine` with a named volume and a healthcheck — or SQLite with a
named volume, which needs no `db` service at all. Both shapes are written out in
[`05-docker-and-deployment.md`](05-docker-and-deployment.md).

### What do I actually need installed?

Node 24, Docker, Git, a GitHub account and a screen recorder. Nothing else — no Postgres on
your machine, no cloud account. The links are in the
[root README](../README.md#what-you-need-installed).

### Do I have to build a real payment integration?

**No.** Explicitly not. The client's payments already work in production and are out of
scope. Your brief describes a fake payment provider — use it. Wiring up a real Stripe or
Square key would be a security finding against you, not a bonus.

### Does the design have to look good?

It has to be legible, usable, and not broken on a phone. That is it. There is no Figma file.
Spending three hours on CSS is a scoping mistake, and we will say so.

### Do I need to deploy it somewhere?

No. `docker compose up` is the requirement. A live URL is a small bonus.

### How much of the stretch goals should I do?

Possibly none. Must-haves done properly, with tests and a good README, outscores everything
attempted at 60%. If you do reach for a stretch goal, pick the concurrency one — it is the
one that tells us the most.

### The spec is ambiguous about X.

Good — some of that is deliberate. Make a decision, write it in your README under
Decisions, and move on. Explaining your interpretation is worth more than getting our
unstated intent right by luck. If it is genuinely blocking, email us.

### Can I add features that are not in the spec?

Prefer not to. Scope discipline is being assessed. If you have a strong idea, do the
must-haves first and add it last, clearly labelled in the README as an extra.

### Can I submit in a language other than JavaScript/TypeScript?

For the **full-stack** role, the backend may be Python, Go, Java, C#, Ruby, PHP or Rust if
that is where you are strongest — say so in your README. The front end should be a modern
JavaScript framework, because that is unambiguously what the job involves.

For the **QA** role, the automation may be in any language with a maintained Playwright,
Selenium or Cypress binding — Python and Java Playwright are both fine.

### Can I work with someone else?

No. The submission has to be yours, because the interview is one hour of you defending it.
Asking a friend a question is normal and fine. Having them write it is not.

### Do you accept submissions from outside the US?

Yes. The team is distributed. Tell us your timezone in the email.

### What happens after I submit?

Two people read it independently against the published rubric, then compare. You hear back
within three working days either way. If we move forward, the next step is a single ~60
minute round — a code walkthrough of your own submission, then a behavioural conversation.
See [`11-interview-process.md`](11-interview-process.md).

### What if I find a bug in *your* challenge repository?

Tell us — genuinely. Open an issue on your fork or mention it in your README. We have fixed
two things that candidates found, and both people were credited in the interview. (QA
candidates: the defects in your reference app are planted on purpose. Finding those is the
exercise, not a favour.)

### Can I reapply if I am rejected?

Yes, after three months. We will have told you the specific reason, and people who came
back having fixed it have been hired.

### Can I put this on my public GitHub / in my portfolio?

Yes, and please do. It is your work. A link back to this repository so the context is clear
is appreciated but not required.
