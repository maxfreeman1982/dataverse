# 🚀 Démarrage Rapide avec SQLite

Pour tester rapidement Perfume Architect Pro sans configuration PostgreSQL complexe, utilisez SQLite:

## Configuration

**1. Modifier `apps/api/src/app.module.ts`:**

Remplacer la configuration TypeORM par:

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'sqlite',
    database: 'perfume-architect-pro.db',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true,
    logging: true,
  }),
}),
```

**2. Démarrer l'API:**

```bash
cd apps/api
npm install
npm run start:dev
```

✅ SQLite créera automatiquement le fichier `perfume-architect-pro.db` avec toutes les tables et données!

## Avantages
- ✅ Pas de configuration serveur
- ✅ Fichier unique portable
- ✅ Parfait pour développement/tests
- ✅ Fonctionne immédiatement

## Passer à PostgreSQL plus tard

Quand vous serez prêt pour PostgreSQL:
1. Installer Docker
2. `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dataverse postgres:14`
3. Remettre la configuration PostgreSQL dans `app.module.ts`
