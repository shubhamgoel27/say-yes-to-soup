import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GAME_MAPS, GAMES, NODES, NPCS } from '../src/content/world';

describe('armed cards stay in their chapter', () => {
  it('every game knows its chapter maps, and a Caleta game is not a Delhi one', () => {
    for (const g of GAMES) assert.ok(GAME_MAPS[g.flag]?.size, `${g.flag} has no maps`);
    assert.ok(GAME_MAPS['wave.start']!.has('la-caleta'));
    assert.ok(!GAME_MAPS['wave.start']!.has('delhi-rooftop'));
  });

  it('whoever offers a game stands on one of its maps, so the card can open there', () => {
    const bad: string[] = [];
    for (const [flag, maps] of Object.entries(GAME_MAPS)) {
      const setters = Object.entries(NODES)
        .filter(([, n]) => n.effects?.includes(`set:${flag}`))
        .map(([id]) => id);
      for (const n of NPCS) {
        const text = JSON.stringify(n);
        if (setters.some((s) => text.includes(`"${s}"`)) && !maps.has(n.map)) bad.push(`${flag} offered by ${n.id} on ${n.map}`);
      }
    }
    assert.deepEqual(bad, []);
  });
});
