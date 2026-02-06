import { CONFIG } from '../data/config.js';

/**
 * AudioManager — Web Audio API ambient drone + interaction sounds.
 * Starts on first user interaction (click/scroll) to comply with autoplay policies.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.started = false;
    this.enabled = CONFIG.audio.enabled;

    if (this.enabled) {
      this._waitForInteraction();
    }
  }

  /* ── Start on first interaction ─────────────────────── */

  _waitForInteraction() {
    const start = () => {
      if (this.started) return;
      this._init();
      window.removeEventListener('click', start);
      window.removeEventListener('scroll', start);
      window.removeEventListener('touchstart', start);
    };

    window.addEventListener('click', start, { once: false });
    window.addEventListener('scroll', start, { once: false });
    window.addEventListener('touchstart', start, { once: false });
  }

  _init() {
    this.started = true;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(
      CONFIG.audio.masterVolume,
      this.ctx.currentTime + CONFIG.audio.fadeInDuration,
    );
    this.masterGain.connect(this.ctx.destination);

    this._createAmbientDrone();
  }

  /* ── Ambient space drone ────────────────────────────── */

  _createAmbientDrone() {
    const vol = CONFIG.audio.ambientVolume;

    // Deep bass oscillator
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(55, this.ctx.currentTime);
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(vol * 0.6, this.ctx.currentTime);

    // Subtle mid-tone for texture
    const mid = this.ctx.createOscillator();
    mid.type = 'sine';
    mid.frequency.setValueAtTime(110, this.ctx.currentTime);
    const midGain = this.ctx.createGain();
    midGain.gain.setValueAtTime(vol * 0.2, this.ctx.currentTime);

    // Slow LFO to modulate volume (breathing effect)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(vol * 0.15, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bassGain.gain);

    // High shimmer
    const shimmer = this.ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(440, this.ctx.currentTime);
    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(vol * 0.03, this.ctx.currentTime);

    // Connect to master
    bass.connect(bassGain);
    bassGain.connect(this.masterGain);
    mid.connect(midGain);
    midGain.connect(this.masterGain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);

    // Slight detune for richness
    mid.detune.setValueAtTime(5, this.ctx.currentTime);
    shimmer.detune.setValueAtTime(-8, this.ctx.currentTime);

    bass.start();
    mid.start();
    shimmer.start();
    lfo.start();
  }

  /* ── Interaction sounds ─────────────────────────────── */

  /** Short tonal ping for hover. */
  playHover() {
    if (!this.started || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(CONFIG.audio.hoverVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /** Deeper tone for click/select. */
  playSelect() {
    if (!this.started || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(CONFIG.audio.hoverVolume * 1.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  /** Reverse tone for closing. */
  playClose() {
    if (!this.started || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(CONFIG.audio.hoverVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}
