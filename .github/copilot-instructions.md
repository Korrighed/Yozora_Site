# Yozora Fan Site - Project Context

## 🎯 Project Overview
Fan site for **Yozora**, a VTuber Racoon Dog from New Zealand. Built with Vite, SCSS, and Netlify Functions.

**Live URL (Netlify)**: https://yozovtfan.netlify.app  
**Twitch Channel**: https://www.twitch.tv/yozora

---

## 🏗️ Tech Stack

### Frontend
- **Vite** - Build tool
- **Sass/SCSS** - Styling with Bootstrap 5
- **Vanilla JavaScript** - ES6 modules
- **Bootstrap 5** - CSS framework

### Backend
- **Netlify Functions** - Serverless API for Twitch integration
- **Node Fetch** - HTTP client for API calls

### Deployment
- **Netlify** - Primary hosting with Functions
- **GitHub Pages** - Alternative deployment (gh-pages branch)

---

## 📁 Project Structure

```
├── index.html                    # Main HTML file
├── package.json                  # Dependencies & scripts
├── netlify.toml                  # Netlify configuration
├── .env.example                  # Environment variables template
├── .env                          # Local credentials (gitignored)
├── netlify/functions/
│   └── Twitch.js                 # Serverless function for Twitch API
├── src/
│   ├── main.js                   # Entry point
│   ├── style.css                 # Base styles
│   ├── components/
│   │   ├── Animation.js          # Chibi dancing animation
│   │   ├── TextBlock.js          # Decorative text blocks
│   │   ├── TimezoneBlock.js      # Timezone converter for streams
│   │   └── TwitchIntegration.js  # Twitch embed & API integration
│   └── styles/
│       ├── main.scss             # Main SCSS with starry background
│       ├── _variables.scss       # Color & font variables
│       ├── _navbar_overrides.scss # Bootstrap navbar customization
│       └── components/           # Component-specific styles
```

---

## 🔧 Development Setup

### Prerequisites
```bash
npm install
```

### Environment Variables
Create `.env` from `.env.example`:
```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

**Get credentials**: https://dev.twitch.tv/console/apps  
- Type: **Confidential**
- OAuth Redirect: `https://yozovtfan.netlify.app`

### Local Development
```bash
npm run dev          # Netlify Dev (Vite + Functions on :8888)
npm run dev:vite     # Vite only (no Functions, :5173)
npm run build        # Production build
```

**Important**: Use `npm run dev` to test Twitch integration locally!

---

## 🎨 Key Features

### 1. Twitch Integration
- **Live Stream Embed** - Auto-detects if streamer is live
- **VOD Display** - Shows latest VOD when offline
- **Clips Gallery** - Top 5 clips from last 7 days
- **Auto-refresh** - Checks live status every 2 minutes

**API Flow**:
```
Browser → /.netlify/functions/Twitch → Twitch Helix API
```

**Credentials are NEVER exposed to browser** - they stay server-side in Netlify Functions.

### 2. Timezone Calculator
- Converts EST stream times to user's local timezone
- Updates schedule messages dynamically
- Shows time difference for weekly schedules

### 3. Chibi Animation
- Dancing chibi image that alternates between two frames
- Configurable interval (default: 1500ms)

---

## 🚨 Known Issues & Fixes

### Import/Export Convention
All components use **named exports**:
```javascript
// ✅ Correct
import { TwitchIntegration } from './components/TwitchIntegration.js'
export { TwitchIntegration }

// ❌ Wrong
import TwitchIntegration from './components/TwitchIntegration.js'
export default TwitchIntegration
```

### Netlify Function Format
- File: `netlify/functions/Twitch.js` (capital T)
- Format: **ESM** (not CommonJS)
- URL: `/.netlify/functions/Twitch` (case-sensitive)

```javascript
// ✅ Correct (ESM)
import fetch from 'node-fetch'
export const handler = async (event, context) => { ... }

// ❌ Wrong (CommonJS - causes warnings)
const fetch = require('node-fetch')
exports.handler = async (event, context) => { ... }
```

### Twitch Username
- **Correct**: `yozora` (not `yozoravt`)
- Update in: `netlify/functions/Twitch.js` line 54

---

## 📝 Scripts Reference

```json
{
  "dev": "netlify dev",           // Local dev with Functions
  "dev:vite": "vite",              // Vite only (no Functions)
  "build": "vite build",           // Production build
  "build:gh-pages": "vite build --mode gh-pages",
  "preview": "vite preview"
}
```

---

## 🔒 Security

### Environment Variables

**Local (.env)**:
- Never commit `.env` (in `.gitignore`)
- Use `.env.example` as template

**Production (Netlify)**:
1. Site configuration → Environment variables
2. Add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
3. Scope: Production or All deploy contexts

### CORS & API Safety
- Twitch API calls go through Netlify Functions (server-side)
- Frontend only receives public data
- Client credentials never exposed to browser

---

## 🎯 Current Status

### ✅ Working
- [x] Local development with Netlify Dev
- [x] Twitch API integration (streams, VODs, clips)
- [x] Timezone conversion
- [x] Chibi animation
- [x] Bootstrap 5 styling
- [x] Responsive design

### 🚧 In Progress
- [ ] UI/UX improvements (currently "très moche" per user)
- [ ] YouTube section
- [ ] Social links section
- [ ] Auto-publishing disabled on Netlify during dev

### 📋 Todo
- [ ] Improve Twitch embed styling
- [ ] Add loading states
- [ ] Error handling UI
- [ ] Mobile optimization
- [ ] Notification system for live streams

---

## 🐛 Debugging Tips

### Check Network Tab
```
F12 → Network → Fetch/XHR
Look for: /.netlify/functions/Twitch
Status: 200 ✅ | 404 (function not found) | 500 (error)
```

### Check Console
Common errors:
- `è is not defined` → Fixed in TimezoneBlock.js
- `TwitchIntegration not exported` → Use named export
- `Broadcaster not found` → Check username in Twitch.js

### Netlify Dev Logs
Terminal shows:
- Function reloads
- API errors with stack traces
- Request/response status

---

## 📚 API Endpoints Used

### Twitch Helix API
All endpoints are **public** (no stream key required):

```javascript
// Get user info
GET /helix/users?login=yozora

// Check if live
GET /helix/streams?user_login=yozora

// Get VODs
GET /helix/videos?user_id={id}&first=5&sort=time&type=archive

// Get clips
GET /helix/clips?broadcaster_id={id}&first=5&started_at={date}
```

**Authentication**: App Access Token (Client Credentials OAuth)

---

## 🎨 Styling Notes

### Color Scheme
See `src/styles/_variables.scss`:
- Primary: Playfair Display font
- Background: Purple gradient with starry pattern
- Bootstrap 5 with custom navbar overrides

### Responsive Breakpoints
- Desktop: Large layout with 3 columns
- Mobile: TBD (currently desktop-first)

---

## 🚀 Deployment

### Netlify (Primary)
1. Push to `main` branch
2. Netlify auto-builds (currently disabled)
3. Functions deployed automatically
4. Environment variables set in Netlify dashboard

### GitHub Pages (Alternative)
```bash
npm run build:gh-pages
git add dist -f
git commit -m "Build for production"
git subtree push --prefix dist origin gh-pages
```

---

## 🤝 Developer Notes

- **Module format**: ESM everywhere (`"type": "module"` in package.json)
- **Case sensitivity**: Function names must match URLs exactly
- **CORS**: Handled by Netlify Functions, no frontend config needed
- **Testing**: Always use `npm run dev` for full stack testing
- **Commits**: Descriptive messages, push after major features work

---

## 📞 Resources

- Twitch Dev Console: https://dev.twitch.tv/console/apps
- Twitch API Docs: https://dev.twitch.tv/docs/api
- Netlify Functions: https://docs.netlify.com/functions/overview
- Vite Docs: https://vitejs.dev

---

**Last Updated**: December 28, 2025  
**Status**: Development (auto-publish disabled)
