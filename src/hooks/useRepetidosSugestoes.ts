import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type RepetidoSugestao = {
  tenant_id: string;
  modelo_id: string | null;
  cor: string | null;
  ano_modelo: number | null;
  ano_fabricacao: number | null;
  caracteristicas_ids: string[] | null;
  veiculo_ids: string[];
  min_hodometro: number | null;
  max_hodometro: number | null;
  qtd_veiculos: number;
};

export function useRepetidosSugestoes() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["view_sugestoes_repetidos", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<RepetidoSugestao[]> => {
      const { data, error } = await (supabase as any)
        .from("view_sugestoes_repetidos")
        .select("*")
        .eq("tenant_id", currentTenant!.id);

      if (error) throw error;
      return (data || []) as RepetidoSugestao[];
    },
  });
}
