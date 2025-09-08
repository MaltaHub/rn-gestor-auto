import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUpdateVeiculoLojaPreco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, preco }: { id: string; preco: number | null }) => {
      const { data, error } = await supabase
        .from("veiculos_loja")
        .update({ preco })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos-vitrine"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-vitrine-stats"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos-para-anuncio"] });
      toast.success("Preço atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar preço: " + (error.message || "Erro desconhecido"));
    },
  });
}