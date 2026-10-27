import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ghost } from './panelrig';

/**
 * Launch fixes in the minigame panels, each pinned so it stays fixed. The
 * panels run for real on the headless stage (see panelrig.ts).
 */

const { GAMES } = await import('../src/content/world');
const { RUN, takeCoach } = await import('../src/ui/games/run');

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
