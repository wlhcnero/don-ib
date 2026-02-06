import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * MouseParallax — exposes a smooth offset vector based on mouse position.
 * The CameraScrollController applies this offset to its lookAt target,
 * so there's zero conflict with lookAt() or position interpolation.
 */
export class MouseParallax {
  constructor() {
    this.offset = new THREE.Vector2(0, 0);
    this._targetX = 0;
    this._targetY = 0;
    this.enabled = true;

    window.addEventListener('mousemove', (e) => {
      this._targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this._targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /** Call each frame — smoothly lerps the offset toward mouse target. */
  update() {
    if (!this.enabled) return;

    const { intensity, smoothing } = CONFIG.parallax;

    this.offset.x += (this._targetX * intensity - this.offset.x) * smoothing;
    this.offset.y += (this._targetY * intensity - this.offset.y) * smoothing;
  }
}
