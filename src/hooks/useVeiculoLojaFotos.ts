import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VeiculoLojaFoto {
  id: string;
  veiculo_loja_id: string;
  nome_foto: string;
  ordem: number;
  eh_capa: boolean;
  url?: string;
  criado_em: string;
  atualizado_em: string;
}

// Hook to fetch photos for a specific veiculo-loja
export function useVeiculoLojaFotos(veiculoLojaId: string) {
  return useQuery({
    queryKey: ['veiculo-loja-fotos', veiculoLojaId],
    enabled: !!veiculoLojaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metadados_fotos_veiculos')
        .select('*')
        .eq('veiculo_loja_id', veiculoLojaId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      // Get signed URLs for each photo
      const fotosWithUrls = await Promise.all(
        (data || []).map(async (foto) => {
          const { data: urlData } = await supabase.storage
            .from('fotos_veiculos_loja')
            .createSignedUrl(foto.nome_foto, 3600);

          return {
            ...foto,
            url: urlData?.signedUrl
          };
        })
      );

      return fotosWithUrls as VeiculoLojaFoto[];
    },
  });
}

// Hook to upload photos for a veiculo-loja
export function useUploadVeiculoLojaFoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      veiculoLojaId, 
      file, 
      folder 
    }: { 
      veiculoLojaId: string; 
      file: File; 
      folder?: string;
    }) => {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = folder ? 
        `${folder}/${timestamp}_${crypto.randomUUID()}.${fileExt}` :
        `veiculo_loja_${veiculoLojaId}/${timestamp}_${crypto.randomUUID()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('fotos_veiculos_loja')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata
      const { data, error: metadataError } = await supabase
        .from('metadados_fotos_veiculos')
        .insert({
          veiculo_loja_id: veiculoLojaId,
          nome_foto: fileName,
          ordem: 0,
          eh_capa: false
        })
        .select()
        .single();

      if (metadataError) throw metadataError;

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['veiculo-loja-fotos', variables.veiculoLojaId] 
      });
      toast.success('Foto enviada com sucesso!');
    },
    onError: (error) => {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao enviar foto');
    },
  });
}

// Hook to delete a veiculo-loja photo
export function useDeleteVeiculoLojaFoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      fotoNome, 
      veiculoLojaId 
    }: { 
      id: string; 
      fotoNome: string; 
      veiculoLojaId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('fotos_veiculos_loja')
        .remove([fotoNome]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: metadataError } = await supabase
        .from('metadados_fotos_veiculos')
        .delete()
        .eq('id', id);

      if (metadataError) throw metadataError;

      return { id, veiculoLojaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['veiculo-loja-fotos', data.veiculoLojaId] 
      });
      toast.success('Foto removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao remover foto');
    },
  });
}

// Hook to update photos order
export function useUpdateVeiculoLojaPhotosOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      veiculoLojaId, 
      photoOrders 
    }: { 
      veiculoLojaId: string; 
      photoOrders: { id: string; ordem: number }[];
    }) => {
      const updates = photoOrders.map(({ id, ordem }) =>
        supabase
          .from('metadados_fotos_veiculos')
          .update({ ordem })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return { veiculoLojaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['veiculo-loja-fotos', data.veiculoLojaId] 
      });
      toast.success('Ordem das fotos atualizada!');
    },
    onError: (error) => {
      console.error('Error updating photo order:', error);
      toast.error('Erro ao atualizar ordem das fotos');
    },
  });
}

// Hook to set cover photo
export function useSetVeiculoLojaCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      veiculoLojaId, 
      photoId 
    }: { 
      veiculoLojaId: string; 
      photoId: string;
    }) => {
      // First, remove cover from all photos of this veiculo-loja
      await supabase
        .from('metadados_fotos_veiculos')
        .update({ eh_capa: false })
        .eq('veiculo_loja_id', veiculoLojaId);

      // Then set the new cover
      const { error } = await supabase
        .from('metadados_fotos_veiculos')
        .update({ eh_capa: true })
        .eq('id', photoId);

      if (error) throw error;

      return { veiculoLojaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['veiculo-loja-fotos', data.veiculoLojaId] 
      });
      toast.success('Foto de capa definida!');
    },
    onError: (error) => {
      console.error('Error setting cover photo:', error);
      toast.error('Erro ao definir foto de capa');
    },
  });
}