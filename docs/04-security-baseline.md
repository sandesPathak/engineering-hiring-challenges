# Security baseline

The platform you would be joining holds home addresses, phone numbers, family
relationships, religious participation and giving history for several thousand people, and
it moves their money. Security is not a checklist item in this domain. It is the domain.

**Both roles are graded on this document.** Full-stack engineers must implement it. QA
engineers must test for its absence — several of the defects planted in your reference app
are security defects, and finding them is worth more than finding a broken layout.

---

## The non-negotiables

If you do nothing else, do these seven.

### 1. No secrets in the repository, or in its history

Commit `.env.example` with placeholder values. Never commit `.env`. Never commit a real key,
token, password, connection string or private key — not even a throwaway one from a free
tier, because we cannot tell the difference by looking.

```bash
# before you submit
git log -p | grep -nEi '(api[_-]?key|secret|password|token|BEGIN [A-Z ]*PRIVATE KEY)' | head -40
```

Passwords for the seeded test accounts in your README are fine and expected. Those are
fixtures, not secrets.

### 2. Every endpoint answers "who are you" *and* "may you touch this record"

Authentication and authorisation are two different checks and the second one is the one
people skip.

```js
// Not enough — any logged-in user gets any donation
app.get('/api/donations/:id', requireAuth, async (req, res) => {
  res.json(await donations.byId(req.params.id));
});

// Correct — ownership is part of the query, not a branch after it
app.get('/api/donations/:id', requireAuth, async (req, res) => {
  const donation = await donations.byIdForViewer(req.params.id, req.user);
  if (!donation) return res.status(404).json({ error: 'not_found' });
  res.json(donation);
});
```

Return **404, not 403**, when a record exists but is not yours. A 403 confirms the record
exists, which is itself a leak — it lets somebody enumerate your donor IDs.

Put the ownership rule **in the query**. A filter applied after the fetch is one refactor
away from being dropped.

### 3. Validate every input at the boundary, with a schema

Zod, Valibot, Joi, AJV, Pydantic, or your framework's built-in — any of them. Hand-rolled
`if (!body.amount)` checks miss things, and `!` treats `0`, `""` and `-1` inconsistently.

Validate: presence, type, range, length, format, and enum membership. Reject unknown
fields rather than passing them through to your ORM — that is how mass-assignment bugs get
in.

**Never trust a client-supplied amount, price, total, status or role.** Look the price up
on the server from the campaign or the catalogue. If your API accepts
`{ amount: 100000000 }` or `{ role: "admin" }` from the browser, that is a finding.

### 4. Money is integer minor units

Cents, as an integer, everywhere: in the database (`BIGINT` / `NUMERIC(12,0)`, never
`FLOAT` or `REAL`), in your API, in your business logic. Convert to a display string once,
at the very edge, with `Intl.NumberFormat`.

Store the currency code next to the amount even if today there is only one.

Rounding, when you cannot avoid it, must be a stated rule and it must be tested. Nothing
ever gets rounded twice.

### 5. Parameterised queries, always

```js
// Injection
db.query(`SELECT * FROM donations WHERE donor_name LIKE '%${q}%'`);

// Fine
db.query('SELECT * FROM donations WHERE donor_name ILIKE $1', [`%${q}%`]);
```

An ORM or a query builder handles this for you — right up until you use its raw-SQL escape
hatch to build a dynamic `ORDER BY` from a query parameter. If you build any SQL by
concatenation, allow-list the fragments. Sort columns and directions come from a fixed map,
never from the request.

### 6. Escape output. Assume every stored string is hostile

A donor writes their dedication message. It is stored. It is rendered on a public wall, in
an admin table, in a PDF certificate and in an email. That is four rendering contexts and
each one escapes differently.

- React/Vue/Svelte escape by default — **do not reach for `dangerouslySetInnerHTML`,
  `v-html` or `{@html}`** to make something render "properly".
- In plain DOM code use `textContent`, never `innerHTML`.
- Set a `Content-Security-Policy`. Even a basic one.
- Sanitise on **output**, per context, not only on input. Input sanitisation destroys data
  and still misses the context you did not think of.

### 7. Do not leak internals in errors

Log the stack trace on the server. Send the client a stable error code and a human sentence.
Stack traces, SQL fragments, file paths and framework versions in a response body are all
reconnaissance.

Also: keep failed login responses identical whether the account exists or not, and take the
same amount of time on both. Otherwise your login form is a user-enumeration endpoint.

---

## Strongly expected, and part of the score

- **Password hashing** with `bcrypt`, `argon2` or `scrypt`. Never SHA-256, never plain, never
  a homemade scheme. Cost factor at the library default or above.
- **Session tokens that are random and expire.** `crypto.randomUUID()` or 32 random bytes.
  A token derived from the email or the user id — `btoa(email)`, `user-42-token` — is a
  forgeable credential and it is the kind of thing we plant on purpose to see who spots it.
- **Cookies:** `HttpOnly`, `Secure`, `SameSite=Lax` or stricter. If you use `localStorage`
  for a token instead, say in your README that you know the trade-off and why you took it.
- **Rate limiting** on login, on password reset and on donation intake. A donation endpoint
  with no limit is a card-testing target in the real world — attackers use donation forms to
  check stolen card numbers, and the client pays a fee for every declined attempt.
- **CSRF protection** if you use cookie sessions with form posts.
- **Security headers.** `helmet` or the equivalent gets you most of them for one line.
- **CORS that names origins.** Not `*`, and not a reflected `Origin` header.
- **Dependency hygiene.** `npm audit --omit=dev` before you submit. You do not have to reach
  zero; you have to know the number and be able to say why a remaining one is acceptable.
- **Do not log secrets or full card-like data.** Log identifiers, not bodies.

## Data-integrity requirements, which are security in this domain

- **Concurrency safety on anything reserved or limited.** Check-then-act across two
  statements is a race. Use a transaction with a row lock, a unique constraint, an atomic
  conditional update, or optimistic concurrency with a version column — any of them, chosen
  deliberately, and **explained in a comment**.
- **Idempotency on writes that move money.** The same request arriving twice — a double
  click, a mobile retry, a webhook redelivery — must not create two donations. An
  idempotency key or a natural unique constraint both work.
- **Refunds and cancellations must be reflected in every aggregate.** A total that counts
  refunded donations is a wrong number on a public page.
- **Timestamps in UTC**, converted for display. "Today" is defined in the organisation's
  timezone, and it is written down somewhere.

---

## Out of scope for this exercise

Do not spend your day on:

- Real payment processing, PCI, or a live payment SDK. Use the fake provider described in
  your brief.
- OAuth or social login, SSO, SAML, MFA.
- Full GDPR/CCPA tooling, encryption at rest, key rotation, secret managers.
- A production WAF, DDoS protection, or infrastructure hardening.

If you notice one of these matters and you have not built it, **write a line about it in
your README**. Naming a risk you chose not to mitigate scores nearly as well as mitigating
it, and it is exactly what we would want from you on a Tuesday afternoon with a deadline.

---

## For QA candidates specifically

Your reference app contains planted security defects. When you find one:

- **Report it, do not exploit it further than you must to prove it.** One clear
  proof-of-concept is the deliverable. Do not go looking for other systems.
- Write down the **impact in the client's language**, not just the mechanism. "Any logged-in
  donor can read every other donor's phone number and home address by changing a number in
  the URL" lands with a board. "IDOR on `/api/donors/:id`" does not.
- Rate it. Any consistent scale is fine — CVSS, or a simple critical/high/medium/low with
  your reasoning. We care that the ordering is defensible.
- Write the **regression test** that fails today and passes once it is fixed. That test is
  the actual deliverable; the bug report is how you hand it over.
