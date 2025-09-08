import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type VeiculoOcioso = {
  veiculo_loja_id: string;
  veiculo_id: string;
  placa: string;
  cor: string;
  ano_modelo: number | null;
  hodometro: number | null;
  repetido_id: string | null;
  preco: number | null;
  modelo: {
    marca: string | null;
    nome: string | null;
  } | null;
};

export function useVeiculosOciosos() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["veiculos-ociosos", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async (): Promise<VeiculoOcioso[]> => {
      // 1) Buscar veículos da loja selecionada
      const { data: veiculosLoja, error: errV } = await (supabase as any)
        .from("veiculos_loja")
        .select(
          `id, preco,
           veiculos:veiculo_id (
             id, repetido_id, hodometro, ano_modelo, placa, cor,
             modelo:modelo_id ( marca, nome )
           )
          `
        )
        .eq("loja_id", selectedLojaId);

      if (errV) throw errV;

      const itens = (veiculosLoja || []).map((v: any) => ({
        veiculo_loja_id: v.id as string,
        veiculo_id: v.veiculos?.id as string,
        placa: v.veiculos?.placa as string,
        cor: v.veiculos?.cor as string,
        ano_modelo: v.veiculos?.ano_modelo as number | null,
        hodometro: v.veiculos?.hodometro ? Number(v.veiculos.hodometro) : null,
        repetido_id: v.veiculos?.repetido_id as string | null,
        preco: v.preco ? Number(v.preco) : null,
        modelo: v.veiculos?.modelo || null,
      })) as VeiculoOcioso[];

      // 2) Buscar anúncios que cobrem esses itens (individual ou repetido)
      const veiculoLojaIds = itens.map((i) => i.veiculo_loja_id);

      const { data: anuncios, error: errA } = await (supabase as any)
        .from("anuncios")
        .select("id, status, tipo_anuncio, veiculo_loja_id, repetido_id")
        .in("status", ["ativo", "pausado", "vendido"]) // considera qualquer um diferente de removido
        .or(`veiculo_loja_id.in.(${veiculoLojaIds.join(',')}) , repetido_id.is.not.null`);

      if (errA) throw errA;

      const setCobertosPorVeiculo = new Set(
        (anuncios || [])
          .filter((a: any) => !!a.veiculo_loja_id)
          .map((a: any) => a.veiculo_loja_id as string)
      );
      const setCobertosPorRepetido = new Set(
        (anuncios || [])
          .filter((a: any) => !!a.repetido_id)
          .map((a: any) => a.repetido_id as string)
      );

      // 3) Filtrar ociosos
      const ociosos = itens.filter((i) => {
        if (i.repetido_id && setCobertosPorRepetido.has(i.repetido_id)) return false;
        if (setCobertosPorVeiculo.has(i.veiculo_loja_id)) return false;
        return true;
      });

      return ociosos;
    },
  });
}
