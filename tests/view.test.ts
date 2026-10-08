import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TILE, VIEW_LANDSCAPE, VIEW_PORTRAIT, viewFor } from '../src/engine/config';

/**
 * An upright phone once cover-fit the landscape frame and saw a keyhole about
 * five tiles across, while a desk saw twenty. The frame now turns with the
 * screen; a desk and anything held sideways keep the frame they always had.
 */

/** Tiles across a cover-fit window of this size shows. */
function tilesAcross(w: number, h: number): number {
  const [vw, vh] = viewFor(w, h);
  const scale = Math.max(1, w / vw, h / vh);
  return w / scale / TILE;
}

describe('the frame turns with the screen', () => {
  it('desks and landscape screens keep the 320x180 frame', () => {
    for (const [w, h] of [[1280, 800], [1920, 1080], [915, 412], [932, 430], [1194, 834], [2560, 1080]]) {
      assert.deepEqual(viewFor(w!, h!), VIEW_LANDSCAPE, `${w}x${h}`);
    }
    assert.equal(tilesAcross(1920, 1080), 20);
  });

  it('an upright phone sees about nine tiles across, not five', () => {
    for (const [w, h] of [[412, 915], [430, 932], [390, 844], [360, 800]]) {
      assert.deepEqual(viewFor(w!, h!), VIEW_PORTRAIT, `${w}x${h}`);
      const n = tilesAcross(w!, h!);
      assert.ok(n >= 8.5 && n <= 10.5, `${w}x${h} shows ${n.toFixed(1)} tiles`);
    }
  });

  it('a tall tablet held upright sees the whole upright frame across', () => {
    for (const [w, h] of [[834, 1194], [820, 1180], [1024, 1366]]) {
      const n = tilesAcross(w!, h!);
      assert.ok(n >= 10 && n <= 11.5, `${w}x${h} shows ${n.toFixed(1)} tiles`);
    }
  });

  it('the upright frame spends the same pixels as the landscape one', () => {
    assert.equal(VIEW_PORTRAIT[0] * VIEW_PORTRAIT[1], VIEW_LANDSCAPE[0] * VIEW_LANDSCAPE[1]);
  });
});
