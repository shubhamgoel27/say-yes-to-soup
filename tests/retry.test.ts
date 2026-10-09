import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { DT, ghost, seedRandom, type Bot } from './panelrig';
import { BOTS } from './bots';

/**
 * Misses that cost the right amount. A spoiled pot picks up where it
 * spoiled, not at the apron; an early hand in the dawn kitchen clouds the
 * broth instead of being applauded with the careful one; a pot that has not
 * been touched cannot scorch; and a hand that keeps missing hears different
 * words, then real help, instead of one sentence sixty times.
 */

const { GAMES } = await import('../src/content/world');
const { RUN, takeCoach } = await import('../src/ui/games/run');
const { missLine } = await import('../src/ui/games/attend');

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

afterEach(() => {
  RUN.hard = false;
  for (const g of GAMES) takeCoach(g.flag);
});

function panel(flag: string, hard = false): Any {
  RUN.hard = hard;
  const p = GAMES.find((g) => g.flag === flag)!.make(ghost(), ghost(), () => new Set()) as Any;
  p.open(() => {
    p.closed = true;
  });
  return p;
}

/** Tick until `until` holds, or `max` seconds pass; returns the seconds spent. */
function run(p: Any, until: (p: Any) => boolean, max = 60, bot?: Bot): number {
  let t = 0;
  while (!until(p) && t < max) {
    bot?.(p, t);
    p.tick(DT);
    t += DT;
  }
  return t;
}

/** Feed the pot its next thing, the way a careful hand does. */
function feedAll(p: Any, upTo: number) {
  const galley = BOTS['c3.cook.start']!();
  run(p, (q) => q.landed >= upTo && !q.fly, 60, (q, t) => {
    if (q.step < upTo) galley(q, t);
  });
}

describe('the adobo picks up where it spoiled', () => {
  it('a burnt story pot comes back on the spare pot, six things still in it, no apron', () => {
    const p = panel('c3.cook.start');
    feedAll(p, 6);
    run(p, (q) => q.simmer >= 0, 10);
    run(p, (q) => q.burnt, 40);
    assert.ok(p.burnt, 'the story pot never caught');
    p.onAction();
    assert.equal(p.burnt, false);
    assert.equal(p.landed, 6, 'the retry emptied the pot');
    assert.equal(p.step, 6, 'the retry asks for the garlic again');
    assert.equal(p.simmer, 0);
    assert.doesNotMatch(p.hint, /apron/, 'Ben ties the apron again on a retry');
    run(p, (q) => q.simmer >= q.ready + 0.01, 30);
    p.onAction();
    assert.ok(p.done, 'the spare pot cannot be lifted off');
  });

  it('a hard pot scorched on the third step resumes at the third step', () => {
    const p = panel('c3.cook.start', true);
    feedAll(p, 3);
    run(p, (q) => q.burnt, 20);
    assert.equal(p.failMode, 'scorch');
    p.onAction();
    assert.equal(p.burnt, false);
    assert.equal(p.step, 3);
    assert.equal(p.landed, 3);
    assert.equal(p.simmer, -1, 'the pantry closed after a scorch retry');
    assert.ok(p.stepLeft > 4, 'the scraped pan gives the step its full time again');
    assert.doesNotMatch(p.hint, /apron/);
  });

  it('a hard pot lifted too soon goes back under the lid, not back to the garlic', () => {
    const p = panel('c3.cook.start', true);
    feedAll(p, 8);
    run(p, (q) => q.simmer >= 0.2, 20);
    p.onAction();
    assert.equal(p.failMode, 'thin');
    const was = p.simmer;
    p.onAction();
    assert.equal(p.burnt, false);
    assert.equal(p.landed, 8);
    assert.ok(p.simmer >= was, 'the simmer started over from nothing');
  });
});

describe('the dawn kitchen prices an early pull', () => {
  /** Drop the kombu and wait out the steep. */
  function toPull(p: Any) {
    p.onAction();
    run(p, (q) => q.phase === 'pull', 10);
  }

  it('an early reach cools the pot and clouds the broth; the careful pull is the one applauded', () => {
    const careful = panel('c4.cook.start');
    toPull(careful);
    run(careful, (q) => q.heat >= q.pullLo + 1, 20);
    careful.onAction();
    assert.equal(careful.phase, 'skim');
    assert.match(careful.hint, /applause/);

    const eager = panel('c4.cook.start');
    toPull(eager);
    run(eager, (q) => q.heat >= 30, 20);
    const before = eager.heat;
    eager.onAction();
    assert.ok(eager.heat < before - 5, `an early pull cost no heat (${before} -> ${eager.heat})`);
    assert.equal(eager.clouds, 1);
    // Keep reaching every few frames, the way a mashing hand does.
    let f = 0;
    const t = run(eager, (q) => q.phase !== 'pull', 30, (q) => {
      if (f++ % 6 === 0) q.onAction();
    });
    assert.equal(eager.phase, 'skim', `a mashing hand never got the kombu out (${t.toFixed(1)}s)`);
    assert.doesNotMatch(eager.hint, /applause/, 'mashing earns the careful applause');
    assert.match(eager.hint, /cloudy/);
  });

  it('early reaches answer in different words', () => {
    const p = panel('c4.cook.start');
    toPull(p);
    const said = new Set<string>();
    for (let i = 0; i < 4; i++) {
      p.onAction();
      said.add(p.hint);
    }
    assert.equal(said.size, 4);
  });

  it('the three foams spawn apart, none under the ladle, and the onigiri line counts one press', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const undo = seedRandom(seed * 104729);
      try {
        const p = panel('c4.cook.start');
        toPull(p);
        run(p, (q) => q.heat >= q.pullLo + 1, 20);
        p.onAction();
        const xs = (p.foam as { x: number }[]).map((f) => f.x).sort((a, b) => a - b);
        assert.equal(xs.length, 3);
        for (let i = 1; i < xs.length; i++) assert.ok(xs[i]! - xs[i - 1]! >= 0.17, `seed ${seed}: foams ${xs} crowd together`);
        assert.ok(xs.every((x) => Math.abs(x - p.lx) > p.skimReach), `seed ${seed}: a foam spawned under the ladle`);
        // Left to drift, they keep their distance.
        run(p, () => false, 8);
        const later = (p.foam as { x: number }[]).map((f) => f.x).sort((a, b) => a - b);
        for (let i = 1; i < later.length; i++) assert.ok(later[i]! - later[i - 1]! >= 0.12, `seed ${seed}: foams merged while drifting (${later})`);
      } finally {
        undo();
      }
    }
    const p = panel('c4.cook.start');
    const bot = BOTS['c4.cook.start']!();
    run(p, (q) => q.phase === 'done', 60, bot);
    assert.equal(p.phase, 'done');
    assert.doesNotMatch(p.hint, /three presses/);
  });
});

describe('the mole comal waits for the first touch', () => {
  it('a pot opened and left alone does not scorch; once stirred, the comal keeps its clock', () => {
    const p = panel('c9.mole.start');
    run(p, () => false, 60);
    assert.equal(p.failed, false, 'an untouched pot scorched');
    assert.equal(p.smoke, -1, 'the comal smoked before anyone touched the pot');
    p.onDir('up');
    run(p, (q) => q.failed, 30);
    assert.ok(p.failed, 'once lit, the comal never caught');
    // The second pot waits for a touch again.
    p.onAction();
    run(p, () => false, 30);
    assert.equal(p.failed, false, 'the second pot scorched untouched');
  });
});

describe('a hand that keeps missing hears more than one sentence', () => {
  it('missLine takes turns, then adds help', () => {
    const lines = ['a', 'b', 'c'];
    assert.equal(missLine(lines, 0, 'H'), 'a');
    assert.equal(missLine(lines, 1, 'H'), 'b');
    assert.equal(missLine(lines, 3, 'H'), 'a <b>H</b>');
  });

  /** Distinct hints a lazy hand sees over `seconds`, and whether help ever showed. */
  function lazyWords(flag: string, bot: Bot, seconds: number) {
    const p = panel(flag);
    const said = new Set<string>();
    run(p, () => false, seconds, (q, t) => {
      bot(q, t);
      said.add(String(q.hint));
    });
    return { said, help: [...said].some((h) => h.includes('<b>')) };
  }

  it('chaya: a pour let go at once', () => {
    let f = 0;
    const r = lazyWords('c6.cook.start', (p) => {
      if (f++ % 6 === 0) p.onAction();
    }, 30);
    const surrender = [...r.said].filter((h) => /Shaji/.test(h) && !/climbs/.test(h));
    assert.ok(new Set(surrender).size >= 4, `one surrender line over and over (${surrender.length})`);
    assert.ok(r.help, 'no help in the panel after repeated low pours');
  });

  it('pastry bag: a bag left running', () => {
    let started = false;
    const r = lazyWords('c8.cook.start', (p) => {
      if (p.phase === 'pipe' && !p.flowing) {
        if (!started || p.fill === 0) p.onAction();
        started = true;
      }
    }, 30);
    const bursts = [...r.said].filter((h) => /Alfio/.test(h) && /shell|wreck|bite/.test(h));
    assert.ok(new Set(bursts).size >= 3, 'the same burst line every time');
    assert.ok(r.help, 'no help in the panel after repeated bursts');
  });

  it('mole: arrows rolled round the wrong way', () => {
    const D = ['left', 'down', 'right', 'up'] as const;
    let i = 0;
    let f = 0;
    const r = lazyWords('c9.mole.start', (p) => {
      if (f++ % 8 === 0) p.onDir(D[i++ % 4]);
      if (p.smoke >= 0 || p.failed) p.onAction();
    }, 30);
    const sloshes = [...r.said].filter((h) => /slosh|wall|circle|comal, hissing/.test(h));
    assert.ok(new Set(sloshes).size >= 3, 'it sloshes, one line, over and over');
    assert.ok(r.help, 'no help in the panel after repeated sloshes');
  });
});
