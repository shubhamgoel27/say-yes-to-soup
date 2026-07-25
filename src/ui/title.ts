import type { Dir } from '../engine/input';

/**
 * The front door of the game: a quiet title card, then Nani's letter as the
 * framing device. Both are DOM overlays above the running world, which idles
 * softly behind them like an attract screen.
 */

export type TitleChoice = 'new' | 'continue';

export class TitleScreen {
  private cursor = 0;
  private options: { id: TitleChoice; label: string }[] = [];

  constructor(
    private titleEl: HTMLElement,
    private letterEl: HTMLElement,
  ) {}

  get titleOpen(): boolean {
    return !this.titleEl.hidden;
  }
  get letterOpen(): boolean {
    return !this.letterEl.hidden;
  }

  showTitle(hasSave: boolean) {
    this.options = hasSave
      ? [
          { id: 'continue', label: 'Continue the journey' },
          { id: 'new', label: 'Begin again' },
        ]
      : [{ id: 'new', label: 'Begin the journey' }];
    this.cursor = 0;
    this.titleEl.hidden = false;
    this.render();
  }

  hideTitle() {
    this.titleEl.hidden = true;
  }

  /** With no argument, Nani's framing letter. With one, mail from a friend. */
  showLetter(mail?: { from: string; body: string[] }) {
    this.letterEl.hidden = false;
    const paragraphs = mail
      ? mail.body.map((p) => `<p>${p}</p>`).join('')
      : `
          <p>For my grandchild, whenever you are grown,</p>
          <p>I meant to finish this journal. The world kept being bigger than
          the pages. So now the empty half is yours.</p>
          <p>Start where I started: <b>Ch&rsquo;aska Pampa</b>, the star plain.
          Say yes to soup. Ask about the bread. If someone corrects you, you
          are learning; thank them twice.</p>
          <p>Walk slowly. That is the whole trick.</p>`;
    const sign = mail ? mail.from : 'Nani, 1974';
    this.letterEl.innerHTML = `
      <div class="letter-paper">
        <div class="letter-body">
          ${paragraphs}
          <p class="letter-sign">${sign}</p>
        </div>
        <div class="letter-hint">press Space</div>
      </div>`;
  }

  hideLetter() {
    this.letterEl.hidden = true;
  }

  onDir(dir: Dir) {
    if (!this.titleOpen || this.options.length < 2) return;
    if (dir === 'up' || dir === 'down') {
      this.cursor = (this.cursor + 1) % this.options.length;
      this.render();
    }
  }

  /** Returns the chosen option when the title menu is confirmed. */
  choose(): TitleChoice {
    return this.options[this.cursor]?.id ?? 'new';
  }

  private render() {
    const menu = this.options
      .map(
        (o, i) =>
          `<div class="t-opt${i === this.cursor ? ' sel' : ''}">${i === this.cursor ? '&#9656;&nbsp;' : ''}${o.label}</div>`,
      )
      .join('');
    this.titleEl.innerHTML = `
      <div class="t-card">
        <div class="t-kicker">a journal, half full</div>
        <div class="t-name">SAY YES<br>TO SOUP</div>
        <div class="t-rule"></div>
        <div class="t-sub">an unhurried journey through the world&rsquo;s kitchens, courtyards, and words</div>
        <div class="t-menu">${menu}</div>
        <div class="t-controls">
          <span><b>&#8592;&#8593;&#8595;&#8594;</b> / WASD&nbsp; walk</span>
          <span><b>Space</b> / Z&nbsp; talk &amp; touch things</span>
          <span><b>J</b>&nbsp; the journal</span>
        </div>
      </div>`;
  }
}
