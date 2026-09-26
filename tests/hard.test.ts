import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterEach, describe, it } from 'node:test';
import { ghost, play, seedRandom, type Bot, type Panel } from './panelrig';
import { BOTS, SABOTEURS } from './bots';

/**
 * The hard tellings, end to end. Every game with a hard card must be
 * winnable clean by an honest player (its star reachable), the coach line
 * must mean what the completion flow thinks it means, a restart must never
 * inherit the last run's verdict, and the pause strip must actually pause.
 * The panels run for real on a headless stage (see panelrig.ts).
 */

const { GAMES, CHAPTERS } = await import('../src/content/world');
const run = await import('../src/ui/games/run');
const { RUN, coach, tip, freshRun, peekCoach, takeCoach, verdictFor, everyStar, tickPanels } = run;

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const HARD = GAMES.filter((g) => g.hardHow);

afterEach(() => {
  RUN.hard = false;
  for (const g of GAMES) takeCoach(g.flag);
});

/** Open a game's panel in the hard telling and let `bot` play it. */
function hardRun(flag: string, bot: Bot, seed = 1, maxSeconds = 400) {
  const g = GAMES.find((x) => x.flag === flag);
  assert.ok(g, `no game ${flag}`);
  const undo = seedRandom(seed * 7919);
  try {
    const panel = g.make(ghost(), ghost()) as Panel & Any;
    RUN.hard = true;
    const r = play(panel, bot, maxSeconds);
    return { ...r, panel };
  } finally {
    undo();
  }
}

// ------------------------------------------------------------ the contract

describe('the coach contract', () => {
  it('empty coach text is never a fault, and retires one that stood', () => {
    coach('t.a', '');
    assert.equal(peekCoach('t.a'), false);
    assert.equal(verdictFor('t.a', true, true), 'star');
    coach('t.a', '   ');
    assert.equal(peekCoach('t.a'), false);
    coach('t.a', 'You flinched.');
    coach('t.a', '');
    assert.equal(peekCoach('t.a'), false, 'a blank line must retire the fault, not count as one');
  });

  it('a tip rides to the next card but is never a fault', () => {
    tip('t.b', 'Hold one breath longer.');
    assert.equal(peekCoach('t.b'), false);
    assert.equal(verdictFor('t.b', true, true), 'star');
    assert.equal(takeCoach('t.b'), 'Hold one breath longer.');
    assert.equal(takeCoach('t.b'), null, 'advice is consumed on read');
  });

  it('a fault outranks a tip on the card, and costs the star', () => {
    tip('t.c', 'a tip');
    coach('t.c', 'a fault');
    assert.equal(verdictFor('t.c', true, true), 'short');
    assert.equal(takeCoach('t.c'), 'a fault');
  });

  it('a fresh run keeps the words but drops the verdict', () => {
    coach('t.d', 'You pulled early.');
    freshRun('t.d');
    assert.equal(peekCoach('t.d'), false, 'a restart must not inherit the last run as a fault');
    assert.equal(takeCoach('t.d'), 'You pulled early.', 'the advice itself is still owed');
  });

  it('only a hard replay can earn or miss a star', () => {
    coach('t.e', 'x');
    assert.equal(verdictFor('t.e', false, false), 'story');
    assert.equal(verdictFor('t.e', true, false), 'joy');
    assert.equal(verdictFor('t.e', true, true), 'short');
  });
});

// ------------------------------------------------------------ the strip

describe('the pause strip is a real pause', () => {
  it('no panel ticks while the strip is up', () => {
    let ticks = 0;
    const panels = [{ tick: () => void ticks++ }, { tick: () => void ticks++ }, {}];
    tickPanels(panels, 1 / 60, true);
    assert.equal(ticks, 0);
    tickPanels(panels, 1 / 60, false);
    assert.equal(ticks, 2);
  });

  it('a hard clock stands still for as long as the strip is up', () => {
    // The fiesta pot catches when the spoon rests: two seconds of strip
    // must not scorch it, and neither must two minutes.
    const g = GAMES.find((x) => x.flag === 'c9.mole.start')!;
    const p = g.make(ghost(), ghost()) as Any;
    RUN.hard = true;
    p.open(() => {});
    for (let i = 0; i < 60 * 120; i++) tickPanels([p], 1 / 60, true);
    assert.equal(p.failed, false);
    assert.equal(peekCoach('c9.mole.start'), false);
    for (let i = 0; i < 60 * 8; i++) tickPanels([p], 1 / 60, false);
    assert.equal(p.failed, true, 'without the strip, the same rest scorches the pot');
  });

  it('the engine routes every panel tick through the strip check, and the strip walks sideways too', () => {
    const src = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    assert.match(src, /tickPanels\(panelList, dt, !stripEl\.hidden\)/);
    assert.doesNotMatch(src, /for \(const g of games\) g\.panel\.tick/);
    const strip = src.slice(src.indexOf('} else if (!stripEl.hidden) {'), src.indexOf('} else if (albumUI.isOpen) {'));
    assert.match(strip, /menuDir === 'right'/, 'the strip is laid out as a row; right must move along it');
  });
});

// ------------------------------------------------------------ every star

describe('every hard telling can be won clean', () => {
  it('there are twenty two hard tellings, and a player for each', () => {
    assert.equal(HARD.length, 22);
    for (const g of HARD) assert.ok(BOTS[g.flag], `no bot plays ${g.flag}`);
  });

  for (const g of HARD) {
    it(`${g.flag}: a careful hard run ends with the star`, () => {
      // Scopa is a real card game: a careful player still loses some deals,
      // so it gets a few seeds and must win clean in at least one.
      const seeds = g.flag === 'c8.scopa.start' ? [1, 4, 5] : [1];
      let starred = 0;
      let last = '';
      for (const s of seeds) {
        const r = hardRun(g.flag, BOTS[g.flag]!(), s);
        const verdict = verdictFor(g.flag, true, true);
        last = `done=${r.done} after ${r.seconds.toFixed(1)}s, coach: ${takeCoach(g.flag) ?? 'none'}`;
        if (r.done && verdict === 'star') starred++;
      }
      assert.ok(starred > 0, `${g.flag} never earned its star (${last})`);
    });
  }
});

describe("nani's last line", () => {
  it('hard.all fires on the last star, not before', () => {
    const flags = new Set<string>();
    const has = (f: string) => flags.has(f);
    HARD.forEach((g, i) => {
      assert.equal(everyStar(GAMES, has), false, `every star claimed after only ${i}`);
      flags.add(`hard.${g.flag}`);
    });
    assert.equal(everyStar(GAMES, has), true);
  });

  it('the games shelf and the completion flow count the same set of stars', () => {
    const shelf = CHAPTERS.flatMap((c) => c.games ?? [])
      .filter((g) => g.hardHow && g.replayable !== false)
      .map((g) => g.flag)
      .sort();
    assert.deepEqual(shelf, HARD.map((g) => g.flag).sort());
  });
});

// ------------------------------------------------------------ restarts

describe('a restart forgets the last run', () => {
  for (const [flag, sab] of Object.entries(SABOTEURS)) {
    it(`${flag}: lose in-panel, Space, win clean, and the star is still there`, () => {
      const bad = sab();
      const good = BOTS[flag]!();
      let failed = false;
      const bot: Bot = (p, t) => {
        if (!failed && peekCoach(flag)) failed = true;
        (failed ? good : bad)(p, t);
      };
      const r = hardRun(flag, bot, 2, 600);
      assert.ok(failed, `${flag}: the saboteur never failed the run`);
      assert.ok(r.done, `${flag}: the retry never finished`);
      assert.equal(peekCoach(flag), false, `${flag}: the failed attempt still counts against the clean retry`);
      assert.equal(verdictFor(flag, true, true), 'star');
    });
  }

  it('"Start over" from the strip: the engine\'s fresh open drops a stale verdict', () => {
    // The engine calls freshRun() in openPanel for the card and the strip alike.
    coach('c8.pisci.start', 'You slapped air.');
    freshRun('c8.pisci.start');
    const r = hardRun('c8.pisci.start', BOTS['c8.pisci.start']!());
    assert.ok(r.done);
    assert.equal(verdictFor('c8.pisci.start', true, true), 'star');
    const src = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const open = src.slice(src.indexOf('function openPanel('), src.indexOf('g.panel.open('));
    assert.match(open, /freshRun\(g\.def\.flag\)/, 'openPanel must begin every run fresh');
  });
});

// ------------------------------------------------------------ the tables

describe('scopa at the circolo, the hard telling', () => {
  it('a careful player wins the match (and so the star) at a fair rate', () => {
    const N = 40;
    let clean = 0;
    for (let s = 1; s <= N; s++) {
      const r = hardRun('c8.scopa.start', BOTS['c8.scopa.start']!(), 100 + s);
      assert.ok(r.done);
      if (verdictFor('c8.scopa.start', true, true) === 'star') clean++;
      takeCoach('c8.scopa.start');
    }
    // Measured at 109/200 (55%) over a longer sample; the old rule (no card
    // ever taken back) managed 0 of 600. The floor leaves room for luck.
    assert.ok(clean / N >= 0.3, `careful play only won ${clean}/${N} clean`);
    assert.ok(clean / N <= 0.9, `the elder is too soft: ${clean}/${N}`);
  });

  it('only a light table is blamed on a light table', () => {
    const p = GAMES.find((x) => x.flag === 'c8.scopa.start')!.make(ghost(), ghost()) as Any;
    RUN.hard = true;
    p.open(() => {});
    p.gifts = 2;
    p.lightGifts = 0;
    p.coachRun(true);
    const line = takeCoach('c8.scopa.start') ?? '';
    assert.doesNotMatch(line, /light table/);
    p.lightGifts = 2;
    p.coachRun(true);
    assert.match(takeCoach('c8.scopa.start') ?? '', /light table/);
  });
});

describe('the pastry bag, the hard telling', () => {
  it('an end ridden past the gold is a wreck, not a pass', () => {
    const p = GAMES.find((x) => x.flag === 'c8.cook.start')!.make(ghost(), ghost()) as Any;
    RUN.hard = true;
    p.open(() => {});
    p.onAction(); // the ricotta moves
    while (p.fill <= p.zoneLo + p.zoneW + 0.02) p.tick(1 / 60);
    assert.ok(p.fill < 1, 'stopped before the burst');
    p.onAction();
    assert.equal(p.faults, 1, 'past the gold counts against the three');
    assert.equal(p.end, 0, 'the same end goes again');
    assert.equal(p.phase, 'pipe');
  });

  it('the story bag still forgives a generous end', () => {
    const p = GAMES.find((x) => x.flag === 'c8.cook.start')!.make(ghost(), ghost()) as Any;
    RUN.hard = false;
    p.open(() => {});
    p.onAction();
    while (p.fill <= p.zoneLo + p.zoneW + 0.02) p.tick(1 / 60);
    p.onAction();
    assert.equal(p.end, 1, 'generous but holding moves on to the other end');
  });
});

describe('the coach says true things', () => {
  it("the ustad's rabri is named once, not 'the the'", () => {
    const p = GAMES.find((x) => x.flag === 'c11.cook.start')!.make(ghost(), ghost()) as Any;
    RUN.hard = true;
    p.open(() => {});
    p.course = p.courses.length - 1;
    p.fault('late');
    p.spent = true;
    p.reportCoach();
    const line = takeCoach('c11.cook.start') ?? '';
    assert.match(line, /ustad's rabri/);
    assert.doesNotMatch(line, /\bthe the\b/);
  });

  it('a lopsided second roll is not blamed on a seal that cannot split', () => {
    const p = GAMES.find((x) => x.flag === 'c11.cook.start')!.make(ghost(), ghost()) as Any;
    RUN.hard = true;
    p.open(() => {});
    p.fault('rollSecond');
    p.spent = true;
    p.reportCoach();
    const line = takeCoach('c11.cook.start') ?? '';
    assert.match(line, /second roll/);
    assert.doesNotMatch(line, /seal split/);
  });
});
