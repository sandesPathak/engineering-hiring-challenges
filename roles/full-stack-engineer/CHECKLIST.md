# Pre-submission checklist — Full-Stack Engineer

Thirty minutes with this list is worth more than thirty minutes of extra features. Do it
before you record the video, so the video shows the fixed version.

## It runs

- [ ] `docker compose down -v && docker builder prune -f`, then `docker compose up --build`
      from a **fresh clone**, and it works
- [ ] I followed my own README word for word, using nothing that is only in my head
- [ ] Migrations and seed run automatically, or the README says exactly what to run
- [ ] Both URLs are in the README and both load
- [ ] The cold-build time is noted in the README

## The seed data traps

- [ ] All 75 donations imported
- [ ] `aangan-courtyard` shows **$43,058.00** raised — exactly, no floating-point tail
- [ ] Refunded and failed donations are excluded from the total, the donor count and the list
- [ ] Searching the admin list for `गुरुङ` finds the donor
- [ ] Neither `<script>alert(1)</script>` nor the `onerror` payload executes anywhere —
      public page, admin table, or CSV opened in a browser

## Money

- [ ] No `FLOAT`, `REAL` or `DOUBLE` on any monetary column
- [ ] No `parseFloat` or `toFixed` in any arithmetic path
- [ ] $0.99 rejected, $1.00 accepted, $25,000.00 accepted, $25,000.01 rejected
- [ ] A negative amount, a string and `null` are all rejected with a 4xx, not a 500
- [ ] Formatting happens once, at the display edge

## Security

- [ ] `git log -p | grep -Ei '(api[_-]?key|secret|password|token|PRIVATE KEY)'` finds nothing real
- [ ] `.env` is not committed; `.env.example` is
- [ ] An anonymous donation's public JSON contains **no** donor name, email or id —
      I checked with `curl`, not in the browser
- [ ] `donor@` cannot fetch `other@`'s donation, and gets a **404**
- [ ] A non-admin cannot reach any `/admin` route
- [ ] Passwords hashed with bcrypt/argon2/scrypt
- [ ] Session tokens are random and expire
- [ ] Every endpoint validates its input with a schema
- [ ] `sort` and `dir` come from an allow-list, not string interpolation
- [ ] `npm audit --omit=dev` — I know the number and can defend what is left

## Correctness

- [ ] Refunding updates the status, the audit row and every aggregate in one transaction
- [ ] The payment decline path shows the donor something honest
- [ ] `tok_timeout` is handled — the request does not hang forever, and the outcome is documented
- [ ] An empty campaign renders `0%`, not `NaN%`
- [ ] The page is usable at 375px wide

## Tests

- [ ] `npm test` passes, and the README says which tests exist and which fail
- [ ] There is a test for authorisation
- [ ] There is a test for the refund aggregate
- [ ] There are money boundary tests
- [ ] *(If I built S0)* the CSV export keeps `Shrestha, Bijay "BJ"` intact with no column
      shift, the Devanagari name is readable, and page 2 neither repeats nor skips a row
- [ ] `npm run lint` passes clean, not "clean with warnings"

## Documentation and history

- [ ] Root README: what it is, stack and why, how to run, test accounts, tests, **Decisions**,
      **Known issues**, API reference, video link
- [ ] A short README in `apps/api`, `apps/web` and `packages/shared`
- [ ] `AI-USAGE.md` exists and says specifically what I changed about what the agent produced
- [ ] I read my whole diff and deleted the AI narration comments, the dead code and the `console.log`
- [ ] More than one commit, human messages, nothing called `final`

## Delivery

- [ ] Video is 2–3 minutes and the link opens in a private browser window
- [ ] Repo is public, or private with `@sandesPathak` invited
- [ ] Zip named `FirstName_LastName.zip`, excludes `node_modules`, includes `.git`, under 50 MB
- [ ] Email subject: `Full-Stack Challenge — FirstName LastName`
