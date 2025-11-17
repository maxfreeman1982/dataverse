/**
 * FlowNav - Interactive Route Map Component
 * Displays route with real-time traffic predictions and HUD overlay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Route, Alert, GpsCoordinate } from '../types';

const { width, height } = Dimensions.get('window');

interface RouteMapProps {
  route: Route | null;
  currentPosition: GpsCoordinate | null;
  alerts: Alert[];
  trafficPredictions?: Map<string, number>; // segment_id -> speed_kmh
  showTrafficLayer?: boolean;
  onSegmentPress?: (segmentId: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  currentPosition,
  alerts,
  trafficPredictions,
  showTrafficLayer = true,
  onSegmentPress,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for current position marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Auto-center map when route changes
  useEffect(() => {
    if (mapReady && route && mapRef.current) {
      const coordinates = [
        route.origin,
        ...route.segments.flatMap(s => s.coordinates),
        route.destination,
      ].filter(c => c.latitude && c.longitude);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    }
  }, [route, mapReady]);

  // Follow user position
  useEffect(() => {
    if (followUser && currentPosition && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
        },
        zoom: 15,
      });
    }
  }, [currentPosition, followUser]);

  /**
   * Get color for route segment based on predicted speed
   */
  const getSegmentColor = (segmentId: string): string => {
    if (!trafficPredictions || !showTrafficLayer) {
      return '#2196F3'; // Default blue
    }

    const speed = trafficPredictions.get(segmentId);
    if (!speed) return '#9E9E9E'; // Gray (no data)

    // Color coding based on speed
    if (speed >= 80) return '#4CAF50'; // Green (free flow)
    if (speed >= 50) return '#FFC107'; // Yellow (moderate)
    if (speed >= 20) return '#FF9800'; // Orange (congested)
    return '#F44336'; // Red (jammed)
  };

  /**
   * Render route polyline with traffic colors
   */
  const renderRoutePolylines = () => {
    if (!route) return null;

    return route.segments.map((segment, index) => {
      const coordinates = segment.coordinates.length > 0
        ? segment.coordinates
        : [route.origin, route.destination]; // Fallback

      return (
        <Polyline
          key={`segment-${segment.id}-${index}`}
          coordinates={coordinates}
          strokeColor={getSegmentColor(segment.id)}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
          tappable={true}
          onPress={() => onSegmentPress?.(segment.id)}
        />
      );
    });
  };

  /**
   * Render alert markers on map
   */
  const renderAlerts = () => {
    return alerts.map((alert, index) => {
      if (!alert.distance_km || !currentPosition) return null;

      // Calculate approximate alert position
      // (In production: use actual GPS from alert data)
      const bearing = 45; // Mock bearing
      const distance = alert.distance_km / 111; // Rough km to degrees

      const alertPosition = {
        latitude: currentPosition.latitude + distance * Math.cos(bearing * Math.PI / 180),
        longitude: currentPosition.longitude + distance * Math.sin(bearing * Math.PI / 180),
      };

      const iconEmoji = alert.type === 'shockwave_detected' ? '🌊' :
                        alert.type === 'accident' ? '⚠️' :
                        alert.type === 'congestion' ? '🚗' : '⚡';

      return (
        <Marker
          key={`alert-${index}`}
          coordinate={alertPosition}
          title={alert.message}
          description={`${alert.distance_km} km - ${alert.severity}`}
          pinColor={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}
        >
          <View style={styles.alertMarker}>
            <Text style={styles.alertEmoji}>{iconEmoji}</Text>
          </View>
        </Marker>
      );
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentPosition?.latitude || 48.8566,
          longitude: currentPosition?.longitude || 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false} // Custom marker below
        showsMyLocationButton={false}
        showsTraffic={false} // Custom traffic layer
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={() => setFollowUser(false)}
      >
        {/* Route polylines with traffic colors */}
        {renderRoutePolylines()}

        {/* Origin marker */}
        {route && (
          <Marker
            coordinate={route.origin}
            title="Départ"
            pinColor="green"
          >
            <View style={styles.originMarker}>
              <Text style={styles.markerText}>🚀</Text>
            </View>
          </Marker>
        )}

        {/* Destination marker */}
        {route && (
          <Marker
            coordinate={route.destination}
            title="Arrivée"
            pinColor="red"
          >
            <View style={styles.destinationMarker}>
              <Text style={styles.markerText}>🎯</Text>
            </View>
          </Marker>
        )}

        {/* Current position with pulse animation */}
        {currentPosition && (
          <Marker coordinate={currentPosition} anchor={{ x: 0.5, y: 0.5 }}>
            <Animated.View
              style={[
                styles.currentPositionMarker,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.currentPositionDot} />
          </Marker>
        )}

        {/* Alert markers */}
        {renderAlerts()}
      </MapView>

      {/* Traffic legend */}
      {showTrafficLayer && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Trafic</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Fluide</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Modéré</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Dense</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Bloqué</Text>
          </View>
        </View>
      )}

      {/* Recenter button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={() => {
          setFollowUser(true);
          if (currentPosition && mapRef.current) {
            mapRef.current.animateCamera({
              center: currentPosition,
              zoom: 15,
            });
          }
        }}
      >
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      {/* Distance/ETA overlay */}
      {route && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayValue}>{route.totalDistance.toFixed(1)}</Text>
            <Text style={styles.overlayLabel}>km</Text>
          </View>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayValue}>~25</Text>
            <Text style={styles.overlayLabel}>min</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height: height * 0.6,
  },

  // Markers
  originMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  currentPositionMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    opacity: 0.3,
  },
  currentPositionDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: 'white',
    top: 4,
    left: 4,
  },
  alertMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertEmoji: {
    fontSize: 18,
  },

  // Legend
  legend: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },

  // Recenter button
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recenterIcon: {
    fontSize: 24,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overlayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  overlayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  overlayLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default RouteMap;
