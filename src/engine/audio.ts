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
 * One motif note: a scale-degree index (degrees past the top of the scale
 * wrap up an octave) and a length in eighths. Motifs are hand-written; the
 * old random-walk melody sounded like a screensaver in every port.
 */
type MotifNote = [degree: number, eighths: number];

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
  shimmer: OscillatorType;
  /** Percussion recipe; 'none' keeps only the heartbeat bass. */
  drum: 'bombo' | 'marinera' | 'taiko' | 'janggu' | 'chenda' | 'ngoma' | 'tamburello' | 'marimba' | 'tabla' | 'creak' | 'none';
  /** 0 = straight eighths, up to ~0.32 = a 6/8 lilt. */
  swing: number;
  /** Shimmer density multiplier. */
  density: number;
  /** Who sings the motifs. */
  voice: 'quena' | 'guitar' | 'breath' | 'koto' | 'gayageum' | 'venu' | 'oud' | 'mandolin' | 'marimba' | 'bansuri' | 'hum';
  /** Two or three hand-written phrases; each visit states one twice. */
  motifs: MotifNote[][];
  /** Seconds between melody visits, [min, max]. Region-tuned. */
  phraseGap: [number, number];
  /** A sustained drone under everything (Delhi's harmonium, dusk zampogna). */
  drone?: { freqs: number[]; vol: number; type: OscillatorType; lp: number; duskOnly?: boolean };
  /** Slow pad chords riding the chord cycle (the ocean, the velación). */
  pad?: { vol: number; type: OscillatorType; lp: number };
  /** A far-off bell, roughly this many seconds between tolls. */
  bellEvery?: number;
  /** Shimmer rendered as a plucked string; detune in cents doubles a course. */
  pluckShim?: { bright: number; decay: number; detune?: number };
};

const N = {
  A2: 110, B2: 123.47, C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61,
  Fs3: 185, G3: 196, A3: 220, Bb3: 233.08, B3: 246.94, C4: 261.63, Cs4: 277.18,
  D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392,
  A4: 440, Bb4: 466.16, B4: 493.88, C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, G5: 783.99,
};

/** The band's passport. Keys are regions, assigned per map in main. */
const MUSIC: Record<string, MusicStyle> = {
  // The altiplano: quena leads, phrase-ends falling the way huaynos fall,
  // charango courses doubled a few cents apart, bombo keeping the walk.
  andes: {
    bpm: 76, scale: PENTA,
    chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.C4, N.E4, N.G4], [N.G3, N.B3, N.D4]],
    shimmer: 'triangle', drum: 'bombo', swing: 0, density: 1,
    voice: 'quena', phraseGap: [22, 34],
    pluckShim: { bright: 3400, decay: 0.5, detune: 10 },
    motifs: [
      [[4, 1], [5, 1], [4, 2], [3, 1], [2, 1], [0, 3]],
      [[6, 1], [5, 1], [6, 1], [5, 2], [4, 1], [3, 1], [2, 3]],
      // The huayno lilt: short-short-long, then down the hill.
      [[3, 1], [3, 1], [4, 2], [5, 1], [4, 1], [2, 2], [0, 3]],
    ],
  },
  // The Peruvian coast: marinera brightness, a fingerpicked guitar figure,
  // the ticks arguing 6/8 against 3/4 the way the dance does.
  coast: {
    bpm: 82, scale: [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4, N.C5],
    chords: [[N.A3, N.C4, N.E4], [N.G3, N.C4, N.E4], [N.F3, N.A3, N.D4], [N.E3, N.A3, N.C4]],
    shimmer: 'triangle', drum: 'marinera', swing: 0.18, density: 0.9,
    voice: 'guitar', phraseGap: [22, 34],
    pluckShim: { bright: 2600, decay: 0.9 },
    motifs: [
      [[4, 1], [5, 1], [6, 1], [5, 1], [4, 1], [2, 3]],
      [[2, 1], [3, 1], [4, 1], [3, 1], [1, 1], [0, 3]],
      [[5, 1], [4, 1], [5, 1], [6, 2], [4, 1], [3, 3]],
    ],
  },
  // Mid-ocean: open fifths breathing in eight-second swells, a ship's bell
  // once in a long while, the hull remembering it is wood. Sparse by design.
  ocean: {
    bpm: 60, scale: [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4],
    chords: [[N.A2 * 2, N.E4], [N.F3, N.C4], [N.G3, N.D4], [N.A2 * 2, N.E4]],
    shimmer: 'sine', drum: 'creak', swing: 0, density: 0.4,
    voice: 'breath', phraseGap: [28, 42],
    pad: { vol: 0.028, type: 'triangle', lp: 700 }, bellEvery: 90,
    motifs: [
      [[3, 4], [4, 4], [2, 6]],
      [[5, 4], [4, 3], [3, 5]],
      [[2, 3], [3, 3], [1, 6]],
    ],
  },
  // Seto Inland Sea: koto with the push-bend on held notes, one shakuhachi
  // breath per phrase, a distant taiko and its paired dry block.
  shionoura: {
    bpm: 68, scale: [N.D4, N.E4, N.G4, N.A4, N.B4, N.D5, N.E5],
    chords: [[N.D3 * 2, N.A3 * 2], [N.G3, N.D4], [N.A3, N.E4], [N.D3 * 2, N.A3 * 2]],
    shimmer: 'triangle', drum: 'taiko', swing: 0, density: 0.55,
    voice: 'koto', phraseGap: [24, 36],
    pluckShim: { bright: 3000, decay: 0.8 },
    motifs: [
      [[1, 1], [2, 2], [4, 1], [3, 3], [2, 1], [1, 3]],
      [[4, 1], [5, 2], [4, 1], [3, 1], [2, 4]],
      [[0, 2], [1, 1], [2, 3], [1, 1], [0, 4]],
    ],
  },
  // Busan market: gutgeori-leaning janggu, gayageum whose vibrato arrives
  // late and wide, graces rising into the note.
  busan: {
    bpm: 88, scale: [N.E4, N.G4, N.A4, N.B4, N.D5, N.E5],
    chords: [[N.E3, N.B3, N.E4], [N.D3 * 2, N.A3, N.D4], [N.G3, N.D4, N.G4], [N.A3, N.E4, N.A4]],
    shimmer: 'triangle', drum: 'janggu', swing: 0.22, density: 0.8,
    voice: 'gayageum', phraseGap: [24, 36],
    pluckShim: { bright: 2200, decay: 1.2 },
    motifs: [
      [[2, 1], [3, 1], [5, 2], [4, 1], [3, 1], [2, 3]],
      [[0, 1], [1, 1], [2, 2], [4, 2], [3, 4]],
      [[3, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 4]],
    ],
  },
  // Kerala backwater: venu over the monsoon, chenda rolls at the turns,
  // the idakka's talking boom, a vanchipattu call in 6/8.
  kerala: {
    bpm: 84, scale: [N.D4, N.E4, N.F4, N.A4, N.Bb4, N.C5, N.D5],
    chords: [[N.D3 * 2, N.F3 * 2, N.A3], [N.Bb3, N.D4, N.F4], [N.C4, N.F4, N.A4], [N.A3, N.D4, N.F4]],
    shimmer: 'triangle', drum: 'chenda', swing: 0.3, density: 0.75,
    voice: 'venu', phraseGap: [22, 34],
    motifs: [
      [[3, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 3]],
      [[0, 1], [1, 1], [2, 1], [3, 2], [2, 1], [0, 3]],
      // The boat-song call: paired shorts leaning on the stroke.
      [[3, 1], [3, 1], [4, 1], [3, 2], [1, 1], [0, 4]],
    ],
  },
  // Swahili coast: oud runs descending taqsim-wise so the Hijaz Eb and F#
  // finally get said out loud, qanun tremolo, ngoma crossing the 12/8.
  zanzibar: {
    bpm: 72, scale: [N.D4, N.Eb4, N.Fs4, N.G4, N.A4, N.Bb4, N.C5, N.D5],
    chords: [[N.D3 * 2, N.A3, N.D4], [N.G3, N.Bb3, N.D4], [N.A3, N.Cs4, N.E4], [N.D3 * 2, N.A3, N.D4]],
    shimmer: 'sawtooth', drum: 'ngoma', swing: 0.12, density: 0.6,
    voice: 'oud', phraseGap: [24, 36],
    pluckShim: { bright: 1500, decay: 1.6 },
    motifs: [
      [[7, 1], [6, 1], [5, 1], [4, 2], [2, 1], [1, 1], [0, 4]],
      [[4, 1], [5, 1], [4, 1], [2, 2], [1, 1], [0, 4]],
      [[1, 1], [2, 1], [1, 1], [0, 2], [4, 1], [2, 1], [1, 1], [0, 3]],
    ],
  },
  // Sicilian dusk: mandolin tremolo on anything sustained, tamburello kept
  // to a whisper, a dotted tarantella that walks instead of runs, and the
  // zampogna's low reed only once the light goes gold.
  sicily: {
    bpm: 92, scale: [N.C4, N.D4, N.E4, N.F4, N.G4, N.A4, N.C5],
    chords: [[N.C4, N.E4, N.G4], [N.F3, N.A3, N.C4], [N.G3, N.B3, N.D4], [N.A3, N.C4, N.E4]],
    shimmer: 'triangle', drum: 'tamburello', swing: 0.32, density: 0.7,
    voice: 'mandolin', phraseGap: [24, 36],
    pluckShim: { bright: 3200, decay: 0.4 },
    drone: { freqs: [N.C3, N.G3], vol: 0.02, type: 'sawtooth', lp: 850, duskOnly: true },
    motifs: [
      [[4, 3], [5, 1], [4, 1], [3, 1], [2, 2], [1, 1], [0, 3]],
      [[2, 3], [3, 1], [4, 3], [3, 1], [2, 1], [1, 1], [0, 2]],
      [[6, 3], [5, 1], [4, 2], [3, 3], [4, 1], [2, 4]],
    ],
  },
  // Oaxaca valley: the marimba steps up front and sings in parallel thirds
  // the way the son istmeño does, the pulse swaying 3/4 against 6/8.
  oaxaca: {
    bpm: 80, scale: [N.G3, N.A3, N.B3, N.C4, N.D4, N.E4, N.G4, N.A4],
    chords: [[N.G3, N.B3, N.D4], [N.C4, N.E4, N.G4], [N.D4, N.Fs4, N.A4], [N.E3 * 2, N.G4, N.B4]],
    shimmer: 'sine', drum: 'marimba', swing: 0.26, density: 0.85,
    voice: 'marimba', phraseGap: [22, 32],
    motifs: [
      [[4, 1], [5, 1], [6, 2], [5, 1], [4, 1], [3, 2]],
      [[6, 1], [7, 1], [6, 1], [5, 1], [4, 2], [3, 2]],
      [[3, 1], [4, 1], [5, 2], [6, 1], [5, 1], [4, 3]],
    ],
  },
  // Old Delhi at dusk. The harmonium holds D and A all evening; the tabla
  // speaks an actual keherwa under it; the bansuri sings Des, bright B and
  // C# on the way up, that soft C natural leaning home on the way down.
  // These three motifs are the most hand-tuned lines in the file.
  delhi: {
    bpm: 78, scale: [N.D4, N.E4, N.Fs4, N.G4, N.A4, N.B4, N.C5, N.Cs5, N.D5],
    chords: [[N.D3 * 2, N.A3, N.D4], [N.G3, N.B3, N.D4], [N.C4, N.E4, N.G4], [N.D3 * 2, N.A3, N.D4]],
    shimmer: 'sawtooth', drum: 'tabla', swing: 0.14, density: 0.8,
    voice: 'bansuri', phraseGap: [20, 32],
    drone: { freqs: [N.D3, N.A3], vol: 0.026, type: 'sawtooth', lp: 750 },
    motifs: [
      // Aroha: Sa Re ma Pa Ni Sa', the kite climbing while the light lasts.
      [[0, 1], [1, 1], [3, 2], [4, 2], [7, 1], [8, 4]],
      // Avaroha: Sa' ni Dha Pa ma Re Sa, the komal ni doing the leaning.
      [[8, 2], [6, 1], [5, 1], [4, 2], [3, 1], [1, 1], [0, 4]],
      // The pakad, mostly meend: Re ma Ga Re Sa, said like a remembered name.
      [[1, 1], [3, 2], [2, 2], [1, 2], [0, 4]],
    ],
  },
  // The camposanto at night: ten-second pad swells over the G-minor turns,
  // a hummed voice barely above the candle hiss, one far toll a minute.
  velacion: {
    bpm: 56, scale: [N.G3, N.Bb3, N.C4, N.D4, N.F4, N.G4],
    chords: [[N.G3, N.Bb3, N.D4], [N.Eb3 * 2, N.G3, N.Bb3], [N.F3, N.A3, N.C4], [N.G3, N.Bb3, N.D4]],
    shimmer: 'sine', drum: 'none', swing: 0, density: 0.3,
    voice: 'hum', phraseGap: [30, 45],
    pad: { vol: 0.03, type: 'triangle', lp: 600 }, bellEvery: 60,
    motifs: [
      [[3, 4], [2, 3], [1, 5]],
      [[1, 4], [2, 4], [0, 6]],
    ],
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
  delhi: { base: 615, range: 7, drift: 0.25, gait: 2, wave: 'triangle' },
};

/**
 * The KS buffer variants each melody voice asks for, as [decay, bright,
 * freqMul]. Buffers are keyed on (freq, bright, decay) alone (bends and
 * tremolo ride playbackRate), so prewarming these covers a voice completely.
 * Kept next to nothing on purpose: only the string voices render buffers;
 * flutes, marimba, and the hum build their sound from oscillators.
 */
const VOICE_KS: Partial<Record<MusicStyle['voice'], [decay: number, bright: number, freqMul: number][]>> = {
  guitar: [[1.3, 2500, 1]],
  koto: [[1.6, 3200, 1], [1.4, 3200, 1]],
  gayageum: [[1.8, 2100, 1], [0.3, 2100, 0.89]],
  oud: [[1.9, 1400, 1], [0.35, 3000, 2]],
  mandolin: [[0.35, 3400, 1], [0.5, 3400, 1]],
};

/** A stable small hash for per-speaker voice identity. */
function nameHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  return h;
}

/** Mix preferences, persisted separately from the save. */
type Mix = { music: number; sfx: number; ambience: number };
const MIX_KEY = 'soup.mix';
function loadMix(): Mix {
  try {
    const raw = localStorage.getItem(MIX_KEY);
    if (raw) return { music: 1, sfx: 1, ambience: 1, ...JSON.parse(raw) };
  } catch { /* defaults */ }
  return { music: 1, sfx: 1, ambience: 1 };
}

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private windGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  /** One 3s noise buffer shared by every burst sound. Allocating a fresh
   * buffer per footstep and per drum tick was a silent GC drip that showed
   * up as stutter; now the noise is minted once and sliced forever. */
  private sharedNoise: AudioBuffer | null = null;
  /** Creature calls and weather beds, separate from the wind loop. */
  private ambGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  readonly mix: Mix = loadMix();
  /** World state the ambience reads: how deep the night, is it raining. */
  private nightA = 0;
  /** Raw time of day 0..1, when main passes it; 0.18 is the game's dawn. */
  private dayT = 0.3;
  private raining = false;
  /** Next-call clocks for each creature, in ctx time. */
  private nextCall: Record<string, number> = {};
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
  /** Next melody visit, in ctx time. Replaces the old per-bar dice roll. */
  private nextPhraseAt = 0;
  /** Next distant bell (ship's bell mid-ocean, the toll at the velación). */
  private nextBellAt = 0;
  /** The running drone, if this region keeps one (Delhi's harmonium). */
  private droneNodes: { oscs: OscillatorNode[]; lfo: OscillatorNode; gain: GainNode; key: string } | null = null;
  /** Instrument odometer, read by the dev audition harness. Cheap to keep. */
  readonly stats = { phrases: 0, drums: 0, bells: 0, pads: 0, plucks: 0, droneOn: false };

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

      this.sharedNoise = this.noiseBuffer(ctx, 3);

      const musicGain = ctx.createGain();
      musicGain.gain.value = 0.85 * this.mix.music;
      musicGain.connect(master);

      // A small synthesized room off the music bus: a decaying-noise impulse
      // minted once at init, same trick as the wind bed. Without it every
      // pluck stops dead at the speaker; with it the band sits a few meters
      // back, which is where this game wants its band.
      const conv = ctx.createConvolver();
      conv.buffer = this.impulseBuffer(ctx, 1.8);
      const wet = ctx.createGain();
      wet.gain.value = 0.18;
      musicGain.connect(conv);
      conv.connect(wet);
      wet.connect(master);

      const sfxGain = ctx.createGain();
      sfxGain.gain.value = this.mix.sfx;
      sfxGain.connect(master);

      const ambGain = ctx.createGain();
      ambGain.gain.value = this.mix.ambience;
      ambGain.connect(master);
      this.ambGain = ambGain;

      // Rain: a denser, brighter cousin of the wind, silent until the monsoon.
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = this.noiseBuffer(ctx, 2.1);
      rainSrc.loop = true;
      const rainBp = ctx.createBiquadFilter();
      rainBp.type = 'bandpass';
      rainBp.frequency.value = 2400;
      rainBp.Q.value = 0.4;
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;
      rainSrc.connect(rainBp).connect(rainGain).connect(ambGain);
      rainSrc.start();
      this.rainGain = rainGain;

      this.ctx = ctx;
      this.master = master;
      // The audition harness reads counters and taps the bus. Dev only.
      if (import.meta.env.DEV) (globalThis as unknown as { __soupAudio: AudioBus }).__soupAudio = this;
      this.windGain = windGain;
      this.musicGain = musicGain;
      this.sfxGain = sfxGain;
      this.applyScene();
      // The starting region never goes through setRegion; warm it here.
      this.queueKsPrewarm();
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

  /** Stereo exponentially-decaying noise: a room for the convolver, no asset. */
  private impulseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        // Polynomial-times-exponential decay: dies smoothly to exactly zero
        // at the buffer edge, so the tail never clicks on loop-adjacent math.
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * Math.exp((-4 * i) / len);
      }
    }
    return buf;
  }

  /** Live mixer: 0..1 per channel, persisted immediately. */
  setMix(channel: keyof Mix, v: number) {
    this.mix[channel] = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem(MIX_KEY, JSON.stringify(this.mix));
    } catch { /* private browsing */ }
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (channel === 'music' && this.musicGain) this.musicGain.gain.setTargetAtTime(0.85 * this.mix.music, t, 0.05);
    if (channel === 'sfx' && this.sfxGain) this.sfxGain.gain.setTargetAtTime(this.mix.sfx, t, 0.05);
    if (channel === 'ambience') {
      this.applyScene();
      if (this.ambGain && this.ctx) this.ambGain.gain.setTargetAtTime(this.mix.ambience, this.ctx.currentTime, 0.05);
    }
  }

  /** The ambience reads the world: night depth, rain, and (optionally) the
   * raw clock, because nightK alone cannot tell dawn from noon and the
   * morning-flute rule needs to know the difference. */
  setWorldAmbience(nightK: number, raining: boolean, dayT?: number) {
    this.nightA = nightK;
    if (dayT !== undefined) this.dayT = dayT;
    if (raining !== this.raining) {
      this.raining = raining;
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.setTargetAtTime(raining ? 0.16 : 0, this.ctx.currentTime, 2.5);
      }
    }
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
    osc.connect(g).connect(this.sfxGain ?? this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** A short noise burst through a filter: the percussion family. */
  private thud(freq: number, dur: number, vol: number, type: BiquadFilterType = 'lowpass') {
    if (!this.ctx || !this.master || !this.sharedNoise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.sharedNoise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfxGain ?? this.master);
    src.start(t, Math.random() * 2.5, dur + 0.05);
  }

  /** Terrain-aware footstep: every coast underfoot sounds like itself, and no
   * two steps are the identical sample (a small pitch wander keeps feet human). */
  step(groundKind: string) {
    const j = 0.88 + Math.random() * 0.24;
        switch (groundKind) {
      case 'plaza':
      case 'floorEarth':
      case 'floorOndol':
      case 'lanepave':
        this.thud(900 * j, 0.05, 0.05, 'bandpass');
        break;
      case 'bridge':
      case 'pierdeck':
      case 'floorWood':
        this.thud(420 * j, 0.09, 0.09, 'bandpass');
        break;
      case 'deck':
      case 'floorSteel':
        // Steel: a ringing tap over a dull body.
        this.thud(300 * j, 0.07, 0.06, 'bandpass');
        this.pluck(1250, 0, 0.014, 0.05);
        break;
      case 'sand':
      case 'sandWet':
        this.thud(420 * j, 0.1, 0.045, 'lowpass');
        break;
      case 'basalto':
      case 'corallane':
      case 'laterite':
      case 'galistone':
      case 'chowkbrick':
      case 'terrace':
      case 'terracelime':
      case 'terracerose':
      case 'wornedge':
        this.thud(700 * j, 0.06, 0.06, 'bandpass');
        break;
      case 'tatami':
        this.thud(500 * j, 0.09, 0.035, 'lowpass');
        break;
      case 'paddy':
        this.thud(600 * j, 0.11, 0.06, 'bandpass');
        break;
      case 'path':
      case 'dirt':
      case 'crop':
      case 'petalpath':
        this.thud(240 * j, 0.07, 0.07);
        break;
      default:
        this.thud(160 * j, 0.08, 0.055); // grass and puna: soft
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
    osc.connect(g).connect(this.sfxGain ?? this.master);
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
    // One soft tonic under the latch: crossing a threshold resolves.
    if (this.ctx) this.ks(this.style.scale[0] ?? 220, this.ctx.currentTime + 0.12, { vol: 0.045, decay: 1.1, bright: 2000 });
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

  /** Weaving notes: each color is a scale degree, so patterns become tunes.
   * Uses the current region's scale: weaving in Delhi weaves in Des. */
  weaveNote(i: number, good = true) {
    if (!good) {
      this.thud(140, 0.16, 0.1);
      return;
    }
    const sc = this.style.scale;
    this.pluck(sc[i % sc.length] ?? 220, 0, 0.13, 0.45);
  }
  weaveDone() {
    [0, 2, 4, 6].forEach((n, k) => this.pluck(PENTA[n] ?? 220, k * 0.1, 0.12, 0.7));
  }

  /** An on-demand melody visit: the region's own motif, right now. */
  phrase() {
    if (!this.ctx) return;
    this.playMotif(this.ctx.currentTime + 0.05);
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
    // New coast, new clocks: an early hello phrase, a bell not yet due.
    // The drone swap happens in updateDrone on the next tick.
    this.nextPhraseAt = 0;
    this.nextBellAt = 0;
    this.queueKsPrewarm();
  }

  /** Buffers tick() renders a budgeted few at a time, as [freq, bright, decay]. */
  private ksWarmQueue: [number, number, number][] = [];

  /**
   * Queue the new region's KS buffers so they render during the arrival
   * transition, a couple per frame, instead of all at once when the first
   * phrase lands (a one-frame burst of 4-9 buffer renders otherwise: cheap
   * on a fast machine, a visibly dropped frame on a slow or busy one).
   */
  private queueKsPrewarm() {
    const s = this.style;
    const degs = new Set<number>();
    for (const m of s.motifs) for (const [deg] of m) degs.add(deg);
    const q: [number, number, number][] = [];
    for (const deg of degs) {
      const f = this.degFreq(deg);
      for (const [decay, bright, mul] of VOICE_KS[s.voice] ?? []) q.push([f * mul, bright, decay]);
      // After dark every region hands the motif to the same quiet string.
      if (s.voice !== 'hum') q.push([f, 1900, 1.5]);
    }
    q.push([s.scale[0] ?? 220, 2000, 1.1]); // the door's threshold note
    this.ksWarmQueue = q;
  }

  /** Dialogue ducking: the band lowers its voice while someone talks.
   * Guarded: scheduling a gain ramp EVERY frame floods the automation
   * timeline and stutters the whole page; only edges may schedule. */
  private ducked = false;
  setDucked(on: boolean) {
    if (on === this.ducked) return;
    this.ducked = on;
    if (!this.musicGain || !this.ctx) return;
    const target = (on ? 0.45 : 0.85) * this.mix.music * (this.sitting ? 0.4 : 1);
    this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, on ? 0.2 : 0.5);
  }

  /** A soft reversed-feeling cancel: the confirm's two notes, walked back. */
  back() {
    this.pluck(784, 0, 0.05, 0.1);
    this.pluck(523.25, 0.05, 0.06, 0.14);
  }

  /** The gentle "that doesn't go there": never harsh, never silent. */
  denied() {
    this.thud(220, 0.09, 0.06);
    this.pluck(180, 0.02, 0.05, 0.12);
  }

  /**
   * A celebration stinger over ducked ambience: four rising notes from the
   * current region's own scale, so every coast celebrates in its own key.
   */
  stinger() {
    const sc = this.style.scale;
    const picks = [0, 2, Math.min(4, sc.length - 1), sc.length - 1];
    picks.forEach((idx, k) => this.pluck((sc[idx] ?? 440) * (k === 3 ? 2 : 1), k * 0.13, 0.12, 0.9));
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
    this.windGain.gain.setTargetAtTime(target * this.mix.ambience, this.ctx.currentTime, 1.0);
  }

  // ----------------------------------------------------------- instruments
  //
  // Every voice below is one of a few physical ideas dressed by region:
  // a Karplus-Strong string (charango, koto, oud, gayageum, mandolin),
  // a breathy flute (quena, bansuri, venu, shakuhachi), an FM bell, and a
  // slow detuned pad (harmonium, zampogna, the ocean). Parameters, not
  // presets: the same twenty lines of string are every string in the game.

  /**
   * Karplus-Strong, rendered to a buffer rather than built from a DelayNode
   * loop: WebAudio clamps any feedback cycle to one render quantum (~2.7ms),
   * which caps a live KS loop at ~375Hz and flattens every melody note above
   * it. Synthesizing the string in JS costs microseconds, caches perfectly
   * (scales are fixed per region), and leaves pitch bends to playbackRate.
   */
  private ksCache = new Map<string, AudioBuffer>();

  private ksBuffer(freq: number, bright: number, decay: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const key = `${Math.round(freq)}:${bright}:${decay}`;
    const hit = this.ksCache.get(key);
    if (hit) {
      // Refresh recency (a Map iterates in insertion order), so eviction
      // below always lands on buffers no region has played in a while.
      this.ksCache.delete(key);
      this.ksCache.set(key, hit);
      return hit;
    }
    // The cache only ever holds each region's scale at a few timbres, but a
    // long session visits many regions; keep it from growing without bound.
    // Evict the stalest few rather than clearing: a full clear() made the
    // next phrase re-render every buffer it touched in one frame, a random
    // multi-millisecond hitch that measured as the game's residual stutter.
    if (this.ksCache.size >= 96) {
      let drop = 8;
      for (const k of this.ksCache.keys()) {
        this.ksCache.delete(k);
        if (--drop === 0) break;
      }
    }
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * Math.min(2.5, decay + 0.3));
    const buf = this.ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    // One-pole lowpass in the loop is the pick's brightness; the per-pass
    // gain is how long the wood lets the string keep talking (T60 = decay).
    const c = Math.exp((-2 * Math.PI * bright) / sr);
    const g = Math.min(0.995, Math.pow(10, -3 / (freq * decay)));
    let lp = 0;
    let idx = 0;
    for (let n = 0; n < len; n++) {
      const cur = ring[idx] ?? 0;
      out[n] = cur;
      lp = c * lp + (1 - c) * cur;
      ring[idx] = lp * g;
      idx = idx + 1 === period ? 0 : idx + 1;
    }
    this.ksCache.set(key, buf);
    return buf;
  }

  private ks(
    freq: number,
    when: number,
    o: {
      vol?: number;
      /** Roughly a T60, seconds. */
      decay?: number;
      /** Loop lowpass cutoff: bright charango vs dark oud. */
      bright?: number;
      /** Start this ratio off-pitch and slide home (the oud's onset). */
      slideFrom?: number;
      /** Bend the sounding pitch to this ratio mid-note (the koto's push). */
      bendTo?: number;
      bendAt?: number;
      /** Delayed wide vibrato, the gayageum's nonghyeon. Depth in cents. */
      vibDelay?: number;
      vibRate?: number;
      vibDepth?: number;
    } = {},
  ) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const decay = o.decay ?? 1.2;
    const buf = this.ksBuffer(freq, o.bright ?? 2600, decay);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (o.slideFrom) {
      src.playbackRate.setValueAtTime(o.slideFrom, when);
      src.playbackRate.linearRampToValueAtTime(1, when + 0.09);
    }
    if (o.bendTo) {
      const at = when + (o.bendAt ?? 0.25);
      src.playbackRate.setValueAtTime(1, at);
      src.playbackRate.linearRampToValueAtTime(o.bendTo, at + 0.18);
    }
    if (o.vibDepth) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = o.vibRate ?? 4.5;
      const lg = ctx.createGain();
      lg.gain.setValueAtTime(0, when);
      lg.gain.setValueAtTime(0, when + (o.vibDelay ?? 0.2));
      lg.gain.linearRampToValueAtTime(Math.pow(2, o.vibDepth / 1200) - 1, when + (o.vibDelay ?? 0.2) + 0.3);
      lfo.connect(lg).connect(src.playbackRate);
      lfo.start(when);
      lfo.stop(when + decay + 0.4);
    }
    const g = ctx.createGain();
    g.gain.value = o.vol ?? 0.08;
    src.connect(g).connect(this.musicGain);
    src.start(when);
    this.stats.plucks++;
  }

  /**
   * One continuous breathy flute over a whole phrase: a sine and a narrow
   * band of noise riding the same frequency line, glides between the notes.
   * Scoop direction and vibrato speed are what tell quena from shakuhachi.
   */
  private flute(
    notes: { f: number; d: number }[],
    when: number,
    o: { vol?: number; vibRate?: number; vibDepth?: number; scoop?: number; glide?: number; breath?: number } = {},
  ) {
    if (!this.ctx || !this.musicGain || !this.sharedNoise || notes.length === 0) return;
    const ctx = this.ctx;
    const vol = o.vol ?? 0.08;
    const glide = o.glide ?? 0.07;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const noise = ctx.createBufferSource();
    noise.buffer = this.sharedNoise;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 9;
    const ng = ctx.createGain();
    ng.gain.value = vol * (o.breath ?? 0.45);
    const g = ctx.createGain();
    // The first note scoops in from below (quena, bansuri) or above.
    const first = notes[0]!;
    const scoopFrom = first.f * (o.scoop ?? 0.94);
    osc.frequency.setValueAtTime(scoopFrom, when);
    osc.frequency.exponentialRampToValueAtTime(first.f, when + 0.1);
    bp.frequency.setValueAtTime(scoopFrom * 2, when);
    bp.frequency.exponentialRampToValueAtTime(first.f * 2, when + 0.1);
    let t = when + first.d;
    let prevF = first.f;
    for (const n of notes.slice(1)) {
      // Anchor before each ramp: without the setValueAtTime the ramp starts
      // at the end of the previous one and the whole phrase turns to soup.
      osc.frequency.setValueAtTime(prevF, t);
      osc.frequency.exponentialRampToValueAtTime(n.f, t + glide);
      bp.frequency.setValueAtTime(prevF * 2, t);
      bp.frequency.exponentialRampToValueAtTime(n.f * 2, t + glide);
      // A small breath dip at each note change keeps it a wind instrument.
      g.gain.setValueAtTime(vol, t - 0.02);
      g.gain.linearRampToValueAtTime(vol * 0.7, t + 0.02);
      g.gain.linearRampToValueAtTime(vol, t + glide + 0.05);
      prevF = n.f;
      t += n.d;
    }
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.13);
    g.gain.setValueAtTime(vol, t - 0.05);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.3);
    // Vibrato arrives late and shallow; a synth flute with instant vibrato
    // reads as an organ.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = o.vibRate ?? 5;
    const lg = ctx.createGain();
    const meanF = first.f;
    lg.gain.setValueAtTime(0, when);
    lg.gain.linearRampToValueAtTime(meanF * ((o.vibDepth ?? 12) / 1200) * Math.LN2, when + 0.7);
    lfo.connect(lg);
    lg.connect(osc.frequency);
    osc.connect(g);
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(g);
    g.connect(this.musicGain);
    osc.start(when);
    noise.start(when, Math.random() * 2);
    lfo.start(when);
    const end = t + 0.4;
    osc.stop(end);
    noise.stop(end);
    lfo.stop(end);
  }

  /**
   * A slow chord swell: detuned pairs through a lazily wobbling lowpass.
   * The ocean and the velación are mostly made of this.
   */
  private padChord(
    freqs: number[],
    when: number,
    dur: number,
    o: { vol?: number; type?: OscillatorType; lp?: number; attack?: number; release?: number } = {},
  ) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const vol = o.vol ?? 0.024;
    const attack = o.attack ?? Math.min(5, dur * 0.4);
    const release = o.release ?? Math.min(6, dur * 0.5);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = o.lp ?? 900;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = ctx.createGain();
    lg.gain.value = (o.lp ?? 900) * 0.25;
    lfo.connect(lg).connect(lp.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + attack);
    g.gain.setValueAtTime(vol, when + dur);
    g.gain.linearRampToValueAtTime(0.0001, when + dur + release);
    lp.connect(g);
    g.connect(this.musicGain);
    const end = when + dur + release + 0.1;
    for (const f of freqs) {
      for (const cents of [-5, 5]) {
        const osc = ctx.createOscillator();
        osc.type = o.type ?? 'triangle';
        osc.frequency.value = f * Math.pow(2, cents / 1200);
        osc.connect(lp);
        osc.start(when);
        osc.stop(end);
      }
    }
    lfo.start(when);
    lfo.stop(end);
    this.stats.pads++;
  }

  /** One distant FM bell: inharmonic partial, long die-away. */
  private bell(freq: number, when: number, vol = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const car = ctx.createOscillator();
    car.type = 'sine';
    car.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.type = 'sine';
    // 2.76: the classic inharmonic ratio that says metal, not organ.
    mod.frequency.value = freq * 2.76;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(freq * 2.2, when);
    mg.gain.exponentialRampToValueAtTime(freq * 0.02, when + 1.6);
    mod.connect(mg).connect(car.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 3.8);
    car.connect(g).connect(this.musicGain);
    car.start(when);
    mod.start(when);
    car.stop(when + 4);
    mod.stop(when + 4);
    this.stats.bells++;
  }

  /** Start the region's sustained drone (harmonium, zampogna). Idempotent. */
  private startDrone(key: string, freqs: number[], vol: number, type: OscillatorType, lp: number) {
    if (!this.ctx || !this.musicGain) return;
    if (this.droneNodes?.key === key) return;
    this.stopDrone();
    const ctx = this.ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lp;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lg = ctx.createGain();
    lg.gain.value = lp * 0.18;
    lfo.connect(lg).connect(filter.frequency);
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    // setTarget rather than a ramp: later gain steering (dusk thickening,
    // interiors) composes with it instead of fighting a pending ramp.
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.setTargetAtTime(vol, t, 3);
    this.droneVol = vol;
    filter.connect(gain);
    gain.connect(this.musicGain);
    const oscs: OscillatorNode[] = [];
    for (const f of freqs) {
      for (const cents of [-4, 4]) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = f * Math.pow(2, cents / 1200);
        osc.connect(filter);
        osc.start(t);
        oscs.push(osc);
      }
    }
    lfo.start(t);
    this.droneNodes = { oscs, lfo, gain, key };
    this.stats.droneOn = true;
  }

  /** Let the drone go, on a breath-length release. */
  private stopDrone() {
    if (!this.droneNodes || !this.ctx) return;
    const { oscs, lfo, gain } = this.droneNodes;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0.0001, t, 2.2);
    const end = t + 8;
    for (const o of oscs) o.stop(end);
    lfo.stop(end);
    this.droneNodes = null;
    this.droneVol = 0;
    this.stats.droneOn = false;
  }

  /** Last steered drone gain, so tick() only schedules automation on edges. */
  private droneVol = 0;

  /** Keeps the region's drone matched to region, dusk, and scene. Guarded:
   * automation is only scheduled when the target actually moves. */
  private updateDrone() {
    if (!this.ctx) return;
    const d = this.style.drone;
    const want = !!d && (!d.duskOnly || this.nightA > 0.3);
    if (!want || !d) {
      if (this.droneNodes) this.stopDrone();
      return;
    }
    this.startDrone(this.region + (d.duskOnly ? ':dusk' : ''), d.freqs, d.vol, d.type, d.lp);
    // Dusk thickens the reed; interiors pull it back into the next room.
    const dusk = this.nightA > 0.3 && this.nightA <= 0.75 ? 1.5 : 1;
    const target = d.vol * dusk * (this.scene === 'interior' ? 0.75 : 1);
    if (this.droneNodes && Math.abs(target - this.droneVol) > 1e-4) {
      this.droneVol = target;
      this.droneNodes.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 1.5);
    }
  }

  // ------------------------------------------------------------ composition

  /** Scale degree to Hz; degrees past the top of the scale wrap up an octave. */
  private degFreq(deg: number): number {
    const sc = this.style.scale;
    const n = sc.length;
    if (n === 0) return 220;
    const oct = Math.floor(deg / n);
    return (sc[((deg % n) + n) % n] ?? 220) * Math.pow(2, oct);
  }

  /** A marimba bar: fundamental, the bright fourth partial, a mallet click. */
  private marimbaNote(f: number, when: number, vol: number) {
    if (!this.ctx || !this.musicGain || !this.sharedNoise) return;
    this.note(f, when, vol, 0.55, 'sine');
    this.note(f * 4, when, vol * 0.22, 0.1, 'sine');
    const src = this.ctx.createBufferSource();
    src.buffer = this.sharedNoise;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol * 0.5, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
    src.connect(bp).connect(g).connect(this.musicGain);
    src.start(when, Math.random() * 2.5, 0.05);
  }

  /** A hummed voice: a sine behind two vowel formants, barely there. */
  private humVoice(notes: { f: number; d: number }[], when: number, vol: number) {
    if (!this.ctx || !this.musicGain || notes.length === 0) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const first = notes[0]!;
    osc.frequency.setValueAtTime(first.f, when);
    let t = when + first.d;
    for (const n of notes.slice(1)) {
      // Voices slide; nothing about a hum is quantized.
      osc.frequency.exponentialRampToValueAtTime(n.f, t + 0.3);
      t += n.d;
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + 1.2);
    g.gain.setValueAtTime(vol, t - 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.8);
    // "Oo" formants; the sawtooth-ness of a throat, faked with two bands.
    for (const [ff, fg] of [[320, 1], [800, 0.3]] as const) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = ff;
      bp.Q.value = 4;
      const bg = ctx.createGain();
      bg.gain.value = fg;
      osc.connect(bp).connect(bg).connect(g);
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.2;
    const lg = ctx.createGain();
    lg.gain.setValueAtTime(0, when);
    lg.gain.linearRampToValueAtTime(first.f * 0.007, when + 1.5);
    lfo.connect(lg);
    lg.connect(osc.frequency);
    g.connect(this.musicGain);
    osc.start(when);
    lfo.start(when);
    osc.stop(t + 1);
    lfo.stop(t + 1);
  }

  /**
   * One melody visit: pick a motif, state it twice, hand it to the region's
   * instrument. Time of day gets a vote: dusk slows the singer, night hands
   * the tune to a lone string, Kerala's monsoon drops the flute an octave.
   */
  private playMotif(when: number) {
    const s = this.style;
    const m = s.motifs[Math.floor(Math.random() * s.motifs.length)];
    if (!m || m.length === 0) return;
    const e8 = this.eighth;
    const dusk = this.nightA > 0.3 && this.nightA <= 0.7;
    const night = this.nightA > 0.7;
    const stretch = dusk ? 1.3 : 1;
    const interior = this.scene === 'interior';
    const octMul = this.raining && this.region === 'kerala' ? 0.5 : 1;
    const notes: { f: number; d: number; deg: number }[] = [];
    for (let rep = 0; rep < 2; rep++) {
      for (let i = 0; i < m.length; i++) {
        const [deg, len] = m[i]!;
        const last = rep === 1 && i === m.length - 1;
        notes.push({ f: this.degFreq(deg) * octMul, d: len * e8 * stretch * (last ? 1.6 : 1), deg });
      }
    }
    const vol = (interior ? 0.065 : 0.08) * (this.sitting ? 0.7 : 1);
    this.stats.phrases++;
    if (night && s.voice !== 'hum') {
      // After dark every region owns the same instrument: one quiet string.
      let t = when;
      for (const n of notes) {
        this.ks(n.f, t, { vol: 0.055, decay: 1.5, bright: 1900 });
        t += n.d;
      }
      return;
    }
    // Early morning belongs to the flutes, whatever the region plays at noon.
    const morning = this.nightA < 0.12 && this.dayT < 0.15;
    const voice = morning && ['guitar', 'koto', 'gayageum', 'oud', 'mandolin', 'marimba'].includes(s.voice)
      ? 'quena'
      : s.voice;
    switch (voice) {
      case 'quena':
        this.flute(notes, when, { vol, vibRate: 5.5, vibDepth: 14, scoop: 0.94, breath: 0.5 });
        break;
      case 'venu':
        this.flute(notes, when, { vol, vibRate: 6, vibDepth: 20, scoop: 0.93, glide: 0.09, breath: 0.45 });
        break;
      case 'bansuri':
        // The wide glide is the meend; without it this is just a whistle.
        this.flute(notes, when, { vol, vibRate: 4.6, vibDepth: 18, scoop: 0.92, glide: 0.16, breath: 0.4 });
        break;
      case 'breath':
        this.flute(notes, when, { vol: vol * 0.8, vibRate: 3.5, vibDepth: 8, scoop: 0.97, glide: 0.2, breath: 0.6 });
        break;
      case 'guitar': {
        let t = when;
        for (const n of notes) {
          this.ks(n.f, t, { vol, decay: 1.3, bright: 2500 });
          t += n.d;
        }
        break;
      }
      case 'koto': {
        let t = when;
        let longest = notes[0]!;
        for (const n of notes) {
          // Held notes get the push-bend: press behind the bridge, let go.
          this.ks(n.f, t, n.d >= e8 * 2.5
            ? { vol, decay: 1.6, bright: 3200, bendTo: 1.045, bendAt: Math.min(0.35, n.d * 0.4) }
            : { vol, decay: 1.4, bright: 3200 });
          if (n.d > longest.d) longest = n;
          t += n.d;
        }
        // One shakuhachi breath per phrase, arriving with the reprise.
        const mid = when + notes.slice(0, m.length).reduce((a, n) => a + n.d, 0);
        this.flute([{ f: longest.f, d: Math.max(1.8, e8 * 4) }], mid, {
          vol: vol * 0.6, vibRate: 4, vibDepth: 10, scoop: 1.08, glide: 0.1, breath: 0.7,
        });
        break;
      }
      case 'gayageum': {
        let t = when;
        let prevF = 0;
        for (const n of notes) {
          // Rising entries take a grace note from just underneath.
          if (n.f > prevF && prevF > 0) this.ks(n.f * 0.89, t - 0.055, { vol: vol * 0.35, decay: 0.3, bright: 2100 });
          this.ks(n.f, t, { vol, decay: 1.8, bright: 2100, vibDelay: 0.3, vibRate: 4.2, vibDepth: 35 });
          prevF = n.f;
          t += n.d;
        }
        break;
      }
      case 'oud': {
        let t = when;
        for (const n of notes) {
          this.ks(n.f, t, { vol, decay: 1.9, bright: 1400, slideFrom: 0.96 });
          // Sustained notes hand up to the qanun's tremolo, an octave above.
          if (n.d >= e8 * 2) {
            for (let tt = t + 0.12; tt < t + n.d - 0.08; tt += 1 / 9) {
              this.ks(n.f * 2, tt, { vol: vol * 0.28, decay: 0.35, bright: 3000 });
            }
          }
          t += n.d;
        }
        break;
      }
      case 'mandolin': {
        let t = when;
        for (const n of notes) {
          if (n.d >= e8 * 1.6) {
            // Tremolo: the mandolin's way of holding a note it cannot hold.
            for (let tt = t; tt < t + n.d - 0.05; tt += 1 / 11) {
              this.ks(n.f, tt, { vol: vol * 0.5, decay: 0.35, bright: 3400 });
            }
          } else {
            this.ks(n.f, t, { vol, decay: 0.5, bright: 3400 });
          }
          t += n.d;
        }
        break;
      }
      case 'marimba': {
        let t = when;
        for (const n of notes) {
          this.marimbaNote(n.f, t, vol);
          // The second player, a diatonic third below: son istmeño in two mallets.
          this.marimbaNote(this.degFreq(n.deg - 2) * octMul, t + 0.008, vol * 0.65);
          t += n.d;
        }
        break;
      }
      case 'hum':
        this.humVoice(notes, when, 0.042);
        break;
    }
  }

  /** Grid-locked region gestures: strums and picking, not melody. */
  private gesture(t: number, step: number, bar: number, chord: number[]) {
    const r = this.region;
    if (r === 'andes' && step === 0 && bar % 2 === 1) {
      // Charango rasgueado on the bar turn: doubled courses, ten cents apart.
      const tones = [...chord, (chord[0] ?? 220) * 2];
      tones.forEach((f, i) => {
        const at = t + i * 0.026;
        this.ks(f, at, { vol: 0.022, decay: 0.35, bright: 3300 });
        this.ks(f * Math.pow(2, 9 / 1200), at + 0.011, { vol: 0.016, decay: 0.35, bright: 3300 });
      });
    }
    if (r === 'coast' && step % 2 === 0 && Math.random() < 0.75) {
      // Fingerpicked figure cycling the chord, the marinera guitar's habit.
      const f = chord[(step / 2 + bar) % chord.length] ?? 220;
      this.ks(f, t, { vol: 0.02, decay: 0.8, bright: 2500 });
    }
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
    const boom = (f0: number, f1: number, vol: number, dur: number, at = when) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0, at);
      osc.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.8);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(g).connect(this.musicGain);
      osc.start(at);
      osc.stop(at + dur + 0.05);
      this.stats.drums++;
    };
    const tick = (freq: number, vol: number, dur: number, at = when) => {
      if (!this.ctx || !this.musicGain || !this.sharedNoise) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.sharedNoise;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = 1.4;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      src.connect(f).connect(g).connect(this.musicGain);
      src.start(at, Math.random() * 2.5, dur + 0.05);
      this.stats.drums++;
    };
    // The idakka's talking pitch: up, then down, one syllable of drum.
    const talk = (f0: number, fPeak: number, vol: number, dur: number) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f0, when);
      osc.frequency.exponentialRampToValueAtTime(fPeak, when + dur * 0.35);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.9, when + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g).connect(this.musicGain);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      this.stats.drums++;
    };
    const e8 = this.eighth;
    switch (kind) {
      case 'bombo':
        // The huayno lilt: the downbeat, then short-short into the next one.
        if (step === 0 && bar % 2 === 0) boom(82, 50, 0.1, 0.22);
        if (step === 5) boom(85, 55, 0.03, 0.12);
        if (step === 6) boom(82, 52, 0.045, 0.16);
        break;
      case 'marinera':
        // The dance's argument: bars alternate three groups of two against
        // two groups of three, which is the whole marinera in one sentence.
        if (step === 0) boom(95, 60, 0.055, 0.16);
        if (bar % 2 === 0 ? step === 3 || step === 6 : step === 4) tick(1700, 0.025, 0.05);
        if (bar % 2 === 1 && step === 4) boom(120, 90, 0.03, 0.1);
        break;
      case 'taiko':
        // Distant, patient; the dry paired block answers across the water.
        if (step === 0 && bar % 2 === 1) boom(95, 58, 0.08, 0.3);
        if (step === 6 && bar % 4 === 3) {
          tick(2400, 0.022, 0.05);
          tick(2600, 0.016, 0.04, when + 0.09);
        }
        break;
      case 'janggu':
        // Gutgeori-leaning 12/8: dung, then the stick's gi-dak pair, kung
        // underneath, dak leaning into the next bar. Swing does the rest.
        if (step === 0) boom(110, 70, 0.07, 0.16);
        if (step === 2) tick(1800, 0.02, 0.05);
        if (step === 3) boom(120, 82, 0.04, 0.12);
        if (step === 5) tick(1800, 0.026, 0.06);
        if (step === 7) tick(2100, 0.032, 0.06);
        break;
      case 'chenda': {
        // Rolling 6/8 ticks, rain on a drumhead; softer under actual rain.
        const rv = this.raining ? 0.5 : 1;
        if (step === 0) boom(130, 85, 0.06, 0.14);
        if (step === 2 || step === 4 || step === 7) tick(1500, 0.024 * rv, 0.05);
        // The turn of the cycle gets a short accelerating roll,
        if (step === 6 && bar % 4 === 3) {
          for (let i = 0, at = when; i < 5; i++, at += e8 * (0.5 - i * 0.06)) tick(1600, (0.012 + i * 0.004) * rv, 0.04, at);
        }
        // and the idakka says one syllable, up then down.
        if (step === 0 && bar % 4 === 2) talk(90, 180, 0.05, 0.5);
        break;
      }
      case 'ngoma':
        // Low hands keeping two, small drum crossing in three: 12/8 without
        // either side winning.
        if (step === 0) boom(75, 48, 0.09, 0.26);
        if (step === 4 && bar % 2 === 0) boom(80, 52, 0.05, 0.18);
        if (step === 5) boom(110, 80, 0.045, 0.14);
        if (bar % 2 === 1 && (step === 2 || step === 5)) tick(900, 0.02, 0.06);
        break;
      case 'tamburello':
        // A gentle 6/8: jingles filled in but whispering, the frame drum
        // only marking the turns. A tarantella at walking pace.
        if (step === 0 || step === 2 || step === 3 || step === 5) tick(3200, step === 0 ? 0.02 : 0.013, 0.06);
        if (step === 7) tick(3400, 0.018, 0.07);
        if (step === 0 && bar % 2 === 0) boom(120, 88, 0.05, 0.15);
        break;
      case 'marimba': {
        // The low wooden octave, swaying sesquialtera: even bars walk in
        // three, odd bars in two, the son's 3/4-against-6/8.
        const root = this.style.chords[bar % this.style.chords.length]?.[0] ?? 196;
        const hits = bar % 2 === 0 ? [0, 3, 5] : [0, 4];
        if (hits.includes(step)) {
          this.note(root / 2, when, step === 0 ? 0.05 : 0.032, 0.3, 'sine');
          if (step === 0) this.note(root, when + 0.004, 0.035, 0.22, 'sine');
          this.stats.drums++;
        }
        break;
      }
      case 'tabla':
        // An actual keherwa: dha ge na ti / na ka dhin na, the baya bending
        // under dha and dhin the way a palm heel does.
        if (step === 0) {
          boom(96, 60, 0.06, 0.2);
          tick(2600, 0.018, 0.04);
        }
        if (step === 1) boom(88, 70, 0.028, 0.1);
        if (step === 2) tick(2600, 0.016, 0.04);
        if (step === 3) tick(3000, 0.013, 0.035);
        if (step === 4) tick(2600, 0.016, 0.04);
        if (step === 5) tick(1900, 0.011, 0.035);
        if (step === 6) {
          boom(72, 108, 0.05, 0.18);
          tick(2600, 0.016, 0.04);
        }
        if (step === 7) tick(2600, 0.014, 0.04);
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
    // The arrangement breathes on a 16-bar cycle (roughly 45-60s by tempo):
    // bass and drone alone, then the pulse joins, then it all recedes. About
    // a third of any window is just drone and wind, on purpose.
    const phase = bar % 16;
    const pulseOn = phase >= 4 && phase < 14;
    const shimmerOn = phase >= 2 && phase < 15;

    // Bass roots, breathing with the bar.
    if (step === 0) this.note((chord[0] ?? 220) / 2, t, (scene === 'interior' ? 0.05 : 0.065) * hush, 1.5);
    if (step === 4 && scene !== 'road') this.note((chord[chord.length - 1] ?? 330) / 2, t, 0.04 * hush, 1.1);

    if (scene === 'outdoor' && !this.sitting && pulseOn) {
      this.drum(t, step, bar);
      this.gesture(t, step, bar, chord);
    }

    // Pads ride the chord cycle in the regions built out of held air. The
    // slower the tempo, the longer the swell: eight seconds mid-ocean, ten
    // at the velación, which is what those comments always promised.
    if (s.pad && step === 0 && bar % 4 === 0) {
      const dur = this.eighth * 8 * 3.2;
      const attack = s.bpm <= 60 ? Math.min(10, dur * 0.6) : 5;
      this.padChord(chord, t, dur, { vol: s.pad.vol * hush, type: s.pad.type, lp: s.pad.lp, attack, release: attack * 0.8 });
    }

    // Shimmer: broken chord tones, plucked where the region owns strings.
    const density = (scene === 'interior' ? 0.3 : scene === 'road' ? 0.28 : 0.6) * s.density * hush * (shimmerOn ? 1 : 0);
    if (Math.random() < density) {
      const tone = chord[(1 + b) % chord.length] ?? 262;
      const oct = Math.random() < 0.3 ? 2 : 1;
      const tt = t + Math.random() * 0.02;
      if (s.pluckShim) {
        this.ks(tone * oct, tt, { vol: 0.03, decay: s.pluckShim.decay, bright: s.pluckShim.bright });
        if (s.pluckShim.detune) {
          this.ks(tone * oct * Math.pow(2, s.pluckShim.detune / 1200), tt + 0.012,
            { vol: 0.02, decay: s.pluckShim.decay, bright: s.pluckShim.bright });
        }
      } else {
        this.note(tone * oct, tt, 0.03, 0.5, s.shimmer);
      }
    }
    if (scene === 'outdoor' && shimmerOn && step % 2 === 1 && Math.random() < 0.3 * s.density) {
      this.note((chord[chord.length - 1] ?? 330) * 2, t, 0.016, 0.32, s.shimmer);
    }
  }

  // ------------------------------------------------------------- creatures
  //
  // The places sound inhabited: gulls over any harbor, cicadas in the summer
  // trees, crickets after dark, a far-off cohete over the valley. Every call
  // is synthesized on the spot and spaced far enough apart to stay a texture.

  private gull(when: number, dist: number) {
    if (!this.ctx || !this.ambGain) return;
    // Two falling cries, the second shorter: the gull's whole vocabulary.
    for (const [off, len] of [[0, 0.34], [0.42, 0.22]] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1150 + dist * 200, when + off);
      osc.frequency.exponentialRampToValueAtTime(620, when + off + len);
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1500;
      f.Q.value = 1.6;
      const g = this.ctx.createGain();
      const v = 0.028 * (1 - dist * 0.6);
      g.gain.setValueAtTime(0.0001, when + off);
      g.gain.exponentialRampToValueAtTime(v, when + off + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, when + off + len);
      osc.connect(f).connect(g).connect(this.ambGain);
      osc.start(when + off);
      osc.stop(when + off + len + 0.05);
    }
  }

  private cicada(when: number) {
    if (!this.ctx || !this.ambGain) return;
    // A narrow hot buzz that swells and lets go.
    const src = this.ctx.createBufferSource();
    src.buffer = this.sharedNoise ?? this.noiseBuffer(this.ctx, 3.2);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5600;
    bp.Q.value = 14;
    const am = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 170;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 0.5;
    lfo.connect(lfoG).connect(am.gain);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.02, when + 1.1);
    g.gain.setValueAtTime(0.02, when + 2.1);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 3.0);
    src.connect(bp).connect(am).connect(g).connect(this.ambGain);
    src.start(when);
    src.stop(when + 3.2);
    lfo.start(when);
    lfo.stop(when + 3.2);
  }

  private cricket(when: number) {
    if (!this.ctx || !this.ambGain) return;
    // A train of four tiny pips.
    for (let i = 0; i < 4; i++) {
      const t = when + i * 0.09;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 4300;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.016, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(g).connect(this.ambGain);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  private cohete(when: number) {
    if (!this.ctx || !this.ambGain) return;
    // A far-off pop and its little crackle: the valley celebrating something.
    const src = this.ctx.createBufferSource();
    src.buffer = this.sharedNoise ?? this.noiseBuffer(this.ctx, 0.5);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.05, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.45);
    src.connect(lp).connect(g).connect(this.ambGain);
    src.start(when);
    src.stop(when + 0.5);
  }

  /** Which creatures live where. */
  private ambientLife(now: number) {
    if (!this.ctx || this.scene === 'interior') return;
    const due = (key: string, minGap: number, spread: number): boolean => {
      const next = this.nextCall[key] ?? 0;
      if (now < next) return false;
      this.nextCall[key] = now + minGap + Math.random() * spread;
      return true;
    };
    const r = this.region;
    const day = this.nightA < 0.45;
    const seaside = r === 'coast' || r === 'shionoura' || r === 'busan' || r === 'zanzibar' || r === 'sicily' || r === 'ocean';
    if (seaside && day && due('gull', 7, 9)) this.gull(now + 0.05, Math.random());
    if ((r === 'shionoura' || r === 'sicily') && day && due('cicada', 9, 12)) this.cicada(now + 0.05);
    if (!day && r !== 'ocean' && due('cricket', 2.5, 3.5)) this.cricket(now + 0.05);
    if ((r === 'oaxaca') && due('cohete', 24, 30)) this.cohete(now + 0.1);
  }

  /** Called from the game loop; keeps the band half a second ahead. */
  tick(dt: number) {
    void dt;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.nextBeatTime === 0 || this.nextBeatTime < now - 1) {
      this.nextBeatTime = now + 0.12;
    }
    // Prewarm on a time budget: at most ~1.5ms of string rendering per frame,
    // so a new region's buffers are ready well before its first phrase but no
    // single frame ever pays for the whole set.
    if (this.ksWarmQueue.length > 0) {
      const t0 = performance.now();
      do {
        const [f, bright, decay] = this.ksWarmQueue.shift()!;
        this.ksBuffer(f, bright, decay);
      } while (this.ksWarmQueue.length > 0 && performance.now() - t0 < 1.5);
    }
    this.ambientLife(now);
    this.updateDrone();

    // Far bells keep their own slow clock: the ship's bell mid-ocean, the
    // camposanto's toll. Not a rhythm; a reminder that time passes.
    const s = this.style;
    if (s.bellEvery) {
      if (this.nextBellAt === 0) this.nextBellAt = now + s.bellEvery * (0.25 + Math.random() * 0.4);
      if (now >= this.nextBellAt) {
        this.bell(this.region === 'ocean' ? N.B4 : N.G3, now + 0.05, this.region === 'ocean' ? 0.04 : 0.05);
        this.nextBellAt = now + s.bellEvery * (0.8 + Math.random() * 0.5);
      }
    }

    // The melody clock: a visit roughly twice a minute, region-tuned, and
    // never scheduled over someone talking. Replaces the old per-bar dice.
    if (this.nextPhraseAt === 0) this.nextPhraseAt = now + 5 + Math.random() * 7;
    if (now >= this.nextPhraseAt) {
      if (this.ducked) {
        this.nextPhraseAt = now + 5 + Math.random() * 6;
      } else {
        this.playMotif(now + 0.1);
        const [gMin, gMax] = s.phraseGap;
        this.nextPhraseAt = now + gMin + Math.random() * (gMax - gMin);
      }
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
