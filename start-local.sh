#!/bin/bash

# Script de démarrage local pour OJ Investment Platform
# Usage: ./start-local.sh [docker|manual]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════"
echo "   OJ Investment Platform - Démarrage Local"
echo "═══════════════════════════════════════════════════"
echo -e "${NC}"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${BLUE}Création du fichier .env depuis .env.example...${NC}"

    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Fichier .env créé${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Éditez le fichier .env avec vos configurations${NC}"
        echo ""
        read -p "Appuyez sur Entrée pour continuer après avoir configuré .env..."
    else
        echo -e "${RED}✗ Fichier .env.example non trouvé${NC}"
        exit 1
    fi
fi

# Déterminer la méthode de démarrage
METHOD=${1:-docker}

if [ "$METHOD" = "docker" ]; then
    echo -e "${BLUE}🐳 Démarrage avec Docker...${NC}"
    echo ""

    # Vérifier si Docker est installé
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker n'est pas installé${NC}"
        echo "Installez Docker depuis: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}✗ Docker Compose n'est pas installé${NC}"
        echo "Installez Docker Compose depuis: https://docs.docker.com/compose/install/"
        exit 1
    fi

    echo -e "${BLUE}📦 Construction des images Docker...${NC}"
    docker-compose build

    echo ""
    echo -e "${BLUE}🚀 Démarrage des services...${NC}"
    docker-compose up -d

    echo ""
    echo -e "${BLUE}⏳ Attente du démarrage des services...${NC}"
    sleep 10

    echo ""
    echo -e "${BLUE}🔍 Vérification de l'état des services...${NC}"
    docker-compose ps

    echo ""
    echo -e "${GREEN}✓ Services démarrés avec succès !${NC}"
    echo ""
    echo -e "${BLUE}📊 Services accessibles sur:${NC}"
    echo -e "  ${GREEN}•${NC} API Backend:     http://localhost:3000"
    echo -e "  ${GREEN}•${NC} GraphQL:         http://localhost:3000/graphql"
    echo -e "  ${GREEN}•${NC} Web Frontend:    http://localhost:3001"
    echo -e "  ${GREEN}•${NC} PostgreSQL:      localhost:5432"
    echo -e "  ${GREEN}•${NC} Redis:           localhost:6379"
    echo ""
    echo -e "${YELLOW}💡 Commandes utiles:${NC}"
    echo -e "  ${BLUE}•${NC} Voir les logs:        docker-compose logs -f"
    echo -e "  ${BLUE}•${NC} Arrêter:              docker-compose down"
    echo -e "  ${BLUE}•${NC} Redémarrer:           docker-compose restart"
    echo ""

elif [ "$METHOD" = "manual" ]; then
    echo -e "${BLUE}💻 Démarrage manuel...${NC}"
    echo ""

    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js n'est pas installé${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}✗ Node.js version 18+ requise (version actuelle: $(node -v))${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

    # Vérifier PostgreSQL
    echo -e "${BLUE}🔍 Vérification de PostgreSQL...${NC}"
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL installé${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL non détecté - assurez-vous qu'il est installé et démarré${NC}"
    fi

    # Vérifier Redis
    echo -e "${BLUE}🔍 Vérification de Redis...${NC}"
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Redis démarré${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis non démarré - démarrage...${NC}"
            if command -v brew &> /dev/null; then
                brew services start redis
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Redis non détecté - assurez-vous qu'il est installé et démarré${NC}"
    fi

    echo ""
    echo -e "${BLUE}📦 Installation des dépendances Backend...${NC}"
    cd apps/api
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✓ Dépendances déjà installées${NC}"
    fi
    cd ../..

    echo ""
    echo -e "${BLUE}📦 Installation des dépendances Frontend...${NC}"
    cd apps/web
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✓ Dépendances déjà installées${NC}"
    fi
    cd ../..

    echo ""
    echo -e "${BLUE}🗄️  Initialisation de la base de données...${NC}"
    if psql -U postgres -d oj_investment_platform -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Base de données accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Création de la base de données...${NC}"
        createdb -U postgres oj_investment_platform || true
        psql -U postgres -d oj_investment_platform -f apps/api/src/database/schema.sql
        psql -U postgres -d oj_investment_platform -f apps/api/src/database/seeds/01-initial-data.sql
        echo -e "${GREEN}✓ Base de données initialisée${NC}"
    fi

    echo ""
    echo -e "${GREEN}✓ Prêt à démarrer !${NC}"
    echo ""
    echo -e "${BLUE}🚀 Démarrez les services dans des terminaux séparés:${NC}"
    echo ""
    echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
    echo -e "  cd apps/api && npm run start:dev"
    echo ""
    echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
    echo -e "  cd apps/web && npm run dev"
    echo ""
    echo -e "${BLUE}Ou utilisez le script de démarrage automatique:${NC}"
    echo -e "  ./start-services.sh"
    echo ""

else
    echo -e "${RED}✗ Méthode inconnue: $METHOD${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  ./start-local.sh docker   ${YELLOW}# Démarrage avec Docker (recommandé)${NC}"
    echo -e "  ./start-local.sh manual   ${YELLOW}# Démarrage manuel${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Démarrage terminé !${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📚 Consultez GUIDE_TEST_LOCAL.md pour plus d'informations${NC}"
echo ""
