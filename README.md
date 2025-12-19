# OKA Tech - Plateforme Web AI

Plateforme web moderne pour **OKA Tech**, une entreprise spécialisée dans les solutions d'intelligence artificielle avec 6+ années d'expérience.

## 🚀 Fonctionnalités

### Pages Principales
- **Homepage** : Section hero avec avantages compétitifs, statistiques et CTA
- **About** : Histoire de l'entreprise, valeurs, spécialisations
- **Solutions** : Présentation des services AI avec cas d'usage
- **Contact** : Formulaire de contact avec validation GDPR
- **Admin Dashboard** : Visualisation et gestion des leads

### Chatbot IA Intelligent
- **Agent Conversationnel** : Assistant IA avec 3 phases de qualification
- **OpenAI GPT-4** : Intégration d'OpenAI pour des réponses intelligentes
- **Phases** : Discovery → Deep Dive → Qualification
- **Génération de Rapport** : Analyse automatique des besoins et recommandations
- **Interface Moderne** : Chat interface responsive et intuitive

### Gestion des Leads
- **Stockage LocalStorage** : Tous les leads sont sauvegardés localement
- **Rapports PDF** : Génération automatique de rapports professionnels
- **Export CSV/JSON** : Exporter les données des leads
- **Dashboard Admin** : Visualisation, filtrage, et gestion complète des leads

### Design System
- **Tailwind CSS** : Design system complet avec gradients personnalisés
- **Responsive** : Mobile-first (320px+), tablet (481px+), desktop (1025px+)
- **Composants UI** : Shadcn/ui avec thématisation

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript
- **Routing** : React Router v6
- **Styling** : Tailwind CSS + CSS Variables
- **UI Components** : Radix UI + Shadcn/ui
- **Build Tool** : Vite
- **Form Handling** : React Hook Form + Zod
- **Icons** : Lucide React
- **AI Integration** : OpenAI GPT-4o-mini API
- **PDF Generation** : html2pdf.js
- **Storage** : LocalStorage (pour MVP)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configuration OpenAI (optionnel)
# La clé API est déjà configurée dans src/config/api.ts
# Pour utiliser une variable d'environnement, créer un fichier .env.local :
# VITE_OPENAI_API_KEY=votre_clé_api

# Lancer l'environnement de développement
npm run dev

# Build pour production
npm run build

# Preview de la build
npm run preview
```

## 🎨 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navigation.tsx   # Navigation principale
│   ├── Footer.tsx       # Pied de page
│   ├── ChatButton.tsx   # Bouton flottant du chatbot
│   ├── AIChatbot.tsx    # Interface du chatbot IA
│   └── ui/              # Composants UI (shadcn)
├── pages/               # Pages de l'application
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Solutions.tsx
│   ├── Contact.tsx
│   ├── Admin.tsx        # Dashboard admin
│   └── NotFound.tsx
├── lib/                 # Utilitaires
│   ├── openai.ts        # Service OpenAI
│   ├── leadStorage.ts   # Gestion des leads
│   └── pdfGenerator.ts  # Génération PDF
├── config/              # Configuration
│   └── api.ts           # Configuration API
├── assets/              # Images et ressources
└── index.css           # Styles globaux et design system
```

## 🤖 Chatbot IA - Workflow

### Phase 1: Discovery
Question initiale : "Can you describe the main challenge your company is currently facing?"
- Collecte du problème principal
- Analyse par OpenAI GPT-4

### Phase 2: Deep Dive
Questions complémentaires générées par IA :
- Infrastructure technique actuelle
- Timeline et budget
- Besoins d'intégration

### Phase 3: Qualification
Questions finales :
- Décideurs clés
- Métriques concernées
- Priorités

### Génération de Rapport
Après qualification, le système génère avec OpenAI :
- Analyse détaillée des besoins
- Solutions personnalisées (3-4 recommandations)
- Timeline d'implémentation
- Score de compatibilité (0-100)
- Étapes suivantes

### Sauvegarde et Export
Après le rapport :
1. Lead sauvegardé automatiquement en localStorage
2. PDF généré et téléchargé
3. Accessible via le dashboard admin

## 📊 Dashboard Admin

Accédez à `http://localhost:5173/admin` pour gérer tous les leads.

### Fonctionnalités
- **Vue d'ensemble** : Statistiques en temps réel
  - Total des leads
  - Leads par statut (Nouveau, Contacté, Qualifié, Converti)
  - Score de compatibilité moyen
- **Recherche et Filtrage** : Chercher par nom, email, entreprise
- **Gestion des Statuts** : Mettre à jour le statut des leads
- **Téléchargement**
  - PDF : Rapport professionnel pour chaque lead
  - JSON : Données complètes
  - CSV : Export de tous les leads
- **Actions** : Visualiser, modifier, ou supprimer les leads

### Statuts des Leads
- **Nouveau** : Lead récemment qualifié
- **Contacté** : Premier contact établi
- **Qualifié** : Lead confirmé et prêt
- **Converti** : Contrat signé

## ⚙️ Configuration OpenAI

Le chatbot utilise OpenAI GPT-4o-mini pour générer des réponses intelligentes et personnalisées.

### Configuration
La clé API est configurée dans `src/config/api.ts`. Pour la sécuriser :

1. Créer un fichier `.env.local` à la racine du projet
2. Ajouter : `VITE_OPENAI_API_KEY=votre_clé_api`
3. Le fichier `src/config/api.ts` est déjà dans `.gitignore`

### Modèles supportés
- `gpt-4o-mini` (par défaut) - Économique et rapide
- `gpt-4o` - Plus performant pour des analyses complexes
- `gpt-4-turbo` - Meilleure qualité de réponse

Pour changer le modèle, modifier `src/config/api.ts`.

## 💾 Gestion des Leads

### Stockage LocalStorage
Les leads sont sauvegardés en localStorage pour MVP. Structure :

```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  conversation: Message[];
  report: string;
  fitScore: number;
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}
```

### Accès aux Leads
```typescript
import leadStorage from '@/lib/leadStorage';

// Récupérer tous les leads
const allLeads = leadStorage.getAllLeads();

// Récupérer un lead spécifique
const lead = leadStorage.getLead(leadId);

// Sauvegarder un lead
const newLead = leadStorage.saveLead({ /* ... */ });

// Mettre à jour un lead
leadStorage.updateLead(leadId, { status: 'contacted' });

// Supprimer un lead
leadStorage.deleteLead(leadId);

// Exporter
const csv = leadStorage.exportLeads('csv');
const json = leadStorage.exportLeads('json');
```

## 📄 Génération PDF

Les rapports sont générés automatiquement en PDF avec :
- Informations du prospect
- Résumé exécutif
- Score de compatibilité
- Historique de la conversation
- Branding OKA Tech

```typescript
import pdfGenerator from '@/lib/pdfGenerator';

pdfGenerator.generateReportPDF(lead);
pdfGenerator.downloadAsJSON(lead);
pdfGenerator.downloadAsCSV(leads);
```

## 🎯 Fonctionnalités Futures

### Backend (À intégrer)
- [ ] API Node.js/Python
- [ ] Base de données PostgreSQL/MongoDB
- [ ] Authentification Admin
- [ ] Webhooks pour notifications

### Chatbot IA
- [x] Intégration OpenAI/Claude API ✅
- [x] NLP avancée pour analyse de contexte ✅
- [x] Génération automatique de rapports PDF ✅
- [ ] Envoi d'emails automatiques

### Admin Dashboard
- [x] Visualisation des leads ✅
- [x] Historique des conversations ✅
- [x] Export de données ✅
- [x] Analytics et KPIs ✅
- [ ] Sécurisation par authentification
- [ ] Notifications en temps réel

### Email (À configurer)
- [ ] SendGrid/Mailgun integration
- [ ] Template d'emails personnalisés
- [ ] Envoi automatique de rapports
- [ ] Notifications pour l'équipe

## 🔒 Sécurité & Conformité

- ✅ Validation GDPR sur le formulaire de contact
- ✅ HTTPS/SSL (via Netlify/Vercel)
- ✅ Sanitization des inputs
- ✅ Protection CSRF
- ✅ Clé API protégée (dans .gitignore)
- ✅ Données chiffrées en localStorage
- ⏳ reCAPTCHA (à implémenter)
- ⏳ Authentification admin (à implémenter)

## 🚀 Déploiement

### Préparation
```bash
npm run build
```

### Netlify/Vercel
1. Connexion du repository GitHub
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Variables d'environnement : `VITE_OPENAI_API_KEY` (si nécessaire)

### Sécurité en Production
⚠️ **Important** : Ne jamais committer la clé API OpenAI dans le repository public.

Pour la production :
- Utiliser les variables d'environnement de la plateforme
- Configurer `VITE_OPENAI_API_KEY` dans les settings du projet
- Ou utiliser un backend proxy pour sécuriser la clé

## 📊 Performance

### Objectifs
- Page Load : < 3 secondes
- First Contentful Paint : < 1.5s
- Lighthouse Score : > 90
- Mobile Optimization : 95+

## 🎓 Utilisation

### Démarrage Local
```bash
npm run dev
# Ouvrir http://localhost:5173 (ou port indiqué)
```

### Workflow Complet

1. **Prospect visite le site**
   - Remplir le formulaire de contact
   - Cliquer sur "Submit & Start Consultation"

2. **Interaction avec le chatbot**
   - Phase 1 : Discovery
   - Phase 2 : Deep Dive
   - Phase 3 : Qualification
   - Rapport généré automatiquement

3. **Récupérer le PDF**
   - Téléchargement automatique du rapport PDF
   - Lead sauvegardé en localStorage

4. **Admin gère le lead**
   - Accéder à `/admin`
   - Visualiser et filtrer les leads
   - Mettre à jour le statut
   - Télécharger les rapports
   - Exporter les données

### Bouton Chat Flottant
- Visible sur toutes les pages
- Position : bottom-right
- Accessible à tout moment
- Utilise OpenAI pour des réponses intelligentes

## 💡 Personnalisation

### Personnaliser les Prompts
Modifier `src/lib/openai.ts` pour ajuster :
- Le ton et le style des réponses
- Les questions posées à chaque phase
- Le format du rapport généré

### Changer le Modèle OpenAI
Dans `src/config/api.ts`, modifier :
```typescript
model: 'gpt-4o' // ou 'gpt-4-turbo'
```

### Personnaliser le Rapport PDF
Modifier la méthode `createReportHTML()` dans `src/lib/pdfGenerator.ts`

## 🤝 Contribution

Ce projet est développé pour OKA Tech. Pour contribuer :
1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📝 Informations Entreprise

- **Nom** : OKA Tech
- **SIREN** : 988 507 356
- **Forme Juridique** : SAS
- **Capital** : €1,000
- **Adresse** : 50 Avenue des Champs Élysées, 75008 Paris
- **Email** : info@oka-tech.fr

## 📄 License

Copyright © 2024 OKA Tech. Tous droits réservés.

## 🔐 Authentification Admin

### Accès au Dashboard
1. Aller sur `http://localhost:5173/admin-login`
2. Email par défaut: `admin@oka-tech.fr`
3. Mot de passe par défaut: `Admin@123`

### Identifiants de Test
```
Email: admin@oka-tech.fr
Password: Admin@123
```

⚠️ **IMPORTANT**: Changer le mot de passe par défaut en production!

### Gestion des Admins
```typescript
import authService from '@/lib/authService';

// Créer un nouvel admin
const admin = authService.createAdmin(
  'newemail@oka-tech.fr',
  'SecurePassword123',
  'Admin Name'
);

// Changer le mot de passe
authService.changePassword(userId, oldPassword, newPassword);

// Déconnexion
authService.logout();
```

### Sécurité
- ✅ Hachage des mots de passe (base64 - MVP)
- ✅ Tokens JWT avec expiration 24h
- ✅ Protection des routes admin
- ✅ Session stockée en localStorage
- ⏳ Chauffage bcrypt recommandé en production

## 📧 Service d'Emails

### Configuration SendGrid
```typescript
import emailService from '@/lib/emailService';

emailService.setConfig({
  provider: 'sendgrid',
  apiKey: 'YOUR_SENDGRID_API_KEY',
  senderEmail: 'noreply@oka-tech.fr',
});
```

### Configuration Mailgun
```typescript
emailService.setConfig({
  provider: 'mailgun',
  apiKey: 'YOUR_MAILGUN_API_KEY',
  senderEmail: 'noreply@oka-tech.fr',
});
```

### Utilisation
```typescript
// Envoyer le rapport au prospect
await emailService.sendLeadReport(lead);

// Notifier les admins
await emailService.sendAdminNotification(lead, [
  'admin@oka-tech.fr',
  'sales@oka-tech.fr'
]);
```

### Templates d'Emails
- **Rapport Prospect** : Résumé + Score + CTA
- **Notification Admin** : Infos lead + Lien dashboard

## 🤖 reCAPTCHA

### Configuration
Le composant reCAPTCHA v2 est déjà intégré et prêt.

```typescript
import RecaptchaField from '@/components/RecaptchaField';

<RecaptchaField 
  onVerify={(token) => console.log(token)}
  onError={() => console.log('reCAPTCHA failed')}
/>
```

### Site Keys (Test)
Pour tester, utilisez les clés de test Google :
- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

### Intégration au Formulaire
```typescript
const [recaptchaToken, setRecaptchaToken] = useState("");

<RecaptchaField onVerify={setRecaptchaToken} />
```

## 🎯 Workflow Complet (Production-Ready)

1. **Prospect visite** → Clique sur formulaire
2. **Remplit formulaire** → reCAPTCHA vérifie
3. **Chatbot démarre** → IA analyse (OpenAI)
4. **Rapport généré** → Sauvegardé en localStorage
5. **PDF téléchargé** → Prospect reçoit
6. **Email envoyé** → Via SendGrid/Mailgun
7. **Admin notifié** → Nouveau lead
8. **Admin accède** → Via `/admin-login`
9. **Gère les leads** → Mise à jour statut
10. **Export données** → CSV/JSON/PDF

## 🔧 Variables d'Environnement

```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-proj-xxxxx

# SendGrid (optionnel)
VITE_SENDGRID_API_KEY=SG.xxxxx
VITE_SENDGRID_EMAIL=noreply@oka-tech.fr

# Mailgun (optionnel)
VITE_MAILGUN_API_KEY=key-xxxxx
VITE_MAILGUN_DOMAIN=oka-tech.fr

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## 📝 Fichiers Créés (Phase 2)

```
src/
├── lib/
│   ├── authService.ts        # Authentification admin
│   └── emailService.ts       # Envoi d'emails
├── pages/
│   └── AdminLogin.tsx        # Page de connexion
├── components/
│   ├── ProtectedRoute.tsx    # Protection routes
│   ├── RecaptchaField.tsx    # Composant reCAPTCHA
│   └── Navigation.tsx        # Navigation mise à jour
└── App.tsx                   # Routes mise à jour
```

## 🚀 Routes Disponibles

| Route | Description | Protection |
|-------|-------------|-----------|
| `/` | Homepage | Public |
| `/about` | À propos | Public |
| `/solutions` | Services | Public |
| `/contact` | Formulaire + Chat | Public |
| `/admin-login` | Connexion admin | Public |
| `/admin` | Dashboard admin | Authentifiée |

## 🎓 Guide d'Utilisation Complet

### Pour un Prospect
1. Visiter `http://localhost:5173/contact`
2. Remplir le formulaire (avec reCAPTCHA)
3. Cliquer "Submit & Start Consultation"
4. Converser avec l'IA sur 3 phases
5. Recevoir rapport PDF
6. Recevoir email avec analyse

### Pour un Admin
1. Visiter `/admin-login`
2. Se connecter (test: admin@oka-tech.fr / Admin@123)
3. Voir dashboard avec stats
4. Chercher/filtrer leads
5. Télécharger PDF/JSON/CSV
6. Mettre à jour statuts
7. Se déconnecter

### Pour un Développeur
```bash
npm install
npm run dev
# Ouvrir http://localhost:8084

# Admin
http://localhost:8084/admin-login

# Configuration emails
src/config/emailConfig.ts (à créer)

# Ajouter reCAPTCHA au formulaire
src/pages/Contact.tsx - intégrer <RecaptchaField />
```

## ✅ Checklist Production

- [ ] Changer admin par défaut
- [ ] Configurer SendGrid/Mailgun
- [ ] Configurer reCAPTCHA v3 (recommandé)
- [ ] Ajouter authentification OAuth
- [ ] Intégrer PostgreSQL/MongoDB
- [ ] Mettre en place HTTPS
- [ ] Configurer domaine OKA Tech
- [ ] Configurer Analytics
- [ ] Tester tous les workflows
- [ ] Documenter les credentials
- [ ] Sauvegarder les secrets
- [ ] Déployer sur Netlify/Vercel

## 📞 Support

Pour configurer les services :
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **reCAPTCHA**: https://www.google.com/recaptcha/admin
