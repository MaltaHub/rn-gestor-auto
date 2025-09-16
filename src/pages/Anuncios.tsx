import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  Car,
  GitMerge,
  List,
  Search,
  Plus,
  Eye, 
  Heart, 
  MessageCircle,
  ExternalLink,
  Calendar,
  BarChart3,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnuncios, useAnunciosStats } from '@/hooks/useAnuncios';
import { useVeiculosOciosos } from '@/hooks/useVeiculosOciosos';
import { useDuplicadosSugestoes } from '@/hooks/useRepetidosSugestoes';
import { cn } from '@/lib/utils';

type TabType = 'ociosos' | 'duplicados' | 'anuncios';

// Componente para veículos ociosos
function VeiculosOciosossTab() {
  const { data: ociosos = [], isLoading: loadingOciosos } = useVeiculosOciosos();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Veículos Ociosos</h2>
          <p className="text-sm text-muted-foreground">
            {ociosos.length} veículo(s) sem anúncio ativo
          </p>
        </div>
        <Button size="sm" variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Relatório
        </Button>
      </div>

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
              Todos os veículos possuem anúncios ativos. Ótimo trabalho!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ociosos.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {v.modelo?.marca} {v.modelo?.nome} {v.ano_modelo}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Placa: {v.placa}</span>
                      <span>Cor: {v.cor}</span>
                      {v.quilometragem && <span>{v.quilometragem.toLocaleString()} km</span>}
                    </div>
                    {v.preco && (
                      <div className="text-lg font-semibold text-primary mt-2">
                        R$ {v.preco.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/anuncios/criar">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Anúncio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para definição de duplicados
function DuplicadosTab() {
  const { data: sugestoes = [], isLoading } = useDuplicadosSugestoes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sugestões de Duplicados</h2>
          <p className="text-sm text-muted-foreground">
            {sugestoes.length} grupo(s) sugerido(s) para criação
          </p>
        </div>
        <Button size="sm" variant="outline">
          <GitMerge className="h-4 w-4 mr-2" />
          Criar Grupo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando sugestões...
        </div>
      ) : sugestoes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <GitMerge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhuma sugestão disponível</h3>
            <p className="text-sm text-muted-foreground">
              Não foram encontrados grupos de veículos similares para criar duplicados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sugestoes.map((sugestao, index) => (
            <Card key={`${sugestao.modelo_id}-${sugestao.cor}-${sugestao.ano_modelo}-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {sugestao.cor} {sugestao.ano_modelo}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{sugestao.qtd_veiculos} veículos</span>
                      <span>
                        {sugestao.min_quilometragem?.toLocaleString()} - {sugestao.max_quilometragem?.toLocaleString()} km
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Modelo ID: {sugestao.modelo_id}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/anuncios/criar">
                      <GitMerge className="h-4 w-4 mr-2" />
                      Criar Repetido
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para listagem de anúncios
function AnunciosTab() {
  const { data: anuncios = [], isLoading } = useAnuncios();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAnuncios = anuncios.filter(anuncio => {
    const matchesSearch = anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anuncio.veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anuncio.veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || anuncio.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Anúncios</h2>
          <p className="text-sm text-muted-foreground">
            {filteredAnuncios.length} de {anuncios.length} anúncio(s)
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/dashboard/anuncios/criar">
            <Plus className="h-4 w-4 mr-2" />
            Novo Anúncio
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anúncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
          <option value="encerrado">Encerrado</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando anúncios...
        </div>
      ) : filteredAnuncios.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">
              {anuncios.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {anuncios.length === 0 
                ? 'Crie seu primeiro anúncio para começar.' 
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnuncios.map((anuncio) => (
            <Card key={anuncio.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{anuncio.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {anuncio.veiculo.marca} {anuncio.veiculo.modelo} {anuncio.veiculo.ano}
                    </p>
                  </div>
                  {getStatusBadge(anuncio.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plataforma</p>
                    <p className="font-medium">{anuncio.plataforma}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-medium text-primary">R$ {anuncio.preco.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Anuncios() {
  const [activeTab, setActiveTab] = useState<TabType>('ociosos');
  const { data: stats } = useAnunciosStats();

  const tabs = [
    { id: 'ociosos' as TabType, label: 'Veículos Ociosos', icon: Car },
    { id: 'duplicados' as TabType, label: 'Duplicados', icon: GitMerge },
    { id: 'anuncios' as TabType, label: 'Anúncios', icon: List },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ociosos':
        return <VeiculosOciosossTab />;
      case 'duplicados':
        return <DuplicadosTab />;
      case 'anuncios':
        return <AnunciosTab />;
      default:
        return <VeiculosOciosossTab />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Gestão de Anúncios</h1>
          <p className="text-sm text-muted-foreground">
            Publique e acompanhe seus anúncios
          </p>
        </div>

        {/* Stats resumidas */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-success">{stats?.ativos || 0}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-info">{stats?.visualizacoes ? `${Math.floor(stats.visualizacoes / 1000)}k` : "0"}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
        </div>

        {/* Navegação das abas */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                    activeTab === tab.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Ação rápida */}
        <div className="p-4 mt-auto">
          <Button asChild className="w-full">
            <Link to="/dashboard/anuncios/criar">
              <Plus className="h-4 w-4 mr-2" />
              Criar Anúncio
            </Link>
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}