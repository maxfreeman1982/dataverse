#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# PERFUME ARCHITECT PRO - Quick PostgreSQL Setup
# ═══════════════════════════════════════════════════════════════════

set -e

echo "🔧 Configuration PostgreSQL pour Perfume Architect Pro"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="dataverse"
DB_USER="dataverse"
DB_PASSWORD="dataverse"
DB_HOST="localhost"
DB_PORT="5432"

echo "📝 Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo ""

# Étape 1: Vérifier si PostgreSQL est installé
echo "1️⃣  Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL n'est pas installé${NC}"
    echo ""
    echo "Installation recommandée:"
    echo "  sudo apt update"
    echo "  sudo apt install -y postgresql postgresql-contrib"
    exit 1
fi

PG_VERSION=$(psql --version | awk '{print $3}')
echo -e "${GREEN}✅ PostgreSQL $PG_VERSION installé${NC}"
echo ""

# Étape 2: Démarrer PostgreSQL (si possible)
echo "2️⃣  Démarrage de PostgreSQL..."

# Essayer plusieurs méthodes de démarrage
if command -v systemctl &> /dev/null 2>&1; then
    echo "   Tentative avec systemctl..."
    systemctl start postgresql 2>/dev/null && echo -e "${GREEN}✅ PostgreSQL démarré via systemctl${NC}" || echo -e "${YELLOW}⚠️  systemctl non disponible${NC}"
elif command -v service &> /dev/null 2>&1; then
    echo "   Tentative avec service..."
    service postgresql start 2>/dev/null && echo -e "${GREEN}✅ PostgreSQL démarré via service${NC}" || echo -e "${YELLOW}⚠️  service non disponible${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de démarrer PostgreSQL automatiquement${NC}"
    echo "   Démarrez PostgreSQL manuellement si nécessaire"
fi
echo ""

# Attendre que PostgreSQL soit prêt
echo "3️⃣  Attente de PostgreSQL..."
for i in {1..10}; do
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL répond sur $DB_HOST:$DB_PORT${NC}"
        break
    fi

    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ PostgreSQL ne répond pas après 10 secondes${NC}"
        echo ""
        echo "Solutions possibles:"
        echo "  1. Démarrer PostgreSQL manuellement:"
        echo "     sudo systemctl start postgresql"
        echo "  2. Utiliser Docker PostgreSQL:"
        echo "     docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14"
        exit 1
    fi

    echo "   Attente... ($i/10)"
    sleep 1
done
echo ""

# Étape 4: Créer l'utilisateur et la base de données
echo "4️⃣  Configuration de la base de données..."

# Fonction pour exécuter des commandes SQL
run_sql() {
    psql -h $DB_HOST -p $DB_PORT -U postgres -t -c "$1" 2>/dev/null || \
    psql -h $DB_HOST -p $DB_PORT -U $USER -t -c "$1" 2>/dev/null || \
    return 1
}

# Vérifier si la base de données existe déjà
DB_EXISTS=$(run_sql "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | xargs)

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Base de données '$DB_NAME' existe déjà${NC}"
else
    echo "   Création de la base de données '$DB_NAME'..."
    run_sql "CREATE DATABASE $DB_NAME" && echo -e "${GREEN}✅ Base de données créée${NC}" || {
        echo -e "${RED}❌ Erreur lors de la création de la base${NC}"
        echo ""
        echo "Essayez manuellement:"
        echo "  psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
        exit 1
    }
fi
echo ""

# Vérifier si l'utilisateur existe
USER_EXISTS=$(run_sql "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | xargs)

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Utilisateur '$DB_USER' existe déjà${NC}"
else
    echo "   Création de l'utilisateur '$DB_USER'..."
    run_sql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'" && echo -e "${GREEN}✅ Utilisateur créé${NC}" || {
        echo -e "${RED}❌ Erreur lors de la création de l'utilisateur${NC}"
        exit 1
    }
fi
echo ""

# Accorder les privilèges
echo "   Attribution des privilèges..."
run_sql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER" && echo -e "${GREEN}✅ Privilèges accordés${NC}"
echo ""

# Activer les extensions
echo "5️⃣  Activation des extensions..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"" 2>/dev/null && \
echo -e "${GREEN}✅ Extension uuid-ossp activée${NC}" || echo -e "${YELLOW}⚠️  uuid-ossp déjà activée${NC}"

psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\"" 2>/dev/null && \
echo -e "${GREEN}✅ Extension pg_trgm activée${NC}" || echo -e "${YELLOW}⚠️  pg_trgm déjà activée${NC}"
echo ""

# Étape 6: Tester la connexion
echo "6️⃣  Test de connexion..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" &> /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connexion réussie avec l'utilisateur '$DB_USER'${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter${NC}"
    exit 1
fi
echo ""

# Étape 7: Créer le fichier .env s'il n'existe pas
echo "7️⃣  Configuration fichier .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé depuis .env.example${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier .env existe déjà${NC}"
fi

# Vérifier la configuration dans .env
if grep -q "DB_DATABASE=dataverse" .env; then
    echo -e "${GREEN}✅ Configuration .env correcte${NC}"
else
    echo -e "${YELLOW}⚠️  Vérifiez la configuration dans .env${NC}"
fi
echo ""

# Résumé
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ PostgreSQL configuré avec succès!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informations de connexion:"
echo "   Host:     $DB_HOST"
echo "   Port:     $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User:     $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🚀 Prochaines étapes:"
echo ""
echo "   1. Tester la base de données:"
echo "      npm run test:db"
echo ""
echo "   2. Démarrer l'API (créera les tables automatiquement):"
echo "      cd apps/api"
echo "      npm install"
echo "      npm run start:dev"
echo ""
echo "   3. Accéder à GraphQL Playground:"
echo "      http://localhost:3001/graphql"
echo ""
echo "   4. Se connecter manuellement à la base:"
echo "      PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
echo ""
