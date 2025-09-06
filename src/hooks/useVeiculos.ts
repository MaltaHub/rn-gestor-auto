import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useVeiculos(filter?: string) {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos", selectedLojaId, filter],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // First get vehicles that are available in the selected store
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
        `)
        .eq("loja_id", selectedLojaId)
        .order("veiculos.registrado_em", { ascending: false });

      if (filter) {
        query = query.or(
          `veiculos.placa.ilike.%${filter}%,veiculos.modelo.marca.ilike.%${filter}%,veiculos.modelo.nome.ilike.%${filter}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match the expected format
      return data?.map(item => ({
        ...item.veiculos,
        preco_loja: item.preco,
        // Add local info for compatibility
        local: { nome: "Loja Selecionada" }
      })) || [];
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