# 🚀 Démarrage Projet OJ Investment - Claude CLI Local

## 📥 ÉTAPE 1 : Import du Projet

```bash
# Si le projet est déjà sur votre machine
cd /chemin/vers/dataverse

# Ou cloner depuis GitHub
git clone https://github.com/votre-username/dataverse.git
cd dataverse

# Vérifier la branche
git branch
git checkout claude/start-new-project-0159hDkR8VSsXZFXUax2e8Yn
```

---

## ⚙️ ÉTAPE 2 : Configuration Environnement

### Créer le fichier .env

```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec vos configurations
nano .env
# Ou avec votre éditeur préféré
code .env
```

### Configuration Minimale .env

```env
# Base de données (Docker local)
POSTGRES_DB=oj_investment_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oj_investment_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT (générer des secrets sécurisés)
JWT_SECRET=votre-secret-jwt-change-moi
JWT_REFRESH_SECRET=votre-refresh-secret-change-moi

# Ports
API_PORT=3000
WEB_PORT=3001

# Mode développement
NODE_ENV=development

# Services optionnels (laisser vide pour test local)
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
AWS_ACCESS_KEY_ID=
FIREBASE_PROJECT_ID=
SENTRY_DSN=
```

---

## 🐳 ÉTAPE 3 : Démarrage avec Docker (RECOMMANDÉ)

### Méthode Automatique (Script)

```bash
# Rendre le script exécutable
chmod +x start-local.sh

# Démarrer tout avec Docker
./start-local.sh docker

# Attendre 30 secondes que tout démarre
sleep 30

# Vérifier que tout fonctionne
docker-compose ps
```

### Méthode Manuelle Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f

# Dans un autre terminal, vérifier l'état
docker-compose ps

# Résultat attendu : tous les services "Up"
```

### Vérifier que tout fonctionne

```bash
# API Health Check
curl http://localhost:3000/health

# PostgreSQL
docker-compose exec postgres psql -U postgres -d oj_investment_platform -c "SELECT 1"

# Redis
docker-compose exec redis redis-cli ping

# Frontend (ouvrir dans navigateur)
open http://localhost:3001
```

---

## 💻 ÉTAPE 4 : Démarrage Manuel (Sans Docker)

### A. Démarrer PostgreSQL et Redis

**Avec Docker (uniquement bases de données) :**
```bash
# PostgreSQL
docker run -d --name postgres-oj \
  -e POSTGRES_DB=oj_investment_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d --name redis-oj \
  -p 6379:6379 \
  redis:7-alpine
```

**Avec installation locale (macOS) :**
```bash
# Installer
brew install postgresql@15 redis

# Démarrer
brew services start postgresql@15
brew services start redis

# Créer la base
createdb oj_investment_platform
```

### B. Initialiser la Base de Données

```bash
# Se connecter
psql -U postgres -d oj_investment_platform

# Exécuter le schéma (dans psql)
\i apps/api/src/database/schema.sql

# Insérer les données de test
\i apps/api/src/database/seeds/01-initial-data.sql

# Quitter
\q
```

### C. Installer les Dépendances

```bash
# Backend API
cd apps/api
npm install
cd ../..

# Frontend Web
cd apps/web
npm install
cd ../..

# (Optionnel) Mobile
cd apps/mobile
npm install
cd ../..
```

### D. Démarrer les Services

**Terminal 1 - Backend API :**
```bash
cd apps/api
npm run start:dev

# Devrait afficher :
# [Nest] Application successfully started
# GraphQL Playground: http://localhost:3000/graphql
```

**Terminal 2 - Frontend Web :**
```bash
cd apps/web
npm run dev

# Devrait afficher :
# ready - started server on http://localhost:3001
```

---

## 🧪 ÉTAPE 5 : Tester l'Installation

### 1. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Devrait retourner: {"status":"ok"}
```

### 2. Test GraphQL

Ouvrir dans le navigateur :
```
http://localhost:3000/graphql
```

Essayer cette requête :
```graphql
# Login avec compte de test
mutation {
  login(email: "jean.dupont@example.com", password: "password123") {
    accessToken
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

### 3. Test Frontend Web

```bash
# Ouvrir dans le navigateur
open http://localhost:3001

# Ou
google-chrome http://localhost:3001
firefox http://localhost:3001
```

**Se connecter avec :**
- Email : `jean.dupont@example.com`
- Mot de passe : `password123`

---

## 📱 ÉTAPE 6 : Démarrer l'App Mobile (Optionnel)

### Setup Initial

```bash
cd apps/mobile

# Installer les dépendances
npm install

# Démarrer Metro Bundler
npm start
```

### Pour Android (Émulateur)

```bash
# Dans un nouveau terminal
cd apps/mobile

# Vérifier que l'émulateur est lancé
adb devices

# Lancer sur Android
npm run android
```

### Pour iOS (macOS uniquement)

```bash
cd apps/mobile

# Installer les pods
cd ios && pod install && cd ..

# Lancer sur iOS
npm run ios
```

---

## 🔧 Commandes Utiles Quotidiennes

### Docker

```bash
# Voir tous les services
docker-compose ps

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres

# Redémarrer un service
docker-compose restart api

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v

# Rebuild après changement de code
docker-compose build api
docker-compose up -d api
```

### Base de Données

```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d oj_investment_platform

# Commandes PostgreSQL utiles
\dt                    # Lister les tables
\d oj_investors       # Décrire une table
SELECT * FROM oj_projects;  # Requête
\q                    # Quitter

# Reset base de données
docker-compose down -v
docker-compose up -d postgres
sleep 5
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/schema.sql
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/seeds/01-initial-data.sql
```

### Backend

```bash
cd apps/api

# Démarrage dev (watch mode)
npm run start:dev

# Tests
npm test
npm run test:watch
npm run test:cov

# Linter
npm run lint
npm run lint:fix

# Build production
npm run build
npm run start:prod
```

### Frontend

```bash
cd apps/web

# Démarrage dev
npm run dev

# Build production
npm run build
npm run start

# Tests
npm test

# Linter
npm run lint
```

### Mobile

```bash
cd apps/mobile

# Démarrer Metro
npm start

# Android
npm run android

# iOS
npm run ios

# Logs
npx react-native log-android
npx react-native log-ios
```

---

## 🔍 Debugging et Résolution de Problèmes

### Problème : Port déjà utilisé

```bash
# Trouver le processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou tuer tous les Node.js
pkill -f node
```

### Problème : Docker ne démarre pas

```bash
# Vérifier Docker
docker info

# Redémarrer Docker Desktop
# macOS : Relancer Docker Desktop
# Linux :
sudo systemctl restart docker

# Nettoyer Docker
docker system prune -a
```

### Problème : Base de données corrompue

```bash
# Reset complet
docker-compose down -v
rm -rf .docker-data  # Si vous avez un volume local
docker-compose up -d postgres
sleep 10

# Réinit schema
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/schema.sql
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/seeds/01-initial-data.sql
```

### Problème : Modules manquants

```bash
# Backend
cd apps/api
rm -rf node_modules package-lock.json
npm install

# Frontend
cd apps/web
rm -rf node_modules .next package-lock.json
npm install

# Mobile
cd apps/mobile
rm -rf node_modules package-lock.json
npm install
```

### Problème : API ne répond pas

```bash
# Vérifier les logs
docker-compose logs api

# Redémarrer l'API
docker-compose restart api

# Vérifier la connexion DB
docker-compose exec api npm run typeorm -- query "SELECT 1"
```

---

## 📊 Monitoring en Développement

### Voir l'état de tout

```bash
# Services Docker
docker-compose ps

# Processus
ps aux | grep node

# Ports utilisés
lsof -i -P | grep LISTEN | grep :300
```

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# API uniquement
docker-compose logs -f api --tail=100

# Avec filtrage
docker-compose logs -f api | grep ERROR
```

---

## 🎯 Workflow de Développement Quotidien

### Matin - Démarrage

```bash
cd /chemin/vers/dataverse

# Pull les dernières modifications
git pull origin claude/start-new-project-0159hDkR8VSsXZFXUax2e8Yn

# Démarrer tout
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Pendant le dev - Modifications

```bash
# Le code backend redémarre automatiquement (hot reload)
# Le code frontend redémarre automatiquement (Next.js)

# Si vous modifiez package.json
docker-compose restart api  # ou web

# Si vous modifiez le Dockerfile
docker-compose build api
docker-compose up -d api
```

### Soir - Arrêt

```bash
# Arrêter tous les services
docker-compose down

# Ou garder les services actifs pour le lendemain
# (ils consomment peu de ressources)
```

---

## 🚀 Accès Rapides

| Service | URL | Login |
|---------|-----|-------|
| **Web Frontend** | http://localhost:3001 | jean.dupont@example.com / password123 |
| **GraphQL Playground** | http://localhost:3000/graphql | - |
| **API Health** | http://localhost:3000/health | - |
| **Super Admin** | http://localhost:3001/super-admin | admin@ojinvestment.com / password123 |
| **Bank Partner** | http://localhost:3001/bank-partner | - |

---

## 📋 Checklist de Vérification

Après démarrage, vérifier :

- [ ] Docker services running : `docker-compose ps`
- [ ] API accessible : `curl http://localhost:3000/health`
- [ ] GraphQL fonctionne : http://localhost:3000/graphql
- [ ] Frontend accessible : http://localhost:3001
- [ ] Login fonctionne
- [ ] Base de données a les données : `docker-compose exec postgres psql -U postgres -d oj_investment_platform -c "SELECT COUNT(*) FROM oj_projects"`

---

## 🆘 Support

### Logs à vérifier en cas de problème

1. **Docker** : `docker-compose logs -f`
2. **API** : `docker-compose logs api`
3. **PostgreSQL** : `docker-compose logs postgres`
4. **Redis** : `docker-compose logs redis`

### Commandes de diagnostic

```bash
# Tout vérifier d'un coup
echo "=== Docker Status ==="
docker-compose ps

echo -e "\n=== API Health ==="
curl -s http://localhost:3000/health

echo -e "\n=== Database ==="
docker-compose exec postgres psql -U postgres -d oj_investment_platform -c "SELECT 'DB OK' as status"

echo -e "\n=== Redis ==="
docker-compose exec redis redis-cli ping
```

---

**Vous êtes prêt ! 🎉**

Commencez par :
```bash
./start-local.sh docker
```

Puis ouvrez http://localhost:3001 dans votre navigateur !
