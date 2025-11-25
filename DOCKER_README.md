# 🐳 Docker Setup - OJ Investment Platform

## Quick Start

```bash
# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Services

- **postgres** - PostgreSQL database (port 5432)
- **redis** - Redis cache (port 6379)
- **api** - Backend API (port 3000)
- **web** - Frontend Web (port 3001)
- **blockchain** - Hardhat node (port 8545)

## URLs

- API: http://localhost:3000
- GraphQL: http://localhost:3000/graphql
- Web: http://localhost:3001
- pgAdmin: http://localhost:5050 (with --profile tools)

## Profiles

```bash
# With blockchain
docker-compose --profile blockchain up -d

# With tools (pgAdmin)
docker-compose --profile tools up -d

# Production with nginx
docker-compose --profile production up -d
```

## Commands

```bash
# Rebuild services
docker-compose build

# View service status
docker-compose ps

# Execute command in container
docker-compose exec api npm run migration:run

# View logs for specific service
docker-compose logs -f api
```
