# Syndikal - SaaS de Gestion de Copropriété Multi-Résidences

Plateforme SaaS B2B de gestion de copropriétés avec gestion multi-résidences, portail résident, gestion des piscines, finances, réclamations, mode PWA hors-ligne et notifications multicanales.

---

## 🚀 Déploiement Automatique avec GitHub Actions (GitHub Pages)

Ce projet est configuré pour se compiler et se déployer automatiquement sur **GitHub Pages** à chaque commit sur `main` ou `master`, ainsi que manuellement.

### 1. Activer GitHub Pages dans votre dépôt GitHub

1. Rendez-vous sur votre dépôt GitHub : `https://github.com/<votre-utilisateur>/<votre-projet>`.
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans le menu latéral gauche, cliquez sur **Pages** (sous la section *Code and automation*).
4. Sous la section **Build and deployment** :
   - Choisissez **Source** : sélectionnez **`GitHub Actions`** (au lieu de *Deploy from a branch*).
5. Sauvegardez si demandé.

### 2. Déclencher le déploiement

Le déploiement se lance automatiquement de deux façons :
- **Automatique :** Poussez simplement vos modifications sur la branche `main` ou `master` (`git push origin main`).
- **Manuel :** 
  1. Allez dans l'onglet **Actions** de votre dépôt GitHub.
  2. Sélectionnez le workflow **Deploy to GitHub Pages** dans la colonne de gauche.
  3. Cliquez sur le bouton **Run workflow** à droite, puis validez.

Une fois le workflow terminé avec succès, le lien direct vers votre application hébergée sera affiché dans le résumé de l'exécution et dans l'onglet **Settings > Pages** (ex: `https://<votre-utilisateur>.github.io/<votre-projet>/`).

---

## 🛠️ Workflows GitHub Actions inclus

- **`.github/workflows/deploy.yml`** : Compile l'application Vite en mode production et la déploie directement sur **GitHub Pages**.
- **`.github/workflows/ci.yml`** : Vérifie la compilation et la validité du typage TypeScript (`npm run lint` et `npm run build`) sur chaque branche et Pull Request.

---

## 💻 Développement Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement (port 3000)
npm run dev

# Vérification du typage TypeScript
npm run lint

# Build de production
npm run build

# Prévisualisation du build de production
npm run preview
```
