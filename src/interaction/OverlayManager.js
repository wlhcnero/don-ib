import gsap from 'gsap';
import { CONFIG } from '../data/config.js';

/**
 * OverlayManager — controls the About and Project overlay panels.
 * All content is injected dynamically; overlays are hidden by default.
 * Uses staggered animations for cinematic text reveals.
 */
export class OverlayManager {
  constructor() {
    // About overlay
    this.aboutOverlay = document.getElementById('overlay-about');
    this.aboutTitle = this.aboutOverlay.querySelector('.overlay-title');
    this.aboutRole = this.aboutOverlay.querySelector('.overlay-role');
    this.aboutManifesto = this.aboutOverlay.querySelector('.overlay-manifesto');
    this.aboutBio = this.aboutOverlay.querySelector('.overlay-bio');

    // Project overlay
    this.projectOverlay = document.getElementById('overlay-project');
    this.projectTag = this.projectOverlay.querySelector('.overlay-tag');
    this.projectTitle = this.projectOverlay.querySelector('.overlay-project-title');
    this.projectDesc = this.projectOverlay.querySelector('.overlay-project-description');
    this.projectTech = this.projectOverlay.querySelector('.overlay-project-tech');
    this.projectYear = this.projectOverlay.querySelector('.overlay-project-year');
    this.projectLink = this.projectOverlay.querySelector('.overlay-project-link');

    this._bindCloseButtons();
    this._populateAbout();
  }

  _bindCloseButtons() {
    this.aboutOverlay.querySelector('.overlay-close').addEventListener('click', () => {
      this._onCloseRequest();
    });
    this.projectOverlay.querySelector('.overlay-close').addEventListener('click', () => {
      this._onCloseRequest();
    });
  }

  onClose = null;

  _onCloseRequest() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  /* ── About overlay ──────────────────────────────────── */

  _populateAbout() {
    const { name, role, manifesto, bio } = CONFIG.sun.identity;
    this.aboutTitle.textContent = name;
    this.aboutRole.textContent = role;
    this.aboutManifesto.textContent = `"${manifesto}"`;
    this.aboutBio.innerHTML = bio.map((p) => `<p>${p}</p>`).join('');
  }

  showAbout() {
    this.aboutOverlay.classList.remove('hidden');

    // Fade in backdrop
    gsap.fromTo(
      this.aboutOverlay,
      { opacity: 0 },
      { opacity: 1, duration: CONFIG.ui.overlayFadeIn, ease: 'power3.out' },
    );

    // Staggered content reveal
    const elements = [
      this.aboutTitle,
      this.aboutRole,
      this.aboutManifesto,
      ...this.aboutBio.querySelectorAll('p'),
    ];

    gsap.fromTo(
      elements,
      { opacity: 0, y: 25, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: CONFIG.ui.staggerDelay,
        ease: 'power3.out',
        delay: 0.2,
      },
    );
  }

  /* ── Project overlay ────────────────────────────────── */

  showProject(data) {
    this.projectTag.textContent = data.tag;
    this.projectTitle.textContent = data.title;
    this.projectDesc.textContent = data.description;
    this.projectYear.textContent = data.year;
    this.projectLink.href = data.link;

    this.projectTech.innerHTML = data.tech
      .map((t) => `<span class="tech-tag">${t}</span>`)
      .join('');

    this.projectOverlay.classList.remove('hidden');

    // Fade in backdrop
    gsap.fromTo(
      this.projectOverlay,
      { opacity: 0 },
      { opacity: 1, duration: CONFIG.ui.overlayFadeIn, ease: 'power3.out' },
    );

    // Staggered content reveal
    const elements = [
      this.projectTag,
      this.projectTitle,
      this.projectDesc,
      this.projectTech,
      this.projectYear,
      this.projectLink,
    ];

    gsap.fromTo(
      elements,
      { opacity: 0, y: 25, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: CONFIG.ui.staggerDelay,
        ease: 'power3.out',
        delay: 0.2,
      },
    );
  }

  /* ── Hide ────────────────────────────────────────────── */

  hideAll(onComplete) {
    const visible = [this.aboutOverlay, this.projectOverlay].filter(
      (el) => !el.classList.contains('hidden'),
    );

    if (visible.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    let done = 0;
    for (const el of visible) {
      gsap.to(el, {
        opacity: 0,
        y: 20,
        duration: CONFIG.ui.overlayFadeOut,
        ease: 'power3.in',
        onComplete: () => {
          el.classList.add('hidden');
          done++;
          if (done === visible.length && onComplete) onComplete();
        },
      });
    }
  }
}
