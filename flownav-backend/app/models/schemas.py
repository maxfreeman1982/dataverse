"""
FlowNav Backend FCI - API Schemas (Pydantic Models)
Matching mobile app specifications
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class TrafficState(str, Enum):
    """Traffic state classification"""
    FREE_FLOW = "free_flow"
    MODERATE = "moderate"
    CONGESTED = "congested"
    JAMMED = "jammed"


class SourceType(str, Enum):
    """Data source type"""
    EDGE_DEVICE = "edge_device"
    INFRASTRUCTURE = "infrastructure"
    CROWD = "crowd"


class AlertType(str, Enum):
    """Alert types"""
    SHOCKWAVE = "shockwave_detected"
    ACCIDENT = "accident"
    CONGESTION = "congestion"
    SAFETY_DISTANCE = "safety_distance"


class Severity(str, Enum):
    """Alert severity"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============================================================================
# TELEMETRY SCHEMAS
# ============================================================================

class TimeWindow(BaseModel):
    """Time window for aggregates"""
    start: datetime
    end: datetime


class TrafficAggregate(BaseModel):
    """Traffic aggregate (k-anonymous)"""
    segment_id: str = Field(..., description="Hashed segment ID (non-reversible)")
    time_window: TimeWindow
    veh_count: int = Field(..., ge=3, description="Vehicle count (k-anonymity ≥3)")
    avg_speed_kmh: float = Field(..., ge=0, le=200)
    std_speed_kmh: float = Field(..., ge=0)
    lane_count: Optional[int] = Field(None, ge=1, le=6)
    source: List[SourceType]
    confidence: float = Field(..., ge=0, le=1)
    sent_at: datetime

    @validator('veh_count')
    def check_k_anonymity(cls, v):
        """Enforce k-anonymity threshold"""
        if v < 3:
            raise ValueError(f"k-anonymity violation: veh_count={v} < 3")
        return v


class TelemetryUploadRequest(BaseModel):
    """Upload telemetry batch"""
    device_id_ephemeral: str = Field(..., description="Ephemeral device ID (rotating)")
    telemetry_batch: List[TrafficAggregate] = Field(..., max_items=50)


class TelemetryUploadResponse(BaseModel):
    """Upload response"""
    status: Literal["success", "error"]
    accepted_count: int
    rejected_count: int
    rejected_reasons: Optional[List[str]] = None
    next_upload_after: datetime


# ============================================================================
# FORECAST SCHEMAS
# ============================================================================

class SpeedForecast(BaseModel):
    """Speed forecast for specific time"""
    time: datetime
    speed_kmh: float = Field(..., ge=0, le=200)
    speed_std_kmh: float = Field(..., ge=0)
    confidence: float = Field(..., ge=0, le=1)
    traffic_state: TrafficState


class SegmentForecast(BaseModel):
    """Forecast for a segment"""
    segment_id: str
    predictions: List[SpeedForecast]


class ForecastRequest(BaseModel):
    """Request forecast for segments"""
    segment_ids: List[str] = Field(..., max_items=100)
    time_start: datetime
    time_end: datetime
    resolution_minutes: int = Field(5, ge=1, le=15)


class ForecastResponse(BaseModel):
    """Forecast response"""
    forecasts: List[SegmentForecast]
    model_version: str
    generated_at: datetime


# ============================================================================
# ROUTE OPTIMIZATION SCHEMAS
# ============================================================================

class RoutePreferences(BaseModel):
    """User routing preferences"""
    avoid_tolls: bool = False
    avoid_highways: bool = False
    optimize_for: Literal["time", "distance", "eco"] = "time"


class OptimizeDepartureRequest(BaseModel):
    """Request optimal departure time"""
    origin_lat: float = Field(..., ge=-90, le=90)
    origin_lon: float = Field(..., ge=-180, le=180)
    dest_lat: float = Field(..., ge=-90, le=90)
    dest_lon: float = Field(..., ge=-180, le=180)
    arrival_target: datetime
    flexibility_minutes: int = Field(30, ge=0, le=120)
    preferences: Optional[RoutePreferences] = None


class DepartureOption(BaseModel):
    """Departure time option"""
    t0: datetime
    travel_time_minutes: float
    arrival_time: datetime
    gain_vs_immediate_minutes: Optional[float] = None
    confidence: float = Field(..., ge=0, le=1)


class RouteInfo(BaseModel):
    """Route information"""
    segments: List[str]
    total_distance_km: float


class OptimizeDepartureResponse(BaseModel):
    """Optimal departure response"""
    optimal_departure: DepartureOption
    route: RouteInfo
    recommendation: str
    alternative_t0: Optional[List[DepartureOption]] = None


# ============================================================================
# WEBSOCKET SCHEMAS
# ============================================================================

class WebSocketSubscribe(BaseModel):
    """Subscribe to route updates"""
    action: Literal["subscribe"]
    route_id: str
    segment_ids: List[str]


class Alert(BaseModel):
    """Real-time alert"""
    type: AlertType
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None
    severity: Severity
    message: str


class SpeedUpdate(BaseModel):
    """Real-time speed update"""
    type: Literal["speed_update"]
    segment_id: str
    time: datetime
    speed_kmh: float
    speed_std_kmh: float
    traffic_state: TrafficState
    alerts: Optional[List[Alert]] = None


# ============================================================================
# STATISTICS & MONITORING
# ============================================================================

class AggregateStatistics(BaseModel):
    """Aggregate statistics"""
    total_aggregates_today: int
    unique_segments: int
    average_confidence: float
    k_anonymity_violations: int = 0


class PredictionMetrics(BaseModel):
    """Prediction model metrics"""
    model_version: str
    mape: float  # Mean Absolute Percentage Error
    rmse: float  # Root Mean Square Error
    last_updated: datetime
    predictions_served_today: int


class SystemHealth(BaseModel):
    """System health status"""
    status: Literal["healthy", "degraded", "down"]
    uptime_seconds: int
    database_connected: bool
    redis_connected: bool
    kafka_connected: bool
    active_websockets: int
    requests_per_second: float


# ============================================================================
# PRIVACY & GDPR
# ============================================================================

class PrivacyMetrics(BaseModel):
    """Privacy compliance metrics"""
    aggregates_received_today: int
    k_anonymity_violations: int
    data_purged_last_24h: int
    retention_policy_compliant: bool


class DataPurgeRequest(BaseModel):
    """Request data purge (GDPR right to erasure)"""
    device_id_ephemeral: Optional[str] = None
    purge_all: bool = False


class DataPurgeResponse(BaseModel):
    """Data purge confirmation"""
    status: Literal["success", "error"]
    records_deleted: int
    message: str


# ============================================================================
# ERROR RESPONSES
# ============================================================================

class ErrorDetail(BaseModel):
    """Error detail"""
    field: Optional[str] = None
    message: str
    error_code: Optional[str] = None


class ErrorResponse(BaseModel):
    """API error response"""
    status: Literal["error"]
    message: str
    details: Optional[List[ErrorDetail]] = None
    timestamp: datetime
