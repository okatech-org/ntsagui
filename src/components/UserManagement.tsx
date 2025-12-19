import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Mail, Calendar, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface UserManagementProps {
  currentColors: {
    bg: string;
    cardBg: string;
    headerBg: string;
    hoverBg: string;
    borderColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
  isDarkMode: boolean;
}

const UserManagement = ({ currentColors, isDarkMode }: UserManagementProps) => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error("Erreur lors du chargement des utilisateurs");
        return;
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      setProfiles(profilesData || []);
      setUserRoles(rolesData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserRole = (userId: string): string => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return { background: '#EF444420', color: '#EF4444' };
      case 'moderator':
        return { background: '#F59E0B20', color: '#F59E0B' };
      default:
        return { background: '#10B98120', color: '#10B981' };
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'moderator':
        return 'Modérateur';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: currentColors.cardBg,
        borderColor: currentColors.borderColor
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: currentColors.textPrimary }}>
            <Users size={24} className="text-primary" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-sm mt-1" style={{ color: currentColors.textMuted }}>
            {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''} enregistré{profiles.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button
          onClick={fetchUsers}
          disabled={isLoading}
          className="rounded-xl"
          variant="outline"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={32} className="animate-spin text-primary" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 opacity-20" style={{ color: currentColors.textMuted }} />
          <p className="font-medium" style={{ color: currentColors.textMuted }}>
            Aucun utilisateur trouvé
          </p>
          <p className="text-sm mt-1" style={{ color: currentColors.textMuted }}>
            Les nouveaux utilisateurs apparaîtront ici automatiquement
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${currentColors.borderColor}` }}>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                  Utilisateur
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                  Email
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                  Rôle
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: currentColors.textMuted }}>
                  Date d'inscription
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, idx) => {
                const role = getUserRole(profile.user_id);
                const roleStyle = getRoleBadgeStyle(role);

                return (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="transition-all duration-200"
                    style={{ borderBottom: `1px solid ${currentColors.borderColor}` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = currentColors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                            color: '#FFFFFF'
                          }}
                        >
                          {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: currentColors.textPrimary }}>
                            {profile.full_name || 'Nom non défini'}
                          </p>
                          <p className="text-xs" style={{ color: currentColors.textMuted }}>
                            ID: {profile.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: currentColors.textMuted }} />
                        <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                          {profile.email || 'Non défini'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} style={{ color: roleStyle.color }} />
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={roleStyle}
                        >
                          {getRoleLabel(role)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: currentColors.textMuted }} />
                        <span className="text-sm" style={{ color: currentColors.textMuted }}>
                          {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
