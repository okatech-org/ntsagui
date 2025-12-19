import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Shield, Sun, Moon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/styles/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabaseAuth } from "@/lib/supabaseAuth";
import logoNtsagui from "@/assets/logo-ntsagui.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const translations: Record<string, Record<string, string>> = {
    fr: {
      'nav.home': 'Accueil',
      'nav.about': 'À propos',
      'nav.solutions': 'Solutions',
      'nav.contact': 'Contact',
      'nav.admin': 'Admin',
      'nav.logout': 'Déconnexion',
      'nav.getStarted': 'Commencer',
    },
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.solutions': 'Solutions',
      'nav.contact': 'Contact',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      'nav.getStarted': 'Get Started',
    },
    es: {
      'nav.home': 'Inicio',
      'nav.about': 'Acerca de',
      'nav.solutions': 'Soluciones',
      'nav.contact': 'Contacto',
      'nav.admin': 'Admin',
      'nav.logout': 'Salir',
      'nav.getStarted': 'Empezar',
    },
    ar: {
      'nav.home': 'الرئيسية',
      'nav.about': 'من نحن',
      'nav.solutions': 'الحلول',
      'nav.contact': 'اتصل بنا',
      'nav.admin': 'المشرف',
      'nav.logout': 'تسجيل الخروج',
      'nav.getStarted': 'ابدأ الآن',
    },
  };
  const t = (key: string) => (translations[language]?.[key] ?? translations.fr[key] ?? key);

  const navItems = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.about'), path: "/about" },
    { name: t('nav.solutions'), path: "/solutions" },
    { name: t('nav.contact'), path: "/contact" },
  ];

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    navigate("/");
  };

  return (
    <nav 
      className="fixed top-0 w-full z-50 backdrop-blur-sm border-b"
      style={{
        background: isDark 
          ? `linear-gradient(180deg, ${theme.colors.primary.dark} 0%, rgba(0,0,0,0.95) 100%)`
          : 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F9 100%)',
        borderColor: `${theme.colors.primary.electric}20`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{
                  boxShadow: `0 0 20px ${theme.colors.primary.electric}40`
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src={logoNtsagui} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <span 
                className="text-xl font-bold hidden sm:inline-block"
                style={{ color: isDark ? theme.colors.text.primary : '#1A1A1A' }}
              >
                OKA Tech
              </span>
          </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className="px-4 py-2 rounded-lg font-medium transition-all relative group"
                  style={{
                    color: isActive(item.path) 
                      ? theme.colors.primary.electric
                      : isDark ? theme.colors.text.secondary : '#666666'
                  }}
              >
                {item.name}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{
                        background: `${theme.colors.primary.electric}15`,
                        border: `1px solid ${theme.colors.primary.electric}30`
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <motion.div
                    className="absolute bottom-1 left-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, ${theme.colors.primary.electric}, rgba(0,0,0,0))`,
                      width: "100%"
                    }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
              </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Controls (Theme, Language, CTA) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg border transition-all"
              style={{
                backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                color: theme.colors.primary.electric,
                border: `1px solid ${theme.colors.primary.electric}40`,
                boxShadow: `0 0 15px ${theme.colors.primary.electric}15`,
              }}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Language Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg border transition-all"
                style={{
                  backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                  color: theme.colors.primary.electric,
                  border: `1px solid ${theme.colors.primary.electric}40`,
                  boxShadow: `0 0 15px ${theme.colors.primary.electric}15`,
                }}
                title="Select language"
              >
                <Globe size={18} />
              </motion.button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 rounded-lg border overflow-hidden"
                    style={{
                      backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                      border: `1px solid ${theme.colors.primary.electric}40`,
                      boxShadow: `0 8px 32px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
                      minWidth: '160px',
                    }}
                  >
                    {languages.map((lang, index) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-2 transition-all text-sm border-l-2 ${
                          language === lang.code ? 'border-opacity-100' : 'border-opacity-0'
                        }`}
                        style={{
                          color: language === lang.code ? theme.colors.primary.electric : (isDark ? theme.colors.text.secondary : '#666666'),
                          borderLeftColor: theme.colors.primary.electric,
                          backgroundColor:
                            language === lang.code
                              ? (isDark ? `${theme.colors.primary.electric}15` : `${theme.colors.primary.electric}10`)
                              : 'rgba(0,0,0,0)',
                        }}
                        whileHover={{
                          backgroundColor: isDark ? `${theme.colors.primary.electric}20` : `${theme.colors.primary.electric}15`,
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span>{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Buttons */}
            {user ? (
              <>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: isDark ? theme.colors.text.secondary : '#666666', fontSize: '0.875rem' }}
                >
                  {user.email}
                </motion.span>
                <Link to="/admin">
                  <motion.button
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: `${theme.colors.primary.electric}15`,
                      color: theme.colors.primary.electric,
                      border: `1px solid ${theme.colors.primary.electric}40`
                    }}
                    whileHover={{
                      backgroundColor: `${theme.colors.primary.electric}25`,
                      boxShadow: `0 0 20px ${theme.colors.primary.electric}40`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shield size={16} />
                    {t('nav.admin')}
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                  style={{
                    color: theme.colors.semantic.error,
                    border: `1px solid ${theme.colors.semantic.error}40`
                  }}
                  whileHover={{
                    backgroundColor: `${theme.colors.semantic.error}15`,
                    boxShadow: `0 0 20px ${theme.colors.semantic.error}40`
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/admin-login">
                  <motion.button
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      color: theme.colors.primary.electric,
                      border: `1px solid ${theme.colors.primary.electric}40`
                    }}
                    whileHover={{
                      backgroundColor: `${theme.colors.primary.electric}15`,
                      boxShadow: `0 0 20px ${theme.colors.primary.electric}40`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('nav.admin')}
                  </motion.button>
                </Link>
            <Link to="/contact">
                  <motion.button
                    className="px-6 py-2 rounded-lg font-medium text-white transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary.electric}, ${theme.colors.primary.purple})`,
                      boxShadow: `0 0 20px ${theme.colors.primary.electric}50`
                    }}
                    whileHover={{
                      boxShadow: `0 0 30px ${theme.colors.primary.electric}70`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('nav.getStarted')}
                  </motion.button>
            </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{
              color: isDark ? theme.colors.text.primary : '#1A1A1A',
              backgroundColor: isOpen ? `${theme.colors.primary.electric}20` : 'rgba(0,0,0,0)'
            }}
            whileHover={{ backgroundColor: `${theme.colors.primary.electric}15` }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 space-y-2 border-t"
              style={{ borderColor: `${theme.colors.primary.electric}20` }}
            >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    color: isActive(item.path)
                      ? theme.colors.primary.electric
                      : isDark ? theme.colors.text.secondary : '#666666',
                    backgroundColor: isActive(item.path)
                      ? `${theme.colors.primary.electric}15`
                      : 'rgba(0,0,0,0)',
                    border: isActive(item.path)
                      ? `1px solid ${theme.colors.primary.electric}30`
                      : 'none'
                  }}
              >
                {item.name}
              </Link>
            ))}

              <div className="h-px my-2" style={{ background: `${theme.colors.primary.electric}20` }} />

              {/* Mobile Theme & Language */}
              <div className="flex gap-2 px-4 py-2">
                <motion.button
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 p-2 rounded-lg border transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                    color: theme.colors.primary.electric,
                    border: `1px solid ${theme.colors.primary.electric}40`,
                  }}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
                </motion.button>

                <div className="flex-1 relative">
                  <motion.button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    whileHover={{ scale: 1.05 }}
                    className="w-full p-2 rounded-lg border transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                      color: theme.colors.primary.electric,
                      border: `1px solid ${theme.colors.primary.electric}40`,
                    }}
                  >
                    <Globe size={16} />
                    <span className="text-sm">{language.toUpperCase()}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showLanguageMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 right-0 mt-2 rounded-lg border overflow-hidden"
                        style={{
                          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                          border: `1px solid ${theme.colors.primary.electric}40`,
                        }}
                      >
                        {languages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code as any);
                              setShowLanguageMenu(false);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-sm transition-all"
                            style={{
                              color: language === lang.code ? theme.colors.primary.electric : (isDark ? theme.colors.text.secondary : '#666666'),
                              backgroundColor:
                                language === lang.code
                                  ? (isDark ? `${theme.colors.primary.electric}15` : `${theme.colors.primary.electric}10`)
                                  : 'rgba(0,0,0,0)',
                            }}
                          >
                            <span>{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {user ? (
                <>
                  <div 
                    className="px-4 py-2 text-sm"
                    style={{ color: isDark ? theme.colors.text.secondary : '#666666' }}
                  >
                    {user.email}
                  </div>
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all mx-4"
                      style={{
                        color: theme.colors.primary.electric,
                        border: `1px solid ${theme.colors.primary.electric}40`
                      }}
                    >
                      <Shield size={16} />
                      {t('nav.admin')}
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all mx-4"
                    style={{
                      color: theme.colors.semantic.error,
                      border: `1px solid ${theme.colors.semantic.error}40`
                    }}
                  >
                    <LogOut size={16} />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/admin-login" onClick={() => setIsOpen(false)}>
                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium transition-all mx-4"
                      style={{
                        color: theme.colors.primary.electric,
                        border: `1px solid ${theme.colors.primary.electric}40`
                      }}
                    >
                      {t('nav.admin')}
                    </button>
                  </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)}>
                    <button
                      className="w-full px-6 py-2 rounded-lg font-medium text-white transition-all mx-4"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary.electric}, ${theme.colors.primary.purple})`
                      }}
                    >
                      {t('nav.getStarted')}
                    </button>
            </Link>
                </>
              )}
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
