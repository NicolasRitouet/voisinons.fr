# Contributing to Voisinons.fr

Merci de votre intérêt pour contribuer à Voisinons.fr !

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/NicolasRitouet/voisinons.fr/issues)
2. Créez une nouvelle issue avec :
   - Une description claire du problème
   - Les étapes pour reproduire
   - Le comportement attendu vs observé
   - Screenshots si pertinent

### Proposer une amélioration

1. Ouvrez une issue pour discuter de votre idée avant de commencer
2. Décrivez le problème que vous souhaitez résoudre
3. Proposez votre solution

### Soumettre du code

1. Forkez le repository
2. Créez une branche pour votre feature (`git checkout -b feature/ma-feature`)
3. Committez vos changements avec des messages clairs
4. Assurez-vous que le lint passe (`npm run lint`)
5. Assurez-vous que le build passe (`npm run build`)
6. Ouvrez une Pull Request

## Setup de développement

```bash
# Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/voisinons.fr.git
cd voisinons.fr

# Installer les dépendances
npm install

# Configurer Keyway (gestion des secrets)
keyway login
keyway link NicolasRitouet/voisinons.fr

# Lancer en développement
npm run dev
```

> **Note** : Ce projet utilise [Keyway](https://keyway.sh) pour la gestion des secrets. Voir le README pour plus de détails.

## Standards de code

- **TypeScript** : Typage strict, éviter les `any`
- **ESLint** : Respecter la configuration existante
- **Commits** : Messages clairs en français ou anglais
- **Tests** : Ajouter des tests pour les nouvelles fonctionnalités (si applicable)

## Structure des commits

Format recommandé :
```
type: description courte

Description détaillée si nécessaire
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Questions ?

N'hésitez pas à ouvrir une issue pour toute question.
