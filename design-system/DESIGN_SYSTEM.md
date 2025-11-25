# 🎨 OJ Investment Platform - Charte Graphique & Design System

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Couleurs](#couleurs)
3. [Typographie](#typographie)
4. [Espacements](#espacements)
5. [Composants](#composants)
6. [Icônes](#icônes)
7. [Animations](#animations)
8. [Responsive](#responsive)

---

## 🎯 Vue d'ensemble

La charte graphique d'OJ Investment Platform reflète :
- **Confiance** - Couleurs professionnelles et design épuré
- **Modernité** - Interface contemporaine et intuitive
- **Accessibilité** - Contraste WCAG AA minimum
- **Performance** - Design optimisé pour tous les devices

---

## 🎨 Couleurs

### Palette Principale

#### Primary (Bleu Confiance)
```css
--color-primary-50:  #E6F2FF;
--color-primary-100: #CCE5FF;
--color-primary-200: #99CCFF;
--color-primary-300: #66B2FF;
--color-primary-400: #3399FF;
--color-primary-500: #0066CC;  /* Main */
--color-primary-600: #0052A3;
--color-primary-700: #003D7A;
--color-primary-800: #002952;
--color-primary-900: #001429;
```

**Utilisation** : CTAs, liens, éléments interactifs

#### Success (Vert Croissance)
```css
--color-success-50:  #E6F9F0;
--color-success-100: #CCF3E1;
--color-success-200: #99E7C3;
--color-success-300: #66DBA5;
--color-success-400: #33CF87;
--color-success-500: #00CC66;  /* Main */
--color-success-600: #00A352;
--color-success-700: #007A3D;
--color-success-800: #005229;
--color-success-900: #002914;
```

**Utilisation** : Indicateurs positifs, gains, confirmations

#### Warning (Orange Attention)
```css
--color-warning-50:  #FFF7E6;
--color-warning-100: #FFEFCC;
--color-warning-200: #FFDF99;
--color-warning-300: #FFCF66;
--color-warning-400: #FFBF33;
--color-warning-500: #FFB000;  /* Main */
--color-warning-600: #CC8D00;
--color-warning-700: #996A00;
--color-warning-800: #664700;
--color-warning-900: #332300;
```

**Utilisation** : Avertissements, actions en attente

#### Error (Rouge Alerte)
```css
--color-error-50:  #FFE6E6;
--color-error-100: #FFCCCC;
--color-error-200: #FF9999;
--color-error-300: #FF6666;
--color-error-400: #FF3333;
--color-error-500: #CC0000;  /* Main */
--color-error-600: #A30000;
--color-error-700: #7A0000;
--color-error-800: #520000;
--color-error-900: #290000;
```

**Utilisation** : Erreurs, pertes, actions destructives

### Palette Neutre

```css
--color-gray-50:  #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;

--color-white: #FFFFFF;
--color-black: #000000;
```

### Couleurs Sémantiques

```css
/* Backgrounds */
--bg-primary: var(--color-white);
--bg-secondary: var(--color-gray-50);
--bg-tertiary: var(--color-gray-100);
--bg-overlay: rgba(0, 0, 0, 0.5);

/* Text */
--text-primary: var(--color-gray-900);
--text-secondary: var(--color-gray-600);
--text-tertiary: var(--color-gray-400);
--text-inverse: var(--color-white);

/* Borders */
--border-default: var(--color-gray-200);
--border-focus: var(--color-primary-500);
--border-error: var(--color-error-500);
```

---

## ✍️ Typographie

### Familles de Polices

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Poppins', var(--font-primary);
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Échelle de Tailles

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Poids des Polices

```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Hiérarchie Typographique

```css
/* Display */
.display-1 { font-size: var(--text-6xl); font-weight: var(--font-bold); }
.display-2 { font-size: var(--text-5xl); font-weight: var(--font-bold); }

/* Headings */
.h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); }
.h2 { font-size: var(--text-3xl); font-weight: var(--font-semibold); }
.h3 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
.h4 { font-size: var(--text-xl); font-weight: var(--font-medium); }
.h5 { font-size: var(--text-lg); font-weight: var(--font-medium); }
.h6 { font-size: var(--text-base); font-weight: var(--font-medium); }

/* Body */
.body-large { font-size: var(--text-lg); line-height: var(--leading-relaxed); }
.body { font-size: var(--text-base); line-height: var(--leading-normal); }
.body-small { font-size: var(--text-sm); line-height: var(--leading-normal); }

/* Caption */
.caption { font-size: var(--text-xs); line-height: var(--leading-tight); }
```

---

## 📏 Espacements

### Échelle d'Espacement

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## 🧩 Composants

### Boutons

#### Primary Button
```css
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: var(--font-semibold);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary-500);
  border: 2px solid var(--color-primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: var(--font-semibold);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--color-gray-700);
  padding: var(--space-3) var(--space-6);
}
```

### Cards

```css
.card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-elevated {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
```

### Forms

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-default);
  border-radius: 8px;
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.input-error {
  border-color: var(--border-error);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge-success {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-error {
  background: var(--color-error-100);
  color: var(--color-error-700);
}
```

---

## 🎯 Icônes

**Bibliothèque recommandée** : [Lucide Icons](https://lucide.dev/) ou [Heroicons](https://heroicons.com/)

### Tailles Standard

```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

---

## ✨ Animations

### Transitions

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-slower: 500ms ease;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animations Communes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
--breakpoint-xs: 320px;   /* Mobile small */
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### Media Queries

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 🌓 Dark Mode

### Couleurs Dark Mode

```css
[data-theme="dark"] {
  --bg-primary: var(--color-gray-900);
  --bg-secondary: var(--color-gray-800);
  --bg-tertiary: var(--color-gray-700);

  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-300);
  --text-tertiary: var(--color-gray-500);

  --border-default: var(--color-gray-700);
}
```

---

## ✅ Checklist d'Utilisation

- [ ] Utiliser les tokens CSS variables
- [ ] Respecter la hiérarchie typographique
- [ ] Maintenir des contrastes WCAG AA
- [ ] Tester sur mobile, tablet, desktop
- [ ] Vérifier le dark mode
- [ ] Optimiser les animations (60fps)
- [ ] Utiliser les composants réutilisables
- [ ] Documenter les nouveaux patterns

---

## 📚 Ressources

- **Palette Coolors** : [coolors.co](https://coolors.co/)
- **Contrast Checker** : [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)
- **Fonts** : [fonts.google.com](https://fonts.google.com/)
- **Icons** : [lucide.dev](https://lucide.dev/)

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-25
**Maintenu par** : OJ Investment Platform Team
