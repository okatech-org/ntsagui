import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Shield, Sun, Moon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/styles/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabaseAuth } from "@/lib/supabaseAuth";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const themeStyles = useThemeStyles();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.solutions'), path: "/solutions" },
    { name: "Tarifs", path: "/pricing" },
    { name: t('nav.about'), path: "/about" },
    { name: "Docs", path: "/documentation" },
    { name: t('nav.contact'), path: "/contact" },
  ];

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    navigate("/");
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      style={{
        background: isScrolled
          ? (isDark ? `${theme.colors.primary.dark}E6` : '#FFFFFFE6')
          : 'transparent',
        borderBottom: isScrolled ? `1px solid ${theme.colors.primary.electric}20` : 'none'
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
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={logoNtsagui} alt="Logo" className="w-full h-full object-contain" />
              </motion.div>
              <span
                className="text-xl font-bold hidden sm:inline-block"
                style={{ color: isDark ? theme.colors.text.primary : '#1A1A1A' }}
              >
                NTSAGUI
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all relative group block"
                  style={{
                    color: isActive(item.path)
                      ? theme.colors.primary.electric
                      : isDark ? theme.colors.text.secondary : '#666666'
                  }}
                >
                  {item.name}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100"
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

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg border transition-all"
              style={{
                borderColor: `${theme.colors.primary.electric}40`,
                color: theme.colors.primary.electric
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <div className="relative">
              <motion.button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg border transition-all"
                style={{
                  borderColor: `${theme.colors.primary.electric}40`,
                  color: theme.colors.primary.electric
                }}
              >
                <Globe size={18} />
              </motion.button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg border overflow-hidden"
                    style={{
                      background: themeStyles.card.background,
                      borderColor: themeStyles.card.border
                    }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setShowLanguageMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                        style={{ color: themeStyles.text.primary }}
                      >
                        <span>{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/admin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{
                      borderColor: theme.colors.primary.electric,
                      color: theme.colors.primary.electric
                    }}
                  >
                    Admin
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ color: themeStyles.text.primary }}
                  >
                    Connexion
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{
                      background: theme.colors.primary.electric,
                      boxShadow: `0 0 20px ${theme.colors.primary.electric}40`
                    }}
                  >
                    Commencer
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            style={{ color: themeStyles.text.primary }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{
              background: themeStyles.backgrounds.primary,
              borderColor: themeStyles.borders.medium
            }}
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium"
                  style={{
                    color: isActive(item.path) ? theme.colors.primary.electric : themeStyles.text.primary
                  }}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-border flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: themeStyles.text.primary }}>Thème</span>
                  <button onClick={toggleTheme} className="p-2 rounded-lg bg-secondary"
                    style={{
                      backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                      color: theme.colors.primary.electric,
                      border: `1px solid ${theme.colors.primary.electric}40`,
                    }}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>

                {/* Mobile Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="w-full p-2 rounded-lg border transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                      color: theme.colors.primary.electric,
                      border: `1px solid ${theme.colors.primary.electric}40`,
                    }}
                  >
                    <Globe size={16} />
                    <span className="text-sm">{language.toUpperCase()}</span>
                  </button>

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
                          <button
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
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" variant="outline">Espace Admin</Button>
                      </Link>
                      <Button onClick={handleLogout} className="w-full" variant="destructive">
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" variant="outline">Connexion</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Commencer gratuitement</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
