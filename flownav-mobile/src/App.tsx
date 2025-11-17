/**
 * FlowNav Mobile - Main Application
 * Complete integration example with GPS aggregation, API, and UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { DepartureRecommendation } from './components/DepartureRecommendation';
import { PrivacyDashboard } from './components/PrivacyDashboard';
import { GpsAggregationService, MockGpsSimulator } from './services/GpsAggregationService';
import { FlowNavApiClient } from './services/FlowNavApiClient';
import { TravelTimeOptimizer } from './models/TravelTimeOptimizer';
import { defaultConfig } from '../config/default';
import type {
  OptimalDeparture,
  TravelTimeCurve,
  Route,
  RouteSegment,
  PrivacyMetrics,
  UserStatistics,
  TrafficAggregate,
  GpsReading,
} from './types';

type Screen = 'recommendation' | 'privacy';

const App: React.FC = () => {
  // State
  const [currentScreen, setCurrentScreen] = useState<Screen>('recommendation');
  const [loading, setLoading] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [optimalDeparture, setOptimalDeparture] = useState<OptimalDeparture | null>(null);
  const [travelTimeCurve, setTravelTimeCurve] = useState<TravelTimeCurve | null>(null);

  // Privacy metrics
  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetrics>({
    aggregatesSentToday: 0,
    currentDeviceIdAge: 0,
    nextIdRotationAt: Date.now() + 12.5 * 60 * 1000,
    kAnonymityViolations: 0,
    dataPurgedCount: 0,
  });

  // User statistics
  const [userStats, setUserStats] = useState<UserStatistics>({
    totalTrips: 0,
    totalTimeSavedMinutes: 0,
    totalCo2SavedGrams: 0,
    averageGainPerTripMinutes: 0,
    optimalDepartureFollowedPercent: 0,
    contributedAggregatesCount: 0,
  });

  // Services (initialized once)
  const [services] = useState(() => {
    const gpsService = new GpsAggregationService(defaultConfig.privacy);
    const apiClient = new FlowNavApiClient(defaultConfig);
    const optimizer = new TravelTimeOptimizer(defaultConfig.prediction);
    const mockGps = new MockGpsSimulator();

    return { gpsService, apiClient, optimizer, mockGps };
  });

  /**
   * Initialize app and start GPS simulation
   */
  useEffect(() => {
    console.log('[App] Initializing FlowNav Mobile...');

    // Start mock GPS simulation (2s interval)
    services.mockGps.start(2000, (reading: GpsReading) => {
      if (sharingEnabled) {
        services.gpsService.processGpsReading(reading, 'urban');
      }
    });

    // Start auto-aggregation (every 60s)
    services.gpsService.startAutoAggregation((aggregate: TrafficAggregate) => {
      console.log('[App] Aggregate created:', aggregate);

      // Upload to cloud if sharing enabled
      if (sharingEnabled) {
        services.apiClient
          .uploadTelemetry([aggregate])
          .then(response => {
            console.log('[App] Telemetry uploaded:', response);
            setPrivacyMetrics(prev => ({
              ...prev,
              aggregatesSentToday: prev.aggregatesSentToday + 1,
            }));
            setUserStats(prev => ({
              ...prev,
              contributedAggregatesCount: prev.contributedAggregatesCount + 1,
            }));
          })
          .catch(error => {
            console.error('[App] Upload failed:', error);
          });
      }
    });

    // Update privacy metrics every second
    const metricsTimer = setInterval(() => {
      const idExpiration = services.apiClient.getIdExpirationTime().getTime();
      const idAge = (15 * 60 * 1000) - (idExpiration - Date.now());

      setPrivacyMetrics(prev => ({
        ...prev,
        currentDeviceIdAge: Math.floor(idAge / 1000),
        nextIdRotationAt: idExpiration,
      }));
    }, 1000);

    // Cleanup on unmount
    return () => {
      services.mockGps.stop();
      services.gpsService.stopAutoAggregation();
      clearInterval(metricsTimer);
    };
  }, [services, sharingEnabled]);

  /**
   * Calculate optimal departure for demo route
   */
  const calculateOptimalDeparture = useCallback(async () => {
    setLoading(true);

    try {
      // Create demo route (Paris: République → Défense, ~10 km)
      const demoRoute: Route = {
        id: 'demo_route_1',
        origin: { latitude: 48.8671, longitude: 2.3642, accuracy: 10, timestamp: Date.now() },
        destination: { latitude: 48.8922, longitude: 2.2358, accuracy: 10, timestamp: Date.now() },
        totalDistance: 10,
        segments: [
          {
            id: 'seg_001',
            length: 2.5,
            speedLimit: 50,
            roadType: 'urban',
            coordinates: [],
          },
          {
            id: 'seg_002',
            length: 3.0,
            speedLimit: 70,
            roadType: 'highway',
            coordinates: [],
          },
          {
            id: 'seg_003',
            length: 2.5,
            speedLimit: 50,
            roadType: 'urban',
            coordinates: [],
          },
          {
            id: 'seg_004',
            length: 2.0,
            speedLimit: 50,
            roadType: 'urban',
            coordinates: [],
          },
        ] as RouteSegment[],
      };

      // In production: fetch real predictions from API
      // For demo: generate mock predictions
      const mockPredictions = generateMockPredictions(demoRoute);
      services.optimizer.loadPredictions(mockPredictions);

      // Calculate optimal departure
      const currentTime = Date.now();
      const optimal = services.optimizer.findOptimalDeparture(demoRoute, currentTime, {
        flexibilityMinutes: 30,
        resolutionMinutes: 5,
      });

      setOptimalDeparture(optimal);

      // Generate T(t₀) curve for visualization
      const curveData = services.optimizer.generateTravelTimeCurve(
        demoRoute,
        currentTime,
        30,
        1 // 1-min resolution for smooth curve
      );

      setTravelTimeCurve({
        dataPoints: curveData,
        optimalT0: optimal.t0,
        currentT0: currentTime,
      });

      // Check for shockwaves
      const shockwave = services.optimizer.detectShockwave(demoRoute, currentTime);
      if (shockwave.detected) {
        Alert.alert(
          '⚠️ Onde de Congestion Détectée',
          `Une onde de ralentissement est prévue à ${shockwave.distanceKm} km dans ` +
          `${shockwave.etaMinutes} minutes. Sévérité : ${shockwave.severity}.`
        );
      }

      console.log('[App] Optimal departure calculated:', optimal);
    } catch (error) {
      console.error('[App] Optimization failed:', error);
      Alert.alert('Erreur', 'Impossible de calculer le départ optimal.');
    } finally {
      setLoading(false);
    }
  }, [services]);

  /**
   * Handle toggle data sharing
   */
  const handleToggleSharing = useCallback((enabled: boolean) => {
    setSharingEnabled(enabled);

    if (enabled) {
      Alert.alert(
        'Partage Activé',
        'Vos données de trafic anonymisées seront partagées pour améliorer les prédictions. ' +
        'Aucune position GPS brute ne sera transmise.'
      );
    } else {
      Alert.alert(
        'Mode Hors Ligne',
        'FlowNav fonctionnera uniquement avec vos données locales. ' +
        'Les prédictions seront limitées.'
      );
    }
  }, []);

  /**
   * Handle data purge
   */
  const handlePurgeData = useCallback(() => {
    Alert.alert(
      'Confirmer Suppression',
      'Êtes-vous sûr de vouloir supprimer toutes vos données locales ? ' +
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            services.gpsService.purgeData();
            services.optimizer.clearPredictions();
            setPrivacyMetrics(prev => ({
              ...prev,
              dataPurgedCount: prev.dataPurgedCount + 1,
            }));
            Alert.alert('✓ Données Supprimées', 'Toutes vos données locales ont été purgées.');
          },
        },
      ]
    );
  }, [services]);

  /**
   * Handle depart now
   */
  const handleDepartNow = useCallback(() => {
    Alert.alert(
      'Départ Immédiat',
      'Navigation démarrée. FlowNav vous guidera avec les recommandations de vitesse optimales.'
    );

    // Update statistics
    setUserStats(prev => ({
      ...prev,
      totalTrips: prev.totalTrips + 1,
    }));
  }, []);

  /**
   * Handle wait for optimal time
   */
  const handleWait = useCallback(() => {
    if (optimalDeparture) {
      const waitMinutes = Math.floor((optimalDeparture.t0 - Date.now()) / 60000);
      Alert.alert(
        '⏰ Attente Optimale',
        `Nous vous notifierons dans ${waitMinutes} minutes pour partir au moment optimal. ` +
        `Gain estimé : ${Math.round(optimalDeparture.gainMinutes)} min.`
      );

      // Update statistics
      setUserStats(prev => ({
        ...prev,
        totalTimeSavedMinutes: prev.totalTimeSavedMinutes + optimalDeparture.gainMinutes,
        totalCo2SavedGrams: prev.totalCo2SavedGrams + optimalDeparture.gainMinutes * 30, // ~30g/min
        optimalDepartureFollowedPercent:
          ((prev.totalTrips * prev.optimalDepartureFollowedPercent / 100 + 1) /
            (prev.totalTrips + 1)) * 100,
      }));
    }
  }, [optimalDeparture]);

  /**
   * Initial calculation on mount
   */
  useEffect(() => {
    calculateOptimalDeparture();
  }, [calculateOptimalDeparture]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 FlowNav</Text>
        <Text style={styles.headerSubtitle}>Navigation Prédictive Privacy-First</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'recommendation' && styles.tabActive]}
          onPress={() => setCurrentScreen('recommendation')}
        >
          <Text style={[styles.tabText, currentScreen === 'recommendation' && styles.tabTextActive]}>
            Départ Optimal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === 'privacy' && styles.tabActive]}
          onPress={() => setCurrentScreen('privacy')}
        >
          <Text style={[styles.tabText, currentScreen === 'privacy' && styles.tabTextActive]}>
            Confidentialité
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentScreen === 'recommendation' ? (
        <DepartureRecommendation
          optimal={optimalDeparture}
          curve={travelTimeCurve}
          loading={loading}
          onDepartNow={handleDepartNow}
          onWait={handleWait}
        />
      ) : (
        <PrivacyDashboard
          privacyMetrics={privacyMetrics}
          userStats={userStats}
          sharingEnabled={sharingEnabled}
          onToggleSharing={handleToggleSharing}
          onPurgeData={handlePurgeData}
          onViewPrivacyPolicy={() => Alert.alert('Politique de Confidentialité', 'Ouvre la politique...')}
        />
      )}

      {/* Recalculate Button (Recommendation screen only) */}
      {currentScreen === 'recommendation' && (
        <TouchableOpacity
          style={styles.recalculateButton}
          onPress={calculateOptimalDeparture}
          disabled={loading}
        >
          <Text style={styles.recalculateButtonText}>
            {loading ? '⏳ Calcul...' : '🔄 Recalculer'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

/**
 * Generate mock speed predictions for demo
 * In production: fetch from API
 */
function generateMockPredictions(route: Route) {
  const predictions = [];
  const now = Date.now();

  for (const segment of route.segments) {
    for (let offset = 0; offset <= 30; offset += 5) {
      const time = now + offset * 60 * 1000;

      // Simulate congestion pattern: slower at +10-20 min, faster at +25-30 min
      let baseSpeed = segment.speedLimit;
      if (offset >= 10 && offset <= 20) {
        baseSpeed *= 0.5; // Congestion
      } else if (offset >= 25) {
        baseSpeed *= 0.9; // Recovery
      }

      predictions.push({
        segmentId: segment.id,
        time,
        speedKmh: baseSpeed + (Math.random() - 0.5) * 10,
        stdKmh: 5 + Math.random() * 5,
        confidence: 0.75 + Math.random() * 0.2,
      });
    }
  }

  return predictions;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2196F3',
  },
  recalculateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  recalculateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
