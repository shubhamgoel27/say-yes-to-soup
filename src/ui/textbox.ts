import type { GameState } from '../engine/state';
import type { Dir } from '../engine/input';
import type { NodeMap } from '../content/schema';

/**
 * The dialogue box: Pokémon rhythm, storybook skin. Typewriter text, a
 * portrait, choice arrows, and one button doing everything: complete the line,
 * advance the line, pick the choice.
 *
 * DOM rather than canvas because crisp text at arbitrary window scales matters
 * more here than pixel purity, and the box sits over the world, not in it.
 */

/** Characters revealed per second (default; Settings can change it). Driven by
 * the game loop, not a timer, so it cannot be throttled independently. */
const DEFAULT_CPS = 60;

type Els = {
  root: HTMLElement;
  portrait: HTMLElement;
  name: HTMLElement;
  text: HTMLElement;
  arrow: HTMLElement;
  choices: HTMLElement;
};

export class Textbox {
  private nodes: NodeMap = {};
  private nodeId = '';
  private lineIdx = 0;
  /** The current line with tokens resolved; what the typewriter reveals. */
  private lineText = '';
  private shown = 0;
  private typing = false;
  private cursor = 0;
  private portraitCv: HTMLCanvasElement | null = null;
  private cps = DEFAULT_CPS;
  private onClose: (() => void) | null = null;

  constructor(
    private els: Els,
    private state: GameState,
    /** Called once per newly revealed character, with the speaker (if any),
     * so the tick can babble in the speaker's language. */
    private onType?: (who?: string) => void,
  ) {}

  get isOpen(): boolean {
    return !this.els.root.hidden;
  }

  get currentNode(): string {
    return this.isOpen ? this.nodeId : '';
  }

  /** True while the typewriter is still revealing the current line. */
  get isTyping(): boolean {
    return this.isOpen && this.typing;
  }

  /** Settings hook: characters per second (a huge number reads as instant). */
  setSpeed(cps: number) {
    this.cps = cps;
  }

  open(nodes: NodeMap, startId: string, portrait: HTMLCanvasElement | null, onClose?: () => void) {
    this.nodes = nodes;
    this.portraitCv = portrait;
    this.onClose = onClose ?? null;
    this.els.root.hidden = false;
    // Every other surface in the game unfolds; the dialogue box was the one
    // hard cut, and it is the most repeated moment there is. Retrigger the
    // entrance on each open by clearing the class and forcing a reflow.
    this.els.root.classList.remove('tb-in');
    void this.els.root.offsetWidth;
    this.els.root.classList.add('tb-in');
    this.enterNode(startId);
  }

  private close() {
    this.stopType();
    this.els.root.hidden = true;
    this.els.choices.innerHTML = '';
    const done = this.onClose;
    this.onClose = null;
    done?.();
  }

  /** Choices whose `when` the player has earned (or that have none). */
  private activeChoices(node: NodeMap[string]) {
    return (node.choices ?? []).filter((c) => this.state.check(c.when));
  }

  private enterNode(id: string) {
    const node = this.nodes[id];
    if (!node) {
      console.warn(`missing dialogue node: ${id}`);
      this.close();
      return;
    }
    this.nodeId = id;
    this.lineIdx = 0;
    this.state.apply(node.effects);
    this.els.choices.innerHTML = '';
    this.showLine();
  }

  /** Token substitution: `{name}` becomes the name on the flyleaf, or
   * "traveler" when it was left blank. The only token dialogue knows. */
  private withTokens(text: string): string {
    return text.replace(/\{name\}/g, this.state.playerName?.trim() || 'traveler');
  }

  private showLine() {
    const node = this.nodes[this.nodeId];
    const line = node?.lines[this.lineIdx];
    if (!node || !line) return;
    this.lineText = this.withTokens(line.text);

    const narrator = !line.who;
    this.els.name.textContent = line.who ?? '';
    this.els.name.hidden = narrator;
    this.els.text.classList.toggle('narrator', narrator);
    // Portrait only while a named person is speaking.
    this.els.portrait.innerHTML = '';
    if (!narrator && this.portraitCv) this.els.portrait.appendChild(this.portraitCv);
    this.els.portrait.hidden = narrator || !this.portraitCv;

    this.els.arrow.hidden = true;
    this.shown = 0;
    this.els.text.textContent = '';
    this.typing = true;
  }

  /** Advance the typewriter. Called from the fixed-timestep update. */
  tick(dt: number) {
    if (!this.isOpen || !this.typing) return;
    const line = this.nodes[this.nodeId]?.lines[this.lineIdx];
    if (!line) return;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.lineText.length, this.shown + dt * this.cps);
    const now = Math.floor(this.shown);
    this.els.text.textContent = this.lineText.slice(0, now);
    if (now > before) this.onType?.(line.who);
    if (this.shown >= this.lineText.length) this.finishLine();
  }

  private stopType() {
    this.typing = false;
  }

  private finishLine() {
    this.stopType();
    const node = this.nodes[this.nodeId];
    const line = node?.lines[this.lineIdx];
    if (!node || !line) return;
    this.els.text.textContent = this.lineText;
    this.shown = this.lineText.length;

    const last = this.lineIdx >= node.lines.length - 1;
    if (last && this.activeChoices(node).length) {
      this.cursor = 0;
      this.renderChoices(node);
    } else {
      this.els.arrow.hidden = false;
    }
  }

  private renderChoices(node: NodeMap[string]) {
    this.els.arrow.hidden = true;
    this.els.choices.innerHTML = '';
    this.activeChoices(node).forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'tb-choice' + (i === this.cursor ? ' sel' : '');
      div.textContent = c.text;
      this.els.choices.appendChild(div);
    });
  }

  /** The single action button. */
  onAction() {
    const node = this.nodes[this.nodeId];
    if (!node) return;
    const line = node.lines[this.lineIdx];

    if (this.typing) {
      this.finishLine();
      return;
    }

    const last = this.lineIdx >= node.lines.length - 1;
    if (!last) {
      this.lineIdx++;
      this.showLine();
      return;
    }

    const active = this.activeChoices(node);
    if (active.length) {
      const choice = active[this.cursor];
      if (choice) this.enterNode(choice.goto);
      return;
    }
    if (node.next) {
      this.enterNode(node.next);
      return;
    }
    void line;
    this.close();
  }

  onDir(dir: Dir) {
    const node = this.nodes[this.nodeId];
    if (!node || this.typing) return;
    if (this.lineIdx < node.lines.length - 1) return;
    const n = this.activeChoices(node).length;
    if (n === 0) return;
    if (dir === 'up') this.cursor = (this.cursor + n - 1) % n;
    else if (dir === 'down') this.cursor = (this.cursor + 1) % n;
    else return;
    this.renderChoices(node);
  }
}
