import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * Sicily's two hands-on verbs.
 *
 * ScopaPanel: a real, small scopa at the circolo. Three cards each, four on
 * the table; capture by match or by sum; clear the table and you shout. The
 * elders coach between hands. First to a modest total wins, and if the house
 * gets there first, the house declares it was only a warm-up.
 *
 * PisciPanel: an oar in U pisci a mari. The rais calls the stroke; pull when
 * the call reaches the boat. The fish escapes twice on purpose. It is a rite,
 * not a race: misses cost nothing but the rais's patience, which is theater.
 */

// ---------------------------------------------------------------- scopa

type Card = { v: number; s: number };

const SUITS = ['D', 'C', 'S', 'B'] as const;
const SUIT_NAMES = ['denari', 'coppe', 'spade', 'bastoni'] as const;

const COACH = [
  'An elder taps the deck: "The settebello, the seven of denari. She is the bride of the game. Guard her."',
  '"Count the denari as they go. Most coins is a point, and coins remember who held them."',
  '"Most cards is a point too. Greed, in this one case, is technique."',
  '"When the table adds up to your card, take the whole sum. Arithmetic is also fishing."',
  '"If you cannot capture, feed the table something small. Never leave a seven lying in the sun."',
] as const;

function deckOf(): Card[] {
  const d: Card[] = [];
  for (let s = 0; s < 4; s++) {
    for (let v = 1; v <= 10; v++) d.push({ v, s });
  }
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = d[i];
    const b = d[j];
    if (a && b) {
      d[i] = b;
      d[j] = a;
    }
  }
  return d;
}

/** Indices of a subset of `table` summing to `v`, preferring fewer cards. */
function findSum(table: Card[], v: number): number[] | null {
  let best: number[] | null = null;
  const n = table.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    const idx: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += table[i]?.v ?? 0;
        idx.push(i);
      }
    }
    if (sum === v && (best === null || idx.length < best.length)) best = idx;
  }
  return best;
}

type ScopaPhase = 'play' | 'wait' | 'between' | 'done';

export class ScopaPanel {
  private deck: Card[] = [];
  private table: Card[] = [];
  private hand: Card[] = [];
  private opp: Card[] = [];
  private cursor = 0;
  private phase: ScopaPhase = 'play';
  private waitT = 0;
  private myCards = 0;
  private oppCards = 0;
  private myDenari = 0;
  private oppDenari = 0;
  private mySette = false;
  private myScope = 0;
  private oppScope = 0;
  private myPts = 0;
  private oppPts = 0;
  private target = 6;
  private lastCapMine = false;
  private coachI = 0;
  private hint = '';
  private flourish = '';
  private onDone: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.myPts = 0;
    this.oppPts = 0;
    this.target = 6;
    this.coachI = 0;
    this.startRound();
    this.hint = 'Left and right pick a card, Space plays it. Match a table card, or sum several. Sweep the table for a scopa.';
    this.root.hidden = false;
    this.render();
  }

  private startRound() {
    this.deck = deckOf();
    this.table = this.deck.splice(0, 4);
    this.hand = this.deck.splice(0, 3);
    this.opp = this.deck.splice(0, 3);
    this.cursor = 0;
    this.myCards = 0;
    this.oppCards = 0;
    this.myDenari = 0;
    this.oppDenari = 0;
    this.mySette = false;
    this.myScope = 0;
    this.oppScope = 0;
    this.lastCapMine = false;
    this.flourish = '';
    this.phase = 'play';
  }

  /** Play `card`: capture by exact match first, else by sum, else it stays. */
  private resolve(card: Card, mine: boolean): string {
    const single = this.table.findIndex((t) => t.v === card.v);
    let taken: Card[] = [];
    if (single >= 0) {
      taken = this.table.splice(single, 1);
    } else {
      const idx = findSum(this.table, card.v);
      if (idx) {
        taken = idx
          .slice()
          .sort((a, b) => b - a)
          .map((i) => this.table.splice(i, 1)[0])
          .filter((c): c is Card => !!c);
      }
    }
    if (taken.length === 0) {
      this.table.push(card);
      return mine ? 'No capture; the card stays on the wood.' : 'The elder feeds the table a card, watching you sideways.';
    }
    const got = [...taken, card];
    const denari = got.filter((c) => c.s === 0).length;
    const sette = got.some((c) => c.v === 7 && c.s === 0);
    if (mine) {
      this.myCards += got.length;
      this.myDenari += denari;
      if (sette) this.mySette = true;
      this.lastCapMine = true;
    } else {
      this.oppCards += got.length;
      this.oppDenari += denari;
      this.lastCapMine = false;
    }
    let msg = mine ? `You take ${got.length} cards.` : `The elder captures ${got.length}.`;
    if (sette) msg += mine ? ' The settebello is yours!' : ' The settebello slips away to his pile.';
    if (this.table.length === 0) {
      if (mine) {
        this.myScope++;
        this.flourish = 'SCOPA!';
        this.audio.chime();
        msg = 'SCOPA! The table is swept clean. A card goes face up, sideways, for the score.';
      } else {
        this.oppScope++;
        msg = 'Scopa for the elder. He does not shout. He has shouted enough this century, he says.';
      }
    } else if (mine) {
      this.audio.weaveNote(got.length % 7);
    }
    return msg;
  }

  private oppPlay() {
    let bestI = -1;
    let bestScore = -1;
    for (let i = 0; i < this.opp.length; i++) {
      const c = this.opp[i];
      if (!c) continue;
      const single = this.table.some((t) => t.v === c.v);
      const sum = single ? null : findSum(this.table, c.v);
      if (!single && !sum) continue;
      const takenVs = single ? [c.v] : (sum ?? []).map((j) => this.table[j]?.v ?? 0);
      let score = takenVs.length;
      if (takenVs.includes(7)) score += 2;
      if (c.s === 0) score += 1;
      if (score > bestScore) {
        bestScore = score;
        bestI = i;
      }
    }
    if (bestI < 0) {
      let lowI = 0;
      let lowV = 99;
      for (let i = 0; i < this.opp.length; i++) {
        const c = this.opp[i];
        if (c && c.v + (c.s === 0 ? 5 : 0) < lowV) {
          lowV = c.v + (c.s === 0 ? 5 : 0);
          lowI = i;
        }
      }
      bestI = lowI;
    }
    const played = this.opp.splice(bestI, 1)[0];
    if (played) this.hint = this.resolve(played, false);
  }

  private afterTurns() {
    if (this.hand.length === 0 && this.opp.length === 0) {
      if (this.deck.length > 0) {
        this.hand = this.deck.splice(0, 3);
        this.opp = this.deck.splice(0, 3);
        this.cursor = 0;
        const coach = COACH[this.coachI % COACH.length];
        this.coachI++;
        this.hint = `New hands. ${coach ?? ''}`;
      } else {
        // Leftovers go to the last capturer, without a scopa.
        const leftD = this.table.filter((c) => c.s === 0).length;
        if (this.lastCapMine) {
          this.myCards += this.table.length;
          this.myDenari += leftD;
          if (this.table.some((c) => c.v === 7 && c.s === 0)) this.mySette = true;
        } else {
          this.oppCards += this.table.length;
          this.oppDenari += leftD;
        }
        this.table = [];
        let mine = this.myScope;
        let theirs = this.oppScope;
        const notes: string[] = [];
        if (this.myCards > this.oppCards) {
          mine++;
          notes.push('most cards, yours');
        } else if (this.oppCards > this.myCards) {
          theirs++;
          notes.push('most cards, his');
        }
        if (this.myDenari > this.oppDenari) {
          mine++;
          notes.push('most denari, yours');
        } else if (this.oppDenari > this.myDenari) {
          theirs++;
          notes.push('most denari, his');
        }
        if (this.mySette) {
          mine++;
          notes.push('the settebello, yours');
        } else {
          theirs++;
          notes.push('the settebello, his');
        }
        if (this.myScope > 0) notes.push(`${this.myScope} scopa of yours`);
        if (this.oppScope > 0) notes.push(`${this.oppScope} of his`);
        this.myPts += mine;
        this.oppPts += theirs;
        this.phase = 'between';
        this.hint = `The deal is done: ${notes.join('; ')}. Space to count on.`;
        return;
      }
    }
    this.phase = 'play';
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'wait') {
      this.waitT -= dt;
      if (this.waitT <= 0) {
        this.flourish = '';
        if (this.opp.length > 0) this.oppPlay();
        this.afterTurns();
        this.render();
      }
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'play' || this.hand.length === 0) return;
    if (dir === 'left') this.cursor = (this.cursor + this.hand.length - 1) % this.hand.length;
    if (dir === 'right') this.cursor = (this.cursor + 1) % this.hand.length;
    this.render();
  }

  onAction() {
    if (this.phase === 'play') {
      if (this.cursor >= this.hand.length) this.cursor = Math.max(0, this.hand.length - 1);
      const played = this.hand.splice(this.cursor, 1)[0];
      if (!played) return;
      this.hint = this.resolve(played, true);
      this.cursor = 0;
      this.phase = 'wait';
      this.waitT = 0.8;
      this.render();
    } else if (this.phase === 'between') {
      if (this.myPts >= this.target) {
        this.phase = 'done';
        this.flourish = '';
        this.hint = `${this.myPts} to ${this.oppPts}. The table thumps; the chair is yours now, officially. Press Space.`;
        this.audio.weaveDone();
      } else if (this.oppPts >= this.target) {
        this.target += 2;
        this.startRound();
        this.hint = `He reaches ${this.oppPts} and waves it away: "Warm-up. We play to ${this.target} now." The cards come around again.`;
      } else {
        this.startRound();
        this.hint = `${this.myPts} to ${this.oppPts}, playing to ${this.target}. The deal passes; the fan takes a turn too.`;
      }
      this.render();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private cardHtml(c: Card, cur: boolean): string {
    const suit = SUITS[c.s] ?? '?';
    const gold = c.s === 0;
    const style =
      'display:inline-block;min-width:26px;padding:5px 4px;margin:2px;border-radius:5px;text-align:center;' +
      `border:2px solid ${cur ? '#c1512f' : 'rgba(60,45,25,0.55)'};` +
      `background:${cur ? '#f7edd6' : '#f2e6d0'};color:${gold ? '#a2823f' : '#2b2118'};` +
      'font-weight:bold;font-size:14px;';
    return `<div style="${style}" title="${SUIT_NAMES[c.s] ?? ''}">${c.v}${suit}</div>`;
  }

  private render() {
    const table = this.table.map((c) => this.cardHtml(c, false)).join('') || '<i>(swept clean)</i>';
    const hand = this.hand.map((c, i) => this.cardHtml(c, i === this.cursor && this.phase === 'play')).join('');
    const backs = '&#9646;'.repeat(this.opp.length);
    const flourish = this.flourish
      ? `<div style="font-size:22px;letter-spacing:0.3em;color:#c1512f;margin:4px 0;">${this.flourish}</div>`
      : '';
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">Scopa at the Circolo</div>
        <div style="font-size:13px;color:#57452f;">the elder holds <b>${backs}</b> &nbsp;·&nbsp; deck ${this.deck.length}</div>
        <div style="margin:8px 0;min-height:38px;">${table}</div>
        ${flourish}
        <div style="margin:6px 0;min-height:38px;">${hand}</div>
        <div class="c-count">you ${this.myPts} · him ${this.oppPts} · playing to ${this.target}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ---------------------------------------------------------------- u pisci

type PisciPhase = 'row' | 'leap' | 'done';

export class PisciPanel {
  private phase: PisciPhase = 'row';
  private strokes = 0; // good strokes this leg
  private leg = 0; // 0..2; the fish escapes after legs 0 and 1
  private x = 1; // the rais's call rolling toward the boat
  private speed = 0.5;
  private leapT = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

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
    this.strokes = 0;
    this.leg = 0;
    this.x = 1;
    this.speed = 0.5;
    this.hint = 'The rais lifts his arm. Space to pull as his call reaches the boat.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'row') {
      this.x -= dt * this.speed;
      if (this.x < -0.08) {
        this.audio.slosh();
        this.x = 1;
        this.hint = 'The call goes by unpulled. The rais forgives you at the top of his voice. Again.';
      }
      this.render();
    } else if (this.phase === 'leap') {
      this.leapT -= dt;
      if (this.leapT <= 0) {
        this.phase = 'row';
        this.x = 1;
        this.speed += 0.14;
        this.hint = 'The boat comes about. The rais calls faster now; the fish has made it personal.';
      }
      this.render();
    }
  }

  onDir(dir: Dir) {
    void dir;
  }

  onAction() {
    if (this.phase === 'row') {
      if (this.x <= 0.24 && this.x >= -0.08) {
        this.strokes++;
        this.audio.slosh();
        if (this.strokes >= 3) {
          if (this.leg < 2) {
            this.leg++;
            this.strokes = 0;
            this.phase = 'leap';
            this.leapT = 1.5;
            this.audio.jingle();
            this.hint =
              this.leg === 1
                ? 'The swordfish LEAPS, silver and laughing, clean over the bow. The crowd howls. It escapes, as scripted.'
                : 'Almost aboard, and gone again in a sheet of spray. The saint on the steps looks unsurprised.';
          } else {
            this.phase = 'done';
            this.audio.weaveDone();
            this.hint = 'The fish surrenders, grinning, hauled up to bells and roaring. Press Space.';
          }
        } else {
          this.x = 1;
          this.hint = `Pull! Together! ${3 - this.strokes} more to close on the fish.`;
        }
      } else {
        this.audio.bump();
        this.hint = 'Early. Wait for the call to reach the boat; the sea keeps the tempo, not you.';
      }
      this.render();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const pct = Math.max(0, Math.min(100, this.x * 100));
    const legDots = '&#9679;'.repeat(this.strokes) + '&#9675;'.repeat(Math.max(0, 3 - this.strokes));
    const chase = ['first pass', 'second pass', 'the taking'][this.leg] ?? '';
    const track =
      this.phase === 'done'
        ? '<div class="c-track"><div class="c-zone"></div><div class="c-horse"></div></div><div class="c-count">caught</div>'
        : `<div class="c-track">
             <div class="c-zone"></div>
             <div class="c-horse"></div>
             <div class="c-wave" style="left:${pct}%"></div>
           </div>
           <div class="c-count">${legDots} · ${chase}</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">U Pisci a Mari</div>
        ${track}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ---------------------------------------------------------------- the cannoli

/**
 * CannoloPanel: behind Alfio's counter with the pastry bag. Each shell is
 * filled at the moment, never before: press to pipe, press to stop in the
 * sweet zone, both ends, then the garnish. Overfilling erupts, and Alfio
 * eats the evidence for quality. Nothing here can fail; the law is the
 * lesson, and the law is: a filled shell waiting is a soggy lie.
 */

type CannoloGarnish = { name: string; line: string };

const GARNISHES: CannoloGarnish[] = [
  { name: 'Pistachio', line: '"Pistachio: the classicist. Somewhere in the hills, Bronte nods."' },
  { name: 'Candied orange', line: '"Candied orange: sunshine that learned how to keep. My grandmother\'s vote."' },
  { name: 'Chocolate', line: '"Chocolate: the modernist. The nonnas complain about it and take two."' },
];

type CannoloCustomer = { call: string; served: string };

const CUSTOMERS: CannoloCustomer[] = [
  {
    call: 'First customer: the signora in black from the fish stall. "One cannolo. I will know if the shell sat," she says, entirely correctly.',
    served: 'The signora bites, listens to the crack like a jeweler, and nods once. From her, that is a standing ovation.',
  },
  {
    call: 'Next: a rower from the pageant, still damp, sash and all. "Two ends, full honors. I have earned the loud kind."',
    served: 'The rower eats it in two bites and raises the stub like an oar. The bar applauds the crumbs.',
  },
  {
    call: 'Last customer: Alfio himself, arms folded, off duty for exactly one pastry. "Impress me. I taught you everything you know today."',
    served: 'Alfio chews with his eyes shut, professionally. "Tsk. Tragic," he says, finishing it. "I have nothing left to teach."',
  },
];

type CannoloPhase = 'pipe' | 'burst' | 'garnish' | 'served' | 'done';

export class CannoloPanel {
  private phase: CannoloPhase = 'pipe';
  private shell = 0; // 0..2
  private end = 0; // 0..1, both ends or it is not a cannolo
  private fill = 0; // 0..1 for the current end
  private flowing = false;
  private zoneLo = 0.6;
  private zoneW = 0.2;
  private speed = 0.42;
  private burstT = 0;
  private gCur = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'pipe';
    this.shell = 0;
    this.end = 0;
    this.fill = 0;
    this.flowing = false;
    this.speed = 0.42;
    this.zoneLo = 0.6;
    this.gCur = 0;
    this.hint = `${CUSTOMERS[0]?.call ?? ''} Space starts the ricotta; Space again stops it in the sweet zone.`;
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'pipe' && this.flowing) {
      this.fill += dt * this.speed;
      if (this.fill >= 1) {
        // The eruption. Nobody grieves; the owner performs quality control.
        this.flowing = false;
        this.fill = 0;
        this.end = 0;
        this.phase = 'burst';
        this.burstT = 1.6;
        this.audio.slosh();
        this.hint = 'The shell ERUPTS ricotta from both ends. Alfio catches it and eats the whole disaster in one bite. "Quality control." A new shell appears.';
      }
      this.render();
    } else if (this.phase === 'burst') {
      this.burstT -= dt;
      if (this.burstT <= 0) {
        this.phase = 'pipe';
        this.hint = 'A fresh shell, blameless. Space to pipe, Space to stop; the sweet zone forgives, the far wall does not.';
        this.render();
      }
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'garnish') return;
    if (dir === 'left' || dir === 'up') this.gCur = (this.gCur + GARNISHES.length - 1) % GARNISHES.length;
    if (dir === 'right' || dir === 'down') this.gCur = (this.gCur + 1) % GARNISHES.length;
    this.render();
  }

  onAction() {
    if (this.phase === 'pipe') {
      if (!this.flowing) {
        this.flowing = true;
        this.hint = this.end === 0 ? 'The ricotta moves. Watch the meter; stop inside the zone.' : 'Second end filling. The bag is warmer now, and so is your nerve.';
        this.render();
        return;
      }
      this.flowing = false;
      if (this.fill < this.zoneLo) {
        this.hint = 'Alfio squints down the shell. "That end is still hungry, friend. Again, with courage." The flow waits on your thumb.';
      } else {
        const generous = this.fill > this.zoneLo + this.zoneW;
        if (this.end === 0) {
          this.end = 1;
          this.fill = 0;
          this.hint = generous
            ? 'Generous, but the shell holds. "Now the other end. A cannolo has no back door, friend; both ends or it is a lie with a hole in it."'
            : 'Clean stop. "Now the other end. A cannolo has no back door, friend. Both ends, always."';
        } else {
          this.phase = 'garnish';
          this.audio.chime();
          this.hint = generous
            ? 'Both ends full to the brim and holding. "Now the ends get dressed. Arrows choose the garnish; there is no wrong door on this one."'
            : 'Both ends, filled at the moment, no sooner. "Now the garnish. Arrows choose; every answer is correct, which is rare in this country."';
        }
      }
      this.render();
    } else if (this.phase === 'garnish') {
      const g = GARNISHES[this.gCur];
      if (!g) return;
      this.audio.jingle();
      this.phase = 'served';
      this.hint = `Both ends dipped. ${g.line} ${CUSTOMERS[this.shell]?.served ?? ''} Space for the next.`;
      this.render();
    } else if (this.phase === 'served') {
      this.shell++;
      if (this.shell < CUSTOMERS.length) {
        this.phase = 'pipe';
        this.end = 0;
        this.fill = 0;
        this.speed += 0.12; // the bag warms, the ricotta hurries
        this.zoneLo = 0.56 + this.shell * 0.05;
        this.hint = `${CUSTOMERS[this.shell]?.call ?? ''} The ricotta runs faster as the bag warms. Space to pipe.`;
      } else {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'Three shells, three moments, zero soggy lies. Alfio holds out his hand for the bag with visible reluctance. Press Space.';
      }
      this.render();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const shellDots = CUSTOMERS.map((_, i) => {
      const done = i < this.shell || (i === this.shell && (this.phase === 'served' || this.phase === 'done'));
      return `<span style="display:inline-block;width:13px;height:13px;border-radius:50%;margin:0 3px;
        border:2px solid #2b2118;background:${done ? '#c99230' : 'transparent'}" title="shell ${i + 1}"></span>`;
    }).join('');
    let middle = '';
    if (this.phase === 'pipe' || this.phase === 'burst') {
      const zoneLeft = this.zoneLo * 100;
      const zoneWidth = this.zoneW * 100;
      const pct = Math.min(100, this.fill * 100);
      middle = `
        <div style="font-size:13px;margin-bottom:2px;">end ${this.end + 1} of 2 &nbsp;·&nbsp;
          <em>${this.phase === 'burst' ? 'erupted' : this.flowing ? 'piping' : 'holding'}</em></div>
        <div class="c-track">
          <div class="c-zone" style="left:${zoneLeft}%;width:${zoneWidth}%;"></div>
          <div class="c-rider" style="left:${Math.min(96, pct)}%;"></div>
        </div>
        <div class="c-count">${Math.round(pct)}% of the shell</div>`;
    } else if (this.phase === 'garnish') {
      const cells = GARNISHES.map((g, i) => {
        const cur = i === this.gCur;
        return `<div style="display:inline-block;padding:7px 10px;margin:2px;border-radius:5px;font-size:13px;
          border:2px solid ${cur ? '#c1512f' : 'rgba(43,33,24,0.55)'};background:${cur ? '#f7edd6' : 'rgba(242,230,208,0.5)'};
          ${cur ? 'box-shadow:0 0 0 2px rgba(193,81,47,0.35);' : ''}">${g.name}</div>`;
      }).join('');
      middle = `<div style="margin:10px 0;">${cells}</div>`;
    } else {
      middle = '<div class="c-count" style="margin:12px 0;">filled at the moment, never before</div>';
    }
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Pastry Bag</div>
        <div style="margin:2px 0 8px">${shellDots}</div>
        ${middle}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
