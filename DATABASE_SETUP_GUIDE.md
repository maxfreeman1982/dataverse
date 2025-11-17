# 🗄️ Perfume Architect Pro - Guide Base de Données

## 📋 Table des Matières

1. [Architecture de la Base de Données](#architecture)
2. [Configuration PostgreSQL](#configuration-postgresql)
3. [Schéma des Tables](#schéma-des-tables)
4. [Relations](#relations)
5. [Scripts de Test](#scripts-de-test)
6. [Migration vers Production](#migration-production)

---

## 🏗️ Architecture de la Base de Données

### Stack Technique
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **API**: GraphQL (Apollo Server)
- **Backend**: NestJS

### 5 Entités Principales

```
┌─────────────────┐
│   Ingredient    │◄────┐
│  (70+ items)    │     │
└─────────────────┘     │
                        │
┌─────────────────┐     │     ┌─────────────────┐
│ OlfactiveFamily │     │     │    Allergen     │
│   (20 items)    │     │     │   (14 items)    │
└─────────────────┘     │     └─────────────────┘
                        │
                        │
        ┌───────────────┴──────────────┐
        │                              │
┌───────▼──────────┐         ┌─────────▼────────┐
│     Formula      │◄────────┤ FormulaIngredient│
│  (User created)  │         │  (Many-to-Many)  │
└──────────────────┘         └──────────────────┘
```

---

## ⚙️ Configuration PostgreSQL

### Option 1: PostgreSQL Local (Recommandé pour développement)

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- Télécharger depuis: https://www.postgresql.org/download/windows/
- Installer et démarrer le service

#### Création de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql:
CREATE DATABASE dataverse;
CREATE USER dataverse WITH PASSWORD 'dataverse';
GRANT ALL PRIVILEGES ON DATABASE dataverse TO dataverse;

# Sortir
\q
```

#### Vérifier la Connexion

```bash
psql -h localhost -U dataverse -d dataverse -c "SELECT version();"
```

### Option 2: Docker PostgreSQL (Rapide et isolé)

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: dataverse-postgres
    environment:
      POSTGRES_DB: dataverse
      POSTGRES_USER: dataverse
      POSTGRES_PASSWORD: dataverse
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Démarrer

```bash
docker-compose up -d postgres

# Vérifier
docker-compose ps
docker-compose logs postgres
```

### Option 3: PostgreSQL Cloud (Production)

**Services recommandés:**
- **Supabase** (gratuit jusqu'à 500 MB): https://supabase.com
- **Neon** (gratuit 3 GB): https://neon.tech
- **Railway** (gratuit $5/mois crédit): https://railway.app
- **Render** (gratuit 1 GB): https://render.com

**Configuration .env pour cloud:**
```bash
DB_HOST=your-cloud-host.region.provider.com
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=dataverse
DB_SSL=true  # Important pour connexions cloud
```

---

## 📊 Schéma des Tables

### Table: `ingredients`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | Nom de l'ingrédient |
| `casNumber` | VARCHAR(50) | Numéro CAS chimique |
| `volatility` | ENUM | top, top_heart, heart, heart_base, base |
| `volatilityIndex` | INT | 1-100 (vitesse d'évaporation) |
| `strength` | FLOAT | 1-10 (puissance olfactive) |
| `diffusion` | FLOAT | 1-10 (capacité de diffusion) |
| `tenacity` | FLOAT | 1-10 (longévité) |
| `recommendedDosageMin` | FLOAT | % minimum recommandé |
| `recommendedDosageMax` | FLOAT | % maximum recommandé |
| `ifraMaxCategory1` | FLOAT | Limite IFRA catégorie 1 (lèvres) |
| `ifraMaxCategory2` | FLOAT | Limite IFRA catégorie 2 (aisselles) |
| `ifraMaxCategory3` | FLOAT | Limite IFRA catégorie 3 (visage) |
| `ifraMaxCategory4` | FLOAT | Limite IFRA catégorie 4 (parfums) |
| `ifraMaxCategory5` | FLOAT | Limite IFRA catégorie 5 (corps) |
| `ifraMaxCategory6` | FLOAT | Limite IFRA catégorie 6 (air) |
| `ifraMaxCategory7` | FLOAT | Limite IFRA catégorie 7 (bijoux) |
| `ifraMaxCategory8` | FLOAT | Limite IFRA catégorie 8 (tissus) |
| `ifraMaxCategory9` | FLOAT | Limite IFRA catégorie 9 (contact) |
| `ifraMaxCategory10` | FLOAT | Limite IFRA catégorie 10 (maison) |
| `ifraMaxCategory11` | FLOAT | Limite IFRA catégorie 11 (non-contact) |
| `pricePerKg` | FLOAT | Prix en €/kg |
| `countryOfOrigin` | VARCHAR(100) | Pays d'origine |
| `isNatural` | BOOLEAN | Naturel vs synthétique |
| `odorProfile` | JSON | Array de descripteurs olfactifs |
| `allergens` | JSON | Array d'allergènes |
| `synergiesWith` | JSON | Array d'ingrédients synergiques |
| `conflictsWith` | JSON | Array d'ingrédients conflictuels |
| `olfactiveFamilyId` | UUID | Foreign Key → olfactive_families |

**Index:**
- `idx_ingredients_name` sur `name`
- `idx_ingredients_volatility` sur `volatility`
- `idx_ingredients_family` sur `olfactiveFamilyId`

### Table: `olfactive_families`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Nom de la famille (Floral, Citrus, etc.) |
| `description` | TEXT | Description |
| `classification` | ENUM | classic, niche, regional, rare |
| `regionalAssociation` | VARCHAR(100) | Association régionale |

**Données initiales (20 familles):**
- Floral, Citrus, Woody, Oriental, Fresh, Aquatic, Green, Fruity, Spicy, Gourmand, Chypre, Fougère, Leather, Animalic, Powdery, Aldéhydique, Aromatic, Amber, Musk, Resinous

### Table: `allergens`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Nom de l'allergène |
| `casNumber` | VARCHAR(50) | Numéro CAS |
| `labelingThreshold` | FLOAT | Seuil d'étiquetage (%) |
| `maxConcentrationLeaveOn` | FLOAT | Concentration max produits sans rinçage |
| `maxConcentrationRinseOff` | FLOAT | Concentration max produits à rincer |
| `ifraRestricted` | BOOLEAN | Restreint par IFRA |

**Données initiales (14 allergènes):**
- Citronellol, Geraniol, Linalool, Limonene, Coumarin, Eugenol, Cinnamal, Citral, Benzyl Alcohol, Benzyl Salicylate, Farnesol, Hydroxycitronellal, Isoeugenol, Alpha-Isomethyl Ionone

### Table: `formulas`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | Nom de la formule |
| `description` | TEXT | Description |
| `type` | ENUM | edp, edt, edc, perfume_oil, extrait |
| `concentration` | FLOAT | Concentration totale (%) |
| `structureType` | ENUM | traditional_pyramid, fibonacci, golden_ratio, fractal |
| `topPercentage` | FLOAT | % notes de tête |
| `heartPercentage` | FLOAT | % notes de cœur |
| `basePercentage` | FLOAT | % notes de fond |
| `moodCategory` | VARCHAR(50) | Catégorie mood |
| `targetSeason` | VARCHAR(50) | Saison cible |
| `targetGender` | VARCHAR(50) | Genre cible |
| `createdBy` | VARCHAR(100) | Créateur |
| `createdAt` | TIMESTAMP | Date création |
| `updatedAt` | TIMESTAMP | Date modification |

**Index:**
- `idx_formulas_type` sur `type`
- `idx_formulas_mood` sur `moodCategory`
- `idx_formulas_season` sur `targetSeason`

### Table: `formula_ingredients` (Table de jonction Many-to-Many)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `formulaId` | UUID | Foreign Key → formulas |
| `ingredientId` | UUID | Foreign Key → ingredients |
| `percentage` | FLOAT | Pourcentage dans la formule |
| `weight` | FLOAT | Poids en grammes (si calculé) |
| `role` | VARCHAR(100) | Rôle dans la formule |
| `dilution` | FLOAT | Taux de dilution si applicable |

**Index:**
- `idx_formula_ingredients_formula` sur `formulaId`
- `idx_formula_ingredients_ingredient` sur `ingredientId`
- UNIQUE constraint sur (`formulaId`, `ingredientId`)

---

## 🔗 Relations

```sql
-- Ingredient → OlfactiveFamily (Many-to-One)
ALTER TABLE ingredients
ADD CONSTRAINT fk_ingredient_family
FOREIGN KEY (olfactiveFamilyId) REFERENCES olfactive_families(id)
ON DELETE SET NULL;

-- FormulaIngredient → Formula (Many-to-One)
ALTER TABLE formula_ingredients
ADD CONSTRAINT fk_formula_ingredient_formula
FOREIGN KEY (formulaId) REFERENCES formulas(id)
ON DELETE CASCADE;

-- FormulaIngredient → Ingredient (Many-to-One)
ALTER TABLE formula_ingredients
ADD CONSTRAINT fk_formula_ingredient_ingredient
FOREIGN KEY (ingredientId) REFERENCES ingredients(id)
ON DELETE CASCADE;
```

---

## 🧪 Scripts de Test

### 1. Tester la Connexion PostgreSQL

```bash
# Depuis le répertoire racine
npm run test:db
```

Ou manuellement:
```bash
psql -h localhost -U dataverse -d dataverse -c "\dt"
```

### 2. Démarrer l'API et Auto-créer les Tables

```bash
# Install dependencies
cd apps/api
npm install

# Run API (TypeORM synchronize=true créera les tables automatiquement)
npm run start:dev
```

**Vérifier les tables créées:**
```bash
psql -h localhost -U dataverse -d dataverse -c "\dt"
```

Devrait afficher:
```
 Schema |         Name          | Type  |   Owner
--------+-----------------------+-------+-----------
 public | allergens             | table | dataverse
 public | formula_ingredients   | table | dataverse
 public | formulas              | table | dataverse
 public | ingredients           | table | dataverse
 public | olfactive_families    | table | dataverse
```

### 3. Tester GraphQL Playground

Une fois l'API démarrée:

**URL:** http://localhost:3001/graphql

**Query de test:**
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

Cette query devrait retourner les 70+ ingrédients créés automatiquement lors du démarrage.

### 4. Tester Création de Formule

```graphql
mutation {
  createFibonacciFormula(
    name: "Test Rose Jasmin"
    ingredientIds: [
      # Remplacer par des IDs réels d'ingrédients
      "uuid-1",
      "uuid-2",
      "uuid-3"
    ]
    complexity: "medium"
  ) {
    id
    name
    topPercentage
    heartPercentage
    basePercentage
    ingredients {
      ingredient {
        name
      }
      percentage
    }
  }
}
```

### 5. Vérifier le Seeding des Données

Après le premier démarrage, vérifier que les données sont créées:

```sql
-- Compter les ingrédients
SELECT COUNT(*) FROM ingredients;
-- Devrait retourner: 70+

-- Compter les familles olfactives
SELECT COUNT(*) FROM olfactive_families;
-- Devrait retourner: 20

-- Compter les allergènes
SELECT COUNT(*) FROM allergens;
-- Devrait retourner: 14

-- Voir les ingrédients africains
SELECT name, countryOfOrigin
FROM ingredients
WHERE countryOfOrigin LIKE '%Africa%' OR countryOfOrigin LIKE '%Senegal%';
```

---

## 🚀 Migration vers Production

### 1. Désactiver Auto-Synchronize

Dans `.env` production:
```bash
NODE_ENV=production
```

Dans `app.module.ts`, TypeORM configuration:
```typescript
synchronize: configService.get('NODE_ENV') !== 'production', // ✅ Déjà configuré
```

### 2. Créer des Migrations TypeORM

```bash
# Générer une migration
npm run typeorm migration:generate -- -n InitialSchema

# Exécuter les migrations
npm run typeorm migration:run

# Annuler dernière migration
npm run typeorm migration:revert
```

### 3. Backup Base de Données

```bash
# Backup complet
pg_dump -h localhost -U dataverse dataverse > backup_$(date +%Y%m%d).sql

# Restaurer backup
psql -h localhost -U dataverse dataverse < backup_20241117.sql
```

### 4. Performance Tuning

**Indexes importants:**
```sql
-- Optimiser recherches par nom
CREATE INDEX idx_ingredients_name_trgm ON ingredients USING gin (name gin_trgm_ops);

-- Optimiser recherches full-text
CREATE INDEX idx_ingredients_odor_profile ON ingredients USING gin (odor_profile jsonb_path_ops);

-- Analyser performance
EXPLAIN ANALYZE SELECT * FROM ingredients WHERE name ILIKE '%rose%';
```

**PostgreSQL Configuration (postgresql.conf):**
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
max_connections = 100
```

---

## 📈 Monitoring et Maintenance

### Requêtes Utiles

```sql
-- Taille de chaque table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Nombre d'entrées par table
SELECT
  'ingredients' AS table_name, COUNT(*) AS count FROM ingredients
UNION ALL
SELECT 'formulas', COUNT(*) FROM formulas
UNION ALL
SELECT 'formula_ingredients', COUNT(*) FROM formula_ingredients
UNION ALL
SELECT 'olfactive_families', COUNT(*) FROM olfactive_families
UNION ALL
SELECT 'allergens', COUNT(*) FROM allergens;

-- Formules les plus utilisées
SELECT
  f.name,
  COUNT(fi.id) AS ingredient_count
FROM formulas f
LEFT JOIN formula_ingredients fi ON f.id = fi."formulaId"
GROUP BY f.id, f.name
ORDER BY ingredient_count DESC;

-- Ingrédients les plus utilisés
SELECT
  i.name,
  COUNT(fi.id) AS usage_count
FROM ingredients i
LEFT JOIN formula_ingredients fi ON i.id = fi."ingredientId"
GROUP BY i.id, i.name
ORDER BY usage_count DESC
LIMIT 10;
```

---

## ✅ Checklist de Configuration

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `dataverse` créée
- [ ] Utilisateur `dataverse` créé avec permissions
- [ ] `.env` configuré avec bonnes credentials
- [ ] `npm install` exécuté
- [ ] API démarrée (`npm run start:dev`)
- [ ] Tables auto-créées par TypeORM (vérifier avec `\dt`)
- [ ] 70+ ingrédients seedés automatiquement
- [ ] GraphQL Playground accessible (http://localhost:3001/graphql)
- [ ] Query `getAllIngredients` fonctionne
- [ ] Tests de création de formule réussis

---

## 🆘 Troubleshooting

### Erreur: "Connection refused"

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Redémarrer si nécessaire
sudo systemctl restart postgresql
```

### Erreur: "password authentication failed"

Vérifier `.env`:
```bash
DB_USERNAME=dataverse
DB_PASSWORD=dataverse
```

Réinitialiser le mot de passe:
```sql
ALTER USER dataverse WITH PASSWORD 'dataverse';
```

### Erreur: "database does not exist"

```bash
sudo -u postgres psql -c "CREATE DATABASE dataverse;"
```

### Tables non créées

Vérifier dans `app.module.ts`:
```typescript
synchronize: configService.get('NODE_ENV') !== 'production', // Doit être true en dev
```

Vérifier logs de l'API au démarrage pour voir les queries SQL.

### Données non seedées

Vérifier que `PerfumeService.onModuleInit()` est appelé:
```typescript
// Dans perfume.service.ts
async onModuleInit() {
  await this.seedDatabase(); // Cette méthode seed toutes les données
}
```

---

## 📚 Ressources

- **TypeORM Documentation**: https://typeorm.io/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **NestJS Database**: https://docs.nestjs.com/techniques/database
- **GraphQL Playground**: https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/

---

**Guide créé pour Perfume Architect Pro v3.0**
**Date:** Novembre 2025
