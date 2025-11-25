# 🚀 Quick Start - OJ Investment Platform

## Démarrage Ultra-Rapide (3 minutes)

### Option 1 : Docker (Recommandé)

```bash
# 1. Configuration
cp .env.example .env
# Éditez .env avec vos clés API

# 2. Démarrage
./start-local.sh docker

# 3. Accédez à:
# - Web: http://localhost:3001
# - API: http://localhost:3000/graphql
```

### Option 2 : Manuel

```bash
# 1. Configuration
cp .env.example .env

# 2. Démarrage
./start-local.sh manual

# 3. Démarrer les services (2 terminaux)
# Terminal 1:
cd apps/api && npm run start:dev

# Terminal 2:
cd apps/web && npm run dev
```

---

## 📱 Build APK Android

### Méthode Simple (Expo)

```bash
cd apps/mobile

# Build avec Expo
npx expo build:android -t apk

# Ou avec EAS (moderne)
npm install -g eas-cli
eas build --platform android --profile development
```

### Méthode Native

```bash
# Build Debug APK
./build-apk.sh debug

# Build Release APK
./build-apk.sh release

# Installer sur émulateur
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 Test Rapide

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| jean.dupont@example.com | password123 | Investisseur |
| admin@ojinvestment.com | password123 | Super Admin |

### Endpoints

```bash
# Health check
curl http://localhost:3000/health

# GraphQL
open http://localhost:3000/graphql
```

### Test GraphQL

```graphql
# Login
mutation {
  login(email: "jean.dupont@example.com", password: "password123") {
    accessToken
    user { id firstName }
  }
}

# Projets
query {
  projects {
    id name targetAmount currentAmount
  }
}
```

---

## 🔧 Commandes Utiles

### Docker

```bash
# Logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Nettoyer tout
docker-compose down -v
```

### Base de données

```bash
# PostgreSQL shell
docker-compose exec postgres psql -U postgres -d oj_investment_platform

# Redis CLI
docker-compose exec redis redis-cli

# Reset DB
psql -U postgres -d oj_investment_platform -f apps/api/src/database/schema.sql
```

### Mobile

```bash
# Démarrer Metro
cd apps/mobile && npm start

# Lancer sur Android
npm run android

# Logs Android
adb logcat | grep ReactNative
```

---

## 🐛 Debug

### Port déjà utilisé

```bash
# Trouver et tuer le processus
lsof -i :3000
kill -9 <PID>
```

### Réinstaller dépendances

```bash
# Backend
cd apps/api
rm -rf node_modules package-lock.json
npm install

# Frontend
cd apps/web
rm -rf node_modules .next
npm install
```

### Rebuild Docker

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Documentation Complète

- **[GUIDE_TEST_LOCAL.md](./GUIDE_TEST_LOCAL.md)** - Guide complet de test
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - État des fonctionnalités
- **[SERVICES_README.md](./SERVICES_README.md)** - Documentation des services

---

## ✅ Checklist de Vérification

- [ ] `.env` configuré
- [ ] PostgreSQL démarre
- [ ] Redis démarre
- [ ] API accessible (http://localhost:3000)
- [ ] Web accessible (http://localhost:3001)
- [ ] Login fonctionne
- [ ] GraphQL répond
- [ ] APK s'installe (mobile)

---

## 🆘 Besoin d'Aide ?

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez [GUIDE_TEST_LOCAL.md](./GUIDE_TEST_LOCAL.md)
3. Vérifiez que tous les services sont up : `docker-compose ps`

**Bon test ! 🎉**
