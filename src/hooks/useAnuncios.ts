import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useAnuncios() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["anuncios", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Como não temos tabela de anúncios na DB, retornamos mock por agora
      // Mais tarde pode ser criada uma tabela "anuncios" com relacionamento aos veículos
      const mockData = [
        {
          id: "1",
          titulo: "Toyota Corolla 2023 - Seminovo",
          plataforma: "WebMotors",
          status: "ativo",
          visualizacoes: 156,
          favoritos: 23,
          mensagens: 8,
          dataPublicacao: "2024-01-15",
          preco: 95000,
          veiculo: {
            marca: "Toyota",
            modelo: "Corolla",
            ano: 2023,
            km: 15000
          }
        },
      ];
      
      return mockData;
    },
  });
}

export function useAnunciosStats() {
  const { selectedLojaId } = useTenant();

  return useQuery({
    queryKey: ["anuncios-stats", selectedLojaId],
    enabled: !!selectedLojaId,
    queryFn: async () => {
      // Mock stats para anúncios
      return {
        ativos: 89,
        visualizacoes: 12400,
        favoritos: 456,
        mensagens: 127,
      };
    },
  });
}