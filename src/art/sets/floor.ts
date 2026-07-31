import { Rng, dot, oval, rect, shade } from '../pix';

const S = 64;

/**
 * The interior-floor idiom, written down once so twelve rooms can agree about
 * how a floor is made without agreeing about what it is made of.
 *
 * A floor is the largest expanse of one material a player ever looks at, and
 * until this existed every one of them was a single swatch stamped over and
 * over: the same base colour in every cell, decorated with a little jitter.
 * At room scale that reads as wallpaper of floor rather than as floor, and it
 * is why nine interiors measured out inside a three-point saturation band.
 *
 * Two passes fix it, and both are baked per variant at construction, so
 * neither costs a frame anything:
 *
 * - **Patchwork** (`floorBed`). The base tone walks a small ring around the
 *   chapter's colour, one step per variant. `shade` swings warm as it lightens
 *   and cool as it darkens, so the ring is a hue walk as well as a value walk:
 *   a field of cells reads as one material that was laid, fired, poured or
 *   mopped in pieces, by hand, on different days.
 * - **Speckle** (`grit`). Sub-pixel grain, re-scattered per variant, at a
 *   hair's contrast. Its only job is to stop the eye resolving the 64px grid,
 *   which is the thing that makes a floor look printed.
 *
 * `cellHash` picks the variant, so the patchwork is stable under the camera
 * and identical on every machine.
 */
export function floorBed(
  g: CanvasRenderingContext2D,
  r: Rng,
  i: number,
  base: string,
  spread = 0.055,
): string {
  // Hard-edged: the whole cell takes the tone. Correct only where the material
  // really is a grid of separate objects, because the tile edge is then the
  // edge of a mat or a flag or a fired tile and is supposed to show. Use
  // `floorPour` for anything that was laid in one piece; see its note.
  // Five steps, so a five-variant floor never repeats a tone and a four-variant
  // one never lands twice on the same end of the ring.
  const tone = shade(base, ((i % 5) / 2 - 1) * spread);
  rect(g, 0, 0, S, S, tone);
  // The cloud that is in the material before anything is dropped on it. Held
  // under four percent, because a patch clipped by the tile edge at any more
  // than that is a visible cut, which is the defect this is here to avoid.
  for (let k = 0; k < 3; k++) {
    oval(
      g,
      r.next() * S,
      r.next() * S,
      11 + r.next() * 12,
      6 + r.next() * 6,
      shade(tone, r.chance(0.5) ? -0.035 : 0.035),
    );
  }
  return tone;
}

/**
 * Patchwork for a floor that was poured, screeded, burnished or painted in one
 * continuous piece: oxide, cement, terrazzo, lime screed, deck paint, boards.
 *
 * The obvious way to vary a tile's colour is to vary the whole tile, which is
 * what `floorBed` does, and on a continuous material it is wrong in a way you
 * cannot unsee once you have: it draws the 64px tile grid *in the material*,
 * so a hall of red oxide becomes a chequerboard of red oxide. Half a room of
 * that is worse than the flat field it replaced.
 *
 * So the tone here is carried by a radial breath centred on the cell whose
 * alpha reaches exactly zero at radius 32. Every point on the cell's boundary
 * is at radius 32 or more, so every cell meets its neighbours at precisely the
 * base colour and the seam cannot be seen at any contrast. What is left is a
 * soft mottle on a 64px beat, which is what a floor burnished by hand in
 * overlapping circles actually looks like.
 */
export function floorPour(
  g: CanvasRenderingContext2D,
  r: Rng,
  i: number,
  base: string,
  spread = 0.09,
): string {
  rect(g, 0, 0, S, S, base);
  const tone = shade(base, ((i % 5) / 2 - 1) * spread);
  const breath = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  breath.addColorStop(0, `${tone}d8`);
  breath.addColorStop(0.55, `${tone}96`);
  breath.addColorStop(1, `${tone}00`);
  g.fillStyle = breath;
  g.fillRect(0, 0, S, S);
  // One more, weaker and off-centre, drawn the same way so it also dies at the
  // edge: two beats read as weather, one beat reads as a pattern.
  const ox = 18 + r.next() * 28;
  const oy = 18 + r.next() * 28;
  const t2 = shade(base, r.chance(0.5) ? -spread * 0.5 : spread * 0.5);
  const b2 = g.createRadialGradient(ox, oy, 0, ox, oy, 15);
  b2.addColorStop(0, `${t2}70`);
  b2.addColorStop(1, `${t2}00`);
  g.fillStyle = b2;
  g.fillRect(ox - 15, oy - 15, 30, 30);
  return tone;
}

/** Fine grain over a bed, scattered off the pixel grid so it never lines up. */
export function grit(
  g: CanvasRenderingContext2D,
  r: Rng,
  tone: string,
  n = 20,
  amt = 0.14,
  size = 0.9,
) {
  for (let k = 0; k < n; k++) {
    dot(g, r.next() * S, r.next() * S, 0.4 + r.next() * size, shade(tone, r.chance(0.5) ? -amt : amt));
  }
}
