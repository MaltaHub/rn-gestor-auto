import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useSupabaseQuery, useTenantServices } from '@/shared/hooks/useSupabase';
import { useSupabaseContext } from '@/shared/contexts/SupabaseContext';
import { AnuncioRow, VeiculoRow } from '@/shared/types/database';

interface AdWithRelations extends AnuncioRow {
  veiculo?: VeiculoRow;
  views_count?: number;
  leads_count?: number;
  conversion_rate?: number;
}

interface AdFormData {
  titulo: string;
  descricao: string;
  preco: number;
  veiculo_id: string;
  plataforma: string;
  ativo: boolean;
  destaque: boolean;
  tags?: string[];
  data_expiracao?: string;
}

const AD_STATUS = {
  ativo: { label: 'Ativo', variant: 'default' as const, icon: CheckCircle },
  pausado: { label: 'Pausado', variant: 'secondary' as const, icon: Clock },
  expirado: { label: 'Expirado', variant: 'destructive' as const, icon: AlertCircle },
  rascunho: { label: 'Rascunho', variant: 'outline' as const, icon: Edit }
};

const PLATFORMS = [
  { value: 'olx', label: 'OLX', color: '#6C2E9C' },
  { value: 'webmotors', label: 'Webmotors', color: '#FF6B35' },
  { value: 'mercadolivre', label: 'Mercado Livre', color: '#FFE600' },
  { value: 'facebook', label: 'Facebook Marketplace', color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
  { value: 'site_proprio', label: 'Site Próprio', color: '#10B981' }
];

export const AdsManager: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseContext();
  const { ad: adService, vehicle: vehicleService } = useTenantServices();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedAd, setSelectedAd] = useState<AdWithRelations | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AdFormData>({
    titulo: '',
    descricao: '',
    preco: 0,
    veiculo_id: '',
    plataforma: 'olx',
    ativo: true,
    destaque: false,
    tags: [],
    data_expiracao: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query para buscar anúncios
  const {
    data: ads,
    loading: adsLoading,
    error: adsError,
    refetch: refetchAds
  } = useSupabaseQuery({
    table: 'anuncios',
    select: `
      *,
      veiculo:veiculos(
        id,
        marca,
        modelo,
        ano,
        cor,
        preco
      )
    `,
    enabled: isAuthenticated
  });

  // Query para buscar veículos disponíveis
  const {
    data: availableVehicles,
    loading: vehiclesLoading
  } = useSupabaseQuery({
    table: 'veiculos',
    select: 'id, marca, modelo, ano, cor, preco',
    filter: { status: 'disponivel' },
    enabled: isAuthenticated
  });

  // Processar dados dos anúncios
  const processedAds: AdWithRelations[] = ads?.map(ad => {
    // Simular métricas (em produção, viriam de tabelas específicas)
    const views_count = Math.floor(Math.random() * 1000) + 50;
    const leads_count = Math.floor(Math.random() * 20) + 1;
    const conversion_rate = leads_count > 0 ? (leads_count / views_count) * 100 : 0;
    
    return {
      ...ad,
      views_count,
      leads_count,
      conversion_rate
    };
  }) || [];

  // Filtrar anúncios
  const filteredAds = processedAds.filter(ad => {
    const matchesSearch = 
      ad.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.veiculo?.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.veiculo?.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'ativo' && ad.ativo) ||
      (statusFilter === 'pausado' && !ad.ativo) ||
      (statusFilter === 'expirado' && ad.data_expiracao && new Date(ad.data_expiracao) < new Date());
    
    const matchesPlatform = platformFilter === 'all' || ad.plataforma === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Calcular estatísticas
  const stats = {
    totalAds: processedAds.length,
    activeAds: processedAds.filter(ad => ad.ativo).length,
    totalViews: processedAds.reduce((sum, ad) => sum + (ad.views_count || 0), 0),
    totalLeads: processedAds.reduce((sum, ad) => sum + (ad.leads_count || 0), 0),
    avgConversion: processedAds.length > 0 
      ? processedAds.reduce((sum, ad) => sum + (ad.conversion_rate || 0), 0) / processedAds.length 
      : 0
  };

  const handleCreateAd = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await adService.create({
        ...formData,
        autor_id: user?.id,
        empresa_id: user?.user_metadata?.empresa_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setIsCreateDialogOpen(false);
      resetForm();
      refetchAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar anúncio');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAd = async () => {
    if (!selectedAd) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await adService.update(selectedAd.id, {
        ...formData,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setIsEditDialogOpen(false);
      setSelectedAd(null);
      refetchAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar anúncio');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!selectedAd) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await adService.delete(selectedAd.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
      refetchAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir anúncio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ad: AdWithRelations) => {
    try {
      const { error } = await adService.update(ad.id, {
        ativo: !ad.ativo,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      refetchAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      preco: 0,
      veiculo_id: '',
      plataforma: 'olx',
      ativo: true,
      destaque: false,
      tags: [],
      data_expiracao: ''
    });
  };

  const openEditDialog = (ad: AdWithRelations) => {
    setSelectedAd(ad);
    setFormData({
      titulo: ad.titulo,
      descricao: ad.descricao,
      preco: ad.preco,
      veiculo_id: ad.veiculo_id,
      plataforma: ad.plataforma,
      ativo: ad.ativo,
      destaque: ad.destaque || false,
      tags: ad.tags || [],
      data_expiracao: ad.data_expiracao || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (ad: AdWithRelations) => {
    setSelectedAd(ad);
    setIsDeleteDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar autenticado para gerenciar anúncios.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Anúncios</h1>
          <p className="text-muted-foreground">
            Gerencie anúncios em múltiplas plataformas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchAds()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Anúncio</DialogTitle>
                <DialogDescription>
                  Crie um anúncio para promover um veículo em diferentes plataformas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="veiculo">Veículo</Label>
                  <Select
                    value={formData.veiculo_id}
                    onValueChange={(value) => setFormData({ ...formData, veiculo_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles?.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.marca} {vehicle.modelo} {vehicle.ano} - {vehicle.cor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="titulo">Título do Anúncio</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Toyota Corolla 2020 - Impecável"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva as características e diferenciais do veículo..."
                    rows={4}
                  />
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
                    <Label htmlFor="plataforma">Plataforma</Label>
                    <Select
                      value={formData.plataforma}
                      onValueChange={(value) => setFormData({ ...formData, plataforma: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label htmlFor="ativo">Anúncio ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
                    />
                    <Label htmlFor="destaque">Anúncio em destaque</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="data_expiracao">Data de Expiração (opcional)</Label>
                  <Input
                    id="data_expiracao"
                    type="date"
                    value={formData.data_expiracao}
                    onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
                  />
                </div>
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
                <Button onClick={handleCreateAd} disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Anúncio'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Anúncios</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversion.toFixed(1)}%</div>
          </CardContent>
        </Card>
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
                  placeholder="Buscar por título, marca ou modelo..."
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
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="pausado">Pausados</SelectItem>
                <SelectItem value="expirado">Expirados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Anúncios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Anúncios ({filteredAds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando anúncios...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'Nenhum anúncio encontrado com os filtros aplicados.'
                  : 'Nenhum anúncio criado ainda.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anúncio</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Conversão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => {
                  const platform = PLATFORMS.find(p => p.value === ad.plataforma);
                  const isExpired = ad.data_expiracao && new Date(ad.data_expiracao) < new Date();
                  
                  return (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ad.titulo}</div>
                          {ad.destaque && (
                            <Badge variant="secondary" className="mt-1">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ad.veiculo && (
                          <div className="text-sm">
                            {ad.veiculo.marca} {ad.veiculo.modelo}
                            <br />
                            <span className="text-muted-foreground">
                              {ad.veiculo.ano} - {ad.veiculo.cor}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          style={{ borderColor: platform?.color, color: platform?.color }}
                        >
                          {platform?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(ad.preco)}
                      </TableCell>
                      <TableCell>{ad.views_count?.toLocaleString()}</TableCell>
                      <TableCell>{ad.leads_count}</TableCell>
                      <TableCell>{ad.conversion_rate?.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ad.ativo && !isExpired}
                            onCheckedChange={() => handleToggleStatus(ad)}
                            disabled={isExpired}
                          />
                          <Badge 
                            variant={ad.ativo && !isExpired ? 'default' : 'secondary'}
                          >
                            {isExpired ? 'Expirado' : ad.ativo ? 'Ativo' : 'Pausado'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(ad)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(ad)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="h-4 w-4" />
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

      {/* Dialogs de Edição e Exclusão (similares ao de criação) */}
      {/* ... */}
    </div>
  );
};

export default AdsManager;