import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type VeiculoVitrine = {
  id: string; // veiculo_loja_id
  preco: number | null;
  pasta_fotos?: string;
  foto_capa?: string;
  veiculo: {
    id: string;
    placa: string;
    cor: string;
    ano_modelo: number | null;
    hodometro: number | null;
    estado_venda: string;
    modelo: {
      id: string;
      marca: string;
      nome: string;
    } | null;
    local: {
      id: string;
      nome: string;
    } | null;
  };
  loja: {
    id: string;
    nome: string;
  };
};

export function useVeiculosVitrine(filtro = "") {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-vitrine", selectedLojaId, filtro],
    enabled: !!selectedLojaId,
    queryFn: async (): Promise<VeiculoVitrine[]> => {
      if (!selectedLojaId) return [];

      let query = supabase
        .from("veiculos_loja")
        .select(`
          id,
          preco,
          pasta_fotos,
          foto_capa,
          veiculo:veiculos!inner(
            id,
            placa,
            cor,
            ano_modelo,
            hodometro,
            estado_venda,
            modelo(id, marca, nome),
            local:locais(id, nome)
          ),
          loja:lojas!inner(id, nome)
        `)
        .eq("loja_id", selectedLojaId);

      if (filtro) {
        query = query.or(
          `veiculo.placa.ilike.%${filtro}%,veiculo.modelo.marca.ilike.%${filtro}%,veiculo.modelo.nome.ilike.%${filtro}%`,
          { referencedTable: 'veiculos' }
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as VeiculoVitrine[];
    },
  });
}

export function useVeiculosVitrineStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-vitrine-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      if (!selectedLojaId) return { total: 0, disponiveis: 0, reservados: 0, vendidos: 0 };

      const { data, error } = await supabase
        .from("veiculos_loja")
        .select(`
          veiculo:veiculos!inner(estado_venda)
        `)
        .eq("loja_id", selectedLojaId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        disponiveis: 0,
        reservados: 0,
        vendidos: 0,
      };

      data?.forEach((item: any) => {
        const estado = item.veiculo.estado_venda;
        if (estado === 'disponivel') stats.disponiveis++;
        else if (estado === 'reservado') stats.reservados++;
        else if (estado === 'vendido') stats.vendidos++;
      });

      return stats;
    },
  });
}