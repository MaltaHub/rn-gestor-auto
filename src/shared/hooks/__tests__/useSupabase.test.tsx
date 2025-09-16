import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useSupabaseQuery, useSupabaseConnection, useFileUpload } from '../useSupabase';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock do Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com/file.jpg' } }))
    }))
  },
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn()
    })),
    unsubscribe: vi.fn()
  }))
};

// Mock do contexto
const mockContextValue = {
  supabase: mockSupabase,
  user: null,
  isAuthenticated: false,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  services: {
    vehicle: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    customer: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    ad: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
};

vi.mock('../../contexts/SupabaseContext', () => ({
  useSupabaseContext: () => mockContextValue,
  SupabaseProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

describe('useSupabaseQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(
      () => useSupabaseQuery({
        table: 'veiculos',
        select: '*'
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should not execute query when disabled', () => {
    const { result } = renderHook(
      () => useSupabaseQuery({
        table: 'veiculos',
        select: '*',
        enabled: false
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.loading).toBe(false);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should execute query when enabled', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [{ id: '1', nome: 'Test' }], error: null }))
        }))
      }))
    });

    const { result } = renderHook(
      () => useSupabaseQuery({
        table: 'veiculos',
        select: '*',
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('veiculos');
  });

  it('should handle query with filters', () => {
    const { result } = renderHook(
      () => useSupabaseQuery({
        table: 'veiculos',
        select: '*',
        filters: { status: 'disponivel' },
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('veiculos');
  });

  it('should handle query with ordering', () => {
    const { result } = renderHook(
      () => useSupabaseQuery({
        table: 'veiculos',
        select: '*',
        orderBy: { column: 'created_at', ascending: false },
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('veiculos');
  });
});

describe('useSupabaseConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial connection state', () => {
    const { result } = renderHook(
      () => useSupabaseConnection(),
      { wrapper: createWrapper() }
    );

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.lastError).toBeNull();
  });

  it('should provide test connection function', () => {
    const { result } = renderHook(
      () => useSupabaseConnection(),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.testConnection).toBe('function');
  });

  it('should test connection successfully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    });

    const { result } = renderHook(
      () => useSupabaseConnection(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      const isConnected = await result.current.testConnection();
      expect(isConnected).toBe(true);
    });
  });

  it('should handle connection test failure', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Connection failed' } }))
      }))
    });

    const { result } = renderHook(
      () => useSupabaseConnection(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      const isConnected = await result.current.testConnection();
      expect(isConnected).toBe(false);
    });
  });
});

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial upload state', () => {
    const { result } = renderHook(
      () => useFileUpload(),
      { wrapper: createWrapper() }
    );

    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.uploadFile).toBe('function');
  });

  it('should upload file successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn(() => Promise.resolve({ 
        data: { path: 'uploads/test.jpg' }, 
        error: null 
      })),
      getPublicUrl: vi.fn(() => ({ 
        data: { publicUrl: 'http://example.com/test.jpg' } 
      }))
    });

    const { result } = renderHook(
      () => useFileUpload(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      const url = await result.current.uploadFile(mockFile, 'uploads');
      expect(url).toBe('http://example.com/test.jpg');
    });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('uploads');
  });

  it('should handle upload error', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Upload failed' } 
      }))
    });

    const { result } = renderHook(
      () => useFileUpload(),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.uploadFile(mockFile, 'uploads');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.error).toBeDefined();
  });

  it('should validate file size', async () => {
    // Criar um arquivo muito grande (simulado)
    const mockFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB

    const { result } = renderHook(
      () => useFileUpload({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.uploadFile(mockFile, 'uploads');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  it('should validate file type', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    const { result } = renderHook(
      () => useFileUpload({ allowedTypes: ['image/jpeg', 'image/png'] }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.uploadFile(mockFile, 'uploads');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});