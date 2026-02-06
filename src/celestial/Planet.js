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
    const geo = new THREE.SphereGeometry(this.data.radius, 48, 48);

    // Procedural texture via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const baseColor = new THREE.Color(this.data.color);

    // Paint base
    ctx.fillStyle = this.data.color;
    ctx.fillRect(0, 0, 512, 256);

    // Add procedural noise / bands
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = Math.random() * 3 + 1;
      const variation = (Math.random() - 0.5) * 0.3;
      ctx.fillStyle = `rgba(${Math.floor((baseColor.r + variation) * 255)},${Math.floor((baseColor.g + variation) * 255)},${Math.floor((baseColor.b + variation) * 255)},0.3)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Horizontal bands for gas-giant feel
    for (let y = 0; y < 256; y += 8 + Math.random() * 16) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
      ctx.fillRect(0, y, 512, 2 + Math.random() * 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
    });

    this.bodyMesh = new THREE.Mesh(geo, mat);
    this.bodyMesh.userData = { type: 'planet', projectId: this.data.id };
    this.group.add(this.bodyMesh);
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
