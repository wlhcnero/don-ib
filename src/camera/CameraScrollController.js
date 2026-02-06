import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * CameraScrollController — drives camera along a path as the user scrolls.
 * The camera travels from startPosition to endPosition on the z-axis,
 * looking ahead toward the next celestial bodies.
 */
export class CameraScrollController {
  constructor(camera) {
    this.camera = camera;
    this.progress = 0;
    this.enabled = true;
    this.lookTarget = new THREE.Vector3(0, 0, 0);
    this._savedPosition = null;
    this._savedLookTarget = null;

    this._setupScrollSpacer();
    this._setupScrollTrigger();
    this._setupIndicator();
  }

  /* ── Scroll spacer ──────────────────────────────────── */

  _setupScrollSpacer() {
    const spacer = document.getElementById('scroll-spacer');
    spacer.style.height = CONFIG.camera.scrollSpacerHeight;
  }

  /* ── GSAP ScrollTrigger ─────────────────────────────── */

  _setupScrollTrigger() {
    const start = CONFIG.camera.startPosition;
    const end = CONFIG.camera.endPosition;

    ScrollTrigger.create({
      trigger: '#scroll-spacer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        if (!this.enabled) return;

        this.progress = self.progress;

        // Interpolate position
        this.camera.position.x = THREE.MathUtils.lerp(start.x, end.x, this.progress);
        this.camera.position.y = THREE.MathUtils.lerp(start.y, end.y, this.progress);
        this.camera.position.z = THREE.MathUtils.lerp(start.z, end.z, this.progress);

        // Look ahead
        this.lookTarget.set(
          0,
          0,
          this.camera.position.z - CONFIG.camera.lookAheadOffset,
        );
        this.camera.lookAt(this.lookTarget);

        // Update indicator
        this._updateIndicator();
      },
    });
  }

  /* ── Scroll indicator ───────────────────────────────── */

  _setupIndicator() {
    this.indicatorThumb = document.getElementById('scroll-indicator-thumb');
    this.scrollHint = document.getElementById('scroll-hint');
  }

  _updateIndicator() {
    if (this.indicatorThumb) {
      this.indicatorThumb.style.height = `${this.progress * 100}%`;
    }
    // Fade out hint after a bit of scrolling
    if (this.scrollHint && this.progress > 0.05) {
      this.scrollHint.style.opacity = '0';
    }
  }

  /* ── Orbit mode (when clicking a planet) ────────────── */

  /**
   * Fly the camera to orbit around a target position, disabling scroll control.
   */
  flyTo(targetPosition, onComplete) {
    this.enabled = false;

    // Save current state to restore later
    this._savedPosition = this.camera.position.clone();
    this._savedLookTarget = this.lookTarget.clone();

    const { orbitDistance, orbitHeight, transitionDuration } = CONFIG.interaction;

    const dest = {
      x: targetPosition.x + orbitDistance,
      y: targetPosition.y + orbitHeight,
      z: targetPosition.z + orbitDistance * 0.5,
    };

    gsap.to(this.camera.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration: transitionDuration,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(targetPosition);
      },
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Return camera to its scroll-driven position.
   */
  returnToScroll(onComplete) {
    if (!this._savedPosition) {
      this.enabled = true;
      return;
    }

    gsap.to(this.camera.position, {
      x: this._savedPosition.x,
      y: this._savedPosition.y,
      z: this._savedPosition.z,
      duration: CONFIG.interaction.transitionDuration * 0.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(this._savedLookTarget);
      },
      onComplete: () => {
        this.enabled = true;
        this._savedPosition = null;
        this._savedLookTarget = null;
        if (onComplete) onComplete();
      },
    });
  }
}
