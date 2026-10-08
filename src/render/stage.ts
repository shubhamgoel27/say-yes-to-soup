import {
  Application,
  Assets,
  CanvasSource,
  ColorMatrixFilter,
  Container,
  Filter,
  GlProgram,
  GpuProgram,
  RenderTexture,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { ART, VIEW_H, VIEW_W, setView } from '../engine/config';

/**
 * The GPU presentation layer. The Canvas2D world composer keeps doing what it
 * does, into an offscreen canvas; this stage uploads that frame and adds what
 * canvas cannot: a screen-space light map (ambient + additive point lights,
 * multiplied over the scene), thresholded bloom on the bright bits, and
 * shimmer-free fractional zoom via the sharp-bilinear chain (integer prescale
 * with nearest, fractional present with linear).
 */

export type LightSpec = {
  /** Logical screen-space center, in world-canvas pixels. */
  x: number;
  y: number;
  /** Radius in logical pixels. */
  r: number;
  /** 0xRRGGBB tint. */
  color: number;
  /** 0..1: how much the light breathes. */
  flicker?: number;
};

const MAX_LIGHTS = 40;

export class PixiStage {
  private app!: Application;
  private worldSource!: CanvasSource;
  private scene!: Container;
  private lightScene!: Container;
  private lightRT!: RenderTexture;
  private prescaleRT!: RenderTexture;
  private present!: Sprite;
  private ambientSprite!: Sprite;
  private lightPool: Sprite[] = [];
  private glowPool: Sprite[] = [];
  private specs: LightSpec[] = [];
  private zoom = 1;
  private zoomTarget = 1;
  private base = 3;
  private time = 0;
  private worldCanvas!: HTMLCanvasElement;
  private host!: HTMLElement;
  /** Which API the next (re)build asks for. Drops to webgl after a GPU loss.
   * ?gl in the URL forces WebGL from the start, an escape hatch that also
   * covers a Pixi prod-bundle hang observed after WebGPU device creation. */
  private preference: 'webgpu' | 'webgl' =
    new URLSearchParams(location.search).has('gl') ? 'webgl' : 'webgpu';
  /** Ambient tint survives a rebuild; the sprite holding it does not. */
  private ambient = 0xffffff;
  private washSprite: Sprite | null = null;
  private vigSprite: Sprite | null = null;
  private grade = { wash: 0, vignette: 0 };
  private bloom: AdvancedBloomFilter | null = null;
  private recovering = false;
  private renderFails = 0;

  /** True from the end of init() until a recovery tears the app down. */
  private live = false;
  /** Whether THIS boot planted the WebGPU crash canary (see init/render). */
  private canaryArmed = false;
  /** Callers who need the live canvas (pointer bindings); re-run per build. */
  private canvasHooks: ((c: HTMLCanvasElement) => void)[] = [];
  /** Who repaints at the frame's size (the world composer); run when it turns. */
  private viewHooks: (() => void)[] = [];
  /** The frame-sized pieces of the build, resized in place when the frame turns. */
  private grain: TilingSprite | null = null;
  private worldSprite!: Sprite;
  private lightLayer!: Sprite;

  /**
   * Synchronous on purpose. Awaiting this at main.ts's top level deadlocked
   * the production bundle: the top-level await froze the index chunk mid
   * evaluation, Pixi's renderer arrived by dynamic import, and that chunk
   * imports shared bindings back out of the still-frozen index. Dev never
   * hits it because dev serves real modules. The stage now assembles itself
   * in the background and every public method no-ops until it is live,
   * which the loss-recovery path needed anyway.
   */
  static create(worldCanvas: HTMLCanvasElement, host: HTMLElement): PixiStage {
    const s = new PixiStage();
    s.worldCanvas = worldCanvas;
    s.host = host;
    void s.init().then(() => s.resize());
    window.addEventListener('resize', () => s.resize());
    // Phones resize the visible viewport without always firing a window
    // resize (URL bar collapse, on-screen keyboard, rotation quirks); track
    // the visual viewport too so the world never sits letterboxed. Desktop
    // fires both for the same window resize; resize() is idempotent.
    window.visualViewport?.addEventListener('resize', () => s.resize());
    if (import.meta.env.DEV) (globalThis as unknown as { __soupStage: PixiStage }).__soupStage = s;
    return s;
  }

  /**
   * Build (or rebuild) the entire GPU side. Everything the stage owns lives
   * on the Application, so recovery after a lost device is: throw the old
   * one away, run this again. Chrome reclaims WebGPU devices from tabs left
   * in the background; without this the world went on simulating behind a
   * frozen last frame, which reads as "the game stopped taking input."
   */
  private async init(): Promise<void> {
    const s = this;
    const worldCanvas = this.worldCanvas;
    const host = this.host;
    const app = new Application();
    // The crash canary. A WebGPU device creation that takes the whole tab
    // down cannot be caught in-page: no exception, no device-lost, just a
    // dead tab. So the attempt leaves a note in sessionStorage before it
    // jumps, and clears it after the first frame lands. Finding the note
    // still there on boot means the last attempt never came back; this
    // session takes WebGL instead. (?gl in the URL already forced WebGL
    // above, and never plants a canary.)
    if (this.preference === 'webgpu') {
      if (readCanary()) {
        console.info('[soup] previous webgpu boot never completed; using webgl this session');
        this.preference = 'webgl';
      } else {
        this.canaryArmed = setCanary();
      }
    }
    console.info(`[soup] boot: stage init (${this.preference})`);
    // WebGPU first: Chrome's newest graphics API; Pixi falls back to WebGL
    // automatically on browsers that lack it.
    await app.init({
      preference: this.preference,
      width: VIEW_W * ART,
      height: VIEW_H * ART,
      antialias: true,
      autoStart: false,
      sharedTicker: false,
      background: '#17120e',
    });
    console.info(`[soup] renderer: ${app.renderer.name}`);
    // The ?perf overlay (engine/perfhud) reports which renderer actually won;
    // a global keeps the engine free of any import back into the stage.
    (globalThis as { __soupRenderer?: string }).__soupRenderer = app.renderer.name;
    s.app = app;
    app.canvas.id = 'stagegl';
    host.prepend(app.canvas);
    s.lightPool = [];
    s.glowPool = [];
    s.watchForDeviceLoss();

    // The world frame, uploaded from the Canvas2D composer every render.
    s.worldSource = new CanvasSource({ resource: worldCanvas, scaleMode: 'linear' });
    const worldSprite = new Sprite(new Texture({ source: s.worldSource }));
    s.worldSprite = worldSprite;

    // Light map: ambient base + screened radial lights, multiplied over the world.
    // Linear, because the map is authored at a quarter of the art's resolution
    // and a nearest upscale drew every lamp's falloff in visible 4px steps.
    s.lightRT = RenderTexture.create({ width: VIEW_W, height: VIEW_H, scaleMode: 'linear' });
    s.lightScene = new Container();
    s.ambientSprite = new Sprite(Texture.WHITE);
    s.ambientSprite.width = VIEW_W;
    s.ambientSprite.height = VIEW_H;
    s.ambientSprite.tint = 0xffffff;
    s.lightScene.addChild(s.ambientSprite);
    const radial = makeRadialTexture(LIGHT_STOPS);
    const halo = makeRadialTexture(GLOW_STOPS);
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const l = new Sprite(radial);
      l.anchor.set(0.5);
      // Screen, not add. Added onto the ambient a hearth's light ran past
      // white over most of its radius, and the clamp turned the falloff into
      // a flat white plateau with a rim: the hard-edged disc on Carmen's
      // walls. Screen approaches white and never reaches it, so the light
      // keeps falling off all the way out and overlapping lamps merge softly.
      l.blendMode = 'screen';
      l.visible = false;
      s.lightScene.addChild(l);
      s.lightPool.push(l);
    }
    const lightLayer = new Sprite(s.lightRT);
    s.lightLayer = lightLayer;
    lightLayer.blendMode = 'multiply';
    lightLayer.scale.set(ART); // light map is authored at logical resolution

    // A faint additive echo of the same lights, so lamps genuinely glow.
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const gl = new Sprite(halo);
      gl.anchor.set(0.5);
      gl.blendMode = 'add';
      gl.alpha = 0;
      gl.visible = false;
      s.glowPool.push(gl);
    }

    s.scene = new Container();
    s.scene.addChild(worldSprite);

    // Paper tooth over the whole frame, on the GPU where multiply is free.
    // (Done on the 2D canvas this same blend forced Chrome off the GPU and
    // tripled frame times; the look is identical here.)
    try {
      const grainTex = await Assets.load<Texture>('assets/textures/paper-grain-white.jpg');
      grainTex.source.addressMode = 'repeat';
      const grain = new TilingSprite({ texture: grainTex, width: VIEW_W * ART, height: VIEW_H * ART });
      grain.blendMode = 'multiply';
      grain.alpha = 0.09;
      s.scene.addChild(grain);
      s.grain = grain;
    } catch {
      // No texture, no tooth; the game plays on.
    }

    s.scene.addChild(lightLayer);
    for (const gl of s.glowPool) s.scene.addChild(gl);
    // The evening grade: a low sun's gold raking in from one side, and the
    // frame's edges going down into dusk around whatever the camera holds.
    // Both are off (alpha 0) except where a scene asks for them.
    s.washSprite = new Sprite(makeWashTexture());
    s.washSprite.width = VIEW_W * ART;
    s.washSprite.height = VIEW_H * ART;
    s.washSprite.blendMode = 'screen';
    s.vigSprite = new Sprite(makeVignetteTexture());
    s.vigSprite.width = VIEW_W * ART;
    s.vigSprite.height = VIEW_H * ART;
    s.scene.addChild(s.washSprite, s.vigSprite);
    s.applyGrade();
    // A touch of gouache richness: figures and props carry slightly more
    // chroma than the receding grounds, so the saturation lands where it should.
    const grade = new ColorMatrixFilter();
    grade.saturate(0.08, true);
    grade.resolution = 1; // pure color math; no need to pay retina cost
    // Phone GPUs pay for every blur pass over the full 1280x720 frame, and a
    // phone that misses vsync stutters where a desktop shrugs. Coarse-touch
    // devices (capability, never user agent) take the bloom at half the
    // passes: same threshold, same radius, same glow, less strain.
    const coarseTouch =
      typeof matchMedia === 'function' && matchMedia('(pointer: coarse) and (hover: none)').matches;
    const bloom = new AdvancedBloomFilter({
      bloomScale: BLOOM_SCALE,
      brightness: 1,
      blur: 6,
      quality: coarseTouch ? 2 : 4,
    });
    // The stock extract is a step: a pixel a hair over the threshold blooms at
    // full strength and its neighbour a hair under blooms not at all, so a
    // lamp-lit wall bloomed as a white shape with the outline of the light's
    // reach. This one ramps in from zero and weighs the very brightest most.
    (bloom as unknown as { _extractFilter: Filter })._extractFilter = new SoftExtractFilter(BLOOM_THRESHOLD);
    s.scene.filters = [grade, bloom];
    s.bloom = bloom;
    s.applyBloom();

    // Compose at native art resolution, then scale smoothly to the window.
    s.prescaleRT = RenderTexture.create({
      width: VIEW_W * ART,
      height: VIEW_H * ART,
      scaleMode: 'linear',
    });
    s.present = new Sprite(s.prescaleRT);
    app.stage.addChild(s.present);
    s.ambientSprite.tint = s.ambient;
    s.live = true;
    // Pointer handlers bind to the canvas element, and this canvas is new on
    // every build; whoever registered gets the fresh one each time.
    for (const fn of s.canvasHooks) fn(app.canvas);
  }

  /** Run now if the stage is live, and again after every rebuild. */
  withCanvas(fn: (c: HTMLCanvasElement) => void) {
    this.canvasHooks.push(fn);
    if (this.live) fn(this.app.canvas);
  }

  /** A lost GPUDevice never comes back; the stage has to notice and rebuild. */
  private watchForDeviceLoss() {
    const gpu = (this.app.renderer as unknown as { gpu?: { device?: GPUDevice } }).gpu;
    void gpu?.device?.lost?.then((info) => {
      // 'destroyed' is the normal teardown of a rebuild we started ourselves.
      if (info.reason !== 'destroyed' || !this.recovering) {
        void this.recover(`gpu device lost (${info.reason || 'unknown'})`);
      }
    });
  }

  private async recover(why: string): Promise<void> {
    if (this.recovering) return;
    this.recovering = true;
    this.live = false;
    console.warn(`[soup] stage rebuilding: ${why}`);
    // A recovered WebGPU device has lost every resource anyway, and WebGL's
    // context restoration is the better-worn path; take it on the way back.
    this.preference = 'webgl';
    try {
      this.app.canvas.remove();
      this.app.destroy(false, { children: true, texture: true });
    } catch {
      // The dead renderer may refuse even to be destroyed; the rebuild
      // replaces every reference either way.
    }
    try {
      await this.init();
      this.resize();
    } finally {
      this.recovering = false;
    }
  }

  /**
   * Fullscreen cover: the world fills the entire window edge to edge, using
   * fractional scale (the sharp-bilinear chain keeps it shimmer-free) and
   * cropping a few logical pixels on the longer axis. No letterbox, no frame:
   * the game IS the page.
   */
  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // The frame turns with the screen (config.viewFor). The world composer
    // goes first so the canvas this stage uploads is already the new size.
    if (setView(w, h)) {
      for (const fn of this.viewHooks) fn();
      this.fitView();
    }
    if (!this.live) return;
    this.base = Math.max(1, Math.max(w / VIEW_W, h / VIEW_H));
    this.app.renderer.resize(w, h);
    this.app.canvas.style.width = `${w}px`;
    this.app.canvas.style.height = `${h}px`;
    this.layout();
  }

  /** Run whenever the frame turns (after the frame has changed). */
  onViewChange(fn: () => void) {
    this.viewHooks.push(fn);
  }

  /** Resize every frame-sized surface the build owns to the current frame. */
  private fitView() {
    if (!this.live) return; // init() reads the frame fresh
    const w = VIEW_W * ART;
    const h = VIEW_H * ART;
    // Fresh GPU surfaces rather than resized ones: a resized source kept its
    // old GPU allocation on WebGL and the turned frame drew squeezed into a
    // third of the screen. A turn is rare; new textures are cheap.
    const oldWorld = this.worldSprite.texture;
    this.worldSource = new CanvasSource({ resource: this.worldCanvas, scaleMode: 'linear' });
    this.worldSprite.texture = new Texture({ source: this.worldSource });
    oldWorld.destroy(true);
    const oldLight = this.lightRT;
    this.lightRT = RenderTexture.create({ width: VIEW_W, height: VIEW_H, scaleMode: 'linear' });
    this.lightLayer.texture = this.lightRT;
    oldLight.destroy(true);
    const oldPre = this.prescaleRT;
    this.prescaleRT = RenderTexture.create({ width: w, height: h, scaleMode: 'linear' });
    this.present.texture = this.prescaleRT;
    oldPre.destroy(true);
    this.ambientSprite.width = VIEW_W;
    this.ambientSprite.height = VIEW_H;
    if (this.grain) {
      this.grain.width = w;
      this.grain.height = h;
    }
    for (const sp of [this.washSprite, this.vigSprite]) {
      if (!sp) continue;
      sp.width = w;
      sp.height = h;
    }
  }

  private layout() {
    const total = (this.base * this.zoom) / ART;
    this.present.scale.set(total);
    // Center; the covered overflow crops evenly on both sides.
    this.present.position.set(
      (window.innerWidth - VIEW_W * ART * total) / 2,
      (window.innerHeight - VIEW_H * ART * total) / 2,
    );
  }

  /** Ambient light color: 0xffffff = full day (multiply no-op). */
  setAmbient(color: number) {
    if (color === this.ambient) return;
    this.ambient = color;
    if (this.live) this.ambientSprite.tint = color;
    this.applyBloom();
  }

  /**
   * Bloom is for lamps and fires, and in full daylight there are none worth
   * the name: what crossed the threshold instead was every cream apron and
   * white shirt, which bloomed into a glowing cut-out (Rosa at her pot, the
   * fishmonger under his awning). Under a bright ambient the gathered light
   * goes back at a third; as the ambient darkens toward dusk, or indoors, it
   * returns to full.
   */
  private applyBloom() {
    if (!this.bloom) return;
    const c = this.ambient;
    const lum = (0.2126 * ((c >> 16) & 255) + 0.7152 * ((c >> 8) & 255) + 0.0722 * (c & 255)) / 255;
    const dark = Math.min(1, Math.max(0, (0.97 - lum) / 0.25));
    this.bloom.bloomScale = BLOOM_SCALE * (0.35 + 0.65 * dark);
  }

  /**
   * The evening grade, 0..1 each: `wash` is the low sun's gold coming in
   * from the upper left, `vignette` the edges of the frame settling into
   * dusk. Survives a rebuild like the ambient does.
   */
  setGrade(wash: number, vignette: number) {
    this.grade = { wash, vignette };
    this.applyGrade();
  }

  private applyGrade() {
    if (!this.washSprite || !this.vigSprite) return;
    this.washSprite.alpha = this.grade.wash;
    this.washSprite.visible = this.grade.wash > 0.003;
    this.vigSprite.alpha = this.grade.vignette;
    this.vigSprite.visible = this.grade.vignette > 0.003;
  }

  setLights(specs: LightSpec[]) {
    this.specs = specs.slice(0, MAX_LIGHTS);
  }

  setZoomTarget(z: number) {
    this.zoomTarget = z;
  }

  tick(dt: number) {
    this.time += dt;
    const k = 1 - Math.exp(-dt * 9);
    this.zoom += (this.zoomTarget - this.zoom) * k;
    if (Math.abs(this.zoom - this.zoomTarget) < 0.001) this.zoom = this.zoomTarget;
  }

  /** Called from the game's render step: upload, light, compose, present. */
  render() {
    if (!this.live || this.recovering) return;
    try {
      this.renderPass();
      this.renderFails = 0;
      // First frame on screen: the WebGPU attempt survived; stand down the
      // crash canary so the next boot tries WebGPU again.
      if (this.canaryArmed) {
        this.canaryArmed = false;
        clearCanary();
      }
    } catch (err) {
      // One failed frame is a blink; a run of them means the surface is gone
      // in a way no lost-device signal reported. Rebuild rather than let the
      // game keep simulating behind a frozen frame.
      this.renderFails++;
      if (this.renderFails === 1) console.warn('[soup] stage render failed:', err);
      if (this.renderFails >= 30) {
        this.renderFails = 0;
        void this.recover('render kept throwing');
      }
    }
  }

  private renderPass() {
    this.worldSource.update();

    for (let i = 0; i < MAX_LIGHTS; i++) {
      const spec = this.specs[i];
      const l = this.lightPool[i];
      const gl = this.glowPool[i];
      if (!l || !gl) continue;
      if (!spec) {
        l.visible = false;
        gl.visible = false;
        continue;
      }
      const flick = spec.flicker
        ? 1 + spec.flicker * (Math.sin(this.time * 9 + i * 2.1) * 0.5 + Math.sin(this.time * 23 + i) * 0.2) * 0.5
        : 1;
      // Light map lives at logical resolution; glows live in art space.
      l.visible = true;
      l.position.set(spec.x, spec.y);
      l.tint = spec.color;
      l.scale.set((spec.r * 2 * flick) / RADIAL_SIZE);
      gl.visible = true;
      gl.position.set(spec.x * ART, spec.y * ART);
      gl.tint = spec.color;
      gl.scale.set((spec.r * ART * 1.4 * flick) / RADIAL_SIZE);
      gl.alpha = GLOW_ALPHA;
    }

    this.app.renderer.render({ container: this.lightScene, target: this.lightRT, clear: true });
    this.app.renderer.render({ container: this.scene, target: this.prescaleRT, clear: true });
    this.layout();
    this.app.render();
  }
}

/** sessionStorage key for the WebGPU crash canary; storage can be walled off
 * (private windows, storage pressure), and a canary that cannot be written
 * must not be trusted, so every access is wrapped. */
const CANARY_KEY = 'soup.gpu.canary';

function readCanary(): boolean {
  try {
    return sessionStorage.getItem(CANARY_KEY) !== null;
  } catch {
    return false;
  }
}

/** True only if the note verifiably landed; otherwise nothing to clear. */
function setCanary(): boolean {
  try {
    sessionStorage.setItem(CANARY_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

function clearCanary() {
  try {
    sessionStorage.removeItem(CANARY_KEY);
  } catch {
    // Nothing to do; the read path treats an unreadable canary as absent.
  }
}

/** Where bloom starts to gather, in the extract's (max + min) / 2 brightness. */
const BLOOM_THRESHOLD = 0.6;
/** How strongly the gathered light is added back. */
const BLOOM_SCALE = 0.9;
/** How strongly each light's additive halo glows over the scene. */
const GLOW_ALPHA = 0.24;

const SOFT_EXTRACT_VERT = `in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  gl_Position = vec4(position, 0.0, 1.0);
  vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

const SOFT_EXTRACT_FRAG = `in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float uThreshold;
void main() {
  vec4 color = texture(uTexture, vTextureCoord);
  float b = (max(max(color.r, color.g), color.b) + min(min(color.r, color.g), color.b)) * 0.5;
  float x = clamp((b - uThreshold) / (1.0 - uThreshold), 0.0, 1.0);
  finalColor = color * (x * x);
}
`;

const SOFT_EXTRACT_WGSL = `struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};
struct SoftExtractUniforms {
  uThreshold: f32,
};
@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> softExtractUniforms: SoftExtractUniforms;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput {
  var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;
  position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;
  return VSOutput(vec4(position, 0.0, 1.0), aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw));
}

@fragment
fn mainFragment(@builtin(position) position: vec4<f32>, @location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let color = textureSample(uTexture, uSampler, uv);
  let b = (max(max(color.r, color.g), color.b) + min(min(color.r, color.g), color.b)) * 0.5;
  let t = softExtractUniforms.uThreshold;
  let x = clamp((b - t) / (1.0 - t), 0.0, 1.0);
  return color * (x * x);
}
`;

/**
 * Bloom's bright pass with a ramp instead of a step: nothing at the
 * threshold, rising with the square of how far past it a pixel is. A lamp's
 * glass still blooms about as much as it did; a cream wall in its light gets
 * a fraction of that, and nothing anywhere has an edge.
 */
class SoftExtractFilter extends Filter {
  constructor(threshold: number) {
    super({
      glProgram: GlProgram.from({
        vertex: SOFT_EXTRACT_VERT,
        fragment: SOFT_EXTRACT_FRAG,
        name: 'soup-soft-extract',
      }),
      gpuProgram: GpuProgram.from({
        vertex: { source: SOFT_EXTRACT_WGSL, entryPoint: 'mainVertex' },
        fragment: { source: SOFT_EXTRACT_WGSL, entryPoint: 'mainFragment' },
      }),
      resources: {
        softExtractUniforms: { uThreshold: { value: threshold, type: 'f32' } },
      },
    });
  }
}

const RADIAL_SIZE = 64;

/**
 * A soft radial falloff, generated once; every light is one of these tinted.
 * `stops` are [offset, alpha] pairs from the centre out.
 */
function makeRadialTexture(stops: [number, number][]): Texture {
  const cv = document.createElement('canvas');
  cv.width = RADIAL_SIZE;
  cv.height = RADIAL_SIZE;
  const g = cv.getContext('2d');
  if (!g) throw new Error('no 2d ctx');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  for (const [at, a] of stops) grad.addColorStop(at, `rgba(255,255,255,${a})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, RADIAL_SIZE, RADIAL_SIZE);
  return Texture.from(cv);
}

/**
 * The low sun's wash: warm gold strongest at the upper left, where the light
 * comes in over the ridge, gone by the far corner. Screened over the frame,
 * so it lifts and warms without ever clipping to white.
 */
function makeWashTexture(): Texture {
  const W = 256;
  const H = 144;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d');
  if (!g) throw new Error('no 2d ctx');
  const grad = g.createLinearGradient(0, 0, W * 0.8, H * 1.1);
  grad.addColorStop(0, 'rgba(255,170,70,0.55)');
  grad.addColorStop(0.45, 'rgba(240,130,60,0.22)');
  grad.addColorStop(1, 'rgba(120,60,40,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  return Texture.from(cv);
}

/** The frame's edge going down into dusk: clear middle, warm dark corners. */
function makeVignetteTexture(): Texture {
  const W = 320;
  const H = 180;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d');
  if (!g) throw new Error('no 2d ctx');
  // Stretched to the frame's aspect, so the clear middle is an oval that
  // follows the screen rather than a circle cut off at the sides.
  g.setTransform(W / H, 0, 0, 1, 0, 0);
  const cx = H / 2;
  const grad = g.createRadialGradient(cx, H / 2, H * 0.22, cx, H / 2, H * 0.78);
  grad.addColorStop(0, 'rgba(26,12,8,0)');
  grad.addColorStop(0.55, 'rgba(26,12,8,0.32)');
  grad.addColorStop(1, 'rgba(18,8,6,0.82)');
  g.fillStyle = grad;
  g.fillRect(0, 0, H, H);
  return Texture.from(cv);
}

/** The light map's falloff: fuller through the middle, since screen never clips. */
const LIGHT_STOPS: [number, number][] = [[0, 1], [0.35, 0.66], [0.7, 0.22], [1, 0]];
/** The additive halo's falloff: the old light curve, a broad soft glow. */
const GLOW_STOPS: [number, number][] = [[0, 0.9], [0.4, 0.45], [0.75, 0.12], [1, 0]];
