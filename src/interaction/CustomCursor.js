import gsap from 'gsap';
import { CONFIG } from '../data/config.js';

/**
 * CustomCursor — luminous circle that follows the mouse.
 * Grows on hover over interactive objects, pulses on click.
 */
export class CustomCursor {
  constructor() {
    this._create();
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.isHovering = false;

    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    });

    window.addEventListener('mousedown', () => this._pulse());
  }

  _create() {
    // Outer ring
    this.outer = document.createElement('div');
    this.outer.id = 'custom-cursor-outer';
    document.body.appendChild(this.outer);

    // Inner dot
    this.inner = document.createElement('div');
    this.inner.id = 'custom-cursor-inner';
    document.body.appendChild(this.inner);
  }

  /** Call each frame (via requestAnimationFrame or render loop). */
  update() {
    const { smoothing } = CONFIG.cursor;

    this.currentX += (this.targetX - this.currentX) * smoothing;
    this.currentY += (this.targetY - this.currentY) * smoothing;

    this.outer.style.transform = `translate(${this.currentX}px, ${this.currentY}px) translate(-50%, -50%)`;
    this.inner.style.transform = `translate(${this.targetX}px, ${this.targetY}px) translate(-50%, -50%)`;
  }

  setHover(isHovering) {
    if (this.isHovering === isHovering) return;
    this.isHovering = isHovering;

    const size = isHovering ? CONFIG.cursor.hoverSize : CONFIG.cursor.size;
    gsap.to(this.outer, {
      width: size,
      height: size,
      borderColor: isHovering ? CONFIG.cursor.hoverColor : CONFIG.cursor.color,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  _pulse() {
    gsap.fromTo(
      this.outer,
      { scale: 1 },
      { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' },
    );
  }

  /** Hide cursor when over overlays. */
  hide() {
    this.outer.style.opacity = '0';
    this.inner.style.opacity = '0';
  }

  show() {
    this.outer.style.opacity = '1';
    this.inner.style.opacity = '1';
  }
}
