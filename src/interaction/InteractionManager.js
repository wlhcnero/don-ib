import * as THREE from 'three';
import gsap from 'gsap';
import { CONFIG } from '../data/config.js';

/**
 * InteractionManager — raycasting for hover & click on celestial bodies.
 * Integrates with AudioManager and CustomCursor.
 */
export class InteractionManager {
  constructor(camera, domElement, solarSystem, cameraController, overlayManager, audioManager, customCursor) {
    this.camera = camera;
    this.domElement = domElement;
    this.solarSystem = solarSystem;
    this.cameraController = cameraController;
    this.overlayManager = overlayManager;
    this.audio = audioManager;
    this.cursor = customCursor;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.selectedObject = null;
    this.isInOrbit = false;

    this.cursorHint = document.getElementById('cursor-hint');

    this._bindEvents();
  }

  _bindEvents() {
    this.domElement.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.domElement.addEventListener('click', (e) => this._onClick(e));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isInOrbit) {
        this._exitOrbit();
      }
    });
  }

  /* ── Mouse move / hover ─────────────────────────────── */

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  /** Called each frame to check hover state. */
  updateHover() {
    if (this.isInOrbit) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const objects = this.solarSystem.getInteractiveObjects();
    const intersects = this.raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      if (this.hoveredObject !== hit) {
        // Unhover previous
        this._unhover();

        this.hoveredObject = hit;
        this.domElement.style.cursor = 'none';

        // Scale up
        gsap.to(hit.scale, {
          x: CONFIG.interaction.hoverScale,
          y: CONFIG.interaction.hoverScale,
          z: CONFIG.interaction.hoverScale,
          duration: CONFIG.interaction.hoverDuration,
          ease: 'power2.out',
        });

        // Audio feedback
        if (this.audio) this.audio.playHover();

        // Custom cursor hover state
        if (this.cursor) this.cursor.setHover(true);

        // Show cursor hint
        this._showCursorHint();

        // Show planet label
        if (hit.userData.type === 'planet') {
          const planet = this.solarSystem.getPlanetById(hit.userData.projectId);
          if (planet) planet._showLabel = true;
        }
      }
    } else {
      this._unhover();
    }
  }

  _unhover() {
    if (this.hoveredObject) {
      gsap.to(this.hoveredObject.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: CONFIG.interaction.hoverDuration,
        ease: 'power2.out',
      });

      // Hide planet label
      if (this.hoveredObject.userData.type === 'planet') {
        const planet = this.solarSystem.getPlanetById(
          this.hoveredObject.userData.projectId,
        );
        if (planet) planet._showLabel = false;
      }

      this.hoveredObject = null;
      this.domElement.style.cursor = 'none';

      if (this.cursor) this.cursor.setHover(false);
      this._hideCursorHint();
    }
  }

  /* ── Click ──────────────────────────────────────────── */

  _onClick(e) {
    if (this.isInOrbit) {
      if (e.target === this.domElement || e.target.closest('#canvas-container')) {
        this._exitOrbit();
      }
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const objects = this.solarSystem.getInteractiveObjects();
    const intersects = this.raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.audio) this.audio.playSelect();
      this._handleClick(hit);
    }
  }

  _handleClick(mesh) {
    if (mesh.userData.type === 'sun') {
      this._enterSunOrbit();
    } else if (mesh.userData.type === 'planet') {
      const planet = this.solarSystem.getPlanetById(mesh.userData.projectId);
      if (planet) this._enterPlanetOrbit(planet);
    }
  }

  /* ── Sun orbit (About page) ─────────────────────────── */

  _enterSunOrbit() {
    this.isInOrbit = true;
    this.selectedObject = this.solarSystem.sun;

    const target = this.solarSystem.sun.getWorldPosition();
    this.cameraController.flyTo(target, () => {
      this.overlayManager.showAbout();
      if (this.cursor) this.cursor.hide();
    });
  }

  /* ── Planet orbit (Project page) ────────────────────── */

  _enterPlanetOrbit(planet) {
    this.isInOrbit = true;
    this.selectedObject = planet;

    const target = planet.getWorldPosition();
    this.cameraController.flyTo(target, () => {
      this.overlayManager.showProject(planet.data);
      if (this.cursor) this.cursor.hide();
    });
  }

  /* ── Exit orbit ─────────────────────────────────────── */

  _exitOrbit() {
    if (this.audio) this.audio.playClose();
    if (this.cursor) this.cursor.show();

    this.overlayManager.hideAll(() => {
      this.cameraController.returnToScroll(() => {
        this.isInOrbit = false;
        this.selectedObject = null;
      });
    });
  }

  /* ── Cursor hint ────────────────────────────────────── */

  _showCursorHint() {
    if (this.cursorHint) {
      gsap.to(this.cursorHint, { opacity: 1, duration: 0.3 });
    }
  }

  _hideCursorHint() {
    if (this.cursorHint) {
      gsap.to(this.cursorHint, { opacity: 0, duration: 0.3 });
    }
  }

  /** Call in render loop to update label visibility. */
  updateLabels() {
    for (const planet of this.solarSystem.planets) {
      if (planet._showLabel) {
        planet.showLabel();
      } else {
        planet.hideLabel();
      }
    }
  }
}
