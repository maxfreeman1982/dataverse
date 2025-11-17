/**
 * FlowNav - Departure Recommendation Component
 * Main UI component showing optimal departure time with T(t₀) curve
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { OptimalDeparture, TravelTimeCurve } from '../types';

const screenWidth = Dimensions.get('window').width;

interface DepartureRecommendationProps {
  optimal: OptimalDeparture | null;
  curve: TravelTimeCurve | null;
  loading: boolean;
  onDepartNow: () => void;
  onWait: () => void;
}

export const DepartureRecommendation: React.FC<DepartureRecommendationProps> = ({
  optimal,
  curve,
  loading,
  onDepartNow,
  onWait,
}) => {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!optimal) return;

    const updateCountdown = () => {
      const now = Date.now();
      const wait = Math.max(0, optimal.t0 - now);
      setCountdown(Math.floor(wait / 1000));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [optimal]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Calcul du départ optimal...</Text>
      </View>
    );
  }

  if (!optimal || !curve) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aucune recommandation disponible</Text>
      </View>
    );
  }

  const isOptimalNow = countdown <= 60; // Within 1 minute
  const waitMinutes = Math.floor(countdown / 60);
  const waitSeconds = countdown % 60;

  return (
    <View style={styles.container}>
      {/* Main Recommendation Card */}
      <View style={styles.recommendationCard}>
        <Text style={styles.title}>
          {isOptimalNow ? '✓ Départ Optimal Maintenant' : '⏰ Attendez pour Optimiser'}
        </Text>

        {!isOptimalNow && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {waitMinutes}:{waitSeconds.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>minutes</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(optimal.travelTimeMinutes)}</Text>
            <Text style={styles.statLabel}>min trajet</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.gainValue]}>
              +{Math.round(optimal.gainMinutes)}
            </Text>
            <Text style={styles.statLabel}>min gagnées</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(optimal.confidence * 100)}%</Text>
            <Text style={styles.statLabel}>confiance</Text>
          </View>
        </View>

        <Text style={styles.recommendation}>{optimal.recommendation}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onDepartNow}
          >
            <Text style={styles.buttonTextSecondary}>Partir maintenant</Text>
          </TouchableOpacity>

          {!isOptimalNow && (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={onWait}
            >
              <Text style={styles.buttonTextPrimary}>
                Attendre ({waitMinutes} min)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Travel Time Curve Chart */}
      {curve && curve.dataPoints.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Temps de Trajet selon Départ (T(t₀))</Text>
          <TravelTimeCurveChart curve={curve} optimalT0={optimal.t0} />
        </View>
      )}

      {/* Arrival Time Display */}
      <View style={styles.arrivalContainer}>
        <Text style={styles.arrivalLabel}>Arrivée prévue</Text>
        <Text style={styles.arrivalTime}>
          {new Date(optimal.arrivalTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

/**
 * Travel Time Curve Chart Component
 * Displays T(t₀) curve with optimal point highlighted
 */
interface TravelTimeCurveChartProps {
  curve: TravelTimeCurve;
  optimalT0: number;
}

const TravelTimeCurveChart: React.FC<TravelTimeCurveChartProps> = ({
  curve,
  optimalT0,
}) => {
  // Prepare chart data
  const labels = curve.dataPoints
    .filter((_, i) => i % 5 === 0) // Show every 5th label
    .map(dp => {
      const date = new Date(dp.t0);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

  const data = curve.dataPoints.map(dp => dp.travelMinutes);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 40}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={styles.chart}
      yAxisLabel=""
      yAxisSuffix=" min"
      withInnerLines={true}
      withOuterLines={true}
      withVerticalLabels={true}
      withHorizontalLabels={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },

  // Recommendation Card
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Countdown
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#666',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  gainValue: {
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  recommendation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Arrival Time
  arrivalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arrivalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  arrivalTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default DepartureRecommendation;
