/**
 * FlowNav - Trip History Component
 * Display past trips with analytics and insights
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import type { UserStatistics } from '../types';

const screenWidth = Dimensions.get('window').width;

interface Trip {
  id: string;
  date: Date;
  origin: string;
  destination: string;
  distance: number; // km
  duration: number; // minutes
  timeSaved: number; // minutes (vs immediate departure)
  co2Saved: number; // grams
  followedRecommendation: boolean;
  avgSpeed: number; // km/h
  trafficConditions: 'free_flow' | 'moderate' | 'congested';
}

interface TripHistoryProps {
  trips: Trip[];
  userStats: UserStatistics;
  onTripSelect?: (trip: Trip) => void;
}

export const TripHistory: React.FC<TripHistoryProps> = ({
  trips,
  userStats,
  onTripSelect,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [sortBy, setSortBy] = useState<'date' | 'savings' | 'distance'>('date');

  /**
   * Filter trips by period
   */
  const getFilteredTrips = (): Trip[] => {
    const now = Date.now();
    const filtered = trips.filter(trip => {
      const tripTime = trip.date.getTime();
      switch (selectedPeriod) {
        case 'week':
          return now - tripTime <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now - tripTime <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    // Sort trips
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'savings':
          return b.timeSaved - a.timeSaved;
        case 'distance':
          return b.distance - a.distance;
        default:
          return 0;
      }
    });
  };

  /**
   * Generate time savings chart data
   */
  const getTimeSavingsChartData = () => {
    const filteredTrips = getFilteredTrips().slice(0, 7); // Last 7 trips

    return {
      labels: filteredTrips.map((_, i) => `T${i + 1}`),
      datasets: [
        {
          data: filteredTrips.map(t => t.timeSaved),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  /**
   * Generate CO2 savings chart data
   */
  const getCo2ChartData = () => {
    const filteredTrips = getFilteredTrips();
    const weeklyData = Array.from({ length: 4 }, (_, weekIndex) => {
      const weekTrips = filteredTrips.filter(trip => {
        const daysAgo = (Date.now() - trip.date.getTime()) / (24 * 60 * 60 * 1000);
        return daysAgo >= weekIndex * 7 && daysAgo < (weekIndex + 1) * 7;
      });
      return weekTrips.reduce((sum, t) => sum + t.co2Saved, 0) / 1000; // Convert to kg
    });

    return {
      labels: ['S-3', 'S-2', 'S-1', 'Actuelle'],
      datasets: [
        {
          data: weeklyData.reverse(),
        },
      ],
    };
  };

  /**
   * Render trip card
   */
  const renderTripCard = ({ item: trip }: { item: Trip }) => {
    const trafficColor = {
      free_flow: '#4CAF50',
      moderate: '#FFC107',
      congested: '#F44336',
    };

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => onTripSelect?.(trip)}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripRoute}>
            <Text style={styles.tripLocation}>{trip.origin}</Text>
            <Text style={styles.tripArrow}>→</Text>
            <Text style={styles.tripLocation}>{trip.destination}</Text>
          </View>
          {trip.followedRecommendation && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Optimal</Text>
            </View>
          )}
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Date</Text>
            <Text style={styles.tripStatValue}>
              {trip.date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>

          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Distance</Text>
            <Text style={styles.tripStatValue}>{trip.distance.toFixed(1)} km</Text>
          </View>

          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Durée</Text>
            <Text style={styles.tripStatValue}>{trip.duration} min</Text>
          </View>

          <View style={styles.tripStat}>
            <Text style={styles.tripStatLabel}>Vitesse moy.</Text>
            <Text style={styles.tripStatValue}>{trip.avgSpeed.toFixed(0)} km/h</Text>
          </View>
        </View>

        {trip.timeSaved > 0 && (
          <View style={styles.savingsRow}>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsIcon}>⏱️</Text>
              <Text style={styles.savingsText}>
                +{trip.timeSaved.toFixed(0)} min gagnées
              </Text>
            </View>

            <View style={styles.savingsBadge}>
              <Text style={styles.savingsIcon}>🌱</Text>
              <Text style={styles.savingsText}>
                -{(trip.co2Saved / 1000).toFixed(1)} kg CO₂
              </Text>
            </View>
          </View>
        )}

        <View style={styles.trafficIndicator}>
          <View
            style={[
              styles.trafficDot,
              { backgroundColor: trafficColor[trip.trafficConditions] },
            ]}
          />
          <Text style={styles.trafficText}>
            {trip.trafficConditions === 'free_flow' ? 'Fluide' :
             trip.trafficConditions === 'moderate' ? 'Modéré' : 'Dense'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredTrips = getFilteredTrips();

  return (
    <ScrollView style={styles.container}>
      {/* Statistics Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Vos Statistiques</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{userStats.totalTrips}</Text>
            <Text style={styles.summaryLabel}>Trajets</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.successValue]}>
              {Math.round(userStats.totalTimeSavedMinutes)}
            </Text>
            <Text style={styles.summaryLabel}>Min gagnées</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.ecoValue]}>
              {(userStats.totalCo2SavedGrams / 1000).toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>kg CO₂ évités</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {userStats.optimalDepartureFollowedPercent.toFixed(0)}%
            </Text>
            <Text style={styles.summaryLabel}>Suivi optimal</Text>
          </View>
        </View>
      </View>

      {/* Time Savings Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>⏱️ Temps Gagné (derniers trajets)</Text>
        <LineChart
          data={getTimeSavingsChartData()}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#4CAF50',
            },
          }}
          bezier
          style={styles.chart}
          yAxisSuffix=" min"
        />
      </View>

      {/* CO2 Savings Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>🌱 CO₂ Économisé (hebdomadaire)</Text>
        <BarChart
          data={getCo2ChartData()}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
          yAxisSuffix=" kg"
          fromZero
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Période</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'week' && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.filterButtonText, selectedPeriod === 'week' && styles.filterButtonTextActive]}>
              Semaine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'month' && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.filterButtonText, selectedPeriod === 'month' && styles.filterButtonTextActive]}>
              Mois
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[styles.filterButtonText, selectedPeriod === 'all' && styles.filterButtonTextActive]}>
              Tout
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.filtersTitle, { marginTop: 16 }]}>Trier par</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'date' && styles.filterButtonActive]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.filterButtonText, sortBy === 'date' && styles.filterButtonTextActive]}>
              Date
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'savings' && styles.filterButtonActive]}
            onPress={() => setSortBy('savings')}
          >
            <Text style={[styles.filterButtonText, sortBy === 'savings' && styles.filterButtonTextActive]}>
              Gain temps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'distance' && styles.filterButtonActive]}
            onPress={() => setSortBy('distance')}
          >
            <Text style={[styles.filterButtonText, sortBy === 'distance' && styles.filterButtonTextActive]}>
              Distance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip List */}
      <View style={styles.tripsHeader}>
        <Text style={styles.tripsTitle}>
          📍 Historique ({filteredTrips.length} trajets)
        </Text>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun trajet pour cette période</Text>
          </View>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  successValue: {
    color: '#4CAF50',
  },
  ecoValue: {
    color: '#8BC34A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Charts
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Filters
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },

  // Trips List
  tripsHeader: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tripsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // Trip Card
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  tripArrow: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  badge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripStat: {
    alignItems: 'center',
  },
  tripStatLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  tripStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  savingsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  savingsBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 8,
  },
  savingsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  trafficIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trafficDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trafficText: {
    fontSize: 12,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default TripHistory;
