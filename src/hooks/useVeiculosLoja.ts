import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

export type VeiculoLoja = {
  id: string;
  veiculo_id: string;
  loja_id: string;
  preco: number | null;
  pasta_fotos: string | null;
  veiculo: {
    id: string;
    placa: string;
    cor: string;
    ano_modelo: number | null;
    modelo: {
      id: string;
      marca: string;
      nome: string;
    } | null;
  };
  loja: {
    id: string;
    nome: string;
  };
};

export function useVeiculosLoja() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["veiculos-loja", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<VeiculoLoja[]> => {
      if (!currentTenant?.id) return [];

      const { data, error } = await supabase
        .from("veiculos_lojas")
        .select(`
          id,
          veiculo_id,
          loja_id,
          preco,
          pasta_fotos,
          veiculo:veiculos!inner(
            id,
            placa,
            cor,
            ano_modelo,
            modelo:modelos(id, marca, nome)
          ),
          loja:lojas!inner(
            id,
            nome
          )
        `)
        .eq("empresa_id", currentTenant.id);

      if (error) throw error;
      return (data || []) as VeiculoLoja[];
    },
  });
}

export function useUpdateVeiculoLoja() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  return useMutation({
    mutationFn: async ({ 
      id, 
      preco, 
      pasta_fotos 
    }: { 
      id: string; 
      preco?: number | null; 
      pasta_fotos?: string | null; 
    }) => {
      const { error } = await supabase
        .from("veiculos_lojas")
        .update({ preco, pasta_fotos })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos-loja", currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-para-anuncio"] });
      toast({
        title: "Sucesso",
        description: "Dados do veículo na loja atualizados com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar dados do veículo na loja",
        variant: "destructive",
      });
    },
  });
}

export function useAddVeiculoToLoja() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  return useMutation({
    mutationFn: async ({ 
      veiculo_id, 
      loja_id, 
      preco 
    }: { 
      veiculo_id: string; 
      loja_id: string; 
      preco?: number | null; 
    }) => {
      const { error } = await supabase
        .from("veiculos_lojas")
        .insert({
          veiculo_id,
          loja_id,
          preco,
          empresa_id: currentTenant!.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos-loja", currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-para-anuncio"] });
      toast({
        title: "Sucesso",
        description: "Veículo adicionado à loja com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar veículo à loja",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveVeiculoFromLoja() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  return useMutation({
    mutationFn: async (veiculoLojaId: string) => {
      const { error } = await supabase
        .from("veiculos_lojas")
        .delete()
        .eq("id", veiculoLojaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos-loja", currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-para-anuncio"] });
      toast({
        title: "Sucesso",
        description: "Veículo removido da loja com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover veículo da loja",
        variant: "destructive",
      });
    },
  });
}