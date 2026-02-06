import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * ShootingStars — occasional bright streaks across the viewport.
 * Spawns a new shooting star every few seconds for a "living sky" feel.
 */
export class ShootingStars {
  constructor() {
    this.group = new THREE.Group();
    this.stars = [];
    this.timer = 0;
  }

  _spawn() {
    const { speed, length, color } = CONFIG.shootingStars;

    // Random start position in a wide area
    const startX = (Math.random() - 0.5) * 300;
    const startY = 30 + Math.random() * 80;
    const startZ = (Math.random() - 0.5) * 300;

    // Random direction (mostly downward-forward)
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      -0.3 - Math.random() * 0.4,
      -0.5 - Math.random() * 0.5,
    ).normalize();

    // Trail geometry — a line from start to start + dir * length
    const end = new THREE.Vector3().copy(dir).multiplyScalar(length);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      end,
    ]);

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const line = new THREE.Line(geometry, material);
    line.position.set(startX, startY, startZ);

    this.group.add(line);
    this.stars.push({
      mesh: line,
      direction: dir,
      speed,
      life: 0,
      maxLife: 1.5 + Math.random(),
      material,
    });
  }

  update(delta) {
    // Spawn timer
    this.timer += delta;
    if (this.timer > CONFIG.shootingStars.interval) {
      this.timer = 0;
      this._spawn();
    }

    // Update existing stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      star.life += delta;

      // Move along direction
      star.mesh.position.addScaledVector(star.direction, star.speed * delta);

      // Fade out
      const progress = star.life / star.maxLife;
      star.material.opacity = Math.max(0, 0.8 * (1 - progress));

      // Remove when dead
      if (star.life >= star.maxLife) {
        this.group.remove(star.mesh);
        star.mesh.geometry.dispose();
        star.material.dispose();
        this.stars.splice(i, 1);
      }
    }
  }
}
