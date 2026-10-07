/**
 * Nani's red thread in the real engine, on :5881 (dev build).
 *
 * tests/thread.test.ts walks the whole journey abstractly. This replays every
 * state that walk stood in, inside the running game: load the flags, ask the
 * thread (soup.thread, exactly N), follow it to its end the way a player
 * does (stand where it runs out, ask again), then face the loop and press
 * Space. Each step must arrive on a free tile beside the loop, the loop must
 * sit on someone the task names (or the thing it names), and Space there must
 * open a scene. Then two pointer checks: a click on a prop you can stand on
 * walks onto it; a click on a solid prop still reads it.
 *
 *   npx vite --port 5881 &
 *   node tests/thread-e2e.mjs                 (every chapter, ~40 minutes)
 *   ONLY=busan,zanzibar node tests/thread-e2e.mjs
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:5881';
const ONLY = process.env.ONLY?.split(',') ?? null;
const root = new URL('..', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (ok, label) => {
  if (!ok || process.env.VERBOSE) console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
};

// The abstract walk writes down every state it stood in, and every map's spawn.
const dump = join(mkdtempSync(join(tmpdir(), 'thread-')), 'states.json');
execFileSync('npx', ['tsx', '--test', 'tests/thread.test.ts'], {
  cwd: root,
  env: { ...process.env, THREAD_DUMP: dump },
  stdio: 'ignore',
});
const { states: all, spawns } = JSON.parse(readFileSync(dump, 'utf8'));
const states = all.filter((s) => !ONLY || ONLY.includes(s.ch));

const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
// A save handed over through sessionStorage lands before the game boots, so
// the outgoing page's own unload save can never overwrite it.
await ctx.addInitScript(() => {
  const p = sessionStorage.getItem('thread-e2e');
  if (!p) return;
  localStorage.setItem('elsewhere.shelf', '0');
  localStorage.setItem('elsewhere.save', p);
  localStorage.removeItem('elsewhere.save.bak');
  sessionStorage.removeItem('thread-e2e');
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const st = () => page.evaluate(() => JSON.parse(document.body.dataset.wfState));
const ask = () => page.evaluate(() => globalThis.soup.thread());
const warp = (m, x, y) => page.evaluate(([m, x, y]) => globalThis.soup.warp(m, x, y), [m, x, y]);
await page.goto(`${BASE}/?skiptitle`);
await page.waitForFunction(() => !!globalThis.soup, null, { timeout: 20000 });

for (const s of states) {
  const [sx, sy] = spawns[s.place];
  const save = { flags: s.flags, journal: s.pages, errand: null, place: { map: s.place, x: sx, y: sy, dir: 'down' } };
  // A reload racing the last one's unload is occasionally aborted; once more.
  for (let tries = 0; ; tries++) {
    try {
      await page.evaluate((v) => sessionStorage.setItem('thread-e2e', v), JSON.stringify(save));
      await page.goto(`${BASE}/?skiptitle`);
      break;
    } catch (e) {
      if (tries >= 2) throw e;
      await sleep(1000);
    }
  }
  await page.waitForFunction(() => !!document.body.dataset.wfState && !!globalThis.soup, null, { timeout: 20000 });
  await page.evaluate(() => globalThis.soup.tod(0.35));
  await sleep(900);
  await ask();
  await sleep(150);
  let now = await st();
  const label = `[${s.ch}] "${s.task.slice(0, 50)}"`;
  // Follow a thread that runs out before it arrives: stand at its end, ask again.
  for (let k = 0; k < 10 && now.thread.last && !now.thread.last.loop; k++) {
    await warp(now.map, ...now.thread.last.end);
    await sleep(900);
    await ask();
    await sleep(150);
    now = await st();
  }
  const last = now.thread.last;
  if (!check(!!last?.loop, `${label}: the thread arrives somewhere`)) continue;
  const [ex, ey] = last.end;
  const [lx, ly] = last.loop;
  const d = Math.abs(ex - lx) + Math.abs(ey - ly);
  if (d === 0) continue; // a door: the loop is the doorway itself
  check(d === 1, `${label}: ends beside its loop (end ${last.end}, loop ${last.loop})`);
  const under = Object.entries(now.npcs).filter(([, c]) => c[0] === ex && c[1] === ey).map(([id]) => id);
  check(under.length === 0, `${label}: its end tile ${last.end} is free (${under.join(', ') || 'nobody'} there)`);
  if (s.target.who) {
    // A wanderer may have taken a step since the loop was laid; near is fine.
    const near = Object.entries(now.npcs).filter(
      ([id, c]) => s.target.all.includes(id) && Math.abs(c[0] - lx) + Math.abs(c[1] - ly) <= 2,
    );
    check(near.length > 0, `${label}: loops ${last.loop}, where one of ${s.target.all} stands`);
    if (!near.some(([, c]) => c[0] === lx && c[1] === ly)) continue; // moved on; Space would miss by design
  } else if (s.target.at && s.target.at[0] === now.map) {
    check(lx === s.target.at[1] && ly === s.target.at[2], `${label}: loops ${last.loop}, the task's ${s.target.at.slice(1)}`);
  }
  // Stand there, face the loop, press Space: a scene must open.
  await warp(now.map, ex, ey);
  await sleep(900);
  const key = lx > ex ? 'ArrowRight' : lx < ex ? 'ArrowLeft' : ly > ey ? 'ArrowDown' : 'ArrowUp';
  await page.keyboard.down(key);
  await sleep(40);
  await page.keyboard.up(key);
  await sleep(250);
  await page.keyboard.press('Space');
  await sleep(400);
  const after = await st();
  check(!!after.dialogue, `${label}: Space at ${last.end} facing ${last.loop} opens a scene (${after.dialogue ?? 'nothing'})`);
}

// Pointer: walkable props are floor to a click; solid ones still answer.
await page.goto(`${BASE}/?skiptitle&fresh`);
await page.waitForFunction(() => !!globalThis.soup, null, { timeout: 20000 });
await page.evaluate(() => globalThis.soup.go('delhi'));
/** Read through whatever narration is open, so the next warp is not refused. */
const quiet = async () => {
  for (let i = 0; i < 20 && (await st()).dialogue; i++) {
    await page.keyboard.press('Space');
    await sleep(350);
  }
};
await sleep(2500);
await quiet();
for (const [m, px, py, tx, ty, kind, want] of [
  ['delhi-rooftop', 21, 6, 21, 5, 'pecking pigeons', 'walk'],
  ['delhi-rooftop', 19, 9, 19, 8, 'the kite mast', 'read'],
]) {
  // A warp is refused mid-wipe or mid-narration; ask until it lands.
  for (let i = 0; i < 5; i++) {
    await quiet();
    await warp(m, px, py);
    await sleep(1500);
    await quiet();
    const s = await st();
    if (s.map === m && s.tile[0] === px && s.tile[1] === py) break;
  }
  const pt = await page.evaluate(([tx, ty]) => {
    const s = JSON.parse(document.body.dataset.wfState);
    const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth - a.clientWidth)[0];
    const r = c.getBoundingClientRect();
    const k = r.width / 320;
    return { x: r.left + (tx * 16 + 8 - s.cam[0]) * k, y: r.top + (ty * 16 + 8 - s.cam[1]) * k };
  }, [tx, ty]);
  await page.mouse.click(pt.x, pt.y);
  await sleep(900);
  const after = await st();
  const walked = after.tile[0] === tx && after.tile[1] === ty && !after.dialogue;
  check(want === 'walk' ? walked : !!after.dialogue, `a click on ${kind} should ${want} (at ${after.tile}, ${after.dialogue ?? 'no scene'})`);
}

check(errors.length === 0, `no page errors (${errors.slice(0, 3).join(' | ')})`);
await browser.close();
console.log(failures ? `${failures} FAILED of ${states.length} states` : `all ${states.length} states follow honestly`);
process.exit(failures ? 1 : 0);
