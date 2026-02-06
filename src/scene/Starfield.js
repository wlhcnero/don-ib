import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * Starfield — procedural star particles filling the deep space background.
 */
export class Starfield {
  constructor() {
    const { count, radius, size, opacity } = CONFIG.starfield;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random position inside a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.3 + Math.random() * 0.7);

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Vary size slightly
      sizes[i] = size * (0.5 + Math.random() * 1.0);

      // Subtle colour variation (cool whites and blues)
      const colorTemp = 0.7 + Math.random() * 0.3;
      colors[i3] = colorTemp;
      colors[i3 + 1] = colorTemp;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(geometry, material);
  }

  /**
   * Slow drift rotation to add life to the background.
   */
  update(delta) {
    this.mesh.rotation.y += delta * 0.005;
    this.mesh.rotation.x += delta * 0.002;
  }
}
