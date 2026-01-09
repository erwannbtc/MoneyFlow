-- ================================================
-- MONEYFLOW - SUPABASE SQL SETUP
-- ================================================
-- Ce fichier contient tout le SQL nécessaire pour
-- configurer la base de données Supabase
-- ================================================

-- 1. Créer la table des catégories (optionnel mais recommandé)
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les catégories par défaut
INSERT INTO categories (name, color, icon) VALUES
  ('Alimentation', '#FF9500', '🍔'),
  ('Transport', '#007AEF', '🚗'),
  ('Loisirs', '#5856D6', '🎮'),
  ('Logement', '#FF3B30', '🏠'),
  ('Santé', '#30D158', '💊'),
  ('Autres', '#8E8E93', '📦')
ON CONFLICT (name) DO NOTHING;

-- 2. Créer la table des transactions
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Autres',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- 3. Activer Row Level Security (RLS)
-- ================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- ================================================

-- Politique pour les transactions : les utilisateurs ne peuvent voir que leurs propres transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour les transactions : les utilisateurs peuvent insérer leurs propres transactions
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour les transactions : les utilisateurs peuvent modifier leurs propres transactions
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour les transactions : les utilisateurs peuvent supprimer leurs propres transactions
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politique pour les catégories : tous les utilisateurs authentifiés peuvent les voir
DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;
CREATE POLICY "Authenticated users can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Créer une fonction pour mettre à jour updated_at automatiquement
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer un trigger pour updated_at
-- ================================================
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Activer Realtime pour les transactions
-- ================================================
-- Note: Cette commande peut nécessiter d'être exécutée via le dashboard Supabase
-- ou via la commande suivante dans la console SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ================================================
-- INSTRUCTIONS D'UTILISATION
-- ================================================
-- 1. Copiez ce fichier SQL complet
-- 2. Allez sur votre projet Supabase : https://drtzpsoalftjqyogysot.supabase.co
-- 3. Cliquez sur "SQL Editor" dans le menu de gauche
-- 4. Créez une nouvelle requête
-- 5. Collez tout le contenu de ce fichier
-- 6. Cliquez sur "Run" pour exécuter
-- 7. Vérifiez que tout s'est bien passé en consultant l'onglet "Table Editor"
-- ================================================
