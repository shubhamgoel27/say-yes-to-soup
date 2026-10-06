import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ghost, play, seedRandom, type Bot, type Panel } from './panelrig';
import { BOTS } from './bots';

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

/** Urojo has no called order in the story; an attentive cook answers the customer. */
const urojoStory = (): Bot => {
  const plan = [
    [6, 6, 0, 2],
    [4, 2, 4, 5],
  ];
  let last = -1;
  return (p, t) => {
    if (t - last < 0.15) return;
    last = t;
    if (p.phase !== 'build') return p.onAction();
    const want = plan[p.round] ?? [];
    const n = (p.counts as number[]).reduce((a, b) => a + b, 0);
    if (p.cur === (n < want.length ? want[n] : 7)) p.onAction();
    else p.onDir('right');
  };
};

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

type Case = { flag: string; careful: () => Bot; masher: () => Bot; before: number; slower?: number };
const CASES: Case[] = [
  { flag: 'wave.start', careful: BOTS['wave.start']!, masher: () => mash(), before: 8, slower: 2 },
  { flag: 'c2.cook.start', careful: BOTS['c2.cook.start']!, masher: () => mash(), before: 5, slower: 1.5 },
  { flag: 'c3.cook.start', careful: BOTS['c3.cook.start']!, masher: () => mash(), before: 9 },
  { flag: 'c5.hotteok.start', careful: BOTS['c5.hotteok.start']!, masher: () => mash(), before: 5 },
  { flag: 'c8.cook.start', careful: BOTS['c8.cook.start']!, masher: () => mash(), before: 10, slower: 2 },
  { flag: 'watia.start', careful: BOTS['watia.start']!, masher: () => both(BOTS['watia.start']!(), mash(3)), before: 5, slower: 1.5 },
  { flag: 'c7.cook.start', careful: urojoStory, masher: () => mash(), before: 7 },
  { flag: 'c4.kingyo.start', careful: BOTS['c4.kingyo.start']!, masher: () => mash(10), before: 5 },
];

describe('the story tellings reward attention, never lock anyone out', () => {
  for (const c of CASES) {
    it(`${c.flag}: careful is as quick as ever, mashing finishes differently`, () => {
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
