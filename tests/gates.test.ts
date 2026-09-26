import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Cond } from '../src/content/schema';
import { CHAPTERS, COMPLETIONS, EXAMINES, NODES } from '../src/content/world';

/**
 * Story gates the audit found open: the ending without Carmen, gifts given
 * twice, Andes words answering in Kerala, and plates counted before Delhi
 * was inserted. Each is checked against the merged world, the same data the
 * engine reads.
 */

const holds = (flags: Set<string>, c?: Cond) =>
  !c || ((c.has ?? []).every((f) => flags.has(f)) && !(c.not ?? []).some((f) => flags.has(f)));

/** The arm the engine would pick for a kind on a map, as main.ts does. */
const examine = (kind: string, mapId: string, flags: string[]) => {
  const set = new Set(flags);
  return EXAMINES[kind]?.find((a) => (!a.map || a.map === mapId) && holds(set, a.when))?.node;
};

/** The choices a node offers under these flags. */
const offered = (nodeId: string, flags: string[]) => {
  const set = new Set(flags);
  return (NODES[nodeId]?.choices ?? []).filter((c) => holds(set, c.when)).map((c) => c.goto);
};

describe('the ending waits on Doña Carmen', () => {
  const homecoming = ['c10.arrived', 'c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'];

  it('without her word the well redirects instead of opening the last page', () => {
    const node = examine('well', 'village', homecoming);
    assert.equal(node, 'c10.well.notyet');
    assert.ok(!(NODES[node!]?.effects ?? []).includes('set:story.end'));
  });

  it('with her word the last page opens, wish or no wish', () => {
    assert.equal(examine('well', 'village', [...homecoming, 'c10.carmen.her']), 'c10.lastpage');
    assert.equal(examine('well', 'village', [...homecoming, 'c10.carmen.her', 'wish.road']), 'c10.well.wishroad');
  });

  it('no node that sets story.end is reachable from a well arm lacking c10.carmen.her', () => {
    for (const arm of EXAMINES.well ?? []) {
      if (arm.map !== 'village' || (arm.when?.has ?? []).includes('story.end')) continue;
      const reachesEnd = (id: string, seen = new Set<string>()): boolean => {
        if (seen.has(id)) return false;
        seen.add(id);
        const n = NODES[id];
        if (!n) return false;
        if ((n.effects ?? []).includes('set:story.end')) return true;
        return [n.next, ...(n.choices ?? []).map((c) => c.goto)].some((x) => x && reachesEnd(x, seen));
      };
      if (reachesEnd(arm.node)) {
        assert.ok((arm.when?.has ?? []).includes('c10.carmen.her'), `${arm.node} can end the story without Carmen`);
      }
    }
  });
});

describe('a gift set on the ofrenda is not given again', () => {
  it('Aurelio: the omiyage becomes a telling once it went to Nani', () => {
    const before = offered('c10.aurelio.soup', ['omiyage.aurelio']);
    assert.ok(before.includes('c10.aurelio.omiyage'));
    const after = offered('c10.aurelio.soup', ['omiyage.aurelio', 'c9.of.omiyage']);
    assert.ok(!after.includes('c10.aurelio.omiyage'));
    assert.ok(after.includes('c10.aurelio.ofrenda'));
  });

  it('Pilar: same for her omiyage', () => {
    const after = offered('c10.pilar.museum', ['omiyage.pilar', 'c9.of.omiyage']);
    assert.ok(!after.includes('c10.pilar.wing'));
    assert.ok(after.includes('c10.pilar.ofrenda'));
  });

  it('Carmen: the kanga', () => {
    assert.ok(offered('c10.carmen.reunion', ['kanga.gift']).includes('c10.carmen.kanga'));
    const after = offered('c10.carmen.reunion', ['kanga.gift', 'c9.of.kanga']);
    assert.ok(!after.includes('c10.carmen.kanga'));
    assert.ok(after.includes('c10.carmen.ofrenda'));
  });
});

describe('the marigold path can be found', () => {
  it('the petal ground cues while the errand is live, and the costal starts it', () => {
    const live = ['c9.path.task'];
    const petal = (EXAMINES.petalpath ?? []).find((a) => a.node === 'c9.path.lay');
    assert.ok(petal?.cue, 'the live petal arm must carry the curiosity cue');
    assert.equal(examine('costal', 'camposanto', live), 'c9.path.lay');
    assert.notEqual(examine('costal', 'camposanto', [...live, 'c9.path.laid']), 'c9.path.lay');
  });
});

describe('Andes words stay in the Andes', () => {
  it('grass, tuft and rock speak plainly on other chapters’ maps', () => {
    for (const mapId of ['kerala', 'shionoura', 'zanzibar', 'oaxaca', 'la-caleta']) {
      assert.equal(examine('grass', mapId, []), 'ex.grass.away', `grass on ${mapId}`);
    }
    assert.equal(examine('grass', 'village', []), 'ex.grass');
    assert.equal(examine('tuft', 'zanzibar', []), 'ex.tuft.away');
    assert.equal(examine('rock', 'zanzibar', []), 'ex.rock.away');
  });
});

describe('completion plates count from play order', () => {
  it('each plate names its chapter by where it sits in the route', () => {
    const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN'];
    for (const done of COMPLETIONS) {
      const i = CHAPTERS.findIndex((c) => c.completion?.flag === done.flag);
      assert.equal(done.plate, `CHAPTER ${words[i]} · COMPLETE`);
    }
    const zanzibar = COMPLETIONS.find((c) => c.flag === 'c7.complete');
    assert.equal(zanzibar?.plate, 'CHAPTER EIGHT · COMPLETE');
  });
});
