# OKA Tech - Production Deployment Guide

Guide complet pour déployer l'application OKA Tech en production avec Frontend sur Netlify/Vercel et Backend sur Heroku/Railway.

## 🌍 Architecture Production

```
Frontend (Netlify/Vercel)
    ↓ HTTPS
API Gateway
    ↓ HTTPS
Backend API (Heroku/Railway)
    ↓
PostgreSQL Database (Neon/Railway)
    ↓
External Services (SendGrid, OpenAI)
```

## 🚀 Déploiement Frontend (Netlify)

### 1. Préparation

```bash
# Build production
npm run build

# Vérifier la build
npm run preview
```

### 2. Connecter à Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Connexion
netlify login

# Déployer
netlify deploy --prod
```

### 3. Configuration Netlify

**netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env.production]
  VITE_API_URL = "https://oka-tech-api.herokuapp.com/api"
  VITE_OPENAI_API_KEY = "@openai_key"
  VITE_RECAPTCHA_SITE_KEY = "@recaptcha_key"

[functions]
  external_node_modules = ["sharp"]
```

### 4. Variables d'Environnement Netlify

Aller à **Settings** → **Build & Deploy** → **Environment**

```
VITE_API_URL = https://oka-tech-api.herokuapp.com/api
VITE_OPENAI_API_KEY = sk-proj-xxxxx
VITE_RECAPTCHA_SITE_KEY = xxxxx
```

## 🚀 Déploiement Backend (Heroku)

### 1. Installation Heroku

```bash
# Installer Heroku CLI
brew install heroku

# Connexion
heroku login
```

### 2. Créer l'application

```bash
# Créer app
heroku create oka-tech-api

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a oka-tech-api

# Voir les variables
heroku config -a oka-tech-api
```

### 3. Configurer les variables

```bash
heroku config:set -a oka-tech-api \
  JWT_SECRET=your_super_secret_key \
  OPENAI_API_KEY=sk-proj-xxxxx \
  SENDGRID_API_KEY=SG.xxxxx \
  SENDGRID_FROM_EMAIL=noreply@oka-tech.fr \
  NODE_ENV=production
```

### 4. Deployer

```bash
# Push code
git push heroku main

# Voir les logs
heroku logs --tail -a oka-tech-api
```

### 5. Exécuter les migrations

```bash
heroku run npm run migrate -a oka-tech-api
```

## 🚀 Alternative: Railway

### 1. Connexion Railway

```bash
npm install -g @railway/cli
railway login
```

### 2. Initialiser le projet

```bash
railway init
railway link
```

### 3. Ajouter PostgreSQL

```bash
railway add
# Sélectionner PostgreSQL
```

### 4. Configurer les variables

```bash
railway variables set \
  JWT_SECRET=your_secret \
  OPENAI_API_KEY=sk-proj-xxxxx
```

### 5. Deployer

```bash
railway up
```

## 🗄️ PostgreSQL Production (Neon)

### 1. Créer un compte Neon

Aller sur https://console.neon.tech/

### 2. Créer un projet

```bash
# Copier la connection string
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/oka_tech
```

### 3. Appliquer les migrations

```bash
npm run migrate -- --production
```

## 📧 Configuration SendGrid Production

### 1. Configurer le sender email

```bash
heroku config:set SENDGRID_FROM_EMAIL=noreply@oka-tech.fr
```

### 2. Vérifier le domaine

Dans SendGrid:
1. Settings → Sender Verification
2. Ajouter domain: oka-tech.fr
3. Vérifier DNS records

### 3. Configurer DKIM/SPF

Ajouter les records DNS:
```
SPF: v=spf1 include:sendgrid.net ~all
DKIM: Suivre instructions SendGrid
```

## 🔐 Configuration SSL/HTTPS

### Frontend (Netlify)
- ✅ Automatique (certificate auto-renouvelé)

### Backend (Heroku/Railway)
- ✅ Automatique (HTTPS par défaut)

### Domain Custom
```bash
# Ajouter domaine sur Netlify
netlify domain oka-tech.fr

# DNS records
Type: CNAME
Name: www
Value: oka-tech.netlify.app
```

## 🔐 Sécurité Production

### 1. Mettre à jour les secrets

```bash
# Générer nouveaux secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Mettre à jour
heroku config:set JWT_SECRET=new_secret
```

### 2. Activer CORS Production

**Backend server.ts**
```typescript
app.use(cors({
  origin: 'https://oka-tech.fr',
  credentials: true
}));
```

### 3. Ajouter headers de sécurité

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 4. Rate limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### Datadog (Monitoring)

```bash
npm install dd-trace
```

```typescript
import tracer from 'dd-trace';
tracer.init({
  service: 'oka-tech-api'
});
```

### LogRocket (Frontend)

```bash
npm install logrocket
```

```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-org/your-project');
```

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Tests
        run: npm run test
      
      - name: Deploy to Netlify
        run: netlify deploy --prod --auth ${{ secrets.NETLIFY_AUTH_TOKEN }} --site ${{ secrets.NETLIFY_SITE_ID }}
```

## ✅ Checklist Déploiement

### Frontend
- [ ] Build sans erreur (`npm run build`)
- [ ] Preview fonctionne (`npm run preview`)
- [ ] Connecter Netlify/Vercel
- [ ] Configurer variables d'environnement
- [ ] Tester toutes les pages
- [ ] Vérifier les liens
- [ ] Tester le formulaire
- [ ] Tester le chatbot
- [ ] Vérifier les performances (Lighthouse)
- [ ] Configurer domain custom
- [ ] Ajouter Sentry/LogRocket

### Backend
- [ ] PostgreSQL fonctionnel
- [ ] Variables .env configurées
- [ ] Migrations appliquées
- [ ] API testée localement
- [ ] Créer app Heroku/Railway
- [ ] Configurer variables
- [ ] Push code
- [ ] Tester endpoints
- [ ] Vérifier logs
- [ ] Configurer SendGrid
- [ ] Configurer CORS
- [ ] Ajouter monitoring

### Global
- [ ] HTTPS activé (frontend + backend)
- [ ] CORS configuré correctement
- [ ] Secrets sécurisés
- [ ] Rate limiting activé
- [ ] Backups configurés
- [ ] Monitoring activé
- [ ] Email de notification
- [ ] Documentation mise à jour
- [ ] Tests E2E réussis
- [ ] Performance optimisée

## 🚨 Rollback en Cas de Problème

### Netlify
```bash
# Voir les déploiements
netlify deploys:list

# Rollback
netlify deploy --prod --alias rollback
```

### Heroku
```bash
# Voir les versions
heroku releases -a oka-tech-api

# Rollback
heroku releases:rollback v10 -a oka-tech-api
```

## 📞 Commandes de Maintenance

### Backup Database

```bash
# Heroku PostgreSQL
heroku pg:backups:capture -a oka-tech-api

# Download
heroku pg:backups:download -a oka-tech-api
```

### Clear Logs

```bash
heroku logs:clear -a oka-tech-api
```

### Restart App

```bash
heroku restart -a oka-tech-api
```

## 🎯 Performance Optimization

### Frontend
- ✅ Build minifié
- ✅ Code splitting
- ✅ Lazy loading
- ⏳ Image optimization (à faire)
- ⏳ Cache busting (à faire)

### Backend
- ✅ Database indexes
- ⏳ Redis caching (à ajouter)
- ⏳ CDN for static assets (à ajouter)
- ⏳ GraphQL optimization (à ajouter)

## 📈 Scaling Strategies

### Si traffic augmente:
1. Ajouter cache Redis
2. Horizontal scaling (multiple instances)
3. Load balancer
4. Database optimization
5. CDN pour assets

## 🛠️ Troubleshooting

### "Build failed"
```bash
heroku logs --tail --app oka-tech-api
npm run build --debug
```

### "Database connection error"
```bash
heroku config --app oka-tech-api
# Vérifier DATABASE_URL
```

### "CORS error"
```bash
# Vérifier FRONTEND_URL en .env
heroku config:set FRONTEND_URL=https://oka-tech.fr
```

### "Out of memory"
```bash
heroku dyno:type standard-1x -a oka-tech-api
```

---

**État**: Production-Ready
**Estimated Time**: 1-2 hours setup + testing
**Cost**: Netlify ($19/month) + Heroku ($7/month basic dyno) + PostgreSQL (free tier)
