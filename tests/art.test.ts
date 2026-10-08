import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasDishArt } from '../src/art/dishes';
import { JOURNAL } from '../src/content/world';

describe('art coverage', () => {
  // Rosa's soup, the game's first bowl, and all seven Delhi dishes once
  // opened on an empty painting slot while 44 others had theirs.
  it('every dish page in the journal has its painting', () => {
    const missing = JOURNAL.filter((e) => e.tab === 'dishes' && !hasDishArt(e.id)).map((e) => e.id);
    assert.deepEqual(missing, []);
  });
});
