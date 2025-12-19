# 🔐 Identifiants Admin - OKA Tech

## Credentials par Défaut

**Email**: admin@okatech.fr
**Mot de passe**: Asted1982*

## Accès Admin

### Local (Cursor/npm run dev)
```
http://localhost:8084/admin-login
```

### Production (Lovable)
```
https://[your-lovable-domain]/admin-login
```

## Sécurité

⚠️ **IMPORTANT**:
- ✅ Ces identifiants sont stockés localement (localStorage) pour MVP
- ✅ À remplacer par Supabase Auth en production
- ✅ Ne JAMAIS commiter les credentials en clair
- ✅ Cette file est dans `.gitignore`
- ✅ Implémenter HTTPS + rate limiting en production

## Architecture Admin Actuelle

### Pages
- `AdminLogin.tsx` - Formulaire de connexion
- `Admin.tsx` - Dashboard admin (protégé)

### Stockage (MVP)
- LocalStorage pour session
- JWT token format (optionnel)

## Prochaines Étapes

1. **Court terme (MVP)**
   - Valider credentials via localStorage
   - Dashboard admin de base
   - Gérer les leads capturés

2. **Moyen terme (Production)**
   - Intégrer Supabase Auth
   - Authentification 2FA
   - Role-based access control (RBAC)
   - Audit logs

3. **Long terme**
   - OAuth2 providers
   - API key management
   - Tenant multi-instance

## Troubleshooting

### Page de login vide?
→ Vérifier `src/pages/AdminLogin.tsx` exists
→ Vérifier route `/admin-login` dans `App.tsx`

### Session perdue?
→ LocalStorage cleared? Reconnecter
→ Cookies bloqués? Vérifier browser settings

### Affichage incorrect?
→ Hard refresh (Cmd/Ctrl+Shift+R)
→ Vérifier theme.ts et imports

