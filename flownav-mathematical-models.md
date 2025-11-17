# FlowNav — Modèles Mathématiques Détaillés

## Équations Fondamentales

### 1. Distance d'Arrêt
```
d_stop = v · t_r + v² / (2 · a_max)
```
**Variables :**
- `d_stop` : Distance d'arrêt complète (m)
- `v` : Vitesse initiale (m/s)
- `t_r` : Temps de réaction conducteur (s) — typique : 0.7–1.5 s
- `a_max` : Décélération maximale (m/s²) — typique : 6–10 m/s² (route sèche)

**Usage :** Calcul distance sécurité minimale absolue, détection risque collision

---

### 2. Distance de Sécurité (Car-Following)
```
d_safe = v · t_h + d_0
```
**Variables :**
- `d_safe` : Distance inter-véhiculaire recommandée (m)
- `v` : Vitesse du suiveur (m/s)
- `t_h` : Temps de suivi (headway time) (s) — typique : 1.8–2.5 s
- `d_0` : Distance minimale à l'arrêt (m) — typique : 2–5 m

**Exemple :** À 80 km/h (22.2 m/s) avec t_h=2.0s → d_safe = 22.2 × 2.0 + 2 = **46.4 m**

---

### 3. Relation Fondamentale du Trafic
```
Q = k · v
```
**Variables :**
- `Q` : Débit (véhicules/heure)
- `k` : Densité (véhicules/km)
- `v` : Vitesse moyenne spatiale (km/h)

**Paramètres typiques :**
- Capacité autoroute : Q_max = 2000–2400 véh/h/voie
- Densité embouteillage : k_jam = 120–180 véh/km
- Vitesse fluide : v_free = 100–130 km/h

---

### 4. Vitesse d'Onde de Choc (Shockwave)
```
w = (Q₂ - Q₁) / (k₂ - k₁)
```
**Variables :**
- `w` : Vitesse propagation onde (km/h, négatif = remontée trafic)
- `Q₁, Q₂` : Débits amont/aval (véh/h)
- `k₁, k₂` : Densités amont/aval (véh/km)

**Typique :** w = -15 à -25 km/h (onde remonte le trafic)

**Exemple :**
- Amont : Q₁=2000, k₁=100 → v₁=20 km/h (congestion)
- Aval : Q₂=1200, k₂=40 → v₂=30 km/h (plus fluide)
- w = (1200-2000)/(40-100) = -800/-60 = **+13.3 km/h** (onde se propage vers l'aval)

---

### 5. Temps de Trajet Futur (Intégral)
```
T(t₀) = ∫_path [1 / v(x, t₀ + τ(x))] dx
```
**Variables :**
- `T(t₀)` : Temps de trajet total si départ à t₀ (min)
- `x` : Position le long du trajet (km)
- `v(x,t)` : Vitesse prédite au point x à l'instant t (km/h)
- `τ(x)` : Temps pour atteindre x depuis origine si départ à t₀ (min)

**Discrétisation numérique :**
```
T(t₀) ≈ Σᵢ₌₁ⁿ [Δxᵢ / vᵢ(t₀ + Σⱼ₌₁ⁱ⁻¹ Δtⱼ)]
```
avec Δxᵢ = 0.5–1 km (résolution segments)

**Algorithme :**
1. Diviser route en n segments de longueur Δx
2. t_cumul = t₀
3. Pour chaque segment i :
   - Récupérer v_i prédite à t_cumul
   - Calculer Δt_i = Δx / v_i (conversion km → minutes)
   - Ajouter Δt_i à T_total
   - Mettre à jour t_cumul += Δt_i
4. Retourner T_total

---

### 6. Temps de Départ Optimal
```
t₀_optimal = argmin_{t₀ ∈ [t_now, t_now + Δ_max]} T(t₀)
```
**Contraintes :**
- t₀ ≥ t_now (pas de voyage dans le passé)
- t₀ + T(t₀) ≤ t_arrival (respect heure arrivée cible)

**Méthode de résolution :**
- **Grid search** : évaluer T(t₀) pour t₀ ∈ {t_now, t_now+5min, t_now+10min, ..., t_now+Δ_max}
- **Gradient descent** : si v(x,t) différentiable, calcul ∂T/∂t₀ et descente itérative
- **Complexité** : O(Δ_max/résolution × n_segments) — typique 6 × 50 = 300 calculs

---

### 7. Incertitude Vitesse Prédite (Propagation Variance)
```
σ²_v(t + Δt) = α · σ²_v(t) + β · Var_obs(t)
```
**Variables :**
- `σ²_v(t)` : Variance de la vitesse prédite à t
- `Δt` : Pas de temps prédiction (min)
- `α` : Coefficient persistance incertitude — typique : 0.85–0.95
- `β` : Coefficient injection bruit observationnel — typique : 0.05–0.15
- `Var_obs(t)` : Variance observée des mesures à t

**Usage :** Intervalle de confiance [v - 2σ_v, v + 2σ_v] à 95%

**Exemple :**
- t=0 : v=70 km/h, σ_v=5 km/h
- Δt=15 min, α=0.9, β=0.1, Var_obs=25 km²/h²
- σ²_v(15min) = 0.9×25 + 0.1×25 = 22.5 + 2.5 = 25 → σ_v=5 km/h (stable)

---

### 8. Modèle IDM (Intelligent Driver Model)
```
dv/dt = a_max · [1 - (v/v₀)⁴ - (d*/d)²]

d* = d_0 + v·t_h + v·Δv / (2·√(a_max·b))
```
**Variables :**
- `dv/dt` : Accélération véhicule (m/s²)
- `a_max` : Accélération maximale confort (m/s²) — typique : 1.5–2.0
- `b` : Décélération confort (m/s²) — typique : 1.5–2.0
- `v₀` : Vitesse désirée (m/s) — ex : 33 m/s (120 km/h)
- `v` : Vitesse actuelle (m/s)
- `d` : Distance au véhicule précédent (m)
- `d*` : Distance désirée dynamique (m)
- `Δv` : v_suiveur - v_leader (m/s)
- `t_h` : Temps de suivi (s) — typique : 1.5 s
- `d_0` : Distance minimale (m) — typique : 2 m

**Comportement :**
- **Route libre** (d → ∞) : dv/dt → a_max·[1 - (v/v₀)⁴] → accélération jusqu'à v₀
- **Rapprochement** (d < d*) : terme -(d*/d)² domine → freinage
- **Équilibre** : v→v_leader et d→d* → accélération nulle

**Usage :** Simulation micro-trafic pour corrections prédiction LWR macroscopique

---

## Modèles Complémentaires

### LWR (Lighthill-Whitham-Richards) — Macroscopique
```
∂k/∂t + ∂Q/∂x = 0  (équation de continuité)
Q(k) = k · V(k)     (relation débit-densité)
V(k) = v_free · (1 - k/k_jam)  (Greenshields)
```
**Usage :** Prédiction évolution densité/vitesse réseau entier, scalable 1000s de segments

---

### Greenshields (Relation Vitesse-Densité)
```
v = v_free · (1 - k/k_jam)
```
**Approximation simple :** linéaire, calibration facile

---

### BPR (Bureau of Public Roads) — Fonction Temps de Trajet
```
T = T_free · [1 + 0.15 · (Q/C)⁴]
```
**Variables :**
- `T` : Temps de trajet actuel
- `T_free` : Temps fluide (capacité non atteinte)
- `Q` : Débit actuel, `C` : Capacité segment

**Usage :** Estimation rapide pénalité congestion

---

## Exemple Numérique Complet

**Contexte :** Trajet 20 km, 4 segments de 5 km chacun, départ possible entre 15h00 et 15h30.

**Prédictions vitesse :**
| Segment | 15h00 | 15h10 | 15h20 | 15h30 |
|---------|-------|-------|-------|-------|
| Seg1    | 60    | 65    | 70    | 65    |
| Seg2    | 40    | 35    | 50    | 60    |
| Seg3    | 80    | 75    | 70    | 75    |
| Seg4    | 90    | 85    | 80    | 85    |

**Calcul T(15h00) :**
- Seg1 : 5km / 60km/h = 5 min → atteint Seg2 à 15h05
- Seg2 (à 15h05) : interpolation ≈38 km/h → 5/38×60 = 7.9 min → atteint Seg3 à 15h12.9
- Seg3 (à 15h12.9) : ≈74 km/h → 5/74×60 = 4.1 min → atteint Seg4 à 15h17
- Seg4 (à 15h17) : ≈84 km/h → 5/84×60 = 3.6 min
- **T(15h00) = 5 + 7.9 + 4.1 + 3.6 = 20.6 min**

**Calcul T(15h10) :**
- Seg1 (15h10) : 65 km/h → 4.6 min → Seg2 à 15h14.6
- Seg2 (15h14.6) : ≈48 km/h → 6.25 min → Seg3 à 15h20.85
- Seg3 (15h20.85) : ≈70 km/h → 4.3 min → Seg4 à 15h25.15
- Seg4 (15h25.15) : ≈81 km/h → 3.7 min
- **T(15h10) = 4.6 + 6.25 + 4.3 + 3.7 = 18.85 min** ✅ **Optimal**

**Calcul T(15h20), T(15h30)** : ~19.5 min, ~19.2 min

**Conclusion :** t₀_optimal = 15h10, gain 20.6 - 18.85 = **1.75 min** vs départ immédiat.

**Recommandation FlowNav :** _"Partez dans 10 minutes (15h10) pour arriver à 15h29. Évitement ralentissement Seg2 (embouteillage 15h05-15h15). Gain 2 minutes."_
