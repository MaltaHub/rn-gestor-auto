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
      // Get stats for vehicles sold from the selected store
      const { data } = await supabase
        .from("veiculos_loja")
        .select(`
          preco,
          veiculos!inner(preco_venda, estado_venda)
        `)
        .eq("loja_id", selectedLojaId || "")
        .eq("veiculos.estado_venda", "vendido");

      const vendasData = data || [];
      const faturamento = vendasData.reduce((acc, item) => acc + (item.veiculos.preco_venda || 0), 0);
      
      return {
        vendasMes: vendasData.length,
        faturamento,
        ticketMedio: vendasData.length ? (faturamento / vendasData.length) : 0,
        comissoes: faturamento * 0.05, // 5% commission
      };
    },
  });
}