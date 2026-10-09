/**
 * Nani's red thread in the real engine, on :5881 (dev build).
 *
 * tests/thread.test.ts walks the whole journey abstractly. This replays every
 * state that walk stood in, inside the running game: load the flags, ask the
 * thread (soup.thread, exactly N), follow it to its end the way a player
 * does (stand where it runs out, ask again), then face the loop and press
 * Space. Each step must arrive on a free tile beside the loop, the loop must
 * sit on someone the task names (or the thing it names), and Space there must
 * open the very scene the errand is (the walk's own next step, never an idle
 * line). A thing must also answer from every side a player can stand on,
 * and from the thread's end even while facing away from it (the gate letter
 * once opened only to a player facing east). Every leg ends on bare floor (never on a tuft or a hose), and
 * a click on where the first leg ends walks there rather than reading
 * whatever is drawn on it. Then the pointer checks: a click on a prop you can
 * stand on walks onto it; a click on a solid prop still reads it; a click on
 * a person's head talks to them, not to the flowers behind them.
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
// Returns the verdict: `if (!check(...)) continue;` relies on it. It used to
// return nothing, so that guard skipped every check after the first.
const check = (ok, label) => {
  if (!ok || process.env.VERBOSE) console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
  return !!ok;
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
/** Screen point of a world pixel, through the live camera and zoom. */
const screenOf = (wx, wy) =>
  page.evaluate(([wx, wy]) => {
    const s = JSON.parse(document.body.dataset.wfState);
    const c = document.getElementById('stagegl');
    const r = c.getBoundingClientRect();
    const k = Math.max(r.width / 320, r.height / 180);
    const ox = r.left + (r.width - 320 * k) / 2;
    const oy = r.top + (r.height - 180 * k) / 2;
    return { x: ox + (wx - s.cam[0]) * k, y: oy + (wy - s.cam[1]) * k };
  }, [wx, wy]);
await page.goto(`${BASE}/?skiptitle`);
await page.waitForFunction(() => !!globalThis.soup, null, { timeout: 20000 });

/** Boot the game into one of the walk's states, at the map's spawn, at midday. */
async function load(s) {
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
}

/** Stand on (x, y), turn toward `dir` with a one-frame tap, press Space; the scene that opens. */
async function spaceFrom(m, x, y, dir) {
  await warp(m, x, y);
  await sleep(900);
  // Toward a solid thing a tap only turns; away from it, over open floor, a
  // tap would step, so the turn is made in place through the desk.
  const name = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down' }[dir];
  await page.evaluate((d) => globalThis.soup.face(d), name);
  await sleep(250);
  await page.keyboard.press('Space');
  await sleep(400);
  return (await st()).dialogue ?? null;
}
const toward = (fx, fy, tx, ty) => (tx > fx ? 'ArrowRight' : tx < fx ? 'ArrowLeft' : ty > fy ? 'ArrowDown' : 'ArrowUp');
const AWAY = { ArrowRight: 'ArrowLeft', ArrowLeft: 'ArrowRight', ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp' };

for (const s of states) {
  await load(s);
  await ask();
  await sleep(150);
  let now = await st();
  const label = `[${s.ch}] "${s.task.slice(0, 50)}"`;
  if (now.thread.last) {
    // A leg that runs out on the way ends on bare floor. (One that arrives
    // ends where you stand to act, which may be the only tuft beside them.)
    if (!now.thread.last.loop) check(!now.thread.last.dressed, `${label}: the thread ends on bare floor, not on a prop (${now.thread.last.end})`);
    // Clicking where the thread ends walks there; it never reads a prop.
    const [cx, cy] = now.thread.last.end;
    const [tx0, ty0] = now.tile;
    const pt = await screenOf(cx * 16 + 8, cy * 16 + 8);
    const vp = page.viewportSize();
    const onScreen = pt.x > 8 && pt.y > 8 && pt.x < vp.width - 8 && pt.y < vp.height - 8;
    if (onScreen && (cx !== tx0 || cy !== ty0) && (!now.thread.last.loop || Math.abs(cx - now.thread.last.loop[0]) + Math.abs(cy - now.thread.last.loop[1]) === 1)) {
      // Let a scene's walkers reach their marks first: a click on someone's
      // head as they pass is rightly a click on them (Aurelio walking down
      // the well's column to his place at dusk), and that is not this check.
      // Wanderers hold still for it too (Hana ambling under the shrine steps).
      await page.evaluate(() => (document.body.dataset.wfCmd = `freeze:1:${Date.now()}`));
      for (let i = 0, prev = ''; i < 20; i++) {
        const cur = JSON.stringify((await st()).npcs);
        if (cur === prev) break;
        prev = cur;
        await sleep(400);
      }
      await page.mouse.click(pt.x, pt.y);
      for (let i = 0; i < 40; i++) {
        await sleep(150);
        const w = await st();
        if (w.dialogue || (w.tile[0] === cx && w.tile[1] === cy && !w.auto)) break;
      }
      const w = await st();
      // A figure is two tiles tall: when the thread ends directly above its
      // person, that floor is where their face is drawn, and a click there is
      // a click on them (walk beside, talk). What it must never do is read a
      // prop (an ex.* examine).
      const loop = now.thread.last.loop;
      const underHead = !!loop && loop[0] === cx && loop[1] === cy + 1;
      const walked = !w.dialogue && w.tile[0] === cx && w.tile[1] === cy;
      // Or the walk there carried them into the very scene this step leads to
      // (the dusk ring at the well starts the verdict as you arrive).
      const own = !!w.dialogue && (w.dialogue === s.node || Object.values(s.nodes ?? {}).includes(w.dialogue));
      const talked = (underHead && !!w.dialogue && !/^ex\./.test(w.dialogue)) || own;
      check(walked || talked, `${label}: a click on the thread's end ${now.thread.last.end} walks there (at ${w.tile}, ${w.dialogue || 'no scene'})`);
      await page.evaluate(() => (document.body.dataset.wfCmd = `freeze:0:${Date.now()}`));
      // Whatever that click opened (and set) is undone by booting the state
      // again: Escape cannot shut a choice, and a scene left open swallowed
      // the Space checks below.
      await load(s);
      await ask();
      await sleep(150);
      now = await st();
    }
  }
  // Follow a thread that runs out before it arrives: stand at its end, ask again.
  for (let k = 0; k < 10 && now.thread.last && !now.thread.last.loop; k++) {
    await warp(now.map, ...now.thread.last.end);
    await sleep(900);
    await ask();
    await sleep(150);
    now = await st();
    if (now.thread.last && !now.thread.last.loop) check(!now.thread.last.dressed, `${label}: the thread ends on bare floor, not on a prop (${now.thread.last.end})`);
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
  // Stand there, face the loop, press Space: the errand's own scene must open.
  const opened = await spaceFrom(now.map, ex, ey, toward(ex, ey, lx, ly));
  if (!check(!!opened, `${label}: Space at ${last.end} facing ${last.loop} opens a scene (${opened ?? 'nothing'})`)) continue;
  // The scene is that of whoever stands on the loop (a crowd task names several).
  const there = Object.entries(now.npcs).find(([, c]) => c[0] === lx && c[1] === ly)?.[0];
  const want = (there && s.nodes?.[there]) || s.node;
  if (want) check(opened === want, `${label}: Space at ${last.end} does the errand (${want}), not ${opened}`);
  // A thing answers from every side, and from the thread's end facing away.
  if (s.target.at && s.node && s.target.at[0] === now.map) {
    const tries = [
      [ex, ey, AWAY[toward(ex, ey, lx, ly)], 'facing away'],
      ...s.sides.filter(([x, y]) => x !== ex || y !== ey).map(([x, y]) => [x, y, toward(x, y, lx, ly), 'facing it']),
    ];
    for (const [x, y, dir, how] of tries) {
      await load(s);
      // Facing away onto a person talks to them, rightly; that side is not the thing's to answer.
      const ahead = { ArrowRight: [x + 1, y], ArrowLeft: [x - 1, y], ArrowUp: [x, y - 1], ArrowDown: [x, y + 1] }[dir];
      const npcs = (await st()).npcs;
      if (Object.values(npcs).some((c) => c[0] === ahead[0] && c[1] === ahead[1])) continue;
      const got = await spaceFrom(s.target.at[0], x, y, dir);
      // Any mound is the dig: facing one mound beside another digs that one.
      const same = got === s.node || (/^dig\.spot/.test(s.node) && /^dig\.spot/.test(got ?? ''));
      check(same, `${label}: Space at ${x},${y} ${how} ${s.target.at.slice(1)} does the errand (${s.node}), not ${got ?? 'nothing'}`);
    }
  }
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
  ['delhi-rooftop', 21, 4, 21, 5, 'pecking pigeons', 'walk'], // from floor: 21,6 is the parapet
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

// A person is drawn a tile and a half tall: a click on their head is a click
// on them, wherever their feet are, and the walk talks to them on arrival.
{
  await page.evaluate(() => globalThis.soup.go(1));
  await sleep(3000);
  await quiet();
  await warp('village', 21, 18);
  await sleep(1500);
  await quiet();
  const s0 = await st();
  const who = Object.entries(s0.npcs).find(([, c]) => Math.abs(c[0] - 21) + Math.abs(c[1] - 18) >= 3 && Math.abs(c[0] - 21) <= 7 && Math.abs(c[1] - 18) <= 4);
  if (check(!!who, 'someone in sight to click on')) {
    const [id, [nx, ny]] = who;
    const pt = await screenOf(nx * 16 + 8, ny * 16 - 4); // their head: drawn over the cell above their feet
    await page.mouse.click(pt.x, pt.y);
    let w = await st();
    for (let i = 0; i < 60 && !w.dialogue; i++) {
      await sleep(150);
      w = await st();
    }
    check(!!w.dialogue && !/^ex\./.test(w.dialogue), `a click on ${id}'s head talks to ${id} (${w.dialogue || 'nothing'})`);
    await quiet();
  }
}

check(errors.length === 0, `no page errors (${errors.slice(0, 3).join(' | ')})`);
await browser.close();
console.log(failures ? `${failures} FAILED of ${states.length} states` : `all ${states.length} states follow honestly`);
process.exit(failures ? 1 : 0);
