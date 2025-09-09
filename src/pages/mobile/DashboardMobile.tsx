import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Megaphone, TrendingUp, Plus, BarChart3, Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

export default function DashboardMobile() {
  const { selectedLoja } = useTenant();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Dashboard</h1>
              <p className="text-xs text-muted-foreground">{selectedLoja?.nome || 'Todas as lojas'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards - Grid 2x2 para mobile */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">Estoque</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Megaphone className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Anúncios</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-lg font-bold">R$ 1.2M</div>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Stack vertical para mobile */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Estoque</h3>
                    <p className="text-sm text-muted-foreground">Gerencie veículos</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/estoque-geral">Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-8 w-8 text-info" />
                  <div>
                    <h3 className="font-medium">Anúncios</h3>
                    <p className="text-sm text-muted-foreground">Publique e gerencie</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/anuncios">Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-success" />
                  <div>
                    <h3 className="font-medium">Vendas</h3>
                    <p className="text-sm text-muted-foreground">Acompanhe relatórios</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/vendas">Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vitrine */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-warning" />
                  <div>
                    <h3 className="font-medium">Vitrine</h3>
                    <p className="text-sm text-muted-foreground">Visualize os veículos em destaque</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/vitrine">Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAB - Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" asChild>
            <Link to="/dashboard/estoque-geral/cadastrar">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}