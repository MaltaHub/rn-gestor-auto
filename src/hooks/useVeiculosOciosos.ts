import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type VeiculoOcioso = {
  id: string;
  placa: string;
  cor: string;
  ano_modelo: number | null;
  ano_fabricacao: number | null;
  hodometro: number | null;
  preco: number | null;
  modelo: {
    id: string;
    marca: string;
    nome: string;
  } | null;
};

export function useVeiculosOciosos() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["veiculos-ociosos", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async (): Promise<VeiculoOcioso[]> => {
      if (!currentTenant?.id) return [];

      const { data, error } = await supabase
        .rpc("get_veiculos_ociosos", { p_tenant_id: currentTenant.id });

      if (error) throw error;
      return (data || []) as VeiculoOcioso[];
    },
  });
}
