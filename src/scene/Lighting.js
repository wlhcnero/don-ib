import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * Lighting — point light at the Sun position to illuminate planets.
 */
export class Lighting {
  constructor() {
    const { lightIntensity, lightDistance, position } = CONFIG.sun;

    // Main sun light
    this.sunLight = new THREE.PointLight(
      0xffcc66,
      lightIntensity,
      lightDistance,
      1.5,
    );
    this.sunLight.position.set(position.x, position.y, position.z);

    // Secondary warm fill
    this.fillLight = new THREE.PointLight(0xff8833, 0.4, lightDistance, 2);
    this.fillLight.position.set(position.x, position.y, position.z);

    this.group = new THREE.Group();
    this.group.add(this.sunLight);
    this.group.add(this.fillLight);
  }
}
