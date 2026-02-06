import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';
import { CONFIG } from '../data/config.js';

import atmosphereVert from '../shaders/atmosphere.vert?raw';
import atmosphereFrag from '../shaders/atmosphere.frag?raw';

/**
 * Planet — a procedurally-textured sphere on an orbit around the Sun.
 * Each planet represents a project.
 */
export class Planet extends CelestialBody {
  /**
   * @param {Object} data — one entry from projects.json
   */
  constructor(data) {
    super({ position: { x: 0, y: 0, z: 0 } });

    this.data = data;
    this.orbitRadius = data.distance;
    this.orbitSpeed = data.orbitSpeed * CONFIG.planets.orbitSpeed;
    this.selfRotation = data.rotationSpeed * CONFIG.planets.rotationSpeed;
    this.orbitAngle = Math.random() * Math.PI * 2; // random start
    this.orbitTilt = (Math.random() - 0.5) * 0.15; // subtle tilt

    this.group.userData = { type: 'planet', projectId: data.id };

    this._createBody();
    this._createAtmosphere();
    this._createOrbitLine();

    if (data.hasRings) {
      this._createRings();
    }

    // Label (name) — invisible until hover
    this._createLabel();

    // Set initial position
    this._updateOrbitPosition(0);
  }

  /* ── Planet sphere ──────────────────────────────────── */

  _createBody() {
    const geo = new THREE.SphereGeometry(this.data.radius, 64, 64);

    const texture = this._generateTexture();
    const bumpMap = this._generateBumpMap();

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 0.03,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.bodyMesh = new THREE.Mesh(geo, mat);
    this.bodyMesh.userData = { type: 'planet', projectId: this.data.id };
    this.bodyMesh.rotation.z = (Math.random() - 0.5) * 0.3;
    this.group.add(this.bodyMesh);
  }

  /* ── Noise helpers for procedural textures ──────────── */

  _noise2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  _fbm(x, y, octaves = 5) {
    let value = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      value += amp * this._noise2D(x * freq, y * freq);
      amp *= 0.5;
      freq *= 2.1;
    }
    return value;
  }

  /* ── High-quality procedural color texture ──────────── */

  _generateTexture() {
    const w = 1024, h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    const d = imageData.data;
    const base = new THREE.Color(this.data.color);
    const name = this.data.name.toLowerCase();
    const isGas = name === 'jupiter' || name === 'saturn' || name === 'neptune';
    const seed = this.data.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const i = (py * w + px) * 4;
        const u = px / w, v = py / h;
        const th = u * Math.PI * 2, ph = v * Math.PI;
        const nx = Math.cos(th) * Math.sin(ph);
        const ny = Math.cos(ph);
        const nz = Math.sin(th) * Math.sin(ph);

        let r = base.r, g = base.g, b = base.b;

        if (isGas) {
          const bands = Math.sin(v * 30 + this._fbm(nx * 3, ny * 3) * 4) * 0.5 + 0.5;
          const turb = this._fbm(nx * 5 + seed * 0.1, nz * 5, 4) * 0.15;
          r += (bands - 0.5) * 0.25 + turb;
          g += (bands - 0.5) * 0.2 + turb * 0.8;
          b += (bands - 0.5) * 0.1 + turb * 0.5;
          if (name === 'jupiter') {
            const sd = Math.sqrt((u - 0.6) ** 2 * 4 + (v - 0.55) ** 2 * 16);
            if (sd < 0.15) { const si = 1 - sd / 0.15; r += si * 0.15; g -= si * 0.05; }
          }
        } else if (name === 'earth') {
          const cont = this._fbm(nx * 3 + seed * 0.1, nz * 3, 5);
          if (cont > 0.05) {
            const lv = this._fbm(nx * 8, nz * 8, 3) * 0.5 + 0.5;
            r = 0.15 + lv * 0.25; g = 0.35 + lv * 0.2; b = 0.1 + lv * 0.08;
          } else {
            r = 0.05; g = 0.15; b = 0.55 + this._fbm(nx * 6, nz * 6, 3) * 0.08;
          }
          if (Math.abs(v - 0.5) > 0.4) {
            const p = Math.min((Math.abs(v - 0.5) - 0.4) / 0.1, 1);
            r += (0.9 - r) * p; g += (0.92 - g) * p; b += (0.95 - b) * p;
          }
        } else if (name === 'mars') {
          const t = this._fbm(nx * 4 + seed * 0.1, nz * 4, 5) * 0.2;
          const cr = this._fbm(nx * 15, nz * 15, 3);
          r = base.r + t + 0.05; g = base.g * 0.6 + t * 0.5; b = base.b * 0.3 + t * 0.2;
          if (cr > 0.3) { const dd = (cr - 0.3) * 0.3; r -= dd; g -= dd; b -= dd; }
          if (v < 0.08 || v > 0.92) {
            const p = v < 0.08 ? 1 - v / 0.08 : (v - 0.92) / 0.08;
            r += (0.85 - r) * p * 0.6; g += (0.8 - g) * p * 0.6; b += (0.75 - b) * p * 0.6;
          }
        } else {
          const n1 = this._fbm(nx * 4 + seed * 0.1, nz * 4, 5) * 0.2;
          const n2 = this._fbm(nx * 12, nz * 12, 3) * 0.1;
          const cr = this._fbm(nx * 20, nz * 20 + seed, 2);
          r += n1 + n2; g += n1 * 0.8 + n2 * 0.7; b += n1 * 0.5 + n2 * 0.5;
          if (cr > 0.35) { const dd = (cr - 0.35) * 0.4; r -= dd; g -= dd; b -= dd; }
        }

        d[i] = Math.max(0, Math.min(255, r * 255)) | 0;
        d[i + 1] = Math.max(0, Math.min(255, g * 255)) | 0;
        d[i + 2] = Math.max(0, Math.min(255, b * 255)) | 0;
        d[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  /* ── Bump map for surface relief ────────────────────── */

  _generateBumpMap() {
    const w = 512, h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    const d = imageData.data;
    const seed = this.data.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const i = (py * w + px) * 4;
        const u = px / w, v = py / h;
        const th = u * Math.PI * 2, ph = v * Math.PI;
        const nx = Math.cos(th) * Math.sin(ph);
        const nz = Math.sin(th) * Math.sin(ph);
        const bump = (this._fbm(nx * 8 + seed * 0.1, nz * 8, 4) * 0.5 + 0.5) * 255;
        d[i] = d[i + 1] = d[i + 2] = bump | 0;
        d[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }

  /* ── Atmosphere halo ────────────────────────────────── */

  _createAtmosphere() {
    const atmosGeo = new THREE.SphereGeometry(
      this.data.radius * 1.15,
      32,
      32,
    );
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVert,
      fragmentShader: atmosphereFrag,
      uniforms: {
        uColor: { value: new THREE.Color(this.data.color) },
        uIntensity: { value: 0.6 },
        uCameraPosition: { value: new THREE.Vector3() },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.atmosMaterial = atmosMat;
    this.group.add(this.atmosMesh);
  }

  /* ── Orbit line ─────────────────────────────────────── */

  _createOrbitLine() {
    const segments = 128;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * this.orbitRadius,
          0,
          Math.sin(angle) * this.orbitRadius,
        ),
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: this.data.color,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    this.orbitLine = new THREE.Line(geo, mat);
    this.orbitLine.userData = { ignore: true };
  }

  /* ── Rings (Saturn-like) ────────────────────────────── */

  _createRings() {
    const inner = this.data.radius * 1.4;
    const outer = this.data.radius * 2.4;
    const ringGeo = new THREE.RingGeometry(inner, outer, 64);

    // Rotate UV so texture maps correctly
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const len = Math.sqrt(x * x + y * y);
      uv.setXY(i, (len - inner) / (outer - inner), 0.5);
    }

    const ringMat = new THREE.MeshBasicMaterial({
      color: this.data.ringColor || this.data.color,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.45;
    this.group.add(ringMesh);
  }

  /* ── Floating label ─────────────────────────────────── */

  _createLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '32px Space Grotesk, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(this.data.title, 256, 42);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.label = new THREE.Sprite(spriteMat);
    this.label.scale.set(this.data.radius * 4, this.data.radius * 0.5, 1);
    this.label.position.y = this.data.radius * 1.8;
    this.label.userData = { ignore: true };
    this.group.add(this.label);
  }

  /* ── Per-frame orbit & rotation ─────────────────────── */

  _updateOrbitPosition(elapsed) {
    this.orbitAngle += this.orbitSpeed * 0.01;
    this.group.position.x = Math.cos(this.orbitAngle) * this.orbitRadius;
    this.group.position.z = Math.sin(this.orbitAngle) * this.orbitRadius;
    this.group.position.y = Math.sin(this.orbitAngle * 0.5) * this.orbitTilt * this.orbitRadius;
  }

  update(delta, elapsed, camera) {
    this._updateOrbitPosition(elapsed);

    // Self rotation
    this.bodyMesh.rotation.y += this.selfRotation * delta;

    // Update atmosphere camera position
    if (camera) {
      this.atmosMaterial.uniforms.uCameraPosition.value.copy(camera.position);
    }
  }

  /** Show label (on hover). */
  showLabel() {
    if (this.label.material.opacity < 0.8) {
      this.label.material.opacity = Math.min(
        this.label.material.opacity + 0.05,
        0.8,
      );
    }
  }

  /** Hide label. */
  hideLabel() {
    if (this.label.material.opacity > 0) {
      this.label.material.opacity = Math.max(
        this.label.material.opacity - 0.05,
        0,
      );
    }
  }

  /** The main mesh used for raycasting clicks. */
  get interactiveMesh() {
    return this.bodyMesh;
  }
}
