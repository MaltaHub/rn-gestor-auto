import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useVeiculos(filter?: string) {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos", selectedLojaId, filter],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      let query = supabase
        .from("view_veiculos_expandidos") 
        .select("*")
        .order("registrado_em", { ascending: false });

      if (filter) {
        query = query.or(`modelo->marca.ilike.%${filter}%,modelo->nome.ilike.%${filter}%,placa.ilike.%${filter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useVeiculosStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veiculos")
        .select("estado_venda")
        .eq("local", selectedLojaId || "");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        disponiveis: data?.filter(v => v.estado_venda === "disponivel")?.length || 0,
        reservados: data?.filter(v => v.estado_venda === "reservado")?.length || 0,
        vendidos: data?.filter(v => v.estado_venda === "vendido")?.length || 0,
      };

      return stats;
    },
  });
}