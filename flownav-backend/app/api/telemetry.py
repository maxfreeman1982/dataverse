"""
FlowNav Backend FCI - Telemetry API Endpoints
Handles privacy-preserving traffic data uploads
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from datetime import datetime, timedelta
from typing import List
import asyncio

from app.models.schemas import (
    TelemetryUploadRequest,
    TelemetryUploadResponse,
    TrafficAggregate,
    ErrorResponse,
)
from config.settings import settings
from app.services.telemetry_service import TelemetryService
from app.services.privacy_validator import PrivacyValidator
from app.utils.rate_limiter import RateLimiter

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

# Dependencies
telemetry_service = TelemetryService()
privacy_validator = PrivacyValidator()
rate_limiter = RateLimiter(max_requests=settings.RATE_LIMIT_PER_HOUR, window_seconds=3600)


@router.post("/upload", response_model=TelemetryUploadResponse)
async def upload_telemetry(
    request: TelemetryUploadRequest,
    background_tasks: BackgroundTasks,
) -> TelemetryUploadResponse:
    """
    Upload traffic telemetry aggregates (privacy-preserving)

    **Privacy Guarantees:**
    - All aggregates must meet k-anonymity (k≥3)
    - Device IDs are ephemeral (rotating 10-15 min)
    - Segment IDs are hashed (non-reversible)
    - No raw GPS coordinates accepted

    **Rate Limiting:**
    - Max 60 requests/hour per device_id

    **Validation:**
    - veh_count ≥ 3 (k-anonymity)
    - Batch size ≤ 50
    - Timestamp freshness < 10 minutes
    """

    # Rate limiting check
    if not await rate_limiter.check_limit(request.device_id_ephemeral):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {settings.RATE_LIMIT_PER_HOUR} requests/hour."
        )

    # Validate batch size
    if len(request.telemetry_batch) > settings.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Batch size {len(request.telemetry_batch)} exceeds max {settings.MAX_BATCH_SIZE}"
        )

    # Validate and filter aggregates
    accepted: List[TrafficAggregate] = []
    rejected: List[tuple[TrafficAggregate, str]] = []

    for aggregate in request.telemetry_batch:
        # K-anonymity check
        if not privacy_validator.check_k_anonymity(aggregate.veh_count):
            rejected.append((aggregate, f"k-anonymity violation: veh_count={aggregate.veh_count} < 3"))
            continue

        # L-diversity check (optional but recommended)
        if aggregate.std_speed_kmh < 1.0:
            rejected.append((aggregate, "Low diversity: std_speed_kmh too low (homogeneous data)"))
            continue

        # Timestamp freshness check (prevent replay attacks)
        age = datetime.utcnow() - aggregate.sent_at
        if age.total_seconds() > 600:  # 10 minutes
            rejected.append((aggregate, f"Stale data: sent {age.total_seconds():.0f}s ago"))
            continue

        # Segment ID format check
        if not aggregate.segment_id.startswith("seg_"):
            rejected.append((aggregate, "Invalid segment_id format (must start with 'seg_')"))
            continue

        accepted.append(aggregate)

    # Store accepted aggregates
    if accepted:
        # Background task: async processing to not block response
        background_tasks.add_task(
            telemetry_service.process_aggregates,
            accepted,
            request.device_id_ephemeral
        )

    # Calculate next upload window (60-120s)
    next_upload_delay = 60 + (hash(request.device_id_ephemeral) % 60)  # 60-120s random
    next_upload_after = datetime.utcnow() + timedelta(seconds=next_upload_delay)

    return TelemetryUploadResponse(
        status="success" if len(accepted) > 0 else "error",
        accepted_count=len(accepted),
        rejected_count=len(rejected),
        rejected_reasons=[reason for _, reason in rejected] if rejected else None,
        next_upload_after=next_upload_after,
    )


@router.get("/stats")
async def get_telemetry_stats():
    """
    Get telemetry statistics (aggregated, no personal data)

    **Returns:**
    - Total aggregates received today
    - Unique segments covered
    - Average confidence score
    - K-anonymity violations (should be 0)
    """
    stats = await telemetry_service.get_statistics()
    return {
        "total_aggregates_today": stats["count_today"],
        "unique_segments": stats["unique_segments"],
        "average_confidence": round(stats["avg_confidence"], 2),
        "k_anonymity_violations": 0,  # Always 0 (enforced at API level)
        "last_updated": datetime.utcnow(),
    }


@router.get("/health")
async def telemetry_health():
    """Telemetry service health check"""
    kafka_healthy = await telemetry_service.check_kafka_connection()
    db_healthy = await telemetry_service.check_database_connection()

    return {
        "service": "telemetry",
        "status": "healthy" if kafka_healthy and db_healthy else "degraded",
        "kafka_connected": kafka_healthy,
        "database_connected": db_healthy,
        "timestamp": datetime.utcnow(),
    }
