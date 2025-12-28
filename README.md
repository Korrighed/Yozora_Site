# Simple template

This is a basic template for a Vite + JS app. 
It is meant to be easly served on gh-pages. 

## 🚀 Local Development with Netlify Functions

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Twitch API credentials:**
   - Copy `.env.example` to `.env`
   - Get your credentials from https://dev.twitch.tv/console/apps
   - Fill in your `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`

3. **Run local dev server with Functions:**
```bash
npm run dev
```

This will start:
- Vite dev server (your frontend)
- Netlify Functions locally at `http://localhost:8888/.netlify/functions/twitch`

### Available Scripts

- `npm run dev` - Run Netlify Dev (includes Vite + Functions)
- `npm run dev:vite` - Run only Vite (without Functions)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

# Naming convention
Don't forget to addapte the name of your projet to reflect the name of your repo
Rename the path in .env.gh-pages according to your repo name. 

## Manage existing branch

Suppression Locale
```
git branch -D gh-pages
```
Suppression Distante
```
git push origin --delete gh-pages
```
Crée et se déplacer sur la branch gh-pages
```
git checkout -b gh-pages
```

## gh-pages 
To deploy on git hub pages a sub branch of main as gh-pages.        
This sub branch will only serv the dist file. 

+ make assets
```sh
npm run build:gh-pages
```
+ add dist to the git 
```sh
git add dist -f 
```
+ commit said dist file 
```sh
git commit -m"Ajout Dist pour prod"
```
```sh
git subtree push --prefix dist origin gh-pages
```
Or
```sh
git subtree push --prefix dist template gh-pages
```
