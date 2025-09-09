import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload, X, ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const cadastrarVeiculoSchema = z.object({
  placa: z.string().min(1, "Placa é obrigatória"),
  chassi: z.string().optional(),
  cor: z.string().min(1, "Cor é obrigatória"),
  modelo_id: z.string().min(1, "Modelo é obrigatório"),
  ano_modelo: z.coerce.number().min(1900, "Ano modelo inválido"),
  ano_fabricacao: z.coerce.number().min(1900, "Ano fabricação inválido"),
  hodometro: z.coerce.number().min(0, "Hodômetro deve ser positivo"),
  preco_venda: z.coerce.number().optional(),
  preco_loja: z.coerce.number().optional(),
  estado_venda: z.enum(["disponivel", "reservado", "vendido"]),
  estado_veiculo: z.enum(["novo", "seminovo", "usado"]).optional(),
  observacao: z.string().optional(),
  estagio_documentacao: z.string().optional(),
});

type CadastrarVeiculoForm = z.infer<typeof cadastrarVeiculoSchema>;

export default function CadastrarVeiculo() {
  const { selectedLojaId, currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<CadastrarVeiculoForm>({
    resolver: zodResolver(cadastrarVeiculoSchema),
    defaultValues: {
      estado_venda: "disponivel",
      estado_veiculo: "usado",
      hodometro: 0,
    },
  });

  // Fetch modelos for dropdown
  const { data: modelos } = useQuery({
    queryKey: ["modelos", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelo")
        .select("id, marca, nome")
        .eq("tenant_id", currentTenant?.id)
        .order("marca", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch locais for dropdown
  const { data: locais } = useQuery({
    queryKey: ["locais", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locais")
        .select("id, nome")
        .eq("tenant_id", currentTenant?.id)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const memoizedHandleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);
  }, []);

  const memoizedRemoveImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const uploadImages = async (veiculoId: string) => {
    if (!selectedImages.length || !currentTenant?.id || !selectedLojaId) return;

    const uploadPromises = selectedImages.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `${currentTenant.id}/${selectedLojaId}/${veiculoId}/${fileName}`;

      const { error } = await supabase.storage
        .from('fotos_veiculos_loja')
        .upload(filePath, file);

      if (error) throw error;
      return filePath;
    });

    await Promise.all(uploadPromises);
  };

  const onSubmit = async (values: CadastrarVeiculoForm) => {
    if (!selectedLojaId || !currentTenant?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma loja válida",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create vehicle
      const { data: veiculo, error: veiculoError } = await supabase
        .from("veiculos")
        .insert({
          placa: values.placa,
          chassi: values.chassi,
          cor: values.cor,
          modelo_id: values.modelo_id,
          ano_modelo: values.ano_modelo,
          ano_fabricacao: values.ano_fabricacao,
          hodometro: values.hodometro,
          preco_venda: values.preco_venda,
          estado_venda: values.estado_venda,
          estado_veiculo: values.estado_veiculo,
          observacao: values.observacao,
          estagio_documentacao: values.estagio_documentacao,
          
          tenant_id: currentTenant.id,
        })
        .select()
        .single();

      if (veiculoError) throw veiculoError;

      // Create vehicle-loja relationship
      const { error: veiculoLojaError } = await supabase
        .from("veiculos_loja")
        .insert({
          veiculo_id: veiculo.id,
          loja_id: selectedLojaId,
          preco: values.preco_loja,
          tenant_id: currentTenant.id,
          pasta_fotos: selectedImages.length > 0 ? `${currentTenant.id}/${selectedLojaId}/${veiculo.id}` : null,
        });

      if (veiculoLojaError) throw veiculoLojaError;

      // Upload images
      if (selectedImages.length > 0) {
        await uploadImages(veiculo.id);
      }

      toast({
        title: "Sucesso",
        description: "Veículo cadastrado com sucesso!",
      });

      navigate("/dashboard/estoque");
    } catch (error: any) {
      console.error("Erro ao cadastrar veículo:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar veículo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!selectedLojaId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione uma loja para cadastrar veículos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cadastrar Veículo</h1>
        <p className="text-muted-foreground">
          Adicione um novo veículo ao estoque da loja
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dados do Veículo */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Veículo</CardTitle>
                <CardDescription>
                  Informações básicas do veículo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chassi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassi</FormLabel>
                        <FormControl>
                          <Input placeholder="Chassi do veículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modelo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o modelo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelos?.map((modelo) => (
                              <SelectItem key={modelo.id} value={modelo.id}>
                                {modelo.marca} {modelo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor *</FormLabel>
                        <FormControl>
                          <Input placeholder="Cor do veículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ano_modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano Modelo *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ano_fabricacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano Fabricação *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hodometro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hodômetro (Km) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Estado e Preços */}
            <Card>
              <CardHeader>
                <CardTitle>Estado e Preços</CardTitle>
                <CardDescription>
                  Status e valores do veículo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estado_venda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de Venda *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="disponivel">Disponível</SelectItem>
                            <SelectItem value="reservado">Reservado</SelectItem>
                            <SelectItem value="vendido">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado_veiculo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado do Veículo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="seminovo">Seminovo</SelectItem>
                            <SelectItem value="usado">Usado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preco_venda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="50000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preco_loja"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço da Loja</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="45000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estagio_documentacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estágio da Documentação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Documentos em ordem" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais sobre o veículo" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Upload de Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Veículo</CardTitle>
              <CardDescription>
                Adicione fotos do veículo (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="flex flex-col items-center space-y-1">
                    <Label htmlFor="image-upload" className="cursor-pointer text-sm font-medium hover:text-primary">
                      Clique para selecionar fotos
                    </Label>
                    <p className="text-xs text-muted-foreground">JPG, PNG até 5MB cada</p>
                  </div>
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={memoizedHandleImageSelect}
                />
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => memoizedRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Cadastrando..." : "Cadastrar Veículo"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/dashboard/estoque")}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}