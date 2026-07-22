// Home screen: floating glass cards, live hue-shifting countdown bars,
// swipe-right to validate with a light-particle dissolve.
import { store } from './state.js';
import { dissolve } from './particles.js';
import {
  euros, remainingLabel, remainingFraction, urgencyColor, SOON_MS,
} from './util.js';

const list = document.getElementById('cards');
const empty = document.getElementById('empty-state');
const stakeTotal = document.getElementById('stake-total');
const homeSub = document.getElementById('home-sub');

const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

function cardEl(task, index) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = task.id;
  el.dataset.created = task.createdAt;
  el.dataset.deadline = task.deadline;
  el.style.animationDelay = `${index * 55}ms`;
  el.innerHTML = `
    <div class="card-top">
      <div>
        <h2 class="card-title">${escape(task.title)}</h2>
        <p class="card-meta">Échéance ${timeFmt.format(task.deadline)}</p>
      </div>
      <span class="card-amount">${euros(task.amount)}</span>
    </div>
    <div class="bar"><div class="bar-fill"></div></div>
    <div class="card-remain"><span>Reste</span><span class="val"></span></div>
  `;
  bindSwipe(el, task.id);
  return el;
}

// Live-updating bits, called every tick without rebuilding the DOM.
function refreshCard(el, now) {
  const created = +el.dataset.created;
  const deadline = +el.dataset.deadline;
  const frac = remainingFraction({ createdAt: created, deadline }, now);
  const color = urgencyColor(frac);
  const fill = el.querySelector('.bar-fill');
  fill.style.transform = `scaleX(${frac})`;
  fill.style.backgroundColor = color;
  const val = el.querySelector('.val');
  val.textContent = remainingLabel(deadline - now);
  val.style.color = color;
  el.classList.toggle('urgent', deadline - now <= SOON_MS);
}

export function renderHome() {
  const now = Date.now();
  const tasks = store.activeTasks(now);
  list.innerHTML = '';
  tasks.forEach((t, i) => list.appendChild(cardEl(t, i)));
  empty.classList.toggle('hidden', tasks.length > 0);
  tickHome(now);
}

export function tickHome(now = Date.now()) {
  const totals = store.totals();
  stakeTotal.textContent = euros(totals.atStake);
  const n = store.activeTasks(now).length;
  homeSub.textContent = n
    ? 'Glisse une carte vers la droite pour la valider.'
    : 'Rien en jeu pour le moment.';
  for (const el of list.children) refreshCard(el, now);
}

// ---- swipe-to-validate ----

const THRESHOLD = 0.42;   // fraction of card width to trigger
let dragging = null;

function bindSwipe(el, id) {
  let startX = 0, dx = 0, width = 1, active = false;

  const down = (e) => {
    if (dragging) return;
    active = true; dragging = el;
    startX = e.clientX;
    width = el.offsetWidth;
    el.style.transition = 'none';
    el.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!active) return;
    dx = e.clientX - startX;
    if (dx < 0) dx *= 0.25;                       // resist leftward pull
    el.style.transform = `translateX(${dx}px) rotate(${dx * 0.012}deg)`;
    el.style.opacity = `${Math.max(0.35, 1 - dx / (width * 1.4))}`;
    el.classList.toggle('will-validate', dx > width * THRESHOLD);
  };
  const up = async () => {
    if (!active) return;
    active = false; dragging = null;
    el.classList.remove('will-validate');
    if (dx > width * THRESHOLD) {
      await commit(el, id);
    } else {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease';
      el.style.transform = '';
      el.style.opacity = '';
    }
    dx = 0;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

// Shared validate animation, used by both swipe and the Dynamic Island tap.
export async function commit(el, id) {
  const rect = el.getBoundingClientRect();
  el.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease';
  el.style.transform = `translateX(${rect.width * 0.5}px)`;
  el.style.opacity = '0';
  await dissolve(rect, 158);       // teal light = the stake stays with you
  store.validate(id);              // emits → renderHome rebuilds without this card
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}
