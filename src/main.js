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
import { SolarSystem } from './celestial/SolarSystem.js';
import { CameraScrollController } from './camera/CameraScrollController.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { OverlayManager } from './interaction/OverlayManager.js';

/* ── Bootstrap ────────────────────────────────────────── */

const container = document.getElementById('canvas-container');
const loader = document.getElementById('loader');

// 1. Scene
const sceneManager = new SceneManager(container);

// 2. Starfield
const starfield = new Starfield();
sceneManager.add(starfield.mesh);

// 3. Lighting
const lighting = new Lighting();
sceneManager.add(lighting.group);

// 4. Solar system (sun + planets)
const solarSystem = new SolarSystem();
sceneManager.add(solarSystem.group);

// 5. Camera scroll controller
const cameraController = new CameraScrollController(sceneManager.camera);

// 6. Overlay manager
const overlayManager = new OverlayManager();

// 7. Interaction manager
const interactionManager = new InteractionManager(
  sceneManager.camera,
  sceneManager.domElement,
  solarSystem,
  cameraController,
  overlayManager,
);

/* ── Render loop ──────────────────────────────────────── */

sceneManager.onTick((delta, elapsed) => {
  starfield.update(delta);
  solarSystem.update(delta, elapsed, sceneManager.camera);
  interactionManager.updateHover();
  interactionManager.updateLabels();
});

/* ── Start ────────────────────────────────────────────── */

sceneManager.start();

// Dismiss loader
setTimeout(() => {
  loader.classList.add('fade-out');
  setTimeout(() => loader.remove(), 1200);
}, 800);
