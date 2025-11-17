# FootMind Engine - Module d'Analyse Football IA

## 📋 Vue d'ensemble

**FootMind Engine** est une application complète d'analyse football basée sur l'IA, intégrée dans la plateforme Dataverse. Elle combine analyse tactique avancée, prédiction en temps réel, génération d'entraînements et innovations cross-sport.

## 🌱 Quick Start - Data Seeding

Pour tester rapidement FootMind Engine avec des données d'exemple :

```graphql
mutation {
  seedFootballData
}
```

Cette mutation va créer :
- **4 équipes** : FC Barcelona, Real Madrid, Manchester City, Bayern München
- **30+ joueurs** avec attributs complets et statistiques
- **12 matchs** : 10 terminés avec stats complètes, 2 à venir
- **Événements de match** : 100+ events (passes, tirs, tackles, etc.)
- **Données de tracking** : Positions de joueurs et ballon sur 200 frames
- **8 analyses tactiques complètes** générées par IA
- **Patterns tactiques** : 10+ patterns détectés (offensifs, défensifs, transitions)
- **Prédictions** : 15+ micro-prédictions et prédictions de séquences
- **2 plans d'entraînement** : Avec exercices détaillés et objectifs
- **2 phases arrêtées** : Corners et coups francs
- **5 rapports de match** complets

La mutation retourne un JSON avec le nombre de chaque type d'entité créée.

## 🎯 Fonctionnalités Principales

### 1. Analyse Tactique Avancée
- **Patterns offensifs & défensifs** : Détection automatique de séquences récurrentes
- **Analyse spatio-temporelle** : Zones d'occupation, pressing, compacité
- **Profil adversaire** : Faiblesses exploitables, style tactique
- **Risques & opportunités** : Anticipation en temps réel

### 2. Prédiction en Temps Réel
- **Micro-prédictions (3-10 secondes)** : Anticipation des actions immédiates
- **Prédictions de séquences** : Build-up complet, transitions
- **Détection de joueurs à risque** : Fatigue, stress, blessure potentielle
- **Substitutions intelligentes** : Recommandations basées sur les données

### 3. Génération d'Entraînements IA
- **Plans personnalisés** : Basés sur les faiblesses identifiées
- **Exercices détaillés** : Setup, coaching points, variations
- **Charge physique optimisée** : Distance, sprints, calories
- **Innovations cross-sport** : Inspirés du basket, rugby, handball, NFL

### 4. Rapports & Insights
- **Executive Summary** : Synthèse pour le staff
- **Analyses approfondies** : Tactique, technique, physique
- **Recommandations coaching** : Actions concrètes en temps réel
- **Phases arrêtées optimisées** : Corners, coups francs, etc.

## 🏗️ Architecture

### Backend (NestJS + GraphQL + TypeORM)

```
apps/api/src/modules/football/
├── entities/              # 11 entités TypeORM
│   ├── team.entity.ts
│   ├── player.entity.ts
│   ├── match.entity.ts
│   ├── tracking-data.entity.ts
│   ├── match-event.entity.ts
│   ├── tactical-analysis.entity.ts
│   ├── pattern.entity.ts
│   ├── prediction.entity.ts
│   ├── training-plan.entity.ts
│   ├── set-piece.entity.ts
│   └── match-report.entity.ts
├── dto/                   # DTOs GraphQL
│   ├── create-team.input.ts
│   ├── create-player.input.ts
│   ├── create-match.input.ts
│   ├── analyze-match.input.ts
│   └── generate-training.input.ts
├── services/              # Services métier
│   ├── football.service.ts           # CRUD général
│   ├── football-ai.service.ts        # IA + Master Prompt
│   └── training-generator.service.ts # Génération entraînements
├── football.resolver.ts   # API GraphQL
└── football.module.ts     # Module NestJS
```

### Frontend (Next.js 14 + React 18 + Tailwind)

```
apps/web/src/app/football/
├── page.tsx              # Dashboard FootMind Engine
├── teams/
│   └── page.tsx          # Gestion d'équipes
├── matches/
│   └── page.tsx          # Liste des matchs
├── training/
│   └── page.tsx          # Générateur d'entraînements
└── analysis/
    └── page.tsx          # Analyses tactiques
```

## 🗄️ Modèle de Données

### Entités Principales

#### Team
```typescript
{
  id: string;
  name: string;
  formation: string;        // "4-3-3", "3-5-2", etc.
  tacticalStyle: string;    // "possession", "counter-attack", etc.
  philosophyOfPlay: {...};
  players: Player[];
  matches: Match[];
}
```

#### Player
```typescript
{
  id: string;
  name: string;
  position: string;         // GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST
  biometrics: {
    vo2max: number;
    maxHeartRate: number;
    sprintSpeed: number;
    ...
  };
  attributes: {
    pace, shooting, passing, dribbling, defending, physical...
  };
  currentFitness: number;
  fatigue: number;
}
```

#### Match
```typescript
{
  id: string;
  date: Date;
  homeTeam: Team;
  awayTeam: Team;
  homeFormation: string;
  awayFormation: string;
  environment: {
    temperature, humidity, windSpeed, weather, altitude...
  };
  trackingData: TrackingData[];  // Positions x,y,t
  events: MatchEvent[];          // Passes, tirs, etc.
  analyses: TacticalAnalysis[];
  reports: MatchReport[];
}
```

#### TrackingData
```typescript
{
  timestamp: number;         // Secondes depuis le début du match
  frame: number;
  ball: { x, y, z, speed, possession };
  players: [{
    playerId, team, x, y, speed, acceleration, direction, heartRate...
  }];
  derived: {
    pressure, compactness, defensiveLine...
  };
}
```

#### TacticalAnalysis
```typescript
{
  analysisType: "pre-match" | "live" | "post-match";
  spatialAnalysis: {
    zones, heatMaps, pressing, spaceControl...
  };
  offensiveAnalysis: {
    buildUpStyle, attackingWidth, keyPlayers...
  };
  defensiveAnalysis: {
    blockHeight, pressingIntensity, vulnerabilities...
  };
  risks: [...];
  opportunities: [...];
  patterns: Pattern[];
  predictions: Prediction[];
}
```

## 🤖 IA - Master Prompt

Le cœur de FootMind Engine est son **Master Prompt**, intégré dans `FootballAiService`:

```typescript
const MASTER_PROMPT = `
Rôle :
Tu es FootMind Engine, une IA experte en football : tactique, data, spatio-temporel,
prédiction, entraînement et décision en match.

Objectifs :
- Analyser un match / adversaire
- Détecter patterns offensifs et défensifs
- Prédire actions futures (3–10 sec)
- Optimiser tactiques et formations
- Générer entraînements ciblés
- Innover avec concepts multi-sports

Format attendu :
1. Executive Summary
2. Analyse Tactique Profonde
3. Patterns Détectés
4. Analyse Spatio-Temporelle
5. Prédictions (3-10 sec)
6. Profil Adversaire
7. Risques & Opportunités
8. Recommandations Coaching
9. Substitutions Intelligentes
10. Plan d'Entraînement
11. Phases Arrêtées
12. Innovation CrossSport
`;
```

## 🚀 API GraphQL

### Queries

```graphql
# Équipes
teams: [Team!]!
team(id: ID!): Team!

# Joueurs
players(teamId: ID): [Player!]!
player(id: ID!): Player!

# Matchs
matches(teamId: ID): [Match!]!
match(id: ID!): Match!

# Données de tracking
trackingData(matchId: ID!, startTime: Float, endTime: Float): [TrackingData!]!

# Événements
matchEvents(matchId: ID!, eventType: String): [MatchEvent!]!

# Analyses
analyses(matchId: ID!): [TacticalAnalysis!]!
analysis(id: ID!): TacticalAnalysis!

# Prédictions
generatePredictions(matchId: ID!, currentTimestamp: Float!): String!

# Rapports
matchReports(matchId: ID!): [MatchReport!]!
matchReport(id: ID!): MatchReport!

# Entraînements
trainingPlans(teamId: ID): [TrainingPlan!]!
trainingPlan(id: ID!): TrainingPlan!

# Phases arrêtées
setPieces(teamId: ID): [SetPiece!]!
```

### Mutations

```graphql
# Équipes
createTeam(input: CreateTeamInput!): Team!
updateTeam(id: ID!, input: CreateTeamInput!): Team!
deleteTeam(id: ID!): Boolean!

# Joueurs
createPlayer(input: CreatePlayerInput!): Player!
updatePlayer(id: ID!, input: CreatePlayerInput!): Player!
deletePlayer(id: ID!): Boolean!

# Matchs
createMatch(input: CreateMatchInput!): Match!
updateMatch(id: ID!, input: CreateMatchInput!): Match!
deleteMatch(id: ID!): Boolean!

# Analyse IA
analyzeMatch(input: AnalyzeMatchInput!): TacticalAnalysis!

# Génération d'entraînement IA
generateTraining(input: GenerateTrainingInput!): TrainingPlan!
completeTraining(id: ID!, feedback: String!, actualMetrics: String!): TrainingPlan!
```

### Exemples d'utilisation

#### Créer une équipe
```graphql
mutation {
  createTeam(input: {
    name: "FC Barcelona"
    formation: "4-3-3"
    tacticalStyle: "possession"
    country: "Spain"
    league: "La Liga"
  }) {
    id
    name
    formation
  }
}
```

#### Analyser un match
```graphql
mutation {
  analyzeMatch(input: {
    matchId: "abc123"
    phase: LIVE
    focus: TACTICAL
    includeTrainingRecommendations: true
    includeCrossSportInnovation: true
    generateFullReport: true
  }) {
    id
    analysisType
    summary
    recommendations
    risks {
      type
      severity
      description
    }
    opportunities {
      type
      potential
      description
    }
  }
}
```

#### Générer un entraînement
```graphql
mutation {
  generateTraining(input: {
    teamId: "team123"
    focus: "tactical"
    duration: 90
    difficulty: "high"
    targetWeaknesses: ["defensive-transition", "pressing-coordination"]
    includeCrossSportDrills: true
    specificObjectives: "Améliorer le pressing haut et la transition défensive"
  }) {
    id
    title
    description
    exercises {
      name
      type
      duration
      description
    }
    crossSportInnovation {
      sport
      drill
      adaptation
      expectedBenefit
    }
  }
}
```

## 📊 Cas d'Usage

### 1. Analyse Pre-Match
```typescript
// Analyser l'adversaire avant le match
const analysis = await analyzeMatch({
  matchId: "upcoming-match-123",
  phase: AnalysisPhase.PRE_MATCH,
  focus: AnalysisFocus.TACTICAL,
  specificInstructions: "Analyser les phases arrêtées adverses"
});
```

### 2. Coaching Live
```typescript
// Obtenir des prédictions en temps réel
const predictions = await generateMicroPredictions(
  matchId,
  userId,
  currentTimestamp // ex: 2743 (45:43)
);
// Retourne : risques immédiats, opportunités, recommandations
```

### 3. Post-Match Analysis
```typescript
const analysis = await analyzeMatch({
  matchId: "completed-match-123",
  phase: AnalysisPhase.POST_MATCH,
  includeTrainingRecommendations: true,
  generateFullReport: true
});
```

### 4. Génération d'Entraînement
```typescript
const trainingPlan = await generateTrainingPlan({
  teamId: "team123",
  basedOnMatchId: "last-match-123", // Basé sur les faiblesses du match
  focus: "defensive-transition",
  duration: 90,
  includeCrossSportDrills: true
});
```

## 🎨 Interface Utilisateur

### Pages Disponibles

1. **`/football`** - Dashboard principal
   - Vue d'ensemble des équipes, matchs, analyses
   - Statistiques globales
   - Accès rapide aux fonctionnalités

2. **`/football/teams`** - Gestion des équipes
   - Création/modification d'équipes
   - Gestion des joueurs
   - Profils tactiques

3. **`/football/matches`** - Gestion des matchs
   - Liste des matchs (programmés, en cours, terminés)
   - Accès à l'analyse IA
   - Visualisation des statistiques

4. **`/football/training`** - Générateur d'entraînements
   - Création de plans personnalisés
   - Bibliothèque d'exercices
   - Historique des sessions

5. **`/football/analysis`** - Analyses tactiques
   - Visualisation des patterns
   - Cartes de chaleur
   - Prédictions

## 🔧 Installation & Configuration

### 1. Base de données

Les entités FootMind Engine s'intègrent automatiquement avec TypeORM. Au premier lancement :

```bash
# Les tables seront créées automatiquement en mode développement
npm run dev
```

Tables créées :
- `teams`
- `players`
- `matches`
- `tracking_data`
- `match_events`
- `tactical_analyses`
- `patterns`
- `predictions`
- `training_plans`
- `set_pieces`
- `match_reports`

### 2. Variables d'environnement

FootMind Engine utilise le module AI existant. Assurez-vous d'avoir :

```env
# OpenAI (pour l'IA)
OPENAI_API_KEY=your_openai_key

# Ou Anthropic Claude
ANTHROPIC_API_KEY=your_claude_key
```

### 3. Lancer l'application

```bash
# Backend
cd apps/api
npm run dev

# Frontend
cd apps/web
npm run dev
```

L'application sera disponible :
- **Backend GraphQL** : http://localhost:3001/graphql
- **Frontend** : http://localhost:3000/football

## 📈 Évolutions Futures

### Phase 2
- [ ] Visualisation 2D du terrain avec trajectoires
- [ ] Import de fichiers de tracking (CSV, XML)
- [ ] Intégration vidéo synchronisée
- [ ] Export rapports PDF
- [ ] Comparaison multi-matchs

### Phase 3
- [ ] Modèles ML personnalisés (GNN, Transformers)
- [ ] API temps réel via WebSocket
- [ ] Mobile app (React Native)
- [ ] Marketplace de tactiques
- [ ] Partage communautaire

### Phase 4
- [ ] Vision par ordinateur (détection automatique)
- [ ] Tracking automatique depuis vidéo
- [ ] Reconnaissance de patterns ML
- [ ] Prédiction xG/xA avancée
- [ ] Simulation tactique 3D

## 🤝 Contribution

FootMind Engine est intégré dans le projet Dataverse. Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce module fait partie du projet Dataverse.

## 📧 Support

Pour toute question concernant FootMind Engine :
- Ouvrir une issue GitHub
- Consulter la documentation Dataverse
- Contacter l'équipe de développement

---

**FootMind Engine** - L'IA d'analyse football nouvelle génération 🚀⚽
