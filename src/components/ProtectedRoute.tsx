import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAdmin, roleLoading } = useAuth();
  const location = useLocation();

  if (loading || (requireAdmin && roleLoading)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
