# Data model

A **suggestion**, not a specification. Deviate freely and explain why in your README — a
better model that you can defend scores higher than this one copied.

What is **not** negotiable is the list of rules at the bottom.

---

## Tables

### `campaigns`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `slug` | text unique not null | `aangan-courtyard` |
| `title` | text not null | |
| `story` | text | markdown or plain, your call |
| `goal_cents` | bigint not null check (> 0) | |
| `currency` | char(3) not null default 'USD' | store it even with one currency |
| `starts_at` / `ends_at` | timestamptz | nullable |
| `is_active` | boolean not null default true | |
| `created_at` / `updated_at` | timestamptz not null | |

Deliberately **not** stored: `raised_cents`. Derive it, or maintain it in the same
transaction as the donation with a documented reason. A denormalised total that drifts from
the donation rows is the classic failure in this kind of system, and if you do denormalise
it, we will look for the transaction.

### `donors`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `email` | citext unique not null | case-insensitive; a donor gives from three devices |
| `full_name` | text not null | **must hold Devanagari.** UTF-8 all the way down |
| `password_hash` | text null | null = guest donor who never registered |
| `role` | text not null default 'donor' | `donor` \| `admin` |
| `created_at` | timestamptz not null | |

Guest checkout is required, so a donation must be creatable for an email that has no
password. Decide whether a later registration adopts the earlier guest donations, and write
the decision down — it is one of the interesting questions in this model.

### `donations`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `campaign_id` | uuid fk not null | |
| `donor_id` | uuid fk not null | |
| `amount_cents` | bigint not null check (between 100 and 2500000) | **integer. never float.** |
| `currency` | char(3) not null | |
| `status` | text not null | `pending` \| `completed` \| `failed` \| `refunded` |
| `privacy_mode` | text not null default 'public' | `public` \| `anonymous` \| `family` |
| `dedication_type` | text null | `in_honor_of` \| `in_memory_of` |
| `dedication_name` | text null | |
| `dedication_message` | text null check (length <= 280) | **rendered in three places. escape it.** |
| `is_recurring` | boolean not null default false | intent only; nothing is scheduled |
| `receipt_number` | text unique not null | see below |
| `payment_charge_id` | text null | from the mock provider |
| `payment_last4` | char(4) null | **never store a card number** |
| `idempotency_key` | text null unique | if you do S3 |
| `created_at` | timestamptz not null | UTC. always. |
| `refunded_at` | timestamptz null | |

**Receipt numbers.** Human-quotable on the phone, unique, and not guessable-in-sequence if
you can avoid it. `HCC-2026-000482` is fine and is what most people do; be aware it lets
anybody estimate your donation volume. Say which trade-off you took.

### `refunds` (or a general `audit_log`)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `donation_id` | uuid fk not null | |
| `actor_id` | uuid fk not null | which admin |
| `reason` | text | |
| `amount_cents` | bigint not null | partial refunds are out of scope, but the column costs nothing |
| `created_at` | timestamptz not null | |

Never delete a donation. Refunding is a state change plus an audit row, and the original row
stays exactly as it was.

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `token_hash` | text unique not null | **hash it.** A stolen database should not be a set of live sessions |
| `donor_id` | uuid fk not null | |
| `expires_at` | timestamptz not null | |
| `created_at` | timestamptz not null | |

A JWT is an acceptable alternative — say how you revoke one.

### `dedication_units` — only if you attempt stretch X1

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `campaign_id` | uuid fk not null | |
| `code` | text not null | `A01` … `T20`. unique **per campaign** |
| `price_cents` | bigint not null | |
| `status` | text not null | `available` \| `held` \| `dedicated` |
| `held_by` | uuid null | donor or session |
| `held_until` | timestamptz null | |
| `donation_id` | uuid fk null | set when it becomes permanent |
| `version` | integer not null default 0 | if you use optimistic concurrency |

Two rules that carry the whole exercise:

- **`unique (campaign_id, code)`.** Without it, no amount of application logic saves you.
- **Expiry is computed at read time**, not by a cleanup job: a unit is available when
  `status = 'available' OR (status = 'held' AND held_until < now())`. A cron job that has not
  run yet is not a correctness mechanism.

---

## Indexes worth having

```sql
create index on donations (campaign_id, status, created_at desc); -- the public list
create index on donations (donor_id, created_at desc);            -- donor history
create index on donations (receipt_number);                       -- phone support
create index on dedication_units (campaign_id, status);           -- the grid
```

For search across Latin and Devanagari, `pg_trgm` with a GIN index on
`lower(full_name)` handles both scripts and typos:

```sql
create extension if not exists pg_trgm;
create index on donors using gin (full_name gin_trgm_ops);
```

Beware: `LOWER()` and `toLowerCase()` do nothing useful for Devanagari, which has no case.
If your search is built on case folding alone it will still work for those names by
accident — but if you also strip or normalise characters, you can silently break them.
Normalise to NFC on write. There is a name in the seed data specifically to catch this.

---

## The rules that are not negotiable

1. **Money is integer minor units** in the database, the API and your arithmetic. No
   `FLOAT`, no `REAL`, no `DOUBLE PRECISION` on any monetary column.
2. **All timestamps are `timestamptz`, stored in UTC.** "Today" means today in the
   organisation's timezone (US Central) and that definition lives in one documented place.
3. **Constraints live in the database**, not only in the application: `NOT NULL`, foreign
   keys, `CHECK` on the amount range, `UNIQUE` on the receipt number.
4. **Nothing is ever hard-deleted.** Refund, cancel, archive.
5. **The privacy mode is applied where the data is fetched.** Not in the serialiser, not in
   the component. A field the public must not see must never leave the database in a public
   query.
6. **Every text column is UTF-8 and holds Devanagari**, including the search path.
7. **A donation row is written exactly once per payment.** Whatever mechanism you choose —
   idempotency key, unique constraint, transaction — a retried request does not double-charge
   a donor.
