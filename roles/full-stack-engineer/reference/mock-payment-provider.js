/**
 * A deterministic fake payment provider for the hiring exercise.
 *
 * The real platform's payments are already live and are out of scope. This exists so that
 * every submission fails in the same way at the same moments, which is what makes the
 * error-handling part of the exercise comparable between candidates.
 *
 * Copy it in as-is, port it to your language, or wrap it behind your own interface.
 * Node 24, no dependencies. It is an ES module — either give your package.json
 * `"type": "module"`, or rename this file to `.mjs`.
 */

const OUTCOMES = {
  tok_ok: { kind: 'success' },
  tok_decline: { kind: 'decline', code: 'card_declined' },
  tok_insufficient: { kind: 'decline', code: 'insufficient_funds' },
  tok_timeout: { kind: 'timeout' },
  tok_flaky: { kind: 'flaky' },
  tok_dup: { kind: 'duplicate' },
};

/**
 * Charge ids handed out for tok_dup, and the set of flaky attempts already burned.
 * A real provider keeps this server-side; here it is in memory, which is fine because
 * the whole thing is a fixture.
 */
const duplicateChargeIds = new Map();
const flakyAttempts = new Set();

class PaymentError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
  }
}

function randomChargeId() {
  return `ch_${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`;
}

/**
 * Charge a token.
 *
 * @param {object} params
 * @param {string} params.token           one of the tok_* values above
 * @param {number} params.amountCents     integer minor units. A float here throws, on purpose.
 * @param {string} [params.idempotencyKey] used by tok_dup to return a stable charge id
 * @param {number} [params.latencyMs]     simulated network latency
 * @returns {Promise<{chargeId: string, amountCents: number, last4: string, createdAt: string}>}
 * @throws {PaymentError} for declines. Never resolves for tok_timeout.
 */
export async function charge({ token, amountCents, idempotencyKey, latencyMs = 250 }) {
  // Guard the money type at the boundary. If a float reaches a payment provider in
  // production you find out from a bank statement six weeks later.
  if (!Number.isInteger(amountCents)) {
    throw new PaymentError('invalid_amount', 'amountCents must be an integer number of cents');
  }
  if (amountCents <= 0) {
    throw new PaymentError('invalid_amount', 'amountCents must be positive');
  }

  const outcome = OUTCOMES[token];
  if (!outcome) {
    throw new PaymentError('invalid_token', `Unknown payment token: ${token}`);
  }

  await sleep(latencyMs);

  switch (outcome.kind) {
    case 'success':
      return receipt(randomChargeId(), amountCents);

    case 'decline':
      throw new PaymentError(outcome.code, 'The card was declined');

    case 'timeout':
      // The provider accepted the request and never answered. This is the case that
      // creates a donor who was charged and has no receipt, so your code must impose
      // its own timeout rather than waiting here forever.
      return new Promise(() => {});

    case 'flaky': {
      const key = idempotencyKey ?? 'default';
      if (!flakyAttempts.has(key)) {
        flakyAttempts.add(key);
        throw new PaymentError('provider_error', 'Temporary provider failure, safe to retry');
      }
      return receipt(randomChargeId(), amountCents);
    }

    case 'duplicate': {
      // Always the same charge id for the same key, so a double-submitted donation is
      // detectable downstream. This is how a real provider's idempotency behaves.
      const key = idempotencyKey ?? 'default';
      if (!duplicateChargeIds.has(key)) {
        duplicateChargeIds.set(key, randomChargeId());
      }
      return receipt(duplicateChargeIds.get(key), amountCents);
    }

    default:
      throw new PaymentError('provider_error', 'Unreachable');
  }
}

function receipt(chargeId, amountCents) {
  return {
    chargeId,
    amountCents,
    last4: '4242',
    createdAt: new Date().toISOString(),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Test-only. Lets a suite start from a clean provider between cases. */
export function __reset() {
  duplicateChargeIds.clear();
  flakyAttempts.clear();
}

export { PaymentError, OUTCOMES };
