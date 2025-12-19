import { theme } from '@/styles/theme';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Zap, Users, Workflow, Brain, Lock, Rocket, Sparkles, TrendingUp, Shield, Target, LineChart } from 'lucide-react';
import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLanguage } from '@/contexts/LanguageContext';

// Import person images
import person1 from '@/assets/person-1.jpg';
import person2 from '@/assets/person-2.jpg';
import person3 from '@/assets/person-3.jpg';
import person4 from '@/assets/person-4.jpg';
import person5 from '@/assets/person-5.jpg';
import person6 from '@/assets/person-6.jpg';
import digitalAiWorkspace from '@/assets/digital-ai-workspace.jpg';
import teamCollaboration from '@/assets/team-collaboration.jpg';
import workflowAutomation from '@/assets/workflow-automation.jpg';
import dataCenter from '@/assets/data-center.jpg';
import solutionAi from '@/assets/solution-ai.jpg';
import solutionPerformance from '@/assets/solution-performance.jpg';
import solutionIntegration from '@/assets/solution-integration.jpg';

const Home = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const themeStyles = useThemeStyles();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: theme.animations.easing.smooth }
    }
  };

  return (
    <div style={{ background: themeStyles.backgrounds.primary, minHeight: '100vh' }}>
      {/* ===== HERO SECTION - INSPIRED DESIGN ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          {/* Green gradient circle - top left */}
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, #10B98140, transparent 70%)`
            }}
          />
          {/* Orange gradient - top right */}
          <div
            className="absolute top-20 right-32 w-80 h-80 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, #FF8C4240, transparent 70%)`
            }}
          />
          {/* Yellow gradient - bottom right */}
          <div
            className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, #F59E0B40, transparent 70%)`
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto relative z-10 px-6">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
              style={{
                background: `${theme.colors.primary.electric}15`,
                border: `1px solid ${theme.colors.primary.electric}40`
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: theme.colors.primary.electric }} />
              <span style={{ color: themeStyles.text.secondary, fontSize: '0.875rem' }}>{t('hero.badge')}</span>
            </motion.div>

            {/* Title with gradient */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="block" style={{ color: themeStyles.text.primary }}>
                  {t('hero.titlePart1')}
                </span>
                <span
                  className="block"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary.electric}, #FF8C42)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('hero.titlePart2')}
                </span>
                <span
                  className="block"
                  style={{
                    background: `linear-gradient(135deg, #FF8C42, ${theme.colors.primary.purple})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('hero.titlePart3')}
                </span>
              </h1>
              <p style={{ color: themeStyles.text.secondary, fontSize: '1.125rem', lineHeight: '1.6' }}>
                {t('hero.description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                className="px-8 py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.electric}, ${theme.colors.primary.purple})`,
                  color: '#fff',
                  boxShadow: `0 0 20px ${theme.colors.primary.electric}50`
                }}
                whileHover={{
                  boxShadow: `0 0 30px ${theme.colors.primary.electric}70`,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                {t('hero.needHelp')}
                <ChevronRight size={20} />
              </motion.button>
              <motion.div className="relative">
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full px-6 py-4 rounded-xl border text-base outline-none transition-all"
                  style={{
                    background: themeStyles.card.background,
                    borderColor: themeStyles.borders.medium,
                    color: themeStyles.text.primary
                  }}
                />
              </motion.div>
            </div>

            {/* Small action buttons */}
            <div className="flex items-center gap-6 pt-4">
              <motion.button
                className="flex items-center gap-2 text-sm font-medium transition-all"
                style={{ color: themeStyles.text.secondary }}
                whileHover={{ scale: 1.05, color: theme.colors.primary.electric }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.colors.primary.electric}20` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                {t('hero.start')}
                <span className="text-xs">{t('hero.videoDemo')}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Right - Floating Person Images */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Person 1 - Orange circle - top left */}
            <motion.div
              className="absolute top-0 left-0 w-48 h-48 rounded-full overflow-hidden"
              style={{
                border: `3px solid ${theme.colors.primary.electric}40`,
                background: '#FF8C42',
                boxShadow: `0 10px 40px rgba(255, 140, 66, 0.3)`
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person1} alt="Expert 1" className="w-full h-full object-cover" />
            </motion.div>

            {/* Person 2 - Yellow/Pink circle - top right */}
            <motion.div
              className="absolute top-10 right-0 w-40 h-40 rounded-2xl overflow-hidden"
              style={{
                border: `3px solid #F59E0B40`,
                background: '#FCD34D',
                boxShadow: `0 10px 40px rgba(245, 158, 11, 0.3)`,
                transform: 'rotate(5deg)'
              }}
              animate={{ y: [0, 15, 0], rotate: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person2} alt="Expert 2" className="w-full h-full object-cover" />
            </motion.div>

            {/* Person 3 - Green circle - middle left */}
            <motion.div
              className="absolute top-1/3 left-10 w-44 h-44 rounded-full overflow-hidden"
              style={{
                border: `3px solid #10B98140`,
                background: '#10B981',
                boxShadow: `0 10px 40px rgba(16, 185, 129, 0.3)`
              }}
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person3} alt="Expert 3" className="w-full h-full object-cover" />
            </motion.div>

            {/* Person 4 - Pink rounded square - middle right */}
            <motion.div
              className="absolute top-1/2 right-10 w-48 h-52 rounded-3xl overflow-hidden"
              style={{
                border: `3px solid ${theme.colors.primary.purple}40`,
                background: '#EC4899',
                boxShadow: `0 10px 40px rgba(236, 72, 153, 0.3)`,
                transform: 'rotate(-3deg)'
              }}
              animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person4} alt="Expert 4" className="w-full h-full object-cover" />
            </motion.div>

            {/* Person 5 - Yellow circle - bottom left */}
            <motion.div
              className="absolute bottom-20 left-20 w-52 h-52 rounded-full overflow-hidden"
              style={{
                border: `3px solid #F59E0B40`,
                background: '#FCD34D',
                boxShadow: `0 10px 40px rgba(252, 211, 77, 0.3)`
              }}
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person5} alt="Expert 5" className="w-full h-full object-cover" />
            </motion.div>

            {/* Person 6 - Cyan rounded square - bottom right */}
            <motion.div
              className="absolute bottom-10 right-32 w-44 h-48 rounded-2xl overflow-hidden"
              style={{
                border: `3px solid ${theme.colors.primary.electric}40`,
                background: theme.colors.primary.electric,
                boxShadow: `0 10px 40px ${theme.colors.primary.electric}40`,
                transform: 'rotate(8deg)'
              }}
              animate={{ y: [0, -18, 0], rotate: [8, -2, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={person6} alt="Expert 6" className="w-full h-full object-cover" />
            </motion.div>

            {/* Decorative shapes */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-8 h-8"
              style={{
                border: `2px solid #FF8C42`,
                transform: 'rotate(45deg)'
              }}
              animate={{ rotate: [45, 225, 45] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/3 w-4 h-4 rounded-full"
              style={{ background: theme.colors.primary.electric }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </section>

      {/* ===== VALUE PROPOSITION SECTION ===== */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
            {t('whyChoose.title')}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl" style={{ color: themeStyles.text.secondary }}>
            {t('whyChoose.subtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Sparkles,
              title: t('whyChoose.pillar1Title'),
              description: t('whyChoose.pillar1Desc'),
              image: digitalAiWorkspace
            },
            {
              icon: TrendingUp,
              title: t('whyChoose.pillar2Title'),
              description: t('whyChoose.pillar2Desc'),
              image: teamCollaboration
            },
            {
              icon: Shield,
              title: t('whyChoose.pillar3Title'),
              description: t('whyChoose.pillar3Desc'),
              image: workflowAutomation
            }
          ].map((pillar, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative overflow-hidden p-8 rounded-2xl border group hover:border-opacity-60 transition-all duration-500"
              style={{
                background: themeStyles.card.background,
                borderColor: themeStyles.card.border,
                boxShadow: themeStyles.shadows.soft,
              }}
              whileHover={{
                y: -8,
                boxShadow: themeStyles.shadows.glow
              }}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${themeStyles.card.background} 100%)`
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <pillar.icon
                  size={40}
                  className="mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: theme.colors.primary.electric }}
                />
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: themeStyles.text.primary }}
                >
                  {pillar.title}
                </h3>
                <p style={{ color: themeStyles.text.secondary }}>
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section className="py-32 px-6 relative" style={{ background: themeStyles.backgrounds.secondary }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
              {t('solutions.title')}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl" style={{ color: themeStyles.text.secondary }}>
              {t('solutions.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Brain,
                title: t('solutionsHome.sol1Title'),
                description: t('solutionsHome.sol1Desc'),
                image: solutionAi,
                features: [
                  t('solutionsHome.sol1Feature1'),
                  t('solutionsHome.sol1Feature2'),
                  t('solutionsHome.sol1Feature3'),
                  t('solutionsHome.sol1Feature4')
                ],
                cta: t('solutionsHome.sol1Cta')
              },
              {
                icon: Zap,
                title: t('solutionsHome.sol2Title'),
                description: t('solutionsHome.sol2Desc'),
                image: solutionPerformance,
                features: [
                  t('solutionsHome.sol2Feature1'),
                  t('solutionsHome.sol2Feature2'),
                  t('solutionsHome.sol2Feature3'),
                  t('solutionsHome.sol2Feature4')
                ],
                cta: t('solutionsHome.sol2Cta')
              },
              {
                icon: Workflow,
                title: t('solutionsHome.sol3Title'),
                description: t('solutionsHome.sol3Desc'),
                image: solutionIntegration,
                features: [
                  t('solutionsHome.sol3Feature1'),
                  t('solutionsHome.sol3Feature2'),
                  t('solutionsHome.sol3Feature3'),
                  t('solutionsHome.sol3Feature4')
                ],
                cta: t('solutionsHome.sol3Cta')
              }
            ].map((solution, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border backdrop-blur-sm group"
                style={{
                  borderColor: themeStyles.card.border,
                  boxShadow: themeStyles.shadows.soft
                }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 20px 40px ${theme.colors.primary.electric}30`
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(180deg, ${themeStyles.card.background}95 0%, ${themeStyles.card.background}E6 100%)`
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8">
                  <solution.icon
                    size={48}
                    className="mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ color: theme.colors.primary.electric }}
                  />
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: themeStyles.text.primary }}
                  >
                    {solution.title}
                  </h3>
                  <p className="mb-6" style={{ color: themeStyles.text.secondary }}>
                    {solution.description}
                  </p>
                  <ul className="mb-8 space-y-2">
                    {solution.features.map((feature, fidx) => (
                      <li key={fidx} className="text-sm flex items-start gap-2" style={{ color: themeStyles.text.secondary }}>
                        <span style={{ color: theme.colors.primary.electric }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    className="w-full text-sm font-medium py-2 px-4 rounded-lg border transition-all"
                    style={{
                      borderColor: theme.colors.primary.electric,
                      color: theme.colors.primary.electric,
                      background: `${theme.colors.primary.electric}10`
                    }}
                    whileHover={{
                      background: `${theme.colors.primary.electric}20`,
                      boxShadow: `0 0 15px ${theme.colors.primary.electric}30`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {solution.cta}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ADVANTAGES SECTION ===== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={dataCenter} alt="Data Center" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${themeStyles.backgrounds.primary}F0 0%, ${themeStyles.backgrounds.primary}E6 100%)` }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants}>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4" style={{ color: themeStyles.text.primary }}>
              {t('advantages.title')}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl mb-12" style={{ color: themeStyles.text.secondary }}>
              {t('advantages.subtitle')}
            </motion.p>

            <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: t('advantages.adv1Title'),
                  description: t('advantages.adv1Desc'),
                  icon: Brain
                },
                {
                  title: t('advantages.adv2Title'),
                  description: t('advantages.adv2Desc'),
                  icon: Lock
                },
                {
                  title: t('advantages.adv3Title'),
                  description: t('advantages.adv3Desc'),
                  icon: Users
                },
                {
                  title: t('advantages.adv4Title'),
                  description: t('advantages.adv4Desc'),
                  icon: Rocket
                }
              ].map((adv, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-8 rounded-lg flex gap-6 backdrop-blur-sm"
                  style={{
                    background: `${themeStyles.card.background}CC`,
                    borderLeft: `4px solid ${theme.colors.primary.electric}`
                  }}
                >
                  <div
                    className="p-3 rounded-lg h-fit"
                    style={{
                      background: theme.colors.primary.electric + '20',
                      color: theme.colors.primary.electric
                    }}
                  >
                    <adv.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: themeStyles.text.primary }}>
                      {adv.title}
                    </h3>
                    <p style={{ color: themeStyles.text.secondary }}>
                      {adv.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CHATBOT CTA SECTION ===== */}
      <section
        id="chatbot-section"
        className="py-20 px-6 rounded-2xl mx-6 my-20"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary.electric}15, ${theme.colors.primary.electric}05)`
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
            {t('chatbotCta.title')}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl mb-8" style={{ color: themeStyles.text.secondary }}>
            {t('chatbotCta.subtitle')}
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-center">
            <Button
              className="px-10 py-6 text-lg font-semibold rounded-lg"
              style={{
                background: theme.colors.primary.electric,
                color: theme.colors.primary.dark
              }}
            >
              {t('chatbotCta.cta')} <ChevronRight className="ml-2" />
            </Button>
          </motion.div>
          <motion.p variants={itemVariants} className="text-sm mt-6" style={{ color: themeStyles.text.muted }}>
            {t('chatbotCta.disclaimer')}
          </motion.p>
        </motion.div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact-section" className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4" style={{ color: themeStyles.text.primary }}>
            {t('contactHome.title')}
          </motion.h2>

          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-12 mt-12">
            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-8" style={{ color: theme.colors.primary.electric }}>
                {t('contactHome.contactInfo')}
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm" style={{ color: themeStyles.text.muted }}>{t('contactHome.addressLabel')}</p>
                  <p style={{ color: themeStyles.text.primary }} className="font-semibold">
                    {t('footer.address')}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeStyles.text.muted }}>{t('contactHome.emailLabel')}</p>
                  <p style={{ color: theme.colors.primary.electric }} className="font-semibold">
                    {t('footer.email_contact')}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeStyles.text.muted }}>{t('contactHome.phoneLabel')}</p>
                  <p style={{ color: themeStyles.text.primary }} className="font-semibold">
                    {t('footer.phone_contact')}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: themeStyles.text.muted }}>{t('contactHome.hoursLabel')}</p>
                  <p style={{ color: themeStyles.text.primary }} className="font-semibold">
                    {t('contactHome.hoursValue')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="p-8 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary.electric }}>
                {t('contactHome.formTitle')}
              </h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder={t('contactHome.namePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(0, 212, 212, 0.1)',
                    borderColor: theme.colors.primary.electric + '40',
                    color: themeStyles.text.primary,
                    borderWidth: '1px'
                  }}
                />
                <input
                  type="email"
                  placeholder={t('contactHome.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(0, 212, 212, 0.1)',
                    borderColor: theme.colors.primary.electric + '40',
                    color: themeStyles.text.primary,
                    borderWidth: '1px'
                  }}
                />
                <input
                  type="text"
                  placeholder={t('contactHome.companyPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(0, 212, 212, 0.1)',
                    borderColor: theme.colors.primary.electric + '40',
                    color: themeStyles.text.primary,
                    borderWidth: '1px'
                  }}
                />
                <textarea
                  placeholder={t('contactHome.messagePlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg resize-none"
                  style={{
                    background: 'rgba(0, 212, 212, 0.1)',
                    borderColor: theme.colors.primary.electric + '40',
                    color: themeStyles.text.primary,
                    borderWidth: '1px'
                  }}
                />
                <Button
                  className="w-full py-3 font-semibold rounded-lg"
                  style={{
                    background: theme.colors.primary.electric,
                    color: theme.colors.primary.dark
                  }}
                >
                  {t('contactHome.submitButton')}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
