# 🎨 Prompts Standard pour Pages Publiques

Voici deux prompts génériques et adaptables à tout type de projet :

---

## 📄 Prompt 1 : Page d'Accueil / Landing Page Moderne

```
Créer une landing page moderne et professionnelle avec les sections suivantes :

=== SECTION HÉRO ===
- Image de fond plein écran (min-h-[85vh]) avec effet parallaxe au scroll
- Overlay dégradé responsive adapté au thème du projet :
  - Mode clair : from-slate-900/70 via-slate-900/50 to-slate-900/30
  - Mode sombre : from-black/80 via-black/60 to-black/40
- Badge avec emoji/logo et nom de l'organisation
- Titre principal hiérarchisé :
  - Ligne 1 : Accroche principale en couleur brand (text-4xl → text-6xl)
  - Ligne 2 : Slogan/proposition de valeur (text-2xl → text-4xl)
- Paragraphe descriptif (max 2 lignes, opacity-90)
- Groupe de CTA (3-5 boutons maximum) :
  - 1 bouton primaire solide (action principale)
  - 2-3 boutons outline (actions secondaires)
  - 1 bouton spécial coloré si démo/essai gratuit
  - Animation pulse sur bouton d'innovation (IA, nouveau)
- Grille 2x2 de mini-features avec glassmorphism :
  - Icône + titre court + micro-description
  - Style : bg-white/10 backdrop-blur-md border border-white/20

=== SECTION LIENS RAPIDES ===
Desktop : grille 2x2 ou 3x3 de cartes navigation
Mobile : carrousel horizontal scrollable
- Chaque carte :
  - Icône colorée dans conteneur arrondi
  - Titre + description (1 ligne max)
  - Animation hover : scale(1.05) + shadow-xl
  - Transition fluide 300ms

=== SECTION FONCTIONNALITÉS / SERVICES ===
- Header centré avec badge thématique
- Grille responsive (1 → 2 → 3 colonnes)
- Cartes avec :
  - Image/illustration en haut (h-48, object-cover)
  - Icône centrale chevauchante (-mt-10, z-10)
  - Titre + description (2-3 lignes max)
  - Apparition bouton/lien au hover
  - Animation zoom subtil sur image
- Bouton "Voir plus" centré en bas

=== SECTION PRÉSENTATION PRODUIT/SERVICE ===
Layout alterné (2 colonnes, inversé chaque section) :
- Colonne contenu :
  - Badge catégorie avec icône
  - Titre H2 + description
  - Liste de points clés (icône check + texte)
  - Bouton CTA
- Colonne visuelle :
  - Illustration/screenshot/mockup
  - Cartes flottantes décoratives (statistiques, témoignages)
  - Effets de profondeur avec shadow-2xl

=== SECTION AVANTAGES / BÉNÉFICES ===
- Grille 2x2 ou 3 colonnes
- Cartes avec fond coloré/dégradé léger
- Structure : grande icône + titre + description + micro-stat
- Animations d'apparition séquentielle (delay: 0.1s, 0.2s, 0.3s...)

=== SECTION TÉMOIGNAGES / SOCIAL PROOF ===
- Carrousel ou grille de témoignages
- Chaque carte : avatar + nom + rôle + citation + note étoiles
- Style glassmorphism ou neumorphisme selon thème
- Logos partenaires/clients en bas (opacity-50 → opacity-100 hover)

=== SECTION CTA FINALE ===
- Bannière pleine largeur avec dégradé brand
- Layout 2 colonnes :
  - Gauche : titre accrocheur + liste checkmarks + bouton
  - Droite : illustration décorative ou forme géométrique
- Animation d'apparition au scroll

=== SECTION CONTACT / FOOTER PRE ===
- Barre horizontale ou grille compacte
- Icônes + informations : téléphone, adresse, email, horaires
- Liens vers réseaux sociaux

=== ANIMATIONS & INTERACTIONS ===
- Parallaxe sur image héro (translateY basé sur scroll)
- Fade-in progressif des sections (Intersection Observer)
- Scale + translate-y sur cartes au hover
- Pulse sur badges "nouveau" ou "populaire"
- Smooth scroll entre sections
- Loading skeleton si données asynchrones

=== RESPONSIVE ===
- Breakpoints : mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Typography scale réduite sur mobile (text-xl → text-sm)
- Padding conteneur : p-4 (mobile) → p-8 (tablet) → p-16 (desktop)
- Grilles qui s'empilent : grid-cols-1 → 2 → 3 → 4
- Navigation mobile : hamburger menu avec drawer/sheet
- Touch targets minimum 44x44px

=== ACCESSIBILITÉ ===
- Contraste WCAG AA minimum (4.5:1 texte, 3:1 UI)
- Alt text sur toutes les images
- Focus visible sur éléments interactifs
- Hierarchie de titres respectée (H1 → H6)
- aria-labels sur icônes seules
```

---

## 📄 Prompt 2 : Pages Utilitaires & Contenu

```
=== PAGE CONNEXION / INSCRIPTION ===
Layout centré avec carte :
- Max-width : 400-500px sur desktop
- Carte avec style neu-card ou glassmorphism
- Header : Logo/icône centré + Titre H2 + Sous-titre
- Formulaire : Inputs stylisés + icons + toggle password
- Séparateur "OU" + boutons OAuth
- Bouton principal pleine largeur avec loading state
- Liens : "Mot de passe oublié ?" / "Pas de compte ?"

=== PAGE TARIFS / PRICING ===
- Grille 3 plans (Starter, Pro, Enterprise)
- Carte plan populaire : scale(1.05) + border-primary
- Toggle mensuel/annuel avec discount
- FAQ en bas (accordéon)

=== PAGE DOCUMENTATION ===
Layout 3 zones :
- Sidebar gauche : navigation hiérarchique
- Zone centrale : contenu prose max-800px
- Sidebar droite : table of contents sticky

=== PAGE 404 ===
- Centré, illustration fun, message empathique
- Bouton "Retour accueil"
```

---

## 🎯 Notes d'Adaptation NTSAGUI

- **Couleurs brand** : Bleu professionnel (#2563eb), cyan accent (#00D9FF)
- **Tone** : Professionnel mais accessible, focus IA et innovation
- **Cible** : Entreprises cherchant des solutions digitales/IA
