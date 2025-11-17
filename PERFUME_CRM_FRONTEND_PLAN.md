# 🎨 Perfume Architect Pro - Plan Frontend CRM Professionnel

**Version:** 1.0
**Date:** Novembre 2025
**Framework:** Next.js 14 + React 18 + TypeScript

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Design System](#design-system)
4. [Modules CRM](#modules-crm)
5. [Pages & Routes](#pages--routes)
6. [Composants Réutilisables](#composants-réutilisables)
7. [État Global & Data Fetching](#état-global--data-fetching)
8. [Roadmap d'Implémentation](#roadmap-dimplémentation)

---

## 🌟 Vue d'Ensemble

### Objectif

Créer un **CRM professionnel** pour Perfume Architect Pro qui permet aux parfumeurs, marques, et distributeurs de:

- **Gérer les ingrédients** (inventaire, fournisseurs, prix)
- **Créer des formules** (assistant IA, calculs automatiques, IFRA)
- **Analyser les performances** (ventes, popularité, ROI)
- **Gérer les clients** (profils de peau, préférences, historique)
- **Optimiser la production** (batch, coûts, planning)
- **Collaborer** (équipes, partage de formules, workflow)

### Stack Technique Frontend

| Technologie | Utilisation |
|-------------|-------------|
| **Next.js 14** | Framework React (App Router) |
| **React 18** | UI Library |
| **TypeScript** | Type Safety |
| **TailwindCSS** | Styling & Design System |
| **shadcn/ui** | Composants UI de haute qualité |
| **Apollo Client** | GraphQL Data Fetching |
| **Zustand** | État Global Léger |
| **React Hook Form** | Gestion de Formulaires |
| **Zod** | Validation |
| **Recharts** | Graphiques & Analytics |
| **Framer Motion** | Animations |
| **react-beautiful-dnd** | Drag & Drop |
| **date-fns** | Manipulation de dates |

---

## 🏗️ Architecture Technique

### Structure de Dossiers

```
apps/web/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Routes authentification
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Routes dashboard (layout partagé)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── ingredients/
│   │   ├── formulas/
│   │   ├── clients/
│   │   ├── production/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layout.tsx              # Root layout
│   └── providers.tsx           # Context providers
│
├── components/                  # Composants réutilisables
│   ├── ui/                     # Composants UI de base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                 # Composants layout
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── navbar.tsx
│   │   └── breadcrumbs.tsx
│   ├── perfume/                # Composants spécifiques parfumerie
│   │   ├── ingredient-card.tsx
│   │   ├── formula-builder.tsx
│   │   ├── olfactory-pyramid.tsx
│   │   ├── ifra-badge.tsx
│   │   └── scent-wheel.tsx
│   ├── charts/                 # Composants graphiques
│   │   ├── revenue-chart.tsx
│   │   ├── popularity-chart.tsx
│   │   └── inventory-chart.tsx
│   └── forms/                  # Formulaires complexes
│       ├── ingredient-form.tsx
│       ├── formula-form.tsx
│       └── client-form.tsx
│
├── lib/                        # Utilitaires
│   ├── apollo-client.ts       # Configuration Apollo
│   ├── utils.ts               # Fonctions utilitaires
│   ├── validations/           # Schémas Zod
│   └── constants.ts           # Constantes
│
├── hooks/                      # Custom React hooks
│   ├── use-ingredients.ts
│   ├── use-formulas.ts
│   ├── use-analytics.ts
│   └── use-toast.ts
│
├── store/                      # État global (Zustand)
│   ├── auth-store.ts
│   ├── formula-builder-store.ts
│   └── ui-store.ts
│
├── graphql/                    # Queries & Mutations GraphQL
│   ├── queries/
│   │   ├── ingredients.ts
│   │   ├── formulas.ts
│   │   └── analytics.ts
│   └── mutations/
│       ├── create-formula.ts
│       └── update-ingredient.ts
│
├── types/                      # TypeScript types
│   ├── ingredient.ts
│   ├── formula.ts
│   └── api.ts
│
└── styles/
    └── globals.css            # Styles globaux TailwindCSS
```

### Architecture en Couches

```
┌─────────────────────────────────────────┐
│         Présentation Layer              │
│  (Pages, Components, UI)                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Business Logic Layer            │
│  (Hooks, Stores, Validation)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Data Access Layer               │
│  (GraphQL Client, API Calls)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Backend API                     │
│  (GraphQL Server, PostgreSQL)           │
└─────────────────────────────────────────┘
```

---

## 🎨 Design System

### Palette de Couleurs

**Thème Clair (Luxe & Élégance)**

```css
:root {
  /* Primary - Violet/Pourpre (associé à la parfumerie de luxe) */
  --primary-50: #faf5ff;
  --primary-100: #f3e8ff;
  --primary-500: #a855f7;   /* Couleur principale */
  --primary-600: #9333ea;
  --primary-900: #581c87;

  /* Secondary - Or Rose (luxe et chaleur) */
  --secondary-50: #fff7ed;
  --secondary-500: #f97316;
  --secondary-900: #7c2d12;

  /* Neutral - Grège/Taupe (sophistication) */
  --neutral-50: #fafaf9;
  --neutral-100: #f5f5f4;
  --neutral-500: #78716c;
  --neutral-900: #1c1917;

  /* Success - Vert sauge */
  --success-500: #10b981;

  /* Warning - Ambre */
  --warning-500: #f59e0b;

  /* Danger - Rouge profond */
  --danger-500: #dc2626;

  /* Background */
  --background: #ffffff;
  --background-secondary: #fafaf9;

  /* Borders */
  --border: #e7e5e4;
}
```

**Thème Sombre**

```css
.dark {
  --background: #0c0a09;
  --background-secondary: #1c1917;
  --border: #292524;
  /* ... */
}
```

### Typographie

```css
/* Fonts */
--font-sans: 'Inter', system-ui, sans-serif;          /* UI général */
--font-display: 'Playfair Display', serif;            /* Titres élégants */
--font-mono: 'JetBrains Mono', monospace;             /* Code/données */

/* Échelle typographique */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### Espacements

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-12: 3rem;     /* 48px */
```

### Composants de Base (shadcn/ui)

Installation:

```bash
cd apps/web
npx shadcn-ui@latest init
```

Composants à installer:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
```

---

## 📦 Modules CRM

### 1. Dashboard Principal

**URL:** `/dashboard`

**Widgets:**
- KPIs (Revenus, Formules créées, Clients actifs, Inventaire bas)
- Graphique revenus (7 derniers jours / 30 jours / 12 mois)
- Formules populaires (top 10)
- Alertes IFRA / Stock faible
- Tâches récentes / À faire

**Composants:**
```tsx
- <DashboardKPIs />
- <RevenueChart />
- <PopularFormulasTable />
- <IFRAAlerts />
- <RecentActivity />
```

### 2. Gestion des Ingrédients

**URL:** `/dashboard/ingredients`

**Fonctionnalités:**
- **Liste** avec filtres (famille, volatilité, origine, prix)
- **Recherche** fuzzy (nom, CAS, odor profile)
- **Vue détaillée** (fiche complète avec IFRA, synergies, allergènes)
- **Création/Édition** (formulaire complet)
- **Import** (CSV, Excel)
- **Inventaire** (stock, fournisseurs, commandes)
- **Carte 3D** olfactive (visualisation de la carte générée par API)

**Écrans:**
- Liste: Table avec pagination + filtres
- Détail: Card avec tabs (Général, IFRA, Synergies, Inventaire, Historique)
- Création: Formulaire multi-étapes
- Carte 3D: Visualisation interactive (Three.js ou D3.js)

**Composants clés:**
```tsx
- <IngredientsList />
- <IngredientFilters />
- <IngredientCard />
- <IngredientForm />
- <OlfactoryMap3D />        // Visualise la carte 3D
- <IngredientSynergies />
- <IFRALimitsTable />
- <InventoryTracker />
```

### 3. Création de Formules

**URL:** `/dashboard/formulas`

**Modes de Création:**
1. **Mode Assisté** (AI Recommendations)
2. **Mode Fibonacci** (Algorithme harmonique)
3. **Mode Manuel** (Contrôle total)
4. **Mode Reverse Engineering** (À partir d'un parfum existant)

**Fonctionnalités:**
- **Builder interactif** (drag & drop d'ingrédients)
- **Pyramide olfactive** (visualisation real-time)
- **Calculs automatiques** (%, coût, IFRA)
- **Validation IFRA** en temps réel
- **Recommandations IA** (suggestions d'ingrédients)
- **Optimisation saisonnière** (ajustements climat/peau)
- **Export** (PDF, CSV, Fiche production)
- **Versioning** (historique des modifications)

**Écrans:**
- Liste formules: Grid cards avec preview
- Builder: Interface drag & drop avec preview live
- Détail: Fiche complète avec tabs
- Optimisation: Ajustements saisonniers/peau

**Composants clés:**
```tsx
- <FormulaBuilder />           // Builder principal drag & drop
- <OlfactoryPyramid />         // Visualisation pyramide
- <IngredientPicker />         // Sélection avec recherche
- <IFRAValidator />            // Badge validation temps réel
- <CostCalculator />           // Calculateur de coût
- <AIRecommendations />        // Suggestions IA
- <SeasonalOptimizer />        // Optimiseur saisonnier
- <SkinChemistrySimulator />   // Simulateur dry-down
- <FormulaExport />            // Export multi-format
```

### 4. Gestion des Clients

**URL:** `/dashboard/clients`

**Profil Client:**
- **Informations** (nom, email, téléphone, adresse)
- **Profil olfactif** (préférences, familles aimées/détestées)
- **Profil cutané** (type de peau, pH, température)
- **Historique** (commandes, formules préférées)
- **Notes** (sensibilités, remarques)

**Fonctionnalités:**
- Création profil complet
- Recommandations personnalisées
- Simulation dry-down selon peau
- Historique achats
- Tags & segments

**Composants:**
```tsx
- <ClientsList />
- <ClientProfile />
- <SkinProfileForm />
- <OlfactoryPreferences />
- <PurchaseHistory />
- <PersonalizedRecommendations />
```

### 5. Production & Batch

**URL:** `/dashboard/production`

**Fonctionnalités:**
- **Planning production** (calendrier, deadlines)
- **Calculs batch** (scaling formules)
- **Fiches techniques** (instructions détaillées)
- **Tracking** (statuts: préparation → macération → filtrage → embouteillage)
- **Matériel** (équipement, consommables)
- **Coûts** (matières, main d'œuvre, packaging)

**Écrans:**
- Planning: Calendrier avec tâches
- Batch: Calculateur avec instructions
- Suivi: Kanban board

**Composants:**
```tsx
- <ProductionCalendar />
- <BatchCalculator />
- <ProductionSheet />         // Fiche technique
- <ProductionKanban />
- <MaterialsInventory />
```

### 6. Analytics & Rapports

**URL:** `/dashboard/analytics`

**Métriques:**
- **Revenus** (jour/semaine/mois/année)
- **Formules** (popularité, ROI, coût moyen)
- **Ingrédients** (usage, coût, fournisseurs)
- **Clients** (acquisition, rétention, LTV)
- **Production** (efficacité, délais, gaspillage)

**Graphiques:**
- Revenus: Line chart temporel
- Top formules: Bar chart horizontal
- Distribution familles: Pie chart
- Coûts: Stacked area chart
- Clients: Funnel

**Composants:**
```tsx
- <RevenueChart />
- <FormulaPopularityChart />
- <IngredientUsageChart />
- <ClientAcquisitionFunnel />
- <ProductionEfficiencyChart />
- <ReportExport />            // Export PDF/Excel
```

### 7. Outils Avancés

**URL:** `/dashboard/tools`

**Sous-modules:**

#### 7a. Reverse Engineering
- Analyser parfum existant
- Proposer reconstruction
- 4 variantes (exact, budget, naturel, moderne)

#### 7b. Carte Olfactive 3D
- Visualisation interactive
- Clusters
- Pairings inattendus

#### 7c. Optimiseur Saisonnier
- Ajustements climatiques
- Recommandations application

#### 7d. Simulateur Peau
- Dry-down prédictif
- Compatibilité peau

**Composants:**
```tsx
- <ReverseEngineerTool />
- <OlfactoryMap3DView />
- <SeasonalOptimizerTool />
- <SkinChemistrySimulatorTool />
```

### 8. Paramètres

**URL:** `/dashboard/settings`

**Sections:**
- **Profil** (utilisateur, avatar, bio)
- **Entreprise** (nom, logo, adresse, SIRET)
- **Préférences** (langue, devise, unités)
- **Notifications** (email, push, in-app)
- **Sécurité** (mot de passe, 2FA, sessions)
- **Intégrations** (fournisseurs, paiement, shipping)
- **API** (clés, webhooks)

**Composants:**
```tsx
- <ProfileSettings />
- <CompanySettings />
- <PreferencesForm />
- <NotificationSettings />
- <SecuritySettings />
- <IntegrationsList />
- <APIKeyManager />
```

---

## 🛣️ Pages & Routes

### Routes Publiques

```
/                           → Landing page (présentation Perfume Architect Pro)
/features                   → Fonctionnalités détaillées
/pricing                    → Tarifs
/about                      → À propos
/contact                    → Contact
/blog                       → Blog parfumerie
```

### Routes Authentification

```
/login                      → Connexion
/register                   → Inscription
/forgot-password            → Mot de passe oublié
/reset-password             → Réinitialiser mot de passe
```

### Routes Dashboard (Protégées)

```
/dashboard                  → Dashboard principal

/dashboard/ingredients      → Liste ingrédients
/dashboard/ingredients/:id  → Détail ingrédient
/dashboard/ingredients/new  → Créer ingrédient
/dashboard/ingredients/map  → Carte 3D olfactive

/dashboard/formulas         → Liste formules
/dashboard/formulas/:id     → Détail formule
/dashboard/formulas/new     → Créer formule (builder)
/dashboard/formulas/:id/edit → Éditer formule

/dashboard/clients          → Liste clients
/dashboard/clients/:id      → Profil client
/dashboard/clients/new      → Créer client

/dashboard/production       → Planning production
/dashboard/production/:id   → Détail batch

/dashboard/analytics        → Analytics & rapports

/dashboard/tools            → Outils avancés
/dashboard/tools/reverse    → Reverse engineering
/dashboard/tools/seasonal   → Optimiseur saisonnier
/dashboard/tools/skin       → Simulateur peau

/dashboard/settings         → Paramètres
/dashboard/settings/profile → Profil
/dashboard/settings/company → Entreprise
/dashboard/settings/api     → API
```

---

## 🧩 Composants Réutilisables

### Composants UI de Base

**Boutons**
```tsx
<Button variant="primary" size="md">Créer Formule</Button>
<Button variant="secondary" size="lg" icon={<Plus />}>Ajouter</Button>
<Button variant="outline" size="sm">Annuler</Button>
<Button variant="ghost" size="xs">Voir</Button>
```

**Inputs**
```tsx
<Input type="text" label="Nom" placeholder="Rose Otto" />
<Input type="number" label="Prix/kg" suffix="€" />
<TextArea label="Description" rows={4} />
<Select label="Famille" options={families} />
<MultiSelect label="Allergènes" options={allergens} />
```

**Cards**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Bergamote</CardTitle>
    <CardDescription>Top note - Citrus</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Composants Métier

**Pyramide Olfactive**
```tsx
<OlfactoryPyramid
  topNotes={topIngredients}
  heartNotes={heartIngredients}
  baseNotes={baseIngredients}
  interactive={true}
  showPercentages={true}
/>
```

**Roue des Odeurs (Scent Wheel)**
```tsx
<ScentWheel
  families={olfactiveFamilies}
  selectedFamily="floral"
  onSelect={(family) => handleFamilySelect(family)}
/>
```

**Badge IFRA**
```tsx
<IFRABadge
  status="compliant" // compliant | warning | non-compliant
  category={4}
  percentage={12.5}
/>
```

**Carte Ingrédient**
```tsx
<IngredientCard
  ingredient={ingredient}
  showPrice={true}
  showStock={true}
  onSelect={() => handleSelect()}
  onView={() => handleView()}
/>
```

---

## 🔄 État Global & Data Fetching

### Apollo Client Setup

**lib/apollo-client.ts**
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

### Custom Hooks

**hooks/use-ingredients.ts**
```typescript
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_INGREDIENTS, CREATE_INGREDIENT } from '@/graphql/queries/ingredients';

export function useIngredients() {
  const { data, loading, error } = useQuery(GET_ALL_INGREDIENTS);

  const [createIngredient, { loading: creating }] = useMutation(CREATE_INGREDIENT, {
    refetchQueries: [{ query: GET_ALL_INGREDIENTS }],
  });

  return {
    ingredients: data?.getAllIngredients || [],
    loading,
    error,
    createIngredient,
    creating,
  };
}
```

### Zustand Stores

**store/formula-builder-store.ts**
```typescript
import { create } from 'zustand';

interface FormulaBuilderState {
  selectedIngredients: Ingredient[];
  totalPercentage: number;
  addIngredient: (ingredient: Ingredient, percentage: number) => void;
  removeIngredient: (id: string) => void;
  updatePercentage: (id: string, percentage: number) => void;
  reset: () => void;
}

export const useFormulaBuilder = create<FormulaBuilderState>((set) => ({
  selectedIngredients: [],
  totalPercentage: 0,
  addIngredient: (ingredient, percentage) =>
    set((state) => ({
      selectedIngredients: [...state.selectedIngredients, { ...ingredient, percentage }],
      totalPercentage: state.totalPercentage + percentage,
    })),
  removeIngredient: (id) =>
    set((state) => {
      const ingredient = state.selectedIngredients.find((i) => i.id === id);
      return {
        selectedIngredients: state.selectedIngredients.filter((i) => i.id !== id),
        totalPercentage: state.totalPercentage - (ingredient?.percentage || 0),
      };
    }),
  updatePercentage: (id, percentage) =>
    set((state) => {
      const oldIngredient = state.selectedIngredients.find((i) => i.id === id);
      const oldPercentage = oldIngredient?.percentage || 0;
      return {
        selectedIngredients: state.selectedIngredients.map((i) =>
          i.id === id ? { ...i, percentage } : i
        ),
        totalPercentage: state.totalPercentage - oldPercentage + percentage,
      };
    }),
  reset: () => set({ selectedIngredients: [], totalPercentage: 0 }),
}));
```

---

## 📅 Roadmap d'Implémentation

### Phase 1: Foundation (Semaine 1-2)

**Priorité: HAUTE**

- [ ] Setup Next.js 14 + TypeScript
- [ ] Installer TailwindCSS + shadcn/ui
- [ ] Configurer Apollo Client
- [ ] Créer layout principal (Sidebar + Header)
- [ ] Implémenter système d'authentification
- [ ] Setup Zustand stores
- [ ] Créer composants UI de base

### Phase 2: Module Ingrédients (Semaine 3)

**Priorité: HAUTE**

- [ ] Page liste ingrédients avec filtres
- [ ] Page détail ingrédient
- [ ] Formulaire création/édition
- [ ] Intégration GraphQL queries
- [ ] Composant carte 3D basique

### Phase 3: Module Formules (Semaine 4-5)

**Priorité: CRITIQUE**

- [ ] Formula Builder (drag & drop)
- [ ] Pyramide olfactive interactive
- [ ] Validation IFRA temps réel
- [ ] Calculateur de coût
- [ ] Intégration AI Recommendations
- [ ] Optimiseur saisonnier
- [ ] Simulateur peau
- [ ] Export PDF/CSV

### Phase 4: Dashboard & Analytics (Semaine 6)

**Priorité: MOYENNE**

- [ ] Dashboard principal avec KPIs
- [ ] Graphiques revenus
- [ ] Top formules
- [ ] Alertes

### Phase 5: Modules Complémentaires (Semaine 7-8)

**Priorité: MOYENNE**

- [ ] Gestion clients
- [ ] Production & batch
- [ ] Outils avancés
- [ ] Paramètres

### Phase 6: Optimisation & Polish (Semaine 9-10)

**Priorité: MOYENNE**

- [ ] Performance optimization
- [ ] Tests E2E
- [ ] Responsive mobile
- [ ] Animations
- [ ] Documentation
- [ ] Déploiement production

---

## 🎯 Prochaines Étapes Immédiates

### 1. Setup Projet Frontend

```bash
# Naviguer vers apps/web
cd apps/web

# Installer dépendances
npm install

# Installer shadcn/ui
npx shadcn-ui@latest init

# Installer composants essentiels
npx shadcn-ui@latest add button input select dialog table card tabs form badge alert toast
```

### 2. Configurer TailwindCSS

Éditer `tailwind.config.ts` avec design system Perfume Architect Pro

### 3. Setup Apollo Client

Créer `lib/apollo-client.ts` et wrapper provider

### 4. Créer Layout Principal

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5. Créer Page Dashboard

```tsx
// app/(dashboard)/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Dashboard Perfume Architect Pro</h1>
      <DashboardKPIs />
      <div className="grid grid-cols-2 gap-6">
        <RevenueChart />
        <PopularFormulas />
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Démarrage

- [ ] Lire ce document complet
- [ ] Vérifier que API fonctionne (`npm run start:dev` dans apps/api)
- [ ] Tester GraphQL Playground (http://localhost:3001/graphql)
- [ ] Setup projet frontend Next.js
- [ ] Installer shadcn/ui + Tailwind
- [ ] Configurer Apollo Client
- [ ] Créer premier composant (Dashboard)
- [ ] Tester connexion GraphQL
- [ ] Implémenter authentification
- [ ] Commencer module Ingrédients

---

**Guide créé pour Perfume Architect Pro CRM v1.0**
**Date:** Novembre 2025
**Prêt pour implémentation** 🚀
