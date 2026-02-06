/**
 * Global configuration — all adjustable parameters in one place.
 */

export const CONFIG = {
  // ── Scene ──────────────────────────────────────────────
  scene: {
    backgroundColor: 0x010108,
    fogColor: 0x010108,
    fogNear: 80,
    fogFar: 600,
  },

  // ── Camera path (scroll-driven) ───────────────────────
  camera: {
    fov: 55,
    near: 0.1,
    far: 2000,
    startPosition: { x: 0, y: 8, z: 60 },
    endPosition: { x: 0, y: 4, z: -180 },
    lookAheadOffset: 30, // camera looks this far ahead of its position
    scrollSpacerHeight: '600vh', // total scroll distance
  },

  // ── Sun ────────────────────────────────────────────────
  sun: {
    radius: 5,
    position: { x: 0, y: 0, z: 0 },
    color: 0xffaa33,
    emissiveIntensity: 2.5,
    glowSize: 14,
    coronaSpeed: 0.4,
    lightIntensity: 3,
    lightDistance: 500,
    identity: {
      name: 'Don Ibrahim',
      role: 'Creative Developer & Digital Artist',
      manifesto:
        'I craft immersive digital experiences where art meets technology. Every pixel has purpose, every interaction tells a story.',
      bio: [
        'Passionate creative developer specializing in immersive web experiences, 3D interactions, and visual storytelling.',
        'I believe the web is an infinite canvas — a place where code becomes poetry and interfaces become emotions.',
        'My work sits at the intersection of design, technology and human experience.',
      ],
    },
  },

  // ── Planets (projects) ────────────────────────────────
  planets: {
    orbitSpeed: 0.15, // base orbit animation speed
    rotationSpeed: 0.3, // base self-rotation speed
  },

  // ── Starfield ─────────────────────────────────────────
  starfield: {
    count: 6000,
    radius: 500,
    size: 0.6,
    opacity: 0.85,
  },

  // ── Post-processing ───────────────────────────────────
  bloom: {
    strength: 1.2,
    radius: 0.6,
    threshold: 0.3,
  },

  // ── Interaction ───────────────────────────────────────
  interaction: {
    hoverScale: 1.15,
    hoverDuration: 0.4,
    orbitDistance: 8, // camera distance when orbiting a planet
    orbitHeight: 3,
    transitionDuration: 1.8,
  },

  // ── UI ────────────────────────────────────────────────
  ui: {
    overlayFadeIn: 0.6,
    overlayFadeOut: 0.4,
  },
};
