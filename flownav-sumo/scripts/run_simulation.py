"""
FlowNav SUMO - Simulation Runner
Run SUMO simulation with FlowNav agents
"""

import sys
import os
import argparse
import traci
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List

from flownav_agent import FlowNavVehicle, SUMONetwork, FlowNavController


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Run FlowNav SUMO simulation")

    parser.add_argument("--network", required=True, help="Path to .net.xml file")
    parser.add_argument("--routes", required=True, help="Path to .rou.xml file")
    parser.add_argument("--output", required=True, help="Output directory")
    parser.add_argument("--duration", type=int, default=3600, help="Simulation duration (seconds)")
    parser.add_argument("--adoption", type=float, default=0.2, help="FlowNav adoption rate (0.0-1.0)")
    parser.add_argument("--gui", action="store_true", help="Launch SUMO GUI")
    parser.add_argument("--step-length", type=float, default=1.0, help="Simulation step length (seconds)")

    return parser.parse_args()


def create_sumo_config(args) -> str:
    """
    Create SUMO configuration file

    Args:
        args: Command line arguments

    Returns:
        Path to generated .sumocfg file
    """
    config_path = os.path.join(args.output, "simulation.sumocfg")

    # Ensure output directory exists
    os.makedirs(args.output, exist_ok=True)

    config_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/sumoConfiguration.xsd">

    <input>
        <net-file value="{os.path.abspath(args.network)}"/>
        <route-files value="{os.path.abspath(args.routes)}"/>
    </input>

    <time>
        <begin value="0"/>
        <end value="{args.duration}"/>
        <step-length value="{args.step_length}"/>
    </time>

    <output>
        <tripinfo-output value="{os.path.join(args.output, 'tripinfo.xml')}"/>
        <summary-output value="{os.path.join(args.output, 'summary.xml')}"/>
        <edgedata-output value="{os.path.join(args.output, 'edgedata.xml')}"/>
        <emission-output value="{os.path.join(args.output, 'emissions.xml')}"/>
    </output>

    <processing>
        <time-to-teleport value="-1"/>
        <max-depart-delay value="900"/>
    </processing>

    <routing>
        <device.rerouting.adaptation-steps value="180"/>
        <device.rerouting.period value="300"/>
    </routing>

</configuration>"""

    with open(config_path, 'w') as f:
        f.write(config_xml)

    return config_path


def run_simulation(args):
    """
    Main simulation loop

    Args:
        args: Command line arguments
    """
    print("=" * 80)
    print("FlowNav SUMO Simulation")
    print("=" * 80)
    print(f"Network: {args.network}")
    print(f"Routes: {args.routes}")
    print(f"Duration: {args.duration}s ({args.duration / 60:.1f} min)")
    print(f"FlowNav Adoption: {args.adoption * 100:.0f}%")
    print(f"Output: {args.output}")
    print("=" * 80)

    # Create SUMO config
    config_file = create_sumo_config(args)

    # Start SUMO
    sumo_binary = "sumo-gui" if args.gui else "sumo"
    sumo_cmd = [
        sumo_binary,
        "-c", config_file,
        "--step-length", str(args.step_length),
        "--collision.action", "warn",
        "--time-to-teleport", "-1",
        "--no-warnings", "true",
    ]

    print(f"Starting SUMO: {' '.join(sumo_cmd)}")
    traci.start(sumo_cmd)

    # Initialize network and controller
    network = SUMONetwork(args.network)
    controller = FlowNavController(network, adoption_rate=args.adoption)

    # Simulation loop
    step = 0
    departed_vehicles = set()
    completed_vehicles = 0

    print(f"\nSimulation started at {datetime.now().strftime('%H:%M:%S')}")

    try:
        while traci.simulation.getMinExpectedNumber() > 0 and step < args.duration:
            traci.simulationStep()

            current_time = traci.simulation.getTime()

            # Process new vehicles
            loaded_vehicles = traci.vehicle.getIDList()
            for vehicle_id in loaded_vehicles:
                if vehicle_id not in departed_vehicles:
                    departed_vehicles.add(vehicle_id)

                    # Get route info
                    try:
                        route_id = traci.vehicle.getRouteID(vehicle_id)
                        edges = traci.route.getEdges(route_id)

                        if len(edges) >= 2:
                            origin = edges[0]
                            destination = edges[-1]

                            # Desired arrival: current_time + expected_travel_time + buffer
                            # For simplicity: assume 30 min travel time + 15 min buffer
                            desired_arrival = current_time + 45 * 60

                            # Register with controller
                            controller.register_vehicle(
                                vehicle_id=vehicle_id,
                                origin=origin,
                                destination=destination,
                                desired_arrival=desired_arrival,
                            )
                    except Exception as e:
                        print(f"[Warning] Error processing vehicle {vehicle_id}: {e}")

            # Update controller
            controller.step(current_time)

            # Update speed history for all edges
            for edge_id in traci.edge.getIDList():
                network.update_speed_history(edge_id)

            # Progress reporting
            if step % 300 == 0:  # Every 5 minutes
                vehicles_count = traci.vehicle.getIDCount()
                departed = len(departed_vehicles)
                print(
                    f"[{current_time:.0f}s] Vehicles: {vehicles_count} active, "
                    f"{departed} departed, "
                    f"{controller.statistics['flownav_vehicles']} FlowNav"
                )

            step += 1

    except KeyboardInterrupt:
        print("\n[!] Simulation interrupted by user")
    except Exception as e:
        print(f"\n[!] Simulation error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Close SUMO
        traci.close()

        # Print final statistics
        print("\n" + "=" * 80)
        print("Simulation Complete")
        print("=" * 80)

        stats = controller.get_statistics()
        print(f"Total vehicles: {stats['total_vehicles']}")
        print(f"FlowNav vehicles: {stats['flownav_vehicles']} ({stats['adoption_rate'] * 100:.1f}%)")
        print(f"Average gain: {stats['avg_gain_minutes']:.1f} minutes")
        print(f"Total wait time: {stats['total_wait_minutes']:.1f} minutes")

        print(f"\nOutputs saved to: {args.output}")
        print(f"  - tripinfo.xml")
        print(f"  - summary.xml")
        print(f"  - edgedata.xml")
        print(f"  - emissions.xml")

        # Save statistics to JSON
        import json
        stats_file = os.path.join(args.output, "flownav_stats.json")
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        print(f"  - flownav_stats.json")

        print(f"\nFinished at {datetime.now().strftime('%H:%M:%S')}")


def main():
    """Main entry point"""
    args = parse_args()

    # Validate inputs
    if not os.path.exists(args.network):
        print(f"Error: Network file not found: {args.network}")
        sys.exit(1)

    if not os.path.exists(args.routes):
        print(f"Error: Routes file not found: {args.routes}")
        sys.exit(1)

    if args.adoption < 0 or args.adoption > 1:
        print(f"Error: Adoption rate must be between 0 and 1 (got {args.adoption})")
        sys.exit(1)

    # Run simulation
    run_simulation(args)


if __name__ == "__main__":
    main()
