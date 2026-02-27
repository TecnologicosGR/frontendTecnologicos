import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Loader2, ShieldX } from 'lucide-react';

/**
 * PermissionGuard — wraps a route to enforce permission checks.
 *
 * Usage in App.jsx:
 *   <Route element={<PermissionGuard permission="productos:leer" />}>
 *     <Route path="products" element={<ProductsPage />} />
 *   </Route>
 *
 * Props:
 *   permission   {string}    A single permission code to check.
 *   anyOf        {string[]}  Allow if user has ANY of these permissions.
 *   adminOnly    {boolean}   Only ADMIN / SUPERADMIN can access.
 *   children     {ReactNode} Override: render children directly instead of <Outlet />.
 */
import { Outlet } from 'react-router-dom';

export default function PermissionGuard({ permission, anyOf, adminOnly, children }) {
  const { user, isLoading, isAdmin, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  // While the auth context is still booting, show spinner
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check access
  let allowed = false;
  if (adminOnly) {
    allowed = isAdmin();
  } else if (permission) {
    allowed = hasPermission(permission);
  } else if (anyOf) {
    allowed = hasAnyPermission(anyOf);
  } else {
    allowed = true; // No restriction specified → allow authenticated users
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <ShieldX className="h-14 w-14 text-red-400" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Acceso restringido</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
