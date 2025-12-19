# OKA Tech - Backend Setup Guide

Guide complet pour intégrer un backend Node.js avec PostgreSQL, API REST, et WebSockets.

## 🚀 Architecture Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Configuration PostgreSQL
│   │   ├── env.ts              # Variables d'environnement
│   │   └── email.ts            # Configuration SendGrid/Mailgun
│   ├── models/
│   │   ├── Lead.ts             # Modèle Lead
│   │   ├── Admin.ts            # Modèle Admin
│   │   ├── Conversation.ts     # Modèle Conversation
│   │   └── Report.ts           # Modèle Report
│   ├── controllers/
│   │   ├── leadsController.ts  # CRUD Leads
│   │   ├── authController.ts   # Auth Admin
│   │   ├── chatController.ts   # Chat IA
│   │   └── reportController.ts # Rapports
│   ├── services/
│   │   ├── emailService.ts     # Envoi emails
│   │   ├── aiService.ts        # OpenAI integration
│   │   ├── pdfService.ts       # Génération PDF
│   │   └── authService.ts      # JWT & Security
│   ├── routes/
│   │   ├── leads.ts            # /api/leads
│   │   ├── auth.ts             # /api/auth
│   │   ├── chat.ts             # /api/chat
│   │   └── reports.ts          # /api/reports
│   ├── middleware/
│   │   ├── auth.ts             # JWT validation
│   │   ├── errorHandler.ts     # Error handling
│   │   └── validation.ts       # Input validation
│   ├── websocket/
│   │   └── handlers.ts         # WebSocket events
│   └── server.ts               # Express app setup
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 📦 Installation & Setup

### 1. Créer le projet Node.js

```bash
mkdir oka-tech-backend
cd oka-tech-backend
npm init -y
npm install express cors dotenv pg typeorm bcrypt jsonwebtoken axios html2pdf nodemailer
npm install --save-dev typescript @types/express @types/node ts-node nodemon
```

### 2. Configuration TypeScript

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Variables d'Environnement

**.env**
```bash
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/oka_tech
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=oka_tech

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=24h

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-mini

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@oka-tech.fr

# Alternative: Mailgun
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=oka-tech.fr

# reCAPTCHA
RECAPTCHA_SECRET_KEY=xxxxx

# Admin
ADMIN_EMAIL=admin@oka-tech.fr
ADMIN_PASSWORD_HASH=xxxxx
```

## 🗄️ Base de Données PostgreSQL

### 1. Installation PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Linux
sudo apt-get install postgresql postgresql-contrib

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### 2. Créer la base de données

```bash
createdb oka_tech
psql oka_tech

# Ou dans pgAdmin
CREATE DATABASE oka_tech;
```

### 3. Schéma Database

```sql
-- Admins table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  fit_score INT CHECK (fit_score >= 0 AND fit_score <= 100),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  lead_id INT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  report_content TEXT NOT NULL,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_conversations_lead ON conversations(lead_id);
CREATE INDEX idx_reports_lead ON reports(lead_id);
```

## 🔌 API REST Endpoints

### Authentification
```
POST   /api/auth/register      # Créer admin
POST   /api/auth/login         # Se connecter
POST   /api/auth/logout        # Se déconnecter
POST   /api/auth/refresh       # Refresh token
```

### Leads
```
GET    /api/leads              # Tous les leads
GET    /api/leads/:id          # Lead spécifique
POST   /api/leads              # Créer lead
PUT    /api/leads/:id          # Modifier lead
DELETE /api/leads/:id          # Supprimer lead
GET    /api/leads/status/:status # Filtrer par statut
```

### Chat & Rapports
```
POST   /api/chat/message       # Envoyer message chat
GET    /api/chat/history/:leadId # Historique chat
POST   /api/reports/generate   # Générer rapport
GET    /api/reports/:leadId    # Récupérer rapport
GET    /api/reports/:leadId/pdf # Télécharger PDF
```

### Analytics
```
GET    /api/analytics/stats    # Stats générales
GET    /api/analytics/leads-by-status # Répartition statuts
GET    /api/analytics/avg-score # Score moyen
```

## 📝 Implémentation Express Server

**src/server.ts**
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Routes
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import chatRoutes from './routes/chat';
import reportsRoutes from './routes/reports';

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportsRoutes);

// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('chat-message', (data) => {
    io.emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io, pool };
```

## 🔐 Authentification JWT

**src/services/authService.ts**
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(userId: number, email: string): string {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();
```

## 📧 Service Email

**src/services/emailService.ts**
```typescript
import axios from 'axios';
import nodemailer from 'nodemailer';

class EmailService {
  async sendLeadReport(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (process.env.SENDGRID_API_KEY) {
        return await this.sendViaSendGrid(to, subject, html);
      } else if (process.env.MAILGUN_API_KEY) {
        return await this.sendViaMailgun(to, subject, html);
      }
      return false;
    } catch (error) {
      console.error('Email error:', error);
      return false;
    }
  }

  private async sendViaSendGrid(to: string, subject: string, html: string): Promise<boolean> {
    const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL },
      subject,
      content: [{ type: 'text/html', value: html }],
    }, {
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
    });
    return response.status === 202;
  }

  private async sendViaMailgun(to: string, subject: string, html: string): Promise<boolean> {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('from', process.env.SENDGRID_FROM_EMAIL);
    form.append('to', to);
    form.append('subject', subject);
    form.append('html', html);

    const response = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      form,
      {
        auth: {
          username: 'api',
          password: process.env.MAILGUN_API_KEY!
        }
      }
    );
    return response.status === 200;
  }
}

export default new EmailService();
```

## 🤖 Service IA OpenAI

**src/services/aiService.ts**
```typescript
import axios from 'axios';

class AIService {
  private apiKey = process.env.OPENAI_API_KEY;
  private model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  async chat(messages: any[]): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      }
    );

    return response.data.choices[0].message.content;
  }

  async generateReport(conversation: any[], prospect: any): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are an expert AI consultant for OKA Tech...`
      },
      {
        role: 'user',
        content: `Generate a report based on this conversation...`
      }
    ];

    return this.chat(messages);
  }
}

export default new AIService();
```

## 🔗 Frontend Integration

**src/lib/api.ts**
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour les tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Leads API
export const leadsAPI = {
  getAll: () => api.get('/leads'),
  getById: (id: number) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  update: (id: number, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: number) => api.delete(`/leads/${id}`),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// Reports API
export const reportsAPI = {
  generate: (leadId: number) => api.post(`/reports/generate`, { leadId }),
  getById: (leadId: number) => api.get(`/reports/${leadId}`),
  download: (leadId: number) => api.get(`/reports/${leadId}/pdf`),
};

export default api;
```

## 🔄 Migration Frontend vers Backend

### Avant (localStorage)
```typescript
import leadStorage from '@/lib/leadStorage';
const leads = leadStorage.getAllLeads();
```

### Après (API)
```typescript
import { leadsAPI } from '@/lib/api';
const { data: leads } = await leadsAPI.getAll();
```

### Mise à jour Admin.tsx
```typescript
useEffect(() => {
  const fetchLeads = async () => {
    try {
      const { data } = await leadsAPI.getAll();
      setLeads(data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };
  
  if (authService.isAuthenticated()) {
    fetchLeads();
  }
}, []);
```

## 🚀 Déploiement Backend

### Heroku
```bash
heroku create oka-tech-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway
```bash
railway link
railway variables add DATABASE_URL ...
railway deploy
```

### AWS/DigitalOcean
```bash
# Docker
docker build -t oka-tech-backend .
docker run -p 3000:3000 oka-tech-backend
```

**Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## ✅ Checklist Intégration

- [ ] Installer PostgreSQL
- [ ] Créer base de données
- [ ] Configurer variables .env
- [ ] Implémenter routes API
- [ ] Configurer JWT
- [ ] Setup SendGrid/Mailgun
- [ ] Intégrer OpenAI backend
- [ ] Créer WebSockets
- [ ] Ajouter middleware auth
- [ ] Tester tous les endpoints
- [ ] Configurer CORS
- [ ] Déployer sur Heroku/Railway
- [ ] Mettre à jour Frontend API calls
- [ ] Documenter API (Swagger)

## 📚 Ressources

- **Express.js**: https://expressjs.com/
- **TypeORM**: https://typeorm.io/
- **PostgreSQL**: https://www.postgresql.org/
- **Socket.io**: https://socket.io/
- **Swagger**: https://swagger.io/

---

**État**: Prêt pour intégration Backend
**Temps estimé**: 2-3 semaines (selon complexité)
**Coût**: PostgreSQL (gratuit), SendGrid (payant optional), Heroku/Railway (gratuit + payant)
