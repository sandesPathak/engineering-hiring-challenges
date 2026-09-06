# Node, versions and tooling

Short version: **Node 24 LTS**, any package manager, any database, run the linter, run the
tests, keep the dependency list boring.

---

## Node

| | |
|---|---|
| **Target** | **Node 24 LTS** (current LTS as of this hiring round) |
| **Also accepted** | Node 22 LTS |
| **Not accepted** | Node 20 or below (out of maintenance), odd-numbered releases |

Commit a `.nvmrc` (or `.tool-versions`) with your version, and pin it in `package.json`:

```json
{
  "engines": { "node": ">=22.11 <25" },
  "packageManager": "pnpm@9.12.0"
}
```

Pin the same major in your Dockerfile — `FROM node:24-alpine`, never `node:latest`. A base
image that floats is a build that breaks in three weeks for reasons nobody can reproduce.

**Why we care:** the client platform is being kept on a supported LTS, and a submission
targeting Node 18 tells us you have not checked what is current. It is a small thing that
correlates with a lot of other small things.

### Node 24 features worth knowing about, because we use them

- `node --test` — a built-in test runner, no dependency required
- `node --watch` — no `nodemon`
- `node --env-file=.env` — no `dotenv`
- `require('node:sqlite')` — a built-in SQLite driver, no native build
- Stable `fetch`, `AbortController`, `structuredClone`

You are not required to use any of these. But if your `package.json` pulls in `dotenv`,
`nodemon`, `node-fetch` and `uuid` on Node 24, we will ask about it — not as a gotcha, but
because "what does this dependency buy me that the platform does not" is a question we ask
in every review.

---

## Package manager

**pnpm**, **npm** or **yarn**. We use pnpm, and its workspace support is the nicest of the
three for a monorepo, but this is genuinely your call.

Requirements:

- **Commit your lockfile.** A submission with no lockfile does not install reproducibly, and
  that is a category-1 risk for you.
- Use one, not three. Two lockfiles in one repo is a finding.
- Use the frozen install in Docker: `npm ci`, `pnpm i --frozen-lockfile`, `yarn --immutable`.

---

## TypeScript

Strongly preferred, not mandatory. The client codebase is TypeScript end to end.

If you use it: `"strict": true`. A `tsconfig` with strict off, or a codebase sprayed with
`any` and `@ts-ignore`, is worse than honest JavaScript, because it claims a guarantee it
does not provide.

If you use plain JavaScript, say why in the README (speed, familiarity — both fine) and lean
harder on runtime validation at the boundaries and on JSDoc types for anything non-obvious.

---

## Linting and formatting

Set these up **in your first commit**, before feature code exists. Retrofitting a linter is
how standards get skipped, and a diff full of formatting churn at the end hides your actual
work from the reviewer.

- **ESLint** — flat config (`eslint.config.js`), a recommended base, and `typescript-eslint`
  if you are on TS. Configure it strictly from the start; a permissive config that gets
  tightened later never gets tightened.
- **Prettier** (or Biome, which does both and is faster)
- A `format`/`lint` script in `package.json`

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "dev": "...",
    "build": "..."
  }
}
```

`npm run lint` must pass clean before you submit. Not "pass with 40 warnings". If you have
disabled a rule, do it inline with a comment saying why — a blanket disable at the top of a
file is a smell.

---

## Testing

| | |
|---|---|
| **Unit / integration** | Vitest (preferred), Jest, or `node --test` |
| **API** | Supertest, or `fetch` against a running instance |
| **End to end** | Playwright (preferred), Cypress |
| **Load / concurrency** | k6, autocannon, or a hand-rolled `Promise.all` burst |

We do not have a coverage threshold and we will not count your percentage. We look at
**what** you tested.

Test the things that are hard and the things that would hurt: money arithmetic, the
concurrency path, the authorisation rules, boundary values (empty, one, maximum, one over
maximum), and each error branch you actually wrote. Skip the tests that assert a framework
works.

**Test before proceeding.** Get each piece green before you build the next thing on top of
it. It is faster over a day than the alternative, and it is how we work.

---

## Databases

Your choice. What we look for is whether the choice fits the problem and whether you can
defend it.

| | Good when | Watch out for |
|---|---|---|
| **PostgreSQL** *(what we use)* | You need real transactions, `SELECT … FOR UPDATE`, constraints, partial indexes | Nothing, mostly. This is the safe answer. |
| **MySQL / MariaDB** | Familiarity | Weaker constraint support; be careful with isolation levels |
| **SQLite** | A day-long exercise, zero setup, `node:sqlite` is built in | Write concurrency. If you pick it for a challenge about races, address that in your README. |
| **MongoDB** | Document shapes, fast iteration | No multi-document transactions unless you configure them. Money and holds need atomicity — say how you got it. |

Whatever you pick:

- **Migrations, checked into the repo.** Not `synchronize: true`, not a `schema.sql` you run
  by hand and forget to update. Prisma, Drizzle, Knex, TypeORM, node-pg-migrate, Atlas — any.
- **A seed script**, so a reviewer sees a populated page rather than an empty state.
- **Indexes on what you query**, and a sentence about why in a comment or the README.
- **Constraints in the database, not only in the application.** `NOT NULL`, `CHECK
  (amount_cents > 0)`, foreign keys, unique constraints. The application is one bug away
  from writing nonsense; the database is the thing that refuses it.

---

## Monorepo layout (full-stack role)

The full-stack exercise **requires a monorepo**. npm/pnpm/yarn workspaces are entirely
sufficient — Turborepo or Nx are welcome but are not worth the setup time on a one-day
exercise unless you already know them.

```
package.json           workspaces, and the scripts that run the whole thing
pnpm-workspace.yaml
apps/
  api/                 the backend
  web/                 the frontend
packages/
  shared/              types, validation schemas, money helpers — used by BOTH sides
docker-compose.yml
.env.example
```

The thing we look for is **whether `packages/shared` is real**. A monorepo where the two
apps share nothing is two repos in a trench coat. Put the donation types, the Zod schemas
and the money formatting in one place and import them on both sides — then a change to the
API contract breaks the front-end build, which is the entire point.

Root scripts that make a reviewer's life easy:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "db:migrate": "pnpm --filter api db:migrate",
    "db:seed": "pnpm --filter api db:seed"
  }
}
```

---

## Dependencies

Keep the list short and boring. For each one, be ready to answer "what does this buy you".

Fine and expected: your framework, your ORM/query builder, a validation library, a hashing
library, `helmet`, a rate limiter, a date library if you need timezone maths, your test
tooling.

Questionable on a one-day exercise: a state-management library for four pieces of state, a
component library you use two buttons from, `lodash` for one function, a logging framework
with three transports configured.

Run `npm audit --omit=dev` before you submit and know the number.
