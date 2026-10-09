/**
 * One honest player per hard telling. Each bot plays the real panel through
 * its real inputs; it only cheats by reading the panel's state instead of
 * watching the canvas, which is what a sharp human eye does anyway. If a bot
 * can finish a hard telling with nothing filed, the star is reachable.
 */
import type { Bot, Dir } from './panelrig';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Press at most once per `gap` seconds of game time. */
function paced(gap: number) {
  let last = -99;
  return (t: number): boolean => {
    if (t - last < gap) return false;
    last = t;
    return true;
  };
}

const LOOM = ['left', 'up', 'right', 'down'] as const;

const weave: () => Bot = () => (p) => {
  if (p.phase === 'input') p.onDir(LOOM[p.seq[p.at]]);
  else if (p.phase === 'row-done' || p.phase === 'done') p.onAction();
};

const watia: () => Bot = () => {
  const beat = paced(0.5);
  return (p, t) => {
    if (p.phase === 'stack') {
      if (p.placed[p.cursor]) p.onDir('right');
      else {
        p.onAction();
        if (!p.placed[p.cursor]) p.onDir('right');
      }
    } else if (p.phase === 'fire') {
      if (beat(t)) p.onAction();
    } else if (p.phase === 'dig') {
      // Story only: walk the heap to the nearest spot that still steams.
      if (!beat(t)) return;
      const order = [0, 2, 4, 3, 1];
      const want = order
        .map((slot, i) => ({ slot, i }))
        .filter((x) => (p.buried as Set<number>).has(x.slot))
        .sort((a, b) => Math.abs(a.i - p.digCur) - Math.abs(b.i - p.digCur))[0];
      if (!want || want.i === p.digCur) p.onAction();
      else p.onDir(want.i < p.digCur ? 'left' : 'right');
    } else p.onAction(); // collapse, then done
  };
};

const wave: () => Bot = () => (p) => {
  if (p.phase === 'paddle') {
    if (p.x <= p.zoneHi - 0.01 && p.x >= p.zoneLo) p.onAction();
  } else if (p.phase === 'ride') {
    if (p.balance > 0.08) p.onDir('left');
    else if (p.balance < -0.08) p.onDir('right');
  } else p.onAction();
};

const NET_W = 9;
const net: () => Bot = () => {
  const step = paced(0.1);
  return (p, t) => {
    if (p.done || p.between) return p.onAction();
    if (p.holes.has(p.cur)) return p.onAction();
    if (!step(t)) return;
    let best = -1;
    let bestD = Infinity;
    for (const h of p.holes as Set<number>) {
      const d = Math.abs((h % NET_W) - (p.cur % NET_W)) + Math.abs(Math.floor(h / NET_W) - Math.floor(p.cur / NET_W));
      if (d < bestD) {
        bestD = d;
        best = h;
      }
    }
    const dx = (best % NET_W) - (p.cur % NET_W);
    const dy = Math.floor(best / NET_W) - Math.floor(p.cur / NET_W);
    p.onDir(dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
  };
};

const ceviche: () => Bot = () => {
  const tap = paced(0.3);
  return (p, t) => {
    if (p.step === 'lime') {
      if (p.kiss >= p.zoneLo + 0.02 && p.kiss < p.zoneHi) p.onAction();
    } else if (tap(t)) p.onAction();
  };
};

const PANTRY_COLS = 4;
const PANTRY = ['Garlic', 'Condensed milk', 'Soy sauce', 'Chicken', 'Dried mango', 'Cane vinegar', 'Bay leaves', 'Peppercorns'];
const galley: () => Bot = () => {
  const tap = paced(0.12);
  return (p, t) => {
    if (p.done) return p.onAction();
    if (p.simmer >= 0) {
      if (p.simmer >= p.ready + 0.01) p.onAction();
      return;
    }
    if (p.lidding || !tap(t)) return;
    const want = p.wantName(p.step);
    const at = PANTRY.indexOf(want);
    if (at < 0) return;
    const dx = (at % PANTRY_COLS) - (p.cur % PANTRY_COLS);
    const dy = Math.floor(at / PANTRY_COLS) - Math.floor(p.cur / PANTRY_COLS);
    if (dx || dy) p.onDir(dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
    else p.onAction();
  };
};

const GRID_W = 12;
const GRID_H = 7;
const stars: () => Bot = () => {
  const tap = paced(0.12);
  return (p, t) => {
    if (p.done || p.failed) return p.onAction();
    if (!tap(t)) return;
    const [x0, y0, x1, y1] = p.activeRect(p.target) as number[];
    let gx = -1;
    let gy = -1;
    for (let cx = 0; cx < GRID_W && gx < 0; cx++) {
      for (let cy = 0; cy < GRID_H; cy++) {
        const fx = (cx + 0.5) / GRID_W;
        const fy = (cy + 0.5) / GRID_H;
        if (fx >= x0! && fx <= x1! && fy >= y0! && fy <= y1!) {
          gx = cx;
          gy = cy;
          break;
        }
      }
    }
    if (p.cx !== gx) p.onDir(p.cx < gx ? 'right' : 'left');
    else if (p.cy !== gy) p.onDir(p.cy < gy ? 'down' : 'up');
    else p.onAction();
  };
};

const kingyo: () => Bot = () => {
  const tap = paced(0.05);
  return (p, t) => {
    if (p.phase !== 'scoop') return p.onAction();
    if (!tap(t)) return;
    const shallow = (p.fish as Any[]).filter((f) => !f.deep);
    if (shallow.some((f) => Math.abs(f.x - p.cx) < p.reach * 0.7)) return p.onAction();
    if (!shallow.length) return;
    const near = shallow.reduce((a, b) => (Math.abs(a.x - p.cx) <= Math.abs(b.x - p.cx) ? a : b));
    if (Math.abs(near.x - p.cx) > 0.035) p.onDir(near.x < p.cx ? 'left' : 'right');
  };
};

const dashi: () => Bot = () => {
  const tap = paced(0.05);
  return (p, t) => {
    if (p.phase === 'steep') {
      if (!p.dropped) p.onAction();
    } else if (p.phase === 'pull') {
      if (p.heat >= p.pullLo + 1) p.onAction();
    } else if (p.phase === 'skim') {
      if (!tap(t) || !p.foam.length) return;
      const near = (p.foam as Any[]).reduce((a, b) => (Math.abs(a.x - p.lx) <= Math.abs(b.x - p.lx) ? a : b));
      if (Math.abs(near.x - p.lx) < p.skimReach * 0.7) p.onAction();
      else p.onDir(near.x < p.lx ? 'left' : 'right');
    } else if (p.phase === 'onigiri') {
      if (!p.squeezing) p.onAction();
      else if (p.squeeze >= (p.packLo + p.packHi) / 2) p.onAction();
    } else if (p.phase === 'done' || p.phase === 'ruined') p.onAction();
  };
};

const hotteok: () => Bot = () => (p) => {
  if (p.phase === 'done' || p.phase === 'burnt') return p.onAction();
  if (p.anim < 0 && p.hasBall && p.t >= p.lo + 0.01 && p.t <= p.hi - 0.01) p.onAction();
};

const row: () => Bot = () => (p) => {
  if (p.phase === 'row') {
    if (p.x <= p.tune.hi - 0.01 && p.x >= p.tune.lo + 0.005) p.onAction();
  } else p.onAction();
};

const sadya: () => Bot = () => {
  const tap = paced(0.12);
  return (p, t) => {
    if (!tap(t)) return;
    if (p.phase !== 'serve') return p.onAction(); // fold, gag, done
    const c = p.courses[p.course];
    if (!c) return;
    if (p.cur === c.slot) return p.onAction();
    if (c.slot === 6) {
      // The leaf tip: walk to the left column, then step off it.
      if (p.cur % 3 !== 0) p.onDir('left');
      else p.onDir('left');
      return;
    }
    if (p.cur === 6) return p.onDir('right');
    const dx = (c.slot % 3) - (p.cur % 3);
    const dy = Math.floor(c.slot / 3) - Math.floor(p.cur / 3);
    p.onDir(dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
  };
};

const chaya: () => Bot = () => (p) => {
  if (p.phase === 'boil') {
    if (p.boil >= 1) p.onAction();
  } else if (p.phase === 'pull') {
    const target = p.targets[p.pullIdx] ?? 0.8;
    if (!p.lifting) p.onAction();
    else if (p.arm >= target + 0.01) p.onAction();
  } else p.onAction(); // serve, done
};

const parantha: () => Bot = () => {
  const tap = paced(0.2);
  return (p, t) => {
    const c = p.courses[Math.min(p.course, p.courses.length - 1)];
    if (p.phase === 'roll') {
      if (Math.abs(p.meter - 0.5) <= c.zone / 2 - 0.01) p.onAction();
    } else if (p.phase === 'tawa') {
      if (p.flipA >= 1 && p.sizzle >= p.winLo + 0.01 && p.sizzle <= p.winHi - 0.01) p.onAction();
    } else if (tap(t)) p.onAction(); // stuff, served, done
  };
};

const patang: () => Bot = () => {
  const pull = paced(0.3);
  const tap = paced(0.3);
  let birdsAnswered = -1;
  return (p, t) => {
    if (p.phase === 'duel') {
      if (p.wind === 'steady') {
        if (pull(t)) p.onDir('up');
      } else if (p.wind === 'birds' && birdsAnswered !== Math.floor(t / 2)) {
        birdsAnswered = Math.floor(t / 2);
        p.onDir('down');
      }
    } else if (tap(t)) p.onAction(); // launch, between, storm, done, cut
  };
};

const sail: () => Bot = () => (p) => {
  if (p.phase === 'sail') {
    const d = p.sail - p.wind;
    if (d > 0.025) p.onDir('left');
    else if (d < -0.025) p.onDir('right');
  } else p.onAction();
};

const UROJO_N = 7; // saucers on the ring; SERVE sits after them
const urojo: () => Bot = () => {
  const tap = paced(0.15);
  return (p, t) => {
    if (!tap(t)) return;
    if (p.phase !== 'build') return p.onAction();
    const hr = p.hardRound();
    if (!hr) return;
    const goal = p.seqPos < hr.seq.length ? hr.seq[p.seqPos] : UROJO_N;
    if (p.cur === goal) return p.onAction();
    // The ring is a loop: walk the short way round.
    const n = UROJO_N + 1;
    const fwd = (goal - p.cur + n) % n;
    p.onDir(fwd <= n / 2 ? 'right' : 'left');
  };
};

const pisci: () => Bot = () => (p) => {
  if (p.phase === 'row') {
    if (p.x <= p.winHi - 0.01 && p.x >= p.winLo + 0.01) p.onAction();
  } else if (p.phase !== 'leap') p.onAction();
};

const cannolo: () => Bot = () => {
  const tap = paced(0.2);
  return (p, t) => {
    if (p.phase === 'pipe') {
      if (!p.flowing) {
        if (tap(t)) p.onAction();
      } else if (p.fill >= p.zoneLo + p.zoneW / 2) p.onAction();
    } else if (p.phase === 'burst') return;
    else if (tap(t)) p.onAction(); // garnish, served, done
  };
};

const STIR = ['up', 'right', 'down', 'left'] as const;
const mole: () => Bot = () => {
  const stir = paced(0.5);
  return (p, t) => {
    if (p.done || p.failed) return p.onAction();
    if (p.smoke >= 0) return p.onAction();
    if (stir(t)) p.onDir(STIR[p.step] as Dir);
  };
};

// ------------------------------------------------------------ the card table

type Card = { v: number; s: number };
const isSette = (c: Card) => c.v === 7 && c.s === 0;

/** What a play is worth to a careful player: the elder's own values, plus care. */
export function scopaChoice(p: Any): number {
  const hand: Card[] = p.hand;
  const table: Card[] = p.table;
  const opp = p.opp as Card[];
  const seen = new Map<number, number>(); // value -> copies no longer live
  for (const c of table) seen.set(c.v, (seen.get(c.v) ?? 0) + 1);
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < hand.length; i++) {
    const c = hand[i]!;
    const got: Card[] | null = p.wouldTake(c);
    let score: number;
    if (got) {
      score = 10 + got.length;
      for (const t of got) {
        if (t.s === 0) score += 2;
        if (t.v === 7) score += 2;
        if (isSette(t)) score += 40;
      }
      if (c.s === 0) score += 1;
      if (isSette(c)) score += 30;
      if (got.length === table.length) score += 25; // a sweep
      // What the elder sees next: the wood we leave him.
      const left = table.filter((t) => !got.includes(t));
      const sum = left.reduce((a, t) => a + t.v, 0);
      if (left.length > 0 && sum <= 10) score -= 8;
      if (left.some(isSette)) score -= 30;
    } else {
      // A feed: never the settebello, rarely a seven or a coin, never a card
      // that leaves the wood light enough for one card of his to sweep.
      score = -c.v * 0.5;
      const sum = table.reduce((a, t) => a + t.v, 0) + c.v;
      if (sum <= 10) score -= 20;
      if (isSette(c)) score -= 60;
      if (c.v === 7) score -= 12;
      if (c.s === 0) score -= 5;
      // A value whose twins have gone is harder for him to take back.
      score += (seen.get(c.v) ?? 0) * 2;
      // He cannot take it if nothing in his hand matches or sums to it; we
      // do not peek at his hand, so only table twins count against us.
      if (table.some((t) => t.v === c.v)) score -= 4;
      void opp;
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

const scopa: () => Bot = () => {
  const tap = paced(0.1);
  return (p, t) => {
    if (!tap(t)) return;
    if (p.phase === 'play') {
      const want = scopaChoice(p);
      if (p.cursor !== want) p.onDir(p.cursor < want ? 'right' : 'left');
      else p.onAction();
    } else if (p.phase !== 'wait') p.onAction(); // between, lost, done
  };
};

/**
 * Story-telling players where the hard bot has nothing to read: urojo has no
 * called order in the story (an attentive cook answers the customer), and
 * the ofrenda has no hard telling at all (a patient hand sets each thing down
 * on whatever shelf the cursor is on; none is wrong).
 */
export const STORY_BOTS: Record<string, () => Bot> = {
  'c7.cook.start': () => {
    // Brave, crunch, filling: what each customer asked for, saucer by saucer.
    const plan = [
      [6, 6, 0, 2],
      [4, 2, 4, 5],
      [3, 1, 5],
    ];
    let last = -1;
    return (p, t) => {
      if (t - last < 0.3) return;
      last = t;
      if (p.phase !== 'build') return p.onAction();
      const want = plan[p.round] ?? [];
      const n = (p.counts as number[]).reduce((a, b) => a + b, 0);
      if (p.cur === (n < want.length ? want[n] : 7)) p.onAction();
      else p.onDir('right');
    };
  },
  'c9.ofrenda.start': () => {
    // A patient hand watches each thing land (and its line be said) before
    // reaching for the next; the panel now slows anyone who does not.
    let last = -1;
    return (p, t) => {
      if (t - last < 0.4 || p.beat?.on) return;
      last = t;
      p.onAction();
    };
  },
};

/** Every hard telling's player, keyed by the game's start flag. */
export const BOTS: Record<string, () => Bot> = {
  'weave.start': weave,
  'watia.start': watia,
  'wave.start': wave,
  'net.start': net,
  'c2.cook.start': ceviche,
  'c3.cook.start': galley,
  'c3.stars.start': stars,
  'c4.kingyo.start': kingyo,
  'c4.cook.start': dashi,
  'c5.hotteok.start': hotteok,
  'c6.row.start': row,
  'c6.sadya.start': sadya,
  'c6.cook.start': chaya,
  'c11.cook.start': parantha,
  'c11.kite.start': patang,
  'c11.duel.start': patang,
  'c7.sail.start': sail,
  'c7.cook.start': urojo,
  'c8.scopa.start': scopa,
  'c8.pisci.start': pisci,
  'c8.cook.start': cannolo,
  'c9.mole.start': mole,
};

/**
 * Hands that lose on purpose: each plays a hard telling badly until its
 * panel fails in-panel (a burnt batch, a lost song, a redone leaf, a dry
 * pot, a scorched mole...), the kind of failure a single Space retries.
 */
export const SABOTEURS: Record<string, () => Bot> = {
  'c5.hotteok.start': () => (p) => {
    if (p.anim < 0 && p.hasBall && p.t > p.hi + 0.12) p.onAction();
  },
  'c6.row.start': () => {
    const tap = paced(0.4);
    return (p, t) => {
      if (p.x > p.tune.hi + 0.3 && tap(t)) p.onAction();
    };
  },
  'c6.sadya.start': () => () => {},
  'c6.cook.start': () => () => {},
  // One stroke lights the comal (an untouched pot never scorches); then the hand rests.
  'c9.mole.start': () => {
    let stirred = false;
    return (p) => {
      if (!stirred) p.onDir('up');
      stirred = true;
    };
  },
  'c3.cook.start': () => () => {},
  'c3.stars.start': () => () => {},
  'c4.kingyo.start': () => () => {},
  'c4.cook.start': () => (p) => {
    if (p.phase === 'steep' && !p.dropped) p.onAction();
  },
};
