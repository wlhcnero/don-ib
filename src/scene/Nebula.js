import * as THREE from 'three';
import { CONFIG } from '../data/config.js';

/**
 * Nebula — soft, semi-transparent cloud sprites scattered in the background.
 * Breaks the uniformity of deep space and adds visual richness.
 */
export class Nebula {
  constructor() {
    this.group = new THREE.Group();
    this._create();
  }

  _createCloudTexture(color1, color2) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Radial gradient cloud
    const cx = size / 2;
    const cy = size / 2;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.4, color2);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add some noise blobs for organic feel
    for (let i = 0; i < 30; i++) {
      const x = cx + (Math.random() - 0.5) * size * 0.6;
      const y = cy + (Math.random() - 0.5) * size * 0.6;
      const r = 10 + Math.random() * 40;
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
      g2.addColorStop(0, color1);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  _create() {
    const { count, minSize, maxSize, opacity, spread } = CONFIG.nebula;

    const colors = [
      ['rgba(80, 40, 120, 0.3)', 'rgba(40, 20, 80, 0.1)'],   // purple
      ['rgba(20, 50, 120, 0.3)', 'rgba(10, 25, 80, 0.1)'],    // blue
      ['rgba(120, 40, 40, 0.2)', 'rgba(80, 20, 20, 0.08)'],    // red
      ['rgba(40, 80, 120, 0.25)', 'rgba(20, 40, 80, 0.08)'],   // teal
      ['rgba(100, 60, 30, 0.2)', 'rgba(60, 30, 15, 0.08)'],    // warm
    ];

    for (let i = 0; i < count; i++) {
      const [c1, c2] = colors[i % colors.length];
      const texture = this._createCloudTexture(c1, c2);
      const size = minSize + Math.random() * (maxSize - minSize);

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(size, size, 1);
      sprite.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.3,
        (Math.random() - 0.5) * spread,
      );
      sprite.userData = { ignore: true };
      this.group.add(sprite);
    }
  }

  update(delta) {
    // Very slow drift
    this.group.rotation.y += delta * 0.001;
  }
}
