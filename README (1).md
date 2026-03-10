# AgriSmart - Application Intelligente de Recommandation de Cultures

AgriSmart est une application web moderne et professionnelle conçue pour aider les agriculteurs, agronomes et chercheurs à obtenir des recommandations de cultures optimisées en fonction de paramètres spécifiques du sol et du climat. L'application utilise un modèle de Machine Learning (simulé) pour analyser les données et suggérer la culture la plus adaptée, tout en offrant une expérience utilisateur riche et un panneau d'administration complet pour la gestion de la plateforme.

## Table des matières
1. [Fonctionnalités Utilisateur](#fonctionnalités-utilisateur)
    - [Tableau de bord](#tableau-de-bord)
    - [Nouvelle Analyse](#nouvelle-analyse)
    - [Historique des analyses](#historique-des-analyses)
    - [Comparaison de cultures](#comparaison-de-cultures)
    - [Authentification](#authentification)
2. [Panneau d'Administration](#panneau-dadministration)
    - [Vue d'ensemble (Overview)](#vue-densemble-overview)
    - [Gestion des Utilisateurs](#gestion-des-utilisateurs)
    - [Gestion des Analyses](#gestion-des-analyses)
    - [Paramètres](#paramètres)
3. [Architecture Backend (FastAPI)](#architecture-backend-fastapi)
    - [Rôle et Sécurité](#rôle-et-sécurité)
    - [Endpoints de l'API](#endpoints-de-lapi)
4. [Stack Technique](#stack-technique)
5. [Installation et Démarrage](#installation-et-démarrage)

---

## Fonctionnalités Utilisateur

L'interface principale est conçue pour être intuitive et fournir des informations précieuses en un coup d'œil.

### Tableau de bord
Après connexion, l'utilisateur accède à un tableau de bord personnalisé qui présente :
- **KPIs (Indicateurs Clés de Performance)** : Nombre total d'analyses, culture la plus recommandée, score de confiance moyen.
- **Historique Récent** : Un graphique linéaire des scores de confiance des dernières analyses et une liste des analyses récentes.
- **Distribution des Cultures** : Un diagramme circulaire montrant la répartition des cultures recommandées.
- **Niveaux de Nutriments** : Des cartes indiquant les niveaux actuels de Nitrogène (N), Phosphore (P) et Potassium (K) dans le sol.

### Nouvelle Analyse
Le cœur de l'application. Un formulaire permet à l'utilisateur de saisir 7 paramètres essentiels :
- Nitrogène, Phosphore, Potassium (en mg/kg)
- Température (en °C)
- Humidité (en %)
- Niveau de pH du sol
- Précipitations (en mm)

Après soumission, le modèle d'IA analyse les données et présente une carte de résultats détaillée avec :
- La **culture recommandée**.
- Un **score de confiance** en pourcentage.
- Une liste de **cultures alternatives** viables.
- Les **conditions idéales** pour la culture recommandée à titre de comparaison.

### Historique des analyses
Toutes les analyses effectuées par l'utilisateur sont sauvegardées et accessibles dans un tableau complet. Cette section offre :
- Une **recherche** par nom de culture.
- Une **pagination** pour naviguer facilement à travers un grand nombre d'enregistrements.
- L'option d'**exporter** les données au format CSV.

### Comparaison de cultures
Un outil puissant permettant aux utilisateurs de sélectionner deux cultures et de les comparer côte à côte en fonction des conditions actuelles du sol. L'interface affiche :
- Un **score de compatibilité** pour chaque culture.
- Un tableau détaillant la compatibilité de chaque paramètre du sol.
- Un **graphique radar** pour une visualisation comparative des besoins de chaque culture par rapport aux valeurs actuelles.

### Authentification
Un système d'authentification sécurisé géré par **Supabase Auth** :
- Pages de **connexion** (`/login`) et d'**inscription** (`/register`) au design soigné.
- Possibilité de s'inscrire par email/mot de passe ou via un fournisseur OAuth (Google).
- Protection de toutes les routes de l'application ; seuls les utilisateurs non authentifiés peuvent accéder aux pages de connexion/inscription.

## Panneau d'Administration

Accessible via `/admin`, cette section est entièrement séparée de l'application utilisateur et est protégée pour n'être accessible qu'aux utilisateurs ayant le rôle "admin".

### Vue d'ensemble (Overview)
Un tableau de bord centralisé pour superviser l'ensemble de la plateforme :
- **KPIs globaux** : Nombre total d'utilisateurs, nombre total d'analyses, culture la plus populaire, etc.
- **Graphiques d'évolution** : Analyses au fil du temps, acquisition de nouveaux utilisateurs.
- **Graphiques de répartition** : Analyses par catégorie de culture, top des cultures les plus recommandées.

### Gestion des Utilisateurs
Une table complète pour lister et gérer tous les utilisateurs de la plateforme.
- **Filtres et recherche** par nom, email ou rôle.
- **Actions rapides** pour voir les détails d'un utilisateur, ses analyses, ou le supprimer.
- Une **modale de détail** affiche les informations complètes d'un utilisateur, y compris ses analyses récentes.

### Gestion des Analyses
Permet de visualiser toutes les analyses effectuées sur la plateforme.
- **Filtres** par culture, utilisateur ou plage de dates.
- **Tableau détaillé** montrant tous les paramètres d'entrée pour chaque analyse.
- Une **modale** affiche une vue détaillée de l'analyse, y compris les alternatives et l'utilisateur qui l'a réalisée.

### Paramètres
Une section pour configurer le profil de l'administrateur et les paramètres globaux de l'application.
- **Profil Admin** : Gérer les informations personnelles.
- **Configuration Globale** : Activer/désactiver des fonctionnalités comme les nouvelles inscriptions ou la connexion Google pour tous les utilisateurs.
- **Zone de Danger** : Actions irréversibles (avec confirmation) comme l'effacement de données ou la réinitialisation de la plateforme.

## Architecture Backend (FastAPI)

*Note : L'architecture backend décrite ci-dessous est la conception cible. Actuellement, le panneau d'administration utilise des données simulées (mock data) à des fins de démonstration.*

Pour les opérations nécessitant des privilèges élevés dans le panneau d'administration, un backend dédié construit avec **FastAPI** (Python) est prévu. Ce service agira comme une couche sécurisée entre le front-end de l'administrateur et la base de données Supabase.

### Rôle et Sécurité

Le principal objectif de ce backend est de permettre des actions administratives qui ne devraient pas être possibles directement depuis le client, même pour un utilisateur administrateur. Pour ce faire, le backend FastAPI utilisera la **clé de service (`service_role` key)** de Supabase.

- La `service_role` key permet de contourner toutes les politiques de sécurité au niveau des lignes (Row Level Security - RLS).
- Cette clé sera stockée en toute sécurité dans les variables d'environnement du serveur backend et ne sera **jamais** exposée au front-end.
- Le front-end de l'administrateur (Next.js) effectuera des appels authentifiés (en utilisant le token JWT de l'admin) à l'API FastAPI, qui se chargera ensuite d'exécuter les requêtes sur Supabase avec les privilèges élevés.

### Endpoints de l'API

Les endpoints suivants sont prévus pour le service FastAPI :

- `POST /api/admin/stats`
  - **Description** : Récupère les statistiques globales agrégées pour le tableau de bord de l'administrateur (nombre total d'utilisateurs, d'analyses, etc.).
  - **Accès** : Admin uniquement.

- `GET /api/admin/users`
  - **Description** : Récupère une liste paginée de tous les utilisateurs de la plateforme. Prend en charge les filtres (par rôle, recherche par nom/email) et la pagination.
  - **Accès** : Admin uniquement.

- `GET /api/admin/analyses`
  - **Description** : Récupère une liste paginée de toutes les analyses effectuées sur la plateforme. Prend en charge les filtres (par culture, utilisateur, plage de dates) et la pagination.
  - **Accès** : Admin uniquement.

- `DELETE /api/admin/users/{user_id}`
  - **Description** : Supprime un utilisateur et toutes ses données associées de la base de données.
  - **Accès** : Admin uniquement.

Cette architecture garantit que les données sensibles et les opérations critiques sont gérées de manière sécurisée côté serveur, conformément aux meilleures pratiques de sécurité.

## Stack Technique

- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **Backend** : FastAPI (pour les opérations d'administration)
- **UI** : React, Tailwind CSS
- **Composants UI** : ShadCN UI
- **Authentification & Base de données** : Supabase (Auth, PostgreSQL)
- **Graphiques** : Recharts
- **Gestion de formulaires** : React Hook Form & Zod
- **IA & Flows** : Genkit

## Installation et Démarrage

Suivez ces étapes pour lancer le projet en local.

### 1. Prérequis
- Node.js (version 20.x ou supérieure)
- npm ou yarn
- Python 3.8+ et pip (pour le backend FastAPI)

### 2. Configuration de l'environnement
Le projet nécessite une connexion à un projet Supabase.

1.  Créez un fichier `.env` à la racine du projet en copiant `.env.example` (si disponible) ou en le créant de zéro.
2.  Ajoutez vos clés d'API Supabase dans le fichier `.env` :

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
    ```
    
    Vous trouverez ces clés dans votre tableau de bord Supabase > Paramètres du projet > API. Pour le backend, vous aurez également besoin de la `service_role` key.

### 3. Installation des dépendances
Ouvrez un terminal à la racine du projet et exécutez :
```bash
npm install
```
*(Instructions pour le backend à ajouter ici)*

### 4. Lancement de l'application
Pour démarrer le serveur de développement Next.js :
```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:9002](http://localhost:9002).
Le panneau d'administration sera accessible à l'adresse [http://localhost:9002/admin](http://localhost:9002/admin).
