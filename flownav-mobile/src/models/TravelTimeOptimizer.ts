/**
 * FlowNav - Travel Time Optimizer
 * Implements T(t₀) calculation and optimal departure time optimization
 *
 * Core Algorithm:
 * T(t₀) = Σᵢ [Δxᵢ / vᵢ(t₀ + Σⱼ₌₁ⁱ⁻¹ Δtⱼ)]
 * t₀_optimal = argmin_{t₀ ∈ [t_now, t_now+Δ]} T(t₀)
 */

import type {
  Route,
  RouteSegment,
  SpeedPrediction,
  TravelTimeCalculation,
  OptimalDeparture,
  FlowNavConfig,
} from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_SPEED_KMH = 5; // Avoid division by zero in jam conditions
const DEFAULT_RESOLUTION_MINUTES = 5; // Grid search resolution
const DEFAULT_FLEXIBILITY_MINUTES = 30; // Max departure delay

// ============================================================================
// TRAVEL TIME OPTIMIZER
// ============================================================================

export class TravelTimeOptimizer {
  private config: FlowNavConfig['prediction'];
  private speedPredictions: Map<string, SpeedPrediction[]> = new Map();

  constructor(config: FlowNavConfig['prediction']) {
    this.config = config;
  }

  /**
   * Load speed predictions for route segments
   * Predictions come from API or local cache
   */
  public loadPredictions(predictions: SpeedPrediction[]): void {
    // Group by segment ID
    this.speedPredictions.clear();
    for (const pred of predictions) {
      if (!this.speedPredictions.has(pred.segmentId)) {
        this.speedPredictions.set(pred.segmentId, []);
      }
      this.speedPredictions.get(pred.segmentId)!.push(pred);
    }

    // Sort by time for efficient lookup
    for (const preds of this.speedPredictions.values()) {
      preds.sort((a, b) => a.time - b.time);
    }
  }

  /**
   * Calculate travel time T(t₀) for a given departure time
   *
   * Algorithm:
   * 1. Start at t₀
   * 2. For each segment i:
   *    - Get predicted speed vᵢ at time t_arrival_segment
   *    - Calculate segment time: Δtᵢ = Δxᵢ / vᵢ
   *    - Update arrival time: t_arrival += Δtᵢ
   * 3. Return total travel time
   */
  public calculateTravelTime(
    route: Route,
    departureTimestamp: number
  ): TravelTimeCalculation {
    let currentTime = departureTimestamp;
    let totalMinutes = 0;
    const segmentTimes: TravelTimeCalculation['segmentTimes'] = [];

    for (const segment of route.segments) {
      // Get predicted speed for this segment at current time
      const predictedSpeed = this.getPredictedSpeed(segment.id, currentTime);

      // Ensure minimum speed (avoid division by zero)
      const effectiveSpeed = Math.max(predictedSpeed, MIN_SPEED_KMH);

      // Calculate segment travel time (hours = km / km/h)
      const segmentTimeHours = segment.length / effectiveSpeed;
      const segmentTimeMinutes = segmentTimeHours * 60;

      // Update cumulative time
      totalMinutes += segmentTimeMinutes;
      currentTime += segmentTimeMinutes * 60 * 1000; // Convert to ms

      // Record segment timing
      segmentTimes.push({
        segmentId: segment.id,
        arrivalTime: currentTime,
        speedKmh: effectiveSpeed,
        durationMinutes: segmentTimeMinutes,
      });
    }

    return {
      t0: departureTimestamp,
      totalMinutes,
      segmentTimes,
    };
  }

  /**
   * Get predicted speed for segment at given time
   * Uses linear interpolation between prediction points
   */
  private getPredictedSpeed(segmentId: string, timestamp: number): number {
    const predictions = this.speedPredictions.get(segmentId);

    if (!predictions || predictions.length === 0) {
      // No predictions available - use fallback (highway speed limit or historical avg)
      return 80; // km/h default
    }

    // Find bracketing predictions
    let lower: SpeedPrediction | null = null;
    let upper: SpeedPrediction | null = null;

    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].time <= timestamp) {
        lower = predictions[i];
      }
      if (predictions[i].time >= timestamp && !upper) {
        upper = predictions[i];
        break;
      }
    }

    // Case 1: Exact match
    if (lower && lower.time === timestamp) {
      return lower.speedKmh;
    }

    // Case 2: Before first prediction
    if (!lower && upper) {
      return upper.speedKmh;
    }

    // Case 3: After last prediction
    if (lower && !upper) {
      return lower.speedKmh;
    }

    // Case 4: Interpolate between lower and upper
    if (lower && upper) {
      const ratio = (timestamp - lower.time) / (upper.time - lower.time);
      return lower.speedKmh + ratio * (upper.speedKmh - lower.speedKmh);
    }

    // Fallback
    return 80;
  }

  /**
   * Find optimal departure time using grid search
   *
   * Algorithm:
   * 1. Generate candidate t₀ values: [t_now, t_now+5min, ..., t_now+30min]
   * 2. For each t₀, calculate T(t₀)
   * 3. Return t₀ with minimum T(t₀)
   *
   * Optional constraints:
   * - Arrival deadline: t₀ + T(t₀) ≤ t_arrival_target
   */
  public findOptimalDeparture(
    route: Route,
    currentTimestamp: number,
    options: {
      arrivalTarget?: number;
      flexibilityMinutes?: number;
      resolutionMinutes?: number;
    } = {}
  ): OptimalDeparture {
    const flexibilityMinutes = options.flexibilityMinutes || DEFAULT_FLEXIBILITY_MINUTES;
    const resolutionMinutes = options.resolutionMinutes || DEFAULT_RESOLUTION_MINUTES;

    // Generate candidate departure times
    const candidates: number[] = [];
    for (let offset = 0; offset <= flexibilityMinutes; offset += resolutionMinutes) {
      candidates.push(currentTimestamp + offset * 60 * 1000);
    }

    // Calculate T(t₀) for each candidate
    const results: Array<{
      t0: number;
      travelTime: number;
      arrivalTime: number;
    }> = [];

    for (const t0 of candidates) {
      const calc = this.calculateTravelTime(route, t0);
      const arrivalTime = t0 + calc.totalMinutes * 60 * 1000;

      // Check arrival constraint
      if (options.arrivalTarget && arrivalTime > options.arrivalTarget) {
        continue; // Skip this candidate (arrives too late)
      }

      results.push({
        t0,
        travelTime: calc.totalMinutes,
        arrivalTime,
      });
    }

    // Find minimum travel time
    if (results.length === 0) {
      // No valid candidates (all violate arrival constraint)
      // Return immediate departure
      const immediate = this.calculateTravelTime(route, currentTimestamp);
      return {
        t0: currentTimestamp,
        travelTimeMinutes: immediate.totalMinutes,
        arrivalTime: currentTimestamp + immediate.totalMinutes * 60 * 1000,
        gainMinutes: 0,
        confidence: 0.5,
        recommendation: 'Aucune fenêtre de départ valide. Partez immédiatement.',
      };
    }

    const optimal = results.reduce((best, current) =>
      current.travelTime < best.travelTime ? current : best
    );

    // Calculate immediate departure time for comparison
    const immediate = this.calculateTravelTime(route, currentTimestamp);
    const gainMinutes = immediate.totalMinutes - optimal.travelTime;

    // Calculate confidence based on prediction quality
    const confidence = this.calculateConfidence(route, optimal.t0);

    // Generate recommendation message
    const recommendation = this.generateRecommendation(
      optimal.t0,
      currentTimestamp,
      gainMinutes,
      confidence
    );

    return {
      t0: optimal.t0,
      travelTimeMinutes: optimal.travelTime,
      arrivalTime: optimal.arrivalTime,
      gainMinutes,
      confidence,
      recommendation,
    };
  }

  /**
   * Calculate confidence score for departure recommendation
   * Based on prediction quality and time horizon
   */
  private calculateConfidence(route: Route, departureTime: number): number {
    let totalConfidence = 0;
    let count = 0;

    for (const segment of route.segments) {
      const predictions = this.speedPredictions.get(segment.id);
      if (predictions && predictions.length > 0) {
        // Average confidence of predictions
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        totalConfidence += avgConfidence;
        count++;
      }
    }

    if (count === 0) {
      return 0.5; // No predictions, low confidence
    }

    const baseConfidence = totalConfidence / count;

    // Reduce confidence for longer time horizons
    const timeHorizonMinutes = (departureTime - Date.now()) / 60000;
    const horizonFactor = Math.max(0.7, 1 - timeHorizonMinutes / 60);

    return Math.round(baseConfidence * horizonFactor * 100) / 100;
  }

  /**
   * Generate human-readable recommendation message
   */
  private generateRecommendation(
    optimalT0: number,
    currentTime: number,
    gainMinutes: number,
    confidence: number
  ): string {
    const waitMinutes = Math.round((optimalT0 - currentTime) / 60000);

    if (waitMinutes <= 1) {
      if (gainMinutes > 5) {
        return `Départ optimal maintenant ! Gain estimé ${Math.round(gainMinutes)} min (confiance ${Math.round(confidence * 100)}%).`;
      } else {
        return `Partez maintenant. Conditions de trafic stables.`;
      }
    } else {
      const gainText = gainMinutes > 3
        ? ` — gain estimé ${Math.round(gainMinutes)} min`
        : '';
      return `Recommande : partez dans ${waitMinutes} min${gainText}. Confiance ${Math.round(confidence * 100)}%.`;
    }
  }

  /**
   * Generate T(t₀) curve for visualization
   * Returns array of {t0, travelMinutes} for plotting
   */
  public generateTravelTimeCurve(
    route: Route,
    currentTimestamp: number,
    flexibilityMinutes: number = 30,
    resolutionMinutes: number = 1
  ): Array<{ t0: number; travelMinutes: number }> {
    const curve: Array<{ t0: number; travelMinutes: number }> = [];

    for (let offset = 0; offset <= flexibilityMinutes; offset += resolutionMinutes) {
      const t0 = currentTimestamp + offset * 60 * 1000;
      const calc = this.calculateTravelTime(route, t0);
      curve.push({
        t0,
        travelMinutes: calc.totalMinutes,
      });
    }

    return curve;
  }

  /**
   * Detect shockwave (congestion wave) on route
   * Returns alert if wave detected
   */
  public detectShockwave(
    route: Route,
    departureTimestamp: number
  ): {
    detected: boolean;
    distanceKm?: number;
    etaMinutes?: number;
    severity?: 'low' | 'medium' | 'high';
  } {
    let currentTime = departureTimestamp;
    let distanceTraveled = 0;

    for (const segment of route.segments) {
      const currentSpeed = this.getPredictedSpeed(segment.id, currentTime);
      const futureSpeed = this.getPredictedSpeed(
        segment.id,
        currentTime + 5 * 60 * 1000 // 5 min ahead
      );

      // Shockwave detected if speed drops significantly
      const speedDrop = currentSpeed - futureSpeed;
      if (speedDrop > 20) {
        // >20 km/h drop = shockwave
        const severity: 'low' | 'medium' | 'high' =
          speedDrop > 40 ? 'high' : speedDrop > 30 ? 'medium' : 'low';

        return {
          detected: true,
          distanceKm: Math.round(distanceTraveled * 10) / 10,
          etaMinutes: Math.round((currentTime - departureTimestamp) / 60000),
          severity,
        };
      }

      // Update for next segment
      const segmentTime = (segment.length / Math.max(currentSpeed, MIN_SPEED_KMH)) * 60; // minutes
      currentTime += segmentTime * 60 * 1000;
      distanceTraveled += segment.length;
    }

    return { detected: false };
  }

  /**
   * Clear cached predictions
   */
  public clearPredictions(): void {
    this.speedPredictions.clear();
  }
}

export default TravelTimeOptimizer;
