/**
 * FlowNav Mobile - Default Configuration
 * Privacy-first settings with GDPR compliance
 */

import type { FlowNavConfig } from '../src/types';

export const defaultConfig: FlowNavConfig = {
  api: {
    baseUrl: process.env.FLOWNAV_API_URL || 'https://api.flownav.ai/v1',
    timeout: 10000, // 10s
    retryAttempts: 3,
  },

  privacy: {
    // Ephemeral ID rotation (random 10-15 min)
    idRotationMinutes: 12.5, // average

    // k-anonymity: minimum 3 vehicles per aggregate
    kAnonymityThreshold: 3,

    // Aggregation window: 60 seconds
    aggregationWindowSeconds: 60,

    // Spatial binning (prevent GPS fingerprinting)
    minSegmentLengthMeters: 200, // urban (500 for highway)
  },

  gps: {
    // GPS update frequency
    updateIntervalMs: 2000, // 2s = 0.5 Hz

    // Minimum accuracy (reject poor signals)
    minAccuracyMeters: 20,

    // Background tracking for continuous aggregation
    backgroundTracking: true,
  },

  prediction: {
    // Prediction horizon: 5-30 minutes
    horizonMinutes: 30,

    // Grid search resolution for t₀ optimization
    resolutionMinutes: 5,

    // Maximum departure delay flexibility
    maxFlexibilityMinutes: 30,
  },

  storage: {
    // Local data retention (GDPR: minimize storage)
    maxRetentionDays: 7,

    // Encrypt all local storage (AES-256)
    encryptionEnabled: true,
  },
};

export default defaultConfig;
