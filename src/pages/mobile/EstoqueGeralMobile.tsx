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
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEstoqueGeral, useEstoqueGeralStats } from '@/hooks/useEstoqueGeral';

export default function EstoqueGeralMobile() {
  const [filtro, setFiltro] = useState("");
  const { data: veiculos = [], isLoading } = useEstoqueGeral(filtro);
  const { data: stats } = useEstoqueGeralStats();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Estoque Geral</h1>
            <p className="text-xs text-muted-foreground">{veiculos.length} veículos</p>
          </div>
          <Button variant="ghost" size="sm">
            <Filter className="h-5 w-5" />
          </Button>
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
                <h3 className="font-medium mb-2">Nenhum veículo encontrado</h3>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link to="/dashboard/estoque-geral/cadastrar">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Veículo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            veiculos.map((veiculo) => (
              <Card key={veiculo.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {(veiculo.modelo as any)?.marca || "N/A"} {(veiculo.modelo as any)?.nome || "N/A"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">{veiculo.placa || "N/A"}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        veiculo.estado_venda === "disponivel" ? "bg-success/10 text-success" :
                        veiculo.estado_venda === "reservado" ? "bg-warning/10 text-warning" :
                        veiculo.estado_venda === "vendido" ? "bg-destructive/10 text-destructive" :
                        ""
                      }
                    >
                      {veiculo.estado_venda === "disponivel" ? "Disp." :
                       veiculo.estado_venda === "reservado" ? "Res." :
                       veiculo.estado_venda === "vendido" ? "Vend." :
                       veiculo.estado_venda}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {veiculo.ano_modelo || "N/A"}
                    </div>
                    <div>Cor: {veiculo.cor || "N/A"}</div>
                    <div>KM: {veiculo.hodometro ? `${Number(veiculo.hodometro).toLocaleString()}` : "N/A"}</div>
                    <div className="font-medium text-foreground">
                      {veiculo.preco_venda ? `R$ ${Number(veiculo.preco_venda).toLocaleString()}` : "N/A"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/dashboard/veiculo/${veiculo.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/veiculo/${veiculo.id}/editar`}>
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
            <Link to="/dashboard/estoque-geral/cadastrar">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}