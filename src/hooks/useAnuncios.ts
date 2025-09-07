import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useAnuncios() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["anuncios", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Agora buscamos anúncios reais vinculados à loja selecionada
      const { data, error } = await supabase
        .from("anuncios" as any)
        .select(`
          id, titulo, status, visualizacoes, favoritos, mensagens, data_publicacao, preco,
          plataforma:plataforma_id ( id, nome ),
          veiculos_loja:veiculo_loja_id!inner(
            loja_id, preco,
            veiculos:veiculo_id!inner(
              id, hodometro, estado_venda, estado_veiculo, preco_venda,
              ano_modelo, ano_fabricacao, registrado_em, editado_em, placa, cor, observacao, chassi,
              modelo(*)
            )
          )
        `)
        .eq("veiculos_loja.loja_id", selectedLojaId)
        .order("data_publicacao", { ascending: false });

      if (error) throw error;

      return (data || []).map((a: any) => ({
        id: a.id,
        titulo: a.titulo,
        plataforma: a.plataforma?.nome ?? "Plataforma",
        status: a.status,
        visualizacoes: a.visualizacoes ?? 0,
        favoritos: a.favoritos ?? 0,
        mensagens: a.mensagens ?? 0,
        dataPublicacao: a.data_publicacao ?? null,
        preco: a.preco ?? a.veiculos_loja?.preco ?? null,
        veiculo: a.veiculos_loja?.veiculos
          ? {
              marca: a.veiculos_loja.veiculos.modelo?.marca,
              modelo: a.veiculos_loja.veiculos.modelo?.nome,
              ano: a.veiculos_loja.veiculos.ano_modelo,
              km: Number(a.veiculos_loja.veiculos.hodometro ?? 0),
            }
          : null,
      }));
    },
  });
}

export function useAnunciosStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["anuncios-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("anuncios")
        .select(`
          status, visualizacoes, favoritos, mensagens,
          veiculos_loja:veiculo_loja_id!inner(loja_id)
        `)
        .eq("veiculos_loja.loja_id", selectedLojaId);

      if (error) throw error;
      const rows = (data || []) as any[];

      return {
        ativos: rows.filter((r) => r.status === "ativo").length,
        visualizacoes: rows.reduce((a, r) => a + (r.visualizacoes ?? 0), 0),
        favoritos: rows.reduce((a, r) => a + (r.favoritos ?? 0), 0),
        mensagens: rows.reduce((a, r) => a + (r.mensagens ?? 0), 0),
      };
    },
  });
}