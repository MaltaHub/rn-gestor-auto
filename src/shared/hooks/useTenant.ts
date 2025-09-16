import { useContext } from 'react';
import { TenantContext } from '../../contexts/TenantContext';
import { Empresa } from '../types/domain';

/**
 * Hook para acessar informações do tenant atual
 * Refatorado para usar a nova arquitetura de tipos
 */
export function useTenant() {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  
  const { tenant, setTenant, loading, error } = context;
  
  return {
    tenant: tenant as Empresa | null,
    setTenant: (newTenant: Empresa | null) => setTenant(newTenant),
    loading,
    error,
    isLoaded: !loading && !error,
    hasTenant: !!tenant,
    tenantId: tenant?.id,
    tenantName: tenant?.nome
  };
}