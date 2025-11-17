"""
FlowNav Backend FCI - Configuration Settings
Environment-based configuration with Pydantic
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # Application
    APP_NAME: str = "FlowNav Cloud Intelligence (FCI)"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/v1"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False

    # Database (PostgreSQL + TimescaleDB)
    DATABASE_URL: str = "postgresql://flownav:password@localhost:5432/flownav"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40
    DATABASE_ECHO: bool = False

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 300  # 5 minutes

    # Kafka (Streaming)
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_TELEMETRY: str = "flownav.telemetry"
    KAFKA_TOPIC_PREDICTIONS: str = "flownav.predictions"
    KAFKA_CONSUMER_GROUP: str = "flownav-fci"

    # Privacy & Security
    K_ANONYMITY_THRESHOLD: int = 3
    MAX_BATCH_SIZE: int = 50
    RATE_LIMIT_PER_HOUR: int = 60
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Prediction Model
    PREDICTION_HORIZON_MINUTES: int = 30
    PREDICTION_RESOLUTION_MINUTES: int = 5
    MODEL_UPDATE_INTERVAL_HOURS: int = 6
    LWR_MODEL_PATH: str = "./models/lwr_model.pkl"
    LSTM_MODEL_PATH: str = "./models/lstm_model.h5"

    # Federated Learning
    FL_ENABLED: bool = False
    FL_ROUNDS_PER_DAY: int = 4
    FL_MIN_CLIENTS: int = 10
    FL_AGGREGATION_METHOD: str = "fedavg"  # FedAvg, FedProx, etc.

    # Data Retention (GDPR)
    RETENTION_AGGREGATES_DAYS: int = 90
    RETENTION_MODELS_DAYS: int = 730  # 2 years
    RETENTION_LOGS_DAYS: int = 1095  # 3 years
    AUTO_PURGE_ENABLED: bool = True

    # Monitoring
    PROMETHEUS_PORT: int = 9090
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # Production: restrict to specific domains
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list[str] = ["GET", "POST", "PUT", "DELETE"]
    CORS_HEADERS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
