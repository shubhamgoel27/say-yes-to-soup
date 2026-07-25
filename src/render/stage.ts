import {
  Application,
  CanvasSource,
  Container,
  RenderTexture,
  Sprite,
  Texture,
} from 'pixi.js';
import { AdvancedBloomFilter } from 'pixi-filters';
import { ART, VIEW_H, VIEW_W } from '../engine/config';

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

  static async create(worldCanvas: HTMLCanvasElement, host: HTMLElement): Promise<PixiStage> {
    const s = new PixiStage();
    const app = new Application();
    // WebGPU first: Chrome's newest graphics API; Pixi falls back to WebGL
    // automatically on browsers that lack it.
    await app.init({
      preference: 'webgpu',
      width: VIEW_W * ART,
      height: VIEW_H * ART,
      antialias: true,
      autoStart: false,
      sharedTicker: false,
      background: '#17120e',
    });
    console.info(`[soup] renderer: ${app.renderer.name}`);
    s.app = app;
    app.canvas.id = 'stagegl';
    host.prepend(app.canvas);

    // The world frame, uploaded from the Canvas2D composer every render.
    s.worldSource = new CanvasSource({ resource: worldCanvas, scaleMode: 'linear' });
    const worldSprite = new Sprite(new Texture({ source: s.worldSource }));

    // Light map: ambient base + additive radial lights, multiplied over the world.
    s.lightRT = RenderTexture.create({ width: VIEW_W, height: VIEW_H, scaleMode: 'nearest' });
    s.lightScene = new Container();
    s.ambientSprite = new Sprite(Texture.WHITE);
    s.ambientSprite.width = VIEW_W;
    s.ambientSprite.height = VIEW_H;
    s.ambientSprite.tint = 0xffffff;
    s.lightScene.addChild(s.ambientSprite);
    const radial = makeRadialTexture();
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const l = new Sprite(radial);
      l.anchor.set(0.5);
      l.blendMode = 'add';
      l.visible = false;
      s.lightScene.addChild(l);
      s.lightPool.push(l);
    }
    const lightLayer = new Sprite(s.lightRT);
    lightLayer.blendMode = 'multiply';
    lightLayer.scale.set(ART); // light map is authored at logical resolution

    // A faint additive echo of the same lights, so lamps genuinely glow.
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const gl = new Sprite(radial);
      gl.anchor.set(0.5);
      gl.blendMode = 'add';
      gl.alpha = 0;
      gl.visible = false;
      s.glowPool.push(gl);
    }

    s.scene = new Container();
    s.scene.addChild(worldSprite);
    s.scene.addChild(lightLayer);
    for (const gl of s.glowPool) s.scene.addChild(gl);
    s.scene.filters = [
      new AdvancedBloomFilter({ threshold: 0.66, bloomScale: 0.5, brightness: 1, blur: 6, quality: 4 }),
    ];

    // Compose at native art resolution, then scale smoothly to the window.
    s.prescaleRT = RenderTexture.create({
      width: VIEW_W * ART,
      height: VIEW_H * ART,
      scaleMode: 'linear',
    });
    s.present = new Sprite(s.prescaleRT);
    app.stage.addChild(s.present);

    s.resize();
    window.addEventListener('resize', () => s.resize());
    return s;
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
    this.base = Math.max(1, Math.max(w / VIEW_W, h / VIEW_H));
    this.app.renderer.resize(w, h);
    this.app.canvas.style.width = `${w}px`;
    this.app.canvas.style.height = `${h}px`;
    this.layout();
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
    this.ambientSprite.tint = color;
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
      gl.alpha = 0.14;
    }

    this.app.renderer.render({ container: this.lightScene, target: this.lightRT, clear: true });
    this.app.renderer.render({ container: this.scene, target: this.prescaleRT, clear: true });
    this.layout();
    this.app.render();
  }
}

const RADIAL_SIZE = 64;

/** A soft radial falloff, generated once; every light is this texture tinted. */
function makeRadialTexture(): Texture {
  const cv = document.createElement('canvas');
  cv.width = RADIAL_SIZE;
  cv.height = RADIAL_SIZE;
  const g = cv.getContext('2d');
  if (!g) throw new Error('no 2d ctx');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  grad.addColorStop(0.75, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, RADIAL_SIZE, RADIAL_SIZE);
  return Texture.from(cv);
}
