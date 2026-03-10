# AUDIT COMPLET DES DONNÉES STATIQUES/MOCKÉES

**Date:** 2026-03-08  
**Tables Supabase disponibles:** `profiles`, `analyses`

---

## 📋 RÉSUMÉ EXÉCUTIF

**Total de fichiers analysés:** 20+ fichiers  
**Données statiques identifiées:** 50+ occurrences  
**Priorité CRITIQUE:** 8 items  
**Priorité MOYENNE:** 15 items  
**Priorité FAIBLE:** 10 items

---

## 🔴 PRIORITÉ CRITIQUE (Bloque l'UX)

### 1. **Dashboard Utilisateur** (`src/app/(app)/page.tsx`)
**Problème:** Toutes les données du dashboard sont mockées
- **`kpiData`** (import depuis `@/lib/data`): 
  - Total Analyses: "248" (hardcodé)
  - Most Predicted Crop: "Rice" (hardcodé)
  - Average Confidence: "94.2%" (hardcodé)
  - Average Soil pH: "6.4" (hardcodé)
- **`nutrientLevels`** (import depuis `@/lib/data`): Valeurs fixes pour N, P, K
- **Référence:** Table `analyses` (calculer depuis les vraies données utilisateur)
- **Impact:** L'utilisateur voit des données incorrectes sur son dashboard

### 2. **RecentAnalyses Component** (`src/components/dashboard/RecentAnalyses.tsx`)
**Problème:** Liste et graphique des analyses récentes sont mockés
- **`recentAnalyses`** (import depuis `@/lib/data`): Array de 5 analyses avec dates/crops hardcodés
- **`recentAnalysesChartData`** (import depuis `@/lib/data`): Données de graphique hardcodées
- **Référence:** Table `analyses` (5 dernières analyses de l'utilisateur)
- **Impact:** L'utilisateur ne voit pas ses vraies analyses récentes

### 3. **CropDistribution Component** (`src/components/dashboard/CropDistribution.tsx`)
**Problème:** Distribution des cultures est mockée
- **`cropDistributionData`** (import depuis `@/lib/data`): Pourcentages hardcodés (Rice 38%, Maize 25%, etc.)
- **Référence:** Table `analyses` (grouper par `recommended_crop` et calculer les pourcentages)
- **Impact:** L'utilisateur voit une distribution incorrecte de ses cultures

### 4. **Admin Overview Page** (`src/app/(admin)/admin/page.tsx`)
**Problème:** Tous les KPIs admin sont mockés
- **`adminKpiData`** (import depuis `@/lib/admin-data`): 
  - Total Users: "124" (hardcodé)
  - Total Analyses: "2,847" (hardcodé)
  - Top Crop: "Rice" (hardcodé)
  - Global Avg Confidence: "93.8%" (hardcodé)
- **Référence:** Tables `profiles` (count) et `analyses` (count, group by, avg)
- **Impact:** L'admin voit des statistiques incorrectes

### 5. **Admin Analyses Table** (`src/components/admin/analyses/AnalysesTable.tsx`)
**Problème:** Toutes les analyses affichées sont mockées
- **`analysesData`** (import depuis `@/lib/admin-data`): Array généré aléatoirement
- **Référence:** Table `analyses` avec join sur `profiles` pour afficher les utilisateurs
- **Impact:** L'admin ne voit pas les vraies analyses

### 6. **Admin Users Table** (`src/components/admin/users/UsersTable.tsx`)
**Problème:** Tous les utilisateurs sont mockés
- **`usersData`** (import depuis `@/lib/admin-data`): Array de 6 utilisateurs hardcodés
- **Référence:** Table `profiles` (tous les champs disponibles)
- **Impact:** L'admin ne voit pas les vrais utilisateurs

### 7. **Admin Charts** (4 composants)
**Problème:** Tous les graphiques admin utilisent des données mockées
- **`AnalysesTimeChart.tsx`**: `analysesTimeChartData` (12 mois hardcodés)
- **`TopCropsCard.tsx`**: `topCropsData` (top 8 crops hardcodés)
- **`NewUsersChart.tsx`**: `newUsersData` (7 jours hardcodés)
- **`CropCategoryChart.tsx`**: `cropCategoryData` (4 catégories hardcodées)
- **Référence:** Tables `analyses` et `profiles` (agrégations par mois/jour/crop)
- **Impact:** Les graphiques admin affichent des données incorrectes

### 8. **UserDetailModal** (`src/components/admin/users/UserDetailModal.tsx`)
**Problème:** Analyses récentes de l'utilisateur sont générées aléatoirement
- **`recentAnalyses`**: Généré avec `Math.random()` et `topCropsData`
- **Référence:** Table `analyses` filtrée par `user_id`
- **Impact:** L'admin voit des analyses incorrectes pour chaque utilisateur

---

## 🟡 PRIORITÉ MOYENNE (Affecte certaines fonctionnalités)

### 9. **Comparison Page** (`src/app/(app)/comparison/page.tsx`)
**Problème:** Données de comparaison et valeurs de sol actuelles sont hardcodées
- **`cropComparisonData`** (import depuis `@/lib/data`): Compatibilité hardcodée pour rice/maize
- **Ligne 63:** "Current soil: N=85 · P=42 · K=210 · T=24.5°C · H=72% · pH=6.4 · R=180mm" (hardcodé)
- **`radarChartData`** (import depuis `@/lib/data`): Données de graphique radar hardcodées
- **Référence:** 
  - `cropComparisonData`: Peut rester statique (données de référence agronomiques)
  - Valeurs sol actuelles: Devrait venir de la dernière analyse de l'utilisateur (`analyses` table)
- **Impact:** L'utilisateur compare avec des valeurs de sol qui ne sont pas les siennes

### 10. **Settings Page - Default Soil Values** (`src/app/(app)/settings/page.tsx`)
**Problème:** Valeurs par défaut hardcodées dans les inputs
- **Lignes 149-176:** `defaultValue` hardcodés pour tous les champs (N=85, P=42, K=210, etc.)
- **Référence:** Devrait venir de la dernière analyse de l'utilisateur ou d'un profil utilisateur
- **Note:** Les préférences (Switches lignes 188-203) peuvent rester statiques (pas de table pour ça)
- **Impact:** L'utilisateur ne peut pas pré-remplir avec ses valeurs habituelles

### 11. **Settings Page - Stats Hardcodées** (`src/app/(app)/settings/page.tsx`)
**Problème:** Statistiques utilisateur hardcodées
- **Ligne 208:** "248 analyses saved" (hardcodé)
- **Référence:** Table `analyses` (count pour l'utilisateur)
- **Impact:** L'utilisateur voit un nombre incorrect d'analyses

### 12. **Admin Analyses Page - Badges Hardcodés** (`src/app/(admin)/admin/analyses/page.tsx`)
**Problème:** Statistiques dans les badges sont hardcodées
- **Ligne 14:** "2,847 total" (hardcodé)
- **Lignes 56-59:** "2,847 Total", "93.8% Avg Confidence", "Rice Most Predicted", "124 Active Users" (tous hardcodés)
- **Référence:** Tables `analyses` et `profiles` (calculs dynamiques)
- **Impact:** L'admin voit des statistiques incorrectes

### 13. **Admin Users Page - Badge Hardcodé** (`src/app/(admin)/admin/users/page.tsx`)
**Problème:** Nombre total d'utilisateurs hardcodé
- **Ligne 14:** "124 total" (hardcodé)
- **Référence:** Table `profiles` (count)
- **Impact:** L'admin voit un nombre incorrect d'utilisateurs

### 14. **Admin Settings Page - Stats Hardcodées** (`src/app/(admin)/admin/settings/page.tsx`)
**Problème:** Statistiques platform hardcodées
- **Lignes 12-18:** Array `stats` avec valeurs hardcodées:
  - Total Users: "124"
  - Total Analyses: "2,847"
  - Crops Supported: "22" (peut rester statique)
  - Model Accuracy: "99.55%" (peut rester statique)
  - API Response Avg: "120ms" (peut rester statique)
- **Référence:** Tables `profiles` et `analyses` pour les 2 premiers
- **Impact:** L'admin voit des statistiques incorrectes

### 15. **Admin Settings Page - Profile Hardcodé** (`src/app/(admin)/admin/settings/page.tsx`)
**Problème:** Profil admin hardcodé
- **Lignes 58-66:** `defaultValue` hardcodés:
  - Full Name: "Admin User"
  - Email: "admin@agrismart.com"
  - Phone: "+1 234 567 890"
- **Référence:** Table `profiles` (profil de l'admin connecté)
- **Impact:** L'admin ne voit pas ses vraies informations

### 16. **AnalysisDetailModal - Alternatives Hardcodées** (`src/components/admin/analyses/AnalysisDetailModal.tsx`)
**Problème:** Alternatives de culture hardcodées
- **Ligne 41:** `alternatives` array hardcodé: `[{ name: "Maize", confidence: 96.8 }, ...]`
- **Référence:** Champ `alternatives` (jsonb) dans la table `analyses`
- **Impact:** Les alternatives affichées ne correspondent pas aux vraies données

### 17. **AnalysisDetailModal - Rainfall Hardcodé** (`src/components/admin/analyses/AnalysisDetailModal.tsx`)
**Problème:** Rainfall hardcodé dans les paramètres
- **Ligne 50:** `{label: "Rainfall", value: '180 mm'}` (hardcodé au lieu de `analysis.rainfall`)
- **Référence:** Champ `rainfall` de la table `analyses`
- **Impact:** Affichage incorrect du rainfall

### 18. **Comparison Page - Crop List** (`src/app/(app)/comparison/page.tsx`)
**Problème:** Liste des crops pour comparaison
- **`crops`** (import depuis `@/lib/data`): Liste de 22 crops hardcodée
- **Référence:** Peut rester statique (liste de référence des crops supportés)
- **Note:** Cette donnée peut rester statique car c'est une liste de référence

### 19. **AnalysisForm - Default Values** (`src/components/analysis/AnalysisForm.tsx`)
**Problème:** Valeurs par défaut du formulaire hardcodées
- **Lignes 86-94:** `defaultValues` hardcodés (nitrogen: 85, phosphorus: 42, etc.)
- **Référence:** Devrait venir de la dernière analyse de l'utilisateur ou des settings
- **Impact:** L'utilisateur doit toujours saisir les mêmes valeurs manuellement

### 20. **Settings Page - Info Card** (`src/app/(app)/settings/page.tsx`)
**Problème:** Informations version hardcodées
- **Lignes 215-217:** "AgriSmart v1.0.0", "22 crop varieties supported" (peuvent rester statiques)
- **Note:** Ces données peuvent rester statiques (métadonnées de l'app)

---

## 🟢 PRIORITÉ FAIBLE (Données de référence ou cosmétiques)

### 21. **Crop Colors Mapping** (Plusieurs fichiers)
**Problème:** Mapping des couleurs pour les crops est hardcodé
- **`HistoryTable.tsx`** (lignes 39-49): `CROP_COLORS` object
- **`AnalysesTable.tsx`** (lignes 27-32): `CROP_COLORS` object
- **Référence:** Peut rester statique (mapping UI)
- **Note:** Mapping de couleurs pour l'affichage, peut rester en dur

### 22. **Role Colors Mapping** (`src/components/admin/users/UsersTable.tsx`, `UserDetailModal.tsx`)
**Problème:** Mapping des couleurs pour les rôles
- **`roleColors`** objects hardcodés
- **Référence:** Peut rester statique (mapping UI)
- **Note:** Mapping de couleurs pour l'affichage, peut rester en dur

### 23. **Admin Users Page - Role Filter** (`src/app/(admin)/admin/users/page.tsx`)
**Problème:** Liste des rôles dans le dropdown hardcodée
- **Lignes 31-36:** DropdownMenuItem avec rôles hardcodés (Farmer, Technician, etc.)
- **Référence:** Devrait venir de la table `profiles` (distinct `role`) OU rester statique si les rôles sont fixes
- **Note:** Si les rôles sont fixes ('user' | 'admin'), peut rester statique

### 24. **Admin Analyses Page - Crop Filter** (`src/app/(admin)/admin/analyses/page.tsx`)
**Problème:** Liste des crops dans le dropdown hardcodée
- **Lignes 31-34:** DropdownMenuItem avec seulement "Rice" et "Maize"
- **Référence:** Devrait venir de la table `analyses` (distinct `recommended_crop`)
- **Impact:** Le filtre ne montre pas tous les crops disponibles

### 25. **Admin Analyses Page - Time Filter** (`src/app/(admin)/admin/analyses/page.tsx`)
**Problème:** Options de filtre temporel hardcodées
- **Lignes 42-47:** DropdownMenuItem avec périodes hardcodées
- **Référence:** Peut rester statique (options de filtre UI)
- **Note:** Options de filtre, peuvent rester statiques

### 26. **Settings Page - Preferences Switches** (`src/app/(app)/settings/page.tsx`)
**Problème:** Préférences utilisateur avec `defaultChecked` hardcodés
- **Lignes 188-203:** Switches avec valeurs par défaut hardcodées
- **Référence:** Devrait être stocké dans la table `profiles` (nouveau champ `preferences` jsonb) OU rester statique si pas critique
- **Note:** Si les préférences ne sont pas critiques, peut rester statique

### 27. **Admin Settings Page - Global Settings Switches** (`src/app/(admin)/admin/settings/page.tsx`)
**Problème:** Paramètres globaux avec `defaultChecked` hardcodés
- **Lignes 79-94:** Switches pour paramètres globaux
- **Référence:** Devrait être stocké dans une table de configuration OU rester statique si pas critique
- **Note:** Si les paramètres globaux ne sont pas critiques, peut rester statique

### 28. **Comparison Page - Current Soil Display** (`src/app/(app)/comparison/page.tsx`)
**Problème:** Affichage des valeurs de sol actuelles hardcodées
- **Ligne 63:** String hardcodée avec valeurs N, P, K, etc.
- **Référence:** Devrait venir de la dernière analyse de l'utilisateur (`analyses` table)
- **Note:** Déjà mentionné dans PRIORITÉ MOYENNE #9

---

## 📊 FICHIERS DE DONNÉES MOCKÉES

### `src/lib/data.ts`
**Contenu mocké:**
- `kpiData`: 4 KPIs hardcodés
- `recentAnalyses`: 5 analyses hardcodées
- `recentAnalysesChartData`: 8 points de données hardcodés
- `cropDistributionData`: 5 crops avec pourcentages hardcodés
- `nutrientLevels`: N, P, K avec valeurs optimales hardcodées
- `crops`: Liste de 22 crops (peut rester statique)
- `cropComparisonData`: Données de compatibilité pour rice/maize (peut rester statique - données de référence)
- `radarChartData`: Données de graphique radar (peut rester statique si utilisé pour comparaison de référence)

### `src/lib/admin-data.ts`
**Contenu mocké:**
- `adminKpiData`: 4 KPIs admin hardcodés
- `analysesTimeChartData`: 12 mois avec counts hardcodés
- `topCropsData`: Top 8 crops avec counts/percentages hardcodés
- `newUsersData`: 7 jours avec counts hardcodés
- `cropCategoryData`: 4 catégories avec pourcentages hardcodés
- `usersData`: 6 utilisateurs hardcodés
- `analysesData`: Array généré aléatoirement depuis `usersData`

---

## 🎯 PLAN DE CORRECTION PAR PRIORITÉ

### PHASE 1: CRITIQUE (À faire en premier)

1. **Dashboard Utilisateur** (`src/app/(app)/page.tsx`)
   - Remplacer `kpiData` par requêtes Supabase:
     - Total Analyses: `count()` depuis `analyses` où `user_id = user.id`
     - Most Predicted Crop: `group by recommended_crop`, `order by count desc`, `limit 1`
     - Average Confidence: `avg(confidence)` depuis `analyses`
     - Average pH: `avg(ph)` depuis `analyses`
   - Remplacer `nutrientLevels` par calcul depuis les dernières analyses
   - Modifier `RecentAnalyses.tsx` et `CropDistribution.tsx` pour accepter des props depuis le parent

2. **RecentAnalyses Component**
   - Remplacer `recentAnalyses` et `recentAnalysesChartData` par requête Supabase:
     - `select('recommended_crop, created_at, confidence')` depuis `analyses`
     - `order('created_at', { ascending: false })`
     - `limit(5)` pour la liste
     - Grouper par jour pour le graphique

3. **CropDistribution Component**
   - Remplacer `cropDistributionData` par requête Supabase:
     - `select('recommended_crop')` depuis `analyses`
     - Grouper côté client par `recommended_crop` et calculer les pourcentages

4. **Admin Overview Page**
   - Remplacer `adminKpiData` par requêtes Supabase en parallèle:
     - Total Users: `count()` depuis `profiles`
     - Total Analyses: `count()` depuis `analyses`
     - Top Crop: `group by recommended_crop`, `order by count desc`, `limit 1`
     - Global Avg Confidence: `avg(confidence)` depuis `analyses`

5. **Admin Analyses Table**
   - Remplacer `analysesData` par requête Supabase:
     - `select('*, profiles!inner(display_name, email)')` depuis `analyses`
     - `order('created_at', { ascending: false })`
     - Ajouter pagination serveur avec `.range()`

6. **Admin Users Table**
   - Remplacer `usersData` par requête Supabase:
     - `select('*')` depuis `profiles`
     - Calculer `analyses` count avec sous-requête ou join
     - `order('created_at', { ascending: false })`

7. **Admin Charts** (4 composants)
   - `AnalysesTimeChart`: Grouper `analyses` par mois depuis `created_at`
   - `TopCropsCard`: Grouper `analyses` par `recommended_crop`, compter, trier
   - `NewUsersChart`: Grouper `profiles` par jour depuis `created_at` (7 derniers jours)
   - `CropCategoryChart`: Catégoriser les crops et grouper (logique métier à définir)

8. **UserDetailModal**
   - Remplacer `recentAnalyses` généré aléatoirement par requête Supabase:
     - `select('*')` depuis `analyses` où `user_id = user.id`
     - `order('created_at', { ascending: false })`
     - `limit(5)`

### PHASE 2: MOYENNE (À faire après Phase 1)

9. **Comparison Page - Current Soil Values**
   - Récupérer la dernière analyse de l'utilisateur depuis `analyses`
   - Utiliser ces valeurs pour afficher "Current soil"
   - Utiliser ces valeurs pour `radarChartData.current`

10. **Settings Page - Default Soil Values**
    - Récupérer la dernière analyse de l'utilisateur depuis `analyses`
    - Pré-remplir les `defaultValue` avec ces valeurs
    - OU créer un champ `default_soil_values` jsonb dans `profiles`

11. **Settings Page - Stats**
    - Remplacer "248 analyses saved" par `count()` depuis `analyses`

12. **Admin Pages - Badges Hardcodés**
    - Remplacer tous les badges hardcodés par calculs dynamiques depuis Supabase

13. **Admin Settings - Profile**
    - Charger le profil admin depuis `profiles` au lieu de valeurs hardcodées

14. **AnalysisDetailModal - Alternatives**
    - Utiliser `analysis.alternatives` (jsonb) au lieu de l'array hardcodé

15. **AnalysisDetailModal - Rainfall**
    - Utiliser `analysis.rainfall` au lieu de '180 mm' hardcodé

16. **AnalysisForm - Default Values**
    - Charger depuis la dernière analyse ou depuis les settings utilisateur

### PHASE 3: FAIBLE (Optionnel, amélioration UX)

17. **Admin Analyses Page - Crop Filter**
    - Remplacer la liste hardcodée par `distinct recommended_crop` depuis `analyses`

18. **Settings Page - Preferences**
    - Créer un champ `preferences` jsonb dans `profiles` pour stocker les préférences utilisateur

19. **Admin Settings - Global Settings**
    - Créer une table `app_settings` ou utiliser un champ dans une table admin pour stocker les paramètres globaux

---

## ✅ DONNÉES QUI PEUVENT RESTER STATIQUES

Ces données sont des **données de référence** ou **mappings UI** et peuvent rester statiques:

1. **`crops`** (liste des 22 crops supportés) - Donnée de référence
2. **`cropComparisonData`** - Données agronomiques de référence (compatibilité idéale)
3. **`radarChartData`** - Si utilisé uniquement pour comparaison de référence (pas pour données utilisateur)
4. **`CROP_COLORS`** - Mapping UI pour les couleurs
5. **`roleColors`** - Mapping UI pour les couleurs de rôles
6. **Options de filtre temporel** - Options UI (Last 7 days, Last 30 days, etc.)
7. **Informations version** - Métadonnées de l'application (v1.0.0, 22 crops supported)
8. **Model Accuracy, API Response Avg** - Métriques techniques qui peuvent rester statiques

---

## 📝 NOTES IMPORTANTES

1. **Performance:** Utiliser `Promise.all()` pour les requêtes parallèles dans les dashboards
2. **Pagination:** Implémenter la pagination serveur avec `.range()` pour les grandes listes
3. **RLS:** Vérifier que les politiques RLS permettent aux utilisateurs de voir uniquement leurs données
4. **Calculs:** Certains calculs (pourcentages, moyennes) peuvent être faits côté client après récupération des données brutes
5. **Caching:** Considérer le caching pour les données qui changent peu (top crops, etc.)
6. **Erreurs:** Toujours gérer les erreurs Supabase avec `try/catch` et afficher des messages appropriés
7. **Loading States:** Ajouter des états de chargement pour toutes les nouvelles requêtes

---

## 🚀 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **Semaine 1:** Phase 1 (CRITIQUE) - Items 1 à 8
2. **Semaine 2:** Phase 2 (MOYENNE) - Items 9 à 16
3. **Semaine 3:** Phase 3 (FAIBLE) - Items 17 à 19 (optionnel)

---

**Fin du rapport d'audit**
