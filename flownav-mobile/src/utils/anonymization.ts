/**
 * FlowNav - Anonymization & Privacy Utilities
 * Implements k-anonymity, ID rotation, segment hashing
 */

import { v4 as uuidv4 } from 'uuid';
import type { EphemeralDeviceId, SegmentId, GpsCoordinate } from '../types';

// ============================================================================
// EPHEMERAL DEVICE ID MANAGEMENT
// ============================================================================

/**
 * Generates a new ephemeral device ID with random expiration (10-15 min)
 * to prevent synchronized rotation fingerprinting
 */
export function generateEphemeralId(): EphemeralDeviceId {
  const now = Date.now();
  // Random expiration between 10-15 minutes to prevent synchronization
  const expirationMinutes = 10 + Math.random() * 5;
  const expiresAt = now + expirationMinutes * 60 * 1000;

  return {
    id: uuidv4(),
    createdAt: now,
    expiresAt,
  };
}

/**
 * Checks if ephemeral ID has expired and needs rotation
 */
export function isIdExpired(ephemeralId: EphemeralDeviceId): boolean {
  return Date.now() >= ephemeralId.expiresAt;
}

/**
 * Gets time remaining until ID rotation (seconds)
 */
export function getIdTimeRemaining(ephemeralId: EphemeralDeviceId): number {
  const remaining = Math.max(0, ephemeralId.expiresAt - Date.now());
  return Math.floor(remaining / 1000);
}

// ============================================================================
// GEOHASH BINNING (privacy-preserving spatial aggregation)
// ============================================================================

/**
 * Converts GPS coordinate to binned geohash for privacy
 * Resolution: ~200m urban, ~500m highway
 */
export function coordinateToGeohashBin(
  coordinate: GpsCoordinate,
  roadType: 'urban' | 'highway' | 'rural'
): string {
  // Binning resolution (decimal degrees)
  const binSizes = {
    urban: 0.002, // ~200m at mid latitudes
    highway: 0.005, // ~500m
    rural: 0.005,
  };

  const binSize = binSizes[roadType];

  // Bin latitude and longitude
  const latBin = Math.floor(coordinate.latitude / binSize) * binSize;
  const lonBin = Math.floor(coordinate.longitude / binSize) * binSize;

  // Return binned geohash (NOT transmitted, used only for local hashing)
  return `${latBin.toFixed(6)},${lonBin.toFixed(6)}`;
}

/**
 * Simple hash function (HMAC-SHA256 simulation)
 * In production, use native crypto: crypto.createHmac('sha256', secret)
 */
function simpleHash(input: string, secret: string): string {
  // Simplified hash for demo - in production use real HMAC-SHA256
  let hash = 0;
  const combined = input + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates rotating secret for segment hashing (daily rotation)
 */
export function getDailySecret(): string {
  const today = new Date().toISOString().split('T')[0];
  // In production: derive from secure random seed stored in encrypted storage
  return `flownav_secret_${today}`;
}

/**
 * Hashes geohash bin to create non-reversible segment ID
 */
export function hashSegmentId(geohashBin: string, roadType: string): SegmentId {
  const secret = getDailySecret();
  const input = `${geohashBin}|${roadType}`;
  const hashed = simpleHash(input, secret);

  // Estimate segment length based on binning
  const segmentLengths = {
    urban: 200,
    highway: 500,
    rural: 500,
  };

  return {
    hashed: `seg_${hashed}`,
    geohashBin, // NOT transmitted, kept local only
    length: segmentLengths[roadType as keyof typeof segmentLengths] || 300,
  };
}

// ============================================================================
// K-ANONYMITY VALIDATION
// ============================================================================

/**
 * Checks if aggregate meets k-anonymity threshold
 * Returns true if vehicleCount >= k (typically k=3)
 */
export function meetsKAnonymity(
  vehicleCount: number,
  kThreshold: number = 3
): boolean {
  return vehicleCount >= kThreshold;
}

/**
 * Validates that aggregate has sufficient diversity (l-diversity)
 * Standard deviation should be > minimum to prevent homogeneity
 */
export function meetsLDiversity(
  stdSpeedKmh: number,
  minStdKmh: number = 5
): boolean {
  return stdSpeedKmh >= minStdKmh;
}

// ============================================================================
// TIME WINDOW BINNING
// ============================================================================

/**
 * Bins timestamp to time window (removes second-level precision)
 * Default: 5-minute bins
 */
export function binTimestamp(timestamp: number, windowMinutes: number = 5): {
  start: string;
  end: string;
} {
  const windowMs = windowMinutes * 60 * 1000;
  const binStart = Math.floor(timestamp / windowMs) * windowMs;
  const binEnd = binStart + windowMs;

  return {
    start: new Date(binStart).toISOString(),
    end: new Date(binEnd).toISOString(),
  };
}

/**
 * Converts absolute timestamp to relative offset (privacy)
 * Returns minutes since session start (not absolute time)
 */
export function toRelativeTimestamp(
  timestamp: number,
  sessionStart: number
): number {
  return Math.floor((timestamp - sessionStart) / 60000); // minutes
}

// ============================================================================
// DATA SANITIZATION
// ============================================================================

/**
 * Removes all potentially identifying metadata before transmission
 */
export interface SanitizedData {
  [key: string]: unknown;
}

export function sanitizeMetadata(data: any): SanitizedData {
  // Whitelist of allowed fields (blacklist everything else)
  const allowedFields = [
    'device_id_ephemeral',
    'segment_id',
    'time_window',
    'veh_count',
    'avg_speed_kmh',
    'std_speed_kmh',
    'lane_count',
    'source',
    'confidence',
    'sent_at',
  ];

  const sanitized: SanitizedData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }

  return sanitized;
}

/**
 * Adds differential privacy noise (Laplacian) to speed values
 * Optional - Phase 2 feature
 */
export function addDifferentialPrivacyNoise(
  value: number,
  epsilon: number = 0.1,
  sensitivity: number = 10
): number {
  // Laplacian mechanism: noise ~ Lap(sensitivity/epsilon)
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  return Math.max(0, value + noise); // ensure non-negative
}

// ============================================================================
// PRIVACY METRICS CALCULATION
// ============================================================================

/**
 * Calculates privacy score (0-1) based on multiple factors
 * Higher = better privacy
 */
export function calculatePrivacyScore(metrics: {
  kAnonymity: number;
  lDiversity: number;
  idAge: number;
  maxIdAge: number;
  spatialBinSize: number;
  temporalBinSize: number;
}): number {
  // K-anonymity score (normalized, target k=3)
  const kScore = Math.min(1, metrics.kAnonymity / 5);

  // L-diversity score (normalized, target std=10 km/h)
  const lScore = Math.min(1, metrics.lDiversity / 10);

  // ID freshness (1 = just rotated, 0 = about to expire)
  const idScore = 1 - metrics.idAge / metrics.maxIdAge;

  // Spatial privacy (larger bins = better privacy)
  const spatialScore = Math.min(1, metrics.spatialBinSize / 500);

  // Temporal privacy (larger windows = better privacy)
  const temporalScore = Math.min(1, metrics.temporalBinSize / 5);

  // Weighted average
  const score =
    kScore * 0.3 +
    lScore * 0.2 +
    idScore * 0.2 +
    spatialScore * 0.15 +
    temporalScore * 0.15;

  return Math.round(score * 100) / 100;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateEphemeralId,
  isIdExpired,
  getIdTimeRemaining,
  coordinateToGeohashBin,
  hashSegmentId,
  meetsKAnonymity,
  meetsLDiversity,
  binTimestamp,
  toRelativeTimestamp,
  sanitizeMetadata,
  addDifferentialPrivacyNoise,
  calculatePrivacyScore,
};
