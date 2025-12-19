# 🔧 Configuration Supabase Backend

## 📋 Vue d'ensemble

OKA Tech utilise **Supabase** comme backend pour:
- Stockage des prospects (leads)
- Historique des conversations
- Génération de rapports via Edge Functions
- Authentification (optionnel)

## 🔐 Credentials Supabase

### Projet
- **Project ID**: `ikzulqaewjaigjfqhjtq`
- **URL**: `https://ikzulqaewjaigjfqhjtq.supabase.co`
- **Region**: (eu-central)

### Configuration `.env.local`

```env
# Backend Lovable Cloud (Supabase)
VITE_SUPABASE_URL=https://ikzulqaewjaigjfqhjtq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrenVscWFld2phaWdqZnFoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTQwODQsImV4cCI6MjA3Njk5MDA4NH0.4WxTvwl_Gs9RULPdTZeCT8ED7DtZeMpzMTCzZpQtTqE
VITE_SUPABASE_PROJECT_ID=ikzulqaewjaigjfqhjtq

# OpenAI (pour tests locaux)
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
VITE_OPENAI_MODEL=gpt-4o-mini

# App
VITE_APP_URL=http://localhost:8084
```

⚠️ **IMPORTANT**: Ne commitez JAMAIS ces credentials dans Git!

## 📊 Structure de la Base de Données

### Table `leads`
Stocke les prospects

```sql
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  language text DEFAULT 'FR',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Colonnes**:
- `id`: UUID unique
- `name`: Nom du prospect
- `email`: Email du prospect
- `company`: Entreprise
- `phone`: Numéro de téléphone
- `language`: Langue (FR, EN)
- `created_at`: Date de création
- `updated_at`: Date de mise à jour

### Table `conversations`
Stocke les conversations IA

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]',
  phase integer DEFAULT 1,
  compatibility_score integer,
  identified_need text,
  report text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Colonnes**:
- `id`: UUID unique
- `lead_id`: Référence au prospect
- `messages`: Array JSON des messages
- `phase`: Phase de conversation (1-3)
- `compatibility_score`: Score de compatibilité (0-100)
- `identified_need`: Besoin identifié
- `report`: Rapport généré
- `created_at`: Date de création
- `updated_at`: Date de mise à jour

## 🔓 Politiques de Sécurité (RLS)

### `leads` table
```sql
-- Lecture publique
CREATE POLICY "Public leads are readable" ON leads
  FOR SELECT USING (true);

-- Insertion publique
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Mise à jour publique
CREATE POLICY "Anyone can update leads" ON leads
  FOR UPDATE USING (true);
```

### `conversations` table
```sql
-- Lecture publique
CREATE POLICY "Public conversations are readable" ON conversations
  FOR SELECT USING (true);

-- Insertion publique
CREATE POLICY "Anyone can insert conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Mise à jour publique
CREATE POLICY "Anyone can update conversations" ON conversations
  FOR UPDATE USING (true);
```

## ⚡ Edge Functions

### `chat` Function
**Localisation**: `supabase/functions/chat/index.ts`

**Responsabilité**: Gérer les conversations IA

**Entrée**:
```typescript
{
  conversationId?: string,
  userMessage: string,
  prospectInfo: {
    leadId?: string,
    name: string,
    email: string,
    company: string,
    phone?: string
  }
}
```

**Sortie**:
```typescript
{
  response: string,
  shouldCollectContact: boolean,
  conversationId: string,
  leadId: string
}
```

### `generate-report` Function
**Localisation**: `supabase/functions/generate-report/index.ts`

**Responsabilité**: Générer le rapport d'analyse

**Entrée**:
```typescript
{
  conversationId: string
}
```

**Sortie**:
```typescript
{
  report: string,
  compatibilityScore: number,
  prospectInfo: {...}
}
```

## 🚀 Déploiement

### Local
```bash
npm run dev
# Accédez à http://localhost:8084
```

### Lovable
Les Edge Functions sont déployées automatiquement via GitHub:

1. Poussez vos changements: `git push origin main`
2. Lovable détecte les changements
3. Les Edge Functions se redéploient automatiquement
4. Disponible immédiatement après le rebuild

## 🔧 Utilisation depuis le Frontend

### Appels aux Edge Functions

```typescript
import { supabase } from "@/integrations/supabase/client";

// Appel à la fonction 'chat'
const { data, error } = await supabase.functions.invoke('chat', {
  body: {
    conversationId,
    userMessage,
    prospectInfo: {...}
  }
});

// Appel à la fonction 'generate-report'
const { data, error } = await supabase.functions.invoke('generate-report', {
  body: { conversationId }
});
```

### Accès à la base de données

```typescript
// Créer un lead
const { data, error } = await supabase
  .from('leads')
  .insert([{
    name: 'John Doe',
    email: 'john@example.com',
    company: 'ACME Corp'
  }]);

// Récupérer une conversation
const { data, error } = await supabase
  .from('conversations')
  .select()
  .eq('id', conversationId)
  .single();

// Mettre à jour une conversation
const { data, error } = await supabase
  .from('conversations')
  .update({ report: newReport })
  .eq('id', conversationId);
```

## 📖 Documentation Supabase

- **Console Supabase**: https://app.supabase.com/
- **Documentation**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **JavaScript Client**: https://supabase.com/docs/reference/javascript

## 🆘 Dépannage

### Erreur: "supabaseUrl is required"
**Cause**: Variables d'environnement Supabase non configurées

**Solution**:
```bash
# Créez .env.local avec les credentials
# Relancez npm run dev
npm run dev
```

### Erreur: "Policies not set"
**Cause**: RLS policies non configurées

**Solution**: Allez sur Supabase Console → Authentication → RLS et vérifiez les policies

### Les Edge Functions ne répondent pas
**Cause**: Functions non déployées ou erreur à l'exécution

**Solution**:
1. Vérifiez les logs: Supabase Console → Edge Functions → Logs
2. Vérifiez la syntaxe du code
3. Redéployez: `git push origin main`

## ✅ Checklist de Configuration

- [ ] `.env.local` créé avec credentials Supabase
- [ ] `.env.local` dans `.gitignore` (ne pas committer)
- [ ] Lovable env vars configurés:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_PUBLISHABLE_KEY
  - [ ] VITE_OPENAI_API_KEY
- [ ] Tables `leads` et `conversations` créées
- [ ] RLS policies activées
- [ ] Edge Functions déployées
- [ ] Tests locaux réussis: `npm run dev`
- [ ] Tests sur Lovable réussis

## 📝 Notes

- Les credentials Supabase sont publics (clé anonyme, pas de secret)
- Les Edge Functions exécutent le code côté serveur
- Les données sont synchronisées automatiquement
- RLS permet le contrôle d'accès granulaire (optionnel)

---

**Fin de configuration Supabase!** 🎉

