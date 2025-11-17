# 🚀 Démarrage de l'API Perfume Architect Pro

## ✅ Configuration SQLite Activée

L'API est maintenant configurée pour utiliser SQLite (fichier local).
Aucune configuration serveur requise!

## 📝 Démarrage Rapide

### 1. Installer les dépendances (une seule fois)

```bash
cd apps/api
npm install
```

### 2. Démarrer l'API

```bash
npm run dev
```

### 3. Vérifier que ça fonctionne

L'API devrait afficher:
```
✅ Connected to database
✅ Seeding database with ingredients...
✅ Seeded 70+ ingredients successfully
✅ Application is running on: http://localhost:3001
```

### 4. Tester GraphQL Playground

Ouvrir dans votre navigateur:
**http://localhost:3001/graphql**

Tester cette query:
```graphql
query {
  getAllIngredients {
    id
    name
    volatility
    strength
    olfactiveFamily {
      name
    }
  }
}
```

## 📊 Données Créées Automatiquement

Au démarrage, l'API crée automatiquement:
- ✅ **70+ ingrédients** professionnels avec données IFRA complètes
- ✅ **20 familles olfactives** (Floral, Citrus, Woody, etc.)
- ✅ **14 allergènes** avec restrictions
- ✅ **10 formules florales** pré-construites (40 variations)

## 📁 Fichier de Base de Données

SQLite crée un fichier:
```
apps/api/perfume-architect-pro.db
```

Vous pouvez l'ouvrir avec:
- **DB Browser for SQLite** (GUI): https://sqlitebrowser.org/
- **sqlite3 CLI**: `sqlite3 perfume-architect-pro.db`

## 🔄 Migrer vers PostgreSQL Plus Tard

Quand vous voudrez utiliser PostgreSQL:

1. Modifier `apps/api/src/app.module.ts`
2. Remplacer la config SQLite par PostgreSQL (voir `DATABASE_SETUP_GUIDE.md`)
3. Installer PostgreSQL (Docker recommandé)
4. Redémarrer l'API

## 🧪 Queries GraphQL Disponibles

### Ingrédients
```graphql
query {
  getAllIngredients { id name }
  getIngredientsByFamily(familyName: "floral") { id name }
  getIngredientsByRegion(region: "Africa") { id name }
  searchIngredients(query: "rose") { id name }
}
```

### Formules
```graphql
mutation {
  createFibonacciFormula(
    name: "Test Rose Jasmin"
    ingredientIds: ["id1", "id2", "id3"]
    complexity: "medium"
  ) {
    id
    name
    topPercentage
    heartPercentage
    basePercentage
  }
}
```

### Outils Avancés
```graphql
query {
  # Carte 3D olfactive
  generateOlfactoryMap

  # Reverse engineering
  reverseEngineerPerfume(perfumeName: "Sauvage", brand: "Dior")

  # Optimisation saisonnière
  getSeasonalProfile(season: "summer")

  # Simulateur peau
  simulateSkinChemistry(
    formulaId: "uuid"
    skinType: "oily"
    skinpH: "normal"
  )
}
```

## 📚 Documentation Complète

- **Backend API**: `PERFUME_ARCHITECT_PRO_PART3_DOCUMENTATION.md`
- **Database Setup**: `DATABASE_SETUP_GUIDE.md`
- **Frontend CRM**: `PERFUME_CRM_FRONTEND_PLAN.md`

## ⚡ Troubleshooting

### Erreur "Port 3001 déjà utilisé"
```bash
# Trouver le processus
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

### Recréer la base de données
```bash
rm apps/api/perfume-architect-pro.db
npm run dev  # Recrée automatiquement
```

### Voir les logs détaillés
La configuration `logging: true` affiche toutes les requêtes SQL.

---

**Perfume Architect Pro v3.0** - Prêt à démarrer! 🌸✨
