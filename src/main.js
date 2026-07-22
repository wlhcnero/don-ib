import './styles/main.css';
import { store } from './state.js';
import { renderHome, tickHome } from './home.js';
import { tickIsland } from './island.js';
import { renderBilan } from './bilan.js';

const screens = {
  home: document.getElementById('screen-home'),
  bilan: document.getElementById('screen-bilan'),
};
const navItems = [...document.querySelectorAll('.nav-item')];

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.classList.toggle('hidden', key !== name);
  for (const item of navItems) {
    const active = item.dataset.screen === name;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  }
  if (name === 'bilan') renderBilan();
  if (name === 'home') tickHome();
}

navItems.forEach((item) => item.addEventListener('click', () => show(item.dataset.screen)));

// Rebuild both screens whenever the model changes (validate / expire / reseed).
store.subscribe(() => {
  renderHome();
  if (!screens.bilan.classList.contains('hidden')) renderBilan();
});

// Initial paint: sweep any expired persisted tasks first.
store.reconcile();
renderHome();
show('home');

// Heartbeat: advance countdowns, pulse, and settle deadlines once a second.
setInterval(() => {
  const now = Date.now();
  store.reconcile(now);   // emits + rebuilds only if something actually changed
  tickHome(now);
  tickIsland(now);
}, 1000);
tickIsland();
