/**
 * A burst harness, so you can prove a claim about concurrency instead of asserting one.
 *
 * It fires N identical requests at an endpoint as close to simultaneously as a single
 * process can manage, and reports how the responses came out. Point it at your donation
 * endpoint to check idempotency, or at your hold endpoint if you attempt stretch X1.
 *
 * This is a tool, not a solution — it will not tell you how to make the endpoint safe.
 *
 *   node reference/concurrency-burst.mjs http://localhost:4000/api/campaigns/aangan-courtyard/units/hold 20
 *
 * Node 24, no dependencies.
 */

const [, , url, countArg] = process.argv;

if (!url) {
  console.error('usage: node concurrency-burst.mjs <url> [count] [jsonBodyFile]');
  process.exit(1);
}

const count = Number(countArg ?? 20);
const bodyFile = process.argv[4];
const body = bodyFile
  ? await (await import('node:fs/promises')).readFile(bodyFile, 'utf8')
  : JSON.stringify({ codes: ['A01'], sessionId: 'burst-test' });

// Build every request first, then release them together. Creating the promises inside
// the loop would stagger them by however long each fetch() setup takes.
const fire = () =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
    .then(async (res) => ({ status: res.status, body: await res.text() }))
    .catch((err) => ({ status: 0, body: String(err) }));

const started = performance.now();
const results = await Promise.all(Array.from({ length: count }, fire));
const elapsed = Math.round(performance.now() - started);

const byStatus = new Map();
for (const r of results) {
  byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
}

console.log(`${count} requests in ${elapsed}ms\n`);
for (const [status, n] of [...byStatus].sort((a, b) => a[0] - b[0])) {
  console.log(`  ${status || 'network error'}  ×${n}`);
}

const winners = results.filter((r) => r.status >= 200 && r.status < 300);
console.log(`\nsuccessful: ${winners.length}`);
if (winners.length > 1) {
  console.log('\nMore than one request succeeded. If this endpoint is supposed to hand the');
  console.log('same resource to exactly one caller, you have just reproduced the race.');
  console.log('\nfirst two winning bodies:');
  for (const w of winners.slice(0, 2)) console.log('  ', w.body.slice(0, 200));
}
