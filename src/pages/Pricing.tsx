import { motion } from "framer-motion";
import { Check, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { theme } from "@/styles/theme";
import { useState } from "react";
import { CTABanner } from "@/components/landing/CTABanner";

const Pricing = () => {
    const themeStyles = useThemeStyles();
    const [isAnnual, setIsAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const plans = [
        {
            name: "Starter",
            price: isAnnual ? "29" : "39",
            description: "Pour les indépendants et petites équipes qui débutent.",
            features: [
                "Jusqu'à 5 utilisateurs",
                "1000 crédits IA / mois",
                "Support par email",
                "Accès à l'API de base",
                "Analytics basiques"
            ],
            cta: "Essayer gratuitement",
            popular: false
        },
        {
            name: "Pro",
            price: isAnnual ? "99" : "129",
            description: "Pour les entreprises en croissance avec des besoins avancés.",
            features: [
                "Jusqu'à 20 utilisateurs",
                "10k crédits IA / mois",
                "Support prioritaire",
                "Accès complet à l'API",
                "Analytics avancés",
                "Intégrations CRM",
                "Mode offline"
            ],
            cta: "Commencer maintenant",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Sur devis",
            description: "Solution sur mesure pour les grandes organisations.",
            features: [
                "Utilisateurs illimités",
                "Crédits IA illimités",
                "Account Manager dédié",
                "SLA garanti 99.9%",
                "Déploiement On-Premise",
                "Formation personnalisée",
                "Audit de sécurité"
            ],
            cta: "Contacter les ventes",
            popular: false
        }
    ];

    const faqs = [
        {
            q: "Puis-je changer de plan à tout moment ?",
            a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre tableau de bord. Le changement sera effectif immédiatement."
        },
        {
            q: "Qu'est-ce qu'un crédit IA ?",
            a: "Un crédit IA correspond à une requête standard auprès de nos modèles d'intelligence artificielle. Les tâches complexes peuvent consommer plusieurs crédits."
        },
        {
            q: "Le plan Enterprise inclut-il un support 24/7 ?",
            a: "Oui, le plan Enterprise inclut un support téléphonique 24/7 dédié avec un temps de réponse garanti de moins de 1 heure."
        },
        {
            q: "Y a-t-il une période d'essai ?",
            a: "Absolument ! Tous nos plans payants incluent une période d'essai gratuite de 14 jours, sans engagement et sans carte de crédit requise."
        }
    ];

    return (
        <div style={{ background: themeStyles.backgrounds.primary }}>

            {/* Header */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Tarification simple et transparente</h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-70 mb-12">
                        Choisissez le plan qui correspond le mieux à vos besoins. Changez à tout moment.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className={!isAnnual ? "font-bold" : "opacity-60"}>Mensuel</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-16 h-8 rounded-full bg-primary/20 relative transition-colors duration-300"
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 rounded-full bg-primary transition-all duration-300 ${isAnnual ? "left-9" : "left-1"
                                    }`}
                            />
                        </button>
                        <span className={isAnnual ? "font-bold" : "opacity-60"}>Annuel <span className="text-xs text-green-500 font-bold ml-1">-20%</span></span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="px-6 pb-24">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-8 rounded-2xl relative border ${plan.popular ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'bg-card border-border'}`}
                            style={{
                                background: plan.popular ? `${theme.colors.primary.electric}08` : themeStyles.card.background,
                                borderColor: plan.popular ? theme.colors.primary.electric : themeStyles.card.border
                            }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1">
                                    <Star size={12} className="fill-current" /> Populaire
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-sm opacity-70 mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{plan.price !== "Sur devis" ? `${plan.price}€` : plan.price}</span>
                                    {plan.price !== "Sur devis" && <span className="opacity-60">/mois</span>}
                                </div>
                            </div>

                            <div className="mb-8 space-y-4">
                                {plan.features.map((feature, fidx) => (
                                    <div key={fidx} className="flex items-center gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-primary" />
                                        </div>
                                        <span className="opacity-80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                variant={plan.popular ? "default" : "outline"}
                                size="lg"
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="border rounded-xl overflow-hidden"
                            style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left font-semibold"
                            >
                                {faq.q}
                                {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {openFaq === idx && (
                                <div className="px-6 pb-6 pt-0 opacity-70 leading-relaxed">
                                    {faq.a}
                                </div>
                                ,)}
                        </div>
                    ))}
                </div>
            </section>

            <CTABanner />

        </div>
    );
};

export default Pricing;
