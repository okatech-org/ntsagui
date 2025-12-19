import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "@/styles/theme";

const FAQ = () => {
  const { t } = useLanguage();
  const themeStyles = useThemeStyles();

  const faqCategories = [
    {
      category: "Général",
      questions: [
        { question: "Qu'est-ce que NTSAGUI Digital propose comme services ?", answer: "NTSAGUI Digital est une entreprise spécialisée dans les solutions d'intelligence artificielle pour les entreprises. Nous proposons des services d'implémentation IA, de développement de chatbots intelligents, de prompt engineering, et d'automatisation des processus métier." },
        { question: "Dans quels secteurs intervenez-vous ?", answer: "Nous intervenons dans tous les secteurs d'activité : commerce, finance, santé, éducation, industrie, services, etc. Nos solutions sont adaptées aux besoins spécifiques de chaque secteur et de chaque entreprise." },
        { question: "Proposez-vous des solutions sur mesure ?", answer: "Oui, toutes nos solutions sont personnalisées selon vos besoins spécifiques. Nous commençons par une analyse approfondie de vos processus et objectifs avant de concevoir une solution adaptée." }
      ]
    },
    {
      category: "Tarification",
      questions: [
        { question: "Comment sont calculés vos tarifs ?", answer: "Nos tarifs sont calculés en fonction de la complexité du projet, des fonctionnalités requises et du volume d'utilisation prévu. Nous proposons des devis personnalisés après une première consultation gratuite." },
        { question: "Proposez-vous des formules d'abonnement ?", answer: "Oui, nous proposons différentes formules d'abonnement mensuelles ou annuelles pour nos services de maintenance, support et mises à jour. Les détails sont disponibles lors de notre consultation." },
        { question: "Y a-t-il des frais cachés ?", answer: "Non, nous sommes totalement transparents sur nos tarifs. Tous les coûts sont détaillés dans nos devis et il n'y a aucun frais caché. Vous savez exactement ce que vous payez." }
      ]
    },
    {
      category: "Technique",
      questions: [
        { question: "Quelles technologies utilisez-vous ?", answer: "Nous utilisons les dernières technologies d'IA incluant GPT, Claude, et des modèles propriétaires. Nos solutions sont construites avec des frameworks modernes comme React, Node.js, et Python." },
        { question: "Comment gérez-vous la sécurité des données ?", answer: "La sécurité est notre priorité. Nous utilisons le chiffrement de bout en bout, des protocoles sécurisés, et sommes conformes au RGPD. Vos données sont stockées sur des serveurs sécurisés en Europe." },
        { question: "L'intégration avec nos systèmes existants est-elle possible ?", answer: "Absolument. Nos solutions sont conçues pour s'intégrer facilement avec vos systèmes existants via des API. Nous supportons les intégrations avec les CRM, ERP, et autres outils métier courants." },
        { question: "Quelle est la disponibilité de vos services ?", answer: "Nos solutions cloud sont disponibles 24/7 avec une garantie de disponibilité de 99.9%. Nous avons des systèmes de redondance pour assurer la continuité de service." }
      ]
    },
    {
      category: "Support",
      questions: [
        { question: "Quel type de support proposez-vous ?", answer: "Nous proposons un support technique par email, téléphone et chat. Les clients avec abonnement premium bénéficient d'un support prioritaire avec des temps de réponse garantis." },
        { question: "Proposez-vous des formations ?", answer: "Oui, nous proposons des formations pour vos équipes afin qu'elles puissent utiliser efficacement nos solutions. Les formations peuvent être en présentiel ou en ligne." },
        { question: "Que se passe-t-il après le déploiement ?", answer: "Après le déploiement, nous assurons une période de suivi pour s'assurer que tout fonctionne parfaitement. Nous proposons également des contrats de maintenance et d'évolution." }
      ]
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
          style={{ background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary.electric} 0%, transparent 50%)` }}
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
                <HelpCircle className="h-12 w-12" style={{ color: theme.colors.primary.electric }} />
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
              Questions Fréquentes
            </h1>
            <p className="text-xl" style={{ color: themeStyles.text.secondary }}>
              Trouvez rapidement des réponses à vos questions les plus courantes
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {faqCategories.map((category, categoryIndex) => (
              <motion.div key={categoryIndex} variants={itemVariants}>
                <h2 
                  className="text-2xl font-bold mb-6 flex items-center gap-3"
                  style={{ color: themeStyles.text.primary }}
                >
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: `${theme.colors.primary.electric}20`, color: theme.colors.primary.electric }}
                  >
                    {categoryIndex + 1}
                  </span>
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="rounded-lg border px-6"
                      style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4" style={{ color: themeStyles.text.primary }}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4" style={{ color: themeStyles.text.secondary }}>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card className="text-center p-6" style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${theme.colors.primary.electric}20` }}
                >
                  <MessageCircle className="h-6 w-6" style={{ color: theme.colors.primary.electric }} />
                </div>
                <CardTitle style={{ color: themeStyles.text.primary }}>Chat en direct</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: themeStyles.text.secondary }}>
                  Discutez avec notre assistant IA disponible 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${theme.colors.primary.electric}20` }}
                >
                  <Mail className="h-6 w-6" style={{ color: theme.colors.primary.electric }} />
                </div>
                <CardTitle style={{ color: themeStyles.text.primary }}>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: themeStyles.text.secondary }}>contact@ntsagui.digital</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}>
              <CardHeader>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${theme.colors.primary.electric}20` }}
                >
                  <Phone className="h-6 w-6" style={{ color: theme.colors.primary.electric }} />
                </div>
                <CardTitle style={{ color: themeStyles.text.primary }}>Téléphone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: themeStyles.text.secondary }}>+33 1 23 45 67 89</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <p className="mb-6" style={{ color: themeStyles.text.secondary }}>
              Vous n'avez pas trouvé la réponse à votre question ?
            </p>
            <Button asChild size="lg" style={{ background: theme.colors.primary.electric, color: "#fff" }}>
              <Link to="/contact">Contactez-nous</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
