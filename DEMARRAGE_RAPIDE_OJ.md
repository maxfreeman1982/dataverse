# 🚀 OJ Investment Platform - Démarrage Rapide

## 📍 Vous êtes ici : `/home/user/dataverse` (projet OJ)

---

## ⚡ Démarrage en 3 Commandes

```bash
# 1. Configuration
cp .env.example .env

# 2. Démarrage
./start-local.sh docker

# 3. Accès
# → Web: http://localhost:3001
# → API: http://localhost:3000/graphql
```

---

## 🔧 Configuration .env Minimale

Créez `.env` avec ce contenu minimum :

```env
# Base de données
POSTGRES_DB=oj_investment_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oj_investment_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=oj-secret-jwt-dev-123456789
JWT_REFRESH_SECRET=oj-refresh-secret-dev-987654321

# Ports
API_PORT=3000
WEB_PORT=3001

# Mode
NODE_ENV=development
```

---

## 🎯 Commandes Principales

### Démarrage
```bash
# Méthode 1 : Avec script (recommandé)
./start-local.sh docker

# Méthode 2 : Manuel
docker-compose up -d
docker-compose logs -f
```

### Vérification
```bash
# État des services
docker-compose ps

# API fonctionne
curl http://localhost:3000/health

# Logs en temps réel
docker-compose logs -f
```

### Arrêt
```bash
# Arrêter
docker-compose down

# Arrêter + supprimer les données
docker-compose down -v
```

---

## 🔑 Comptes de Test

**Utilisateur :** http://localhost:3001
- Email : `jean.dupont@example.com`
- Mot de passe : `password123`

**Super Admin :** http://localhost:3001/super-admin
- Email : `admin@ojinvestment.com`
- Mot de passe : `password123`

**Autres comptes :**
- `marie.martin@example.com` / `password123` (Investisseur)
- `pierre.bernard@example.com` / `password123` (Porteur de projet)

---

## 🧪 Test GraphQL

Ouvrir : http://localhost:3000/graphql

```graphql
# 1. Login
mutation {
  login(email: "jean.dupont@example.com", password: "password123") {
    accessToken
    user {
      id
      firstName
      lastName
      email
    }
  }
}

# 2. Liste des projets
query {
  projects {
    id
    name
    category
    targetAmount
    currentAmount
    status
  }
}

# 3. Créer un investissement (remplacer TOKEN et PROJECT_ID)
mutation {
  createInvestment(
    projectId: "uuid-du-projet"
    amount: 1000
  ) {
    id
    amount
    status
  }
}
```

---

## 📊 Services Disponibles

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Web** | http://localhost:3001 | Interface utilisateur |
| **API GraphQL** | http://localhost:3000/graphql | GraphQL Playground |
| **API Health** | http://localhost:3000/health | Santé de l'API |
| **Super Admin** | http://localhost:3001/super-admin | Dashboard admin |
| **Bank Partner** | http://localhost:3001/bank-partner | Dashboard bancaire |

---

## 🔧 Commandes Docker Utiles

```bash
# Voir tous les services
docker-compose ps

# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres

# Redémarrer un service
docker-compose restart api

# Reconstruire après changement
docker-compose build api
docker-compose up -d api

# Entrer dans un conteneur
docker-compose exec api bash
docker-compose exec postgres psql -U postgres -d oj_investment_platform
```

---

## 🗄️ Commandes Base de Données

```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d oj_investment_platform

# Dans psql:
\dt                          # Liste des tables
\d oj_projects              # Décrire table
SELECT * FROM oj_investors; # Requête
\q                          # Quitter

# Réinitialiser les données
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/schema.sql
docker-compose exec -T postgres psql -U postgres -d oj_investment_platform < apps/api/src/database/seeds/01-initial-data.sql
```

---

## 🐛 Résolution de Problèmes

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

### Services ne démarrent pas
```bash
# Voir les erreurs
docker-compose logs api
docker-compose logs postgres

# Redémarrer tout
docker-compose down
docker-compose up -d
```

### Reset complet
```bash
# Tout supprimer et recommencer
docker-compose down -v
docker-compose up -d
sleep 30
curl http://localhost:3000/health
```

### Cache npm
```bash
# Backend
cd apps/api
rm -rf node_modules package-lock.json
npm install

# Frontend
cd apps/web
rm -rf node_modules .next package-lock.json
npm install
```

---

## 📱 Build APK Mobile

```bash
# Build APK debug
./build-apk.sh debug

# L'APK sera créé dans :
# apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Installer sur appareil/émulateur
adb devices
adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 Workflow Quotidien

### Matin - Démarrage
```bash
cd /home/user/dataverse  # Projet OJ
docker-compose up -d
docker-compose logs -f
```

### Pendant le dev
- Modifier code → Hot reload automatique ✅
- Pas besoin de redémarrer manuellement

### Soir - Arrêt (optionnel)
```bash
docker-compose down
# Ou laisser tourner
```

---

## ✅ Checklist de Validation

Après démarrage, vérifier :

```bash
# 1. Services actifs
docker-compose ps
# Tous doivent être "Up"

# 2. API accessible
curl http://localhost:3000/health
# Retour : {"status":"ok"}

# 3. Base de données
docker-compose exec postgres psql -U postgres -d oj_investment_platform -c "SELECT COUNT(*) FROM oj_projects"
# Devrait retourner 6 projets

# 4. Frontend
open http://localhost:3001
# Page de login doit s'afficher

# 5. Login fonctionne
# jean.dupont@example.com / password123
```

---

## 🚀 Démarrage Immédiat

**Copiez-collez dans votre terminal :**

```bash
# 1. Configuration (seulement la première fois)
cat > .env << 'EOF'
POSTGRES_DB=oj_investment_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oj_investment_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=oj-secret-jwt-dev-123456789
JWT_REFRESH_SECRET=oj-refresh-secret-dev-987654321
API_PORT=3000
WEB_PORT=3001
NODE_ENV=development
EOF

# 2. Démarrage
./start-local.sh docker

# 3. Attendre 30 secondes
sleep 30

# 4. Vérifier
docker-compose ps
curl http://localhost:3000/health

# 5. Ouvrir dans le navigateur
echo "✅ Ouvrir http://localhost:3001"
echo "✅ Login: jean.dupont@example.com / password123"
```

---

## 📚 Documentation Complète

- **[DEMARRAGE_RAPIDE_OJ.md](./DEMARRAGE_RAPIDE_OJ.md)** ⭐ Ce fichier
- **[DEMARRAGE_LOCAL.md](./DEMARRAGE_LOCAL.md)** - Guide détaillé
- **[QUICK_START.md](./QUICK_START.md)** - Quick start EN
- **[GUIDE_TEST_LOCAL.md](./GUIDE_TEST_LOCAL.md)** - Tests et APK
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - État des features

---

## 💡 Astuces

### Logs colorés
```bash
docker-compose logs -f | grep -E 'ERROR|WARN|INFO'
```

### Auto-redémarrage après crash
```bash
docker-compose up -d --force-recreate
```

### Vider les logs
```bash
docker-compose down
docker system prune -f
docker-compose up -d
```

### Voir la consommation
```bash
docker stats
```

---

**🎉 Votre plateforme OJ Investment est prête !**

**Prochaine étape :** Ouvrir http://localhost:3001 et commencer à tester ! 🚀
