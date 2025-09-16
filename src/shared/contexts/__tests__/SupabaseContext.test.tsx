import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { SupabaseProvider, useSupabaseContext } from '../SupabaseContext';

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
    updateUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Componente de teste para usar o contexto
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateProfile,
    services
  } = useSupabaseContext();

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Yes' : 'No'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
      <button onClick={() => updateProfile({ display_name: 'Test User' })}>Update Profile</button>
      <div data-testid="services">{services ? 'Services available' : 'No services'}</div>
    </div>
  );
};

describe('SupabaseProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial context values', async () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('No');
    expect(screen.getByTestId('services')).toHaveTextContent('Services available');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  it('should handle sign in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {}
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const signInButton = screen.getByText('Sign In');
    
    await act(async () => {
      signInButton.click();
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign up', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {}
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const signUpButton = screen.getByText('Sign Up');
    
    await act(async () => {
      signUpButton.click();
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const signOutButton = screen.getByText('Sign Out');
    
    await act(async () => {
      signOutButton.click();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle password reset', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const resetButton = screen.getByText('Reset Password');
    
    await act(async () => {
      resetButton.click();
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com'
    );
  });

  it('should handle profile update', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const updateButton = screen.getByText('Update Profile');
    
    await act(async () => {
      updateButton.click();
    });

    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      data: { display_name: 'Test User' }
    });
  });

  it('should handle authentication errors', async () => {
    const mockError = { message: 'Invalid credentials' };
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: mockError
    });

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    const signInButton = screen.getByText('Sign In');
    
    await act(async () => {
      try {
        signInButton.click();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  it('should provide vehicle service methods', async () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('services')).toHaveTextContent('Services available');
    });

    // Verificar se os serviços estão disponíveis através do contexto
    const TestServiceComponent = () => {
      const { services } = useSupabaseContext();
      
      React.useEffect(() => {
        if (services) {
          // Testar métodos do serviço de veículos
          services.vehicle.getAll();
          services.vehicle.getById('123');
          services.vehicle.create({ marca: 'Toyota', modelo: 'Corolla' });
          services.vehicle.update('123', { marca: 'Honda' });
          services.vehicle.delete('123');
        }
      }, [services]);

      return <div>Service test</div>;
    };

    render(
      <SupabaseProvider>
        <TestServiceComponent />
      </SupabaseProvider>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('veiculos');
    });
  });

  it('should provide customer service methods', async () => {
    const TestServiceComponent = () => {
      const { services } = useSupabaseContext();
      
      React.useEffect(() => {
        if (services) {
          // Testar métodos do serviço de clientes
          services.customer.getAll();
          services.customer.getById('123');
          services.customer.create({ nome: 'João Silva', email: 'joao@example.com' });
          services.customer.update('123', { nome: 'João Santos' });
          services.customer.delete('123');
        }
      }, [services]);

      return <div>Customer service test</div>;
    };

    render(
      <SupabaseProvider>
        <TestServiceComponent />
      </SupabaseProvider>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('clientes');
    });
  });

  it('should provide ad service methods', async () => {
    const TestServiceComponent = () => {
      const { services } = useSupabaseContext();
      
      React.useEffect(() => {
        if (services) {
          // Testar métodos do serviço de anúncios
          services.ad.getAll();
          services.ad.getById('123');
          services.ad.create({ titulo: 'Vendo Carro', descricao: 'Carro em ótimo estado' });
          services.ad.update('123', { titulo: 'Vendo Carro - Urgente' });
          services.ad.delete('123');
        }
      }, [services]);

      return <div>Ad service test</div>;
    };

    render(
      <SupabaseProvider>
        <TestServiceComponent />
      </SupabaseProvider>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('anuncios');
    });
  });

  it('should throw error when used outside provider', () => {
    // Capturar erro do console
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSupabaseContext must be used within a SupabaseProvider');
    
    consoleSpy.mockRestore();
  });
});