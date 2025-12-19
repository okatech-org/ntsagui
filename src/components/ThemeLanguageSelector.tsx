import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { theme } from '@/styles/theme';

const ThemeLanguageSelector = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const bgColor = isDark ? '#0A0A0A' : '#FFFFFF';
  const textColor = isDark ? theme.colors.text.primary : '#1A1A1A';
  const borderColor = isDark ? `${theme.colors.primary.electric}40` : `${theme.colors.primary.electric}20`;

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="p-3 rounded-lg border transition-all"
        style={{
          background: bgColor,
          color: theme.colors.primary.electric,
          border: `1px solid ${borderColor}`,
          boxShadow: `0 0 20px ${theme.colors.primary.electric}20`,
        }}
        title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      {/* Language Selector */}
      <div className="relative">
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-lg border transition-all"
          style={{
            background: bgColor,
            color: theme.colors.primary.electric,
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 20px ${theme.colors.primary.electric}20`,
          }}
          title="Sélectionner la langue"
        >
          <Globe size={20} />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 rounded-lg border overflow-hidden"
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                boxShadow: `0 8px 32px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
                minWidth: '180px',
              }}
            >
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 flex items-center gap-2 transition-all ${
                    language === lang.code ? 'border-l-2' : ''
                  }`}
                  style={{
                    color: language === lang.code ? theme.colors.primary.electric : textColor,
                    borderLeftColor: theme.colors.primary.electric,
                    background:
                      language === lang.code
                        ? isDark
                          ? `${theme.colors.primary.electric}15`
                          : `${theme.colors.primary.electric}10`
                        : 'transparent',
                  }}
                  whileHover={{
                    background: isDark
                      ? `${theme.colors.primary.electric}20`
                      : `${theme.colors.primary.electric}15`,
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span>{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThemeLanguageSelector;
