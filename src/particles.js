// Light-particle dissolve. A validated card breaks into drifting motes of light.
// Additive blending on a single shared canvas; multiple dissolves can overlap.

const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

let particles = [];
let raf = 0;
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
}
resize();
addEventListener('resize', resize);

function tick() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.globalCompositeOperation = 'lighter';

  let alive = false;
  for (const p of particles) {
    if (p.life <= 0) continue;
    alive = true;
    p.life -= 0.016;
    p.vy += 0.018;            // faint gravity, but they mostly rise
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;

    const t = Math.max(0, p.life / p.max);
    const a = t * t * p.alpha;
    const r = p.r * (0.5 + t * 0.5);

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
    g.addColorStop(0, `hsla(${p.hue}, 70%, 78%, ${a})`);
    g.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  particles = particles.filter((p) => p.life > 0);
  if (alive) raf = requestAnimationFrame(tick);
  else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); raf = 0; }
}

// Emit particles filling `rect` (a DOMRect), then resolve after a short beat.
export function dissolve(rect, hue = 158) {
  return new Promise((resolve) => {
    if (reduce.matches) { resolve(); return; }
    const count = Math.min(150, Math.max(60, Math.floor(rect.width * rect.height / 320)));
    for (let i = 0; i < count; i++) {
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      // bias upward drift; wider spread horizontally toward the swipe direction
      const max = 0.7 + Math.random() * 0.7;
      particles.push({
        x, y,
        vx: (Math.random() - 0.35) * 1.6,
        vy: -0.6 - Math.random() * 1.8,
        r: 0.6 + Math.random() * 1.6,
        hue: hue + (Math.random() * 24 - 12),
        alpha: 0.5 + Math.random() * 0.5,
        life: max,
        max,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
    setTimeout(resolve, 260);
  });
}
