/**
 * All sound is synthesized in WebAudio at runtime: footsteps, wind, chimes,
 * and a sparse plucked melody. Zero audio assets, matching the art approach.
 *
 * Design intent: quiet. The altiplano is mostly wind. Music is an occasional
 * visitor, a few pentatonic notes and gone, never a loop demanding attention.
 * (The content bible is firm: no pan-flute wallpaper.)
 */

type Scene = 'outdoor' | 'interior' | 'road';

/** A minor pentatonic on A: gentle, folk-adjacent, hard to make saccharine. */
const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

/**
 * One region's musical accent. Same quiet generative band everywhere, but the
 * scale, pulse, drum, and lead voice change with the coastline. Nothing loops;
 * everything visits.
 */
export type MusicStyle = {
  bpm: number;
  /** Melody scale, absolute Hz, low to high. */
  scale: number[];
  /** Chord tones cycled bar by bar. */
  chords: number[][];
  lead: OscillatorType;
  shimmer: OscillatorType;
  /** Percussion recipe; 'none' keeps only the heartbeat bass. */
  drum: 'bombo' | 'taiko' | 'janggu' | 'chenda' | 'ngoma' | 'tamburello' | 'marimba' | 'creak' | 'none';
  /** 0 = straight eighths, up to ~0.32 = a 6/8 lilt. */
  swing: number;
  /** Shimmer density multiplier. */
  density: number;
  /** Chance a bar-turn brings the visiting melody. */
  melodyChance: number;
};

const N = {
  A2: 110, B2: 123.47, C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61,
  Fs3: 185, G3: 196, A3: 220, Bb3: 233.08, B3: 246.94, C4: 261.63, Cs4: 277.18,
  D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392,
  A4: 440, Bb4: 466.16, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

/** The band's passport. Keys are regions, assigned per map in main. */
const MUSIC: Record<string, MusicStyle> = {
  // The Andes as shipped: 76bpm, Am family, bombo, charango shimmer.
  andes: {
    bpm: 76, scale: PENTA,
    chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.C4, N.E4, N.G4], [N.G3, N.B3, N.D4]],
    lead: 'sine', shimmer: 'triangle', drum: 'bombo', swing: 0, density: 1, melodyChance: 0.6,
  },
  // The Peruvian coast: same family, a marinera brightness, brushier pulse.
  coast: {
    bpm: 82, scale: [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4, N.C5],
    chords: [[N.A3, N.C4, N.E4], [N.G3, N.C4, N.E4], [N.F3, N.A3, N.D4], [N.E3, N.A3, N.C4]],
    lead: 'triangle', shimmer: 'triangle', drum: 'bombo', swing: 0.18, density: 0.9, melodyChance: 0.5,
  },
  // Mid-ocean: slow open fifths, almost no pulse, the pad breathing with swell.
  ocean: {
    bpm: 60, scale: [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4],
    chords: [[N.A2 * 2, N.E4], [N.F3, N.C4], [N.G3, N.D4], [N.A2 * 2, N.E4]],
    lead: 'sine', shimmer: 'sine', drum: 'creak', swing: 0, density: 0.4, melodyChance: 0.35,
  },
  // Seto Inland Sea: yo scale, koto-like plucks, one soft distant taiko.
  shionoura: {
    bpm: 68, scale: [N.D4, N.E4, N.G4, N.A4, N.B4, N.D5, N.E5],
    chords: [[N.D3 * 2, N.A3 * 2], [N.G3, N.D4], [N.A3, N.E4], [N.D3 * 2, N.A3 * 2]],
    lead: 'sine', shimmer: 'triangle', drum: 'taiko', swing: 0, density: 0.55, melodyChance: 0.55,
  },
  // Busan market: brighter pentatonic, the janggu's two-tone lilt.
  busan: {
    bpm: 88, scale: [N.E4, N.G4, N.A4, N.B4, N.D5, N.E5],
    chords: [[N.E3, N.B3, N.E4], [N.D3 * 2, N.A3, N.D4], [N.G3, N.D4, N.G4], [N.A3, N.E4, N.A4]],
    lead: 'triangle', shimmer: 'triangle', drum: 'janggu', swing: 0.22, density: 0.8, melodyChance: 0.45,
  },
  // Kerala backwater: a 6/8 sway, chenda ticks under rain-soft harmony.
  kerala: {
    bpm: 84, scale: [N.D4, N.E4, N.F4, N.A4, N.Bb4, N.C5, N.D5],
    chords: [[N.D3 * 2, N.F3 * 2, N.A3], [N.Bb3, N.D4, N.F4], [N.C4, N.F4, N.A4], [N.A3, N.D4, N.F4]],
    lead: 'sine', shimmer: 'triangle', drum: 'chenda', swing: 0.3, density: 0.75, melodyChance: 0.5,
  },
  // Swahili coast: a taarab-tinted scale, oud-dark plucks, low ngoma.
  zanzibar: {
    bpm: 72, scale: [N.D4, N.Eb4, N.Fs4, N.G4, N.A4, N.Bb4, N.C5, N.D5],
    chords: [[N.D3 * 2, N.A3, N.D4], [N.G3, N.Bb3, N.D4], [N.A3, N.Cs4, N.E4], [N.D3 * 2, N.A3, N.D4]],
    lead: 'triangle', shimmer: 'sawtooth', drum: 'ngoma', swing: 0.12, density: 0.6, melodyChance: 0.5,
  },
  // Sicilian dusk: major warmth in 6/8, a tamburello whispering, not driving.
  sicily: {
    bpm: 92, scale: [N.C4, N.D4, N.E4, N.F4, N.G4, N.A4, N.C5],
    chords: [[N.C4, N.E4, N.G4], [N.F3, N.A3, N.C4], [N.G3, N.B3, N.D4], [N.A3, N.C4, N.E4]],
    lead: 'triangle', shimmer: 'triangle', drum: 'tamburello', swing: 0.32, density: 0.7, melodyChance: 0.45,
  },
  // Oaxaca valley: son-warm thirds and sixths over a marimba heartbeat.
  oaxaca: {
    bpm: 80, scale: [N.G3, N.A3, N.B3, N.C4, N.D4, N.E4, N.G4, N.A4],
    chords: [[N.G3, N.B3, N.D4], [N.C4, N.E4, N.G4], [N.D4, N.Fs4, N.A4], [N.E3 * 2, N.G4, N.B4]],
    lead: 'sine', shimmer: 'sine', drum: 'marimba', swing: 0.26, density: 0.85, melodyChance: 0.55,
  },
  // The camposanto at night: candles, breath, almost only the pad.
  velacion: {
    bpm: 56, scale: [N.G3, N.Bb3, N.C4, N.D4, N.F4, N.G4],
    chords: [[N.G3, N.Bb3, N.D4], [N.Eb3 * 2, N.G3, N.Bb3], [N.F3, N.A3, N.C4], [N.G3, N.Bb3, N.D4]],
    lead: 'sine', shimmer: 'sine', drum: 'none', swing: 0, density: 0.3, melodyChance: 0.4,
  },
};

/**
 * How a language sounds before you can read it: the typewriter babble's pitch
 * home, its rise-and-fall contour, and its syllable gait. Tuned by ear to be
 * suggestive, never a caricature.
 */
export type VoiceStyle = {
  base: number;
  /** Semitone span the contour wanders across. */
  range: number;
  /** >0 phrases tend upward, <0 settle downward. */
  drift: number;
  /** Characters per babble syllable (bigger = statelier speech). */
  gait: number;
  wave: OscillatorType;
};

const VOICES: Record<string, VoiceStyle> = {
  andes: { base: 620, range: 4, drift: -0.4, gait: 3, wave: 'triangle' },
  coast: { base: 660, range: 6, drift: 0.3, gait: 2, wave: 'triangle' },
  ocean: { base: 560, range: 5, drift: 0, gait: 3, wave: 'triangle' },
  shionoura: { base: 700, range: 3, drift: -0.6, gait: 2, wave: 'sine' },
  busan: { base: 640, range: 7, drift: 0.5, gait: 2, wave: 'triangle' },
  kerala: { base: 600, range: 8, drift: 0.2, gait: 2, wave: 'sine' },
  zanzibar: { base: 580, range: 5, drift: -0.2, gait: 3, wave: 'triangle' },
  sicily: { base: 640, range: 9, drift: 0.6, gait: 2, wave: 'sawtooth' },
  oaxaca: { base: 610, range: 6, drift: 0.1, gait: 2, wave: 'triangle' },
};

/** A stable small hash for per-speaker voice identity. */
function nameHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  return h;
}

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private windGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  muted = false;
  private blipCount = 0;
  private scene: Scene = 'outdoor';
  private region = 'andes';
  private style: MusicStyle = MUSIC['andes'] as MusicStyle;
  /** Eighth-note counter and the scheduler's write head. */
  private beat = 0;
  private nextBeatTime = 0;
  /** Wandering babble contour position, in semitones from the voice's home. */
  private babblePos = 0;
  /** While sitting, the band thins and the wind leans in. */
  private sitting = false;

  /** Create the context. Must be called from a user gesture the first time. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.5;
      master.connect(ctx.destination);

      // Wind: looping noise through a lazy bandpass, breathing via an LFO.
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 2.5);
      noise.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 380;
      bp.Q.value = 0.6;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.1;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.045;
      lfo.connect(lfoGain).connect(windGain.gain);
      noise.connect(bp).connect(windGain).connect(master);
      noise.start();
      lfo.start();

      const musicGain = ctx.createGain();
      musicGain.gain.value = 0.85;
      musicGain.connect(master);

      this.ctx = ctx;
      this.master = master;
      this.windGain = windGain;
      this.musicGain = musicGain;
      this.applyScene();
    } catch {
      // No audio environment (headless, denied). The game plays silent.
    }
  }

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  /** One plucked note: triangle with a fast exponential decay. */
  private pluck(freq: number, when = 0, vol = 0.16, dur = 0.6) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** A short noise burst through a filter: the percussion family. */
  private thud(freq: number, dur: number, vol: number, type: BiquadFilterType = 'lowpass') {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer(this.ctx, dur + 0.05);
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /** Terrain-aware footstep: every coast underfoot sounds like itself. */
  step(groundKind: string) {
    switch (groundKind) {
      case 'plaza':
      case 'floorEarth':
      case 'floorOndol':
      case 'lanepave':
        this.thud(900, 0.05, 0.05, 'bandpass');
        break;
      case 'bridge':
      case 'pierdeck':
      case 'floorWood':
        this.thud(420, 0.09, 0.09, 'bandpass');
        break;
      case 'deck':
      case 'floorSteel':
        // Steel: a ringing tap over a dull body.
        this.thud(300, 0.07, 0.06, 'bandpass');
        this.pluck(1250, 0, 0.014, 0.05);
        break;
      case 'sand':
      case 'sandWet':
        this.thud(420, 0.1, 0.045, 'lowpass');
        break;
      case 'basalto':
      case 'corallane':
      case 'laterite':
        this.thud(700, 0.06, 0.06, 'bandpass');
        break;
      case 'tatami':
        this.thud(500, 0.09, 0.035, 'lowpass');
        break;
      case 'paddy':
        this.thud(600, 0.11, 0.06, 'bandpass');
        break;
      case 'path':
      case 'dirt':
      case 'crop':
      case 'petalpath':
        this.thud(240, 0.07, 0.07);
        break;
      default:
        this.thud(160, 0.08, 0.055); // grass and puna: soft
    }
  }

  /** Typewriter tick, throttled to every third character. */
  blip() {
    this.blipCount++;
    if (this.blipCount % 3 !== 0) return;
    this.pluck(1150, 0, 0.025, 0.05);
  }

  /**
   * Speech babble: the typewriter tick shaped by the region's language and the
   * speaker's own pitch. Narrator lines keep the neutral blip.
   */
  speak(who: string | undefined) {
    if (!who) {
      this.blip();
      return;
    }
    const v = VOICES[this.region] ?? VOICES['andes'];
    if (!v) return;
    this.blipCount++;
    if (this.blipCount % v.gait !== 0) return;
    // The contour wanders inside the language's range and leans with its drift.
    this.babblePos += (Math.random() - 0.5 + v.drift * 0.3) * 1.6;
    this.babblePos = Math.max(-v.range, Math.min(v.range, this.babblePos));
    const personal = ((nameHash(who) % 7) - 3) * 0.9; // each speaker's home pitch
    const freq = v.base * Math.pow(2, (this.babblePos + personal) / 12);
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = v.wave;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * (Math.random() < 0.5 ? 0.94 : 1.05), t + 0.045);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(v.wave === 'sawtooth' ? 0.016 : 0.03, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** A journal page fills: two small bells. */
  chime() {
    this.pluck(523.25, 0, 0.11, 0.5);
    this.pluck(659.25, 0.09, 0.09, 0.6);
  }

  select() {
    this.pluck(660, 0, 0.05, 0.08);
  }
  confirm() {
    this.pluck(523.25, 0, 0.08, 0.12);
    this.pluck(784, 0.05, 0.07, 0.18);
  }
  pageFlip() {
    this.thud(1400, 0.1, 0.05, 'highpass');
  }
  door() {
    this.thud(300, 0.28, 0.09);
    this.thud(700, 0.14, 0.04, 'highpass');
  }
  dig() {
    this.thud(120, 0.12, 0.12);
    this.thud(800, 0.07, 0.04, 'highpass');
  }
  bark() {
    this.pluck(340, 0, 0.1, 0.07);
    this.pluck(300, 0.08, 0.09, 0.09);
  }
  /** A happy little petting sound. */
  pet() {
    this.pluck(587, 0, 0.09, 0.12);
    this.pluck(784, 0.07, 0.08, 0.16);
  }
  bump() {
    this.thud(180, 0.06, 0.06);
  }
  slosh() {
    this.thud(500, 0.12, 0.08, 'bandpass');
    this.thud(900, 0.06, 0.04, 'highpass');
  }
  shutter() {
    this.thud(2200, 0.04, 0.12, 'highpass');
    this.pluck(1200, 0.03, 0.05, 0.05);
  }
  /** A tiny secret-found fanfare. */
  jingle() {
    [220, 293.66, 392, 440, 523.25, 659.25].forEach((f, i) => this.pluck(f, i * 0.09, 0.1, 0.35));
  }
  hum() {
    // The llama's considered opinion.
    this.pluck(180, 0, 0.09, 0.35);
    this.pluck(170, 0.2, 0.07, 0.4);
  }

  /** Weaving notes: each color is a scale degree, so patterns become tunes. */
  weaveNote(i: number, good = true) {
    if (!good) {
      this.thud(140, 0.16, 0.1);
      return;
    }
    this.pluck(PENTA[i % PENTA.length] ?? 220, 0, 0.13, 0.45);
  }
  weaveDone() {
    [0, 2, 4, 6].forEach((n, k) => this.pluck(PENTA[n] ?? 220, k * 0.1, 0.12, 0.7));
  }

  /** A short wandering phrase, four to six notes, then silence again. */
  phrase() {
    if (!this.ctx) return;
    let idx = 2 + Math.floor(Math.random() * 3);
    const n = 4 + Math.floor(Math.random() * 3);
    let t = 0;
    for (let k = 0; k < n; k++) {
      this.pluck(PENTA[idx] ?? 220, t, 0.1, 0.9);
      idx = Math.max(0, Math.min(PENTA.length - 1, idx + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.25 ? 2 : 1)));
      t += 0.28 + Math.random() * 0.2;
    }
  }

  setScene(scene: Scene) {
    this.scene = scene;
    this.applyScene();
  }

  /** Change the band's passport; takes effect on the next scheduled beat. */
  setRegion(region: string) {
    if (region === this.region) return;
    this.region = region;
    this.style = MUSIC[region] ?? (MUSIC['andes'] as MusicStyle);
    this.babblePos = 0;
  }

  /** Sitting: the band steps back, the air steps forward. */
  setSitting(on: boolean) {
    if (this.sitting === on) return;
    this.sitting = on;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(on ? 0.35 : 0.85, this.ctx.currentTime, 1.2);
    }
    this.applyScene();
  }

  private applyScene() {
    if (!this.windGain || !this.ctx) return;
    let target = this.scene === 'interior' ? 0.03 : this.scene === 'road' ? 0.14 : 0.1;
    if (this.sitting && this.scene !== 'interior') target += 0.06;
    this.windGain.gain.setTargetAtTime(target, this.ctx.currentTime, 1.0);
  }

  // ---------------------------------------------------------------- music
  //
  // A quiet generative band that never stops and never demands attention:
  // a low bass heartbeat, a charango-like broken-chord shimmer, a soft bombo
  // on the village air, and a breathy melody that visits every few bars.
  // Arrangement thins by scene: interiors lose the drum, the road keeps only
  // bass and sky. Everything is scheduled a half-second ahead on the audio
  // clock, driven from the game loop.

  private get eighth(): number {
    return 60 / this.style.bpm / 2;
  }

  /** A scheduled note into the music bus. */
  private note(freq: number, when: number, vol: number, dur: number, type: OscillatorType = 'triangle') {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g).connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  /** The drum family: one parameterized hand, many instruments. */
  private drum(when: number, step: number, bar: number) {
    if (!this.ctx || !this.musicGain) return;
    const kind = this.style.drum;
    if (kind === 'none') return;
    const boom = (f0: number, f1: number, vol: number, dur: number) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0, when);
      osc.frequency.exponentialRampToValueAtTime(f1, when + dur * 0.8);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g).connect(this.musicGain);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    };
    const tick = (freq: number, vol: number, dur: number) => {
      if (!this.ctx || !this.musicGain) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer(this.ctx, dur + 0.05);
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = 1.4;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      src.connect(f).connect(g).connect(this.musicGain);
      src.start(when);
      src.stop(when + dur + 0.05);
    };
    switch (kind) {
      case 'bombo':
        if (step === 0 && bar % 2 === 0) boom(82, 50, 0.1, 0.22);
        break;
      case 'taiko':
        // Distant, patient: once per two bars, with a paper-dry rim answer.
        if (step === 0 && bar % 2 === 1) boom(95, 58, 0.08, 0.3);
        if (step === 6 && bar % 4 === 3) tick(2400, 0.02, 0.05);
        break;
      case 'janggu':
        // The two-tone lilt: low palm, high stick.
        if (step === 0) boom(110, 70, 0.07, 0.16);
        if (step === 3 || step === 6) tick(1800, 0.028, 0.06);
        break;
      case 'chenda':
        // Rolling 6/8 ticks, rain on a drumhead.
        if (step === 0) boom(130, 85, 0.06, 0.14);
        if (step === 2 || step === 4 || step === 7) tick(1500, 0.024, 0.05);
        break;
      case 'ngoma':
        if (step === 0) boom(75, 48, 0.09, 0.26);
        if (step === 5) boom(110, 80, 0.045, 0.14);
        break;
      case 'tamburello':
        // Jingle-whisper on the offbeats; the frame drum only on bar turns.
        if (step === 3 || step === 7) tick(3200, 0.018, 0.07);
        if (step === 0 && bar % 2 === 0) boom(120, 88, 0.05, 0.15);
        break;
      case 'marimba':
        // Not a drum at all: a low wooden octave doubling the bass.
        if (step === 0) {
          const root = this.style.chords[bar % this.style.chords.length]?.[0] ?? 196;
          this.note(root / 2, when, 0.05, 0.3, 'sine');
          this.note(root, when + 0.004, 0.035, 0.22, 'sine');
        }
        break;
      case 'creak':
        // The hull, once in a long while, remembering it is wood and steel.
        if (step === 0 && bar % 8 === 5) tick(320, 0.05, 0.5);
        break;
    }
  }

  private scheduleBeat(b: number, t: number) {
    const s = this.style;
    const bar = Math.floor(b / 8);
    const chord = s.chords[bar % s.chords.length] ?? s.chords[0] ?? [220];
    const step = b % 8;
    const scene = this.scene;
    const hush = this.sitting ? 0.5 : 1;

    // Bass roots, breathing with the bar.
    if (step === 0) this.note((chord[0] ?? 220) / 2, t, (scene === 'interior' ? 0.05 : 0.065) * hush, 1.5);
    if (step === 4 && scene !== 'road') this.note((chord[chord.length - 1] ?? 330) / 2, t, 0.04 * hush, 1.1);

    if (scene === 'outdoor' && !this.sitting) this.drum(t, step, bar);

    // Shimmer: broken chord tones in the region's voice.
    const density = (scene === 'interior' ? 0.4 : scene === 'road' ? 0.28 : 0.6) * s.density * hush;
    if (Math.random() < density) {
      const tone = chord[(1 + b) % chord.length] ?? 262;
      const oct = Math.random() < 0.3 ? 2 : 1;
      this.note(tone * oct, t + Math.random() * 0.02, 0.034, 0.5, s.shimmer);
    }
    if (scene === 'outdoor' && step % 2 === 1 && Math.random() < 0.3 * s.density) {
      this.note((chord[chord.length - 1] ?? 330) * 2, t, 0.016, 0.32, s.shimmer);
    }

    // A visiting melody at the turn of some bars, walking the region's scale.
    if (step === 0 && bar % 4 === 3 && Math.random() < s.melodyChance * hush) {
      let idx = Math.floor(s.scale.length / 2) + Math.floor(Math.random() * 2);
      let when = t + this.eighth;
      const n = 4 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) {
        this.note(s.scale[idx] ?? 330, when, 0.042, 0.85, s.lead);
        idx = Math.max(0, Math.min(s.scale.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)));
        when += this.eighth * (Math.random() < 0.3 ? 2 : 1);
      }
    }
  }

  /** Called from the game loop; keeps the band half a second ahead. */
  tick(dt: number) {
    void dt;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.nextBeatTime === 0 || this.nextBeatTime < now - 1) {
      this.nextBeatTime = now + 0.12;
    }
    const horizon = now + 0.55;
    while (this.nextBeatTime < horizon) {
      this.scheduleBeat(this.beat, this.nextBeatTime);
      // Swing: the first eighth of each pair lingers, the second hurries,
      // which is all a 6/8 lilt is.
      const firstOfPair = this.beat % 2 === 0;
      this.nextBeatTime += this.eighth * (firstOfPair ? 1 + this.style.swing * 0.5 : 1 - this.style.swing * 0.5);
      this.beat++;
    }
  }
}
