// Small formatting + urgency helpers. Kept framework-free on purpose.

const eur = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const euros = (n) => eur.format(Math.round(n));

// Human countdown: "3 h 12", "24 min", "0:42" when under a minute-ish.
export function remainingLabel(ms) {
  if (ms <= 0) return 'échu';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h >= 1) return m > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
  if (m >= 1) return `${m} min`;
  return `${s} s`;
}

// Tight mono countdown for the Dynamic Island: "1:24:05", "24:18", "0:42".
export function clockLabel(ms) {
  if (ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h >= 1) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Fraction of the task window still left, 0..1.
export function remainingFraction(task, now) {
  const total = task.deadline - task.createdAt;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, (task.deadline - now) / total));
}

// Clinical hue: calm teal for most of a task's life, then a decisive ramp
// through amber to muted red across the final stretch (last ~half of the window).
export function urgencyColor(fraction) {
  const f = Math.min(1, Math.max(0, fraction));
  const urgency = f >= 0.5 ? 0 : Math.pow((0.5 - f) / 0.5, 0.8); // 0 calm .. 1 critical
  const hue = 165 - urgency * 157;        // 165 (teal) .. 8 (red)
  const sat = 32 + urgency * 26;          // desaturated, a touch hotter when critical
  const light = 60 - urgency * 5;
  return `hsl(${hue.toFixed(0)} ${sat.toFixed(0)}% ${light.toFixed(0)}%)`;
}

export const SOON_MS = 30 * 60 * 1000; // "less than 30 min" pulse threshold

export const $ = (sel, root = document) => root.querySelector(sel);
