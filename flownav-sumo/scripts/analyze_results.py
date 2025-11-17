"""
FlowNav SUMO - Results Analysis
Extract and compare KPIs from simulation outputs
"""

import argparse
import xml.etree.ElementTree as ET
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Analyze FlowNav simulation results")

    parser.add_argument("--baseline", required=True, help="Baseline output directory")
    parser.add_argument("--flownav", required=True, help="FlowNav output directory")
    parser.add_argument("--output", required=True, help="Analysis output directory")
    parser.add_argument("--format", default="pdf", choices=["pdf", "png"], help="Plot format")

    return parser.parse_args()


def parse_tripinfo(tripinfo_xml: str) -> pd.DataFrame:
    """
    Parse tripinfo.xml and extract trip data

    Args:
        tripinfo_xml: Path to tripinfo.xml file

    Returns:
        DataFrame with trip information
    """
    tree = ET.parse(tripinfo_xml)
    root = tree.getroot()

    trips = []
    for tripinfo in root.findall('tripinfo'):
        trip = {
            'id': tripinfo.get('id'),
            'depart': float(tripinfo.get('depart', 0)),
            'arrival': float(tripinfo.get('arrival', 0)),
            'duration': float(tripinfo.get('duration', 0)),
            'routeLength': float(tripinfo.get('routeLength', 0)),
            'waitingTime': float(tripinfo.get('waitingTime', 0)),
            'timeLoss': float(tripinfo.get('timeLoss', 0)),
        }

        # Calculate average speed
        if trip['duration'] > 0:
            trip['avgSpeed'] = (trip['routeLength'] / trip['duration']) * 3.6  # km/h
        else:
            trip['avgSpeed'] = 0

        trips.append(trip)

    return pd.DataFrame(trips)


def parse_emissions(emissions_xml: str) -> pd.DataFrame:
    """
    Parse emissions.xml and extract emission data

    Args:
        emissions_xml: Path to emissions.xml file

    Returns:
        DataFrame with emission information
    """
    tree = ET.parse(emissions_xml)
    root = tree.getroot()

    emissions = []
    for timestep in root.findall('timestep'):
        for vehicle in timestep.findall('vehicle'):
            emission = {
                'id': vehicle.get('id'),
                'time': float(timestep.get('time', 0)),
                'CO2': float(vehicle.get('CO2', 0)),
                'CO': float(vehicle.get('CO', 0)),
                'HC': float(vehicle.get('HC', 0)),
                'NOx': float(vehicle.get('NOx', 0)),
                'PMx': float(vehicle.get('PMx', 0)),
                'fuel': float(vehicle.get('fuel', 0)),
            }
            emissions.append(emission)

    return pd.DataFrame(emissions)


def calculate_kpis(trips_df: pd.DataFrame, emissions_df: pd.DataFrame) -> dict:
    """
    Calculate Key Performance Indicators

    Args:
        trips_df: Trip information DataFrame
        emissions_df: Emissions DataFrame

    Returns:
        Dictionary of KPIs
    """
    kpis = {
        # Travel Time Metrics
        "avg_travel_time_min": trips_df['duration'].mean() / 60,
        "std_travel_time_min": trips_df['duration'].std() / 60,
        "median_travel_time_min": trips_df['duration'].median() / 60,
        "p95_travel_time_min": trips_df['duration'].quantile(0.95) / 60,

        # Speed Metrics
        "avg_speed_kmh": trips_df['avgSpeed'].mean(),
        "avg_waiting_time_min": trips_df['waitingTime'].mean() / 60,
        "avg_time_loss_min": trips_df['timeLoss'].mean() / 60,

        # Throughput
        "total_vehicles": len(trips_df),
        "completed_vehicles": len(trips_df[trips_df['arrival'] > 0]),

        # Distance
        "avg_route_length_km": trips_df['routeLength'].mean() / 1000,
        "total_distance_km": trips_df['routeLength'].sum() / 1000,
    }

    # Emissions (aggregate by vehicle)
    if not emissions_df.empty:
        vehicle_emissions = emissions_df.groupby('id').agg({
            'CO2': 'sum',
            'CO': 'sum',
            'NOx': 'sum',
            'fuel': 'sum',
        })

        kpis.update({
            "total_co2_kg": vehicle_emissions['CO2'].sum() / 1000,
            "avg_co2_per_vehicle_kg": vehicle_emissions['CO2'].mean() / 1000,
            "avg_co2_per_km_g": (vehicle_emissions['CO2'].sum() / trips_df['routeLength'].sum()) * 1000,
            "total_fuel_l": vehicle_emissions['fuel'].sum() / 1000,
        })
    else:
        kpis.update({
            "total_co2_kg": 0,
            "avg_co2_per_vehicle_kg": 0,
            "avg_co2_per_km_g": 0,
            "total_fuel_l": 0,
        })

    return kpis


def compare_scenarios(baseline_kpis: dict, flownav_kpis: dict) -> dict:
    """
    Compare baseline vs FlowNav scenarios

    Args:
        baseline_kpis: Baseline KPIs
        flownav_kpis: FlowNav KPIs

    Returns:
        Dictionary of improvements (% change)
    """
    improvements = {}

    # Calculate percentage improvements
    for key in baseline_kpis:
        if key.startswith('total_') or key.startswith('completed_'):
            # These are absolute counts, skip percentage
            continue

        baseline_val = baseline_kpis[key]
        flownav_val = flownav_kpis[key]

        if baseline_val != 0:
            # For most metrics, reduction is improvement
            if 'travel_time' in key or 'waiting' in key or 'time_loss' in key or 'co2' in key or 'fuel' in key:
                improvement = ((baseline_val - flownav_val) / baseline_val) * 100
            # For speed, increase is improvement
            elif 'speed' in key:
                improvement = ((flownav_val - baseline_val) / baseline_val) * 100
            else:
                improvement = ((flownav_val - baseline_val) / baseline_val) * 100

            improvements[f"{key}_improvement_%"] = improvement

    return improvements


def plot_travel_time_distribution(
    baseline_trips: pd.DataFrame,
    flownav_trips: pd.DataFrame,
    output_path: str,
):
    """Plot travel time distributions"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Baseline
    sns.histplot(baseline_trips['duration'] / 60, bins=30, color='red', alpha=0.7, ax=axes[0])
    axes[0].axvline(baseline_trips['duration'].mean() / 60, color='darkred', linestyle='--', linewidth=2, label='Mean')
    axes[0].set_title('Baseline: Travel Time Distribution', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Travel Time (minutes)')
    axes[0].set_ylabel('Frequency')
    axes[0].legend()
    axes[0].grid(alpha=0.3)

    # FlowNav
    sns.histplot(flownav_trips['duration'] / 60, bins=30, color='green', alpha=0.7, ax=axes[1])
    axes[1].axvline(flownav_trips['duration'].mean() / 60, color='darkgreen', linestyle='--', linewidth=2, label='Mean')
    axes[1].set_title('FlowNav: Travel Time Distribution', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Travel Time (minutes)')
    axes[1].set_ylabel('Frequency')
    axes[1].legend()
    axes[1].grid(alpha=0.3)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_kpi_comparison(baseline_kpis: dict, flownav_kpis: dict, improvements: dict, output_path: str):
    """Plot KPI comparison bars"""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # 1. Travel Time
    metrics = ['avg_travel_time_min', 'std_travel_time_min', 'median_travel_time_min']
    labels = ['Average', 'Std Dev', 'Median']
    baseline_vals = [baseline_kpis[m] for m in metrics]
    flownav_vals = [flownav_kpis[m] for m in metrics]

    x = np.arange(len(labels))
    width = 0.35

    axes[0, 0].bar(x - width/2, baseline_vals, width, label='Baseline', color='red', alpha=0.7)
    axes[0, 0].bar(x + width/2, flownav_vals, width, label='FlowNav', color='green', alpha=0.7)
    axes[0, 0].set_ylabel('Time (minutes)')
    axes[0, 0].set_title('Travel Time Metrics', fontweight='bold')
    axes[0, 0].set_xticks(x)
    axes[0, 0].set_xticklabels(labels)
    axes[0, 0].legend()
    axes[0, 0].grid(alpha=0.3, axis='y')

    # 2. Speed & Efficiency
    metrics = ['avg_speed_kmh', 'avg_waiting_time_min', 'avg_time_loss_min']
    labels = ['Avg Speed\n(km/h)', 'Waiting Time\n(min)', 'Time Loss\n(min)']
    baseline_vals = [baseline_kpis[m] for m in metrics]
    flownav_vals = [flownav_kpis[m] for m in metrics]

    axes[0, 1].bar(x - width/2, baseline_vals, width, label='Baseline', color='red', alpha=0.7)
    axes[0, 1].bar(x + width/2, flownav_vals, width, label='FlowNav', color='green', alpha=0.7)
    axes[0, 1].set_ylabel('Value')
    axes[0, 1].set_title('Speed & Efficiency Metrics', fontweight='bold')
    axes[0, 1].set_xticks(x)
    axes[0, 1].set_xticklabels(labels)
    axes[0, 1].legend()
    axes[0, 1].grid(alpha=0.3, axis='y')

    # 3. Emissions
    metrics = ['avg_co2_per_vehicle_kg', 'avg_co2_per_km_g']
    labels = ['CO₂ per Vehicle\n(kg)', 'CO₂ per km\n(g)']
    baseline_vals = [baseline_kpis[m] for m in metrics]
    flownav_vals = [flownav_kpis[m] for m in metrics]

    x2 = np.arange(len(labels))
    axes[1, 0].bar(x2 - width/2, baseline_vals, width, label='Baseline', color='red', alpha=0.7)
    axes[1, 0].bar(x2 + width/2, flownav_vals, width, label='FlowNav', color='green', alpha=0.7)
    axes[1, 0].set_ylabel('CO₂ Emissions')
    axes[1, 0].set_title('Environmental Impact', fontweight='bold')
    axes[1, 0].set_xticks(x2)
    axes[1, 0].set_xticklabels(labels)
    axes[1, 0].legend()
    axes[1, 0].grid(alpha=0.3, axis='y')

    # 4. Improvements (%)
    improvement_metrics = [
        'avg_travel_time_min_improvement_%',
        'avg_speed_kmh_improvement_%',
        'avg_co2_per_vehicle_kg_improvement_%',
    ]
    labels = ['Travel Time', 'Speed', 'CO₂']
    values = [improvements[m] for m in improvement_metrics]
    colors = ['green' if v > 0 else 'red' for v in values]

    x3 = np.arange(len(labels))
    axes[1, 1].bar(x3, values, color=colors, alpha=0.7)
    axes[1, 1].axhline(0, color='black', linestyle='-', linewidth=0.8)
    axes[1, 1].set_ylabel('Improvement (%)')
    axes[1, 1].set_title('Overall Improvements', fontweight='bold')
    axes[1, 1].set_xticks(x3)
    axes[1, 1].set_xticklabels(labels)
    axes[1, 1].grid(alpha=0.3, axis='y')

    # Add value labels on bars
    for i, v in enumerate(values):
        axes[1, 1].text(i, v + (1 if v > 0 else -1), f'{v:+.1f}%', ha='center', fontweight='bold')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


def generate_report(baseline_kpis: dict, flownav_kpis: dict, improvements: dict, output_path: str):
    """Generate text report"""
    with open(output_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("FlowNav SUMO Simulation - Analysis Report\n")
        f.write("=" * 80 + "\n\n")

        f.write("BASELINE SCENARIO\n")
        f.write("-" * 80 + "\n")
        for key, value in baseline_kpis.items():
            f.write(f"{key:40s}: {value:>12.2f}\n")

        f.write("\n\nFLOWNAV SCENARIO\n")
        f.write("-" * 80 + "\n")
        for key, value in flownav_kpis.items():
            f.write(f"{key:40s}: {value:>12.2f}\n")

        f.write("\n\nIMPROVEMENTS (% Change)\n")
        f.write("-" * 80 + "\n")
        for key, value in improvements.items():
            symbol = "↑" if value > 0 else "↓"
            f.write(f"{key:50s}: {symbol} {value:>10.2f}%\n")

        f.write("\n" + "=" * 80 + "\n")
        f.write("KEY FINDINGS\n")
        f.write("=" * 80 + "\n\n")

        # Summary
        travel_time_imp = improvements.get('avg_travel_time_min_improvement_%', 0)
        co2_imp = improvements.get('avg_co2_per_vehicle_kg_improvement_%', 0)
        speed_imp = improvements.get('avg_speed_kmh_improvement_%', 0)

        f.write(f"✓ Travel Time Reduction: {travel_time_imp:.1f}%\n")
        f.write(f"✓ CO₂ Emission Reduction: {co2_imp:.1f}%\n")
        f.write(f"✓ Average Speed Increase: {speed_imp:.1f}%\n")

        f.write("\n")


def main():
    """Main analysis function"""
    args = parse_args()

    print("=" * 80)
    print("FlowNav SUMO - Results Analysis")
    print("=" * 80)

    # Create output directory
    Path(args.output).mkdir(parents=True, exist_ok=True)

    # Parse baseline
    print(f"\nParsing baseline: {args.baseline}")
    baseline_trips = parse_tripinfo(f"{args.baseline}/tripinfo.xml")
    baseline_emissions = parse_emissions(f"{args.baseline}/emissions.xml")
    baseline_kpis = calculate_kpis(baseline_trips, baseline_emissions)

    # Parse FlowNav
    print(f"Parsing FlowNav: {args.flownav}")
    flownav_trips = parse_tripinfo(f"{args.flownav}/tripinfo.xml")
    flownav_emissions = parse_emissions(f"{args.flownav}/emissions.xml")
    flownav_kpis = calculate_kpis(flownav_trips, flownav_emissions)

    # Compare scenarios
    print("\nComparing scenarios...")
    improvements = compare_scenarios(baseline_kpis, flownav_kpis)

    # Generate plots
    print(f"\nGenerating plots (format: {args.format})...")
    plot_travel_time_distribution(
        baseline_trips,
        flownav_trips,
        f"{args.output}/travel_time_distribution.{args.format}"
    )

    plot_kpi_comparison(
        baseline_kpis,
        flownav_kpis,
        improvements,
        f"{args.output}/kpi_comparison.{args.format}"
    )

    # Generate report
    print("Generating report...")
    generate_report(
        baseline_kpis,
        flownav_kpis,
        improvements,
        f"{args.output}/report.txt"
    )

    # Save KPIs to JSON
    results = {
        "baseline": baseline_kpis,
        "flownav": flownav_kpis,
        "improvements": improvements,
    }

    with open(f"{args.output}/kpis.json", 'w') as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 80)
    print("Analysis Complete")
    print("=" * 80)
    print(f"\nOutputs saved to: {args.output}")
    print(f"  - travel_time_distribution.{args.format}")
    print(f"  - kpi_comparison.{args.format}")
    print(f"  - report.txt")
    print(f"  - kpis.json")

    # Print summary
    print("\nQUICK SUMMARY")
    print("-" * 80)
    print(f"Travel Time Reduction: {improvements.get('avg_travel_time_min_improvement_%', 0):+.1f}%")
    print(f"CO₂ Reduction: {improvements.get('avg_co2_per_vehicle_kg_improvement_%', 0):+.1f}%")
    print(f"Speed Increase: {improvements.get('avg_speed_kmh_improvement_%', 0):+.1f}%")


if __name__ == "__main__":
    main()
