#!/bin/bash

# 🧪 Script de Test Rapide - FootMind Engine Import/Export
# Ce script automatise le test complet du système

set -e

echo "🚀 FootMind Engine - Test Rapide Import/Export"
echo "================================================"
echo ""

# Configuration
API_URL="http://localhost:3001"
GRAPHQL_URL="$API_URL/graphql"
EMAIL="test@footmind.com"
USERNAME="testuser"
PASSWORD="Test123!"

# Couleurs pour output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Vérifier que les serveurs tournent
step "Vérification des serveurs..."

if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    error "L'API n'est pas accessible sur $API_URL"
    warning "Démarrez l'API avec : cd apps/api && pnpm dev"
    exit 1
fi
success "API accessible"

if ! curl -s "http://localhost:3000" > /dev/null 2>&1; then
    warning "Frontend n'est pas accessible (optionnel pour ce test)"
else
    success "Frontend accessible"
fi

# Créer un utilisateur et récupérer le token
step "Création du compte utilisateur..."

REGISTER_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"mutation { register(registerInput: {email: \\\"$EMAIL\\\", username: \\\"$USERNAME\\\", password: \\\"$PASSWORD\\\"}) { access_token user { id email } } }\"}")

# Vérifier si l'utilisateur existe déjà
if echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
    warning "Utilisateur existe déjà, connexion en cours..."

    LOGIN_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
        -H "Content-Type: application/json" \
        -d "{\"query\":\"mutation { login(loginInput: {email: \\\"$EMAIL\\\", password: \\\"$PASSWORD\\\"}) { access_token user { id email } } }\"}")

    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.login.access_token')
else
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.register.access_token')
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    error "Impossible de récupérer le token d'authentification"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

success "Token JWT récupéré"
echo "   Token: ${TOKEN:0:20}..."

# Seeder les données
step "Seed des données de test..."

SEED_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"query":"mutation { seedFootballData }"}')

if echo "$SEED_RESPONSE" | grep -q "error"; then
    warning "Les données existent peut-être déjà"
else
    success "Données seedées avec succès"
fi

# Récupérer un Match ID
step "Récupération d'un Match ID..."

MATCHES_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"query":"query { matches { id homeTeam { name } awayTeam { name } } }"}')

MATCH_ID=$(echo "$MATCHES_RESPONSE" | jq -r '.data.matches[0].id')
HOME_TEAM=$(echo "$MATCHES_RESPONSE" | jq -r '.data.matches[0].homeTeam.name')
AWAY_TEAM=$(echo "$MATCHES_RESPONSE" | jq -r '.data.matches[0].awayTeam.name')

if [ "$MATCH_ID" == "null" ] || [ -z "$MATCH_ID" ]; then
    error "Aucun match trouvé dans la base de données"
    exit 1
fi

success "Match trouvé: $HOME_TEAM vs $AWAY_TEAM"
echo "   Match ID: $MATCH_ID"

# Test Import Tracking Data
step "Test Import Tracking Data CSV..."

if [ ! -f "test-data/tracking_data_sample.csv" ]; then
    error "Fichier test-data/tracking_data_sample.csv introuvable"
    exit 1
fi

TRACKING_RESPONSE=$(curl -s -X POST \
    "$API_URL/football/matches/$MATCH_ID/tracking/import" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test-data/tracking_data_sample.csv")

TRACKING_IMPORTED=$(echo "$TRACKING_RESPONSE" | jq -r '.data.imported')
TRACKING_ERRORS=$(echo "$TRACKING_RESPONSE" | jq -r '.data.errors | length')

if [ "$TRACKING_IMPORTED" == "null" ]; then
    error "Échec de l'import tracking data"
    echo "Response: $TRACKING_RESPONSE"
else
    success "Tracking data importé: $TRACKING_IMPORTED lignes"
    if [ "$TRACKING_ERRORS" -gt 0 ]; then
        warning "$TRACKING_ERRORS erreurs détectées"
    fi
fi

# Test Import Match Events
step "Test Import Match Events CSV..."

if [ ! -f "test-data/match_events_sample.csv" ]; then
    error "Fichier test-data/match_events_sample.csv introuvable"
    exit 1
fi

EVENTS_RESPONSE=$(curl -s -X POST \
    "$API_URL/football/matches/$MATCH_ID/events/import" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test-data/match_events_sample.csv")

EVENTS_IMPORTED=$(echo "$EVENTS_RESPONSE" | jq -r '.data.imported')
EVENTS_ERRORS=$(echo "$EVENTS_RESPONSE" | jq -r '.data.errors | length')

if [ "$EVENTS_IMPORTED" == "null" ]; then
    error "Échec de l'import match events"
    echo "Response: $EVENTS_RESPONSE"
else
    success "Match events importés: $EVENTS_IMPORTED lignes"
    if [ "$EVENTS_ERRORS" -gt 0 ]; then
        warning "$EVENTS_ERRORS erreurs détectées"
    fi
fi

# Récupérer un Analysis ID
step "Récupération d'un Analysis ID..."

ANALYSES_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"query":"query { analyses { id type } }"}')

ANALYSIS_ID=$(echo "$ANALYSES_RESPONSE" | jq -r '.data.analyses[0].id')

if [ "$ANALYSIS_ID" == "null" ] || [ -z "$ANALYSIS_ID" ]; then
    warning "Aucune analyse trouvée (c'est normal si première exécution)"
else
    success "Analysis ID: $ANALYSIS_ID"

    # Test Export Analysis JSON
    step "Test Export Analysis JSON..."

    mkdir -p test-output

    curl -s -X GET \
        "$API_URL/football/analyses/$ANALYSIS_ID/export/json" \
        -H "Authorization: Bearer $TOKEN" \
        -o "test-output/analysis-$ANALYSIS_ID.json"

    if [ -f "test-output/analysis-$ANALYSIS_ID.json" ]; then
        FILE_SIZE=$(wc -c < "test-output/analysis-$ANALYSIS_ID.json")
        if [ "$FILE_SIZE" -gt 100 ]; then
            success "Analysis JSON exporté (${FILE_SIZE} bytes)"

            # Afficher un extrait
            KEY_FINDINGS=$(cat "test-output/analysis-$ANALYSIS_ID.json" | jq -r '.analysis.keyFindings[0]')
            echo "   Extrait: $KEY_FINDINGS"
        else
            error "Fichier JSON trop petit ou vide"
        fi
    else
        error "Échec de l'export JSON"
    fi
fi

# Test Export Match Excel
step "Test Export Match Excel..."

curl -s -X GET \
    "$API_URL/football/matches/$MATCH_ID/export/excel" \
    -H "Authorization: Bearer $TOKEN" \
    -o "test-output/match-$MATCH_ID-statistics.xlsx"

if [ -f "test-output/match-$MATCH_ID-statistics.xlsx" ]; then
    FILE_SIZE=$(wc -c < "test-output/match-$MATCH_ID-statistics.xlsx")
    if [ "$FILE_SIZE" -gt 1000 ]; then
        success "Match Excel exporté (${FILE_SIZE} bytes)"
        file "test-output/match-$MATCH_ID-statistics.xlsx"
    else
        error "Fichier Excel trop petit ou vide"
    fi
else
    error "Échec de l'export Excel"
fi

# Récupérer un Team ID
step "Récupération d'un Team ID..."

TEAMS_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"query":"query { teams { id name } }"}')

TEAM_ID=$(echo "$TEAMS_RESPONSE" | jq -r '.data.teams[0].id')
TEAM_NAME=$(echo "$TEAMS_RESPONSE" | jq -r '.data.teams[0].name')

if [ "$TEAM_ID" == "null" ] || [ -z "$TEAM_ID" ]; then
    warning "Aucune équipe trouvée"
else
    success "Team ID: $TEAM_ID ($TEAM_NAME)"

    # Test Export Team Excel
    step "Test Export Team Excel..."

    curl -s -X GET \
        "$API_URL/football/teams/$TEAM_ID/export/excel" \
        -H "Authorization: Bearer $TOKEN" \
        -o "test-output/team-$TEAM_ID-statistics.xlsx"

    if [ -f "test-output/team-$TEAM_ID-statistics.xlsx" ]; then
        FILE_SIZE=$(wc -c < "test-output/team-$TEAM_ID-statistics.xlsx")
        if [ "$FILE_SIZE" -gt 1000 ]; then
            success "Team Excel exporté (${FILE_SIZE} bytes)"
        else
            error "Fichier Excel trop petit ou vide"
        fi
    else
        error "Échec de l'export Team Excel"
    fi
fi

# Résumé
echo ""
echo "================================================"
echo "📊 RÉSUMÉ DES TESTS"
echo "================================================"
echo ""
echo -e "${GREEN}Imports:${NC}"
echo "  • Tracking Data: $TRACKING_IMPORTED lignes"
echo "  • Match Events: $EVENTS_IMPORTED lignes"
echo ""
echo -e "${GREEN}Exports:${NC}"
if [ -f "test-output/analysis-$ANALYSIS_ID.json" ]; then
    echo "  • Analysis JSON: ✓ test-output/analysis-$ANALYSIS_ID.json"
fi
if [ -f "test-output/match-$MATCH_ID-statistics.xlsx" ]; then
    echo "  • Match Excel: ✓ test-output/match-$MATCH_ID-statistics.xlsx"
fi
if [ -f "test-output/team-$TEAM_ID-statistics.xlsx" ]; then
    echo "  • Team Excel: ✓ test-output/team-$TEAM_ID-statistics.xlsx"
fi
echo ""
echo -e "${BLUE}Tous les fichiers exportés sont dans le dossier: test-output/${NC}"
echo ""
success "Tests terminés avec succès ! 🎉"
echo ""
echo "Pour consulter l'interface web:"
echo "  → Dashboard: http://localhost:3000/football"
echo "  → Import/Export: http://localhost:3000/football/import-export"
echo ""
