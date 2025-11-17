/**
 * FlowNav Mobile - Type Definitions
 * Privacy-first predictive navigation types
 */

// ============================================================================
// GEOLOCATION & GPS TYPES
// ============================================================================

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GpsReading {
  coordinate: GpsCoordinate;
  speed: number; // m/s
  heading: number; // degrees
  altitude?: number;
}

// ============================================================================
// PRIVACY & ANONYMIZATION TYPES
// ============================================================================

export interface EphemeralDeviceId {
  id: string; // UUID v4
  createdAt: number; // timestamp
  expiresAt: number; // timestamp (10-15 min later)
}

export interface SegmentId {
  hashed: string; // HMAC-SHA256 hash
  geohashBin: string; // binned geohash (not transmitted)
  length: number; // meters
}

// ============================================================================
// TRAFFIC AGGREGATION TYPES
// ============================================================================

export interface SpeedObservation {
  speed: number; // km/h
  timestamp: number;
  segmentId: string;
}

export interface TrafficAggregate {
  segmentId: string;
  timeWindow: {
    start: string; // ISO8601
    end: string; // ISO8601
  };
  vehicleCount: number; // k-anonymity >= 3
  avgSpeedKmh: number;
  stdSpeedKmh: number;
  laneCount?: number;
  source: ('edge_device' | 'infrastructure' | 'crowd')[];
  confidence: number; // 0-1
  sentAt: string; // ISO8601
}

// ============================================================================
// API TYPES (matching spec)
// ============================================================================

export interface TelemetryUploadRequest {
  device_id_ephemeral: string;
  telemetry_batch: TrafficAggregate[];
}

export interface TelemetryUploadResponse {
  status: 'success' | 'error';
  accepted_count: number;
  rejected_count: number;
  rejected_reasons?: string[];
  next_upload_after: string; // ISO8601
}

export interface SpeedForecast {
  time: string; // ISO8601
  speed_kmh: number;
  speed_std_kmh: number;
  confidence: number;
  traffic_state: 'free_flow' | 'moderate' | 'congested' | 'jammed';
}

export interface SegmentForecast {
  segment_id: string;
  predictions: SpeedForecast[];
}

export interface ForecastResponse {
  forecasts: SegmentForecast[];
  model_version: string;
  generated_at: string;
}

export interface OptimizeDepartureRequest {
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
  arrival_target: string; // ISO8601
  flexibility_minutes: number;
  preferences?: {
    avoid_tolls?: boolean;
    avoid_highways?: boolean;
    optimize_for?: 'time' | 'distance' | 'eco';
  };
}

export interface DepartureOption {
  t0: string; // ISO8601
  travel_time_minutes: number;
  arrival_time: string;
  gain_vs_immediate_minutes?: number;
  confidence: number;
}

export interface OptimizeDepartureResponse {
  optimal_departure: DepartureOption;
  route: {
    segments: string[];
    total_distance_km: number;
  };
  recommendation: string;
  alternative_t0?: DepartureOption[];
}

// ============================================================================
// ROUTE & NAVIGATION TYPES
// ============================================================================

export interface RouteSegment {
  id: string;
  length: number; // km
  speedLimit: number; // km/h
  roadType: 'highway' | 'urban' | 'rural';
  coordinates: GpsCoordinate[];
}

export interface Route {
  id: string;
  segments: RouteSegment[];
  totalDistance: number; // km
  origin: GpsCoordinate;
  destination: GpsCoordinate;
}

// ============================================================================
// PREDICTIVE MODEL TYPES
// ============================================================================

export interface SpeedPrediction {
  segmentId: string;
  time: number; // timestamp
  speedKmh: number;
  stdKmh: number;
  confidence: number;
}

export interface TravelTimeCalculation {
  t0: number; // departure timestamp
  totalMinutes: number;
  segmentTimes: {
    segmentId: string;
    arrivalTime: number;
    speedKmh: number;
    durationMinutes: number;
  }[];
}

export interface OptimalDeparture {
  t0: number; // timestamp
  travelTimeMinutes: number;
  arrivalTime: number;
  gainMinutes: number;
  confidence: number;
  recommendation: string;
}

// ============================================================================
// LWR MODEL PARAMETERS
// ============================================================================

export interface LWRParameters {
  vFree: number; // km/h - free flow speed
  kJam: number; // veh/km - jam density
  qMax: number; // veh/h - max flow
  waveSpeed: number; // km/h - shockwave speed (negative)
}

export interface IDMParameters {
  aMax: number; // m/s² - max acceleration
  b: number; // m/s² - comfortable deceleration
  v0: number; // m/s - desired speed
  th: number; // s - headway time
  d0: number; // m - minimum distance
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface FlowNavConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  privacy: {
    idRotationMinutes: number; // 10-15
    kAnonymityThreshold: number; // >= 3
    aggregationWindowSeconds: number; // 60
    minSegmentLengthMeters: number; // 200 urban, 500 highway
  };
  gps: {
    updateIntervalMs: number; // 1000-10000
    minAccuracyMeters: number; // 20
    backgroundTracking: boolean;
  };
  prediction: {
    horizonMinutes: number; // 5-30
    resolutionMinutes: number; // 1-5
    maxFlexibilityMinutes: number; // 30
  };
  storage: {
    maxRetentionDays: number; // 7
    encryptionEnabled: boolean;
  };
}

// ============================================================================
// UI/UX TYPES
// ============================================================================

export interface DepartureRecommendation {
  departNow: boolean;
  waitMinutes?: number;
  message: string;
  gainMinutes: number;
  confidence: number;
  alerts?: Alert[];
}

export interface Alert {
  type: 'shockwave_detected' | 'accident' | 'congestion' | 'safety_distance';
  distance_km?: number;
  eta_minutes?: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  icon?: string;
}

export interface TravelTimeCurve {
  dataPoints: {
    t0: number; // timestamp
    travelMinutes: number;
  }[];
  optimalT0: number;
  currentT0: number;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface CachedForecast {
  segmentId: string;
  predictions: SpeedPrediction[];
  cachedAt: number;
  expiresAt: number;
}

export interface LocalTrafficData {
  aggregates: TrafficAggregate[];
  lastUploadAt: number;
  pendingCount: number;
}

// ============================================================================
// STATISTICS & METRICS TYPES
// ============================================================================

export interface UserStatistics {
  totalTrips: number;
  totalTimeSavedMinutes: number;
  totalCo2SavedGrams: number;
  averageGainPerTripMinutes: number;
  optimalDepartureFollowedPercent: number;
  contributedAggregatesCount: number;
}

export interface PrivacyMetrics {
  aggregatesSentToday: number;
  currentDeviceIdAge: number; // seconds
  nextIdRotationAt: number; // timestamp
  kAnonymityViolations: number; // should be 0
  dataPurgedCount: number;
}
