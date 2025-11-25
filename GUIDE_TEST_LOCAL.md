# Guide de Test en Local - OJ Investment Platform

## 🚀 Démarrage Rapide

### Prérequis

```bash
# Versions requises
Node.js >= 18.x
npm >= 9.x
Docker >= 20.x
Docker Compose >= 2.x
Git
```

---

## 📦 Installation Complète

### 1. Cloner le projet

```bash
git clone <votre-repo-url>
cd oj
```

### 2. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :

```env
# Base de données
POSTGRES_DB=oj_investment_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise

# Stripe (Mode Test)
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# SendGrid
SENDGRID_API_KEY=SG.votre_cle_sendgrid
SENDGRID_FROM_EMAIL=noreply@ojinvestment.com
SENDGRID_FROM_NAME=OJ Investment Platform

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+33123456789

# AWS S3
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_S3_BUCKET=oj-investment-files

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Blockchain (Optionnel)
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_PRIVATE_KEY=0xvotre_private_key
OJ_INVESTMENT_MANAGER_ADDRESS=0xvotre_contract_address
OJ_ESCROW_ADDRESS=0xvotre_escrow_address

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3000/graphql
API_PORT=3000
WEB_PORT=3001

# Mode
NODE_ENV=development
```

---

## 🐳 Méthode 1 : Avec Docker (Recommandé)

### Démarrage complet avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Vérifier que tout fonctionne
docker-compose ps
```

Les services seront accessibles sur :
- **API Backend** : http://localhost:3000
- **GraphQL Playground** : http://localhost:3000/graphql
- **Web Frontend** : http://localhost:3001
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379
- **pgAdmin** (optionnel) : http://localhost:5050

### Avec profils optionnels

```bash
# Avec blockchain locale (Hardhat)
docker-compose --profile blockchain up -d

# Avec pgAdmin pour gérer la DB
docker-compose --profile tools up -d

# Tout ensemble
docker-compose --profile blockchain --profile tools up -d
```

### Commandes utiles Docker

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Reconstruire les images
docker-compose build

# Redémarrer un service spécifique
docker-compose restart api

# Voir les logs d'un service
docker-compose logs -f api

# Exécuter une commande dans un conteneur
docker-compose exec api npm run test
```

---

## 💻 Méthode 2 : Sans Docker (Manuel)

### 1. Démarrer PostgreSQL et Redis

**Option A : Avec Docker uniquement pour les bases**
```bash
# PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=oj_investment_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Option B : Installation locale**
```bash
# Sur macOS
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Sur Ubuntu/Debian
sudo apt install postgresql redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

### 2. Initialiser la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres -d oj_investment_platform

# Exécuter le schéma
\i apps/api/src/database/schema.sql

# Insérer les données de test
\i apps/api/src/database/seeds/01-initial-data.sql

# Quitter
\q
```

### 3. Installer les dépendances

```bash
# Backend API
cd apps/api
npm install
cd ../..

# Frontend Web
cd apps/web
npm install
cd ../..

# Mobile (optionnel pour le moment)
cd apps/mobile
npm install
cd ../..
```

### 4. Démarrer les services

**Terminal 1 - Backend API**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2 - Frontend Web**
```bash
cd apps/web
npm run dev
```

Les services seront accessibles sur :
- **API** : http://localhost:3000
- **GraphQL** : http://localhost:3000/graphql
- **Web** : http://localhost:3001

---

## 🧪 Tests

### Tests Backend

```bash
cd apps/api

# Tous les tests
npm test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch

# Tests e2e
npm run test:e2e
```

### Tests Frontend

```bash
cd apps/web

# Tests unitaires
npm test

# Tests e2e (Playwright)
npm run test:e2e
```

### Tester les endpoints GraphQL

Ouvrez http://localhost:3000/graphql et essayez :

```graphql
# Test de connexion
mutation Login {
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

# Liste des projets
query GetProjects {
  projects {
    id
    name
    category
    targetAmount
    currentAmount
    status
  }
}

# Créer un investissement
mutation CreateInvestment {
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

## 📱 Test de l'Application Mobile (APK Android)

### Configuration de l'environnement React Native

#### 1. Installer les prérequis

**Sur macOS:**
```bash
# Node.js et Watchman
brew install node watchman

# Java JDK
brew install --cask zulu@17

# Android Studio
# Télécharger depuis: https://developer.android.com/studio
# Installer Android SDK, Android SDK Platform, Android Virtual Device
```

**Sur Ubuntu/Linux:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Java JDK
sudo apt install openjdk-17-jdk

# Android Studio
# Télécharger depuis: https://developer.android.com/studio
```

**Sur Windows:**
```bash
# Utiliser Chocolatey
choco install -y nodejs-lts microsoft-openjdk17

# Télécharger Android Studio
# https://developer.android.com/studio
```

#### 2. Configurer Android Studio

1. **Ouvrir Android Studio**
2. **SDK Manager** → Installer :
   - Android SDK Platform 33 (Android 13)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

3. **Configurer les variables d'environnement**

**macOS/Linux** - Ajouter dans `~/.bashrc` ou `~/.zshrc` :
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Windows** - Variables d'environnement système :
```
ANDROID_HOME=C:\Users\VotreNom\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools
```

Recharger le terminal :
```bash
source ~/.zshrc  # ou ~/.bashrc
```

### 3. Préparer le projet mobile

```bash
cd apps/mobile

# Installer les dépendances
npm install

# Installer les pods (iOS uniquement)
cd ios && pod install && cd ..
```

### 4. Créer l'APK de développement

#### Méthode 1 : Avec Expo (Recommandé pour le test rapide)

```bash
cd apps/mobile

# Build APK de développement
npx expo build:android -t apk

# Ou avec EAS Build (moderne)
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

#### Méthode 2 : Build natif Android

**Créer le fichier de config Android** - `apps/mobile/android/gradle.properties` :
```properties
MYAPP_UPLOAD_STORE_FILE=debug.keystore
MYAPP_UPLOAD_KEY_ALIAS=androiddebugkey
MYAPP_UPLOAD_STORE_PASSWORD=android
MYAPP_UPLOAD_KEY_PASSWORD=android

android.useAndroidX=true
android.enableJetifier=true
```

**Générer l'APK de debug:**
```bash
cd apps/mobile/android

# Debug APK
./gradlew assembleDebug

# L'APK sera créé dans:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Générer l'APK de release (pour production):**
```bash
# Créer une clé de signature
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Build release APK
./gradlew assembleRelease

# L'APK sera créé dans:
# android/app/build/outputs/apk/release/app-release.apk
```

### 5. Installer l'APK sur un appareil

#### Sur Émulateur Android

```bash
# Lister les émulateurs disponibles
emulator -list-avds

# Démarrer un émulateur
emulator -avd Pixel_5_API_33

# Installer l'APK
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Ou automatiquement avec
npm run android
```

#### Sur Appareil Physique

1. **Activer le mode développeur sur Android:**
   - Paramètres → À propos du téléphone
   - Taper 7 fois sur "Numéro de build"
   - Paramètres → Options pour développeurs
   - Activer "Débogage USB"

2. **Connecter via USB et installer:**
```bash
# Vérifier que l'appareil est détecté
adb devices

# Installer l'APK
adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

3. **Installer sans câble (via navigateur):**
   - Héberger l'APK sur un serveur web
   - Télécharger sur le téléphone
   - Autoriser l'installation depuis des sources inconnues
   - Ouvrir et installer

### 6. Tester l'application mobile

#### Démarrer le serveur de développement

```bash
cd apps/mobile

# Démarrer Metro bundler
npm start

# Ou avec Expo
npx expo start
```

#### Tester les fonctionnalités

**Connexion:**
- Email: `jean.dupont@example.com`
- Mot de passe: `password123`

**Tester:**
- ✅ Authentification biométrique
- ✅ Navigation entre Dashboard, Projets, Portfolio
- ✅ Consultation des projets
- ✅ Création d'investissements
- ✅ Notifications push (avec Firebase configuré)
- ✅ Mode offline

### 7. Debug et Logs

```bash
# Voir les logs Android
adb logcat

# Filtrer les logs React Native
adb logcat | grep ReactNativeJS

# Voir les logs de l'application
adb logcat *:S ReactNative:V ReactNativeJS:V

# Debug avec React Native Debugger
npm install -g react-devtools
react-devtools
```

---

## 🔍 Vérification de Santé

### Endpoints de santé

```bash
# Backend API
curl http://localhost:3000/health

# Base de données
psql -U postgres -d oj_investment_platform -c "SELECT 1;"

# Redis
redis-cli ping
```

### Vérifier les services

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d oj_investment_platform -c "\dt"

# Redis
docker-compose exec redis redis-cli ping

# Logs API
docker-compose logs -f api --tail=100
```

---

## 🐛 Résolution de Problèmes

### Erreur : Port déjà utilisé

```bash
# Trouver le processus
lsof -i :3000
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

### Erreur : Base de données inaccessible

```bash
# Vérifier PostgreSQL
docker-compose logs postgres

# Recréer la base
docker-compose down -v
docker-compose up -d postgres
```

### Erreur : Module non trouvé

```bash
# Nettoyer et réinstaller
cd apps/api
rm -rf node_modules package-lock.json
npm install

cd ../web
rm -rf node_modules package-lock.json .next
npm install
```

### Erreur : Android SDK non trouvé

```bash
# Vérifier l'installation
echo $ANDROID_HOME
ls $ANDROID_HOME

# Réinstaller si nécessaire
# Ouvrir Android Studio → SDK Manager
```

### Erreur : Build APK échoue

```bash
# Nettoyer le build
cd apps/mobile/android
./gradlew clean

# Vérifier la version Java
java -version  # Doit être 17

# Rebuild
./gradlew assembleDebug --stacktrace
```

---

## 📊 Données de Test

### Comptes utilisateurs (mot de passe: `password123`)

| Email | Rôle | KYC Status |
|-------|------|------------|
| jean.dupont@example.com | Investisseur | APPROVED |
| marie.martin@example.com | Investisseur | APPROVED |
| pierre.bernard@example.com | Porteur de projet | APPROVED |
| admin@ojinvestment.com | Super Admin | APPROVED |

### Projets de test

- **Projet Énergie Solaire** - Énergie - €500,000
- **Immobilier Durable Paris** - Immobilier - €1,000,000
- **AgriTech Innovation** - Agriculture - €300,000

---

## 🚀 Performances

### Optimisations recommandées pour les tests

```bash
# Désactiver Sentry en dev
SENTRY_DSN=

# Utiliser un token JWT plus long (1 jour)
JWT_EXPIRES_IN=1d

# Augmenter le pool de connexions PostgreSQL
POSTGRES_MAX_CONNECTIONS=100

# Activer le cache Redis agressif
REDIS_TTL=3600
```

---

## 📱 Distribution de l'APK

### Pour les testeurs

1. **Via Google Play Console (Internal Testing):**
   - Créer une app dans Play Console
   - Uploader l'APK
   - Inviter les testeurs

2. **Via lien direct:**
   - Héberger l'APK sur un serveur
   - Partager le lien
   - Les testeurs doivent autoriser "Sources inconnues"

3. **Via Firebase App Distribution:**
```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute \
  apps/mobile/android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups testers
```

---

## 📝 Checklist de Test

### Backend
- [ ] API démarre sans erreur
- [ ] GraphQL Playground accessible
- [ ] Authentification fonctionne
- [ ] CRUD Projets fonctionne
- [ ] CRUD Investissements fonctionne
- [ ] Webhooks Stripe (simulés)
- [ ] Emails envoyés (vérifier logs)
- [ ] WebSocket connecté

### Frontend Web
- [ ] Application démarre
- [ ] Login fonctionne
- [ ] Dashboard affiche les données
- [ ] Projets listés correctement
- [ ] PWA installable
- [ ] Mode offline fonctionne
- [ ] Notifications push

### Mobile Android
- [ ] APK s'installe
- [ ] Application démarre
- [ ] Login fonctionne
- [ ] Biométrie fonctionne (si disponible)
- [ ] Navigation fluide
- [ ] Données chargées
- [ ] Pas de crash

---

## 🎯 Prochaines Étapes

Une fois les tests locaux validés :

1. **Staging:** Déployer sur un environnement de staging
2. **Tests utilisateurs:** Inviter des beta-testeurs
3. **Performance:** Load testing avec k6 ou JMeter
4. **Sécurité:** Audit de sécurité
5. **Production:** Déploiement final

---

**Besoin d'aide ?** Consultez les logs détaillés avec `docker-compose logs -f`
