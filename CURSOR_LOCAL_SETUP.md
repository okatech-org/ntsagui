# 🚀 Configuration Complète - Développement Local Cursor + Lovable Cloud

## 📋 Setup Initial

### 1️⃣ Cloner le projet
```bash
git clone git@github.com:okatech-org/okatech.git
cd okatech
npm install
```

### 2️⃣ Créer `.env.local` (à la racine du projet)

**IMPORTANT:** Ce fichier ne doit JAMAIS être commité (il est dans `.gitignore`)

Créez le fichier `/Users/okatech/okatech/.env.local` avec ce contenu:

```env
# Backend Lovable Cloud (Supabase)
VITE_SUPABASE_URL=https://ikzulqaewjaigjfqhjtq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrenVscWFld2phaWdqZnFoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTQwODQsImV4cCI6MjA3Njk5MDA4NH0.4WxTvwl_Gs9RULPdTZeCT8ED7DtZeMpzMTCzZpQtTqE
VITE_SUPABASE_PROJECT_ID=ikzulqaewjaigjfqhjtq

# OpenAI (si vous voulez tester localement avec votre clé)
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
VITE_OPENAI_MODEL=gpt-4o-mini

# App
VITE_APP_URL=http://localhost:8084
```

**Pour obtenir votre clé OpenAI:**
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé
3. Copier la clé dans `VITE_OPENAI_API_KEY`

---

## 📊 Structure de la Base de Données

### Table `leads`
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

**Champs:**
- `id` (uuid, clé primaire)
- `name` (texte) - Nom du prospect
- `email` (texte) - Email du prospect
- `company` (texte) - Entreprise
- `phone` (texte, nullable) - Téléphone
- `language` (texte, default: 'FR') - Langue du prospect
- `created_at` (timestamp) - Date de création
- `updated_at` (timestamp) - Dernière mise à jour

### Table `conversations`
```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  phase integer DEFAULT 1,
  compatibility_score integer,
  identified_need text,
  report text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Champs:**
- `id` (uuid, clé primaire)
- `lead_id` (uuid, FK) - Référence au prospect
- `messages` (jsonb) - Historique des messages
- `phase` (integer, default: 1) - Phase de qualification (1, 2, 3)
- `compatibility_score` (integer, nullable) - Score de compatibilité 0-100
- `identified_need` (text, nullable) - Besoin identifié
- `report` (text, nullable) - Rapport généré
- `created_at` (timestamp) - Date de création
- `updated_at` (timestamp) - Dernière mise à jour

### RLS (Row Level Security)
✅ Activé sur les deux tables
✅ Politiques publiques pour tests
✅ Production: à sécuriser

---

## 🔧 Edge Functions (Lovable Cloud)

### 1️⃣ **`chat`** Function
**URL:** `https://ikzulqaewjaigjfqhjtq.supabase.co/functions/v1/chat`

**Payload:**
```json
{
  "userMessage": "Décrivez votre besoin...",
  "conversationId": "uuid-optional",
  "leadId": "uuid-optional",
  "context": {
    "language": "FR",
    "prospectInfo": {
      "name": "John",
      "email": "john@example.com",
      "company": "ACME Corp"
    }
  }
}
```

**Response:**
```json
{
  "response": "Réponse IA...",
  "shouldCollectContact": false,
  "conversationId": "uuid",
  "leadId": "uuid"
}
```

### 2️⃣ **`generate-report`** Function
**URL:** `https://ikzulqaewjaigjfqhjtq.supabase.co/functions/v1/generate-report`

**Payload:**
```json
{
  "leadId": "uuid",
  "conversationId": "uuid",
  "leadInfo": {
    "name": "John Doe",
    "company": "ACME Corp",
    "email": "john@example.com",
    "phone": "+33612345678"
  },
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "reportId": "uuid",
  "reportUrl": "https://...",
  "pdfGenerated": true
}
```

**Configuration dans `supabase/config.toml`:**
```toml
[functions.chat]
verify_jwt = false

[functions.generate-report]
verify_jwt = false
```

---

## 🏃 Commandes Utiles

### Démarrage
```bash
npm run dev
# Lance le serveur sur http://localhost:8084
```

### Build (test avant deployment)
```bash
npm run build
# Génère la build dans le dossier dist/
```

### Linting & Vérification
```bash
npm run lint
# Vérifie les erreurs TypeScript et eslint
```

### Git Workflow
```bash
# 1. Voir les changements
git status

# 2. Ajouter les changements
git add .

# 3. Créer un commit
git commit -m "Fix: description du changement"

# 4. Pousser vers GitHub
git push origin main

# 5. Lovable rebuild automatiquement (30 sec - 2 min)
```

---

## 🧪 Tests Locaux

### Test du Chatbot
```bash
1. npm run dev
2. Ouvrir http://localhost:8084
3. Cliquer le bouton chatbot (bas-droit)
4. Écrire un message
5. Vérifier la réponse dans la console (F12)
```

### Test des Edge Functions
```bash
curl -X POST https://ikzulqaewjaigjfqhjtq.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Bonjour",
    "context": { "language": "FR" }
  }'
```

### Vérifier les Logs
```bash
# Supabase Logs (Dashboard)
https://app.supabase.com/project/ikzulqaewjaigjfqhjtq/functions

# Logs Console (F12 dans navigateur)
- Ctrl/Cmd + Shift + J (DevTools)
- Onglet "Console"
- Chercher "[Supabase Client]"
```

---

## 📊 Workflow Complet

### Jour 1: Setup Initial
```bash
# 1. Cloner
git clone git@github.com:okatech-org/okatech.git
cd okatech

# 2. Installer
npm install

# 3. Créer .env.local (voir section 2)

# 4. Démarrer
npm run dev

# 5. Tester http://localhost:8084
```

### Jour N: Développement
```bash
# 1. Modifier code dans Cursor

# 2. Tester localement
npm run dev

# 3. Vérifier console (F12)
# Chercher "[Supabase Client] URL configured: ..."
# Chercher "[Supabase Client] Key configured: ..."

# 4. Commit
git add .
git commit -m "Feature: description"

# 5. Push
git push origin main

# 6. Attendre rebuild Lovable (30 sec - 2 min)

# 7. Vérifier sur https://okatech.lovable.app
```

---

## 🔍 Dépannage

### Erreur: "supabaseUrl is required"
**Solution:**
```bash
# 1. Vérifier .env.local existe
ls -la .env.local

# 2. Vérifier les variables
cat .env.local

# 3. Redémarrer serveur
npm run dev

# 4. Vérifier console (F12):
# [Supabase Client] URL configured: true
# [Supabase Client] Key configured: true
```

### Erreur: "OpenAI API key not found"
**Solution:**
```bash
# 1. Vérifier VITE_OPENAI_API_KEY dans .env.local
# 2. Redémarrer npm run dev
# 3. Ne pas partager votre clé API!
```

### Erreur: "Git permission denied"
**Solution:**
```bash
# Utiliser SSH (configuré par défaut)
git remote -v
# Doit montrer: git@github.com:okatech-org/okatech.git

# Si HTTPS, changer:
git remote set-url origin git@github.com:okatech-org/okatech.git
```

### Chatbot ne répond pas
**Solution:**
```bash
# 1. Vérifier console (F12) pour erreurs
# 2. Vérifier .env.local variables
# 3. Vérifier Supabase Functions logs:
#    https://app.supabase.com/project/ikzulqaewjaigjfqhjtq/functions
# 4. Vérifier OpenAI API key valide
```

---

## 📈 Progression de Développement

### Phase 1: Setup ✅
- [x] Cloner le projet
- [x] Installer dépendances
- [x] Créer `.env.local`
- [x] Tester `npm run dev`

### Phase 2: Développement
- [ ] Modifier les pages/composants
- [ ] Tester localement
- [ ] Vérifier erreurs console
- [ ] Commit et push

### Phase 3: Vérification
- [ ] Rebuild Lovable (attendre)
- [ ] Tester sur https://okatech.lovable.app
- [ ] Vérifier toutes les fonctionnalités

---

## 📚 Ressources

### Documentation
- **Supabase:** https://supabase.com/docs
- **Vite:** https://vitejs.dev/guide/
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs/

### Supabase Project
- **Dashboard:** https://app.supabase.com/project/ikzulqaewjaigjfqhjtq
- **Project ID:** `ikzulqaewjaigjfqhjtq`
- **Region:** (à vérifier dans dashboard)

### GitHub
- **Repository:** https://github.com/okatech-org/okatech
- **Main Branch:** origin/main

---

## ✅ Checklist Final

Avant de commencer le développement:

- [ ] `.env.local` créé avec credentials
- [ ] `npm install` terminé sans erreurs
- [ ] `npm run dev` lance sans erreurs
- [ ] http://localhost:8084 accessible
- [ ] Console (F12) ne montre pas d'erreurs critiques
- [ ] Supabase URL et Key configurés dans .env.local
- [ ] Git remote pointe vers SSH
- [ ] Vous pouvez modifier un fichier et save

**Une fois tous les ✅ cochés, vous êtes prêt à développer! 🚀**

---

*Dernière mise à jour: 2025*
*Backend: Lovable Cloud (Supabase)*
*Frontend: React 18 + TypeScript + Vite*
