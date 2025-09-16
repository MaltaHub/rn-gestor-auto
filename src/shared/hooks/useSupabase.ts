import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  BaseSupabaseService,
  VeiculoService,
  EmpresaService,
  LojaService,
  AnuncioService,
  VeiculoLojaService,
  createTenantServices,
  TenantServices
} from '../services/supabase.service';
import type { ApiResponse, PaginatedResponse, QueryOptions } from '../types/api';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Hook para gerenciar autenticação com Supabase
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao obter sessão');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
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
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
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
  }, []);

  const signOut = useCallback(async () => {
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
  }, []);

  const resetPassword = useCallback(async (email: string) => {
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
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user
  };
}

/**
 * Hook genérico para operações CRUD com Supabase
 */
export function useSupabaseQuery<
  TRow extends Record<string, any>,
  TInsert extends Record<string, any>,
  TUpdate extends Record<string, any>
>(service: BaseSupabaseService<TRow, TInsert, TUpdate>) {
  const [data, setData] = useState<TRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchData = useCallback(async (options: QueryOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.findAll(options);
      
      if (response.success) {
        setData(response.data.items);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages
        });
      } else {
        setError(response.error || 'Erro ao buscar dados');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const create = useCallback(async (newData: TInsert): Promise<ApiResponse<TRow>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.create(newData);
      
      if (response.success) {
        // Atualizar lista local
        setData(prev => [response.data, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      } else {
        setError(response.error || 'Erro ao criar registro');
      }
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        data: {} as TRow
      };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const update = useCallback(async (id: string, updateData: TUpdate): Promise<ApiResponse<TRow>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.update(id, updateData);
      
      if (response.success) {
        // Atualizar lista local
        setData(prev => prev.map(item => 
          item.id === id ? response.data : item
        ));
      } else {
        setError(response.error || 'Erro ao atualizar registro');
      }
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        data: {} as TRow
      };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const remove = useCallback(async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.delete(id);
      
      if (response.success) {
        // Remover da lista local
        setData(prev => prev.filter(item => item.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        setError(response.error || 'Erro ao remover registro');
      }
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        data: false
      };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const findById = useCallback(async (id: string): Promise<ApiResponse<TRow | null>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.findById(id);
      
      if (!response.success) {
        setError(response.error || 'Erro ao buscar registro');
      }
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        data: null
      };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    create,
    update,
    remove,
    findById,
    refresh
  };
}

/**
 * Hook para gerenciar serviços com tenant
 */
export function useTenantServices(tenantId?: string) {
  const services = useMemo(() => {
    if (!tenantId) return null;
    return createTenantServices(tenantId);
  }, [tenantId]);

  return services;
}

/**
 * Hook para subscriptions em tempo real
 */
export function useRealtimeSubscription<T extends Record<string, any>>(
  tableName: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = () => {
      try {
        let channel = supabase
          .channel(`realtime:${tableName}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              filter: filter
            },
            callback
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError('Erro na conexão em tempo real');
            }
          });

        subscription = channel;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao configurar subscription');
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
        setIsConnected(false);
      }
    };
  }, [tableName, callback, filter]);

  return { isConnected, error };
}

/**
 * Hook para upload de arquivos
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false
        });

      if (error) throw error;

      setProgress(100);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setUploading(false);
    }
  }, []);

  const getPublicUrl = useCallback((bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }, []);

  const deleteFile = useCallback(async (bucket: string, paths: string[]) => {
    try {
      setError(null);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
      
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar arquivo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    getPublicUrl,
    deleteFile
  };
}

/**
 * Hook para status da conexão com Supabase
 */
export function useSupabaseConnection() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastPing, setLastPing] = useState<Date | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const start = Date.now();
        await supabase.from('ping').select('*').limit(1);
        const end = Date.now();
        
        setIsOnline(true);
        setLastPing(new Date());
      } catch (err) {
        setIsOnline(false);
      }
    };

    // Verificar conexão inicial
    checkConnection();

    // Verificar conexão a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    // Escutar eventos de rede
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastPing };
}