/**
 * FlowNav - API Client
 * Secure communication with FlowNav Cloud Intelligence (FCI)
 * Implements privacy-preserving telemetry upload and forecast retrieval
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  TelemetryUploadRequest,
  TelemetryUploadResponse,
  ForecastResponse,
  OptimizeDepartureRequest,
  OptimizeDepartureResponse,
  FlowNavConfig,
  EphemeralDeviceId,
  TrafficAggregate,
  SpeedPrediction,
} from '../types';
import { generateEphemeralId, isIdExpired, sanitizeMetadata } from '../utils/anonymization';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TIMEOUT = 10000; // 10s
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 2000; // 2s exponential backoff

// ============================================================================
// API CLIENT
// ============================================================================

export class FlowNavApiClient {
  private client: AxiosInstance;
  private config: FlowNavConfig['api'];
  private ephemeralId: EphemeralDeviceId;

  constructor(config: FlowNavConfig) {
    this.config = config.api;
    this.ephemeralId = generateEphemeralId();

    // Create axios instance with security defaults
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowNav-Mobile/0.1.0',
      },
    });

    // Request interceptor: rotate ID if expired
    this.client.interceptors.request.use(
      config => {
        // Check if ID needs rotation
        if (isIdExpired(this.ephemeralId)) {
          this.ephemeralId = generateEphemeralId();
          console.log('[Privacy] Ephemeral ID rotated');
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('[API] Request failed:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload telemetry aggregates (privacy-preserving)
   * CRITICAL: Only sanitized, k-anonymous aggregates are transmitted
   */
  public async uploadTelemetry(
    aggregates: TrafficAggregate[]
  ): Promise<TelemetryUploadResponse> {
    // Sanitize each aggregate (remove any accidental metadata)
    const sanitized = aggregates.map(agg => sanitizeMetadata(agg));

    const request: TelemetryUploadRequest = {
      device_id_ephemeral: this.ephemeralId.id,
      telemetry_batch: sanitized as TrafficAggregate[],
    };

    try {
      const response = await this.retryRequest(() =>
        this.client.post<TelemetryUploadResponse>('/telemetry/upload', request)
      );

      console.log(
        `[API] Telemetry uploaded: ${response.data.accepted_count} accepted, ` +
        `${response.data.rejected_count} rejected`
      );

      return response.data;
    } catch (error) {
      console.error('[API] Telemetry upload failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Fetch speed forecasts for route segments
   */
  public async getForecast(
    segmentIds: string[],
    timeStart: Date,
    timeEnd: Date,
    resolutionMinutes: number = 5
  ): Promise<SpeedPrediction[]> {
    try {
      const params = {
        segment_ids: segmentIds.join(','),
        time_start: timeStart.toISOString(),
        time_end: timeEnd.toISOString(),
        resolution_minutes: resolutionMinutes,
      };

      const response = await this.retryRequest(() =>
        this.client.get<ForecastResponse>('/forecast/speed', { params })
      );

      // Convert API format to internal format
      const predictions: SpeedPrediction[] = [];
      for (const forecast of response.data.forecasts) {
        for (const pred of forecast.predictions) {
          predictions.push({
            segmentId: forecast.segment_id,
            time: new Date(pred.time).getTime(),
            speedKmh: pred.speed_kmh,
            stdKmh: pred.speed_std_kmh,
            confidence: pred.confidence,
          });
        }
      }

      console.log(
        `[API] Forecast received: ${predictions.length} predictions for ${segmentIds.length} segments`
      );

      return predictions;
    } catch (error) {
      console.error('[API] Forecast fetch failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Request optimal departure time calculation
   * This is a higher-level API that does server-side optimization
   */
  public async optimizeDeparture(
    request: OptimizeDepartureRequest
  ): Promise<OptimizeDepartureResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<OptimizeDepartureResponse>('/route/optimize_departure', request)
      );

      console.log(
        `[API] Optimal departure: ${response.data.optimal_departure.t0}, ` +
        `gain ${response.data.optimal_departure.gain_vs_immediate_minutes} min`
      );

      return response.data;
    } catch (error) {
      console.error('[API] Departure optimization failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as AxiosError;

      // Don't retry client errors (4xx)
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        throw error;
      }

      // Retry on network errors or 5xx
      if (attempt < this.config.retryAttempts) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        console.log(`[API] Retry attempt ${attempt + 1}/${this.config.retryAttempts} after ${delay}ms`);

        await this.sleep(delay);
        return this.retryRequest(requestFn, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        return new Error(`API Error ${status}: ${message}`);
      } else if (error.request) {
        // No response received
        return new Error('Pas de réponse du serveur. Vérifiez votre connexion.');
      }
    }
    return error instanceof Error ? error : new Error('Erreur API inconnue');
  }

  /**
   * Get current ephemeral ID (for debugging/monitoring)
   */
  public getCurrentDeviceId(): string {
    return this.ephemeralId.id;
  }

  /**
   * Get ID expiration time (for UI display)
   */
  public getIdExpirationTime(): Date {
    return new Date(this.ephemeralId.expiresAt);
  }

  /**
   * Force ID rotation (for testing or privacy on demand)
   */
  public forceIdRotation(): void {
    this.ephemeralId = generateEphemeralId();
    console.log('[Privacy] Ephemeral ID force-rotated');
  }
}

// ============================================================================
// WEBSOCKET CLIENT (Real-time updates for HUD)
// ============================================================================

export class FlowNavWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url: string;

  constructor(wsUrl: string) {
    this.url = wsUrl;
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  public connect(
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WS] Connected to real-time updates');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        if (onError) {
          onError(error);
        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected, attempting reconnect in 5s...');
        this.scheduleReconnect(onUpdate, onError);
      };
    } catch (error) {
      console.error('[WS] Connection failed:', error);
      this.scheduleReconnect(onUpdate, onError);
    }
  }

  /**
   * Subscribe to route segments for real-time updates
   */
  public subscribeToRoute(routeId: string, segmentIds: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WS] Not connected, cannot subscribe');
      return;
    }

    const message = {
      action: 'subscribe',
      route_id: routeId,
      segment_ids: segmentIds,
    };

    this.ws.send(JSON.stringify(message));
    console.log(`[WS] Subscribed to route ${routeId} with ${segmentIds.length} segments`);
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WS] Disconnected');
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[WS] Attempting reconnect...');
      this.connect(onUpdate, onError);
    }, 5000);
  }
}

export default FlowNavApiClient;
