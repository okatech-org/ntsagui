# 🔧 Configuration Lovable - Variables d'Environnement

## 🎯 Objectif

Configurer les variables d'environnement dans Lovable pour que l'application fonctourne correctement avec Supabase et OpenAI.

## ⚙️ Étapes de Configuration

### 1. Allez à Lovable Settings

```
1. Ouvrez votre projet Lovable
2. Cliquez sur "Settings" (⚙️ icône)
3. Recherchez "Environment Variables"
4. Ou allez directement à: https://lovable.dev/[project-id]/settings/env-vars
```

### 2. Ajoutez les Variables

Cliquez sur "Add Environment Variable" et ajoutez ces variables:

#### Backend Supabase (REQUIS)

```
VITE_SUPABASE_URL=https://ikzulqaewjaigjfqhjtq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrenVscWFld2phaWdqZnFoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTQwODQsImV4cCI6MjA3Njk5MDA4NH0.4WxTvwl_Gs9RULPdTZeCT8ED7DtZeMpzMTCzZpQtTqE
VITE_SUPABASE_PROJECT_ID=ikzulqaewjaigjfqhjtq
```

#### OpenAI Configuration (OPTIONNEL pour local, REQUIS pour production)

```
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
VITE_OPENAI_MODEL=gpt-4o-mini
```

#### Application Config

```
VITE_APP_URL=https://[your-lovable-url].lovable.app
```

### 3. Vérifiez la Configuration

```
1. Cliquez "Save" pour chaque variable
2. Allez à "Deployments" ou "Redeploy"
3. Attendez que le build se termine
4. Rechargez la page
```

## 🚨 Si Ça Ne Marche Pas

### Erreur: "supabaseUrl is required"

**Solution 1: Vérifiez les variables**
- Toutes les variables Supabase sont ajoutées? ✅
- Pas de typos dans les noms? ✅
- Les valeurs sont complètes? ✅

**Solution 2: Redéployez**
```
1. Settings → Deployments
2. Cliquez "Redeploy" ou "Force Rebuild"
3. Attendez 2-3 minutes
```

**Solution 3: Vérifiez la console**
```
1. F12 ou Cmd+Option+I
2. Allez à "Console"
3. Cherchez les messages d'erreur
4. Vérifiez que les variables sont bien chargées
```

## ✅ Checklist de Configuration

- [ ] Variable `VITE_SUPABASE_URL` ajoutée
- [ ] Variable `VITE_SUPABASE_PUBLISHABLE_KEY` ajoutée
- [ ] Variable `VITE_SUPABASE_PROJECT_ID` ajoutée
- [ ] Variable `VITE_OPENAI_API_KEY` ajoutée (si vous avez une clé)
- [ ] Variable `VITE_APP_URL` ajoutée (facultatif)
- [ ] Pas de typos dans les noms
- [ ] Toutes les valeurs sont complètes
- [ ] Build/Redeploy lancé après les changements
- [ ] Page rechargée après le déploiement
- [ ] Console pour erreurs vérifiée

## 🔐 Sécurité

⚠️ **IMPORTANT**:
- Les variables Lovable sont **PUBLIQUES** (compilées dans le bundle)
- Ne mettez JAMAIS de secrets confidentiels (API keys secrètes, passwords)
- La clé Supabase est **publique par design** (anon key)
- La clé OpenAI est **risquée** si exposée (pensez à limiter les quotas)

## 📝 Notes

- Les changements de variables nécessitent un **redeploy**
- L'application a un **fallback** si Supabase n'est pas configuré
- Sans OpenAI key, le chatbot ne répondra pas (erreur en console)
- Lovable détecte automatiquement les changements de code via GitHub

## 🆘 Support

Si ça ne marche toujours pas:

1. **Vérifiez GitHub**: 
   - Les changements sont-ils pushés?
   - Lovable a-t-il rebuild?

2. **Testez localement**:
   ```bash
   npm run dev
   # Devrait fonctionner avec .env.local
   ```

3. **Vérifiez Supabase**:
   - Project ID correct?
   - Anon key correcte?
   - Tables créées?

4. **Contactez support**:
   - Lovable: https://lovable.dev/help
   - Supabase: https://supabase.com/docs

---

**Configuration complète! L'application devrait maintenant fonctionner sur Lovable.** 🎉

