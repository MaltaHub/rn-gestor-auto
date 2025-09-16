import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Eye,
  MessageSquare,
  Car,
  DollarSign,
  Clock,
  UserCheck,
  UserX,
  Download,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupabaseQuery, useTenantServices } from '@/shared/hooks/useSupabase';
import { useSupabaseContext } from '@/shared/contexts/SupabaseContext';
import { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['clientes']['Row'];
type CustomerInsert = Database['public']['Tables']['clientes']['Insert'];
type CustomerUpdate = Database['public']['Tables']['clientes']['Update'];

interface CustomerWithStats extends Customer {
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Date;
  vehiclesPurchased: number;
  averageRating: number;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
}

interface CustomerFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_nascimento?: string;
  observacoes?: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
}

const CUSTOMER_TYPES = [
  { value: 'pessoa_fisica', label: 'Pessoa Física' },
  { value: 'pessoa_juridica', label: 'Pessoa Jurídica' }
];

const CUSTOMER_STATUS = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-500' },
  { value: 'vip', label: 'VIP', color: 'bg-yellow-500' },
  { value: 'blocked', label: 'Bloqueado', color: 'bg-red-500' }
];

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const CustomerManager: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseContext();
  const { customer: customerService } = useTenantServices();
  
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState<CustomerFormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    data_nascimento: '',
    observacoes: '',
    tipo: 'pessoa_fisica'
  });

  // Query para buscar clientes
  const {
    data: customersData,
    loading: customersLoading,
    refetch: refetchCustomers
  } = useSupabaseQuery({
    table: 'clientes',
    select: '*',
    enabled: isAuthenticated
  });

  // Simular dados estatísticos dos clientes
  useEffect(() => {
    if (customersData) {
      const customersWithStats: CustomerWithStats[] = customersData.map(customer => ({
        ...customer,
        totalPurchases: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 500000) + 50000,
        lastPurchase: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
        vehiclesPurchased: Math.floor(Math.random() * 5) + 1,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        status: ['active', 'inactive', 'vip', 'blocked'][Math.floor(Math.random() * 4)] as CustomerWithStats['status']
      }));
      setCustomers(customersWithStats);
    }
  }, [customersData]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.telefone?.includes(searchTerm) ||
                         customer.cpf_cnpj?.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    const matchesType = selectedType === 'all' || customer.tipo === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      data_nascimento: '',
      observacoes: '',
      tipo: 'pessoa_fisica'
    });
  };

  const handleCreateCustomer = async () => {
    if (!formData.nome || !formData.email || !formData.telefone) return;

    setLoading(true);
    try {
      const customerData: CustomerInsert = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        data_nascimento: formData.data_nascimento || null,
        observacoes: formData.observacoes,
        tipo: formData.tipo
      };

      await customerService.create(customerData);
      await refetchCustomers();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer || !formData.nome || !formData.email || !formData.telefone) return;

    setLoading(true);
    try {
      const customerData: CustomerUpdate = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        data_nascimento: formData.data_nascimento || null,
        observacoes: formData.observacoes,
        tipo: formData.tipo
      };

      await customerService.update(selectedCustomer.id, customerData);
      await refetchCustomers();
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    setLoading(true);
    try {
      await customerService.delete(customerId);
      await refetchCustomers();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setFormData({
      nome: customer.nome,
      email: customer.email || '',
      telefone: customer.telefone || '',
      cpf_cnpj: customer.cpf_cnpj || '',
      endereco: customer.endereco || '',
      cidade: customer.cidade || '',
      estado: customer.estado || '',
      cep: customer.cep || '',
      data_nascimento: customer.data_nascimento || '',
      observacoes: customer.observacoes || '',
      tipo: customer.tipo
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: CustomerWithStats['status']) => {
    const statusConfig = CUSTOMER_STATUS.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCPFCNPJ = (value: string) => {
    if (!value) return '';
    if (value.length <= 11) {
      // CPF
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você precisa estar autenticado para gerenciar clientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe o relacionamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do cliente
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'pessoa_fisica' | 'pessoa_juridica' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">{formData.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                    placeholder={formData.tipo === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    placeholder="Nome da cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map(estado => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais sobre o cliente"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCustomer} disabled={loading || !formData.nome || !formData.email || !formData.telefone}>
                  {loading ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter(c => c.status === 'active').length} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.status === 'vip').length}</div>
            <p className="text-xs text-muted-foreground">
              {((customers.filter(c => c.status === 'vip').length / customers.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(customers.reduce((sum, c) => sum + c.averageRating, 0) / customers.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em {customers.length} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {CUSTOMER_STATUS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {CUSTOMER_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {customersLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Carregando clientes...</p>
            </CardContent>
          </Card>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Cadastre seu primeiro cliente para começar'
                  }
                </p>
                {!searchTerm && selectedStatus === 'all' && selectedType === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.nome}</CardTitle>
                      <CardDescription className="mt-1">
                        {customer.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.telefone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.telefone}</span>
                          </div>
                        )}
                        {customer.cidade && customer.estado && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{customer.cidade}, {customer.estado}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(customer.status)}
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{customer.averageRating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatCurrency(customer.totalSpent)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="h-3 w-3" />
                      <span>{customer.vehiclesPurchased} veículos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Última compra: {customer.lastPurchase ? format(customer.lastPurchase, 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'}</span>
                    </div>
                    {customer.cpf_cnpj && (
                      <span>{formatCPFCNPJ(customer.cpf_cnpj)}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(customer)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o cliente "{customer.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'pessoa_fisica' | 'pessoa_juridica' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone *</Label>
              <Input
                id="edit-telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cpf_cnpj">{formData.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</Label>
              <Input
                id="edit-cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                placeholder={formData.tipo === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-data_nascimento">Data de Nascimento</Label>
              <Input
                id="edit-data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-endereco">Endereço</Label>
              <Input
                id="edit-endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cidade">Cidade</Label>
              <Input
                id="edit-cidade"
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                placeholder="Nome da cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map(estado => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cep">CEP</Label>
              <Input
                id="edit-cep"
                value={formData.cep}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Textarea
                id="edit-observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre o cliente"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedCustomer(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleEditCustomer} disabled={loading || !formData.nome || !formData.email || !formData.telefone}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas e histórico do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                    <p className="text-sm">{selectedCustomer.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="text-sm">{selectedCustomer.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedCustomer.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                    <p className="text-sm">{selectedCustomer.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{selectedCustomer.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</Label>
                    <p className="text-sm">{selectedCustomer.cpf_cnpj ? formatCPFCNPJ(selectedCustomer.cpf_cnpj) : 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                    <p className="text-sm">{selectedCustomer.data_nascimento ? format(new Date(selectedCustomer.data_nascimento), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                    <p className="text-sm">
                      {[selectedCustomer.endereco, selectedCustomer.cidade, selectedCustomer.estado, selectedCustomer.cep]
                        .filter(Boolean)
                        .join(', ') || 'Não informado'}
                    </p>
                  </div>
                  {selectedCustomer.observacoes && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                      <p className="text-sm">{selectedCustomer.observacoes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Histórico de interações em desenvolvimento</p>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Gasto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Veículos Comprados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedCustomer.vehiclesPurchased}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avaliação Média</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl font-bold">{selectedCustomer.averageRating}</div>
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Última Compra</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {selectedCustomer.lastPurchase 
                          ? format(selectedCustomer.lastPurchase, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Nunca'
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManager;