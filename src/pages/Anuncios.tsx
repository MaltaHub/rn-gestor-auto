import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Plus, 
  Eye, 
  Heart, 
  MessageCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useAnuncios, useAnunciosStats } from '@/hooks/useAnuncios';

export default function Anuncios() {
  const { data: anuncios = [], isLoading } = useAnuncios();
  const { data: stats } = useAnunciosStats();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Anúncios</h1>
          <p className="text-muted-foreground">Publique e acompanhe seus anúncios em múltiplas plataformas</p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Criar Anúncio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anúncios Ativos</CardTitle>
            <Megaphone className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.ativos || 0}</div>
            <p className="text-xs text-muted-foreground">
              +5 esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats?.visualizacoes ? `${Math.floor(stats.visualizacoes / 1000)}k` : "0"}</div>
            <p className="text-xs text-muted-foreground">
              +18% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.favoritos || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.mensagens || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anúncios Grid */}
      {isLoading ? (
        <div className="text-center py-8">Carregando anúncios...</div>
      ) : anuncios.length === 0 ? (
        <div className="text-center py-8">Nenhum anúncio encontrado</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {anuncios.map((anuncio) => {
            const getStatusBadge = (status: string) => {
              switch (status) {
                case "ativo":
                  return <Badge variant="secondary" className="bg-success/10 text-success">Ativo</Badge>;
                case "pausado":
                  return <Badge variant="secondary" className="bg-warning/10 text-warning">Pausado</Badge>;
                case "encerrado":
                  return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Encerrado</Badge>;
                default:
                  return <Badge variant="outline">{status}</Badge>;
              }
            };

            const getPlatformBadge = (plataforma: string) => {
              const colors = {
                "WebMotors": "bg-blue-100 text-blue-700",
                "OLX Autos": "bg-purple-100 text-purple-700",
                "Localiza Seminovos": "bg-green-100 text-green-700",
              };
              
              return (
                <Badge 
                  variant="outline" 
                  className={colors[plataforma as keyof typeof colors] || ""}
                >
                  {plataforma}
                </Badge>
              );
            };

            return (
          <Card key={anuncio.id} className="shadow-card hover:shadow-dropdown transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-2">{anuncio.titulo}</CardTitle>
                {getStatusBadge(anuncio.status)}
              </div>
              <div className="flex justify-between items-center">
                {getPlatformBadge(anuncio.plataforma)}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(anuncio.dataPublicacao).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Veículo Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="font-medium">
                  {anuncio.veiculo.marca} {anuncio.veiculo.modelo} {anuncio.veiculo.ano}
                </div>
                <div className="text-sm text-muted-foreground">
                  {anuncio.veiculo.km.toLocaleString()} km
                </div>
                <div className="text-lg font-bold text-primary mt-1">
                  R$ {anuncio.preco.toLocaleString()}
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {anuncio.visualizacoes}
                  </div>
                  <div className="text-xs text-muted-foreground">Visualizações</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    {anuncio.favoritos}
                  </div>
                  <div className="text-xs text-muted-foreground">Favoritos</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {anuncio.mensagens}
                  </div>
                  <div className="text-xs text-muted-foreground">Mensagens</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Ver Anúncio
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seus anúncios de forma eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Publicar em Múltiplas Plataformas
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Eye className="h-6 w-6 mb-2" />
              Relatório de Performance
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <MessageCircle className="h-6 w-6 mb-2" />
              Central de Mensagens
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}