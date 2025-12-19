import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabaseAuth } from "@/lib/supabaseAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
}

const ProtectedRoute = ({ children, requiredRole = 'admin' }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (user && requiredRole) {
        const hasRole = await supabaseAuth.hasRole(requiredRole);
        setHasRequiredRole(hasRole);
      } else {
        setHasRequiredRole(false);
      }
      setRoleLoading(false);
    };

    if (!isLoading && isAuthenticated) {
      checkRole();
    } else if (!isLoading) {
      setRoleLoading(false);
    }
  }, [user, isLoading, isAuthenticated, requiredRole]);

  if (isLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (requiredRole && !hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 rounded-lg border border-destructive/20 bg-destructive/5 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-muted-foreground">
            Rôle requis: <span className="font-semibold">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
