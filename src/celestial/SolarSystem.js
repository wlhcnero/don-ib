import * as THREE from 'three';
import { Sun } from './Sun.js';
import { Planet } from './Planet.js';
import projectsData from '../data/projects.json';

/**
 * SolarSystem — orchestrates all celestial bodies.
 */
export class SolarSystem {
  constructor() {
    this.group = new THREE.Group();
    this.planets = [];

    this._createSun();
    this._createPlanets();
  }

  _createSun() {
    this.sun = new Sun();
    this.group.add(this.sun.group);
  }

  _createPlanets() {
    for (const data of projectsData) {
      const planet = new Planet(data);
      this.planets.push(planet);
      this.group.add(planet.group);
      this.group.add(planet.orbitLine);
    }
  }

  /** Per-frame update. */
  update(delta, elapsed, camera) {
    this.sun.update(delta, elapsed, camera);
    for (const planet of this.planets) {
      planet.update(delta, elapsed, camera);
    }
  }

  /** Returns flat array of meshes that should respond to raycasting. */
  getInteractiveObjects() {
    const objects = [this.sun.interactiveMesh];
    for (const planet of this.planets) {
      objects.push(planet.interactiveMesh);
    }
    return objects;
  }

  /** Find a planet by project id. */
  getPlanetById(id) {
    return this.planets.find((p) => p.data.id === id);
  }
}
