import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Car,
  Calendar,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useVeiculosVitrine, useVeiculosVitrineStats } from '@/hooks/useVeiculosVitrine';
import { useTenant } from '@/contexts/TenantContext';
import { PrecoVitrine } from '@/components/PrecoVitrine';

export default function VitrineMobile() {
  const [filtro, setFiltro] = useState("");
  const { selectedLojaId, selectedLoja } = useTenant();
  const { data: veiculos = [], isLoading } = useVeiculosVitrine(filtro);
  const { data: stats } = useVeiculosVitrineStats();
  const navigate = useNavigate();

  if (!selectedLojaId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="shadow-card w-full max-w-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhuma loja selecionada</h3>
              <p className="text-muted-foreground">
                Selecione uma loja para visualizar a vitrine
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Vitrine</h1>
            <p className="text-xs text-muted-foreground">{selectedLoja?.nome} - {veiculos.length} veículos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats - Grid horizontal para mobile */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-success">{stats?.disponiveis || 0}</div>
              <p className="text-xs text-muted-foreground">Disp.</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-warning">{stats?.reservados || 0}</div>
              <p className="text-xs text-muted-foreground">Res.</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-primary">{stats?.vendidos || 0}</div>
              <p className="text-xs text-muted-foreground">Vend.</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por marca, modelo ou placa..."
            className="w-full pl-10"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* Vehicles List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando veículos...
            </div>
          ) : veiculos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Nenhum veículo na vitrine</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione veículos à vitrine da {selectedLoja?.nome}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/estoque-geral">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Veículos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            veiculos.map((veiculoLoja) => (
              <Card key={veiculoLoja.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {veiculoLoja.foto_capa && (
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={veiculoLoja.foto_capa}
                          alt="Capa do veículo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {veiculoLoja.veiculo.modelo?.marca || "N/A"} {veiculoLoja.veiculo.modelo?.nome || "N/A"}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground font-mono">
                          {veiculoLoja.veiculo.placa || "N/A"}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={
                            veiculoLoja.veiculo.estado_venda === "disponivel" ? "bg-success/10 text-success" :
                            veiculoLoja.veiculo.estado_venda === "reservado" ? "bg-warning/10 text-warning" :
                            veiculoLoja.veiculo.estado_venda === "vendido" ? "bg-destructive/10 text-destructive" :
                            ""
                          }
                        >
                          {veiculoLoja.veiculo.estado_venda === "disponivel" ? "Disp." :
                           veiculoLoja.veiculo.estado_venda === "reservado" ? "Res." :
                           veiculoLoja.veiculo.estado_venda === "vendido" ? "Vend." :
                           veiculoLoja.veiculo.estado_venda}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {veiculoLoja.veiculo.ano_modelo || "N/A"}
                    </div>
                    <div>Cor: {veiculoLoja.veiculo.cor || "N/A"}</div>
                    <div>KM: {veiculoLoja.veiculo.hodometro ? `${Number(veiculoLoja.veiculo.hodometro).toLocaleString()}` : "N/A"}</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {veiculoLoja.veiculo.local?.nome || "N/A"}
                    </div>
                  </div>

                  {/* Preço editável */}
                  <div className="mb-3">
                    <PrecoVitrine 
                      veiculoLojaId={veiculoLoja.id}
                      precoAtual={veiculoLoja.preco}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/dashboard/veiculo/${veiculoLoja.veiculo.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/veiculo/${veiculoLoja.veiculo.id}/loja/${selectedLojaId}/editar`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" asChild>
            <Link to="/dashboard/estoque-geral">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}