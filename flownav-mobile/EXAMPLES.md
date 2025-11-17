# FlowNav Mobile — Exemples d'Utilisation

Guide pratique avec exemples de code pour intégrer FlowNav dans vos applications.

---

## 📋 Table des Matières

1. [Initialisation Basique](#1-initialisation-basique)
2. [GPS Aggregation avec Privacy](#2-gps-aggregation-avec-privacy)
3. [Calcul Départ Optimal](#3-calcul-départ-optimal)
4. [Upload Télémétrie Cloud](#4-upload-télémétrie-cloud)
5. [Real-time WebSocket Updates](#5-real-time-websocket-updates)
6. [Détection Ondes de Choc](#6-détection-ondes-de-choc)
7. [Privacy Dashboard Intégration](#7-privacy-dashboard-intégration)
8. [Cas d'Usage Complets](#8-cas-dusage-complets)

---

## 1. Initialisation Basique

### Configuration Minimale

```typescript
import { FlowNavConfig } from './src/types';

const config: FlowNavConfig = {
  api: {
    baseUrl: 'https://api.flownav.ai/v1',
    timeout: 10000,
    retryAttempts: 3,
  },
  privacy: {
    idRotationMinutes: 12.5,
    kAnonymityThreshold: 3,
    aggregationWindowSeconds: 60,
    minSegmentLengthMeters: 200, // urban
  },
  gps: {
    updateIntervalMs: 2000,
    minAccuracyMeters: 20,
    backgroundTracking: true,
  },
  prediction: {
    horizonMinutes: 30,
    resolutionMinutes: 5,
    maxFlexibilityMinutes: 30,
  },
  storage: {
    maxRetentionDays: 7,
    encryptionEnabled: true,
  },
};
```

---

## 2. GPS Aggregation avec Privacy

### Exemple : Traitement GPS Real-time

```typescript
import { GpsAggregationService } from './src/services/GpsAggregationService';
import Geolocation from 'react-native-geolocation-service';

const gpsService = new GpsAggregationService(config.privacy);

// Démarrer tracking GPS
Geolocation.watchPosition(
  (position) => {
    const reading = {
      coordinate: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      },
      speed: position.coords.speed || 0, // m/s
      heading: position.coords.heading || 0,
    };

    // CRITICAL: Position GPS convertie immédiatement en segment_id
    // et jamais stockée
    gpsService.processGpsReading(reading, 'urban');
  },
  (error) => console.error('GPS error:', error),
  {
    enableHighAccuracy: true,
    distanceFilter: 10, // meters
    interval: 2000, // 2s
    fastestInterval: 1000,
  }
);

// Agrégation automatique toutes les 60s
gpsService.startAutoAggregation((aggregate) => {
  console.log('✓ Agrégat créé (k-anonyme):', aggregate);
  // {
  //   segmentId: 'seg_abc123',
  //   vehicleCount: 5,  // ≥ 3
  //   avgSpeedKmh: 52.3,
  //   stdSpeedKmh: 9.1,
  //   confidence: 0.85
  // }
});
```

### Exemple : Vérification Privacy avant Upload

```typescript
import { meetsKAnonymity, meetsLDiversity } from './src/utils/anonymization';

const aggregate = gpsService.forceAggregation();

if (aggregate) {
  // Vérifier k-anonymité
  if (!meetsKAnonymity(aggregate.vehicleCount, 3)) {
    console.warn('⚠️ k-anonymity violation! Aggregate rejected.');
    return; // NE PAS transmettre
  }

  // Vérifier l-diversity (variance vitesses)
  if (!meetsLDiversity(aggregate.stdSpeedKmh, 5)) {
    console.warn('⚠️ Low diversity! May be homogeneous data.');
  }

  // OK pour transmission
  console.log('✓ Aggregate meets privacy requirements');
}
```

---

## 3. Calcul Départ Optimal

### Exemple : Optimisation Simple

```typescript
import { TravelTimeOptimizer } from './src/models/TravelTimeOptimizer';
import type { Route } from './src/types';

const optimizer = new TravelTimeOptimizer(config.prediction);

// Définir itinéraire
const route: Route = {
  id: 'route_home_work',
  origin: { latitude: 48.8566, longitude: 2.3522, accuracy: 10, timestamp: Date.now() },
  destination: { latitude: 48.8922, longitude: 2.2358, accuracy: 10, timestamp: Date.now() },
  totalDistance: 10, // km
  segments: [
    { id: 'seg_001', length: 3.0, speedLimit: 50, roadType: 'urban', coordinates: [] },
    { id: 'seg_002', length: 4.0, speedLimit: 90, roadType: 'highway', coordinates: [] },
    { id: 'seg_003', length: 3.0, speedLimit: 50, roadType: 'urban', coordinates: [] },
  ],
};

// Charger prédictions (depuis API ou cache)
const predictions = await apiClient.getForecast(
  ['seg_001', 'seg_002', 'seg_003'],
  new Date(),
  new Date(Date.now() + 30 * 60 * 1000),
  5
);
optimizer.loadPredictions(predictions);

// Calculer départ optimal
const optimal = optimizer.findOptimalDeparture(route, Date.now(), {
  flexibilityMinutes: 30,
  resolutionMinutes: 5,
});

console.log(`🎯 Départ optimal: ${new Date(optimal.t0).toLocaleTimeString()}`);
console.log(`⏱️ Temps trajet: ${optimal.travelTimeMinutes.toFixed(1)} min`);
console.log(`📈 Gain vs maintenant: ${optimal.gainMinutes.toFixed(1)} min`);
console.log(`💬 ${optimal.recommendation}`);
```

### Exemple : Génération Courbe T(t₀) pour UI

```typescript
// Générer courbe complète (1 min résolution)
const curve = optimizer.generateTravelTimeCurve(route, Date.now(), 30, 1);

// Afficher dans graphique
console.log('Courbe T(t₀):');
curve.forEach(({ t0, travelMinutes }) => {
  const time = new Date(t0).toLocaleTimeString();
  const stars = '█'.repeat(Math.floor(travelMinutes / 2));
  console.log(`${time}: ${travelMinutes.toFixed(1)} min ${stars}`);
});

// Exemple output:
// 15:00:00: 52.3 min ██████████████████████████
// 15:01:00: 51.8 min █████████████████████████▊
// ...
// 15:11:00: 38.5 min ███████████████████▎  ← OPTIMAL
// ...
```

### Exemple : Calcul avec Contrainte Arrivée

```typescript
// RDV à 16:00, maximum 30 min flexibilité
const arrivalTarget = new Date();
arrivalTarget.setHours(16, 0, 0);

const optimal = optimizer.findOptimalDeparture(route, Date.now(), {
  arrivalTarget: arrivalTarget.getTime(),
  flexibilityMinutes: 30,
  resolutionMinutes: 5,
});

if (optimal.arrivalTime > arrivalTarget.getTime()) {
  console.warn('⚠️ Impossible d\'arriver à temps! Départ immédiat recommandé.');
} else {
  const margin = (arrivalTarget.getTime() - optimal.arrivalTime) / 60000;
  console.log(`✓ Arrivée prévue avec ${margin.toFixed(0)} min de marge`);
}
```

---

## 4. Upload Télémétrie Cloud

### Exemple : Upload Batch Agrégats

```typescript
import { FlowNavApiClient } from './src/services/FlowNavApiClient';

const apiClient = new FlowNavApiClient(config);

// Collecter agrégats (via GpsAggregationService)
const aggregates = [
  /* agrégats k-anonymes */
];

try {
  const response = await apiClient.uploadTelemetry(aggregates);

  console.log(`✓ Upload réussi:`);
  console.log(`  - Acceptés: ${response.accepted_count}`);
  console.log(`  - Rejetés: ${response.rejected_count}`);

  if (response.rejected_count > 0) {
    console.warn(`  Raisons: ${response.rejected_reasons?.join(', ')}`);
  }

  console.log(`  Prochain upload: ${response.next_upload_after}`);
} catch (error) {
  console.error('❌ Upload échoué:', error.message);
  // Agrégats conservés localement pour retry automatique
}
```

### Exemple : Gestion Rotation ID

```typescript
// Vérifier âge ID actuel
const idExpiration = apiClient.getIdExpirationTime();
const timeRemaining = (idExpiration.getTime() - Date.now()) / 1000;

console.log(`🔄 ID expire dans ${Math.floor(timeRemaining / 60)} min`);

if (timeRemaining < 60) {
  console.log('⏳ Rotation ID imminente...');
}

// Forcer rotation (optionnel, pour privacy on-demand)
apiClient.forceIdRotation();
console.log('✓ Nouveau ID généré:', apiClient.getCurrentDeviceId());
```

---

## 5. Real-time WebSocket Updates

### Exemple : Stream Mises à Jour HUD

```typescript
import { FlowNavWebSocketClient } from './src/services/FlowNavApiClient';

const wsClient = new FlowNavWebSocketClient('wss://api.flownav.ai/v1/ws/realtime');

// Connecter avec callback
wsClient.connect(
  (data) => {
    console.log('📡 Update reçu:', data);

    if (data.type === 'speed_update') {
      console.log(
        `Segment ${data.segment_id}: ${data.speed_kmh} km/h ` +
          `(confiance ${(data.confidence * 100).toFixed(0)}%)`
      );

      // Afficher alertes
      if (data.alerts) {
        data.alerts.forEach((alert) => {
          console.log(`⚠️ ${alert.message}`);
        });
      }
    }
  },
  (error) => console.error('❌ WS error:', error)
);

// S'abonner aux segments de l'itinéraire actif
wsClient.subscribeToRoute('route_123', ['seg_001', 'seg_002', 'seg_003']);

// Cleanup
// wsClient.disconnect();
```

---

## 6. Détection Ondes de Choc

### Exemple : Alerte Shockwave

```typescript
// Détection durant calcul optimal
const shockwave = optimizer.detectShockwave(route, Date.now());

if (shockwave.detected) {
  const severityEmoji = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
  };

  console.log(
    `${severityEmoji[shockwave.severity!]} Onde de congestion détectée!`
  );
  console.log(`  Distance: ${shockwave.distanceKm} km`);
  console.log(`  ETA: ${shockwave.etaMinutes} min`);
  console.log(`  Sévérité: ${shockwave.severity}`);

  // Notification push utilisateur
  showNotification({
    title: 'Alerte Trafic',
    body: `Ralentissement à ${shockwave.distanceKm} km dans ${shockwave.etaMinutes} min`,
    priority: 'high',
  });
}
```

---

## 7. Privacy Dashboard Intégration

### Exemple : Monitoring Métriques Privacy

```typescript
import { useState, useEffect } from 'react';
import type { PrivacyMetrics, UserStatistics } from './src/types';

function usePrivacyMetrics(apiClient, gpsService) {
  const [metrics, setMetrics] = useState<PrivacyMetrics>({
    aggregatesSentToday: 0,
    currentDeviceIdAge: 0,
    nextIdRotationAt: Date.now() + 12.5 * 60 * 1000,
    kAnonymityViolations: 0,
    dataPurgedCount: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const idExpiration = apiClient.getIdExpirationTime().getTime();
      const idAge = 15 * 60 * 1000 - (idExpiration - Date.now());

      setMetrics((prev) => ({
        ...prev,
        currentDeviceIdAge: Math.floor(idAge / 1000),
        nextIdRotationAt: idExpiration,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [apiClient]);

  return metrics;
}

// Dans votre composant
const privacyMetrics = usePrivacyMetrics(apiClient, gpsService);

console.log(`📊 Privacy Score: ${calculatePrivacyScore(privacyMetrics) * 100}%`);
```

### Exemple : Toggle Partage Données

```typescript
function handleToggleSharing(enabled: boolean) {
  if (enabled) {
    // Activer partage
    gpsService.startAutoAggregation((aggregate) => {
      apiClient.uploadTelemetry([aggregate]);
    });

    // Afficher consentement
    Alert.alert(
      'Partage Activé',
      'Vos données de trafic anonymisées (k≥3) seront partagées. ' +
        'Aucune position GPS brute ne sera jamais transmise.',
      [{ text: 'OK' }]
    );
  } else {
    // Désactiver partage
    gpsService.stopAutoAggregation();

    Alert.alert(
      'Mode Hors Ligne',
      'FlowNav continuera de fonctionner avec prédictions locales uniquement.',
      [{ text: 'OK' }]
    );
  }
}
```

---

## 8. Cas d'Usage Complets

### Use Case 1: Application Commute Quotidien

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';

function CommuteApp() {
  const [optimal, setOptimal] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Services
  const services = useFlowNavServices();

  // Calculer départ optimal au chargement
  useEffect(() => {
    async function calculate() {
      const route = await loadSavedRoute('home_to_work');
      const predictions = await services.apiClient.getForecast(
        route.segments.map((s) => s.id),
        new Date(),
        new Date(Date.now() + 30 * 60 * 1000),
        5
      );

      services.optimizer.loadPredictions(predictions);

      const result = services.optimizer.findOptimalDeparture(route, Date.now(), {
        flexibilityMinutes: 30,
      });

      setOptimal(result);
    }

    calculate();
  }, []);

  // Countdown
  useEffect(() => {
    if (!optimal) return;

    const timer = setInterval(() => {
      const wait = Math.max(0, optimal.t0 - Date.now());
      setCountdown(Math.floor(wait / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [optimal]);

  // Notification au moment optimal
  useEffect(() => {
    if (countdown === 0 && optimal) {
      Alert.alert(
        '✅ C\'est le moment !',
        `Partez maintenant pour arriver à ${new Date(optimal.arrivalTime).toLocaleTimeString()}`
      );
    }
  }, [countdown, optimal]);

  if (!optimal) return <Text>Calcul...</Text>;

  const waitMinutes = Math.floor(countdown / 60);

  return (
    <View>
      <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
        {waitMinutes}:{(countdown % 60).toString().padStart(2, '0')}
      </Text>
      <Text>Gain estimé: {optimal.gainMinutes.toFixed(0)} min</Text>

      <Button
        title="Partir Maintenant"
        onPress={() => {
          /* Démarrer navigation */
        }}
      />
      <Button
        title={`Attendre ${waitMinutes} min`}
        onPress={() => {
          /* Programmer notification */
        }}
      />
    </View>
  );
}
```

### Use Case 2: Livraison Pro avec Flotte

```typescript
// Backend flotte: optimisation multi-véhicules
async function optimizeFleetDepartures(deliveries: Delivery[]) {
  const results = [];

  for (const delivery of deliveries) {
    const route = await calculateRoute(delivery.pickup, delivery.dropoff);

    const predictions = await apiClient.getForecast(
      route.segments.map((s) => s.id),
      new Date(),
      new Date(Date.now() + 60 * 60 * 1000),
      5
    );

    optimizer.loadPredictions(predictions);

    const optimal = optimizer.findOptimalDeparture(route, Date.now(), {
      arrivalTarget: delivery.deadline,
      flexibilityMinutes: 60,
    });

    results.push({
      deliveryId: delivery.id,
      vehicleId: delivery.vehicleId,
      optimalDeparture: optimal.t0,
      estimatedArrival: optimal.arrivalTime,
      gainMinutes: optimal.gainMinutes,
    });
  }

  // Trier par départ optimal
  results.sort((a, b) => a.optimalDeparture - b.optimalDeparture);

  return results;
}

// Afficher planning conducteurs
function FleetDashboard({ results }) {
  return (
    <View>
      {results.map((r) => (
        <View key={r.deliveryId}>
          <Text>Véhicule {r.vehicleId}</Text>
          <Text>
            Départ: {new Date(r.optimalDeparture).toLocaleTimeString()}
          </Text>
          <Text>
            Arrivée: {new Date(r.estimatedArrival).toLocaleTimeString()}
          </Text>
          <Text>Gain: +{r.gainMinutes.toFixed(0)} min</Text>
        </View>
      ))}
    </View>
  );
}
```

### Use Case 3: Road Trip avec Pauses Optimisées

```typescript
// Calcul multi-étapes avec pauses
async function optimizeRoadTrip(stops: Location[], pauseDurations: number[]) {
  const legs = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const route = await calculateRoute(stops[i], stops[i + 1]);

    // Prendre en compte pause précédente
    const departureTime = i === 0 ? Date.now() : legs[i - 1].arrival + pauseDurations[i - 1] * 60 * 1000;

    const predictions = await apiClient.getForecast(
      route.segments.map((s) => s.id),
      new Date(departureTime),
      new Date(departureTime + 60 * 60 * 1000),
      5
    );

    optimizer.loadPredictions(predictions);

    const optimal = optimizer.findOptimalDeparture(route, departureTime, {
      flexibilityMinutes: 20, // Moins de flexibilité en road trip
    });

    legs.push({
      from: stops[i],
      to: stops[i + 1],
      departure: optimal.t0,
      arrival: optimal.arrivalTime,
      travelMinutes: optimal.travelTimeMinutes,
    });
  }

  // Afficher itinéraire complet
  console.log('🚗 Itinéraire Road Trip Optimisé:');
  legs.forEach((leg, i) => {
    console.log(
      `Étape ${i + 1}: ${new Date(leg.departure).toLocaleTimeString()} → ` +
        `${new Date(leg.arrival).toLocaleTimeString()} ` +
        `(${leg.travelMinutes.toFixed(0)} min)`
    );
    if (i < pauseDurations.length) {
      console.log(`  Pause: ${pauseDurations[i]} min`);
    }
  });

  return legs;
}
```

---

## 🎓 Bonnes Pratiques

### ✅ DO
- **Toujours vérifier k-anonymité** avant upload
- **Cacher prédictions** localement (éviter requêtes répétées)
- **Gérer erreurs réseau** gracefully (retry, fallback)
- **Purger données anciennes** automatiquement (>7j)
- **Afficher transparence privacy** dans UI

### ❌ DON'T
- **Jamais stocker GPS brut** (convertir immédiatement)
- **Jamais contourner k-anonymité** (même pour debug)
- **Jamais envoyer metadata device** (IMEI, MAC, user_id)
- **Jamais bloquer UI** sur calculs longs (async/await)
- **Jamais ignorer consentement** utilisateur (opt-in requis)

---

## 🐛 Debugging

### Activer Logs Verbose

```typescript
// Dans services
const DEBUG = __DEV__;

if (DEBUG) {
  console.log('[GPS] Reading:', reading);
  console.log('[Aggregate] Created:', aggregate);
  console.log('[API] Request:', request);
  console.log('[Optimizer] T(t0) curve:', curve);
}
```

### Monitoring Performance

```typescript
import { performance } from 'react-native-performance';

const start = performance.now();

const optimal = optimizer.findOptimalDeparture(route, Date.now(), {
  flexibilityMinutes: 30,
});

const duration = performance.now() - start;
console.log(`⏱️ Optimization took ${duration.toFixed(2)}ms`);

// Cible: <500ms pour 30 min flexibilité
```

---

**Besoin d'aide ?** Consultez le [README.md](./README.md) ou ouvrez une issue sur GitHub.

---

**Version :** 0.1.0
**Dernière mise à jour :** 2025-11-17
