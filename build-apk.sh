#!/bin/bash

# Script de build APK Android pour OJ Investment Platform
# Usage: ./build-apk.sh [debug|release]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════"
echo "   OJ Investment - Build APK Android"
echo "═══════════════════════════════════════════════════"
echo -e "${NC}"

# Déterminer le type de build
BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
    echo -e "${RED}✗ Type de build invalide: $BUILD_TYPE${NC}"
    echo -e "${BLUE}Usage: ./build-apk.sh [debug|release]${NC}"
    exit 1
fi

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

# Vérifier Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ Java JDK n'est pas installé${NC}"
    echo "Installez Java JDK 17 depuis: https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
echo -e "${GREEN}✓ Java version $JAVA_VERSION${NC}"

# Vérifier ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}✗ ANDROID_HOME n'est pas défini${NC}"
    echo ""
    echo -e "${YELLOW}Configurez ANDROID_HOME:${NC}"
    echo ""
    echo -e "${BLUE}macOS/Linux:${NC}"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo ""
    echo -e "${BLUE}Windows:${NC}"
    echo "set ANDROID_HOME=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"

# Aller dans le dossier mobile
cd apps/mobile

echo ""
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Dépendances déjà installées${NC}"
fi

# Vérifier si le dossier android existe
if [ ! -d "android" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Dossier android non trouvé - Initialisation...${NC}"

    # Vérifier si c'est un projet Expo
    if [ -f "app.json" ]; then
        echo -e "${BLUE}📱 Projet Expo détecté${NC}"
        echo ""
        echo -e "${YELLOW}Pour générer l'APK avec Expo:${NC}"
        echo ""
        echo -e "${BLUE}Option 1 - EAS Build (Recommandé):${NC}"
        echo "  npm install -g eas-cli"
        echo "  eas login"
        echo "  eas build --platform android --profile development"
        echo ""
        echo -e "${BLUE}Option 2 - Expo Build (Legacy):${NC}"
        echo "  npx expo build:android -t apk"
        echo ""
        echo -e "${BLUE}Option 3 - Ejecter vers React Native:${NC}"
        echo "  npx expo prebuild --platform android"
        echo "  ./build-apk.sh $BUILD_TYPE"
        echo ""
        exit 0
    else
        echo -e "${RED}✗ Structure de projet invalide${NC}"
        exit 1
    fi
fi

cd android

echo ""
echo -e "${BLUE}🏗️  Build APK ($BUILD_TYPE)...${NC}"
echo ""

if [ "$BUILD_TYPE" = "debug" ]; then
    echo -e "${YELLOW}Building DEBUG APK...${NC}"
    ./gradlew assembleDebug --stacktrace

    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo ""
        echo -e "${GREEN}✓ APK Debug créé avec succès !${NC}"
        echo ""
        echo -e "${BLUE}📱 APK Info:${NC}"
        echo -e "  ${GREEN}•${NC} Chemin:  $(pwd)/$APK_PATH"
        echo -e "  ${GREEN}•${NC} Taille:  $APK_SIZE"
        echo ""
        echo -e "${YELLOW}💡 Installation:${NC}"
        echo -e "  ${BLUE}•${NC} Émulateur:  adb install -r $APK_PATH"
        echo -e "  ${BLUE}•${NC} Appareil:   adb -d install -r $APK_PATH"
        echo ""
    else
        echo -e "${RED}✗ APK non trouvé dans $APK_PATH${NC}"
        exit 1
    fi

elif [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}Building RELEASE APK...${NC}"
    echo ""

    # Vérifier la clé de signature
    KEYSTORE_FILE="my-release-key.keystore"
    if [ ! -f "$KEYSTORE_FILE" ]; then
        echo -e "${YELLOW}⚠️  Clé de signature non trouvée${NC}"
        echo ""
        echo -e "${BLUE}Génération d'une nouvelle clé...${NC}"
        echo ""

        read -p "Nom de l'app (ex: OJInvestment): " APP_NAME
        read -p "Organisation (ex: com.ojinvestment): " ORG_NAME
        read -sp "Mot de passe du keystore: " KEYSTORE_PASSWORD
        echo ""
        read -sp "Confirmer le mot de passe: " KEYSTORE_PASSWORD_CONFIRM
        echo ""

        if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
            echo -e "${RED}✗ Les mots de passe ne correspondent pas${NC}"
            exit 1
        fi

        keytool -genkeypair -v -storetype PKCS12 \
            -keystore "$KEYSTORE_FILE" \
            -alias my-key-alias \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -dname "CN=$APP_NAME, OU=$ORG_NAME, O=$ORG_NAME, L=Paris, ST=France, C=FR" \
            -storepass "$KEYSTORE_PASSWORD" \
            -keypass "$KEYSTORE_PASSWORD"

        echo ""
        echo -e "${GREEN}✓ Clé de signature créée${NC}"
        echo ""
        echo -e "${RED}⚠️  IMPORTANT: Sauvegardez cette clé en lieu sûr !${NC}"
        echo -e "${YELLOW}Chemin: $(pwd)/$KEYSTORE_FILE${NC}"
        echo ""

        # Créer gradle.properties
        cat > gradle.properties << EOF
MYAPP_UPLOAD_STORE_FILE=$KEYSTORE_FILE
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=$KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=$KEYSTORE_PASSWORD

android.useAndroidX=true
android.enableJetifier=true
EOF

        echo -e "${GREEN}✓ Configuration Gradle créée${NC}"
    fi

    # Build release
    ./gradlew assembleRelease --stacktrace

    APK_PATH="app/build/outputs/apk/release/app-release.apk"

    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo ""
        echo -e "${GREEN}✓ APK Release créé avec succès !${NC}"
        echo ""
        echo -e "${BLUE}📱 APK Info:${NC}"
        echo -e "  ${GREEN}•${NC} Chemin:  $(pwd)/$APK_PATH"
        echo -e "  ${GREEN}•${NC} Taille:  $APK_SIZE"
        echo ""
        echo -e "${YELLOW}💡 Distribution:${NC}"
        echo -e "  ${BLUE}•${NC} Google Play:  Uploader dans Play Console"
        echo -e "  ${BLUE}•${NC} Test direct:  Envoyer aux testeurs"
        echo -e "  ${BLUE}•${NC} Firebase:     firebase appdistribution:distribute $APK_PATH"
        echo ""
        echo -e "${RED}⚠️  Gardez votre keystore en sécurité !${NC}"
        echo ""
    else
        echo -e "${RED}✗ APK non trouvé dans $APK_PATH${NC}"
        exit 1
    fi
fi

cd ../..

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Build terminé !${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📚 Consultez GUIDE_TEST_LOCAL.md pour l'installation${NC}"
echo ""
