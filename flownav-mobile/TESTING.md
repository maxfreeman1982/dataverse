# FlowNav Mobile - Testing Guide

Guide complet pour exécuter et comprendre la suite de tests FlowNav.

## 📋 Table des Matières

- [Installation](#installation)
- [Commandes de Test](#commandes-de-test)
- [Structure des Tests](#structure-des-tests)
- [Coverage Actuel](#coverage-actuel)
- [Tests Critiques](#tests-critiques)
- [CI/CD Integration](#cicd-integration)
- [Debugging Tests](#debugging-tests)

## 🚀 Installation

```bash
cd flownav-mobile
npm install
```

## 🧪 Commandes de Test

### Tests Basiques

```bash
# Lancer tous les tests
npm test

# Mode watch (relance auto sur changement)
npm run test:watch

# Avec coverage
npm run test:coverage

# CI mode (pour GitHub Actions)
npm run test:ci

# Mettre à jour les snapshots
npm run test:update-snapshots
```

### Tests Spécifiques

```bash
# Tester un fichier spécifique
npm test -- anonymization.test.ts

# Tester un pattern
npm test -- --testPathPattern=utils

# Mode verbose
npm test -- --verbose

# Voir uniquement les échecs
npm test -- --onlyFailures
```

### Validation Complète

```bash
# Lint + Type check + Tests
npm run validate
```

## 📁 Structure des Tests

```
flownav-mobile/
├── __mocks__/                          # Mocks globaux
│   ├── fileMock.js                     # Mock images/médias
│   └── vectorIconsMock.js              # Mock icônes
├── jest.config.js                      # Configuration Jest
├── jest.setup.js                       # Setup global tests
└── src/
    ├── utils/__tests__/
    │   ├── anonymization.test.ts       # Privacy & k-anonymity
    │   └── accessibility.test.ts       # WCAG compliance
    ├── services/__tests__/
    │   └── GpsAggregationService.test.ts  # GPS aggregation
    ├── models/__tests__/
    │   └── TravelTimeOptimizer.test.ts    # t₀ optimization
    └── theme/__tests__/
        └── ThemeContext.test.tsx       # Theme management
```

## 📊 Coverage Actuel

### Seuils de Coverage (package.json)

```json
{
  "coverageThresholds": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### Fichiers Exclus

- `**/*.d.ts` - Définitions TypeScript
- `src/types/**/*` - Types seulement
- `**/*.stories.{ts,tsx}` - Storybook

### Voir le Coverage

```bash
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

## 🔐 Tests Critiques

### 1. Privacy & K-Anonymity (`anonymization.test.ts`)

**Tests Cruciaux:**
- ✅ Génération ID éphémère (10-15 min)
- ✅ Validation k-anonymity (k≥3)
- ✅ Hashing segment sans GPS brut
- ✅ Sanitization métadonnées
- ✅ Secret quotidien rotatif

**Vérifications:**
```typescript
// JAMAIS de coordonnées GPS brutes
expect(sanitized).not.toHaveProperty('latitude');
expect(sanitized).not.toHaveProperty('longitude');

// Toujours k≥3
expect(aggregate.veh_count).toBeGreaterThanOrEqual(3);
```

### 2. GPS Aggregation (`GpsAggregationService.test.ts`)

**Tests Cruciaux:**
- ✅ Conversion GPS → segment ID immédiate
- ✅ Aucun stockage GPS brut
- ✅ Enforcement k-anonymity sur retour
- ✅ Fenêtres temporelles 5 min
- ✅ Statistiques (avg, std, confidence)

**Garanties:**
```typescript
// GPS éliminé après traitement
const aggregates = service.getAggregates();
aggregates.forEach(agg => {
  expect(agg).not.toHaveProperty('coordinate');
});
```

### 3. Travel Time Optimization (`TravelTimeOptimizer.test.ts`)

**Tests Cruciaux:**
- ✅ Formule T(t₀) = Σᵢ[Δxᵢ / vᵢ(t₀ + Σⱼ Δtⱼ)]
- ✅ Recherche argmin T(t₀)
- ✅ Progression temporelle entre segments
- ✅ Calcul gain en minutes
- ✅ Respect fenêtre flexibilité

**Validation Algorithme:**
```typescript
// Vérifie implémentation mathématique correcte
const result = optimizer.calculateTravelTime(route, t0);
// T(t₀) = Δt₁ + Δt₂ + ... + Δtₙ
expect(result.totalMinutes).toBeCloseTo(expectedTotal, 1);
```

### 4. Accessibility (`accessibility.test.ts`)

**Tests Cruciaux:**
- ✅ Contraste WCAG AA/AAA
- ✅ Touch targets ≥ 44px
- ✅ Formatage screen readers
- ✅ Props builders (button, slider, etc.)
- ✅ Validation couleurs FlowNav

**Standards:**
```typescript
// Contraste minimum
expect(meetsContrastRatio('#2196F3', '#FFFFFF', 'AA').passes).toBe(true);

// Touch targets
expect(ensureTouchTargetSize(24).width).toBeGreaterThanOrEqual(44);
```

### 5. Theme Context (`ThemeContext.test.tsx`)

**Tests Cruciaux:**
- ✅ Light/Dark/Auto modes
- ✅ Persistence AsyncStorage
- ✅ Transitions animées
- ✅ Palettes complètes
- ✅ Contraste suffisant

## 🤖 CI/CD Integration

### GitHub Actions Workflow

Fichier: `.github/workflows/flownav-mobile-ci.yml`

**Jobs:**

1. **Lint & Type Check**
   - ESLint
   - TypeScript type check

2. **Unit Tests**
   - Jest avec coverage
   - Upload vers Codecov

3. **Build Android**
   - APK debug
   - Upload artefact

4. **Build iOS**
   - Simulator build
   - CocoaPods install

5. **Security Audit**
   - npm audit
   - Détection fichiers sensibles

6. **Privacy Validation**
   - Vérification k-anonymity
   - Détection GPS brut

7. **Accessibility Check**
   - Comptage labels a11y
   - Vérification WCAG utils

### Déclencheurs

```yaml
on:
  push:
    branches: [main, develop, 'claude/**']
    paths:
      - 'flownav-mobile/**'
  pull_request:
    branches: [main, develop]
```

### Voir les Résultats

- **GitHub Actions**: Actions tab dans repo
- **Coverage**: Codecov dashboard
- **Summary**: Job summary dans GitHub

## 🐛 Debugging Tests

### Isoler un Test

```typescript
// Exécuter seulement ce test
it.only('should validate k-anonymity', () => {
  // ...
});

// Skip ce test
it.skip('should handle edge case', () => {
  // ...
});
```

### Debug avec Console

```typescript
it('should calculate correctly', () => {
  const result = calculate();
  console.log('Result:', JSON.stringify(result, null, 2));
  expect(result).toBe(expected);
});
```

### Lancer avec Node Debugger

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Puis ouvrir `chrome://inspect` dans Chrome.

### Verbose Output

```bash
npm test -- --verbose --no-coverage
```

### Voir tous les Matchers Disponibles

```typescript
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeCloseTo(expected, precision);
expect(value).toBeGreaterThan(min);
expect(value).toBeLessThan(max);
expect(value).toHaveProperty('key');
expect(value).toMatch(/regex/);
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
```

## 📈 Améliorer le Coverage

### 1. Identifier les Gaps

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

Chercher lignes en **rouge** (non couvertes).

### 2. Ajouter Tests Manquants

```typescript
describe('Edge Cases', () => {
  it('should handle empty input', () => {
    // ...
  });

  it('should handle null values', () => {
    // ...
  });

  it('should handle very large numbers', () => {
    // ...
  });
});
```

### 3. Tester Error Paths

```typescript
it('should throw error on invalid input', () => {
  expect(() => {
    processInvalidData();
  }).toThrow('Invalid data');
});
```

## 🎯 Best Practices

### 1. Nomenclature

```typescript
describe('ComponentName', () => {
  describe('featureOrMethod', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...;

      // Act
      const result = doSomething(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 2. Isolation

```typescript
beforeEach(() => {
  // Setup frais pour chaque test
  service = new MyService();
});

afterEach(() => {
  // Cleanup
  service.reset();
  jest.clearAllMocks();
});
```

### 3. Async Tests

```typescript
it('should fetch data', async () => {
  const promise = fetchData();
  await expect(promise).resolves.toBe(expected);
});

// Ou
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBe(expected);
});
```

### 4. Mocking

```typescript
// Mock fonction
const mockFn = jest.fn().mockReturnValue(42);

// Mock module
jest.mock('../api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));

// Vérifier appels
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

## 📝 Écrire de Nouveaux Tests

### Template de Base

```typescript
/**
 * Tests for NewFeature
 *
 * Description du module testé
 */

import { NewFeature } from '../NewFeature';

describe('NewFeature', () => {
  let feature: NewFeature;

  beforeEach(() => {
    feature = new NewFeature();
  });

  describe('mainMethod', () => {
    it('should handle normal case', () => {
      const result = feature.mainMethod('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const result = feature.mainMethod('');
      expect(result).toBe('');
    });

    it('should throw on invalid input', () => {
      expect(() => {
        feature.mainMethod(null);
      }).toThrow();
    });
  });
});
```

### Custom Matchers

```typescript
// Dans jest.setup.js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

// Usage
expect(value).toBeWithinRange(10, 20);
```

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [FlowNav Technical Spec](../flownav-technical-specification.json)

## ✅ Checklist Pre-Commit

Avant de commit:

- [ ] `npm run lint` passe
- [ ] `npm run type-check` passe
- [ ] `npm test` passe (tous les tests verts)
- [ ] Coverage ≥ 70% sur nouveaux fichiers
- [ ] Tests privacy si modification anonymization
- [ ] Tests accessibility si modification UI
- [ ] README mis à jour si nouvelles fonctionnalités

## 🆘 Aide

Si les tests échouent:

1. Lire le message d'erreur attentivement
2. Vérifier les modifications récentes
3. Lancer le test isolément: `npm test -- filename.test.ts`
4. Ajouter `console.log` pour débugger
5. Vérifier les mocks dans `jest.setup.js`
6. Consulter la doc Jest/React Native Testing Library

---

**Maintenu par**: FlowNav Team
**Dernière mise à jour**: 2025-01-17
