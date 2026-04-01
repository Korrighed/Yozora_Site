# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fan site for Yozora, a VTuber Raccoon Dog from New Zealand. Live at https://yozovtfan.netlify.app — Twitch: https://www.twitch.tv/yozora

**Stack:** Vanilla JavaScript (ESM), CSS, Bootstrap 5, Vite, Netlify Functions

## Commands

```bash
npm run dev          # Full local dev: Netlify Dev (Vite + Functions on :8888)
npm run dev:vite     # Vite only on :5173 (no Netlify Functions)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run build:gh-pages  # Build with gh-pages base path
```

Always use `npm run dev` (not `dev:vite`) when working on anything that touches the Twitch API — Functions won't be available otherwise.

## Architecture

**Single-page app** — one `index.html` with four sections: `#presentation`, `#twitch`, `#youtube`, `#socials`.

**Frontend → Netlify Function → Twitch Helix API.** Twitch credentials are kept server-side in `netlify/functions/Twitch.js`. The browser fetches from `/.netlify/functions/Twitch` (proxied from `/api/*` via `netlify.toml`).

`src/main.js` is the entry point. It imports CSS and initializes components in order: `TimezoneBlock` → `ImageAnimation` → `TwitchIntegration`. All components use named exports.

## Key Constraints

- **ESM everywhere:** `"type": "module"` in `package.json`. All files, including Netlify Functions, must use ES module syntax (`import`/`export`).
- **Named exports only:** Do not use default exports — components must be imported by name.
- **Case-sensitive function URL:** The file is `netlify/functions/Twitch.js` (capital T). The route is `/.netlify/functions/Twitch`.
- **Twitch username:** `yozora` (not `yozoravt`).

## Environment Variables

Required in `.env` (use `.env.example` as template):
```
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

Get credentials at https://dev.twitch.tv/console/apps (App type: Confidential). Set same variables in Netlify dashboard for production. Never commit `.env`.

## Twitch Function

`netlify/functions/Twitch.js` handles OAuth (Client Credentials flow, token cached 1 hour) and fetches from Helix endpoints: user info, live status, last 5 VODs, top 5 clips (last 7 days). Returns `{ isLive, stream, videos, clips, broadcaster }`.

`TwitchIntegration.js` polls this endpoint every 2 minutes and shows the live embed if live, otherwise falls back to the latest VOD.

## Styling

Plain CSS (SCSS was removed). Key files:
- `src/styles/main.css` — global styles, star pattern background, CSS variables (purple gradient theme: `#1E1954` → `#4237BA`, font: Playfair Display)
- `src/styles/components/` — per-component stylesheets

## Deployment

**Netlify:** Auto-deploys from `main`. Build command: `npm run build`, publish dir: `dist/`, functions dir: `netlify/functions/`.

**GitHub Pages (alternative):**
```bash
npm run build:gh-pages
git add dist -f
git commit -m "Build for gh-pages"
git subtree push --prefix dist origin gh-pages
```
