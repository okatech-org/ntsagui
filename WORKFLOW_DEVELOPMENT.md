# 🔄 Workflow de Développement - Cursor ↔ GitHub ↔ Lovable

## Vue d'ensemble

```
┌──────────────┐         ┌──────────┐         ┌────────────┐
│   CURSOR     │ ------> │  GITHUB  │ ------> │  LOVABLE   │
│   (Local)    │ ←------ │ (Repo)   │ ←------ │  (Preview) │
└──────────────┘         └──────────┘         └────────────┘

✓ Cursor: Développement complet + débogage
✓ GitHub: Hub central de synchronisation
✓ Lovable: Prévisualisation + édition rapide
```

---

## 1️⃣ CONFIGURATION INITIALE

### Cloner le projet dans Cursor
```bash
git clone git@github.com:okatech-org/okatech.git
cd okatech
npm install
npm run dev
```

### Variables d'environnement locales
Créez `.env.local` à la racine:
```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-4o-mini

# Application
VITE_APP_URL=http://localhost:8084
```

⚠️ **IMPORTANT**: Ne commitez JAMAIS `.env.local` (c'est dans `.gitignore`)

---

## 2️⃣ WORKFLOW STANDARD CURSOR → GITHUB

### Étape 1: Faire vos modifications
```
Dans Cursor:
├─ Éditez vos fichiers
├─ npm run dev (testez localement)
├─ Vérifiez la console pour les erreurs
└─ Validez que tout fonctionne
```

### Étape 2: Vérifier les changements
```bash
# Voir tous les fichiers modifiés
git status

# Voir les changements détaillés
git diff

# Voir les changements d'un fichier spécifique
git diff src/components/MyComponent.tsx
```

### Étape 3: Committer vos changements
```bash
# Ajouter TOUS les changements
git add .

# OU ajouter sélectivement
git add src/components/
git add src/lib/

# Committer avec un message clair
git commit -m "Feature: Add new component XYZ"

# Conventions de messages:
# ✨ Feature: Nouvelle fonctionnalité
# 🐛 Fix: Correction de bug
# 📚 Docs: Documentation
# 🎨 Style: Changements de style/formatting
# ♻️  Refactor: Refactorisation du code
# ⚡ Performance: Amélioration de performance
# ✅ Test: Ajout/modification de tests
```

### Étape 4: Pousser vers GitHub
```bash
# Push simple
git push origin main

# Si erreur (branche divergée):
git pull origin main --rebase
git push origin main
```

---

## 3️⃣ SYNCHRONISATION AUTOMATIQUE

### GitHub → Lovable (AUTOMATIQUE)
```
┌─────────────────────────────────────────────┐
│ Vous poussez vers GitHub (git push)        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Lovable détecte les changements            │
│ (Grâce au lien GitHub du projet)           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Lovable rebuild automatiquement le projet   │
│ • Récupère les nouveaux fichiers            │
│ • Récompile les composants                  │
│ • Redéploie la prévisualisation             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ ✅ Changements disponibles sur Lovable      │
└─────────────────────────────────────────────┘
```

**Temps de synchronisation**: 30 secondes à 2 minutes

### Lovable → GitHub (si modifié sur Lovable)
```bash
# Sur Lovable, téléchargez les changements
# (Export ZIP ou directement dans Cursor)

# Dans Cursor:
git add .
git commit -m "Chore: Sync with Lovable changes"
git push origin main
```

---

## 4️⃣ WORKFLOW TYPIQUE DE DÉVELOPPEMENT

### Scénario: Corriger un bug trouvé sur Lovable

```
┌─ LOVABLE: Voir un bug sur la preview
│
├─ CURSOR: 
│  ├─ git pull origin main  (Récupérer la version actuelle)
│  ├─ Identifier le problème dans le code
│  ├─ Éditer le fichier responsable
│  ├─ npm run dev (tester la correction localement)
│  └─ Valider que le bug est fixé
│
├─ CURSOR:
│  ├─ git add .
│  ├─ git commit -m "Fix: bug description"
│  └─ git push origin main
│
└─ LOVABLE: Automatiquement rebuild et affiche la version corrigée ✅
```

---

## 5️⃣ COMMANDES GIT ESSENTIELLES

### Pull/Push
```bash
# Récupérer les derniers changements depuis GitHub
git pull origin main

# Pousser vos changements
git push origin main

# Pousser une branche spécifique
git push origin my-feature-branch
```

### Vérification
```bash
# Voir l'historique des commits
git log --oneline -10

# Voir le statut actuel
git status

# Voir les changements non stagés
git diff

# Voir les changements stagés
git diff --staged

# Voir les changements d'un fichier
git show HEAD:src/components/MyComponent.tsx
```

### Corrections
```bash
# Annuler les changements d'un fichier
git checkout src/components/MyComponent.tsx

# Annuler tous les changements (ATTENTION!)
git reset --hard HEAD

# Modifier le dernier commit
git commit --amend

# Annuler le dernier commit (garde les fichiers)
git reset --soft HEAD~1
```

---

## 6️⃣ BONNES PRATIQUES

### ✅ À FAIRE

1. **Commits fréquents et atomiques**
   ```bash
   # ✅ BON: Un changement = un commit
   git commit -m "Fix: AIChatbot message display"
   
   # ✅ BON: Commits liés
   git commit -m "Refactor: Extract ChatMessage component"
   git commit -m "Feature: Add message timestamps"
   ```

2. **Messages de commit clairs**
   ```bash
   # ✅ BON
   git commit -m "Fix: Resolve OpenAI API timeout on long conversations"
   
   # ✅ BON
   git commit -m "Feature: Add dark mode toggle in settings"
   
   # ❌ MAUVAIS
   git commit -m "fix stuff"
   git commit -m "update"
   ```

3. **Testez avant de pousser**
   ```bash
   npm run dev          # Vérifier que ça compile
   npm run build        # Vérifier le build production
   npm run lint         # Vérifier le code
   ```

4. **Tirez régulièrement depuis GitHub**
   ```bash
   # Chaque début de session
   git pull origin main
   ```

### ❌ À ÉVITER

1. **Pousser du code cassé**
   ```bash
   # ❌ Non! Testez d'abord
   git push origin main
   ```

2. **Committer les secrets**
   ```bash
   # ❌ Ne commitez JAMAIS:
   .env.local
   .env
   API keys
   Credentials
   ```

3. **Grands commits sans description**
   ```bash
   # ❌ MAUVAIS: 50 fichiers changés
   git add .
   git commit -m "updates"
   git push
   
   # ✅ BON: Commits séparés
   git commit -m "Fix: component A"
   git commit -m "Feature: component B"
   ```

4. **Force push sans raison**
   ```bash
   # ❌ Dangereux
   git push --force
   
   # ✅ Utilisez plutôt
   git push --force-with-lease
   ```

---

## 7️⃣ DÉPANNAGE COURANT

### Problème: "Your branch is ahead of 'origin/main'"
```bash
# Cela veut dire: Vous avez des commits locaux non pushés
# Solution:
git push origin main
```

### Problème: "rejected ... non-fast-forward"
```bash
# Cela veut dire: Des changements ont été faits sur GitHub
# Solution:
git pull origin main --rebase
git push origin main
```

### Problème: "Merge conflict"
```bash
# Cela veut dire: Deux personnes ont modifié le même fichier
# Solution:
git pull origin main
# Résolvez manuellement les conflits
# Puis:
git add .
git commit -m "Merge: Resolve conflicts"
git push origin main
```

### Problème: "npm run dev" ne compile pas
```bash
# 1. Vérifier les erreurs
npm run build

# 2. Vérifier la syntaxe
npm run lint

# 3. Nettoyer et recommencer
rm -rf node_modules
npm install
npm run dev
```

---

## 8️⃣ INTÉGRATION LOVABLE

### Configurer le lien GitHub dans Lovable

1. Allez sur votre projet Lovable
2. Settings → Git Integration
3. Connectez votre repo GitHub: `okatech-org/okatech`
4. Sélectionnez la branche: `main`
5. Cliquez "Sync Now"

### Après chaque push Cursor:
- ✅ Lovable détecte les changements (2-30 sec)
- ✅ Lovable rebuild le projet
- ✅ Aperçu mis à jour automatiquement

### Si rien n'est mis à jour:
```bash
# Sur Lovable, forcer le refresh:
Settings → Git Integration → Sync Now

# OU dans Cursor, faire un push explicite:
git push origin main -f
```

---

## 9️⃣ ENVIRONNEMENT VARIABLES

### Pour développement local (Cursor)
Créez `.env.local`:
```env
VITE_OPENAI_API_KEY=sk-proj-dev-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_APP_URL=http://localhost:8084
```

### Pour Lovable (Production Preview)
1. Lovable Settings → Environment Variables
2. Ajoutez:
   ```
   VITE_OPENAI_API_KEY=sk-proj-production-key-here
   VITE_OPENAI_MODEL=gpt-4o-mini
   VITE_APP_URL=https://lovable-preview-url.com
   ```

---

## 🔟 WORKFLOW RÉSUMÉ

```
1. CHANGEMENT LOCAL
   ├─ Éditez dans Cursor
   ├─ npm run dev (testez)
   └─ Validez

2. COMMIT LOCAL
   ├─ git add .
   └─ git commit -m "message"

3. PUSH VERS GITHUB
   ├─ git push origin main
   └─ Vérifiez GitHub (1 sec)

4. SYNC AUTOMATIQUE LOVABLE
   ├─ Lovable détecte (30 sec - 2 min)
   ├─ Lovable rebuild
   └─ Aperçu mis à jour ✅

5. TEST SUR LOVABLE
   ├─ Vérifiez la prévisualisation
   ├─ Si bug trouvé → Retour à ÉTAPE 1
   └─ Si OK → DONE! ✅
```

---

## 📊 STATUS CHECK

Pour vérifier le statut de vos changements:

```bash
# Commits non pushés?
git log --oneline origin/main..HEAD

# Fichiers modifiés?
git status

# Changements détaillés?
git diff

# Branche en retard?
git log --oneline HEAD..origin/main
```

---

## 💡 TIPS & TRICKS

### Alias Git utiles
```bash
# Ajouter à votre ~/.zshrc ou ~/.bashrc:
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline -10'
alias gd='git diff'
alias gb='git branch -a'

# Puis réloadez: source ~/.zshrc
```

### Commit rapide
```bash
# Au lieu de:
git add .
git commit -m "message"
git push origin main

# Faites simplement:
git add -A && git commit -m "message" && git push origin main
```

### Voir les commits récents
```bash
git log --oneline -n 20 --graph --all
```

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:

1. **Erreur de build**: `npm run build` → regardez les erreurs
2. **Git bloqué**: `git status` → vérifiez l'état
3. **Lovable pas à jour**: Attendez 2 min ou forcez le sync
4. **Changements perdus**: `git reflog` → retrouvez votre commit

---

**Bon développement! 🚀**
