import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useVendas() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["vendas", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Como não temos tabela de vendas na DB, retornamos mock por agora
      // Mais tarde pode ser criada uma tabela "vendas" com relacionamento aos veículos
      const mockData = [
        {
          id: "V001",
          cliente: "João Silva",
          veiculo: "Toyota Corolla 2023",
          dataVenda: "2024-01-20",
          valor: 95000,
          status: "finalizada",
          vendedor: "Carlos Santos",
          comissao: 4750
        },
      ];
      
      return mockData;
    },
  });
}

export function useVendasStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["vendas-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Mock stats baseado em veículos vendidos
      const { data } = await supabase
        .from("veiculos")
        .select("preco_venda")
        .eq("estado_venda", "vendido")
        .eq("local", selectedLojaId || "");

      return {
        vendasMes: data?.length || 32,
        faturamento: data?.reduce((acc, v) => acc + (v.preco_venda || 0), 0) || 1200000,
        ticketMedio: data?.length ? (data.reduce((acc, v) => acc + (v.preco_venda || 0), 0) / data.length) : 87500,
        comissoes: 62000,
      };
    },
  });
}