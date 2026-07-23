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

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private windGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  muted = false;
  private blipCount = 0;
  private scene: Scene = 'outdoor';
  /** Eighth-note counter and the scheduler's write head. */
  private beat = 0;
  private nextBeatTime = 0;

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

  /** Terrain-aware footstep. */
  step(groundKind: string) {
    switch (groundKind) {
      case 'plaza':
      case 'floorEarth':
        this.thud(900, 0.05, 0.05, 'bandpass');
        break;
      case 'bridge':
        this.thud(420, 0.09, 0.09, 'bandpass');
        break;
      case 'path':
      case 'dirt':
      case 'crop':
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
  private applyScene() {
    if (!this.windGain || !this.ctx) return;
    const target = this.scene === 'interior' ? 0.03 : this.scene === 'road' ? 0.14 : 0.1;
    this.windGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.8);
  }

  // ---------------------------------------------------------------- music
  //
  // A quiet generative band that never stops and never demands attention:
  // a low bass heartbeat, a charango-like broken-chord shimmer, a soft bombo
  // on the village air, and a breathy melody that visits every few bars.
  // Arrangement thins by scene: interiors lose the drum, the road keeps only
  // bass and sky. Everything is scheduled a half-second ahead on the audio
  // clock, driven from the game loop.

  private static EIGHTH = 60 / 76 / 2; // 76 bpm
  private static CHORDS: readonly (readonly number[])[] = [
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [261.63, 329.63, 392.0], // C
    [196.0, 246.94, 293.66], // G
  ];

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

  /** The soft bombo: felt more than heard. */
  private bombo(when: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(82, when);
    osc.frequency.exponentialRampToValueAtTime(50, when + 0.18);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    osc.connect(g).connect(this.musicGain);
    osc.start(when);
    osc.stop(when + 0.3);
  }

  private scheduleBeat(b: number, t: number) {
    const bar = Math.floor(b / 8);
    const chord = AudioBus.CHORDS[bar % 4] ?? AudioBus.CHORDS[0]!;
    const step = b % 8;
    const scene = this.scene;

    // Bass roots, breathing with the bar.
    if (step === 0) this.note((chord[0] ?? 220) / 2, t, scene === 'interior' ? 0.05 : 0.065, 1.5);
    if (step === 4 && scene !== 'road') this.note((chord[2] ?? 330) / 2, t, 0.04, 1.1);

    // The bombo, outdoors, every other bar.
    if (scene === 'outdoor' && step === 0 && bar % 2 === 0) this.bombo(t);

    // Charango shimmer: broken chord tones, denser in the village.
    const density = scene === 'interior' ? 0.4 : scene === 'road' ? 0.28 : 0.6;
    if (Math.random() < density) {
      const tone = chord[1 + (b % 2)] ?? 262;
      const oct = Math.random() < 0.3 ? 2 : 1;
      this.note(tone * oct, t + Math.random() * 0.02, 0.034, 0.5);
    }
    if (scene === 'outdoor' && step % 2 === 1 && Math.random() < 0.3) {
      this.note((chord[2] ?? 330) * 2, t, 0.018, 0.32);
    }

    // A visiting melody at the turn of some bars: soft, sine, unhurried.
    if (step === 0 && bar % 4 === 3 && Math.random() < 0.6) {
      let idx = 2 + Math.floor(Math.random() * 3);
      let when = t + AudioBus.EIGHTH;
      const n = 4 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) {
        this.note(PENTA[idx] ?? 330, when, 0.042, 0.85, 'sine');
        idx = Math.max(0, Math.min(PENTA.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)));
        when += AudioBus.EIGHTH * (Math.random() < 0.3 ? 2 : 1);
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
      this.beat++;
      this.nextBeatTime += AudioBus.EIGHTH;
    }
  }
}
