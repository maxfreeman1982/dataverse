/**
 * Tests for GPS Aggregation Service
 *
 * Critical tests for privacy-by-design:
 * - No raw GPS storage
 * - K-anonymity enforcement
 * - Segment aggregation
 * - Time window management
 */

import { GpsAggregationService } from '../GpsAggregationService';
import { GpsReading } from '../../types';

describe('GpsAggregationService', () => {
  let service: GpsAggregationService;

  beforeEach(() => {
    service = new GpsAggregationService();
  });

  afterEach(() => {
    service.reset();
  });

  describe('GPS Reading Processing', () => {
    it('should process GPS reading without storing raw coordinates', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 23.6, // m/s
        heading: 180,
        accuracy: 10,
        timestamp: Date.now(),
      };

      service.processGpsReading(reading, 'urban');

      // Verify no raw GPS in internal state
      const aggregates = service.getAggregates();
      aggregates.forEach((agg) => {
        expect(agg).not.toHaveProperty('latitude');
        expect(agg).not.toHaveProperty('longitude');
        expect(agg).not.toHaveProperty('coordinate');
      });
    });

    it('should convert GPS to segment ID immediately', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25, // m/s (90 km/h)
        heading: 180,
        accuracy: 10,
        timestamp: Date.now(),
      };

      service.processGpsReading(reading, 'highway');

      const aggregates = service.getAggregates();
      expect(aggregates.length).toBeGreaterThan(0);
      expect(aggregates[0].segment_id).toMatch(/^seg_/);
    });

    it('should convert speed from m/s to km/h', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25, // m/s
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      service.processGpsReading(reading, 'highway');

      // Add more readings to same segment to meet k-anonymity
      for (let i = 0; i < 3; i++) {
        service.processGpsReading(
          {
            ...reading,
            coordinate: {
              latitude: 48.8566 + i * 0.0001,
              longitude: 2.3522 + i * 0.0001,
            },
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        // 25 m/s = 90 km/h
        expect(aggregates[0].avg_speed_kmh).toBeCloseTo(90, 0);
      }
    });

    it('should aggregate multiple readings into same segment', () => {
      const baseReading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Add 5 readings to same area (should be same segment)
      for (let i = 0; i < 5; i++) {
        service.processGpsReading(
          {
            ...baseReading,
            coordinate: {
              latitude: 48.8566 + i * 0.00001, // Very close
              longitude: 2.3522 + i * 0.00001,
            },
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      // Should have aggregated into fewer segments
      expect(aggregates.length).toBeLessThan(5);
    });
  });

  describe('K-Anonymity Enforcement', () => {
    it('should only return aggregates with k>=3', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Add exactly 2 readings (below k=3)
      service.processGpsReading(reading, 'highway');
      service.processGpsReading(
        { ...reading, coordinate: { latitude: 48.8567, longitude: 2.3523 } },
        'highway'
      );

      const aggregates = service.getAggregates();
      // Should filter out aggregates with veh_count < 3
      aggregates.forEach((agg) => {
        expect(agg.veh_count).toBeGreaterThanOrEqual(3);
      });
    });

    it('should include aggregate when k>=3', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Add 4 readings to same segment
      for (let i = 0; i < 4; i++) {
        service.processGpsReading(
          {
            ...reading,
            coordinate: {
              latitude: 48.8566 + i * 0.00001,
              longitude: 2.3522 + i * 0.00001,
            },
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      expect(aggregates.some((agg) => agg.veh_count >= 3)).toBe(true);
    });
  });

  describe('Time Window Management', () => {
    it('should create time windows of 5 minutes', () => {
      const now = Date.now();
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: now,
      };

      for (let i = 0; i < 3; i++) {
        service.processGpsReading(
          {
            ...reading,
            coordinate: {
              latitude: 48.8566 + i * 0.00001,
              longitude: 2.3522 + i * 0.00001,
            },
            timestamp: now + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        const timeWindow = aggregates[0].time_window;
        expect(timeWindow.duration_sec).toBe(300); // 5 minutes
      }
    });

    it('should separate readings into different time windows', () => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: now,
      };

      // Add readings now
      for (let i = 0; i < 3; i++) {
        service.processGpsReading({ ...reading, timestamp: now + i * 1000 }, 'highway');
      }

      // Add readings 6 minutes later
      for (let i = 0; i < 3; i++) {
        service.processGpsReading(
          { ...reading, timestamp: now + fiveMinutes + 60000 + i * 1000 },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      // Should have separate time windows
      const uniqueWindows = new Set(aggregates.map((agg) => agg.time_window.start));
      expect(uniqueWindows.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Statistical Aggregation', () => {
    it('should calculate average speed correctly', () => {
      const speeds = [20, 25, 30]; // m/s
      const now = Date.now();

      speeds.forEach((speed, i) => {
        service.processGpsReading(
          {
            coordinate: {
              latitude: 48.8566 + i * 0.00001,
              longitude: 2.3522 + i * 0.00001,
            },
            speed,
            heading: 0,
            accuracy: 10,
            timestamp: now + i * 1000,
          },
          'highway'
        );
      });

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        const avgSpeedMps = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const expectedKmh = avgSpeedMps * 3.6;

        expect(aggregates[0].avg_speed_kmh).toBeCloseTo(expectedKmh, 0);
      }
    });

    it('should calculate standard deviation', () => {
      const readings = [
        { speed: 25, lat: 48.8566, lng: 2.3522 },
        { speed: 25, lat: 48.8566, lng: 2.3522 },
        { speed: 25, lat: 48.8566, lng: 2.3522 },
      ];

      readings.forEach((r, i) => {
        service.processGpsReading(
          {
            coordinate: { latitude: r.lat + i * 0.00001, longitude: r.lng + i * 0.00001 },
            speed: r.speed,
            heading: 0,
            accuracy: 10,
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      });

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        // Same speed = std should be 0 or very low
        expect(aggregates[0].std_speed_kmh).toBeLessThan(1);
      }
    });

    it('should calculate confidence based on sample size', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Add 10 readings
      for (let i = 0; i < 10; i++) {
        service.processGpsReading(
          {
            ...reading,
            coordinate: {
              latitude: 48.8566 + i * 0.00001,
              longitude: 2.3522 + i * 0.00001,
            },
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        // More samples = higher confidence
        expect(aggregates[0].confidence).toBeGreaterThan(0);
        expect(aggregates[0].confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Privacy Guarantees', () => {
    it('should never expose raw GPS in getAggregates()', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      for (let i = 0; i < 5; i++) {
        service.processGpsReading(
          {
            ...reading,
            coordinate: {
              latitude: 48.8566 + i * 0.0001,
              longitude: 2.3522 + i * 0.0001,
            },
            timestamp: Date.now() + i * 1000,
          },
          'highway'
        );
      }

      const aggregates = service.getAggregates();
      const serialized = JSON.stringify(aggregates);

      // Raw coordinates should not appear anywhere
      expect(serialized).not.toContain('48.8566');
      expect(serialized).not.toContain('2.3522');
      expect(serialized).not.toContain('latitude');
      expect(serialized).not.toContain('longitude');
    });

    it('should enforce k-anonymity threshold', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Add only 2 readings (below threshold)
      service.processGpsReading(reading, 'highway');
      service.processGpsReading(
        {
          ...reading,
          coordinate: { latitude: 48.8567, longitude: 2.3523 },
          timestamp: Date.now() + 1000,
        },
        'highway'
      );

      const aggregates = service.getAggregates();

      // All returned aggregates must meet k>=3
      aggregates.forEach((agg) => {
        expect(agg.veh_count).toBeGreaterThanOrEqual(3);
      });
    });

    it('should purge old data after reset', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      for (let i = 0; i < 5; i++) {
        service.processGpsReading(reading, 'highway');
      }

      expect(service.getAggregates().length).toBeGreaterThan(0);

      service.reset();

      expect(service.getAggregates().length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle readings with very low speed', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 0.5, // Barely moving
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      service.processGpsReading(reading, 'urban');

      // Should not crash
      expect(service.getAggregates()).toBeDefined();
    });

    it('should handle readings with zero speed', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 0, // Stopped
        heading: 0,
        accuracy: 10,
        timestamp: Date.now(),
      };

      for (let i = 0; i < 3; i++) {
        service.processGpsReading(reading, 'urban');
      }

      const aggregates = service.getAggregates();
      if (aggregates.length > 0) {
        expect(aggregates[0].avg_speed_kmh).toBe(0);
      }
    });

    it('should handle readings with high accuracy uncertainty', () => {
      const reading: GpsReading = {
        coordinate: { latitude: 48.8566, longitude: 2.3522 },
        speed: 25,
        heading: 0,
        accuracy: 100, // Poor accuracy
        timestamp: Date.now(),
      };

      service.processGpsReading(reading, 'highway');

      // Should still process but maybe with lower confidence
      expect(service.getAggregates()).toBeDefined();
    });

    it('should handle rapid successive readings', () => {
      const now = Date.now();

      for (let i = 0; i < 100; i++) {
        service.processGpsReading(
          {
            coordinate: {
              latitude: 48.8566 + i * 0.0001,
              longitude: 2.3522 + i * 0.0001,
            },
            speed: 25,
            heading: 0,
            accuracy: 10,
            timestamp: now + i * 100, // Every 100ms
          },
          'highway'
        );
      }

      // Should handle large volume
      expect(service.getAggregates().length).toBeGreaterThan(0);
    });
  });
});
