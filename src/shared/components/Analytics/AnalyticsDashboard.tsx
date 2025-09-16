import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Car, 
  Users, 
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { useSupabaseQuery, useTenantServices } from '@/shared/hooks/useSupabase';
import { useSupabaseContext } from '@/shared/contexts/SupabaseContext';

interface AnalyticsData {
  sales: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  vehicles: {
    total: number;
    available: number;
    sold: number;
    avgPrice: number;
  };
  ads: {
    total: number;
    active: number;
    totalViews: number;
    totalLeads: number;
    conversionRate: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
}

interface ChartData {
  name: string;
  value: number;
  growth?: number;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Último ano' }
];

export const AnalyticsDashboard: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseContext();
  const { vehicle: vehicleService, ad: adService } = useTenantServices();
  
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    sales: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
    vehicles: { total: 0, available: 0, sold: 0, avgPrice: 0 },
    ads: { total: 0, active: 0, totalViews: 0, totalLeads: 0, conversionRate: 0 },
    customers: { total: 0, new: 0, returning: 0 }
  });

  // Queries para dados analíticos
  const {
    data: vehicles,
    loading: vehiclesLoading
  } = useSupabaseQuery({
    table: 'veiculos',
    select: 'id, status, preco, created_at',
    enabled: isAuthenticated
  });

  const {
    data: ads,
    loading: adsLoading
  } = useSupabaseQuery({
    table: 'anuncios',
    select: 'id, ativo, created_at',
    enabled: isAuthenticated
  });

  const {
    data: customers,
    loading: customersLoading
  } = useSupabaseQuery({
    table: 'clientes',
    select: 'id, created_at',
    enabled: isAuthenticated
  });

  // Simular dados de vendas (em produção, viria de uma tabela específica)
  const salesData: ChartData[] = [
    { name: 'Jan', value: 45000, growth: 12 },
    { name: 'Fev', value: 52000, growth: 15.5 },
    { name: 'Mar', value: 48000, growth: -7.7 },
    { name: 'Abr', value: 61000, growth: 27.1 },
    { name: 'Mai', value: 55000, growth: -9.8 },
    { name: 'Jun', value: 67000, growth: 21.8 }
  ];

  const topVehicles: ChartData[] = [
    { name: 'Toyota Corolla', value: 12 },
    { name: 'Honda Civic', value: 8 },
    { name: 'Volkswagen Jetta', value: 6 },
    { name: 'Nissan Sentra', value: 5 },
    { name: 'Hyundai HB20', value: 4 }
  ];

  const platformPerformance: ChartData[] = [
    { name: 'OLX', value: 45, growth: 12 },
    { name: 'Webmotors', value: 32, growth: -5 },
    { name: 'Facebook', value: 28, growth: 18 },
    { name: 'Instagram', value: 15, growth: 25 },
    { name: 'Site Próprio', value: 22, growth: 8 }
  ];

  useEffect(() => {
    if (!vehiclesLoading && !adsLoading && !customersLoading) {
      // Processar dados analíticos
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Análise de veículos
      const availableVehicles = vehicles?.filter(v => v.status === 'disponivel').length || 0;
      const soldVehicles = vehicles?.filter(v => v.status === 'vendido').length || 0;
      const avgPrice = vehicles?.length > 0 
        ? vehicles.reduce((sum, v) => sum + v.preco, 0) / vehicles.length 
        : 0;

      // Análise de anúncios
      const activeAds = ads?.filter(a => a.ativo).length || 0;
      
      // Simular métricas de visualizações e leads
      const totalViews = (ads?.length || 0) * 150; // Média de 150 views por anúncio
      const totalLeads = (ads?.length || 0) * 8; // Média de 8 leads por anúncio
      const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      // Análise de clientes
      const newCustomers = customers?.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length || 0;

      setAnalyticsData({
        sales: {
          total: 285000, // Simulado
          thisMonth: 67000,
          lastMonth: 55000,
          growth: 21.8
        },
        vehicles: {
          total: vehicles?.length || 0,
          available: availableVehicles,
          sold: soldVehicles,
          avgPrice
        },
        ads: {
          total: ads?.length || 0,
          active: activeAds,
          totalViews,
          totalLeads,
          conversionRate
        },
        customers: {
          total: customers?.length || 0,
          new: newCustomers,
          returning: (customers?.length || 0) - newCustomers
        }
      });

      setLoading(false);
    }
  }, [vehicles, ads, customers, vehiclesLoading, adsLoading, customersLoading]);

  const handleExportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório...');
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você precisa estar autenticado para visualizar os analytics.
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(analyticsData.sales.total)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.sales.growth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={analyticsData.sales.growth > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.sales.growth)}%
              </span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos em Estoque</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.vehicles.available}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.vehicles.sold} vendidos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.ads.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.ads.totalLeads} leads de {analyticsData.ads.totalViews} visualizações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.new}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.customers.total} clientes totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes análises */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Vendas</CardTitle>
                <CardDescription>
                  Vendas mensais nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0
                          }).format(item.value)}
                        </span>
                        {item.growth && (
                          <Badge 
                            variant={item.growth > 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {item.growth > 0 ? '+' : ''}{item.growth}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Vendas</CardTitle>
                <CardDescription>
                  Indicadores principais do período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ticket Médio</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(analyticsData.vehicles.avgPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Veículos Vendidos</span>
                    <span className="font-bold">{analyticsData.vehicles.sold}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                    <span className="font-bold">{analyticsData.ads.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Médio de Venda</span>
                    <span className="font-bold">23 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Veículos Mais Vendidos</CardTitle>
                <CardDescription>
                  Top 5 modelos por quantidade de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVehicles.map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{vehicle.name}</span>
                      </div>
                      <Badge variant="outline">{vehicle.value} vendas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Estoque</CardTitle>
                <CardDescription>
                  Distribuição atual dos veículos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Disponíveis</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-bold">{analyticsData.vehicles.available}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vendidos</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="font-bold">{analyticsData.vehicles.sold}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Em Manutenção</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="font-bold">3</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reservados</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span className="font-bold">2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Plataforma</CardTitle>
                <CardDescription>
                  Leads gerados por plataforma de anúncio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformPerformance.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{platform.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{platform.value} leads</span>
                        {platform.growth && (
                          <Badge 
                            variant={platform.growth > 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {platform.growth > 0 ? '+' : ''}{platform.growth}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Marketing</CardTitle>
                <CardDescription>
                  Indicadores de performance dos anúncios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Anúncios Ativos</span>
                    <span className="font-bold">{analyticsData.ads.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Visualizações</span>
                    <span className="font-bold">{analyticsData.ads.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Leads Gerados</span>
                    <span className="font-bold">{analyticsData.ads.totalLeads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo por Lead</span>
                    <span className="font-bold">R$ 45,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Clientes</CardTitle>
                <CardDescription>
                  Distribuição e comportamento dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Novos Clientes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-bold">{analyticsData.customers.new}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Clientes Recorrentes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="font-bold">{analyticsData.customers.returning}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Retenção</span>
                    <span className="font-bold">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Satisfação Média</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">4.7</span>
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem dos Clientes</CardTitle>
                <CardDescription>
                  Como os clientes chegaram até você
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Indicação</span>
                    <Badge variant="outline">35%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Redes Sociais</span>
                    <Badge variant="outline">28%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Busca Online</span>
                    <Badge variant="outline">22%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Anúncios</span>
                    <Badge variant="outline">15%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;