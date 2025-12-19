import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth, UserRole } from '@/lib/supabaseAuth';
import authService from '@/lib/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            supabaseAuth.getUserRoles().then(setRoles);
          }, 0);
        } else {
          setRoles([]);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Defer role fetching with setTimeout
      if (session?.user) {
        setTimeout(() => {
          supabaseAuth.getUserRoles().then(setRoles);
        }, 0);
      } else {
        // Fallback: vérifier la session locale admin
        const local = authService.getCurrentUser();
        if (local) {
          // On expose un user minimal compatible (id/email) pour l'app
          // sans forcer un objet Supabase complet
          setUser({
            id: local.id,
            email: local.email,
            user_metadata: { name: local.name, role: local.role },
            app_metadata: {},
            aud: 'authenticated',
            created_at: local.createdAt,
            factors: [],
            identities: [],
            role: 'authenticated',
            confirmed_at: local.createdAt,
            email_confirmed_at: local.createdAt,
            phone_confirmed_at: null,
            phone: '',
            last_sign_in_at: local.createdAt
          } as unknown as User);
          setRoles(['admin']);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => {
    return roles.includes(role);
  };

  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator');

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    roles,
    hasRole,
    isAdmin,
    isModerator
  };
};
