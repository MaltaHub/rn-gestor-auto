import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type DuplicadoSugestao = {
  empresa_id: string;
  modelo_id: string | null;
  cor: string | null;
  ano_modelo: number | null;
  ano_fabricacao: number | null;
  caracteristicas_ids: string[] | null;
  veiculo_ids: string[];
  min_quilometragem: number | null;
  max_quilometragem: number | null;
  qtd_veiculos: number;
};

export function useDuplicadosSugestoes() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["view_sugestoes_duplicados", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<DuplicadoSugestao[]> => {
      const { data, error } = await (supabase as any)
        .from("view_sugestoes_duplicados")
        .select("*")
        .eq("empresa_id", currentTenant!.id);

      if (error) throw error;
      return (data || []) as DuplicadoSugestao[];
    },
  });
}

// Manter compatibilidade temporária
export const useRepetidosSugestoes = useDuplicadosSugestoes;
export type RepetidoSugestao = DuplicadoSugestao;
