import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, wobble, easeOutCubic, easeOutBack, easeInOutSine } from './scene';
import { Rng, dot, oval, rr, shade, surface, vgrad, softShadow, glowSpot, type Surface } from '../../art/pix';

/**
 * The backwater's three hands-on verbs, each painted as a small moving scene.
 *
 * RowPanel: a seat in the chundan vallam on a monsoon channel. The vanchipattu
 * beat travels the water as a golden ripple; strike Space as it reaches the
 * blades and a hundred oars bite at once. A single ragged stroke costs
 * nothing; four in a row and the crew loses the song, the boat wallows, and
 * Raghavan finally looks at you. Space takes the seat again.
 *
 * SadyaPanel: an overhead banana leaf, each course ladled on as a blob that
 * lands with a plop and settles. Wrong placements earn warm auntie
 * corrections, never scoldings. Ends with the leaf-fold question, on which
 * the aunties have never once agreed.
 *
 * ChayaPanel: the meter-long pour at Shaji's thattukada, boil first, then the
 * amber ribbon stretching between tumblers, froth climbing the catch glass.
 */

const calm = () => document.body.classList.contains('reduce-motion');

/** The frame chrome zeroes line-height for canvas snugness; hints need theirs back. */
function unclampHint(root: HTMLElement) {
  const el = root.querySelector<HTMLElement>('.w-hint');
  if (el) el.style.lineHeight = '1.45';
}

/** Painted caption in the journal's handwriting, replacing the old c-count row. */
function cap(g: CanvasRenderingContext2D, text: string, x = 320, y = 331, color = 'rgba(250,243,224,0.92)') {
  g.font = '600 17px Caveat, cursive';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(20,16,10,0.35)';
  g.fillText(text, x + 1, y + 1);
  g.fillStyle = color;
  g.fillText(text, x, y);
}

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 14) {
  g.font = `500 ${size}px Caveat, cursive`;
  g.textAlign = 'center';
  g.fillStyle = color;
  g.fillText(text, x, y);
}

// ------------------------------------------------------------- the rowing

const CALLS = [
  'Aarppo! Irro irro irro!',
  'Thithithara thithithai...',
  'Kuthippin makkale, kuthippin!',
  'Aaaarppo! The channel answers back.',
];

type RowPhase = 'row' | 'wallow' | 'done';

/** Four ragged strokes in a row before the crew loses the song. Rare, and funny. */
const RAGGED_LIMIT = 4;

/** Deterministic monsoon: fixed drops and stipple rings, phased by scene time. */
const RAIN = (() => {
  const r = new Rng(7331);
  const a: { x: number; p: number; s: number }[] = [];
  for (let i = 0; i < 64; i++) a.push({ x: r.next() * 640, p: r.next(), s: 0.75 + r.next() * 0.6 });
  return a;
})();
const STIPPLE = (() => {
  const r = new Rng(4177);
  const a: { x: number; y: number; p: number }[] = [];
  for (let i = 0; i < 70; i++) a.push({ x: r.next() * 640, y: 138 + r.next() * 190, p: r.next() });
  return a;
})();
/** Hyacinth clumps drifting the channel; visual obstacles the hull slides past. */
const HYA = [
  { x: 540, y: 268, s: 1.15, seed: 11 },
  { x: 150, y: 300, s: 1.4, seed: 23 },
  { x: 370, y: 322, s: 0.95, seed: 37 },
  { x: 40, y: 252, s: 0.8, seed: 51 },
];

function palm(g: CanvasRenderingContext2D, x: number, y: number, h: number, c: string, lean: number) {
  g.strokeStyle = c;
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + lean * 0.4, y - h * 0.6, x + lean, y - h);
  g.stroke();
  const tx = x + lean;
  const ty = y - h;
  g.lineWidth = 2.4;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.95 + (i / 5) * Math.PI * 0.9;
    g.beginPath();
    g.moveTo(tx, ty);
    g.quadraticCurveTo(tx + Math.cos(a) * 12, ty + Math.sin(a) * 12 - 4, tx + Math.cos(a) * 22, ty + Math.sin(a) * 22 + 6);
    g.stroke();
  }
}

let rowBack: Surface | null = null;
function rowBackdrop(): Surface {
  if (rowBack) return rowBack;
  const s = surface(640, 340);
  const g = s.g;
  // Monsoon sky: silver-green ceiling, paler toward the water line.
  vgrad(g, 0, 0, 640, 128, '#93a99c', '#dde3ce');
  glowSpot(g, 320, 30, 260, '#eef0dd', 0.35);
  // Far palms in rain haze, then a nearer, darker row.
  const r = new Rng(6001);
  for (let i = 0; i < 9; i++) palm(g, 20 + i * 74 + r.int(30), 122, 34 + r.int(16), 'rgba(122,141,128,0.55)', r.range(-8, 8));
  for (let i = 0; i < 7; i++) palm(g, 8 + i * 98 + r.int(36), 126, 52 + r.int(22), '#54685a', r.range(-12, 12));
  // The bank: a soft green shoulder with reeds.
  rect(g, 0, 118, 640, 14, '#587953');
  g.strokeStyle = '#3f5c3c';
  g.lineWidth = 1.6;
  for (let i = 0; i < 46; i++) {
    const x = r.next() * 640;
    g.beginPath();
    g.moveTo(x, 131);
    g.lineTo(x + r.range(-2, 2), 119 - r.int(5));
    g.stroke();
  }
  // The channel, deep tea-green.
  vgrad(g, 0, 130, 640, 210, '#5d8a7e', '#2c463e');
  // Faint sky-light lanes on the water.
  for (let i = 0; i < 5; i++) oval(g, 90 + i * 130, 150 + i * 34, 90, 6, 'rgba(220,230,212,0.07)');
  rowBack = s;
  return s;
}

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

function hyacinth(g: CanvasRenderingContext2D, x: number, y: number, s: number, seed: number, t: number) {
  const r = new Rng(seed);
  const bob = wobble(t, 1.3, seed) * 2;
  g.save();
  g.translate(x, y + bob);
  g.scale(s, s);
  oval(g, 0, 4, 20, 5, 'rgba(20,34,28,0.35)');
  for (let i = 0; i < 4; i++) {
    const px = -12 + i * 8 + r.range(-2, 2);
    oval(g, px, r.range(-3, 1), 8 + r.int(3), 5, i % 2 ? '#4f7a3e' : '#639252');
  }
  oval(g, -4 + r.int(8), -7, 3.4, 4.4, '#a98ac6');
  oval(g, 6 - r.int(10), -6, 2.8, 3.8, '#b79ad2');
  dot(g, -2 + r.int(6), -7, 1, '#e8d44d');
  g.restore();
}

const ROW_LEGEND = [{ keys: ['space'], does: 'pull on the call, when the blade is in the water' }] as const;

export class RowPanel {
  private phase: RowPhase = 'row';
  private x = 1; // the beat marker, 1 -> 0 across the track
  private speed = 0.5;
  private progress = 0;
  private good = 0;
  private call = 0;
  private ragged = 0;
  private pulled = false;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only; game logic above is untouched.
  private scene: Scene | null = null;
  private hints: { setHint: (h: string) => void } | null = null;
  private strokeT = 0;
  private surge = 0;
  private rippleE = 0;
  private ripples: { x: number; y: number; age: number }[] = [];
  private vortices: { x: number; y: number; age: number; dir: number }[] = [];
  private drift = 0;
  private wallowT = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'row';
    this.x = 1;
    this.speed = 0.5;
    this.progress = 0;
    this.good = 0;
    this.call = 0;
    this.ragged = 0;
    this.pulled = false;
    this.hint = 'The singer calls; the oars answer. Space exactly as the beat reaches the blades.';
    this.scene ??= new Scene();
    this.hints = mountScene(this.root, 'The Chundan Vallam', this.scene, ROW_LEGEND);
    unclampHint(this.root);
    this.scene.restart();
    this.strokeT = 0;
    this.surge = 0;
    this.rippleE = 0;
    this.ripples = [];
    this.vortices = [];
    this.drift = 0;
    this.wallowT = 0;
    this.root.hidden = false;
    this.hints.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'row') {
      this.x -= dt * this.speed;
      if (this.x < -0.08) {
        // A beat sailed past unstruck. The boat glides; the song circles back.
        this.x = 1;
        this.hint = 'The beat comes around again. The song waits for no one, and forgives everyone.';
        // Only once you have actually swung: reading the hint costs nothing.
        if (this.pulled) this.ragged++;
        if (this.ragged >= RAGGED_LIMIT) this.loseTheSong();
      }
    }
    if (this.phase === 'wallow') this.wallowT = Math.min(1, this.wallowT + dt * 1.6);
    // Visual decay and drift.
    this.strokeT = Math.max(0, this.strokeT - dt * 2.2);
    this.surge += (0 - this.surge) * Math.min(1, dt * 3);
    this.rippleE *= Math.max(0, 1 - dt * 1.4);
    this.drift += dt * (14 + this.speed * 26);
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i]!;
      rp.age += dt;
      if (rp.age > 0.9) this.ripples.splice(i, 1);
    }
    for (let i = this.vortices.length - 1; i >= 0; i--) {
      const v = this.vortices[i]!;
      v.age += dt;
      if (v.age > 1.1) this.vortices.splice(i, 1);
    }
    this.scene?.frame(dt, (g) => this.paint(g));
    this.hints?.setHint(this.hint);
  }

  onDir(_dir: Dir) {
    // The song sets the course; you only have to be on time.
  }

  /**
   * The song gets away from you. A hundred oars stop agreeing and the boat sits
   * down in the water. Nothing is lost but the moment; Space and the seat is
   * yours again.
   */
  private loseTheSong() {
    const sc = this.scene;
    this.phase = 'wallow';
    this.wallowT = 0;
    this.audio.bump();
    this.hint =
      'The stroke dies. A hundred blades go their own way and the boat sits down in the water like a tired buffalo. Space to take the seat again.';
    if (sc && !calm()) {
      sc.thump(5, 0.05);
      for (let i = 0; i < 5; i++) sc.burst(158 + i * 38, 240, { n: 3, color: '#cfe4da', speed: 60, grav: 240, size: 2.2, life: 0.6 });
    }
  }

  /** Take the seat again: the panel's own reset, same completion callback. */
  private again() {
    const done = this.onDone;
    if (done) this.open(done);
    this.hint = 'Raghavan clears his throat and starts the count from the top. Nobody mentions the wallowing. Ever.';
    this.hints?.setHint(this.hint);
  }

  onAction() {
    const sc = this.scene;
    if (this.phase === 'wallow') {
      this.again();
      return;
    }
    if (this.phase === 'row') {
      this.pulled = true;
      if (this.x <= 0.22 && this.x >= -0.06) {
        this.good++;
        this.ragged = 0;
        this.progress = Math.min(1, this.progress + 0.13);
        this.speed += 0.04;
        this.audio.slosh();
        this.call = (this.call + 1) % CALLS.length;
        this.hint = `${CALLS[this.call]} A hundred blades bite as one, and the boat SURGES.`;
        // The whole crew pulls: spray at every blade, a lurch, ripples in the reflections.
        this.strokeT = 1;
        this.surge = 11;
        this.rippleE = Math.min(1, this.rippleE + 0.9);
        if (sc && !calm()) {
          sc.thump(4, 0.04);
          for (let i = 0; i < 5; i++) {
            const bx = 158 + i * 38;
            sc.burst(bx + 12, 236, { n: 4, color: '#e7f4ee', speed: 120, grav: 300, size: 2.6, life: 0.55 });
            this.vortices.push({ x: bx + 10, y: 240, age: 0, dir: i % 2 ? 1 : -1 });
          }
          this.ripples.push({ x: 240, y: 246, age: 0 });
        }
      } else {
        this.progress = Math.min(1, this.progress + 0.03);
        this.ragged++;
        this.audio.bump();
        this.hint =
          this.ragged >= RAGGED_LIMIT - 1
            ? 'Ragged again. Raghavan draws breath the way a kettle does. One clean stroke and all is forgiven.'
            : 'Ragged. Your oar slaps alone; the song scoops you back onto the beat.';
        this.strokeT = 0.55;
        if (sc && !calm()) {
          sc.burst(310, 238, { n: 5, color: '#cfe4da', speed: 80, grav: 260, size: 2.2, life: 0.5 });
          this.vortices.push({ x: 306, y: 242, age: 0, dir: 1 });
        }
        if (this.ragged >= RAGGED_LIMIT) {
          this.x = 1;
          this.loseTheSong();
          return;
        }
      }
      this.x = 1;
      if (this.progress >= 1) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'The finish post flies past. Somewhere behind you, the whole bank is roaring. Press Space.';
        if (sc) {
          sc.flash('#ffe9b0', 0.5);
          if (!calm()) {
            sc.thump(6, 0.06);
            sc.burst(320, 180, { n: 22, color: '#f6e3b0', speed: 150, grav: 120, size: 3, life: 0.9, kind: 'spark' });
          }
        }
      }
    } else {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private paint(g: CanvasRenderingContext2D) {
    const t = this.scene?.time ?? 0;
    g.drawImage(rowBackdrop().cv, 0, 0);

    // Palm reflections: dark wavering columns; rhythm hits shake them harder.
    const amp = 2 + this.rippleE * 7;
    g.strokeStyle = 'rgba(26,44,36,0.32)';
    g.lineWidth = 5;
    g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const px = 30 + i * 96;
      g.beginPath();
      for (let y = 134; y < 214 - i * 6; y += 8) {
        const xx = px + Math.sin(t * 2.1 + y * 0.09 + i) * amp;
        if (y === 134) g.moveTo(xx, y);
        else g.lineTo(xx, y);
      }
      g.stroke();
    }

    // Rain stippling the water: deterministic rings, each on its own clock.
    g.lineWidth = 1.2;
    for (const s of STIPPLE) {
      const k = (t * 0.85 + s.p) % 1;
      const a = (1 - k) * 0.4;
      g.strokeStyle = `rgba(228,240,232,${a.toFixed(3)})`;
      g.beginPath();
      g.ellipse(s.x, s.y, 1 + k * 7, (1 + k * 7) * 0.32, 0, 0, Math.PI * 2);
      g.stroke();
    }

    // Wake vortices: the paddle stroke leaves real curls that drift astern.
    for (const v of this.vortices) {
      const k = v.age / 1.1;
      const cx = v.x - v.age * 30;
      const r = 4 + v.age * 15;
      const a = (1 - k) * 0.5;
      g.strokeStyle = `rgba(222,240,233,${a.toFixed(3)})`;
      g.lineWidth = 2;
      const spin = v.age * 5 * v.dir;
      g.beginPath();
      g.ellipse(cx, v.y, r, r * 0.4, 0, spin, spin + 2.3);
      g.stroke();
      g.beginPath();
      g.ellipse(cx, v.y, r * 0.55, r * 0.22, 0, -spin, -spin + 2);
      g.stroke();
      if (v.age < 0.3) dot(g, cx + r * 0.6, v.y - 2, 1.6, 'rgba(240,250,246,0.7)');
    }

    // Hit ripples spreading through the reflections.
    for (const rp of this.ripples) {
      const k = rp.age / 0.9;
      g.strokeStyle = `rgba(230,244,236,${((1 - k) * 0.35).toFixed(3)})`;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(rp.x, rp.y, 8 + k * 90, (8 + k * 90) * 0.24, 0, 0, Math.PI * 2);
      g.stroke();
    }

    // Hyacinths behind the hull.
    for (const h of HYA) {
      const xx = ((((h.x - this.drift) % 760) + 760) % 760) - 60;
      if (h.y < 262) hyacinth(g, xx, h.y, h.s, h.seed, t);
    }

    // The beat: a golden call traveling the water toward the blades.
    if (this.phase === 'row') {
      const zoneA = 0.16 + 0.07 * (0.5 + 0.5 * wobble(t, 3.2));
      g.fillStyle = `rgba(255,219,138,${zoneA.toFixed(3)})`;
      g.beginPath();
      g.roundRect(298, 226, 76, 22, 10);
      g.fill();
      // Two cane poles mark the strike lane the way race courses do.
      for (const px of [300, 372]) {
        g.strokeStyle = '#a8824a';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(px, 218 + wobble(t, 2, px) * 1.5);
        g.lineTo(px, 250);
        g.stroke();
        dot(g, px, 216 + wobble(t, 2, px) * 1.5, 2.6, '#c1512f');
      }
      const mx = 300 + this.x * 320;
      glowSpot(g, mx, 237, 26, '#ffd98a', 0.5);
      dot(g, mx, 237 + wobble(t, 6) * 1.5, 4.6, '#f8e7b8');
      g.strokeStyle = 'rgba(255,226,150,0.5)';
      g.beginPath();
      g.ellipse(mx, 240, 10, 3.4, 0, 0, Math.PI * 2);
      g.stroke();
    } else if (this.phase === 'wallow') {
      // The strike lane stands empty; the beat has gone on down the channel
      // without you, and the water flattens out into slow, embarrassed swells.
      for (const px of [300, 372]) {
        g.strokeStyle = '#8a6b40';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(px, 218);
        g.lineTo(px, 250);
        g.stroke();
        dot(g, px, 216, 2.6, '#8f4a30');
      }
      g.strokeStyle = `rgba(206,226,216,${(0.22 * this.wallowT).toFixed(3)})`;
      g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const rr2 = 40 + i * 46 + this.wallowT * 26;
        g.beginPath();
        g.ellipse(240, 252, rr2, rr2 * 0.2, 0, 0, Math.PI * 2);
        g.stroke();
      }
    } else {
      // Across the line: the finish post and a bank gone loud with color.
      g.strokeStyle = '#7d5836';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(505, 128);
      g.lineTo(505, 246);
      g.stroke();
      g.fillStyle = '#c1512f';
      g.beginPath();
      g.moveTo(505, 132);
      g.lineTo(542, 141);
      g.lineTo(505, 150);
      g.closePath();
      g.fill();
      const r = new Rng(909);
      for (let i = 0; i < 26; i++) {
        dot(g, 320 + i * 12 + r.int(6) - 160, 116 + r.int(6), 2.4, r.pick(['#c1512f', '#e8d44d', '#f2ead8', '#3e5a77', '#6e9e5a']));
      }
    }

    this.paintBoat(g, t);

    // Hyacinths in front of the hull.
    for (const h of HYA) {
      const xx = ((((h.x - this.drift) % 760) + 760) % 760) - 60;
      if (h.y >= 262) hyacinth(g, xx, h.y, h.s, h.seed, t);
    }

    // Rain over everything: slanted silver streaks on their own loops.
    g.strokeStyle = 'rgba(226,238,236,0.28)';
    g.lineWidth = 1.1;
    for (const d of RAIN) {
      const yy = ((t * 260 * d.s + d.p * 340) % 360) - 10;
      g.beginPath();
      g.moveTo(d.x, yy);
      g.lineTo(d.x - 3, yy + 11);
      g.stroke();
    }

    const prog = Math.round(this.progress * 100);
    cap(
      g,
      this.phase === 'row'
        ? `${prog}m of 100 · ${this.good} clean strokes`
        : this.phase === 'wallow'
          ? 'the song got away · the boat wallows'
          : 'across the line',
    );
  }

  private paintBoat(g: CanvasRenderingContext2D, t: number) {
    const bx = this.surge;
    // Wallowing: she settles a few inches and rolls, the way a boat does when
    // a hundred people stop agreeing about when to pull.
    const sag = this.wallowT * 6;
    const by = 214 + wobble(t, 1.7) * 2.4 + sag;
    g.save();
    g.translate(bx, by - 214);
    g.rotate(-this.surge * 0.003 + wobble(t, 0.9) * 0.012 * this.wallowT);
    softShadow(g, 210, 252, 150, 22, 0.28);

    // Hull: long oiled teak, the stern beak rising like a cobra hood astern.
    g.fillStyle = '#35251a';
    g.beginPath();
    g.moveTo(345, 208);
    g.quadraticCurveTo(352, 214, 344, 221);
    g.quadraticCurveTo(230, 230, 110, 219);
    g.quadraticCurveTo(96, 216, 96, 210);
    g.quadraticCurveTo(74, 178, 72, 138);
    g.quadraticCurveTo(72, 128, 80, 128);
    g.quadraticCurveTo(92, 130, 94, 142);
    g.quadraticCurveTo(102, 182, 118, 205);
    g.quadraticCurveTo(230, 214, 345, 208);
    g.closePath();
    g.fill();
    // Plank highlight and brass on the beak.
    g.strokeStyle = '#6b4a2c';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(120, 208);
    g.quadraticCurveTo(232, 217, 342, 210);
    g.stroke();
    g.strokeStyle = '#c8a55b';
    g.lineWidth = 2.2;
    for (const [y1, x1, x2] of [
      [150, 79, 96],
      [168, 84, 102],
      [186, 92, 110],
    ] as const) {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y1 - 4);
      g.stroke();
    }
    // A scarlet pennant at the beak tip.
    g.fillStyle = '#c1512f';
    g.beginPath();
    g.moveTo(80, 128);
    g.quadraticCurveTo(68 + wobble(t, 5) * 2, 118, 58, 122);
    g.quadraticCurveTo(68, 126, 80, 133);
    g.closePath();
    g.fill();

    // The crew: five rowers leaning into the stroke together, seated low.
    const shirts = ['#f2ead8', '#c1512f', '#f2ead8', '#3e5a77', '#f2ead8'];
    const pull = easeOutCubic(1 - this.strokeT);
    for (let i = 0; i < 5; i++) {
      const x = 158 + i * 38;
      const lean = this.strokeT > 0 ? -0.5 + pull * 0.8 : wobble(t, 1.5, i) * 0.07;
      g.save();
      g.translate(x, 208);
      g.rotate(lean);
      rr(g, -7, -14, 14, 15, 5, shirts[i]!);
      dot(g, 0, -18, 4.6, '#7a4a2e');
      g.fillStyle = '#241a12';
      g.beginPath();
      g.arc(0, -19.4, 4.2, Math.PI, Math.PI * 2);
      g.fill();
      // The paddle: forward reach, then the sweep astern. In the wallow, five
      // rowers hold five different opinions about where an oar goes.
      const ang =
        this.phase === 'wallow'
          ? 0.1 + i * 0.42 * this.wallowT + wobble(t, 1.1, i * 3) * 0.18
          : this.strokeT > 0
            ? 0.95 - 1.7 * pull
            : 0.55 + wobble(t, 1.5, i) * 0.12;
      const tipX = Math.sin(ang) * 40;
      const tipY = Math.cos(ang) * 40;
      g.strokeStyle = '#8a6238';
      g.lineWidth = 2.8;
      g.beginPath();
      g.moveTo(-2, -8);
      g.lineTo(tipX, tipY - 8);
      g.stroke();
      oval(g, tipX, tipY - 8, 3.6, 7.5, '#6e4526', ang * 0.6);
      g.restore();
    }
    // The gunwale rides over their laps, so the crew sits IN the boat.
    g.strokeStyle = '#31221a';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(120, 207);
    g.quadraticCurveTo(232, 216, 344, 209);
    g.stroke();
    g.strokeStyle = '#5c3f28';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(122, 204);
    g.quadraticCurveTo(232, 213, 342, 206);
    g.stroke();
    g.restore();
    // The hull's reflection, broken by the same water.
    g.globalAlpha = 0.18;
    oval(g, 224 + bx, 258, 120, 9, '#120d08');
    g.globalAlpha = 1;
  }
}

// ------------------------------------------------------------- the sadya

/** Slots on the leaf, 3 columns x 2 rows. Narrow end of the leaf points left. */
const SLOTS = ['inji puli', 'thoran', 'avial', 'banana', 'rice', 'pappadam'];

/** Serving order, each with its home slot and its auntie correction. */
const COURSES: { item: string; slot: number; oops: string }[] = [
  { item: 'pappadam', slot: 5, oops: 'Auntie Leela taps your wrist. "Pappadam sits low, mone, bottom right. It likes company with the rice."' },
  { item: 'inji puli', slot: 0, oops: 'Auntie Rosamma clicks her tongue kindly. "Pickles go top left, where the narrow end points. Small things, small corner."' },
  { item: 'thoran', slot: 1, oops: '"Thoran up top, in the middle," Auntie Leela says, steering your hand with two fingers. "It has always lived there."' },
  { item: 'avial', slot: 2, oops: '"Avial keeps the top right seat," says Auntie Rosamma. "It is the eldest of the vegetables. Respect."' },
  { item: 'banana', slot: 3, oops: 'Auntie Leela smiles. "The banana waits at bottom left, mole. Dessert should be visible but not ambitious."' },
  { item: 'rice', slot: 4, oops: '"Rice last, rice center," both aunties say together, delighted to finally agree on something.' },
];

type SadyaPhase = 'serve' | 'fold' | 'gag' | 'done';

const SLOT_POS: [number, number][] = [
  [205, 133],
  [345, 128],
  [478, 133],
  [205, 250],
  [345, 254],
  [478, 250],
];

const FOOD_TINT: Record<string, string> = {
  'inji puli': '#4a2a18',
  thoran: '#5d7a3a',
  avial: '#d9c47a',
  banana: '#e8c84d',
  rice: '#efe8d8',
  pappadam: '#e8cf96',
};

let sadyaWood: Surface | null = null;
function sadyaWoodBake(): Surface {
  if (sadyaWood) return sadyaWood;
  const s = surface(640, 340);
  const g = s.g;
  // A scrubbed teak table, seen from above in kitchen lamplight.
  const r = new Rng(2210);
  for (let p = 0; p < 5; p++) {
    const y = p * 68;
    vgrad(g, 0, y, 640, 68, shade('#5e3f2a', 0.05 - (p % 2) * 0.06), shade('#553823', -0.04));
    g.strokeStyle = 'rgba(34,22,14,0.5)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y + 67);
    g.lineTo(640, y + 67);
    g.stroke();
    g.strokeStyle = 'rgba(40,26,16,0.18)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) {
      const gy = y + 6 + r.int(56);
      g.beginPath();
      g.moveTo(r.int(80), gy);
      g.bezierCurveTo(200, gy + r.range(-3, 3), 420, gy + r.range(-3, 3), 640 - r.int(60), gy);
      g.stroke();
    }
  }
  glowSpot(g, 320, 160, 340, '#f0d9a8', 0.12);
  sadyaWood = s;
  return s;
}

let sadyaLeaf: Surface | null = null;
function sadyaLeafBake(): Surface {
  if (sadyaLeaf) return sadyaLeaf;
  const s = surface(580, 300);
  const g = s.g;
  // The banana leaf, narrow end left: glossy, mid-ribbed, edge-nicked.
  const leaf = new Path2D();
  leaf.moveTo(18, 150);
  leaf.bezierCurveTo(120, 46, 380, 32, 505, 64);
  leaf.bezierCurveTo(556, 96, 558, 204, 508, 236);
  leaf.bezierCurveTo(380, 268, 120, 254, 18, 150);
  leaf.closePath();
  g.save();
  g.shadowColor = 'rgba(20,14,8,0.4)';
  g.shadowBlur = 14;
  g.shadowOffsetY = 6;
  g.fillStyle = '#55813f';
  g.fill(leaf);
  g.restore();
  g.save();
  g.clip(leaf);
  vgrad(g, 0, 30, 580, 240, '#639148', '#476f35');
  // Mid-rib: a bright spine tapering toward the narrow end.
  g.fillStyle = '#7fa858';
  g.beginPath();
  g.moveTo(20, 150);
  g.quadraticCurveTo(300, 138, 548, 146);
  g.quadraticCurveTo(300, 152, 20, 150);
  g.lineTo(20, 150);
  g.closePath();
  g.fill();
  g.strokeStyle = '#aecb7d';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(24, 150);
  g.quadraticCurveTo(300, 144, 546, 148);
  g.stroke();
  // Veins raking from the rib, and two broad gloss sheens.
  g.strokeStyle = 'rgba(52,84,40,0.3)';
  g.lineWidth = 1;
  for (let x = 40; x < 560; x += 14) {
    g.beginPath();
    g.moveTo(x, 147);
    g.lineTo(x + 26, 40);
    g.moveTo(x, 152);
    g.lineTo(x + 26, 258);
    g.stroke();
  }
  g.save();
  g.rotate(-0.06);
  oval(g, 180, 84, 130, 26, 'rgba(255,255,240,0.09)');
  oval(g, 420, 200, 110, 20, 'rgba(255,255,240,0.07)');
  g.restore();
  g.restore();
  g.strokeStyle = 'rgba(46,74,34,0.8)';
  g.lineWidth = 2.6;
  g.stroke(leaf);
  sadyaLeaf = s;
  return s;
}

/** One painted course, growing in with a plop-settle scale. */
function paintFood(g: CanvasRenderingContext2D, item: string, x: number, y: number, age: number) {
  const s = Math.max(0.001, easeOutBack(Math.min(1, age / 0.35))) * 1.9;
  const spread = easeOutCubic(Math.min(1, age / 0.9));
  const r = new Rng(item.length * 1013 + 77);
  g.save();
  g.translate(x, y);
  g.scale(s, s * 0.92);
  switch (item) {
    case 'inji puli': {
      oval(g, 0, 0, 12 + 9 * spread, 7 + 4 * spread, '#4a2a18');
      oval(g, -3, -2, 7 + 4 * spread, 3, 'rgba(255,240,210,0.18)');
      for (let i = 0; i < 5; i++) dot(g, r.range(-10, 10), r.range(-4, 4), 1.6, '#c98a2e');
      break;
    }
    case 'thoran': {
      // Dark beans under a snow of coconut, so it reads against the leaf.
      oval(g, 0, 1, 15, 8, '#3a5226');
      for (let i = 0; i < 8; i++) dot(g, r.range(-12, 12), r.range(-6, 5), 3.6 + r.next() * 2, i % 2 ? '#43602c' : '#5d8038');
      for (let i = 0; i < 9; i++) dot(g, r.range(-11, 11), r.range(-7, 3), 1.6, '#f4efe4');
      for (let i = 0; i < 3; i++) dot(g, r.range(-9, 9), r.range(-5, 3), 1.8, '#e0a050');
      break;
    }
    case 'avial': {
      for (let i = 0; i < 7; i++) {
        oval(g, r.range(-13, 13), r.range(-5, 5), 5, 3.4, r.pick(['#e8d9a0', '#d9c47a', '#6e9e5a', '#e0a050']), r.next());
      }
      oval(g, 6, -6, 4, 2, '#3d5226', 0.6);
      break;
    }
    case 'banana': {
      g.strokeStyle = '#e8c84d';
      g.lineWidth = 9;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-14, 3);
      g.quadraticCurveTo(0, -9, 14, 1);
      g.stroke();
      g.strokeStyle = '#f6e08a';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(-11, 0);
      g.quadraticCurveTo(0, -8, 11, -1);
      g.stroke();
      dot(g, 15, 2, 2, '#59371e');
      break;
    }
    case 'rice': {
      oval(g, 0, 2, 27, 14, '#e3d9c2');
      oval(g, 0, -1, 25, 12, '#efe8d8');
      for (let i = 0; i < 16; i++) oval(g, r.range(-19, 19), r.range(-8, 6), 2.6, 1.2, '#f8f4e8', r.next() * 3);
      break;
    }
    case 'pappadam': {
      // Blistered gold disc; the crack lines land with it.
      g.fillStyle = '#e8cf96';
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rad = 20 * (1 + (r.next() - 0.5) * 0.09);
        if (i === 0) g.moveTo(Math.cos(a) * rad, Math.sin(a) * rad * 0.78);
        else g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad * 0.78);
      }
      g.closePath();
      g.fill();
      for (let i = 0; i < 8; i++) dot(g, r.range(-13, 13), r.range(-9, 9), 1.8, '#d9ae64');
      const ck = Math.min(1, age / 0.25);
      g.strokeStyle = 'rgba(96,66,34,0.55)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const a = 0.6 + i * 2.1;
        g.beginPath();
        g.moveTo(Math.cos(a) * 3, Math.sin(a) * 2);
        g.lineTo(Math.cos(a) * (3 + 11 * ck), Math.sin(a) * (2 + 8 * ck));
        g.stroke();
      }
      break;
    }
  }
  g.restore();
}

const SADYA_LEGEND = [
  { keys: ['left', 'right', 'up', 'down'], does: 'choose the place on the leaf' },
  { keys: ['space'], does: 'serve it there' },
] as const;

export class SadyaPanel {
  private phase: SadyaPhase = 'serve';
  private placed: (string | null)[] = [];
  private course = 0;
  private cur = 0;
  private fold: 'toward' | 'away' = 'toward';
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only.
  private scene: Scene | null = null;
  private hints: { setHint: (h: string) => void } | null = null;
  private curX = 478;
  private curY = 250;
  private landAt: number[] = [];
  private pending: { slot: number; item: string; land: number; fx: boolean } | null = null;
  private ladleDip = 0;
  private foldT = 0;
  private sweepAt = -9;
  private waftAt = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'serve';
    this.placed = [null, null, null, null, null, null];
    this.course = 0;
    this.cur = 0;
    this.fold = 'toward';
    this.hint = 'Narrow end of the leaf points left. Arrows choose a spot; Space serves the pappadam. Right hand only.';
    this.scene ??= new Scene();
    this.hints = mountScene(this.root, 'The Sadya Leaf', this.scene, SADYA_LEGEND);
    unclampHint(this.root);
    this.scene.restart();
    this.curX = SLOT_POS[0]![0];
    this.curY = SLOT_POS[0]![1];
    this.landAt = [-1, -1, -1, -1, -1, -1];
    this.pending = null;
    this.ladleDip = 0;
    this.foldT = 0;
    this.sweepAt = -9;
    this.waftAt = 0;
    this.root.hidden = false;
    this.hints.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    const sc = this.scene;
    if (!sc) return;
    const [tx, ty] = SLOT_POS[this.cur] ?? [320, 190];
    const k = Math.min(1, dt * 11);
    this.curX += (tx - this.curX) * k;
    this.curY += (ty - this.curY) * k;
    this.ladleDip = Math.max(0, this.ladleDip - dt * 3);
    // The pending ladleful lands: plop, droplets, and the food starts settling.
    if (this.pending && sc.time >= this.pending.land) {
      const p = this.pending;
      if (!p.fx) {
        p.fx = true;
        this.landAt[p.slot] = sc.time;
        const [px, py] = SLOT_POS[p.slot]!;
        if (!calm()) {
          sc.thump(2.5, 0.02);
          sc.burst(px, py, { n: p.item === 'pappadam' ? 8 : 5, color: FOOD_TINT[p.item] ?? '#e8d9a8', speed: 70, grav: 240, size: 2, life: 0.5 });
        }
      }
      this.pending = null;
    }
    // Rice breathes steam once it is on the leaf.
    if (this.landAt[4]! >= 0 && sc.time > this.waftAt && this.phase === 'serve') {
      this.waftAt = sc.time + 0.5;
      if (!calm()) sc.waft(SLOT_POS[4]![0] + wobble(sc.time, 2) * 6, SLOT_POS[4]![1] - 8);
    }
    sc.frame(dt, (g) => this.paint(g));
    this.hints?.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase === 'serve') {
      const x = this.cur % 3;
      const y = Math.floor(this.cur / 3);
      const nx = Math.max(0, Math.min(2, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
      const ny = Math.max(0, Math.min(1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
      this.cur = ny * 3 + nx;
    } else if (this.phase === 'fold') {
      if (dir === 'left') this.fold = 'toward';
      if (dir === 'right') this.fold = 'away';
    }
  }

  onAction() {
    const sc = this.scene;
    if (this.phase === 'serve') {
      const c = COURSES[this.course];
      if (!c) return;
      if (this.cur === c.slot) {
        this.placed[c.slot] = c.item;
        this.audio.chime();
        this.ladleDip = 1;
        if (sc) this.pending = { slot: c.slot, item: c.item, land: sc.time + 0.22, fx: false };
        this.course++;
        const next = COURSES[this.course];
        if (next) {
          this.hint = `Just so. Now the ${next.item}, with the right hand, like you have done this all your life.`;
        } else {
          this.phase = 'fold';
          this.hint = 'The leaf is full and correct. Now: fold it toward you, or away? Left and right choose; Space commits.';
          if (sc) {
            sc.flash('#fff3c8', 0.35);
            this.sweepAt = sc.time + 0.25;
          }
        }
      } else {
        this.audio.blip();
        this.hint = c.oops;
        if (sc && !calm()) sc.thump(1.6, 0);
      }
    } else if (this.phase === 'fold') {
      this.phase = 'gag';
      this.audio.weaveNote(3);
      if (sc) {
        sc.flash('#f2e9c8', 0.3);
        sc.tween(0, 1, 0.8, easeInOutSine, (v) => (this.foldT = v));
      }
      this.hint =
        this.fold === 'toward'
          ? '"Toward you! Satisfied!" beams Auntie Leela. "Away means satisfied," says Auntie Rosamma, folding hers away. Press Space.'
          : '"Away, correct!" says Auntie Rosamma. "Toward you means satisfied," says Auntie Leela, folding hers toward. Press Space.';
    } else if (this.phase === 'gag') {
      this.phase = 'done';
      this.audio.weaveDone();
      if (sc) sc.flash('#ffe9b0', 0.4);
      this.hint = 'They argue happily over your folded leaf. Either way, the leaf says you ate well. Press Space.';
    } else {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene;
    const t = sc?.time ?? 0;
    g.drawImage(sadyaWoodBake().cv, 0, 0);

    const folded = this.foldT;
    if (folded < 1) {
      g.save();
      if (folded > 0) {
        // The leaf gathers itself toward the fold.
        g.translate(320, 195);
        g.scale(1 - folded * 0.18, 1 - folded * 0.5);
        g.translate(-320, -195);
        g.globalAlpha = 1 - folded * 0.7;
      }
      this.paintOpenLeaf(g, t);
      g.restore();
    }
    if (folded > 0) {
      g.save();
      g.globalAlpha = folded;
      this.paintFoldedLeaf(g, t);
      g.restore();
    }

    const capText =
      this.phase === 'serve'
        ? `serving: ${COURSES[this.course]?.item ?? ''}`
        : this.phase === 'fold'
          ? `fold: ${this.fold === 'toward' ? '← toward you' : 'away →'}`
          : 'the leaf is folded';
    cap(g, capText);
  }

  private paintOpenLeaf(g: CanvasRenderingContext2D, t: number) {
    g.drawImage(sadyaLeafBake().cv, 52, 44);
    // Empty seats: a faint hollow and the auntie's map, written small.
    for (let i = 0; i < 6; i++) {
      const [x, y] = SLOT_POS[i]!;
      if (this.landAt[i]! < 0) {
        oval(g, x, y + 3, 32, 15, 'rgba(32,54,24,0.16)');
        if (this.phase === 'serve') label(g, SLOTS[i]!, x, y + 7, 'rgba(240,244,220,0.6)', 15);
      } else {
        softShadow(g, x, y + 9, 36, 12, 0.18);
        paintFood(g, this.placed[i] ?? '', x, y, t - this.landAt[i]!);
      }
    }

    // The gloss sweep when the leaf comes complete: light passing over a feast.
    const sw = (t - this.sweepAt) / 0.9;
    if (sw > 0 && sw < 1) {
      const sx = 60 + sw * 520;
      const a = 0.14 * Math.sin(sw * Math.PI);
      g.save();
      g.translate(sx, 195);
      g.rotate(-0.35);
      oval(g, 0, 0, 46, 130, `rgba(255,252,235,${a.toFixed(3)})`);
      g.restore();
    }

    if (this.phase === 'serve') {
      // The cursor: a slow-turning dotted ring where the spoon will land.
      g.strokeStyle = 'rgba(246,227,176,0.95)';
      g.lineWidth = 2;
      g.setLineDash([7, 6]);
      g.lineDashOffset = -t * 26;
      g.beginPath();
      g.ellipse(this.curX, this.curY + 2, 30, 15, 0, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      this.paintLadle(g, t);
    } else if (this.phase === 'fold') {
      // The chosen edge peeks into the fold, showing the leaf's paler back.
      const peek = 12 + wobble(t, 2.4) * 5;
      g.fillStyle = 'rgba(148,182,110,0.9)';
      if (this.fold === 'toward') {
        g.beginPath();
        g.moveTo(150, 104);
        g.quadraticCurveTo(320, 84, 490, 106);
        g.quadraticCurveTo(320, 92 + peek, 150, 104 + peek * 0.6);
        g.closePath();
        g.fill();
      } else {
        g.beginPath();
        g.moveTo(150, 284);
        g.quadraticCurveTo(320, 300, 490, 282);
        g.quadraticCurveTo(320, 292 - peek, 150, 284 - peek * 0.6);
        g.closePath();
        g.fill();
      }
    }
  }

  private paintLadle(g: CanvasRenderingContext2D, t: number) {
    // The brass ladle waits over the chosen seat, holding the next course.
    const item = COURSES[this.course]?.item;
    const dip = easeOutCubic(this.ladleDip) * 22;
    const lx = this.curX + 8;
    const ly = this.curY - 62 + wobble(t, 2.1) * 3 + dip;
    softShadow(g, this.curX + 4, this.curY - 6, 18, 6, 0.14);
    g.strokeStyle = '#9a7632';
    g.lineWidth = 5.2;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(lx + 11, ly - 4);
    g.quadraticCurveTo(lx + 110, ly - 34, lx + 220, ly - 30);
    g.stroke();
    g.strokeStyle = 'rgba(255,240,200,0.35)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(lx + 14, ly - 7);
    g.quadraticCurveTo(lx + 110, ly - 37, lx + 216, ly - 33);
    g.stroke();
    oval(g, lx, ly, 13, 8.5, '#c29a48');
    if (item) oval(g, lx, ly - 1, 9.5, 5.5, FOOD_TINT[item] ?? '#e8d9a8');
    oval(g, lx - 5, ly - 4.5, 4, 1.8, 'rgba(255,248,225,0.6)');
    // The falling ladleful, mid-plop.
    if (this.pending) {
      const p = this.pending;
      const k = Math.max(0, 1 - (p.land - t) / 0.22);
      const [px, py] = SLOT_POS[p.slot]!;
      const by = py - 56 + k * k * 56;
      oval(g, px, by, 9 - k * 2, 7 + k * 5, FOOD_TINT[p.item] ?? '#e8d9a8');
    }
  }

  private paintFoldedLeaf(g: CanvasRenderingContext2D, t: number) {
    // The parcel: leaf folded over the finished feast, still breathing steam.
    softShadow(g, 320, 248, 170, 26, 0.3);
    g.fillStyle = '#4a7539';
    g.beginPath();
    g.roundRect(160, 150, 320, 96, 26);
    g.fill();
    // The narrow end tucks out of the parcel, still pointing left.
    g.beginPath();
    g.moveTo(166, 168);
    g.quadraticCurveTo(112, 186, 96, 198);
    g.quadraticCurveTo(118, 212, 166, 226);
    g.closePath();
    g.fill();
    vgrad(g, 160, 150, 320, 30, 'rgba(255,255,240,0.12)', 'rgba(255,255,240,0)');
    g.strokeStyle = '#39602c';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(172, 168);
    g.quadraticCurveTo(320, 158, 468, 168);
    g.stroke();
    g.strokeStyle = '#6f9c52';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(166, 198);
    g.quadraticCurveTo(320, 190, 474, 198);
    g.stroke();
    // Sauce warmth soaking through, and two slow curls of steam.
    oval(g, 262, 220, 16, 7, 'rgba(90,52,24,0.28)');
    oval(g, 396, 212, 12, 6, 'rgba(120,80,30,0.25)');
    g.strokeStyle = 'rgba(244,240,228,0.5)';
    g.lineWidth = 2.2;
    g.lineCap = 'round';
    for (const sx of [286, 356]) {
      const w = wobble(t, 1.6, sx) * 5;
      g.beginPath();
      g.moveTo(sx, 146);
      g.bezierCurveTo(sx - 6 + w, 128, sx + 6 + w, 114, sx + w, 96);
      g.stroke();
    }
    glowSpot(g, 320, 200, 190, '#f0d9a8', 0.1);
  }
}

// ------------------------------------------------------------- the chaya pull

/**
 * ChayaPanel: the meter-long pour at Shaji's thattukada. First the boil, a
 * patience beat the kettle refuses to hurry. Then the pull, three times: Space
 * lifts the pouring arm and it keeps climbing; Space again lets the tea go.
 * Height is froth, and each pull wants more of it. Too low is not chaya, it is
 * surrender; too high spills, earns laughter and a wet counter, and costs
 * nothing. Three spills and the pot is empty, which is not a failure either,
 * only a fresh boil and a wetter legend. It ends with the glass and the
 * question of the hand beneath it.
 */

const PULL_TARGETS = [0.5, 0.66, 0.82];

const PULL_PRAISE = [
  'A hand-span of air under the stream. The tea lands frothing, surprised at itself.',
  'Half a meter of falling chaya, not a drop astray. The froth climbs like a good rumor.',
  'The full meter. Tumbler to tumbler in one bronze arc, and the froth stands like a monsoon cloud.',
];

type ChayaPhase = 'boil' | 'pull' | 'dry' | 'serve' | 'done';

/** The counter can drink three tumblers before the pot notices. */
const SPILL_LIMIT = 3;

const PUDDLES: [number, number][] = [
  [468, 262],
  [258, 268],
  [340, 258],
];

let chayaBack: Surface | null = null;
function chayaBackdrop(): Surface {
  if (chayaBack) return chayaBack;
  const s = surface(640, 340);
  const g = s.g;
  // The stall at dusk: tin awning, one bulb, rain just past the eaves.
  vgrad(g, 0, 0, 640, 250, '#3a4a52', '#232d33');
  for (let i = 0; i < 13; i++) {
    g.fillStyle = i % 2 ? '#6e3a2c' : '#53291f';
    g.beginPath();
    g.moveTo(i * 50 - 6, 0);
    g.lineTo(i * 50 + 44, 0);
    g.lineTo(i * 50 + 38, 24);
    g.arc(i * 50 + 22, 24, 16, 0, Math.PI);
    g.closePath();
    g.fill();
  }
  // Shelf with the stall's standing army, high and clear of the chalk marks.
  g.strokeStyle = '#1b2226';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(430, 74);
  g.lineTo(636, 74);
  g.stroke();
  const r = new Rng(515);
  for (let i = 0; i < 5; i++) {
    const x = 448 + i * 38;
    rr(g, x, 52 - r.int(6), 16, 22 + r.int(5), 3, i % 2 ? 'rgba(190,205,210,0.4)' : 'rgba(160,130,80,0.5)');
  }
  // The chalkboard, priced in confidence.
  rr(g, 70, 96, 84, 60, 4, '#26211c');
  g.strokeStyle = '#4a3d2c';
  g.lineWidth = 3;
  g.strokeRect(70, 96, 84, 60);
  g.font = '600 20px Caveat, cursive';
  g.textAlign = 'center';
  g.fillStyle = 'rgba(235,235,225,0.8)';
  g.fillText('chaya', 112, 122);
  g.font = '500 15px Caveat, cursive';
  g.fillText('the meter kind', 112, 142);
  // The bulb and its warm pool.
  g.strokeStyle = '#151a1d';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(320, 24);
  g.lineTo(320, 54);
  g.stroke();
  glowSpot(g, 320, 62, 210, '#ffd98a', 0.2);
  dot(g, 320, 60, 7, '#ffe9b0');
  dot(g, 320, 60, 3.4, '#fff7dd');
  // The counter.
  vgrad(g, 0, 246, 640, 14, '#9a6a40', '#7d5232');
  g.strokeStyle = 'rgba(255,230,190,0.35)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(0, 247);
  g.lineTo(640, 247);
  g.stroke();
  vgrad(g, 0, 260, 640, 80, '#5c3c22', '#452c18');
  g.strokeStyle = 'rgba(30,18,10,0.5)';
  g.lineWidth = 2;
  for (let x = 60; x < 640; x += 105) {
    g.beginPath();
    g.moveTo(x, 260);
    g.lineTo(x, 340);
    g.stroke();
  }
  chayaBack = s;
  return s;
}

const CHAYA_LEGEND = [
  { keys: ['space'], does: 'the next move: lift, pour, set down' },
  { keys: ['left', 'right'], does: 'choose how it is served' },
] as const;

export class ChayaPanel {
  private phase: ChayaPhase = 'boil';
  private boil = 0;
  private stirs = 0;
  private pullIdx = 0;
  private arm = 0;
  private lifting = false;
  private spills = 0;
  private serve: 'flourish' | 'under' = 'under';
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only.
  private scene: Scene | null = null;
  private hints: { setHint: (h: string) => void } | null = null;
  private spoonT = 0;
  private pourGlow = 0;
  private dripAt = 0;
  private waftAt = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'boil';
    this.boil = 0;
    this.stirs = 0;
    this.pullIdx = 0;
    this.arm = 0;
    this.lifting = false;
    this.spills = 0;
    this.serve = 'under';
    this.hint = 'Milk and tea over the flame. Nothing to press yet; the boil is the boil.';
    this.scene ??= new Scene();
    this.hints = mountScene(this.root, 'The Meter-Long Pour', this.scene, CHAYA_LEGEND);
    unclampHint(this.root);
    this.scene.restart();
    this.spoonT = 0;
    this.pourGlow = 0;
    this.dripAt = 0;
    this.waftAt = 0;
    this.root.hidden = false;
    this.hints.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    const sc = this.scene;
    if (this.phase === 'boil') {
      const was = this.boil;
      this.boil = Math.min(1, this.boil + dt / 4.5);
      if (was < 1 && this.boil >= 1) {
        this.audio.chime();
        this.hint = 'The boil climbs the pot and holds. "Now," says Shaji. Space to take up the tumblers.';
        if (sc) {
          sc.flash('#f6e3b0', 0.3);
          if (!calm()) sc.burst(150, 196, { n: 8, color: '#f4ead6', speed: 50, grav: -30, size: 2.4, life: 0.8, kind: 'puff' });
        }
      }
    } else if (this.phase === 'pull' && this.lifting) {
      this.arm = Math.min(1, this.arm + dt * (0.45 + this.arm * 0.25));
      if (this.arm >= 1) {
        // Overshoot: the arc outruns the tumbler. A wet counter, never a failure.
        this.lifting = false;
        this.arm = 0;
        this.spills++;
        this.audio.slosh();
        this.hint = 'The arc outruns the glass; chaya rings the counter. Shaji laughs like a kettle. "Now it is a real thattukada. Again, from the wrist."';
        if (sc && !calm()) {
          sc.thump(6, 0.05);
          sc.burst(410, 250, { n: 14, color: '#c9862e', speed: 130, grav: 320, size: 2.6, life: 0.6 });
        }
        if (this.spills >= SPILL_LIMIT) this.potDry();
      }
    }
    // Visual clocks.
    this.spoonT = Math.max(0, this.spoonT - dt * 2.4);
    this.pourGlow = Math.max(0, this.pourGlow - dt * 1.6);
    if (sc) {
      const t = sc.time;
      if (this.phase === 'boil' && t > this.waftAt) {
        this.waftAt = t + Math.max(0.25, 0.9 - this.boil * 0.6);
        if (!calm()) sc.waft(150 + wobble(t, 1.7) * 10, 196, 'rgba(250,246,236,0.35)', 6 + this.boil * 4);
      }
      if (this.phase !== 'boil' && t > this.waftAt) {
        this.waftAt = t + 0.7;
        if (!calm()) sc.waft(410 + wobble(t, 1.3) * 5, 200, 'rgba(235,242,238,0.14)', 4.5);
      }
      if (this.phase === 'pull' && this.lifting && t > this.dripAt) {
        this.dripAt = t + 0.12;
        if (!calm()) sc.burst(410, 206, { n: 2, color: '#d9a441', speed: 55, grav: 300, size: 1.8, life: 0.4 });
      }
      sc.frame(dt, (g) => this.paint(g));
    }
    this.hints?.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase === 'serve') {
      if (dir === 'left') this.serve = 'flourish';
      if (dir === 'right') this.serve = 'under';
    }
  }

  /** The counter has drunk the pot. Nothing lost but milk, and some dignity. */
  private potDry() {
    const sc = this.scene;
    this.phase = 'dry';
    this.lifting = false;
    this.arm = 0;
    this.audio.bump();
    this.hint =
      'The pot goes light, then empty. Shaji looks at the shining counter, then at you. "Mone, today the table drank first. Space, and we boil again."';
    if (sc && !calm()) sc.thump(3, 0.03);
  }

  /** Boil again: the panel's own reset, same completion callback. */
  private again() {
    const done = this.onDone;
    if (done) this.open(done);
    this.hint = 'Fresh milk, fresh tea, the same flame. Shaji wipes the counter with one unhurried arm. "Patience is an ingredient."';
    this.hints?.setHint(this.hint);
  }

  onAction() {
    const sc = this.scene;
    if (this.phase === 'dry') {
      this.again();
      return;
    }
    if (this.phase === 'boil') {
      if (this.boil < 1) {
        this.stirs++;
        this.audio.blip();
        this.spoonT = 1;
        this.hint = [
          '"Patience is an ingredient," says Shaji. The milk thinks about it, walls first.',
          'Shaji moves your hand off the pot with one finger. "The boil answers to the flame, mone, not to us."',
          'The kettle mutters. You wait. Around here, this counts as working.',
        ][(this.stirs - 1) % 3] as string;
      } else {
        this.phase = 'pull';
        this.hint = 'Two tumblers, one stream. Space lifts the pouring arm; Space again lets the tea go. Height is froth.';
      }
      return;
    }
    if (this.phase === 'pull') {
      if (!this.lifting) {
        this.lifting = true;
        this.audio.blip();
        this.hint = 'The arm climbs, the stream thins and sings. Let go when the height feels like bragging.';
      } else {
        this.lifting = false;
        const target = PULL_TARGETS[this.pullIdx] ?? 0.8;
        if (this.arm >= target) {
          this.audio.chime();
          this.hint = PULL_PRAISE[this.pullIdx] as string;
          this.pullIdx++;
          this.arm = 0;
          this.pourGlow = 1;
          if (sc) {
            sc.flash('#ffdf9a', 0.3);
            if (!calm()) sc.burst(410, 200, { n: 10, color: '#f6ecd8', speed: 70, grav: 60, size: 2.6, life: 0.6 });
          }
          if (this.pullIdx >= PULL_TARGETS.length) {
            this.phase = 'serve';
            this.hint += ' Now the glass. Left and right choose how it is handed over; Space commits.';
          } else {
            this.hint += ' "Higher," says Shaji, already pleased. The next pull wants more air.';
          }
        } else {
          this.audio.bump();
          this.arm = 0;
          this.hint = '"That is not chaya, that is surrender," says Shaji. "Again. The wrist knows; let it brag a little."';
          if (sc && !calm()) sc.thump(2.5, 0);
        }
      }
      return;
    }
    if (this.phase === 'serve') {
      this.phase = 'done';
      this.audio.weaveDone();
      if (sc) sc.flash('#ffe9b0', 0.4);
      this.hint =
        this.serve === 'under'
          ? 'One hand pouring, one hand under the glass. Shaji nods like a co-conspirator. Press Space.'
          : 'You hand it across with a flourish. "Fast service," says Shaji. His eyebrow files a small report. Press Space.';
      return;
    }
    // done
    this.root.hidden = true;
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  private paint(g: CanvasRenderingContext2D) {
    const t = this.scene?.time ?? 0;
    g.drawImage(chayaBackdrop().cv, 0, 0);

    // Rain slipping past the eaves at the edges of the stall.
    g.strokeStyle = 'rgba(210,226,232,0.16)';
    g.lineWidth = 1;
    for (const d of RAIN) {
      if (d.x > 60 && d.x < 580) continue;
      const yy = ((t * 240 * d.s + d.p * 340) % 300) - 10;
      g.beginPath();
      g.moveTo(d.x, yy);
      g.lineTo(d.x - 2, yy + 10);
      g.stroke();
    }

    this.paintStove(g, t);
    for (let i = 0; i < Math.min(this.spills, 3); i++) {
      const [px, py] = PUDDLES[i]!;
      oval(g, px, py, 26, 6, 'rgba(150,95,40,0.5)');
      oval(g, px - 6, py - 1, 9, 2, 'rgba(255,235,200,0.25)');
    }

    if (this.phase === 'boil') {
      cap(g, `the boil: ${Math.round(this.boil * 100)}%`);
    } else if (this.phase === 'dry') {
      // Two empty tumblers standing in a shining puddle, waiting for a refill.
      this.paintGlass(g, 410, 250, 1, 0, 0, t);
      this.paintGlass(g, 340, 252, 0.9, 0, 0, t);
      oval(g, 375, 258, 74, 9, 'rgba(150,95,40,0.28)');
      oval(g, 352, 255, 22, 3, 'rgba(255,235,200,0.18)');
      cap(g, 'the pot is empty · the counter drank well');
    } else if (this.phase === 'pull') {
      this.paintPull(g, t);
      const wet = this.spills > 0 ? `  ·  counter: wet x${this.spills}` : '';
      cap(g, `pull ${Math.min(this.pullIdx + 1, 3)} of 3${wet}`);
    } else {
      this.paintServe(g, t);
      cap(
        g,
        this.phase === 'serve'
          ? this.serve === 'flourish'
            ? '← hand it over with a flourish'
            : 'one hand under the glass →'
          : 'the glass is poured',
      );
    }
  }

  private paintStove(g: CanvasRenderingContext2D, t: number) {
    // The kerosene stove and its pot live stage left through every phase.
    rr(g, 104, 238, 92, 14, 5, '#2c2c30');
    rr(g, 112, 232, 76, 8, 3, '#3c3c42');
    // Flame: blue at the root, orange tongues climbing the gap to the pot.
    const hot = this.phase === 'boil' ? 0.7 + this.boil * 0.5 : 0.5;
    oval(g, 150, 233, 28, 4, 'rgba(106,168,216,0.85)');
    for (let i = 0; i < 6; i++) {
      const fx = 124 + i * 10.5;
      const fh = (8 + Math.abs(wobble(t, 9.5, i * 1.7)) * 9) * hot;
      oval(g, fx, 232 - fh * 0.5, 3.6, fh, '#e8933a');
      oval(g, fx, 232 - fh * 0.4, 1.9, fh * 0.6, '#f6c96a');
    }
    // The pot: aluminum belly, dark rim, milk climbing inside.
    g.fillStyle = '#8e979c';
    g.beginPath();
    g.moveTo(106, 196);
    g.quadraticCurveTo(108, 222, 150, 224);
    g.quadraticCurveTo(192, 222, 194, 196);
    g.closePath();
    g.fill();
    oval(g, 132, 208, 12, 7, 'rgba(230,238,240,0.35)', -0.4);
    oval(g, 150, 196, 44, 10, '#aab3b8');
    oval(g, 150, 196, 39, 8, '#4c3b2c');
    const lvl = this.phase === 'boil' ? this.boil : this.phase === 'dry' ? 0 : 1;
    const milk = shade('#f0e2c8', -lvl * 0.1);
    // An emptied pot shows its own dark bottom, not a pale disc of nothing.
    if (lvl > 0.02) oval(g, 150, 197 - lvl * 3, 36, 6.5, milk);
    // Bubbles walk in from the walls as the boil takes hold.
    const r = new Rng(88);
    const n = Math.floor(lvl * 12);
    for (let i = 0; i < n; i++) {
      const a = r.next() * Math.PI * 2;
      const rad = 10 + r.next() * 24 * (1.2 - lvl * 0.5);
      const bx = 150 + Math.cos(a) * rad;
      const bb = Math.abs(wobble(t, 6 + r.next() * 4, i * 2.2));
      dot(g, bx, 196 - lvl * 3 + Math.sin(a) * 4, 1.2 + bb * 1.7, 'rgba(255,250,238,0.8)');
    }
    if (this.spoonT > 0) {
      // The stir Shaji did not ask for.
      const k = easeOutCubic(1 - this.spoonT);
      g.strokeStyle = '#8a6238';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(176 + k * 10, 156 + Math.sin(k * Math.PI) * 26);
      g.lineTo(158 + k * 6, 198);
      g.stroke();
    }
  }

  private paintPull(g: CanvasRenderingContext2D, t: number) {
    const armY = 232 - this.arm * 180;
    const target = PULL_TARGETS[this.pullIdx] ?? 0.8;
    const targetY = 232 - target * 180;
    // The chalk mark on the wall: pull to here, then higher.
    g.strokeStyle = 'rgba(240,240,230,0.5)';
    g.lineWidth = 2;
    g.setLineDash([8, 7]);
    g.beginPath();
    g.moveTo(272, targetY);
    g.lineTo(500, targetY);
    g.stroke();
    g.setLineDash([]);
    label(g, 'to here', 243, targetY + 5, 'rgba(240,240,230,0.65)', 15);

    // The catch glass, filling and frothing, a thin curl of steam above.
    const fill = Math.min(1, 0.22 + this.pullIdx * 0.24 + (this.lifting ? this.arm * 0.1 : 0));
    const froth = 2.5 + this.pullIdx * 5 + (this.lifting ? this.arm * 4 : 0) + this.pourGlow * 3;
    this.paintGlass(g, 410, 250, 1, fill, froth, t);
    g.strokeStyle = 'rgba(240,246,242,0.35)';
    g.lineWidth = 1.8;
    g.lineCap = 'round';
    const sx = 410 + wobble(t, 1.1) * 4;
    g.beginPath();
    g.moveTo(sx, 196);
    g.bezierCurveTo(sx - 5 + wobble(t, 1.7) * 3, 182, sx + 5, 170, sx + wobble(t, 1.4) * 4, 156);
    g.stroke();

    // The pouring arm and its tumbler, wobbling when the reach turns greedy.
    const over = Math.max(0, (this.arm - 0.82) / 0.18);
    const jig = wobble(t, 14) * 0.09 * over;
    g.strokeStyle = '#8a5636';
    g.lineWidth = 15;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(228, armY + 42);
    g.quadraticCurveTo(268, armY + 30, 312, armY + 10);
    g.stroke();
    g.save();
    g.translate(330, armY);
    g.rotate(0.6 + this.arm * 0.2 + jig);
    rr(g, -12, -18, 24, 34, 4, '#b8c0c8');
    rr(g, -12, -18, 24, 8, 3, '#d4dadf');
    rr(g, -12, 6, 24, 4, 2, '#98a1a8');
    // The gripping hand, thumb over the band.
    oval(g, -13, 2, 6, 9, '#8a5636');
    oval(g, -8, -6, 4.4, 3, '#7a4a2e', -0.5);
    g.restore();

    if (this.lifting && this.arm > 0.03) {
      // The stream: an amber ribbon stretching and thinning with the pull.
      const lipX = 342 + this.arm * 6;
      const lipY = armY + 12;
      const sway = wobble(t, 6.5) * (2 + this.arm * 4) * (1 + over * 2.5);
      const gx = 410;
      const gy = 206;
      const n = 14;
      let px = lipX;
      let py = lipY;
      for (let i = 1; i <= n; i++) {
        const k = i / n;
        const xx = lipX + (gx - lipX) * k + Math.sin(k * Math.PI) * (10 + sway);
        const yy = lipY + (gy - lipY) * (k * k * 0.35 + k * 0.65);
        g.strokeStyle = '#c9862e';
        g.lineWidth = (4.6 - this.arm * 2.2) * (1 - k * 0.35);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(xx, yy);
        g.stroke();
        g.strokeStyle = 'rgba(238,194,122,0.8)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(px - 1, py);
        g.lineTo(xx - 1, yy);
        g.stroke();
        px = xx;
        py = yy;
      }
      // Where the stream lands: a bright churn, not a halo.
      dot(g, gx, gy, 3.2, '#f6ecd8');
      dot(g, gx - 4, gy - 2 + wobble(t, 11) * 1.5, 1.8, '#faf3e4');
      dot(g, gx + 4, gy - 1 - wobble(t, 9) * 1.5, 1.6, '#faf3e4');
    }
    if (this.pourGlow > 0) glowSpot(g, 410, 200, 130, '#ffdf9a', this.pourGlow * 0.16);
  }

  private paintGlass(g: CanvasRenderingContext2D, x: number, base: number, s: number, fill: number, froth: number, t: number) {
    const w = 30 * s;
    const h = 46 * s;
    const top = base - h;
    softShadow(g, x, base + 2, w * 0.9, 5, 0.25);
    // Amber body, then the froth cap standing on it.
    const fillH = fill * (h - 8);
    rr(g, x - w / 2 + 3, base - 3 - fillH, w - 6, fillH, 3, '#b5732e');
    rr(g, x - w / 2 + 3, base - 3 - fillH, w - 6, Math.min(6, fillH), 3, '#d9a441');
    // Froth and the tea's surface only exist when there is tea; an empty
    // tumbler on a wet counter should read as plainly empty.
    if (fill > 0.06) {
      const r = new Rng(31);
      for (let i = 0; i < 7; i++) {
        const bx = x - w / 2 + 5 + r.next() * (w - 10);
        dot(g, bx, base - 4 - fillH - r.next() * froth, 2 + r.next() * 2.2 * s, '#f6ecd8');
      }
      oval(g, x, base - 4 - fillH, w / 2 - 4, 3.4, '#faf3e4');
    }
    // The glass itself, drawn over its contents.
    g.strokeStyle = 'rgba(225,235,240,0.55)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x - w / 2, top);
    g.lineTo(x - w / 2 + 2, base);
    g.lineTo(x + w / 2 - 2, base);
    g.lineTo(x + w / 2, top);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.moveTo(x - w / 2 + 5, top + 6);
    g.lineTo(x - w / 2 + 6.5, base - 6);
    g.stroke();
    void t;
  }

  private paintServe(g: CanvasRenderingContext2D, t: number) {
    // The finished glass, held out one way or the other.
    const gx = 320;
    const gy = 246;
    if (this.phase === 'serve' && this.serve === 'flourish') {
      // The sweeping hand-over, all wrist and confidence.
      g.strokeStyle = '#8a5636';
      g.lineWidth = 17;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(470, 210);
      g.quadraticCurveTo(410, 178, gx + 26, gy - 58);
      g.stroke();
      g.strokeStyle = 'rgba(255,240,210,0.25)';
      g.lineWidth = 2;
      for (const rr2 of [46, 58]) {
        g.beginPath();
        g.arc(gx, gy - 30, rr2, Math.PI * 1.15, Math.PI * 1.75);
        g.stroke();
      }
    } else {
      // One palm under the glass: the co-conspirator's grip.
      g.strokeStyle = '#8a5636';
      g.lineWidth = 15;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(gx + 26, gy + 4);
      g.quadraticCurveTo(gx + 110, gy - 14, 480, gy + 10);
      g.stroke();
      oval(g, gx + 2, gy + 4, 30, 10, '#8a5636');
      for (let i = 0; i < 3; i++) oval(g, gx - 26 + i * 5, gy + 1 - i, 5, 3.4, '#7a4a2e', -0.4);
    }
    this.paintGlass(g, gx, gy, 1.35, 0.9, 14, t);
    g.strokeStyle = 'rgba(240,246,242,0.4)';
    g.lineWidth = 2;
    g.lineCap = 'round';
    for (const off of [-8, 9]) {
      const sx = gx + off + wobble(t, 1.2, off) * 4;
      g.beginPath();
      g.moveTo(sx, gy - 74);
      g.bezierCurveTo(sx - 6 + wobble(t, 1.8, off) * 3, gy - 92, sx + 6, gy - 106, sx + wobble(t, 1.5, off) * 5, gy - 122);
      g.stroke();
    }
    glowSpot(g, gx, gy - 40, 130, '#ffd98a', 0.14);
    if (this.phase === 'done') glowSpot(g, gx, gy - 30, 170, '#ffe9b0', 0.12);
  }
}
