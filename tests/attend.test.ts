import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ghost, play, seedRandom, type Bot, type Panel } from './panelrig';
import { BOTS, STORY_BOTS } from './bots';

/**
 * The story tellings cannot be lost, and should not be won by a hand that
 * never looks. For every game where mashing used to work as well as paying
 * attention: an attentive player is exactly as quick as before, a masher
 * still always finishes (nobody is locked out), and the two runs do not end
 * the same way. Panels run for real on the headless stage (panelrig.ts).
 */

const { GAMES } = await import('../src/content/world');
const { RUN, takeCoach } = await import('../src/ui/games/run');

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

afterEach(() => {
  RUN.hard = false;
  for (const g of GAMES) takeCoach(g.flag);
});

/** Space every `n` frames: ten a second at n = 6, the way a hand mashes. */
const mash = (n = 6): Bot => {
  let f = 0;
  return (p) => {
    if (f++ % n === 0) p.onAction();
  };
};

/** The careful player steers; the masher's thumb never leaves Space. */
const both = (a: Bot, b: Bot): Bot => (p, t) => {
  a(p, t);
  b(p, t);
};

const urojoStory = STORY_BOTS['c7.cook.start']!;

/** One story run: whether it closed, how long it took, and its last words. */
function storyRun(flag: string, bot: Bot, seed = 1, maxSeconds = 240) {
  const g = GAMES.find((x) => x.flag === flag)!;
  const undo = seedRandom(seed * 7919);
  try {
    RUN.hard = false;
    const panel = g.make(ghost(), ghost(), () => new Set()) as Panel & Any;
    let said = '';
    const r = play(
      panel,
      (p, t) => {
        said = String(p.hint ?? '');
        bot(p, t);
      },
      maxSeconds,
    );
    return { ...r, said, panel };
  } finally {
    undo();
  }
}

/** Arrows rolled in the stirring order, eight a second, Space for the smoke. */
const roll = (): Bot => {
  const D = ['up', 'right', 'down', 'left'] as const;
  let i = 0;
  let f = 0;
  return (p) => {
    if (f++ % 8) return;
    if (p.smoke >= 0 || p.done || p.failed) p.onAction();
    else p.onDir(D[i++ % 4]);
  };
};

/**
 * `before` is the careful story run as measured when its last beat was
 * added (pass 2 gave most story runs a second round or a twist, so these
 * grew on purpose); the test now guards against careful play getting
 * slower than that by accident.
 */
type Case = { flag: string; careful: () => Bot; masher: () => Bot; before: number; slower?: number };
const CASES: Case[] = [
  { flag: 'wave.start', careful: BOTS['wave.start']!, masher: () => mash(), before: 15, slower: 1.5 },
  { flag: 'c2.cook.start', careful: BOTS['c2.cook.start']!, masher: () => mash(), before: 10, slower: 1.5 },
  { flag: 'c3.cook.start', careful: BOTS['c3.cook.start']!, masher: () => mash(), before: 9 },
  { flag: 'c5.hotteok.start', careful: BOTS['c5.hotteok.start']!, masher: () => mash(), before: 8.1 },
  { flag: 'c8.cook.start', careful: BOTS['c8.cook.start']!, masher: () => mash(), before: 10, slower: 2 },
  { flag: 'watia.start', careful: BOTS['watia.start']!, masher: () => both(BOTS['watia.start']!(), mash(3)), before: 9.4, slower: 1.5 },
  { flag: 'c7.cook.start', careful: urojoStory, masher: () => mash(), before: 19.1, slower: 1.5 },
  { flag: 'c4.kingyo.start', careful: BOTS['c4.kingyo.start']!, masher: () => mash(), before: 5, slower: 1 },
  { flag: 'c6.sadya.start', careful: BOTS['c6.sadya.start']!, masher: () => mash(), before: 4.9, slower: 2 },
  // The story pot: a hand rolling the arrows round the circle stirs slower than one that watches the spoon.
  { flag: 'c9.mole.start', careful: BOTS['c9.mole.start']!, masher: roll, before: 17.8, slower: 2 },
];

describe('the story tellings reward attention, never lock anyone out', () => {
  for (const c of CASES) {
    it(`${c.flag}: careful keeps its measured pace, mashing finishes differently`, () => {
      const good = storyRun(c.flag, c.careful());
      const bad = storyRun(c.flag, c.masher());
      assert.ok(good.done, `${c.flag}: the careful story run never finished`);
      assert.ok(good.seconds <= c.before + 0.6, `${c.flag}: careful play got slower (${good.seconds.toFixed(1)}s, was ${c.before}s)`);
      assert.ok(bad.done, `${c.flag}: a masher was locked out of the story run`);
      assert.notEqual(bad.said, good.said, `${c.flag}: mashing ends exactly like care does`);
      if (c.slower) {
        assert.ok(
          bad.seconds >= good.seconds * c.slower,
          `${c.flag}: mashing (${bad.seconds.toFixed(1)}s) is nearly as quick as care (${good.seconds.toFixed(1)}s)`,
        );
      }
    });
  }
});

describe('the caballito ride wants the arrows', () => {
  it('a ride left alone pins on a rail, rights itself, and still comes home', () => {
    const paddle: Bot = (p) => {
      if (p.phase === 'paddle') {
        if (p.x <= p.zoneHi - 0.01 && p.x >= p.zoneLo) p.onAction();
      } else if (p.phase !== 'ride') p.onAction();
    };
    let slow = 0;
    for (let s = 1; s <= 6; s++) {
      const r = storyRun('wave.start', paddle, s);
      assert.ok(r.done, `seed ${s}: an armless ride never came home`);
      if (r.seconds > 10) slow++;
    }
    assert.ok(slow >= 4, `a ride without the arrows is nearly as quick as one with them (${slow}/6 slow)`);
  });
});

describe('the sadya leaf is learned, not read', () => {
  it('a wrong seat earns the correction and her finger on the right seat', () => {
    const p = GAMES.find((x) => x.flag === 'c6.sadya.start')!.make(ghost(), ghost(), () => new Set()) as Any;
    RUN.hard = false;
    p.open(() => {});
    assert.equal(p.cur, 0);
    p.onAction(); // the pappadam, on the pickle's seat
    for (let i = 0; i < 60; i++) p.tick(1 / 60); // her hand leaves the ladle
    assert.equal(p.course, 0, 'a wrong seat serves nothing');
    assert.equal(p.pointAt, 5, 'Auntie Leela points at the pappadam seat');
    assert.match(p.hint, /bottom right/);
    p.onDir('right');
    p.onDir('right');
    p.onDir('down');
    p.onAction();
    assert.equal(p.course, 1);
    assert.equal(p.pointAt, -1, 'her finger leaves once the course is served');
  });

  it('the seats carry no names after her one walk around the leaf', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../src/ui/games/kerala.ts', import.meta.url), 'utf8');
    const leaf = src.slice(src.indexOf('private paintOpenLeaf('), src.indexOf('private paintLadle('));
    assert.match(leaf, /teaching === i \|\| pointed/, 'a seat is only named while she points at it');
    assert.doesNotMatch(leaf, /if \(this\.phase === 'serve'\) label\(/);
  });
});

describe('nobody is left without help', () => {
  it('kingyo: a Space-only hand that never moves the poi still lands a fish, every paper', () => {
    for (let s = 1; s <= 8; s++) {
      for (const n of [6, 10, 20]) {
        const r = storyRun('c4.kingyo.start', mash(n), s, 120);
        assert.ok(r.done, `seed ${s}, Space every ${n} frames: never finished`);
      }
    }
  });

  it('sadya: a hand that ignores her finger still gets the leaf served', () => {
    for (let s = 1; s <= 6; s++) {
      const DIRS = ['up', 'down', 'left', 'right'] as const;
      let f = 0;
      const random: Bot = (p) => {
        if (f++ % 8) return;
        if (Math.random() < 0.5) p.onAction();
        else p.onDir(DIRS[Math.floor(Math.random() * 4)]);
      };
      const r = storyRun('c6.sadya.start', random, s, 120);
      assert.ok(r.done, `seed ${s}: a random hand never finished the leaf`);
    }
  });

  it('adobo: story Ben names every next thing before you reach for it', () => {
    const p = GAMES.find((x) => x.flag === 'c3.cook.start')!.make(ghost(), ghost(), () => new Set()) as Any;
    RUN.hard = false;
    p.open(() => {});
    assert.match(p.hint, /garlic/i);
    const order = ['Chicken', 'Soy sauce', 'Cane vinegar', 'Bay leaves', 'Peppercorns'];
    const bot = BOTS['c3.cook.start']!();
    for (let i = 0, t = 0; i < order.length; t += 1 / 60) {
      const before = p.step;
      bot(p, t);
      p.tick(1 / 60);
      if (p.step !== before) {
        assert.match(p.hint, new RegExp(order[i]!, 'i'), `after step ${before}, Ben never called the ${order[i]}`);
        i++;
      }
    }
  });
});

describe('the kite roofs keep their weather where it belongs', () => {
  for (const flag of ['c11.kite.start', 'c11.duel.start']) {
    it(`${flag}: every story duel meets a gust and a flock before it ends`, () => {
      const seen = new Map<number, Set<string>>();
      const bot = BOTS[flag]!();
      const r = storyRun(
        flag,
        (p, t) => {
          if (p.phase === 'duel') {
            const s = seen.get(p.rivalIdx) ?? new Set<string>();
            s.add(p.wind);
            seen.set(p.rivalIdx, s);
          }
          bot(p, t);
        },
        1,
        300,
      );
      assert.ok(r.done, `${flag}: the story never finished`);
      assert.ok(seen.size >= 1);
      for (const [i, winds] of seen) {
        assert.ok(winds.has('gust'), `${flag}: rival ${i} was beaten before any gust`);
        assert.ok(winds.has('birds'), `${flag}: rival ${i} was beaten before any flock`);
      }
    });
  }

  it('the storm after the third cut waits on Space: no wind talks over it', () => {
    const g = GAMES.find((x) => x.flag === 'c11.duel.start')!;
    const p = g.make(ghost(), ghost(), () => new Set()) as Any;
    RUN.hard = false;
    const bot = BOTS['c11.duel.start']!();
    let t = 0;
    p.open(() => {});
    while (p.phase !== 'storm' && t < 300) {
      bot(p, t);
      p.tick(1 / 60);
      t += 1 / 60;
    }
    assert.equal(p.phase, 'storm', 'the tournament never reached the storm');
    const said = p.hint;
    for (let i = 0; i < 60 * 12; i++) p.tick(1 / 60);
    assert.equal(p.phase, 'storm');
    assert.equal(p.hint, said, 'the wind overwrote the storm line while it waited on Space');
    p.onAction();
    assert.equal(p.phase, 'done');
  });
});

describe('gold is for the hand that waits', () => {
  it('a mashed hotteok batch comes off the iron with no gold in it', () => {
    const r = storyRun('c5.hotteok.start', mash(), 1);
    assert.ok(r.done, 'the masher was locked out');
    assert.equal(r.panel.golden, 0, 'mashing still earned gold');
    const careful = storyRun('c5.hotteok.start', BOTS['c5.hotteok.start']!(), 1);
    assert.ok(careful.panel.golden >= 4, 'a careful batch should be mostly gold');
  });
});
