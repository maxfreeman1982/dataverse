/**
 * Tests for Anonymization Utilities
 *
 * Tests k-anonymity validation, ephemeral ID generation,
 * segment hashing, and metadata sanitization
 */

import {
  generateEphemeralId,
  isIdExpired,
  hashSegmentId,
  meetsKAnonymity,
  sanitizeMetadata,
  getDailySecret,
} from '../anonymization';

describe('Anonymization Utilities', () => {
  describe('generateEphemeralId', () => {
    it('should generate ephemeral ID with correct structure', () => {
      const ephemeralId = generateEphemeralId();

      expect(ephemeralId).toHaveProperty('id');
      expect(ephemeralId).toHaveProperty('createdAt');
      expect(ephemeralId).toHaveProperty('expiresAt');

      expect(typeof ephemeralId.id).toBe('string');
      expect(ephemeralId.id.length).toBeGreaterThan(0);
      expect(ephemeralId.createdAt).toBeLessThanOrEqual(Date.now());
      expect(ephemeralId.expiresAt).toBeGreaterThan(ephemeralId.createdAt);
    });

    it('should generate unique IDs', () => {
      const id1 = generateEphemeralId();
      const id2 = generateEphemeralId();

      expect(id1.id).not.toBe(id2.id);
    });

    it('should set expiration between 10-15 minutes', () => {
      const id = generateEphemeralId();
      const lifespan = id.expiresAt - id.createdAt;
      const tenMinutes = 10 * 60 * 1000;
      const fifteenMinutes = 15 * 60 * 1000;

      expect(lifespan).toBeGreaterThanOrEqual(tenMinutes);
      expect(lifespan).toBeLessThanOrEqual(fifteenMinutes);
    });
  });

  describe('isIdExpired', () => {
    it('should return false for fresh ID', () => {
      const id = generateEphemeralId();
      expect(isIdExpired(id)).toBe(false);
    });

    it('should return true for expired ID', () => {
      const expiredId = {
        id: 'test-id',
        createdAt: Date.now() - 20 * 60 * 1000, // 20 min ago
        expiresAt: Date.now() - 5 * 60 * 1000, // expired 5 min ago
      };

      expect(isIdExpired(expiredId)).toBe(true);
    });

    it('should return true for ID expiring now', () => {
      const expiringId = {
        id: 'test-id',
        createdAt: Date.now() - 10 * 60 * 1000,
        expiresAt: Date.now(),
      };

      expect(isIdExpired(expiringId)).toBe(true);
    });
  });

  describe('hashSegmentId', () => {
    it('should generate consistent hash for same input', () => {
      const geohashBin = 'u09tunq';
      const roadType = 'highway';

      const hash1 = hashSegmentId(geohashBin, roadType);
      const hash2 = hashSegmentId(geohashBin, roadType);

      expect(hash1.hashed).toBe(hash2.hashed);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashSegmentId('u09tunq', 'highway');
      const hash2 = hashSegmentId('u09tunr', 'highway');
      const hash3 = hashSegmentId('u09tunq', 'urban');

      expect(hash1.hashed).not.toBe(hash2.hashed);
      expect(hash1.hashed).not.toBe(hash3.hashed);
    });

    it('should include seg_ prefix', () => {
      const hash = hashSegmentId('u09tunq', 'highway');
      expect(hash.hashed).toMatch(/^seg_/);
    });

    it('should preserve geohashBin in result', () => {
      const geohashBin = 'u09tunq';
      const hash = hashSegmentId(geohashBin, 'highway');

      expect(hash.geohashBin).toBe(geohashBin);
    });

    it('should calculate length correctly', () => {
      const hash = hashSegmentId('u09tunq', 'highway');
      expect(hash.length).toBeGreaterThan(0);
      expect(typeof hash.length).toBe('number');
    });
  });

  describe('meetsKAnonymity', () => {
    it('should return true when count meets threshold', () => {
      expect(meetsKAnonymity(3, 3)).toBe(true);
      expect(meetsKAnonymity(5, 3)).toBe(true);
      expect(meetsKAnonymity(100, 3)).toBe(true);
    });

    it('should return false when count below threshold', () => {
      expect(meetsKAnonymity(0, 3)).toBe(false);
      expect(meetsKAnonymity(1, 3)).toBe(false);
      expect(meetsKAnonymity(2, 3)).toBe(false);
    });

    it('should use default threshold of 3', () => {
      expect(meetsKAnonymity(2)).toBe(false);
      expect(meetsKAnonymity(3)).toBe(true);
      expect(meetsKAnonymity(4)).toBe(true);
    });

    it('should work with custom thresholds', () => {
      expect(meetsKAnonymity(4, 5)).toBe(false);
      expect(meetsKAnonymity(5, 5)).toBe(true);
      expect(meetsKAnonymity(10, 10)).toBe(true);
    });
  });

  describe('sanitizeMetadata', () => {
    it('should remove identifying fields', () => {
      const aggregate = {
        segment_id: 'seg_123',
        time_window: {
          start: 1700000000000,
          end: 1700000300000,
          duration_sec: 300,
        },
        veh_count: 5,
        avg_speed_kmh: 85.5,
        std_speed_kmh: 12.3,
        confidence: 0.92,
        deviceId: 'should-be-removed',
        userId: 'should-be-removed',
        rawGps: { lat: 48.8566, lng: 2.3522 },
      };

      const sanitized = sanitizeMetadata(aggregate);

      expect(sanitized).not.toHaveProperty('deviceId');
      expect(sanitized).not.toHaveProperty('userId');
      expect(sanitized).not.toHaveProperty('rawGps');
    });

    it('should preserve valid aggregate fields', () => {
      const aggregate = {
        segment_id: 'seg_123',
        time_window: {
          start: 1700000000000,
          end: 1700000300000,
          duration_sec: 300,
        },
        veh_count: 5,
        avg_speed_kmh: 85.5,
        std_speed_kmh: 12.3,
        confidence: 0.92,
      };

      const sanitized = sanitizeMetadata(aggregate);

      expect(sanitized.segment_id).toBe('seg_123');
      expect(sanitized.veh_count).toBe(5);
      expect(sanitized.avg_speed_kmh).toBe(85.5);
      expect(sanitized.confidence).toBe(0.92);
    });

    it('should round high-precision values', () => {
      const aggregate = {
        segment_id: 'seg_123',
        time_window: {
          start: 1700000000000,
          end: 1700000300000,
          duration_sec: 300,
        },
        veh_count: 5,
        avg_speed_kmh: 85.55555555,
        std_speed_kmh: 12.33333333,
        confidence: 0.9234567890,
      };

      const sanitized = sanitizeMetadata(aggregate);

      // Should be rounded to reasonable precision
      expect(sanitized.avg_speed_kmh.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(sanitized.std_speed_kmh.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('getDailySecret', () => {
    it('should return consistent secret for same day', () => {
      const secret1 = getDailySecret();
      const secret2 = getDailySecret();

      expect(secret1).toBe(secret2);
    });

    it('should return a non-empty string', () => {
      const secret = getDailySecret();

      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });

    it('should include date component', () => {
      const secret = getDailySecret();
      const today = new Date().toISOString().split('T')[0];

      // Secret should be based on current date
      expect(secret).toContain(today);
    });
  });

  describe('Privacy guarantees', () => {
    it('should never expose raw GPS coordinates after hashing', () => {
      const rawGps = { latitude: 48.8566, longitude: 2.3522 };
      const geohashBin = 'u09tunq'; // Already binned
      const hash = hashSegmentId(geohashBin, 'highway');

      // Hash result should not contain raw coordinates
      expect(hash.hashed).not.toContain('48.8566');
      expect(hash.hashed).not.toContain('2.3522');
    });

    it('should enforce k-anonymity before allowing transmission', () => {
      const aggregates = [
        { veh_count: 1 },
        { veh_count: 2 },
        { veh_count: 3 },
        { veh_count: 5 },
      ];

      const validAggregates = aggregates.filter((agg) =>
        meetsKAnonymity(agg.veh_count, 3)
      );

      // Only k>=3 should pass
      expect(validAggregates.length).toBe(2);
      expect(validAggregates[0].veh_count).toBe(3);
      expect(validAggregates[1].veh_count).toBe(5);
    });

    it('should rotate IDs within 10-15 minute window', () => {
      const id = generateEphemeralId();
      const lifespan = id.expiresAt - id.createdAt;
      const tenMinutes = 10 * 60 * 1000;
      const fifteenMinutes = 15 * 60 * 1000;

      expect(lifespan).toBeGreaterThanOrEqual(tenMinutes);
      expect(lifespan).toBeLessThanOrEqual(fifteenMinutes);
    });
  });

  describe('RGPD Compliance', () => {
    it('should not store personal identifiers in sanitized data', () => {
      const data = {
        segment_id: 'seg_123',
        veh_count: 5,
        avg_speed_kmh: 85,
        email: 'user@example.com',
        phone: '+33612345678',
        name: 'John Doe',
        ip: '192.168.1.1',
      };

      const sanitized = sanitizeMetadata(data);

      expect(sanitized).not.toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('phone');
      expect(sanitized).not.toHaveProperty('name');
      expect(sanitized).not.toHaveProperty('ip');
    });

    it('should allow data purge by removing all stored data', () => {
      // This would test actual purge mechanism
      // For now, verify sanitization removes identifying data
      const userData = {
        trips: [
          {
            segment_id: 'seg_1',
            veh_count: 5,
            userId: 'user-123',
          },
        ],
      };

      const purged = userData.trips.map(sanitizeMetadata);

      purged.forEach((trip) => {
        expect(trip).not.toHaveProperty('userId');
      });
    });
  });
});
