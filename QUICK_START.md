# ⚡ Quick Start - Workflow Cursor ↔ GitHub ↔ Lovable

## 🚀 Démarrage rapide (5 minutes)

### 1. Cloner dans Cursor
```bash
git clone git@github.com:okatech-org/okatech.git
cd okatech
npm install
npm run dev
```

### 2. Créer `.env.local`
```bash
cat > .env.local << 'ENVFILE'
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_APP_URL=http://localhost:8084
ENVFILE
```

### 3. Tester localement
```bash
npm run dev
# Ouvrez http://localhost:8084
```

---

## 📝 Workflow quotidien (30 secondes par push)

### Chaque fois que vous modifiez du code:

```bash
# 1. Testez
npm run dev

# 2. Commitez
git add .
git commit -m "Fix: description du changement"

# 3. Poussez
git push origin main

# 4. ✅ Lovable rebuild automatiquement (30 sec - 2 min)
```

---

## 🔑 Commandes essentielles

```bash
# Avant de commencer une session
git pull origin main

# Voir ce qui a changé
git status
git diff

# Committer proprement
git add .
git commit -m "Feature: ma nouvelle fonctionnalité"

# Pousser
git push origin main

# Voir l'historique
git log --oneline -10
```

---

## ⚠️ Important

- **Ne commitez JAMAIS** `.env.local` (c'est dans `.gitignore`)
- **Testez avant de pousser** avec `npm run dev`
- **Attendez 30-120 sec** que Lovable rebuild après un push
- **Messages clairs**: `Fix:`, `Feature:`, `Docs:`, `Refactor:`

---

## 🔧 Troubleshooting rapide

| Problème | Solution |
|----------|----------|
| "branch is ahead" | `git push origin main` |
| "non-fast-forward" | `git pull origin main --rebase` + `git push` |
| Rien ne compile | `npm run build` (voir les erreurs) |
| Lovable pas à jour | Attendre 2 min ou forcer sync dans Lovable |

---

## 📖 Documentation complète

Voir `WORKFLOW_DEVELOPMENT.md` pour le guide détaillé

**C'est tout! Vous êtes prêt à développer! 🚀**
