# 🪟 Guide d'Installation Windows - FootMind Engine

Guide spécifique pour configurer et tester FootMind Engine sur Windows.

---

## ✅ Prérequis

- ✅ **Node.js 18+** : https://nodejs.org/
- ✅ **pnpm** : `npm install -g pnpm`
- ✅ **Git** : https://git-scm.com/download/win
- ✅ **Docker Desktop** (recommandé) : https://www.docker.com/products/docker-desktop/

---

## 🔧 Étape 1 : Installation Docker Desktop

### 1.1 Télécharger et Installer

1. Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Exécutez l'installeur
3. **Important** : Activez WSL 2 si demandé
4. Redémarrez Windows si nécessaire

### 1.2 Vérifier l'installation

Ouvrez PowerShell ou CMD :

```bash
docker --version
# Docker version 24.0.x, build xxxxx

docker compose version
# Docker Compose version v2.x.x
```

### 1.3 Démarrer Docker Desktop

1. Lancez **Docker Desktop** depuis le menu Démarrer
2. Attendez que l'icône Docker dans la barre des tâches soit verte
3. Vérifiez que Docker fonctionne :

```bash
docker ps
# Doit afficher une liste vide (pas d'erreur)
```

---

## 📦 Étape 2 : Cloner et Installer le Projet

### 2.1 Cloner le repository

```bash
# Dans PowerShell ou CMD
cd C:\Users\VotreNom\Documents
git clone https://github.com/votre-repo/dataverse.git
cd dataverse
```

### 2.2 Installer les dépendances

```bash
# Installer pnpm si ce n'est pas fait
npm install -g pnpm

# Installer les dépendances du projet
pnpm install
```

Attendez que l'installation se termine (peut prendre 2-5 minutes).

---

## 🗄️ Étape 3 : Démarrer PostgreSQL

### Option A : Avec Docker (Recommandé)

```bash
# À la racine du projet
docker compose up -d

# Vérifier que PostgreSQL tourne
docker ps
```

Vous devriez voir :
```
CONTAINER ID   IMAGE                  STATUS    PORTS
abc123def456   postgres:15-alpine     Up        0.0.0.0:5432->5432/tcp
```

### Option B : Sans Docker (PostgreSQL natif)

Si Docker ne fonctionne pas, installez PostgreSQL directement :

1. **Téléchargez** : https://www.postgresql.org/download/windows/
2. **Installez** avec l'installeur :
   - Port : 5432
   - Mot de passe : `postgres`
   - Locale : Default
3. **Ouvrez pgAdmin** ou **SQL Shell (psql)**
4. **Créez la base de données** :

```sql
-- Dans psql ou pgAdmin
CREATE DATABASE dataverse;

-- Vérifier
\l
```

---

## 🚀 Étape 4 : Démarrer les Serveurs

Vous avez besoin de **2 terminaux** (PowerShell ou CMD).

### Terminal 1 : Backend API

```bash
cd C:\Users\VotreNom\Documents\dataverse\apps\api
pnpm dev
```

Attendez de voir :
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3001
```

**🔥 Si erreur "Cannot connect to database"** :
- Vérifiez que PostgreSQL tourne : `docker ps`
- Vérifiez le fichier `.env.local` dans `apps/api/`
- Voir section Troubleshooting ci-dessous

### Terminal 2 : Frontend Web

```bash
cd C:\Users\VotreNom\Documents\dataverse\apps\web
pnpm dev
```

Attendez de voir :
```
✓ Ready in 3.2s
- Local: http://localhost:3000
```

---

## 🧪 Étape 5 : Tester le Système

### Option A : Script Automatisé (Bash requis)

Si vous avez **Git Bash** installé :

```bash
# Dans Git Bash
./scripts/quick-test.sh
```

### Option B : Tests Manuels (Recommandé sur Windows)

#### 5.1 Créer un compte utilisateur

1. Ouvrez http://localhost:3001/graphql
2. Exécutez cette mutation :

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

3. **Copiez le `access_token`** retourné

#### 5.2 Configurer le token

1. En bas à gauche dans GraphQL Playground, cliquez sur **"HTTP HEADERS"**
2. Ajoutez :

```json
{
  "Authorization": "Bearer VOTRE_TOKEN_ICI"
}
```

#### 5.3 Seeder les données

```graphql
mutation {
  seedFootballData
}
```

Cela va créer :
- 4 équipes (Barcelona, Real Madrid, Man City, Bayern)
- 30+ joueurs
- 12 matchs
- 8 analyses

#### 5.4 Récupérer un Match ID

```graphql
query {
  matches {
    id
    homeTeam { name }
    awayTeam { name }
  }
}
```

Copiez un `id` de match.

#### 5.5 Tester l'interface web

1. Ouvrez http://localhost:3000/football/import-export
2. Collez le **Match ID**
3. Uploadez les fichiers CSV depuis `test-data/`
4. Testez les téléchargements Excel/JSON

---

## 🐛 Troubleshooting Windows

### ❌ Erreur : "open //./pipe/dockerDesktopLinuxEngine"

**Cause** : Docker Desktop n'est pas démarré

**Solution** :
1. Lancez **Docker Desktop** depuis le menu Démarrer
2. Attendez que l'icône soit verte
3. Réessayez `docker compose up -d`

---

### ❌ Erreur : "Cannot connect to database"

**Cause** : Credentials PostgreSQL incorrects

**Solution 1** : Vérifier le fichier `.env.local`

Créez le fichier `apps/api/.env.local` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dataverse
DB_SSL=false
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
PORT=3001
```

**Solution 2** : Vérifier PostgreSQL

```bash
# Avec Docker
docker ps | findstr postgres

# Sans Docker (tester la connexion)
psql -U postgres -d dataverse
```

---

### ❌ Erreur : "Port 3000 is already in use"

**Cause** : Un autre processus utilise le port

**Solution** :

```bash
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID 12345 /F
```

---

### ❌ Erreur : "pnpm : command not found"

**Cause** : pnpm n'est pas installé globalement

**Solution** :

```bash
npm install -g pnpm

# Vérifier
pnpm --version
```

---

### ❌ Erreur : "jq : command not found" (pour script bash)

**Cause** : jq n'est pas installé (nécessaire pour quick-test.sh)

**Solution** :

Option 1 - Installer jq :
```bash
# Avec Chocolatey
choco install jq

# Ou télécharger : https://stedolan.github.io/jq/download/
```

Option 2 - Utiliser les tests manuels (voir section 5.5)

---

### ❌ Erreur : Scripts PowerShell désactivés

**Cause** : Politique d'exécution PowerShell

**Solution** :

```powershell
# Dans PowerShell en tant qu'Administrateur
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Confirmer avec "Y"
```

---

## 📁 Structure des Chemins Windows

```
C:\Users\VotreNom\Documents\dataverse\
├── apps\
│   ├── api\
│   │   ├── .env.local          ← Créer ce fichier
│   │   └── src\
│   └── web\
├── test-data\
│   ├── tracking_data_sample.csv
│   └── match_events_sample.csv
├── scripts\
│   └── quick-test.sh            ← Nécessite Git Bash
├── docker-compose.yml
└── README_TEST.md
```

---

## 🌐 URLs de Test

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application web |
| **Dashboard** | http://localhost:3000/football | Dashboard FootMind |
| **Import/Export** | http://localhost:3000/football/import-export | Interface upload |
| **GraphQL** | http://localhost:3001/graphql | Playground API |
| **Health Check** | http://localhost:3001/health | Statut API |

---

## 📝 Commandes Utiles Windows

### Gestion Docker

```bash
# Démarrer PostgreSQL
docker compose up -d

# Arrêter PostgreSQL
docker compose down

# Voir les logs
docker compose logs -f postgres

# Redémarrer
docker compose restart

# Supprimer tout (attention : efface les données)
docker compose down -v
```

### Gestion des Processus

```bash
# Voir les processus Node
tasklist | findstr node

# Tuer tous les processus Node
taskkill /IM node.exe /F

# Voir les ports utilisés
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### PostgreSQL (avec Docker)

```bash
# Se connecter à la base
docker exec -it dataverse-postgres psql -U postgres -d dataverse

# Dans psql :
\dt              # Lister les tables
\d matches       # Décrire la table matches
\q               # Quitter
```

---

## 🎯 Checklist de Vérification

Cochez au fur et à mesure :

### Installation
- [ ] Node.js 18+ installé
- [ ] pnpm installé (`pnpm --version`)
- [ ] Docker Desktop installé et démarré
- [ ] Git installé
- [ ] Repository cloné

### Configuration
- [ ] `pnpm install` exécuté à la racine
- [ ] Fichier `apps/api/.env.local` créé
- [ ] PostgreSQL démarré (`docker ps`)
- [ ] Base de données `dataverse` créée

### Serveurs
- [ ] API démarrée sur port 3001
- [ ] Frontend démarré sur port 3000
- [ ] http://localhost:3001/health répond "OK"
- [ ] http://localhost:3000 accessible

### Données
- [ ] Compte utilisateur créé
- [ ] Token JWT récupéré
- [ ] Données seedées (`seedFootballData`)
- [ ] Match ID récupéré

### Tests
- [ ] CSV tracking data uploadé
- [ ] CSV match events uploadé
- [ ] JSON analysis téléchargé
- [ ] Excel téléchargé et ouvert

---

## 💡 Conseils Windows

### Utiliser Git Bash pour les scripts

Git Bash fournit un environnement Unix-like sur Windows :

```bash
# Lancer Git Bash (depuis le menu Démarrer)
cd /c/Users/VotreNom/Documents/dataverse
./scripts/quick-test.sh
```

### Utiliser Windows Terminal

Windows Terminal offre une meilleure expérience :

1. Installez depuis le Microsoft Store
2. Ouvrez plusieurs onglets :
   - Onglet 1 : PowerShell pour l'API
   - Onglet 2 : PowerShell pour le Frontend
   - Onglet 3 : Git Bash pour les tests

### Chemins avec espaces

Si votre chemin contient des espaces :

```bash
# Utilisez des guillemets
cd "C:\Users\Mon Nom\Documents\dataverse"
```

---

## 🆘 Besoin d'Aide ?

### Documentation

- **Guide Rapide** : `README_TEST.md`
- **Guide Détaillé** : `TEST_GUIDE.md`
- **API Documentation** : `IMPORT_EXPORT_GUIDE.md`

### Commandes de Diagnostic

```bash
# Vérifier l'environnement
node --version
pnpm --version
docker --version

# Vérifier les ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Vérifier Docker
docker ps
docker compose ps
docker compose logs postgres
```

### Logs

```bash
# Logs API (dans le terminal où l'API tourne)
# Les erreurs s'affichent en rouge

# Logs Docker
docker compose logs -f postgres

# Logs Frontend
# Regardez le terminal où Next.js tourne
```

---

## 🎉 Résultat Final

Après avoir suivi ce guide, vous devriez avoir :

```
✓ Docker Desktop démarré
✓ PostgreSQL running dans Docker
✓ API NestJS sur http://localhost:3001
✓ Frontend Next.js sur http://localhost:3000
✓ Données de test seedées
✓ CSV importés avec succès
✓ Fichiers Excel/JSON téléchargés
```

**🚀 Prêt à tester FootMind Engine sur Windows !**

---

**Version** : 1.0
**Système** : Windows 10/11
**Dernière mise à jour** : 17 novembre 2025
