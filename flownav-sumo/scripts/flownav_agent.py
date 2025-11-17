"""
FlowNav SUMO - FlowNav Agent Implementation
Intelligent vehicle agent with optimal departure time calculation
"""

import traci
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta


class FlowNavVehicle:
    """
    FlowNav-enabled vehicle agent

    Capabilities:
    1. Calculate optimal departure time t₀
    2. Wait until t₀ before departing
    3. Dynamic re-routing based on predictions
    4. Contribute traffic data (aggregates)
    """

    def __init__(
        self,
        vehicle_id: str,
        origin: str,
        destination: str,
        desired_arrival: float,
        flexibility_minutes: int = 30,
    ):
        self.id = vehicle_id
        self.origin = origin
        self.destination = destination
        self.desired_arrival = desired_arrival  # Simulation time (seconds)
        self.flexibility_minutes = flexibility_minutes

        self.t0_optimal: Optional[float] = None
        self.travel_time_optimal: Optional[float] = None
        self.gain_seconds: Optional[float] = None

        self.route: List[str] = []
        self.departed = False
        self.completed = False

    def calculate_optimal_departure(
        self,
        current_time: float,
        sumo_network: 'SUMONetwork',
    ) -> Dict:
        """
        Calculate optimal departure time using grid search

        Algorithm:
        T(t₀) = Σᵢ [Δxᵢ / vᵢ(t₀ + Σⱼ₌₁ⁱ⁻¹ Δtⱼ)]
        t₀_optimal = argmin T(t₀)

        Args:
            current_time: Current simulation time (seconds)
            sumo_network: SUMO network wrapper

        Returns:
            {t0, travel_time, gain_seconds, recommendation}
        """
        # Grid search parameters
        max_delay = self.flexibility_minutes * 60  # Convert to seconds
        resolution = 300  # 5 minutes = 300 seconds

        candidates = np.arange(
            current_time,
            current_time + max_delay + resolution,
            resolution
        )

        # Get route edges
        self.route = sumo_network.find_route(self.origin, self.destination)

        if not self.route:
            print(f"[FlowNav] No route found for vehicle {self.id}")
            return self._fallback_departure(current_time)

        # Evaluate T(t₀) for each candidate
        travel_times = []
        for t0_candidate in candidates:
            T_t0 = self._simulate_travel_time(
                t0_candidate,
                sumo_network
            )
            travel_times.append(T_t0)

            # Check arrival constraint
            arrival_time = t0_candidate + T_t0
            if arrival_time > self.desired_arrival:
                # Too late, stop searching
                break

        # Find optimal
        if not travel_times:
            return self._fallback_departure(current_time)

        min_idx = np.argmin(travel_times)
        self.t0_optimal = candidates[min_idx]
        self.travel_time_optimal = travel_times[min_idx]

        # Calculate gain vs immediate departure
        immediate_travel_time = self._simulate_travel_time(current_time, sumo_network)
        self.gain_seconds = immediate_travel_time - self.travel_time_optimal

        # Generate recommendation
        wait_seconds = self.t0_optimal - current_time
        wait_minutes = wait_seconds / 60

        if wait_minutes <= 1:
            recommendation = "Départ optimal maintenant"
        else:
            recommendation = (
                f"Recommande : attendre {wait_minutes:.0f} min "
                f"(gain estimé {self.gain_seconds / 60:.0f} min)"
            )

        return {
            "t0": self.t0_optimal,
            "travel_time": self.travel_time_optimal,
            "gain_seconds": self.gain_seconds,
            "wait_seconds": wait_seconds,
            "recommendation": recommendation,
        }

    def _simulate_travel_time(
        self,
        departure_time: float,
        sumo_network: 'SUMONetwork',
    ) -> float:
        """
        Simulate travel time if departing at departure_time

        Uses current network state + linear extrapolation
        """
        total_time = 0.0
        current_sim_time = departure_time

        for edge_id in self.route:
            # Get predicted speed for this edge at current_sim_time
            speed_ms = sumo_network.get_predicted_speed(edge_id, current_sim_time)

            # Edge length
            edge_length_m = sumo_network.get_edge_length(edge_id)

            # Time to traverse edge
            if speed_ms > 0.1:
                edge_time_s = edge_length_m / speed_ms
            else:
                # Jam: assume 5 km/h
                edge_time_s = edge_length_m / (5 / 3.6)

            total_time += edge_time_s
            current_sim_time += edge_time_s

        return total_time

    def _fallback_departure(self, current_time: float) -> Dict:
        """Fallback: immediate departure"""
        return {
            "t0": current_time,
            "travel_time": 0,
            "gain_seconds": 0,
            "wait_seconds": 0,
            "recommendation": "Départ immédiat (pas de gain prédit)",
        }

    def should_depart(self, current_time: float) -> bool:
        """Check if vehicle should depart now"""
        if self.departed:
            return False

        if self.t0_optimal is None:
            return True  # No optimization, depart immediately

        return current_time >= self.t0_optimal

    def depart(self, current_time: float):
        """Mark vehicle as departed"""
        self.departed = True
        print(
            f"[FlowNav] Vehicle {self.id} departing at t={current_time:.0f}s "
            f"(optimal t0={self.t0_optimal:.0f}s)"
        )


class SUMONetwork:
    """
    Wrapper around SUMO network for FlowNav agents

    Provides:
    - Route finding
    - Speed predictions
    - Network state queries
    """

    def __init__(self, net_file: str):
        """
        Initialize network wrapper

        Args:
            net_file: Path to .net.xml file
        """
        import sumolib
        self.net = sumolib.net.readNet(net_file)

        # Speed history for prediction (edge_id -> list of (time, speed))
        self.speed_history: Dict[str, List[Tuple[float, float]]] = {}

    def find_route(self, origin: str, destination: str) -> List[str]:
        """
        Find shortest path from origin to destination

        Args:
            origin: Origin edge ID
            destination: Destination edge ID

        Returns:
            List of edge IDs forming route
        """
        try:
            # Use SUMO's route finding
            route = traci.simulation.findRoute(origin, destination)
            return route.edges if route else []
        except Exception as e:
            print(f"[Network] Route finding error: {e}")
            return []

    def get_predicted_speed(self, edge_id: str, time: float) -> float:
        """
        Predict speed on edge at future time

        Prediction method:
        1. Current speed (SUMO state)
        2. Linear extrapolation from recent trend
        3. Clamped to reasonable bounds

        Args:
            edge_id: Edge identifier
            time: Future time (seconds)

        Returns:
            Predicted speed (m/s)
        """
        try:
            # Get current speed
            current_speed = traci.edge.getLastStepMeanSpeed(edge_id)

            # Get speed history for trend
            if edge_id in self.speed_history:
                history = self.speed_history[edge_id]
                if len(history) >= 2:
                    # Calculate trend (change per second)
                    (t1, v1), (t2, v2) = history[-2], history[-1]
                    if t2 > t1:
                        trend = (v2 - v1) / (t2 - t1)
                    else:
                        trend = 0.0
                else:
                    trend = 0.0
            else:
                trend = 0.0

            # Extrapolate
            current_time = traci.simulation.getTime()
            time_delta = time - current_time
            predicted_speed = current_speed + trend * time_delta

            # Clamp to reasonable bounds
            max_speed = traci.edge.getMaxSpeed(edge_id)
            predicted_speed = np.clip(predicted_speed, 1.0, max_speed)

            return predicted_speed

        except Exception as e:
            print(f"[Network] Speed prediction error for {edge_id}: {e}")
            return 10.0  # Fallback: 36 km/h

    def get_edge_length(self, edge_id: str) -> float:
        """Get edge length in meters"""
        try:
            return traci.edge.getLength(edge_id)
        except:
            return 500.0  # Default fallback

    def update_speed_history(self, edge_id: str):
        """Update speed history for edge (call every step)"""
        try:
            current_time = traci.simulation.getTime()
            current_speed = traci.edge.getLastStepMeanSpeed(edge_id)

            if edge_id not in self.speed_history:
                self.speed_history[edge_id] = []

            self.speed_history[edge_id].append((current_time, current_speed))

            # Keep only last 10 measurements (last ~10 seconds)
            if len(self.speed_history[edge_id]) > 10:
                self.speed_history[edge_id] = self.speed_history[edge_id][-10:]

        except Exception as e:
            pass  # Silently fail for edges without vehicles


class FlowNavController:
    """
    Controller managing all FlowNav vehicles in simulation

    Responsibilities:
    - Track FlowNav vehicles
    - Trigger t₀ calculations
    - Insert vehicles at optimal times
    - Collect statistics
    """

    def __init__(self, sumo_network: SUMONetwork, adoption_rate: float = 0.2):
        self.network = sumo_network
        self.adoption_rate = adoption_rate

        self.vehicles: Dict[str, FlowNavVehicle] = {}
        self.statistics = {
            "total_vehicles": 0,
            "flownav_vehicles": 0,
            "avg_gain_seconds": 0,
            "total_wait_seconds": 0,
        }

    def register_vehicle(
        self,
        vehicle_id: str,
        origin: str,
        destination: str,
        desired_arrival: float,
    ):
        """Register new vehicle for FlowNav optimization"""
        # Random selection based on adoption rate
        is_flownav = np.random.random() < self.adoption_rate

        if is_flownav:
            vehicle = FlowNavVehicle(
                vehicle_id=vehicle_id,
                origin=origin,
                destination=destination,
                desired_arrival=desired_arrival,
            )

            # Calculate optimal departure
            current_time = traci.simulation.getTime()
            result = vehicle.calculate_optimal_departure(current_time, self.network)

            self.vehicles[vehicle_id] = vehicle
            self.statistics["flownav_vehicles"] += 1

            print(f"[Controller] Registered FlowNav vehicle {vehicle_id}: {result['recommendation']}")

        self.statistics["total_vehicles"] += 1

    def step(self, current_time: float):
        """
        Simulation step: check if vehicles should depart

        Args:
            current_time: Current simulation time (seconds)
        """
        for vehicle_id, vehicle in list(self.vehicles.items()):
            if not vehicle.departed and vehicle.should_depart(current_time):
                vehicle.depart(current_time)

                # Update statistics
                if vehicle.gain_seconds:
                    self.statistics["avg_gain_seconds"] += vehicle.gain_seconds
                if vehicle.t0_optimal:
                    wait_time = vehicle.t0_optimal - (current_time - (vehicle.t0_optimal - current_time))
                    self.statistics["total_wait_seconds"] += max(0, wait_time)

    def get_statistics(self) -> Dict:
        """Get controller statistics"""
        if self.statistics["flownav_vehicles"] > 0:
            avg_gain = self.statistics["avg_gain_seconds"] / self.statistics["flownav_vehicles"]
        else:
            avg_gain = 0

        return {
            "total_vehicles": self.statistics["total_vehicles"],
            "flownav_vehicles": self.statistics["flownav_vehicles"],
            "adoption_rate": self.statistics["flownav_vehicles"] / max(1, self.statistics["total_vehicles"]),
            "avg_gain_minutes": avg_gain / 60,
            "total_wait_minutes": self.statistics["total_wait_seconds"] / 60,
        }
