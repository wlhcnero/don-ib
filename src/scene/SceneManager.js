import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CONFIG } from '../data/config.js';

/**
 * SceneManager — initialises Three.js scene, renderer, camera,
 * post-processing (bloom), and drives the render loop.
 */
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.callbacks = [];

    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initPostProcessing();
    this._initLights();
    this._onResize();

    window.addEventListener('resize', () => this._onResize());
  }

  /* ── Initialisation ─────────────────────────────────── */

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
    this.scene.fog = new THREE.Fog(
      CONFIG.scene.fogColor,
      CONFIG.scene.fogNear,
      CONFIG.scene.fogFar,
    );
  }

  _initCamera() {
    const { fov, near, far, startPosition } = CONFIG.camera;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      near,
      far,
    );
    this.camera.position.set(startPosition.x, startPosition.y, startPosition.z);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  _initPostProcessing() {
    const { strength, radius, threshold } = CONFIG.bloom;
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      strength,
      radius,
      threshold,
    );
    this.composer.addPass(this.bloomPass);
  }

  _initLights() {
    // Subtle ambient so planets aren't fully black on unlit side
    const ambient = new THREE.AmbientLight(0x111122, 0.15);
    this.scene.add(ambient);
  }

  /* ── Render loop ────────────────────────────────────── */

  /** Register a callback that receives (deltaTime, elapsedTime) each frame. */
  onTick(cb) {
    this.callbacks.push(cb);
  }

  start() {
    this.renderer.setAnimationLoop(() => this._tick());
  }

  _tick() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Run all registered per-frame callbacks
    for (const cb of this.callbacks) {
      cb(delta, elapsed);
    }

    this.composer.render();
  }

  /* ── Resize handler ─────────────────────────────────── */

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  /* ── Public helpers ─────────────────────────────────── */

  add(object) {
    this.scene.add(object);
  }

  get domElement() {
    return this.renderer.domElement;
  }
}
