# 🚀 Quick Start - Test FootMind Engine

Guide ultra-rapide pour démarrer et tester le système en 3 minutes.

---

## ⚡ Méthode 1 : Script Automatisé (RECOMMANDÉ)

### Étape 1 : Démarrer l'environnement

```bash
# Démarrer PostgreSQL
docker compose up -d

# Démarrer les serveurs (2 terminaux)
# Terminal 1:
cd apps/api && pnpm dev

# Terminal 2:
cd apps/web && pnpm dev
```

### Étape 2 : Lancer le test automatique

```bash
# Une seule commande pour tout tester
./scripts/quick-test.sh
```

Le script va automatiquement :
- ✅ Créer un compte utilisateur
- ✅ Seeder les données (équipes, joueurs, matchs)
- ✅ Importer des CSV (tracking + events)
- ✅ Exporter JSON et Excel
- ✅ Afficher un résumé complet

**Résultat :** Tous les fichiers exportés dans `test-output/`

---

## 📖 Méthode 2 : Manuel (Étape par Étape)

Suivez le guide complet : **`TEST_GUIDE.md`**

Sections détaillées :
1. Démarrage de l'environnement
2. Création des données de test
3. Test de l'interface web
4. Test de l'import CSV
5. Test de l'export JSON/Excel
6. Troubleshooting

---

## 📁 Fichiers de Test Fournis

```
test-data/
├── tracking_data_sample.csv    # 21 frames de tracking
└── match_events_sample.csv     # 25 événements de match
```

Ces fichiers sont prêts à l'emploi pour tester l'import.

---

## 🌐 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application web Next.js |
| **Dashboard** | http://localhost:3000/football | Dashboard principal |
| **Import/Export** | http://localhost:3000/football/import-export | Interface upload/download |
| **GraphQL** | http://localhost:3001/graphql | Playground GraphQL |
| **API** | http://localhost:3001 | Backend NestJS |

---

## 🎯 Test Rapide Frontend

1. Ouvrez http://localhost:3000/football/import-export
2. Entrez un Match ID (récupéré via GraphQL)
3. Uploadez `test-data/tracking_data_sample.csv`
4. Cliquez sur les boutons de téléchargement Excel/JSON

---

## 📚 Documentation Complète

| Document | Contenu |
|----------|---------|
| `TEST_GUIDE.md` | Guide de test complet pas-à-pas |
| `IMPORT_EXPORT_GUIDE.md` | Documentation API REST (800+ lignes) |
| `VISUALIZATION_3D_GUIDE.md` | Guide visualisation 3D |
| `FOOTBALL_MODULE_README.md` | Documentation module football |

---

## ✅ Checklist Rapide

- [ ] PostgreSQL démarré (`docker compose up -d`)
- [ ] API démarrée (`cd apps/api && pnpm dev`)
- [ ] Frontend démarré (`cd apps/web && pnpm dev`)
- [ ] Script de test exécuté (`./scripts/quick-test.sh`)
- [ ] Fichiers dans `test-output/` vérifiés

---

## 🐛 Problème ?

**L'API ne se connecte pas à PostgreSQL**
```bash
docker compose up -d
docker ps | grep postgres
```

**Script quick-test.sh échoue**
- Vérifiez que l'API tourne sur port 3001
- Vérifiez que jq est installé : `sudo apt install jq`

**Import CSV retourne des erreurs**
- Utilisez les fichiers fournis dans `test-data/`
- Vérifiez le format avec `head test-data/tracking_data_sample.csv`

---

## 🎉 Résultat Attendu

Après le script `quick-test.sh`, vous devriez avoir :

```
test-output/
├── analysis-{id}.json              # Analysis JSON
├── match-{id}-statistics.xlsx      # Match Excel (4 sheets)
└── team-{id}-statistics.xlsx       # Team Excel (4 sheets)
```

Et dans la console :
```
✓ Tracking data importé: 21 lignes
✓ Match events importés: 25 lignes
✓ Analysis JSON exporté
✓ Match Excel exporté
✓ Team Excel exporté
Tests terminés avec succès ! 🎉
```

---

**Prêt ? Lancez :** `./scripts/quick-test.sh` 🚀
