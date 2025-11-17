#!/usr/bin/env ts-node

/**
 * Script de Test de la Base de Données Perfume Architect Pro
 *
 * Ce script teste:
 * 1. Connexion à PostgreSQL
 * 2. Vérification des tables
 * 3. Comptage des données seedées
 * 4. Tests de requêtes basiques
 */

import { createConnection, Connection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Charger .env
dotenv.config({ path: join(__dirname, '..', '.env') });

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function testDatabase() {
  console.log('🧪 Démarrage des tests de base de données...\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let connection: Connection | null = null;

  try {
    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Connexion à PostgreSQL
    // ═══════════════════════════════════════════════════════════════
    console.log('📡 Test 1: Connexion à PostgreSQL');

    try {
      connection = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'dataverse',
        password: process.env.DB_PASSWORD || 'dataverse',
        database: process.env.DB_DATABASE || 'dataverse',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        synchronize: false,
        logging: false,
      });

      results.push({
        name: 'Connexion PostgreSQL',
        status: 'PASS',
        message: `Connecté à ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
      });
      console.log('✅ Connexion réussie!\n');
    } catch (error: any) {
      results.push({
        name: 'Connexion PostgreSQL',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}\n`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: Vérifier Version PostgreSQL
    // ═══════════════════════════════════════════════════════════════
    console.log('📊 Test 2: Version PostgreSQL');

    try {
      const versionResult = await connection.query('SELECT version()');
      const version = versionResult[0].version;

      results.push({
        name: 'Version PostgreSQL',
        status: 'PASS',
        message: version.split(',')[0],
        data: { version },
      });
      console.log(`✅ ${version.split(',')[0]}\n`);
    } catch (error: any) {
      results.push({
        name: 'Version PostgreSQL',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: Vérifier Tables Existantes
    // ═══════════════════════════════════════════════════════════════
    console.log('🗂️  Test 3: Tables Existantes');

    const expectedTables = [
      'ingredients',
      'olfactive_families',
      'allergens',
      'formulas',
      'formula_ingredients',
    ];

    try {
      const tablesResult = await connection.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      const existingTables = tablesResult.map((row: any) => row.tablename);
      const missingTables = expectedTables.filter(t => !existingTables.includes(t));

      if (missingTables.length === 0) {
        results.push({
          name: 'Tables Existantes',
          status: 'PASS',
          message: `Toutes les ${expectedTables.length} tables sont présentes`,
          data: { tables: existingTables },
        });
        console.log('✅ Toutes les tables nécessaires existent:');
        existingTables.forEach((table: string) => {
          console.log(`   - ${table}`);
        });
        console.log('');
      } else {
        results.push({
          name: 'Tables Existantes',
          status: 'FAIL',
          message: `Tables manquantes: ${missingTables.join(', ')}`,
          data: { existing: existingTables, missing: missingTables },
        });
        console.log(`❌ Tables manquantes: ${missingTables.join(', ')}`);
        console.log('💡 Conseil: Démarrez l\'API avec "npm run start:dev" pour créer les tables automatiquement\n');
      }
    } catch (error: any) {
      results.push({
        name: 'Tables Existantes',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: Comptage des Données
    // ═══════════════════════════════════════════════════════════════
    console.log('📈 Test 4: Données Seedées');

    const tableChecks = [
      { table: 'ingredients', expected: 70, message: 'ingrédients professionnels' },
      { table: 'olfactive_families', expected: 20, message: 'familles olfactives' },
      { table: 'allergens', expected: 14, message: 'allergènes IFRA' },
    ];

    for (const check of tableChecks) {
      try {
        // Vérifier d'abord si la table existe
        const tableExists = await connection.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = '${check.table}'
          );
        `);

        if (!tableExists[0].exists) {
          results.push({
            name: `Données ${check.table}`,
            status: 'SKIP',
            message: `Table ${check.table} n'existe pas encore`,
          });
          console.log(`⏭️  Table ${check.table} n'existe pas encore`);
          continue;
        }

        const countResult = await connection.query(`SELECT COUNT(*) FROM ${check.table}`);
        const count = parseInt(countResult[0].count);

        if (count >= check.expected) {
          results.push({
            name: `Données ${check.table}`,
            status: 'PASS',
            message: `${count} ${check.message} (attendu: ${check.expected}+)`,
            data: { count, expected: check.expected },
          });
          console.log(`✅ ${check.table}: ${count} ${check.message}`);
        } else if (count === 0) {
          results.push({
            name: `Données ${check.table}`,
            status: 'FAIL',
            message: `0 ${check.message} - données non seedées`,
            data: { count, expected: check.expected },
          });
          console.log(`❌ ${check.table}: 0 ${check.message}`);
          console.log(`   💡 Conseil: Démarrez l'API pour seeder automatiquement les données`);
        } else {
          results.push({
            name: `Données ${check.table}`,
            status: 'FAIL',
            message: `Seulement ${count}/${check.expected} ${check.message}`,
            data: { count, expected: check.expected },
          });
          console.log(`⚠️  ${check.table}: ${count}/${check.expected} ${check.message}`);
        }
      } catch (error: any) {
        results.push({
          name: `Données ${check.table}`,
          status: 'SKIP',
          message: `Table n'existe pas: ${error.message}`,
        });
        console.log(`⏭️  ${check.table}: Table n'existe pas`);
      }
    }
    console.log('');

    // ═══════════════════════════════════════════════════════════════
    // TEST 5: Requêtes de Base
    // ═══════════════════════════════════════════════════════════════
    console.log('🔍 Test 5: Requêtes de Base');

    // Test 5a: Ingrédients par famille
    try {
      const tableExists = await connection.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'ingredients'
        );
      `);

      if (tableExists[0].exists) {
        const result = await connection.query(`
          SELECT
            of.name AS family,
            COUNT(i.id) AS ingredient_count
          FROM olfactive_families of
          LEFT JOIN ingredients i ON i."olfactiveFamilyId" = of.id
          GROUP BY of.id, of.name
          ORDER BY ingredient_count DESC
          LIMIT 5
        `);

        if (result.length > 0) {
          results.push({
            name: 'Requête: Ingrédients par famille',
            status: 'PASS',
            message: `Top 5 familles olfactives trouvées`,
            data: result,
          });
          console.log('✅ Top 5 familles olfactives:');
          result.forEach((row: any) => {
            console.log(`   - ${row.family}: ${row.ingredient_count} ingrédients`);
          });
        } else {
          results.push({
            name: 'Requête: Ingrédients par famille',
            status: 'FAIL',
            message: 'Aucune donnée retournée',
          });
          console.log('⚠️  Aucune donnée trouvée');
        }
      } else {
        results.push({
          name: 'Requête: Ingrédients par famille',
          status: 'SKIP',
          message: 'Table ingredients n\'existe pas',
        });
        console.log('⏭️  Table ingredients n\'existe pas');
      }
    } catch (error: any) {
      results.push({
        name: 'Requête: Ingrédients par famille',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}`);
    }
    console.log('');

    // Test 5b: Ingrédients africains
    try {
      const tableExists = await connection.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'ingredients'
        );
      `);

      if (tableExists[0].exists) {
        const result = await connection.query(`
          SELECT name, "countryOfOrigin"
          FROM ingredients
          WHERE "countryOfOrigin" LIKE '%Africa%'
             OR "countryOfOrigin" LIKE '%Senegal%'
             OR "countryOfOrigin" LIKE '%Sénégal%'
          ORDER BY name
        `);

        if (result.length > 0) {
          results.push({
            name: 'Requête: Ingrédients africains',
            status: 'PASS',
            message: `${result.length} ingrédients africains trouvés`,
            data: result,
          });
          console.log(`✅ Ingrédients africains/sénégalais (${result.length}):`);
          result.forEach((row: any) => {
            console.log(`   - ${row.name} (${row.countryOfOrigin})`);
          });
        } else {
          results.push({
            name: 'Requête: Ingrédients africains',
            status: 'FAIL',
            message: 'Aucun ingrédient africain trouvé',
          });
          console.log('⚠️  Aucun ingrédient africain trouvé');
        }
      } else {
        results.push({
          name: 'Requête: Ingrédients africains',
          status: 'SKIP',
          message: 'Table ingredients n\'existe pas',
        });
        console.log('⏭️  Table ingredients n\'existe pas');
      }
    } catch (error: any) {
      results.push({
        name: 'Requête: Ingrédients africains',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}`);
    }
    console.log('');

    // ═══════════════════════════════════════════════════════════════
    // TEST 6: Taille de la Base de Données
    // ═══════════════════════════════════════════════════════════════
    console.log('💾 Test 6: Taille de la Base de Données');

    try {
      const sizeResult = await connection.query(`
        SELECT
          pg_size_pretty(pg_database_size('${process.env.DB_DATABASE || 'dataverse'}')) AS size
      `);

      results.push({
        name: 'Taille base de données',
        status: 'PASS',
        message: `Taille actuelle: ${sizeResult[0].size}`,
        data: sizeResult[0],
      });
      console.log(`✅ Taille: ${sizeResult[0].size}\n`);
    } catch (error: any) {
      results.push({
        name: 'Taille base de données',
        status: 'FAIL',
        message: `Erreur: ${error.message}`,
      });
      console.log(`❌ Échec: ${error.message}\n`);
    }

  } catch (error: any) {
    console.error('\n❌ Erreur critique:', error.message);
    console.error('\n💡 Vérifiez que PostgreSQL est démarré et que .env est correctement configuré\n');
  } finally {
    if (connection) {
      await connection.close();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RÉSUMÉ DES TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`Total: ${total} tests`);
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`⏭️  Ignorés: ${skipped}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ STATUT: ÉCHEC\n');
    console.log('🔧 ACTIONS RECOMMANDÉES:\n');

    const hasNoTables = results.some(r => r.name === 'Tables Existantes' && r.status === 'FAIL');
    const hasNoData = results.some(r => r.name.startsWith('Données') && r.status === 'FAIL');

    if (hasNoTables) {
      console.log('1. Les tables n\'existent pas encore:');
      console.log('   cd apps/api');
      console.log('   npm install');
      console.log('   npm run start:dev');
      console.log('   (TypeORM créera automatiquement les tables)\n');
    }

    if (hasNoData) {
      console.log('2. Les données ne sont pas seedées:');
      console.log('   Démarrez l\'API - PerfumeService.onModuleInit() seedera automatiquement');
      console.log('   les 70+ ingrédients, 20 familles olfactives, et 14 allergènes\n');
    }

    const hasConnectionError = results.some(r => r.name === 'Connexion PostgreSQL' && r.status === 'FAIL');
    if (hasConnectionError) {
      console.log('3. PostgreSQL n\'est pas accessible:');
      console.log('   sudo systemctl start postgresql');
      console.log('   ou');
      console.log('   docker-compose up -d postgres\n');
    }

    process.exit(1);
  } else if (skipped > 0) {
    console.log('⚠️  STATUT: PARTIEL (certains tests ignorés)\n');
    console.log('💡 Pour des tests complets, démarrez l\'API pour créer tables et données\n');
    process.exit(0);
  } else {
    console.log('✅ STATUT: SUCCÈS\n');
    console.log('🎉 La base de données Perfume Architect Pro est correctement configurée!\n');
    console.log('🚀 Prochaine étape: Démarrer l\'API GraphQL');
    console.log('   cd apps/api && npm run start:dev\n');
    process.exit(0);
  }
}

// Exécuter les tests
testDatabase().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
