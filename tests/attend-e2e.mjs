/**
 * The story tellings by real keys, on :5855 (dev build). Four games whose
 * story runs used to fall to a mashed Space: each is mashed once and played
 * carefully once, and the two runs must not end alike.
 *
 *   node tests/attend-e2e.mjs        (with `npx vite --port 5855` running)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5855';
const SHOTS = new URL('./attend-shots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(BASE);
await page.waitForFunction(() => !!window.soup, null, { timeout: 20000 });

/** Read one field set off the live panel. */
const peek = (flag, keys) =>
  page.evaluate(([f, ks]) => {
    const p = window.soup.panel(f);
    const o = { open: p.isOpen, hint: p.hint };
    for (const k of ks) o[k] = p[k];
    return o;
  }, [flag, keys]);

/** Jump to the chapter, arm the game, and talk through whatever is said until it opens. */
async function open(flag, chapter) {
  await page.evaluate((n) => window.soup.go(n), chapter);
  await sleep(1800);
  await page.evaluate((f) => window.soup.play(f), flag);
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    if ((await peek(flag, [])).open) return;
    await page.keyboard.press('Space'); // the arrival or the last run's narration
  }
  throw new Error(`${flag} never opened`);
}

/** Drive until the panel closes, calling `step` every ~30ms; returns the last hint seen. */
async function drive(flag, keys, step, limitMs = 90000) {
  const t0 = Date.now();
  let last = '';
  for (;;) {
    const s = await peek(flag, keys);
    if (!s.open) return { last, ms: Date.now() - t0 };
    last = s.hint;
    if (Date.now() - t0 > limitMs) return { last, ms: Infinity };
    await step(s);
    await sleep(30);
  }
}

const mashStep = async () => {
  await page.keyboard.press('Space');
  await sleep(70); // about ten a second with the poll
};

// ------------------------------------------------------------ the caballito
{
  const F = 'wave.start';
  await open(F, 2);
  const mashed = await drive(F, ['phase'], mashStep);
  await open(F, 2);
  const careful = await drive(F, ['phase', 'x', 'zoneLo', 'zoneHi', 'balance'], async (s) => {
    if (s.phase === 'paddle') {
      if (s.x <= s.zoneHi - 0.03 && s.x >= s.zoneLo + 0.03) await page.keyboard.press('Space');
    } else if (s.phase === 'ride') {
      if (s.balance > 0.1) await page.keyboard.press('ArrowLeft');
      else if (s.balance < -0.1) await page.keyboard.press('ArrowRight');
    } else await page.keyboard.press('Space');
  });
  check(Number.isFinite(mashed.ms) && Number.isFinite(careful.ms), `caballito: both runs finish (mash ${(mashed.ms / 1000).toFixed(1)}s, careful ${(careful.ms / 1000).toFixed(1)}s)`);
  check(mashed.ms > careful.ms * 1.5, 'caballito: mashing is clearly slower');
  check(/not one wasted/.test(careful.last) && !/not one wasted/.test(mashed.last), `caballito: only care earns the flourish ("${careful.last.slice(0, 50)}...")`);
}

// ------------------------------------------------------------ behind the pots
{
  const F = 'c2.cook.start';
  await open(F, 2);
  let held = '';
  const mashed = await drive(F, ['step'], async (s) => {
    if (s.step === 'lime' && /takes the bowl back/.test(s.hint)) held = s.hint;
    await mashStep();
  });
  await open(F, 2);
  const careful = await drive(F, ['step', 'kiss', 'zoneLo', 'zoneHi'], async (s) => {
    if (s.step === 'lime') {
      if (s.kiss >= s.zoneLo + 0.04 && s.kiss < s.zoneHi - 0.04) await page.keyboard.press('Space');
    } else {
      await page.keyboard.press('Space');
      await sleep(250);
    }
  });
  check(!!held, 'ceviche: an early pull and Petro takes the bowl back');
  check(/diploma/.test(careful.last) && /Edible/.test(mashed.last), 'ceviche: care earns the diploma, mashing earns "Edible"');
  await page.screenshot({ path: `${SHOTS}ceviche-done.png` });
}

// ------------------------------------------------------------ the hotteok griddle
{
  const F = 'c5.hotteok.start';
  await open(F, 5);
  const mashed = await drive(F, ['phase', 'thumbs', 'darks'], async (s) => {
    if (s.phase === 'done') await page.screenshot({ path: `${SHOTS}hotteok-mashed.png` });
    await mashStep();
  });
  await open(F, 5);
  const careful = await drive(F, ['phase', 't', 'lo', 'hi', 'anim', 'hasBall'], async (s) => {
    if (s.phase === 'press') {
      if (s.anim < 0 && s.hasBall && s.t >= s.lo + 0.04 && s.t <= s.hi - 0.04) await page.keyboard.press('Space');
    } else await page.keyboard.press('Space');
  });
  check(/not a thumbprint/.test(careful.last), 'hotteok: a careful batch has no thumbprints');
  check(!/not a thumbprint/.test(mashed.last), `hotteok: a mashed batch ends otherwise ("${mashed.last.slice(0, 60)}...")`);
}

// ------------------------------------------------------------ the sadya leaf
{
  const F = 'c6.sadya.start';
  await open(F, 6);
  await sleep(4500); // Auntie Leela's walk around the leaf is over
  await page.screenshot({ path: `${SHOTS}sadya-unlabeled.png` });
  await page.keyboard.press('Space'); // the pappadam, on the pickle's seat
  await sleep(200);
  const s = await peek(F, ['course', 'pointAt']);
  check(s.course === 0 && s.pointAt === 5, 'sadya: a wrong seat serves nothing and she points at the right one');
  await page.screenshot({ path: `${SHOTS}sadya-pointed.png` });
  const SEATS = [5, 0, 1, 2, 3, 4];
  const done = await drive(F, ['phase', 'course', 'cur'], async (st) => {
    if (st.phase !== 'serve') return page.keyboard.press('Space');
    const want = SEATS[st.course];
    if (st.cur === want) return page.keyboard.press('Space');
    const dx = (want % 3) - (st.cur % 3);
    const dy = Math.floor(want / 3) - Math.floor(st.cur / 3);
    await page.keyboard.press(dx < 0 ? 'ArrowLeft' : dx > 0 ? 'ArrowRight' : dy < 0 ? 'ArrowUp' : 'ArrowDown');
    await sleep(80);
  });
  check(Number.isFinite(done.ms), 'sadya: the leaf is served and folded by real keys');
}

check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : 'ALL GREEN');
process.exit(failures ? 1 : 0);
