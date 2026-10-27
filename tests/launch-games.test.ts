import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ghost, play, seedRandom, type Bot } from './panelrig';

/**
 * Launch fixes in the minigame panels, each pinned so it stays fixed. The
 * panels run for real on the headless stage (see panelrig.ts).
 */

const { GAMES } = await import('../src/content/world');
const { RUN, takeCoach, verdictFor } = await import('../src/ui/games/run');

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

afterEach(() => {
  RUN.hard = false;
  for (const g of GAMES) takeCoach(g.flag);
});

/** A fresh panel for the game started by `flag`, opened in the given telling. */
function opened(flag: string, hard: boolean): Any {
  const g = GAMES.find((x) => x.flag === flag);
  assert.ok(g, `no game ${flag}`);
  const p = g.make(ghost(), ghost(), () => new Set()) as Any;
  RUN.hard = hard;
  p.open(() => {});
  return p;
}

describe('the pisci, the hard telling', () => {
  it('says three missed calls, and the third is the one that loses', () => {
    const p = opened('c8.pisci.start', true);
    assert.match(p.hint, /Three missed calls/);
    assert.doesNotMatch(p.hint, /Two missed calls/);
    // The call is still far out: every pull now slaps air.
    p.onAction();
    p.onAction();
    assert.equal(p.phase, 'row', 'two misses in one pass are carried');
    p.onAction();
    assert.equal(p.phase, 'lost', 'the third breaks the stroke');
  });
});

/** Play `flag` in the given telling with `bot`, seeded, and report how it went. */
function run(flag: string, hard: boolean, bot: Bot, seed = 1, maxSeconds = 400) {
  const g = GAMES.find((x) => x.flag === flag);
  assert.ok(g, `no game ${flag}`);
  const undo = seedRandom(seed * 7919);
  try {
    const p = g.make(ghost(), ghost(), () => new Set()) as Any;
    RUN.hard = hard;
    const r = play(p, bot, maxSeconds);
    return { ...r, p, verdict: verdictFor(flag, true, hard) };
  } finally {
    undo();
  }
}

describe('the kite, the hard telling', () => {
  for (const flag of ['c11.kite.start', 'c11.duel.start']) {
    it(`${flag}: a held Up meets the weather before any rival falls, and earns no star`, () => {
      // The opening steady air used to outlast seven strokes: a hand that
      // only held Up cut the waxed rival in two seconds, star and all.
      let turned = false;
      let cuts = 0;
      let last = -1;
      const r = run(flag, true, (p, t) => {
        if (p.phase === 'duel') {
          if (p.wind !== 'steady') turned = true;
          p.onDir('up');
        } else if (t - last >= 0.3) {
          last = t;
          p.onAction();
        }
        if (p.cuts > cuts) {
          assert.ok(turned, `rival ${p.cuts} fell before the sky ever turned`);
          cuts = p.cuts;
          turned = false;
        }
      });
      assert.ok(r.done);
      assert.notEqual(r.verdict, 'star');
    });
  }
});
