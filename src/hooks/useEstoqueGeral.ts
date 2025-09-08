import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useEstoqueGeral(filter?: string) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["estoque-geral", currentTenant?.id, filter],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      console.log("🔍 useEstoqueGeral: Fetching vehicles for tenant:", currentTenant?.id);
      console.log("🔍 useEstoqueGeral: Filter:", filter);
      
      if (!currentTenant?.id) {
        console.log("❌ useEstoqueGeral: No currentTenant");
        return [];
      }

      let query = supabase
        .from("veiculos")
        .select(`
          id,
          placa,
          cor,
          chassi,
          hodometro,
          estado_venda,
          estado_veiculo,
          preco_venda,
          ano_modelo,
          ano_fabricacao,
          registrado_em,
          editado_em,
          observacao,
          modelo(*)
        `)
        .eq("tenant_id", currentTenant.id);

      // Apply filter if provided
      if (filter) {
        query = query.or(`placa.ilike.%${filter}%,modelo.marca.ilike.%${filter}%,modelo.nome.ilike.%${filter}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ useEstoqueGeral: Error fetching vehicles:", error);
        throw error;
      }

      console.log("✅ useEstoqueGeral: Raw data:", data);

      // Transform the data to match the expected format
      const transformedData = data?.map(veiculo => ({
        ...veiculo,
      })) || [];

      console.log("✅ useEstoqueGeral: Transformed data:", transformedData);
      return transformedData;
    },
  });
}

export function useEstoqueGeralStats() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["estoque-geral-stats", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      console.log("🔍 useEstoqueGeralStats: Fetching stats for tenant:", currentTenant?.id);
      
      if (!currentTenant?.id) {
        console.log("❌ useEstoqueGeralStats: No currentTenant");
        return {
          total: 0,
          disponiveis: 0,
          reservados: 0,
          vendidos: 0,
        };
      }

      const { data, error } = await supabase
        .from("veiculos")
        .select("estado_venda")
        .eq("tenant_id", currentTenant.id);

      if (error) {
        console.error("❌ useEstoqueGeralStats: Error fetching stats:", error);
        throw error;
      }

      const stats = data?.reduce(
        (acc, veiculo) => {
          acc.total += 1;
          if (veiculo.estado_venda === "disponivel") acc.disponiveis += 1;
          if (veiculo.estado_venda === "reservado") acc.reservados += 1;
          if (veiculo.estado_venda === "vendido") acc.vendidos += 1;
          return acc;
        },
        { total: 0, disponiveis: 0, reservados: 0, vendidos: 0 }
      ) || { total: 0, disponiveis: 0, reservados: 0, vendidos: 0 };

      console.log("✅ useEstoqueGeralStats: Stats:", stats);
      return stats;
    },
  });
}