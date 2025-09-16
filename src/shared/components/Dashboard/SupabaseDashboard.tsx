import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Users, Car, ShoppingBag, Wifi, WifiOff } from 'lucide-react';
import { useSupabaseContext, useSupabaseConnection } from '@/shared/components/Auth';
import { useSupabaseQuery } from '@/shared/hooks/useSupabase';

interface DashboardStats {
  totalVehicles: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
}

export const SupabaseDashboard: React.FC = () => {
  const { user, isAuthenticated, services } = useSupabaseContext();
  const { isConnected, isReconnecting } = useSupabaseConnection();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query para buscar estatísticas
  const {
    data: vehiclesData,
    loading: vehiclesLoading,
    error: vehiclesError
  } = useSupabaseQuery({
    table: 'veiculos',
    select: 'id',
    enabled: isAuthenticated
  });

  const {
    data: customersData,
    loading: customersLoading
  } = useSupabaseQuery({
    table: 'clientes',
    select: 'id',
    enabled: isAuthenticated
  });

  const {
    data: productsData,
    loading: productsLoading
  } = useSupabaseQuery({
    table: 'produtos',
    select: 'id',
    enabled: isAuthenticated
  });

  const {
    data: ordersData,
    loading: ordersLoading
  } = useSupabaseQuery({
    table: 'pedidos_servico',
    select: 'id',
    enabled: isAuthenticated
  });

  useEffect(() => {
    const allLoading = vehiclesLoading || customersLoading || productsLoading || ordersLoading;
    setLoading(allLoading);

    if (!allLoading) {
      setStats({
        totalVehicles: vehiclesData?.length || 0,
        totalCustomers: customersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0
      });
    }

    if (vehiclesError) {
      setError(vehiclesError.message);
    }
  }, [vehiclesData, customersData, productsData, ordersData, vehiclesLoading, customersLoading, productsLoading, ordersLoading, vehiclesError]);

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Teste de conexão simples
      const { data, error } = await services.vehicle.findAll({ limit: 1 });
      
      if (error) {
        setError(`Erro de conexão: ${error.message}`);
      } else {
        setError(null);
        console.log('✅ Conexão com Supabase funcionando!');
      }
    } catch (err) {
      setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dashboard Supabase
          </CardTitle>
          <CardDescription>
            Faça login para visualizar as estatísticas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Você precisa estar autenticado para acessar os dados do Supabase.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dashboard Supabase
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  {isReconnecting ? 'Reconectando...' : 'Desconectado'}
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Usuário: {user?.email} | Status da integração com Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={handleTestConnection} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalVehicles
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de veículos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalCustomers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de clientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalProducts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de produtos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalOrders
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de pedidos de serviço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Integração</CardTitle>
          <CardDescription>
            Detalhes sobre a configuração do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL do Projeto:</span>
              <span className="font-mono text-xs">
                {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status da Sessão:</span>
              <Badge variant={user ? 'default' : 'secondary'}>
                {user ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Realtime:</span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDashboard;