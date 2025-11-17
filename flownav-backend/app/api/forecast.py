"""
FlowNav Backend FCI - Forecast API Endpoints
Speed predictions using LWR + LSTM models
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
from typing import List

from app.models.schemas import (
    ForecastResponse,
    SegmentForecast,
    SpeedForecast,
    TrafficState,
)
from app.services.prediction_service import PredictionService
from config.settings import settings

router = APIRouter(prefix="/forecast", tags=["Forecast"])

# Dependencies
prediction_service = PredictionService()


@router.get("/speed", response_model=ForecastResponse)
async def get_speed_forecast(
    segment_ids: str = Query(..., description="Comma-separated segment IDs (max 100)"),
    time_start: datetime = Query(..., description="Start time (ISO8601)"),
    time_end: datetime = Query(..., description="End time (ISO8601, max 2h from start)"),
    resolution_minutes: int = Query(5, ge=1, le=15, description="Prediction resolution (1-15 min)"),
) -> ForecastResponse:
    """
    Get speed forecasts for segments

    **Prediction Horizon:** 5-30 minutes

    **Model:** Hybrid LWR (macroscopic) + LSTM (pattern learning)

    **Output:** Speed predictions with confidence intervals

    **Rate Limiting:** 100 requests/hour per IP
    """

    # Parse segment IDs
    segment_id_list = [s.strip() for s in segment_ids.split(",")]

    if len(segment_id_list) > 100:
        raise HTTPException(
            status_code=400,
            detail=f"Too many segments: {len(segment_id_list)} (max 100)"
        )

    # Validate time window
    time_span = (time_end - time_start).total_seconds() / 60
    if time_span > 120:  # 2 hours max
        raise HTTPException(
            status_code=400,
            detail=f"Time window too large: {time_span:.0f} min (max 120 min)"
        )

    if time_span < 0:
        raise HTTPException(
            status_code=400,
            detail="time_end must be after time_start"
        )

    # Check if forecast is in the future
    if time_start < datetime.utcnow():
        time_start = datetime.utcnow()

    # Generate predictions for each segment
    forecasts: List[SegmentForecast] = []

    for segment_id in segment_id_list:
        try:
            # Get predictions from service
            predictions = await prediction_service.predict_speed(
                segment_id=segment_id,
                time_start=time_start,
                time_end=time_end,
                resolution_minutes=resolution_minutes,
            )

            # Convert to API schema
            speed_forecasts = [
                SpeedForecast(
                    time=pred["time"],
                    speed_kmh=round(pred["speed_kmh"], 1),
                    speed_std_kmh=round(pred["std_kmh"], 1),
                    confidence=round(pred["confidence"], 2),
                    traffic_state=classify_traffic_state(pred["speed_kmh"]),
                )
                for pred in predictions
            ]

            forecasts.append(
                SegmentForecast(
                    segment_id=segment_id,
                    predictions=speed_forecasts,
                )
            )

        except Exception as e:
            # Log error but don't fail entire request
            print(f"[Forecast] Error for segment {segment_id}: {e}")
            # Return fallback prediction (historical average)
            fallback = await prediction_service.get_fallback_prediction(segment_id)
            forecasts.append(
                SegmentForecast(
                    segment_id=segment_id,
                    predictions=[
                        SpeedForecast(
                            time=time_start + timedelta(minutes=i * resolution_minutes),
                            speed_kmh=fallback["speed_kmh"],
                            speed_std_kmh=fallback["std_kmh"],
                            confidence=0.5,  # Low confidence for fallback
                            traffic_state=TrafficState.MODERATE,
                        )
                        for i in range(int(time_span / resolution_minutes) + 1)
                    ],
                )
            )

    return ForecastResponse(
        forecasts=forecasts,
        model_version=prediction_service.get_model_version(),
        generated_at=datetime.utcnow(),
    )


def classify_traffic_state(speed_kmh: float) -> TrafficState:
    """
    Classify traffic state based on speed

    Thresholds (typical highway):
    - Free flow: > 80 km/h
    - Moderate: 50-80 km/h
    - Congested: 20-50 km/h
    - Jammed: < 20 km/h
    """
    if speed_kmh >= 80:
        return TrafficState.FREE_FLOW
    elif speed_kmh >= 50:
        return TrafficState.MODERATE
    elif speed_kmh >= 20:
        return TrafficState.CONGESTED
    else:
        return TrafficState.JAMMED


@router.get("/segment/{segment_id}/history")
async def get_segment_history(
    segment_id: str,
    hours: int = Query(24, ge=1, le=168, description="Hours of history (max 7 days)"),
):
    """
    Get historical speed data for a segment

    **Use Case:** Calibration, validation, analytics

    **Privacy:** Only aggregated data (no individual vehicles)
    """
    history = await prediction_service.get_segment_history(segment_id, hours)

    return {
        "segment_id": segment_id,
        "history": history,
        "count": len(history),
        "time_range_hours": hours,
    }


@router.get("/model/status")
async def get_model_status():
    """
    Get prediction model status and metrics

    **Returns:**
    - Model version
    - Accuracy metrics (MAPE, RMSE)
    - Last update time
    - Predictions served today
    """
    status = await prediction_service.get_model_status()

    return {
        "model_version": status["version"],
        "architecture": "LWR + LSTM hybrid",
        "metrics": {
            "mape": round(status["mape"], 2),  # Mean Absolute Percentage Error
            "rmse": round(status["rmse"], 2),  # Root Mean Square Error
            "r2_score": round(status["r2"], 3),
        },
        "last_updated": status["last_updated"],
        "predictions_served_today": status["predictions_today"],
        "training_samples": status["training_samples"],
        "status": "healthy" if status["mape"] < 20 else "degraded",
    }


@router.post("/model/update")
async def trigger_model_update():
    """
    Trigger model retraining (admin only)

    **Use Case:** Force model update with latest data

    **Process:**
    1. Fetch latest aggregates (last 30 days)
    2. Retrain LWR parameters
    3. Fine-tune LSTM
    4. Validate on holdout set
    5. Deploy if performance improved
    """
    # In production: add authentication/authorization
    result = await prediction_service.trigger_retraining()

    return {
        "status": "success" if result["success"] else "failed",
        "message": result["message"],
        "old_version": result["old_version"],
        "new_version": result["new_version"],
        "improvement": {
            "mape_delta": round(result["mape_improvement"], 2),
            "rmse_delta": round(result["rmse_improvement"], 2),
        },
        "training_duration_seconds": result["duration"],
    }
