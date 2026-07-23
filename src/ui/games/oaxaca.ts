import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * Chapter Nine's two hands-on verbs.
 *
 * MolePanel: the hour of stirring. Mole negro cannot be hurried and cannot be
 * failed; you walk the wooden spoon in circles while Abuela Chela narrates
 * thirty ingredients' worth of memory. Wrong directions just slosh.
 *
 * OfrendaPanel: building Nani's ofrenda, three levels, no wrong answers.
 * Every placement echoes a chapter of the journey; the altar is the journal
 * with candles. Items appear based on what the player actually carried here.
 */

// ------------------------------------------------------------ the save peek

/**
 * Panels are built at boot with no handle on GameState, so the ofrenda reads
 * the autosave (written on every flag change, always current by open()).
 */
function savedFlags(): Set<string> {
  try {
    const raw = localStorage.getItem('elsewhere.save');
    if (!raw) return new Set();
    const data = JSON.parse(raw) as { flags?: string[] };
    return new Set(data.flags ?? []);
  } catch {
    return new Set();
  }
}

// ------------------------------------------------------------ the mole

const STIR_ORDER: Dir[] = ['up', 'right', 'down', 'left'];
const STIR_ROUNDS = 6;

const STIR_LINES = [
  'Chela: The chilhuacle is from La Cañada. One little valley grows it for the whole world, and barely.',
  'Chela: Burnt tortilla goes in. Burnt on purpose. Black is a flavor if you mean it.',
  'Chela: Almonds, raisins, sesame. Thirty things that argue in the bag and agree in the pot.',
  'Chela: My mother stirred this the year your Nani ate here. Same pot. Pots remember.',
  'Chela: The chocolate goes in last and thanks you for waiting.',
  'Chela: Slower. Mole can smell a hurry.',
];

export class MolePanel {
  private step = 0;
  private rounds = 0;
  private done = false;
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
    this.step = 0;
    this.rounds = 0;
    this.done = false;
    this.hint = 'The spoon stands up in the pot by itself. Stir in circles: up, right, down, left.';
    this.root.hidden = false;
    this.render();
  }

  onDir(dir: Dir) {
    if (this.done) return;
    if (dir === STIR_ORDER[this.step]) {
      this.step = (this.step + 1) % 4;
      this.audio.slosh();
      if (this.step === 0) {
        this.rounds++;
        this.hint = STIR_LINES[Math.min(this.rounds - 1, STIR_LINES.length - 1)] ?? '';
        if (this.rounds >= STIR_ROUNDS) {
          this.done = true;
          this.audio.weaveDone();
          this.hint = 'The mole turns glossy and goes quiet, like it has decided something. Press Space.';
        }
      }
    } else {
      this.audio.bump();
      this.hint = 'It sloshes. With the circle, not against it. The pot sets the pace.';
    }
    this.render();
  }

  onAction() {
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    this.audio.blip();
    this.hint = 'No shortcuts. The hour is an ingredient. Keep the spoon walking.';
    this.render();
  }

  private render() {
    const angle = this.step * 90 - 90;
    const dots = Array.from({ length: STIR_ROUNDS }, (_, i) =>
      i < this.rounds ? '&#9679;' : '&#9675;',
    ).join('');
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Hour of Stirring</div>
        <div style="position:relative;width:120px;height:120px;margin:8px auto 10px;border-radius:50%;
                    background:radial-gradient(circle at 45% 40%, #3d2417, #1f110a 70%);
                    border:6px solid #7a4a2a;box-shadow:0 4px 0 rgba(43,33,24,.4)">
          <div style="position:absolute;left:50%;top:50%;width:8px;height:52px;background:#c9a35f;
                      border:2px solid #2b2118;border-radius:4px;transform-origin:50% 6px;
                      transform:translate(-50%,-6px) rotate(${angle}deg);transition:transform .12s ease"></div>
          <div style="position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;
                      border-radius:50%;background:#c9a35f;border:2px solid #2b2118"></div>
        </div>
        <div class="c-count">${dots}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ------------------------------------------------------------ the ofrenda

type OfrendaItem = { id: string; label: string; echo: string };

const LEVELS = ['cielo, for what guides', 'the table, for what feeds', 'earth, for what walks'];

function buildItems(flags: Set<string>): OfrendaItem[] {
  const items: OfrendaItem[] = [
    {
      id: 'photo',
      label: 'her photograph, from the journal',
      echo: 'Refugio wipes the glass with her thumb. Fifty years, and the smile has not aged a day.',
    },
    {
      id: 'cempa',
      label: 'cempasúchil, a double armful',
      echo: 'The scent climbs the room. Orange is how the dead find the door, Elías says. She always found doors.',
    },
    {
      id: 'agua',
      label: 'a clay cup of water',
      echo: 'For the thirsty traveler. She crossed an ocean twice. She will be thirsty.',
    },
    {
      id: 'pan',
      label: 'pan de muerto, carita up',
      echo: 'The little face looks out from the crown of the loaf. The panadero pressed it there for her by name.',
    },
  ];
  if (flags.has('c9.of.omiyage')) {
    items.push({
      id: 'omiyage',
      label: 'the omiyage from Shionoura',
      echo: 'A gift wrapped for one friend, arriving for another. Kindness reroutes. It does not expire.',
    });
  }
  if (flags.has('c9.of.kanga')) {
    items.push({
      id: 'kanga',
      label: 'the kanga meant for giving',
      echo: 'One worn, one given, Bi Amina said. The cloth finally learns who it was folded for.',
    });
  }
  if (flags.has('c9.of.wish')) {
    const echo = flags.has('wish.nani')
      ? 'The Tanabata wish, refolded. You asked the sky to help you find her. The altar answers: found.'
      : flags.has('wish.people')
        ? 'The Tanabata wish, refolded. You asked for the people of the road. Tonight they are all one village.'
        : 'The Tanabata wish, refolded. You asked for a safe road. It ended at an altar, which is safe enough.';
    items.push({ id: 'wish', label: 'the tanzaku wish, refolded', echo });
  }
  items.push({
    id: 'band',
    label: 'the woven band at your wrist',
    echo: 'You hold your wrist to the candle. The grana answers the marigolds. The band stays on; some things are carried, not left.',
  });
  return items;
}

export class OfrendaPanel {
  private items: OfrendaItem[] = [];
  private placed: string[][] = [[], [], []];
  private idx = 0;
  private level = 1;
  private echo = '';
  private hint = '';
  private done = false;
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
    this.items = buildItems(savedFlags());
    this.placed = [[], [], []];
    this.idx = 0;
    this.level = 1;
    this.echo = '';
    this.done = false;
    this.hint = 'Three levels. Up and down to choose one, Space to set the item there. There is no wrong shelf.';
    this.root.hidden = false;
    this.render();
  }

  onDir(dir: Dir) {
    if (this.done) return;
    if (dir === 'up') this.level = Math.max(0, this.level - 1);
    if (dir === 'down') this.level = Math.min(2, this.level + 1);
    this.audio.select();
    this.render();
  }

  onAction() {
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    const item = this.items[this.idx];
    if (!item) return;
    this.placed[this.level]?.push(item.label);
    this.audio.weaveNote(this.idx % 7);
    this.echo = item.echo;
    this.idx++;
    if (this.idx >= this.items.length) {
      this.done = true;
      this.audio.weaveDone();
      this.hint = 'Refugio lights the last candle. The altar holds a whole journey now. Press Space.';
    } else {
      this.hint = 'The village watches, and nobody corrects a single placement. Next: choose a level, Space to set.';
    }
    this.render();
  }

  private render() {
    const shelves = LEVELS.map((name, i) => {
      const cur = !this.done && i === this.level;
      const chips = (this.placed[i] ?? [])
        .map(
          (l) =>
            `<span style="display:inline-block;margin:2px;padding:1px 7px;border:1px solid #8a6238;
                    border-radius:9px;font-size:11px;background:rgba(232,134,47,.14)">${l}</span>`,
        )
        .join('');
      return `<div style="border:2px ${cur ? 'solid #c1512f' : 'solid rgba(138,98,56,.55)'};border-radius:4px;
                    margin:4px 0;padding:3px 6px;min-height:26px;text-align:left;
                    background:${cur ? 'rgba(232,134,47,.08)' : 'transparent'}">
                <span style="font-size:11px;font-style:italic;color:#8a6238">${name}</span><br>${chips}
              </div>`;
    }).join('');
    const current = this.done
      ? '<i>every item is placed</i>'
      : `in your hands: <b>${this.items[this.idx]?.label ?? ''}</b> (${this.idx + 1} of ${this.items.length})`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">An Ofrenda for Nani</div>
        ${shelves}
        <div style="font-size:12.5px;margin:6px 0 2px">${current}</div>
        <div style="font-size:12px;font-style:italic;min-height:30px;color:#57452f">${this.echo}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
