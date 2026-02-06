import { CONFIG } from '../data/config.js';

/**
 * MouseParallax — adds subtle camera rotation offset based on mouse position.
 * Uses rotation only (not position) to avoid conflicts with CameraScrollController.
 * Creates the feeling of depth even when not scrolling.
 */
export class MouseParallax {
  constructor(camera) {
    this.camera = camera;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.enabled = true;

    window.addEventListener('mousemove', (e) => {
      this.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /** Call each frame — applies a subtle rotation offset. */
  update() {
    if (!this.enabled) return;

    const { intensity, smoothing } = CONFIG.parallax;

    // Smooth lerp
    this.currentX += (this.targetX - this.currentX) * smoothing;
    this.currentY += (this.targetY - this.currentY) * smoothing;

    // Apply as rotation offset (subtle head-tilt effect)
    const rotScale = intensity * 0.008;
    this.camera.rotation.y += -this.currentX * rotScale;
    this.camera.rotation.x += this.currentY * rotScale * 0.5;
  }
}
