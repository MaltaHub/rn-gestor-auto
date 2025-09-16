import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/types/database';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client with optimized configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'rn-gestor-auto@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Upload file
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    return data;
  },

  // Get file URL
  getFileUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  },

  // Execute RPC function
  rpc: async <T = any>(functionName: string, params?: Record<string, any>): Promise<T> => {
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data;
  },

  // Batch operations
  batch: {
    insert: async <T>(table: string, records: T[]) => {
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select();
      
      if (error) throw error;
      return data;
    },

    update: async <T>(table: string, updates: Partial<T>, filter: Record<string, any>) => {
      let query = supabase.from(table).update(updates);
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    },

    delete: async (table: string, filter: Record<string, any>) => {
      let query = supabase.from(table).delete();
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { error } = await query;
      if (error) throw error;
    }
  },

  // Real-time subscriptions
  subscribe: {
    table: <T = any>(
      table: string,
      callback: (payload: {
        eventType: 'INSERT' | 'UPDATE' | 'DELETE';
        new: T | null;
        old: T | null;
      }) => void,
      filter?: string
    ) => {
      let channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter
          },
          callback
        );
      
      return channel.subscribe();
    },

    presence: (channel: string, config: {
      track: Record<string, any>;
      onJoin?: (key: string, currentPresences: any, newPresences: any) => void;
      onLeave?: (key: string, currentPresences: any, leftPresences: any) => void;
      onSync?: () => void;
    }) => {
      const presenceChannel = supabase.channel(channel, {
        config: {
          presence: {
            key: config.track.user_id || 'anonymous'
          }
        }
      });

      if (config.onJoin) {
        presenceChannel.on('presence', { event: 'join' }, config.onJoin);
      }

      if (config.onLeave) {
        presenceChannel.on('presence', { event: 'leave' }, config.onLeave);
      }

      if (config.onSync) {
        presenceChannel.on('presence', { event: 'sync' }, config.onSync);
      }

      presenceChannel.track(config.track);
      return presenceChannel.subscribe();
    }
  },

  // Connection status
  getConnectionStatus: () => {
    return supabase.realtime.isConnected();
  },

  // Health check
  healthCheck: async () => {
    try {
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1);
      
      return { healthy: !error, error };
    } catch (error) {
      return { healthy: false, error };
    }
  }
};

// Export types for convenience
export type SupabaseClient = typeof supabase;
export type { Database };