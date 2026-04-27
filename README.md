# Voisinons.fr

[![Keyway Secrets](https://www.keyway.sh/badge.svg?repo=NicolasRitouet/voisinons.fr)](https://www.keyway.sh/vaults/NicolasRitouet/voisinons.fr)

Application web gratuite pour organiser des fêtes de voisins (fête de quartier, fête de rue, apéro d'immeuble, etc.).

## Fonctionnalités

- Création de pages d'événements avec URL personnalisée
- Inscription des participants (sans création de compte)
- Génération d'affiches PDF avec QR code
- Dashboard d'administration pour les organisateurs
- Emails de confirmation automatiques
- Pages légales conformes RGPD/LCEN

## Stack technique

- **Framework** : Next.js 16 (App Router, Turbopack)
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **PDF** : @react-pdf/renderer
- **Emails** : Resend
- **Secrets** : [Keyway](https://keyway.sh)
- **Validation** : Zod
- **Tests** : Vitest
- **Node.js** : >= 20.9.0

## Installation

### Prérequis

- Node.js >= 20.9.0
- PostgreSQL
- [Keyway CLI](https://docs.keyway.sh/cli) pour la gestion des secrets

### Setup

1. Cloner le repository :

```bash
git clone https://github.com/NicolasRitouet/voisinons.fr.git
cd voisinons.fr
```

2. Installer les dépendances :

```bash
npm install
```

3. Configurer Keyway :

```bash
# Se connecter à Keyway (ouvre le navigateur pour auth GitHub)
npx @keywaysh/cli login

# Récupérer les secrets de développement
npx @keywaysh/cli pull -e development
```

4. Variables d'environnement requises :

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | Oui |
| `RESEND_API_KEY` | Clé API Resend pour les emails | Non |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | Non |
| `UPLOADTHING_TOKEN` | Token UploadThing pour les images | Oui |

5. Créer la base de données et appliquer le schéma :

```bash
# Créer la base de données PostgreSQL
createdb voisinons

# Appliquer les migrations
npm run db:migrate
```

6. Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Gestion des secrets avec Keyway

Ce projet utilise [Keyway](https://keyway.sh) pour la gestion des secrets. Les secrets sont injectés en mémoire (jamais écrits sur disque).

### Commandes utiles

```bash
# Récupérer les secrets d'un environnement
npx @keywaysh/cli pull -e development
npx @keywaysh/cli pull -e production

# Ajouter/modifier une variable
npx @keywaysh/cli set DATABASE_URL=postgresql://... -e development

# Exécuter une commande avec les secrets injectés
npx @keywaysh/cli run -e development -- <commande>

# Comparer les secrets entre environnements
npx @keywaysh/cli diff development production

# Vérifier la configuration
npx @keywaysh/cli doctor
```

### Environnements

| Environnement | Usage |
|---------------|-------|
| `development` | Développement local |
| `production` | Production (Vercel) |

Les scripts npm (`dev`, `build`, `start`, `db:*`) utilisent automatiquement Keyway avec l'environnement approprié.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer le serveur de production |
| `npm run lint` | Linter ESLint |
| `npm run test` | Lancer les tests (watch mode) |
| `npm run test:run` | Lancer les tests une fois |
| `npm run test:coverage` | Tests avec couverture |
| `npm run db:generate` | Générer une nouvelle migration depuis le schéma |
| `npm run db:migrate` | Appliquer les migrations en local (dev) |
| `npm run db:migrate:prod` | Appliquer les migrations en production |
| `npm run db:bootstrap` | Marquer les migrations existantes comme appliquées (one-shot) |
| `npm run db:bootstrap:prod` | Idem en production |
| `npm run db:push` | Synchroniser le schéma sans migration (dev uniquement, à éviter) |
| `npm run db:studio` | Ouvrir Drizzle Studio |

## Monitoring (Sentry)

Le SDK `@sentry/nextjs` est intégré et **inactif tant que `SENTRY_DSN` n'est pas défini** — zéro impact en local.

### Activer Sentry

1. Créer un projet Sentry (`Next.js`).
2. Ajouter dans Vercel (et Keyway pour le local si besoin) :

| Variable | Où | Visibilité |
|---|---|---|
| `SENTRY_DSN` | Server runtime | Privé |
| `NEXT_PUBLIC_SENTRY_DSN` | Client runtime | **Public** (exposé au navigateur) |
| `SENTRY_AUTH_TOKEN` | Build-time uniquement | Privé — pour upload des sourcemaps |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Build-time | Privé |

3. Ajouter `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` dans les secrets GitHub Actions pour que la CI uploade les sourcemaps lors des builds.

### Ce qui est configuré

- **Error monitoring** côté serveur (server actions, API routes), edge et client (`global-error.tsx`).
- **Tracing** activé à 10 % en production.
- **Session Replay** : 0 % des sessions normales, 100 % des sessions avec erreur (champs masqués par défaut).
- **Logs structurés** (`Sentry.logger.*`).
- **Tunnel `/monitoring`** pour bypasser les bloqueurs de pub.
- `sendDefaultPii: false` — IPs et headers ne sont **pas** envoyés (RGPD). À reconsidérer après déclaration de Sentry comme sous-traitant DPO.

## Intégration continue (CI)

GitHub Actions exécute les checks suivants sur chaque PR vers `main` et chaque push sur `main` (`.github/workflows/ci.yml`) :

- **Lint** — `npm run lint`
- **Type check** — `npx tsc --noEmit`
- **Unit tests** — `npm run test:run`
- **Migrations up-to-date** — vérifie qu'aucune modification de `src/lib/db/schema.ts` n'a été faite sans la migration Drizzle correspondante. Si la CI échoue ici, lancer `npm run db:generate` en local et committer les fichiers générés.
- **Build** — `npm run build` avec des variables d'environnement factices (les vrais secrets sont injectés par Vercel au moment du déploiement).

Les tests E2E Playwright ne sont pas encore intégrés à la CI (ils nécessitent une base PostgreSQL et la configuration des secrets Keyway). Lancer en local : `npm run test:e2e`.

## Migrations de base de données

### Workflow normal

```bash
# 1. Modifier le schéma dans src/lib/db/schema.ts
# 2. Générer la migration
npm run db:generate
# 3. Vérifier le SQL produit dans drizzle/
# 4. Appliquer en local
npm run db:migrate
# 5. En prod (après merge)
npm run db:migrate:prod
```

### Bootstrap d'une base existante (one-shot)

Si la base de production a été créée avec `db:push` (sans historique de migrations),
il faut marquer la migration baseline comme déjà appliquée pour éviter que
`db:migrate` essaie de recréer les tables :

```bash
npm run db:bootstrap:prod
```

Le script crée la table `drizzle.__drizzle_migrations` et y insère le hash de
chaque migration présente dans `drizzle/`. Il est idempotent : on peut le relancer
sans risque, il ignore les migrations déjà tracées.

À faire **une seule fois** par environnement, après quoi le workflow normal s'applique.

## Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── page.tsx           # Landing page
│   ├── creer/             # Page de création de fête
│   ├── [slug]/            # Page publique d'une fête
│   │   └── admin/         # Dashboard admin
│   ├── cgu/               # Conditions générales
│   ├── confidentialite/   # Politique de confidentialité
│   └── mentions-legales/  # Mentions légales
├── components/
│   ├── ui/                # Composants shadcn/ui
│   ├── landing/           # Composants de la landing page
│   └── party/             # Composants des pages de fête
└── lib/
    ├── db/                # Configuration et schéma Drizzle
    ├── actions/           # Server Actions
    ├── pdf/               # Génération d'affiches PDF
    ├── email/             # Templates et envoi d'emails
    ├── validations/       # Schémas Zod
    └── utils.ts           # Utilitaires
```

## Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
