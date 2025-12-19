import { motion } from "framer-motion";
import { Book, Code, Zap, Shield, Database, MessageSquare, FileText, Terminal, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { theme } from "@/styles/theme";

const Documentation = () => {
  const { t } = useLanguage();
  const themeStyles = useThemeStyles();

  const sections = [
    {
      icon: Zap,
      title: "Démarrage rapide",
      description: "Commencez à utiliser nos solutions IA en quelques minutes avec notre guide de démarrage.",
      items: ["Configuration initiale", "Intégration avec vos systèmes", "Premiers pas avec l'API", "Test de votre première requête"]
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Documentation complète de notre API avec exemples de code et endpoints.",
      items: ["Authentification", "Endpoints disponibles", "Codes de réponse", "Limites de taux"]
    },
    {
      icon: MessageSquare,
      title: "Intégration Chatbot",
      description: "Guide complet pour intégrer notre chatbot IA dans votre site web ou application.",
      items: ["Widget personnalisable", "Configuration des réponses", "Entraînement du modèle", "Analyse des conversations"]
    },
    {
      icon: Database,
      title: "Gestion des données",
      description: "Apprenez à gérer et optimiser vos données pour de meilleures performances IA.",
      items: ["Import de données", "Nettoyage et préparation", "Stockage sécurisé", "Export et sauvegarde"]
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Bonnes pratiques de sécurité et conformité pour vos intégrations.",
      items: ["Chiffrement des données", "Authentification à deux facteurs", "Conformité RGPD", "Audit et logs"]
    },
    {
      icon: Terminal,
      title: "SDK & Bibliothèques",
      description: "Bibliothèques officielles pour différents langages de programmation.",
      items: ["JavaScript/TypeScript", "Python", "PHP", "Autres langages"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen" style={{ background: themeStyles.backgrounds.primary }}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 30% 20%, ${theme.colors.primary.electric} 0%, transparent 50%)` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-4 rounded-2xl"
                style={{ background: `${theme.colors.primary.electric}20` }}
              >
                <Book className="h-12 w-12" style={{ color: theme.colors.primary.electric }} />
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
              Documentation
            </h1>
            <p className="text-xl" style={{ color: themeStyles.text.secondary }}>
              Tout ce dont vous avez besoin pour intégrer et utiliser nos solutions IA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 border"
                    style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}
                  >
                    <CardHeader>
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `${theme.colors.primary.electric}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: theme.colors.primary.electric }} />
                      </div>
                      <CardTitle style={{ color: themeStyles.text.primary }}>{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm" style={{ color: themeStyles.text.secondary }}>
                        {section.description}
                      </p>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: themeStyles.text.secondary }}>
                            <FileText className="h-4 w-4" style={{ color: theme.colors.primary.electric }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.primary.electric}10, ${theme.colors.primary.electric}05)`,
              border: `1px solid ${themeStyles.borders.medium}`
            }}
          >
            <div className="flex items-start gap-4">
              <Lightbulb className="h-8 w-8 flex-shrink-0" style={{ color: theme.colors.primary.electric }} />
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: themeStyles.text.primary }}>
                  Besoin d'aide ?
                </h3>
                <p style={{ color: themeStyles.text.secondary }}>
                  Notre équipe de support est disponible pour vous aider avec toute question technique. 
                  Contactez-nous à <span style={{ color: theme.colors.primary.electric }}>support@ntsagui.digital</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
