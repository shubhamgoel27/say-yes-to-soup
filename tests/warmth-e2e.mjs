/**
 * The warmth layer, end to end on :5675.
 *
 * A: the honest Carmen path. Flags to the weave offer, sit at the loom, win
 *    the weave by listening to the loom's own hint line, and let carmen.woven
 *    close: the thread must spool unasked, the chip must carry the nudge,
 *    and the chaska whisper must arrive once, about a second later.
 * B: manual N: whisper never repeats, nudge retires forever (reload too).
 * C: la-caleta: first N there gives the caleta whisper once, never again.
 * D: reduced motion, fresh save: nudge and whisper still work.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5675';
const SHOTS = new URL('./warmth-shots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'ok ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

const wf = (page) =>
  page.evaluate(() => JSON.parse(document.body.dataset.wfState ?? '{}'));
const hint = (page) =>
  page.evaluate(() => document.querySelector('.w-hint')?.textContent ?? '');
let simSeq = 0;
const sim = (page, frames) =>
  page.evaluate(
    ([f, n]) => { document.body.dataset.wfCmd = `sim:${f}:${n}`; },
    [frames, ++simSeq],
  );
const soup = (page, expr) => page.evaluate(`window.soup.${expr}`);
const whisperText = (page) =>
  page.evaluate(() => document.querySelector('.toast.wh')?.textContent ?? null);
const nudgePresent = (page) =>
  page.evaluate(() => !!document.querySelector('#errand .errand-nudge'));

async function waitFor(fn, label, timeout = 8000, step = 120) {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - t0 > timeout) throw new Error(`timeout: ${label}`);
    await sleep(step);
  }
}

/** Press Space until the dialogue box has closed (typewriter needs doubles). */
async function closeDialogue(page, max = 40) {
  for (let i = 0; i < max; i++) {
    const s = await wf(page);
    if (!s.dialogue) return;
    await page.keyboard.press('Space');
    await sleep(220);
  }
  throw new Error('dialogue never closed');
}

const ARROW = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const DIRS = ['up', 'down', 'left', 'right'];

/** Win the weave by feel: a wrong call changes the loom's hint line, a right
 * one does not, and the sequence survives a miss. Honest brute force. */
async function winWeave(page) {
  const waitInput = async () => {
    // Fast-forward Carmen's call, then wait for "Now you."
    await sim(page, 240);
    await waitFor(async () => (await hint(page)).startsWith('Now you'), 'weave input phase');
  };
  for (let row = 0; row < 3; row++) {
    const known = [];
    let rowDone = false;
    await waitInput();
    while (!rowDone) {
      const wrong = new Set();
      let advanced = false;
      for (const cand of DIRS) {
        if (wrong.has(cand)) continue;
        await page.keyboard.press(ARROW[cand]);
        await sleep(140);
        const h = await hint(page);
        if (h.startsWith('The thread slips')) {
          wrong.add(cand);
          await waitInput();
          for (const d of known) {
            await page.keyboard.press(ARROW[d]);
            await sleep(90);
          }
          continue;
        }
        known.push(cand);
        advanced = true;
        if (h.startsWith('Good.')) {
          await page.keyboard.press('Space'); // next row
          await sleep(250);
          rowDone = true;
        } else if (h.startsWith('The row holds')) {
          await page.keyboard.press('Space'); // close the panel
          await sleep(400);
          return;
        }
        break;
      }
      if (!advanced && wrong.size >= 4) throw new Error('weave: all four calls slipped');
    }
  }
  throw new Error('weave: rows exhausted without the win');
}

const browser = await chromium.launch();
try {
  // ---------------------------------------------------------------- A + B + C
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${BASE}/?skiptitle`);
  await waitFor(async () => (await wf(page)).mode === 'play', 'game boots');
  await page.evaluate(() => { document.body.dataset.wfCmd = 'freeze:1:boot'; });
  await sleep(600);
  await closeDialogue(page); // the waking narration on a fresh save

  // The chip before the band: no nudge yet.
  check(!(await nudgePresent(page)), 'A: no nudge before the band exists');

  // Walk the flags to Carmen's weave offer, the honest entry.
  for (const f of ['met.rosa', 'met.carmen', 'bundle.delivered', 'errand.carmen-wichuna', 'wichuna.returned']) {
    await soup(page, `flag('${f}')`);
  }
  // Stand under Carmen and face her.
  const carmen = await waitFor(async () => (await wf(page)).npcs?.carmen, 'carmen on the map');
  await soup(page, `warp('village', ${carmen[0]}, ${carmen[1] + 1})`);
  await waitFor(async () => {
    const s = await wf(page);
    return s.map === 'village' && s.tile[0] === carmen[0] && s.tile[1] === carmen[1] + 1;
  }, 'standing below carmen');
  await page.keyboard.press('ArrowUp'); // turn (or bump) to face her
  await sleep(300);
  await page.keyboard.press('Space');
  await waitFor(async () => {
    const s = await wf(page);
    if (s.dialogue && s.dialogue !== 'carmen.weaveOffer') {
      throw new Error(`talked into the wrong node: ${s.dialogue} (facing ${s.facing})`);
    }
    return s.dialogue === 'carmen.weaveOffer';
  }, 'weave offer opens');
  // Two lines, then the first choice is "Sit at the loom".
  for (let i = 0; i < 8 && (await wf(page)).dialogue === 'carmen.weaveOffer'; i++) {
    await page.keyboard.press('Space');
    await sleep(250);
  }
  await waitFor(async () => (await wf(page)).dialogue === 'carmen.weaveStart', 'sat at the loom');
  await closeDialogue(page);
  await waitFor(async () => (await wf(page)).howtoOpen, 'how-to card offers');
  await page.keyboard.press('Space'); // Begin
  await waitFor(async () => (await wf(page)).weaveOpen, 'the loom opens');
  await winWeave(page);

  // carmen.woven plays; when her words close, the thread must spool unasked.
  await waitFor(async () => (await wf(page)).dialogue === 'carmen.woven', 'carmen.woven begins');
  await closeDialogue(page);
  const afterWoven = await wf(page);
  check(afterWoven.thread?.out === true, 'A: the thread spools as her teach line lands, before any N');
  check(!!afterWoven.thread?.last, 'A: the spool resolved a real task target');
  await page.screenshot({ path: `${SHOTS}a1-carmen-thread.png` });

  // The nudge rides the chip now (band on, N never pressed).
  check(await nudgePresent(page), 'A: chip carries the one-time nudge after the band is tied');

  // Her first whisper, about a second after the unspool, once.
  const w1 = await waitFor(() => whisperText(page), 'chaska whisper appears', 6000);
  check(w1.startsWith('Cochineal red'), `A: chaska whisper is hers ("${w1}")`);
  await page.screenshot({ path: `${SHOTS}a2-chaska-whisper.png` });
  await waitFor(async () => !(await whisperText(page)), 'whisper fades');

  // ---- B: manual N. No second whisper, nudge gone for good.
  await page.keyboard.press('n');
  await sleep(2600);
  check((await whisperText(page)) === null, 'B: re-summon in chaska stays whisper-silent');
  check(!(await nudgePresent(page)), 'B: first manual N retires the nudge');
  await page.screenshot({ path: `${SHOTS}b1-chip-after-first-n.png` });

  await page.reload();
  await waitFor(async () => (await wf(page)).mode === 'play', 'reload boots');
  await sleep(400);
  check(!(await nudgePresent(page)), 'B: the nudge stays gone across a reload');
  await page.keyboard.press('n');
  await sleep(2600);
  check((await whisperText(page)) === null, 'B: chaska whisper never returns after a reload');

  // ---- C: la-caleta. First N there, her salt line, once.
  await soup(page, `go('la-caleta')`);
  await waitFor(async () => (await wf(page)).map === 'la-caleta', 'la-caleta loads');
  // The arrival narration takes a beat to open; let it, then put it down.
  await waitFor(async () => (await wf(page)).dialogue, 'arrival narration opens', 6000).catch(() => null);
  await closeDialogue(page);
  await sleep(500);
  await page.keyboard.press('n');
  await sleep(300);
  const cState = await wf(page);
  check(cState.thread?.out === true, `C: N spools in la-caleta (last: ${JSON.stringify(cState.thread?.last)})`);
  const w2 = await waitFor(() => whisperText(page), 'caleta whisper appears', 6000);
  check(w2.includes('learn salt'), `C: caleta whisper is the salt line ("${w2}")`);
  await page.screenshot({ path: `${SHOTS}c1-caleta-whisper.png` });
  await waitFor(async () => !(await whisperText(page)), 'caleta whisper fades');
  await page.keyboard.press('n');
  await sleep(2600);
  check((await whisperText(page)) === null, 'C: caleta whisper shows exactly once');

  check(errors.length === 0, `no page errors (${errors.join('; ') || 'none'})`);
  await ctx.close();

  // ---------------------------------------------------------------- D: reduced motion
  const ctx2 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  });
  const page2 = await ctx2.newPage();
  const errors2 = [];
  page2.on('pageerror', (e) => errors2.push(String(e)));
  await page2.goto(`${BASE}/?skiptitle`);
  await waitFor(async () => (await wf(page2)).mode === 'play', 'reduced-motion boot');
  await sleep(600);
  await closeDialogue(page2); // the waking narration again
  await soup(page2, `band()`);
  await sleep(300);
  check(await nudgePresent(page2), 'D: nudge shows under reduced motion');
  await page2.keyboard.press('n');
  const w3 = await waitFor(() => whisperText(page2), 'reduced-motion whisper', 6000);
  check(w3.startsWith('Cochineal red'), 'D: whisper arrives under reduced motion');
  await page2.screenshot({ path: `${SHOTS}d1-reduced-motion-whisper.png` });
  check(errors2.length === 0, `D: no page errors (${errors2.join('; ') || 'none'})`);
  await ctx2.close();
} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nall warmth checks pass' : `\n${failures} check(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
