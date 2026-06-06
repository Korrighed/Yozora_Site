# Technical Audit — Yozora VTuber Fan Site

**Date** : 2026-05-06  
**Scope** : Full codebase review (architecture, UX, accessibility, edge cases)

---

## Executive Summary

Base fonctionnelle après correctifs blockers (CORS, error leak, UX reload). Cependant :
- **Architecture** : `TwitchIntegration` concentre 4 responsabilités (god class)
- **QA** : 3 issues high severity trouvées (embed layout, API partial failure, prefers-reduced-motion CSS)
- **Accessibility** : 4 violations WCAG (focus trap, aria-live, button semantics, animations)

---

## Architecture & SRP

### Top 3 Violations

#### 1. TwitchIntegration — God Class (Bloquante)
**Fichier** : `src/components/TwitchIntegration.js` (133 lignes, 4 rôles)

**Problèmes** :
- Fetch API (`fetchTwitchData`)
- Polling & state machine (`checkLiveStatus`, `lastLiveStatus`, `lastVODId`)
- Rendu DOM banner + stream + clips (`updateBanner`, `updateStream`, `embed`, `renderClip`)
- Event wiring (CTA, prev/next, `setInterval`)

**Conséquence** : Impossible de tester unitairement le polling sans mock DOM. Couplage direct à `getElementById` × 7 dans le constructeur.

**Fix Recommandé** :
```
TwitchClient.js         // fetch + cache, retourne DTO
TwitchPoller.js         // setInterval, diff état, émet events
TwitchBannerView.js     // DOM banner uniquement
TwitchPlayerView.js     // iframe stream/VOD
ClipsCarouselView.js    // clips + nav
```
Orchestration dans `main.js` ou thin wrapper.

---

#### 2. TimezoneBlock — Calcul + DOM Mixés (Majeure)
**Fichier** : `src/components/TimezoneBlock.js`

**Problèmes** :
- Logique pure (`_getOffsetMinutes`, `_toLocalTime`, `_diffHours`, `_formatTime`)
- DOM + texte UI hardcodé (`updateUsualStreamContent`, `updateScheduleContent`)

**Fix Recommandé** :
- Créer `src/lib/timezone.js` (fonctions pures testables)
- Créer `src/components/TimezoneView.js` (DOM)
- Rendre les chaînes UI injectables (i18n future)

---

#### 3. MobileMenu — Creation DOM + State + Listeners (Majeure)
**Fichier** : `src/components/MobileMenu.js`

**Problèmes** :
- Construit son propre markup
- Gère l'ouvert/fermé
- Attache listeners `document`/`window`
- Paramètre mort (`toggleSelector` ignoré dans le constructeur)

**Statut** : Acceptable à cette taille, mais SRP demande séparation de concerns.

---

### Code Mort à Supprimer

| Fichier | Raison | Action |
|---|---|---|
| `src/style.css` | Orphelin Vite template, jamais importé | Supprimer |
| `src/components/TextBlock.js` | Jamais importé dans main.js | Supprimer |
| `src/components/Animation.js` | CLAUDE.md le mentionne mais pas appelé | Supprimer ou réintégrer |

---

### Structure Fichiers Recommandée

```
src/
  main.js
  components/
    twitch/
      TwitchClient.js        // fetch + cache
      TwitchPoller.js        // polling logic
      TwitchBannerView.js
      TwitchPlayerView.js
      ClipsCarouselView.js
    MobileMenu.js
    NotificationManager.js
    TimezoneView.js
  lib/
    timezone.js              // fonctions pures
  styles/
    main.css
    components/
      navbar.css
      mobile-menu.css        // kebab-case cohérent
      twitch-section.css
      ...
```

**Conventions** : Unifier kebab-case pour tous les CSS. Choisir :
- Utilitaires sans état → module de fonctions exportées (pas de classe statique)
- Composants avec état/DOM → classes instanciées

---

## QA & Edge Cases

### BLOCKERS (High Severity)

#### 1. embed-width-zero
**Test** : `offsetWidth = 0` lors du calcul d'embed si layout pas encore calculé

**Symptôme** : iframe invisible sur connexion lente
```js
// src/components/TwitchIntegration.js:80-81
const width = this.streamContainer.offsetWidth;
const height = Math.round(width * (9 / 16)); // → 0
```

**Fix** : ResizeObserver ou attendre le layout ready
```js
const resizeObserver = new ResizeObserver(() => {
  this.recalculateEmbeds();
});
resizeObserver.observe(this.streamContainer);
```

---

#### 2. twitch-api-partial-failure
**Test** : L'endpoint clips timeout, stream + videos répondent

**Symptôme** : Promise.all rejette → HTTP 500 → toute section Twitch tombe
```js
// netlify/functions/Twitch.js:77-101
const [streamRes, videosRes, clipsRes] = await Promise.all([...]);
// Si clipsRes timeout → catch entier rejette
```

**Fix** : Utiliser `Promise.allSettled` avec fallback par champ
```js
const results = await Promise.allSettled([streamRes, videosRes, clipsRes]);
const response = {
  isLive: results[0].status === 'fulfilled' ? streamData.data?.length > 0 : null,
  stream: results[0].status === 'fulfilled' ? streamData.data?.[0] : null,
  videos: results[1].status === 'fulfilled' ? videosData.data : [],
  clips: results[2].status === 'fulfilled' ? recentClips : [],
  broadcaster: results[0].status === 'fulfilled' ? userData.data?.[0] : null
};
```

---

#### 3. prefers-reduced-motion — CSS Animations Ignorées
**Test** : Activer `prefers-reduced-motion: reduce` OS, charger page

**Symptôme** : border-spin, live-pulse, star-tail/fall/shine continuent à tourner

**Fichiers Concernés** :
- `src/styles/components/shooting_stars.css` (@keyframes star-tail, star-fall, star-shine)
- `src/styles/components/background.css` (?)
- `src/styles/components/socials.css` (@keyframes chibi-left, chibi-right)
- `src/styles/components/twitch_section.css` (@keyframes border-spin, live-pulse)

**Fix** : Ajouter un bloc global en fin de `src/styles/main.css`
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### MEDIUM Severity Issues

#### 4. init-crash-no-clips
Clip counter affiche "1 / 5" bien que `clips = []`
- `clip-counter` HTML statique jamais réécrit si clips vides
- Boutons prev/next restent actifs (UX trompeuse)
- **Fix** : `renderClip()` met à jour le counter, garde les boutons dans state

#### 5. notification-init-blocks-permission-prompt
Permission demandée au load sans geste utilisateur
- Firefox 120+ l'ignore silencieusement
- **Fix** : Ne demander que sur clic explicite "Enable notifications"

#### 6. cors-localhost-mismatch
CORS hardcodée à Netlify URL rejette `localhost:8888` en dev
- **Fix** : Conditional check origin ou utiliser env var
```js
const allowedOrigin = process.env.NODE_ENV === 'development' 
  ? '*' 
  : 'https://yozovtfan.netlify.app';
```

#### 7. twitch-cta-keyboard-no-href
Button sans `aria-label` précisant "opens in new tab"
- Screen reader annonce juste "Watch button"
- **Fix** : Ajouter `aria-label="Watch on Twitch (opens in new tab)"`

#### 8. mobile-menu-focus-trap
Tab sort du menu, contenu masqué pas `aria-hidden`
- **Fix** : Implémenter focus trap + `aria-hidden="true"` sur main quand menu ouvert

---

### LOW Severity Issues

| # | Test | Fichier | Fix |
|---|---|---|---|
| 9 | live-to-offline-stale-embed | TwitchIntegration.js | Label disparaît silencieusement si VOD absent — ajouter feedback |
| 10 | timezone-dst-boundary | TimezoneBlock.js | Offset figé pendant changement DST — check toutes les heures ou sur visibility change |
| 11 | clip-aspect-ratio-css-vs-js | TwitchIntegration.js | Redondance 4/3 CSS vs width×3/4 JS — utiliser CSS seul, supprimer calc JS |
| 12 | live-status-aria-live | TwitchIntegration.js | `detail.textContent` (titre stream) pas annoncé — ajouter `aria-live="polite"` |

---

## Accessibility Audit

### WCAG 2.1 Violations

| # | Issue | Level | Fichier |
|---|---|---|---|
| 1 | Animations ignorent prefers-reduced-motion | AAA | CSS files (voir blocker #3) |
| 2 | Mobile menu: no focus trap, no aria-hidden main | AA | MobileMenu.js + index.html |
| 3 | Button "Watch on Twitch": pas d'indication "opens in new tab" | A | index.html:147 |
| 4 | Stream detail: pas d'aria-live pour la mise à jour | A | TwitchIntegration.js:52 |

---

## Test Plan — Production

1. **Live → Offline Transition**
   - Laisser la page 4+ minutes
   - Terminer le stream live
   - Vérifier : VOD label change, embed update, pas de reload page

2. **API Resilience**
   - Couper credentials TWITCH_CLIENT_SECRET dans Netlify 10 secondes
   - Restaurer
   - Vérifier : fallback message affiche, polling reprend

3. **Mobile Safari iOS**
   - Tester sur device réel
   - Vérifier : embed Twitch pas bloquée par ITP
   - Vérifier : `parent=` dans iframe URL = domaine Netlify exact

4. **Accessibility**
   - Activer `prefers-reduced-motion` OS (macOS Settings → Accessibility / Windows Settings → Ease of Access)
   - Charger page
   - Vérifier : aucune animation (étoiles filantes, border-spin, live-pulse arrêtés)

5. **Notification Permission**
   - Firefox 120+
   - Accepter la permission manuellement via site settings
   - Simuler changement live en modifiant réponse Function
   - Vérifier : notification système déclenche

---

## Fixes Appliqués (2026-05-06)

✅ CORS wildcard → restrict to Netlify URL  
✅ Error leak (message générique au client)  
✅ `window.location.reload()` → ciblé re-render  
✅ H1 duplication → h2 pour sections Twitch/Socials  
✅ Span CTA → button avec CSS reset  
✅ Status announcer → `role="status" aria-live="polite"`  
✅ Animation → check prefers-reduced-motion  
✅ Clips fetch → `first=100` → `first=20`  
✅ .gitignore → `.env.gh-pages`, remove `package-lock.json`  

---

## Priorité des Correctifs Futurs

| Priority | Issue | Effort | Impact |
|---|---|---|---|
| P0 (Immédiat) | embed-width-zero | 2h | Iframe visible/invisible |
| P0 (Immédiat) | prefers-reduced-motion CSS | 30min | WCAG AAA, UX |
| P0 (Immédiat) | twitch-api-partial-failure | 1h | Section Twitch reliable |
| P1 (Cette semaine) | TwitchIntegration refactor | 1 jour | SRP, testability |
| P1 (Cette semaine) | Mobile menu focus trap | 1h | Keyboard UX |
| P2 (Backlog) | TimezoneBlock → timezone.js | 1h | Code reuse |
| P2 (Backlog) | Code mort cleanup | 30min | Hygiene |
| P3 (Nice-to-have) | Notification permission UX | 1h | Best practice |

---

## Fichiers Clés

**Architecture/SRP** :
- `src/components/TwitchIntegration.js`
- `src/components/TimezoneBlock.js`
- `src/components/MobileMenu.js`

**Backend/API** :
- `netlify/functions/Twitch.js`

**Styling** :
- `src/styles/main.css`
- `src/styles/components/twitch_section.css`
- `src/styles/components/shooting_stars.css`

**Accessibility** :
- `index.html` (button, h1 duplication, menu)
- `src/components/NotificationManager.js`

---

**Généré par** : Architecture + QA + DevOps audit agents  
**Statut** : Prêt pour backlog de sprint
