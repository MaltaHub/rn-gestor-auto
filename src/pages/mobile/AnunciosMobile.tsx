import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Car,
  GitMerge,
  List,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnuncios, useAnunciosStats } from '@/hooks/useAnuncios';
import { useVeiculosOciosos } from '@/hooks/useVeiculosOciosos';
import { useDuplicadosSugestoes } from '@/hooks/useRepetidosSugestoes';
import { cn } from '@/lib/utils';

type TabType = 'ociosos' | 'duplicados' | 'anuncios';

export default function AnunciosMobile() {
  const [activeTab, setActiveTab] = useState<TabType>('ociosos');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: anuncios = [], isLoading: loadingAnuncios } = useAnuncios();
  const { data: ociosos = [], isLoading: loadingOciosos } = useVeiculosOciosos();
  const { data: sugestoes = [], isLoading: loadingSugestoes } = useDuplicadosSugestoes();
  const { data: stats } = useAnunciosStats();

  const filteredAnuncios = anuncios.filter(anuncio => 
    anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anuncio.veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anuncio.veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const renderContent = () => {
    switch (activeTab) {
      case 'ociosos':
        return (
          <div className="space-y-3">
            {loadingOciosos ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando veículos ociosos...
              </div>
            ) : ociosos.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhum veículo ocioso</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos os veículos possuem anúncios ativos!
                  </p>
                </CardContent>
              </Card>
            ) : (
              ociosos.map((v) => (
                <Card key={v.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {v.modelo?.marca} {v.modelo?.nome} {v.ano_modelo}
                        </h3>
                        <p className="text-xs text-muted-foreground">{v.placa} • {v.cor}</p>
                        {v.preco && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            R$ {v.preco.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/dashboard/anuncios/criar">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Anúncio
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 'duplicados':
        return (
          <div className="space-y-3">
            {loadingSugestoes ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando sugestões...
              </div>
            ) : sugestoes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <GitMerge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhuma sugestão</h3>
                  <p className="text-sm text-muted-foreground">
                    Não foram encontrados grupos similares.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sugestoes.map((sugestao, index) => (
                <Card key={`${sugestao.modelo_id}-${index}`} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {sugestao.cor} {sugestao.ano_modelo}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {sugestao.qtd_veiculos} veículos • {sugestao.min_quilometragem?.toLocaleString()} - {sugestao.max_quilometragem?.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/dashboard/anuncios/criar">
                        <GitMerge className="h-4 w-4 mr-2" />
                        Criar Repetido
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 'anuncios':
        return (
          <div className="space-y-3">
            {loadingAnuncios ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando anúncios...
              </div>
            ) : filteredAnuncios.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhum anúncio encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    {anuncios.length === 0 ? 'Crie seu primeiro anúncio' : 'Ajuste os filtros de busca'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAnuncios.map((anuncio) => (
                <Card key={anuncio.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">{anuncio.titulo}</h3>
                        <p className="text-xs text-muted-foreground">
                          {anuncio.veiculo.marca} {anuncio.veiculo.modelo} • {anuncio.plataforma}
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          R$ {anuncio.preco.toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(anuncio.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {anuncio.visualizacoes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {anuncio.favoritos}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {anuncio.mensagens}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Anúncios</h1>
            <p className="text-xs text-muted-foreground">
              {stats?.ativos || 0} ativos • {stats?.visualizacoes ? `${Math.floor(stats.visualizacoes / 1000)}k` : "0"} views
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tabs - Horizontal scroll para mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'ociosos' ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setActiveTab('ociosos')}
          >
            <Car className="h-4 w-4 mr-2" />
            Ociosos ({ociosos.length})
          </Button>
          <Button
            variant={activeTab === 'duplicados' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('duplicados')}
          >
            <GitMerge className="h-4 w-4 mr-1" />
            Duplicados ({sugestoes.length})
          </Button>
          <Button
            variant={activeTab === 'anuncios' ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setActiveTab('anuncios')}
          >
            <List className="h-4 w-4 mr-2" />
            Anúncios ({anuncios.length})
          </Button>
        </div>

        {/* Search - apenas para anúncios */}
        {activeTab === 'anuncios' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar anúncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Content */}
        {renderContent()}

        {/* FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" asChild>
            <Link to="/dashboard/anuncios/criar">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}