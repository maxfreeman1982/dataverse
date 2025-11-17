# 🧪 Guide de Test - FootMind Engine Import/Export

Guide complet pour tester le système Import/Export en local avec Claude Code.

---

## 📋 Prérequis

- Node.js 18+
- Docker (pour PostgreSQL)
- pnpm installé
- Claude Code sur votre terminal

---

## 🚀 Étape 1 : Démarrer l'environnement

### 1.1 Démarrer PostgreSQL

```bash
# Dans le répertoire racine du projet
cd /path/to/dataverse

# Démarrer PostgreSQL avec Docker
docker compose up -d

# Vérifier que PostgreSQL est démarré
docker ps | grep postgres
```

Vous devriez voir :
```
dataverse-postgres   postgres:15-alpine   Up   0.0.0.0:5432->5432/tcp
```

### 1.2 Créer la base de données

```bash
# Se connecter à PostgreSQL
docker exec -it dataverse-postgres psql -U postgres

# Dans psql, exécuter :
CREATE DATABASE dataverse;
\q
```

### 1.3 Démarrer les serveurs

**Terminal 1 - Backend API :**
```bash
cd apps/api
pnpm dev
```

Attendez de voir :
```
[Nest] LOG [NestApplication] Nest application successfully started
```

**Terminal 2 - Frontend Web :**
```bash
cd apps/web
pnpm dev
```

Attendez de voir :
```
✓ Ready in 3.2s
- Local: http://localhost:3000
```

---

## 🌱 Étape 2 : Créer des données de test

### Option A : Via GraphQL Playground

1. Ouvrez http://localhost:3001/graphql

2. Inscrivez-vous :
```graphql
mutation {
  register(
    registerInput: {
      email: "test@footmind.com"
      username: "testuser"
      password: "Test123!"
    }
  ) {
    access_token
    user {
      id
      email
    }
  }
}
```

3. Copiez le `access_token` et ajoutez-le dans HTTP HEADERS :
```json
{
  "Authorization": "Bearer VOTRE_TOKEN_ICI"
}
```

4. Seedez les données :
```graphql
mutation {
  seedFootballData
}
```

Cela va créer :
- ✅ 4 équipes (Barcelona, Real Madrid, Man City, Bayern)
- ✅ 30+ joueurs
- ✅ 12 matchs
- ✅ 8 analyses tactiques

### Option B : Script automatisé

```bash
# Créer un script de seed rapide
cat > seed.sh << 'EOF'
#!/bin/bash

# S'inscrire et récupérer le token
TOKEN=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { register(registerInput: {email: \"test@footmind.com\", username: \"testuser\", password: \"Test123!\"}) { access_token } }"}' \
  | jq -r '.data.register.access_token')

echo "Token: $TOKEN"

# Seeder les données
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"mutation { seedFootballData }"}'

echo "✅ Données seedées avec succès"
EOF

chmod +x seed.sh
./seed.sh
```

---

## 📊 Étape 3 : Tester l'interface Web

### 3.1 Accéder au Dashboard

1. Ouvrez http://localhost:3000/football
2. Vous verrez toutes les cartes de fonctionnalités
3. Cliquez sur **"Import/Export"**

### 3.2 Page Import/Export

URL : http://localhost:3000/football/import-export

Vous verrez :
- 📤 Section **Import CSV**
- 📥 Section **Export JSON/Excel**
- 📝 Exemples de formats CSV

---

## 🧪 Étape 4 : Tester l'Import CSV

### 4.1 Trouver un Match ID

**Via GraphQL :**
```graphql
query {
  matches {
    id
    date
    homeTeam { name }
    awayTeam { name }
  }
}
```

Copiez un `id` de match (format UUID).

### 4.2 Importer Tracking Data

**Fichier d'exemple :** `/test-data/tracking_data_sample.csv`

1. Sur la page Import/Export :
   - Entrez le **Match ID**
   - Cliquez sur "Choisir un fichier" sous "Upload Tracking Data CSV"
   - Sélectionnez `test-data/tracking_data_sample.csv`
   - Cliquez **"Upload Tracking Data"**

2. Résultat attendu :
```json
{
  "statusCode": 200,
  "message": "Tracking data imported successfully",
  "data": {
    "imported": 21,
    "errors": []
  }
}
```

### 4.3 Importer Match Events

**Fichier d'exemple :** `/test-data/match_events_sample.csv`

1. Sur la même page :
   - Cliquez sur "Choisir un fichier" sous "Upload Match Events CSV"
   - Sélectionnez `test-data/match_events_sample.csv`
   - Cliquez **"Upload Match Events"**

2. Résultat attendu :
```json
{
  "statusCode": 200,
  "message": "Match events imported successfully",
  "data": {
    "imported": 25,
    "errors": []
  }
}
```

---

## 📥 Étape 5 : Tester l'Export

### 5.1 Export Analysis JSON

1. Trouver un Analysis ID :
```graphql
query {
  analyses {
    id
    type
    keyFindings
  }
}
```

2. Sur la page Import/Export :
   - Entrez l'**Analysis ID**
   - Cliquez **"Download Analysis JSON"**

3. Le fichier `analysis-{id}.json` sera téléchargé

4. Vérifier le contenu :
```bash
cat ~/Downloads/analysis-*.json | jq '.analysis.keyFindings'
```

### 5.2 Export Match Excel

1. Sur la page Import/Export :
   - Entrez le **Match ID**
   - Cliquez **"Download Match Excel"**

2. Le fichier `match-{id}-statistics.xlsx` sera téléchargé

3. Ouvrir dans Excel/LibreOffice :
   - **Sheet 1** : Match Info (date, équipes, score)
   - **Sheet 2** : Statistics (possession, tirs, passes)
   - **Sheet 3** : Events (timeline des événements)
   - **Sheet 4** : Analyses (résumé IA)

### 5.3 Export Team Excel

1. Trouver un Team ID :
```graphql
query {
  teams {
    id
    name
    country
  }
}
```

2. Sur la page Import/Export :
   - Entrez le **Team ID**
   - Cliquez **"Download Team Excel"**

3. Le fichier `team-{id}-statistics.xlsx` sera téléchargé

4. Vérifier les 4 feuilles :
   - **Team Info** : Nom, pays, joueurs
   - **Players** : Liste complète avec attributs
   - **Matches** : Historique
   - **Statistics** : Stats agrégées

---

## 🔬 Étape 6 : Tests API REST (optionnel)

### 6.1 Import via cURL

**Tracking Data :**
```bash
# Récupérer votre token
TOKEN="votre_token_jwt"
MATCH_ID="uuid_du_match"

curl -X POST \
  http://localhost:3001/football/matches/$MATCH_ID/tracking/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-data/tracking_data_sample.csv"
```

**Match Events :**
```bash
curl -X POST \
  http://localhost:3001/football/matches/$MATCH_ID/events/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-data/match_events_sample.csv"
```

### 6.2 Export via cURL

**Analysis JSON :**
```bash
ANALYSIS_ID="uuid_de_lanalyse"

curl -X GET \
  http://localhost:3001/football/analyses/$ANALYSIS_ID/export/json \
  -H "Authorization: Bearer $TOKEN" \
  -o analysis.json

# Vérifier
cat analysis.json | jq '.analysis.keyFindings'
```

**Match Excel :**
```bash
curl -X GET \
  http://localhost:3001/football/matches/$MATCH_ID/export/excel \
  -H "Authorization: Bearer $TOKEN" \
  -o match-stats.xlsx

# Vérifier que c'est un fichier Excel valide
file match-stats.xlsx
```

---

## ✅ Checklist de Test

Cochez au fur et à mesure :

### Setup
- [ ] PostgreSQL démarré avec Docker
- [ ] Base de données `dataverse` créée
- [ ] Backend API démarré (port 3001)
- [ ] Frontend Web démarré (port 3000)

### Seed Data
- [ ] Compte utilisateur créé
- [ ] Token JWT récupéré
- [ ] Mutation `seedFootballData` exécutée
- [ ] Données visibles dans GraphQL Playground

### Import CSV
- [ ] Match ID récupéré
- [ ] Tracking data uploadé avec succès
- [ ] Match events uploadé avec succès
- [ ] Résultats affichés sans erreurs

### Export JSON
- [ ] Analysis ID récupéré
- [ ] Fichier JSON téléchargé
- [ ] Structure JSON valide vérifiée

### Export Excel
- [ ] Match Excel téléchargé
- [ ] 4 feuilles présentes et complètes
- [ ] Team Excel téléchargé
- [ ] Données correctes dans toutes les feuilles

### API REST (optionnel)
- [ ] Import CSV via cURL fonctionnel
- [ ] Export JSON via cURL fonctionnel
- [ ] Export Excel via cURL fonctionnel

---

## 🐛 Troubleshooting

### Erreur : "Cannot connect to database"

**Cause :** PostgreSQL n'est pas démarré

**Solution :**
```bash
docker compose up -d
docker ps | grep postgres
```

---

### Erreur : "Unauthorized" lors de l'upload

**Cause :** Token JWT invalide ou expiré

**Solution :**
1. Se reconnecter via GraphQL
2. Récupérer un nouveau token
3. Mettre à jour le header Authorization

---

### Erreur : "Match not found"

**Cause :** Match ID incorrect ou pas de données seedées

**Solution :**
```graphql
query {
  matches {
    id
    homeTeam { name }
    awayTeam { name }
  }
}
```
Copiez un ID valide.

---

### Upload CSV ne retourne rien

**Cause :** Fichier CSV mal formaté

**Solution :**
- Vérifiez que le CSV utilise des virgules comme séparateurs
- Vérifiez que les guillemets sont échappés correctement
- Utilisez les fichiers d'exemple fournis dans `/test-data/`

---

### Excel généré est vide

**Cause :** Match n'a pas de statistics/events

**Solution :**
1. Uploadez d'abord des tracking data et events
2. Créez une analyse pour ce match
3. Réessayez l'export

---

## 📚 Ressources

### Documentation
- **API REST** : `/IMPORT_EXPORT_GUIDE.md`
- **3D Visualization** : `/VISUALIZATION_3D_GUIDE.md`
- **Football Module** : `/FOOTBALL_MODULE_README.md`

### Endpoints
- **GraphQL Playground** : http://localhost:3001/graphql
- **Frontend Web** : http://localhost:3000
- **API REST** : http://localhost:3001/football/*

### Fichiers de test
- **Tracking Data** : `test-data/tracking_data_sample.csv`
- **Match Events** : `test-data/match_events_sample.csv`

---

## 🎉 Résultat Attendu

À la fin de ces tests, vous devriez avoir :

✅ **21 tracking data points** importés pour un match
✅ **25 match events** importés
✅ **1 fichier JSON** d'analyse téléchargé avec métadonnées complètes
✅ **1 fichier Excel** de match avec 4 feuilles de stats
✅ **1 fichier Excel** d'équipe avec infos joueurs

---

## 💡 Prochaines Étapes

Après avoir testé Import/Export, explorez :

1. **3D Visualization** : http://localhost:3000/football/visualization3d
   - Terrain 3D interactif avec Three.js
   - Heat maps volumétriques
   - Trajectoires et replays

2. **Analytics Dashboard** : http://localhost:3000/football/dashboard
   - Graphiques Recharts
   - Comparaisons tactiques
   - Métriques avancées

3. **Training Generator** : http://localhost:3000/football/training
   - Plans d'entraînement IA
   - Exercices personnalisés
   - Progression tracking

---

**Besoin d'aide ?** Consultez `/IMPORT_EXPORT_GUIDE.md` pour la documentation complète de l'API.

**Bon test ! 🚀⚽**
