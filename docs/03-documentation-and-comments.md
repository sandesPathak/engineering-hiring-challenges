# Documentation and comments

Our clients have no engineering team, our own team is spread across timezones, and the
person who maintains your code in eight months is a stranger. Documentation is not a chore
we bolt on at the end here; it is part of the deliverable, and it is graded.

That does **not** mean "write a lot". It means "write the things a reader cannot get from
the code".

---

## Your root README

This is the most important file in your submission. We read it first, and we run your
project from it without deviating.

It must contain, in roughly this order:

### 1. What this is
Two or three sentences. What you built, for which role.

### 2. Stack and why
A short table, and a sentence per non-obvious choice.

```markdown
| Layer | Choice | Why |
|---|---|---|
| Runtime | Node 24 LTS | Native test runner and `node:sqlite`, no extra deps |
| API | Fastify | Schema validation is built in, so my DTOs and my docs cannot drift |
| DB | Postgres 16 | I need `SELECT ... FOR UPDATE` for the hold logic |
| Front end | Next.js 15 | Matches the stack described in the brief |
```

"Why" does not have to be profound. "It is what I am fastest in, and speed mattered with a
day on the clock" is a completely acceptable and honest answer that we respect.

### 3. How to run it — two paths, both tested

**Docker path** (must work, this is the one we use):

```bash
cp .env.example .env
docker compose up --build
# web  → http://localhost:3000
# api  → http://localhost:4000
```

**Local path** (for someone who wants to develop on it):

```bash
nvm use            # or: node 24
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then: **what should I see?** "Open http://localhost:3000 and you should land on the
campaign page showing 42 seeded donations and a progress bar at 61%." Without that sentence
we do not know whether what we are looking at is correct.

### 4. Test accounts and seed data
Exact credentials, in plain text, in the README. This is a throwaway exercise; hiding them
helps nobody.

```
admin@example.org  /  admin12345      (admin: sees all donations, can refund, can export)
donor@example.org  /  donor12345      (donor: sees only their own giving history)
```

### 5. How to run the tests
The command, and **what currently passes and what does not**. Be honest. "38 pass, 2 fail —
both in the timezone tests, I know why and it is in the Known Issues section" is a strong
README. A README that claims everything passes when it does not is the worst possible
outcome, because we run them.

### 6. Decisions and trade-offs
The section that moves you up a band. Three to eight bullets:

- What you deliberately did not build, and why
- Where you knew the "right" answer and chose a cheaper one because of the clock
- Anything in the spec you thought was wrong
- Anything you would change first if this were going to production

### 7. Known issues
Everything you know is broken or half-done. Writing it down converts a defect into
self-awareness.

### 8. API reference
Endpoint, method, auth requirement, request shape, response shape, error codes. A table or
an OpenAPI file both count. Do not make us read the router to find out what exists.

### 9. Video link
Right at the top or right at the bottom. Not buried.

### 10. AI usage
A link to your `AI-USAGE.md` — see [`07-ai-coding-agents.md`](07-ai-coding-agents.md).

---

## Per-folder READMEs

Any folder that a reader would have to reverse-engineer gets a short README. In a monorepo
that means at minimum:

```
README.md                 the main one, above
apps/api/README.md        how to run just the API, env vars, migration commands
apps/web/README.md        how to run just the front end, which API it expects
packages/shared/README.md what lives here and what must never live here
docs/                     anything longer than a README section
```

Three sentences each is plenty. The question each one answers is: *"I have just opened this
folder. What is it, how do I run it, and what do I need to know before I change something?"*

---

## Comments in code

We have one rule, and we apply it to ourselves.

> **Comments explain *why*. The code already says *what*.**

```js
// Bad — restates the line
// increment the counter
counter += 1;

// Bad — a wall of ceremony around an obvious function
/**
 * Gets the donation.
 * @param {string} id - The id.
 * @returns {Donation} The donation.
 */

// Good — records a decision the reader cannot infer
// Amounts are integer cents everywhere below this line. The API accepts
// dollars as a string and converts once, here, so no float ever touches
// the arithmetic.

// Good — flags a thing that looks wrong and is not
// We deliberately re-read the hold inside the transaction even though we
// just read it above. The first read is for the 404; this one is for the
// race.

// Good — names the constraint behind a magic number
// Ten minutes, from the change order. Do not shorten it without asking —
// donors on mobile need the time to finish the card form.
const HOLD_DURATION_MS = 10 * 60 * 1000;
```

**Density.** Most functions need no comment. A file with a comment on every third line is
as hard to read as one with none. Comment the decisions, the invariants, and the parts that
look wrong but are deliberate.

**Do not leave AI commentary in.** Agents write comments like `// Step 3: Now we will
create the handler` and `// This ensures robust error handling`. Delete them. They are the
clearest possible signal that nobody read the output. See
[`07-ai-coding-agents.md`](07-ai-coding-agents.md).

**Types are documentation.** A precise TypeScript type or a JSON schema is worth more than
a paragraph and cannot go stale. Prefer it.

---

## Length limits we hold ourselves to

- **No source file over 500 lines.** When one gets close, split it along a real seam — by
  responsibility, not by cutting it in half. If there is no clean seam, that is a design
  problem, and we would rather you name it in the README than hide it.
- **No function you cannot see the whole of on one screen**, with rare and justified
  exceptions.

These are house rules, not universal law. We are telling you because we apply them in
review, and it is unfair to grade you against a standard we kept to ourselves.
