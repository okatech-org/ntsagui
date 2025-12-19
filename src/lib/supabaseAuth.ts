import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user';

export const supabaseAuth = {
  // Sign up a new user
  async signUp(email: string, password: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { data, error };
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Check if user has a specific role
  async hasRole(role: UserRole): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role)
      .maybeSingle();

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    return data !== null;
  },

  // Get all user roles
  async getUserRoles(): Promise<UserRole[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data.map(r => r.role as UserRole);
  },

  // Add a role to a user (admin only)
  async addRole(userId: string, role: UserRole) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();

    return { data, error };
  },

  // Remove a role from a user (admin only)
  async removeRole(userId: string, role: UserRole) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    return { error };
  }
};

export default supabaseAuth;
