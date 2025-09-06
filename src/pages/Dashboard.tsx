import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Megaphone, TrendingUp, Plus, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              +12 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +5 desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-success">
              +18% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.2M</div>
            <p className="text-xs text-success">
              +25% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Gestão de Estoque
            </CardTitle>
            <CardDescription>
              Gerencie todos os veículos do seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Ver Estoque Completo
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Adicionar Veículo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-info" />
              Anúncios
            </CardTitle>
            <CardDescription>
              Publique e gerencie seus anúncios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Ver Anúncios
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Criar Anúncio
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Vendas
            </CardTitle>
            <CardDescription>
              Acompanhe suas vendas e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Ver Vendas
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}