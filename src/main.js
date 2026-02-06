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

/* ── Bootstrap (wrapped in try/catch for debugging) ───── */

try {
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

  // 8. Mouse parallax (offset consumed by cameraController)
  const mouseParallax = new MouseParallax();
  cameraController.parallaxOffset = mouseParallax.offset;

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
    starfield.update(delta);
    nebula.update(delta);
    shootingStars.update(delta);
    solarSystem.update(delta, elapsed, sceneManager.camera);

    cameraController.updateOrbit(delta);
    mouseParallax.update();

    interactionManager.updateHover();
    interactionManager.updateLabels();
    proximityHints.update();

    customCursor.update();
  });

  /* ── Start ────────────────────────────────────────────── */

  sceneManager.start();

  // Dismiss loader
  setTimeout(() => {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 1200);
    }
  }, 800);

} catch (err) {
  // Show error on screen for debugging
  console.error('Solar System Portfolio init error:', err);
  const loader = document.getElementById('loader');
  if (loader) {
    const text = loader.querySelector('#loader-text');
    if (text) {
      text.textContent = 'WebGL error — check console (F12)';
      text.style.color = '#ff6666';
    }
  }
}
