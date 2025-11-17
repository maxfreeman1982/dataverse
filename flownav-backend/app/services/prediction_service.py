"""
FlowNav Backend FCI - Prediction Service
Hybrid LWR (macroscopic) + LSTM (pattern learning) model
"""

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
from scipy.integrate import odeint


class LWRModel:
    """
    Lighthill-Whitham-Richards (LWR) macroscopic traffic model

    Equations:
    - ∂k/∂t + ∂Q/∂x = 0  (continuity)
    - Q(k) = k * V(k)     (flow-density)
    - V(k) = v_free * (1 - k/k_jam)  (Greenshields)
    """

    def __init__(self, v_free: float = 100.0, k_jam: float = 150.0):
        """
        Initialize LWR model parameters

        Args:
            v_free: Free flow speed (km/h), default 100
            k_jam: Jam density (veh/km), default 150
        """
        self.v_free = v_free  # km/h
        self.k_jam = k_jam    # veh/km
        self.q_max = (v_free * k_jam) / 4  # Maximum flow (veh/h)

    def speed_from_density(self, k: float) -> float:
        """Greenshields: V(k) = v_free * (1 - k/k_jam)"""
        return self.v_free * max(0, 1 - k / self.k_jam)

    def flow_from_density(self, k: float) -> float:
        """Q(k) = k * V(k)"""
        return k * self.speed_from_density(k)

    def density_from_flow_speed(self, Q: float, v: float) -> float:
        """k = Q / v (if v > 0)"""
        return Q / v if v > 0.1 else self.k_jam

    def predict_speed(
        self,
        current_density: float,
        upstream_flow: float,
        downstream_flow: float,
        dt: float = 60.0,  # seconds
    ) -> float:
        """
        Predict speed after time dt using LWR propagation

        Args:
            current_density: Current density (veh/km)
            upstream_flow: Upstream flow (veh/h)
            downstream_flow: Downstream flow (veh/h)
            dt: Time step (seconds)

        Returns:
            Predicted speed (km/h)
        """
        # Simplified LWR update (Godunov scheme)
        # dk/dt = (Q_in - Q_out) / dx
        # Assuming dx = 1 km for simplicity
        dx = 1.0  # km

        flow_diff = upstream_flow - downstream_flow
        dk_dt = flow_diff / dx  # Change in density per hour

        # Update density
        new_density = current_density + (dk_dt * dt / 3600)  # dt in seconds
        new_density = np.clip(new_density, 0, self.k_jam)

        # Convert back to speed
        predicted_speed = self.speed_from_density(new_density)

        return predicted_speed


class PredictionService:
    """Prediction service combining LWR + LSTM + historical patterns"""

    def __init__(self):
        self.lwr_model = LWRModel(v_free=100.0, k_jam=150.0)
        self.model_version = "lwr_lstm_v2.3.1"
        self.predictions_today = 0
        self.mape = 12.5  # Mock metric
        self.rmse = 8.3   # Mock metric
        self.r2 = 0.87    # Mock metric

        # Historical patterns cache (segment_id -> patterns)
        self.historical_cache: Dict[str, List[Dict]] = {}

    async def predict_speed(
        self,
        segment_id: str,
        time_start: datetime,
        time_end: datetime,
        resolution_minutes: int,
    ) -> List[Dict[str, Any]]:
        """
        Generate speed predictions for segment

        Hybrid approach:
        1. LWR macroscopic model (physics-based)
        2. LSTM pattern learning (data-driven)
        3. Historical average (fallback)

        Weighted combination: 40% LWR + 40% LSTM + 20% historical
        """
        predictions = []

        # Calculate number of prediction points
        duration = (time_end - time_start).total_seconds() / 60
        num_points = int(duration / resolution_minutes) + 1

        # Get historical pattern for this segment
        historical = await self._get_historical_pattern(segment_id, time_start)

        # Get current state
        current_state = await self._get_current_state(segment_id)
        current_density = current_state["density"]
        current_speed = current_state["speed"]

        for i in range(num_points):
            pred_time = time_start + timedelta(minutes=i * resolution_minutes)

            # 1. LWR prediction (physics-based)
            lwr_speed = self._lwr_predict(
                segment_id,
                current_density,
                pred_time,
                i * resolution_minutes,
            )

            # 2. LSTM prediction (pattern-based)
            lstm_speed = self._lstm_predict(segment_id, pred_time, historical)

            # 3. Historical average
            hist_speed = self._historical_predict(segment_id, pred_time, historical)

            # 4. Weighted combination
            combined_speed = (
                0.4 * lwr_speed +
                0.4 * lstm_speed +
                0.2 * hist_speed
            )

            # Calculate uncertainty (std)
            speeds = [lwr_speed, lstm_speed, hist_speed]
            std_kmh = float(np.std(speeds))

            # Confidence decreases with time horizon
            time_horizon_min = i * resolution_minutes
            confidence = max(0.5, 0.95 - (time_horizon_min / 60) * 0.3)

            predictions.append({
                "time": pred_time,
                "speed_kmh": combined_speed,
                "std_kmh": std_kmh,
                "confidence": confidence,
            })

            # Update current density for next iteration
            current_density = self.lwr_model.density_from_flow_speed(
                current_state["flow"], combined_speed
            )

        self.predictions_today += num_points
        return predictions

    def _lwr_predict(
        self,
        segment_id: str,
        current_density: float,
        pred_time: datetime,
        horizon_minutes: int,
    ) -> float:
        """LWR macroscopic prediction"""
        # Mock upstream/downstream flows (in production: fetch from database)
        upstream_flow = 1800 + np.sin(horizon_minutes / 10) * 200  # Oscillating
        downstream_flow = 1750 + np.cos(horizon_minutes / 10) * 150

        predicted_speed = self.lwr_model.predict_speed(
            current_density=current_density,
            upstream_flow=upstream_flow,
            downstream_flow=downstream_flow,
            dt=horizon_minutes * 60,
        )

        return predicted_speed

    def _lstm_predict(
        self,
        segment_id: str,
        pred_time: datetime,
        historical: Dict,
    ) -> float:
        """LSTM pattern-based prediction (mock)"""
        # In production: actual LSTM model inference
        # For now: use historical with slight variation
        base_speed = historical["avg_speed"]

        # Add time-of-day pattern
        hour = pred_time.hour
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            # Rush hour: slower
            pattern_factor = 0.7
        elif 10 <= hour <= 16:
            # Mid-day: moderate
            pattern_factor = 0.85
        else:
            # Off-peak: fast
            pattern_factor = 1.0

        return base_speed * pattern_factor

    def _historical_predict(
        self,
        segment_id: str,
        pred_time: datetime,
        historical: Dict,
    ) -> float:
        """Historical average prediction"""
        return historical["avg_speed"]

    async def _get_historical_pattern(
        self,
        segment_id: str,
        reference_time: datetime,
    ) -> Dict:
        """Get historical pattern for segment at similar time"""
        # Mock historical data
        # In production: query TimescaleDB for same weekday/hour averages

        hour = reference_time.hour
        weekday = reference_time.weekday()

        # Mock patterns
        if weekday < 5:  # Weekday
            if 7 <= hour <= 9:
                avg_speed = 45.0  # Morning rush
            elif 17 <= hour <= 19:
                avg_speed = 50.0  # Evening rush
            else:
                avg_speed = 75.0  # Off-peak
        else:  # Weekend
            avg_speed = 80.0

        return {
            "segment_id": segment_id,
            "avg_speed": avg_speed,
            "std_speed": 12.0,
            "sample_count": 150,
        }

    async def _get_current_state(self, segment_id: str) -> Dict:
        """Get current traffic state for segment"""
        # Mock current state
        # In production: fetch latest aggregate from database
        return {
            "segment_id": segment_id,
            "density": 80.0,  # veh/km
            "speed": 65.0,    # km/h
            "flow": 5200,     # veh/h
            "timestamp": datetime.utcnow(),
        }

    async def get_fallback_prediction(self, segment_id: str) -> Dict:
        """Fallback prediction when model fails"""
        historical = await self._get_historical_pattern(segment_id, datetime.utcnow())
        return {
            "speed_kmh": historical["avg_speed"],
            "std_kmh": historical["std_speed"],
            "confidence": 0.5,
        }

    async def get_segment_history(self, segment_id: str, hours: int) -> List[Dict]:
        """Get historical aggregates for segment"""
        # Mock history
        # In production: query TimescaleDB
        history = []
        now = datetime.utcnow()

        for i in range(hours * 12):  # 5-min intervals
            time_point = now - timedelta(minutes=i * 5)
            speed = 70 + np.sin(i / 10) * 20 + np.random.normal(0, 5)
            speed = np.clip(speed, 10, 120)

            history.append({
                "time": time_point.isoformat(),
                "avg_speed_kmh": round(float(speed), 1),
                "veh_count": np.random.randint(5, 20),
                "confidence": round(np.random.uniform(0.7, 0.95), 2),
            })

        return history[::-1]  # Chronological order

    async def get_model_status(self) -> Dict:
        """Get model performance metrics"""
        return {
            "version": self.model_version,
            "mape": self.mape,
            "rmse": self.rmse,
            "r2": self.r2,
            "last_updated": datetime.utcnow() - timedelta(hours=6),
            "predictions_today": self.predictions_today,
            "training_samples": 1_250_000,
        }

    def get_model_version(self) -> str:
        """Get current model version"""
        return self.model_version

    async def trigger_retraining(self) -> Dict:
        """Trigger model retraining (background job)"""
        # Mock retraining
        # In production: actual model training pipeline
        old_mape = self.mape
        old_rmse = self.rmse

        # Simulate training
        await asyncio.sleep(0.1)

        # Improved metrics
        self.mape = 11.8
        self.rmse = 7.9
        self.model_version = f"lwr_lstm_v2.3.2_{datetime.utcnow().strftime('%Y%m%d')}"

        return {
            "success": True,
            "message": "Model retrained successfully",
            "old_version": "lwr_lstm_v2.3.1",
            "new_version": self.model_version,
            "mape_improvement": old_mape - self.mape,
            "rmse_improvement": old_rmse - self.rmse,
            "duration": 120,  # seconds (mock)
        }
