import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useVeiculos(filter?: string) {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos", selectedLojaId, filter],
    enabled: true, // Always enabled, let the query logic handle filtering
    queryFn: async () => {
      console.log("🔍 useVeiculos: Fetching vehicles for loja:", selectedLojaId);
      console.log("🔍 useVeiculos: Filter:", filter);
      
      if (!selectedLojaId) {
        console.log("❌ useVeiculos: No selectedLojaId");
        return [];
      }

      // Build the query properly for vehicles in the selected store
      let query = supabase
        .from("veiculos_loja")
        .select(`
          veiculo_id,
          preco,
          veiculos!inner(
            id,
            hodometro,
            estado_venda,
            estado_veiculo,
            preco_venda,
            ano_modelo,
            ano_fabricacao,
            registrado_em,
            editado_em,
            placa,
            cor,
            observacao,
            chassi,
            modelo(*)
          )
        `);

      // Apply loja filter if selectedLojaId is provided
      if (selectedLojaId) {
        query = query.eq("loja_id", selectedLojaId);
      }

      // Apply filter if provided
      if (filter) {
        query = query.or(
          `veiculos.placa.ilike.%${filter}%,veiculos.modelo.marca.ilike.%${filter}%,veiculos.modelo.nome.ilike.%${filter}%`
        );
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("❌ useVeiculos: Query error:", error);
        throw error;
      }
      
      console.log("✅ useVeiculos: Raw data:", data);
      
      // Transform the data to match the expected format
      const transformedData = data?.map(item => ({
        ...item.veiculos,
        preco_loja: item.preco,
        // Add local info for compatibility
        local: { nome: "Loja Selecionada" }
      })) || [];
      
      console.log("✅ useVeiculos: Transformed data:", transformedData);
      return transformedData;
    },
  });
}

export function useVeiculosStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Get stats for vehicles available in the selected store
      const { data, error } = await supabase
        .from("veiculos_loja")
        .select(`
          veiculos!inner(estado_venda)
        `)
        .eq("loja_id", selectedLojaId || "");

      if (error) throw error;

      const veiculosData = data?.map(item => item.veiculos) || [];
      const stats = {
        total: veiculosData.length,
        disponiveis: veiculosData.filter(v => v.estado_venda === "disponivel").length,
        reservados: veiculosData.filter(v => v.estado_venda === "reservado").length,
        vendidos: veiculosData.filter(v => v.estado_venda === "vendido").length,
      };

      return stats;
    },
  });
}