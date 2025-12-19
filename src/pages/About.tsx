import { theme } from '@/styles/theme';
import { motion } from 'framer-motion';
import { Code2, Database, Users, Lightbulb, Target, TrendingUp, CheckCircle } from "lucide-react";
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import aboutTeam1 from '@/assets/about-team-1.jpg';
import aboutTeam2 from '@/assets/about-team-2.jpg';
import aboutWorkspace from '@/assets/about-workspace.jpg';
import expert1 from '@/assets/expert-1.jpg';
import expert2 from '@/assets/expert-2.jpg';
import expert3 from '@/assets/expert-3.jpg';
import expert4 from '@/assets/expert-4.jpg';

const About = () => {
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

  const specializations = [
    {
      icon: Code2,
      title: t('about.spec1Title'),
      description: t('about.spec1Desc'),
    },
    {
      icon: Lightbulb,
      title: t('about.spec2Title'),
      description: t('about.spec2Desc'),
    },
    {
      icon: Users,
      title: t('about.spec3Title'),
      description: t('about.spec3Desc'),
    },
    {
      icon: Database,
      title: t('about.spec4Title'),
      description: t('about.spec4Desc'),
    },
  ];

  const values = [
    {
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
    },
    {
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
    },
    {
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
    },
    {
      title: t('about.value4Title'),
      description: t('about.value4Desc'),
    },
  ];

  return (
    <div style={{ background: themeStyles.backgrounds.primary, minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20 pb-20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary.electric}15, transparent 70%)`
          }}
        />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: themeStyles.text.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            {t('about.title')}
            <span
              className="block mt-3"
              style={{ color: theme.colors.primary.electric }}
            >
              {t('about.subtitle')}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl"
            style={{ color: themeStyles.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {t('about.description')}
          </motion.p>
        </motion.div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Story Content */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-4xl font-bold" style={{ color: themeStyles.text.primary }}>
                {t('about.ourStory')}
              </h2>
              <div className="space-y-4" style={{ color: themeStyles.text.secondary }}>
                <p className="leading-relaxed">
                  {t('about.storyP1')}
                </p>
                <p className="leading-relaxed">
                  {t('about.storyP2')}
                </p>
                <p className="leading-relaxed">
                  {t('about.storyP3')}
                </p>
              </div>

              {/* Image Grid */}
              <motion.div 
                className="grid grid-cols-2 gap-4 mt-8"
                variants={itemVariants}
              >
                <motion.div
                  className="rounded-xl overflow-hidden relative group border-2 border-transparent"
                  whileHover={{ scale: 1.05, borderColor: theme.colors.primary.electric }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={aboutTeam1} 
                    alt="Our Team"
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
                <motion.div
                  className="rounded-xl overflow-hidden relative group border-2 border-transparent"
                  whileHover={{ scale: 1.05, borderColor: theme.colors.primary.purple }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={aboutTeam2} 
                    alt="Team Collaboration"
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-cyan-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mission & Vision Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 gap-6"
            >
              {[
                {
                  icon: Target,
                  title: t('about.mission'),
                  description: t('about.missionDesc')
                },
                {
                  icon: TrendingUp,
                  title: t('about.vision'),
                  description: t('about.visionDesc')
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-xl border"
                  style={{
                    background: themeStyles.card.background,
                    borderColor: themeStyles.card.border,
                    boxShadow: themeStyles.shadows.soft
                  }}
                >
                  <item.icon size={32} style={{ color: theme.colors.primary.electric, marginBottom: '12px' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: themeStyles.text.primary }}>
                    {item.title}
                  </h3>
                  <p style={{ color: themeStyles.text.secondary }}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SPECIALIZATIONS */}
      <section className="py-20 px-6" style={{ background: themeStyles.backgrounds.secondary }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            style={{ color: themeStyles.text.primary }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('about.specializations')}
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {specializations.map((spec, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-xl border"
                style={{
                  background: themeStyles.card.background,
                  borderColor: themeStyles.card.border,
                  boxShadow: themeStyles.shadows.soft
                }}
              >
                <spec.icon size={32} style={{ color: theme.colors.primary.electric, marginBottom: '12px' }} />
                <h3 className="text-lg font-bold mb-3" style={{ color: themeStyles.text.primary }}>
                  {spec.title}
                </h3>
                <p style={{ color: themeStyles.text.secondary }} className="text-sm">
                  {spec.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16"
          style={{ color: themeStyles.text.primary }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('about.coreValues')}
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 rounded-xl border flex gap-4"
              style={{
                background: themeStyles.card.background,
                borderColor: themeStyles.card.border,
                boxShadow: themeStyles.shadows.soft
              }}
            >
              <CheckCircle size={24} style={{ color: theme.colors.primary.electric, flexShrink: 0 }} />
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: themeStyles.text.primary }}>
                  {value.title}
                </h3>
                <p style={{ color: themeStyles.text.secondary }}>
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-20 px-6" style={{ background: themeStyles.backgrounds.secondary }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-8"
            style={{ color: themeStyles.text.primary }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('about.team')}
          </motion.h2>

          <motion.p
            className="text-center max-w-2xl mx-auto mb-16 text-lg"
            style={{ color: themeStyles.text.secondary }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('about.teamDesc')}
          </motion.p>

          {/* Team Grid */}
          <motion.div
            className="grid md:grid-cols-4 gap-8 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {[
              { image: expert1, name: "Software Architect", role: "Lead Engineer" },
              { image: expert2, name: "Data Scientist", role: "AI Specialist" },
              { image: expert3, name: "Tech Leader", role: "CTO" },
              { image: expert4, name: "Full Stack Developer", role: "Senior Engineer" },
            ].map((expert, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group"
              >
                <motion.div
                  className="relative overflow-hidden rounded-xl mb-4 border-2 border-transparent"
                  whileHover={{ 
                    y: -8,
                    scale: 1.05,
                    borderColor: theme.colors.primary.electric
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={expert.image} 
                    alt={expert.name}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${theme.colors.primary.electric}40 100%)`
                    }}
                  />
                  {/* Animated colorful gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Animated ring */}
                  <div 
                    className="absolute inset-0 rounded-xl border-2 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    style={{
                      borderColor: theme.colors.primary.electric
                    }}
                  />
                </motion.div>
                <h3 
                  className="text-lg font-bold text-center group-hover:text-[var(--primary)] transition-colors duration-300"
                  style={{ color: themeStyles.text.primary }}
                >
                  {expert.name}
                </h3>
                <p 
                  className="text-sm text-center group-hover:text-[var(--accent)] transition-colors duration-300"
                  style={{ color: themeStyles.text.secondary }}
                >
                  {expert.role}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Workspace Image */}
          <motion.div
            className="rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src={aboutWorkspace} 
              alt="Our Workspace"
              className="w-full h-96 object-cover"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
