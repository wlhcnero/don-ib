import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * ProximityHints — shows planet names very faintly when the camera
 * is nearby, without requiring a click. Invites exploration.
 */
export class ProximityHints {
  constructor(camera, solarSystem) {
    this.camera = camera;
    this.solarSystem = solarSystem;
    this._cameraPos = new THREE.Vector3();
    this._planetPos = new THREE.Vector3();
  }

  /** Call each frame. Updates label opacity based on camera distance. */
  update() {
    this._cameraPos.copy(this.camera.position);

    for (const planet of this.solarSystem.planets) {
      // Skip if already showing label from hover
      if (planet._showLabel) continue;

      planet.group.getWorldPosition(this._planetPos);
      const dist = this._cameraPos.distanceTo(this._planetPos);

      const { distance, maxOpacity } = CONFIG.proximity;

      if (dist < distance) {
        // Closer = more visible (but still very subtle)
        const t = 1 - dist / distance;
        const targetOpacity = t * maxOpacity;
        planet.label.material.opacity = THREE.MathUtils.lerp(
          planet.label.material.opacity,
          targetOpacity,
          0.05,
        );
      } else {
        // Fade out
        if (planet.label.material.opacity > 0.001) {
          planet.label.material.opacity = THREE.MathUtils.lerp(
            planet.label.material.opacity,
            0,
            0.05,
          );
        }
      }
    }
  }
}
