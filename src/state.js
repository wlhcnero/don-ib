// Tiny observable store with localStorage persistence and task lifecycle.
import { seedTasks } from './data.js';

const KEY = 'pacte:v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.tasks) && parsed.tasks.length) return parsed.tasks;
    }
  } catch { /* ignore — falls through to a fresh seed */ }
  return seedTasks();
}

function save(tasks) {
  try { localStorage.setItem(KEY, JSON.stringify({ tasks })); } catch { /* private mode / quota */ }
}

const listeners = new Set();
let tasks = load();

function emit() { for (const fn of listeners) fn(tasks); }

export const store = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  all() { return tasks; },

  // Active tasks whose deadline is still ahead, urgent first.
  activeTasks(now = Date.now()) {
    return tasks
      .filter((t) => t.status === 'active' && t.deadline > now)
      .sort((a, b) => a.deadline - b.deadline);
  },

  mostUrgent(now = Date.now()) {
    return this.activeTasks(now)[0] || null;
  },

  get(id) { return tasks.find((t) => t.id === id) || null; },

  // Mark a task done — its stake stays with the user.
  validate(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status !== 'active') return;
    t.status = 'kept';
    t.resolvedAt = Date.now();
    save(tasks); emit();
  },

  // Sweep expired active tasks → their stake is transferred. Returns true if anything changed.
  reconcile(now = Date.now()) {
    let changed = false;
    for (const t of tasks) {
      if (t.status === 'active' && t.deadline <= now) {
        t.status = 'transferred';
        t.resolvedAt = t.deadline;
        changed = true;
      }
    }
    // Keep the demo alive: if nothing is in play anymore, reseed a fresh period.
    if (!tasks.some((t) => t.status === 'active' && t.deadline > now)) {
      tasks = seedTasks(now);
      changed = true;
    }
    if (changed) { save(tasks); emit(); }
    return changed;
  },

  totals() {
    const sum = (s) => tasks.filter((t) => t.status === s).reduce((a, t) => a + t.amount, 0);
    const count = (s) => tasks.filter((t) => t.status === s).length;
    return {
      kept: sum('kept'),
      transferred: sum('transferred'),
      atStake: tasks.filter((t) => t.status === 'active').reduce((a, t) => a + t.amount, 0),
      keptN: count('kept'),
      transferredN: count('transferred'),
    };
  },
};
