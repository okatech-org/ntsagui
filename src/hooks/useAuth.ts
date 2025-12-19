import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth, UserRole } from '@/lib/supabaseAuth';

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

  const signOut = async () => {
    await supabaseAuth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    roles,
    hasRole,
    isAdmin,
    isModerator,
    signOut
  };
};
