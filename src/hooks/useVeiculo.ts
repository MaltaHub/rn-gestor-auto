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
      // Get photos from storage
      const { data: files, error: storageError } = await supabase.storage
        .from("fotos_veiculos_loja")
        .list(`veiculo_${veiculoId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (storageError) throw storageError;

      // Get metadata for ordering and cover photo
      const { data: metadata, error: metadataError } = await supabase
        .from("veiculos_fotos_metadata")
        .select("*")
        .eq("veiculo_loja_id", veiculoId);

      if (metadataError) throw metadataError;

      const photosWithMetadata = files?.map(file => {
        const metaInfo = metadata?.find(m => m.foto_nome === file.name);
        return {
          name: file.name,
          url: supabase.storage
            .from("fotos_veiculos_loja")
            .getPublicUrl(`veiculo_${veiculoId}/${file.name}`).data.publicUrl,
          size: file.metadata?.size || 0,
          lastModified: file.updated_at || file.created_at,
          ordem: metaInfo?.ordem || 0,
          isCapa: metaInfo?.is_capa || false,
        };
      }) || [];

      // Sort by ordem
      return photosWithMetadata.sort((a, b) => a.ordem - b.ordem);
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
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("fotos_veiculos_loja")
        .remove([`veiculo_${veiculoId}/${fileName}`]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: metadataError } = await supabase
        .from("veiculos_fotos_metadata")
        .delete()
        .eq("veiculo_loja_id", veiculoId)
        .eq("foto_nome", fileName);

      if (metadataError) throw metadataError;
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

export function useUpdatePhotosOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ veiculoId, photos }: { 
      veiculoId: string; 
      photos: Array<{ name: string; ordem: number }> 
    }) => {
      // Update order for each photo
      for (const photo of photos) {
        const { error } = await supabase
          .from("veiculos_fotos_metadata")
          .upsert({
            veiculo_loja_id: veiculoId,
            foto_nome: photo.name,
            ordem: photo.ordem,
          }, {
            onConflict: "veiculo_loja_id,foto_nome"
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, { veiculoId }) => {
      queryClient.invalidateQueries({ queryKey: ["veiculo-fotos", veiculoId] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar ordem das fotos:", error);
      toast.error("Erro ao atualizar ordem das fotos");
    },
  });
}

export function useSetCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ veiculoId, fileName }: { veiculoId: string; fileName: string }) => {
      // First, remove cover flag from all photos
      const { error: clearError } = await supabase
        .from("veiculos_fotos_metadata")
        .update({ is_capa: false })
        .eq("veiculo_loja_id", veiculoId);

      if (clearError) throw clearError;

      // Then set the new cover photo
      const { error: setError } = await supabase
        .from("veiculos_fotos_metadata")
        .upsert({
          veiculo_loja_id: veiculoId,
          foto_nome: fileName,
          is_capa: true,
        }, {
          onConflict: "veiculo_loja_id,foto_nome"
        });

      if (setError) throw setError;
    },
    onSuccess: (_, { veiculoId }) => {
      queryClient.invalidateQueries({ queryKey: ["veiculo-fotos", veiculoId] });
      toast.success("Foto de capa definida!");
    },
    onError: (error) => {
      console.error("Erro ao definir foto de capa:", error);
      toast.error("Erro ao definir foto de capa");
    },
  });
}