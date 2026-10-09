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

const ONLY = process.env.ONLY ?? 'r1,r2,r3';
const want = (k) => ONLY.split(',').includes(k);

const mashStep = async () => {
  await page.keyboard.press('Space');
  await sleep(70); // about ten a second with the poll
};

// ------------------------------------------------------------ the caballito
if (want('r1')) {
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
if (want('r1')) {
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
if (want('r1')) {
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
if (want('r1')) {
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


// ============================================================ round two
const PANTRY = ['Garlic', 'Condensed milk', 'Soy sauce', 'Chicken', 'Dried mango', 'Cane vinegar', 'Bay leaves', 'Peppercorns'];
const arrowTo = async (cur, at, cols) => {
  const dx = (at % cols) - (cur % cols);
  const dy = Math.floor(at / cols) - Math.floor(cur / cols);
  await page.keyboard.press(dx < 0 ? 'ArrowLeft' : dx > 0 ? 'ArrowRight' : dy < 0 ? 'ArrowUp' : 'ArrowDown');
  await sleep(60);
};

// The urojo cart: one saucer mashed vs bowls built for the customer.
if (want('r2')) {
  const F = 'c7.cook.start';
  await open(F, 8);
  let covered = false;
  const mashed = await drive(F, ['phase'], async (s) => {
    if (/covers the bowl/.test(s.hint)) covered = true;
    await mashStep();
  });
  await open(F, 8);
  // Hamisi wants brave, Bi Mwana crunch, the boy's Baba egg and potato, mild.
  const plan = [[6, 6, 0, 2], [4, 2, 4, 5], [3, 1, 5, 4]];
  const careful = await drive(F, ['phase', 'round', 'cur', 'counts'], async (s) => {
    if (s.phase !== 'build') {
      await page.keyboard.press('Space');
      return sleep(300);
    }
    const n = s.counts.reduce((a, b) => a + b, 0);
    const goal = n < plan[s.round].length ? plan[s.round][n] : 7;
    if (s.cur === goal) await page.keyboard.press('Space');
    else await page.keyboard.press('ArrowRight');
    await sleep(120);
  });
  check(covered, 'urojo: the same saucer three times running and Zuberi covers the bowl');
  check(mashed.ms >= careful.ms, `urojo: mashing (${(mashed.ms / 1000).toFixed(1)}s) is no quicker than care (${(careful.ms / 1000).toFixed(1)}s)`);
  check(/chalks your name/.test(careful.last) && !/chalks your name/.test(mashed.last), 'urojo: only care earns the slate');
}

// Kingyo: a still, Space-only hand still meets a fish; care is quicker.
if (want('r2')) {
  const F = 'c4.kingyo.start';
  await open(F, 4);
  const mashed = await drive(F, ['phase', 'caught'], mashStep, 120000);
  await open(F, 4);
  const careful = await drive(F, ['phase', 'cx', 'fish', 'reach'], async (s) => {
    if (s.phase !== 'scoop') return page.keyboard.press('Space');
    const shallow = s.fish.filter((f) => !f.deep);
    if (shallow.some((f) => Math.abs(f.x - s.cx) < s.reach * 0.6)) {
      await page.keyboard.press('Space');
      return sleep(150);
    }
    if (!shallow.length) return;
    const near = shallow.reduce((a, b) => (Math.abs(a.x - s.cx) <= Math.abs(b.x - s.cx) ? a : b));
    if (Math.abs(near.x - s.cx) > 0.05) await page.keyboard.press(near.x < s.cx ? 'ArrowLeft' : 'ArrowRight');
  });
  check(Number.isFinite(mashed.ms), `kingyo: Space alone finishes (${(mashed.ms / 1000).toFixed(1)}s)`);
  check(mashed.ms >= careful.ms, `kingyo: mashing is no quicker than care (${(careful.ms / 1000).toFixed(1)}s)`);
}

// Adobo: story Ben calls each next thing, and real keys follow his calls.
if (want('r2')) {
  const F = 'c3.cook.start';
  await open(F, 3);
  const calls = [];
  let lastStep = -1;
  const run = await drive(F, ['step', 'cur', 'simmer', 'done'], async (s) => {
    if (s.step !== lastStep) {
      lastStep = s.step;
      calls.push(s.hint);
    }
    if (s.simmer >= 0 || s.done) {
      if (/Now, anak|Ngayon|Press Space/.test(s.hint)) await page.keyboard.press('Space');
      return;
    }
    // Find the jar from Ben's own words: the last pantry name he said.
    const said = PANTRY.map((n) => [n, s.hint.toLowerCase().lastIndexOf(n.toLowerCase())]).filter((x) => x[1] >= 0);
    if (!said.length) return;
    said.sort((a, b) => b[1] - a[1]);
    const at = PANTRY.indexOf(said[0][0]);
    if (s.cur === at) {
      await page.keyboard.press('Space');
      await sleep(250);
    } else await arrowTo(s.cur, at, 4);
  }, 60000);
  check(Number.isFinite(run.ms), `adobo: cooked by following Ben's calls alone (${(run.ms / 1000).toFixed(1)}s)`);
  check(/aunties/.test(run.last), 'adobo: no wrong reach, so Ben suspects aunties');
}

// Adobo, burnt once on purpose: Space brings Ben's spare pot with all six
// things in it, and the lift that follows still plates the dinner.
if (want('r2')) {
  const F = 'c3.cook.start';
  await open(F, 3);
  let burnt = null;
  let retried = null;
  const run = await drive(F, ['step', 'cur', 'simmer', 'done', 'burnt', 'landed'], async (s) => {
    if (s.burnt) {
      burnt ??= s;
      await page.keyboard.press('Space');
      await sleep(300);
      retried ??= await peek(F, ['step', 'landed', 'simmer', 'burnt']);
      return;
    }
    if (s.simmer >= 0 || s.done) {
      // The first pot is left to burn; the spare one is lifted on Ben's call.
      if (s.done || (burnt && /Ngayon/.test(s.hint))) await page.keyboard.press('Space');
      return;
    }
    const said = PANTRY.map((n) => [n, s.hint.toLowerCase().lastIndexOf(n.toLowerCase())]).filter((x) => x[1] >= 0);
    if (!said.length) return;
    said.sort((a, b) => b[1] - a[1]);
    const at = PANTRY.indexOf(said[0][0]);
    if (s.cur === at) {
      await page.keyboard.press('Space');
      await sleep(250);
    } else await arrowTo(s.cur, at, 4);
  }, 90000);
  check(!!burnt, 'adobo: a pot left on the fire burns');
  check(!!retried && !retried.burnt && retried.step === 6 && retried.landed === 6 && retried.simmer < 0.1,
    `adobo: Space after a burn picks up at the simmer with six things in the pot (${JSON.stringify(retried)})`);
  check(!!retried && !/apron/.test(retried.hint), `adobo: no apron on the retry ("${retried?.hint.slice(0, 60)}...")`);
  check(Number.isFinite(run.ms), `adobo: the spare pot is plated (${(run.ms / 1000).toFixed(1)}s)`);
}

// Dawn kitchen: a hand mashing through the pull clouds the broth and is not
// applauded; a hand that waits for the hurrying bubbles is. Both finish.
if (want('r2')) {
  const F = 'c4.cook.start';
  const KEYS = ['phase', 'heat', 'pullLo', 'foam', 'lx', 'skimReach', 'squeezing', 'squeeze', 'packLo', 'packHi', 'clouds'];
  const dashi = async (mashPull) => {
    await open(F, 4);
    let pulled = null;
    const r = await drive(F, KEYS, async (s) => {
      if (s.phase === 'pull') {
        if (mashPull || s.heat >= s.pullLo + 1) await page.keyboard.press('Space');
        if (mashPull) await sleep(70);
        return;
      }
      if (s.phase === 'skim') {
        pulled ??= s;
        if (!s.foam.length) return;
        const near = s.foam.reduce((a, b) => (Math.abs(a.x - s.lx) <= Math.abs(b.x - s.lx) ? a : b));
        if (Math.abs(near.x - s.lx) < s.skimReach * 0.7) {
          await page.keyboard.press('Space');
          await sleep(150);
        } else await page.keyboard.press(near.x < s.lx ? 'ArrowLeft' : 'ArrowRight');
        return;
      }
      if (s.phase === 'onigiri') {
        if (!s.squeezing || s.squeeze >= (s.packLo + s.packHi) / 2) await page.keyboard.press('Space');
        return;
      }
      if (s.phase === 'steep' && s.heat === 0 && /In they go/.test(s.hint)) await page.keyboard.press('Space');
      if (s.phase === 'done' || s.phase === 'ruined') await page.keyboard.press('Space');
    }, 90000);
    return { ...r, pulled };
  };
  const careful = await dashi(false);
  const mashed = await dashi(true);
  check(Number.isFinite(careful.ms) && Number.isFinite(mashed.ms), `dashi: both mornings finish (careful ${(careful.ms / 1000).toFixed(1)}s, mashed ${(mashed.ms / 1000).toFixed(1)}s)`);
  check(/applause/.test(careful.pulled?.hint ?? ''), 'dashi: the careful pull is applauded');
  check(!/applause/.test(mashed.pulled?.hint ?? '') && (mashed.pulled?.clouds ?? 0) >= 3, `dashi: a mashed pull clouds the broth (${mashed.pulled?.clouds} clouds)`);
  const xs = (careful.pulled?.foam ?? []).map((f) => f.x).sort((a, b) => a - b);
  check(xs.length === 3 && xs[1] - xs[0] >= 0.15 && xs[2] - xs[1] >= 0.15, `dashi: the three foams spread across the pot (${xs.map((x) => x.toFixed(2))})`);
}

// Sadya: readable seat names during her walk; a hand that ignores her still gets served.
if (want('r2')) {
  const F = 'c6.sadya.start';
  await open(F, 6);
  await sleep(1300);
  await page.screenshot({ path: `${SHOTS}sadya-walk.png` });
  const mashed = await drive(F, ['phase'], mashStep, 120000);
  check(Number.isFinite(mashed.ms), `sadya: Space alone gets the leaf served, Leela helping (${(mashed.ms / 1000).toFixed(1)}s)`);
  check(/served half/.test(mashed.last), 'sadya: and the ending says who served it');
}

// Patang (pass 6): Up held down the whole evening lost to care in half the
// time. Now a kheench is a stroke, a cut does not clear the weather, and
// tying on the next patang takes a moment, so the held hand is the slow one.
if (want('r3')) {
  const F = 'c11.kite.start';
  await open(F, 7);
  let lazyShot = false;
  const lazy = await drive(F, ['phase', 'lost'], async (s) => {
    if (s.phase === 'done' && !lazyShot) {
      lazyShot = true;
      await sleep(600);
      await page.screenshot({ path: `${SHOTS}kite-held-done.png` });
    }
    if (s.phase === 'duel') await page.keyboard.press('ArrowUp');
    else await page.keyboard.press('Space');
  }, 150000);
  await open(F, 7);
  let honored = 0;
  let lastUp = 0;
  let flock = false;
  let doneShot = false;
  const careful = await drive(F, ['phase', 'wind', 'blessed'], async (s) => {
    honored = s.blessed;
    if (s.phase === 'done' && !doneShot) {
      doneShot = true;
      await sleep(600);
      await page.screenshot({ path: `${SHOTS}kite-careful-done.png` });
    }
    if (s.phase !== 'duel') {
      flock = false;
      await page.keyboard.press('Space');
      return sleep(250);
    }
    if (s.wind === 'birds') {
      // Two presses into one flock: still one flock honored.
      if (!flock) {
        flock = true;
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
      }
      return;
    }
    flock = false;
    if (s.wind === 'steady' && Date.now() - lastUp > 320) {
      lastUp = Date.now();
      await page.keyboard.press('ArrowUp');
    }
  }, 150000);
  check(Number.isFinite(lazy.ms) && Number.isFinite(careful.ms), `patang: both flights finish (held Up ${(lazy.ms / 1000).toFixed(1)}s, careful ${(careful.ms / 1000).toFixed(1)}s)`);
  check(lazy.ms >= careful.ms, 'patang: holding Up is no quicker than care');
  check(/given to the sky/.test(lazy.last) && /No birds pulled, no patang lost/.test(careful.last), 'patang: Yusuf tells each flight the truth');
  check(honored >= 2 && honored <= 6, `patang: flocks honored counts flocks (${honored}), not presses`);
}

// Ofrenda (pass 6): a mashed Space used to build the whole altar in a second.
if (want('r3')) {
  const F = 'c9.ofrenda.start';
  await open(F, 10);
  const mashed = await drive(F, ['phase'], mashStep);
  await open(F, 10);
  const careful = await drive(F, ['beat'], async (s) => {
    if (s.beat?.left > 0) return;
    await sleep(200);
    await page.keyboard.press('Space');
    await sleep(150);
  });
  check(Number.isFinite(mashed.ms) && Number.isFinite(careful.ms), `ofrenda: both altars finish (mash ${(mashed.ms / 1000).toFixed(1)}s, careful ${(careful.ms / 1000).toFixed(1)}s)`);
  check(mashed.ms >= careful.ms, 'ofrenda: mashing is no quicker than a patient hand');
  check(/Next year, slower/.test(mashed.last) && !/Next year, slower/.test(careful.last), 'ofrenda: Refugio notices the hurry');
}

check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : 'ALL GREEN');
process.exit(failures ? 1 : 0);
