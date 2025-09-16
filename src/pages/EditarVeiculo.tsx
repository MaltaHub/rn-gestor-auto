import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Loader2
} from 'lucide-react';
import { useVeiculo, useVeiculoFotos, useUpdateVeiculo } from '@/hooks/useVeiculo';
import { PhotoManager } from '@/components/PhotoManager';
import { toast } from 'sonner';

interface VeiculoFormData {
  placa: string;
  cor: string;
  ano_modelo: number;
  ano_fabricacao: number;
  quilometragem: number;
  estado_venda: string;
  estado_veiculo: string;
  preco_venda: number;
  observacao: string;
  chassi: string;
  estagio_documentacao: string;
}

export default function EditarVeiculo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: veiculo, isLoading: isLoadingVeiculo } = useVeiculo(id!);
  const { data: fotos = [], isLoading: isLoadingFotos } = useVeiculoFotos(id!);
  const updateMutation = useUpdateVeiculo();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VeiculoFormData>();

  // Populate form with vehicle data - use ref to track if already populated
  const isPopulatedRef = useRef(false);
  useEffect(() => {
    if (veiculo && !isPopulatedRef.current) {
      setValue('placa', veiculo.placa || '');
      setValue('cor', veiculo.cor || '');
      setValue('ano_modelo', veiculo.ano_modelo || new Date().getFullYear());
      setValue('ano_fabricacao', veiculo.ano_fabricacao || new Date().getFullYear());
      setValue('quilometragem', Number(veiculo.quilometragem) || 0);
      setValue('estado_venda', veiculo.estado_venda || 'disponivel');
      setValue('estado_veiculo', veiculo.estado_veiculo || 'usado');
      setValue('preco_venda', Number(veiculo.preco_venda) || 0);
      setValue('observacao', veiculo.observacao || '');
      setValue('chassi', veiculo.chassi || '');
      setValue('estagio_documentacao', veiculo.estagio_documentacao || '');
      isPopulatedRef.current = true;
    }
  }, [veiculo]); // Removed setValue from dependencies to prevent re-renders

  const onSubmit = (data: VeiculoFormData) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          navigate(`/dashboard/veiculo/${id}`);
        }
      }
    );
  };

  if (isLoadingVeiculo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/veiculo/${id}`}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/veiculo/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Veículo</h1>
            <p className="text-muted-foreground">
              {modelo?.marca} {modelo?.nome} • {veiculo.placa}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/veiculo/${id}`}>
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
          {/* Basic Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  {...register('placa', { required: 'Placa é obrigatória' })}
                  className="font-mono"
                  placeholder="ABC-1234"
                />
                {errors.placa && (
                  <p className="text-sm text-destructive">{errors.placa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor *</Label>
                <Input
                  id="cor"
                  {...register('cor', { required: 'Cor é obrigatória' })}
                  placeholder="Branco"
                />
                {errors.cor && (
                  <p className="text-sm text-destructive">{errors.cor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano_modelo">Ano Modelo *</Label>
                <Input
                  id="ano_modelo"
                  type="number"
                  {...register('ano_modelo', { 
                    required: 'Ano modelo é obrigatório',
                    min: { value: 1900, message: 'Ano inválido' },
                    max: { value: new Date().getFullYear() + 1, message: 'Ano inválido' }
                  })}
                  placeholder="2023"
                />
                {errors.ano_modelo && (
                  <p className="text-sm text-destructive">{errors.ano_modelo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano_fabricacao">Ano Fabricação *</Label>
                <Input
                  id="ano_fabricacao"
                  type="number"
                  {...register('ano_fabricacao', { 
                    required: 'Ano fabricação é obrigatório',
                    min: { value: 1900, message: 'Ano inválido' },
                    max: { value: new Date().getFullYear() + 1, message: 'Ano inválido' }
                  })}
                  placeholder="2023"
                />
                {errors.ano_fabricacao && (
                  <p className="text-sm text-destructive">{errors.ano_fabricacao.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quilometragem">Quilometragem *</Label>
                <Input
                  id="quilometragem"
                  type="number"
                  {...register('quilometragem', {
                    required: "Quilometragem é obrigatória",
                    min: { value: 0, message: "Quilometragem deve ser positiva" }
                  })}
                />
                {errors.quilometragem && (
                  <p className="text-sm text-destructive">{errors.quilometragem.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço de Venda</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  {...register('preco_venda', { 
                    min: { value: 0, message: 'Valor deve ser positivo' }
                  })}
                  placeholder="50000.00"
                />
                {errors.preco_venda && (
                  <p className="text-sm text-destructive">{errors.preco_venda.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassi">Chassi</Label>
                <Input
                  id="chassi"
                  {...register('chassi')}
                  className="font-mono"
                  placeholder="17 dígitos do chassi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estagio_documentacao">Estágio Documentação</Label>
                <Input
                  id="estagio_documentacao"
                  {...register('estagio_documentacao')}
                  placeholder="Em transferência, quitado, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Status do Veículo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estado_venda">Estado de Venda</Label>
                <Select value={watch('estado_venda')} onValueChange={(value) => setValue('estado_venda', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_veiculo">Estado do Veículo</Label>
                <Select value={watch('estado_veiculo')} onValueChange={(value) => setValue('estado_veiculo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                    <SelectItem value="seminovo">Seminovo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacao">Observações Gerais</Label>
                <Textarea
                  id="observacao"
                  {...register('observacao')}
                  placeholder="Informações adicionais sobre o veículo..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Management */}
        <div className="space-y-6">
          <PhotoManager 
            veiculoId={id!} 
            photos={fotos} 
            isLoading={isLoadingFotos}
          />
        </div>
      </form>
    </div>
  );
}