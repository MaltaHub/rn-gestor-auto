import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const criarAnuncioSchema = z.object({
  tipo_anuncio: z.enum(["individual", "repetido"]),
  veiculo_loja_id: z.string().optional(),
  repetido_id: z.string().optional(),
  plataforma_id: z.string().min(1, "Plataforma é obrigatória"),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0, "Preço deve ser positivo"),
  link_anuncio: z.string().optional(),
  id_fisico: z.string().optional(),
  tipo_id_fisico: z.string().optional(),
  data_vencimento: z.string().optional(),
}).refine((data) => {
  if (data.tipo_anuncio === "individual" && !data.veiculo_loja_id) {
    return false;
  }
  if (data.tipo_anuncio === "repetido" && !data.repetido_id) {
    return false;
  }
  return true;
}, {
  message: "Selecione um veículo ou grupo de repetidos",
  path: ["veiculo_loja_id"],
});

type CriarAnuncioForm = z.infer<typeof criarAnuncioSchema>;

export default function CriarAnuncio() {
  const { selectedLojaId, currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<CriarAnuncioForm>({
    resolver: zodResolver(criarAnuncioSchema),
    defaultValues: {
      tipo_anuncio: "individual",
    },
  });

  const tipoAnuncio = form.watch("tipo_anuncio");

  // Fetch plataformas
  const { data: plataformas } = useQuery({
    queryKey: ["plataformas", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plataforma")
        .select("id, nome")
        .eq("tenant_id", currentTenant?.id)
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch veículos ociosos para anúncios individuais
  const { data: veiculosOciosos } = useQuery({
    queryKey: ["veiculos-ociosos", selectedLojaId],
    enabled: !!selectedLojaId && tipoAnuncio === "individual",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos_loja")
        .select(`
          id,
          preco,
          veiculos!inner(
            id,
            placa,
            cor,
            ano_modelo,
            hodometro,
            modelo(marca, nome)
          )
        `)
        .eq("loja_id", selectedLojaId)
        .not("id", "in", `(
          SELECT veiculo_loja_id 
          FROM anuncios 
          WHERE veiculo_loja_id IS NOT NULL 
          AND status IN ('ativo', 'pausado')
        )`);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch repetidos ociosos para anúncios de repetidos
  const { data: repetidosOciosos } = useQuery({
    queryKey: ["repetidos-ociosos", currentTenant?.id],
    enabled: !!currentTenant?.id && tipoAnuncio === "repetido",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repetidos")
        .select(`
          id,
          cor_padrao,
          ano_modelo_padrao,
          ano_fabricacao_padrao,
          min_hodometro,
          max_hodometro,
          modelo(marca, nome)
        `)
        .eq("tenant_id", currentTenant?.id)
        .not("id", "in", `(
          SELECT repetido_id 
          FROM anuncios 
          WHERE repetido_id IS NOT NULL 
          AND status IN ('ativo', 'pausado')
        )`);
      
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (values: CriarAnuncioForm) => {
    if (!currentTenant?.id) {
      toast({
        title: "Erro",
        description: "Tenant não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const anuncioData = {
        tenant_id: currentTenant.id,
        plataforma_id: values.plataforma_id,
        tipo_anuncio: values.tipo_anuncio,
        titulo: values.titulo,
        descricao: values.descricao,
        preco: values.preco,
        link_anuncio: values.link_anuncio,
        id_fisico: values.id_fisico,
        tipo_id_fisico: values.tipo_id_fisico,
        data_vencimento: values.data_vencimento ? new Date(values.data_vencimento).toISOString() : null,
        status: "ativo",
        ...(values.tipo_anuncio === "individual" 
          ? { veiculo_loja_id: values.veiculo_loja_id }
          : { repetido_id: values.repetido_id }
        ),
      };

      const { error } = await supabase
        .from("anuncios")
        .insert(anuncioData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Anúncio criado com sucesso!",
      });

      navigate("/dashboard/anuncios");
    } catch (error: any) {
      console.error("Erro ao criar anúncio:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar anúncio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedLojaId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione uma loja para criar anúncios
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Criar Anúncio</h1>
        <p className="text-muted-foreground">
          Crie um novo anúncio para divulgar seus veículos
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tipo e Seleção */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Anúncio</CardTitle>
                <CardDescription>
                  Escolha entre anúncio individual ou para grupo de veículos similares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tipo_anuncio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Anúncio</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual">Veículo Individual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="repetido" id="repetido" />
                            <Label htmlFor="repetido">Grupo de Repetidos</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tipoAnuncio === "individual" && (
                  <FormField
                    control={form.control}
                    name="veiculo_loja_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o veículo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {veiculosOciosos?.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.veiculos.placa} - {item.veiculos.modelo?.marca} {item.veiculos.modelo?.nome} 
                                {item.veiculos.ano_modelo} ({item.veiculos.cor})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {tipoAnuncio === "repetido" && (
                  <FormField
                    control={form.control}
                    name="repetido_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo de Repetidos *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {repetidosOciosos?.map((repetido) => (
                              <SelectItem key={repetido.id} value={repetido.id}>
                                {repetido.modelo?.marca} {repetido.modelo?.nome} {repetido.ano_modelo_padrao} 
                                ({repetido.cor_padrao}) - {repetido.min_hodometro}km a {repetido.max_hodometro}km
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="plataforma_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plataforma *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a plataforma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plataformas?.map((plataforma) => (
                            <SelectItem key={plataforma.id} value={plataforma.id}>
                              {plataforma.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Detalhes do Anúncio */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Anúncio</CardTitle>
                <CardDescription>
                  Informações que aparecerão no anúncio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honda Civic 2020 - Seminovo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição detalhada do veículo ou grupo"
                          className="resize-none"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_vencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Informações da Plataforma */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Plataforma</CardTitle>
              <CardDescription>
                Dados específicos da plataforma onde o anúncio será publicado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="link_anuncio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Anúncio</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_fisico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Físico</FormLabel>
                      <FormControl>
                        <Input placeholder="ID na plataforma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_id_fisico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo ID Físico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: anuncio_id, product_id" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Anúncio"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/dashboard/anuncios")}
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