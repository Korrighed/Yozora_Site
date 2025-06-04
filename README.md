# Simple template

This is a basic template for a Vite + JS app. 
It is meant to be easly served on gh-pages. 

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
