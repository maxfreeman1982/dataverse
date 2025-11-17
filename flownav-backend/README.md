# FlowNav Backend FCI (Cloud Intelligence)

**API Backend pour prédictions de trafic et optimisation t₀**

Le backend FCI (FlowNav Cloud Intelligence) est le serveur central qui :
- Reçoit les agrégats de trafic anonymisés des FEU mobiles
- Génère les prédictions de vitesse v(x,t) via modèles LWR + LSTM
- Fournit les APIs pour calcul d'itinéraires optimisés
- Implémente Federated Learning pour entraînement distribué

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    FLOWNAV BACKEND FCI                     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ FastAPI      │  │ PostgreSQL   │  │ Redis Cache     │ │
│  │ REST + WS    │→ │ + TimescaleDB│← │ Predictions     │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
│         ↓                  ↓                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Kafka Stream │  │ LWR + LSTM   │  │ Federated       │ │
│  │ Telemetry    │  │ Prediction   │  │ Learning        │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prérequis

- **Python 3.10+**
- **PostgreSQL 14+** avec **TimescaleDB** extension
- **Redis 6+**
- **Kafka** (optionnel, pour production)

### Installation Dépendances

```bash
cd flownav-backend
pip install -r requirements.txt
```

### Configuration Base de Données

```bash
# PostgreSQL + TimescaleDB
psql -U postgres -c "CREATE DATABASE flownav;"
psql -U postgres -d flownav -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Tables (exécuter migrations)
alembic upgrade head
```

### Variables d'Environnement

Créer `.env` :

```env
# Database
DATABASE_URL=postgresql://flownav:password@localhost:5432/flownav

# Redis
REDIS_URL=redis://localhost:6379/0

# Kafka (production)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Security
JWT_SECRET_KEY=your-secret-key-change-in-production

# Config
DEBUG=False
LOG_LEVEL=INFO
```

---

## 🚀 Lancement

### Mode Développement

```bash
uvicorn app.main:app --reload --port 8000
```

### Mode Production

```bash
# Avec Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

### Docker Compose (Recommandé)

```bash
docker-compose up -d
```

---

## 📡 API Endpoints

### 1. Telemetry Upload

**POST** `/v1/telemetry/upload`

Upload agrégats de trafic k-anonymes.

**Request:**
```json
{
  "device_id_ephemeral": "a7f3c8e2-9d4b-4f1a-8c3e-5a6b7c8d9e0f",
  "telemetry_batch": [
    {
      "segment_id": "seg_abc123",
      "time_window": {
        "start": "2025-11-17T14:30:00Z",
        "end": "2025-11-17T14:35:00Z"
      },
      "veh_count": 5,
      "avg_speed_kmh": 52.3,
      "std_speed_kmh": 9.1,
      "source": ["edge_device"],
      "confidence": 0.85,
      "sent_at": "2025-11-17T14:35:10Z"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "accepted_count": 1,
  "rejected_count": 0,
  "next_upload_after": "2025-11-17T14:37:00Z"
}
```

---

### 2. Speed Forecast

**GET** `/v1/forecast/speed`

Récupérer prédictions de vitesse.

**Query Parameters:**
- `segment_ids`: Comma-separated (max 100)
- `time_start`: ISO8601 datetime
- `time_end`: ISO8601 datetime (max 2h from start)
- `resolution_minutes`: 1-15 (default: 5)

**Example:**
```bash
curl "http://localhost:8000/v1/forecast/speed? \
  segment_ids=seg_001,seg_002&\
  time_start=2025-11-17T15:00:00Z&\
  time_end=2025-11-17T15:30:00Z&\
  resolution_minutes=5"
```

**Response:**
```json
{
  "forecasts": [
    {
      "segment_id": "seg_001",
      "predictions": [
        {
          "time": "2025-11-17T15:00:00Z",
          "speed_kmh": 65.3,
          "speed_std_kmh": 8.2,
          "confidence": 0.87,
          "traffic_state": "moderate"
        }
      ]
    }
  ],
  "model_version": "lwr_lstm_v2.3.1",
  "generated_at": "2025-11-17T14:55:32Z"
}
```

---

### 3. Optimize Departure

**POST** `/v1/route/optimize_departure`

Calculer t₀ optimal côté serveur.

**Request:**
```json
{
  "origin_lat": 48.8566,
  "origin_lon": 2.3522,
  "dest_lat": 48.8922,
  "dest_lon": 2.2358,
  "arrival_target": "2025-11-17T16:00:00Z",
  "flexibility_minutes": 30
}
```

**Response:**
```json
{
  "optimal_departure": {
    "t0": "2025-11-17T15:11:00Z",
    "travel_time_minutes": 42.3,
    "arrival_time": "2025-11-17T15:53:18Z",
    "gain_vs_immediate_minutes": 15.7,
    "confidence": 0.83
  },
  "route": {
    "segments": ["seg_001", "seg_002"],
    "total_distance_km": 10.5
  },
  "recommendation": "Recommande : partez dans 11 min — gain estimé 16 min."
}
```

---

## 🤖 Modèles Prédictifs

### LWR (Lighthill-Whitham-Richards)

Modèle macroscopique de trafic basé sur équations PDE.

**Équations:**
```
∂k/∂t + ∂Q/∂x = 0  (continuité)
Q(k) = k · V(k)     (débit)
V(k) = v_free · (1 - k/k_jam)  (Greenshields)
```

**Implémentation:** `app/services/prediction_service.py:LWRModel`

**Paramètres:**
- `v_free`: 100 km/h (vitesse fluide)
- `k_jam`: 150 véh/km (densité embouteillage)

---

### LSTM Pattern Learning

Réseau de neurones récurrent pour apprentissage patterns temporels.

**Architecture:**
```
Input (24 features) → LSTM (128) → LSTM (64) → Dense (32) → Output (speed)
```

**Features:**
- Vitesse historique (24h précédentes)
- Jour semaine (one-hot)
- Heure jour (cyclique sin/cos)
- Météo (température, précipitations)
- Événements (vacances, grèves)

**Entraînement:**
- Données: 3 mois agrégats
- Loss: MSE (Mean Squared Error)
- Optimizer: Adam (lr=0.001)
- Validation: 80/20 split

---

### Hybride LWR + LSTM

Combinaison pondérée :
```
v_pred = 0.4 · v_LWR + 0.4 · v_LSTM + 0.2 · v_historical
```

**Avantages:**
- LWR: robustesse physique (garanties continuité)
- LSTM: apprentissage patterns complexes
- Historical: fallback stable

**Métriques (validation set):**
- MAPE: 12.5% (target <15%)
- RMSE: 8.3 km/h
- R²: 0.87

---

## 🔐 Privacy & Sécurité

### Validation K-Anonymity

Tous les agrégats sont validés :

```python
def check_k_anonymity(veh_count: int, threshold: int = 3) -> bool:
    return veh_count >= threshold
```

**Rejet automatique si `veh_count < 3`.**

### Rate Limiting

- **60 requêtes/heure** par `device_id_ephemeral`
- **Redis** pour tracking limites
- **429 Too Many Requests** si dépassement

### Authentification JWT (Phase 2)

```python
# Génération token
token = jwt.encode(
    {"device_id": ephemeral_id, "exp": datetime.utcnow() + timedelta(hours=24)},
    settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM
)
```

---

## 📊 Monitoring & Métriques

### Prometheus Metrics

Endpoint: `/metrics`

**Métriques exposées:**
- `flownav_requests_total{endpoint, method, status}`
- `flownav_request_duration_seconds{endpoint}`
- `flownav_predictions_generated_total`
- `flownav_telemetry_received_total`
- `flownav_k_anonymity_violations_total` (should be 0)

### Health Check

**GET** `/health`

```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "database_connected": true,
  "redis_connected": true,
  "kafka_connected": true
}
```

---

## 🧪 Tests

### Tests Unitaires

```bash
pytest tests/ -v --cov=app --cov-report=html
```

### Tests API

```bash
# Test telemetry upload
curl -X POST http://localhost:8000/v1/telemetry/upload \
  -H "Content-Type: application/json" \
  -d @tests/fixtures/telemetry_valid.json

# Test forecast
curl "http://localhost:8000/v1/forecast/speed?segment_ids=seg_test&time_start=2025-11-17T15:00:00Z&time_end=2025-11-17T16:00:00Z"
```

---

## 🚢 Déploiement Production

### Docker Compose

`docker-compose.yml` inclus:

```bash
docker-compose up -d

# Services lancés:
# - flownav-api (FastAPI)
# - postgres (PostgreSQL + TimescaleDB)
# - redis (Cache)
# - kafka + zookeeper (Streaming)
# - prometheus (Monitoring)
# - grafana (Dashboards)
```

### Kubernetes (Helm Chart)

```bash
helm install flownav ./charts/flownav \
  --namespace flownav \
  --create-namespace \
  --values values-production.yaml
```

### Scaling

**Horizontal Pod Autoscaler:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: flownav-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: flownav-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 📚 Documentation API

### OpenAPI / Swagger

URL: `http://localhost:8000/docs`

Interface interactive pour tester tous les endpoints.

### ReDoc

URL: `http://localhost:8000/redoc`

Documentation alternative (plus lisible).

---

## 🛠️ Développement

### Structure Code

```
app/
├── api/               # Endpoints FastAPI
│   ├── telemetry.py
│   ├── forecast.py
│   └── routes.py
├── models/            # Pydantic schemas
│   └── schemas.py
├── services/          # Business logic
│   ├── telemetry_service.py
│   ├── prediction_service.py
│   └── privacy_validator.py
├── utils/             # Utilities
│   └── rate_limiter.py
└── main.py            # Application entry point
```

### Code Style

```bash
# Format
black app/ tests/

# Lint
flake8 app/ tests/

# Type check
mypy app/ tests/
```

---

## 📈 Performance

### Benchmarks (Production)

| Endpoint | Latency p50 | Latency p95 | Throughput |
|----------|-------------|-------------|------------|
| `/telemetry/upload` | 45 ms | 120 ms | 1000 req/s |
| `/forecast/speed` | 80 ms | 200 ms | 500 req/s |
| `/route/optimize` | 250 ms | 600 ms | 100 req/s |

**Infra:** 4 workers, 2 vCPU, 4 GB RAM

---

## 🐛 Troubleshooting

### Issue: Predictions inexactes

**Cause:** Modèle pas à jour

**Solution:**
```bash
curl -X POST http://localhost:8000/v1/forecast/model/update
```

### Issue: Rate limit trop strict

**Cause:** Trop de requêtes depuis même device

**Solution:** Augmenter limite dans `.env`:
```env
RATE_LIMIT_PER_HOUR=120
```

---

## 📞 Support

- **Issues:** https://github.com/flownav/backend/issues
- **Docs:** https://docs.flownav.ai/backend
- **Email:** support@flownav.ai

---

**Version:** 1.0.0
**Date:** 2025-11-17
**Auteur:** FlowNav Backend Team
**Status:** Production-ready
