# 📊 Guide des Pages d'Analyse FootMind Engine

## 🎯 Vue d'ensemble

Cette mise à jour ajoute des pages complètes pour visualiser et analyser les matchs avec FootMind Engine IA.

## 📄 Nouvelles Pages

### 1. Page Détail du Match
**Route:** `/football/matches/[id]`

#### Fonctionnalités
- **Affichage du match** : Score, équipes, formations, status
- **Statistiques complètes** : Possession, tirs, passes, précision
- **Conditions environnementales** : Température, humidité, météo, état du terrain
- **Liste des analyses** : Toutes les analyses IA effectuées
- **Bouton "Analyser avec IA"** : Lance une nouvelle analyse

#### Configuration d'analyse
Lorsque vous cliquez sur "Analyser avec IA", un modal s'ouvre avec :

- **Phase** :
  - Pre-Match (Préparation)
  - Live (En direct)
  - Post-Match (Analyse complète)
  - Training (Pour entraînement)

- **Focus** :
  - Complet (Tous les aspects)
  - Tactique
  - Physique
  - Technique

- **Options** :
  - ✅ Recommandations d'entraînement
  - ✅ Innovations cross-sport (Basket, Rugby, NFL)
  - ✅ Analyse phases arrêtées
  - ✅ Générer rapport complet

### 2. Page d'Analyse Complète
**Route:** `/football/analysis/[id]`

#### Sections

##### 📋 Résumé Exécutif
- Synthèse de l'analyse générée par l'IA
- Mise en avant dans un bandeau bleu/vert

##### 📊 Statistiques Rapides
4 cartes avec :
- Patterns détectés
- Prédictions IA
- Risques identifiés
- Opportunités tactiques

##### ⚠️ Risques & Zones de Danger
- Liste des risques avec niveau de sévérité (0-100%)
- Couleurs : Rouge (>80%), Orange (>50%), Jaune (<50%)
- Description détaillée
- Fenêtre temporelle
- Joueurs affectés

##### 🎯 Opportunités Tactiques
- Opportunités avec potentiel (0-100%)
- Couleurs : Vert (>80%), Bleu (>50%), Gris (<50%)
- Actions suggérées
- Joueurs cibles

##### 🔄 Analyses Tactiques
Trois cartes pour :
- **Analyse Offensive** : Build-up, attaques, joueurs clés
- **Analyse Défensive** : Bloc défensif, pressing, vulnérabilités
- **Transitions** : Transitions offensives/défensives

##### 🗺️ Analyse Spatio-Temporelle
- Occupation des zones
- Heat maps
- Pressing
- Contrôle de l'espace

##### 📊 Patterns Détectés
Cards avec :
- Nom et catégorie du pattern
- Efficacité (0-100%)
- Fréquence et taux de réussite
- Zones d'occurrence
- Triggers et outcomes
- **Analogie cross-sport** (🏀 Basket, 🏈 NFL, 🏉 Rugby)

##### ⚡ Prédictions IA
- Type de prédiction (micro 3-10s, séquence, outcome)
- Horizon temporel
- Niveau de confiance (0-100%)
- Résultats prédits avec probabilités

##### 💡 Recommandations Coaching
- Conseils tactiques détaillés
- Substitutions suggérées
- Ajustements en temps réel

##### 📥 Export PDF
Bouton en haut à droite pour générer un rapport imprimable.

## 🎨 Composants Réutilisables

### FieldVisualization
Visualisation 2D du terrain de football.

```tsx
import { FieldVisualization } from '@/components/football';

<FieldVisualization
  players={[
    { x: 0, y: 0, team: 'home', number: 10 },
    { x: 20, y: 10, team: 'away', number: 7 },
  ]}
  ball={{ x: 10, y: 5 }}
  width={800}
  height={520}
  showGrid={false}
  showZones={true}
/>
```

**Props:**
- `players`: Array de positions joueurs (x, y en mètres depuis centre)
- `ball`: Position du ballon
- `width/height`: Dimensions du canvas
- `showGrid`: Afficher la grille
- `showZones`: Afficher les zones tactiques

### StatChart
Graphiques de comparaison statistiques.

```tsx
import { StatChart } from '@/components/football';

// Mode barre
<StatChart
  label="Possession"
  homeValue={65}
  awayValue={35}
  unit="%"
  type="bar"
/>

// Mode radial
<StatChart
  label="Tirs"
  homeValue={15}
  awayValue={8}
  type="radial"
/>
```

**Props:**
- `label`: Nom de la statistique
- `homeValue/awayValue`: Valeurs à comparer
- `unit`: Unité (%, m, etc.)
- `type`: 'bar' ou 'radial'

## 🔧 Hooks Personnalisés

### useMatch
```tsx
import { useMatch } from '@/hooks/useFootball';

const { match, loading, error, refetch } = useMatch(matchId);
```

### useAnalysis
```tsx
import { useAnalysis } from '@/hooks/useFootball';

const { analysis, loading, error } = useAnalysis(analysisId);
```

### useAnalyzeMatch
```tsx
import { useAnalyzeMatch } from '@/hooks/useFootball';

const { analyzeMatch, loading, analysis } = useAnalyzeMatch();

// Lancer l'analyse
await analyzeMatch({
  matchId: 'abc123',
  phase: 'POST_MATCH',
  focus: 'TACTICAL',
  includeTrainingRecommendations: true,
  includeCrossSportInnovation: true,
  includeSetPieceAnalysis: true,
  generateFullReport: true,
});
```

### useTeams, useMatches, useTrainingPlans, usePlayers
Hooks similaires pour charger les autres entités.

## 📥 Export PDF

### Depuis la page d'analyse
```tsx
import { exportAnalysisToPDF } from '@/lib/exportPDF';

const handleExport = () => {
  exportAnalysisToPDF(analysis, match);
};
```

### Fonctionnalités de l'export
- Ouvre une nouvelle fenêtre avec version imprimable
- Style optimisé pour impression
- Boutons "Imprimer" et "Sauvegarder PDF"
- Contient :
  - En-tête avec score et date
  - Résumé exécutif
  - Risques et opportunités
  - Patterns détectés
  - Recommandations coaching
  - Footer avec timestamp

## 🎯 Flux Utilisateur Typique

### 1. Créer un match
```
/football/matches → "Nouveau Match" → Formulaire → Match créé
```

### 2. Voir les détails
```
/football/matches → Cliquer sur match → /football/matches/[id]
```

### 3. Lancer une analyse
```
Match detail → "Analyser avec IA" → Configurer options → "Lancer l'analyse"
```

L'analyse est lancée (peut prendre 10-30 secondes selon les données)

### 4. Voir l'analyse
```
Redirection automatique → /football/analysis/[id]
```

### 5. Explorer les insights
- Parcourir résumé exécutif
- Identifier risques et opportunités
- Examiner patterns détectés
- Lire prédictions IA
- Consulter recommandations coaching

### 6. Exporter le rapport
```
Bouton "Exporter PDF" → Fenêtre d'impression → Sauvegarder comme PDF
```

## 🎨 Design System

### Couleurs par Type

**Équipes:**
- Home: Bleu (`bg-blue-500`, `text-blue-400`)
- Away: Vert (`bg-emerald-500`, `text-emerald-400`)

**Patterns:**
- Offensif: Bleu
- Défensif: Rouge
- Transition: Violet
- Phases arrêtées: Orange

**Risques:**
- Sévérité >80%: Rouge
- Sévérité >50%: Orange
- Sévérité <50%: Jaune

**Opportunités:**
- Potentiel >80%: Vert
- Potentiel >50%: Bleu
- Potentiel <50%: Gris

### Badges de Status
- `scheduled`: Bleu
- `live`: Rouge animé (pulse)
- `half-time`: Orange
- `finished`: Gris

## 🚀 Prochaines Améliorations

### Court terme
- [ ] Graphiques animés avec Chart.js ou Recharts
- [ ] Timeline interactive des événements
- [ ] Comparaison multi-matchs
- [ ] Filtres avancés sur analyses

### Moyen terme
- [ ] Visualisation 3D du terrain
- [ ] Animation des séquences de jeu
- [ ] Heat maps interactives
- [ ] Export multi-formats (CSV, JSON, Excel)

### Long terme
- [ ] Analyse vidéo synchronisée
- [ ] Annotations tactiques collaboratives
- [ ] IA temps réel avec WebSocket
- [ ] Intégration tracking automatique

## 📝 Notes Techniques

### GraphQL Queries
Toutes les queries sont définies dans `/hooks/useFootball.ts`

### State Management
- Apollo Client cache pour les données
- Refetch automatique après mutations
- Optimistic updates pour meilleure UX

### Performance
- Lazy loading des composants lourds
- Pagination des listes longues
- Memoization des composants coûteux
- Canvas optimisé pour >100 joueurs

### Responsive Design
- Mobile-first avec Tailwind
- Breakpoints: sm, md, lg, xl
- Grids adaptatives
- Modals full-screen sur mobile

---

**FootMind Engine - Analyse Pages v2.0** 🚀⚽
