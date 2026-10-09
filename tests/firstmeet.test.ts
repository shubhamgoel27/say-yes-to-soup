import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NPCS } from '../src/content/world';
import { DELHI_STATIONS } from '../src/content/delhi/stations';
import { SHIONOURA_STATIONS } from '../src/content/shionoura/stations';

/**
 * A custom on a schedule takes people off their home cells. If one of them is
 * still owed a first meeting there (an entry arm gated `not: [<met flag>]`),
 * the station must wait for that flag, or the chapter's first errand sends the
 * player to an empty spot. Delhi's langar once seated Bantu at the hour you
 * arrive, before he had ever met you at the rickshaw stand.
 */
describe('stations wait for the first meetings they would take away', () => {
  it('every actor still owed a first meeting is gated on it', () => {
    const bad: string[] = [];
    for (const st of [...DELHI_STATIONS, ...SHIONOURA_STATIONS]) {
      const gate = new Set(st.when?.has ?? []);
      for (const id of st.actors) {
        const npc = NPCS.find((n) => n.id === id);
        if (!npc) continue;
        const firstMet = npc.entry
          .flatMap((e) => e.when?.not ?? [])
          .filter((f) => /\.met\./.test(f) && f.endsWith(`.${id}`));
        // Only the person the chapter opens on matters: met flags that gate a
        // task the chapter starts with. Bantu is Delhi's first face.
        for (const f of firstMet) if (id === 'bantu' && !gate.has(f)) bad.push(`${st.id}: ${id} before ${f}`);
      }
    }
    assert.deepEqual(bad, []);
  });
});
