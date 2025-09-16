import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSupabaseQuery, useTenantServices } from '@/shared/hooks/useSupabase';
import { useSupabaseContext } from '@/shared/contexts/SupabaseContext';
import { VeiculoRow, EmpresaRow, LojaRow } from '@/shared/types/database';

interface VehicleWithRelations extends VeiculoRow {
  empresa?: EmpresaRow;
  loja?: LojaRow;
  anuncios_count?: number;
  status_display?: string;
}

interface VehicleFormData {
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  combustivel: string;
  preco: number;
  km: number;
  descricao?: string;
  loja_id?: string;
}

const VEHICLE_STATUS = {
  disponivel: { label: 'Disponível', variant: 'default' as const, icon: CheckCircle },
  vendido: { label: 'Vendido', variant: 'secondary' as const, icon: CheckCircle },
  reservado: { label: 'Reservado', variant: 'outline' as const, icon: Clock },
  manutencao: { label: 'Manutenção', variant: 'destructive' as const, icon: AlertCircle }
};

const FUEL_TYPES = [
  'Gasolina',
  'Etanol',
  'Flex',
  'Diesel',
  'GNV',
  'Híbrido',
  'Elétrico'
];

export const VehicleManager: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseContext();
  const { vehicle: vehicleService, store: storeService } = useTenantServices();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithRelations | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cor: '',
    combustivel: 'Flex',
    preco: 0,
    km: 0,
    descricao: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query para buscar veículos
  const {
    data: vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles
  } = useSupabaseQuery({
    table: 'veiculos',
    select: `
      *,
      empresa:empresas(nome),
      loja:lojas(nome),
      anuncios(id)
    `,
    enabled: isAuthenticated
  });

  // Query para buscar lojas
  const {
    data: stores,
    loading: storesLoading
  } = useSupabaseQuery({
    table: 'lojas',
    select: 'id, nome',
    enabled: isAuthenticated
  });

  // Processar dados dos veículos
  const processedVehicles: VehicleWithRelations[] = vehicles?.map(vehicle => ({
    ...vehicle,
    anuncios_count: vehicle.anuncios?.length || 0,
    status_display: VEHICLE_STATUS[vehicle.status as keyof typeof VEHICLE_STATUS]?.label || vehicle.status
  })) || [];

  // Filtrar veículos
  const filteredVehicles = processedVehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.cor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateVehicle = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await vehicleService.create({
        ...formData,
        empresa_id: user?.user_metadata?.empresa_id,
        status: 'disponivel'
      });

      if (error) throw error;

      setIsCreateDialogOpen(false);
      setFormData({
        marca: '',
        modelo: '',
        ano: new Date().getFullYear(),
        cor: '',
        combustivel: 'Flex',
        preco: 0,
        km: 0,
        descricao: ''
      });
      refetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await vehicleService.update(selectedVehicle.id, formData);

      if (error) throw error;

      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      refetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await vehicleService.delete(selectedVehicle.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      refetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir veículo');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (vehicle: VehicleWithRelations) => {
    setSelectedVehicle(vehicle);
    setFormData({
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      cor: vehicle.cor,
      combustivel: vehicle.combustivel,
      preco: vehicle.preco,
      km: vehicle.km,
      descricao: vehicle.descricao || '',
      loja_id: vehicle.loja_id || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (vehicle: VehicleWithRelations) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar autenticado para gerenciar veículos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de veículos da sua empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchVehicles()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do veículo para cadastrá-lo no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ex: Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Corolla"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ano">Ano</Label>
                    <Input
                      id="ano"
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cor">Cor</Label>
                    <Input
                      id="cor"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      placeholder="Ex: Branco"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="combustivel">Combustível</Label>
                  <Select
                    value={formData.combustivel}
                    onValueChange={(value) => setFormData({ ...formData, combustivel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(fuel => (
                        <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="km">Quilometragem</Label>
                    <Input
                      id="km"
                      type="number"
                      value={formData.km}
                      onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                {stores && stores.length > 0 && (
                  <div>
                    <Label htmlFor="loja">Loja</Label>
                    <Select
                      value={formData.loja_id}
                      onValueChange={(value) => setFormData({ ...formData, loja_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>{store.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateVehicle} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por marca, modelo ou cor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(VEHICLE_STATUS).map(([key, status]) => (
                  <SelectItem key={key} value={key}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Veículos ({filteredVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehiclesLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando veículos...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum veículo encontrado com os filtros aplicados.'
                  : 'Nenhum veículo cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>KM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Anúncios</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const statusConfig = VEHICLE_STATUS[vehicle.status as keyof typeof VEHICLE_STATUS];
                  const StatusIcon = statusConfig?.icon || AlertCircle;
                  
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {vehicle.marca} {vehicle.modelo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.cor}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.ano}</TableCell>
                      <TableCell>{vehicle.combustivel}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(vehicle.preco)}
                      </TableCell>
                      <TableCell>
                        {vehicle.km.toLocaleString('pt-BR')} km
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig?.variant || 'secondary'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig?.label || vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {vehicle.anuncios_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(vehicle)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Atualize os dados do veículo selecionado.
            </DialogDescription>
          </DialogHeader>
          {/* Conteúdo similar ao dialog de criação */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateVehicle} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o veículo "{selectedVehicle?.marca} {selectedVehicle?.modelo}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleManager;