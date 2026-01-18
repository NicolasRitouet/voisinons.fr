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

# Appliquer le schéma
npm run db:push
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
| `npm run db:generate` | Générer les migrations Drizzle |
| `npm run db:migrate` | Appliquer les migrations |
| `npm run db:push` | Synchroniser le schéma (dev) |
| `npm run db:studio` | Ouvrir Drizzle Studio |

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
