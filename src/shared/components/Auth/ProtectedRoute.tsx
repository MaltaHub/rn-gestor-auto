import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext, usePermissions } from '../../contexts/SupabaseContext';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  requiredRoles?: string[];
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Componente para proteger rotas com base em autenticação e permissões
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const { hasRole, hasAnyRole, hasPermission, profile } = usePermissions();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verificar se requer autenticação
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Se não requer autenticação, renderizar children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Verificar role específica
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <AccessDenied 
        message={`Acesso negado. Role necessária: ${requiredRole}`}
        userRole={profile?.role}
      />
    );
  }

  // Verificar múltiplas roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback || (
      <AccessDenied 
        message={`Acesso negado. Roles necessárias: ${requiredRoles.join(', ')}`}
        userRole={profile?.role}
      />
    );
  }

  // Verificar permissão específica
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <AccessDenied 
        message={`Acesso negado. Permissão necessária: ${requiredPermission}`}
        userPermissions={profile?.permissions}
      />
    );
  }

  // Verificar múltiplas permissões
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return fallback || (
        <AccessDenied 
          message={`Acesso negado. Permissões necessárias: ${requiredPermissions.join(', ')}`}
          userPermissions={profile?.permissions}
        />
      );
    }
  }

  // Se passou por todas as verificações, renderizar children
  return <>{children}</>;
}

/**
 * Componente para mostrar mensagem de acesso negado
 */
interface AccessDeniedProps {
  message: string;
  userRole?: string;
  userPermissions?: string[];
}

function AccessDenied({ message, userRole, userPermissions }: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {userRole && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Sua role atual:</strong> {userRole}
              </p>
              {userPermissions && userPermissions.length > 0 && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Suas permissões:</strong> {userPermissions.join(', ')}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook para verificar se o usuário tem acesso a uma funcionalidade
 */
export function useAccessControl() {
  const { isAuthenticated } = useAuthContext();
  const { hasRole, hasAnyRole, hasPermission, profile } = usePermissions();

  const canAccess = (requirements: {
    requireAuth?: boolean;
    requiredRole?: string;
    requiredRoles?: string[];
    requiredPermission?: string;
    requiredPermissions?: string[];
  }) => {
    const {
      requireAuth = true,
      requiredRole,
      requiredRoles,
      requiredPermission,
      requiredPermissions
    } = requirements;

    // Verificar autenticação
    if (requireAuth && !isAuthenticated) {
      return false;
    }

    // Verificar role específica
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }

    // Verificar múltiplas roles
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return false;
    }

    // Verificar permissão específica
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }

    // Verificar múltiplas permissões
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasAllPermissions) {
        return false;
      }
    }

    return true;
  };

  return {
    canAccess,
    isAuthenticated,
    profile,
    hasRole,
    hasAnyRole,
    hasPermission
  };
}

/**
 * Componente para renderizar condicionalmente baseado em permissões
 */
interface ConditionalRenderProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  requiredRoles?: string[];
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export function ConditionalRender({
  children,
  requireAuth = true,
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  fallback = null
}: ConditionalRenderProps) {
  const { canAccess } = useAccessControl();

  const hasAccess = canAccess({
    requireAuth,
    requiredRole,
    requiredRoles,
    requiredPermission,
    requiredPermissions
  });

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC para proteger componentes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requirements?: {
    requireAuth?: boolean;
    requiredRole?: string;
    requiredRoles?: string[];
    requiredPermission?: string;
    requiredPermissions?: string[];
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...requirements}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;