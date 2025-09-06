import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User,
  Car,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useVendas, useVendasStats } from '@/hooks/useVendas';

export default function Vendas() {
  const { data: vendas = [], isLoading } = useVendas();
  const { data: stats } = useVendasStats();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Vendas</h1>
          <p className="text-muted-foreground">Acompanhe todas as vendas e contratos</p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.vendasMes || 0}</div>
            <p className="text-xs text-muted-foreground">
              +18% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats?.faturamento ? `${(stats.faturamento / 1000000).toFixed(1)}M` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +25% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Car className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              R$ {stats?.ticketMedio ? `${(stats.ticketMedio / 1000).toFixed(1)}k` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              +5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <User className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {stats?.comissoes ? `${(stats.comissoes / 1000).toFixed(0)}k` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total a pagar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas em Andamento */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
          <CardDescription>Acompanhe o status das vendas mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Carregando vendas...
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => {
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case "finalizada":
                        return (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Finalizada
                          </Badge>
                        );
                      case "em_andamento":
                        return (
                          <Badge variant="secondary" className="bg-info/10 text-info">
                            <Clock className="mr-1 h-3 w-3" />
                            Em Andamento
                          </Badge>
                        );
                      case "aguardando_documentacao":
                        return (
                          <Badge variant="secondary" className="bg-warning/10 text-warning">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Aguard. Documentação
                          </Badge>
                        );
                      default:
                        return <Badge variant="outline">{status}</Badge>;
                    }
                  };

                  return (
                    <TableRow key={venda.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{venda.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {venda.cliente}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          {venda.veiculo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {venda.valor.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(venda.status)}</TableCell>
                      <TableCell>{venda.vendedor}</TableCell>
                      <TableCell className="font-medium text-success">
                        R$ {venda.comissao.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contratos
            </CardTitle>
            <CardDescription>
              Gerencie contratos e documentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Gerar Contrato
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Visualizar Pendentes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Financeiro
            </CardTitle>
            <CardDescription>
              Controle financeiro e comissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Relatório de Comissões
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Fluxo de Caixa
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-dropdown transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-info" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Análises e métricas de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Performance de Vendas
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Ranking de Vendedores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}