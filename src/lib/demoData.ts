// Données de démonstration pour le dashboard admin
export const generateDemoLeads = () => {
  const companies = [
    'TechStart SAS', 'Innovate Corp', 'Digital Solutions', 'AI Ventures', 
    'Smart Business', 'Future Tech', 'DataCorp', 'CloudFirst', 'NextGen Solutions'
  ];
  
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Camille', 'Antoine', 'Léa'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'];
  
  const statuses = ['new', 'contacted', 'qualified', 'converted'];
  
  const needs = [
    'Automatisation des processus',
    'Chatbot intelligent',
    'Analyse de données',
    'Gestion de la relation client',
    'Optimisation des ventes',
    'Support client automatisé'
  ];

  const demoLeads = [];
  const now = Date.now();
  
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const need = needs[Math.floor(Math.random() * needs.length)];
    const score = Math.floor(Math.random() * 40) + 60; // Score entre 60 et 100
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Dates sur les 30 derniers jours
    const createdAt = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const conversation = [
      {
        role: 'assistant' as const,
        content: `Bonjour ${firstName}! Je suis l'assistant IA de NTSAGUI Digital. Pouvez-vous me parler de votre entreprise et de vos défis actuels?`
      },
      {
        role: 'user' as const,
        content: `Bonjour, je suis ${firstName} ${lastName} de ${company}. Nous cherchons à ${need.toLowerCase()} pour améliorer notre efficacité.`
      },
      {
        role: 'assistant' as const,
        content: `Très intéressant! ${need} est exactement dans notre domaine d'expertise. Pouvez-vous me donner plus de détails sur votre situation actuelle?`
      },
      {
        role: 'user' as const,
        content: `Nous avons environ ${Math.floor(Math.random() * 200) + 50} employés et nous perdons beaucoup de temps sur des tâches répétitives. Nous aimerions automatiser ces processus.`
      }
    ];

    const report = `
## Rapport d'Analyse - ${firstName} ${lastName}

### Entreprise: ${company}
- **Secteur**: ${need}
- **Taille**: ${Math.floor(Math.random() * 200) + 50} employés
- **Besoin identifié**: ${need}

### Score de Compatibilité: ${score}/100

**Points forts:**
- Entreprise en croissance avec besoins clairs
- Budget disponible pour solutions IA
- Équipe technique réceptive à l'innovation

**Recommandations:**
- Solution ${need.toLowerCase()} sur-mesure
- Timeline estimée: ${Math.floor(Math.random() * 8) + 8} semaines
- ROI attendu: ${Math.floor(Math.random() * 40) + 20}% d'amélioration

### Prochaines Étapes
1. Présentation détaillée de la solution
2. Démonstration technique
3. Proposition commerciale personnalisée
    `.trim();

    demoLeads.push({
      id: `demo_${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      company,
      phone: `+33 ${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
      fitScore: score,
      status: status as any,
      identifiedNeed: need,
      conversation,
      report,
      createdAt,
      updatedAt: createdAt
    });
  }
  
  return demoLeads;
};

// Fonction pour initialiser les données de démo si aucun lead existe
export const initializeDemoData = () => {
  try {
    const existingLeads = JSON.parse(localStorage.getItem('ntsagui_leads') || '[]');
    if (existingLeads.length === 0) {
      const demoLeads = generateDemoLeads();
      localStorage.setItem('ntsagui_leads', JSON.stringify(demoLeads));
      console.log('Demo data initialized:', demoLeads.length, 'leads created');
      return demoLeads;
    }
    return existingLeads;
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return [];
  }
};
