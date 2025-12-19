import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabaseAuth } from "@/lib/supabaseAuth";
import authService from "@/lib/authService";
import { useAuth } from "@/hooks/useAuth";
import { theme } from "@/styles/theme";
import { motion } from "framer-motion";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const themeStyles = useThemeStyles();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabaseAuth.signUp(email, password);
        
        if (error) {
          setError(error.message);
          toast.error(error.message);
        } else if (data.user) {
          toast.success("Compte créé avec succès! Vous pouvez maintenant vous connecter.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        const { data, error } = await supabaseAuth.signIn(email, password);

        if (data?.session && !error) {
          toast.success("Connexion réussie!");
          navigate("/admin");
        } else {
          // Fallback local (admin embarqué)
          const localAuth = authService.login(email, password);
          if (localAuth) {
            toast.success("Connexion réussie!");
            navigate("/admin");
          } else {
            setError("Email ou mot de passe incorrect");
            toast.error("Erreur de connexion");
          }
        }
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error("Auth error:", err);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: themeStyles.backgrounds.primary }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary.electric}40, transparent 70%)`
          }}
        />
        <div
          className="absolute -bottom-32 right-32 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, #FF8C4240, transparent 70%)`
          }}
        />
      </div>

      {/* Back button - absolute positioning */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-lg transition-all z-50"
        style={{
          background: `${theme.colors.primary.electric}15`,
          border: `1px solid ${theme.colors.primary.electric}40`,
          color: theme.colors.primary.electric
        }}
        whileHover={{ scale: 1.05 }}
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">{t('common.back')}</span>
      </motion.button>

      {/* Main content - Asymmetric layout */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left side - Visual showcase */}
        <motion.div
          className="hidden lg:block relative h-96 lg:h-full min-h-96"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Floating cards */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.electric}, #00D4FF)`,
              boxShadow: `0 10px 40px ${theme.colors.primary.electric}40`
            }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <motion.div
            className="absolute top-32 right-10 w-24 h-24 rounded-full"
            style={{
              background: theme.colors.primary.purple,
              boxShadow: `0 8px 32px ${theme.colors.primary.purple}40`
            }}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          />

          <motion.div
            className="absolute bottom-20 left-1/2 w-40 h-40 rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.purple}40, ${theme.colors.primary.electric}20)`,
              boxShadow: `0 10px 40px ${theme.colors.primary.purple}20`,
              transform: 'translateX(-50%)'
            }}
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{
              background: `${theme.colors.primary.electric}15`,
              border: `1px solid ${theme.colors.primary.electric}40`
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: theme.colors.primary.electric }}
            />
            <span style={{ color: theme.colors.primary.electric }} className="text-sm font-semibold">
              {t('admin.adminDashboard')}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ color: themeStyles.text.primary }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {t('admin.login')}
            <span
              className="block mt-2"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary.electric}, #FF8C42)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              OKA Tech
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg mb-8"
            style={{ color: themeStyles.text.secondary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {t('admin.dashboard')}
          </motion.p>

          {/* Form Container */}
          <motion.div
            className="rounded-2xl border p-8"
            style={{
              background: themeStyles.card.background,
              borderColor: themeStyles.card.border,
              boxShadow: themeStyles.shadows.soft
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <motion.div
                  className="p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    background: themeStyles.isDark ? '#2A0A0A' : '#FFE5E5',
                    borderColor: '#FF4365'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={20} style={{ color: '#FF4365' }} className="flex-shrink-0 mt-0.5" />
                  <p style={{ color: '#FF4365' }} className="text-sm">
                    {t('admin.error')}
                  </p>
                </motion.div>
              )}

              {/* Email field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <label style={{ color: themeStyles.text.primary }} className="text-sm font-semibold block">
                  {t('admin.email')}
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: theme.colors.primary.electric }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@okatech.fr"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all"
                    style={{
                      background: themeStyles.backgrounds.secondary,
                      borderColor: themeStyles.borders.medium,
                      color: themeStyles.text.primary
                    }}
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                <label style={{ color: themeStyles.text.primary }} className="text-sm font-semibold block">
                  {t('admin.password')}
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: theme.colors.primary.electric }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border transition-all"
                    style={{
                      background: themeStyles.backgrounds.secondary,
                      borderColor: themeStyles.borders.medium,
                      color: themeStyles.text.primary
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-all"
                    style={{ color: theme.colors.primary.electric }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.electric}, ${theme.colors.primary.purple})`,
                  boxShadow: `0 0 20px ${theme.colors.primary.electric}50`
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${theme.colors.primary.electric}70` }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                {isLoading || authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-transparent rounded-full animate-spin" 
                      style={{
                        borderTopColor: '#FFFFFF',
                        borderRightColor: '#FFFFFF'
                      }} 
                    />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    {isSignUp ? <UserPlus size={18} /> : <Lock size={18} />}
                    {isSignUp ? "Créer un compte" : t('admin.signin')}
                  </>
                )}
              </motion.button>

              {/* Toggle Sign Up / Sign In */}
              <motion.button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="w-full text-center text-sm transition-colors"
                style={{ color: theme.colors.primary.electric }}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                {isSignUp 
                  ? "Vous avez déjà un compte? Se connecter" 
                  : "Pas encore de compte? Créer un compte"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: themeStyles.borders.light }}>
              <p className="text-xs text-center" style={{ color: themeStyles.text.muted }}>
                Cette page est réservée aux administrateurs OKA Tech
              </p>
              <p className="text-xs text-center mt-2" style={{ color: themeStyles.text.muted }}>
                Pour toute assistance: support@okatech.fr
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
