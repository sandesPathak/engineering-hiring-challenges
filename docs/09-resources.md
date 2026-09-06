# Resources

Curated, not exhaustive. You do not need to read any of this to complete the exercise — it
is here because a hiring exercise is a poor use of your day if you learn nothing from it.

Starred (★) items are the ones we would actually open during the work.

---

## Money in software

- ★ **[Martin Fowler — Money pattern](https://martinfowler.com/eaaCatalog/money.html)** — why an amount and a currency travel together
- ★ **[Dinero.js](https://v2.dinerojs.com/docs)** — a money library. Read its "why" page even if you hand-roll it
- **[0.30000000000000004.com](https://0.30000000000000004.com/)** — floating point in every language, in one page
- **[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)** — formatting currency at the display edge
- **[Postgres numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html)** — why `NUMERIC`, and why never `FLOAT`, for money

## Concurrency, locking and idempotency

The heart of the hard part of both exercises.

- ★ **[Postgres — explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)** — `FOR UPDATE`, `FOR UPDATE SKIP LOCKED`
- ★ **[Postgres — transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)** — what Read Committed does and does not protect you from
- ★ **[Stripe — designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency)** — the canonical write-up
- **[Optimistic vs pessimistic locking](https://vladmihalcea.com/optimistic-vs-pessimistic-locking/)** — how to choose
- **[Postgres advisory locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)** — for when the thing you are locking is not a row
- **[Jepsen — consistency models](https://jepsen.io/consistency)** — deeper than you need, excellent

## Web security

- ★ **[OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)** — the shared vocabulary
- ★ **[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)** — the one to bookmark. Especially *Authorization*, *Cross-Site Scripting Prevention*, *SQL Injection Prevention*, *Password Storage*
- ★ **[OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)** — API1 (Broken Object Level Authorization) is the one we plant most often
- **[OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)** — QA candidates: this is your structure
- **[OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)** — a requirements checklist you can lift from
- **[PortSwigger Web Security Academy](https://portswigger.net/web-security)** — free, hands-on, the best security training on the internet
- **[helmet](https://helmetjs.github.io/)** and **[MDN — CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)**

## API design

- ★ **[Zalando RESTful API guidelines](https://opensource.zalando.com/restful-api-guidelines/)** — opinionated, practical
- **[RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)** — a standard error shape, so you do not invent one
- **[Zod](https://zod.dev/)** — schema validation that gives you TypeScript types for free
- **[Fastify — validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)**

## Docker

- ★ **[Docker — Node.js language guide](https://docs.docker.com/language/nodejs/)**
- ★ **[Docker — building best practices](https://docs.docker.com/build/building/best-practices/)**
- **[Compose file reference](https://docs.docker.com/reference/compose-file/)** — health checks, `depends_on` conditions
- **[Snyk — 10 Docker security best practices](https://snyk.io/blog/10-docker-image-security-best-practices/)**

## Testing and QA

- ★ **[Playwright docs](https://playwright.dev/docs/intro)** — start with *Writing tests*, *Locators*, *Auto-waiting*, *Fixtures*
- ★ **[Testing Library — guiding principles](https://testing-library.com/docs/guiding-principles)** — why you query by role and text, not by CSS class
- ★ **[Ministry of Testing — the Test Heuristics Cheat Sheet](https://www.ministryoftesting.com/articles/the-test-heuristics-cheat-sheet)** — printable, and it will find you bugs today
- **[Elisabeth Hendrickson — *Explore It!*](https://pragprog.com/titles/ehxta/explore-it/)** — the best book on exploratory testing
- **[James Bach — Rapid Software Testing](https://www.satisfice.com/rapid-testing-methodology)** — session-based test management, charters
- **[Martin Fowler — the practical test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)**
- **[Kent C. Dodds — write tests, not too many, mostly integration](https://kentcdodds.com/blog/write-tests)**
- **[k6 docs](https://grafana.com/docs/k6/latest/)** — load and concurrency testing
- **[Playwright — API testing](https://playwright.dev/docs/api-testing)** — you can drive the API and the UI from the same suite

## Accessibility

Not a bonus in this domain. A significant part of this client's membership is over 65.

- ★ **[WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)** — filter to A and AA
- ★ **[axe DevTools](https://www.deque.com/axe/devtools/)** — browser extension, finds real issues in one click
- **[@axe-core/playwright](https://playwright.dev/docs/accessibility-testing)** — automate it in your suite
- **[WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)** — how a modal, a combobox and a tab set are supposed to behave
- **[WebAIM — keyboard accessibility](https://webaim.org/techniques/keyboard/)**

## Internationalisation, Unicode and dates

Directly relevant: the client's audience reads English and Nepali, and some of their dates
are lunar.

- ★ **[Unicode case folding, explained](https://www.b-list.org/weblog/2018/nov/26/case/)** — why `toLowerCase()` is not a search strategy
- ★ **[String.prototype.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)** — NFC vs NFD, and why two identical-looking names are not equal
- **[Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator)** — locale-aware comparison and sorting
- **[Postgres full-text search](https://www.postgresql.org/docs/current/textsearch.html)** and **[pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)** for fuzzy matching
- **[Temporal API](https://tc39.es/proposal-temporal/docs/)** — where JavaScript dates are going
- **[date-fns-tz](https://github.com/marnusw/date-fns-tz)** / **[Luxon](https://moment.github.io/luxon/)** — timezone maths that works today
- **[The Problem with Time & Timezones (Computerphile)](https://www.youtube.com/watch?v=-5wpm-gesOY)** — ten funny minutes that will save you a day

## Writing — genuinely worth twenty minutes

- ★ **[How to write a good bug report](https://testsigma.com/blog/how-to-write-a-good-bug-report/)** — QA candidates, read this before you write your first one
- ★ **[Conventional Commits](https://www.conventionalcommits.org/)** — even if you do not adopt it
- **[How to write a good commit message](https://cbea.ms/git-commit/)** — the standard reference
- **[Google — technical writing one](https://developers.google.com/tech-writing/one)** — free, two hours, improves every document you write afterwards
- **[Architecture Decision Records](https://adr.github.io/)** — how to write down a decision in ten lines

## Front end

- **[Next.js — App Router](https://nextjs.org/docs/app)** — the client platform is built on this
- **[Tailwind CSS](https://tailwindcss.com/docs)** and **[Radix Primitives](https://www.radix-ui.com/primitives)** — the client's component layer
- **[web.dev — Core Web Vitals](https://web.dev/articles/vitals)**
- **[Inclusive Components](https://inclusive-components.design/)** — how to build a component that works for everybody

---

## If you only have thirty minutes

1. The **OWASP Authorization cheat sheet** — it is the most common thing we find missing
2. **Stripe on idempotency** — it reframes how you think about write endpoints
3. The **Postgres explicit locking** page — twenty minutes that make the hard part easy
4. The **Test Heuristics Cheat Sheet** — QA candidates, this will find you a bug within the hour
