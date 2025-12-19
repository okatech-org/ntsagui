import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Calendar,
  Shield,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import authService from "@/lib/authService";
import { useNavigate } from "react-router-dom";

interface AdminDropdownProps {
  isDarkMode: boolean;
  currentColors: any;
  onSettingsClick?: () => void;
}

export const AdminDropdown = ({
  isDarkMode,
  currentColors,
  onSettingsClick
}: AdminDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    navigate("/admin-login");
  };

  const handleSettings = () => {
    setIsOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: User,
      label: "Profil",
      onClick: handleProfileClick,
      color: "#00D9FF"
    },
    {
      icon: Settings,
      label: "Paramètres",
      onClick: handleSettings,
      color: "#8B5CF6"
    },
    {
      icon: LogOut,
      label: "Déconnexion",
      onClick: handleLogout,
      color: "#EF4444",
      isDangerous: true
    }
  ];

  const profileInfo = [
    { icon: User, label: "Nom", value: "Administrateur OKA Tech" },
    { icon: Mail, label: "Email", value: "admin@okatech.fr" },
    { icon: Shield, label: "Rôle", value: "Administrateur" },
    { icon: Calendar, label: "Depuis", value: "1er Janvier 2025" }
  ];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          style={{
            background: isOpen ? currentColors.hoverBg : 'transparent',
            color: currentColors.textPrimary
          }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ 
              background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)',
              color: '#FFFFFF'
            }}
          >
            A
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold">Admin</p>
            <p className="text-xs" style={{ color: currentColors.textMuted }}>
              admin@okatech.fr
            </p>
          </div>
          <ChevronDown 
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-xl border shadow-lg z-50"
              style={{
                background: currentColors.cardBg,
                borderColor: currentColors.borderColor
              }}
            >
              {/* Header */}
              <div 
                className="px-4 py-3 border-b"
                style={{ borderColor: currentColors.borderColor }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)',
                      color: '#FFFFFF'
                    }}
                  >
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: currentColors.textPrimary }}>
                      Admin
                    </p>
                    <p className="text-xs" style={{ color: currentColors.textMuted }}>
                      admin@okatech.fr
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={index}
                      onClick={item.onClick}
                      className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                      style={{
                        color: currentColors.textPrimary
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = currentColors.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <Icon size={18} style={{ color: item.color }} />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div 
                className="px-4 py-3 border-t text-xs"
                style={{ 
                  background: isDarkMode ? 'rgba(0,217,255,0.05)' : 'rgba(0,217,255,0.1)',
                  borderColor: currentColors.borderColor,
                  color: currentColors.textMuted
                }}
              >
                <p>Version 1.0.0</p>
                <p>© 2025 OKA Tech</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border overflow-hidden flex flex-col"
              style={{
                background: currentColors.cardBg,
                borderColor: currentColors.borderColor,
                maxHeight: 'calc(100vh - 48px)'
              }}
            >
              {/* Profile Content - All Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="rounded-lg transition-all"
                    style={{
                      background: currentColors.hoverBg,
                      color: currentColors.textPrimary,
                      padding: '8px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Header with Gradient Background */}
                <div 
                  className="rounded-xl p-6 mb-6 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,217,255,0.15), rgba(139,92,221,0.15))',
                    border: '1px solid rgba(0,217,255,0.3)'
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl border-3 mx-auto mb-4"
                    style={{ 
                      background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)',
                      color: '#FFFFFF',
                      borderColor: currentColors.cardBg
                    }}
                  >
                    A
                  </div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: currentColors.textPrimary }}>
                    Administrateur OKA Tech
                  </h2>
                  <p className="text-sm" style={{ color: currentColors.textMuted }}>
                    admin@okatech.fr
                  </p>
                </div>

                {/* Title + Subtitle */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold" style={{ color: currentColors.textPrimary }}>
                    Informations du Profil
                  </h3>
                  <p className="text-xs mt-1" style={{ color: currentColors.textMuted }}>
                    Admin Dashboard Access
                  </p>
                </div>

                {/* Info Grid - 2 Columns */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {profileInfo.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg border"
                        style={{
                          background: currentColors.bg,
                          borderColor: currentColors.borderColor
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="p-2 rounded-lg flex-shrink-0"
                            style={{ background: '#00D9FF20' }}
                          >
                            <Icon size={14} style={{ color: '#00D9FF' }} />
                          </div>
                          <p className="text-xs font-semibold" style={{ color: currentColors.textMuted }}>
                            {item.label}
                          </p>
                        </div>
                        <p className="text-xs font-medium pl-7 line-clamp-2" style={{ color: currentColors.textPrimary }}>
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Statistics Section */}
                <div 
                  className="rounded-xl border p-4 mb-6"
                  style={{
                    background: isDarkMode ? 'rgba(0,217,255,0.08)' : 'rgba(0,217,255,0.15)',
                    borderColor: '#00D9FF40'
                  }}
                >
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: currentColors.textMuted }}>
                    Statistiques
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-1" style={{ color: '#00D9FF' }}>
                        15
                      </p>
                      <p className="text-xs" style={{ color: currentColors.textMuted }}>
                        Leads
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>
                        42
                      </p>
                      <p className="text-xs" style={{ color: currentColors.textMuted }}>
                        Actions
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-1" style={{ color: '#8B5CF6' }}>
                        8
                      </p>
                      <p className="text-xs" style={{ color: currentColors.textMuted }}>
                        Jours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                    style={{
                      background: '#00D9FF',
                      color: '#000000'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,217,255,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <Settings size={16} />
                    Éditer
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border text-sm"
                    style={{
                      background: currentColors.bg,
                      color: currentColors.textPrimary,
                      borderColor: currentColors.borderColor
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = currentColors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = currentColors.bg;
                    }}
                  >
                    Fermer
                  </button>
                </div>

                {/* Footer Info */}
                <div 
                  className="text-center py-3 rounded-lg text-xs"
                  style={{
                    background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    color: currentColors.textMuted
                  }}
                >
                  <p className="mb-1">Version 1.0.0</p>
                  <p>© 2025 OKA Tech</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminDropdown;
