# Audit SEO complet — Voisinons.fr

> Audit produit le 27 avril 2026.
> **Contexte critique** : Fête des Voisins le **29 mai 2026** → fenêtre de 32 jours avant le pic annuel de recherche. ~80 % du volume annuel se concentre sur avril-mai.

---

## Étape 0 — Cartographie du site

### Pages indexables identifiées

| Type | URL | Indexable | Valeur SEO |
|------|-----|-----------|-----------|
| Homepage | `/` | ✅ | Forte (cible principale) |
| Conversion | `/creer` | ✅ | Faible (transactionnel court) |
| Légal | `/cgu` `/confidentialite` `/mentions-legales` | ✅ | Nulle |
| Pages fête | `/[slug]` | ❓ pas de `noindex` détecté | **Toxique** (éphémère 30j) |
| Admin/Participer | `/[slug]/admin`, `/[slug]/participer` | Risque de fuite | Doit être `noindex` |

### Synthèse cartographie

- **Profondeur max : 2** (très plat, mais traduit l'absence de contenu)
- **Pages SEO réelles : 2** (`/` et `/creer`) — le reste est légal ou éphémère
- **Pas de sitemap.xml** (404)
- **Pas de robots.txt** (404)
- **Aucune image OG** configurée
- **Aucun JSON-LD** (Organization, WebSite, FAQPage, Event…)

> **Diagnostic brut** : le site n'existe quasiment pas pour Google. Une excellente landing page seule ne porte pas une stratégie organique.

---

## 1. Compréhension produit & angle SEO

### Positionnement réel
Outil utilitaire B2C gratuit, complémentaire (pas concurrent) au site officiel `fetedesvoisins.fr`. Promesse : 30 secondes pour générer une page + affiche PDF + QR code + coordination plats. Anonyme, RGPD, suppression à 30 jours.

### Cas d'usage principaux
1. Locataire/propriétaire d'un immeuble qui veut lancer la fête sans créer de groupe WhatsApp
2. Syndic / conseil syndical qui formalise une fête de copropriété
3. Mairie / CCAS qui cherche à équiper ses habitants
4. Voisins motivés d'une rue pavillonnaire

### Personas
- **Sophie, 38 ans, locataire en immeuble parisien**
- **Marc, 55 ans, conseil syndical en banlieue**
- **Léa, agent CCAS**
- **Étudiant nouvellement installé**

### Intentions de recherche

| Couvertes aujourd'hui | NON couvertes (énorme manque) |
|-----------------------|-------------------------------|
| (très partiellement) "outil fête des voisins" | "comment organiser fête des voisins" |
| | "affiche fête des voisins gratuite" |
| | "modèle invitation fête des voisins" |
| | "fête des voisins 2026 date" |
| | "fête des voisins copropriété" |
| | "fête des voisins [ville]" |
| | "lettre fête des voisins mairie" |
| | "fête des voisins idées repas" |

### 🎯 Challenge produit

L'angle "outil" est trop étroit pour porter le SEO. Vous concurrencez `fetedesvoisins.fr` (autorité gigantesque) sur un terme qu'ils dominent. Votre seule porte d'entrée organique viable : **devenir la ressource pratique #1 sur les "comment faire"** — modèles, affiches, guides, lettres, fiches par ville. L'outil reste la conversion finale, pas l'aimant SEO.

---

## 2. Audit technique

### 2.1 Balises titre & meta

| Page | Title actuel | Reco |
|------|-------------|------|
| `/` | "Voisinons.fr \| Organisez votre Fête des Voisins simplement" | "Fête des Voisins 2026 : créez votre affiche & invitez vos voisins gratuitement" |
| `/creer` | "Créer une fête \| Voisinons.fr" | "Créer une affiche de Fête des Voisins gratuite (PDF + QR code) — Voisinons" |
| `/cgu`, `/confidentialite`, `/mentions-legales` | OK mais à mettre `robots: { index: false }` |
| `/[slug]` | Probablement défaut Next | `noindex` obligatoire |

**Layout (`src/app/layout.tsx`)**
- ❌ Pas de `metadataBase` → URLs OG relatives, prévisualisations sociales cassées
- ❌ Pas de `openGraph.images` → pas d'aperçu Twitter/LinkedIn/Facebook
- ❌ Pas de `alternates.canonical`
- ❌ Pas de `icons` explicite

### 2.2 robots.txt — MANQUANT
À créer `src/app/robots.ts` (voir implémentation).

### 2.3 sitemap.xml — MANQUANT
À créer `src/app/sitemap.ts` (statique, sans `/[slug]` éphémères).

### 2.4 `/[slug]` — risque SEO élevé
- éphémères (suppression J+30) → **404 massifs** si indexées
- thin-content (titre + adresse + liste plats)
- duplicate intent

→ `robots: { index: false, follow: false }` obligatoire sur `/[slug]`, `/[slug]/admin`, `/[slug]/participer`.

### 2.5 Headings
Homepage : H1 unique "Faites vibrer votre quartier!" — trop émotionnel, zéro mot-clé. Reco : `<h1>Organisez votre Fête des Voisins 2026 — outil gratuit</h1>`.

### 2.6 Performance perçue
3 polices Google Fonts (Space Grotesk + Outfit + Gloria Hallelujah) avec 11 graisses chargées au total. Sur mobile 4G : ~150-300 ko de fonts. Reco : ne charger que les graisses réellement utilisées.

### 2.7 Maillage interne actuel
Quasi inexistant. Aucun lien horizontal entre pages de contenu (puisqu'il n'y a pas de pages de contenu).

### 2.8 JSON-LD
Aucun. À ajouter dans le layout (WebApplication), puis FAQPage, HowTo, Event sur les futures pages.

---

## 3. Audit sémantique — 35 mots-clés stratégiques

(Difficulté qualitative : 🟢 facile, 🟡 moyen, 🔴 difficile contre `fetedesvoisins.fr`)

### Intention informationnelle
| Mot-clé | Difficulté | Volume estimé |
|---------|------------|---------------|
| comment organiser fête des voisins | 🟡 | Élevé |
| fête des voisins 2026 date | 🟢 | Très élevé |
| fête des voisins quand | 🟢 | Élevé |
| origine fête des voisins | 🟢 | Moyen |
| fête des voisins quelle heure | 🟢 | Moyen |
| idées animations fête des voisins | 🟢 | Moyen |
| idées repas fête des voisins | 🟢 | Moyen |
| autorisation mairie fête des voisins | 🟢 | Niche, intent fort |
| courrier syndic fête des voisins | 🟢 | Niche, intent fort |
| meteo fête des voisins | 🟢 | Volatile |

### Intention transactionnelle
| Mot-clé | Difficulté |
|---------|------------|
| affiche fête des voisins gratuite à imprimer | 🟡 (Canva domine) |
| modèle affiche fête des voisins word | 🟢 |
| invitation fête des voisins à imprimer | 🟡 |
| modèle invitation fête des voisins gratuit | 🟢 |
| flyer fête des voisins | 🟡 |
| affiche fête des voisins pdf | 🟢 |
| QR code fête des voisins | 🟢 niche, à dominer |
| outil organiser fête des voisins | 🟢 (votre cible) |
| application fête des voisins | 🟢 |

### Intention "copropriété / immeuble / professionnel"
| Mot-clé | Difficulté |
|---------|------------|
| fête des voisins copropriété | 🟡 (Cotoit positionné) |
| fête des voisins immeuble | 🟢 |
| fête des voisins syndic | 🟢 |
| kit fête des voisins copropriété | 🟢 |
| lettre conseil syndical fête voisins | 🟢 niche, conversion forte |

### Intention locale ("[ville] fête des voisins")
- fête des voisins Paris 2026 — 🟡
- fête des voisins Lyon — 🟢
- fête des voisins Marseille — 🟢
- fête des voisins Toulouse — 🟢
- fête des voisins Bordeaux — 🟢
- fête des voisins Nantes — 🟢
- fête des voisins Lille — 🟢
- fête des voisins [arrondissement Paris] — 🟢

### Long-tail à fort intent
- "fête des voisins comment inviter sans déranger"
- "fête des voisins voisin difficile que faire"
- "fête des voisins première fois conseils"
- "fête des voisins petit immeuble"
- "fête des voisins en hiver alternative"

---

## 4. Analyse concurrentielle

| Concurrent | Type | Forces | Failles à exploiter |
|-----------|------|--------|---------------------|
| **fetedesvoisins.fr** | Officiel (Macif/Atanase Périfan) | Autorité maximale, marque | UX vieillotte, pas d'outil interactif moderne |
| **icalendrier.fr** | Éditorial calendrier | Domine "fête des voisins ressources" | Contenu générique, pas de tooling, pas de QR code |
| **smiile.com** | Réseau social de quartier | Contenu blog, communauté | Demande inscription, freemium |
| **canva.com** | Templates graphiques | Domine "modèles affiche" | Pas de coordination, pas de QR, pas de page partageable |
| **cotoit.fr** | Gestion copropriété | "Kit fête des voisins copropriété" | B2B uniquement |

### Ce qu'aucun ne fait bien
1. **Outil instantané anonyme** générant page + affiche + QR + coordination — votre USP
2. **Contenu local par ville/arrondissement** — territoire vierge
3. **Aide administrative concrète** — esquissé chez vous, à industrialiser

---

## 5. Stratégie de contenu

### 5.1 Pages SEO structurantes à créer (priorité absolue avant le 29 mai)

| Page | URL | Cible principale | Délai |
|------|-----|------------------|-------|
| Guide ultime | `/guide-fete-des-voisins-2026` | "comment organiser fête des voisins" | 7 jours |
| Affiches gratuites | `/affiches-fete-des-voisins` | "affiche fête des voisins gratuite" | 7 jours |
| Modèles invitations | `/modeles-invitation` | "modèle invitation fête des voisins" | 14 jours |
| Date 2026 | `/fete-des-voisins-2026` | "fête des voisins 2026 date" | 3 jours (urgent) |
| Copropriété | `/copropriete` | "fête des voisins copropriété" | 14 jours |
| Démarches admin | `/demarches-administratives` | "lettre syndic fête des voisins" | 14 jours |
| FAQ | `/faq` | longue traîne | 14 jours |

### 5.2 Pages locales (template + 30 villes)

```
/villes/paris  /villes/lyon  /villes/marseille  /villes/toulouse  /villes/nice
/villes/nantes  /villes/strasbourg  /villes/montpellier  /villes/bordeaux  /villes/lille
... (top 30 villes françaises)
+ /villes/paris-[arrondissement] pour les 20 arrdts
```

Contenu type par page (≥ 600 mots **uniques**) :
- "Quand et où à [ville] en 2026"
- Initiatives mairie locale
- Liste des arrondissements/quartiers
- Témoignage local
- CTA vers `/creer?ville=paris`

⚠️ Ne pas faire de doorway pages (1000 pages identiques).

### 5.3 Idées éditoriales (10 articles)

1. **"Fête des Voisins 2026 : date officielle, origine et tout savoir"** — `Event` + `FAQPage`
2. **"Comment organiser une Fête des Voisins en 7 étapes (avec checklist)"** — `HowTo`
3. **"10 affiches Fête des Voisins gratuites à télécharger (PDF + Word)"** — linkable assets
4. **"Modèle de lettre au syndic pour la Fête des Voisins"**
5. **"Fête des Voisins en copropriété : guide pour conseils syndicaux"**
6. **"20 idées de plats à apporter à la Fête des Voisins (sans cuisiner)"**
7. **"Fête des Voisins : 15 jeux et animations pour briser la glace"**
8. **"Que faire si ma Fête des Voisins tombe sous la pluie ?"**
9. **"Première Fête des Voisins : 8 erreurs de débutant à éviter"**
10. **"L'autorisation de la mairie est-elle obligatoire pour la Fête des Voisins ?"**

### 5.4 SEO local — 3 vagues

1. **Vague 1 (14j)** : Top 10 villes (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Bordeaux, Lille)
2. **Vague 2 (60j)** : 20 villes 50k+ habitants + 20 arrondissements parisiens
3. **Vague 3 (saison 2027)** : 100 villes secondaires + quartiers principaux Paris/Lyon/Marseille

---

## 6. Optimisation des 5 pages existantes

### Page 1 — `/`
- **Title** : "Fête des Voisins 2026 : créer votre affiche gratuite en 30 secondes"
- **Meta** : "Outil 100% gratuit pour organiser la Fête des Voisins du 29 mai 2026. Génère votre affiche PDF avec QR code, coordonne les plats, invite vos voisins. Sans inscription."
- **H1** : "Organisez votre Fête des Voisins 2026 — outil gratuit"
- Ajouter section "Date officielle Fête des Voisins 2026 : vendredi 29 mai"
- Ajouter bloc FAQ (schéma `FAQPage`)
- Ajouter compteur preuve sociale
- Maillage : vers guide / affiches / copropriété / `/villes/paris`

### Page 2 — `/creer`
- **Title** : "Créer mon affiche de Fête des Voisins (PDF + QR code) — Voisinons"
- **Meta** : "Remplissez le formulaire et obtenez en 30 secondes : votre page web, votre affiche PDF imprimable et votre QR code. 100% gratuit, sans inscription."
- Bandeau réassurance + lien "Voir un exemple"

### Page 3 — `/[slug]`
**Action urgente** : `noindex, nofollow`. Sinon Google indexera des centaines de pages thin-content qui seront 404 à J+30.

### Pages 4 & 5 — `/cgu`, `/confidentialite`, `/mentions-legales`
`robots: { index: false }` — aucun bénéfice à les indexer.

---

## 7. Netlinking — plan 3 mois

### Mois 1 (mai 2026 — pic saisonnier)
- **Mairies** : email à 50 mairies (taux retour 5-10 %)
- **Sites copropriété** (Cotoit, Matera, Bellman, Syndic One)
- **Blogs immobiliers locaux** (Coteneuf, Trouver-un-logement-neuf…)

### Mois 2 (juin — post-événement)
- Témoignages des organisateurs réels (photos floutées)
- Presse locale (Ouest-France, La Voix du Nord, 20 Minutes locales)
- Annuaires citoyens (Yes We Care, Make.org, Ouishare)

### Mois 3 (juillet — préparation 2027)
- Asset linkable : "Carte interactive des Fêtes des Voisins 2026"
- Wikipedia (note encyclopédique sur outils numériques)
- Échanges éditoriaux ciblés

### À éviter
- Achats de liens / PBN
- Annuaires généralistes spammy
- Footer links

---

## 8. UX & conversion

### Forces
- Proposition de valeur claire en hero
- Promesse "30 secondes" rassurante
- Argument RGPD différenciant

### Frictions identifiées
1. **H1 trop poétique** — un visiteur SEO met 5-10s à comprendre
2. **Pas de preuve sociale** (zéro chiffre, zéro témoignage)
3. **Pas d'aperçu visuel de l'affiche** sur la home
4. **Frottement formulaire `/creer`** — split en 2 étapes recommandé
5. **Pas de retention** — pas de compte = pas de re-engagement
6. **CTA "Premiers testeurs"** dévalorise

### Conversion du trafic SEO
Aujourd'hui un visiteur informationnel arrive sur `/`, ne trouve pas ce qu'il cherche, bounce. Plan #1 : créer les pages de contenu, puis les orienter vers `/creer` via CTA contextuels.

---

## 9. Plan d'action priorisé

### 🔥 Top 10 actions

| # | Action | Impact | Effort | Quand |
|---|--------|--------|--------|-------|
| 1 | `noindex` sur `/[slug]`, `/cgu`, `/confidentialite`, `/mentions-legales` | 🔥🔥🔥 | 5 min | Aujourd'hui |
| 2 | Créer `robots.ts` + `sitemap.ts` | 🔥🔥🔥 | 30 min | Aujourd'hui |
| 3 | Optimiser title + meta + H1 homepage | 🔥🔥🔥 | 1h | Aujourd'hui |
| 4 | Ajouter image OG + JSON-LD WebApplication | 🔥🔥 | 2h | 48h |
| 5 | Publier `/fete-des-voisins-2026` (date page) | 🔥🔥🔥 | 3h | 72h |
| 6 | Publier `/guide-fete-des-voisins-2026` | 🔥🔥🔥 | 1 jour | Semaine 1 |
| 7 | Publier `/affiches-fete-des-voisins` | 🔥🔥 | 1 jour | Semaine 1 |
| 8 | Pages locales top 10 villes | 🔥🔥 | 3-5 jours | Semaine 2 |
| 9 | Soumettre Search Console + Bing Webmaster | 🔥🔥🔥 | 30 min | Semaine 1 |
| 10 | Outreach 50 mairies | 🔥🔥 | 1 jour | Semaine 2 |

### Roadmap 90 jours

#### 0–30 jours (28 avril → 27 mai)
- Toutes les actions techniques (1-4, 9)
- 5 pages contenu critique : Date 2026, Guide, Affiches, Copropriété, Modèles invitations
- Pages locales top 10 villes
- Outreach mairies + sites copropriété
- Submit Search Console
- Mesurer : impressions GSC, clics, CTR

#### 30–60 jours (28 mai → 26 juin)
- Capitaliser sur le pic du 29 mai (presse, témoignages, partages)
- 5 articles "post-événement"
- Pages locales vague 2 (30 villes + arrondissements)
- Asset "Carte des fêtes 2026"
- Premier audit Search Console

#### 60–90 jours (27 juin → 26 juillet)
- Refondre `/fete-des-voisins-2026` + créer `/fete-des-voisins-2027`
- Stratégie evergreen pages non datées
- Backlinks via outreach presse/blogs
- Tracking 30 mots-clés (Serpfox/Mangools, ~40€/mois)
- Calendrier éditorial saison 2027 (lancer en octobre 2026)

---

## 10. Bonus — 3 stratégies non évidentes

### 1. Pari "evergreen via dérivés"
Créer progressivement :
- `/fete-de-rue` (interdiction de circuler, démarche mairie)
- `/aperitif-de-quartier`
- `/fete-de-fin-d-immeuble` (pots déménagement)
- `/halloween-quartier`, `/noel-immeuble`

→ Voisinons devient l'outil pour **n'importe quelle micro-fête de proximité**.

### 2. Levier données : "Baromètre annuel"
Publier un rapport annuel "L'état de la convivialité de quartier en France" = pur **link magnet** pour la presse régionale et nationale. Premier rapport publiable dès juin 2026.

### 3. Pages "lieu spécifique" (cluster vertical)
- `/fete-des-voisins-petit-immeuble`
- `/fete-des-voisins-grande-copropriete`
- `/fete-des-voisins-residence-fermee`
- `/fete-des-voisins-rue-pavillonnaire`
- `/fete-des-voisins-hlm`
- `/fete-des-voisins-village`

Chaque page = territoire vierge, intent ciblé, conversion supérieure.

---

## 🎯 Synthèse en une phrase

Voisinons.fr a un produit excellent et invisible : techniquement sain mais trop maigre (2 pages SEO) face à un marché ultra-saisonnier qui pique dans 32 jours. Priorité absolue : **publier 5-7 pages de contenu cibles dans les 14 prochains jours**, `noindex` sur les pages éphémères, outreach mairies/copropriétés. Saison 2026 = capter du trafic court-terme. Saison 2027 (préparée dès l'automne) = devenir la ressource française n°1 sur l'organisation de fêtes de quartier.
