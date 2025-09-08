import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useVeiculo(id: string) {
  return useQuery({
    queryKey: ["veiculo", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select(`
          *,
          modelo(*),
          caracteristicas_veiculos(
            caracteristica_id,
            caracteristicas(id, nome)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useVeiculoFotos(veiculoId: string) {
  return useQuery({
    queryKey: ["veiculo-fotos", veiculoId],
    enabled: !!veiculoId,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("fotos_veiculos_loja")
        .list(`veiculo_${veiculoId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) throw error;
      
      return data?.map(file => ({
        name: file.name,
        url: supabase.storage
          .from("fotos_veiculos_loja")
          .getPublicUrl(`veiculo_${veiculoId}/${file.name}`).data.publicUrl,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at || file.created_at,
      })) || [];
    },
  });
}

export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("veiculos")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["veiculo", id] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["estoque-geral"] });
      toast.success("Veículo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar veículo:", error);
      toast.error("Erro ao atualizar veículo");
    },
  });
}

export function useUploadVeiculoFoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ veiculoId, file }: { veiculoId: string; file: File }) => {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("fotos_veiculos_loja")
        .upload(`veiculo_${veiculoId}/${fileName}`, file);

      if (error) throw error;
      return fileName;
    },
    onSuccess: (_, { veiculoId }) => {
      queryClient.invalidateQueries({ queryKey: ["veiculo-fotos", veiculoId] });
      toast.success("Foto adicionada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao fazer upload da foto");
    },
  });
}

export function useDeleteVeiculoFoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ veiculoId, fileName }: { veiculoId: string; fileName: string }) => {
      const { error } = await supabase.storage
        .from("fotos_veiculos_loja")
        .remove([`veiculo_${veiculoId}/${fileName}`]);

      if (error) throw error;
    },
    onSuccess: (_, { veiculoId }) => {
      queryClient.invalidateQueries({ queryKey: ["veiculo-fotos", veiculoId] });
      toast.success("Foto removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir foto:", error);
      toast.error("Erro ao excluir foto");
    },
  });
}