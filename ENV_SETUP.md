# Configuration des Variables d'Environnement

## Variables Requises

### OpenAI Configuration
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4o-mini
```

### Pour développement local
Créez un fichier `.env.local` à la racine du projet avec:

```
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-4o-mini
```

### Pour production
Ajoutez dans votre plateforme de déploiement (Netlify, Vercel, etc.):

- `VITE_OPENAI_API_KEY` - Votre clé API OpenAI
- `VITE_OPENAI_MODEL` - Le modèle à utiliser (gpt-4o-mini, gpt-4, etc.)

## Obtenir une clé API OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Copie la clé et ajoutez-la à `.env.local`

## Structure du fichier .env.local

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-your-key-here
VITE_OPENAI_MODEL=gpt-4o-mini

# Application URLs
VITE_APP_URL=http://localhost:8084
```

## Important

⚠️ Ne commitez JAMAIS le fichier `.env.local` sur GitHub
✅ Le fichier `.env.local` est dans `.gitignore` par défaut
✅ Les variables avec le préfixe `VITE_` sont exposées au client (ne pas y stocker les secrets)

