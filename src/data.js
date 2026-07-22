// Seed content. Deadlines are relative to load time so the demo is always live.
// Realistic French tasks + amounts — no lorem, per the brief.

const MIN = 60 * 1000;
const H = 60 * MIN;

export function seedTasks(now = Date.now()) {
  const active = [
    { title: 'Séance renforcement',   amount: 25, from: 100 * MIN, to: 22 * MIN },
    { title: 'Méditation du soir',    amount: 12, from: 55 * MIN,  to: 38 * MIN },
    { title: 'Rendre le rapport Q3',  amount: 60, from: 5 * H,     to: 3 * H + 10 * MIN },
    { title: 'Appeler la banque',     amount: 18, from: 2 * H,     to: 6 * H },
    { title: 'Relire la pull request', amount: 30, from: 90 * MIN, to: 20 * H },
  ].map((t, i) => ({
    id: `t${now}_${i}`,
    title: t.title,
    amount: t.amount,
    createdAt: now - t.from,
    deadline: now + t.to,
    status: 'active',
    resolvedAt: null,
  }));

  // Already-settled tasks from earlier in the period — feed the Sankey bilan.
  const history = [
    { title: 'Course 5 km',        amount: 20, status: 'kept', ago: 2 * H },
    { title: 'Inbox à zéro',       amount: 15, status: 'kept', ago: 6 * H },
    { title: "Cours d'espagnol",   amount: 25, status: 'kept', ago: 26 * H },
    { title: 'Facturation clients', amount: 40, status: 'kept', ago: 30 * H },
    { title: "Publier l'article",  amount: 35, status: 'transferred', ago: 28 * H },
    { title: 'Prototype Figma',    amount: 30, status: 'transferred', ago: 52 * H },
  ].map((t, i) => ({
    id: `h${now}_${i}`,
    title: t.title,
    amount: t.amount,
    createdAt: now - t.ago - 4 * H,
    deadline: now - t.ago,
    status: t.status,
    resolvedAt: now - t.ago,
  }));

  return [...active, ...history];
}
