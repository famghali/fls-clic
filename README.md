# Le Carnet de route linguistique — guide pas à pas

Ce projet est une base **réelle et fonctionnelle** : Next.js + Supabase (base de
données, authentification) + API Claude (correction automatique). Suis les
étapes dans l'ordre — chacune prend quelques minutes.

---

## Étape 1 — Créer le projet Supabase

1. Va sur https://supabase.com, connecte-toi (compte déjà créé ✅)
2. Clique **New project**
3. Donne-lui un nom (ex. `carnet-linguistique`), choisis un mot de passe pour
   la base de données (note-le quelque part), choisis une région proche de
   tes utilisateurs (ex. Canada Central)
4. Attends 1-2 minutes que le projet soit prêt

### Créer les tables
1. Dans le menu de gauche, clique **SQL Editor** → **New query**
2. Ouvre le fichier `supabase/schema.sql` de ce projet, copie tout son
   contenu, colle-le dans l'éditeur
3. Clique **Run** — toutes les tables et règles de sécurité sont créées
   d'un coup

### Récupérer tes clés
1. Menu de gauche → **Project Settings** → **API**
2. Note deux valeurs : **Project URL** et **anon public key**

### Désactiver la confirmation par courriel (optionnel, pour tester plus vite)
Menu **Authentication** → **Providers** → **Email** → décoche *Confirm
email* si tu veux que les comptes soient actifs immédiatement (à réactiver
avant un vrai lancement public).

---

## Étape 2 — Récupérer ta clé API Claude

1. Va sur https://console.anthropic.com → **API Keys** → **Create Key**
2. Copie la clé (elle ne sera plus jamais affichée en entier)

---

## Étape 3 — Configurer le projet sur ton ordinateur

1. Ouvre un terminal dans le dossier de ce projet
2. Installe les dépendances :
   ```
   npm install
   ```
3. Copie le fichier d'exemple :
   ```
   cp .env.local.example .env.local
   ```
   (sur Windows : `copy .env.local.example .env.local`)
4. Ouvre `.env.local` et remplace les trois valeurs par les tiennes
   (Supabase URL, Supabase anon key, clé API Anthropic)

---

## Étape 4 — Lancer le site en local

```
npm run dev
```

Ouvre http://localhost:3000 dans ton navigateur. Crée un compte enseignant,
puis un compte apprenant (dans un autre navigateur ou en navigation privée)
pour tester le flux complet.

---

## Étape 5 — Mettre le projet sur GitHub

1. Crée un compte sur https://github.com si tu n'en as pas
2. Crée un nouveau dépôt (repository), vide
3. Dans ton terminal, à la racine du projet :
   ```
   git init
   git add .
   git commit -m "Premier envoi"
   git branch -M main
   git remote add origin URL_DE_TON_DEPOT
   git push -u origin main
   ```
   (remplace `URL_DE_TON_DEPOT` par l'adresse donnée par GitHub)

⚠️ Le fichier `.env.local` ne sera **jamais** envoyé sur GitHub (il est
exclu automatiquement par `.gitignore`) — c'est voulu, il contient tes clés
secrètes.

---

## Étape 6 — Déployer sur Vercel (site en ligne, gratuit pour démarrer)

1. Va sur https://vercel.com, connecte-toi avec ton compte GitHub
2. Clique **Add New** → **Project**, choisis ton dépôt GitHub
3. Avant de cliquer *Deploy*, ouvre **Environment Variables** et ajoute les
   3 mêmes valeurs que dans `.env.local`
4. Clique **Deploy** — après 1-2 minutes, ton site est en ligne avec une
   adresse du type `ton-projet.vercel.app`

Chaque fois que tu modifieras le code et feras un `git push`, Vercel
redéploiera automatiquement la nouvelle version.

---

## Ce qui reste à faire ensuite

Cette base couvre les 4 modules demandés (documents, activités, grilles,
devoirs corrigés par l'IA) avec une vraie authentification et une vraie base
de données. Pour la suite, ouvre ce dossier avec **Claude Code** — dis-lui
simplement ce que tu veux ajouter ou ajuster (ex. "ajoute l'upload de vrais
fichiers PDF via Supabase Storage", "améliore le design du tableau de
bord") et il pourra modifier directement les fichiers du projet.

### Idées de prochaines étapes
- Upload de vrais fichiers PDF (via **Supabase Storage**, un espace de
  stockage inclus dans ton projet Supabase)
- Domaine personnalisé (ex. `moncarnet.ca`) au lieu de `.vercel.app`
- Vraie confirmation de courriel avant l'accès
- Tableau de suivi des progrès par apprenant
