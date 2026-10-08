import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BLOCKING, HOURS, LAMPS_LIT } from '../src/content/staging';
import { DRESSINGS, EXAMINES, NODES, NPCS, REGION_MAPS } from '../src/content/world';
import { SHIONOURA_STATIONS } from '../src/content/shionoura/stations';
import { DAWN_LANDING } from '../src/content/busan/staging';
import { SHIP_AT, SIGNING_SPOT } from '../src/content/sicily/staging';
import { GameState } from '../src/engine/state';
import type { MapData } from '../src/engine/grid';

/**
 * The big scenes say what is on screen: "Dusk. The chochin come on", "First
 * light, the auction spilling up the lane", "Half the town has come down
 * the mole". These tests hold the stage directions to the words: every
 * speaker of a staged scene stands on the scene's map, every place is real
 * open ground, and nobody (the player's own place included) stands close
 * enough to anybody else to be drawn over them. A person is a sprite wider
 * than a tile and two tiles tall, so "clear" means two cells apart.
 */

const objectAt = (m: MapData, x: number, y: number) => {
  const ch = m.objects?.[y]?.[x] ?? ' ';
  return ch === ' ' ? undefined : m.legend[ch];
};
const solidAt = (m: MapData, x: number, y: number) =>
  m.legend[m.ground[y]?.[x] ?? ' ']?.solid === true || objectAt(m, x, y)?.solid === true;


/**
 * A climax: the flags it plays under, the map, where you stand, the nodes
 * whose speakers must be there, and the hour its words name (as dayT: dusk
 * is 0.55-0.65 on the day curve, first light 0-0.05, noon 0.35-0.5).
 */
type Scene = {
  name: string;
  flags: string[];
  map: string;
  player: [number, number];
  nodes: string[];
  hour?: [number, number];
};

const SCENES: Scene[] = [
  {
    name: 'the Tanabata matsuri',
    hour: [0.55, 0.65],
    flags: ['c4.arrived', 'met.hana', 'c4.omiyage', 'c4.wish.hung', 'c4.kingyo.done', 'met.fumi', 'met.daisuke', 'met.sachiko', 'met.genji', 'c4.complete'],
    map: 'shionoura',
    // Beside her on the quay (the row under her is the one tall sprites share).
    player: [23, 21],
    nodes: ['c4.matsuri', 'c4.matsuri.river', 'c4.matsuri.end'],
  },
  {
    name: 'the Busan dawn goodbye',
    hour: [0, 0.05],
    flags: ['c5.arrived', 'c5.deom', 'riddle.cho', 'c5.hotteok.done', 'c5.berth'],
    map: 'busan',
    player: DAWN_LANDING,
    nodes: ['c5.sunhee.bye'],
  },
  {
    name: 'the Sicily send-off',
    flags: ['c8.arrived', 'met.patane', 'c8.pranzo', 'c8.scopa.won', 'c8.pisci.won', 'c8.walk.done', 'c8.signed'],
    map: 'sicily',
    player: SIGNING_SPOT,
    nodes: ['c8.depart', 'c8.depart.i', 'c8.depart.e', 'c8.depart.loud', 'c8.depart.horn'],
  },
  {
    name: 'the passeggiata',
    hour: [0.55, 0.65],
    flags: ['c8.arrived', 'c8.pranzo', 'c8.scopa.won', 'c8.pisci.won', 'c8.walking'],
    map: 'sicily',
    player: [17, 10],
    nodes: ['c8.walk.go'],
  },
  {
    name: 'the court of Neptune',
    hour: [0.35, 0.5],
    flags: ['c3.arrived', 'c3.cook.done', 'c3.met.bosun', 'c3.wog'],
    map: 'ship',
    player: [23, 14],
    nodes: ['c3.bosun.court', 'c3.bosun.rise'],
  },
];

/** Who stands where in a scene: the staged (first matching blocking each), then everyone else at home. */
function bodies(sc: Scene) {
  const st = new GameState();
  st.apply(sc.flags.map((f) => `set:${f}`));
  const placed = new Map<string, { at: [number, number]; map: string; staged: boolean }>();
  for (const b of BLOCKING) {
    if (!placed.has(b.id) && st.check(b.when)) placed.set(b.id, { at: b.at, map: b.map, staged: true });
  }
  for (const n of NPCS) {
    if (placed.has(n.id) || !st.check(n.when)) continue;
    // Wanderers are not pinned to a cell; only the stationary are a fixed body.
    if (n.range === 0) placed.set(n.id, { at: n.pos, map: n.map, staged: false });
  }
  return { st, placed };
}

describe('staging: the climaxes are on screen', () => {
  for (const sc of SCENES) {
    it(`${sc.name}: every speaker is on the stage`, () => {
      const { placed } = bodies(sc);
      for (const id of sc.nodes) {
        const node = NODES[id];
        assert.ok(node, `missing node ${id}`);
        for (const line of node.lines) {
          if (!line.who) continue;
          // Names repeat across the world (a Hana on two coasts); any of them on stage will do.
          const named = NPCS.filter((n) => n.name === line.who);
          assert.ok(named.length, `${id}: ${line.who} is nobody in the roster`);
          // On screen, not merely on the map: within the view around the player
          // (a desktop frame is twenty tiles by eleven and a quarter).
          const where = named.map((n) => placed.get(n.id) ?? { map: n.map, at: n.pos });
          const seen = where.some(
            (p) => p.map === sc.map && Math.abs(p.at[0] - sc.player[0]) <= 9 && Math.abs(p.at[1] - sc.player[1]) <= 5,
          );
          assert.ok(seen, `${id}: ${line.who} speaks from ${where.map((p) => `${p.map} ${p.at}`).join(' or ')}, off screen`);
        }
      }
    });

    if (sc.hour) {
      it(`${sc.name}: is held at the hour it names`, () => {
        const { st } = bodies(sc);
        const hold = HOURS.find((h) => st.check(h.when) && !(h.notOn ?? []).includes(sc.map));
        assert.ok(hold, 'no hour is held: the scene plays at whatever time it is');
        const [lo, hi] = sc.hour!;
        assert.ok(hold.min >= lo && hold.max <= hi, `held at ${hold.min}..${hold.max}, the words say ${lo}..${hi}`);
      });
    }

    it(`${sc.name}: nobody is drawn over anybody`, () => {
      const m = REGION_MAPS[sc.map]!;
      const { placed } = bodies(sc);
      const here = [...placed.entries()].filter(([, p]) => p.map === sc.map);
      assert.ok(!solidAt(m, ...sc.player), `the player's place ${sc.player} is solid`);
      for (const [id, p] of here) {
        if (p.staged) assert.ok(!solidAt(m, p.at[0], p.at[1]), `${id} is staged inside something at ${p.at}`);
      }
      const all = [...here.map(([id, p]) => ({ id, at: p.at, staged: p.staged })), { id: 'the player', at: sc.player, staged: true }];
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i]!;
          const b = all[j]!;
          if (!a.staged && !b.staged) continue; // two people at home are the map's business
          const d = Math.max(Math.abs(a.at[0] - b.at[0]), Math.abs(a.at[1] - b.at[1]));
          // The one you talk to stands beside you, never above or below.
          const speaking = d === 1 && a.at[1] === b.at[1] && (a.id === 'the player' || b.id === 'the player');
          assert.ok(d >= 2 || speaking, `${a.id} at ${a.at} and ${b.id} at ${b.at} overlap`);
        }
      }
    });
  }
});

describe('staging: places and hours', () => {
  it('stages only known villagers, on real maps', () => {
    for (const b of BLOCKING) {
      assert.ok(NPCS.some((n) => n.id === b.id), `unknown villager ${b.id}`);
      const m = REGION_MAPS[b.map];
      assert.ok(m, `${b.id}: unknown map ${b.map}`);
      assert.ok(!solidAt(m, b.at[0], b.at[1]), `${b.id} is staged inside something at ${b.map} ${b.at}`);
    }
  });

  it('holds every hour inside the day, the right way round', () => {
    for (const h of HOURS) {
      assert.ok(h.min >= 0 && h.max < 1 && h.min < h.max, `bad hour window ${h.min}..${h.max}`);
    }
  });

  it('lights only lamps that a round actually tends', () => {
    for (const l of LAMPS_LIT) {
      assert.ok(
        SHIONOURA_STATIONS.some((s) => s.mode === 'round' && s.map === l.map),
        `nothing tends lamps on ${l.map}`,
      );
    }
  });

  it('lands Busan\'s dawn beside Sun-hee, facing her, on open ground', () => {
    const m = REGION_MAPS['busan']!;
    for (const id of ['c5.gong.berth', 'c5.gong.berth2']) {
      const travel = NODES[id]?.effects?.find((e) => e.startsWith('travel:'));
      assert.equal(travel, `travel:busan,${DAWN_LANDING[0]},${DAWN_LANDING[1]},left`, `${id} must end the night at the stall`);
    }
    assert.ok(!solidAt(m, ...DAWN_LANDING));
    const sunhee = BLOCKING.find((b) => b.id === 'sunhee' && b.map === 'busan')!;
    assert.deepEqual([sunhee.at[0] + 1, sunhee.at[1]], DAWN_LANDING, 'Sun-hee is not the one to the left of the landing');
  });

  it('moors the ship in open water, clear of the mole and everyone on it', () => {
    const m = REGION_MAPS['sicily']!;
    const ship = DRESSINGS.find((d) => d.cells?.some((c) => c[2]?.t === 'nave'));
    assert.ok(ship, 'no ship comes alongside');
    // The sprite is three rows tall and five and a half wide, centred on its anchor.
    for (let y = SHIP_AT[1] - 2; y <= SHIP_AT[1]; y++) {
      for (let x = SHIP_AT[0] - 2; x <= SHIP_AT[0] + 2; x++) {
        const ground = m.legend[m.ground[y]![x]!];
        assert.ok(ground?.solid && /sea|water/.test(ground.t), `the ship would cover walkable ${x},${y}`);
      }
    }
  });
});

describe('staging: words about the night sky are said under one', () => {
  it('gives every after-dark examine a daylight answer for the same moment', () => {
    for (const [kind, arms] of Object.entries(EXAMINES)) {
      arms.forEach((a, i) => {
        if (!a.dark) return;
        const day = arms.slice(i + 1).find((b) => !b.dark && b.map === a.map && JSON.stringify(b.when) === JSON.stringify(a.when));
        assert.ok(day, `${kind}: ${a.node} is after dark only, and by day the same moment says nothing`);
      });
    }
  });
});
