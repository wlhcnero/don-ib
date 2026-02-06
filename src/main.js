/**
 * ═══════════════════════════════════════════════════════════
 * Solar System Portfolio — Entry point
 * ═══════════════════════════════════════════════════════════
 *
 * Scroll to travel through space.
 * Click a celestial body to discover its story.
 */

import './styles/main.css';

import { SceneManager } from './scene/SceneManager.js';
import { Starfield } from './scene/Starfield.js';
import { Lighting } from './scene/Lighting.js';
import { ShootingStars } from './scene/ShootingStars.js';
import { Nebula } from './scene/Nebula.js';
import { SolarSystem } from './celestial/SolarSystem.js';
import { CameraScrollController } from './camera/CameraScrollController.js';
import { MouseParallax } from './camera/MouseParallax.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { OverlayManager } from './interaction/OverlayManager.js';
import { AudioManager } from './interaction/AudioManager.js';
import { CustomCursor } from './interaction/CustomCursor.js';
import { ProximityHints } from './interaction/ProximityHints.js';

/* ── Bootstrap ────────────────────────────────────────── */

const container = document.getElementById('canvas-container');
const loader = document.getElementById('loader');

// 1. Scene
const sceneManager = new SceneManager(container);

// 2. Starfield
const starfield = new Starfield();
sceneManager.add(starfield.mesh);

// 3. Nebula clouds
const nebula = new Nebula();
sceneManager.add(nebula.group);

// 4. Shooting stars
const shootingStars = new ShootingStars();
sceneManager.add(shootingStars.group);

// 5. Lighting
const lighting = new Lighting();
sceneManager.add(lighting.group);

// 6. Solar system (sun + planets)
const solarSystem = new SolarSystem();
sceneManager.add(solarSystem.group);

// 7. Camera scroll controller
const cameraController = new CameraScrollController(sceneManager.camera);

// 8. Mouse parallax
const mouseParallax = new MouseParallax(sceneManager.camera);

// 9. Audio manager
const audioManager = new AudioManager();

// 10. Custom cursor
const customCursor = new CustomCursor();

// 11. Overlay manager
const overlayManager = new OverlayManager();

// 12. Interaction manager
const interactionManager = new InteractionManager(
  sceneManager.camera,
  sceneManager.domElement,
  solarSystem,
  cameraController,
  overlayManager,
  audioManager,
  customCursor,
);

// 13. Proximity hints
const proximityHints = new ProximityHints(sceneManager.camera, solarSystem);

/* ── Render loop ──────────────────────────────────────── */

sceneManager.onTick((delta, elapsed) => {
  // Scene elements
  starfield.update(delta);
  nebula.update(delta);
  shootingStars.update(delta);
  solarSystem.update(delta, elapsed, sceneManager.camera);

  // Camera
  cameraController.updateOrbit(delta);
  mouseParallax.update(delta);

  // Interaction
  interactionManager.updateHover();
  interactionManager.updateLabels();
  proximityHints.update();

  // Custom cursor
  customCursor.update();
});

/* ── Start ────────────────────────────────────────────── */

sceneManager.start();

// Dismiss loader
setTimeout(() => {
  loader.classList.add('fade-out');
  setTimeout(() => loader.remove(), 1200);
}, 800);
