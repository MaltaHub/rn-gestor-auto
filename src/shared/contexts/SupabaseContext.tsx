import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { createTenantServices, TenantServices } from '../services/supabase.service';
import type { Profile } from '../types/database';

/**
 * Interface para o contexto do Supabase
 */
interface SupabaseContextType {
  // Autenticação
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  
  // Serviços
  services: TenantServices | null;
  
  // Métodos de autenticação
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Métodos de perfil
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Estado da aplicação
  isAuthenticated: boolean;
  tenantId: string | null;
  isOnline: boolean;
}

/**
 * Contexto do Supabase
 */
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

/**
 * Props do provider
 */
interface SupabaseProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto Supabase
 */
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Estados de autenticação
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados da aplicação
  const [services, setServices] = useState<TenantServices | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Computed values
  const isAuthenticated = !!user;
  const tenantId = profile?.tenant_id || null;

  /**
   * Carrega o perfil do usuário
   */
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se o perfil não existe, criar um básico
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || null,
              avatar_url: user?.user_metadata?.avatar_url || null,
              role: 'viewer',
              permissions: [],
              is_active: true
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile as Profile);
        } else {
          throw error;
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    }
  };

  /**
   * Inicializa os serviços com tenant
   */
  const initializeServices = (tenantId: string) => {
    const tenantServices = createTenantServices(tenantId);
    setServices(tenantServices);
  };

  /**
   * Verifica status da conexão
   */
  const checkConnection = async () => {
    try {
      await supabase.from('profiles').select('id').limit(1);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    }
  };

  // Efeito para inicialização
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Obter sessão inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Carregar perfil se usuário autenticado
          if (session?.user) {
            await loadProfile(session.user.id);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erro na inicialização');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setServices(null);
          setError(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar conexão inicial
    checkConnection();

    // Verificar conexão periodicamente
    const connectionInterval = setInterval(checkConnection, 30000);

    // Listeners de rede
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(connectionInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Efeito para inicializar serviços quando tenant muda
  useEffect(() => {
    if (tenantId) {
      initializeServices(tenantId);
    } else {
      setServices(null);
    }
  }, [tenantId]);

  /**
   * Métodos de autenticação
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Métodos de perfil
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as Profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  /**
   * Valor do contexto
   */
  const contextValue: SupabaseContextType = {
    // Autenticação
    user,
    session,
    profile,
    loading,
    error,
    
    // Serviços
    services,
    
    // Métodos de autenticação
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Métodos de perfil
    updateProfile,
    refreshProfile,
    
    // Estado da aplicação
    isAuthenticated,
    tenantId,
    isOnline
  };

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook para usar o contexto do Supabase
 */
export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabaseContext deve ser usado dentro de um SupabaseProvider');
  }
  
  return context;
}

/**
 * Hook para acessar apenas os serviços
 */
export function useServices() {
  const { services } = useSupabaseContext();
  return services;
}

/**
 * Hook para acessar apenas dados de autenticação
 */
export function useAuthContext() {
  const {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    isAuthenticated
  } = useSupabaseContext();
  
  return {
    user,
    session,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    isAuthenticated
  };
}

/**
 * Hook para verificar permissões
 */
export function usePermissions() {
  const { profile } = useSupabaseContext();
  
  const hasPermission = (permission: string) => {
    if (!profile) return false;
    return profile.permissions?.includes(permission) || profile.role === 'admin';
  };
  
  const hasRole = (role: string) => {
    if (!profile) return false;
    return profile.role === role;
  };
  
  const hasAnyRole = (roles: string[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };
  
  return {
    profile,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isEmployee: profile?.role === 'employee',
    isViewer: profile?.role === 'viewer'
  };
}

export default SupabaseProvider;