# API contract

A **suggested** shape. Deviate and document. What we grade is consistency, correct status
codes, and the fact that authorisation and privacy are enforced here rather than in the UI.

Base: `http://localhost:4000/api`. JSON in, JSON out. Amounts in responses are **integer
cents**, and the client formats them.

---

## Conventions

**Errors** — one shape, everywhere. Pick this or [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html),
but pick one:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Amount must be between $1.00 and $25,000.00",
    "details": [{ "field": "amountCents", "issue": "out_of_range" }]
  }
}
```

Never put a stack trace, a SQL fragment or a file path in a response body.

| Status | When |
|---|---|
| 200 | fine |
| 201 | created — return the resource |
| 400 | malformed |
| 401 | not authenticated |
| 403 | authenticated, forbidden **by role** (an admin-only route) |
| 404 | not found, **or exists but is not yours** |
| 409 | conflict — already refunded, unit already held, duplicate idempotency key |
| 422 | valid JSON, failed business rules |
| 429 | rate limited — include `Retry-After` |
| 500 | your fault. Log the detail, return a code. |

**Pagination** — be explicit and be correct at the boundaries:

```json
{ "data": [], "page": 1, "pageSize": 25, "total": 312, "totalPages": 13 }
```

Decide whether `page` is 0- or 1-based, write it down, and make `OFFSET` agree with it. This
is the single most common off-by-one we see.

---

## Public

### `GET /campaigns/:slug`

```json
{
  "id": "…", "slug": "aangan-courtyard",
  "title": "Aangan — Courtyard Restoration",
  "goalCents": 15000000,
  "raisedCents": 9184200,
  "donorCount": 214,
  "currency": "USD",
  "isActive": true
}
```

`raisedCents` and `donorCount` **exclude** `refunded` and `failed`. A refund must move both
numbers immediately.

### `GET /campaigns/:slug/donations?limit=20`

The public list. **The privacy rules are applied here, in the query.**

```json
{
  "data": [
    { "id": "…", "displayName": "Anisha Gurung",  "amountCents": 10100,
      "dedication": { "type": "in_honor_of", "name": "Aama" },
      "message": "For the courtyard she swept every morning.",
      "createdAt": "2026-09-04T18:22:10Z" },

    { "id": "…", "displayName": "Anonymous",      "amountCents": 50100,
      "dedication": null, "message": null,
      "createdAt": "2026-09-04T17:02:44Z" },

    { "id": "…", "displayName": "The Shrestha family", "amountCents": 2100,
      "dedication": { "type": "in_memory_of", "name": "Buba" },
      "message": null,
      "createdAt": "2026-09-04T16:41:02Z" }
  ]
}
```

Three things we check with `curl`:

- an `anonymous` donation carries **no** `donorName`, `email`, `donorId` or any other
  identifying field. Not `null` — **absent**. A nulled field still tells an attacker the
  shape, and a future serialiser change puts the value back
- a `family` donation shows the surname only
- refunded donations are not in the list

### `POST /donations`

No authentication. Guest checkout is the common case.

```json
{
  "campaignSlug": "aangan-courtyard",
  "amountCents": 10100,
  "donor": { "fullName": "अनिशा गुरुङ", "email": "anisha@example.com" },
  "dedication": { "type": "in_honor_of", "name": "Aama", "message": "…" },
  "privacyMode": "public",
  "isRecurring": false,
  "paymentToken": "tok_ok"
}
```

→ `201`

```json
{
  "id": "…",
  "receiptNumber": "HCC-2026-000483",
  "amountCents": 10100,
  "status": "completed",
  "createdAt": "2026-09-06T14:02:11Z"
}
```

Rules:

- validate against a schema and **reject unknown fields** rather than passing them to your ORM
- `amountCents` is checked server-side against the campaign's own rules. A client that sends
  `1` or `999999999` gets a 422
- `privacyMode` must be one of the three. Anything else is a 422, not a silent default
- decline → `402` or `422` with `code: "card_declined"`, and **no donation row in
  `completed`**
- provider timeout → you decide: `202` with a pending row and a documented reconciliation
  path, or a `504` and no row. Either is defensible. **Say which in your README.** A donor
  charged with no record is the failure mode that matters
- honour `Idempotency-Key` if you did S3

### `GET /donations/receipt/:receiptNumber`

Optional. If you build it, note that a sequential receipt number makes this endpoint
enumerable, and say what you did about it.

---

## Auth

### `POST /auth/login`

```json
{ "email": "admin@himalayacc.example", "password": "admin12345" }
```

→ `200` with an `HttpOnly; Secure; SameSite=Lax` session cookie, or a token in the body if
you prefer — say why in the README.

Identical response and comparable timing whether or not the account exists. Rate limited.

### `POST /auth/logout` · `GET /auth/me`

---

## Donor

### `GET /me/donations`

The caller's **own** donations only. The `donor_id` filter is in the query, not a branch
after the fetch.

### `GET /donations/:id`

Owner or admin. Anybody else gets **404**, not 403 — a 403 confirms the record exists.

---

## Admin — all routes require `role = admin`

### `GET /admin/donations`

`?q=` (name or email, must work in Devanagari) · `?status=` · `?from=` `?to=` (ISO dates) ·
`?page=` `?pageSize=` · `?sort=createdAt|amountCents` `&dir=asc|desc`

`sort` and `dir` come from a **fixed allow-list**, never interpolated into SQL. Dynamic
`ORDER BY` built from a query parameter is the most common injection we find in submissions
that otherwise use parameterised queries throughout.

### `POST /admin/donations/:id/refund`

```json
{ "reason": "Duplicate donation, donor called" }
```

In one transaction: set `status = 'refunded'`, set `refunded_at`, write the audit row, and
make sure the campaign aggregate is correct on the very next read. Refunding an already
refunded donation is a `409`.

### `GET /admin/donations.csv`

Same filters, `text/csv`, `Content-Disposition: attachment`.

**RFC 4180 quoting.** The seed data contains `Shrestha, Bijay "BJ"` and a Devanagari name,
both specifically to break a naive `join(',')`. Emit a UTF-8 BOM if you want Excel to read
the Devanagari correctly, and note that decision — it is the kind of small thing that
decides whether the treasurer trusts the system.

Stream it if you can, rather than building the whole file in memory. Say so if you did not.

---

## Stretch X1 — the grid

```
GET  /campaigns/:slug/units             ?status=available
POST /campaigns/:slug/units/hold        { "codes": ["A01","A02"], "sessionId": "…" }
DELETE /campaigns/:slug/units/hold      { "codes": ["A01"] }
POST /donations                          … plus "unitCodes": ["A01","A02"]
```

`hold` returns `409` with the specific codes that were lost:

```json
{ "error": { "code": "units_unavailable", "message": "Some units were taken",
             "details": { "unavailable": ["A02"] } } }
```

Partial success is a product decision — all-or-nothing, or hold what you can and report the
rest. Both are defensible. Pick one, put it in the README, and make the API honest about
which it does.
