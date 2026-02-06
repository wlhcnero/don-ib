# Solar System Portfolio - Immersive Creative Experience

## Vision
Portfolio experimental immersif melant oeuvre contemplative et narration structuree.
Niveau de qualite vise : Awwwards / FWA.
Faire ressentir avant d'expliquer.

## Concept
- Systeme solaire realiste en 3D
- **Soleil** = createur (identite, page About)
- **Planetes** = projets (chaque planete = un projet)
- **Scroll** = voyage spatial (deplacement camera uniquement, aucun contenu n'apparait)
- **Click** = revelation du contenu (overlays narratifs)
- **Echap** = retour a l'exploration

## Experience Utilisateur
1. Le visiteur arrive, voit le systeme solaire immersif (loader de demarrage)
2. Le scroll deplace la camera le long de l'axe Z a travers le systeme
3. Aucun overlay/texte ne s'affiche sans clic explicite
4. Hover sur un corps celeste = scale up + label du projet
5. Click soleil = fly-to + overlay "A propos" (identite, manifeste, bio)
6. Click planete = fly-to en orbite + overlay projet (titre, description, tech, lien)
7. Fermeture overlay (X ou Echap) = retour fluide a la position scroll

## Architecture Technique

### Stack
- **Vite 7** - Build tool + dev server + HMR
- **Three.js 0.182** - Rendu 3D (vanilla, pas R3F pour controle total)
- **GSAP 3.14 + ScrollTrigger** - Animation scroll-driven + transitions camera
- **Shaders GLSL** - Soleil (noise 3D, corona, glow), atmospheres planetaires (fresnel)
- **Vanilla JS** (ES modules) - Zero framework UI, DOM minimal
- **Post-processing** - UnrealBloomPass pour l'eclat du soleil

### Structure des Modules
```
src/
  main.js                          # Point d'entree, bootstrap, render loop
  scene/
    SceneManager.js                # Scene, renderer, camera, bloom composer, resize, loop
    Lighting.js                    # PointLight au soleil + fill light
    Starfield.js                   # 6000 particules dans une sphere
  celestial/
    CelestialBody.js               # Classe abstraite (group, position, update)
    Sun.js                         # Sphere avec ShaderMaterial custom + glow sprite + corona ring
    Planet.js                      # Sphere procedurale + atmosphere fresnel + orbit line + label + rings
    SolarSystem.js                 # Orchestrateur: cree soleil + planetes depuis projects.json
  camera/
    CameraScrollController.js      # GSAP ScrollTrigger -> interpolation camera z-axis + flyTo/returnToScroll
  interaction/
    InteractionManager.js          # Raycaster hover/click, scale animation, cursor hint, orbit mode
    OverlayManager.js              # Injection DOM dynamique, animations GSAP des overlays
  data/
    projects.json                  # 7 projets (Mercury->Neptune), chaque entree contient: id, name, title, description, tech[], year, tag, link, radius, distance, color, orbitSpeed, rotationSpeed
    config.js                      # TOUS les parametres ajustables en un seul fichier
  shaders/
    sun.vert                       # Simplex noise 3D pour displacement de surface
    sun.frag                       # Layers de noise pour turbulence, gradient 3 couleurs, fresnel edge glow
    atmosphere.vert / .frag        # Fresnel-based atmosphere glow (BackSide, additive blending)
    glow.vert / .frag              # Radial glow pour sprites (soleil outer glow + corona)
  styles/
    main.css                       # Reset, canvas fixe, scroll spacer, indicateur, overlays, loader, responsive
```

### Parametres Ajustables (config.js)
- `scene` : backgroundColor, fog
- `camera` : fov, startPosition, endPosition, lookAheadOffset, scrollSpacerHeight
- `sun` : radius, glowSize, coronaSpeed, lightIntensity, identity (nom, role, manifeste, bio)
- `planets` : orbitSpeed, rotationSpeed (base multipliers)
- `starfield` : count, radius, size, opacity
- `bloom` : strength, radius, threshold
- `interaction` : hoverScale, hoverDuration, orbitDistance, orbitHeight, transitionDuration
- `ui` : overlayFadeIn, overlayFadeOut

### Projets (projects.json)
Chaque planete est definie par : id, name, title, description, tech[], year, tag, link, radius (taille = importance), distance (eloignement = chronologie), color, orbitSpeed, rotationSpeed. Saturn a `hasRings: true`.

## Direction Artistique
- Fond : espace profond `#010108` avec fog
- Ambiance : contemplative, silencieuse, elegante
- UI : invisible par defaut, apparait uniquement au clic
- Typographie : Space Grotesk (titres) + Space Mono (code/tech tags)
- Palette : noir profond, blanc lumineux, accents orange/or pour le soleil, couleur unique par planete
- Post-processing : bloom fort sur le soleil, subtil sur les atmospheres
- Orbites : lignes tres discretes (opacity 0.08, additive blending)

## Regles de Developpement
- Code commente en anglais
- Architecture modulaire (un fichier = une responsabilite)
- Pas de dependances inutiles (3 deps: three, gsap, vite)
- Performance : viser 60fps constant, pixelRatio cap a 2
- Responsive : adaptation desktop/mobile (CSS media queries)
- Accessibilite : navigation clavier (Echap pour fermer), labels semantiques
- Textures procedurales (canvas) pour eviter les fichiers lourds

## Commandes
```bash
npm run dev      # Serveur de developpement (HMR)
npm run build    # Build production -> dist/
npm run preview  # Preview du build
```

## Pour Personnaliser
1. **Identite** : modifier `CONFIG.sun.identity` dans `src/data/config.js`
2. **Projets** : editer `src/data/projects.json` (ajouter/modifier/supprimer des planetes)
3. **Visuels** : ajuster bloom, couleurs, tailles dans `config.js`
4. **Parcours camera** : modifier `startPosition` / `endPosition` / `scrollSpacerHeight`
