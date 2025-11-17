/**
 * Tests for Travel Time Optimizer
 *
 * Tests the core algorithm for calculating optimal departure time t₀
 * that minimizes total travel time T(t₀)
 */

import { TravelTimeOptimizer } from '../TravelTimeOptimizer';
import { Route, RouteSegment, OptimalDeparture } from '../../types';

describe('TravelTimeOptimizer', () => {
  let optimizer: TravelTimeOptimizer;

  beforeEach(() => {
    optimizer = new TravelTimeOptimizer();
  });

  describe('Travel Time Calculation', () => {
    it('should calculate travel time for single segment', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10, // km
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Mock predicted speed: 100 km/h
      const mockPredictor = jest.fn().mockReturnValue(100);
      optimizer.setPredictionFunction(mockPredictor);

      const departureTime = Date.now();
      const result = optimizer.calculateTravelTime(route, departureTime);

      // 10 km at 100 km/h = 6 minutes
      expect(result.totalMinutes).toBeCloseTo(6, 1);
      expect(result.segmentTimes).toHaveLength(1);
    });

    it('should calculate travel time for multiple segments', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10, // km
            roadType: 'highway',
            coordinates: [],
          },
          {
            id: 'seg_2',
            length: 5, // km
            roadType: 'urban',
            coordinates: [],
          },
        ],
        totalDistance: 15,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Mock different speeds for each segment
      const mockPredictor = jest
        .fn()
        .mockReturnValueOnce(100) // seg_1: 100 km/h
        .mockReturnValueOnce(50); // seg_2: 50 km/h

      optimizer.setPredictionFunction(mockPredictor);

      const result = optimizer.calculateTravelTime(route, Date.now());

      // seg_1: 10km at 100km/h = 6min
      // seg_2: 5km at 50km/h = 6min
      // Total: 12 min
      expect(result.totalMinutes).toBeCloseTo(12, 1);
      expect(result.segmentTimes).toHaveLength(2);
    });

    it('should account for time progression between segments', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
          {
            id: 'seg_2',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 20,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const startTime = Date.now();
      let callCount = 0;

      // Mock predictor that checks timestamp progression
      const mockPredictor = jest.fn((segmentId, timestamp) => {
        callCount++;
        if (callCount === 1) {
          // First segment: should be called with startTime
          expect(timestamp).toBeCloseTo(startTime, -3); // Within 1 second
          return 100;
        } else {
          // Second segment: should be later (after first segment)
          expect(timestamp).toBeGreaterThan(startTime);
          return 100;
        }
      });

      optimizer.setPredictionFunction(mockPredictor);
      optimizer.calculateTravelTime(route, startTime);

      expect(mockPredictor).toHaveBeenCalledTimes(2);
    });

    it('should handle minimum speed threshold', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'urban',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Mock very low speed (traffic jam)
      const mockPredictor = jest.fn().mockReturnValue(5); // 5 km/h

      optimizer.setPredictionFunction(mockPredictor);

      const result = optimizer.calculateTravelTime(route, Date.now());

      // Should use actual low speed, not ignore it
      // 10 km at 5 km/h = 120 minutes
      expect(result.totalMinutes).toBeGreaterThan(100);
    });
  });

  describe('Optimal Departure Time Finding', () => {
    it('should find optimal departure time', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 20,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 20,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const now = Date.now();

      // Mock predictor: traffic clears in 10 minutes
      const mockPredictor = jest.fn((segmentId, timestamp) => {
        const minutesFromNow = (timestamp - now) / (60 * 1000);

        if (minutesFromNow < 10) {
          return 40; // Congested: 40 km/h
        } else {
          return 100; // Clear: 100 km/h
        }
      });

      optimizer.setPredictionFunction(mockPredictor);

      const optimal = optimizer.findOptimalDeparture(route, now);

      // Optimal should be waiting until traffic clears
      expect(optimal.t0).toBeGreaterThan(now);
      expect(optimal.gainMinutes).toBeGreaterThan(0);
      expect(optimal.confidence).toBeGreaterThan(0);
    });

    it('should recommend immediate departure if no better time', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Mock constant speed (no congestion changes)
      const mockPredictor = jest.fn().mockReturnValue(100);

      optimizer.setPredictionFunction(mockPredictor);

      const now = Date.now();
      const optimal = optimizer.findOptimalDeparture(route, now);

      // Should recommend leaving now or very soon
      expect(optimal.t0 - now).toBeLessThan(5 * 60 * 1000); // Within 5 min
      expect(optimal.gainMinutes).toBeLessThanOrEqual(1); // Minimal gain
    });

    it('should calculate gain correctly', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 20,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 20,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const now = Date.now();

      // Mock predictor
      const mockPredictor = jest.fn((segmentId, timestamp) => {
        const minutesFromNow = (timestamp - now) / (60 * 1000);

        if (minutesFromNow < 15) {
          return 50; // 20km at 50km/h = 24 min
        } else {
          return 100; // 20km at 100km/h = 12 min
        }
      });

      optimizer.setPredictionFunction(mockPredictor);

      const optimal = optimizer.findOptimalDeparture(route, now);

      // Gain should be significant
      // Immediate: 24 min travel + 0 wait = 24 min total
      // Optimal: wait 15 min + 12 min travel = 27 min total (but saves travel time)
      // Gain is in travel time, not total time
      expect(optimal.gainMinutes).toBeGreaterThan(0);
    });

    it('should respect flexibility window', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const mockPredictor = jest.fn().mockReturnValue(100);
      optimizer.setPredictionFunction(mockPredictor);

      const now = Date.now();
      const optimal = optimizer.findOptimalDeparture(route, now);

      // Should not recommend departure beyond default flexibility (30 min)
      const delayMinutes = (optimal.t0 - now) / (60 * 1000);
      expect(delayMinutes).toBeLessThanOrEqual(30);
    });
  });

  describe('Traffic Prediction Integration', () => {
    it('should use prediction function for speed estimates', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const mockPredictor = jest.fn().mockReturnValue(80);
      optimizer.setPredictionFunction(mockPredictor);

      optimizer.calculateTravelTime(route, Date.now());

      expect(mockPredictor).toHaveBeenCalled();
      expect(mockPredictor).toHaveBeenCalledWith(
        expect.stringContaining('seg_'),
        expect.any(Number)
      );
    });

    it('should handle prediction function returning varying speeds', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Vary speed based on time of day
      const mockPredictor = jest.fn((segmentId, timestamp) => {
        const hour = new Date(timestamp).getHours();
        if (hour >= 8 && hour <= 9) {
          return 40; // Rush hour
        } else {
          return 100; // Off-peak
        }
      });

      optimizer.setPredictionFunction(mockPredictor);

      const morning8am = new Date();
      morning8am.setHours(8, 0, 0, 0);

      const result = optimizer.calculateTravelTime(route, morning8am.getTime());

      // Should get rush hour speed
      expect(result.totalMinutes).toBeGreaterThan(10); // Slower than 100km/h would give
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty route', () => {
      const route: Route = {
        id: 'route-1',
        segments: [],
        totalDistance: 0,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const result = optimizer.calculateTravelTime(route, Date.now());

      expect(result.totalMinutes).toBe(0);
      expect(result.segmentTimes).toHaveLength(0);
    });

    it('should handle very short segments', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 0.1, // 100 meters
            roadType: 'urban',
            coordinates: [],
          },
        ],
        totalDistance: 0.1,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const mockPredictor = jest.fn().mockReturnValue(50);
      optimizer.setPredictionFunction(mockPredictor);

      const result = optimizer.calculateTravelTime(route, Date.now());

      expect(result.totalMinutes).toBeGreaterThan(0);
      expect(result.totalMinutes).toBeLessThan(1); // Very short
    });

    it('should handle very long routes', () => {
      const segments: RouteSegment[] = [];
      for (let i = 0; i < 100; i++) {
        segments.push({
          id: `seg_${i}`,
          length: 1,
          roadType: 'highway',
          coordinates: [],
        });
      }

      const route: Route = {
        id: 'route-1',
        segments,
        totalDistance: 100,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const mockPredictor = jest.fn().mockReturnValue(100);
      optimizer.setPredictionFunction(mockPredictor);

      const result = optimizer.calculateTravelTime(route, Date.now());

      // 100 km at 100 km/h = 60 minutes
      expect(result.totalMinutes).toBeCloseTo(60, 0);
      expect(result.segmentTimes).toHaveLength(100);
    });

    it('should handle prediction function errors gracefully', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 10,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      // Predictor that throws error
      const mockPredictor = jest.fn(() => {
        throw new Error('Prediction failed');
      });

      optimizer.setPredictionFunction(mockPredictor);

      // Should fall back to default speed
      const result = optimizer.calculateTravelTime(route, Date.now());

      expect(result.totalMinutes).toBeGreaterThan(0);
      expect(result.totalMinutes).toBeLessThan(1000); // Reasonable fallback
    });
  });

  describe('Algorithm Correctness', () => {
    it('should implement T(t₀) = Σᵢ[Δxᵢ / vᵢ(t₀ + Σⱼ Δtⱼ)]', () => {
      // Verify the mathematical formula implementation
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 10, // Δx₁ = 10 km
            roadType: 'highway',
            coordinates: [],
          },
          {
            id: 'seg_2',
            length: 5, // Δx₂ = 5 km
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 15,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const mockPredictor = jest.fn()
        .mockReturnValueOnce(100) // v₁ = 100 km/h
        .mockReturnValueOnce(50);  // v₂ = 50 km/h

      optimizer.setPredictionFunction(mockPredictor);

      const t0 = Date.now();
      const result = optimizer.calculateTravelTime(route, t0);

      // Manual calculation:
      // Δt₁ = Δx₁ / v₁ = 10 / 100 = 0.1 hours = 6 min
      // Δt₂ = Δx₂ / v₂ = 5 / 50 = 0.1 hours = 6 min
      // T(t₀) = Δt₁ + Δt₂ = 12 min

      expect(result.totalMinutes).toBeCloseTo(12, 1);

      // Verify that second segment uses t₀ + Δt₁
      const secondCall = mockPredictor.mock.calls[1];
      const expectedTimeForSeg2 = t0 + (6 * 60 * 1000); // t0 + 6 minutes

      expect(secondCall[1]).toBeCloseTo(expectedTimeForSeg2, -2);
    });

    it('should find argmin T(t₀) over candidate departure times', () => {
      const route: Route = {
        id: 'route-1',
        segments: [
          {
            id: 'seg_1',
            length: 20,
            roadType: 'highway',
            coordinates: [],
          },
        ],
        totalDistance: 20,
        destination: { latitude: 48.8566, longitude: 2.3522 },
      };

      const now = Date.now();

      // Create predictable congestion pattern:
      // Now: 40 km/h (30 min travel)
      // +5min: 50 km/h (24 min travel)
      // +10min: 60 km/h (20 min travel) <- optimal
      // +15min: 70 km/h (17 min travel) but wait time makes it worse
      // +20min: 80 km/h (15 min travel) but wait time makes it worse

      const mockPredictor = jest.fn((segmentId, timestamp) => {
        const minutesFromNow = Math.floor((timestamp - now) / (60 * 1000));

        if (minutesFromNow < 5) return 40;
        if (minutesFromNow < 10) return 50;
        if (minutesFromNow < 15) return 60;
        if (minutesFromNow < 20) return 70;
        return 80;
      });

      optimizer.setPredictionFunction(mockPredictor);

      const optimal = optimizer.findOptimalDeparture(route, now);

      // Should find the sweet spot (around 10 min delay)
      const delayMinutes = (optimal.t0 - now) / (60 * 1000);
      expect(delayMinutes).toBeGreaterThan(0);
      expect(delayMinutes).toBeLessThan(20);
    });
  });
});
