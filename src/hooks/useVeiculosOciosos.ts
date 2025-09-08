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
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-ociosos", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async (): Promise<VeiculoOcioso[]> => {
      if (!selectedLojaId) return [];

      // Get all vehicles available in the selected store
      const { data: veiculosLoja, error: veiculosError } = await supabase
        .from("veiculos_loja")
        .select(`
          id,
          veiculo_id,
          preco,
          veiculos!inner(
            id,
            hodometro,
            placa,
            cor,
            ano_modelo,
            ano_fabricacao,
            repetido_id,
            modelo(id, marca, nome)
          )
        `)
        .eq("loja_id", selectedLojaId);

      if (veiculosError) throw veiculosError;

      if (!veiculosLoja || veiculosLoja.length === 0) return [];

      // Get the tenant context
      const { data: loja } = await supabase
        .from("lojas")
        .select("tenant_id")
        .eq("id", selectedLojaId)
        .single();

      if (!loja) return [];

      // Get all active/paused advertisements for this tenant
      const { data: anuncios, error: anunciosError } = await supabase
        .from("anuncios")
        .select("veiculo_loja_id, repetido_id")
        .eq("tenant_id", loja.tenant_id)
        .in("status", ["ativo", "pausado"]);

      if (anunciosError) throw anunciosError;

      // Get unique repetido_ids from vehicles and advertisements
      const repetidosFromVeiculos = veiculosLoja
        .map(vl => vl.veiculos.repetido_id)
        .filter(Boolean);
      
      const repetidosFromAnuncios = anuncios
        ?.map(a => a.repetido_id)
        .filter(Boolean) || [];

      const allRepetidosIds = [...new Set([...repetidosFromVeiculos, ...repetidosFromAnuncios])];

      // Get vehicles that are already covered by repetido advertisements
      let veiculosComAnuncioRepetido: any[] = [];
      if (allRepetidosIds.length > 0) {
        const { data, error: repetidoError } = await supabase
          .from("veiculos")
          .select("id")
          .in("repetido_id", allRepetidosIds);

        if (repetidoError) throw repetidoError;
        veiculosComAnuncioRepetido = data || [];
      }

      // Get IDs of vehicles that are already advertised or covered by repetido ads
      const anunciadosIds = new Set([
        ...(anuncios?.map(a => a.veiculo_loja_id).filter(Boolean) || []),
        ...(veiculosComAnuncioRepetido?.map(v => v.id) || [])
      ]);

      // Filter out vehicles that are already advertised
      const veiculosOciosos = veiculosLoja?.filter(vl => 
        !anunciadosIds.has(vl.id) && !anunciadosIds.has(vl.veiculo_id)
      ) || [];

      // Transform to the expected format
      return veiculosOciosos.map(vl => ({
        id: vl.veiculo_id,
        placa: vl.veiculos.placa,
        cor: vl.veiculos.cor,
        hodometro: vl.veiculos.hodometro,
        ano_modelo: vl.veiculos.ano_modelo,
        ano_fabricacao: vl.veiculos.ano_fabricacao,
        modelo: vl.veiculos.modelo,
        preco: vl.preco,
      }));
    },
  });
}
