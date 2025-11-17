# FlowNav SUMO Simulation

**Validation de FlowNav avec SUMO (Simulation of Urban MObility)**

Ce module implémente une simulation complète du système FlowNav pour mesurer l'impact réel sur :
- Temps de trajet moyen
- Débit réseau (véh/h)
- Réduction CO₂
- Adoption recommandations t₀

---

## 🎯 Objectifs de la Simulation

### Scénarios Testés

1. **Baseline** : Navigation classique (pas d'optimisation t₀)
   - Tous les véhicules partent dès que possible
   - Pas de coordination

2. **FlowNav 20% adoption** : 20% véhicules utilisent FlowNav
   - Calcul t₀ optimal
   - Décalage départs pour éviter pics

3. **FlowNav 50% adoption** : 50% véhicules FlowNav

4. **FlowNav 100% adoption** : Tous véhicules FlowNav

### Métriques Mesurées (KPIs)

| Métrique | Description | Cible |
|----------|-------------|-------|
| **Temps trajet moyen** | Minutes pour 20 km urbain | -15 à -20% vs baseline |
| **Débit réseau** | Véhicules/heure/voie | +10-15% vs baseline |
| **CO₂ émis** | Grammes CO₂ par trajet | -10-15% vs baseline |
| **% départs optimaux suivis** | Utilisateurs qui attendent t₀ | >60% |
| **Variance temps trajet** | Écart-type des durées | -30% (prédictibilité) |

---

## 📦 Structure du Projet

```
flownav-sumo/
├── networks/
│   ├── paris_10km.net.xml        # Réseau routier Paris (OpenStreetMap)
│   ├── paris_10km.edg.xml        # Edges (routes)
│   └── paris_10km.nod.xml        # Nodes (intersections)
├── scenarios/
│   ├── baseline.rou.xml          # Routes baseline (pas FlowNav)
│   ├── flownav_20.rou.xml        # 20% adoption FlowNav
│   ├── flownav_50.rou.xml        # 50% adoption
│   └── flownav_100.rou.xml       # 100% adoption
├── scripts/
│   ├── generate_network.py       # Génération réseau depuis OSM
│   ├── generate_routes.py        # Génération trajets OD
│   ├── flownav_agent.py          # Agent FlowNav (calcul t₀)
│   ├── run_simulation.py         # Lancement simulation
│   └── analyze_results.py        # Analyse KPIs
├── outputs/
│   ├── baseline/                 # Résultats baseline
│   ├── flownav_20/               # Résultats 20% adoption
│   ├── flownav_50/
│   └── flownav_100/
├── config.yaml                   # Configuration simulation
└── README.md                     # Ce fichier
```

---

## 🚀 Installation & Configuration

### Prérequis

```bash
# SUMO (Simulation of Urban MObility)
sudo apt-get install sumo sumo-tools sumo-doc

# Python dependencies
pip install sumolib traci osmget numpy pandas matplotlib seaborn
```

### Vérification Installation

```bash
sumo --version
# Expected: SUMO 1.19.0 ou supérieur

which sumo
# Expected: /usr/bin/sumo
```

---

## 🗺️ Génération Réseau Routier

### Méthode 1 : Depuis OpenStreetMap (Recommandé)

```bash
cd networks/

# Télécharger zone Paris (République → Défense, ~10 km²)
python ../scripts/generate_network.py \
  --bbox "48.85,2.30,48.90,2.40" \
  --output paris_10km

# Génère :
# - paris_10km.osm.xml  (données OSM)
# - paris_10km.net.xml  (réseau SUMO)
```

### Méthode 2 : Réseau Simplifié (Test Rapide)

```bash
# Créer réseau grid simple 5x5 km
netgenerate \
  --grid \
  --grid.x-number=10 \
  --grid.y-number=10 \
  --grid.x-length=500 \
  --grid.y-length=500 \
  --default.speed=13.89 \
  --output-file simple_grid.net.xml
```

---

## 🚗 Génération Trajets (OD Pairs)

### Configuration Demande Trafic

```yaml
# config.yaml
traffic_demand:
  simulation_duration: 3600  # 1 heure (secondes)
  num_vehicles: 1000
  peak_hours:
    - start: 0
      end: 1800  # 0-30 min: rush
      vehicles_per_second: 2.0
    - start: 1800
      end: 3600  # 30-60 min: décroissance
      vehicles_per_second: 0.5

  od_pairs:  # Origine-Destination
    - origin: "node_123"
      destination: "node_456"
      probability: 0.3
    - origin: "node_789"
      destination: "node_101"
      probability: 0.25
```

### Génération Routes

```bash
python scripts/generate_routes.py \
  --config config.yaml \
  --network networks/paris_10km.net.xml \
  --output scenarios/baseline.rou.xml \
  --flownav-adoption 0.0  # Baseline

python scripts/generate_routes.py \
  --config config.yaml \
  --network networks/paris_10km.net.xml \
  --output scenarios/flownav_20.rou.xml \
  --flownav-adoption 0.2  # 20% FlowNav
```

---

## 🤖 Agent FlowNav dans SUMO

### Principe

Chaque véhicule FlowNav :
1. **Calcul t₀ optimal** avant départ
2. **Attend** si t₀ > t_now (décalage départ)
3. **Route dynamique** : re-routing si prédiction change

### Implémentation

```python
# scripts/flownav_agent.py

class FlowNavVehicle:
    def __init__(self, vehicle_id, origin, destination, t_desired_arrival):
        self.id = vehicle_id
        self.origin = origin
        self.destination = destination
        self.t_arrival = t_desired_arrival
        self.t0_optimal = None
        self.route = None

    def calculate_optimal_departure(self, sumo_network, current_time):
        """
        Calcul t₀ optimal via simulation mini-batch

        Algorithme :
        1. Récupérer prédictions vitesse réseau (depuis SUMO state)
        2. Simuler T(t₀) pour t₀ ∈ [t_now, t_now+30min], step=5min
        3. Trouver argmin T(t₀)
        4. Retourner t₀ et gain estimé
        """
        # Grid search sur fenêtre 30 min
        candidates = range(current_time, current_time + 1800, 300)  # 5 min step
        min_travel_time = float('inf')
        optimal_t0 = current_time

        for t0_candidate in candidates:
            # Simuler trajet à t0_candidate
            travel_time = self._simulate_travel_time(
                sumo_network,
                t0_candidate
            )

            if travel_time < min_travel_time:
                min_travel_time = travel_time
                optimal_t0 = t0_candidate

        gain = self._simulate_travel_time(sumo_network, current_time) - min_travel_time
        self.t0_optimal = optimal_t0

        return {
            "t0": optimal_t0,
            "travel_time": min_travel_time,
            "gain_seconds": gain,
        }

    def _simulate_travel_time(self, network, departure_time):
        """
        Estimer temps de trajet si départ à departure_time

        Utilise :
        - État actuel réseau SUMO (densités, vitesses)
        - Prédiction linéaire évolution trafic
        """
        route_edges = network.get_shortest_path(self.origin, self.destination)
        total_time = 0

        current_sim_time = departure_time
        for edge in route_edges:
            # Vitesse moyenne edge à current_sim_time
            speed_kmh = self._get_predicted_speed(edge, current_sim_time)
            edge_length_km = network.get_edge_length(edge) / 1000

            # Temps traversée
            edge_time_hours = edge_length_km / speed_kmh
            edge_time_seconds = edge_time_hours * 3600

            total_time += edge_time_seconds
            current_sim_time += edge_time_seconds

        return total_time

    def _get_predicted_speed(self, edge_id, time):
        """
        Prédiction vitesse edge à instant time

        Sources :
        1. État actuel SUMO (traci.edge.getLastStepMeanSpeed)
        2. Tendance (vitesse t-5min vs vitesse actuelle)
        3. Pattern historique (si disponible)
        """
        import traci

        # Vitesse instantanée
        current_speed_ms = traci.edge.getLastStepMeanSpeed(edge_id)

        # Conversion m/s → km/h
        current_speed_kmh = current_speed_ms * 3.6

        # Prédiction simple : supposer vitesse stable
        # (améliorable avec LWR, historique, etc.)
        return max(current_speed_kmh, 10)  # Min 10 km/h
```

---

## 🏃 Exécution Simulation

### Lancement Simulation Baseline

```bash
python scripts/run_simulation.py \
  --scenario baseline \
  --network networks/paris_10km.net.xml \
  --routes scenarios/baseline.rou.xml \
  --output outputs/baseline/ \
  --duration 3600 \
  --gui  # Avec interface graphique (optionnel)
```

### Lancement Toutes Simulations (Batch)

```bash
# Script automatisé
./scripts/run_all_scenarios.sh

# Contenu :
for adoption in 0.0 0.2 0.5 1.0; do
  python scripts/run_simulation.py \
    --scenario flownav_${adoption/./_} \
    --network networks/paris_10km.net.xml \
    --routes scenarios/flownav_${adoption/./_}.rou.xml \
    --output outputs/flownav_${adoption/./_}/ \
    --duration 3600
done
```

### Outputs Générés

```
outputs/baseline/
├── tripinfo.xml           # Infos trajets (durée, distance, etc.)
├── edgedata.xml           # Données edges (débit, vitesse, occupancy)
├── summary.xml            # Résumé global simulation
└── emissions.xml          # Émissions CO₂, NOx, etc.
```

---

## 📊 Analyse Résultats

### Script Analyse KPIs

```bash
python scripts/analyze_results.py \
  --baseline outputs/baseline/ \
  --flownav outputs/flownav_20/ \
  --output analysis/comparison_20.pdf
```

### Métriques Extraites

```python
# analyze_results.py (extrait)

def extract_kpis(tripinfo_xml):
    """Parse tripinfo.xml et calcule KPIs"""
    trips = parse_xml(tripinfo_xml)

    kpis = {
        "avg_travel_time_s": np.mean([t.duration for t in trips]),
        "std_travel_time_s": np.std([t.duration for t in trips]),
        "avg_speed_kmh": np.mean([t.distance / t.duration * 3.6 for t in trips]),
        "total_co2_g": sum([t.co2 for t in trips]),
        "completed_trips": len(trips),
    }

    return kpis

def compare_scenarios(baseline_kpis, flownav_kpis):
    """Compare baseline vs FlowNav"""
    improvements = {
        "travel_time_reduction_%": (
            (baseline_kpis["avg_travel_time_s"] - flownav_kpis["avg_travel_time_s"])
            / baseline_kpis["avg_travel_time_s"] * 100
        ),
        "co2_reduction_%": (
            (baseline_kpis["total_co2_g"] - flownav_kpis["total_co2_g"])
            / baseline_kpis["total_co2_g"] * 100
        ),
        "predictability_improvement_%": (
            (baseline_kpis["std_travel_time_s"] - flownav_kpis["std_travel_time_s"])
            / baseline_kpis["std_travel_time_s"] * 100
        ),
    }

    return improvements
```

### Graphiques Générés

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Comparaison temps trajet distributions
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

sns.histplot(baseline_travel_times, ax=axes[0], color='red', label='Baseline')
axes[0].set_title('Baseline: Distribution Temps Trajet')
axes[0].set_xlabel('Temps (secondes)')

sns.histplot(flownav_travel_times, ax=axes[1], color='green', label='FlowNav')
axes[1].set_title('FlowNav 20%: Distribution Temps Trajet')
axes[1].set_xlabel('Temps (secondes)')

plt.tight_layout()
plt.savefig('analysis/travel_time_distributions.png', dpi=300)
```

---

## 📈 Résultats Attendus

### Tableau Comparatif (Mock)

| Scénario | Temps Moyen (min) | Débit (véh/h) | CO₂ (kg/1000 véh) | Variance Temps |
|----------|-------------------|---------------|-------------------|----------------|
| **Baseline** | 35.2 | 1850 | 4500 | 12.5 min |
| **FlowNav 20%** | 32.8 (-6.8%) | 1950 (+5.4%) | 4200 (-6.7%) | 10.1 min (-19%) |
| **FlowNav 50%** | 29.5 (-16.2%) | 2100 (+13.5%) | 3950 (-12.2%) | 8.2 min (-34%) |
| **FlowNav 100%** | 27.1 (-23.0%) | 2200 (+18.9%) | 3750 (-16.7%) | 6.5 min (-48%) |

**Conclusion :** Même 20% adoption → gains mesurables.

---

## 🔬 Validation Scientifique

### Tests Statistiques

```python
from scipy.stats import ttest_ind

# Test significativité gains temps trajet
t_stat, p_value = ttest_ind(baseline_times, flownav_times)

if p_value < 0.05:
    print(f"✓ Amélioration statistiquement significative (p={p_value:.4f})")
else:
    print(f"✗ Pas de différence significative (p={p_value:.4f})")
```

### Sensibilité Paramètres

- **Flexibilité t₀** (10, 20, 30 min) : impact gain
- **Adoption** (10%, 20%, 50%, 100%) : effets réseau
- **Précision prédictions** (±5%, ±10%, ±20%) : robustesse

---

## 🛠️ Développement & Debug

### Mode GUI (visualisation)

```bash
sumo-gui -c simulation.sumocfg
```

### Logs Détaillés

```bash
python scripts/run_simulation.py \
  --scenario baseline \
  --log-level DEBUG \
  --verbose
```

### Tests Unitaires FlowNav Agent

```bash
pytest tests/test_flownav_agent.py -v
```

---

## 📚 Références

- **SUMO Documentation** : https://sumo.dlr.de/docs/
- **TraCI (Traffic Control Interface)** : https://sumo.dlr.de/docs/TraCI.html
- **OpenStreetMap** : https://www.openstreetmap.org/
- **FlowNav Technical Spec** : `../flownav-technical-specification.json`

---

**Version :** 1.0.0
**Date :** 2025-11-17
**Auteur :** FlowNav Simulation Team
**Status :** Prêt pour simulations pilotes
