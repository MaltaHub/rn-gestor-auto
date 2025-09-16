import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Car, 
  Calendar, 
  Gauge, 
  Palette, 
  MapPin,
  DollarSign,
  FileText,
  Star,
  Plus
} from 'lucide-react';
import { useVeiculo, useVeiculoFotos } from '@/hooks/useVeiculo';
import { PhotoGallery } from '@/components/PhotoGallery';

export default function VerVeiculo() {
  const { id } = useParams<{ id: string }>();
  const { data: veiculo, isLoading: isLoadingVeiculo } = useVeiculo(id!);
  const { data: fotos = [], isLoading: isLoadingFotos } = useVeiculoFotos(id!);

  if (isLoadingVeiculo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/estoque-geral">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48"></div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-muted rounded animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/estoque-geral">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
        </div>
      </div>
    );
  }

  const modelo = veiculo.modelo as any;
  const caracteristicas = veiculo.caracteristicas_veiculos as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/estoque-geral">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {modelo?.marca} {modelo?.nome}
            </h1>
            <p className="text-muted-foreground">
              {veiculo.placa} • {veiculo.ano_modelo}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/veiculo/${id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Criar Anúncio
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photos */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Fotos do Veículo
              </CardTitle>
              <CardDescription>
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''} disponível{fotos.length !== 1 ? 'eis' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={fotos} />
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-mono font-medium">{veiculo.placa}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ano</p>
                    <p className="font-medium">{veiculo.ano_modelo}/{veiculo.ano_fabricacao}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-medium">{veiculo.cor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quilometragem</p>
                    <p className="font-medium">
                      {veiculo.quilometragem ? `${Number(veiculo.quilometragem).toLocaleString()} km` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
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
                </div>

                {veiculo.preco_venda && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Preço de Venda</span>
                    <span className="font-bold text-lg text-primary">
                      R$ {Number(veiculo.preco_venda).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Model Details */}
          {modelo && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Detalhes do Modelo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Marca</p>
                    <p className="font-medium">{modelo.marca}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Modelo</p>
                    <p className="font-medium">{modelo.nome}</p>
                  </div>
                  {modelo.edicao && (
                    <div>
                      <p className="text-muted-foreground">Edição</p>
                      <p className="font-medium">{modelo.edicao}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Combustível</p>
                    <p className="font-medium">{modelo.combustivel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carroceria</p>
                    <p className="font-medium">{modelo.carroceria}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Portas</p>
                    <p className="font-medium">{modelo.portas || 'N/A'}</p>
                  </div>
                  {modelo.motor && (
                    <div>
                      <p className="text-muted-foreground">Motor</p>
                      <p className="font-medium">{modelo.motor}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Câmbio</p>
                    <p className="font-medium">{modelo.tipo_cambio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Characteristics */}
          {caracteristicas && caracteristicas.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {caracteristicas.map((item: any) => (
                    <Badge key={item.caracteristica_id} variant="outline">
                      {item.caracteristicas?.nome}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          {veiculo.observacao && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{veiculo.observacao}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}