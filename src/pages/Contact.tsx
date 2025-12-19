import { theme } from '@/styles/theme';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const themeStyles = useThemeStyles();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

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
            {t('contact.title')}
            <span
              className="block mt-3"
              style={{ color: theme.colors.primary.electric }}
            >
              {t('contact.subtitle')}
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl"
            style={{ color: themeStyles.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {t('contact.description')}
          </motion.p>
        </motion.div>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-2 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <h2 className="text-3xl font-bold" style={{ color: themeStyles.text.primary }}>
              {t('contact.ourCoordinates')}
            </h2>

            {[
              {
                icon: MapPin,
                label: t('contact.address'),
                value: t('footer.address')
              },
              {
                icon: Phone,
                label: t('contact.phone'),
                value: t('footer.phone_contact')
              },
              {
                icon: Mail,
                label: t('contact.email'),
                value: t('footer.email_contact')
              }
            ].map((info, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex gap-4"
              >
                <info.icon
                  size={24}
                  style={{ color: theme.colors.primary.electric, flexShrink: 0 }}
                />
                <div>
                  <p style={{ color: themeStyles.text.muted, fontSize: '0.875rem' }} className="uppercase mb-1">
                    {info.label}
                  </p>
                  <p style={{ color: themeStyles.text.primary }} className="whitespace-pre-line">
                    {info.value}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              className="mt-12 p-6 rounded-xl border"
              style={{
                background: themeStyles.card.background,
                borderColor: themeStyles.card.border,
                boxShadow: themeStyles.shadows.soft
              }}
            >
              <h3 className="font-bold mb-4" style={{ color: themeStyles.text.primary }}>
                {t('contact.openingHours')}
              </h3>
              <div className="space-y-2" style={{ color: themeStyles.text.secondary }}>
                <p>Lundi - Vendredi: 09:00 - 18:00</p>
                <p>Samedi - Dimanche: Fermé</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 p-8 rounded-xl border"
              style={{
                background: themeStyles.card.background,
                borderColor: themeStyles.card.border,
                boxShadow: themeStyles.shadows.soft
              }}
            >
              <h2 className="text-2xl font-bold" style={{ color: themeStyles.text.primary }}>
                {t('contact.sendMessage')}
              </h2>

              <div>
                <label style={{ color: themeStyles.text.primary }} className="block text-sm font-medium mb-2">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: themeStyles.backgrounds.primary,
                    color: themeStyles.text.primary,
                    borderColor: themeStyles.borders.medium
                  }}
                  placeholder={t('contact.name')}
                />
              </div>

              <div>
                <label style={{ color: themeStyles.text.primary }} className="block text-sm font-medium mb-2">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: themeStyles.backgrounds.primary,
                    color: themeStyles.text.primary,
                    borderColor: themeStyles.borders.medium
                  }}
                  placeholder={t('contact.email')}
                />
              </div>

              <div>
                <label style={{ color: themeStyles.text.primary }} className="block text-sm font-medium mb-2">
                  {t('contact.message')}
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border resize-none"
                  style={{
                    background: themeStyles.backgrounds.primary,
                    color: themeStyles.text.primary,
                    borderColor: themeStyles.borders.medium
                  }}
                  placeholder={t('contact.message')}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full px-6 py-3 rounded-lg font-medium text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.electric}, ${theme.colors.primary.purple})`,
                  boxShadow: `0 0 20px ${theme.colors.primary.electric}50`
                }}
                whileHover={{
                  boxShadow: `0 0 30px ${theme.colors.primary.electric}70`
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t('contact.send')}
              </motion.button>

              {submitted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                  style={{ color: theme.colors.semantic.success }}
                >
                  ✓ {t('contact.success')}
                </motion.p>
              )}
            </motion.form>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6" style={{ background: themeStyles.backgrounds.secondary }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            style={{ color: themeStyles.text.primary }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('contact.faq')}
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {[
              {
                q: t('contact.faqQ1'),
                a: t('contact.faqA1')
              },
              {
                q: t('contact.faqQ2'),
                a: t('contact.faqA2')
              },
              {
                q: t('contact.faqQ3'),
                a: t('contact.faqA3')
              }
            ].map((faq, idx) => (
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
                <h3 className="font-bold mb-3" style={{ color: themeStyles.text.primary }}>
                  {faq.q}
                </h3>
                <p style={{ color: themeStyles.text.secondary }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
