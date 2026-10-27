import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { DT, ghost, play, seedRandom, type Bot } from './panelrig';
import { BOTS, STORY_BOTS } from './bots';

/**
 * Launch fixes in the minigame panels, each pinned so it stays fixed. The
 * panels run for real on the headless stage (see panelrig.ts).
 */

const { GAMES } = await import('../src/content/world');
const { RUN, takeCoach, peekCoach, verdictFor, tickPanels } = await import('../src/ui/games/run');

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

afterEach(() => {
  RUN.hard = false;
  RUN.held = false;
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

/** Space every `n` frames, the way a hand mashes; Space only, unless `also` steers. */
const mash = (n: number, also?: Bot): Bot => {
  let f = 0;
  return (p, t) => {
    also?.(p, t);
    if (f++ % n === 0) p.onAction();
  };
};

describe('the caballito, the hard water', () => {
  it('a hand mashing Space through the paddle never earns the star', () => {
    // A rider who steers the ride home properly, and never looks at the swells.
    const ride: Bot = (p) => {
      if (p.phase !== 'ride') return;
      if (p.balance > 0.08) p.onDir('left');
      else if (p.balance < -0.08) p.onDir('right');
    };
    for (const n of [3, 6, 15]) {
      for (let seed = 1; seed <= 6; seed++) {
        const r = run('wave.start', true, mash(n, ride), seed);
        assert.ok(r.done);
        assert.notEqual(r.verdict, 'star', `mashing every ${n} frames took the star (seed ${seed})`);
        takeCoach('wave.start');
      }
    }
  });

  it('an eager stroke leaves the paddle in the air for a beat, as in the story', () => {
    const p = opened('wave.start', true);
    p.onAction(); // the swell is still far out
    assert.equal(p.earlyMisses, 1);
    p.x = (p.zoneLo + p.zoneHi) / 2; // and now it is right on the horse
    p.onAction();
    assert.equal(p.waves, 0, 'the paddle was still in the air');
    p.x = 1; // the next swell, far out again: the beat passes, nothing escapes
    for (let i = 0; i < 30; i++) p.tick(1 / 60);
    assert.equal(p.escapes, 0);
    p.x = (p.zoneLo + p.zoneHi) / 2;
    p.onAction();
    assert.equal(p.waves, 1, 'back in the water after the beat');
  });
});

describe('the ceviche, the hard noon', () => {
  it('a hand mashing Space through the lime never earns the star', () => {
    for (const n of [3, 6, 15, 30]) {
      for (let seed = 1; seed <= 4; seed++) {
        const r = run('c2.cook.start', true, mash(n), seed);
        assert.ok(r.done, 'the dish still comes out, or the noon ends kindly');
        assert.notEqual(r.verdict, 'star', `mashing every ${n} frames took the star (seed ${seed})`);
        takeCoach('c2.cook.start');
      }
    }
  });

  it('one early pull costs the star, names itself, and the dish still comes out', () => {
    let pulledEarly = false;
    const careful = BOTS['c2.cook.start']!();
    const r = run('c2.cook.start', true, (p, t) => {
      if (p.step === 'lime' && !pulledEarly && p.kiss > 0.1) {
        pulledEarly = true;
        p.onAction();
        return;
      }
      careful(p, t);
    });
    assert.ok(pulledEarly && r.done);
    assert.equal(r.verdict, 'short');
    assert.match(takeCoach('c2.cook.start') ?? '', /You pulled at [\d.]+ seconds; the bar only brightens at/);
  });

  it('a careful noon with nothing early still takes the star', () => {
    const r = run('c2.cook.start', true, BOTS['c2.cook.start']!());
    assert.ok(r.done);
    assert.equal(r.verdict, 'star');
  });
});

describe('the dashi, the pale band', () => {
  /** A dashi pot with the kombu in, steeped, and the flame just lit. */
  function atThePull(hard: boolean): Any {
    const p = opened('c4.cook.start', hard);
    p.onAction(); // kombu and iriko in
    while (p.phase === 'steep') p.tick(1 / 60);
    assert.equal(p.phase, 'pull');
    return p;
  }

  it('a hard pull past the band is the boil, and the card says it was late', () => {
    const p = atThePull(true);
    while (p.heat <= p.pullHi) p.tick(1 / 60);
    assert.ok(p.heat < 100, 'still short of the boil itself');
    p.onAction();
    assert.equal(p.phase, 'ruined');
    assert.equal(verdictFor('c4.cook.start', true, true), 'short');
    assert.match(takeCoach('c4.cook.start') ?? '', /after the pale band/);
  });

  it('a hard pull inside the band still lifts the kombu clean', () => {
    const p = atThePull(true);
    while (p.heat < (p.pullLo + p.pullHi) / 2) p.tick(1 / 60);
    p.onAction();
    assert.equal(p.phase, 'skim');
  });

  it('the story forgives a late pull, and says it was late', () => {
    const p = atThePull(false);
    while (p.heat <= p.pullHi) p.tick(1 / 60);
    p.onAction();
    assert.equal(p.phase, 'skim');
    assert.match(p.hint, /first big bubbles/);
  });
});

describe('the ceviche clock', () => {
  it('reads a minute past noon at the board, and never 12:67 however many lisas die', () => {
    const p = opened('c2.cook.start', false);
    assert.equal(p.clock(), '12:01');
    p.spoiled = 66; // the story's fish never run out
    p.plate = 2;
    p.step = 'pour';
    assert.equal(p.clock(), '12:59');
  });
});

describe('the caballito, the story', () => {
  /** The careful story rider, plus `early` eager strokes on the first swells. */
  function ride(early: number) {
    const careful = BOTS['wave.start']!();
    let left = early;
    let said = '';
    const r = run('wave.start', false, (p, t) => {
      if (p.phase === 'done') said = p.hint;
      if (p.phase === 'paddle' && left > 0 && p.x > p.zoneHi + 0.3 && !p.eager.on) {
        left--;
        p.onAction();
        return;
      }
      careful(p, t);
    });
    assert.ok(r.done);
    return { said, escapes: r.p.escapes };
  }

  it('"not one wasted" only for six strokes on six swells', () => {
    assert.match(ride(0).said, /not one wasted/);
    const wobbly = ride(1);
    assert.equal(wobbly.escapes, 0, 'the eager stroke cost no swell');
    assert.doesNotMatch(wobbly.said, /not one wasted/);
  });
});

describe('the ceviche, a late pull', () => {
  for (const hard of [false, true]) {
    it(`${hard ? 'hard' : 'story'}: a pull past the bright zone is answered, not ignored`, () => {
      const p = opened('c2.cook.start', hard);
      while (p.step !== 'lime') p.onAction();
      while (p.kiss < p.zoneHi + 0.02) p.tick(1 / 60);
      const before = p.hint;
      p.onAction();
      assert.notEqual(p.hint, before);
      assert.match(p.hint, /Too late/);
      assert.equal(p.step, 'lime', 'the fish stays in; the lime has it');
    });
  }
});

describe('the loom, by pointer', () => {
  it('a ball answers only the primary button, and never through the pause strip', () => {
    // Catch the loom's own canvas listener: the stage is headless.
    let down: ((e: Any) => void) | null = null;
    const cv = ghost();
    cv.addEventListener = (type: string, fn: (e: Any) => void) => {
      if (type === 'pointerdown') down = fn;
    };
    cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 640, height: 340 });
    const doc = globalThis.document as Any;
    doc.createElement = () => cv;
    let p: Any;
    try {
      p = GAMES.find((g) => g.flag === 'weave.start')!.make(ghost(), ghost(), () => new Set());
    } finally {
      doc.createElement = () => ghost();
    }
    assert.ok(down, 'the loom listens on its canvas');
    RUN.hard = true;
    p.open(() => {});
    while (p.phase !== 'input') p.tick(1 / 60);
    // The basket, as painted: left, up, right, down (scene px = client px here).
    const BALL = [
      [452, 178],
      [523, 106],
      [594, 178],
      [523, 250],
    ];
    const tap = (button: number) => {
      const [x, y] = BALL[p.seq[p.at]]!;
      down!({ button, clientX: x, clientY: y, preventDefault() {}, stopPropagation() {} });
    };
    tap(2);
    tap(1);
    assert.equal(p.at, 0, 'a right or middle click is not a call-back');
    tickPanels([p], 1 / 60, true); // Esc: the strip is up, the clock stands still
    tap(0);
    tap(0);
    assert.equal(p.at, 0, 'no ball answers behind the strip');
    tickPanels([p], 1 / 60, false); // "Keep at it"
    tap(0);
    assert.equal(p.at, 1, 'with the strip gone, the right ball answers');
  });
});

// ------------------------------------------------------------ the payoff contract

/**
 * The engine treats a panel whose `phase` reads 'done' as showing its payoff:
 * it rests the action key for a beat after the payoff appears, and Esc there
 * closes the panel through onAction (keeping the win) instead of offering
 * "Step away", which would throw the win away. So for every game, in every
 * telling: 'done' appears only on the won payoff, holds there untouched, and
 * the next onAction closes the panel with the win, once.
 */
function payoff(flag: string, hard: boolean, bot: Bot, seed: number) {
  const g = GAMES.find((x) => x.flag === flag)!;
  const undo = seedRandom(seed * 7919);
  const problems: string[] = [];
  let calls = 0;
  const fired = () => calls; // read through a call: onDone bumps it behind the checker's back
  let won = false;
  try {
    const p = g.make(ghost(), ghost(), () => new Set()) as Any;
    RUN.hard = hard;
    p.open(() => {
      calls++;
    });
    const act = p.onAction.bind(p);
    p.onAction = () => {
      const before = p.phase;
      const n = fired();
      act();
      if (fired() > n) {
        // Closing from anywhere but 'done' is only ever a run that fell short.
        if (before !== 'done' && !(hard && peekCoach(flag))) problems.push(`closed with a win from phase ${String(before)}`);
      } else if (before === 'done' && p.phase !== 'done') {
        problems.push(`'done' went on to ${String(p.phase)} instead of closing`);
      }
    };
    let t = 0;
    while (fired() === 0 && t < 400) {
      if (p.phase === 'done') {
        // The payoff stands on its own: nothing pressed, it neither closes nor moves.
        for (let i = 0; i < 120; i++) p.tick(DT);
        if (p.phase !== 'done' || fired() || !p.isOpen) problems.push(`'done' did not hold (now ${String(p.phase)})`);
        p.onAction();
        if (fired() !== 1 || p.isOpen) problems.push("the first onAction on a standing 'done' did not close the panel");
        else won = true;
        if (hard && peekCoach(flag)) problems.push(`a 'done' close filed a fault: ${takeCoach(flag)}`);
        break;
      }
      bot(p, t);
      if (fired()) break;
      p.tick(DT);
      t += DT;
    }
    // Closed is closed: more presses and frames never report again.
    for (let i = 0; i < 5; i++) {
      p.onAction();
      p.tick(DT);
    }
    if (fired() !== 1) problems.push(`onDone fired ${fired()} times`);
  } finally {
    undo();
    RUN.hard = false;
    takeCoach(flag);
  }
  return { problems, won };
}

describe("every panel's 'done' is its payoff, and the next press closes it with the win", () => {
  for (const g of GAMES) {
    for (const hard of g.hardHow ? [false, true] : [false]) {
      it(`${g.flag}, ${hard ? 'hard' : 'story'}`, () => {
        const bot = hard ? BOTS[g.flag] : (STORY_BOTS[g.flag] ?? BOTS[g.flag]);
        assert.ok(bot, `no player for ${g.flag}`);
        // Scopa is a real card game: a careful hand still loses some deals.
        const seeds = g.flag === 'c8.scopa.start' ? [1, 4, 5] : [1];
        let won = false;
        for (const seed of seeds) {
          const r = payoff(g.flag, hard, bot(), seed);
          assert.deepEqual(r.problems, [], `${g.flag} (seed ${seed})`);
          won ||= r.won;
        }
        assert.ok(won, `${g.flag}: never reached a won 'done'`);
      });
    }
  }
});
