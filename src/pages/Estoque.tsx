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

// Mock data para veículos
const mockVeiculos = [
  {
    id: "1",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2023,
    cor: "Prata",
    km: 15000,
    preco: 95000,
    status: "disponivel",
    local: "Loja Centro"
  },
  {
    id: "2",
    marca: "Honda",
    modelo: "Civic",
    ano: 2022,
    cor: "Preto",
    km: 25000,
    preco: 88000,
    status: "reservado",
    local: "Loja Norte"
  },
  {
    id: "3",
    marca: "Volkswagen",
    modelo: "Jetta",
    ano: 2023,
    cor: "Branco",
    km: 8000,
    preco: 102000,
    status: "disponivel",
    local: "Loja Centro"
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "disponivel":
      return <Badge variant="secondary" className="bg-success/10 text-success">Disponível</Badge>;
    case "reservado":
      return <Badge variant="secondary" className="bg-warning/10 text-warning">Reservado</Badge>;
    case "vendido":
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Vendido</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Estoque() {
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
            <div className="text-2xl font-bold">245</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Car className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">198</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservados</CardTitle>
            <Car className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">32</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendidos (Mês)</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15</div>
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
              {mockVeiculos.map((veiculo) => (
                <TableRow key={veiculo.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">
                      {veiculo.marca} {veiculo.modelo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {veiculo.ano}
                    </div>
                  </TableCell>
                  <TableCell>{veiculo.cor}</TableCell>
                  <TableCell>{veiculo.km.toLocaleString()} km</TableCell>
                  <TableCell className="font-medium">
                    R$ {veiculo.preco.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(veiculo.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {veiculo.local}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}