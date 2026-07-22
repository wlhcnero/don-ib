// Bilan: a minimalist Sankey. One source ("Engagé") splits into what stayed,
// what was transferred, and what is still in play. Muted ribbons, no drama.
import { store } from './state.js';
import { euros } from './util.js';

const mount = document.getElementById('sankey');
const legend = document.getElementById('bilan-legend');
const bilanTotal = document.getElementById('bilan-total');

const COLORS = { kept: '#5FB49C', transferred: '#C86D5E', stake: '#6B7079' };

// Smooth Sankey ribbon between a left segment [ly0,ly1] and right segment [ry0,ry1].
function ribbon(xL, xR, ly0, ly1, ry0, ry1) {
  const mx = (xL + xR) / 2;
  return [
    `M ${xL} ${ly0}`,
    `C ${mx} ${ly0}, ${mx} ${ry0}, ${xR} ${ry0}`,
    `L ${xR} ${ry1}`,
    `C ${mx} ${ry1}, ${mx} ${ly1}, ${xL} ${ly1}`,
    'Z',
  ].join(' ');
}

export function renderBilan() {
  const t = store.totals();
  const total = t.kept + t.transferred + t.atStake;
  bilanTotal.textContent = euros(total);

  const segs = [
    { key: 'kept',        label: 'Resté',      val: t.kept,        n: t.keptN },
    { key: 'transferred', label: 'Transféré',  val: t.transferred, n: t.transferredN },
    { key: 'stake',       label: 'En jeu',     val: t.atStake,     n: store.activeTasks().length },
  ].filter((s) => s.val > 0);

  if (total === 0) {
    mount.innerHTML = '<p class="empty">Aucun mouvement sur la période.</p>';
    legend.innerHTML = '';
    return;
  }

  const W = 380, H = 262, pad = 46, gap = 16;
  const xL = 78, barW = 13, xR = 300;
  const Ha = H - pad * 2;
  const rightSpan = Ha - gap * (segs.length - 1);

  let ly = pad, ry = pad, ribbons = '', rightBars = '', labels = '';

  for (const s of segs) {
    const lh = (s.val / total) * Ha;
    const rh = (s.val / total) * rightSpan;
    const c = COLORS[s.key];

    ribbons += `<path class="ribbon" d="${ribbon(xL + barW, xR, ly, ly + lh, ry, ry + rh)}"
      fill="${c}" opacity="${s.key === 'stake' ? 0.16 : 0.34}"/>`;
    rightBars += `<rect x="${xR}" y="${ry}" width="${barW}" height="${rh}" rx="3" fill="${c}"/>`;
    labels += `
      <text class="node-label" x="${xR + barW + 10}" y="${ry + rh / 2 - 4}">${s.label}</text>
      <text class="node-amt" x="${xR + barW + 10}" y="${ry + rh / 2 + 13}" fill="${c}">${euros(s.val)}</text>`;

    ly += lh;
    ry += rh + gap;
  }

  mount.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Répartition des montants engagés">
      <rect x="${xL}" y="${pad}" width="${barW}" height="${Ha}" rx="3" fill="#3A3E45"/>
      <text class="node-label" x="${xL + barW / 2}" y="${pad - 12}" text-anchor="middle">Engagé</text>
      <text class="node-amt" x="${xL + barW / 2}" y="${pad - 12 - 16}" text-anchor="middle" fill="#D9DBDE">${euros(total)}</text>
      ${ribbons}
      ${rightBars}
      ${labels}
    </svg>`;

  legend.innerHTML = segs.map((s) => `
    <div class="legend-row">
      <span class="swatch" style="background:${COLORS[s.key]}"></span>
      <span>${s.label}</span>
      <span class="lg-n">${s.n} tâche${s.n > 1 ? 's' : ''}</span>
      <span class="lg-amt">${euros(s.val)}</span>
    </div>`).join('');
}
