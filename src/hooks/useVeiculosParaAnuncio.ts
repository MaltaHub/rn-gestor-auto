import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type VeiculoParaAnuncio = {
  id: string; // veiculo_loja_id
  preco: number | null;
  veiculo: {
    id: string;
    placa: string;
    cor: string;
    ano_modelo: number | null;
    hodometro: number | null;
    modelo: {
      id: string;
      marca: string;
      nome: string;
    } | null;
  };
};

export function useVeiculosParaAnuncio() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-para-anuncio", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async (): Promise<VeiculoParaAnuncio[]> => {
      if (!selectedLojaId) return [];

      const { data, error } = await supabase
        .from("veiculos_loja")
        .select(`
          id,
          preco,
          veiculo:veiculos!inner(
            id,
            placa,
            cor,
            ano_modelo,
            hodometro,
            modelo(id, marca, nome)
          )
        `)
        .eq("loja_id", selectedLojaId)
        .not("preco", "is", null) // Só veículos com preço definido podem ser anunciados
        .not("id", "in", `(
          SELECT veiculo_loja_id 
          FROM anuncios 
          WHERE veiculo_loja_id IS NOT NULL 
          AND status IN ('ativo', 'pausado')
        )`);

      if (error) throw error;
      return (data || []) as VeiculoParaAnuncio[];
    },
  });
}