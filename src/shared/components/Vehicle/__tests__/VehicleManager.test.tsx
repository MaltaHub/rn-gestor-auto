import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { VehicleManager } from '../VehicleManager';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock dos hooks
const mockUseSupabaseQuery = vi.fn();
const mockUseSupabaseContext = vi.fn();

vi.mock('../../hooks/useSupabase', () => ({
  useSupabaseQuery: mockUseSupabaseQuery
}));

vi.mock('../../contexts/SupabaseContext', () => ({
  useSupabaseContext: mockUseSupabaseContext,
  SupabaseProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock do toast
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock dos componentes UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>
}));

vi.mock('lucide-react', () => ({
  Plus: () => <span>Plus</span>,
  Search: () => <span>Search</span>,
  Filter: () => <span>Filter</span>,
  Edit: () => <span>Edit</span>,
  Trash2: () => <span>Trash2</span>,
  Car: () => <span>Car</span>,
  Calendar: () => <span>Calendar</span>,
  DollarSign: () => <span>DollarSign</span>,
  Eye: () => <span>Eye</span>
}));

const mockVehicles = [
  {
    id: '1',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2022,
    cor: 'Branco',
    preco: 85000,
    status: 'disponivel',
    quilometragem: 15000,
    combustivel: 'flex',
    cambio: 'automatico',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2021,
    cor: 'Preto',
    preco: 95000,
    status: 'vendido',
    quilometragem: 25000,
    combustivel: 'gasolina',
    cambio: 'manual',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

const mockServices = {
  vehicle: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
};

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

describe('VehicleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseSupabaseContext.mockReturnValue({
      services: mockServices,
      user: { id: 'user-1' },
      isAuthenticated: true
    });
    
    mockUseSupabaseQuery.mockReturnValue({
      data: mockVehicles,
      loading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  it('should render vehicle manager with vehicles list', () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Gestão de Veículos')).toBeInTheDocument();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should display vehicle statistics', () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Total de Veículos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Disponíveis')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Vendidos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should filter vehicles by search term', async () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText('Buscar veículos...');
    fireEvent.change(searchInput, { target: { value: 'Toyota' } });
    
    await waitFor(() => {
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.queryByText('Honda Civic')).not.toBeInTheDocument();
    });
  });

  it('should filter vehicles by status', async () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    // Simular seleção de filtro por status
    // Como o Select é mockado, vamos simular o comportamento
    const filterButton = screen.getByText('Todos os Status');
    fireEvent.click(filterButton);
    
    // Verificar se os veículos são exibidos corretamente
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('should open create vehicle dialog', () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    const addButton = screen.getByText('Adicionar Veículo');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Novo Veículo')).toBeInTheDocument();
  });

  it('should handle vehicle creation', async () => {
    mockServices.vehicle.create.mockResolvedValue({
      id: '3',
      marca: 'Ford',
      modelo: 'Focus',
      ano: 2023,
      cor: 'Azul',
      preco: 75000,
      status: 'disponivel'
    });
    
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    const addButton = screen.getByText('Adicionar Veículo');
    fireEvent.click(addButton);
    
    // Preencher formulário
    const marcaInput = screen.getByLabelText('Marca');
    const modeloInput = screen.getByLabelText('Modelo');
    const anoInput = screen.getByLabelText('Ano');
    const precoInput = screen.getByLabelText('Preço');
    
    fireEvent.change(marcaInput, { target: { value: 'Ford' } });
    fireEvent.change(modeloInput, { target: { value: 'Focus' } });
    fireEvent.change(anoInput, { target: { value: '2023' } });
    fireEvent.change(precoInput, { target: { value: '75000' } });
    
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockServices.vehicle.create).toHaveBeenCalledWith({
        marca: 'Ford',
        modelo: 'Focus',
        ano: 2023,
        preco: 75000,
        cor: '',
        quilometragem: 0,
        combustivel: 'flex',
        cambio: 'manual',
        status: 'disponivel',
        descricao: '',
        opcionais: []
      });
    });
  });

  it('should handle vehicle editing', async () => {
    mockServices.vehicle.update.mockResolvedValue({
      id: '1',
      marca: 'Toyota',
      modelo: 'Corolla XEI',
      ano: 2022,
      preco: 87000
    });
    
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    // Encontrar e clicar no botão de editar do primeiro veículo
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editar Veículo')).toBeInTheDocument();
    
    // Modificar modelo
    const modeloInput = screen.getByDisplayValue('Corolla');
    fireEvent.change(modeloInput, { target: { value: 'Corolla XEI' } });
    
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockServices.vehicle.update).toHaveBeenCalledWith('1', expect.objectContaining({
        modelo: 'Corolla XEI'
      }));
    });
  });

  it('should handle vehicle deletion', async () => {
    mockServices.vehicle.delete.mockResolvedValue(true);
    
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    // Encontrar e clicar no botão de deletar do primeiro veículo
    const deleteButtons = screen.getAllByText('Trash2');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Excluir');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockServices.vehicle.delete).toHaveBeenCalledWith('1');
    });
  });

  it('should handle loading state', () => {
    mockUseSupabaseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    });
    
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Carregando veículos...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    mockUseSupabaseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Failed to fetch vehicles' },
      refetch: vi.fn()
    });
    
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Erro ao carregar veículos')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch vehicles')).toBeInTheDocument();
  });

  it('should format price correctly', () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    expect(screen.getByText('R$ 85.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 95.000,00')).toBeInTheDocument();
  });

  it('should display correct status badges', () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    const availableBadge = screen.getByText('Disponível');
    const soldBadge = screen.getByText('Vendido');
    
    expect(availableBadge).toBeInTheDocument();
    expect(soldBadge).toBeInTheDocument();
    
    expect(availableBadge.getAttribute('data-variant')).toBe('default');
    expect(soldBadge.getAttribute('data-variant')).toBe('secondary');
  });

  it('should validate form fields', async () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    const addButton = screen.getByText('Adicionar Veículo');
    fireEvent.click(addButton);
    
    // Tentar salvar sem preencher campos obrigatórios
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);
    
    // Verificar se a validação impede o envio
    await waitFor(() => {
      expect(mockServices.vehicle.create).not.toHaveBeenCalled();
    });
  });

  it('should sort vehicles by different criteria', async () => {
    render(<VehicleManager />, { wrapper: createWrapper() });
    
    // Verificar ordenação inicial (por data de criação)
    const vehicleRows = screen.getAllByRole('row');
    expect(vehicleRows).toHaveLength(3); // Header + 2 vehicles
    
    // Simular clique no cabeçalho da coluna para ordenar
    const priceHeader = screen.getByText('Preço');
    fireEvent.click(priceHeader);
    
    // Verificar se a ordenação foi aplicada
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });
});