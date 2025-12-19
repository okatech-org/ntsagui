# ⚡ Référence Rapide - Développement Local

## 🚀 Démarrage Instant

```bash
# Setup initial (une seule fois)
git clone git@github.com:okatech-org/okatech.git
cd okatech
npm install

# Créer .env.local (voir CURSOR_LOCAL_SETUP.md section 2)

# Lancer le serveur de développement
npm run dev
# → http://localhost:8084
```

---

## 📋 Commandes Essentielles

```bash
# Démarrage
npm run dev          # Serveur dev sur localhost:8084

# Build
npm run build        # Créer build pour production

# Vérification
npm run lint         # Vérifier erreurs TypeScript/ESLint

# Git Workflow
git status           # Voir les changements
git add .            # Ajouter tous les changements
git commit -m "msg"  # Créer un commit
git push origin main # Pousser sur GitHub
```

---

## 🔑 Variables Essentielles (.env.local)

```env
VITE_SUPABASE_URL=https://ikzulqaewjaigjfqhjtq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrenVscWFld2phaWdqZnFoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTQwODQsImV4cCI6MjA3Njk5MDA4NH0.4WxTvwl_Gs9RULPdTZeCT8ED7DtZeMpzMTCzZpQtTqE
VITE_SUPABASE_PROJECT_ID=ikzulqaewjaigjfqhjtq
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_APP_URL=http://localhost:8084
```

---

## 🌐 URLs Principales

| Service | URL |
|---------|-----|
| **App Locale** | http://localhost:8084 |
| **App Production** | https://okatech.lovable.app |
| **Supabase Dashboard** | https://app.supabase.com/project/ikzulqaewjaigjfqhjtq |
| **GitHub Repository** | https://github.com/okatech-org/okatech |
| **Supabase Logs** | https://app.supabase.com/project/ikzulqaewjaigjfqhjtq/functions |

---

## 📂 Structure Projet

```
okatech/
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilitaires
│   ├── contexts/          # Theme & Language contexts
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Traductions (FR, EN, ES, AR)
│   ├── styles/            # Design system (theme.ts)
│   └── App.tsx            # Routing principal
├── .env.local             # Credentials locaux (⚠️ NE PAS COMMITER)
├── CURSOR_LOCAL_SETUP.md  # Setup complet
└── package.json           # Dépendances
```

---

## 🧪 Tester le Chatbot

```bash
# 1. Démarrer
npm run dev

# 2. Ouvrir http://localhost:8084

# 3. Cliquer bouton chatbot (bas-droit)

# 4. Écrire un message

# 5. F12 → Console pour voir logs
```

---

## 🐛 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| `supabaseUrl is required` | Vérifier `.env.local` existe et redémarrer `npm run dev` |
| `OpenAI API key not found` | Ajouter `VITE_OPENAI_API_KEY` à `.env.local` |
| Erreur Git permission | `git remote set-url origin git@github.com:okatech-org/okatech.git` |
| Port 8084 déjà utilisé | `lsof -i :8084` puis tuer le processus |
| Dépendances cassées | `rm -rf node_modules package-lock.json && npm install` |

---

## 🔄 Cycle Développement

```
1. Modifier code → 2. npm run dev → 3. Tester F12
    ↓
4. git add . → 5. git commit -m "msg" → 6. git push origin main
    ↓
7. Attendre rebuild Lovable (30 sec - 2 min)
    ↓
8. Vérifier sur https://okatech.lovable.app
```

---

## 📊 Statistiques Actuelles

- **520+ traductions** (FR, EN, ES, AR)
- **180+ clés de traduction**
- **14 sections complètes**
- **4 langues supportées**
- **RTL support** (Arabe)
- **Theme dark/light**
- **Chatbot IA** traduit & functional

---

## 🎯 Pages Implémentées

- ✅ **Home** - Hero, Value Props, Solutions, Contact
- ✅ **About** - Story, Mission, Vision, Specializations, Values
- ✅ **Solutions** - Services showcase, Why Choose Us
- ✅ **Contact** - Contact form, FAQ, Hours
- ✅ **AdminLogin** - Secure login with dark mode
- ✅ **AdminDashboard** - Overview, Leads, Analytics, Settings

---

## 🚀 Prochaines Étapes

1. **Créer `.env.local`** avec les credentials
2. **Installer dépendances**: `npm install`
3. **Lancer serveur**: `npm run dev`
4. **Tester sur**: http://localhost:8084
5. **Modifier code** et tester
6. **Commit et push** quand prêt

---

**Documentation Complète**: Voir `CURSOR_LOCAL_SETUP.md`
