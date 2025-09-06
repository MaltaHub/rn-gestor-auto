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
import { useVeiculos, useVeiculosStats } from '@/hooks/useVeiculos';

export default function Estoque() {
  const [filtro, setFiltro] = useState("");
  const { data: veiculos = [], isLoading } = useVeiculos(filtro);
  const { data: stats } = useVeiculosStats();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Gerencie todos os veículos disponíveis</p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Veículo
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
          <CardTitle>Veículos em Estoque</CardTitle>
          <CardDescription>Lista completa dos veículos disponíveis</CardDescription>
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
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((veiculo) => (
                  <TableRow key={veiculo.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">
                        {(veiculo.modelo as any)?.marca || "N/A"} {(veiculo.modelo as any)?.nome || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {veiculo.ano_modelo || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{veiculo.cor || "N/A"}</TableCell>
                    <TableCell>{veiculo.hodometro ? `${Number(veiculo.hodometro).toLocaleString()} km` : "N/A"}</TableCell>
                    <TableCell className="font-medium">
                      {veiculo.preco_venda ? `R$ ${Number(veiculo.preco_venda).toLocaleString()}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                          veiculo.estado_venda === "disponivel" ? "bg-success/10 text-success" :
                          veiculo.estado_venda === "reservado" ? "bg-warning/10 text-warning" :
                          veiculo.estado_venda === "vendido" ? "bg-destructive/10 text-destructive" :
                          ""
                        }
                      >
                        {veiculo.estado_venda === "disponivel" ? "Disponível" :
                         veiculo.estado_venda === "reservado" ? "Reservado" :
                         veiculo.estado_venda === "vendido" ? "Vendido" :
                         veiculo.estado_venda}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        Loja Selecionada
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
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