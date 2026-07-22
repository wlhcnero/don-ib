// Dynamic Island: live countdown of the single most urgent task.
// Soft pulse under 30 min; tap validates that task without opening anything.
import { store } from './state.js';
import { clockLabel, urgencyColor, remainingFraction, SOON_MS } from './util.js';
import { commit } from './home.js';

const island = document.getElementById('island');
const titleEl = island.querySelector('.island-title');
const countEl = island.querySelector('.island-count');
const dotEl = island.querySelector('.island-dot');

let currentId = null;

export function tickIsland(now = Date.now()) {
  const t = store.mostUrgent(now);
  if (!t) {
    island.classList.add('hidden');
    currentId = null;
    return;
  }
  currentId = t.id;
  island.classList.remove('hidden');

  const left = t.deadline - now;
  const color = urgencyColor(remainingFraction(t, now));
  titleEl.textContent = t.title;
  countEl.textContent = clockLabel(left);
  countEl.style.color = color;
  dotEl.style.background = color;
  island.classList.toggle('soon', left <= SOON_MS);
}

async function validateUrgent() {
  if (!currentId) return;
  const id = currentId;
  // If its card is on screen, run the full dissolve; otherwise validate directly.
  const el = document.querySelector(`.card[data-id="${id}"]`);
  if (el) await commit(el, id);
  else store.validate(id);
}

island.addEventListener('click', validateUrgent);
island.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); validateUrgent(); }
});
