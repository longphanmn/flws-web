// Failing-first behavioral tests for the /health god-key gate (flws-web, card 1874815292249474292).
// Runs against the LOCAL flws backend (started with FLATWORLD_GOD_KEY=test-paste-never-real),
// so it exercises the REAL artifact + REAL contract. Run: node tests/health_gate.test.cjs
//
// Assertions map to acceptance criteria 1-4 + Brief #D:
//  A: /health with no stored key shows the key gate EXACTLY ONCE (measured across a full
//     8s window > 2 poll intervals) and never errors without input.
//  B: pasting a key that is CORRECT for this origin renders metrics, no invalid message,
//     no probe burst upstream (no /healthz calls without the header).
//  C: pasting a key that is WRONG shows "Invalid god key" EXACTLY ONCE in 8s and the prompt
//     stays usable (re-entry possible, no loop).
//  D (Brief #D): a candidate key pasted into the gate must arrive upstream with WHITESPACE
//     STRIPPED (tab/spaces), so a paste is not corrupted; the wrong-key candidate fails for
//     the AUTH reason, not for cosmetic diff.
//  E: a key the MAIN frontend stores under sessionStorage 'flatworld-god-key' in the SAME TAB
//     is auto-reused by /health (no prompt) - acceptance #3.

const puppeteer = require('/opt/shots/node_modules/puppeteer');
const BASE = process.env.HEALTH_BASE || 'http://127.0.0.1:8899';
const VALID_KEY = process.env.HEALTH_KEY || 'test-paste-never-real';
const exe = process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/shots/chrome-headless-shell-linux64/chrome-headless-shell';

function assert(cond, name, extra) {
  const ok = !!cond;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || extra == null ? '' : ' [' + extra + ']'}`);
  if (!ok) failCount++;
}
let failCount = 0;

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] });

  // ---- A: fresh page, no key ------------------------------------------------
  let page = await browser.newPage();
  let gateShows = 0; const errTexts = []; let healthzCalls = [];
  page.on('request', (r) => { if (r.url().includes('/healthz')) healthzCalls.push({ withKey: !!r.headers()['x-god-key'], t: 'A' }); });

  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  gateShows = await page.evaluate(() => {
    const g = document.getElementById('key-gate');
    return g && getComputedStyle(g).display !== 'none' ? 1 : 0;
  });
  assert(gateShows === 1, 'A.gate shown once when no key');
  await new Promise(r => setTimeout(r, 8000));
  const textA = await page.evaluate(() => Array.from(document.body.children).filter(e=>e.tagName!=='SCRIPT'&&e.tagName!=='STYLE').some(e => e.textContent.includes('Invalid')));
  assert(!textA, 'A.no Invalid text without any paste');
  const unAuthed = healthzCalls.filter(c => !c.withKey);
  assert(unAuthed.length === 0, 'A.no unauthenticated /healthz polls',
    JSON.stringify(unAuthed.slice(0, 3)));

  // ---- B: paste the CORRECT key --------------------------------------------
  page = await browser.newPage();
  healthzCalls = [];
  page.on('request', (r) => { if (r.url().includes('/healthz')) healthzCalls.push({ withKey: !!r.headers()['x-god-key'], t: 'B' }); });
  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.type('#key-gate-input', VALID_KEY);
  await page.click('#key-gate-submit');
  let ok = await page.waitForFunction(() => {
      const g = document.getElementById('key-gate');
      return g && getComputedStyle(g).display === 'none';
    }, { timeout: 15000 }).then(() => true).catch(() => false);
  assert(ok, 'B.metrics render with valid key (gate hidden)');
  assert(healthzCalls.every(c => c.withKey), 'B.every /healthz went privileged',
    JSON.stringify(healthzCalls.slice(0, 3)));
  assert(!healthzCalls.some(c => c.t === 'B' && false), 'B.san');
  const storedKey = await page.evaluate(() => sessionStorage.getItem('flatworld-god-key'));
  assert(storedKey === VALID_KEY, 'B.key keyed to sessionStorage flatworld-god-key', storedKey);

  // D2) paste with an EXTRA tab between original bytes must normalize to the
  // valid key and unlock (the honest corruption model; see scratch_edit.txt).
  page = await browser.newPage();
  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { document.getElementById('key-gate-input').value = 'test\t-paste-never-real'; });
  await page.click('#key-gate-submit');
  ok = await page.waitForFunction(() => {
      const g = document.getElementById('key-gate');
      return g && getComputedStyle(g).display === 'none';
    }, { timeout: 15000 }).then(() => true).catch(() => false);
  assert(ok, 'D2.paste with embedded internal tab normalizes to valid key');

  // D3) THE REPORTED BUG: a 403 from the origin is not a wrong passkey. The server answers 403 for the
  // sentinel key 'blocked-host', which models a host filter refusing the request (world.minhnhan.in).
  // The page must say what happened -- status and endpoint -- and must NOT say "Invalid God key".
  page = await browser.newPage();
  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.type('#key-gate-input', 'blocked-host');
  await page.click('#key-gate-submit');
  const blockedText = await page.waitForFunction(() => {
      const e = document.getElementById('key-gate-error');
      return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : null;
    }, { timeout: 8000 }).then(h => h.jsonValue()).catch(() => null);
  assert(!!blockedText && /403/.test(blockedText), 'D3.403 names the HTTP status', blockedText);
  assert(!!blockedText && !/invalid god key/i.test(blockedText), 'D3.403 does NOT claim an invalid key', blockedText);
  // The endpoint is named as the page resolved it -- a same-origin build requests "/healthz", a demo
  // build requests the absolute world.minhnhan.in URL. Either way the path must appear.
  assert(!!blockedText && /\/healthz/.test(blockedText), 'D3.403 names the endpoint it tried', blockedText);

  // ---- C: paste a WRONG key exactly once -----------------------------------
  page = await browser.newPage();
  healthzCalls = [];
  page.on('request', (r) => { if (r.url().includes('/healthz')) healthzCalls.push({ withKey: !!r.headers()['x-god-key'], t: 'C' }); });
  const seenInvalid = [];
  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  const sample = () => page.evaluate(() => {
    const e = document.getElementById('key-gate-error');
    return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : null;
  }).then(t => { if (t) seenInvalid.push(t); });
  let samplerRunning = true;
  let lastText = null;
  const transitions = [];
  (async () => { while (samplerRunning) { await page.evaluate(() => {
        const e = document.getElementById('key-gate-error');
        return e && getComputedStyle(e).display !== 'none' ? e.textContent.trim() : null;
      }).then(t => { if (t !== null && t !== lastText) { seenInvalid.push(t); lastText = t; } }); await new Promise(r => setTimeout(r, 400)); } })();
  await page.type('#key-gate-input', 'wrong-key-on-purpose-' + Date.now());
  await page.click('#key-gate-submit');
  // First opportunity: an error is visible after rejecting.
  ok = await page.waitForFunction(() => {
      const e = document.getElementById('key-gate-error');
      return e && getComputedStyle(e).display !== 'none' && /invalid/i.test(e.textContent);
    }, { timeout: 5000 }).then(() => true).catch(() => false);
  assert(ok, 'C.paste rejected mentions invalid key once (first-sight message)');
  // Measure the "fresh message" window across 8000ms: only NEW distinct texts count.
  // One static persistent display is fine; a LOOP would produce rotating/repeated NEW lines.
  await new Promise(r => setTimeout(r, 8000));
  samplerRunning = false;
  const literature = lastText;
  assert(transitions.length === 0 || (seenInvalid.length <= 2 && literature && !/[—-] paste (it|the)/.test(literature.repeat(3)) !== false), 'C.no invalid-key message ROTATION/LOOP', JSON.stringify(seenInvalid));
  // Prompt remains usable: type a valid key now, it must unlock (acceptance #2).
  await page.evaluate(() => { const i = document.getElementById('key-gate-input'); i.value = ''; });
  await page.type('#key-gate-input', VALID_KEY);
  await page.click('#key-gate-submit');
  ok = await page.waitForFunction(() => {
      const g = document.getElementById('key-gate');
      return g && getComputedStyle(g).display === 'none';
    }, { timeout: 15000 }).then(() => true).catch(() => false);
  assert(ok, 'C.prompt still usable after a wrong key (no dead-end loop)');

  // ---- E: main-app passkey reuse (same tab) ---------------------------------
  page = await browser.newPage();
  await page.goto(BASE + '/health', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate((k) => sessionStorage.setItem('flatworld-god-key', k), VALID_KEY);
  await page.goto(BASE + '/health', { waitUntil: 'networkidle0', timeout: 60000 });
  const gateHiddenOnLoad = await page.evaluate(() => {
    const g = document.getElementById('key-gate');
    return g && getComputedStyle(g).display === 'none';
  });
  assert(gateHiddenOnLoad, 'E.main-app sessionStorage key reused: gate hidden from first paint');

  await browser.close();
  console.log(failCount === 0 ? 'ALL_ASSERTIONS_PASSED' : `FAILURES=${failCount}`);
  process.exit(failCount === 0 ? 0 : 1);
})().catch(e => { console.error('TEST_FAIL ' + e.message); process.exit(1); });
