# 🎮 Guide Visualisation 3D - FootMind Engine

## 📋 Vue d'ensemble

La visualisation 3D de FootMind Engine offre une expérience immersive pour explorer les données de match en trois dimensions, avec des contrôles interactifs et des vues multiples.

## 🚀 Accès

- **URL** : `/football/visualization3d`
- **Depuis le Dashboard** : Carte "Visualisation 3D" avec l'icône 📦

## 🎯 Fonctionnalités Principales

### 1. Terrain 3D Réaliste

**Dimensions FIFA Standard** :
- Longueur : 105 mètres
- Largeur : 68 mètres
- Marquages réglementaires (penalty, surface de but, rond central)
- Buts avec poteaux et filets
- Motif de pelouse avec rayures

**Composants** :
```tsx
<Field3D />
```

**Détails** :
- Surface d'herbe avec matériau réaliste
- Lignes blanches (contour, centre, surfaces)
- Cercle central et points de penalty
- Buts 3D avec dimensions réelles (7.32m x 2.44m)

### 2. Joueurs 3D

**Représentation** :
- Cylindre pour le corps (couleur d'équipe)
- Sphère pour la tête
- Numéro de maillot visible
- Ombre au sol

**Animations** :
- Pulsation pour joueur sélectionné
- Flèche de vitesse et direction
- Anneau de sélection

**Composant** :
```tsx
<Player3D
  position={[x, y, z]}
  team="home" // ou "away"
  number={10}
  name="Messi"
  speed={5}
  direction={45}
  isSelected={true}
/>
```

**Couleurs** :
- Équipe domicile : Bleu (`#3b82f6`)
- Équipe extérieur : Rouge (`#ef4444`)
- Sélection : Jaune (`#fbbf24`)

### 3. Ballon 3D

**Caractéristiques** :
- Sphère réaliste (rayon 11cm)
- Rotation continue pour l'effet dynamique
- Ombre projetée au sol

**Composant** :
```tsx
<Ball3D position={[x, y, z]} />
```

### 4. Heat Maps 3D

**Description** :
Visualisation volumétrique des zones d'occupation avec barres 3D colorées selon l'intensité.

**Paramètres** :
- Grille : 20x20 par défaut
- Hauteur maximale : 3 mètres
- Opacité : 60-100% selon intensité

**Composant** :
```tsx
<HeatMap3D
  points={[
    { x: 10, z: 5, intensity: 0.8 },
    { x: -5, z: -10, intensity: 0.6 }
  ]}
  team="home"
  gridSize={20}
  maxHeight={3}
/>
```

**Couleurs** :
- Équipe domicile : Dégradé bleu → blanc
- Équipe extérieur : Dégradé rouge → blanc
- Intensité élevée = couleur plus saturée

### 5. Trajectoires 3D

**Types de trajectoires** :

#### Trajectoire de Joueur
```tsx
<Trajectory3D
  points={[
    { x: 0, y: 0, z: 0, timestamp: 0 },
    { x: 10, y: 0, z: 5, timestamp: 1 }
  ]}
  color="#10b981"
  animated={true}
  opacity={0.8}
/>
```

#### Trajectoire de Ballon (Parabolique)
```tsx
<BallTrajectory3D
  start={new Vector3(0, 0, 0)}
  end={new Vector3(20, 0, 10)}
  height={2}
  color="#fbbf24"
/>
```

#### Réseau de Passes
```tsx
<PassingNetwork3D
  passes={[
    { from: "player1", to: "player2", count: 5 }
  ]}
  playerPositions={{
    player1: new Vector3(0, 0, 0),
    player2: new Vector3(10, 0, 5)
  }}
/>
```

**Caractéristiques** :
- Courbes lisses (Catmull-Rom)
- Animation de pointillés
- Épaisseur basée sur le nombre de passes

## 🎮 Contrôles Interactifs

### Caméra (OrbitControls)

| Action | Contrôle |
|--------|----------|
| **Rotation** | Clic gauche + glisser |
| **Pan (déplacement)** | Clic droit + glisser |
| **Zoom** | Molette de la souris |
| **Limites** | Angle polaire max: 88.5°, Distance: 20-150m |

### Boutons de Contrôle

#### Play/Pause ▶️ ⏸️
- Lance/arrête la lecture de l'animation
- Timeline avec progression

#### Reset 🔄
- Réinitialise à la frame 0
- Arrête la lecture

#### Caméra 📹
Cycle entre 3 vues :
1. **Vue Tactique** : `[0, 60, 60]` - Vue aérienne oblique
2. **Vue Broadcast** : `[0, 35, 80]` - Vue TV classique
3. **Vue Derrière le But** : `[-60, 25, 0]` - Vue latérale

#### Grille ⊞
- Affiche/masque la grille de référence (120x120m, 24 divisions)
- Couleurs : Lignes principales `#444444`, Secondaires `#333333`

#### Heat Map 📊
- Active/désactive l'affichage des heat maps 3D
- Toggler l'opacité pour voir les joueurs en dessous

## 🎨 Éclairage et Environnement

### Lumières

**Ambiante** :
```tsx
<ambientLight intensity={0.4} />
```
Illumination générale douce

**Directionnelle** (Soleil) :
```tsx
<directionalLight
  position={[50, 50, 50]}
  intensity={0.8}
  castShadow
  shadow-mapSize={2048}
/>
```
Ombres projetées réalistes

**Point Light** :
```tsx
<pointLight position={[0, 30, 0]} intensity={0.3} />
```
Éclairage spot au centre

### Environnement

```tsx
<Sky sunPosition={[100, 20, 100]} />
<Environment preset="sunset" />
```

Ciél réaliste avec coucher de soleil

## 📊 Interface Utilisateur

### Panel Info (Collapsible)

Affiche les instructions de contrôle :
- Contrôles souris
- Raccourcis clavier (à venir)
- Bouton fermer (X)

### Stats en Direct

**3 cartes** :
1. Équipe domicile (bleu)
   - Nombre de joueurs affichés
   - % possession
   - Nombre de tirs
2. Score et temps
   - Score actuel
   - Minute de jeu
   - Période
3. Équipe extérieur (rouge)
   - Statistiques similaires

### Timeline

Barre de progression en bas :
- Temps écoulé
- Temps total (90')
- Slider interactif (à venir)

## 🔧 Architecture Technique

### Stack Technologique

- **Three.js** : Moteur 3D WebGL
- **React Three Fiber** : Intégration React pour Three.js
- **@react-three/drei** : Helpers et composants utilitaires
- **Next.js 14** : Framework React avec App Router
- **Tailwind CSS** : Styling et responsive

### Structure des Composants

```
src/components/football/3d/
├── Field3D.tsx              # Terrain avec marquages
├── Player3D.tsx             # Joueur + Ballon
├── HeatMap3D.tsx            # Cartes thermiques
├── Trajectory3D.tsx         # Trajectoires et passes
├── MatchVisualization3D.tsx # Composant principal
└── index.ts                 # Exports
```

### Performance

**Optimisations** :
- Lazy loading avec `<Suspense>`
- Géométries instanciées
- Shadow mapping 2048x2048
- LOD (Level of Detail) pour objets distants (à venir)

**FPS Target** : 60 FPS
**Polygones** : ~50,000 par frame

## 📱 Responsive & Tablette

### Breakpoints

```css
h-[600px] lg:h-[700px]  /* Hauteur canvas */
```

### Touch Optimisé

- Pinch to zoom (geste deux doigts)
- Swipe rotation
- Tap pour sélection (à venir)

### Mobile First

Tous les contrôles sont tactiles :
- Boutons larges (min 44x44px)
- Espacement adéquat
- Labels clairs

## 🎯 Cas d'Usage

### 1. Analyse Tactique

**Scénario** : Analyser les positions défensives

1. Activer la vue tactique (caméra dessus)
2. Afficher heat map équipe domicile
3. Observer les zones d'occupation
4. Identifier les espaces libres

### 2. Étude de Passes

**Scénario** : Visualiser le réseau de passes

1. Charger les données de passes
2. Activer PassingNetwork3D
3. Observer épaisseur des connexions
4. Identifier les joueurs clés

### 3. Replay d'Action

**Scénario** : Revoir un but

1. Charger tracking data
2. Positionner timeline sur l'action
3. Vue broadcast pour angle TV
4. Play avec trajectoires activées

## 🚀 Fonctionnalités à Venir

### Phase 2

- [ ] Replay temporel avec slider
- [ ] Export vidéo/GIF
- [ ] Annotations tactiques 3D
- [ ] Mode VR/AR
- [ ] Comparaison multi-matchs
- [ ] Zoom sur joueur (caméra suiveuse)

### Phase 3

- [ ] Intégration données réelles API
- [ ] ML pour prédiction de mouvement
- [ ] Analyse en temps réel (WebSocket)
- [ ] Mode multijoueur (spectateurs)

## 📚 API & Intégration

### Chargement de Données

```tsx
// Exemple d'intégration avec GraphQL
import { useQuery } from '@apollo/client';
import { GET_TRACKING_DATA } from '@/graphql/queries';

function MyComponent() {
  const { data } = useQuery(GET_TRACKING_DATA, {
    variables: { matchId: 'match-123' }
  });

  return (
    <MatchVisualization3D
      trackingData={data?.trackingData}
      showHeatMap={true}
    />
  );
}
```

### Format de Données

```typescript
interface TrackingFrame {
  timestamp: number;
  period: 'first-half' | 'second-half';
  ball: { x: number; y: number; z: number; speed: number };
  players: Array<{
    id: string;
    team: 'home' | 'away';
    x: number;
    y: number;
    z: number;
    speed: number;
    direction: number;
  }>;
}
```

## 🐛 Troubleshooting

### Canvas Noir

**Problème** : Le canvas ne s'affiche pas

**Solutions** :
1. Vérifier que WebGL est supporté
2. Vérifier la console pour erreurs Three.js
3. Tester sur navigateur récent

### Performance Lente

**Problème** : FPS bas (<30)

**Solutions** :
1. Réduire shadow-mapSize à 1024
2. Désactiver les ombres temporairement
3. Réduire le nombre de joueurs affichés
4. Utiliser gridSize plus petit pour heat map

### Contrôles Non Réactifs

**Problème** : La souris ne fonctionne pas

**Solutions** :
1. Vérifier que OrbitControls est activé
2. Vérifier les event listeners
3. Tester sans fullscreen

## 📖 Ressources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [WebGL Fundamentals](https://webglfundamentals.org/)

---

**FootMind Engine** - Visualisation 3D Immersive 🎮⚽🏆
