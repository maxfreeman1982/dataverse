# 📦 Import/Export Guide - FootMind Engine

Guide complet pour l'import de données CSV et l'export d'analyses en JSON/Excel.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [API REST Endpoints](#api-rest-endpoints)
- [Formats CSV](#formats-csv)
- [Exports JSON](#exports-json)
- [Exports Excel](#exports-excel)
- [Interface Frontend](#interface-frontend)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Exemples d'Intégration](#exemples-dintégration)

---

## 🎯 Vue d'ensemble

Le système Import/Export de FootMind Engine permet de :

- **Importer** des données de tracking et d'événements depuis des fichiers CSV
- **Exporter** des analyses tactiques au format JSON pour intégration API
- **Exporter** des statistiques complètes au format Excel pour le staff technique
- **Intégrer** avec des systèmes tiers via API REST

### Technologies Utilisées

- **Backend** : NestJS + TypeORM + Multer
- **CSV Parsing** : `csv-parser` (streaming), `papaparse` (client)
- **Excel Generation** : `exceljs` (multi-feuilles avec styling)
- **Frontend** : Next.js 14 + React 18

---

## 🔌 API REST Endpoints

### Base URL

```
http://localhost:3000/api/football
```

### Authentification

Tous les endpoints nécessitent un JWT token dans le header :

```http
Authorization: Bearer <your-jwt-token>
```

---

### 1. Import Tracking Data CSV

Importe des données de tracking (positions joueurs, ballon) depuis un fichier CSV.

**Endpoint**
```http
POST /football/matches/:matchId/tracking/import
```

**Parameters**
- `matchId` (path) : ID du match (UUID)

**Body** (multipart/form-data)
```
file: <tracking_data.csv>
```

**Response**
```json
{
  "statusCode": 200,
  "message": "Tracking data imported successfully",
  "data": {
    "imported": 1247,
    "errors": [
      "Row 542: Invalid timestamp format"
    ]
  }
}
```

**cURL Example**
```bash
curl -X POST \
  http://localhost:3000/api/football/matches/abc-123/tracking/import \
  -H "Authorization: Bearer your-token" \
  -F "file=@tracking_data.csv"
```

---

### 2. Import Match Events CSV

Importe des événements de match (passes, tirs, fautes) depuis un fichier CSV.

**Endpoint**
```http
POST /football/matches/:matchId/events/import
```

**Parameters**
- `matchId` (path) : ID du match (UUID)

**Body** (multipart/form-data)
```
file: <match_events.csv>
```

**Response**
```json
{
  "statusCode": 200,
  "message": "Match events imported successfully",
  "data": {
    "imported": 87,
    "errors": []
  }
}
```

---

### 3. Export Analysis JSON

Exporte une analyse tactique complète au format JSON.

**Endpoint**
```http
GET /football/analyses/:analysisId/export/json
```

**Parameters**
- `analysisId` (path) : ID de l'analyse (UUID)

**Response Headers**
```http
Content-Type: application/json
Content-Disposition: attachment; filename=analysis-{id}.json
```

**Response Body**
```json
{
  "metadata": {
    "exportDate": "2025-11-17T10:30:00Z",
    "version": "1.0",
    "analysisId": "abc-123"
  },
  "analysis": {
    "id": "abc-123",
    "matchId": "match-456",
    "type": "tactical",
    "keyFindings": ["High press effective in first 20 min"],
    "recommendations": ["Maintain aggressive midfield pressing"],
    "strengths": [...],
    "weaknesses": [...],
    "tacticalInsights": {...},
    "match": {...}
  }
}
```

**cURL Example**
```bash
curl -X GET \
  http://localhost:3000/api/football/analyses/abc-123/export/json \
  -H "Authorization: Bearer your-token" \
  -o analysis.json
```

---

### 4. Export Match Statistics Excel

Exporte les statistiques complètes d'un match au format Excel (4 feuilles).

**Endpoint**
```http
GET /football/matches/:matchId/export/excel
```

**Parameters**
- `matchId` (path) : ID du match (UUID)

**Response Headers**
```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=match-{id}-statistics.xlsx
```

**Excel Structure**
- **Sheet 1 - Match Info** : Date, équipes, score, lieu
- **Sheet 2 - Statistics** : Possession, tirs, passes, etc.
- **Sheet 3 - Events** : Timeline des événements clés
- **Sheet 4 - Analyses** : Résumé des analyses IA

---

### 5. Export Team Statistics Excel

Exporte les statistiques complètes d'une équipe au format Excel.

**Endpoint**
```http
GET /football/teams/:teamId/export/excel
```

**Parameters**
- `teamId` (path) : ID de l'équipe (UUID)

**Response Headers**
```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=team-{id}-statistics.xlsx
```

**Excel Structure**
- **Sheet 1 - Team Info** : Nom, pays, joueurs
- **Sheet 2 - Players** : Liste des joueurs avec attributs
- **Sheet 3 - Matches** : Historique des matchs
- **Sheet 4 - Statistics** : Stats agrégées (buts, passes, etc.)

---

### 6. API Documentation

Retourne cette documentation au format HTML.

**Endpoint**
```http
GET /football/import-export/docs
```

**Response**
```html
<html>
  <body>
    <h1>FootMind Engine - Import/Export API</h1>
    <!-- Documentation complète -->
  </body>
</html>
```

---

## 📄 Formats CSV

### Tracking Data CSV

Format pour les données de tracking (positions frame-by-frame).

**Structure**
```csv
timestamp,frame,period,ballX,ballY,ballZ,ballSpeed,playerPositions
0.0,0,1,52.5,34.0,0.2,0.0,"[{\"playerId\":\"p1\",\"x\":45.0,\"y\":30.0,\"speed\":0}]"
0.04,1,1,52.7,34.1,0.3,5.2,"[{\"playerId\":\"p1\",\"x\":45.2,\"y\":30.1,\"speed\":2.1}]"
```

**Colonnes**

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| `timestamp` | float | Timestamp en secondes | `0.0`, `0.04`, `1.2` |
| `frame` | int | Numéro de frame | `0`, `1`, `2` |
| `period` | string | Période du match | `1`, `2`, `extra_time` |
| `ballX` | float | Position X du ballon (m) | `-52.5` à `52.5` |
| `ballY` | float | Position Y du ballon (m) | `-34.0` à `34.0` |
| `ballZ` | float | Position Z du ballon (m) | `0.0` à `3.0` |
| `ballSpeed` | float | Vitesse du ballon (m/s) | `0.0` à `30.0` |
| `playerPositions` | JSON | Tableau des positions joueurs | `[{playerId, x, y, speed}]` |

**Format playerPositions JSON**
```json
[
  {
    "playerId": "player-uuid-1",
    "x": 45.0,
    "y": 30.0,
    "speed": 2.5,
    "direction": 45
  },
  {
    "playerId": "player-uuid-2",
    "x": -30.0,
    "y": 15.0,
    "speed": 1.2,
    "direction": 180
  }
]
```

**Exemple Complet**
```csv
timestamp,frame,period,ballX,ballY,ballZ,ballSpeed,playerPositions
0.00,0,1,0.0,0.0,0.2,0.0,"[{\"playerId\":\"abc-123\",\"x\":0.0,\"y\":0.0,\"speed\":0.0}]"
0.04,1,1,0.5,0.2,0.3,5.2,"[{\"playerId\":\"abc-123\",\"x\":0.3,\"y\":0.1,\"speed\":2.1}]"
0.08,2,1,1.2,0.5,0.4,8.1,"[{\"playerId\":\"abc-123\",\"x\":0.8,\"y\":0.3,\"speed\":3.5}]"
```

---

### Match Events CSV

Format pour les événements de match (passes, tirs, cartons, etc.).

**Structure**
```csv
timestamp,minute,period,type,subtype,playerId,teamId,x,y,outcome,metadata
45.2,1,1,pass,short,player-1,team-1,30.5,20.0,success,"{\"recipient\":\"player-2\"}"
120.5,3,1,shot,header,player-3,team-1,50.0,32.0,goal,"{\"assistedBy\":\"player-4\"}"
```

**Colonnes**

| Colonne | Type | Description | Valeurs |
|---------|------|-------------|---------|
| `timestamp` | float | Timestamp en secondes | `0.0` à `6000.0` |
| `minute` | int | Minute du match | `0` à `120` |
| `period` | string | Période | `1`, `2`, `extra_time` |
| `type` | string | Type d'événement | `pass`, `shot`, `foul`, `card`, `substitution` |
| `subtype` | string | Sous-type | `short`, `long`, `header`, `yellow`, `red` |
| `playerId` | UUID | ID du joueur | UUID |
| `teamId` | UUID | ID de l'équipe | UUID |
| `x` | float | Position X (m) | `-52.5` à `52.5` |
| `y` | float | Position Y (m) | `-34.0` à `34.0` |
| `outcome` | string | Résultat | `success`, `fail`, `goal`, `save` |
| `metadata` | JSON | Données supplémentaires | `{recipient, assistedBy, ...}` |

**Types d'Événements**

| Type | Subtypes | Description |
|------|----------|-------------|
| `pass` | `short`, `long`, `cross`, `through` | Passes |
| `shot` | `foot`, `header`, `freekick`, `penalty` | Tirs |
| `foul` | `tactical`, `dangerous`, `handball` | Fautes |
| `card` | `yellow`, `red`, `second_yellow` | Cartons |
| `substitution` | - | Remplacements |
| `save` | `catch`, `parry`, `block` | Arrêts GK |

**Exemple Complet**
```csv
timestamp,minute,period,type,subtype,playerId,teamId,x,y,outcome,metadata
0.0,0,1,kickoff,center,p1,t1,0.0,0.0,success,"{}"
45.2,1,1,pass,short,p2,t1,30.5,20.0,success,"{\"recipient\":\"p3\"}"
120.8,2,1,shot,foot,p4,t1,50.0,32.0,goal,"{\"assistedBy\":\"p2\"}"
180.5,3,1,foul,tactical,p5,t2,-20.0,10.0,yellow,"{}"
```

---

## 📊 Exports JSON

### Structure Analysis JSON

Exemple complet d'export d'analyse au format JSON :

```json
{
  "metadata": {
    "exportDate": "2025-11-17T10:30:00.000Z",
    "version": "1.0",
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "generatedBy": "FootMind Engine"
  },
  "analysis": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "matchId": "660e8400-e29b-41d4-a716-446655440000",
    "userId": "770e8400-e29b-41d4-a716-446655440000",
    "type": "tactical",
    "status": "completed",
    "keyFindings": [
      "High defensive line effectiveness: 78%",
      "Midfield press success rate: 65%",
      "Wing overload strategy created 8 scoring chances"
    ],
    "recommendations": [
      "Maintain aggressive pressing in midfield thirds",
      "Exploit left wing overload against tired fullback",
      "Consider double pivot in last 20 minutes to secure lead"
    ],
    "strengths": [
      "Quick transition from defense to attack (avg 3.2s)",
      "High pass completion in final third (82%)",
      "Effective set-piece execution (3/7 goals)"
    ],
    "weaknesses": [
      "Vulnerable to counter-attacks on right flank",
      "Low aerial duel success (45%)",
      "Poor pressing coordination after 70th minute"
    ],
    "tacticalInsights": {
      "formation": "4-3-3",
      "possessionPercentage": 62.5,
      "pressingIntensity": "high",
      "buildUpStyle": "short_passes",
      "defensiveHeight": 48.5,
      "transitionSpeed": 3.2
    },
    "match": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "date": "2025-11-15T20:00:00.000Z",
      "venue": "Camp Nou",
      "homeTeam": {
        "id": "team-1",
        "name": "FC Barcelona",
        "country": "Spain"
      },
      "awayTeam": {
        "id": "team-2",
        "name": "Real Madrid",
        "country": "Spain"
      },
      "score": {
        "home": 3,
        "away": 1
      },
      "statistics": {
        "possession": { "home": 62, "away": 38 },
        "shots": { "home": 18, "away": 9 },
        "shotsOnTarget": { "home": 8, "away": 3 },
        "passes": { "home": 587, "away": 324 },
        "passAccuracy": { "home": 87.2, "away": 79.5 }
      }
    },
    "createdAt": "2025-11-17T10:15:00.000Z",
    "updatedAt": "2025-11-17T10:30:00.000Z"
  }
}
```

### Utilisation API JSON

**JavaScript/TypeScript**
```typescript
async function fetchAnalysis(analysisId: string, token: string) {
  const response = await fetch(
    `http://localhost:3000/api/football/analyses/${analysisId}/export/json`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('Key Findings:', data.analysis.keyFindings);
  console.log('Recommendations:', data.analysis.recommendations);

  return data;
}
```

**Python**
```python
import requests
import json

def fetch_analysis(analysis_id: str, token: str):
    url = f"http://localhost:3000/api/football/analyses/{analysis_id}/export/json"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    data = response.json()

    print("Key Findings:", data['analysis']['keyFindings'])
    print("Recommendations:", data['analysis']['recommendations'])

    return data
```

---

## 📈 Exports Excel

### Structure Match Statistics Excel

Le fichier Excel généré contient **4 feuilles** avec styling professionnel.

#### Sheet 1 : Match Info

| Field | Value |
|-------|-------|
| Match ID | 660e8400-e29b-41d4-a716-446655440000 |
| Date | 2025-11-15 20:00:00 |
| Venue | Camp Nou |
| Home Team | FC Barcelona |
| Away Team | Real Madrid |
| Final Score | 3 - 1 |
| Status | finished |

#### Sheet 2 : Statistics

| Statistic | Home | Away |
|-----------|------|------|
| Possession (%) | 62 | 38 |
| Shots | 18 | 9 |
| Shots on Target | 8 | 3 |
| Passes | 587 | 324 |
| Pass Accuracy (%) | 87.2 | 79.5 |
| Tackles | 18 | 24 |
| Interceptions | 12 | 8 |
| Corners | 7 | 3 |
| Offsides | 2 | 5 |
| Fouls | 11 | 16 |
| Yellow Cards | 2 | 4 |
| Red Cards | 0 | 0 |

#### Sheet 3 : Events Timeline

| Minute | Period | Type | Subtype | Player | Team | Outcome |
|--------|--------|------|---------|--------|------|---------|
| 0 | 1 | kickoff | center | Player 1 | Home | success |
| 12 | 1 | shot | foot | Lewandowski | Home | goal |
| 23 | 1 | card | yellow | Militao | Away | - |
| 34 | 1 | shot | header | Benzema | Away | goal |
| 45 | 1 | substitution | - | Pedri | Home | - |

#### Sheet 4 : Analyses Summary

| Analysis ID | Type | Status | Key Finding |
|-------------|------|--------|-------------|
| abc-123 | tactical | completed | High press effective |
| def-456 | performance | completed | Wing overload successful |

---

### Structure Team Statistics Excel

Le fichier Excel pour les équipes contient **4 feuilles**.

#### Sheet 1 : Team Info

| Field | Value |
|-------|-------|
| Team ID | team-123 |
| Name | FC Barcelona |
| Country | Spain |
| Founded | 1899 |
| Stadium | Camp Nou |
| Total Players | 25 |

#### Sheet 2 : Players

| Number | Name | Position | Age | Nationality | Goals | Assists |
|--------|------|----------|-----|-------------|-------|---------|
| 9 | Lewandowski | Forward | 35 | Poland | 18 | 5 |
| 10 | Pedri | Midfielder | 21 | Spain | 4 | 12 |
| 1 | Ter Stegen | Goalkeeper | 31 | Germany | 0 | 0 |

#### Sheet 3 : Matches History

| Date | Opponent | Result | Score | Venue |
|------|----------|--------|-------|-------|
| 2025-11-15 | Real Madrid | Win | 3-1 | Home |
| 2025-11-08 | Atletico | Draw | 2-2 | Away |

#### Sheet 4 : Statistics

| Statistic | Value |
|-----------|-------|
| Matches Played | 12 |
| Wins | 8 |
| Draws | 2 |
| Losses | 2 |
| Goals Scored | 28 |
| Goals Conceded | 12 |
| Win Rate (%) | 66.7 |

---

## 🖥️ Interface Frontend

### Page Import/Export

L'interface web est disponible à `/football/import-export` et offre :

**Fonctionnalités**
- Upload CSV tracking data avec drag & drop
- Upload CSV match events
- Download analyses JSON
- Download match statistics Excel
- Download team statistics Excel
- Aperçu des formats CSV
- Affichage des erreurs d'import

**Utilisation**

1. **Sélectionner un Match ID**
   - Entrez l'UUID du match concerné
   - Nécessaire pour import tracking/events

2. **Upload Tracking Data**
   - Cliquez sur "Choisir un fichier"
   - Sélectionnez votre fichier CSV de tracking
   - Cliquez "Upload Tracking Data"
   - Résultat affiché : nombre de lignes importées + erreurs

3. **Upload Match Events**
   - Sélectionnez votre fichier CSV d'événements
   - Cliquez "Upload Match Events"

4. **Export Analysis JSON**
   - Entrez l'Analysis ID
   - Cliquez "Download Analysis JSON"
   - Fichier `analysis-{id}.json` téléchargé

5. **Export Match Excel**
   - Entrez le Match ID
   - Cliquez "Download Match Excel"
   - Fichier `match-{id}-statistics.xlsx` téléchargé

6. **Export Team Excel**
   - Entrez le Team ID
   - Cliquez "Download Team Excel"
   - Fichier `team-{id}-statistics.xlsx` téléchargé

---

## ⚠️ Gestion des Erreurs

### Codes d'Erreur HTTP

| Code | Signification | Action |
|------|---------------|--------|
| 200 | Success | Opération réussie |
| 400 | Bad Request | Vérifier format CSV/paramètres |
| 401 | Unauthorized | Token JWT manquant/invalide |
| 403 | Forbidden | Pas de droits sur cette ressource |
| 404 | Not Found | Match/Analysis/Team inexistant |
| 413 | Payload Too Large | Fichier CSV trop volumineux |
| 500 | Internal Server Error | Erreur serveur, contacter admin |

### Erreurs CSV Import

Le système collecte les erreurs sans arrêter l'import complet.

**Types d'Erreurs**

```json
{
  "imported": 1000,
  "errors": [
    "Row 45: Missing required field 'timestamp'",
    "Row 127: Invalid JSON in playerPositions",
    "Row 234: Timestamp must be a number",
    "Row 456: Invalid period value (expected 1, 2, or extra_time)",
    "Row 789: Player ID does not exist"
  ]
}
```

**Gestion**

```typescript
const result = await importTrackingData(file);

if (result.errors.length > 0) {
  console.warn(`${result.errors.length} errors during import:`);
  result.errors.forEach(error => console.error(error));
}

console.log(`Successfully imported ${result.imported} rows`);
```

### Erreurs Export

**Analysis Not Found**
```json
{
  "statusCode": 404,
  "message": "Analysis not found or access denied",
  "error": "Not Found"
}
```

**Unauthorized Access**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this resource",
  "error": "Forbidden"
}
```

---

## 🔗 Exemples d'Intégration

### Intégration Next.js Client

```typescript
// app/football/analysis/[id]/export/page.tsx
'use client';

import { useState } from 'react';

export default function ExportAnalysisPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);

  const handleExportJSON = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/football/analyses/${params.id}/export/json`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      // Déclenche le téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${params.id}.json`;
      a.click();

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExportJSON} disabled={loading}>
      {loading ? 'Exporting...' : 'Export JSON'}
    </button>
  );
}
```

### Intégration Node.js Backend

```typescript
// Integration with external analytics platform
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function syncMatchDataToExternalPlatform(matchId: string) {
  // 1. Export analysis from FootMind
  const analysisResponse = await axios.get(
    `http://localhost:3000/api/football/analyses/${matchId}/export/json`,
    {
      headers: { Authorization: `Bearer ${process.env.FOOTMIND_TOKEN}` }
    }
  );

  const analysis = analysisResponse.data;

  // 2. Transform data for external platform
  const externalData = {
    matchId: analysis.analysis.matchId,
    date: analysis.analysis.match.date,
    keyInsights: analysis.analysis.keyFindings,
    tacticalMetrics: analysis.analysis.tacticalInsights
  };

  // 3. Send to external platform
  await axios.post(
    'https://external-platform.com/api/matches',
    externalData,
    {
      headers: { 'API-Key': process.env.EXTERNAL_API_KEY }
    }
  );

  console.log('Match data synced successfully');
}
```

### Intégration Python Data Science

```python
import pandas as pd
import requests
from io import BytesIO

def analyze_match_with_pandas(match_id: str, token: str):
    """
    Download match Excel, load with pandas, perform analysis
    """
    # 1. Download Excel file
    url = f"http://localhost:3000/api/football/matches/{match_id}/export/excel"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    # 2. Load Excel into pandas
    excel_file = BytesIO(response.content)

    # Read multiple sheets
    match_info = pd.read_excel(excel_file, sheet_name='Match Info')
    statistics = pd.read_excel(excel_file, sheet_name='Statistics')
    events = pd.read_excel(excel_file, sheet_name='Events')

    # 3. Perform analysis
    print("=== Match Info ===")
    print(match_info)

    print("\n=== Statistics ===")
    print(statistics)

    # Calculate advanced metrics
    home_shots = statistics.loc[statistics['Statistic'] == 'Shots', 'Home'].values[0]
    home_shots_on_target = statistics.loc[statistics['Statistic'] == 'Shots on Target', 'Home'].values[0]
    shot_accuracy = (home_shots_on_target / home_shots) * 100

    print(f"\nHome team shot accuracy: {shot_accuracy:.1f}%")

    # 4. Event analysis
    goals = events[events['Type'] == 'shot'][events['Outcome'] == 'goal']
    print(f"\nTotal goals: {len(goals)}")
    print(goals[['Minute', 'Player', 'Team']])

    return {
        'match_info': match_info,
        'statistics': statistics,
        'events': events,
        'shot_accuracy': shot_accuracy
    }

# Usage
data = analyze_match_with_pandas('match-123', 'your-token')
```

### Intégration Webhooks

```typescript
// Server that receives FootMind analysis and forwards to Slack
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Webhook endpoint called after analysis completion
app.post('/webhooks/analysis-complete', async (req, res) => {
  const { analysisId, matchId } = req.body;

  try {
    // 1. Fetch analysis from FootMind
    const response = await axios.get(
      `http://localhost:3000/api/football/analyses/${analysisId}/export/json`,
      {
        headers: { Authorization: `Bearer ${process.env.FOOTMIND_TOKEN}` }
      }
    );

    const analysis = response.data.analysis;

    // 2. Format for Slack
    const slackMessage = {
      text: `⚽ New Analysis Available for Match ${matchId}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Match:* ${analysis.match.homeTeam.name} vs ${analysis.match.awayTeam.name}\n*Score:* ${analysis.match.score.home}-${analysis.match.score.away}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Key Findings:*\n${analysis.keyFindings.map(f => `• ${f}`).join('\n')}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Recommendations:*\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}`
          }
        }
      ]
    };

    // 3. Send to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, slackMessage);

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

app.listen(3001, () => console.log('Webhook server running on port 3001'));
```

---

## 🔍 Troubleshooting

### Problème : Import CSV échoue avec "Unauthorized"

**Cause** : Token JWT manquant ou expiré

**Solution** :
```typescript
// Vérifier que le token est présent et valide
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}
```

---

### Problème : "Row X: Invalid JSON in playerPositions"

**Cause** : Format JSON invalide dans la colonne playerPositions

**Solution** : Vérifier que le JSON est valide et correctement échappé
```csv
# Incorrect
playerPositions
[{playerId: "abc", x: 10}]

# Correct
playerPositions
"[{\"playerId\":\"abc\",\"x\":10}]"
```

---

### Problème : Excel généré est vide ou corrompu

**Cause** : Match n'a pas de données associées

**Solution** : Vérifier que le match a :
- Des statistiques (`match.statistics`)
- Des événements (`match.events`)
- Au moins une analyse (`match.analyses`)

```typescript
// Vérifier avant export
const match = await matchRepository.findOne({
  where: { id: matchId },
  relations: ['statistics', 'events', 'analyses']
});

if (!match.statistics || !match.events.length) {
  throw new Error('Match has insufficient data for export');
}
```

---

### Problème : Upload bloqué pour fichiers > 10MB

**Cause** : Limite Multer par défaut

**Solution** : Augmenter la limite dans le controller
```typescript
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
  })
)
```

---

## 📚 Ressources

### Documentation Externe

- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [csv-parser NPM](https://www.npmjs.com/package/csv-parser)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Middleware](https://github.com/expressjs/multer)

### Outils Utiles

- **CSV Validator** : [csvlint.io](https://csvlint.io/)
- **JSON Validator** : [jsonlint.com](https://jsonlint.com/)
- **Excel Viewer** : LibreOffice Calc, Microsoft Excel

### Support

Pour toute question ou problème :
- GitHub Issues : [github.com/yourrepo/issues](https://github.com/yourrepo/issues)
- Email : support@footmindengine.com

---

**Version** : 1.0
**Dernière mise à jour** : 17 novembre 2025
**Auteur** : FootMind Engine Team
