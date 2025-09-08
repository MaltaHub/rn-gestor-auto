import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Car,
  Calendar,
  MapPin 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVeiculosVitrine, useVeiculosVitrineStats } from '@/hooks/useVeiculosVitrine';
import { useTenant } from '@/contexts/TenantContext';
import { PrecoVitrine } from '@/components/PrecoVitrine';

export default function Vitrine() {
  const [filtro, setFiltro] = useState("");
  const { selectedLojaId, selectedLoja } = useTenant();
  const { data: veiculos = [], isLoading } = useVeiculosVitrine(filtro);
  const { data: stats } = useVeiculosVitrineStats();
  if (!selectedLojaId) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vitrine da Loja</h1>
          <p className="text-muted-foreground">
            Veículos da {selectedLoja?.nome} ({veiculos.length} veículos)
          </p>
        </div>
        <Button variant="hero" size="lg" asChild>
          <Link to="/dashboard/estoque-geral">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar à Vitrine
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Car className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.disponiveis || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservados</CardTitle>
            <Car className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.reservados || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendidos (Mês)</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.vendidos || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Use os filtros para encontrar veículos específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por marca, modelo ou placa..."
                className="w-full pl-10"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Veículos na Vitrine</CardTitle>
          <CardDescription>Lista dos veículos na vitrine da loja selecionada</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando veículos...
                  </TableCell>
                </TableRow>
              ) : veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Car className="h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">Nenhum veículo na vitrine</p>
                      <p className="text-sm text-muted-foreground">
                        Adicione veículos à vitrine da {selectedLoja?.nome}
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link to="/dashboard/estoque-geral">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Veículos
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((veiculoLoja) => (
                  <TableRow key={veiculoLoja.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {veiculoLoja.foto_capa && (
                          <div className="w-12 h-8 rounded overflow-hidden">
                            <img
                              src={veiculoLoja.foto_capa}
                              alt="Capa do veículo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="font-medium">
                          {veiculoLoja.veiculo.modelo?.marca || "N/A"} {veiculoLoja.veiculo.modelo?.nome || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {veiculoLoja.veiculo.ano_modelo || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{veiculoLoja.veiculo.cor || "N/A"}</TableCell>
                    <TableCell>
                      {veiculoLoja.veiculo.hodometro ? `${Number(veiculoLoja.veiculo.hodometro).toLocaleString()} km` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <PrecoVitrine 
                        veiculoLojaId={veiculoLoja.id}
                        precoAtual={veiculoLoja.preco}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                          veiculoLoja.veiculo.estado_venda === "disponivel" ? "bg-success/10 text-success" :
                          veiculoLoja.veiculo.estado_venda === "reservado" ? "bg-warning/10 text-warning" :
                          veiculoLoja.veiculo.estado_venda === "vendido" ? "bg-destructive/10 text-destructive" :
                          ""
                        }
                      >
                        {veiculoLoja.veiculo.estado_venda === "disponivel" ? "Disponível" :
                         veiculoLoja.veiculo.estado_venda === "reservado" ? "Reservado" :
                         veiculoLoja.veiculo.estado_venda === "vendido" ? "Vendido" :
                         veiculoLoja.veiculo.estado_venda}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {veiculoLoja.veiculo.local?.nome || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dashboard/veiculo/${veiculoLoja.veiculo.id}`}>
                            Ver
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/veiculo/${veiculoLoja.veiculo.id}/loja/${selectedLojaId}/editar`}>
                            Editar Loja
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}