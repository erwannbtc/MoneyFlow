# MoneyFlow

Application PWA moderne de suivi de dépenses quotidiennes et d'abonnements, avec design iOS native-style.

## Stack Technique

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (Auth + Database + Realtime)
- **UI**: CSS pur, design iOS native
- **Charts**: Recharts
- **Dates**: date-fns
- **PWA**: vite-plugin-pwa

## Fonctionnalités

### Authentification
- Connexion et inscription via email/mot de passe
- Authentification sécurisée avec Supabase Auth
- Gestion de session persistante

### Page Accueil
- Affichage du solde restant
- Widget des 3 dernières transactions
- Mise à jour en temps réel

### Page Calendrier
- Calendrier mensuel avec navigation
- Visualisation des dépenses par jour
- Graphique camembert des dépenses par catégorie
- Liste complète des transactions du mois

### Ajouter une Transaction
- Formulaire complet avec validation
- Nom, montant, description, catégorie, date
- Toggle pour transactions récurrentes (abonnements)
- Catégories prédéfinies

### Navigation
- Bottom navigation bar style iOS
- Bouton central "+" pour ajouter rapidement
- Transitions fluides entre pages

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour production
npm run build

# Prévisualiser le build
npm run preview
```

## Configuration Supabase

### 1. Créer le projet Supabase
Le projet est déjà configuré avec l'URL et la clé ANON dans `src/services/supabase.js`.

### 2. Créer les tables
Exécutez le fichier `SUPABASE_SQL.sql` dans le SQL Editor de Supabase :
1. Ouvrez https://drtzpsoalftjqyogysot.supabase.co
2. Allez dans "SQL Editor"
3. Créez une nouvelle requête
4. Copiez-collez le contenu de `SUPABASE_SQL.sql`
5. Cliquez sur "Run"

Le script créera :
- Table `categories` avec catégories par défaut
- Table `transactions` avec tous les champs nécessaires
- Row Level Security (RLS) activé
- Politiques de sécurité pour chaque utilisateur
- Realtime activé pour les mises à jour en temps réel
- Indexes pour optimiser les performances

### 3. Activer Realtime (si nécessaire)
Dans le dashboard Supabase :
1. Allez dans "Database" > "Replication"
2. Assurez-vous que la table `transactions` est activée

## Structure du Projet

```
MoneyFlow/
├── public/
│   └── icons/           # Icônes de l'app
├── src/
│   ├── components/      # Composants réutilisables
│   │   └── BottomNav.jsx
│   ├── hooks/           # Hooks personnalisés
│   │   ├── useAuth.js
│   │   └── useTransactions.js
│   ├── pages/           # Pages de l'application
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── Calendar.jsx
│   │   └── AddTransaction.jsx
│   ├── services/        # Services externes
│   │   └── supabase.js
│   ├── App.jsx          # Composant principal
│   └── index.css        # Styles globaux
├── SUPABASE_SQL.sql     # Script SQL pour Supabase
└── vite.config.js       # Configuration Vite + PWA
```

## Principes de Design

- Minimaliste et moderne
- Inspiré d'iOS native
- Pas d'emojis ni de surcharge visuelle
- Animations subtiles
- Typographie élégante (Inter)
- Dark mode par défaut
- Support des safe areas iOS

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Chaque utilisateur accède uniquement à ses propres données
- Authentification sécurisée via Supabase Auth
- Validation des données côté client et serveur

## Temps Réel

L'application utilise Supabase Realtime pour :
- Mettre à jour automatiquement la liste des transactions
- Synchroniser le solde en temps réel
- Refléter les changements instantanément sur tous les écrans

## PWA

L'application est une Progressive Web App :
- Installable sur mobile et desktop
- Fonctionne offline (cache des assets)
- Service Worker automatique
- Manifest configuré pour iOS et Android

## Performance

- Build optimisé avec Vite
- Code splitting
- Lazy loading des composants
- Cache intelligent avec Workbox
- CSS optimisé

## Support Navigateurs

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari iOS 14+
- Safari macOS

## License

Propriétaire
