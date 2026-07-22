# Pacte — application de tâches à enjeu financier

## Vision
App mobile-first où chaque tâche porte un **montant engagé** : la valider à temps, l'argent
reste ; laisser passer l'échéance, il est transféré. Le ton est **calme, presque clinique** —
aucune gamification criarde (pas de confettis, pas de badges). La seule tension vient de
l'enjeu financier, jamais du design.

> Note : cette branche (`claude/financial-task-ui-design-fst458`) remplace le portfolio
> « Solar System » qui vit toujours sur `master`. C'est une app distincte, repartant de zéro.

## Concept
- **Écran d'accueil** : liste de « cartes de verre » flottantes, chacune = tâche + montant
  engagé, avec une fine barre de compte à rebours qui change de teinte (teal calme → ambre →
  rouge sourd) en approchant de l'échéance.
- **Swipe vers la droite** pour valider une carte → dissolution en particules de lumière.
- **Dynamic Island** (simulée, pilule en haut) : compte à rebours live de la tâche la plus
  urgente, pulsation douce sous 30 min, tap pour valider directement sans ouvrir l'app.
- **Écran Bilan** : Sankey minimaliste montrant, sur la période, combien est **resté** vs
  combien a été **transféré** (plus « en jeu », le solde encore actif).

## Stack
- **Vite 7** — build + dev server + HMR. `base: '/don-ib/'` (déploiement GitHub Pages).
- **Vanilla JS** (ES modules), aucun framework, DOM minimal. Une seule devDependency : `vite`.
- **Canvas 2D** pour les particules de lumière (blending additif).
- **SVG** pour le Sankey du bilan.
- État en mémoire + `localStorage` (`pacte:v1`), persistant entre les rechargements.

## Structure des modules
```
src/
  main.js         # Bootstrap : nav entre écrans, souscription au store, heartbeat 1 s
  state.js        # Store observable + persistance localStorage + cycle de vie des tâches
                  #   (validate → 'kept', reconcile() balaie les échéances → 'transferred',
                  #    et re-sème une période fraîche quand plus rien n'est en jeu)
  data.js         # seedTasks(now) : 5 tâches actives (échéances relatives à maintenant, donc
                  #   toujours vivantes) + un historique réglé pour alimenter le bilan
  home.js         # Écran Tâches : rendu des cartes, refresh live (barre/teinte/reste),
                  #   swipe-to-validate (pointer events) + commit() partagé avec l'île
  island.js       # Dynamic Island : tick live, état 'soon' < 30 min, tap = valider l'urgente
  bilan.js        # Écran Bilan : rubans Sankey (resté/transféré/en jeu) + légende chiffrée
  particles.js    # dissolve(rect, hue) : motes de lumière dérivant vers le haut, puis fondu
  util.js         # euros(), libellés de compte à rebours, remainingFraction(), urgencyColor()
  styles/main.css # Tokens (surfaces near-black, verre, teal/clay sémantiques), cartes, île,
                  #   nav, Sankey ; prefers-reduced-motion géré globalement
```

## Modèle de données (une tâche)
`{ id, title, amount (€), createdAt, deadline, status: 'active'|'kept'|'transferred', resolvedAt }`
- `remainingFraction` = (deadline − now) / (deadline − createdAt), pilote largeur de barre + teinte.
- `urgencyColor(fraction)` : teal (165°) tant qu'il reste > 50 % de la fenêtre, puis rampe
  décisive vers le rouge (8°) sur la dernière moitié. Désaturé, jamais néon.

## Direction artistique
- Fond near-black froid `#0A0B0D` / `#060708`, léger wash radial.
- Cartes en verre : `rgba(255,255,255,0.045)` + `backdrop-filter: blur`, bordures très fines.
- Sémantique sobre : resté `#5FB49C` (teal), transféré `#C86D5E` (clay), en jeu gris neutre.
- Typo : Space Grotesk (UI) + Space Mono (montants, comptes à rebours — registre « comptable »).
- Aucune animation criarde : respirations lentes, dissolutions douces ; tout se coupe sous
  `prefers-reduced-motion`.

## Commandes
```bash
npm install
npm run dev      # serveur de dev (HMR)
npm run build    # build production -> dist/
npm run preview  # preview du build (sert sous /don-ib/)
```

## Notes / limites connues
- **Dynamic Island** est *simulée* dans le navigateur (pilule fixe en haut) — la vraie DI iOS
  et le tap-hors-app nécessiteraient une app native + ActivityKit.
- **Google Fonts** est chargé au runtime (`index.html`). Sans egress vers `fonts.googleapis.com`
  (ex. certains sandbox), les fonts système prennent le relais — dégradation propre, pas d'erreur
  bloquante (juste un `ERR_CONNECTION_RESET` console inoffensif).
- Les tâches d'exemple sont semées avec des échéances **relatives à l'ouverture** pour que la
  démo soit toujours vivante ; `reconcile()` re-sème quand tout est réglé.
