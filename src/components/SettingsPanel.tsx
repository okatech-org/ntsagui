import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  History,
  Bell,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsPanelProps {
  currentColors: any;
  isDarkMode: boolean;
  onLogout: () => void;
}

export const SettingsPanel = ({
  currentColors,
  isDarkMode,
  onLogout
}: SettingsPanelProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences' | 'history'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: isDarkMode,
    itemsPerPage: 15,
    language: language
  });

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const validatePassword = () => {
    setPasswordError(null);

    if (!passwordForm.current) return t('admin.settings.currentPasswordRequired');
    if (!passwordForm.new) return t('admin.settings.newPasswordRequired');
    if (passwordForm.new.length < 8) return t('admin.settings.passwordLength');
    if (passwordForm.new !== passwordForm.confirm) return t('admin.settings.passwordMismatch');
    if (passwordForm.new === passwordForm.current) return t('admin.settings.passwordSame');

    return null;
  };

  const handlePasswordChange = async () => {
    const error = validatePassword();
    if (error) {
      setPasswordError(error);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordForm({ current: '', new: '', confirm: '' });
      setPasswordSuccess(true);
      toast.success(t('admin.settings.passwordSuccess'));
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(t('admin.settings.passwordError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (key === 'language') {
      setLanguage(value);
    }
    toast.success(t('admin.settings.preferenceUpdated'));
  };

  const tabs = [
    { id: 'profile' as const, label: t('admin.settings.profile'), icon: User },
    { id: 'password' as const, label: t('admin.settings.password'), icon: Lock },
    { id: 'preferences' as const, label: t('admin.settings.preferences'), icon: Globe },
    { id: 'history' as const, label: t('admin.settings.history'), icon: History }
  ];

  const auditLog = [
    { time: '10:45', action: 'Connexion', details: 'admin@okatech.fr' },
    { time: '10:30', action: 'Export leads', details: 'CSV - 15 leads' },
    { time: '10:15', action: 'Mise à jour lead', details: 'Score: 85 → 90' },
    { time: '09:50', action: 'Suppression lead', details: 'ID: lead_12345' },
    { time: '09:30', action: 'Mode modifié', details: 'Sombre → Clair' }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: currentColors.borderColor }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 font-semibold flex items-center gap-2 border-b-2 transition-all"
              style={{
                borderColor: activeTab === tab.id ? '#00D9FF' : 'transparent',
                color: activeTab === tab.id ? '#00D9FF' : currentColors.textMuted
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 space-y-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
              {t('admin.settings.profileInfo')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.fullName')}
                </label>
                <Input
                  value="Administrateur NTSAGUI Digital"
                  disabled
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.email')}
                </label>
                <Input
                  value="admin@okatech.fr"
                  disabled
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.role')}
                </label>
                <Input
                  value="Administrateur"
                  disabled
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.since')}
                </label>
                <Input
                  value="1er Janvier 2025"
                  disabled
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 space-y-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
              {t('admin.settings.changePassword')}
            </h3>

            {passwordError && (
              <div
                className="mb-4 p-4 rounded-lg flex items-center gap-3"
                style={{
                  background: '#EF4444' + '20',
                  borderLeft: '4px solid #EF4444'
                }}
              >
                <AlertCircle size={20} style={{ color: '#EF4444' }} />
                <span style={{ color: '#EF4444' }}>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                className="mb-4 p-4 rounded-lg flex items-center gap-3"
                style={{
                  background: '#10B981' + '20',
                  borderLeft: '4px solid #10B981'
                }}
              >
                <Check size={20} style={{ color: '#10B981' }} />
                <span style={{ color: '#10B981' }}>{t('admin.settings.passwordSuccess')}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.currentPassword')}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('admin.settings.enterPassword')}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="rounded-lg pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.newPassword')}
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t('admin.settings.passwordLength')}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="rounded-lg pr-10"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.confirmPassword')}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('admin.settings.confirmNewPassword')}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="rounded-lg pr-10"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full rounded-lg font-semibold"
                style={{ background: '#00D9FF', color: '#000' }}
              >
                {loading ? t('admin.settings.processing') : t('admin.settings.changePassword')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 space-y-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
              {t('admin.settings.preferences')}
            </h3>

            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentColors.borderColor }}>
                <div className="flex items-center gap-3">
                  <Bell size={20} style={{ color: '#00D9FF' }} />
                  <div>
                    <p className="font-semibold" style={{ color: currentColors.textPrimary }}>{t('admin.settings.notifications')}</p>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>{t('admin.settings.notificationsDesc')}</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentColors.borderColor }}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} style={{ color: '#F59E0B' }} />
                  <div>
                    <p className="font-semibold" style={{ color: currentColors.textPrimary }}>{t('admin.settings.emailAlerts')}</p>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>{t('admin.settings.emailAlertsDesc')}</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => handlePreferenceChange('emailAlerts', e.target.checked)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Language */}
              <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.borderColor }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.language')}
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border font-medium"
                  style={{
                    background: currentColors.bg,
                    borderColor: currentColors.borderColor,
                    color: currentColors.textPrimary
                  }}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div className="p-4 rounded-lg border" style={{ borderColor: currentColors.borderColor }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentColors.textMuted }}>
                  {t('admin.settings.itemsPerPage')}
                </label>
                <select
                  value={preferences.itemsPerPage}
                  onChange={(e) => handlePreferenceChange('itemsPerPage', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border font-medium"
                  style={{
                    background: currentColors.bg,
                    borderColor: currentColors.borderColor,
                    color: currentColors.textPrimary
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6 space-y-6"
          style={{
            background: currentColors.cardBg,
            borderColor: currentColors.borderColor
          }}
        >
          <div>
            <h3 className="text-xl font-bold mb-6" style={{ color: currentColors.textPrimary }}>
              {t('admin.settings.history')}
            </h3>

            <div className="space-y-3">
              {auditLog.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border flex justify-between items-center"
                  style={{ borderColor: currentColors.borderColor }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: currentColors.textPrimary }}>
                      {entry.action}
                    </p>
                    <p className="text-sm" style={{ color: currentColors.textMuted }}>
                      {entry.details}
                    </p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: currentColors.textMuted }}>
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        className="w-full rounded-lg font-semibold mt-6"
        style={{
          background: '#EF4444',
          color: '#FFFFFF'
        }}
      >
        <X size={18} className="mr-2" />
        {t('admin.settings.logout')}
      </Button>
    </div>
  );
};

export default SettingsPanel;
