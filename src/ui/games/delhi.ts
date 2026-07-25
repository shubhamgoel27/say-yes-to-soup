import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * Old Delhi's two hands-on verbs.
 *
 * ParanthaPanel: Kamla Chachi's griddle. Roll the disc even, cup the
 * stuffing, seal without tearing, and flip on the sound the tawa makes, not
 * on the clock. Three paranthas, rising in ambition: aloo, mooli, and the
 * rabri graduation. Success is measured in a customer's silence.
 *
 * PatangPanel: the rooftop, a patang on plain cotton dor. Two verbs only:
 * kheench (pull, Up) when the line is taut, dheel (slack, Down) when the
 * gust comes. When pigeons cross, you give the sky back; that is Yusuf's
 * one law, and the game's. Practice flies one rival; the tournament flies
 * three, into the front of a monsoon storm.
 */

// ------------------------------------------------------------ the griddle

type Course = {
  name: string;
  stuffing: string;
  /** Width of the good zone on the rolling meter, in 0..1. */
  zone: number;
  /** Flips needed on the tawa. */
  flips: number;
  intro: string;
};

const COURSES: Course[] = [
  {
    name: 'aloo parantha',
    stuffing: 'spiced potato, coriander, one secret',
    zone: 0.3,
    flips: 2,
    intro: 'Aloo first. Everyone begins at aloo; it forgives like a grandmother.',
  },
  {
    name: 'mooli parantha',
    stuffing: 'grated radish, squeezed dry, ajwain',
    zone: 0.22,
    flips: 3,
    intro: 'Mooli now. Wet radish tears the dough; Kamla has squeezed it so you cannot fail her. Only yourself.',
  },
  {
    name: 'rabri parantha',
    stuffing: 'thickened sweet milk, pistachio, nerve',
    zone: 0.15,
    flips: 3,
    intro: 'The rabri parantha. The graduation. Kamla folds her arms, which is the highest form of watching.',
  },
];

const OOPS_ROLL = [
  'Lopsided. Kamla flattens it with one pass, no comment. The comment is the silence.',
  'Too thin at the edge. "The stuffing will escape there, beta. Stuffing always finds the thin place."',
  'She takes your hands in hers and rolls one slow circle. "Feel that? Even. The pin listens to the palms."',
];

const OOPS_FLIP = [
  'Early. The underside is pale as a clerk. "Listen to the tawa, beta. It says when."',
  'Late. A dark scorch ring. Kamla flips it to the customer side down without looking.',
];

type PPhase = 'roll' | 'stuff' | 'tawa' | 'served' | 'done';

export class ParanthaPanel {
  private phase: PPhase = 'roll';
  private course = 0;
  private meter = 0; // rolling meter position, bounces 0..1
  private dir = 1;
  private flipsDone = 0;
  private sizzle = 0; // 0..1, flip window near the top
  private rolled = 0;
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
    this.phase = 'roll';
    this.course = 0;
    this.meter = 0;
    this.dir = 1;
    this.flipsDone = 0;
    this.sizzle = 0;
    this.rolled = 0;
    this.hint = `${COURSES[0]?.intro} Space stops the pin when the disc is even: the middle of the meter.`;
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'roll') {
      const speed = 0.9 + this.course * 0.35;
      this.meter += dt * speed * this.dir;
      if (this.meter > 1) {
        this.meter = 1;
        this.dir = -1;
      }
      if (this.meter < 0) {
        this.meter = 0;
        this.dir = 1;
      }
      this.render();
    } else if (this.phase === 'tawa') {
      // The sizzle climbs; flip inside the singing window near the top.
      this.sizzle = Math.min(1, this.sizzle + dt * (0.34 + this.course * 0.1));
      if (this.sizzle >= 1) {
        // Held too long: the tawa complains, the window resets, no funeral.
        this.sizzle = 0;
        this.audio.bump();
        this.hint = OOPS_FLIP[1] as string;
      }
      this.render();
    }
  }

  onDir(_dir: Dir) {
    // The griddle has no steering, only timing and Kamla's eyebrows.
  }

  onAction() {
    const c = COURSES[this.course];
    if (!c) return;
    if (this.phase === 'roll') {
      const mid = Math.abs(this.meter - 0.5);
      if (mid <= c.zone / 2) {
        this.rolled++;
        this.audio.chime();
        if (this.rolled === 1) {
          this.hint = `Even. Now cup the stuffing: ${c.stuffing}. Space to seal it in, gently, like closing a letter.`;
          this.phase = 'stuff';
        }
      } else {
        this.audio.blip();
        this.hint = OOPS_ROLL[Math.min(2, this.course)] as string;
      }
      this.render();
      return;
    }
    if (this.phase === 'stuff') {
      // Sealing is a single act of faith; the second roll goes back to the meter.
      if (this.rolled === 1) {
        this.rolled = 2;
        this.audio.blip();
        this.hint = 'Sealed, no tears. Now roll it out again, thin but unbroken. Same meter, smaller mercy.';
        this.phase = 'roll';
        this.meter = 0;
        this.dir = 1;
      } else {
        this.audio.chime();
        this.phase = 'tawa';
        this.sizzle = 0;
        this.flipsDone = 0;
        this.hint = 'Onto the tawa. The ghee hisses low, then SINGS. Space exactly when the song starts: the bright band.';
      }
      this.render();
      return;
    }
    if (this.phase === 'roll' as PPhase) return;
    if (this.phase === 'tawa') {
      if (this.sizzle >= 0.62 && this.sizzle <= 0.88) {
        this.flipsDone++;
        this.audio.slosh();
        this.sizzle = 0;
        if (this.flipsDone >= c.flips) {
          this.audio.weaveNote(this.course + 2);
          this.course++;
          const next = COURSES[this.course];
          if (next) {
            this.hint = `Golden, blistered, correct. ${next.intro} Back to the pin: Space stops it even.`;
            this.phase = 'roll';
            this.rolled = 0;
            this.meter = 0;
            this.dir = 1;
          } else {
            this.phase = 'served';
            this.hint =
              'The rabri parantha goes to the porter in the corner. He takes one bite and stops talking entirely. Kamla nods once. Press Space.';
          }
        } else {
          this.hint = `Flipped on the word. ${c.flips - this.flipsDone} more; the tawa will tell you when.`;
        }
      } else if (this.sizzle < 0.62) {
        this.audio.bump();
        this.sizzle = 0;
        this.hint = OOPS_FLIP[0] as string;
      }
      this.render();
      return;
    }
    if (this.phase === 'served') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'Silence, the good kind, three plates deep. In this gali that is a standing ovation. Press Space.';
      this.render();
      return;
    }
    this.root.hidden = true;
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  private render() {
    const c = COURSES[Math.min(this.course, COURSES.length - 1)];
    let middle = '';
    let count = '';
    if (this.phase === 'roll') {
      const zonePct = (c?.zone ?? 0.3) * 100;
      const pos = this.meter * 100;
      middle = `<div style="height:22px;position:relative;border-radius:8px;background:rgba(255,255,255,0.08);overflow:hidden;margin:10px 0">
          <div style="position:absolute;top:0;bottom:0;left:${50 - zonePct / 2}%;width:${zonePct}%;background:rgba(200,165,91,0.45)"></div>
          <div style="position:absolute;top:0;bottom:0;left:${pos}%;width:3px;background:#f2e6d0"></div>
        </div>`;
      count = `<div class="c-count">${c?.name} &middot; ${this.rolled === 0 ? 'first roll' : 'second roll, thinner'}</div>`;
    } else if (this.phase === 'stuff') {
      middle = `<div style="text-align:center;font-size:26px;margin:8px 0">&#129360;</div>`;
      count = `<div class="c-count">${c?.name} &middot; ${c?.stuffing}</div>`;
    } else if (this.phase === 'tawa') {
      const s = this.sizzle * 100;
      middle = `<div style="height:22px;position:relative;border-radius:8px;background:linear-gradient(90deg,#4a3524,#7a4a2e);overflow:hidden;margin:10px 0">
          <div style="position:absolute;top:0;bottom:0;left:62%;width:26%;background:rgba(255,170,80,0.5)"></div>
          <div style="position:absolute;top:0;bottom:0;left:0;width:${s}%;background:linear-gradient(90deg,rgba(255,200,120,0.15),rgba(255,200,120,0.6))"></div>
        </div>`;
      count = `<div class="c-count">${c?.name} &middot; flip ${this.flipsDone + 1} of ${c?.flips} &middot; listen for the singing band</div>`;
    } else {
      count = `<div class="c-count">the plate goes out</div>`;
    }
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">Kamla Chachi's Tawa</div>
        ${middle}
        ${count}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ------------------------------------------------------------ the patang

type Wind = 'steady' | 'gust' | 'birds';
type KPhase = 'launch' | 'duel' | 'between' | 'storm' | 'done';

type Rival = { name: string; need: number; line: string };

const PRACTICE_RIVALS: Rival[] = [
  { name: 'the black patang from the water-tank roof', need: 5, line: 'The black kite drifts down the wind, cut loose. From the far roof, an approving insult.' },
];

const TOURNAMENT_RIVALS: Rival[] = [
  { name: 'the paper-seller\'s yellow patang', need: 4, line: 'Woh kata! The yellow one spirals into the kinari lane. The paper-seller applauds his own defeat; it was his paper.' },
  { name: 'the twins\' green patang', need: 5, line: 'Woh kata! The green kite folds and the twins shout at each other with delight. Two roofs over, money changes hands.' },
  { name: 'the ustad\'s old shahgird, flying red', need: 6, line: 'The red patang hangs, saws back hard, and then lets go into the rain. From his roof the shahgird salutes his teacher through you.' },
];

export class PatangPanel {
  private phase: KPhase = 'launch';
  private wind: Wind = 'steady';
  private windT = 0;
  private windDur = 2;
  private progress = 0;
  private rivalIdx = 0;
  private cuts = 0;
  private altitude = 0.3;
  private blessed = 0; // pigeon crossings honored
  private hint = '';
  private onDone: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
    private tournament = false,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  private get rivals(): Rival[] {
    return this.tournament ? TOURNAMENT_RIVALS : PRACTICE_RIVALS;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'launch';
    this.wind = 'steady';
    this.windT = 0;
    this.windDur = 2;
    this.progress = 0;
    this.rivalIdx = 0;
    this.cuts = 0;
    this.altitude = 0.3;
    this.blessed = 0;
    this.hint = this.tournament
      ? 'The mohalla is on its roofs. Yusuf hands you the charkhi: "Fly for the kucha. Space when the breeze leans in."'
      : 'The patang lies on your palm like a letter to the sky. Space when the breeze leans in, and up she goes.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen || this.phase === 'done' || this.phase === 'between') return;
    this.windT += dt;
    if (this.phase === 'launch') {
      this.render();
      return;
    }
    if (this.windT >= this.windDur) {
      this.windT = 0;
      // Weather schedule: mostly steady, gusts often, pigeons on their own clock.
      const roll = Math.random();
      const gustChance = this.tournament && this.rivalIdx === 2 ? 0.5 : 0.32;
      const birdChance = this.tournament ? 0.22 : 0.16;
      if (roll < birdChance) {
        this.wind = 'birds';
        this.windDur = 2.4;
        this.hint = 'PIGEONS. A flock crosses your line, wings everywhere. Dheel, Down, give the sky back. Yusuf is watching.';
      } else if (roll < birdChance + gustChance) {
        this.wind = 'gust';
        this.windDur = 1.6 + Math.random();
        this.hint = this.tournament && this.rivalIdx === 2
          ? 'The storm front SHOVES. Dheel, Down, ride it or the dor sings itself apart.'
          : 'A gust leans hard on the line. Dheel, Down; let her drink some slack.';
      } else {
        this.wind = 'steady';
        this.windDur = 1.8 + Math.random() * 1.4;
        this.hint = 'The line comes taut and steady. Kheench, Up: saw, saw, the cotton knows its work.';
      }
    }
    this.render();
  }

  onDir(dir: Dir) {
    if (this.phase !== 'duel') return;
    const rival = this.rivals[this.rivalIdx];
    if (!rival) return;
    if (dir === 'up') {
      if (this.wind === 'steady') {
        this.progress += 1;
        this.altitude = Math.min(1, this.altitude + 0.08);
        this.audio.blip();
        this.hint = 'The dor bites. You feel the other line through your fingers like a pulse.';
        if (this.progress >= rival.need) this.cutRival(rival);
      } else if (this.wind === 'gust') {
        this.progress = Math.max(0, this.progress - 1);
        this.altitude = Math.max(0.12, this.altitude - 0.1);
        this.audio.bump();
        this.hint = 'You pulled into the gust; the patang staggers sideways. "Dheel!" barks Yusuf. "The sky is bigger than you!"';
      } else {
        // Pulling through pigeons: the one real sin, and even it is warm.
        this.progress = Math.max(0, this.progress - 2);
        this.audio.bump();
        this.hint = 'Yusuf\'s hand closes on the dor. "Not through birds. Never through birds." The flock passes; the duel waits.';
      }
    } else if (dir === 'down') {
      if (this.wind === 'gust') {
        this.audio.slosh();
        this.altitude = Math.min(1, this.altitude + 0.04);
        this.hint = 'Slack, and she climbs the gust like a stair. The line hums, happy.';
      } else if (this.wind === 'birds') {
        this.audio.chime();
        this.blessed++;
        this.hint = 'You give ground; the flock pours past your slack line, close enough to hear. Yusuf says nothing, loudly, with approval.';
      } else {
        this.progress = Math.max(0, this.progress - 1);
        this.audio.blip();
        this.hint = 'Slack in steady air; the rival line saws YOU. You feel a fray start, and pull back just in time.';
      }
    }
    this.render();
  }

  private cutRival(rival: Rival) {
    this.cuts++;
    this.audio.weaveNote(this.cuts + 2);
    this.rivalIdx++;
    this.progress = 0;
    if (this.rivalIdx >= this.rivals.length) {
      this.phase = this.tournament ? 'storm' : 'between';
      this.hint = this.tournament
        ? `${rival.line} And then the first fat drops arrive, warm as chai. Press Space.`
        : `${rival.line} Press Space to bring her down; Yusuf's word, not yours.`;
    } else {
      this.phase = 'between';
      this.hint = `${rival.line} Press Space; the next line is already climbing.`;
    }
  }

  onAction() {
    if (this.phase === 'launch') {
      this.phase = 'duel';
      this.audio.chime();
      this.windT = 0;
      this.windDur = 2;
      this.wind = 'steady';
      this.hint = `${this.rivals[0]?.name ?? 'A rival'} crosses your line. Up is kheench, Down is dheel. The sharper line wins.`;
      this.render();
      return;
    }
    if (this.phase === 'between') {
      if (this.rivalIdx >= this.rivals.length) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'The patang comes down hand over hand, polite as a guest. Press Space.';
      } else {
        this.phase = 'duel';
        this.windT = 0;
        this.wind = 'steady';
        this.hint = `${this.rivals[this.rivalIdx]?.name} rises to meet you. Kheench on taut, dheel on gusts, and mind the birds.`;
      }
      this.render();
      return;
    }
    if (this.phase === 'storm') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'The sky opens properly. Nobody leaves the roofs; the kites come down and the kulhads come out. Press Space.';
      this.render();
      return;
    }
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const rival = this.rivals[Math.min(this.rivalIdx, this.rivals.length - 1)];
    const alt = Math.round(this.altitude * 100);
    const windTag =
      this.wind === 'steady' ? 'taut and steady' : this.wind === 'gust' ? 'GUST' : 'PIGEONS CROSSING';
    const windColor =
      this.wind === 'steady' ? 'rgba(200,165,91,0.5)' : this.wind === 'gust' ? 'rgba(120,160,200,0.55)' : 'rgba(168,166,176,0.6)';
    let middle = '';
    if (this.phase === 'duel' || this.phase === 'launch') {
      const prog = rival ? Math.round((this.progress / rival.need) * 100) : 0;
      middle = `<div style="height:64px;position:relative;border-radius:8px;overflow:hidden;margin:8px 0;
            background:linear-gradient(#8fa5b5,#c9c2b4)">
          <div style="position:absolute;left:8px;bottom:${8 + this.altitude * 36}px;font-size:16px">&#129665;</div>
          <div style="position:absolute;right:10px;top:6px;font-size:11px;padding:2px 6px;border-radius:6px;background:${windColor};color:#241a12">${windTag}</div>
          ${this.wind === 'birds' ? '<div style="position:absolute;left:34%;top:16px;font-size:13px">&#128038;&#128038;&#128038;</div>' : ''}
          <div style="position:absolute;left:0;bottom:0;height:4px;width:${prog}%;background:#c8a55b"></div>
        </div>`;
    }
    const score = this.phase === 'launch'
      ? '<div class="c-count">the charkhi is wound with plain cotton dor</div>'
      : `<div class="c-count">altitude ${alt} &middot; cuts ${this.cuts}${this.tournament ? ' of 3' : ''} &middot; flocks honored ${this.blessed}</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">${this.tournament ? 'The Sawan Tournament' : 'Patangbazi'}</div>
        ${middle}
        ${score}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
