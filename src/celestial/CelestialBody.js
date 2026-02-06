import * as THREE from 'three';

/**
 * CelestialBody — abstract base holding shared logic for Sun + Planet.
 */
export class CelestialBody {
  constructor({ position = { x: 0, y: 0, z: 0 } } = {}) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);
  }

  /** Override in subclass to run per-frame updates. */
  update(delta, elapsed) {}

  /** Convenience — returns the world position of this body. */
  getWorldPosition() {
    const v = new THREE.Vector3();
    this.group.getWorldPosition(v);
    return v;
  }
}
