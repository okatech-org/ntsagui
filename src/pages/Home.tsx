import { theme } from '@/styles/theme';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { Brain, Zap, Workflow, Shield, Users, Rocket, Lock } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTABanner } from '@/components/landing/CTABanner';
import { motion } from 'framer-motion';

// Import images
import solutionAi from '@/assets/solution-ai.jpg';
import solutionPerformance from '@/assets/solution-performance.jpg';
import solutionIntegration from '@/assets/solution-integration.jpg';

const Home = () => {
  const themeStyles = useThemeStyles();
  const { t } = useLanguage();

  const solutions = [
    {
      title: t('solutionsHome.sol1Title'),
      description: t('solutionsHome.sol1Desc'),
      icon: Brain,
      image: solutionAi,
      tags: ["Intelligence Artificielle", "NLP", "Machine Learning"]
    },
    {
      title: t('solutionsHome.sol2Title'),
      description: t('solutionsHome.sol2Desc'),
      icon: Zap,
      image: solutionPerformance,
      tags: ["Haute Performance", "Temps Réel", "Scalable"]
    },
    {
      title: t('solutionsHome.sol3Title'),
      description: t('solutionsHome.sol3Desc'),
      icon: Workflow,
      image: solutionIntegration,
      tags: ["Workflow", "Automatisation", "API First"]
    }
  ];

  return (
    <div style={{ background: themeStyles.backgrounds.primary, minHeight: '100vh' }}>

      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. SOLUTIONS (Features Grid) */}
      <div style={{ background: themeStyles.backgrounds.secondary }}>
        <FeaturesGrid
          title={t('solutions.title')}
          subtitle={t('solutions.subtitle')}
          features={solutions}
        />
      </div>

      {/* 3. AVANTAGES (Custom Grid) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t('advantages.title')}</h2>
          <p className="text-xl opacity-70">{t('advantages.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: t('advantages.adv1Title'), desc: t('advantages.adv1Desc') },
            { icon: Lock, title: t('advantages.adv2Title'), desc: t('advantages.adv2Desc') },
            { icon: Users, title: t('advantages.adv3Title'), desc: t('advantages.adv3Desc') },
            { icon: Rocket, title: t('advantages.adv4Title'), desc: t('advantages.adv4Desc') }
          ].map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border hover:border-primary/50 transition-colors group"
              style={{
                background: themeStyles.card.background,
                borderColor: themeStyles.card.border
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <adv.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{adv.title}</h3>
              <p className="text-sm opacity-70">{adv.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. TÉMOIGNAGES */}
      <TestimonialsSection />

      {/* 5. CTA FINALE */}
      <CTABanner />

      {/* 6. CONTACT SECTION (Simplified) */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">{t('contactHome.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-secondary/20">
            <h3 className="font-semibold mb-2">{t('contactHome.addressLabel')}</h3>
            <p className="opacity-80">{t('footer.address')}</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/20">
            <h3 className="font-semibold mb-2">{t('contactHome.emailLabel')}</h3>
            <p className="opacity-80 text-primary">{t('footer.email_contact')}</p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/20">
            <h3 className="font-semibold mb-2">{t('contactHome.phoneLabel')}</h3>
            <p className="opacity-80">{t('footer.phone_contact')}</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
