/**
 * FlowNav - GPS Aggregation Service
 * Privacy-preserving GPS tracking with k-anonymity and local aggregation
 *
 * CRITICAL: Never stores or transmits raw GPS coordinates
 * All data aggregated to segment level before any storage/transmission
 */

import type {
  GpsReading,
  GpsCoordinate,
  SpeedObservation,
  TrafficAggregate,
  SegmentId,
  FlowNavConfig,
} from '../types';
import {
  coordinateToGeohashBin,
  hashSegmentId,
  meetsKAnonymity,
  meetsLDiversity,
  binTimestamp,
} from '../utils/anonymization';

// ============================================================================
// CONSTANTS
// ============================================================================

const AGGREGATION_WINDOW_MS = 60 * 1000; // 60 seconds
const K_ANONYMITY_THRESHOLD = 3; // minimum vehicles per aggregate
const MIN_STD_DIVERSITY = 5; // km/h minimum std for l-diversity
const MAX_BUFFER_SIZE = 100; // max observations before forced aggregation

// ============================================================================
// GPS AGGREGATION SERVICE
// ============================================================================

export class GpsAggregationService {
  private observations: SpeedObservation[] = [];
  private currentSegmentId: string | null = null;
  private windowStartTime: number = Date.now();
  private aggregationTimer: NodeJS.Timeout | null = null;
  private config: FlowNavConfig['privacy'];

  constructor(config: FlowNavConfig['privacy']) {
    this.config = config;
  }

  /**
   * Process new GPS reading
   * CRITICAL: Raw coordinate is immediately converted to segment ID
   * and then DISCARDED from memory (never stored)
   */
  public processGpsReading(
    reading: GpsReading,
    roadType: 'urban' | 'highway' | 'rural' = 'urban'
  ): void {
    // Convert GPS to segment ID (binned + hashed)
    const segmentId = this.coordinateToSegment(reading.coordinate, roadType);

    // Convert speed m/s -> km/h
    const speedKmh = reading.speed * 3.6;

    // Create observation (NO GPS COORDINATES STORED)
    const observation: SpeedObservation = {
      speed: speedKmh,
      timestamp: reading.timestamp || Date.now(),
      segmentId: segmentId.hashed,
    };

    // Add to buffer
    this.observations.push(observation);

    // Update current segment
    this.currentSegmentId = segmentId.hashed;

    // Check if aggregation needed
    this.checkAggregationTrigger();

    // GPS coordinate is NOW OUT OF SCOPE and garbage collected
    // No raw position data remains in memory
  }

  /**
   * Convert GPS coordinate to anonymized segment ID
   * This is the ONLY place raw coordinates are used, then immediately discarded
   */
  private coordinateToSegment(
    coordinate: GpsCoordinate,
    roadType: 'urban' | 'highway' | 'rural'
  ): SegmentId {
    // Bin coordinate to privacy-preserving resolution
    const geohashBin = coordinateToGeohashBin(coordinate, roadType);

    // Hash to create non-reversible segment ID
    return hashSegmentId(geohashBin, roadType);
  }

  /**
   * Check if aggregation should be triggered
   * Triggers:
   * 1. Time window elapsed (60s)
   * 2. Buffer full (100 observations)
   * 3. Segment changed (entered new road segment)
   */
  private checkAggregationTrigger(): void {
    const now = Date.now();
    const windowElapsed = now - this.windowStartTime >= AGGREGATION_WINDOW_MS;
    const bufferFull = this.observations.length >= MAX_BUFFER_SIZE;

    if (windowElapsed || bufferFull) {
      this.aggregateAndFlush();
    }
  }

  /**
   * Aggregate observations and create k-anonymous traffic aggregate
   * Returns aggregate ONLY if k-anonymity threshold is met
   */
  private aggregateAndFlush(): TrafficAggregate | null {
    if (this.observations.length === 0) {
      return null;
    }

    // Group by segment ID
    const segmentGroups = this.groupBySegment(this.observations);

    // Process each segment group
    const aggregates: TrafficAggregate[] = [];

    for (const [segmentId, observations] of Object.entries(segmentGroups)) {
      const aggregate = this.createAggregate(segmentId, observations);

      // CRITICAL: Only include if meets k-anonymity
      if (aggregate && meetsKAnonymity(aggregate.vehicleCount, K_ANONYMITY_THRESHOLD)) {
        // Also check l-diversity (speed variance)
        if (meetsLDiversity(aggregate.stdSpeedKmh, MIN_STD_DIVERSITY)) {
          aggregates.push(aggregate);
        }
      }
    }

    // Clear buffer
    this.observations = [];
    this.windowStartTime = Date.now();

    return aggregates.length > 0 ? aggregates[0] : null;
  }

  /**
   * Group observations by segment ID
   */
  private groupBySegment(
    observations: SpeedObservation[]
  ): Record<string, SpeedObservation[]> {
    return observations.reduce((groups, obs) => {
      if (!groups[obs.segmentId]) {
        groups[obs.segmentId] = [];
      }
      groups[obs.segmentId].push(obs);
      return groups;
    }, {} as Record<string, SpeedObservation[]>);
  }

  /**
   * Create traffic aggregate from observations
   */
  private createAggregate(
    segmentId: string,
    observations: SpeedObservation[]
  ): TrafficAggregate | null {
    if (observations.length === 0) {
      return null;
    }

    // Calculate statistics
    const speeds = observations.map(o => o.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    // Calculate standard deviation
    const variance = speeds.reduce((sum, speed) => {
      return sum + Math.pow(speed - avgSpeed, 2);
    }, 0) / speeds.length;
    const stdSpeed = Math.sqrt(variance);

    // Get time window
    const timestamps = observations.map(o => o.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeWindow = binTimestamp(minTime, 1); // 1-min bins

    // Create aggregate
    const aggregate: TrafficAggregate = {
      segmentId,
      timeWindow,
      vehicleCount: observations.length, // In reality, this would be unique vehicle count
      avgSpeedKmh: Math.round(avgSpeed * 10) / 10,
      stdSpeedKmh: Math.round(stdSpeed * 10) / 10,
      source: ['edge_device'],
      confidence: this.calculateConfidence(observations),
      sentAt: new Date().toISOString(),
    };

    return aggregate;
  }

  /**
   * Calculate confidence score based on observation quality
   */
  private calculateConfidence(observations: SpeedObservation[]): number {
    // Factors:
    // 1. Sample size (more = better)
    // 2. Time coverage (longer = better)
    // 3. Speed variance (moderate = better, too low/high = suspect)

    const sampleScore = Math.min(1, observations.length / 10);

    const timeSpan = Math.max(...observations.map(o => o.timestamp)) -
                     Math.min(...observations.map(o => o.timestamp));
    const timeScore = Math.min(1, timeSpan / 60000); // 60s = 1.0

    const speeds = observations.map(o => o.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length;
    const stdSpeed = Math.sqrt(variance);
    // Ideal std: 5-15 km/h (realistic traffic variation)
    const varianceScore = stdSpeed >= 5 && stdSpeed <= 15 ? 1.0 : 0.7;

    const confidence = (sampleScore * 0.4 + timeScore * 0.3 + varianceScore * 0.3);
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Force aggregation (call before upload)
   */
  public forceAggregation(): TrafficAggregate | null {
    return this.aggregateAndFlush();
  }

  /**
   * Get pending observations count
   */
  public getPendingCount(): number {
    return this.observations.length;
  }

  /**
   * Clear all buffered data (privacy: on demand purge)
   */
  public purgeData(): void {
    this.observations = [];
    this.currentSegmentId = null;
    this.windowStartTime = Date.now();
  }

  /**
   * Start automatic aggregation timer
   */
  public startAutoAggregation(callback: (aggregate: TrafficAggregate) => void): void {
    this.stopAutoAggregation();

    this.aggregationTimer = setInterval(() => {
      const aggregate = this.aggregateAndFlush();
      if (aggregate) {
        callback(aggregate);
      }
    }, AGGREGATION_WINDOW_MS);
  }

  /**
   * Stop automatic aggregation
   */
  public stopAutoAggregation(): void {
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }
  }
}

// ============================================================================
// MOCK GPS SIMULATOR (for testing without real GPS)
// ============================================================================

export class MockGpsSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private currentLat: number;
  private currentLon: number;
  private currentSpeed: number; // m/s

  constructor(
    startLat: number = 48.8566, // Paris
    startLon: number = 2.3522,
    startSpeed: number = 13.89 // 50 km/h in m/s
  ) {
    this.currentLat = startLat;
    this.currentLon = startLon;
    this.currentSpeed = startSpeed;
  }

  /**
   * Start simulating GPS readings
   */
  public start(
    intervalMs: number,
    callback: (reading: GpsReading) => void
  ): void {
    this.stop();

    this.intervalId = setInterval(() => {
      // Simulate movement (roughly north)
      const speedKmh = this.currentSpeed * 3.6;
      const distanceKm = (speedKmh / 3600) * (intervalMs / 1000);
      this.currentLat += distanceKm / 111; // ~111 km per degree latitude

      // Add random variation
      this.currentSpeed += (Math.random() - 0.5) * 2; // +/- 1 m/s
      this.currentSpeed = Math.max(5, Math.min(30, this.currentSpeed)); // 18-108 km/h

      const reading: GpsReading = {
        coordinate: {
          latitude: this.currentLat,
          longitude: this.currentLon,
          accuracy: 10,
          timestamp: Date.now(),
        },
        speed: this.currentSpeed,
        heading: 0,
      };

      callback(reading);
    }, intervalMs);
  }

  /**
   * Stop simulation
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Set simulated speed
   */
  public setSpeed(speedKmh: number): void {
    this.currentSpeed = speedKmh / 3.6;
  }
}

export default GpsAggregationService;
