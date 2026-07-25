import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';

/**
 * The pause menu: a page torn from the journal, because every surface here is.
 * Esc or Start breathes the game out; Resume breathes it back in. Settings are
 * the cozy-canon set: three volume sliders, text speed, reduce motion,
 * fullscreen. Credits are part of the game, not a chore.
 */

type Prefs = { textSpeed: 'cozy' | 'brisk' | 'instant'; reduceMotion: boolean };
const PREFS_KEY = 'soup.prefs';

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { textSpeed: 'cozy', reduceMotion: false, ...JSON.parse(raw) };
  } catch {
    /* defaults */
  }
  return { textSpeed: 'cozy', reduceMotion: false };
}

export const TEXT_CPS: Record<Prefs['textSpeed'], number> = { cozy: 60, brisk: 110, instant: 2000 };

type Screen = 'menu' | 'settings' | 'help' | 'credits';

type Hooks = {
  onTextSpeed: (cps: number) => void;
  onToTitle: () => void;
  onClosed?: () => void;
};

export class PauseMenu {
  private screen: Screen = 'menu';
  private cursor = 0;
  private prefs: Prefs = loadPrefs();
  /** While true, "Back to title" is hidden (opened from the title itself). */
  private fromTitle = false;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
    private hooks: Hooks,
  ) {
    this.applyPrefs();
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(screen: Screen = 'menu', fromTitle = false) {
    this.screen = screen;
    this.fromTitle = fromTitle;
    this.cursor = 0;
    this.root.hidden = false;
    this.render();
  }

  close() {
    this.root.hidden = true;
    this.hooks.onClosed?.();
  }

  private savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      /* private browsing */
    }
    this.applyPrefs();
  }

  private applyPrefs() {
    this.hooks.onTextSpeed(TEXT_CPS[this.prefs.textSpeed]);
    document.body.classList.toggle('reduce-motion', this.prefs.reduceMotion);
  }

  // ---------------------------------------------------------------- items

  private menuItems() {
    const items: { label: string; act: () => void }[] = [
      { label: this.fromTitle ? 'Back' : 'Keep walking', act: () => this.close() },
      { label: 'Settings', act: () => this.goto('settings') },
      { label: 'How to play', act: () => this.goto('help') },
      { label: 'Credits', act: () => this.goto('credits') },
    ];
    if (!this.fromTitle) {
      items.push({ label: 'Rest here (back to title)', act: () => { this.close(); this.hooks.onToTitle(); } });
    }
    return items;
  }

  private settingsItems() {
    const pct = (v: number) => Math.round(v * 10);
    const speedNames: Record<Prefs['textSpeed'], string> = {
      cozy: 'cozy', brisk: 'brisk', instant: 'instant',
    };
    return [
      {
        label: 'Music',
        value: () => '▋'.repeat(pct(this.audio.mix.music)) + '░'.repeat(10 - pct(this.audio.mix.music)),
        adjust: (d: number) => this.audio.setMix('music', this.audio.mix.music + d * 0.1),
      },
      {
        label: 'Sounds',
        value: () => '▋'.repeat(pct(this.audio.mix.sfx)) + '░'.repeat(10 - pct(this.audio.mix.sfx)),
        adjust: (d: number) => {
          this.audio.setMix('sfx', this.audio.mix.sfx + d * 0.1);
          this.audio.blip();
        },
      },
      {
        label: 'Ambience',
        value: () => '▋'.repeat(pct(this.audio.mix.ambience)) + '░'.repeat(10 - pct(this.audio.mix.ambience)),
        adjust: (d: number) => this.audio.setMix('ambience', this.audio.mix.ambience + d * 0.1),
      },
      {
        label: 'Text speed',
        value: () => speedNames[this.prefs.textSpeed],
        adjust: (d: number) => {
          const order: Prefs['textSpeed'][] = ['cozy', 'brisk', 'instant'];
          const i = (order.indexOf(this.prefs.textSpeed) + d + order.length) % order.length;
          this.prefs.textSpeed = order[i] ?? 'cozy';
          this.savePrefs();
        },
      },
      {
        label: 'Reduce motion',
        value: () => (this.prefs.reduceMotion ? 'on' : 'off'),
        adjust: () => {
          this.prefs.reduceMotion = !this.prefs.reduceMotion;
          this.savePrefs();
        },
      },
      {
        label: 'Fullscreen',
        value: () => (document.fullscreenElement ? 'on' : 'off'),
        adjust: () => {
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen?.();
          setTimeout(() => this.render(), 150);
        },
      },
    ];
  }

  private goto(screen: Screen) {
    this.screen = screen;
    this.cursor = 0;
    this.render();
  }

  // ---------------------------------------------------------------- input

  onDir(dir: Dir) {
    if (this.screen === 'menu') {
      const n = this.menuItems().length;
      if (dir === 'up') this.cursor = (this.cursor + n - 1) % n;
      else if (dir === 'down') this.cursor = (this.cursor + 1) % n;
      this.render();
    } else if (this.screen === 'settings') {
      const items = this.settingsItems();
      if (dir === 'up') this.cursor = (this.cursor + items.length - 1) % items.length;
      else if (dir === 'down') this.cursor = (this.cursor + 1) % items.length;
      else items[this.cursor]?.adjust(dir === 'right' ? 1 : -1);
      this.render();
    }
  }

  onAction() {
    if (this.screen === 'menu') this.menuItems()[this.cursor]?.act();
    else if (this.screen === 'settings') this.settingsItems()[this.cursor]?.adjust(1), this.render();
    else this.goto('menu');
  }

  onBack() {
    if (this.screen === 'menu') this.close();
    else this.goto('menu');
  }

  // ---------------------------------------------------------------- render

  private render() {
    let body = '';
    if (this.screen === 'menu') {
      body = `<div class="p-menu">${this.menuItems()
        .map((it, i) => `<div class="p-opt${i === this.cursor ? ' sel' : ''}">${i === this.cursor ? '&#9656;&nbsp;' : ''}${it.label}</div>`)
        .join('')}</div>`;
    } else if (this.screen === 'settings') {
      body = `<div class="p-settings">${this.settingsItems()
        .map(
          (it, i) => `<div class="p-row${i === this.cursor ? ' sel' : ''}">
            <span class="p-label">${i === this.cursor ? '&#9656;&nbsp;' : ''}${it.label}</span>
            <span class="p-value">${it.value()}</span>
          </div>`,
        )
        .join('')}
        <div class="p-hint-line">&#8592;&#8594; adjust &nbsp; Esc back</div></div>`;
    } else if (this.screen === 'help') {
      body = `<div class="p-help">
        <div class="p-row"><span class="p-label">Walk</span><span class="p-value">arrows / WASD / stick</span></div>
        <div class="p-row"><span class="p-label">Talk, touch, sit</span><span class="p-value">Space / Z / A</span></div>
        <div class="p-row"><span class="p-label">The journal</span><span class="p-value">J / Tab / Y</span></div>
        <div class="p-row"><span class="p-label">Pause</span><span class="p-value">Esc / Start</span></div>
        <div class="p-row"><span class="p-label">Mute</span><span class="p-value">M</span></div>
        <div class="p-note">Nani&rsquo;s actual instructions: say yes to soup, ask about the bread,
        and if someone corrects you, thank them twice. Walk slowly. That is the whole trick.</div>
      </div>`;
    } else {
      body = `<div class="p-credits">
        <p class="p-c-head">Say Yes to Soup</p>
        <p>a journal, half full</p>
        <p class="p-c-sec">Every village in this game is fictional; the texture is researched,
        and corrections from people who know these places are welcome.</p>
        <p class="p-c-sec">Type set in Fraunces, Literata &amp; Caveat (OFL, Google Fonts).
        Paper &amp; cloth textures from ambientCG (CC0). Ornaments from FreeSVG (CC0).
        Everything else&thinsp;&mdash;&thinsp;art, music, weather, gulls&thinsp;&mdash;&thinsp;is
        cooked fresh by the game at runtime.</p>
        <p class="p-c-sec">Made with love, and with soup.</p>
      </div>`;
    }
    const title =
      this.screen === 'menu' ? 'A rest' : this.screen === 'settings' ? 'Settings' : this.screen === 'help' ? 'How to play' : 'Credits';
    this.root.innerHTML = `
      <div class="p-card">
        <div class="p-title">${title}</div>
        ${body}
      </div>`;
  }
}
