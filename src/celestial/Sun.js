import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { CONFIG } from '../data/config.js';

// Import shaders as raw strings (Vite handles ?raw)
import sunVert from '../shaders/sun.vert?raw';
import sunFrag from '../shaders/sun.frag?raw';
import glowVert from '../shaders/glow.vert?raw';
import glowFrag from '../shaders/glow.frag?raw';

/**
 * Sun — custom shader sphere with animated surface, glow sprite and point light.
 */
export class Sun extends CelestialBody {
  constructor() {
    super({ position: CONFIG.sun.position });
    this.userData = { type: 'sun' };
    this.group.userData = { type: 'sun' };

    this._createCore();
    this._createGlow();
    this._createCorona();
  }

  /* ── Core sphere with animated shader ───────────────── */

  _createCore() {
    const geo = new THREE.SphereGeometry(CONFIG.sun.radius, 64, 64);

    this.coreMaterial = new THREE.ShaderMaterial({
      vertexShader: sunVert,
      fragmentShader: sunFrag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.sun.color) },
        uIntensity: { value: CONFIG.sun.emissiveIntensity },
      },
    });

    this.coreMesh = new THREE.Mesh(geo, this.coreMaterial);
    this.coreMesh.userData = { type: 'sun' };
    this.group.add(this.coreMesh);
  }

  /* ── Outer glow sprite ─────────────────────────────── */

  _createGlow() {
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: glowVert,
      fragmentShader: glowFrag,
      uniforms: {
        uColor: { value: new THREE.Color(0xffaa33) },
        uIntensity: { value: 0.6 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const glowGeo = new THREE.PlaneGeometry(
      CONFIG.sun.glowSize,
      CONFIG.sun.glowSize,
    );
    this.glowMesh = new THREE.Mesh(glowGeo, glowMaterial);
    this.glowMesh.renderOrder = -1;
    this.group.add(this.glowMesh);
  }

  /* ── Corona ring ────────────────────────────────────── */

  _createCorona() {
    const coronaGeo = new THREE.RingGeometry(
      CONFIG.sun.radius * 1.05,
      CONFIG.sun.radius * 2.2,
      64,
    );
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: glowVert,
      fragmentShader: glowFrag,
      uniforms: {
        uColor: { value: new THREE.Color(0xff6600) },
        uIntensity: { value: 0.35 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.coronaMesh.renderOrder = -1;
    this.group.add(this.coronaMesh);
  }

  /* ── Per-frame update ───────────────────────────────── */

  update(delta, elapsed, camera) {
    // Animate core shader
    this.coreMaterial.uniforms.uTime.value = elapsed;

    // Glow + corona always face camera
    if (camera) {
      this.glowMesh.quaternion.copy(camera.quaternion);
      this.coronaMesh.quaternion.copy(camera.quaternion);
    }

    // Animate glow
    this.glowMesh.material.uniforms.uTime.value = elapsed;
    this.coronaMesh.material.uniforms.uTime.value = elapsed;

    // Slow rotation
    this.coreMesh.rotation.y += delta * CONFIG.sun.coronaSpeed * 0.2;
  }

  /** The main mesh used for raycasting clicks. */
  get interactiveMesh() {
    return this.coreMesh;
  }
}
