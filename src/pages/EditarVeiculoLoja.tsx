import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Loader2,
  Store
} from 'lucide-react';
import { useVeiculo } from '@/hooks/useVeiculo';
import { useVeiculosLoja, useUpdateVeiculoLoja } from '@/hooks/useVeiculosLoja';
import { useTenant } from '@/contexts/TenantContext';
import { PhotoManagerLoja } from '@/components/PhotoManagerLoja';
import { toast } from 'sonner';

interface VeiculoLojaFormData {
  preco: number;
  pasta_fotos: string;
}

export default function EditarVeiculoLoja() {
  const { id: veiculoId, lojaId } = useParams<{ id: string; lojaId: string }>();
  const navigate = useNavigate();
  const { data: veiculo, isLoading: isLoadingVeiculo } = useVeiculo(veiculoId!);
  const { data: veiculosLoja = [], isLoading: isLoadingVeiculosLoja } = useVeiculosLoja();
  const { lojas } = useTenant();
  const updateMutation = useUpdateVeiculoLoja();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<VeiculoLojaFormData>();

  // Find the specific veiculo-loja record
  const veiculoLoja = veiculosLoja.find(vl => 
    vl.veiculo_id === veiculoId && vl.loja_id === lojaId
  );

  // Find the loja info
  const loja = lojas.find(l => l.id === lojaId);

  // Populate form with veiculo-loja data - use ref to track if already populated
  const isPopulatedRef = useRef(false);
  useEffect(() => {
    if (veiculoLoja && !isPopulatedRef.current) {
      setValue('preco', Number(veiculoLoja.preco) || 0);
      setValue('pasta_fotos', veiculoLoja.pasta_fotos || '');
      isPopulatedRef.current = true;
    }
  }, [veiculoLoja]); // Removed setValue from dependencies to prevent re-renders

  const onSubmit = (data: VeiculoLojaFormData) => {
    if (!veiculoLoja) {
      toast.error('Registro não encontrado');
      return;
    }

    updateMutation.mutate(
      { 
        id: veiculoLoja.id, 
        preco: data.preco,
        pasta_fotos: data.pasta_fotos 
      },
      {
        onSuccess: () => {
          navigate(`/dashboard/veiculo/${veiculoId}`);
        }
      }
    );
  };

  if (isLoadingVeiculo || isLoadingVeiculosLoja) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/veiculo/${veiculoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48"></div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!veiculo || !veiculoLoja || !loja) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/veiculo/${veiculoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Registro não encontrado</h1>
        </div>
      </div>
    );
  }

  const modelo = veiculo.modelo as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/veiculo/${veiculoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar na Loja</h1>
            <p className="text-muted-foreground">
              {modelo?.marca} {modelo?.nome} • {veiculo.placa}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Store className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{loja.nome}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/veiculo/${veiculoId}`}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Link>
          </Button>
          <Button 
            variant="hero" 
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Info (Read-only) */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informações do Veículo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modelo</Label>
                <div className="p-2 bg-muted rounded">
                  {modelo?.marca} {modelo?.nome}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Placa</Label>
                <div className="p-2 bg-muted rounded font-mono">
                  {veiculo.placa}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="p-2 bg-muted rounded">
                  {veiculo.cor}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quilometragem</Label>
                <div className="p-2 bg-muted rounded">
                  {Number(veiculo.quilometragem).toLocaleString()} km
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preço Master</Label>
                <div className="p-2 bg-muted rounded">
                  {veiculo.preco_venda ? 
                    `R$ ${Number(veiculo.preco_venda).toLocaleString()}` : 
                    'Não definido'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store-specific settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Configurações para {loja.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço na Loja</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  {...register('preco', { 
                    min: { value: 0, message: 'Valor deve ser positivo' }
                  })}
                  placeholder="50000.00"
                />
                {errors.preco && (
                  <p className="text-sm text-destructive">{errors.preco.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Preço específico para esta loja. Deixe vazio para usar o preço master.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasta_fotos">Pasta de Fotos</Label>
                <Input
                  id="pasta_fotos"
                  {...register('pasta_fotos')}
                  placeholder="pasta-fotos-loja"
                />
                <p className="text-xs text-muted-foreground">
                  Pasta específica para fotos desta loja. Se vazio, usa fotos gerais do veículo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Management */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Fotos da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoManagerLoja 
                veiculoLojaId={veiculoLoja.id}
                pasta_fotos={veiculoLoja.pasta_fotos || undefined}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {veiculoLoja.pasta_fotos ? 
                  `Fotos específicas da loja ${loja.nome}` :
                  'Usando fotos gerais do veículo'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}